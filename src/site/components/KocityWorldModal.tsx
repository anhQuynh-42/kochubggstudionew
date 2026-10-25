import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Campaign } from '../../types';
import { Icon, Button, cx } from '../ui';
import { ROUTES, ZALO_GROUP_URL, BRAND_CONTACT } from '../../lib/constants';
import { useSiteUI } from '../SiteUI';

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
    tagline: 'Kho tổng xuất mẫu từ Hà Nội · Miễn 100% cọc phí',
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
  {
    id: 'store-lysmile',
    name: 'Lysmile Go',
    brandName: 'LYSMILE GO',
    category: 'Chăm sóc nụ cười thông minh',
    sampleCount: 30,
    icon: 'dentistry',
    badgeBg: 'bg-sky-600',
    tagline: 'Máy tăm nước mini & Bàn chải điện sóng âm',
    desc: 'Sản phẩm hot-trend chăm sóc cá nhân, tệp người xem rộng, tỷ lệ chuyển đổi đơn cao.',
    commission: '18%',
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

// Danh sách KOC cư dân tiêu biểu trong tháng
const TOP_CREATORS = [
  {
    name: 'Lê Mai Anh',
    tiktokId: '@maianh.beauty',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    category: 'Mỹ phẩm & Skincare',
    gmv: '185.000.000đ',
    jobs: 12,
    rating: '5.0',
    badge: 'Top 1 Doanh Thu',
    rank: 1,
  },
  {
    name: 'Trần Quốc Huy',
    tiktokId: '@huytech.koc',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    category: 'Công nghệ & Phụ kiện',
    gmv: '142.000.000đ',
    jobs: 9,
    rating: '5.0',
    badge: 'Top Tăng Trưởng',
    rank: 2,
  },
  {
    name: 'Đỗ Phương Thảo',
    tiktokId: '@thaovisecret',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    category: 'Thời trang & Nội y',
    gmv: '118.000.000đ',
    jobs: 14,
    rating: '5.0',
    badge: 'KOC Chăm Chỉ Nhất',
    rank: 3,
  },
  {
    name: 'Hoàng Bảo Nam',
    tiktokId: '@namfmcg',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    category: 'Tiêu dùng & Thực phẩm',
    gmv: '96.000.000đ',
    jobs: 8,
    rating: '4.9',
    badge: 'Tân Binh Xuất Sắc',
    rank: 4,
  },
];

// Danh sách hoạt động thời gian thực
const LIVE_ACTIVITIES = [
  '⚡ KOC @nguyen.mai vừa nhận mẫu Set Chăm Sóc Da Cỏ Mềm 0đ',
  '🚀 KOC @duc.review vừa chốt 230 đơn từ video củ sạc Tranyoo',
  '💎 KOC @thanhhang vừa hoàn thành video nghiệm thu đạt 5 sao',
  '📦 Trạm Bielenda vừa xuất 15 kiện serum gửi về Hà Nội & TP.HCM',
  '🎉 KOC @minhthu vừa gia nhập cư dân KOCity nhận mẫu đầu tiên',
  '🔥 Brand ViSecret nâng mức hoa hồng lên 20% cho đợt chiến dịch mới',
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
  const [activeTab, setActiveTab] = useState<'card' | 'hall' | 'brands' | 'lab'>('card');
  const [tickerIndex, setTickerIndex] = useState(0);

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
    }, 3800);
    return () => clearInterval(interval);
  }, [open]);

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
          'relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-[32px] shadow-2xl overflow-hidden border transition-all duration-300',
          isNightDefault
            ? 'bg-slate-900 text-white border-violet-500/20 shadow-purple-950/60'
            : 'bg-white text-slate-800 border-slate-200 shadow-violet-500/10'
        )}
      >
        {/* HEADER CỦA PORTAL */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] text-white shadow-md shadow-violet-500/20">
              <Icon name="verified_user" className="text-[22px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Không Gian Cư Dân KOCity
                </h2>
                <span className="hidden sm:inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-950/80 px-2.5 py-0.5 text-[11px] font-bold text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50">
                  Creator Network
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mạng lưới Nano & Micro KOC kết nối Brand nhận mẫu 0đ chính hãng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* BẢNG TIN HOẠT ĐỘNG TRỰC TIẾP (LIVE TICKER) */}
        <div className="flex items-center gap-2 px-5 sm:px-7 py-2 bg-gradient-to-r from-violet-50 via-pink-50 to-amber-50 dark:from-violet-950/40 dark:via-purple-950/30 dark:to-slate-900 border-b border-violet-100/60 dark:border-violet-900/30 text-xs">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-bold text-violet-700 dark:text-violet-300 shrink-0">Trực tiếp:</span>
          <span className="truncate font-medium text-slate-700 dark:text-slate-300 transition-all duration-300">
            {LIVE_ACTIVITIES[tickerIndex]}
          </span>
        </div>

        {/* THANH ĐIỀU HƯỚNG TABS */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 sm:px-7 gap-1 sm:gap-2 overflow-x-auto no-scrollbar pt-2 bg-white dark:bg-slate-900">
          {[
            { id: 'card', label: 'Thẻ Cư Dân & Đặc Quyền', icon: 'badge' },
            { id: 'hall', label: 'Bảng Vinh Danh KOC', icon: 'military_tech' },
            { id: 'brands', label: 'Trạm Brand & Kho Mẫu', icon: 'storefront' },
            { id: 'lab', label: 'Phòng Lab Sáng Tạo', icon: 'lightbulb' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={cx(
                'flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer rounded-t-xl',
                activeTab === t.id
                  ? 'border-[#7c3aed] text-[#7c3aed] dark:text-violet-300 bg-violet-50/60 dark:bg-violet-950/30'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <Icon name={t.icon} className="text-[17px]" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* NỘI DUNG TỪNG TAB */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* TAB 1: THẺ CƯ DÂN & ĐẶC QUYỀN */}
          {activeTab === 'card' && (
            <div className="space-y-6">
              {/* Thẻ Cư Dân KOCity Holographic VIP Card */}
              <div className="relative mx-auto max-w-lg overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950 p-6 text-white shadow-2xl ring-1 ring-amber-400/40">
                {/* Hoa văn chìm */}
                <div className="absolute top-0 right-0 -mr-10 -mt-10 h-44 w-44 rounded-full bg-gradient-to-bl from-pink-500/20 to-violet-500/0 blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-44 w-44 rounded-full bg-gradient-to-tr from-violet-600/25 to-transparent blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between min-h-[200px]">
                  {/* Top thẻ: Logo & Chip */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] flex items-center justify-center font-black text-xs text-white">
                        K
                      </div>
                      <span className="font-display font-black tracking-wider text-sm bg-gradient-to-r from-white via-slate-100 to-violet-200 bg-clip-text text-transparent">
                        KOCITY RESIDENT PASS
                      </span>
                    </div>

                    {/* Chip thẻ mạ vàng */}
                    <div className="h-7 w-9 rounded-md bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-200 border border-amber-500/50 shadow-inner flex flex-col justify-around p-1 opacity-90">
                      <div className="h-[1px] bg-amber-700/40 w-full" />
                      <div className="h-[1px] bg-amber-700/40 w-full" />
                    </div>
                  </div>

                  {/* Middle thẻ: Tên & ID TikTok */}
                  <div className="my-5">
                    <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
                      {currentUser ? 'Cư Dân Chính Thức · TikTok Creator' : 'Thành Viên Khách Mời · KOC Tiềm Năng'}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                      {currentUser?.name || 'Khách Tham Quan KOCity'}
                    </h3>
                    <p className="text-sm font-mono text-violet-300 mt-0.5">
                      {currentUser?.tiktokId ? `@${currentUser.tiktokId}` : '@koc.resident'}
                    </p>
                  </div>

                  {/* Bottom thẻ: Mã ID cư dân & Điểm tín nhiệm */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400">MÃ ĐỊNH DANH</p>
                      <p className="font-mono font-bold tracking-widest text-amber-300">
                        KOC-88{currentUser ? (currentUser.id || '9921').slice(-4).toUpperCase() : '2026'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">ĐIỂM TÍN NHIỆM</p>
                      <p className="font-bold text-emerald-400 flex items-center justify-end gap-1">
                        <span>⭐ 5.0</span>
                        <span className="text-[10px] text-slate-300">(Ưu tiên duyệt mẫu)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nút thao tác dưới thẻ */}
              <div className="flex justify-center gap-3">
                {currentUser ? (
                  <Button
                    variant="primary"
                    size="md"
                    className="rounded-full px-6 font-bold"
                    onClick={() => {
                      onClose();
                      navigate(ROUTES.profile);
                    }}
                  >
                    <Icon name="person" className="text-[18px]" />
                    <span>Xem Hồ Sơ & Media Kit của tôi</span>
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    className="rounded-full px-6 font-bold bg-gradient-to-r from-[#ec4899] to-[#8b5cf6]"
                    onClick={() => {
                      onClose();
                      openAuth('register', 'Đăng ký nhận thẻ cư dân KOCity để nhận mẫu 0đ');
                    }}
                  >
                    <Icon name="badge" className="text-[18px]" />
                    <span>Đăng Ký Nhận Thẻ Cư Dân KOC 0đ</span>
                  </Button>
                )}
              </div>

              {/* 4 Trụ Cột Đặc Quyền Cư Dân */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  {
                    icon: 'redeem',
                    title: '100% Không Cọc Phí',
                    desc: 'Mẫu thử được gửi tận nhà hoàn toàn miễn phí, Brand chịu 100% chi phí vận chuyển.',
                    tone: 'from-emerald-500/10 to-transparent text-emerald-600 dark:text-emerald-400',
                  },
                  {
                    icon: 'handshake',
                    title: 'Ưu Tiên Kết Nối Brand Lớn',
                    desc: 'KOC đạt tín nhiệm 5 sao được ưu tiên ghép cặp các chiến dịch hoa hồng cao từ nhãn hàng uy tín.',
                    tone: 'from-violet-500/10 to-transparent text-violet-600 dark:text-violet-400',
                  },
                  {
                    icon: 'payments',
                    title: 'Hoa Hồng Đối Soát Minh Bạch',
                    desc: 'Nhận hoa hồng affiliate theo từng đơn hàng phát sinh, báo cáo rõ ràng không cắt xén.',
                    tone: 'from-pink-500/10 to-transparent text-pink-600 dark:text-pink-400',
                  },
                  {
                    icon: 'copyright',
                    title: 'Bảo Toàn Quyền Sáng Tạo',
                    desc: 'KOC giữ toàn quyền sở hữu đối với nội dung video do mình sản xuất theo brief.',
                    tone: 'from-amber-500/10 to-transparent text-amber-600 dark:text-amber-400',
                  },
                ].map((perk) => (
                  <div
                    key={perk.title}
                    className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/40 flex items-start gap-3.5"
                  >
                    <div className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br', perk.tone)}>
                      <Icon name={perk.icon} className="text-[20px]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{perk.title}</h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{perk.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BẢNG VINH DANH KOC */}
          {activeTab === 'hall' && (
            <div className="space-y-4">
              <div className="text-center max-w-lg mx-auto mb-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Bảng Vinh Danh Cư Dân KOC Xuất Sắc
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Vinh danh các Creator có tỷ lệ trả bài đúng hạn, chuyển đổi đơn cao và được Brand đánh giá 5 sao.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {TOP_CREATORS.map((koc) => (
                  <div
                    key={koc.tiktokId}
                    className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 shadow-sm hover:shadow-md transition"
                  >
                    {/* Rank Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                      <span>#{koc.rank}</span>
                      <span>{koc.badge}</span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <img
                        src={koc.avatar}
                        alt={koc.name}
                        className="h-13 w-13 rounded-2xl object-cover ring-2 ring-violet-200 dark:ring-violet-800"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{koc.name}</h4>
                        <p className="text-xs font-mono text-violet-600 dark:text-violet-400">{koc.tiktokId}</p>
                        <span className="inline-block mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">
                          {koc.category}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3.5 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700/60 rounded-xl bg-slate-50 dark:bg-slate-900/50 py-2 text-center text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400">Doanh thu GMV</p>
                        <p className="font-bold text-violet-600 dark:text-violet-400 mt-0.5">{koc.gmv}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Job hoàn thành</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{koc.jobs} chiến dịch</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Đánh giá Brand</p>
                        <p className="font-bold text-amber-500 mt-0.5">⭐ {koc.rating}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tiêu chí xét duyệt */}
              <div className="rounded-2xl border border-violet-100 dark:border-violet-900/40 bg-violet-50/50 dark:bg-violet-950/20 p-4 text-xs text-slate-600 dark:text-slate-400">
                <p className="font-bold text-violet-800 dark:text-violet-300 flex items-center gap-1.5 mb-1">
                  <Icon name="verified" className="text-[16px]" />
                  <span>Cách để lọt vào Bảng Vinh Danh KOCity:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Trả video nghiệm thu đúng hạn trong vòng 5–7 ngày kể từ khi nhận mẫu.</li>
                  <li>Video đạt chất lượng ánh sáng, âm thanh tốt và tuân thủ brief nhãn hàng.</li>
                  <li>Duy trì điểm đánh giá 5 sao từ Brand để mở khóa các chiến dịch booking độc quyền.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: TRẠM BRAND & KHO MẪU */}
          {activeTab === 'brands' && (
            <div className="space-y-4">
              <div className="text-center max-w-lg mx-auto mb-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Trạm Thương Hiệu & Kho Mẫu Đang Cấp
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Các Brand chính hãng tài trợ 100% sản phẩm trải nghiệm và hoa hồng trực tiếp cho KOCity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {DEFAULT_BRAND_STATIONS.map((station) => (
                  <div
                    key={station.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 shadow-sm hover:border-violet-300 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black tracking-wider uppercase text-violet-600 dark:text-violet-400">
                          {station.brandName}
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          <span>Mẫu 0đ: Còn {station.sampleCount} suất</span>
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {station.name}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{station.category}</p>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                        {station.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400">Hoa hồng: </span>
                        <span className="font-extrabold text-[#ec4899]">{station.commission}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          // Tìm chiến dịch của brand hoặc cuộn tới danh sách
                          const matchCamp = campaigns.find((c) =>
                            c.brandName.toLowerCase().includes(station.brandName.toLowerCase())
                          );
                          if (matchCamp && onSelectCampaign) {
                            onSelectCampaign(matchCamp.id);
                          } else {
                            document.getElementById('mau-dang-mo')?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="inline-flex items-center gap-1 font-bold text-violet-600 dark:text-violet-400 hover:text-violet-800 cursor-pointer"
                      >
                        <span>Nhận mẫu Brand</span>
                        <Icon name="arrow_forward" className="text-[16px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PHÒNG LAB SÁNG TẠO & HỖ TRỢ */}
          {activeTab === 'lab' && (
            <div className="space-y-4">
              <div className="text-center max-w-lg mx-auto mb-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Phòng Lab Sáng Tạo & Cộng Đồng KOC
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Công thức kịch bản video TikTok Shop triệu view và kênh hỗ trợ trực tiếp cho cư dân.
                </p>
              </div>

              {/* 3 Kịch bản mẫu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    title: 'Kịch bản Đập Hộp 0đ',
                    tag: 'Giữ chân 3s đầu',
                    desc: 'Mở đầu bằng việc nhận bưu phẩm 0đ từ KOCity, tạo tò mò người xem bấm vào giỏ hàng ngay.',
                  },
                  {
                    title: 'Kịch bản Trước & Sau',
                    tag: 'Tỷ lệ chốt đơn cao',
                    desc: 'So sánh chân thực trước và sau 5 ngày sử dụng mẫu thử, tạo độ tin cậy tuyệt đối.',
                  },
                  {
                    title: 'Kịch bản Tình Huống Đời Thực',
                    tag: 'Né bóp tương tác',
                    desc: 'Lồng ghép khéo léo tính năng sản phẩm vào tình huống sinh hoạt hàng ngày không gây phản cảm.',
                  },
                ].map((kb) => (
                  <div
                    key={kb.title}
                    className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 flex flex-col justify-between"
                  >
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                        {kb.tag}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{kb.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{kb.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hộp liên kết Zalo Cư Dân & Hotline */}
              <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-slate-900 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="h-12 w-12 rounded-2xl bg-[#0068ff] flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg shadow-blue-500/20">
                    Zalo
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Nhóm Zalo Cư Dân KOCity Chính Thức
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Giao lưu cùng hơn 1.200 KOC, nhận thông báo chiến dịch hot và hỗ trợ đối soát 24/7.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <a
                    href={ZALO_GROUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#0068ff] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-600 transition cursor-pointer"
                  >
                    <span>Vào Nhóm Zalo</span>
                    <Icon name="open_in_new" className="text-[16px]" />
                  </a>
                  <a
                    href={BRAND_CONTACT.hotlineHref}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Icon name="phone" className="text-[16px]" />
                    <span>Hotline: {BRAND_CONTACT.hotline}</span>
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
