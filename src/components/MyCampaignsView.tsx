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
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
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
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-5 py-3 text-xs sm:text-sm font-semibold text-indigo-900 shadow-sm transition-all"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded bg-[#6366f1] text-[9px] font-black text-white">
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

  // Chuẩn hóa chuỗi so khớp tài khoản KOC
  const normalizeHandle = (h?: string) => (h ? h.toLowerCase().replace(/[@\s]/g, '') : '');
  const normalizePhone = (p?: string) => (p ? p.replace(/[\s.-]/g, '') : '');

  // 2. When KOC IS logged in: CHỈ hiển thị đúng các đơn KOC này tự nộp trên web
  const myApps = applications.filter((a) => {
    if (!currentUser) return false;
    if (a.kocId && currentUser.id && a.kocId === currentUser.id) return true;

    const userHandle = normalizeHandle(currentUser.tiktokHandle);
    const appHandle = normalizeHandle(a.tiktokHandle);
    if (userHandle && appHandle && userHandle === appHandle) return true;

    const userPhone = normalizePhone(currentUser.phone);
    const appPhone = normalizePhone(a.phone);
    if (userPhone && appPhone && userPhone.length >= 9 && userPhone === appPhone) return true;

    return false;
  });

  // Tính tổng thù lao chờ nhận từ các chiến dịch thực tế của KOC
  const totalPendingPayout = myApps.reduce((acc, app) => {
    const c = campaigns.find((camp) => camp.id === app.campaignId);
    if (!c) return acc;
    if (c.bookingFee && c.bookingFee.includes('1.500.000')) return acc + 1500000;
    if (c.bookingFee && c.bookingFee.includes('1.000.000')) return acc + 1000000;
    if (c.bookingFee && c.bookingFee.includes('2.000.000')) return acc + 2000000;
    if (c.bookingFee && c.bookingFee.includes('500.000')) return acc + 500000;
    return acc;
  }, 0);

  const formattedPayout = totalPendingPayout > 0 ? `${totalPendingPayout.toLocaleString('vi-VN')}đ` : '0đ';

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
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-sm">
              <span className="material-symbols-outlined text-lg">assignment_turned_in</span>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-xl sm:text-2xl font-extrabold text-slate-900">
              Chiến dịch của tôi
            </h1>
            <span className="rounded-full bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 text-xs font-extrabold text-indigo-800">
              {myApps.length} chiến dịch
            </span>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
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
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:text-[#6366f1] hover:border-indigo-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#6366f1]">badge</span>
              <span>Hồ sơ KOC & Media Kit</span>
            </button>
          )}
          <a
            id="my-campaigns-zalo-btn"
            href={ZALO_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 px-3.5 py-2 text-xs font-semibold text-indigo-900 transition-all shadow-sm"
            title="Vào nhóm Zalo KOC trao đổi & hỗ trợ trực tiếp"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded bg-[#6366f1] text-[8px] font-black text-white">
              Z
            </span>
            <span>Nhóm Zalo hỗ trợ KOC</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs shadow-sm">
            <span className="text-slate-500">Tổng thù lao chờ nhận: </span>
            <b className="font-['Plus_Jakarta_Sans'] text-[#6366f1] text-sm">{formattedPayout}</b>
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
            Hồ sơ tài khoản của bạn đã được kích hoạt. Hãy khám phá và đăng ký các chiến dịch nhận mẫu 0đ để bắt đầu nhận hàng trải nghiệm từ các thương hiệu chính hãng.
          </p>
          <button
            onClick={onBackToMarketplace}
            className="mt-5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all cursor-pointer"
          >
            Khám phá chiến dịch ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myApps.map((app) => {
            const matchedCampaign = campaigns.find((c) => c.id === app.campaignId) || campaigns[0];
            const isApproved = app.status === 'Đã duyệt gửi mẫu' || app.status === 'Đang giao' || app.status === 'Đã lên bài';
            const isRejected = app.status === 'Từ chối';
            const currentStepIdx = app.videoLink || app.status === 'Đã lên bài' ? 3 : app.status === 'Đã duyệt gửi mẫu' || app.status === 'Đang giao' ? 2 : 1;

            const steps = [
              { label: 'Đăng ký mẫu', desc: 'Đã nộp hồ sơ', icon: 'how_to_reg' },
              { 
                label: isRejected ? 'Từ chối duyệt' : 'Quản trị viên duyệt', 
                desc: isRejected ? 'Hồ sơ chưa đạt' : isApproved ? 'Đã duyệt gửi mẫu' : 'Đang chờ Admin duyệt', 
                icon: isRejected ? 'cancel' : 'verified' 
              },
              { 
                label: 'Giao quà mẫu', 
                desc: app.shippingCode || (isApproved ? 'GHTK đang giao' : 'Chờ duyệt để gửi mẫu'), 
                icon: 'local_shipping' 
              },
              { 
                label: 'Nghiệm thu video', 
                desc: app.videoLink ? 'Đã nộp video' : (isApproved ? 'Hạn 4 - 7 ngày' : 'Chờ nhận mẫu'), 
                icon: 'video_library' 
              },
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
                        <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                          {app.code}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border flex items-center gap-1 ${
                            app.status === 'Đã duyệt gửi mẫu'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : app.status === 'Đang giao'
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : app.status === 'Đã lên bài'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : app.status === 'Từ chối'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-amber-50 text-amber-900 border-amber-300'
                          }`}
                        >
                          {app.status === 'Chờ duyệt' && (
                            <span className="material-symbols-outlined text-[13px] text-amber-700">hourglass_top</span>
                          )}
                          {app.status === 'Đã duyệt gửi mẫu' && (
                            <span className="material-symbols-outlined text-[13px] text-emerald-700">verified</span>
                          )}
                          {app.status === 'Từ chối' && (
                            <span className="material-symbols-outlined text-[13px] text-rose-700">cancel</span>
                          )}
                          {app.status === 'Chờ duyệt'
                            ? 'Chờ Quản trị viên duyệt mẫu'
                            : app.status === 'Đã duyệt gửi mẫu'
                            ? 'Đã duyệt gửi mẫu'
                            : app.status === 'Từ chối'
                            ? 'Chưa được duyệt'
                            : app.status}
                        </span>
                      </div>
                      <h3
                        onClick={() => onSelectCampaign(matchedCampaign)}
                        className="mt-1 font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-bold text-slate-900 cursor-pointer hover:text-[#6366f1] transition-colors"
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
                      {app.status === 'Chờ duyệt' ? (
                        <span className="font-semibold text-amber-800 flex items-center gap-1 text-left mt-0.5">
                          <span className="material-symbols-outlined text-[14px] text-amber-700">schedule</span>
                          <span>Chờ Quản trị viên duyệt hồ sơ gửi mẫu</span>
                        </span>
                      ) : app.status === 'Từ chối' ? (
                        <span className="font-semibold text-rose-700 flex items-center gap-1 text-left mt-0.5">
                          <span className="material-symbols-outlined text-[14px] text-rose-600">block</span>
                          <span>Chưa đạt tiêu chí chiến dịch này</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCopyTracking(app.shippingCode || 'GHTK-EXP98234')}
                          className="font-bold text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer text-left mt-0.5"
                          title="Nhấp để sao chép mã vận đơn"
                        >
                          <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                          <span>{app.shippingCode ? `${app.shippingCode}` : 'GHTK: Đang chuẩn bị hàng'}</span>
                          <span className="material-symbols-outlined text-[12px] text-emerald-600">content_copy</span>
                        </button>
                      )}
                    </div>

                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-xs">
                      <span className="text-slate-500 block text-[10px]">Thời hạn làm video (4 - 7 ngày):</span>
                      <span className="font-semibold text-slate-900 block mt-0.5">
                        {app.status === 'Chờ duyệt'
                          ? 'Tính sau khi nhận hàng mẫu'
                          : app.status === 'Từ chối'
                          ? 'Không áp dụng'
                          : 'Hạn 4 - 7 ngày sau nhận hàng'}
                      </span>
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
                              ? 'border-blue-500 bg-blue-50/60 shadow-sm ring-1 ring-blue-400/30'
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
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isCompleted ? 'check' : st.icon}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className={`text-[10px] font-semibold ${isCurrent ? 'text-blue-700 font-bold' : 'text-slate-500'}`}>
                              Bước {sIdx + 1}
                            </div>
                            <div className={`text-xs font-bold truncate ${
                              isCurrent ? 'text-blue-950 font-extrabold' : isCompleted ? 'text-blue-900' : 'text-slate-700'
                            }`}>
                              {st.label}
                            </div>
                            <div className={`text-[10px] truncate ${isCurrent ? 'text-blue-800' : 'text-slate-500'}`}>
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
                          className="text-[#6366f1] underline truncate max-w-xs font-semibold"
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
                          className="rounded-xl border border-[#6366f1] px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#6366f1] w-full sm:w-64"
                        />
                        <button
                          onClick={() => handleSubmitLink(app.id)}
                          className="rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-2 text-xs font-bold text-white hover:opacity-95 shrink-0 cursor-pointer"
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
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all cursor-pointer"
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
