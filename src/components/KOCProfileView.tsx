import React, { useState } from 'react';
import { KOCUser } from '../types';
import { APP_LOGOS } from '../data/mockData';
import { ZALO_GROUP_URL } from './ZaloCommunityWidget';

interface KOCProfileViewProps {
  currentUser: KOCUser | null;
  onSaveProfile: (updatedUser: KOCUser) => void;
  onExploreCampaigns: () => void;
  onOpenLogin?: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

const CATEGORY_OPTIONS = [
  'Làm đẹp & Mỹ phẩm',
  'Thời trang & Phụ kiện',
  'Đồ công nghệ & Setup',
  'Gia dụng & Đời sống',
  'Mẹ & Bé',
  'Ẩm thực & Đồ uống',
  'Sức khỏe & Thể thao',
  'Du lịch & Trải nghiệm',
];

const CONTENT_STYLES = [
  'Review chân thực & Khách quan',
  'Unboxing & ASMR',
  'Hướng dẫn & Tips/Tricks',
  'VLOG Đời sống hàng ngày',
  'Kịch bản hài hước & Tình huống',
  'Mix & Match / Phối đồ',
];

// Quick starter presets for creators to get started in 1 click
const QUICK_PRESETS: Array<{
  title: string;
  subtitle: string;
  icon: string;
  data: Partial<KOCUser>;
}> = [
  {
    title: 'KOC Beauty & Skincare',
    subtitle: 'Chuyên mỹ phẩm, chăm sóc da & makeup',
    icon: 'face_retouching_natural',
    data: {
      name: 'Nguyễn Minh Thư',
      avatar: APP_LOGOS.userProfile,
      tiktokHandle: '@minhthu.beauty',
      channelLink: 'https://www.tiktok.com/@minhthu.beauty',
      followers: '120K',
      avgViews: '35K views',
      engagementRate: '6.8%',
      phone: '0908.123.456',
      email: 'minhthu.koc@gmail.com',
      city: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      address: 'Số 45 Lê Duẩn, Phường Bến Nghé',
      shippingNote: 'Giao trong giờ hành chính, gọi trước khi đến 15 phút',
      bio: 'Chuyên review mỹ phẩm thuần chay & tips makeup tự nhiên cho bạn gái đi làm, đi học.',
      categories: ['Làm đẹp & Mỹ phẩm', 'Gia dụng & Đời sống'],
      contentStyle: ['Review chân thực & Khách quan', 'Unboxing & ASMR', 'Hướng dẫn & Tips/Tricks'],
      targetAudience: 'Nữ 18 - 30 tuổi, học sinh sinh viên & nhân viên văn phòng yêu thích làm đẹp',
      acceptFreecast: true,
      minBookingRate: 'Mẫu 0đ + Hoa hồng 10-15%',
      allowSparkAds: true,
      portfolioDriveLink: 'https://drive.google.com/drive/folders/minhthu-koc-portfolio',
    },
  },
  {
    title: 'KOC Tech & Setup',
    subtitle: 'Chuyên phụ kiện điện thoại, đồ setup & đồ chơi công nghệ',
    icon: 'devices',
    data: {
      name: 'Phạm Minh Triết',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA4oEUAMUB0pptZhm8UKIa6kW-gCMu5DChHl3AFEV0HmGGTNPD2XMM80kyyAE_H0S8gTyQE8ZvVrHjdOjlJ4epGsrvt1o1QFJeoK2FHC-DkCjhgV46Ucsc280QeQ7Uo9qLpQPqy-yNQ-o87qd4sUqJ4P9EHZmwhHtE-6VCWEtwMPbTKHAgib-43GdNTVEG6euxp_aRzUSiL8bGiylDrUe-zw27XUVtCfBpJsedRy9xNc95znPFfxhxu',
      tiktokHandle: '@triet_gadget_review',
      channelLink: 'https://www.tiktok.com/@triet_gadget_review',
      followers: '85K',
      avgViews: '48K views',
      engagementRate: '7.2%',
      phone: '0944.551.233',
      email: 'triet.techgadgets@gmail.com',
      city: 'Hà Nội',
      district: 'Nam Từ Liêm',
      address: 'Toà S2.05 Vinhome Smart City, Tây Mỗ',
      shippingNote: 'Gửi lễ tân hoặc gọi trực tiếp',
      bio: 'Đánh giá chân thực phụ kiện công nghệ ngon - bổ - rẻ cho dân văn phòng và game thủ.',
      categories: ['Đồ công nghệ & Setup', 'Gia dụng & Đời sống'],
      contentStyle: ['Review chân thực & Khách quan', 'Hướng dẫn & Tips/Tricks'],
      targetAudience: 'Nam/Nữ 18 - 35 tuổi, người yêu công nghệ & sinh viên',
      acceptFreecast: true,
      minBookingRate: 'Freecast (Mẫu 0đ) hoặc Booking 500k/video',
      allowSparkAds: true,
      portfolioDriveLink: 'https://drive.google.com/drive/folders/triet-gadgets',
    },
  },
  {
    title: 'KOC Fashion & OOTD',
    subtitle: 'Chuyên thời trang nữ, phối đồ, giày dép & túi xách',
    icon: 'styler',
    data: {
      name: 'Lê Hoàng Quỳnh Anh',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCQfB6yKqVd4TfW7E3b3sA1W2Z2O6XkI6K9Y0L_9F4T7J8R5Q2N1M3P4K5L6X7C8V9B0N1M2Q3W4E5R6T7Y8U9I0O1P',
      tiktokHandle: '@quynhanh.ootd',
      channelLink: 'https://www.tiktok.com/@quynhanh.ootd',
      followers: '68K',
      avgViews: '28K views',
      engagementRate: '8.1%',
      phone: '0912.334.889',
      email: 'quynhanh.fashion@gmail.com',
      city: 'Đà Nẵng',
      district: 'Hải Châu',
      address: '124 Bạch Đằng, Phường Hải Châu 1',
      shippingNote: 'Giao giờ hành chính',
      bio: 'Gợi ý outfit mỗi ngày, hack dáng cho các nàng nấm lùn. Săn deal thời trang chất lượng.',
      categories: ['Thời trang & Phụ kiện', 'Làm đẹp & Mỹ phẩm'],
      contentStyle: ['Mix & Match / Phối đồ', 'Review chân thực & Khách quan', 'VLOG Đời sống hàng ngày'],
      targetAudience: 'Nữ 16 - 28 tuổi, học sinh sinh viên thích mặc đẹp',
      acceptFreecast: true,
      minBookingRate: 'Mẫu 0đ + Hoa hồng 10%',
      allowSparkAds: true,
      portfolioDriveLink: 'https://drive.google.com/drive/folders/quynhanh-ootd',
    },
  },
];

export const KOCProfileView: React.FC<KOCProfileViewProps> = ({
  currentUser,
  onSaveProfile,
  onExploreCampaigns,
  onOpenLogin,
  onShowToast,
}) => {
  // 1. If user has not logged in yet: Profile requires login/registration
  if (!currentUser) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-12 shadow-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 shadow-sm">
            <span className="material-symbols-outlined text-3xl">badge</span>
          </div>

          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3.5 py-1 text-xs font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            YÊU CẦU ĐĂNG NHẬP
          </div>

          <h1 className="mt-3 font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-slate-900">
            Đăng nhập để xem & quản lý Hồ sơ KOC
          </h1>

          <p className="mt-3 max-w-lg mx-auto text-xs sm:text-sm text-slate-600 leading-relaxed">
            Hồ sơ KOC chứa thông tin liên hệ, kênh TikTok, địa chỉ nhận quà mẫu hỏa tốc và Media Kit cá nhân. Vui lòng đăng nhập hoặc đăng ký tài khoản để tạo và quản lý hồ sơ của bạn.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Đăng nhập ngay</span>
              </button>
            )}
            <button
              onClick={onExploreCampaigns}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              <span>Khám phá chiến dịch</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form State initialized from currentUser or fallback defaults
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || APP_LOGOS.userProfile);
  const [tiktokHandle, setTiktokHandle] = useState(currentUser?.tiktokHandle || '');
  const [channelLink, setChannelLink] = useState(
    currentUser?.channelLink || (currentUser?.tiktokHandle ? `https://www.tiktok.com/${currentUser.tiktokHandle}` : '')
  );
  const [followers, setFollowers] = useState(currentUser?.followers || '');
  const [avgViews, setAvgViews] = useState(currentUser?.avgViews || '20K views');
  const [engagementRate, setEngagementRate] = useState(currentUser?.engagementRate || '6.5%');
  const [instagramHandle, setInstagramHandle] = useState(currentUser?.instagramHandle || '');
  const [youtubeHandle, setYoutubeHandle] = useState(currentUser?.youtubeHandle || '');

  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [city, setCity] = useState(currentUser?.city || 'TP. Hồ Chí Minh');
  const [district, setDistrict] = useState(currentUser?.district || 'Quận 1');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [shippingNote, setShippingNote] = useState(
    currentUser?.shippingNote || 'Giao giờ hành chính, gọi trước khi đến'
  );

  const [bio, setBio] = useState(
    currentUser?.bio || 'KOC chuyên sản xuất video review chân thực, giàu năng lượng và gắn link giỏ hàng TikTok Shop.'
  );
  const [categories, setCategories] = useState<string[]>(
    currentUser?.categories && currentUser.categories.length > 0
      ? currentUser.categories
      : ['Làm đẹp & Mỹ phẩm', 'Thời trang & Phụ kiện']
  );
  const [contentStyle, setContentStyle] = useState<string[]>(
    currentUser?.contentStyle && currentUser.contentStyle.length > 0
      ? currentUser.contentStyle
      : ['Review chân thực & Khách quan', 'Unboxing & ASMR']
  );
  const [targetAudience, setTargetAudience] = useState(
    currentUser?.targetAudience || 'Khán giả độ tuổi 18-30, học sinh sinh viên & dân văn phòng thích mua sắm online.'
  );
  const [acceptFreecast, setAcceptFreecast] = useState(
    currentUser?.acceptFreecast !== undefined ? currentUser.acceptFreecast : true
  );
  const [minBookingRate, setMinBookingRate] = useState(
    currentUser?.minBookingRate || 'Mẫu 0đ (Freecast) + Hoa hồng Affiliate 8% - 15%'
  );
  const [allowSparkAds, setAllowSparkAds] = useState(
    currentUser?.allowSparkAds !== undefined ? currentUser.allowSparkAds : true
  );
  const [portfolioDriveLink, setPortfolioDriveLink] = useState(
    currentUser?.portfolioDriveLink || ''
  );

  // Active Tab within Profile Form
  const [activeTab, setActiveTab] = useState<'channel' | 'address' | 'rates' | 'mediaKit'>('channel');

  // Preview Card Modal toggle
  const [showMediaKitModal, setShowMediaKitModal] = useState(false);

  // Apply Quick Preset
  const handleApplyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    const d = preset.data;
    if (d.name) setName(d.name);
    if (d.avatar) setAvatar(d.avatar);
    if (d.tiktokHandle) setTiktokHandle(d.tiktokHandle);
    if (d.channelLink) setChannelLink(d.channelLink);
    if (d.followers) setFollowers(d.followers);
    if (d.avgViews) setAvgViews(d.avgViews);
    if (d.engagementRate) setEngagementRate(d.engagementRate);
    if (d.phone) setPhone(d.phone);
    if (d.email) setEmail(d.email);
    if (d.city) setCity(d.city);
    if (d.district) setDistrict(d.district);
    if (d.address) setAddress(d.address);
    if (d.shippingNote) setShippingNote(d.shippingNote);
    if (d.bio) setBio(d.bio);
    if (d.categories) setCategories(d.categories);
    if (d.contentStyle) setContentStyle(d.contentStyle);
    if (d.targetAudience) setTargetAudience(d.targetAudience);
    if (d.acceptFreecast !== undefined) setAcceptFreecast(d.acceptFreecast);
    if (d.minBookingRate) setMinBookingRate(d.minBookingRate);
    if (d.allowSparkAds !== undefined) setAllowSparkAds(d.allowSparkAds);
    if (d.portfolioDriveLink) setPortfolioDriveLink(d.portfolioDriveLink);

    onShowToast('Đã áp dụng mẫu thông tin!', preset.title, 'success');
  };

  // Toggle Category
  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Toggle Content Style
  const toggleStyle = (st: string) => {
    setContentStyle((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  // Handle Save
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      onShowToast('Thiếu thông tin!', 'Vui lòng nhập họ và tên KOC.', 'warning');
      return;
    }
    if (!tiktokHandle.trim()) {
      onShowToast('Thiếu thông tin!', 'Vui lòng nhập TikTok @handle.', 'warning');
      return;
    }

    const formattedHandle = tiktokHandle.startsWith('@') ? tiktokHandle : `@${tiktokHandle}`;

    const updatedUser: KOCUser = {
      id: currentUser?.id || `koc-${Date.now()}`,
      name: name.trim(),
      avatar: avatar || APP_LOGOS.userProfile,
      tiktokHandle: formattedHandle,
      followers: followers.trim() || '15K+',
      phone: phone.trim() || '0908.888.999',
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      verified: true,
      bio: bio.trim(),
      categories,
      avgViews,
      engagementRate,
      channelLink: channelLink || `https://www.tiktok.com/${formattedHandle}`,
      instagramHandle,
      youtubeHandle,
      city,
      district,
      address,
      shippingNote,
      targetAudience,
      contentStyle,
      acceptFreecast,
      minBookingRate,
      allowSparkAds,
      portfolioDriveLink,
      sampleDeliveredCount: currentUser?.sampleDeliveredCount || 2,
      completedVideosCount: currentUser?.completedVideosCount || 2,
    };

    onSaveProfile(updatedUser);
    onShowToast(
      currentUser ? 'Đã cập nhật hồ sơ KOC!' : 'Tạo hồ sơ KOC thành công!',
      `Hồ sơ của bạn đã sẵn sàng nhận mẫu từ 500+ nhãn hàng.`,
      'success'
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-150">
      {/* Top Banner Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </span>
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-slate-900">
              {currentUser ? 'Hồ sơ KOC & Media Kit' : 'Tạo hồ sơ KOC mới'}
            </h1>
            <span className="rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-xs font-bold text-orange-800">
              {currentUser ? 'Đã kích hoạt' : 'Miễn phí 100%'}
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
            {currentUser
              ? 'Quản lý thông tin kênh, địa chỉ nhận hàng mẫu hỏa tốc và hồ sơ năng lực Media Kit gửi nhãn hàng.'
              : 'Điền thông tin một lần để tự động điền form nhận mẫu 0đ và nhận booking từ hơn 500+ Brand hàng đầu.'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {currentUser && (
            <button
              onClick={() => setShowMediaKitModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-orange-600">visibility</span>
              <span>Xem trước Media Kit</span>
            </button>
          )}

          <button
            id="save-koc-profile-btn"
            onClick={() => handleSave()}
            className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{currentUser ? 'Lưu thay đổi hồ sơ' : 'Kích hoạt hồ sơ KOC ngay'}</span>
          </button>
        </div>
      </div>

      {/* Quick 1-Click Starter Presets (especially helpful for new creators or fast exploration) */}
      <div className="mb-8 rounded-3xl border border-orange-200/80 bg-orange-50/50 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-600 text-[20px]">auto_fix_high</span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-bold text-orange-950">
              Gợi ý điền nhanh mẫu KOC (1 chạm để trải nghiệm ngay)
            </h2>
          </div>
          <span className="text-[11px] text-orange-800 font-medium">
            Bấm chọn để tự động điền thông tin kênh & địa chỉ mẫu
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {QUICK_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="group flex flex-col text-left rounded-2xl border border-white bg-white p-4 shadow-sm hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-700 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">{preset.icon}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {preset.title}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-orange-800 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                  {preset.data.followers}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">{preset.subtitle}</p>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="font-mono text-slate-700">{preset.data.tiktokHandle}</span>
                <span className="font-semibold text-orange-600 group-hover:underline flex items-center gap-0.5">
                  Áp dụng <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Column (Media Kit Live Card) & Right Column (Detailed Profile Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Media Kit Preview Card (Sticky on desktop) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            {/* Top Badge & Verified Banner */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  KOC Hub Verified
                </span>
              </div>
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-extrabold text-orange-800 border border-orange-200">
                ⭐ 5.0 KOC Rating
              </span>
            </div>

            {/* Avatar & Main Info */}
            <div className="mt-5 text-center">
              <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-2xl border-4 border-orange-100 shadow-sm group">
                <img
                  src={avatar || APP_LOGOS.userProfile}
                  alt={name || 'KOC Avatar'}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newUrl = prompt('Nhập URL ảnh đại diện KOC mới:', avatar);
                    if (newUrl && newUrl.trim()) setAvatar(newUrl.trim());
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
                  title="Thay đổi ảnh đại diện"
                >
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                  Đổi ảnh
                </button>
              </div>

              <h3 className="mt-3 font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-slate-900">
                {name || 'Tên KOC của bạn'}
              </h3>
              <p className="font-mono text-xs font-semibold text-orange-700">
                {tiktokHandle ? (tiktokHandle.startsWith('@') ? tiktokHandle : `@${tiktokHandle}`) : '@your_tiktok_handle'}
              </p>
              <p className="mt-2 text-xs text-slate-600 line-clamp-2 px-2">
                {bio || 'Chưa cập nhật phần tự giới thiệu ngắn cho nhãn hàng.'}
              </p>
            </div>

            {/* 4 Core Vital Metrics */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 rounded-2xl bg-slate-50 p-3 border border-slate-100">
              <div className="text-center p-2 rounded-xl bg-white border border-slate-100">
                <span className="text-[10px] font-medium text-slate-500 block">Followers</span>
                <span className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-extrabold text-slate-900">
                  {followers || '0'}
                </span>
              </div>
              <div className="text-center p-2 rounded-xl bg-white border border-slate-100">
                <span className="text-[10px] font-medium text-slate-500 block">Avg Views</span>
                <span className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-extrabold text-orange-600">
                  {avgViews || '20K'}
                </span>
              </div>
              <div className="text-center p-2 rounded-xl bg-white border border-slate-100">
                <span className="text-[10px] font-medium text-slate-500 block">Tương tác</span>
                <span className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-extrabold text-emerald-600">
                  {engagementRate || '6.5%'}
                </span>
              </div>
              <div className="text-center p-2 rounded-xl bg-white border border-slate-100">
                <span className="text-[10px] font-medium text-slate-500 block">Đã duyệt mẫu</span>
                <span className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-extrabold text-slate-900">
                  {currentUser?.sampleDeliveredCount || 2} chiến dịch
                </span>
              </div>
            </div>

            {/* Categories tags preview */}
            <div className="mt-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Ngành hàng thế mạnh
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-semibold text-orange-800"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Collaboration terms preview */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                  Mẫu 0đ (Freecast)
                </span>
                <b className="text-emerald-700">{acceptFreecast ? 'Sẵn sàng' : 'Không nhận'}</b>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-orange-600">bolt</span>
                  Cấp mã Spark Ads
                </span>
                <b className="text-orange-700">{allowSparkAds ? 'Đồng ý' : 'Thỏa thuận'}</b>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-500">location_on</span>
                  Khu vực giao mẫu
                </span>
                <b className="text-slate-900 truncate max-w-[140px]">{city || 'Toàn quốc'}</b>
              </div>
            </div>

            {/* Quick action button to copy Media Kit link */}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(
                  `https://kochub.vn/koc/${tiktokHandle.replace('@', '') || 'creator'}`
                );
                onShowToast('Đã sao chép link Media Kit KOC!', 'Chia sẻ link cho Brand để nhận booking trực tiếp.', 'success');
              }}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 py-2.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span>Sao chép link Media Kit</span>
            </button>
          </div>

          {/* Quick Direct Link to Zalo Group */}
          <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-[10px] font-black text-white shadow-sm">
                Z
              </span>
              <span className="text-xs font-bold text-orange-950">
                Cộng đồng KOC nhận mẫu Zalo
              </span>
            </div>
            <p className="text-[11px] text-orange-900 mb-3">
              Tham gia nhóm để nhận thông báo chiến dịch booking riêng và được hỗ trợ duyệt mã mẫu hỏa tốc.
            </p>
            <a
              href={ZALO_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 py-2 text-xs font-bold text-white shadow-sm transition-all"
            >
              <span>Vào nhóm Zalo KOC</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          </div>
        </div>

        {/* Right Column: Detailed Form Tabs */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          {/* Sub Tab Navigation */}
          <div className="flex border-b border-slate-200 pb-3 gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('channel')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'channel'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">smart_display</span>
              <span>1. Kênh TikTok & Chỉ số</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('address')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'address'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              <span>2. Địa chỉ nhận hàng mẫu</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rates')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'rates'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">category</span>
              <span>3. Chuyên môn & Hợp tác</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mediaKit')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mediaKit'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">video_library</span>
              <span>4. Portfolio & Bio</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="mt-6 space-y-6">
            {/* TAB 1: Kênh TikTok & Chỉ số */}
            {activeTab === 'channel' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="rounded-2xl bg-orange-50/60 p-4 border border-orange-200">
                  <h3 className="text-xs font-bold text-orange-950 flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[16px] text-orange-600">verified</span>
                    Khai báo chỉ số kênh chính xác
                  </h3>
                  <p className="text-[11px] text-orange-900">
                    Đội ngũ duyệt chiến dịch sẽ kiểm tra trực tiếp kênh TikTok của bạn. Số liệu minh bạch giúp hồ sơ được duyệt gửi mẫu 0đ nhanh trong 12h.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Họ và tên KOC / Creator <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Minh Thư"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      TikTok Handle (@username) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">@</span>
                      <input
                        type="text"
                        value={tiktokHandle.replace('@', '')}
                        onChange={(e) => setTiktokHandle(e.target.value)}
                        placeholder="minhthu.beauty"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Đường dẫn link kênh TikTok <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={channelLink}
                    onChange={(e) => setChannelLink(e.target.value)}
                    placeholder="https://www.tiktok.com/@minhthu.beauty"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Số lượng người theo dõi (Followers)
                    </label>
                    <input
                      type="text"
                      value={followers}
                      onChange={(e) => setFollowers(e.target.value)}
                      placeholder="Ví dụ: 120K hoặc 50.000"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Lượt xem trung bình / video
                    </label>
                    <input
                      type="text"
                      value={avgViews}
                      onChange={(e) => setAvgViews(e.target.value)}
                      placeholder="Ví dụ: 25K views"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Tỷ lệ tương tác ước tính
                    </label>
                    <input
                      type="text"
                      value={engagementRate}
                      onChange={(e) => setEngagementRate(e.target.value)}
                      placeholder="Ví dụ: 6.8%"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Kênh Instagram (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      placeholder="@minhthu.insta"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Kênh YouTube (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={youtubeHandle}
                      onChange={(e) => setYoutubeHandle(e.target.value)}
                      placeholder="@MinhThuVlogs"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('address')}
                    className="flex items-center gap-1 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 cursor-pointer"
                  >
                    <span>Tiếp: Địa chỉ nhận mẫu</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Địa chỉ nhận hàng mẫu */}
            {activeTab === 'address' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="rounded-2xl bg-orange-50/60 p-4 border border-orange-200">
                  <h3 className="text-xs font-bold text-orange-950 flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[16px] text-orange-600">local_shipping</span>
                    Giao mẫu hỏa tốc tận tay (0đ phí vận chuyển)
                  </h3>
                  <p className="text-[11px] text-orange-900">
                    Khi Brand duyệt hồ sơ, sản phẩm quà mẫu sẽ được tự động điều phối tới địa chỉ này qua GHTK / ViettelPost. Hãy điền chính xác để shipper liên hệ.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Số điện thoại nhận hàng & Zalo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0908.xxx.xxx"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Email nhận mã vận đơn & thông báo
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="koc.contact@gmail.com"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Tỉnh / Thành phố <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Hải Phòng">Hải Phòng</option>
                      <option value="Cần Thơ">Cần Thơ</option>
                      <option value="Bình Dương">Bình Dương</option>
                      <option value="Đồng Nai">Đồng Nai</option>
                      <option value="Tỉnh thành khác">Tỉnh thành khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Quận / Huyện <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Ví dụ: Quận 1, Cầu Giấy, Hải Châu..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Số nhà, tên đường, phường/xã, toà chung cư chi tiết <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ví dụ: Tầng 8 Toà S2.05 Vinhome Smart City, Tây Mỗ"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Ghi chú giao hàng cho Shipper GHTK / ViettelPost
                  </label>
                  <input
                    type="text"
                    value={shippingNote}
                    onChange={(e) => setShippingNote(e.target.value)}
                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến 15 phút, gửi lễ tân nếu vắng nhà."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('channel')}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Quay lại</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('rates')}
                    className="flex items-center gap-1 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 cursor-pointer"
                  >
                    <span>Tiếp: Chuyên môn & Hợp tác</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Chuyên môn & Hợp tác */}
            {activeTab === 'rates' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Lĩnh vực / Chuyên mục sáng tạo nội dung chính (Chọn tối đa 4)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CATEGORY_OPTIONS.map((cat) => {
                      const isSelected = categories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`flex items-center justify-center rounded-xl p-2.5 text-xs font-semibold border transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Phong cách video & Định dạng nội dung
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CONTENT_STYLES.map((st) => {
                      const isSelected = contentStyle.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => toggleStyle(st)}
                          className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold border transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-orange-600' : 'text-slate-400'}`}>
                            {isSelected ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                          <span>{st}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Đối tượng khán giả chính (Target Demographics)
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Ví dụ: Nữ 18-28 tuổi, học sinh sinh viên thích skincare & đồ tiện ích giá rẻ..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Điều kiện nhận mẫu & Hợp tác Brand
                  </h4>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptFreecast}
                      onChange={(e) => setAcceptFreecast(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 accent-orange-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        Chấp nhận nhận Mẫu 0đ (Freecast) kèm Hoa hồng Affiliate
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Brand gửi mẫu quà tặng 100% miễn phí, bạn làm video trải nghiệm và nhận hoa hồng trên mỗi đơn phát sinh (8% - 15%).
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowSparkAds}
                      onChange={(e) => setAllowSparkAds(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 accent-orange-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        Sẵn sàng cấp mã Spark Ads TikTok để Brand chạy quảng cáo
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Giúp video của bạn tiếp cận hàng trăm nghìn người xem, bùng nổ GMV hoa hồng mà không tốn chi phí.
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Mức thù lao / Báo giá mong muốn (Rate card)
                  </label>
                  <input
                    type="text"
                    value={minBookingRate}
                    onChange={(e) => setMinBookingRate(e.target.value)}
                    placeholder="Ví dụ: Mẫu 0đ + Hoa hồng hoặc 500k - 1tr/video nếu có booking fee"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('address')}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Quay lại</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('mediaKit')}
                    className="flex items-center gap-1 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 cursor-pointer"
                  >
                    <span>Tiếp: Portfolio & Bio</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: Portfolio & Bio */}
            {activeTab === 'mediaKit' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Lời giới thiệu ngắn (Bio Media Kit gửi nhãn hàng)
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Mô tả phong cách làm video, định hướng nội dung và cam kết chất lượng của bạn với Brand..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Link Google Drive Portfolio / Video mẫu tiêu biểu (Nếu có)
                  </label>
                  <input
                    type="url"
                    value={portfolioDriveLink}
                    onChange={(e) => setPortfolioDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/your-koc-portfolio"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Gắn link Google Drive chứa video review mẫu hoặc ảnh screenshot chỉ số tài khoản TikTok Shop.
                  </p>
                </div>

                {/* Final Verification Checklist */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-emerald-700">verified</span>
                    Quyền lợi sau khi tạo hồ sơ KOC tại KOCHub:
                  </h4>
                  <ul className="text-xs text-emerald-800 space-y-1.5 list-disc pl-5">
                    <li>Duyệt nhanh hồ sơ nhận mẫu trong vòng 12h thay vì 48h thông thường.</li>
                    <li>Tự động điền nhanh form đăng ký nhận mẫu quà 0đ với một click.</li>
                    <li>Được nhãn hàng chủ động gửi lời mời booking chiến dịch độc quyền.</li>
                    <li>Trao đổi trực tiếp với đại diện Brand qua nhóm hỗ trợ Zalo.</li>
                  </ul>
                </div>

                {/* Submit button bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('rates')}
                    className="w-full sm:w-auto flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Quay lại</span>
                  </button>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onExploreCampaigns}
                      className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Khám phá chiến dịch
                    </button>

                    <button
                      type="submit"
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                      <span>{currentUser ? 'Lưu cập nhật hồ sơ' : 'Hoàn tất & Kích hoạt hồ sơ KOC'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Media Kit Fullscreen Preview Modal */}
      {showMediaKitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl overflow-hidden my-8">
            <button
              onClick={() => setShowMediaKitModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="text-center mb-6">
              <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-extrabold text-orange-800 border border-orange-200 uppercase tracking-wider">
                Thẻ Media Kit KOC Chính Thức
              </span>
              <h3 className="mt-2 font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-slate-900">
                {name || 'Hồ sơ KOC'}
              </h3>
              <p className="font-mono text-xs text-orange-600">{tiktokHandle || '@creator'}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={avatar || APP_LOGOS.userProfile}
                  alt={name}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-orange-200"
                />
                <div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{bio}</p>
                  <p className="mt-1 text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-orange-600">location_on</span>
                    {address ? `${district}, ${city}` : city}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-200">
                <div className="rounded-xl bg-white p-2.5 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Followers</span>
                  <b className="text-sm text-slate-900 font-['Plus_Jakarta_Sans']">{followers || '0'}</b>
                </div>
                <div className="rounded-xl bg-white p-2.5 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Avg Views</span>
                  <b className="text-sm text-orange-600 font-['Plus_Jakarta_Sans']">{avgViews || '20K'}</b>
                </div>
                <div className="rounded-xl bg-white p-2.5 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Tương tác</span>
                  <b className="text-sm text-emerald-600 font-['Plus_Jakarta_Sans']">{engagementRate || '6.5%'}</b>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Thế mạnh nội dung:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((c, i) => (
                    <span key={i} className="rounded-lg bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://kochub.vn/koc/${tiktokHandle.replace('@', '') || 'creator'}`
                  );
                  onShowToast('Đã sao chép link Media Kit!', '', 'success');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
                <span>Chia sẻ Media Kit</span>
              </button>
              <button
                onClick={() => setShowMediaKitModal(false)}
                className="flex-1 rounded-xl bg-orange-500 py-2.5 text-xs font-bold text-white hover:bg-orange-600 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
