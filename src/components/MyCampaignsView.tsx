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
            const isApproved =
              app.status === 'Đã duyệt gửi mẫu' ||
              app.status === 'Đang giao' ||
              app.status === 'Chờ duyệt video' ||
              app.status === 'Đã hoàn thành' ||
              app.status === 'Đã lên bài' ||
              app.status === 'Bị từ chối';
            const isRejectedProfile = app.status === 'Từ chối';
            const isVideoRejected = app.status === 'Bị từ chối';
            const isVideoApproved = app.status === 'Đã hoàn thành' || app.status === 'Đã lên bài';
            const isPendingVideo = app.status === 'Chờ duyệt video';

            const isSampleDelivered = app.shippingStatus === 'Đã phát thành công';

            const currentStepIdx = isVideoApproved
              ? 4
              : isPendingVideo || isVideoRejected || app.videoLink
              ? 3
              : app.status === 'Đã duyệt gửi mẫu' || app.status === 'Đang giao'
              ? 2
              : 1;

            const steps = [
              { label: 'Đăng ký mẫu', desc: 'Đã nộp hồ sơ', icon: 'how_to_reg' },
              {
                label: isRejectedProfile ? 'Từ chối duyệt mẫu' : 'Quản trị viên duyệt',
                desc: isRejectedProfile
                  ? 'Hồ sơ chưa đạt'
                  : isApproved
                  ? 'Đã duyệt gửi mẫu'
                  : 'Đang chờ Admin duyệt',
                icon: isRejectedProfile ? 'cancel' : 'verified',
              },
              {
                label: 'Giao quà mẫu',
                desc: isSampleDelivered
                  ? 'Đã giao thành công'
                  : app.shippingCode
                  ? app.shippingCode
                  : isApproved
                  ? 'GHTK đang giao'
                  : 'Chờ duyệt để gửi mẫu',
                icon: isSampleDelivered ? 'task_alt' : 'local_shipping',
              },
              {
                label: 'Nghiệm thu video',
                desc: isVideoApproved
                  ? 'Đã hoàn thành'
                  : isVideoRejected
                  ? 'Cần sửa & nộp lại'
                  : isPendingVideo
                  ? 'Đang chờ Admin duyệt'
                  : isSampleDelivered && !app.videoLink
                  ? 'Hạn làm video: 5 - 7 ngày'
                  : app.videoLink
                  ? 'Đã nộp video'
                  : isApproved
                  ? 'Hạn 5 - 7 ngày sau nhận hàng'
                  : 'Chờ nhận mẫu',
                icon: isVideoApproved
                  ? 'check_circle'
                  : isVideoRejected
                  ? 'cancel'
                  : isPendingVideo
                  ? 'hourglass_top'
                  : isSampleDelivered
                  ? 'alarm'
                  : 'video_library',
              },
            ];

            return (
              <div
                key={app.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-md space-y-4"
              >
                {/* Top Info */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
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

                        {/* Status Badge */}
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border flex items-center gap-1 ${
                            isVideoApproved
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : isVideoRejected
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : isPendingVideo
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : app.status === 'Đã duyệt gửi mẫu'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : app.status === 'Đang giao'
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : isRejectedProfile
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : 'bg-amber-50 text-amber-900 border-amber-300'
                          }`}
                        >
                          {isVideoApproved && (
                            <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                          )}
                          {isVideoRejected && (
                            <span className="material-symbols-outlined text-[14px] text-rose-600">cancel</span>
                          )}
                          {isPendingVideo && (
                            <span className="material-symbols-outlined text-[14px] text-amber-600">hourglass_top</span>
                          )}
                          {app.status === 'Đã duyệt gửi mẫu' && (
                            <span className="material-symbols-outlined text-[14px] text-blue-600">local_shipping</span>
                          )}
                          {app.status === 'Chờ duyệt' && (
                            <span className="material-symbols-outlined text-[14px] text-amber-600">schedule</span>
                          )}
                          {isRejectedProfile && (
                            <span className="material-symbols-outlined text-[14px] text-slate-500">block</span>
                          )}

                          {isVideoApproved
                            ? 'Đã hoàn thành'
                            : isVideoRejected
                            ? 'Bị từ chối'
                            : isPendingVideo
                            ? 'Chờ duyệt video'
                            : app.status === 'Chờ duyệt'
                            ? 'Chờ Quản trị viên duyệt mẫu'
                            : isRejectedProfile
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
                </div>

                {/* Banner: Giục KOC làm video sau khi mẫu giao thành công */}
                {isSampleDelivered && !app.videoLink && (
                  <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 p-4 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[22px]">alarm</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-amber-950 text-xs sm:text-sm">
                            📦 Quà mẫu đã giao thành công - Bắt đầu quay video!
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                            <span className="material-symbols-outlined text-[12px]">schedule</span>
                            Hạn 5 - 7 ngày
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-amber-800 mt-1 leading-relaxed">
                          Bưu tá đã phát thành công sản phẩm mẫu. Bạn hãy mở hộp trải nghiệm và <b>bắt đầu làm video ngay</b> để hoàn thành đúng hạn <b>5 - 7 ngày</b>. Nộp link video sớm để Brand nghiệm thu và nhận thù lao nhé!
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAppId(app.id);
                        setVideoLinkInput('');
                      }}
                      className="shrink-0 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[16px]">upload_file</span>
                      <span>Nộp video ngay</span>
                    </button>
                  </div>
                )}

                {/* Banner: Phản hồi của Quản trị viên khi Video bị từ chối */}
                {isVideoRejected && (
                  <div className="rounded-2xl bg-rose-50/90 border border-rose-200 p-4 text-xs text-rose-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-rose-800">
                      <span className="material-symbols-outlined text-[18px] text-rose-600">feedback</span>
                      <span>Phản hồi từ Quản trị viên (Lý do từ chối & Yêu cầu chỉnh sửa):</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-rose-200 text-rose-900 leading-relaxed font-medium">
                      "{app.adminFeedback || 'Video chưa đạt tiêu chí theo brief của chiến dịch. Vui lòng kiểm tra lại yêu cầu và nộp lại link video đã chỉnh sửa.'}"
                    </div>
                    <p className="text-[11px] text-rose-700 font-medium pt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">tips_and_updates</span>
                      <span>Hãy quay bổ sung hoặc chỉnh sửa theo góp ý trên, sau đó dán link mới vào ô bên dưới và bấm <b>"Nộp lại link video đã sửa"</b> để Admin duyệt lại.</span>
                    </p>
                  </div>
                )}

                {/* Banner: Chúc mừng khi Video Đã hoàn thành */}
                {isVideoApproved && (
                  <div className="rounded-2xl bg-emerald-50/90 border border-emerald-200 p-3.5 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs">
                        <span className="material-symbols-outlined text-[20px]">verified</span>
                      </div>
                      <div>
                        <p className="font-extrabold text-emerald-900 text-xs sm:text-sm">
                          🎉 Video của bạn đã được Quản trị viên duyệt Đã hoàn thành!
                        </p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Chiến dịch đã nghiệm thu thành công. Thù lao cố định và hoa hồng affiliate của bạn đã được ghi nhận.
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-extrabold text-emerald-800 text-[11px] bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                      ✓ Nghiệm thu 100%
                    </span>
                  </div>
                )}

                {/* Banner: Đang chờ duyệt video */}
                {isPendingVideo && (
                  <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-3 text-xs text-amber-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-amber-600 animate-spin">sync</span>
                    <div>
                      <span className="font-bold text-amber-900">Đã nộp video - Đang chờ nghiệm thu: </span>
                      <span className="text-amber-800">Quản trị viên đang kiểm tra chất lượng video, gắn giỏ hàng và duyệt hoàn thành.</span>
                    </div>
                  </div>
                )}

                {/* Visual 4-Step Progress Stepper */}
                <div className="py-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
                    {steps.map((st, sIdx) => {
                      const isCompleted = sIdx < currentStepIdx;
                      const isCurrent = sIdx === currentStepIdx;

                      return (
                        <div
                          key={sIdx}
                          className={`flex items-center gap-3 rounded-2xl p-3 border transition-all ${
                            isVideoApproved && sIdx === 3
                              ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                              : isVideoRejected && sIdx === 3
                              ? 'border-rose-400 bg-rose-50/60 shadow-xs'
                              : isCurrent
                              ? 'border-blue-500 bg-blue-50/60 shadow-sm ring-1 ring-blue-400/30'
                              : isCompleted
                              ? 'border-blue-200 bg-blue-50/40'
                              : 'border-slate-200 bg-white opacity-70'
                          }`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                              isVideoApproved && sIdx === 3
                                ? 'bg-emerald-600 text-white'
                                : isVideoRejected && sIdx === 3
                                ? 'bg-rose-600 text-white'
                                : isCompleted
                                ? 'bg-blue-600 text-white'
                                : isCurrent
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isCompleted || (isVideoApproved && sIdx === 3) ? 'check' : st.icon}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className={`text-[10px] font-semibold ${isCurrent ? 'text-blue-700 font-bold' : 'text-slate-500'}`}>
                              Bước {sIdx + 1}
                            </div>
                            <div className={`text-xs font-bold truncate ${
                              isVideoApproved && sIdx === 3
                                ? 'text-emerald-950 font-extrabold'
                                : isVideoRejected && sIdx === 3
                                ? 'text-rose-950 font-extrabold'
                                : isCurrent
                                ? 'text-blue-950 font-extrabold'
                                : isCompleted
                                ? 'text-blue-900'
                                : 'text-slate-700'
                            }`}>
                              {st.label}
                            </div>
                            <div className={`text-[10px] truncate ${
                              isVideoApproved && sIdx === 3
                                ? 'text-emerald-700 font-semibold'
                                : isVideoRejected && sIdx === 3
                                ? 'text-rose-700 font-semibold'
                                : isCurrent
                                ? 'text-blue-800'
                                : 'text-slate-500'
                            }`}>
                              {st.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Actions & Video link submission */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                  <div className="text-xs text-slate-600 w-full sm:w-auto">
                    {app.videoLink ? (
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-700 font-bold flex items-center gap-1 shrink-0">
                          <span className="material-symbols-outlined text-[16px]">play_circle</span>
                          Link video đã nộp:
                        </span>
                        <a
                          href={app.videoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#6366f1] underline truncate max-w-xs font-semibold hover:text-indigo-800"
                        >
                          {app.videoLink}
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-[11px] sm:text-xs">
                        ⚠️ <b>Bước 4:</b> KOC trả video bằng cách dán link TikTok hoặc Google Drive để Admin nghiệm thu.
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
                        onClick={() => {
                          setSelectedAppId(app.id);
                          setVideoLinkInput(app.videoLink || '');
                        }}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shadow-sm ${
                          isVideoRejected
                            ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-rose-500/20 hover:opacity-95'
                            : isVideoApproved
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                            : 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-indigo-500/20 hover:opacity-95'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isVideoRejected ? 'replay' : isVideoApproved ? 'check_circle' : 'upload_file'}
                        </span>
                        <span>
                          {isVideoRejected
                            ? 'Nộp lại link video đã sửa'
                            : isVideoApproved
                            ? 'Cập nhật lại link'
                            : app.videoLink
                            ? 'Cập nhật link video'
                            : 'Trả video (Drive/TikTok)'}
                        </span>
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
