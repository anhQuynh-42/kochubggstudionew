import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Campaign, LiveActivityItem } from '../../types';
import { calculateDaysLeft, useAppData } from '../../state/AppDataContext';
import { getCommissionLabel, getScarcity } from '../../lib/campaignDisplay';
import { getApplicationProgress } from '../../lib/applicationStatus';
import { LIVE_ACTION_TEXT } from '../../lib/liveActivity';
import { ROUTES, ZALO_GROUP_URL } from '../../lib/constants';
import { useSiteUI } from '../SiteUI';
import { CampaignCard } from '../components/CampaignCard';
import { HeroImageSheet } from '../components/HeroImageSheet';
import { KocitySkyline } from '../components/KocitySkyline';
import { Badge, Button, Chip, EmptyState, Icon, SectionTitle, Sheet, cx } from '../ui';

type SortKey = 'popular' | 'commission' | 'spots' | 'ending';

const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Mỹ phẩm', label: 'Mỹ phẩm' },
  { id: 'Chăm sóc cá nhân', label: 'Chăm sóc cá nhân' },
  { id: 'công nghệ', label: 'Công nghệ' },
  { id: 'gia dụng', label: 'Gia dụng' },
  { id: 'Thời trang', label: 'Thời trang' },
  { id: 'F&B', label: 'Ăn uống' },
];
const SORTS: Array<{ id: SortKey; label: string }> = [
  { id: 'popular', label: 'Phổ biến' },
  { id: 'commission', label: 'Hoa hồng cao' },
  { id: 'spots', label: 'Còn nhiều suất' },
  { id: 'ending', label: 'Sắp hết hạn' },
];
const FOLLOWER_TIERS = [
  { id: 0, label: 'Mọi quy mô' },
  { id: 1, label: 'Kênh từ 1K' },
  { id: 5, label: 'Kênh từ 5K' },
  { id: 20, label: 'Kênh từ 20K' },
];
const HOW_IT_WORKS = [
  { icon: 'touch_app', title: 'Chọn mẫu bạn thích', desc: 'Bấm “Nhận mẫu ngay”, điền 3 bước ngắn. Lần sau chỉ cần 1 chạm.' },
  { icon: 'local_shipping', title: 'Brand chọn & gửi mẫu 0đ', desc: 'Được chọn là mẫu về tận nhà, có mã vận đơn để theo dõi.' },
  { icon: 'smart_display', title: 'Lên video, nhận hoa hồng', desc: 'Đăng video theo brief, gắn giỏ hàng — có đơn là có hoa hồng.' },
];

// Chỉ dùng thông tin đã có trên website (không thêm cam kết mới)
const FAQ = [
  { q: 'KOCity là gì?', a: 'Nền tảng kết nối Nano & Micro KOC TikTok với Brand: bạn đăng ký nhận mẫu, làm video theo brief và nhận hoa hồng khi có đơn.' },
  { q: 'Nhận mẫu có mất phí không?', a: 'Không. Chiến dịch có tag “Mẫu 0đ” gửi mẫu miễn phí tận nhà cho KOC được Brand chọn.' },
  { q: 'Kênh của mình cần bao nhiêu followers?', a: 'Mỗi chiến dịch ghi rõ yêu cầu kênh trên thẻ. Phần lớn chỉ cần từ 1.000 followers.' },
  { q: 'Ai quyết định mình có được chọn không?', a: 'Brand trực tiếp xem kênh và quyết định. Kết quả hiện trong mục Đơn của tôi và trong thông báo của bạn.' },
  { q: 'Nhận mẫu xong mình cần làm gì?', a: 'Quay video theo brief, gắn giỏ hàng của Brand rồi nộp link video trong mục Đơn của tôi — thường trong 5–7 ngày sau khi nhận hàng.' },
];

const PERSONAS = [
  { title: "Nano KOC (từ 1K followers)", desc: "Kênh nhỏ vẫn nhận được mẫu thật và có thêm thu nhập từ hoa hồng theo đơn." },
  { title: "Micro KOC", desc: "Chọn chiến dịch đúng ngách, chủ động lịch lên video và theo dõi kết quả rõ ràng." },
  { title: "Creator theo ngách", desc: "Làm đẹp, thời trang, công nghệ, gia dụng... — chọn Brand phù hợp phong cách của bạn." },
];

// Chỉ dùng những gì website đang thực sự cung cấp
const REASONS = [
  "Nhận mẫu sản phẩm 0đ, giao tận nhà.",
  "Phần lớn chiến dịch chỉ cần kênh từ 1.000 followers.",
  "Hoa hồng theo từng đơn, hiển thị rõ trên mỗi chiến dịch.",
  "Theo dõi đơn như đơn hàng: Brand xem → gửi mẫu → lên bài.",
  "Lưu thông tin một lần, lần sau nộp đơn chỉ 1 chạm.",
  "Nhóm Zalo KOC hỗ trợ về brief, duyệt đơn và vận đơn.",
];

/** Nhãn trắng nổi trên ảnh ở phần đầu trang */
const FloatLabel: React.FC<{ icon: string; className?: string; children: React.ReactNode }> = ({ icon, className, children }) => (
  <span className={cx("absolute z-10 hidden items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-lg sm:inline-flex sm:text-sm", className)}>
    <Icon name={icon} className="text-[18px] text-[#7c3aed]" />
    {children}
  </span>
);

const commissionNumber = (c: Campaign) => parseInt((getCommissionLabel(c) || '0').match(/\d+/)?.[0] || '0', 10);
const followerRequirementK = (c: Campaign) => {
  const m = c.followerRequirement.match(/(\d+)[.,]000|(\d+)\s*K/i);
  return m ? parseInt(m[1] || m[2], 10) : 0;
};

export const HomePage: React.FC = () => {
  const { campaigns, currentUser, isAdmin, myApplications, bookmarkedIds, toggleBookmark, liveActivity, heroImage } = useAppData();
  const { requestApply, getExistingApplication, openAuth } = useSiteUI();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  // Từ khóa gõ ở thanh tìm kiếm trên cùng
  useEffect(() => setQuery(searchParams.get('q') || ''), [searchParams]);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<SortKey>('popular');
  const [tier, setTier] = useState(0);
  const [savedOnly, setSavedOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [heroSheetOpen, setHeroSheetOpen] = useState(false);
  const activeFilters = (sort !== 'popular' ? 1 : 0) + (tier ? 1 : 0) + (savedOnly ? 1 : 0);

  // Chế độ Ngày / Đêm cho khối banner KOCity (lưu vào localStorage)
  const [isNight, setIsNight] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kocity_hero_theme') === 'night';
    } catch {
      return false;
    }
  });

  const toggleNight = () => {
    setIsNight((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('kocity_hero_theme', next ? 'night' : 'day');
      } catch {}
      return next;
    });
  };

  // Link "Cách hoạt động" từ menu → cuộn tới đúng mục
  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [location.hash]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns
      .filter((c) => {
        if (category !== 'all' && !c.category.toLowerCase().includes(category.toLowerCase())) return false;
        if (q && ![c.title, c.brandName, c.category].some((s) => s.toLowerCase().includes(q))) return false;
        if (tier && followerRequirementK(c) > tier) return false;
        if (savedOnly && !bookmarkedIds.includes(c.id)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === 'commission') return commissionNumber(b) - commissionNumber(a);
        if (sort === 'spots') return getScarcity(b).spotsLeft - getScarcity(a).spotsLeft;
        if (sort === 'ending') return calculateDaysLeft(a.endDate, a.daysLeft) - calculateDaysLeft(b.endDate, b.daysLeft);
        return 0;
      });
  }, [campaigns, category, query, tier, savedOnly, bookmarkedIds, sort]);

  const resetFilters = () => {
    setQuery('');
    setCategory('all');
    setSort('popular');
    setTier(0);
    setSavedOnly(false);
  };

  const pendingCount = myApplications.filter((a) => getApplicationProgress(a).selection === 'pending').length;
  // Ảnh & dòng hoạt động cho phần đầu trang — chỉ dùng dữ liệu thật
  const heroSideImage = campaigns[1]?.productHeroImage || heroImage;
  const personaImages = [0, 1, 2].map((i) => campaigns[i + 2]?.productHeroImage || campaigns[i]?.productHeroImage || heroImage);
  const heroFeed = (liveActivity.length > 0
    ? liveActivity.slice(0, 3).map((a) => ({ key: a.id, title: a.displayName, sub: `${a.brandName} · ${a.dateLabel || "mới"}`, image: campaigns.find((c) => c.brandName === a.brandName)?.brandLogo || heroImage }))
    : campaigns.slice(0, 3).map((c) => ({ key: c.id, title: c.brandName, sub: `Còn ${getScarcity(c).spotsLeft} suất · ${getCommissionLabel(c) || "Mẫu 0đ"}`, image: c.brandLogo })));
  const heroStats = [
    { value: String(campaigns.length), label: 'Chiến dịch đang mở' },
    { value: campaigns.reduce((n, c) => n + getScarcity(c).spotsLeft, 0).toLocaleString('vi-VN'), label: 'Suất nhận mẫu còn lại' },
    { value: String(new Set(campaigns.map((c) => c.brandName)).size), label: 'Brand đang tuyển KOC' },
    { value: `${Math.max(0, ...campaigns.map(commissionNumber))}%`, label: 'Hoa hồng cao nhất' },
  ];
  const selectedCount = myApplications.filter((a) => {
    const p = getApplicationProgress(a);
    return p.selection === 'selected' && p.video !== 'posted';
  }).length;

  return (
    <div className="w-full">
      {/* ===== Hero KOCity Creator (Full màn hình, hỗ trợ Bật/Tắt đèn Bầu trời đêm) ===== */}
      <section
        className={cx(
          'relative w-full overflow-hidden transition-all duration-700 ease-in-out border-b',
          isNight
            ? 'border-violet-950/80 bg-[linear-gradient(135deg,#0a0618_0%,#160c33_35%,#1f114a_70%,#0f0a24_100%)] text-white'
            : 'border-violet-100/80 bg-[linear-gradient(135deg,#fde7f3_0%,#ede9fe_35%,#dbeafe_65%,#fef3c7_100%)]'
        )}
      >
        {/* Nút công tắc Tắt/Bật đèn (Day/Night switch) */}
        <div className="absolute right-3.5 top-3.5 z-20 sm:right-6 sm:top-5">
          <button
            type="button"
            onClick={toggleNight}
            aria-label={isNight ? 'Bật đèn (Chế độ ban ngày)' : 'Tắt đèn (Chế độ bầu trời đêm)'}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-300 cursor-pointer shadow-xs backdrop-blur-md ring-1',
              isNight
                ? 'bg-violet-950/70 text-amber-300 ring-amber-300/40 hover:bg-violet-900/80 hover:text-amber-200 hover:shadow-amber-500/20'
                : 'bg-white/85 text-slate-700 ring-violet-200/90 hover:bg-white hover:text-slate-950 hover:shadow-violet-500/15'
            )}
          >
            <Icon
              name={isNight ? 'light_mode' : 'dark_mode'}
              className={cx('text-[16px] transition-transform duration-300', isNight ? 'text-amber-300 rotate-45' : 'text-violet-600')}
            />
            <span className="font-semibold">{isNight ? 'Bật đèn' : 'Tắt đèn'}</span>
          </button>
        </div>

        {/* Ánh sáng mờ nghệ thuật */}
        <div
          aria-hidden
          className={cx(
            'pointer-events-none absolute -left-24 top-6 h-72 w-72 rounded-full blur-3xl transition-all duration-700',
            isNight ? 'bg-violet-600/25' : 'bg-pink-300/35'
          )}
        />
        <div
          aria-hidden
          className={cx(
            'pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full blur-3xl transition-all duration-700',
            isNight ? 'bg-fuchsia-600/20' : 'bg-indigo-300/35'
          )}
        />

        {/* Bầu trời ngàn sao lấp lánh (sao đứng yên, chỉ sao băng chuyển động) */}
        {isNight && (
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <style>{`
              @keyframes starTwinkle1 {
                0%, 100% { opacity: 0.25; }
                50% { opacity: 1; filter: drop-shadow(0 0 4px #ffffff); }
              }
              @keyframes starTwinkle2 {
                0%, 100% { opacity: 0.9; filter: drop-shadow(0 0 3px #fef08a); }
                50% { opacity: 0.2; }
              }
              @keyframes starTwinkle3 {
                0%, 100% { opacity: 0.3; }
                40% { opacity: 1; filter: drop-shadow(0 0 4px #a5f3fc); }
                75% { opacity: 0.15; }
              }
              @keyframes shootingStarFlight {
                0% {
                  transform: translate(0, 0) rotate(-26deg);
                  opacity: 0;
                }
                3% {
                  opacity: 1;
                }
                14% {
                  transform: translate(-340px, 170px) rotate(-26deg);
                  opacity: 0;
                }
                100% {
                  transform: translate(-340px, 170px) rotate(-26deg);
                  opacity: 0;
                }
              }
              .kc-star-twinkle-1 { animation: starTwinkle1 2.8s ease-in-out infinite; }
              .kc-star-twinkle-2 { animation: starTwinkle2 3.4s ease-in-out infinite 0.7s; }
              .kc-star-twinkle-3 { animation: starTwinkle3 4.1s ease-in-out infinite 1.4s; }
              .kc-shooting-star {
                animation: shootingStarFlight 6.5s cubic-bezier(0.25, 0.1, 0.25, 1) infinite 1.5s;
              }
            `}</style>

            {/* SAO BĂNG: VẬT THỂ DUY NHẤT CHUYỂN ĐỘNG TRÊN BẦU TRỜI */}
            <div
              className="kc-shooting-star absolute right-24 top-5 h-[2px] w-28 rounded-full bg-gradient-to-r from-transparent via-fuchsia-300 to-white"
              style={{ filter: 'drop-shadow(0 0 4px #ffffff)' }}
            />

            {/* CÁC NGÔI SAO: ĐỨNG YÊN 100% TẠI CHỖ, CHỈ LẤP LÁNH (TWINKLE) */}
            <svg className="absolute inset-0 h-full w-full" fill="none">
              <circle cx="8%" cy="14%" r="1.4" fill="#ffffff" className="kc-star-twinkle-1" />
              <circle cx="18%" cy="22%" r="1.2" fill="#fef08a" className="kc-star-twinkle-2" />
              <circle cx="28%" cy="12%" r="1.5" fill="#ffffff" className="kc-star-twinkle-3" />
              <circle cx="38%" cy="20%" r="1.2" fill="#a5f3fc" className="kc-star-twinkle-1" />
              <circle cx="48%" cy="14%" r="1.4" fill="#ffffff" className="kc-star-twinkle-2" />
              <circle cx="58%" cy="24%" r="1.2" fill="#fef08a" className="kc-star-twinkle-3" />
              <circle cx="68%" cy="12%" r="1.5" fill="#ffffff" className="kc-star-twinkle-1" />
              <circle cx="78%" cy="22%" r="1.2" fill="#a5f3fc" className="kc-star-twinkle-2" />
              <circle cx="88%" cy="14%" r="1.4" fill="#ffffff" className="kc-star-twinkle-3" />
              <circle cx="94%" cy="24%" r="1.2" fill="#fbcfe8" className="kc-star-twinkle-1" />

              {/* 2 ngôi sao 4 cánh đứng yên lấp lánh */}
              <path d="M 150,30 L 151.5,34 L 155,35.5 L 151.5,37 L 150,41 L 148.5,37 L 145,35.5 L 148.5,34 Z" fill="#ffffff" className="kc-star-twinkle-1" />
              <path d="M 1080,32 L 1081.5,36 L 1085,37.5 L 1081.5,39 L 1080,43 L 1078.5,39 L 1075,37.5 L 1078.5,36 Z" fill="#fef08a" className="kc-star-twinkle-2" />
            </svg>
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-6 pb-2 text-center sm:px-6 sm:pt-8 sm:pb-3 lg:pt-9 lg:pb-4">
          {currentUser && !isAdmin && (
            <div
              className={cx(
                'mb-3 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full px-3.5 py-1 text-xs font-medium shadow-sm backdrop-blur transition-colors sm:mb-3.5 sm:py-1.5 sm:text-sm',
                isNight
                  ? 'bg-white/10 text-white ring-1 ring-white/15'
                  : 'bg-white/90 text-slate-800 ring-1 ring-violet-200/80'
              )}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-[11px] font-bold text-white uppercase sm:h-6 sm:w-6 sm:text-xs">
                {currentUser.name ? currentUser.name.charAt(0) : 'K'}
              </span>
              <span>Chào <strong className={cx('font-semibold', isNight ? 'text-white' : 'text-slate-900')}>{currentUser.name}</strong> 👋</span>
              <span className={isNight ? 'text-white/30' : 'text-slate-300'}>•</span>
              <span className={isNight ? 'text-violet-300' : 'text-violet-700'}><strong>{pendingCount}</strong> chờ duyệt</span>
              <span className={isNight ? 'text-white/30' : 'text-slate-300'}>·</span>
              <span className={isNight ? 'text-fuchsia-300' : 'text-fuchsia-700'}><strong>{selectedCount}</strong> đang làm</span>
              <Link
                to={ROUTES.myApplications}
                className={cx(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold transition',
                  isNight ? 'bg-white/15 text-violet-200 hover:bg-white/25' : 'bg-violet-100 text-violet-800 hover:bg-violet-200'
                )}
              >
                Xem đơn <Icon name="arrow_forward" className="text-[13px]" />
              </Link>
            </div>
          )}

          <h1
            className={cx(
              'font-display text-2xl font-bold tracking-tight transition-colors duration-500 sm:text-3xl md:text-4xl lg:text-5xl',
              isNight
                ? 'text-white drop-shadow-[0_0_25px_rgba(168,85,247,0.7)]'
                : 'text-[#4c1d95]'
            )}
          >
            KOCity Creator
          </h1>
          <p
            className={cx(
              'mx-auto mt-2 max-w-xl text-xs leading-relaxed transition-colors duration-500 sm:mt-2.5 sm:text-sm md:text-base',
              isNight ? 'text-slate-300' : 'text-slate-600'
            )}
          >
            Nền tảng kết nối Nano & Micro KOC TikTok với Brand. Nhận mẫu 0đ tận nhà, lên video theo brief và nhận hoa hồng minh bạch theo từng đơn.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 sm:mt-5 sm:gap-3">
            <Button
              variant="primary"
              size="md"
              className="rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] px-5 shadow-md shadow-pink-500/20 hover:opacity-95 sm:h-11 sm:px-7"
              onClick={() => (currentUser ? document.getElementById('mau-dang-mo')?.scrollIntoView({ behavior: 'smooth' }) : openAuth('register'))}
            >
              {currentUser ? 'Khám phá mẫu 0đ ngay' : 'Tham gia ngay'}
            </Button>
            {currentUser && !isAdmin && (
              <Button
                variant="outline"
                size="md"
                className={cx(
                  'rounded-full px-4 backdrop-blur sm:h-11 sm:px-6',
                  isNight
                    ? 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20'
                    : 'bg-white/90 text-slate-800 ring-1 ring-violet-200 hover:bg-white'
                )}
                onClick={() => navigate(ROUTES.myApplications)}
              >
                Đơn của tôi {pendingCount + selectedCount > 0 ? `(${pendingCount + selectedCount})` : ''}
              </Button>
            )}

            {/* Nút công tắc Bật/Tắt đèn ở ngay trung tâm cạnh nút Tham gia ngay */}
            <button
              type="button"
              onClick={toggleNight}
              aria-label={isNight ? 'Bật đèn ban ngày' : 'Tắt đèn ngắm thành phố đêm'}
              className={cx(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 cursor-pointer shadow-sm backdrop-blur-md ring-1 sm:h-11 sm:px-5 sm:text-sm',
                isNight
                  ? 'bg-amber-400/20 text-amber-200 ring-amber-300/50 hover:bg-amber-400/30'
                  : 'bg-white/95 text-violet-900 ring-violet-200 hover:bg-white hover:text-violet-950'
              )}
            >
              <Icon
                name={isNight ? 'light_mode' : 'dark_mode'}
                className={cx('text-[18px] transition-transform duration-300', isNight ? 'text-amber-300 rotate-45' : 'text-violet-600')}
              />
              <span>{isNight ? 'Bật đèn' : 'Tắt đèn (Đêm sao)'}</span>
            </button>
          </div>

          {/* 4 Số liệu nhanh dạng 1 hàng siêu gọn */}
          <div
            className={cx(
              'mx-auto mt-5 max-w-2xl border-t pt-4 transition-colors duration-500 sm:mt-6',
              isNight ? 'border-violet-500/20' : 'border-violet-200/50'
            )}
          >
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
              {heroStats.map((s) => (
                <div
                  key={s.label}
                  className={cx(
                    'card-fx flex flex-col-reverse rounded-xl px-2.5 py-1.5 text-center shadow-xs backdrop-blur transition-all duration-500 sm:px-3 sm:py-2',
                    isNight
                      ? 'bg-white/10 text-slate-300 ring-1 ring-white/15 shadow-purple-950/40'
                      : 'bg-white/85 text-slate-500 ring-1 ring-violet-100'
                  )}
                >
                  <dt className={cx('text-[10px] sm:text-[11px]', isNight ? 'text-slate-300' : 'text-slate-500')}>{s.label}</dt>
                  <dd className={cx('font-display text-base font-bold sm:text-lg', isNight ? 'text-fuchsia-300' : 'text-[#6d28d9]')}>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Dải thành phố KOCity Silhouette (Phương án 3: 2 lớp + ánh đèn chuyển động + hỗ trợ chế độ đêm) */}
        <KocitySkyline isNight={isNight} className="-mb-[1px]" />
      </section>

      {/* Phần còn lại của trang (nằm trong container max-w-6xl căn giữa) */}
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6">
        {liveActivity.length > 0 && <LiveTicker items={liveActivity} />}

        {/* ===== Danh sách mẫu (đẩy lên ngay dưới Hero & LiveTicker) ===== */}
        <section className="pt-6 sm:pt-10">
          <SectionTitle id="mau-dang-mo" title="Mẫu đang mở" subtitle={`${visible.length} chiến dịch`} />

          <div className="sticky top-16 z-30 -mx-4 mt-3 bg-[#fafafc]/90 px-4 pb-3 pt-2 backdrop-blur-md sm:-mx-6 sm:px-6">
            <div className="flex gap-2">
              <label className="relative flex-1">
                <span className="sr-only">Tìm chiến dịch</span>
                <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm brand, sản phẩm..."
                  className="h-11 w-full rounded-2xl bg-white pl-10 pr-3 text-base text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] sm:text-sm"
                />
              </label>
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                aria-haspopup="dialog"
                className="relative inline-flex h-11 shrink-0 items-center gap-1.5 rounded-2xl bg-white px-3.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:ring-violet-300 cursor-pointer"
              >
                <Icon name="tune" className="text-[20px]" />
                <span className="hidden sm:inline">Lọc & sắp xếp</span>
                {activeFilters > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8b5cf6] px-1 text-[10px] font-bold text-white">
                    {activeFilters}
                  </span>
                )}
              </button>
            </div>
            <div className="no-scrollbar -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {CATEGORIES.map((c) => (
                <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="mt-2">
              <EmptyState
                icon="search_off"
                title="Chưa có chiến dịch phù hợp"
                description="Thử bỏ bớt bộ lọc hoặc đổi từ khóa nhé."
                action={<Button variant="dark" onClick={resetFilters}>Xóa bộ lọc</Button>}
              />
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {visible.map((c) => {
                const applied = Boolean(getExistingApplication(c.id));
                return (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    isBookmarked={bookmarkedIds.includes(c.id)}
                    hasApplied={applied}
                    onApply={() => (applied ? navigate(ROUTES.myApplications) : requestApply(c))}
                    onToggleBookmark={() => toggleBookmark(c)}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* ===== Khối giới thiệu Quy trình dịch vụ KOCity ===== */}
        <section id="cach-hoat-dong" className="mt-16 scroll-mt-20 overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-900 via-indigo-900 to-[#4c1d95] p-6 text-white shadow-xl shadow-violet-900/10 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-pink-200 backdrop-blur ring-1 ring-white/20">
                <Icon name="alt_route" className="text-[14px]" /> Lộ trình minh bạch
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Quy trình hợp tác chuẩn mực
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-white/85 sm:text-sm">
                Từ bước đăng ký nhận mẫu 0đ, giao hàng tận nhà, đến lên video TikTok Shop và rút hoa hồng đối soát minh bạch. Khám phá quy trình chuyên nghiệp dành cho cả KOC và Brand.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-white/90">
                <span className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1">
                  <Icon name="check" className="text-[14px] text-emerald-400" /> 4 Bước nhận mẫu KOC
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1">
                  <Icon name="check" className="text-[14px] text-emerald-400" /> 5 Bước dịch vụ Brand
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1">
                  <Icon name="check" className="text-[14px] text-emerald-400" /> Cam kết 100% 0đ
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                to={ROUTES.process}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-slate-900 shadow-md transition hover:bg-slate-100 active:scale-95"
              >
                Xem chi tiết quy trình <Icon name="arrow_forward" className="text-[18px] text-[#7c3aed]" />
              </Link>
              <a
                href={ZALO_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white/15 px-6 text-sm font-semibold text-white backdrop-blur hover:bg-white/25"
              >
                Hỏi đáp nhóm Zalo KOC <Icon name="chat" className="text-[16px]" />
              </a>
            </div>
          </div>
        </section>

        {/* ===== Ai có thể tham gia ===== */}
        <section className="mt-20">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-slate-950 sm:text-2xl">Ai có thể tham gia KOCity?</h2>
            <Button
              variant="primary"
              size="sm"
              className="rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6]"
              onClick={() => (currentUser ? document.getElementById('mau-dang-mo')?.scrollIntoView({ behavior: 'smooth' }) : openAuth('register'))}
            >
              {currentUser ? 'Xem mẫu ngay' : 'Tham gia ngay'}
            </Button>
          </div>
          <div className="no-scrollbar -mx-4 mt-5 flex snap-x gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
            {PERSONAS.map((p, i) => (
              <article key={p.title} className="card-fx relative aspect-[3/4] w-[75%] shrink-0 snap-center overflow-hidden rounded-[24px] sm:w-auto">
                <img src={personaImages[i]} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/15 p-3.5 text-white ring-1 ring-white/30 backdrop-blur-md">
                  <h3 className="font-bold">{p.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/85">{p.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ===== Vì sao chọn KOCity ===== */}
        <section className="-mx-4 mt-20 bg-[linear-gradient(180deg,#f5f3ff_0%,#fdf2f8_100%)] px-4 py-14 sm:-mx-6 sm:rounded-[32px] sm:px-10">
          <h2 className="text-center font-display text-xl font-bold text-slate-950 sm:text-2xl">Vì sao nên chọn KOCity</h2>
          <ol className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
            {REASONS.map((r, i) => (
              <li key={r} className="card-fx rounded-2xl bg-white p-5 ring-1 ring-violet-100">
                <p className="font-display text-lg font-bold text-[#6d28d9]">0{i + 1}.</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{r}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ===== Câu hỏi thường gặp ===== */}
        <section className="mx-auto mt-20 max-w-3xl">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Câu hỏi thường gặp</h2>
          <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Icon name="add" className="shrink-0 text-[22px] text-[#7c3aed] transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-3 pr-8 text-[15px] leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ===== Hỗ trợ qua Zalo ===== */}
        <section className="mt-20 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Cần hỗ trợ?</h2>
          <p className="mx-auto mt-2 max-w-md text-slate-500">Hỏi về brief, tiến độ duyệt hay vận đơn — Admin trả lời trực tiếp trong nhóm Zalo.</p>
          <a
            href={ZALO_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#0068ff] px-6 text-[15px] font-semibold text-white hover:bg-[#0058d6]"
          >
            Vào nhóm Zalo KOC <Icon name="arrow_outward" className="text-[18px]" />
          </a>
        </section>

        {isAdmin && <HeroImageSheet open={heroSheetOpen} onClose={() => setHeroSheetOpen(false)} />}

        {/* ===== Bảng lọc ===== */}
        <Sheet
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          title="Lọc & sắp xếp"
          footer={
            <div className="flex gap-2">
              <Button variant="outline" size="lg" onClick={resetFilters} className="flex-1">
                Đặt lại
              </Button>
              <Button variant="dark" size="lg" onClick={() => setFilterOpen(false)} className="flex-[2]">
                Xem {visible.length} chiến dịch
              </Button>
            </div>
          }
        >
          <FilterGroup label="Sắp xếp">
            {SORTS.map((s) => (
              <Chip key={s.id} active={sort === s.id} onClick={() => setSort(s.id)}>{s.label}</Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Quy mô kênh của bạn">
            {FOLLOWER_TIERS.map((t) => (
              <Chip key={t.id} active={tier === t.id} onClick={() => setTier(t.id)}>{t.label}</Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Khác">
            <Chip active={savedOnly} onClick={() => setSavedOnly((v) => !v)}>
              <Icon name="favorite" filled={savedOnly} className="mr-1 text-[16px]" /> Đã lưu ({bookmarkedIds.length})
            </Chip>
          </FilterGroup>
        </Sheet>
      </div>
    </div>
  );
};

const FilterGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <fieldset className="mb-6 last:mb-1">
    <legend className="mb-2.5 text-sm font-semibold text-slate-800">{label}</legend>
    <div className="flex flex-wrap gap-2">{children}</div>
  </fieldset>
);

/** Dải hoạt động thật (đã che tên). Không hiện gì nếu chưa có hoạt động — không tạo hoạt động giả. */
const LiveTicker: React.FC<{ items: LiveActivityItem[] }> = ({ items }) => {
  const loop = useMemo(() => {
    const half: LiveActivityItem[] = [];
    while (half.length < 8) half.push(...items);
    return [...half, ...half];
  }, [items]);
  return (
    <div className="mt-3 flex items-center overflow-hidden rounded-2xl bg-white py-2.5 ring-1 ring-slate-100">
      <span className="ml-3 mr-2 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] px-2.5 py-1 text-[10px] font-black tracking-wider text-white">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
        </span>
        LIVE
      </span>
      <div className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)]">
        <div className="animate-marquee-infinite gap-8">
          {loop.map((it, idx) => (
            <span key={`${it.id}-${idx}`} className={cx('shrink-0 text-xs text-slate-600')}>
              <b className="text-slate-900">{it.displayName}</b>
              {it.city && <span className="text-slate-400"> · {it.city}</span>} {LIVE_ACTION_TEXT[it.action]} <b className="text-[#6366f1]">{it.brandName}</b>
              {it.dateLabel && <span className="ml-1.5 text-slate-400">{it.dateLabel}</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
