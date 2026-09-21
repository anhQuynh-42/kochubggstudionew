import React, { useState } from 'react';
import { Campaign, KOCApplication, KOCUser } from '../types';
import { ZALO_GROUP_URL } from './ZaloCommunityWidget';

interface MyCampaignsViewProps {
  currentUser: KOCUser | null;
  applications: KOCApplication[];
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onSubmitVideoLink: (appId: string, link: string) => void;
  onOpenLogin: () => void;
  onBackToMarketplace: () => void;
  onOpenProfile?: () => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const MyCampaignsView: React.FC<MyCampaignsViewProps> = ({
  currentUser,
  applications,
  campaigns,
  onSelectCampaign,
  onSubmitVideoLink,
  onOpenLogin,
  onBackToMarketplace,
  onOpenProfile,
  onShowToast,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [videoLinkInput, setVideoLinkInput] = useState('');

  // 1. If KOC has not logged in yet (chỉ mới vào tìm hiểu)
  if (!currentUser) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm text-center">
          {/* Lock / Guest icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 shadow-sm">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>

          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3.5 py-1 text-xs font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            CHẾ ĐỘ TÌM HIỂU (CHƯA ĐĂNG NHẬP)
          </div>

          <h1 className="mt-3 font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-slate-900">
            Đăng nhập để xem & quản lý Chiến dịch của bạn
          </h1>

          <p className="mt-3 max-w-xl mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed">
            Bạn đang duyệt website với tư cách khách tìm hiểu. Vui lòng đăng nhập tài khoản KOC để theo dõi trạng thái duyệt mẫu, tra cứu mã vận đơn hỏa tốc (GHTK/ViettelPost) và nộp link video nghiệm thu nhận thù lao.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="guest-login-cta-btn"
              onClick={onOpenLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-orange-600 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Đăng nhập ngay</span>
            </button>

            <button
              onClick={onBackToMarketplace}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              <span>Khám phá chiến dịch</span>
            </button>

            <a
              id="guest-zalo-cta-btn"
              href={ZALO_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 px-5 py-3 text-xs sm:text-sm font-semibold text-orange-900 shadow-sm transition-all"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded bg-orange-500 text-[9px] font-black text-white">
                Z
              </span>
              <span>Vào nhóm Zalo KOC trao đổi</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </div>

          {/* Feature highlights for logged-in KOC */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left border-t border-slate-100 pt-8">
            <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 text-slate-800 mb-2">
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Tra cứu vận đơn hỏa tốc</h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Tự động cập nhật mã vận đơn GHTK khi nhãn hàng gửi quà tặng tận nhà cho bạn.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 text-slate-800 mb-2">
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Quản lý hạn nộp video</h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Đếm ngược ngày lên bài sau khi nhận sản phẩm mẫu, không lo trễ hẹn với Brand.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50/70 p-4 border border-slate-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 text-slate-800 mb-2">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Nộp bài & Nhận thù lao</h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Dán link video TikTok để nghiệm thu tự động và nhận chuyển khoản thù lao cố định + hoa hồng.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. When KOC IS logged in: filter user's applications
  const myApps = applications.filter(
    (a) =>
      a.kocName.toLowerCase().includes(currentUser.name.toLowerCase()) ||
      a.tiktokHandle.toLowerCase().includes(currentUser.tiktokHandle.toLowerCase()) ||
      (currentUser.tiktokHandle.includes('minhthu') && (a.kocName.includes('Minh Thư') || a.status === 'Đã duyệt gửi mẫu' || a.status === 'Chờ duyệt'))
  );

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    if (onShowToast) {
      onShowToast('Đã sao chép mã vận đơn!', code, 'success');
    }
  };

  const handleSubmitLink = (appId: string) => {
    if (!videoLinkInput.trim()) {
      if (onShowToast) {
        onShowToast('Vui lòng nhập link video!', 'Hỗ trợ link TikTok, Google Drive hoặc YouTube.', 'warning');
      } else {
        alert('Vui lòng nhập link video TikTok hoặc Drive của bạn.');
      }
      return;
    }
    onSubmitVideoLink(appId, videoLinkInput.trim());
    setSelectedAppId(null);
    setVideoLinkInput('');
    if (onShowToast) {
      onShowToast(
        'Nộp link video thành công!',
        'Hệ thống AI Crawler đang quét chỉ số views và gửi Brand duyệt.',
        'success'
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
              <span className="material-symbols-outlined text-lg">assignment_turned_in</span>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-xl sm:text-2xl font-extrabold text-slate-900">
              Chiến dịch của tôi
            </h1>
            <span className="rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-[10px] font-semibold text-orange-800">
              {currentUser.tiktokHandle}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tiến độ nhận hàng mẫu, hạn nộp kịch bản video và tình trạng giải ngân hoa hồng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-orange-600">badge</span>
              <span>Hồ sơ KOC & Media Kit</span>
            </button>
          )}
          <a
            id="my-campaigns-zalo-btn"
            href={ZALO_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 px-3.5 py-2 text-xs font-semibold text-orange-900 transition-all shadow-sm"
            title="Vào nhóm Zalo KOC trao đổi & hỗ trợ trực tiếp"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded bg-orange-500 text-[8px] font-black text-white">
              Z
            </span>
            <span>Nhóm Zalo hỗ trợ KOC</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs shadow-sm">
            <span className="text-slate-500">Tổng thù lao chờ nhận: </span>
            <b className="font-['Plus_Jakarta_Sans'] text-orange-600 text-sm">3.500.000đ</b>
          </div>
        </div>
      </div>

      {/* Campaigns list */}
      {myApps.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <span className="material-symbols-outlined text-2xl">inbox</span>
          </div>
          <h3 className="mt-3 font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900">
            Bạn chưa đăng ký chiến dịch nào
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Khám phá các chiến dịch nhận mẫu 0đ và nhận thù lao hấp dẫn từ các thương hiệu chính hãng ngay hôm nay.
          </p>
          <button
            onClick={onBackToMarketplace}
            className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-orange-600 shadow-sm transition-colors cursor-pointer"
          >
            Khám phá chiến dịch ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myApps.map((app) => {
            const matchedCampaign = campaigns.find((c) => c.id === app.campaignId) || campaigns[0];
            const currentStepIdx = app.videoLink || app.status === 'Đã lên bài' ? 3 : app.status === 'Đã duyệt gửi mẫu' ? 2 : 1;

            const steps = [
              { label: 'Đăng ký mẫu', desc: 'Đã gửi hồ sơ', icon: 'how_to_reg' },
              { label: 'Brand duyệt', desc: 'Duyệt trong 24h', icon: 'verified' },
              { label: 'Giao quà mẫu', desc: app.shippingCode || 'GHTK đang giao', icon: 'local_shipping' },
              { label: 'Nghiệm thu video', desc: app.videoLink ? 'Đã nộp video' : 'Hạn 4 - 7 ngày', icon: 'video_library' },
            ];

            return (
              <div
                key={app.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-md"
              >
                {/* Top Info */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={matchedCampaign.productHeroImage}
                      alt={app.campaignName}
                      className="h-16 w-16 shrink-0 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-orange-900 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                          {app.code}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                            app.status === 'Đã duyệt gửi mẫu'
                              ? 'bg-orange-50 text-orange-800 border-orange-200'
                              : app.status === 'Đã lên bài'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <h3
                        onClick={() => onSelectCampaign(matchedCampaign)}
                        className="mt-1 font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-bold text-slate-900 cursor-pointer hover:text-orange-600 transition-colors"
                      >
                        {app.campaignName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Brand: <b className="text-slate-900">{matchedCampaign.brandName}</b> • Nền tảng: {matchedCampaign.platform}
                      </p>
                    </div>
                  </div>

                  {/* Tracking & Timeline Quick Badges */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-xs">
                      <span className="text-slate-500 block text-[10px]">Tình trạng mẫu quà tặng:</span>
                      <button
                        onClick={() => handleCopyTracking(app.shippingCode || 'GHTK10928374')}
                        className="font-bold text-blue-700 flex items-center gap-1 hover:underline cursor-pointer text-left mt-0.5"
                        title="Nhấp để sao chép mã vận đơn"
                      >
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                        <span>{app.shippingCode || 'GHTK: Đang xuất kho'}</span>
                        <span className="material-symbols-outlined text-[12px] text-blue-600">content_copy</span>
                      </button>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-xs">
                      <span className="text-slate-500 block text-[10px]">Thời hạn làm video (4 - 7 ngày):</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">Còn 5 ngày (Hạn 4 - 7 ngày)</span>
                    </div>
                  </div>
                </div>

                {/* Visual 4-Step Progress Stepper */}
                <div className="py-5 border-b border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
                    {steps.map((st, sIdx) => {
                      const isCompleted = sIdx < currentStepIdx;
                      const isCurrent = sIdx === currentStepIdx;

                      return (
                        <div
                          key={sIdx}
                          className={`flex items-center gap-3 rounded-2xl p-3 border transition-all ${
                            isCurrent
                              ? 'border-orange-500 bg-orange-50/40 shadow-sm'
                              : isCompleted
                              ? 'border-blue-200 bg-blue-50/40'
                              : 'border-slate-200 bg-white opacity-70'
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                              isCompleted
                                ? 'bg-blue-600 text-white'
                                : isCurrent
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isCompleted ? 'check' : st.icon}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="text-[10px] font-semibold text-slate-500">
                              Bước {sIdx + 1}
                            </div>
                            <div className={`text-xs font-bold truncate ${
                              isCurrent ? 'text-orange-950' : isCompleted ? 'text-blue-900' : 'text-slate-700'
                            }`}>
                              {st.label}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {st.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Actions & Video link submission */}
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 w-full sm:w-auto">
                    {app.videoLink ? (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-700 font-bold flex items-center gap-1 shrink-0">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Đã nộp link video:
                        </span>
                        <a
                          href={app.videoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-700 underline truncate max-w-xs font-semibold"
                        >
                          {app.videoLink}
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-[11px] sm:text-xs">
                        ⚠️ <b>Bước 4:</b> KOC trả video bằng cách Up lên Drive hoặc link TikTok để Admin & Brand duyệt nghiệm thu.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => onSelectCampaign(matchedCampaign)}
                      className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Xem lại Brief
                    </button>

                    {selectedAppId === app.id ? (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="url"
                          placeholder="Dán link Drive / TikTok (tiktok.com/@...)"
                          value={videoLinkInput}
                          onChange={(e) => setVideoLinkInput(e.target.value)}
                          className="rounded-xl border border-orange-500 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 w-full sm:w-64"
                        />
                        <button
                          onClick={() => handleSubmitLink(app.id)}
                          className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 shrink-0 cursor-pointer"
                        >
                          Gửi
                        </button>
                        <button
                          onClick={() => setSelectedAppId(null)}
                          className="text-xs text-slate-500 hover:text-slate-900 shrink-0 p-1 cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedAppId(app.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-600 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">upload_file</span>
                        <span>{app.videoLink ? 'Cập nhật link video' : 'Trả video (Drive/TikTok)'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
