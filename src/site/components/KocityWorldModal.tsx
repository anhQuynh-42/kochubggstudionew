import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Campaign } from '../../types';
import { Icon, Button, cx } from '../ui';
import { ROUTES, ZALO_GROUP_URL, BRAND_CONTACT } from '../../lib/constants';
import { useSiteUI } from '../SiteUI';
import { useAppData } from '../../state/AppDataContext';
import { copyTextToClipboard } from '../../lib/clipboard';

export interface BrandStation {
  id: string;
  name: string;
  brandName: string;
  category: string;
  sampleCount: number;
  icon: string;
  badgeBg: string;
  tagline: string;
  desc: string;
  commission: string;
}

export const DEFAULT_BRAND_STATIONS: BrandStation[] = [
  {
    id: 'store-comem',
    name: 'Cỏ Mềm Homelab',
    brandName: 'CỎ MỀM',
    category: 'Mỹ phẩm thiên nhiên thuần khiết',
    sampleCount: 35,
    icon: 'spa',
    badgeBg: 'bg-emerald-600',
    tagline: 'Kho tổng xuất mẫu Hà Nội · Miễn 100% cọc phí',
    desc: 'Tài trợ son dưỡng gạo, bọt rửa mặt trà xanh, serum rau má 0đ tận nhà cho KOC lên video trải nghiệm.',
    commission: '18% - 20%',
  },
  {
    id: 'store-bielenda',
    name: 'Bielenda Official',
    brandName: 'BIELENDA',
    category: 'Dược mỹ phẩm Châu Âu',
    sampleCount: 42,
    icon: 'water_drop',
    badgeBg: 'bg-fuchsia-600',
    tagline: 'Chính hãng nhập khẩu Ba Lan · Kho tổng TP.HCM',
    desc: 'Cung cấp serum B3 dưỡng sáng mờ thâm, nước tẩy trang hoa hồng cho KOC kênh Beauty & Skincare.',
    commission: '15%',
  },
  {
    id: 'store-tranyoo',
    name: 'Tranyoo Tech',
    brandName: 'TRANYOO',
    category: 'Phụ kiện công nghệ cao cấp',
    sampleCount: 60,
    icon: 'bolt',
    badgeBg: 'bg-amber-600',
    tagline: 'Củ sạc nhanh GaN · Pin sạc dự phòng chuẩn an toàn',
    desc: 'Gửi mẫu củ sạc trong suốt, tai nghe TWS cho KOC review công nghệ, góc làm việc và lifestyle.',
    commission: '22%',
  },
  {
    id: 'store-visecret',
    name: 'ViSecret Design',
    brandName: 'VISECRET',
    category: 'Thời trang & Nội y thiết kế',
    sampleCount: 50,
    icon: 'checkroom',
    badgeBg: 'bg-rose-600',
    tagline: 'Chất liệu thun lạnh kháng khuẩn · Phù hợp kênh nữ',
    desc: 'Bộ sưu tập áo bra đúc không gọng, set nội y cao cấp hỗ trợ đẩy đơn cực tốt trên TikTok Shop.',
    commission: '20%',
  },
];

interface KocityWorldModalProps {
  open: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  currentUser: any;
  isAdmin?: boolean;
  isNightDefault?: boolean;
  onSelectCampaign?: (campaignId: string) => void;
}

// Danh sách KOC vinh danh - BẢO MẬT 100% THÔNG TIN CÁ NHÂN (Ẩn danh, không lộ họ tên, không lộ doanh thu tiền mặt)
const ANONYMOUS_HONOR_ROLL = [
  {
    rank: 1,
    maskedName: 'KOC @m***h',
    category: 'Làm Đẹp & Skincare',
    avatarLetter: 'M',
    avatarGradient: 'from-pink-500 to-rose-600',
    milestone: 'Top 1 Tăng Trưởng',
    achievement: 'Cán mốc 1.500+ đơn hàng',
    rating: '5.0',
    onTimeRate: '100% Đúng hạn',
    tone: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/50',
  },
  {
    rank: 2,
    maskedName: 'KOC @h***y',
    category: 'Công Nghệ & Tiện Ích',
    avatarLetter: 'H',
    avatarGradient: 'from-violet-600 to-indigo-700',
    milestone: 'Tỷ Lệ Giữ Chân Cao',
    achievement: 'Cán mốc 1.200+ đơn hàng',
    rating: '5.0',
    onTimeRate: '100% Đúng hạn',
    tone: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  },
  {
    rank: 3,
    maskedName: 'KOC @t***o',
    category: 'Thời Trang & Phong Cách',
    avatarLetter: 'T',
    avatarGradient: 'from-fuchsia-500 to-purple-600',
    milestone: 'Chăm Chỉ Nhất Tuần',
    achievement: '14 chiến dịch liên tiếp đạt 5 sao',
    rating: '5.0',
    onTimeRate: '100% Đúng hạn',
    tone: 'text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/40',
  },
  {
    rank: 4,
    maskedName: 'KOC @n***m',
    category: 'Tiêu Dùng & Đời Sống',
    avatarLetter: 'N',
    avatarGradient: 'from-emerald-500 to-teal-600',
    milestone: 'Tân Binh Tiêu Biểu',
    achievement: 'Hoàn thành 8 chiến dịch đầu tiên',
    rating: '4.9',
    onTimeRate: '100% Đúng hạn',
    tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/50',
  },
];

// Danh sách hoạt động thời gian thực (Đã ẩn danh hóa)
const LIVE_ACTIVITIES = [
  '⚡ KOC @m***a vừa nhận mẫu Set Chăm Sóc Da Cỏ Mềm 0đ',
  '🚀 KOC @h***y vừa cán mốc 1.000 đơn từ video củ sạc Tranyoo',
  '💎 KOC @t***o vừa hoàn thành video nghiệm thu đạt 5 sao',
  '📦 Trạm Bielenda vừa xuất 15 kiện serum gửi về Hà Nội & TP.HCM',
  '🎉 KOC @n***m vừa gia nhập cư dân KOCity nhận mẫu đầu tiên',
  '🔥 Brand ViSecret nâng mức hoa hồng lên 20% cho đợt chiến dịch mới',
];

// Kịch bản mẫu hữu dụng cho KOC
const HOOK_SCRIPTS = [
  {
    title: 'Hook Đập Hộp 0đ Tò Mò',
    purpose: 'Giữ chân 3 giây đầu cực mạnh',
    text: 'Vừa nhận được bưu phẩm 0đ từ KOCity gửi tận nhà, cùng mình đập hộp xem có gì mà đợt này các bạn KOC đang rần rần săn nhé!',
  },
  {
    title: 'Hook Kiểm Chứng Chân Thực',
    purpose: 'Tăng tỷ lệ tin cậy và chốt đơn',
    text: 'Nghe bảo mẫu này đang hot rần rần trên TikTok Shop, mình đã dùng thử liên tục 5 ngày qua và đây là cảm nhận chân thực nhất của mình!',
  },
  {
    title: 'Hook Trải Nghiệm Đời Thực',
    purpose: 'Né bóp tương tác khi gắn giỏ hàng',
    text: 'Có một món đồ nhỏ xíu này thôi nhưng đã cứu nguy cho góc làm việc/quy trình skincare của mình suốt cả tuần nay...',
  },
];

export const KocityWorldModal: React.FC<KocityWorldModalProps> = ({
  open,
  onClose,
  campaigns,
  currentUser,
  isNightDefault = false,
  onSelectCampaign,
}) => {
  const navigate = useNavigate();
  const { openAuth } = useSiteUI();
  const { showToast } = useAppData();
  const [activeTab, setActiveTab] = useState<'card' | 'hall' | 'brands' | 'tools'>('card');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Khóa cuộn trang nền khi mở modal
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  // Luân chuyển hoạt động trực tiếp (Live ticker)
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % LIVE_ACTIVITIES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [open]);

  const handleCopyScript = async (text: string, index: number) => {
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopiedIndex(index);
      showToast('Đã sao chép kịch bản', 'Bạn có thể dán vào kịch bản quay video ngay!', 'success');
      setTimeout(() => setCopiedIndex(null), 2500);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Không Gian Cư Dân KOCity"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 backdrop-blur-md bg-slate-950/75 animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cx(
          'relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-[28px] shadow-2xl overflow-hidden border transition-all duration-300',
          isNightDefault
            ? 'dark bg-slate-950 text-white border-violet-500/30 shadow-purple-950/70'
            : 'bg-white text-slate-900 border-slate-200 shadow-violet-500/10'
        )}
      >
        {/* HEADER CỦA PORTAL */}
        <div
          className={cx(
            'flex items-center justify-between px-5 sm:px-6 py-4 border-b backdrop-blur-md transition-colors',
            isNightDefault
              ? 'border-slate-800 bg-slate-900/95 text-white'
              : 'border-slate-100 bg-slate-50/90 text-slate-900'
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] text-white shadow-sm">
              <Icon name="verified_user" className="text-[19px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className={cx(
                    'text-sm sm:text-base font-extrabold tracking-tight',
                    isNightDefault ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Không Gian Cư Dân KOCity
                </h2>
                <span
                  className={cx(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border',
                    isNightDefault
                      ? 'bg-violet-950/90 text-violet-300 border-violet-700/50'
                      : 'bg-violet-100 text-violet-700 border-violet-200'
                  )}
                >
                  Creator Hub
                </span>
              </div>
              <p className={cx('text-[11px]', isNightDefault ? 'text-slate-300' : 'text-slate-600')}>
                Mạng lưới kết nối KOC & Brand chính hãng · 100% Không cọc phí
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className={cx(
              'flex h-8 w-8 items-center justify-center rounded-full transition cursor-pointer',
              isNightDefault
                ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                : 'bg-slate-200/70 text-slate-600 hover:text-slate-900 hover:bg-slate-300'
            )}
          >
            <Icon name="close" className="text-[17px]" />
          </button>
        </div>

        {/* BẢNG TIN HOẠT ĐỘNG TRỰC TIẾP (LIVE TICKER) - ĐẬM RÕ NÉT */}
        <div
          className={cx(
            'flex items-center gap-2 px-5 sm:px-6 py-2 border-b text-xs transition-colors',
            isNightDefault
              ? 'bg-gradient-to-r from-violet-950/90 via-slate-900 to-violet-950/90 border-violet-800/40'
              : 'bg-violet-50/80 border-violet-100'
          )}
        >
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span
            className={cx(
              'font-black shrink-0 text-[11px] tracking-wide uppercase',
              isNightDefault ? 'text-violet-300' : 'text-violet-700'
            )}
          >
            Trực tiếp:
          </span>
          <span
            className={cx(
              'truncate text-[11px] font-semibold transition-all duration-300',
              isNightDefault ? 'text-slate-100' : 'text-slate-700'
            )}
          >
            {LIVE_ACTIVITIES[tickerIndex]}
          </span>
        </div>

        {/* THANH ĐIỀU HƯỚNG TABS TINH GỌN */}
        <div
          className={cx(
            'flex border-b px-4 sm:px-6 gap-1 sm:gap-2 overflow-x-auto no-scrollbar pt-2 transition-colors',
            isNightDefault ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
          )}
        >
          {[
            { id: 'card', label: 'Thẻ Cư Dân', icon: 'badge' },
            { id: 'hall', label: 'Bảng Vinh Danh', icon: 'military_tech' },
            { id: 'brands', label: 'Trạm Brand', icon: 'storefront' },
            { id: 'tools', label: 'Kịch Bản & Hỗ Trợ', icon: 'lightbulb' },
          ].map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={cx(
                  'flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer rounded-t-lg',
                  isActive
                    ? isNightDefault
                      ? 'border-violet-400 text-white bg-violet-900/40 shadow-sm'
                      : 'border-[#7c3aed] text-[#7c3aed] bg-violet-50/80 shadow-sm'
                    : isNightDefault
                    ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                <Icon name={t.icon} className="text-[16px]" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* NỘI DUNG TỪNG TAB */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: THẺ CƯ DÂN & ĐẶC QUYỀN */}
          {activeTab === 'card' && (
            <div className="space-y-5">
              {/* Thẻ Cư Dân KOCity Digital VIP Pass - Gọn gàng thanh lịch */}
              <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-5 text-white shadow-xl ring-1 ring-violet-400/30">
                <div className="relative z-10 flex flex-col justify-between min-h-[160px]">
                  {/* Top thẻ */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] flex items-center justify-center font-black text-[11px] text-white">
                        K
                      </div>
                      <span className="font-display font-black tracking-wider text-xs text-slate-200">
                        KOCITY RESIDENT PASS
                      </span>
                    </div>

                    {/* Chip mạ vàng */}
                    <div className="h-5 w-7 rounded bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-200 border border-amber-500/40 shadow-inner flex flex-col justify-around p-0.5 opacity-90">
                      <div className="h-[1px] bg-amber-800/40 w-full" />
                      <div className="h-[1px] bg-amber-800/40 w-full" />
                    </div>
                  </div>

                  {/* Giữa thẻ: Tên KOC */}
                  <div className="my-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      {currentUser ? 'Cư Dân Chính Thức · TikTok Creator' : 'Thành Viên Khách Mời'}
                    </p>
                    <h3 className="text-lg font-black tracking-tight text-white">
                      {currentUser?.name || 'Khách Tham Quan KOCity'}
                    </h3>
                    <p className="text-xs font-mono text-violet-300">
                      {currentUser?.tiktokId ? `@${currentUser.tiktokId}` : '@koc.resident'}
                    </p>
                  </div>

                  {/* Dưới thẻ: Mã định danh & Điểm tín nhiệm */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px]">
                    <div>
                      <p className="text-[9px] text-slate-400">MÃ ĐỊNH DANH</p>
                      <p className="font-mono font-bold tracking-wider text-amber-300">
                        KOC-88{currentUser ? (currentUser.id || '9921').slice(-4).toUpperCase() : '2026'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] text-slate-400">TÍN NHIỆM</p>
                      <p className="font-bold text-emerald-400">
                        ⭐ 5.0 (Ưu tiên duyệt)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nút thao tác dưới thẻ */}
              <div className="flex justify-center">
                {currentUser ? (
                  <Button
                    variant="primary"
                    size="md"
                    className="rounded-full px-5 text-xs font-bold"
                    onClick={() => {
                      onClose();
                      navigate(ROUTES.profile);
                    }}
                  >
                    <Icon name="person" className="text-[16px]" />
                    <span>Xem Hồ Sơ & Media Kit của tôi</span>
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    className="rounded-full px-5 text-xs font-bold bg-gradient-to-r from-[#ec4899] to-[#8b5cf6]"
                    onClick={() => {
                      onClose();
                      openAuth('register', 'Đăng ký nhận thẻ cư dân KOCity để nhận mẫu 0đ');
                    }}
                  >
                    <Icon name="badge" className="text-[16px]" />
                    <span>Đăng Ký Nhận Thẻ Cư Dân 0đ</span>
                  </Button>
                )}
              </div>

              {/* 4 Trụ Cột Đặc Quyền Cư Dân - Độ tương phản WCAG AAA sắc nét */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  {
                    icon: 'redeem',
                    title: '100% Không Cọc Phí',
                    desc: 'Mẫu thử gửi tận tay miễn phí, Brand chịu 100% chi phí vận chuyển.',
                  },
                  {
                    icon: 'handshake',
                    title: 'Ưu Tiên Ghép Brand Lớn',
                    desc: 'KOC đạt tín nhiệm 5 sao được ưu tiên nhận lời mời chiến dịch độc quyền.',
                  },
                  {
                    icon: 'payments',
                    title: 'Hoa Hồng Minh Bạch',
                    desc: 'Đối soát affiliate rõ ràng theo từng đơn hàng phát sinh từ video.',
                  },
                  {
                    icon: 'copyright',
                    title: 'Bảo Toàn Quyền Video',
                    desc: 'KOC giữ toàn bộ quyền sở hữu đối với nội dung video do mình sáng tạo.',
                  },
                ].map((perk) => (
                  <div
                    key={perk.title}
                    className={cx(
                      'rounded-xl border p-3 flex items-start gap-3 transition-colors',
                      isNightDefault
                        ? 'bg-slate-900/90 border-violet-500/25 shadow-sm hover:border-violet-400/40'
                        : 'bg-white border-slate-200 shadow-sm hover:border-violet-200'
                    )}
                  >
                    <div
                      className={cx(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold',
                        isNightDefault
                          ? 'bg-violet-950 text-violet-300 border border-violet-800/50'
                          : 'bg-violet-100 text-[#7c3aed]'
                      )}
                    >
                      <Icon name={perk.icon} className="text-[18px]" />
                    </div>
                    <div>
                      <h4
                        className={cx(
                          'text-xs font-bold',
                          isNightDefault ? 'text-white' : 'text-slate-900'
                        )}
                      >
                        {perk.title}
                      </h4>
                      <p
                        className={cx(
                          'text-[11px] mt-0.5 leading-relaxed font-normal',
                          isNightDefault ? 'text-slate-200' : 'text-slate-600'
                        )}
                      >
                        {perk.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BẢNG VINH DANH (ẨN DANH & BẢO MẬT 100%) */}
          {activeTab === 'hall' && (
            <div className="space-y-4">
              <div
                className={cx(
                  'rounded-xl p-3 border text-xs flex items-start gap-2.5 transition-colors',
                  isNightDefault
                    ? 'bg-violet-950/50 border-violet-800/50 text-slate-200'
                    : 'bg-violet-50/80 border-violet-100 text-slate-700'
                )}
              >
                <Icon
                  name="lock"
                  className={cx(
                    'text-[18px] shrink-0 mt-0.5',
                    isNightDefault ? 'text-violet-300' : 'text-violet-600'
                  )}
                />
                <p className="text-[11px] leading-relaxed">
                  <b
                    className={cx(
                      'font-bold mr-1',
                      isNightDefault ? 'text-violet-200' : 'text-violet-800'
                    )}
                  >
                    Cam kết bảo mật dữ liệu:
                  </b>
                  KOCity ẩn danh thông tin cá nhân và doanh số chi tiết nhằm bảo vệ sự riêng tư của Creator, chỉ vinh danh cột mốc cống hiến và tỷ lệ uy tín.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ANONYMOUS_HONOR_ROLL.map((koc) => (
                  <div
                    key={koc.maskedName}
                    className={cx(
                      'rounded-xl border p-3.5 shadow-sm transition-colors',
                      isNightDefault
                        ? 'bg-slate-900/90 border-slate-800'
                        : 'bg-white border-slate-200'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {/* Avatar chữ cái nghệ thuật thay vì ảnh mặt thật */}
                        <div
                          className={cx(
                            'h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm bg-gradient-to-tr',
                            koc.avatarGradient
                          )}
                        >
                          {koc.avatarLetter}
                        </div>
                        <div>
                          <h4
                            className={cx(
                              'text-xs font-bold',
                              isNightDefault ? 'text-white' : 'text-slate-900'
                            )}
                          >
                            {koc.maskedName}
                          </h4>
                          <p
                            className={cx(
                              'text-[11px]',
                              isNightDefault ? 'text-slate-300' : 'text-slate-500'
                            )}
                          >
                            {koc.category}
                          </p>
                        </div>
                      </div>

                      <span className={cx('px-2 py-0.5 rounded-full text-[10px] font-black border', koc.tone)}>
                        #{koc.rank} {koc.milestone}
                      </span>
                    </div>

                    <div
                      className={cx(
                        'mt-2.5 pt-2 border-t flex items-center justify-between text-xs',
                        isNightDefault ? 'border-slate-800' : 'border-slate-100'
                      )}
                    >
                      <span
                        className={cx(
                          'text-[11px] font-semibold',
                          isNightDefault ? 'text-slate-200' : 'text-slate-700'
                        )}
                      >
                        {koc.achievement}
                      </span>
                      <span
                        className={cx(
                          'text-[11px] font-bold',
                          isNightDefault ? 'text-emerald-400' : 'text-emerald-600'
                        )}
                      >
                        ⭐ {koc.rating} ({koc.onTimeRate})
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tiêu chí xét duyệt */}
              <div
                className={cx(
                  'rounded-xl border p-3 text-xs transition-colors',
                  isNightDefault
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                )}
              >
                <p
                  className={cx(
                    'font-bold mb-1',
                    isNightDefault ? 'text-slate-100' : 'text-slate-800'
                  )}
                >
                  Tiêu chuẩn xét chọn danh hiệu KOCity:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
                  <li>Nghiệm thu video đúng hạn 5–7 ngày kể từ khi nhận mẫu 0đ.</li>
                  <li>Video đạt chuẩn kịch bản, âm thanh rõ ràng và gắn đúng giỏ hàng TikTok Shop.</li>
                  <li>Duy trì điểm đánh giá 5 sao từ Brand để giữ vững vị trí danh dự.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: TRẠM BRAND & KHO MẪU */}
          {activeTab === 'brands' && (
            <div className="space-y-3">
              <p
                className={cx(
                  'text-xs text-center font-medium',
                  isNightDefault ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                Các Brand đối tác uy tín đang cấp mẫu trải nghiệm 0đ trên KOCity:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEFAULT_BRAND_STATIONS.map((station) => (
                  <div
                    key={station.id}
                    className={cx(
                      'flex flex-col justify-between rounded-xl border p-3.5 shadow-sm transition-colors',
                      isNightDefault
                        ? 'bg-slate-900/90 border-slate-800'
                        : 'bg-white border-slate-200'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={cx(
                            'text-[11px] font-black tracking-wider uppercase',
                            isNightDefault ? 'text-violet-400' : 'text-violet-600'
                          )}
                        >
                          {station.brandName}
                        </span>
                        <span
                          className={cx(
                            'rounded-full px-2 py-0.5 text-[10px] font-bold border',
                            isNightDefault
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          )}
                        >
                          Còn {station.sampleCount} suất 0đ
                        </span>
                      </div>

                      <h4
                        className={cx(
                          'text-sm font-bold mt-0.5',
                          isNightDefault ? 'text-white' : 'text-slate-900'
                        )}
                      >
                        {station.name}
                      </h4>
                      <p
                        className={cx(
                          'text-[11px]',
                          isNightDefault ? 'text-slate-300' : 'text-slate-500'
                        )}
                      >
                        {station.category}
                      </p>
                      <p
                        className={cx(
                          'text-[11px] mt-1.5 leading-relaxed line-clamp-2',
                          isNightDefault ? 'text-slate-200' : 'text-slate-600'
                        )}
                      >
                        {station.desc}
                      </p>
                    </div>

                    <div
                      className={cx(
                        'mt-3 pt-2.5 border-t flex items-center justify-between text-xs',
                        isNightDefault ? 'border-slate-800' : 'border-slate-100'
                      )}
                    >
                      <div>
                        <span
                          className={cx(
                            'text-[11px]',
                            isNightDefault ? 'text-slate-400' : 'text-slate-500'
                          )}
                        >
                          Hoa hồng:{' '}
                        </span>
                        <span className="font-black text-[#ec4899]">{station.commission}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          const matchCamp = campaigns.find((c) =>
                            c.brandName.toLowerCase().includes(station.brandName.toLowerCase())
                          );
                          if (matchCamp && onSelectCampaign) {
                            onSelectCampaign(matchCamp.id);
                          } else {
                            document.getElementById('mau-dang-mo')?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className={cx(
                          'inline-flex items-center gap-1 font-bold text-xs cursor-pointer transition-colors',
                          isNightDefault
                            ? 'text-violet-300 hover:text-white'
                            : 'text-violet-600 hover:text-violet-800'
                        )}
                      >
                        <span>Nhận mẫu ngay</span>
                        <Icon name="arrow_forward" className="text-[14px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: KỊCH BẢN MẪU & KÊNH HỖ TRỢ (HỮU DỤNG CAO) */}
          {activeTab === 'tools' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3
                  className={cx(
                    'text-sm font-bold',
                    isNightDefault ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Bộ Kịch Bản Hook 3 Giây Đầu TikTok Shop
                </h3>
                <p
                  className={cx(
                    'text-[11px] mt-0.5',
                    isNightDefault ? 'text-slate-300' : 'text-slate-500'
                  )}
                >
                  Bấm sao chép để áp dụng nhanh khi quay video mẫu thử 0đ:
                </p>
              </div>

              {/* 3 Mẫu câu Hook kịch bản kèm nút sao chép tiện lợi */}
              <div className="space-y-2.5">
                {HOOK_SCRIPTS.map((script, idx) => (
                  <div
                    key={script.title}
                    className={cx(
                      'rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors',
                      isNightDefault
                        ? 'bg-slate-900/90 border-slate-800'
                        : 'bg-slate-50/80 border-slate-200'
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cx(
                            'font-bold text-xs',
                            isNightDefault ? 'text-white' : 'text-slate-900'
                          )}
                        >
                          {script.title}
                        </span>
                        <span
                          className={cx(
                            'px-1.5 py-0.5 rounded text-[10px] font-semibold border',
                            isNightDefault
                              ? 'bg-violet-950 text-violet-300 border-violet-800/40'
                              : 'bg-violet-100 text-violet-700 border-violet-200'
                          )}
                        >
                          {script.purpose}
                        </span>
                      </div>
                      <p
                        className={cx(
                          'text-[11px] mt-1.5 italic p-2 rounded-lg border leading-relaxed',
                          isNightDefault
                            ? 'bg-slate-950 text-slate-100 border-slate-800'
                            : 'bg-white text-slate-700 border-slate-200'
                        )}
                      >
                        "{script.text}"
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyScript(script.text, idx)}
                      className={cx(
                        'shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
                        copiedIndex === idx
                          ? 'bg-emerald-600 text-white'
                          : isNightDefault
                          ? 'bg-violet-900/80 text-violet-200 hover:bg-violet-800 border border-violet-700/50'
                          : 'bg-violet-100 text-[#7c3aed] hover:bg-violet-200'
                      )}
                    >
                      <Icon name={copiedIndex === idx ? 'check' : 'content_copy'} className="text-[15px]" />
                      <span>{copiedIndex === idx ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Hộp Zalo Cư Dân & Hotline */}
              <div
                className={cx(
                  'rounded-xl border p-4 flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors',
                  isNightDefault
                    ? 'border-blue-900/50 bg-gradient-to-r from-blue-950/60 to-slate-900'
                    : 'border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80'
                )}
              >
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="h-10 w-10 rounded-xl bg-[#0068ff] flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
                    Zalo
                  </div>
                  <div>
                    <h4
                      className={cx(
                        'text-xs sm:text-sm font-bold',
                        isNightDefault ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      Nhóm Zalo Cư Dân KOCity
                    </h4>
                    <p
                      className={cx(
                        'text-[11px]',
                        isNightDefault ? 'text-slate-300' : 'text-slate-600'
                      )}
                    >
                      Giao lưu cùng cộng đồng KOC, nhận thông báo mẫu hot và đối soát 24/7.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={ZALO_GROUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-[#0068ff] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-600 transition cursor-pointer"
                  >
                    <span>Vào Nhóm Zalo</span>
                    <Icon name="open_in_new" className="text-[14px]" />
                  </a>
                  <a
                    href={BRAND_CONTACT.hotlineHref}
                    className={cx(
                      'inline-flex items-center gap-1 rounded-full border px-3.5 py-2 text-xs font-bold transition cursor-pointer',
                      isNightDefault
                        ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    <Icon name="phone" className="text-[14px]" />
                    <span>{BRAND_CONTACT.hotline}</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
