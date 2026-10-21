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
    <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-8">
      {/* ===== Lời chào cho KOC đã đăng nhập, hoặc Hero cho khách ===== */}
      {currentUser && !isAdmin ? (
        <section className="rounded-[28px] bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#ec4899] p-5 text-white shadow-xl shadow-violet-500/20 sm:p-8">
          <p className="text-sm text-white/80">Xin chào 👋</p>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{currentUser.name}</h1>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-md">
            <Link to={ROUTES.myApplications} className="rounded-2xl bg-white/15 p-3.5 backdrop-blur transition-colors hover:bg-white/25">
              <p className="font-display text-2xl font-extrabold">{pendingCount}</p>
              <p className="text-xs text-white/85">Đang chờ Brand chọn</p>
            </Link>
            <Link to={ROUTES.myApplications} className="rounded-2xl bg-white/15 p-3.5 backdrop-blur transition-colors hover:bg-white/25">
              <p className="font-display text-2xl font-extrabold">{selectedCount}</p>
              <p className="text-xs text-white/85">Được chọn, đang làm</p>
            </Link>
          </div>
        </section>
      ) : (
        <section className="relative">
          <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#fde7f3_0%,#ede9fe_35%,#dbeafe_65%,#fef3c7_100%)] px-5 pt-10 pb-28 text-center sm:px-10 sm:pt-16 sm:pb-36">
            <div aria-hidden className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-pink-300/40 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-indigo-300/40 blur-3xl" />

            <h1 className="relative font-display text-3xl font-bold tracking-tight text-[#4c1d95] sm:text-5xl">KOCity Creator</h1>
            <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Nền tảng kết nối Nano & Micro KOC TikTok với Brand. Nhận mẫu 0đ tận nhà, lên video theo brief và nhận hoa hồng minh bạch theo từng đơn.
            </p>
            <div className="relative mt-6 flex justify-center gap-2">
              <Button
                variant="primary"
                size="lg"
                className="rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] px-7 hover:opacity-95"
                onClick={() => (currentUser ? document.getElementById('mau-dang-mo')?.scrollIntoView({ behavior: 'smooth' }) : openAuth('register'))}
              >
                {currentUser ? 'Xem mẫu đang mở' : 'Tham gia ngay'}
              </Button>
            </div>

            {/* Cụm ảnh khung vòm + nhãn nổi */}
            <div className="relative mx-auto mt-12 grid max-w-4xl grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)] items-end gap-2 sm:mt-16 sm:gap-6">
              <div className="relative">
                <div className="aspect-[3/4] overflow-hidden rounded-t-full bg-gradient-to-b from-violet-300 to-fuchsia-300">
                  <img src={heroImage} alt="KOC quay video mở hộp sản phẩm" className="h-full w-full object-cover" />
                </div>
                <FloatLabel icon="redeem" className="-left-1 bottom-6 sm:-left-10">Mẫu 0đ tận tay</FloatLabel>
                {isAdmin && (
                  <Button variant="dark" size="sm" className="absolute left-2 top-2 bg-black/60" onClick={() => setHeroSheetOpen(true)}>
                    <Icon name="photo_camera" className="text-[16px]" />
                  </Button>
                )}
              </div>

              <div className="relative mb-6 min-w-0 rounded-[24px] bg-gradient-to-br from-fuchsia-300/80 to-violet-400/80 p-1.5 sm:rounded-[36px] sm:p-5">
                <ul className="space-y-2 text-left">
                  {heroFeed.map((f, i) => (
                    <li key={f.key} className="card-fx flex items-center justify-between gap-2 rounded-2xl bg-white/85 p-2 shadow-sm backdrop-blur">
                      <img src={f.image} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                      <span className="hidden min-w-0 flex-1 sm:block">
                        <span className="block truncate text-[11px] font-bold text-slate-900 sm:text-xs">{f.title}</span>
                        <span className="block truncate text-[10px] text-slate-500 sm:text-[11px]">{f.sub}</span>
                      </span>
                      <span className={cx('h-2 w-2 shrink-0 rounded-full', ['bg-emerald-400', 'bg-emerald-400', 'bg-amber-400'][i % 3])} />
                    </li>
                  ))}
                </ul>
                <FloatLabel icon="groups" className="-bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">Cộng đồng KOC</FloatLabel>
              </div>

              <div className="relative">
                <div className="aspect-[3/4] overflow-hidden rounded-b-full rounded-t-[28px] bg-gradient-to-b from-indigo-200 to-violet-300">
                  <img src={heroSideImage} alt="" className="h-full w-full object-cover" />
                </div>
                <FloatLabel icon="percent" className="-right-1 top-6 sm:-right-10">Hoa hồng minh bạch</FloatLabel>
              </div>
            </div>
          </div>

          {/* Thẻ số liệu thật đè lên mép dưới */}
          <div className="relative z-10 mx-auto -mt-16 max-w-2xl rounded-3xl bg-white p-4 shadow-xl shadow-violet-500/10 ring-1 ring-slate-100 sm:-mt-20 sm:p-5">
            <p className="text-center text-sm font-semibold text-slate-900">Đang mở trên KOCity</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {heroStats.map((s) => (
                <div key={s.label} className="card-fx flex flex-col-reverse rounded-2xl bg-gradient-to-br from-violet-50 to-pink-50 px-3 py-2.5 text-left">
                  <dt className="text-[11px] text-slate-500">{s.label}</dt>
                  <dd className="font-display text-xl font-bold text-[#6d28d9] sm:text-2xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {liveActivity.length > 0 && <LiveTicker items={liveActivity} />}

      {!currentUser && (
        <>
          {/* ===== Ai có thể tham gia ===== */}
          <section className="mt-20">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-slate-950 sm:text-2xl">Ai có thể tham gia KOCity?</h2>
              <Button variant="primary" size="sm" className="rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6]" onClick={() => openAuth('register')}>
                Tham gia ngay
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

          {/* ===== Hình thức kiếm tiền ===== */}
          <section id="cach-hoat-dong" className="mt-20 scroll-mt-20">
            <h2 className="text-center font-display text-xl font-bold text-slate-950 sm:text-2xl">Hình thức kiếm tiền với KOCity</h2>
            <div className="mt-6 grid items-center gap-8 rounded-[28px] bg-gradient-to-br from-violet-50 via-white to-pink-50 p-5 ring-1 ring-violet-100 sm:p-8 md:grid-cols-2">
              <div className="relative mx-auto w-full max-w-xs">
                <div aria-hidden className="absolute -inset-4 -z-0 rounded-[32px] bg-white/70 shadow-xl shadow-violet-500/10" />
                {campaigns[0] && (
                  <div className="relative">
                    <CampaignCard
                      campaign={campaigns[0]}
                      isBookmarked={bookmarkedIds.includes(campaigns[0].id)}
                      hasApplied={Boolean(getExistingApplication(campaigns[0].id))}
                      onApply={() => requestApply(campaigns[0])}
                      onToggleBookmark={() => toggleBookmark(campaigns[0])}
                    />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-[#6d28d9]">Nhận mẫu 0đ + Hoa hồng theo đơn</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="violet">Freecast</Badge>
                  <Badge tone="pink">Affiliate TikTok Shop</Badge>
                </div>
                <ol className="mt-5 space-y-4">
                  {HOW_IT_WORKS.map((s, i) => (
                    <li key={s.title} className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6d28d9] text-sm font-bold text-white">{i + 1}</span>
                      <div>
                        <p className="font-semibold text-slate-900">{s.title}</p>
                        <p className="text-sm text-slate-600">{s.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Button
                  variant="primary"
                  className="mt-6 rounded-full bg-gradient-to-r from-[#ec4899] to-[#8b5cf6]"
                  onClick={() => document.getElementById('mau-dang-mo')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Danh sách chiến dịch
                </Button>
              </div>
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
        </>
      )}

      {/* ===== Danh sách mẫu ===== */}
      <section className="pt-10">
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
