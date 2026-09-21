import React, { useState } from 'react';
import { Campaign } from '../types';
import { ZALO_GROUP_URL } from './ZaloCommunityWidget';

interface CampaignDetailViewProps {
  campaign: Campaign;
  onBack: () => void;
  onOpenApplyModal: (campaign: Campaign) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (campaign: Campaign) => void;
  onShowToast?: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({
  campaign,
  onBack,
  onOpenApplyModal,
  isBookmarked = false,
  onToggleBookmark,
  onShowToast,
}) => {
  const [copiedTag, setCopiedTag] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const quotaPercent = Math.round((campaign.registeredSpots / campaign.totalSpots) * 100);
  const spotsLeft = campaign.totalSpots - campaign.registeredSpots;

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(campaign.hashtags.join(' '));
    setCopiedTag(true);
    if (onShowToast) {
      onShowToast('Đã sao chép hashtags!', campaign.hashtags.join(' '), 'success');
    }
    setTimeout(() => setCopiedTag(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(campaign.code);
    if (onShowToast) {
      onShowToast('Đã sao chép mã chiến dịch!', campaign.code, 'success');
    }
  };

  const handleShare = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopiedLink(true);
    if (onShowToast) {
      onShowToast('Đã sao chép liên kết chiến dịch!', 'Bạn có thể gửi liên kết cho KOC khác.', 'info');
    }
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-28 lg:pb-8">
      {/* Breadcrumb & Back button */}
      <div className="flex items-center justify-between pb-4">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <button onClick={onBack} className="hover:text-slate-900 transition-colors cursor-pointer">
            Khám phá chiến dịch
          </button>
          <span>/</span>
          <span className="text-slate-600">{campaign.category}</span>
          <span>/</span>
          <span className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-md">
            {campaign.title}
          </span>
        </nav>

        <div className="flex items-center gap-2">
          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(campaign)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                isBookmarked
                  ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200'
              }`}
              title={isBookmarked ? 'Bỏ lưu chiến dịch' : 'Lưu chiến dịch'}
            >
              <span className={`material-symbols-outlined text-[16px] ${isBookmarked ? 'fill-current text-white' : 'text-slate-400'}`}>
                favorite
              </span>
              <span className="hidden sm:inline">{isBookmarked ? 'Đã lưu' : 'Lưu'}</span>
            </button>
          )}

          <button
            onClick={onBack}
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      {/* Main Campaign Header */}
      <section className="mt-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              <img
                src={campaign.brandLogo}
                alt={campaign.brandName}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900">
                  {campaign.brandName}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-[11px] font-semibold text-orange-800">
                  <span className="material-symbols-outlined text-[13px] text-orange-600">verified</span>
                  Official Mall
                </span>
                {campaign.tiktokUrl && (
                  <a
                    href={campaign.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-0.5 text-[11px] font-semibold transition-all shadow-sm active:scale-95"
                    title={`Mở kênh TikTok ${campaign.tiktokHandle || campaign.brandName}`}
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.37a6.34 6.34 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.63a6.34 6.34 0 0 0 9.24 5.6 6.31 6.31 0 0 0 3.52-5.63V8.58c1.37.98 3.03 1.56 4.83 1.56V6.69z" />
                    </svg>
                    <span>{campaign.tiktokHandle || 'TikTok Shop'}</span>
                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-[11px] font-semibold text-orange-800">
                  <span className="material-symbols-outlined text-[13px] text-orange-600">local_fire_department</span>
                  Chiến dịch HOT
                </span>
              </div>

              <h1 className="mt-2 font-['Plus_Jakarta_Sans'] text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug">
                {campaign.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={handleCopyCode}
                  className="group inline-flex items-center gap-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 px-2.5 py-1 font-semibold text-orange-800 transition-colors cursor-pointer"
                  title="Nhấp để sao chép mã chiến dịch"
                >
                  <span>Mã: <b className="text-orange-900">{campaign.code}</b></span>
                  <span className="material-symbols-outlined text-[13px] text-orange-600 group-hover:text-orange-900">content_copy</span>
                </button>
                <span className="rounded-lg bg-slate-100 border border-slate-200/80 px-2.5 py-1 font-semibold text-slate-700">
                  Nền tảng: <b className="text-slate-900">{campaign.platform}</b>
                </span>
                <span className="rounded-lg bg-slate-100 border border-slate-200/80 px-2.5 py-1 font-semibold text-slate-700">
                  Yêu cầu: <b className="text-slate-900">{campaign.followerRequirement}</b>
                </span>
                <span className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 font-semibold text-blue-800">
                  Tỷ lệ duyệt: <b>{campaign.approvalRate || '85%'}</b>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => onOpenApplyModal(campaign)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-orange-600 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>Đăng ký nhận mẫu</span>
            </button>
            <div className="text-center text-[11px] font-semibold text-orange-700">
              Còn {spotsLeft} suất cuối cùng
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Left Dossier / Right Compensation Card */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Dossier, Moodboard, Brief & Storyline */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* 1. Bento Photo Moodboard */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-700">photo_library</span>
              Hình ảnh & Moodboard sản phẩm mẫu
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Main large photo */}
              <div className="sm:col-span-2 relative h-72 sm:h-80 overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={campaign.galleryImages[activePhotoIdx] || campaign.productHeroImage}
                  alt={campaign.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                  Gói tài trợ: Fullset sản phẩm mẫu
                </div>
              </div>

              {/* Thumbnails grid */}
              <div className="flex sm:flex-col gap-3">
                {campaign.galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative flex-1 h-24 sm:h-auto overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx
                        ? 'border-orange-500 ring-2 ring-orange-500/20'
                        : 'border-transparent hover:border-orange-300'
                    }`}
                  >
                    <img src={imgUrl} alt="Thumbnail" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 2. USP Highlights */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-600">verified</span>
              Điểm nhấn sản phẩm (USP bắt buộc nhắc trong video)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {campaign.uspList.map((usp, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:bg-orange-50/50 hover:border-orange-200"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700 mb-3">
                    <span className="material-symbols-outlined text-[20px]">{usp.icon}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{usp.title}</h4>
                  <p className="mt-1.5 text-[11px] text-slate-600 leading-relaxed">{usp.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Creator Brief & Storyline Blueprint */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-700">movie_edit</span>
                Kịch bản gợi ý (Creator Storyline Blueprint)
              </h3>
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                Thời lượng: 45 - 60s
              </span>
            </div>

            <div className="space-y-3">
              {campaign.storySteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                    0{idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                        {step.step}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 mt-0.5">{step.title}</h5>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Hashtags & Cart Tracking */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Hashtag bắt buộc khi đăng bài:</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {campaign.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={handleCopyHashtags}
                className="flex items-center gap-1.5 self-start sm:self-center rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>{copiedTag ? 'Đã sao chép!' : 'Sao chép Hashtag'}</span>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-700">shopping_bag</span>
              <span className="text-xs text-slate-600">
                Tên gian hàng gắn giỏ TikTok Shop:{' '}
                <b className="text-slate-900">{campaign.cartBrandName}</b> (Nhận hoa hồng qua TikTok Shop Affiliate)
              </span>
            </div>
          </section>

          {/* 5. Campaign Timeline & 4-Step Standard Workflow */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-700">alt_route</span>
                Quy trình hợp tác 4 bước của chiến dịch
              </h3>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                Duyệt trong 12h • Mẫu miễn phí 100%
              </span>
            </div>

            {/* Standard 4 Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-xs shadow-sm">
                    1
                  </span>
                  <span className="text-[10px] font-semibold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                    Duyệt 12h
                  </span>
                </div>
                <h5 className="mt-2.5 text-xs font-bold text-slate-900">Đăng Ký tham gia</h5>
                <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                  Bên mình duyệt qua (12h) & Brand duyệt hồ sơ kênh của bạn.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-xs shadow-sm">
                    2
                  </span>
                  <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    Free 100%
                  </span>
                </div>
                <h5 className="mt-2.5 text-xs font-bold text-slate-900">KOC nhận mẫu free</h5>
                <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                  Nhận quà mẫu hỏa tốc & Làm video trải nghiệm (Hạn 4-7 ngày).
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-xs shadow-sm">
                    3
                  </span>
                  <span className="text-[10px] font-semibold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                    Nghiệm thu
                  </span>
                </div>
                <h5 className="mt-2.5 text-xs font-bold text-slate-900">KOC trả video</h5>
                <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                  Up lên Drive (Google Drive) để kiểm duyệt nội dung trước khi lên bài.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-xs shadow-sm">
                    4
                  </span>
                  <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    Về tài khoản
                  </span>
                </div>
                <h5 className="mt-2.5 text-xs font-bold text-slate-900">Nhận hoa hồng sau khi có đơn</h5>
                <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                  Gắn link phát sinh đơn hàng, tiền hoa hồng chuyển thẳng về tài khoản.
                </p>
              </div>
            </div>

            {/* Campaign Milestone schedule */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Lịch trình triển khai chi tiết:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {campaign.timeline.map((step, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900">
                        {step.stepNum}
                      </span>
                      <span className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[9px] font-semibold text-orange-800">
                        {step.status}
                      </span>
                    </div>
                    <span className="mt-1.5 block text-[10px] font-semibold text-slate-500">{step.date}</span>
                    <h5 className="mt-0.5 text-xs font-bold text-slate-900">{step.title}</h5>
                    <p className="mt-0.5 text-[11px] text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Compensation Box & Registration CTA */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Quyền lợi & Thù lao KOC
                </span>
                <span className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-semibold text-orange-800">
                  Cam kết KOCHub
                </span>
              </div>

              {/* Big compensation number */}
              <div className="mt-4">
                <span className="text-xs text-slate-500">Tổng giá trị gói tài trợ / KOC</span>
                <div className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-orange-600">
                  3.500.000 VNĐ
                </div>
              </div>

              {/* Itemized benefits breakdown */}
              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-200">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                    <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">Fullset sản phẩm mẫu (850.000đ)</span>
                    <p className="text-[11px] text-slate-600">
                      Brand đóng gói và gửi ViettelPost hỏa tốc tận nhà miễn phí.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-200">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">Thù lao cố định (1.500.000đ)</span>
                    <p className="text-[11px] text-slate-600">
                      Chuyển khoản trực tiếp vào tài khoản ngân hàng sau khi duyệt video.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-200">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                    <span className="material-symbols-outlined text-[18px]">trending_up</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">Hoa hồng Affiliate (18%)</span>
                    <p className="text-[11px] text-slate-600">
                      Hưởng trực tiếp trên mọi đơn hàng phát sinh từ giỏ hàng TikTok Shop.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quota Progress Meter */}
              <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">
                    Đã đăng ký: <b className="text-slate-900">{campaign.registeredSpots}/{campaign.totalSpots}</b> KOC
                  </span>
                  <span className="font-semibold text-orange-700">Còn {spotsLeft} suất</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${quotaPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Primary Apply CTA */}
              <button
                id="dossier-apply-btn"
                onClick={() => onOpenApplyModal(campaign)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-center text-sm font-bold text-white shadow-sm hover:bg-orange-600 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                <span>ĐĂNG KÝ THAM GIA NGAY (MỞ FORM)</span>
              </button>

              {/* Secondary actions */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedLink ? 'check' : 'share'}
                  </span>
                  <span>{copiedLink ? 'Đã copy link!' : 'Chia sẻ Creator'}</span>
                </button>
                <a
                  href={ZALO_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 transition-colors"
                  title={`Trao đổi trực tiếp với đại diện ${campaign.brandName}`}
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>Nhắn tin Brand</span>
                </a>
              </div>

              {/* Direct Zalo Group Support */}
              <a
                id="detail-zalo-group-btn"
                href={ZALO_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-orange-50 border border-orange-200 py-2.5 px-3 text-xs font-semibold text-orange-900 hover:bg-orange-100 transition-all shadow-sm"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded bg-orange-500 text-[8px] font-black text-white">
                  Z
                </span>
                <span>Vào nhóm Zalo KOC trao đổi về chiến dịch</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>

              {/* Escrow Guarantee Pill */}
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[11px] font-medium text-slate-700 border border-slate-200">
                <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0">
                  shield
                </span>
                <span>
                  <b>Ki ô xây Escrow:</b> Thù lao booking được ký quỹ 100% tại Ki ô xây trước khi khởi chạy chiến dịch.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Bar */}
      <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200 p-3 backdrop-blur-md shadow-lg safe-area-bottom">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={campaign.brandLogo}
              alt={campaign.brandName}
              className="h-10 w-10 shrink-0 rounded-xl object-contain border border-slate-200 p-0.5 bg-white"
            />
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-900 truncate">{campaign.brandName}</div>
              <div className="text-[10px] text-blue-700 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">inventory_2</span>
                Tặng mẫu 0đ • {campaign.commissionRate || '10% HH'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(campaign)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all cursor-pointer ${
                  isBookmarked
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
                title={isBookmarked ? 'Bỏ lưu' : 'Lưu chiến dịch'}
              >
                <span className={`material-symbols-outlined text-[20px] ${isBookmarked ? 'fill-current text-white' : ''}`}>
                  favorite
                </span>
              </button>
            )}

            <button
              id="mobile-sticky-apply-btn"
              onClick={() => onOpenApplyModal(campaign)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-orange-600 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>Đăng ký nhận mẫu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
