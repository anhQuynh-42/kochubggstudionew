import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { APP_LOGOS } from '../data/mockData';
import { ZALO_GROUP_URL } from './ZaloCommunityWidget';

export interface PublicMediaKitData {
  id?: string;
  name: string;
  tiktokHandle: string;
  avatar?: string;
  followers?: string;
  avgViews?: string;
  engagementRate?: string;
  categories?: string[];
  bio?: string;
  memberCode?: string;
  city?: string;
  district?: string;
  address?: string;
  channelLink?: string;
  portfolioDriveLink?: string;
  targetAudience?: string;
  contentStyle?: string;
  minBookingRate?: string;
  allowSparkAds?: boolean;
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

  // Tải thẻ Media Kit về máy dạng ảnh PNG
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
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

  // Sao chép link chia sẻ
  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      if (onShowToast) {
        onShowToast('Đã sao chép link Media Kit!', 'Bạn có thể gửi link này cho Brand xem trực tiếp.', 'success');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl overflow-hidden my-6">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer z-10"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* THẺ MEDIA KIT ĐƯỢC CHỤP ẢNH (cardRef) */}
        <div ref={cardRef} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100">
          {/* Header Card */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
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
              <span className="rounded-full bg-purple-50 border border-purple-200 px-2.5 py-1 text-[11px] font-mono font-extrabold text-[#613bd1]">
                #{data.memberCode}
              </span>
            )}
          </div>

          {/* KOC Info Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left mb-5">
            <div className="relative">
              <img
                src={data.avatar || APP_LOGOS.userProfile}
                alt={data.name}
                crossOrigin="anonymous"
                className="h-20 w-20 sm:h-22 sm:w-22 rounded-2xl object-cover border-2 border-purple-200 shadow-sm"
              />
              <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm ring-2 ring-white">
                <span className="material-symbols-outlined text-[14px]">verified</span>
              </span>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="font-['Plus_Jakarta_Sans'] text-xl sm:text-2xl font-black text-slate-900">
                  {data.name}
                </h2>
              </div>
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#613bd1] hover:underline mt-0.5"
              >
                <span>{cleanHandle}</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>

              {data.bio && (
                <p className="mt-2 text-xs text-slate-600 leading-relaxed italic bg-purple-50/60 p-2.5 rounded-xl border border-purple-100">
                  "{data.bio}"
                </p>
              )}
            </div>
          </div>

          {/* Metric Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 text-center mb-4">
            <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/50 p-3 border border-purple-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Followers
              </span>
              <b className="text-base sm:text-lg font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                {data.followers || '10K+'}
              </b>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50/50 p-3 border border-blue-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Avg Views
              </span>
              <b className="text-base sm:text-lg font-black text-[#316bbf] font-['Plus_Jakarta_Sans']">
                {data.avgViews || '5K+'}
              </b>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50/50 p-3 border border-pink-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Tương tác
              </span>
              <b className="text-base sm:text-lg font-black text-[#613bd1] font-['Plus_Jakarta_Sans']">
                {data.engagementRate || '4.5%'}
              </b>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Ngành hàng thế mạnh:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.categories && data.categories.length > 0 ? (
                data.categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-purple-100/80 px-2.5 py-1 text-[11px] font-bold text-[#613bd1] border border-purple-200/60"
                  >
                    {cat}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">Làm đẹp, Thời trang & Lifestyle</span>
              )}
            </div>
          </div>

          {/* Highlights Info */}
          {(data.city || data.minBookingRate || data.targetAudience) && (
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
              {data.city && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#316bbf]">location_on</span>
                  <span>{data.city}</span>
                </div>
              )}
              {data.minBookingRate && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-emerald-600">payments</span>
                  <span>Booking: {data.minBookingRate}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer watermark */}
          <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
            <span>Xác thực bởi Kocity Platform</span>
            <span>https://kocity.vn</span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="mt-5 space-y-2.5 pt-3 border-t border-slate-100">
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
              <span>{copiedLink ? 'Đã copy link!' : 'Copy link web'}</span>
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
        </div>
      </div>
    </div>
  );
};
