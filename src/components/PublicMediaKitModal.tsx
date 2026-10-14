import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { APP_LOGOS } from '../data/mockData';
import { ZALO_GROUP_URL } from './ZaloCommunityWidget';
import { copyTextToClipboard } from '../lib/clipboard';

export interface PublicMediaKitData {
  id?: string;
  name: string;
  tiktokHandle: string;
  avatar?: string;
  followers?: string;
  avgViews?: string;
  engagementRate?: string;
  gmv?: string;
  completedCampaignsCount?: number | string;
  categories?: string[];
  bio?: string;
  memberCode?: string;
  city?: string;
  district?: string;
  address?: string;
  channelLink?: string;
  instagramHandle?: string;
  youtubeHandle?: string;
  portfolioDriveLink?: string;
  portfolioFile?: {
    name: string;
    size: string;
    dataUrl?: string;
    type?: string;
  };
  targetAudience?: string;
  targetAudienceImage?: string;
  contentStyle?: string[] | string;
  minBookingRate?: string;
  allowSparkAds?: boolean;
  acceptFreecast?: boolean;
}

interface PublicMediaKitModalProps {
  data: PublicMediaKitData;
  onClose: () => void;
  onExploreCampaigns?: () => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const PublicMediaKitModal: React.FC<PublicMediaKitModalProps> = ({
  data,
  onClose,
  onExploreCampaigns,
  onShowToast,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const cleanHandle = (data.tiktokHandle || '@creator').trim();
  const tiktokUrl = data.channelLink || `https://www.tiktok.com/${cleanHandle.startsWith('@') ? cleanHandle : `@${cleanHandle}`}`;
  const cleanInstagram = data.instagramHandle ? data.instagramHandle.replace(/[@\s]/g, '') : '';
  const instagramUrl = cleanInstagram ? `https://www.instagram.com/${cleanInstagram}` : '';
  const cleanYoutube = data.youtubeHandle ? data.youtubeHandle.replace(/[@\s]/g, '') : '';
  const youtubeUrl = cleanYoutube ? `https://www.youtube.com/@${cleanYoutube}` : '';

  // Kiểm tra tệp có phải là video hay không
  const isPortfolioFileVideo = (file?: { type?: string; name: string }) => {
    if (!file) return false;
    if (file.type && file.type.startsWith('video/')) return true;
    return /\.(mp4|webm|mov|m4v|mkv)$/i.test(file.name || '');
  };

  // Phân tích liên kết video nổi bật (YouTube, TikTok, MP4 trực tiếp, Drive...)
  const parsePortfolioVideoLink = (url?: string) => {
    if (!url) return null;
    const clean = url.trim();
    if (!clean) return null;

    // 1. YouTube video hoặc Shorts
    const ytMatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return {
        type: 'youtube' as const,
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
        url: clean,
      };
    }

    // 2. Direct MP4 / WebM video link
    if (/\.(mp4|webm|mov)(\?.*)?$/i.test(clean)) {
      return {
        type: 'video' as const,
        embedUrl: clean,
        url: clean,
      };
    }

    // 3. TikTok video link
    if (/tiktok\.com/i.test(clean)) {
      return {
        type: 'tiktok' as const,
        url: clean,
      };
    }

    // 4. Other link (Drive, Notion, Canva...)
    return {
      type: 'other' as const,
      url: clean,
    };
  };

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Đóng modal khi nhấn phím Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewImage) {
          setPreviewImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage, onClose]);

  const contentStylesList = React.useMemo(() => {
    if (Array.isArray(data.contentStyle)) return data.contentStyle.filter(Boolean);
    if (typeof data.contentStyle === 'string' && data.contentStyle.trim()) return [data.contentStyle.trim()];
    return [];
  }, [data.contentStyle]);

  // Tải thẻ Media Kit về máy dạng ảnh PNG
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: (node) => (node as HTMLElement).tagName !== 'IFRAME',
      });
      const link = document.createElement('a');
      const filename = `MediaKit_${cleanHandle.replace(/[@\s]/g, '') || 'KOC'}.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
      if (onShowToast) {
        onShowToast('Đã tải ảnh Media Kit!', `Thẻ hồ sơ của ${data.name} đã được lưu về máy.`, 'success');
      }
    } catch (err) {
      console.error('Lỗi xuất ảnh Media Kit:', err);
      if (onShowToast) {
        onShowToast('Lỗi tải ảnh', 'Không thể xuất file tự động, bạn có thể chụp ảnh màn hình.', 'warning');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Lấy đường link sạch và ngắn gọn để chia sẻ
  const cleanTargetHandle = (data.tiktokHandle || 'creator').replace(/[@\s]/g, '');
  const cleanShareUrl = `${window.location.origin}/?mediakit=${encodeURIComponent(cleanTargetHandle)}`;

  // Sao chép link chia sẻ ngắn gọn và tương thích 100% mọi thiết bị
  const handleCopyLink = async () => {
    const success = await copyTextToClipboard(cleanShareUrl);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      if (onShowToast) {
        onShowToast('Đã sao chép link Media Kit ngắn gọn!', cleanShareUrl, 'success');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header cố định với nút Đóng (X) luôn nổi bật và cố định ở trên */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-white/95 backdrop-blur-sm shrink-0 z-30">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-[#613bd1] to-[#316bbf] text-white font-black text-xs shadow-xs">
              KC
            </span>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                Thẻ Media Kit KOC Chính Thức (Dạng Ngang)
              </h3>
              <p className="font-mono text-[11px] text-[#613bd1]">{cleanHandle || '@creator'}</p>
            </div>
          </div>

          {/* Nút đóng (X) rõ ràng, to, nổi bật */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 shadow-xs transition-all cursor-pointer group hover:scale-105 active:scale-95"
            title="Đóng thẻ (Esc)"
          >
            <span className="text-xs font-bold group-hover:text-rose-600">Đóng</span>
            <span className="material-symbols-outlined text-[18px] font-bold">close</span>
          </button>
        </div>

        {/* Nội dung thẻ cuộn mượt mà (dạng ngang trên desktop/tablet, không bị tràn màn hình) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* THẺ MEDIA KIT ĐƯỢC CHỤP ẢNH (cardRef) - DẠNG NGANG (LANDSCAPE) */}
          <div ref={cardRef} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            {/* Header dải băng trên thẻ Media Kit */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-[#613bd1] to-[#316bbf] text-white shadow-sm font-black text-xs">
                  KC
                </span>
                <div>
                  <h4 className="text-xs font-black tracking-wide text-slate-900 uppercase">
                    KOCITY CREATOR MEDIA KIT
                  </h4>
                  <p className="text-[10px] text-slate-400">Nền tảng kết nối KOC & Brand chính hãng</p>
                </div>
              </div>
              {data.memberCode && (
                <span className="rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-mono font-extrabold text-[#613bd1]">
                  #{data.memberCode}
                </span>
              )}
            </div>

            {/* Bố cục DẠNG NGANG: 2 cột chia đôi cân đối (Left & Right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* CỘT TRÁI (md:col-span-5): Thông tin Creator, Kênh MXH, Bio, Địa chỉ, Chuyên mục, Báo giá */}
              <div className="md:col-span-5 space-y-3.5 md:border-r md:border-slate-100 md:pr-6">
                {/* Avatar & Tên KOC */}
                <div className="flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={data.avatar || APP_LOGOS.userProfile}
                      alt={data.name}
                      crossOrigin="anonymous"
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-purple-200 shadow-sm"
                    />
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm ring-2 ring-white">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-black text-slate-900 truncate">
                      {data.name}
                    </h4>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                      <span className="material-symbols-outlined text-[14px] text-[#316bbf]">location_on</span>
                      <span className="truncate">
                        {data.city ? `${data.city}${data.district ? `, ${data.district}` : ''}` : 'Toàn quốc'}
                      </span>
                    </div>
                    <span className="inline-block mt-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-200">
                      ⭐ 5.0 KOC Verified
                    </span>
                  </div>
                </div>

                {/* Social Handles */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#613bd1] hover:underline bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100"
                  >
                    <span>TikTok: {cleanHandle}</span>
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </a>

                  {cleanInstagram && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs font-bold text-pink-600 hover:underline bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-100"
                    >
                      <span>IG: @{cleanInstagram}</span>
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                    </a>
                  )}

                  {cleanYoutube && (
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs font-bold text-rose-600 hover:underline bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100"
                    >
                      <span>YT: @{cleanYoutube}</span>
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                    </a>
                  )}
                </div>

                {/* Bio */}
                {data.bio && (
                  <p className="text-xs text-slate-600 leading-relaxed italic bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                    "{data.bio}"
                  </p>
                )}

                {/* Lĩnh vực & Chuyên mục thế mạnh */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Lĩnh vực & Chuyên mục thế mạnh:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.categories && data.categories.length > 0 ? (
                      data.categories.map((cat, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-purple-100/80 px-2.5 py-1 text-[10px] font-bold text-[#613bd1] border border-purple-200/60"
                        >
                          {cat}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Làm đẹp, Thời trang & Lifestyle</span>
                    )}
                  </div>
                </div>

                {/* Điều khoản & Báo giá hợp tác - Thiết kế 2 thẻ đối xứng cân bằng */}
                <div className="rounded-2xl bg-slate-50/90 p-2.5 border border-slate-200/80 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Cột 1: Báo giá booking */}
                    <div className="rounded-xl bg-white p-2.5 border border-slate-200/70 shadow-2xs flex flex-col justify-between min-h-[66px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-emerald-600">payments</span>
                        Báo giá booking
                      </span>
                      <span className="text-xs font-black text-slate-900 mt-1 leading-snug">
                        {data.minBookingRate || 'Mẫu 0đ + Hoa hồng'}
                      </span>
                    </div>

                    {/* Cột 2: Mã Spark Ads */}
                    <div className="rounded-xl bg-white p-2.5 border border-slate-200/70 shadow-2xs flex flex-col justify-between min-h-[66px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-[#613bd1]">bolt</span>
                        Mã Spark Ads
                      </span>
                      <span className="text-xs font-black text-[#613bd1] mt-1 leading-snug">
                        {data.allowSparkAds ? 'Sẵn sàng cấp' : 'Thỏa thuận'}
                      </span>
                    </div>
                  </div>

                  {/* Dòng Mẫu 0đ Freecast */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs text-[11px]">
                    <span className="font-semibold text-slate-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-amber-600">card_giftcard</span>
                      Mẫu 0đ (Freecast):
                    </span>
                    <span className="font-extrabold text-emerald-700">
                      {data.acceptFreecast !== false ? 'Sẵn sàng nhận mẫu' : 'Booking fee'}
                    </span>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI (md:col-span-7): Metrics Grid, Video styles, Target audience, Portfolio */}
              <div className="md:col-span-7 space-y-3.5">
                {/* Metric Stats Grid (Bao gồm GMV Kênh & Số chiến dịch đã chạy) */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                  <div className="rounded-xl bg-purple-50/70 p-2.5 border border-purple-100 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Followers
                    </span>
                    <b className="text-sm sm:text-base font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                      {data.followers || '10K+'}
                    </b>
                  </div>
                  <div className="rounded-xl bg-blue-50/70 p-2.5 border border-blue-100 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Avg Views
                    </span>
                    <b className="text-sm sm:text-base font-black text-[#316bbf] font-['Plus_Jakarta_Sans']">
                      {data.avgViews || '5K+'}
                    </b>
                  </div>
                  <div className="rounded-xl bg-pink-50/70 p-2.5 border border-pink-100 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Tương tác
                    </span>
                    <b className="text-sm sm:text-base font-black text-[#613bd1] font-['Plus_Jakarta_Sans']">
                      {data.engagementRate || '4.5%'}
                    </b>
                  </div>
                  <div className="rounded-xl bg-emerald-50/80 p-2.5 border border-emerald-200 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5 flex items-center justify-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px] text-emerald-600">trending_up</span>
                      GMV Kênh
                    </span>
                    <b className="text-sm sm:text-base font-black text-emerald-700 font-['Plus_Jakarta_Sans']">
                      {data.gmv || '0'}
                    </b>
                  </div>
                  <div className="col-span-2 sm:col-span-1 rounded-xl bg-amber-50/80 p-2.5 border border-amber-200 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-0.5 flex items-center justify-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px] text-amber-600">task_alt</span>
                      Chiến dịch đã chạy
                    </span>
                    <b className="text-sm sm:text-base font-black text-amber-700 font-['Plus_Jakarta_Sans']">
                      {data.completedCampaignsCount !== undefined && data.completedCampaignsCount !== null && data.completedCampaignsCount !== ''
                        ? String(data.completedCampaignsCount).replace(/\s*chiến\s*dịch/gi, '').trim()
                        : '0'}
                    </b>
                  </div>
                </div>

                {/* Hàng 2 cột cân đối: Phong cách video (Trái) & Đối tượng khán giả (Phải) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                  {/* Phong cách video & Định dạng nội dung */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-[#613bd1]">movie</span>
                        Phong cách video:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {contentStylesList.length > 0 ? (
                          contentStylesList.map((st, idx) => (
                            <span
                              key={idx}
                              className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#316bbf] border border-blue-200/60"
                            >
                              {st}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Review, Vlog, Unboxing</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Đối tượng khán giả chính (Target Audience) - Thu gọn, đầy đặn, không bị trống */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-amber-700">groups</span>
                          Đối tượng khán giả:
                        </span>
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded-md">
                          Demographics
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {data.targetAudience || 'Độ tuổi 18 - 35 • Phù hợp tệp khách hàng trẻ & văn phòng'}
                      </p>

                      {/* Quick Demographic Badges */}
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-900 bg-white/80 border border-amber-200 px-1.5 py-0.5 rounded">
                          18 - 35 tuổi
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-900 bg-white/80 border border-amber-200 px-1.5 py-0.5 rounded">
                          Nam & Nữ
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-900 bg-white/80 border border-amber-200 px-1.5 py-0.5 rounded">
                          Toàn quốc
                        </span>
                      </div>
                    </div>

                    {data.targetAudienceImage && (
                      <div className="mt-2 pt-2 border-t border-amber-200/60">
                        <div
                          onClick={() => setPreviewImage(data.targetAudienceImage || null)}
                          className="flex items-center gap-2 p-1.5 rounded-lg bg-white/90 border border-amber-300 group cursor-pointer shadow-2xs hover:bg-amber-100/50 transition-colors"
                          title="Bấm để xem ảnh phân tích phóng to"
                        >
                          <img
                            src={data.targetAudienceImage}
                            alt="Insight đối tượng khán giả"
                            crossOrigin="anonymous"
                            className="h-9 w-12 object-cover rounded border border-amber-200"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-slate-800 block truncate">Biểu đồ người xem</span>
                            <span className="text-[9px] text-amber-700 flex items-center gap-0.5 font-medium">
                              <span className="material-symbols-outlined text-[11px]">zoom_in</span> Xem phóng to
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Portfolio & Case Studies */}
                {(data.portfolioDriveLink || data.portfolioFile) && (
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                    <span className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider block flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#613bd1]">folder_shared</span>
                      Portfolio hoặc Video nổi bật
                    </span>

                    {/* File Portfolio or Uploaded Video */}
                    {data.portfolioFile && (
                      isPortfolioFileVideo(data.portfolioFile) ? (
                        <div className="space-y-1">
                          <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-48 sm:max-h-56 w-full shadow-xs">
                            <video
                              src={data.portfolioFile.dataUrl}
                              controls
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
                            <span className="truncate max-w-[220px] font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-purple-600">movie</span>
                              {data.portfolioFile.name}
                            </span>
                            {data.portfolioFile.dataUrl && (
                              <a
                                href={data.portfolioFile.dataUrl}
                                download={data.portfolioFile.name}
                                className="text-purple-700 hover:underline font-bold text-[10px] shrink-0"
                              >
                                Tải về ({data.portfolioFile.size})
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <a
                          href={data.portfolioFile.dataUrl}
                          download={data.portfolioFile.name}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-1.5 text-xs font-bold text-rose-600 border border-rose-200 shadow-2xs hover:bg-rose-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px] text-rose-500">picture_as_pdf</span>
                          <span className="truncate max-w-[160px]">{data.portfolioFile.name}</span>
                          <span className="text-[10px] text-slate-400">({data.portfolioFile.size})</span>
                          <span className="material-symbols-outlined text-[13px]">download</span>
                        </a>
                      )
                    )}

                    {/* Link Portfolio or Embedded Video */}
                    {data.portfolioDriveLink && (() => {
                      const parsed = parsePortfolioVideoLink(data.portfolioDriveLink);
                      if (!parsed) return null;
                      if (parsed.type === 'youtube') {
                        return (
                          <div className="space-y-1">
                            <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-48 sm:max-h-56 w-full shadow-xs">
                              <iframe
                                src={parsed.embedUrl}
                                title="Video Portfolio YouTube"
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                              <span className="flex items-center gap-1 text-red-600 font-semibold">
                                <span className="material-symbols-outlined text-[13px]">smart_display</span> YouTube Video
                              </span>
                              <a href={parsed.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-0.5">
                                Mở trên YouTube <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                              </a>
                            </div>
                          </div>
                        );
                      }
                      if (parsed.type === 'video') {
                        return (
                          <div className="space-y-1">
                            <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-48 sm:max-h-56 w-full shadow-xs">
                              <video
                                src={parsed.embedUrl}
                                controls
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                              <span className="flex items-center gap-1 text-purple-600 font-semibold">
                                <span className="material-symbols-outlined text-[13px]">movie</span> Video trực tiếp
                              </span>
                              <a href={parsed.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-0.5">
                                Mở liên kết <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                              </a>
                            </div>
                          </div>
                        );
                      }
                      if (parsed.type === 'tiktok') {
                        return (
                          <a
                            href={parsed.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 text-white hover:bg-black transition-colors shadow-2xs group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-pink-400 text-[15px]">play_circle</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">Video review trên TikTok</p>
                                <p className="text-[10px] text-slate-300 truncate">{parsed.url}</p>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-300 bg-white/10 px-2 py-1 rounded-lg shrink-0 group-hover:bg-white/20">
                              Xem TikTok <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                            </span>
                          </a>
                        );
                      }
                      return (
                        <a
                          href={parsed.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-1.5 text-xs font-bold text-[#316bbf] border border-blue-200 shadow-2xs hover:bg-blue-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">link</span>
                          <span>Mở Portfolio Drive / Notion</span>
                          <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                        </a>
                      );
                    })()}
                  </div>
                )}

                {/* Footer watermark */}
                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                  <span>Xác thực bởi Kocity Platform</span>
                  <span>https://kocity.vn</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer cố định phía dưới */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/95 backdrop-blur-sm shrink-0 space-y-2 z-20">
          <div className="grid grid-cols-2 gap-2">
            {/* Nút 1: Tải ảnh PNG */}
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 disabled:opacity-50 py-2.5 px-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isDownloading ? 'sync' : 'download'}
              </span>
              <span>{isDownloading ? 'Đang xuất ảnh...' : 'Tải ảnh thẻ (PNG)'}</span>
            </button>

            {/* Nút 2: Sao chép link web */}
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 py-2.5 px-3 text-xs font-bold text-[#613bd1] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedLink ? 'done' : 'link'}
              </span>
              <span>{copiedLink ? 'Đã chép link ngắn!' : 'Sao chép link web'}</span>
            </button>
          </div>

          {/* Dòng hiển thị link trực quan ngắn gọn */}
          <div className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200/80 px-2.5 py-1.5 text-[11px]">
            <span className="material-symbols-outlined text-[14px] text-purple-600 shrink-0">link</span>
            <span className="font-mono text-slate-600 truncate flex-1 select-all">{cleanShareUrl}</span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="ml-auto text-xs font-bold text-[#613bd1] hover:underline shrink-0 cursor-pointer"
            >
              {copiedLink ? 'Đã chép' : 'Sao chép'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Nút 3: Liên hệ Zalo / Hợp tác */}
            <a
              href={ZALO_GROUP_URL}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#613bd1] to-[#316bbf] hover:opacity-95 py-2.5 px-4 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer text-center"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Liên hệ hợp tác (Zalo)</span>
            </a>

            {/* Nút 4: Khám phá chiến dịch Kocity */}
            {onExploreCampaigns && (
              <button
                onClick={() => {
                  onClose();
                  onExploreCampaigns();
                }}
                className="flex-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-700 transition-colors cursor-pointer text-center"
              >
                Vào sàn Kocity
              </button>
            )}
          </div>

          {/* Nút 5: Đóng thẻ */}
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            <span>Đóng thẻ Media Kit</span>
          </button>
        </div>
      </div>

      {/* Modal xem ảnh phóng to nếu KOC có tải ảnh đối tượng khán giả */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <img
              src={previewImage}
              alt="Ảnh phóng to phân tích khán giả"
              className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
