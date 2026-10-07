import React, { useState, useMemo, useRef } from 'react';
import { Campaign, KOCUser } from '../types';
import { ZALO_GROUP_URL } from './ZaloCommunityWidget';
import kocityHeroStudio from '../assets/images/kocity_hero_studio.jpg';

interface MarketplaceViewProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onOpenApplyModal: (campaign: Campaign) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  bookmarkedIds?: string[];
  onToggleBookmark?: (campaign: Campaign) => void;
  currentUser?: KOCUser | null;
  heroImage?: string;
  onUpdateHeroImage?: (newImg: string) => Promise<boolean | void> | void;
  onResetHeroImage?: () => Promise<boolean | void> | void;
  onEditCampaign?: (campaign: Campaign) => void;
}

const TICKER_ITEMS = [
  {
    icon: 'local_shipping',
    iconColor: 'text-[#6366f1]',
    title: 'Mẫu 0đ giao hỏa tốc',
    desc: 'ViettelPost & GHTK toàn quốc',
  },
  {
    icon: 'videocam',
    iconColor: 'text-pink-600',
    title: 'KOC Studio & Unboxing',
    desc: 'Nhận sản phẩm trải nghiệm thật',
  },
  {
    icon: 'payments',
    iconColor: 'text-emerald-600',
    title: 'Hoa hồng minh bạch',
    desc: 'Đối soát trực tiếp về tài khoản 24h',
  },
  {
    icon: 'verified',
    iconColor: 'text-[#6366f1]',
    title: 'Brand chính hãng 100%',
    desc: 'Duyệt nhanh trong 12h',
  },
  {
    icon: 'hub',
    iconColor: 'text-purple-600',
    title: '12,450+ KOC hoạt động',
    desc: 'Thanh toán đối soát hơn 3.5 Tỷ VNĐ',
  },
];

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  campaigns,
  onSelectCampaign,
  onOpenApplyModal,
  searchQuery,
  onSearchChange,
  bookmarkedIds = [],
  onToggleBookmark,
  currentUser,
  heroImage: propHeroImage,
  onUpdateHeroImage,
  onResetHeroImage,
  onEditCampaign,
}) => {
  // Hàm tính số ngày còn lại theo thời gian thực
  const calculateDaysLeft = (endDateStr?: string, defaultDays: number = 15): number => {
    if (!endDateStr) return defaultDays;
    try {
      const end = new Date(endDateStr);
      const now = new Date();
      end.setHours(23, 59, 59, 999);
      now.setHours(0, 0, 0, 0);
      const diffTime = end.getTime() - now.getTime();
      return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } catch {
      return defaultDays;
    }
  };

  // Hero Image customisation (Admin can change or reset to default)
  const [localHeroImage, setLocalHeroImage] = useState<string>(() => {
    try {
      return localStorage.getItem('kocity_custom_hero_image') || kocityHeroStudio;
    } catch {
      return kocityHeroStudio;
    }
  });

  const activeHeroImage = propHeroImage || localHeroImage;

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [tempImagePreview, setTempImagePreview] = useState<string | null>(null);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Vui lòng chọn ảnh dung lượng dưới 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Nén tối ưu ảnh để đồng bộ Supabase & Realtime mượt mà
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1920;
            let width = img.width;
            let height = img.height;
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.85);
              setTempImagePreview(compressed);
            } else {
              setTempImagePreview(reader.result as string);
            }
          };
          img.src = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveHeroImage = async () => {
    const newImg = tempImagePreview || tempImageUrl.trim();
    if (newImg) {
      setIsSavingHero(true);
      setLocalHeroImage(newImg);
      try {
        localStorage.setItem('kocity_custom_hero_image', newImg);
      } catch (err) {
        console.warn('Could not save to localStorage', err);
      }

      if (onUpdateHeroImage) {
        try {
          await onUpdateHeroImage(newImg);
        } catch (err) {
          console.error('Error saving hero to Supabase:', err);
        }
      }
      setIsSavingHero(false);
      setIsImageModalOpen(false);
    }
  };

  const handleResetToDefault = async () => {
    setIsSavingHero(true);
    setLocalHeroImage(kocityHeroStudio);
    try {
      localStorage.removeItem('kocity_custom_hero_image');
    } catch (err) {
      console.warn('Could not remove from localStorage', err);
    }

    if (onResetHeroImage) {
      try {
        await onResetHeroImage();
      } catch (err) {
        console.error('Error resetting hero on Supabase:', err);
      }
    }
    setTempImagePreview(null);
    setTempImageUrl('');
    setIsSavingHero(false);
    setIsImageModalOpen(false);
  };

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
    { id: 'Chăm sóc cá nhân & Răng miệng', label: 'Chăm sóc cá nhân', icon: 'sentiment_very_satisfied' },
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
      {/* 1. Cinematic Full-Banner Hero with Studio Image */}
      <section className="relative overflow-hidden rounded-3xl min-h-[500px] sm:min-h-[540px] p-6 sm:p-10 lg:p-12 mb-4 border border-purple-100/90 shadow-md transition-shadow flex flex-col justify-center">
        {/* Full-Cover Background Image: Positioned so the subject is front and center on the right, 100% razor sharp */}
        <img
          src={activeHeroImage}
          alt="Kocity Hero Studio"
          className="absolute inset-0 h-full w-full object-cover object-center lg:object-[75%_center] transition-transform duration-700"
        />

        {/* Crisp Gradient Overlay: Strictly confined to the left text area (0% to 58%), leaving the right side 100% crystal-clear and vivid */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-[58%] bg-gradient-to-t from-white via-white/95 to-transparent lg:bg-gradient-to-r lg:from-white lg:via-white/95 lg:to-transparent pointer-events-none z-[1]"></div>

        {/* Admin Change Image Button (Chỉ hiển thị cho tài khoản Quản trị viên) */}
        {currentUser?.role === 'admin' && (
          <button
            type="button"
            onClick={() => {
              setTempImagePreview(null);
              setTempImageUrl('');
              setIsImageModalOpen(true);
            }}
            className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-2xl bg-black/60 hover:bg-black/85 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white shadow-lg border border-white/20 transition-all active:scale-95 cursor-pointer group/btn"
            title="Quản trị viên: Nhấp để thay đổi ảnh bìa full banner hoặc khôi phục ảnh mặc định"
          >
            <span className="material-symbols-outlined text-[16px] text-purple-300 group-hover/btn:rotate-12 transition-transform">
              photo_camera
            </span>
            <span>Đổi ảnh banner</span>
          </button>
        )}

        {/* Main Banner Content */}
        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Left Column (7 cols): Typography, Actions & Trust Proof */}
          <div className="lg:col-span-7 flex flex-col justify-center max-w-2xl">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50/90 border border-purple-200/90 px-3.5 py-1 text-xs font-bold tracking-wide mb-4 text-[#6366f1] shadow-xs self-start backdrop-blur-xs">
              <span className="material-symbols-outlined text-[16px] text-[#6366f1]">hub</span>
              <span>KOCITY • NỀN TẢNG KẾT NỐI KOC & BRAND</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-4xl lg:text-[44px] font-black tracking-tight leading-[1.16] text-slate-900">
              <span className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">
                500+ Brand.
              </span>{' '}
              Hàng nghìn cơ hội cho KOC.
            </h1>

            {/* Subtitle */}
            <p className="mt-3.5 text-sm sm:text-base text-slate-700 leading-relaxed max-w-xl font-semibold">
              Nhận mẫu 0đ <span className="text-purple-400 font-normal">·</span> Nhận booking <span className="text-purple-400 font-normal">·</span> Nhận hoa hồng minh bạch
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const topCamp = campaigns.find((c) => c.urgent) || campaigns[0];
                  if (topCamp) onSelectCampaign(topCamp);
                }}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">explore</span>
                <span>Khám phá chiến dịch</span>
              </button>

              <a
                id="hero-zalo-group-btn"
                href={ZALO_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-2xl bg-[#0068ff]/10 hover:bg-[#0068ff]/15 border border-[#0068ff]/25 px-5 py-3.5 text-xs sm:text-sm font-bold text-[#0068ff] shadow-xs active:scale-95 transition-all backdrop-blur-xs"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#0068ff] text-[10px] font-black text-white shadow-xs">
                  Z
                </span>
                <span>Vào nhóm Zalo KOC</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            </div>

            {/* Trust Badges Bar */}
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4 pt-4 border-t border-slate-200/80 text-xs text-slate-800 font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#6366f1]">verified</span>
                <span>Brand chính hãng</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-purple-600">inventory_2</span>
                <span>Mẫu 0đ tận tay</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-indigo-600">account_balance</span>
                <span>Đối soát minh bạch</span>
              </div>
            </div>

            {/* Mini Stats Bar */}
            <div className="mt-5 grid grid-cols-3 gap-3 pt-4 border-t border-slate-200/80">
              <div>
                <div className="font-['Plus_Jakarta_Sans'] text-lg sm:text-2xl font-black text-slate-900">500+</div>
                <div className="text-[11px] text-slate-500 font-semibold">Chiến dịch chính hãng</div>
              </div>
              <div>
                <div className="font-['Plus_Jakarta_Sans'] text-lg sm:text-2xl font-black text-slate-900">12,450+</div>
                <div className="text-[11px] text-slate-500 font-semibold">KOC đang hoạt động</div>
              </div>
              <div>
                <div className="font-['Plus_Jakarta_Sans'] text-lg sm:text-2xl font-black text-slate-900">3.5 Tỷ+</div>
                <div className="text-[11px] text-slate-500 font-semibold">Hoa hồng đối soát</div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Unobstructed open view of the studio creator image */}
          <div className="lg:col-span-5 hidden lg:block"></div>
        </div>
      </section>

      {/* 1.1 Thanh chạy ngang Live Ticker: Đặt xuống dưới chân hẳn của ô đầu trang */}
      <div className="w-full mb-8 overflow-hidden rounded-2xl bg-white/95 border border-purple-100 shadow-xs py-3 relative">
        {/* Hai bên fade mask mờ nhẹ */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10"></div>

        <style>{`
          @keyframes kocityInfiniteScroll {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .kocity-infinite-ticker {
            display: flex;
            width: max-content;
            will-change: transform;
            animation: kocityInfiniteScroll 30s linear infinite;
          }
        `}</style>

        <div className="kocity-infinite-ticker flex items-center gap-6 sm:gap-8">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 shrink-0 px-4 py-2 rounded-xl bg-purple-50/60 border border-purple-100/80 text-xs text-slate-800 font-semibold shadow-2xs hover:bg-white transition-colors"
            >
              <span className={`material-symbols-outlined text-[18px] ${item.iconColor}`}>
                {item.icon}
              </span>
              <span className="font-bold text-slate-900">{item.title}</span>
              <span className="text-purple-300 font-normal">•</span>
              <span className="text-[11px] text-slate-500 font-medium">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Filter & Command Center - Tinh gọn, thoáng đãng & tối ưu mobile */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs mb-8">
        <div className="flex flex-col gap-3.5">
          {/* Top Row: Search input, Platform & Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-[20px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm chiến dịch, tên brand, sản phẩm..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-9 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-[#6366f1] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-800 cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0">
              {/* Platform Dropdown */}
              <div className="relative min-w-[130px] sm:min-w-[145px]">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-3 pr-8 text-xs font-semibold text-slate-800 focus:border-[#6366f1] focus:bg-white focus:outline-none cursor-pointer"
                  title="Lọc theo nền tảng"
                >
                  <option value="all">Mọi nền tảng</option>
                  <option value="TikTok Shop">TikTok Shop</option>
                  <option value="Shopee Affiliate">Shopee Affiliate</option>
                  <option value="Shorts">Reels & Shorts</option>
                </select>
                <span className="pointer-events-none material-symbols-outlined absolute right-2.5 top-2.5 text-[18px] text-slate-400">
                  expand_more
                </span>
              </div>

              {/* Sort By Dropdown */}
              <div className="relative min-w-[135px] sm:min-w-[150px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-3 pr-8 text-xs font-semibold text-slate-800 focus:border-[#6366f1] focus:bg-white focus:outline-none cursor-pointer"
                  title="Sắp xếp danh sách"
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
                  className="flex items-center gap-1 shrink-0 rounded-2xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700 transition-colors cursor-pointer"
                  title="Đặt lại tất cả bộ lọc"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                  <span>Đặt lại</span>
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Category Chips Bar (Lướt ngang nhẹ nhàng) */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] ?? 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-md shadow-indigo-500/20'
                      : 'border border-slate-200/90 bg-white text-slate-700 hover:bg-indigo-50 hover:text-[#6366f1] hover:border-indigo-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 3: Quick Filter Pills (Tối giản, chuyển checkbox thành nút bấm hiện đại) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">LỌC NHANH:</span>
              
              <button
                type="button"
                onClick={() => setFilterSampleOnly(!filterSampleOnly)}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                  filterSampleOnly
                    ? 'border-[#6366f1] bg-indigo-50 text-[#6366f1] font-bold shadow-2xs'
                    : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] text-[#6366f1]">inventory_2</span>
                <span>Mẫu 0đ (Freecast)</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterHighCommOnly(!filterHighCommOnly)}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                  filterHighCommOnly
                    ? 'border-purple-300 bg-purple-50 text-purple-700 font-bold shadow-2xs'
                    : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] text-pink-600">percent</span>
                <span>Hoa hồng cao ≥9%</span>
              </button>

              {bookmarkedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterBookmarkedOnly(!filterBookmarkedOnly)}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                    filterBookmarkedOnly
                      ? 'border-rose-300 bg-rose-50 text-rose-700 font-bold shadow-2xs'
                      : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px] text-rose-500 fill-current">favorite</span>
                  <span>Đã lưu ({bookmarkedIds.length})</span>
                </button>
              )}

              {/* Follower dropdown gọn gàng */}
              <div className="relative inline-flex items-center">
                <select
                  value={selectedFollowerTier}
                  onChange={(e) => setSelectedFollowerTier(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 py-1 pl-2.5 pr-6 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer appearance-none"
                  title="Quy mô kênh yêu cầu"
                >
                  {followerTiers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id === 'all' ? 'Tất cả quy mô kênh' : t.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none material-symbols-outlined absolute right-1.5 text-[14px] text-slate-400">
                  expand_more
                </span>
              </div>
            </div>

            <div className="text-[11px] font-semibold text-slate-500 ml-auto">
              Hiển thị <b className="text-slate-900">{filteredCampaigns.length}</b> chiến dịch
            </div>
          </div>
        </div>
      </section>

      {/* Active Category Filter Banner if selected */}
      {selectedCategory !== 'all' && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-5 py-3 text-xs text-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">
                {categories.find((c) => c.id === selectedCategory)?.icon || 'filter_list'}
              </span>
            </span>
            <div>
              <div className="text-[11px] text-[#6366f1] font-semibold">Đang lọc theo ngành hàng:</div>
              <div className="text-sm font-bold text-slate-900">
                {categories.find((c) => c.id === selectedCategory)?.label || selectedCategory}
                <span className="ml-2 inline-block rounded-full bg-indigo-100 border border-indigo-200 px-2 py-0.5 text-[11px] font-bold text-[#6366f1]">
                  {filteredCampaigns.length} chiến dịch phù hợp
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedCategory('all')}
            className="flex items-center gap-1 rounded-xl bg-white border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-[#6366f1] shadow-sm hover:bg-indigo-50 transition-colors cursor-pointer"
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
              className="mt-4 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-2 text-xs font-bold text-white hover:opacity-95 shadow-sm cursor-pointer"
            >
              Xem tất cả chiến dịch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {filteredCampaigns.map((camp) => {
              const quotaPercent = Math.min(100, Math.round((camp.registeredSpots / camp.totalSpots) * 100));
              const spotsLeft = Math.max(0, camp.totalSpots - camp.registeredSpots);
              const isFull = spotsLeft <= 0;
              const isBookmarked = bookmarkedIds.includes(camp.id);

              return (
                <div
                  key={camp.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-purple-200"
                >
                  {/* Top Image & Floating Badges - Large 2-col aspect ratio */}
                  <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-100">
                    <img
                      src={camp.productHeroImage}
                      alt={camp.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>

                    {/* Category pill - Clickable to filter */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(camp.category);
                      }}
                      className="absolute left-3.5 top-3.5 flex items-center gap-1 rounded-xl bg-black/60 hover:bg-slate-900 transition-all px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md cursor-pointer group/cat shadow-xs"
                      title={`Nhấp để lọc danh mục: ${camp.category}`}
                    >
                      <span>{camp.category}</span>
                      <span className="material-symbols-outlined text-[13px] opacity-70 group-hover/cat:opacity-100">
                        filter_alt
                      </span>
                    </button>

                    {/* Top-Right Badges: Countdown + Edit (dành cho Admin) + Bookmark */}
                    <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 z-10">
                      {currentUser?.role === 'admin' && onEditCampaign && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditCampaign(camp);
                          }}
                          className="flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 backdrop-blur-md px-2.5 py-1.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                          title="Chỉnh sửa chiến dịch này (Đổi ảnh, sửa thông tin, ngày đếm ngược...)"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          <span>Sửa</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1 rounded-xl bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-xs">
                        <span className="material-symbols-outlined text-[14px] text-amber-400">timer</span>
                        <span>
                          {(() => {
                            const days = calculateDaysLeft(camp.endDate, camp.daysLeft);
                            return days > 0 ? `Còn ${days} ngày` : 'Hết hạn';
                          })()}
                        </span>
                      </div>

                      {onToggleBookmark && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(camp);
                          }}
                          className={`flex h-8 w-8 items-center justify-center rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-xs ${
                            isBookmarked
                              ? 'bg-rose-500 text-white shadow-md'
                              : 'bg-black/50 text-white hover:bg-rose-500 hover:text-white'
                          }`}
                          title={isBookmarked ? 'Bỏ lưu chiến dịch' : 'Lưu chiến dịch'}
                        >
                          <span className={`material-symbols-outlined text-[17px] ${isBookmarked ? 'fill-current' : ''}`}>
                            favorite
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Bottom overlay of the image: Brand Avatar & Brand Name & TikTok */}
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center gap-2.5">
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-xl border border-white/90 bg-white shadow-md">
                        <img
                          src={camp.brandLogo}
                          alt={camp.brandName}
                          className="h-full w-full object-contain p-0.5"
                        />
                      </div>
                      <span className="text-sm font-bold text-white drop-shadow-sm truncate">
                        {camp.brandName}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-blue-400 fill-current">
                        verified
                      </span>
                      {camp.tiktokUrl && (
                        <a
                          href={camp.tiktokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-black/60 hover:bg-black px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm transition-all hover:scale-105"
                          title={`Xem kênh TikTok ${camp.tiktokHandle}`}
                        >
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.37a6.34 6.34 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.63a6.34 6.34 0 0 0 9.24 5.6 6.31 6.31 0 0 0 3.52-5.63V8.58c1.37.98 3.03 1.56 4.83 1.56V6.69z" />
                          </svg>
                          <span>{camp.tiktokHandle}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Body Content - Larger and spacious for 2 cols */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    {/* Top Benefit Highlight Bar */}
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 border border-blue-200/80">
                        <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                        Tặng mẫu 0đ tận tay
                      </span>
                      {camp.commissionRate && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-extrabold text-[#6366f1] border border-purple-200">
                          <span className="material-symbols-outlined text-[15px] text-[#6366f1]">percent</span>
                          HH {camp.commissionRate}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onSelectCampaign(camp)}
                      className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-2 cursor-pointer hover:text-[#6366f1] transition-colors"
                      title={camp.title}
                    >
                      {camp.title}
                    </h3>

                    {/* Platform & Follower Requirement tags */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        <span className="material-symbols-outlined text-[14px] text-slate-500">storefront</span>
                        {camp.platform}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">group</span>
                        {camp.followerRequirement}
                      </span>
                    </div>

                    {/* Quota Progress Meter */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-500">
                          Đã đăng ký: <b className="text-slate-900">{camp.registeredSpots}/{camp.totalSpots} suất</b>
                        </span>
                        {isFull ? (
                          <span className="font-bold text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">block</span>
                            Đã hết slot
                          </span>
                        ) : (
                          <span className="font-bold text-[#6366f1]">
                            Còn {spotsLeft} suất nhận mẫu
                          </span>
                        )}
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all ${isFull ? 'bg-slate-400' : 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]'}`}
                          style={{ width: `${quotaPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/60 p-4">
                    <button
                      id={`view-detail-${camp.id}`}
                      onClick={() => onSelectCampaign(camp)}
                      className="flex-1 min-h-[44px] flex items-center justify-center rounded-xl border border-slate-200 bg-white py-2.5 sm:py-3 text-center text-xs sm:text-sm font-semibold text-slate-800 hover:bg-indigo-50 hover:text-[#6366f1] hover:border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                    >
                      Xem chi tiết
                    </button>
                    {isFull ? (
                      <button
                        id={`apply-btn-${camp.id}`}
                        disabled
                        className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-slate-200 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-bold text-slate-500 shadow-none cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[16px]">event_busy</span>
                        <span>Đã hết slot</span>
                      </button>
                    ) : (
                      <button
                        id={`apply-btn-${camp.id}`}
                        onClick={() => onOpenApplyModal(camp)}
                        className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] py-2.5 sm:py-3 text-center text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>Đăng ký nhận mẫu</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Dedicated Zalo Community Card */}
      <section className="mt-12 overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 shadow-md text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0068FF] text-white font-black text-base shadow-md">
              Zalo
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-0.5 text-[11px] font-semibold text-indigo-300 mb-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span>CỘNG ĐỒNG KOC VIỆT NAM (1.200+ THÀNH VIÊN)</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl font-extrabold text-white">
                Tham gia Nhóm Zalo KOC để trao đổi trực tiếp với Admin & Brand
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
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
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-95 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">group_add</span>
              <span>Tham gia nhóm Zalo ngay</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </div>
        </div>
      </section>

      {/* 5. Quy trình hợp tác 4 bước đơn giản */}
      <section className="mt-8 mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-[#6366f1] border border-indigo-200">
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
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6366f1] text-white font-bold text-xs shadow-sm">
                  1
                </span>
                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold text-[#6366f1]">
                  Duyệt 12h
                </span>
              </div>
              <h4 className="mt-3 font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900">
                Đăng ký tham gia
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#6366f1] shrink-0 mt-0.5">check</span>
                  <span>Kocity duyệt hồ sơ (12h)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#6366f1] shrink-0 mt-0.5">check</span>
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
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b5cf6] text-white font-bold text-xs shadow-sm">
                  2
                </span>
                <span className="rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[10px] font-semibold text-[#8b5cf6]">
                  Miễn phí 100%
                </span>
              </div>
              <h4 className="mt-3 font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900">
                KOC nhận mẫu tận nhà
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#8b5cf6] shrink-0 mt-0.5">local_shipping</span>
                  <span>Giao hàng GHTK tận nơi</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#8b5cf6] shrink-0 mt-0.5">schedule</span>
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
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6366f1] text-white font-bold text-xs shadow-sm">
                  3
                </span>
                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold text-[#6366f1]">
                  Nghiệm thu
                </span>
              </div>
              <h4 className="mt-3 font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900">
                KOC trả link video
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#6366f1] shrink-0 mt-0.5">link</span>
                  <span>Gửi link Google Drive / TikTok</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#6366f1] shrink-0 mt-0.5">verified</span>
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
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6366f1] text-white font-bold text-xs shadow-sm">
                  4
                </span>
                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-semibold text-[#6366f1]">
                  Tự động đối soát
                </span>
              </div>
              <h4 className="mt-3 font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900">
                Nhận hoa hồng & thù lao
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#6366f1] shrink-0 mt-0.5">shopping_cart</span>
                  <span>Phát sinh đơn hàng từ video</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#6366f1] shrink-0 mt-0.5">account_balance</span>
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

      {/* 6. Bottom Assurance Banner */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-md shadow-indigo-500/20">
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
            className="shrink-0 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all cursor-pointer"
          >
            Đăng ký nhận mẫu ngay
          </button>
        </div>
      </section>

      {/* 7. Modal Quản trị viên thay đổi ảnh Hero Banner (Chỉ Quản trị viên mới được thao tác) */}
      {isImageModalOpen && currentUser?.role === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-[#6366f1]">
                  <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900">
                    Cập nhật ảnh đại diện Kocity
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thay đổi hình ảnh Studio KOC hiển thị trên Hero Banner
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Current / Live Preview */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Xem trước hình ảnh (Preview):
              </label>
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img
                  src={tempImagePreview || tempImageUrl.trim() || activeHeroImage}
                  alt="Hero Preview"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cách 1: Tải ảnh từ máy tính của bạn
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-50 hover:border-[#6366f1] py-3 text-xs font-bold text-[#6366f1] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                  <span>Chọn tệp ảnh từ máy tính (PNG, JPG, WebP)</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cách 2: Hoặc dán đường dẫn ảnh (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/anh-koc-studio.jpg"
                  value={tempImageUrl}
                  onChange={(e) => {
                    setTempImageUrl(e.target.value);
                    if (tempImagePreview) setTempImagePreview(null);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#6366f1] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={isSavingHero}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-50 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                title="Khôi phục lại bức ảnh Studio unboxing mặc định"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-500">replay</span>
                <span>Khôi phục ảnh mặc định</span>
              </button>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  disabled={isSavingHero}
                  className="flex-1 sm:flex-none rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveHeroImage}
                  disabled={isSavingHero || (!tempImagePreview && !tempImageUrl.trim())}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-95 disabled:opacity-50 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isSavingHero ? 'sync' : 'check'}
                  </span>
                  <span>{isSavingHero ? 'Đang lưu lên hệ thống...' : 'Lưu & Đồng bộ Realtime'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
