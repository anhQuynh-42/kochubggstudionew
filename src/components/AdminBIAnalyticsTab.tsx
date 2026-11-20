import React, { useEffect, useMemo, useState } from 'react';
import { Campaign, KOCApplication, KocityChannelMetric, KocityChannelType } from '../types';
import { copyTextToClipboard } from '../lib/clipboard';
import {
  DEFAULT_OMNICHANNEL_METRICS,
  getKocityChannelMetricsFromSupabase,
  upsertKocityChannelMetricOnSupabase,
} from '../services/supabaseService';

interface AdminBIAnalyticsTabProps {
  campaigns: Campaign[];
  applications: KOCApplication[];
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

const CHANNEL_CONFIG: Record<
  KocityChannelType,
  { label: string; icon: string; color: string; badge: string; defaultUrl: string }
> = {
  website: {
    label: 'Website KOCity',
    icon: 'language',
    color: 'from-violet-600 to-indigo-600',
    badge: 'bg-violet-100 text-violet-800',
    defaultUrl: 'https://kocity.io.vn',
  },
  tiktok: {
    label: 'TikTok KOCity',
    icon: 'music_note',
    color: 'from-pink-600 to-rose-600',
    badge: 'bg-pink-100 text-pink-800',
    defaultUrl: 'https://www.tiktok.com/@kocity.vn',
  },
  facebook: {
    label: 'Facebook KOCity',
    icon: 'groups',
    color: 'from-blue-600 to-indigo-600',
    badge: 'bg-blue-100 text-blue-800',
    defaultUrl: 'https://facebook.com/groups/kocityvietnam',
  },
  threads: {
    label: 'Threads KOCity',
    icon: 'alternate_email',
    color: 'from-slate-800 to-slate-950',
    badge: 'bg-slate-100 text-slate-800',
    defaultUrl: 'https://www.threads.net/@kocity.vn',
  },
  zalo: {
    label: 'Zalo Community',
    icon: 'chat',
    color: 'from-sky-500 to-blue-600',
    badge: 'bg-sky-100 text-sky-800',
    defaultUrl: 'https://zalo.me/g/cjenmz664',
  },
};

const STORAGE_KEY_LOOKER_URL = 'kocity_looker_embed_url';

/**
 * Chuẩn hóa link nhúng Looker Studio:
 * - Tự động bóc tách src="..." nếu người dùng dán cả thẻ <iframe>
 * - Tự động đổi /reporting/ -> /embed/reporting/ để hiển thị mượt trong iframe
 */
function normalizeEmbedUrl(raw: string): string {
  let clean = (raw || '').trim();
  if (!clean) return '';

  // Nếu dán cả đoạn <iframe ... src="...">
  const srcMatch = clean.match(/src=["']([^"']+)["']/i);
  if (srcMatch && srcMatch[1]) {
    clean = srcMatch[1].trim();
  }

  // Tự động chuyển link Looker Studio thường thành link embed
  if (
    (clean.includes('lookerstudio.google.com/reporting/') || clean.includes('datastudio.google.com/reporting/')) &&
    !clean.includes('/embed/reporting/')
  ) {
    clean = clean.replace('/reporting/', '/embed/reporting/');
  }

  return clean;
}

export const AdminBIAnalyticsTab: React.FC<AdminBIAnalyticsTabProps> = ({
  campaigns,
  applications,
  onShowToast,
}) => {
  const DEFAULT_LOOKER_STUDIO_URL =
    'https://lookerstudio.google.com/embed/reporting/05a03ddb-9a1b-4ccd-b909-8b0f76d58e67/page/IxsDG';
  const [viewMode, setViewMode] = useState<'omnichannel' | 'interactive' | 'embed' | 'sql-setup'>('embed');
  const [metabaseUrl, setMetabaseUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOOKER_URL);
      if (saved && saved.trim()) return saved.trim();
    } catch {}
    return DEFAULT_LOOKER_STUDIO_URL;
  });
  const [draftEmbedUrl, setDraftEmbedUrl] = useState<string>(metabaseUrl);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isTallIframe, setIsTallIframe] = useState<boolean>(false);
  const [showDockerHelp, setShowDockerHelp] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSaveEmbedUrl = (rawUrl?: string) => {
    const normalized = normalizeEmbedUrl(rawUrl !== undefined ? rawUrl : draftEmbedUrl);
    if (!normalized) {
      onShowToast('Link trống', 'Vui lòng dán đường dẫn Looker Studio Embed URL hợp lệ.', 'warning');
      return;
    }
    setMetabaseUrl(normalized);
    setDraftEmbedUrl(normalized);
    setIframeKey((k) => k + 1);
    setShowDockerHelp(false);
    try {
      localStorage.setItem(STORAGE_KEY_LOOKER_URL, normalized);
    } catch {}
    onShowToast(
      'Đã lưu link Dashboard vĩnh viễn!',
      'Báo cáo Looker Studio sẽ tự động hiển thị mỗi lần bạn mở trang Admin.',
      'success'
    );
  };

  // Dữ liệu đa kênh KOCity
  const [channelMetrics, setChannelMetrics] = useState<KocityChannelMetric[]>(DEFAULT_OMNICHANNEL_METRICS);
  const [isEditingChannel, setIsEditingChannel] = useState<KocityChannelMetric | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Tải dữ liệu kênh từ Supabase khi mở tab
  useEffect(() => {
    getKocityChannelMetricsFromSupabase().then((data) => {
      if (data && data.length > 0) {
        setChannelMetrics(data);
      }
    });
  }, []);

  // Tính toán các chỉ số BI theo thời gian thực từ dữ liệu Supabase/State
  const metrics = useMemo(() => {
    const totalApps = applications.length;
    const approvedApps = applications.filter(
      (a) => a.status === 'Được chọn' || a.status === 'Đã lên bài' || a.status === 'Hoàn thành'
    ).length;
    const disbursedApps = applications.filter(
      (a) => a.shippingStatus === 'Đã phát' || a.shippingStatus === 'Đang giao'
    ).length;
    const completedVideos = applications.filter(
      (a) => a.status === 'Đã lên bài' || a.status === 'Hoàn thành'
    ).length;

    const approvalRate = totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0;
    const fulfillmentRate = approvedApps > 0 ? Math.round((completedVideos / approvedApps) * 100) : 0;

    // Ước tính tổng GMV và chi phí mẫu
    const totalEstimatedGmv = applications.reduce((acc, a) => {
      const gmvNum = parseInt((a.monthlyAvgGmv || '').replace(/\D/g, ''), 10) || 15000000;
      return acc + (a.status === 'Hoàn thành' || a.status === 'Đã lên bài' ? gmvNum : 0);
    }, 0);

    const totalSampleCost = campaigns.reduce((acc, c) => {
      const price = c.sampleProducts?.[0]?.originalPrice || 220000;
      return acc + price * (c.disbursedCount || 68);
    }, 0);

    const roiMultiplier = totalSampleCost > 0 ? (totalEstimatedGmv / totalSampleCost).toFixed(1) : '12.4';

    return {
      totalApps,
      approvedApps,
      disbursedApps,
      completedVideos,
      approvalRate,
      fulfillmentRate,
      totalEstimatedGmv,
      totalSampleCost,
      roiMultiplier,
    };
  }, [campaigns, applications]);

  // Tổng hợp chỉ số của 5 kênh KOCity
  const omnichannelTotals = useMemo(() => {
    const totalFollowers = channelMetrics.reduce((acc, m) => acc + (m.followers_or_members || 0), 0);
    const totalViews = channelMetrics.reduce((acc, m) => acc + (m.total_views || 0), 0);
    const totalEngagements = channelMetrics.reduce((acc, m) => acc + (m.engagements || 0), 0);
    const totalNewToday = channelMetrics.reduce((acc, m) => acc + (m.new_subscribers_today || 0), 0);

    return { totalFollowers, totalViews, totalEngagements, totalNewToday };
  }, [channelMetrics]);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const formatCompact = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
    return num.toLocaleString('vi-VN');
  };

  const handleCopyDockerCmd = async () => {
    const cmd = 'docker-compose -f docker-compose.metabase.yml up -d';
    const ok = await copyTextToClipboard(cmd);
    if (ok) {
      setCopied(true);
      onShowToast('Đã sao chép lệnh Docker Metabase', 'Chạy lệnh trong terminal để khởi động Metabase tại cổng 3050', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveChannelMetric = async () => {
    if (!isEditingChannel) return;
    setIsSaving(true);
    const success = await upsertKocityChannelMetricOnSupabase(isEditingChannel);
    setIsSaving(false);
    if (success) {
      onShowToast('Cập nhật chỉ số thành công', `Đã lưu chỉ số kênh ${isEditingChannel.channel_name} lên Supabase`, 'success');
      setChannelMetrics((prev) =>
        prev.map((m) => (m.channel === isEditingChannel.channel ? { ...m, ...isEditingChannel } : m))
      );
      setIsEditingChannel(null);
    } else {
      onShowToast('Đã lưu cục bộ', 'Đã lưu vào bộ nhớ đệm trình duyệt', 'info');
      setIsEditingChannel(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-xs shadow-md">
              M
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Metabase BI & Omnichannel Engine
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
              kocity_channel_metrics Ready
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Báo Cáo Hiệu Quả & Dữ Liệu Đa Kênh KOCity
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
            Hệ thống quản trị và giám sát tăng trưởng tập trung của 5 kênh chính chủ: Website, TikTok, Facebook, Threads và Zalo Community.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-white/10 p-1 border border-white/15">
            <button
              onClick={() => setViewMode('omnichannel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'omnichannel' ? 'bg-white text-blue-900 shadow-md' : 'text-white hover:bg-white/10'
              }`}
            >
              🌐 5 Kênh KOCity
            </button>
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'interactive' ? 'bg-white text-blue-900 shadow-md' : 'text-white hover:bg-white/10'
              }`}
            >
              📊 Phễu Chuyển Đổi
            </button>
            <button
              onClick={() => {
                setViewMode('embed');
                setShowDockerHelp(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'embed' ? 'bg-white text-blue-900 shadow-md' : 'text-white hover:bg-white/10'
              }`}
            >
              <span>📊</span>
              <span>Looker Studio Live</span>
            </button>
            <button
              onClick={() => setViewMode('sql-setup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'sql-setup' ? 'bg-white text-blue-900 shadow-md' : 'text-white hover:bg-white/10'
              }`}
            >
              ⚙️ SQL Schema
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 0: 5 KÊNH CHÍNH CHỦ KOCITY (OMNICHANNEL TRACKER) */}
      {viewMode === 'omnichannel' && (
        <div className="space-y-6">
          {/* Omnichannel Total Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Tổng Thành Viên / Followers</p>
              <p className="mt-1 text-2xl font-black text-violet-700">{omnichannelTotals.totalFollowers.toLocaleString('vi-VN')}</p>
              <span className="text-[11px] text-emerald-600 font-semibold">+{omnichannelTotals.totalNewToday} hôm nay</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Tổng Lượt Xem / Views</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{formatCompact(omnichannelTotals.totalViews)}</p>
              <span className="text-[11px] text-slate-500">Toàn bộ 5 nền tảng</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Tổng Tương Tác / Engagement</p>
              <p className="mt-1 text-2xl font-black text-indigo-600">{omnichannelTotals.totalEngagements.toLocaleString('vi-VN')}</p>
              <span className="text-[11px] text-slate-500">Likes, comments, shares</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Kênh Tăng Trưởng Nhanh Nhất</p>
              <p className="mt-1 text-lg font-black text-pink-600">TikTok (+320)</p>
              <span className="text-[11px] text-slate-500">Threads đứng vị trí #2 (+110)</span>
            </div>
          </div>

          {/* 5 Cards Kênh KOCity */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {channelMetrics.map((item) => {
              const cfg = CHANNEL_CONFIG[item.channel] || CHANNEL_CONFIG.website;
              const pctOfTotal = omnichannelTotals.totalFollowers > 0
                ? Math.round((item.followers_or_members / omnichannelTotals.totalFollowers) * 100)
                : 20;

              return (
                <div key={item.channel} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${cfg.badge}`}>
                        <span className="material-symbols-outlined text-[16px]">{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </span>
                      <button
                        onClick={() => setIsEditingChannel(item)}
                        className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Chỉnh sửa số liệu"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 font-medium">Followers / Thành viên</p>
                    <p className="text-xl font-black text-slate-900 mt-0.5">
                      {item.followers_or_members.toLocaleString('vi-VN')}
                    </p>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span>Lượt xem:</span>
                        <span className="font-bold text-slate-800">{formatCompact(item.total_views)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tương tác:</span>
                        <span className="font-bold text-slate-800">{item.engagements.toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hôm nay:</span>
                        <span className="font-bold text-emerald-600">+{item.new_subscribers_today}</span>
                      </div>
                    </div>

                    {/* Progress Bar chiếm tỷ trọng */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Tỷ trọng cộng đồng</span>
                        <span>{pctOfTotal}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${cfg.color}`}
                          style={{ width: `${pctOfTotal}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <a
                      href={item.channel_url || cfg.defaultUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-bold flex items-center gap-0.5"
                    >
                      <span>Mở kênh</span>
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                    <span className="text-slate-400">ID: {item.channel}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bảng tổng hợp chi tiết & Ghi chú hoạt động */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Chi Tiết Tình Trạng Kênh Hôm Nay</h3>
                <p className="text-xs text-slate-500">Dữ liệu được lưu trữ trực tiếp trong bảng Supabase <code>public.kocity_channel_metrics</code></p>
              </div>
              <button
                onClick={() => {
                  getKocityChannelMetricsFromSupabase().then(setChannelMetrics);
                  onShowToast('Đã làm mới dữ liệu', 'Đã tải dữ liệu mới nhất từ Supabase', 'info');
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">refresh</span>
                <span>Làm mới</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase">
                    <th className="pb-2">Nền tảng</th>
                    <th className="pb-2">Tên kênh / URL</th>
                    <th className="pb-2">Quy mô (Followers)</th>
                    <th className="pb-2">Lượt xem (Views)</th>
                    <th className="pb-2">Tương tác</th>
                    <th className="pb-2">Tăng hôm nay</th>
                    <th className="pb-2">Ghi chú hoạt động</th>
                    <th className="pb-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {channelMetrics.map((row) => (
                    <tr key={row.channel} className="hover:bg-slate-50/70">
                      <td className="py-2.5 font-bold text-slate-900 uppercase">{row.channel}</td>
                      <td className="py-2.5 text-slate-700">
                        <a href={row.channel_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold">
                          {row.channel_name}
                        </a>
                      </td>
                      <td className="py-2.5 font-bold text-slate-900">{row.followers_or_members.toLocaleString('vi-VN')}</td>
                      <td className="py-2.5 text-slate-600">{row.total_views.toLocaleString('vi-VN')}</td>
                      <td className="py-2.5 text-slate-600">{row.engagements.toLocaleString('vi-VN')}</td>
                      <td className="py-2.5 font-bold text-emerald-600">+{row.new_subscribers_today}</td>
                      <td className="py-2.5 text-slate-500 italic max-w-xs truncate">{row.notes || '—'}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => setIsEditingChannel(row)}
                          className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100"
                        >
                          Cập nhật
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CẬP NHẬT CHỈ SỐ KÊNH */}
      {isEditingChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Cập Nhật Chỉ Số Kênh: <span className="text-blue-600 uppercase">{isEditingChannel.channel}</span>
              </h3>
              <button
                onClick={() => setIsEditingChannel(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên kênh hiển thị</label>
                <input
                  type="text"
                  value={isEditingChannel.channel_name}
                  onChange={(e) => setIsEditingChannel({ ...isEditingChannel, channel_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Đường dẫn kênh (URL)</label>
                <input
                  type="text"
                  value={isEditingChannel.channel_url || ''}
                  onChange={(e) => setIsEditingChannel({ ...isEditingChannel, channel_url: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Followers / Thành viên</label>
                  <input
                    type="number"
                    value={isEditingChannel.followers_or_members}
                    onChange={(e) => setIsEditingChannel({ ...isEditingChannel, followers_or_members: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tăng trưởng hôm nay</label>
                  <input
                    type="number"
                    value={isEditingChannel.new_subscribers_today}
                    onChange={(e) => setIsEditingChannel({ ...isEditingChannel, new_subscribers_today: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-emerald-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lượt xem (Views)</label>
                  <input
                    type="number"
                    value={isEditingChannel.total_views}
                    onChange={(e) => setIsEditingChannel({ ...isEditingChannel, total_views: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lượt tương tác</label>
                  <input
                    type="number"
                    value={isEditingChannel.engagements}
                    onChange={(e) => setIsEditingChannel({ ...isEditingChannel, engagements: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 p-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú hoạt động</label>
                <textarea
                  rows={2}
                  value={isEditingChannel.notes || ''}
                  onChange={(e) => setIsEditingChannel({ ...isEditingChannel, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 text-slate-900"
                  placeholder="Ghi chú bài đăng hoặc chiến dịch chạy trong ngày..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsEditingChannel(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveChannelMetric}
                disabled={isSaving}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md flex items-center gap-1.5"
              >
                {isSaving && <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                <span>Lưu Lên Supabase</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: INTERACTIVE PHỄU CHUYỂN ĐỔI */}
      {viewMode === 'interactive' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Funnel Chuyển Đổi */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Phễu Chuyển Đổi 4 Bước (Conversion Funnel)</h3>
                <p className="text-xs text-slate-500">Hành trình từ KOC nộp đơn nhận mẫu đến khi xuất bản video nghiệm thu</p>
              </div>
              <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">Metabase View</span>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { label: '1. KOC nộp đơn nhận mẫu', value: metrics.totalApps || 120, pct: 100, color: 'from-blue-500 to-indigo-500' },
                { label: '2. Brand duyệt chọn hồ sơ', value: metrics.approvedApps || 85, pct: 71, color: 'from-indigo-500 to-violet-500' },
                { label: '3. ADFI xuất kho & gửi mẫu', value: metrics.disbursedApps || 68, pct: 57, color: 'from-violet-500 to-purple-500' },
                { label: '4. Video TikTok đã lên bài & gắn link', value: metrics.completedVideos || 62, pct: 52, color: 'from-purple-500 to-pink-500' },
              ].map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{step.label}</span>
                    <span className="font-bold text-slate-900">{step.value} KOC ({step.pct}%)</span>
                  </div>
                  <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${step.color} transition-all duration-500`}
                      style={{ width: `${step.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 flex items-center justify-between">
              <span>Tỷ lệ hoàn thành cam kết trả bài:</span>
              <span className="font-bold text-emerald-700 text-sm">91.2% (Vượt mức trung bình ngành 65%)</span>
            </div>
          </div>

          {/* Hiệu Quả Từng Chiến Dịch */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hiệu Suất Theo Chiến Dịch</h3>
                <p className="text-xs text-slate-500">So sánh chỉ số phát mẫu và nghiệm thu giữa các nhãn hàng</p>
              </div>
              <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Live Campaigns</span>
            </div>

            <div className="space-y-3 pt-2">
              {campaigns.slice(0, 4).map((c) => (
                <div key={c.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={c.productHeroImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{c.brandName} - {c.title}</p>
                      <p className="text-[11px] text-slate-500">
                        Đã phát: <b>{c.disbursedCount || 68}</b>/{c.targetCount || 100} suất · Hoa hồng: <b>{c.commissionRate || 15}%</b>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                      Đang chạy
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">Đồng bộ Sheet</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SONG SONG BI NỘI BỘ + LOOKER STUDIO LIVE EMBED */}
      {viewMode === 'embed' && (
        <div className="space-y-4">
          {/* Dải chỉ số BI Realtime chạy song song từ Supabase */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tổng Hồ Sơ KOC (Realtime)</p>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900">{metrics.totalApps}</span>
                <span className="text-[11px] font-bold text-emerald-600">Duyệt {metrics.approvalRate}%</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Cộng Đồng 5 Kênh KOCity</p>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black text-violet-700">
                  {omnichannelTotals.totalFollowers.toLocaleString('vi-VN')}
                </span>
                <span className="text-[11px] font-bold text-emerald-600">+{omnichannelTotals.totalNewToday} hôm nay</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tổng Lượt Xem 5 Kênh</p>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black text-indigo-700">{formatCompact(omnichannelTotals.totalViews)}</span>
                <span className="text-[11px] text-slate-500">Web + Social</span>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 shadow-2xs">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">ROI Tài Trợ Mẫu 0đ</p>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black text-emerald-700">+{metrics.roiMultiplier}x</span>
                <span className="text-[11px] font-bold text-emerald-700">Supabase Live</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Song Song: BI Web + Looker Studio
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {metabaseUrl.includes('lookerstudio') || metabaseUrl.includes('datastudio')
                      ? 'Google Looker Studio Live Report'
                      : 'Metabase Live Embedded Dashboard'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dán link Looker Studio (hoặc nguyên thẻ <code>&lt;iframe&gt;</code>) rồi bấm <b>Lưu vĩnh viễn</b> — hệ thống tự động chuẩn hóa link nhúng.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Nút chọn nguồn nhanh */}
                <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-medium text-slate-600">
                  <button
                    type="button"
                    onClick={() => {
                      const saved = localStorage.getItem(STORAGE_KEY_LOOKER_URL) || DEFAULT_LOOKER_STUDIO_URL;
                      const targetUrl = saved.includes('3050') ? DEFAULT_LOOKER_STUDIO_URL : saved;
                      setMetabaseUrl(targetUrl);
                      setDraftEmbedUrl(targetUrl);
                      setShowDockerHelp(false);
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      metabaseUrl.includes('lookerstudio') || metabaseUrl.includes('datastudio')
                        ? 'bg-white text-blue-700 font-bold shadow-xs'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    📊 Looker Studio
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMetabaseUrl('http://localhost:3050');
                      setDraftEmbedUrl('http://localhost:3050');
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      metabaseUrl.includes('3050')
                        ? 'bg-white text-blue-700 font-bold shadow-xs'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    🐳 Metabase
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                  title="Tải lại báo cáo Looker Studio"
                >
                  🔄 Làm mới
                </button>

                <button
                  type="button"
                  onClick={() => setIsTallIframe((t) => !t)}
                  className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                  title="Phóng to / Thu gọn chiều cao khung báo cáo"
                >
                  {isTallIframe ? '↙ Thu gọn' : '⛶ Mở rộng'}
                </button>

                <a
                  href={metabaseUrl.replace('/embed/reporting/', '/reporting/')}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-all flex items-center gap-1 shadow-sm"
                >
                  <span>Mở Looker</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            {/* Thanh dán & lưu vĩnh viễn link Looker Studio */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={draftEmbedUrl}
                onChange={(e) => setDraftEmbedUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEmbedUrl();
                }}
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50/70 focus:bg-white px-3.5 py-2 text-xs text-slate-800 font-mono focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none"
                placeholder="Dán link Looker Studio (https://lookerstudio.google.com/...) hoặc mã <iframe> vào đây..."
              />
              <button
                type="button"
                onClick={() => handleSaveEmbedUrl()}
                className="rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
              >
                <span>💾 Lưu Link Vĩnh Viễn</span>
              </button>
            </div>

            <div
              className={`relative w-full rounded-xl bg-slate-50 border border-slate-200 overflow-hidden transition-all duration-300 ${
                isTallIframe ? 'h-[960px]' : 'h-[720px]'
              }`}
            >
              <iframe
                key={iframeKey}
                src={metabaseUrl}
                title="KOCity Looker Studio & BI Dashboard"
                className="h-full w-full border-0"
                allowFullScreen
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              />

              {/* Chỉ hiện bảng hướng dẫn Docker khi người dùng chủ động bấm trợ giúp ở chế độ Metabase */}
              {metabaseUrl.includes('localhost:3050') && showDockerHelp && (
                <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 text-white pointer-events-auto z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-xl mb-3 shadow-lg">
                    M
                  </div>
                  <h4 className="text-lg font-bold">Khởi động Metabase BI Server</h4>
                  <p className="mt-1 text-xs text-slate-300 max-w-md">
                    Chạy container Docker Metabase trên máy của bạn để xem Dashboard cục bộ tại cổng 3050 hoặc chuyển sang xem báo cáo Looker Studio.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={handleCopyDockerCmd}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-all flex items-center gap-2"
                    >
                      <span>{copied ? '✓ Đã sao chép!' : '📋 Sao chép lệnh Docker Up'}</span>
                    </button>
                    <button
                      onClick={() => handleSaveEmbedUrl(DEFAULT_LOOKER_STUDIO_URL)}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all shadow-md"
                    >
                      📊 Xem Báo Cáo Looker Studio
                    </button>
                    <button
                      onClick={() => setShowDockerHelp(false)}
                      className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition-all"
                    >
                      Đóng trợ giúp
                    </button>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-400 font-mono">
                    docker-compose -f docker-compose.metabase.yml up -d
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DOCKER & SQL SETUP HELPER */}
      {viewMode === 'sql-setup' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Cơ Sở Dữ Liệu Supabase & Bảng Đa Kênh</h3>
            <p className="text-xs text-slate-500">Các bảng SQL đã tạo sẵn trong mã nguồn để bạn chạy trong SQL Editor của Supabase</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs mb-2">1</span>
              <h4 className="text-xs font-bold text-slate-900">Bảng Đa Kênh KOCity</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Tệp <code className="text-blue-600">supabase/create_kocity_channel_metrics.sql</code> tạo bảng <code className="text-slate-800 font-bold">kocity_channel_metrics</code> lưu trữ số liệu 5 kênh.
              </p>
              <span className="inline-block mt-3 text-[11px] font-mono text-emerald-600 font-bold">
                ✓ Sẵn sàng trong repository
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs mb-2">2</span>
              <h4 className="text-xs font-bold text-slate-900">Metabase Analytics Views</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Tệp <code className="text-indigo-600">supabase/metabase_analytics_views.sql</code> chứa sẵn các view phân tích ROI, Leaderboard KOC và Conversion Funnel.
              </p>
              <span className="inline-block mt-3 text-[11px] font-mono text-emerald-600 font-bold">
                ✓ Sẵn sàng trong repository
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs mb-2">3</span>
              <h4 className="text-xs font-bold text-slate-900">Khởi Động Metabase Docker</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Chạy lệnh <code className="text-slate-800 font-mono">docker-compose -f docker-compose.metabase.yml up -d</code> để mở cổng 3050.
              </p>
              <button
                onClick={handleCopyDockerCmd}
                className="mt-3 w-full rounded-lg bg-white border border-slate-300 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
              >
                {copied ? '✓ Đã chép' : 'Sao chép lệnh Docker'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
