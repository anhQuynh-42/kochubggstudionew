import React, { useState, useMemo } from 'react';
import { Campaign } from '../types';
import { ZALO_GROUP_URL } from './ZaloCommunityWidget';

interface MarketplaceViewProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onOpenApplyModal: (campaign: Campaign) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  bookmarkedIds?: string[];
  onToggleBookmark?: (campaign: Campaign) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  campaigns,
  onSelectCampaign,
  onOpenApplyModal,
  searchQuery,
  onSearchChange,
  bookmarkedIds = [],
  onToggleBookmark,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFollowerTier, setSelectedFollowerTier] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [filterSampleOnly, setFilterSampleOnly] = useState<boolean>(false);
  const [filterBudgetOnly, setFilterBudgetOnly] = useState<boolean>(false);
  const [filterHighCommOnly, setFilterHighCommOnly] = useState<boolean>(false);
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'popular' | 'high-commission' | 'spots-left' | 'expiring-soon'>('popular');

  const categories = useMemo(() => [
    { id: 'all', label: 'Tất cả ngành hàng', icon: 'apps' },
    { id: 'Mỹ phẩm & Chăm sóc da', label: 'Mỹ phẩm & Skincare', icon: 'face_retouching_natural' },
    { id: 'Đồ công nghệ & Setup', label: 'Công nghệ & Điện tử', icon: 'devices' },
    { id: 'Đồ gia dụng & Đời sống', label: 'Đồ gia dụng & Nhà cửa', icon: 'home_work' },
    { id: 'Thời trang & Phụ kiện', label: 'Thời trang & Phụ kiện', icon: 'checkroom' },
    { id: 'F&B & Đồ uống', label: 'F&B & Ăn uống', icon: 'restaurant' },
  ], []);

  const followerTiers = [
    { id: 'all', label: 'Tất cả' },
    { id: '1k', label: '>1K Followers' },
    { id: '5k', label: '>5K Followers' },
    { id: '20k', label: '>20K Followers' },
    { id: '50k', label: '>50K Followers' },
  ];

  // Dynamic campaign counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: campaigns.length };
    categories.forEach((cat) => {
      if (cat.id === 'all') return;
      const count = campaigns.filter((c) => {
        const campCat = c.category.toLowerCase();
        const selCat = cat.id.toLowerCase();
        return campCat === selCat || campCat.includes(selCat) || selCat.includes(campCat);
      }).length;
      counts[cat.id] = count;
    });
    return counts;
  }, [campaigns, categories]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((camp) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const campCat = camp.category.toLowerCase();
        const selCat = selectedCategory.toLowerCase();
        const match = campCat === selCat || campCat.includes(selCat) || selCat.includes(campCat);
        if (!match) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = camp.title.toLowerCase().includes(q);
        const matchBrand = camp.brandName.toLowerCase().includes(q);
        const matchCategory = camp.category.toLowerCase().includes(q);
        const matchReq = camp.followerRequirement.toLowerCase().includes(q);
        if (!matchTitle && !matchBrand && !matchCategory && !matchReq) {
          return false;
        }
      }

      // Platform filter
      if (selectedPlatform !== 'all' && !camp.platform.toLowerCase().includes(selectedPlatform.toLowerCase())) {
        return false;
      }

      // Follower Requirement Tier filter
      if (selectedFollowerTier !== 'all') {
        let reqK = 1;
        if (/1[.,]000|1k/i.test(camp.followerRequirement)) {
          reqK = 1;
        } else {
          const reqMatch = camp.followerRequirement.match(/(\d+)K/i);
          if (reqMatch) reqK = parseInt(reqMatch[1], 10);
        }
        if (selectedFollowerTier === '1k' && reqK > 1) return false;
        if (selectedFollowerTier === '5k' && reqK > 5) return false;
        if (selectedFollowerTier === '20k' && reqK > 20) return false;
        if (selectedFollowerTier === '50k' && reqK > 50) return false;
      }

      // Checkbox filters
      if (filterSampleOnly && !camp.benefits.some((b) => b.type === 'sample')) {
        return false;
      }
      if (filterBudgetOnly && !camp.benefits.some((b) => b.type === 'budget')) {
        return false;
      }
      if (filterHighCommOnly && !camp.benefits.some((b) => b.type === 'commission' || b.label.includes('%'))) {
        return false;
      }
      if (filterBookmarkedOnly && !bookmarkedIds.includes(camp.id)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'high-commission') {
        const getComm = (c: Campaign) => {
          const match = c.commissionRate?.match(/(\d+)%/);
          if (match) return parseInt(match[1], 10);
          const benMatch = c.benefits.find((bn) => bn.label.includes('%'))?.label.match(/(\d+)%/);
          return benMatch ? parseInt(benMatch[1], 10) : 0;
        };
        return getComm(b) - getComm(a);
      }
      if (sortBy === 'spots-left') {
        const leftA = a.totalSpots - a.registeredSpots;
        const leftB = b.totalSpots - b.registeredSpots;
        return leftB - leftA;
      }
      if (sortBy === 'expiring-soon') {
        return a.daysLeft - b.daysLeft;
      }
      return 0; // default 'popular' preserves order
    });
  }, [
    campaigns,
    selectedCategory,
    selectedFollowerTier,
    selectedPlatform,
    searchQuery,
    filterSampleOnly,
    filterBudgetOnly,
    filterHighCommOnly,
    filterBookmarkedOnly,
    bookmarkedIds,
    sortBy,
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 1. Clean Minimalist Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-md sm:p-10 mb-8 border border-slate-800">
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 border border-slate-700/80 px-3 py-1 text-xs font-semibold tracking-wide mb-4 text-slate-300">
              <span className="flex h-2 w-2 rounded-full bg-blue-400"></span>
              CỔNG NHẬN MẪU & BOOKING KOC CHÍNH HÃNG
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Kết nối trực tiếp 500+ Brand chính hãng
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              Nhận sản phẩm mẫu miễn phí tận tay, hoa hồng affiliate minh bạch và nhận thêm thù lao booking cố định trực tiếp từ các nhãn hàng.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const topCamp = campaigns.find((c) => c.urgent) || campaigns[0];
                  if (topCamp) onSelectCampaign(topCamp);
                }}
                className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                Xem chiến dịch nổi bật
              </button>

              <a
                id="hero-zalo-group-btn"
                href={ZALO_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm active:scale-95 transition-all"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-500 text-[10px] font-black text-white">
                  Z
                </span>
                <span>Vào nhóm Zalo KOC</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>

              <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 border border-slate-700/60 px-3.5 py-2 text-xs font-medium text-slate-300">
                <span className="material-symbols-outlined text-[16px] text-blue-400">check_circle</span>
                <span>Duyệt mẫu trong 24 giờ</span>
              </div>
            </div>
          </div>

          {/* 3 Stats Badges */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 p-4 lg:w-80">
            <div className="flex flex-col">
              <span className="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl font-extrabold text-white">
                500+
              </span>
              <span className="text-[11px] text-slate-400 leading-snug">Chiến dịch đang chạy</span>
            </div>
            <div className="flex flex-col border-x border-slate-700 px-3">
              <span className="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl font-extrabold text-white">
                12,450+
              </span>
              <span className="text-[11px] text-slate-400 leading-snug">KOC đã tham gia</span>
            </div>
            <div className="flex flex-col">
              <span className="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl font-extrabold text-white">
                3.5 Tỷ
              </span>
              <span className="text-[11px] text-slate-400 leading-snug">Đã thanh toán</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quy trình hợp tác 4 bước tối giản */}
      <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
              <span className="material-symbols-outlined text-[18px]">alt_route</span>
            </span>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-extrabold text-slate-900">
                Quy trình hợp tác 4 bước đơn giản
              </h3>
              <p className="text-xs text-slate-500">
                Nhận mẫu miễn phí 100%, quy trình duyệt tinh gọn và hoa hồng về tài khoản minh bạch
              </p>
            </div>
          </div>
          <a
            href={ZALO_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline self-start sm:self-auto"
          >
            <span>Hỗ trợ qua Zalo</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:bg-slate-50 hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-xs shadow-sm">
                  1
                </span>
                <span className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-semibold text-orange-800">
                  Duyệt 12h
                </span>
              </div>
              <h4 className="mt-3 font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900">
                Đăng ký tham gia
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-orange-500 shrink-0 mt-0.5">check</span>
                  <span>KOCHub duyệt hồ sơ (12h)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-orange-500 shrink-0 mt-0.5">check</span>
                  <span>Brand xác nhận gửi mẫu</span>
                </li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/70 text-[11px] font-medium text-slate-400">
              Chọn chiến dịch & gửi thông tin
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:bg-slate-50 hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-xs shadow-sm">
                  2
                </span>
                <span className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-semibold text-orange-800">
                  Miễn phí 100%
                </span>
              </div>
              <h4 className="mt-3 font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900">
                KOC nhận mẫu tận nhà
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-orange-500 shrink-0 mt-0.5">local_shipping</span>
                  <span>Giao hàng GHTK tận nơi</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-orange-500 shrink-0 mt-0.5">schedule</span>
                  <span>Làm video trong 4-7 ngày</span>
                </li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/70 text-[11px] font-medium text-slate-400">
              Trải nghiệm thực tế sản phẩm
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:bg-slate-50 hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-xs shadow-sm">
                  3
                </span>
                <span className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-semibold text-orange-800">
                  Nghiệm thu
                </span>
              </div>
              <h4 className="mt-3 font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900">
                KOC trả link video
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-orange-500 shrink-0 mt-0.5">link</span>
                  <span>Gửi link Google Drive / TikTok</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-orange-500 shrink-0 mt-0.5">verified</span>
                  <span>Duyệt video & lên bài kênh</span>
                </li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/70 text-[11px] font-medium text-slate-400">
              Gắn giỏ hàng & hashtag chiến dịch
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition-all hover:bg-slate-50 hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-sm">
                  4
                </span>
                <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                  Tự động đối soát
                </span>
              </div>
              <h4 className="mt-3 font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900">
                Nhận hoa hồng & thù lao
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-blue-600 shrink-0 mt-0.5">shopping_cart</span>
                  <span>Phát sinh đơn hàng từ video</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-blue-600 shrink-0 mt-0.5">account_balance</span>
                  <span className="font-semibold text-slate-900">Chuyển khoản trực tiếp</span>
                </li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/70 text-[11px] font-medium text-slate-400">
              Đối soát minh bạch hàng tuần
            </div>
          </div>
        </div>
      </section>

      {/* 3. Filter & Command Center */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-8">
        <div className="flex flex-col gap-4">
          {/* Top Row: Search input & Platform dropdown */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-[20px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm kiếm chiến dịch, tên brand, sản phẩm, ngành hàng..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Category Dropdown for quick access */}
              <div className="relative min-w-[170px]">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3.5 pr-8 text-xs font-semibold text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none cursor-pointer"
                  title="Lọc nhanh theo danh mục"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label} {categoryCounts[cat.id] !== undefined ? `(${categoryCounts[cat.id]})` : ''}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none material-symbols-outlined absolute right-2.5 top-2.5 text-[18px] text-slate-400">
                  expand_more
                </span>
              </div>

              {/* Platform Dropdown */}
              <div className="relative min-w-[150px]">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3.5 pr-8 text-xs font-semibold text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả nền tảng</option>
                  <option value="TikTok Shop">TikTok Shop</option>
                  <option value="Shopee Affiliate">Shopee Affiliate</option>
                  <option value="Shorts">Reels & Shorts</option>
                </select>
                <span className="pointer-events-none material-symbols-outlined absolute right-2.5 top-2.5 text-[18px] text-slate-400">
                  expand_more
                </span>
              </div>

              {/* Sort By Dropdown */}
              <div className="relative min-w-[160px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3.5 pr-8 text-xs font-semibold text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none cursor-pointer"
                  title="Sắp xếp danh sách chiến dịch"
                >
                  <option value="popular">Phổ biến nhất</option>
                  <option value="high-commission">Hoa hồng cao nhất</option>
                  <option value="spots-left">Nhiều suất nhất</option>
                  <option value="expiring-soon">Sắp hết hạn</option>
                </select>
                <span className="pointer-events-none material-symbols-outlined absolute right-2.5 top-2.5 text-[18px] text-slate-400">
                  sort
                </span>
              </div>

              {/* Reset filter button */}
              {(selectedCategory !== 'all' ||
                selectedFollowerTier !== 'all' ||
                selectedPlatform !== 'all' ||
                filterSampleOnly ||
                filterBudgetOnly ||
                filterHighCommOnly ||
                filterBookmarkedOnly ||
                sortBy !== 'popular' ||
                searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedFollowerTier('all');
                    setSelectedPlatform('all');
                    setFilterSampleOnly(false);
                    setFilterBudgetOnly(false);
                    setFilterHighCommOnly(false);
                    setFilterBookmarkedOnly(false);
                    setSortBy('popular');
                    onSearchChange('');
                  }}
                  className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Đặt lại bộ lọc"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  <span>Đặt lại</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-orange-600">category</span>
                Lọc theo danh mục ngành hàng:
              </span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
                >
                  Xem tất cả ({campaigns.length})
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] ?? 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        isSelected
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Follower Requirement Tiers */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-1">Quy mô kênh:</span>
            {followerTiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedFollowerTier(tier.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  selectedFollowerTier === tier.id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>

          {/* Special Benefit Checkboxes */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs font-medium text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterSampleOnly}
                onChange={(e) => setFilterSampleOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 accent-orange-500"
              />
              <span className="flex items-center gap-1 text-slate-800">
                <span className="material-symbols-outlined text-[16px] text-orange-600">inventory_2</span>
                Tặng SP Mẫu Miễn Phí
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterBudgetOnly}
                onChange={(e) => setFilterBudgetOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 accent-orange-500"
              />
              <span className="flex items-center gap-1 text-slate-800">
                <span className="material-symbols-outlined text-[16px] text-orange-600">payments</span>
                Thù lao Booking Cố Định
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterHighCommOnly}
                onChange={(e) => setFilterHighCommOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 accent-orange-500"
              />
              <span className="flex items-center gap-1 text-slate-800">
                <span className="material-symbols-outlined text-[16px] text-orange-600">percent</span>
                Hoa hồng cao (&gt;15%)
              </span>
            </label>

            <button
              type="button"
              onClick={() => setFilterBookmarkedOnly(!filterBookmarkedOnly)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                filterBookmarkedOnly
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-orange-50 hover:text-orange-700'
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${filterBookmarkedOnly ? 'text-white' : 'text-slate-400'}`}>
                favorite
              </span>
              <span>Đã lưu ({bookmarkedIds.length})</span>
            </button>

            <div className="ml-auto text-xs text-slate-500">
              Hiển thị <span className="font-bold text-slate-900">{filteredCampaigns.length}</span> chiến dịch
            </div>
          </div>
        </div>
      </section>

      {/* Active Category Filter Banner if selected */}
      {selectedCategory !== 'all' && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50/70 px-5 py-3 text-xs text-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">
                {categories.find((c) => c.id === selectedCategory)?.icon || 'filter_list'}
              </span>
            </span>
            <div>
              <div className="text-[11px] text-orange-800 font-medium">Đang lọc theo ngành hàng:</div>
              <div className="text-sm font-bold text-slate-900">
                {categories.find((c) => c.id === selectedCategory)?.label || selectedCategory}
                <span className="ml-2 inline-block rounded-full bg-orange-100 border border-orange-200 px-2 py-0.5 text-[11px] font-bold text-orange-800">
                  {filteredCampaigns.length} chiến dịch phù hợp
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedCategory('all')}
            className="flex items-center gap-1 rounded-xl bg-white border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-800 shadow-sm hover:bg-orange-50 transition-colors cursor-pointer"
          >
            <span>Xem tất cả ngành hàng</span>
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* 3. Campaign Cards Grid matching Image 1 & Image 9 */}
      <section>
        {filteredCampaigns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#c7c4d7] bg-white p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-[#767586]">search_off</span>
            <h3 className="mt-2 text-base font-bold text-[#131b2e]">Không tìm thấy chiến dịch phù hợp</h3>
            <p className="mt-1 text-xs text-[#767586]">
              Không có chiến dịch nào trong danh mục này thỏa mãn tất cả tiêu chí tìm kiếm.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedFollowerTier('all');
                setSelectedPlatform('all');
                setFilterSampleOnly(false);
                setFilterBudgetOnly(false);
                setFilterHighCommOnly(false);
                onSearchChange('');
              }}
              className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 shadow-sm cursor-pointer"
            >
              Xem tất cả chiến dịch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((camp) => {
              const quotaPercent = Math.round((camp.registeredSpots / camp.totalSpots) * 100);
              const spotsLeft = camp.totalSpots - camp.registeredSpots;
              const isBookmarked = bookmarkedIds.includes(camp.id);

              return (
                <div
                  key={camp.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-orange-200"
                >
                  {/* Top Image & Floating Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={camp.productHeroImage}
                      alt={camp.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>

                    {/* Category pill - Clickable to filter */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(camp.category);
                      }}
                      className="absolute left-3 top-3 flex items-center gap-1 rounded-lg bg-black/60 hover:bg-orange-600 transition-all px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md cursor-pointer group/cat"
                      title={`Nhấp để lọc danh mục: ${camp.category}`}
                    >
                      <span>{camp.category}</span>
                      <span className="material-symbols-outlined text-[12px] opacity-60 group-hover/cat:opacity-100">
                        filter_alt
                      </span>
                    </button>

                    {/* Top-Right Badges: Countdown + Bookmark */}
                    <div className="absolute right-3 top-3 flex items-center gap-1.5">
                      <div className="flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">
                        <span className="material-symbols-outlined text-[13px] text-amber-400">timer</span>
                        <span>Còn {camp.daysLeft} ngày</span>
                      </div>

                      {onToggleBookmark && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(camp);
                          }}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg backdrop-blur-md transition-all cursor-pointer ${
                            isBookmarked
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'bg-black/50 text-white hover:bg-rose-500 hover:text-white'
                          }`}
                          title={isBookmarked ? 'Bỏ lưu chiến dịch' : 'Lưu chiến dịch'}
                        >
                          <span className={`material-symbols-outlined text-[16px] ${isBookmarked ? 'fill-current' : ''}`}>
                            favorite
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Bottom overlay of the image: Brand Avatar & Brand Name & TikTok */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                      <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/80 bg-white shadow-sm">
                        <img
                          src={camp.brandLogo}
                          alt={camp.brandName}
                          className="h-full w-full object-contain p-0.5"
                        />
                      </div>
                      <span className="text-xs font-bold text-white drop-shadow-sm truncate">
                        {camp.brandName}
                      </span>
                      <span className="material-symbols-outlined text-[14px] text-orange-400 fill-current">
                        verified
                      </span>
                      {camp.tiktokUrl && (
                        <a
                          href={camp.tiktokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="ml-auto inline-flex items-center gap-1 rounded-full bg-black/60 hover:bg-black px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm transition-all hover:scale-105"
                          title={`Xem kênh TikTok ${camp.tiktokHandle}`}
                        >
                          <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.37a6.34 6.34 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.63a6.34 6.34 0 0 0 9.24 5.6 6.31 6.31 0 0 0 3.52-5.63V8.58c1.37.98 3.03 1.56 4.83 1.56V6.69z" />
                          </svg>
                          <span>{camp.tiktokHandle}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col p-4">
                    {/* Top Benefit Highlight Bar */}
                    <div className="mb-2 flex items-center justify-between gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800 border border-blue-200">
                        <span className="material-symbols-outlined text-[13px]">inventory_2</span>
                        Tặng mẫu 0đ
                      </span>
                      {camp.commissionRate && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-800 border border-orange-200">
                          <span className="material-symbols-outlined text-[13px] text-orange-600">percent</span>
                          HH {camp.commissionRate}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onSelectCampaign(camp)}
                      className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900 leading-snug line-clamp-2 cursor-pointer hover:text-orange-600 transition-colors"
                      title={camp.title}
                    >
                      {camp.title}
                    </h3>

                    {/* Platform & Follower Requirement tags */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        <span className="material-symbols-outlined text-[12px] text-slate-500">storefront</span>
                        {camp.platform}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        <span className="material-symbols-outlined text-[12px] text-slate-400">group</span>
                        {camp.followerRequirement}
                      </span>
                    </div>

                    {/* Quota Progress Meter */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-500">
                          Đã đăng ký: <b className="text-slate-900">{camp.registeredSpots}/{camp.totalSpots}</b>
                        </span>
                        <span className="font-semibold text-orange-700">
                          Còn {spotsLeft} suất
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-orange-500 transition-all"
                          style={{ width: `${quotaPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/50 p-3">
                    <button
                      id={`view-detail-${camp.id}`}
                      onClick={() => onSelectCampaign(camp)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 transition-colors cursor-pointer"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      id={`apply-btn-${camp.id}`}
                      onClick={() => onOpenApplyModal(camp)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-orange-500 py-2 text-center text-xs font-bold text-white shadow-sm hover:bg-orange-600 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Đăng ký ngay</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Dedicated Zalo Community Card */}
      <section className="mt-12 overflow-hidden rounded-3xl border border-orange-200/80 bg-gradient-to-r from-orange-50/50 via-white to-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white font-black text-base shadow-sm">
              Zalo
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 border border-orange-200 px-3 py-0.5 text-[11px] font-semibold text-orange-800 mb-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span>CỘNG ĐỒNG KOC VIỆT NAM (1.200+ THÀNH VIÊN)</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl font-extrabold text-slate-900">
                Tham gia Nhóm Zalo KOC để trao đổi trực tiếp với Admin & Brand
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Nhận thông báo khi có chiến dịch mới mở cổng nhận mẫu, được giải đáp thắc mắc về kịch bản video, đẩy nhanh tiến độ duyệt đơn và nghiệm thu thù lao trong ngày.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
            <a
              id="marketplace-bottom-zalo-btn"
              href={ZALO_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">group_add</span>
              <span>Tham gia nhóm Zalo ngay</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </div>
        </div>
      </section>

      {/* 5. Bottom Assurance Banner */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
              <span className="material-symbols-outlined text-xl">local_shipping</span>
            </div>
            <div>
              <h4 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900">
                Quy trình gửi mẫu hỏa tốc 24H & Bảo đảm hoa hồng KOC
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Brand trực tiếp xuất kho và tạo mã vận đơn ViettelPost / GHTK tự động ngay khi duyệt hồ sơ.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const topCamp = campaigns.find((c) => c.urgent) || campaigns[0];
              if (topCamp) onOpenApplyModal(topCamp);
            }}
            className="shrink-0 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 transition-colors cursor-pointer"
          >
            Đăng ký nhận mẫu ngay
          </button>
        </div>
      </section>
    </div>
  );
};
