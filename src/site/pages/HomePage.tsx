import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Campaign, LiveActivityItem } from '../../types';
import { BlogPost, getStoredBlogPosts } from '../../data/blogData';
import { calculateDaysLeft, useAppData } from '../../state/AppDataContext';
import { getCommissionLabel, getScarcity } from '../../lib/campaignDisplay';
import { getApplicationProgress } from '../../lib/applicationStatus';
import { LIVE_ACTION_TEXT } from '../../lib/liveActivity';
import { ROUTES, ZALO_GROUP_URL } from '../../lib/constants';
import { useSiteUI } from '../SiteUI';
import { CampaignCard } from '../components/CampaignCard';
import { KocitySkyline } from '../components/KocitySkyline';
import { BlogReaderModal } from '../components/BlogReaderModal';
import { Badge, Button, Chip, EmptyState, Icon, SectionTitle, Sheet, cx } from '../ui';

// Tải lười (Lazy load) các modal nặng để trang chủ hiển thị tức thì
const HeroImageSheet = React.lazy(() => import('../components/HeroImageSheet').then(m => ({ default: m.HeroImageSheet })));
const KocityWorldModal = React.lazy(() => import('../components/KocityWorldModal').then(m => ({ default: m.KocityWorldModal })));

type SortKey = 'popular' | 'commission' | 'spots' | 'ending';
type StatusFilter = 'all' | 'open' | 'full';

const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Mỹ phẩm', label: 'Mỹ phẩm & Chăm sóc da' },
  { id: 'Chăm sóc cá nhân', label: 'Chăm sóc cá nhân & Răng' },
  { id: 'công nghệ', label: 'Đồ công nghệ & Setup' },
  { id: 'Thời trang', label: 'Thời trang & Phụ kiện' },
  { id: 'Nước hoa', label: 'Nước hoa cao cấp' },
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
  {
    title: "Nano KOC (từ 1K followers)",
    desc: "Kênh nhỏ vẫn nhận được mẫu thật và có thêm thu nhập từ hoa hồng theo đơn.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    tag: "Dễ duyệt mẫu"
  },
  {
    title: "Micro KOC (từ 5K followers)",
    desc: "Chọn chiến dịch đúng ngách, chủ động lịch lên video và theo dõi kết quả rõ ràng.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    tag: "Hoa hồng cao"
  },
  {
    title: "Creator theo ngách",
    desc: "Làm đẹp, thời trang, công nghệ, phong cách sống... — chọn Brand phù hợp phong cách của bạn.",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    tag: "Tự do sáng tạo"
  },
];

// 6 Quyền lợi vượt trội có tiêu đề in đậm và icon nhận diện
const REASONS = [
  {
    icon: 'inventory_2',
    title: 'Mẫu 0đ gửi tận nhà',
    desc: 'Nhận sản phẩm chính hãng 100% miễn phí, không cọc phí, có mã vận đơn theo dõi từng bước.',
  },
  {
    icon: 'groups',
    title: 'Kênh từ 1.000 Follower',
    desc: 'Cơ hội rộng mở cho Nano & Micro KOC, kênh mới lập vẫn dễ dàng được các brand duyệt gửi mẫu.',
  },
  {
    icon: 'payments',
    title: 'Hoa hồng minh bạch 8% – 15%',
    desc: 'Hoa hồng Affiliate hiển thị rõ ràng trên mỗi thẻ, tự động đối soát và cộng dồn theo từng đơn bán ra.',
  },
  {
    icon: 'timeline',
    title: 'Theo dõi tiến độ như đơn hàng',
    desc: 'Lộ trình minh bạch: Brand xem hồ sơ → Duyệt gửi mẫu → Nhận hàng → Lên video nghiệm thu.',
  },
  {
    icon: 'touch_app',
    title: 'Điền 1 lần · Lần sau 1 chạm',
    desc: 'Hệ thống tự động ghi nhớ thông tin kênh và địa chỉ nhận mẫu, đăng ký các chiến dịch tiếp theo chỉ mất 3 giây.',
  },
  {
    icon: 'support_agent',
    title: 'Nhóm Zalo hỗ trợ KOC 24/7',
    desc: 'Đội ngũ Admin KOCity luôn túc trực hỗ trợ hướng dẫn kịch bản brief, kiểm tra vận đơn và giải đáp nhanh chóng.',
  },
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<SortKey>('popular');
  const [tier, setTier] = useState(0);
  const [savedOnly, setSavedOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [heroSheetOpen, setHeroSheetOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const activeFilters = (sort !== 'popular' ? 1 : 0) + (tier ? 1 : 0) + (savedOnly ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

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

  // Dữ liệu cẩm nang SEO và bài viết mây che
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => getStoredBlogPosts());
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [uncloudedPostIds, setUncloudedPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onUpdate = () => setBlogPosts(getStoredBlogPosts());
    window.addEventListener('kocity-blog-updated', onUpdate);
    return () => window.removeEventListener('kocity-blog-updated', onUpdate);
  }, []);

  // Link "Cách hoạt động" từ menu → cuộn tới đúng mục
  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [location.hash]);

  const openCount = useMemo(
    () => campaigns.filter((c) => !getScarcity(c).isFull && calculateDaysLeft(c.endDate, c.daysLeft) > 0).length,
    [campaigns]
  );
  const fullCount = useMemo(
    () => campaigns.filter((c) => getScarcity(c).isFull || calculateDaysLeft(c.endDate, c.daysLeft) <= 0).length,
    [campaigns]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns
      .filter((c) => {
        const isFull = getScarcity(c).isFull || calculateDaysLeft(c.endDate, c.daysLeft) <= 0;
        if (statusFilter === 'open' && isFull) return false;
        if (statusFilter === 'full' && !isFull) return false;
        if (category !== 'all' && !c.category.toLowerCase().includes(category.toLowerCase())) return false;
        if (q && ![c.title, c.brandName, c.category].some((s) => s.toLowerCase().includes(q))) return false;
        if (tier && followerRequirementK(c) > tier) return false;
        if (savedOnly && !bookmarkedIds.includes(c.id)) return false;
        return true;
      })
      .sort((a, b) => {
        // 1. Luôn ưu tiên xếp các chiến dịch ĐANG MỞ / CÒN SUẤT lên trước các chiến dịch ĐÃ ĐỦ 100/100
        const aFull = getScarcity(a).isFull || calculateDaysLeft(a.endDate, a.daysLeft) <= 0;
        const bFull = getScarcity(b).isFull || calculateDaysLeft(b.endDate, b.daysLeft) <= 0;
        if (aFull !== bFull) {
          return aFull ? 1 : -1;
        }

        // 2. Tiếp theo sắp xếp theo tiêu chí người dùng lựa chọn
        if (sort === 'commission') return commissionNumber(b) - commissionNumber(a);
        if (sort === 'spots') return getScarcity(b).spotsLeft - getScarcity(a).spotsLeft;
        if (sort === 'ending') return calculateDaysLeft(a.endDate, a.daysLeft) - calculateDaysLeft(b.endDate, b.daysLeft);
        return 0;
      });
  }, [campaigns, statusFilter, category, query, tier, savedOnly, bookmarkedIds, sort]);

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setCategory('all');
    setSort('popular');
    setTier(0);
    setSavedOnly(false);
  };

  const pendingCount = myApplications.filter((a) => getApplicationProgress(a).selection === 'pending').length;
  // Ảnh & dòng hoạt động cho phần đầu trang — chỉ dùng dữ liệu thật
  const heroSideImage = campaigns[1]?.productHeroImage || heroImage;
  const heroFeed = (liveActivity.length > 0
    ? liveActivity.slice(0, 3).map((a) => ({ key: a.id, title: a.displayName, sub: `${a.brandName} · ${a.dateLabel || "mới"}`, image: campaigns.find((c) => c.brandName === a.brandName)?.brandLogo || heroImage }))
    : campaigns.slice(0, 3).map((c) => ({ key: c.id, title: c.brandName, sub: `Còn ${getScarcity(c).spotsLeft} suất · ${getCommissionLabel(c) || "Mẫu 0đ"}`, image: c.brandLogo })));
  const heroStats = [
    { value: `${openCount} chiến dịch`, label: 'Đang mở nhận mẫu' },
    { value: `${fullCount} chiến dịch`, label: 'Đã hoàn tất 100/100' },
    { value: String(new Set(campaigns.map((c) => c.brandName)).size), label: 'Brand đồng hành' },
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
          'relative w-full overflow-hidden transition-all duration-700 ease-in-out',
          isNight
            ? 'bg-[linear-gradient(135deg,#0a0618_0%,#160c33_35%,#1f114a_70%,#0f0a24_100%)] text-white'
            : 'border-b border-violet-100/80 bg-[linear-gradient(135deg,#fde7f3_0%,#ede9fe_35%,#dbeafe_65%,#fef3c7_100%)]'
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

        {/* Bầu trời ngàn sao lấp lánh (Sao đứng yên hoàn toàn chỉ lấp lánh, chỉ duy nhất sao băng chuyển động) */}
        {isNight && (
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <style>{`
              @keyframes starTwinkle {
                0%, 100% { opacity: 0.15; }
                50% { opacity: 1; }
              }
              @keyframes shootingStarMove {
                0% {
                  transform: translate(0, 0) rotate(-32deg);
                  opacity: 0;
                }
                2% {
                  opacity: 1;
                }
                16% {
                  transform: translate(-360px, 220px) rotate(-32deg);
                  opacity: 0;
                }
                100% {
                  transform: translate(-360px, 220px) rotate(-32deg);
                  opacity: 0;
                }
              }
              .kc-twinkle-1 { animation: starTwinkle 2.2s ease-in-out infinite; }
              .kc-twinkle-2 { animation: starTwinkle 2.9s ease-in-out infinite 0.7s; }
              .kc-twinkle-3 { animation: starTwinkle 3.5s ease-in-out infinite 1.3s; }
              .kc-twinkle-4 { animation: starTwinkle 2.5s ease-in-out infinite 1.8s; }
              .kc-shooting-star-track {
                position: absolute;
                top: 15px;
                right: 18%;
                width: 120px;
                height: 2px;
                background: linear-gradient(90deg, transparent 0%, rgba(236, 72, 153, 0.5) 45%, rgba(255, 255, 255, 0.95) 100%);
                border-radius: 9999px;
                filter: drop-shadow(0 0 3px #ffffff);
                opacity: 0;
                animation: shootingStarMove 6s linear infinite 1.5s;
              }
            `}</style>

            {/* Chỉ DUY NHẤT sao băng là chuyển động lướt qua bầu trời */}
            <div className="kc-shooting-star-track" />

            {/* Các ngôi sao ĐỨNG YÊN HOÀN TOÀN, chỉ lấp lánh độ sáng (opacity) */}
            <svg className="absolute inset-0 h-full w-full" fill="none">
              {/* Sao tròn li ti đứng yên lấp lánh */}
              <circle cx="8%" cy="14%" r="1.4" fill="#ffffff" className="kc-twinkle-1" />
              <circle cx="15%" cy="28%" r="1.1" fill="#fef08a" className="kc-twinkle-3" />
              <circle cx="21%" cy="11%" r="1.5" fill="#ffffff" className="kc-twinkle-2" />
              <circle cx="29%" cy="22%" r="1.2" fill="#a5f3fc" className="kc-twinkle-4" />
              <circle cx="36%" cy="15%" r="1.4" fill="#ffffff" className="kc-twinkle-1" />
              <circle cx="43%" cy="26%" r="1.1" fill="#fef08a" className="kc-twinkle-3" />
              <circle cx="51%" cy="10%" r="1.6" fill="#ffffff" className="kc-twinkle-2" />
              <circle cx="58%" cy="20%" r="1.2" fill="#fbcfe8" className="kc-twinkle-4" />
              <circle cx="66%" cy="13%" r="1.4" fill="#ffffff" className="kc-twinkle-1" />
              <circle cx="73%" cy="25%" r="1.2" fill="#a5f3fc" className="kc-twinkle-3" />
              <circle cx="81%" cy="11%" r="1.5" fill="#ffffff" className="kc-twinkle-2" />
              <circle cx="89%" cy="19%" r="1.3" fill="#fef08a" className="kc-twinkle-4" />
              <circle cx="95%" cy="14%" r="1.2" fill="#ffffff" className="kc-twinkle-1" />
              <circle cx="18%" cy="38%" r="1.1" fill="#ffffff" className="kc-twinkle-2" />
              <circle cx="84%" cy="36%" r="1.2" fill="#ffffff" className="kc-twinkle-3" />

              {/* Ngôi sao 4 cánh lấp lánh (Đứng yên tại chỗ) */}
              <path d="M 140,28 L 142,33 L 147,34.5 L 142,36 L 140,41 L 138,36 L 133,34.5 L 138,33 Z" fill="#ffffff" className="kc-twinkle-1" />
              <path d="M 490,24 L 491.5,28 L 495,29.5 L 491.5,31 L 490,35 L 488.5,31 L 485,29.5 L 488.5,28 Z" fill="#a5f3fc" className="kc-twinkle-4" />
              <path d="M 870,22 L 872,27 L 877,28.5 L 872,30 L 870,35 L 868,30 L 863,28.5 L 868,27 Z" fill="#fef08a" className="kc-twinkle-2" />
              <path d="M 1220,26 L 1221.5,30 L 1225,31.5 L 1221.5,33 L 1220,37 L 1218.5,33 L 1215,31.5 L 1218.5,30 Z" fill="#ffffff" className="kc-twinkle-3" />
            </svg>
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-6 pb-2 text-center sm:px-6 sm:pt-8 sm:pb-3 lg:pt-9 lg:pb-4">
          {currentUser && !isAdmin ? (
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
          ) : (
            <div
              className={cx(
                'mb-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold backdrop-blur-md shadow-xs transition-all duration-300',
                isNight
                  ? 'bg-violet-900/40 text-violet-200 ring-1 ring-violet-500/30'
                  : 'bg-white/90 text-violet-900 ring-1 ring-violet-200/90 shadow-violet-500/5'
              )}
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>✨ Dân số KOCity: 1,280+ Cư dân sáng tạo</span>
            </div>
          )}

          <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl transition-all duration-500">
            <span
              className={cx(
                'bg-clip-text text-transparent transition-all duration-500',
                isNight
                  ? 'bg-gradient-to-r from-white via-fuchsia-200 to-pink-300 drop-shadow-[0_0_35px_rgba(217,70,239,0.7)]'
                  : 'bg-gradient-to-r from-violet-900 via-purple-700 to-pink-600'
              )}
            >
              KOCity Creator
            </span>
          </h1>

          <p
            className={cx(
              'mx-auto mt-2.5 max-w-2xl text-xs leading-relaxed transition-colors duration-500 sm:mt-3 sm:text-sm md:text-base',
              isNight ? 'text-slate-300' : 'text-slate-600'
            )}
          >
            Nền tảng kết nối <strong className={cx('font-semibold', isNight ? 'text-violet-300' : 'text-violet-900')}>Nano & Micro KOC TikTok</strong> với Brand. <strong className={cx('font-semibold', isNight ? 'text-fuchsia-300' : 'text-fuchsia-800')}>Nhận mẫu 0đ tận nhà</strong>, lên video theo brief và nhận <strong className={cx('font-semibold', isNight ? 'text-pink-300' : 'text-pink-800')}>hoa hồng minh bạch</strong> theo từng đơn.
          </p>

          {/* 3 Chip cam kết quyền lợi KOC */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:gap-2.5 sm:text-xs">
            <span
              className={cx(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium backdrop-blur-md transition-all',
                isNight
                  ? 'bg-white/10 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'bg-white/90 text-emerald-700 ring-1 ring-emerald-200 shadow-xs'
              )}
            >
              <Icon name="check_circle" className="text-[14px] text-emerald-500" />
              100% Không cọc phí
            </span>
            <span
              className={cx(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium backdrop-blur-md transition-all',
                isNight
                  ? 'bg-white/10 text-fuchsia-300 ring-1 ring-fuchsia-500/30'
                  : 'bg-white/90 text-fuchsia-700 ring-1 ring-fuchsia-200 shadow-xs'
              )}
            >
              <Icon name="local_shipping" className="text-[14px] text-fuchsia-500" />
              Nhận mẫu tận tay 0đ
            </span>
            <span
              className={cx(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium backdrop-blur-md transition-all',
                isNight
                  ? 'bg-white/10 text-violet-300 ring-1 ring-violet-500/30'
                  : 'bg-white/90 text-violet-700 ring-1 ring-violet-200 shadow-xs'
              )}
            >
              <Icon name="payments" className="text-[14px] text-violet-500" />
              Hoa hồng minh bạch
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:mt-6 sm:gap-3.5">
            <Button
              variant="primary"
              size="lg"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#ec4899] via-[#d946ef] to-[#8b5cf6] px-6 py-3.5 font-bold text-white shadow-xl shadow-pink-500/25 transition-all duration-300 hover:shadow-pink-500/40 hover:scale-[1.03] active:scale-[0.98] sm:h-12 sm:px-8 sm:text-base cursor-pointer ring-2 ring-white/20"
              onClick={() => (currentUser ? document.getElementById('mau-dang-mo')?.scrollIntoView({ behavior: 'smooth' }) : openAuth('register'))}
            >
              <span>{currentUser ? 'Khám phá mẫu 0đ ngay' : 'Tham gia ngay'}</span>
              <Icon name="arrow_forward" className="text-[18px] transition-transform duration-300 group-hover:translate-x-1" />
            </Button>

            {/* Nút Khám phá Thành phố Cư dân */}
            <button
              type="button"
              onClick={() => setCityOpen(true)}
              className={cx(
                'group relative inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold transition-all duration-300 cursor-pointer backdrop-blur-md shadow-lg sm:h-12 sm:px-6 sm:text-base',
                isNight
                  ? 'bg-violet-950/70 text-violet-200 ring-1 ring-violet-400/40 hover:bg-violet-900/90 hover:text-white hover:ring-amber-300/60 shadow-purple-950/50'
                  : 'bg-white/95 text-slate-800 ring-1 ring-violet-200 hover:bg-white hover:text-violet-900 hover:ring-violet-400 shadow-violet-500/10'
              )}
            >
              <span className="text-[18px] animate-bounce">🏙️</span>
              <span>Vào Thành phố Cư dân</span>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500" />
              </span>
            </button>

            {currentUser && !isAdmin && (
              <Button
                variant="outline"
                size="lg"
                className={cx(
                  'rounded-full px-5 backdrop-blur sm:h-12 sm:px-6',
                  isNight
                    ? 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20'
                    : 'bg-white/90 text-slate-800 ring-1 ring-violet-200 hover:bg-white'
                )}
                onClick={() => navigate(ROUTES.myApplications)}
              >
                Đơn của tôi {pendingCount + selectedCount > 0 ? `(${pendingCount + selectedCount})` : ''}
              </Button>
            )}
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

        {/* Dải thành phố KOCity Silhouette (2 lớp + ánh đèn chuyển động + loang mượt chân trời) */}
        <div className="relative">
          <KocitySkyline isNight={isNight} className="-mb-[1px]" />
        </div>
      </section>

      {/* ===== Không gian trưng bày Showroom (Phương án 1: Sàn trắng khói ánh tím pastel nhẹ nhàng #f8f7ff → #fcfbfe) ===== */}
      <div
        className={cx(
          'relative w-full overflow-hidden transition-colors duration-700',
          isNight
            ? 'bg-gradient-to-b from-[#f8f7ff] via-[#faf8ff] to-[#fcfbfe]'
            : 'bg-[#fafafc]'
        )}
      >
        {/* Ambient Glow Orbs (Phương án 1: 2 vệt sáng tròn mờ ảo blur 120px màu tím phấn và hồng pastel hai bên sườn) */}
        {isNight && (
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
            {/* Vệt sáng tròn mờ ảo bên sườn trái (Tím phấn êm dịu) */}
            <div className="absolute -left-48 top-28 h-[540px] w-[540px] rounded-full bg-violet-400/18 blur-[120px]" />
            {/* Vệt sáng tròn mờ ảo bên sườn phải (Hồng pastel thoang thoảng) */}
            <div className="absolute -right-48 top-[520px] h-[580px] w-[580px] rounded-full bg-pink-400/16 blur-[120px]" />
            {/* Chiều sâu 3D lung linh khi cuộn chuột xuống các tầng dưới */}
            <div className="absolute -left-36 top-[1400px] h-[540px] w-[540px] rounded-full bg-purple-300/14 blur-[130px]" />
            <div className="absolute -right-36 top-[2100px] h-[560px] w-[560px] rounded-full bg-fuchsia-300/12 blur-[130px]" />
          </div>
        )}

        {/* Phần còn lại của trang (nằm trong container max-w-6xl căn giữa) */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6">
          {(liveActivity.length > 0 || campaigns.length > 0) && (
            <LiveTicker items={liveActivity} isNight={isNight} campaigns={campaigns} />
          )}

        {/* ===== Danh sách mẫu (đẩy lên ngay dưới Hero & LiveTicker) ===== */}
        <section className="pt-6 sm:pt-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <SectionTitle id="mau-dang-mo" title="Khám phá mẫu chiến dịch" subtitle={`${visible.length} sản phẩm phù hợp`} />
            </div>

            {/* 3 Tab lọc trạng thái nhanh */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={cx(
                  'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                    : isNight
                      ? 'bg-white/95 text-slate-700 hover:bg-white ring-1 ring-violet-200/80 shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200'
                )}
              >
                <span>Tất cả</span>
                <span className={cx('rounded-md px-1.5 py-0.5 text-[10px]', statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')}>
                  {campaigns.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('open')}
                className={cx(
                  'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                  statusFilter === 'open'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : isNight
                      ? 'bg-white/95 text-emerald-700 hover:bg-emerald-50 ring-1 ring-emerald-200/80 shadow-xs'
                      : 'bg-white text-emerald-700 hover:bg-emerald-50 ring-1 ring-emerald-200'
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Đang mở nhận mẫu</span>
                <span className={cx('rounded-md px-1.5 py-0.5 text-[10px]', statusFilter === 'open' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800')}>
                  {openCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('full')}
                className={cx(
                  'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                  statusFilter === 'full'
                    ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                    : isNight
                      ? 'bg-white/95 text-rose-700 hover:bg-rose-50 ring-1 ring-rose-200/80 shadow-xs'
                      : 'bg-white text-rose-700 hover:bg-rose-50 ring-1 ring-rose-200'
                )}
              >
                <span>⛔ Đã đủ 100/100</span>
                <span className={cx('rounded-md px-1.5 py-0.5 text-[10px]', statusFilter === 'full' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800')}>
                  {fullCount}
                </span>
              </button>
            </div>
          </div>

          {/* Thanh tìm kiếm & Bộ lọc (Phương án 1: Kính mờ phủ nhẹ ánh tím phớt hòa quyện dải màu loang) */}
          <div
            className={cx(
              'sticky top-16 z-30 -mx-4 mt-3 px-4 pb-3 pt-2 backdrop-blur-md sm:-mx-6 sm:px-6 transition-all duration-300 shadow-xs',
              isNight
                ? 'bg-[#f8f7ff]/85 border-b border-violet-100/70 shadow-violet-500/5'
                : 'bg-[#fafafc]/95 border-b border-slate-100/60'
            )}
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="sr-only">Tìm chiến dịch</span>
                <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm brand, sản phẩm..."
                  className={cx(
                    'h-11 w-full rounded-2xl pl-10 pr-9 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] sm:text-sm shadow-xs transition-all',
                    isNight
                      ? 'bg-white/95 text-slate-900 ring-1 ring-violet-200/80 shadow-violet-500/5'
                      : 'bg-white text-slate-900 ring-1 ring-slate-200'
                  )}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer p-1"
                    title="Xóa tìm kiếm"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                aria-haspopup="dialog"
                className={cx(
                  'relative inline-flex h-11 shrink-0 items-center gap-1.5 rounded-2xl px-3.5 text-sm font-semibold cursor-pointer shadow-xs active:scale-95 transition-all',
                  isNight
                    ? 'bg-white/95 text-slate-800 ring-1 ring-violet-200/80 hover:ring-violet-400 hover:text-violet-900 shadow-violet-500/5'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-violet-300'
                )}
              >
                <Icon name="tune" className="text-[20px] text-violet-600" />
                <span className="text-xs sm:text-sm font-bold">Lọc</span>
                <span className="hidden sm:inline">& sắp xếp</span>
                {activeFilters > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ec4899] px-1 text-[10px] font-bold text-white shadow">
                    {activeFilters}
                  </span>
                )}
              </button>
            </div>

            {/* Hàng chip các bộ lọc đang kích hoạt */}
            {(activeFilters > 0 || statusFilter !== 'all' || category !== 'all' || query.trim()) && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs animate-in fade-in duration-200">
                <span className="text-slate-400 font-medium">Đang lọc:</span>
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 font-bold text-violet-800 ring-1 ring-violet-200">
                    {statusFilter === 'open' ? '🟢 Đang mở' : '⛔ Đã đủ 100/100'}
                    <button type="button" onClick={() => setStatusFilter('all')} className="hover:text-violet-950 font-black cursor-pointer">✕</button>
                  </span>
                )}
                {category !== 'all' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 font-bold text-violet-800 ring-1 ring-violet-200">
                    {category}
                    <button type="button" onClick={() => setCategory('all')} className="hover:text-violet-950 font-black cursor-pointer">✕</button>
                  </span>
                )}
                {tier > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 font-bold text-violet-800 ring-1 ring-violet-200">
                    Kênh từ {tier}K
                    <button type="button" onClick={() => setTier(0)} className="hover:text-violet-950 font-black cursor-pointer">✕</button>
                  </span>
                )}
                {sort !== 'popular' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 font-bold text-violet-800 ring-1 ring-violet-200">
                    {SORTS.find((s) => s.id === sort)?.label}
                    <button type="button" onClick={() => setSort('popular')} className="hover:text-violet-950 font-black cursor-pointer">✕</button>
                  </span>
                )}
                {savedOnly && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2.5 py-0.5 font-bold text-pink-700 ring-1 ring-pink-200">
                    Đã lưu
                    <button type="button" onClick={() => setSavedOnly(false)} className="hover:text-pink-900 font-black cursor-pointer">✕</button>
                  </span>
                )}
                {query.trim() && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 font-bold text-slate-700 ring-1 ring-slate-200">
                    &quot;{query.trim()}&quot;
                    <button type="button" onClick={() => setQuery('')} className="hover:text-slate-950 font-black cursor-pointer">✕</button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="ml-auto text-xs font-semibold text-violet-600 hover:text-violet-800 underline cursor-pointer"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

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
                    isNight={isNight}
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

        {/* ===== CẨM NANG KOC & BÀI VIẾT CHUẨN SEO (5 BÀI VIẾT - 2 BÀI MÂY CHE ÚP MỞ) ===== */}
        <section className="mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-[#6d28d9]">
                <Icon name="menu_book" className="text-[14px]" /> Cẩm nang Creator & Bí kíp 0đ
              </span>
              <h2 className="mt-2 font-display text-2xl font-black text-slate-950 sm:text-3xl">
                Bí kíp làm KOC & Tiếp thị liên kết từ con số 0
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Tổng hợp kiến thức chuẩn SEO, hướng dẫn nhận mẫu 0đ và kinh nghiệm săn job hoa hồng cao từ KOCITY.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] shrink-0 self-start sm:self-auto cursor-pointer"
              onClick={() => (currentUser ? document.getElementById('mau-dang-mo')?.scrollIntoView({ behavior: 'smooth' }) : openAuth('register'))}
            >
              {currentUser ? 'Nhận mẫu 0đ ngay' : 'Tham gia ngay'}
            </Button>
          </div>

          {/* Danh sách 5 bài viết: 3 bài công khai + 2 bài phủ mây úp mở */}
          <div className="no-scrollbar -mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:px-0">
            {blogPosts.map((post, idx) => {
              const isTeaser = post.isCloudCovered && !uncloudedPostIds.has(post.id);

              return (
                <article
                  key={post.id}
                  onClick={() => {
                    if (isTeaser) {
                      setUncloudedPostIds(prev => new Set([...prev, post.id]));
                    }
                    setSelectedBlogPost(post);
                  }}
                  className={cx(
                    'card-fx group relative flex flex-col justify-between overflow-hidden rounded-[26px] bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition-all cursor-pointer',
                    idx >= 3 ? 'sm:col-span-1 lg:col-span-1.5' : '',
                    'w-[82%] sm:w-auto shrink-0 snap-center'
                  )}
                >
                  {/* Ảnh bìa */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-800 backdrop-blur-md shadow-sm">
                      {post.tag}
                    </span>
                    <span className="absolute bottom-3 left-3 text-[11px] font-medium text-white/90">
                      ⏱️ {post.readTime}
                    </span>
                  </div>

                  {/* Nội dung tóm tắt */}
                  <div className="relative flex flex-1 flex-col p-5">
                    <h3
                      className="font-display text-base sm:text-lg font-bold text-slate-900 group-hover:text-violet-700 transition line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: post.title }}
                    />
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">
                      {post.summary}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-violet-600">
                      <span>Đọc chi tiết →</span>
                      <span className="text-[11px] font-normal text-slate-400">{post.publishedAt}</span>
                    </div>
                  </div>

                  {/* LỚP MÂY PHA LÊ CHE ÚP MỞ (KHI BÀI VIẾT BẬT CLOUD COVER) */}
                  {isTeaser && (
                    <div
                      className="absolute inset-0 z-20 flex flex-col items-center justify-end p-5 text-center bg-gradient-to-t from-slate-950/95 via-violet-950/75 to-slate-900/35 backdrop-blur-[6px] animate-cloud-drift select-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUncloudedPostIds(prev => new Set([...prev, post.id]));
                        setSelectedBlogPost(post);
                      }}
                    >
                      {/* Biểu tượng mây & tia sáng */}
                      <div className="mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-violet-600/30 border border-violet-400/50 shadow-lg shadow-violet-500/30 backdrop-blur-md text-2xl animate-pulse">
                        ☁️
                      </div>

                      {/* Huy hiệu bí mật */}
                      <span className="rounded-full bg-gradient-to-r from-amber-400 to-pink-500 px-3 py-1 text-[11px] font-black tracking-wide text-slate-950 shadow-md">
                        {post.cloudSecretLabel || '💎 BÍ KÍP ĐỘC QUYỀN'}
                      </span>

                      <p className="mt-2 text-xs font-semibold text-white/95 max-w-[240px] leading-snug drop-shadow-md">
                        Nội dung chứa bí mật hoa hồng cao & hồ sơ VIP. Chạm để mở!
                      </p>

                      {/* Nút bấm xua tan mây */}
                      <button
                        type="button"
                        className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-black text-violet-800 shadow-xl hover:bg-violet-50 active:scale-95 transition cursor-pointer"
                      >
                        <span>✨</span>
                        <span>Xua tan mây & Khám phá</span>
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* ===== Vì sao chọn KOCity ===== */}
        <section className="-mx-4 mt-20 bg-[linear-gradient(180deg,#f5f3ff_0%,#fdf2f8_100%)] px-4 py-14 sm:-mx-6 sm:rounded-[32px] sm:px-10">
          <div className="text-center max-w-xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-[#6d28d9]">
              <Icon name="verified" className="text-[14px]" /> Quyền lợi vượt trội
            </span>
            <h2 className="mt-2 font-display text-2xl font-black text-slate-950 sm:text-3xl">Vì sao KOC tin chọn KOCity</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">Nền tảng chuẩn hóa quy trình nhận mẫu và tối ưu hóa thu nhập bền vững cho Creator.</p>
          </div>
          <ol className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REASONS.map((r, i) => (
              <li key={r.title} className="card-fx flex flex-col rounded-2xl bg-white p-5 ring-1 ring-violet-100/80 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-[#7c3aed]">
                    <Icon name={r.icon} className="text-[22px]" />
                  </span>
                  <span className="font-display text-sm font-black text-violet-400">0{i + 1}.</span>
                </div>
                <h3 className="mt-3 font-display text-base font-bold text-slate-900">{r.title}</h3>
                <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-600">{r.desc}</p>
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

        {/* Modal Đọc bài viết SEO hoàn chỉnh */}
        <BlogReaderModal
          post={selectedBlogPost}
          onClose={() => setSelectedBlogPost(null)}
          onExploreCampaigns={() => document.getElementById('mau-dang-mo')?.scrollIntoView({ behavior: 'smooth' })}
        />

        {/* Modal tải lười: chỉ tải và mount khi người dùng bấm mở */}
        <React.Suspense fallback={null}>
          {isAdmin && heroSheetOpen && <HeroImageSheet open={heroSheetOpen} onClose={() => setHeroSheetOpen(false)} />}
          {cityOpen && (
            <KocityWorldModal
              open={cityOpen}
              onClose={() => setCityOpen(false)}
              campaigns={campaigns}
              currentUser={currentUser}
              isAdmin={isAdmin}
              isNightDefault={isNight}
              onSelectCampaign={(campId) => navigate(ROUTES.campaign(campId))}
            />
          )}
        </React.Suspense>

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

      {/* Nút chuyển đổi Ngày / Đêm dạng Floating Pill (Dễ dàng chuyển đổi khi đang cuộn xem sản phẩm) */}
      <div className="fixed bottom-5 left-5 z-40 hidden sm:block">
        <button
          type="button"
          onClick={toggleNight}
          aria-label={isNight ? 'Bật đèn (Chế độ ban ngày)' : 'Tắt đèn (Chế độ Showroom tối)'}
          className={cx(
            'group flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold transition-all duration-300 shadow-lg backdrop-blur-md ring-1 cursor-pointer hover:scale-105 active:scale-95',
            isNight
              ? 'bg-[#1e1338]/90 text-amber-300 ring-amber-300/40 shadow-purple-950/40 hover:bg-[#281a4d]'
              : 'bg-white/95 text-slate-700 ring-violet-200 hover:text-slate-950 shadow-violet-500/15'
          )}
        >
          <Icon
            name={isNight ? 'light_mode' : 'dark_mode'}
            className={cx('text-[16px] transition-transform duration-300', isNight ? 'text-amber-300 rotate-45' : 'text-violet-600')}
          />
          <span>{isNight ? 'Bật đèn' : 'Tắt đèn'}</span>
        </button>
      </div>
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

interface LiveTickerProps {
  items: LiveActivityItem[];
  isNight?: boolean;
  campaigns?: Campaign[];
}

type TickerItem =
  | {
      type: 'activity';
      id: string;
      icon: string;
      displayName: string;
      city?: string;
      actionText: string;
      brandName: string;
      dateLabel?: string;
    }
  | {
      type: 'pulse';
      id: string;
      icon: string;
      prefix: string;
      highlight: string;
      suffix: string;
    };

/** Dải hoạt động trực tiếp đa tầng (Glassmorphism + Icon + Xen kẽ thông số hệ thống tránh trùng lặp) */
const LiveTicker: React.FC<LiveTickerProps> = ({ items, isNight = false, campaigns = [] }) => {
  const [isPaused, setIsPaused] = useState(false);
  const loop = useMemo(() => {
    // 1. Chuyển đổi hoạt động KOC thật
    const realList: TickerItem[] = items.map((it) => {
      let icon = '🎁';
      if (it.action === 'selected') icon = '✨';
      if (it.action === 'posted') icon = '🎬';

      return {
        type: 'activity',
        id: `act-${it.id}`,
        icon,
        displayName: it.displayName,
        city: it.city,
        actionText: LIVE_ACTION_TEXT[it.action] || 'vừa tham gia',
        brandName: it.brandName,
        dateLabel: it.dateLabel,
      };
    });

    // 2. Tạo các mẩu tin hệ thống hữu ích / Chiến dịch nổi bật
    const pulseList: TickerItem[] = [];

    // Lấy chiến dịch đang mở
    if (campaigns.length > 0) {
      const topCamp = campaigns[0];
      pulseList.push({
        type: 'pulse',
        id: `pulse-camp-${topCamp.id}`,
        icon: '🚀',
        prefix: 'Chiến dịch hot',
        highlight: topCamp.brandName,
        suffix: `đang mở ${(topCamp as any).sampleQuantity || 20} suất mẫu 0đ`,
      });
    }

    pulseList.push({
      type: 'pulse',
      id: 'pulse-speed',
      icon: '⚡',
      prefix: 'Tốc độ duyệt mẫu',
      highlight: '24 giờ',
      suffix: 'kể từ khi nộp đơn',
    });

    if (campaigns.length > 1) {
      const secondCamp = campaigns[1];
      pulseList.push({
        type: 'pulse',
        id: `pulse-camp-${secondCamp.id}`,
        icon: '🔥',
        prefix: 'Mẫu mới về',
        highlight: secondCamp.brandName,
        suffix: 'ưu tiên Nano & Micro KOC',
      });
    }

    pulseList.push({
      type: 'pulse',
      id: 'pulse-sample',
      icon: '📦',
      prefix: 'Quyền lợi Creator',
      highlight: 'Mẫu 0đ gửi tận nhà',
      suffix: 'hoàn toàn miễn phí',
    });

    pulseList.push({
      type: 'pulse',
      id: 'pulse-comm',
      icon: '💰',
      prefix: 'Thu nhập KOC',
      highlight: 'Hoa hồng minh bạch',
      suffix: 'tự động đối soát theo đơn',
    });

    // 3. Xen kẽ mẩu tin thật với tin hệ thống để tạo nhịp điệu sinh động, không bao giờ bị lặp 1 dòng đơn điệu
    const combined: TickerItem[] = [];
    const maxLen = Math.max(realList.length, pulseList.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < realList.length) combined.push(realList[i]);
      if (i < pulseList.length) combined.push(pulseList[i]);
    }

    // Đảm bảo có tối thiểu 6 items trước khi nhân đôi chạy marquee
    let base = [...combined];
    while (base.length < 6) {
      base = [...base, ...pulseList];
    }

    // Nhân đôi mảng để animation translateX(-50%) liền mạch vô tận
    return [...base, ...base];
  }, [items, campaigns]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      title="Rê chuột hoặc chạm để tạm dừng đọc tin"
      className={cx(
        'group mt-3.5 flex items-center overflow-hidden rounded-2xl py-2 px-1 transition-all duration-500 backdrop-blur-md shadow-xs ring-1 cursor-default',
        isNight
          ? 'bg-white/85 text-slate-700 ring-violet-200/80 shadow-sm shadow-violet-500/5'
          : 'bg-white/90 text-slate-600 ring-violet-200/80 shadow-slate-100'
      )}
    >
      <div className="ml-2.5 mr-2 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] px-2.5 py-1 text-[10px] font-black tracking-wider text-white shadow-xs shadow-pink-500/20">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
        </span>
        LIVE
      </div>

      <div className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)]">
        <div className={cx('animate-marquee-infinite items-center gap-6 py-0.5', isPaused && 'is-paused')}>
          {loop.map((it, idx) => (
            <div key={`${it.id}-${idx}`} className="inline-flex shrink-0 items-center gap-2 text-xs">
              <span
                className={cx(
                  'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] shadow-xs',
                  isNight ? 'bg-violet-100/70' : 'bg-violet-50'
                )}
              >
                {it.icon}
              </span>

              {it.type === 'activity' ? (
                <span>
                  <strong className={cx('font-semibold', isNight ? 'text-slate-900' : 'text-slate-900')}>{it.displayName}</strong>
                  {it.city && <span className="text-slate-400"> · {it.city}</span>}{' '}
                  <span className="text-slate-600">{it.actionText}</span>{' '}
                  <strong className={cx('font-bold', isNight ? 'text-violet-700' : 'text-violet-700')}>{it.brandName}</strong>
                  {it.dateLabel && <span className="ml-1 text-[11px] text-slate-400">({it.dateLabel})</span>}
                </span>
              ) : (
                <span>
                  <span className="text-slate-500">{it.prefix}: </span>
                  <strong className={cx('font-bold', isNight ? 'text-violet-700' : 'text-violet-700')}>{it.highlight}</strong>{' '}
                  <span className="text-slate-600">{it.suffix}</span>
                </span>
              )}

              {/* Dấu phân cách tinh tế giữa các tin */}
              <span className={cx('ml-6 select-none text-[11px]', isNight ? 'text-violet-300' : 'text-violet-200')}>
                ✦
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
