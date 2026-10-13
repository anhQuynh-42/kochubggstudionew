import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { KOCUser } from '../types';
import { APP_LOGOS } from '../data/mockData';

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
      gmv: '150M+/tháng',
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
      gmv: '85M+/tháng',
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
      gmv: '210M+/tháng',
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-[#613bd1] border border-purple-200 shadow-sm">
            <span className="material-symbols-outlined text-3xl">badge</span>
          </div>

          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3.5 py-1 text-xs font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-[#613bd1]"></span>
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
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#613bd1] to-[#316bbf] hover:opacity-95 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
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
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      onShowToast('Định dạng ảnh không hợp lệ', 'Vui lòng chọn ảnh định dạng PNG, JPG hoặc WebP.', 'warning');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      onShowToast('Dung lượng ảnh quá lớn', 'Kích thước ảnh đại diện tối đa là 8MB.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatar(result);
        onShowToast('Đã đổi ảnh đại diện!', 'Ảnh mới đã được cập nhật cho thẻ hồ sơ KOC của bạn.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };
  const [tiktokHandle, setTiktokHandle] = useState(currentUser?.tiktokHandle || '');
  const [channelLink, setChannelLink] = useState(
    currentUser?.channelLink || (currentUser?.tiktokHandle ? `https://www.tiktok.com/${currentUser.tiktokHandle}` : '')
  );
  const [followers, setFollowers] = useState(currentUser?.followers || '');
  const [avgViews, setAvgViews] = useState(currentUser?.avgViews || '');
  const [engagementRate, setEngagementRate] = useState(currentUser?.engagementRate || '');
  const [gmv, setGmv] = useState(currentUser?.gmv || '');
  const [instagramHandle, setInstagramHandle] = useState(currentUser?.instagramHandle || '');
  const [youtubeHandle, setYoutubeHandle] = useState(currentUser?.youtubeHandle || '');

  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [district, setDistrict] = useState(currentUser?.district || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [shippingNote, setShippingNote] = useState(currentUser?.shippingNote || '');

  const [bio, setBio] = useState(currentUser?.bio || '');
  const [categories, setCategories] = useState<string[]>(currentUser?.categories || []);
  const [contentStyle, setContentStyle] = useState<string[]>(
    currentUser?.contentStyle ? currentUser.contentStyle.filter((s) => CONTENT_STYLES.includes(s)) : []
  );
  const [hasCustomStyle, setHasCustomStyle] = useState(() => {
    return Boolean(currentUser?.contentStyle?.some((s) => !CONTENT_STYLES.includes(s)));
  });
  const [customStyleText, setCustomStyleText] = useState(() => {
    const customList = currentUser?.contentStyle?.filter((s) => !CONTENT_STYLES.includes(s)) || [];
    return customList.join(', ');
  });

  const [targetAudience, setTargetAudience] = useState(currentUser?.targetAudience || '');
  const [targetAudienceImage, setTargetAudienceImage] = useState(currentUser?.targetAudienceImage || '');
  const targetAudienceFileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingAudienceImage, setIsDraggingAudienceImage] = useState(false);
  const [previewAudienceModalImage, setPreviewAudienceModalImage] = useState<string | null>(null);

  const [acceptFreecast, setAcceptFreecast] = useState(
    currentUser?.acceptFreecast !== undefined ? currentUser.acceptFreecast : true
  );
  const [minBookingRate, setMinBookingRate] = useState(currentUser?.minBookingRate || '');
  const [allowSparkAds, setAllowSparkAds] = useState(
    currentUser?.allowSparkAds !== undefined ? currentUser.allowSparkAds : false
  );
  const [portfolioDriveLink, setPortfolioDriveLink] = useState(
    currentUser?.portfolioDriveLink || ''
  );
  const [portfolioFile, setPortfolioFile] = useState<{
    name: string;
    size: string;
    dataUrl?: string;
    type?: string;
    uploadedAt?: string;
  } | undefined>(currentUser?.portfolioFile);
  const portfolioFileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingPortfolio, setIsDraggingPortfolio] = useState(false);

  // Tính toán danh sách phong cách video hiển thị (bao gồm phong cách có sẵn và phong cách tự nhập)
  const activeContentStyles = React.useMemo(() => {
    const standard = contentStyle.filter((s) => CONTENT_STYLES.includes(s));
    if (hasCustomStyle && customStyleText.trim()) {
      return [...standard, customStyleText.trim()];
    }
    return standard;
  }, [contentStyle, hasCustomStyle, customStyleText]);

  // Sync state khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setName(currentUser.name);
      if (currentUser.avatar) setAvatar(currentUser.avatar);
      if (currentUser.tiktokHandle) setTiktokHandle(currentUser.tiktokHandle);
      if (currentUser.channelLink) setChannelLink(currentUser.channelLink);
      if (currentUser.followers) setFollowers(currentUser.followers);
      if (currentUser.avgViews) setAvgViews(currentUser.avgViews);
      if (currentUser.engagementRate) setEngagementRate(currentUser.engagementRate);
      if (currentUser.gmv !== undefined) setGmv(currentUser.gmv);
      if (currentUser.instagramHandle !== undefined) setInstagramHandle(currentUser.instagramHandle);
      if (currentUser.youtubeHandle !== undefined) setYoutubeHandle(currentUser.youtubeHandle);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.city) setCity(currentUser.city);
      if (currentUser.district) setDistrict(currentUser.district);
      if (currentUser.address) setAddress(currentUser.address);
      if (currentUser.shippingNote) setShippingNote(currentUser.shippingNote);
      if (currentUser.bio) setBio(currentUser.bio);
      if (currentUser.categories) setCategories(currentUser.categories);
      if (currentUser.contentStyle) {
        setContentStyle(currentUser.contentStyle.filter((s) => CONTENT_STYLES.includes(s)));
        const customList = currentUser.contentStyle.filter((s) => !CONTENT_STYLES.includes(s));
        if (customList.length > 0) {
          setHasCustomStyle(true);
          setCustomStyleText(customList.join(', '));
        } else {
          setHasCustomStyle(false);
          setCustomStyleText('');
        }
      }
      if (currentUser.targetAudience) setTargetAudience(currentUser.targetAudience);
      if (currentUser.targetAudienceImage !== undefined) setTargetAudienceImage(currentUser.targetAudienceImage);
      if (currentUser.acceptFreecast !== undefined) setAcceptFreecast(currentUser.acceptFreecast);
      if (currentUser.minBookingRate) setMinBookingRate(currentUser.minBookingRate);
      if (currentUser.allowSparkAds !== undefined) setAllowSparkAds(currentUser.allowSparkAds);
      if (currentUser.portfolioDriveLink !== undefined) setPortfolioDriveLink(currentUser.portfolioDriveLink);
      if (currentUser.portfolioFile !== undefined) setPortfolioFile(currentUser.portfolioFile);
    }
  }, [currentUser]);

  // Xử lý tải ảnh cho mục Đối tượng khán giả chính (Insight / Demographics)
  const handleAudienceImageUpload = (file: File) => {
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      onShowToast('Định dạng ảnh không hợp lệ', 'Vui lòng chọn ảnh định dạng PNG, JPG hoặc WebP.', 'warning');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onShowToast('Dung lượng ảnh quá lớn', 'Kích thước ảnh đối tượng khán giả tối đa là 10MB.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setTargetAudienceImage(dataUrl);
          onShowToast('Đã tải ảnh đối tượng khán giả!', 'Ảnh biểu đồ phân tích người xem đã được lưu vào hồ sơ Media Kit.', 'success');
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Kiểm tra tệp có phải là video hay không
  const isPortfolioFileVideo = (file?: { type?: string; name: string }) => {
    if (!file) return false;
    if (file.type && file.type.startsWith('video/')) return true;
    return /\.(mp4|webm|mov|m4v|mkv)$/i.test(file.name || '');
  };

  // Phân tích liên kết video nổi bật (YouTube, TikTok, MP4 trực tiếp, Drive...)
  const parsePortfolioVideoLink = (url?: string) => {
    if (!url) return null;
    const clean = url.trim();
    if (!clean) return null;

    // 1. YouTube video hoặc Shorts
    const ytMatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return {
        type: 'youtube' as const,
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
        url: clean,
      };
    }

    // 2. Direct MP4 / WebM video link
    if (/\.(mp4|webm|mov)(\?.*)?$/i.test(clean)) {
      return {
        type: 'video' as const,
        embedUrl: clean,
        url: clean,
      };
    }

    // 3. TikTok video link
    if (/tiktok\.com/i.test(clean)) {
      return {
        type: 'tiktok' as const,
        url: clean,
      };
    }

    // 4. Other link (Drive, Notion, Canva...)
    return {
      type: 'other' as const,
      url: clean,
    };
  };

  // Xử lý tải tệp portfolio hoặc video (MP4, MOV, WebM, PDF, PPT, DOC, tối đa 100MB)
  const handlePortfolioFileUpload = (file: File) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv)$/i.test(file.name);
    const maxSize = isVideo ? 100 * 1024 * 1024 : 30 * 1024 * 1024; // 100MB cho video, 30MB cho tài liệu
    if (file.size > maxSize) {
      onShowToast(
        'Tệp quá lớn!',
        `Vui lòng chọn ${isVideo ? 'video dưới 100MB' : 'tệp dưới 30MB'}. Bạn cũng có thể dán link video TikTok/YouTube vào ô bên dưới!`,
        'warning'
      );
      return;
    }
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${sizeInMB} MB`;

    // 1. Tạo ngay Blob URL để video có thể phát lập tức 0ms mà không bị lag/treo trình duyệt
    const objectUrl = URL.createObjectURL(file);
    const newFileObj = {
      name: file.name,
      size: sizeStr,
      dataUrl: objectUrl,
      type: file.type || (isVideo ? 'video/mp4' : 'application/pdf'),
      uploadedAt: new Date().toLocaleDateString('vi-VN'),
    };
    setPortfolioFile(newFileObj);

    onShowToast(
      isVideo ? 'Đã tải video thành công!' : 'Đã tải tệp Portfolio!',
      `${file.name} (${sizeStr}) đã sẵn sàng trên thẻ Media Kit của bạn.`,
      'success'
    );

    // 2. Nếu file nhẹ (<= 15MB), đọc thêm base64 ở nền để lưu trữ bền vững
    if (file.size <= 15 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        if (base64Data) {
          setPortfolioFile((prev) => (prev ? { ...prev, dataUrl: base64Data } : prev));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Active Tab within Profile Form
  const [activeTab, setActiveTab] = useState<'channel' | 'address' | 'rates' | 'mediaKit'>('channel');

  // Preview Card Modal toggle
  const [showMediaKitModal, setShowMediaKitModal] = useState(false);
  const [copyMemberCodeSuccess, setCopyMemberCodeSuccess] = useState(false);

  // Đóng modal khi nhấn phím Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMediaKitModal(false);
        setPreviewAudienceModalImage(null);
      }
    };
    if (showMediaKitModal || previewAudienceModalImage) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMediaKitModal, previewAudienceModalImage]);

  // Mã định danh KOC cá nhân cố định (dễ nhớ, dùng để đối soát mẫu và quản lý)
  const kocMemberCode = React.useMemo(() => {
    if (!currentUser) return 'KOC-MEMBER';
    if (currentUser.id?.toUpperCase().startsWith('KOC-')) {
      return currentUser.id.toUpperCase();
    }
    const cleanId = (currentUser.id || '').replace(/[^a-zA-Z0-9]/g, '');
    if (cleanId.length >= 4) {
      return `KOC-${cleanId.slice(-4).toUpperCase()}`;
    }
    if (currentUser.phone) {
      const cleanPhone = currentUser.phone.replace(/\D/g, '');
      if (cleanPhone.length >= 4) {
        return `KOC-${cleanPhone.slice(-4)}`;
      }
    }
    const seed = (currentUser.name || 'CREATOR').split('').reduce((acc, c) => acc + c.charCodeAt(0), 1000);
    return `KOC-${(seed % 9000) + 1000}`;
  }, [currentUser]);

  const handleCopyMemberCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(kocMemberCode);
    }
    setCopyMemberCodeSuccess(true);
    onShowToast('Đã sao chép mã KOC!', `Mã định danh của bạn là #${kocMemberCode}`, 'success');
    setTimeout(() => setCopyMemberCodeSuccess(false), 2500);
  };

  const mediaKitCardRef = useRef<HTMLDivElement>(null);
  const [isDownloadingMediaKit, setIsDownloadingMediaKit] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Tạo URL chia sẻ Media Kit công khai chứa toàn bộ dữ liệu hồ sơ
  const getShareableMediaKitUrl = () => {
    const cleanHandle = (tiktokHandle || 'creator').replace(/[@\s]/g, '');
    const profilePayload = {
      name: name.trim() || cleanHandle,
      tiktokHandle: tiktokHandle.startsWith('@') ? tiktokHandle : `@${tiktokHandle}`,
      avatar: avatar || APP_LOGOS.userProfile,
      followers: followers.trim() || '10K+',
      avgViews: avgViews.trim() || '5K+',
      engagementRate: engagementRate.trim() || '4.5%',
      gmv: gmv.trim() || undefined,
      categories,
      bio: bio.trim(),
      memberCode: kocMemberCode,
      city,
      district,
      address,
      channelLink: channelLink || `https://www.tiktok.com/@${cleanHandle}`,
      instagramHandle,
      youtubeHandle,
      portfolioDriveLink,
      portfolioFile: portfolioFile
        ? {
            name: portfolioFile.name,
            size: portfolioFile.size,
            type: portfolioFile.type,
            dataUrl: portfolioFile.dataUrl && portfolioFile.dataUrl.length < 5000 ? portfolioFile.dataUrl : undefined,
          }
        : undefined,
      targetAudience,
      targetAudienceImage: targetAudienceImage && targetAudienceImage.length < 5000 ? targetAudienceImage : undefined,
      contentStyle: activeContentStyles,
      minBookingRate,
      allowSparkAds,
      acceptFreecast,
    };

    let shareUrl = `${window.location.origin}/?mediakit=${encodeURIComponent(cleanHandle)}`;
    try {
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(profilePayload))));
      shareUrl = `${window.location.origin}/?mediakit=${encodeURIComponent(cleanHandle)}&mk=${encoded}`;
    } catch (e) {
      console.warn(e);
    }
    return shareUrl;
  };

  // Chia sẻ hoặc copy link Media Kit
  const handleShareMediaKit = () => {
    const shareUrl = getShareableMediaKitUrl();
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
      }
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
      onShowToast(
        'Đã sao chép link Media Kit!',
        'Bất kỳ Brand hay người nhận nào cũng có thể click vào để xem trực tiếp hồ sơ của bạn.',
        'success'
      );
    } catch (err) {
      console.warn(err);
    }
  };

  // Tải thẻ Media Kit về máy dưới dạng ảnh PNG
  const handleDownloadMediaKitImage = async () => {
    if (!mediaKitCardRef.current) return;
    try {
      setIsDownloadingMediaKit(true);
      const dataUrl = await toPng(mediaKitCardRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: (node) => (node as HTMLElement).tagName !== 'IFRAME',
      });
      const link = document.createElement('a');
      const cleanHandle = (tiktokHandle || 'creator').replace(/[@\s]/g, '');
      link.download = `MediaKit_${cleanHandle}.png`;
      link.href = dataUrl;
      link.click();
      onShowToast('Đã tải ảnh Media Kit!', 'Thẻ hồ sơ của bạn đã được xuất thành công dưới dạng ảnh PNG.', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Lỗi tải ảnh', 'Không thể tạo ảnh tự động, bạn có thể chụp ảnh màn hình thẻ này nhé.', 'warning');
    } finally {
      setIsDownloadingMediaKit(false);
    }
  };

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
    if (d.gmv) setGmv(d.gmv);
    if (d.phone) setPhone(d.phone);
    if (d.email) setEmail(d.email);
    if (d.city) setCity(d.city);
    if (d.district) setDistrict(d.district);
    if (d.address) setAddress(d.address);
    if (d.shippingNote) setShippingNote(d.shippingNote);
    if (d.bio) setBio(d.bio);
    if (d.categories) setCategories(d.categories);
    if (d.contentStyle) {
      setContentStyle(d.contentStyle.filter((s) => CONTENT_STYLES.includes(s)));
      const customStyles = d.contentStyle.filter((s) => !CONTENT_STYLES.includes(s));
      setHasCustomStyle(customStyles.length > 0);
      setCustomStyleText(customStyles.join(', '));
    }
    if (d.targetAudience) setTargetAudience(d.targetAudience);
    if (d.targetAudienceImage !== undefined) setTargetAudienceImage(d.targetAudienceImage);
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
      ...(currentUser || {}),
      id: currentUser?.id || `koc-${Date.now()}`,
      role: currentUser?.role || 'koc',
      password: currentUser?.password,
      name: name.trim(),
      avatar: avatar || APP_LOGOS.userProfile,
      tiktokHandle: formattedHandle,
      followers: followers.trim(),
      phone: phone.trim() || currentUser?.phone || '',
      email: email.trim() || currentUser?.email || '',
      verified: Boolean(currentUser?.verified),
      bio: bio.trim(),
      categories,
      avgViews: avgViews.trim(),
      engagementRate: engagementRate.trim(),
      gmv: gmv.trim(),
      channelLink: channelLink || (formattedHandle ? `https://www.tiktok.com/${formattedHandle}` : ''),
      instagramHandle,
      youtubeHandle,
      city,
      district,
      address,
      shippingNote,
      targetAudience,
      targetAudienceImage: targetAudienceImage || undefined,
      contentStyle: activeContentStyles,
      acceptFreecast,
      allowSparkAds,
      portfolioDriveLink,
      portfolioFile,
      sampleDeliveredCount: currentUser?.sampleDeliveredCount || 0,
      completedVideosCount: currentUser?.completedVideosCount || 0,
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
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-[#613bd1] to-[#316bbf] text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </span>
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-slate-900">
              {currentUser ? 'Hồ sơ KOC & Media Kit' : 'Tạo hồ sơ KOC mới'}
            </h1>
            <span className="rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-xs font-bold text-[#613bd1]">
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
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-purple-50 hover:text-[#613bd1] hover:border-purple-200 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-[#613bd1]">visibility</span>
              <span>Xem trước Media Kit</span>
            </button>
          )}

          <button
            id="save-koc-profile-btn"
            onClick={() => handleSave()}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#613bd1] to-[#316bbf] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{currentUser ? 'Lưu thay đổi hồ sơ' : 'Kích hoạt hồ sơ KOC ngay'}</span>
          </button>
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
                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Kocity Creator
                </span>
              </div>
              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-extrabold text-[#613bd1] border border-purple-200">
                ⭐ 5.0 KOC Rating
              </span>
            </div>

            {/* Avatar & Main Info */}
            <div className="mt-5 text-center">
              {/* Hidden Avatar File Input */}
              <input
                ref={avatarFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleAvatarFileChange}
              />

              <div className="relative mx-auto h-24 w-24 rounded-2xl border-4 border-purple-100 shadow-sm group">
                <div className="h-full w-full overflow-hidden rounded-xl">
                  <img
                    src={avatar || APP_LOGOS.userProfile}
                    alt={name || 'KOC Avatar'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    avatarFileInputRef.current?.click();
                  }}
                  className="absolute inset-0 rounded-xl flex flex-col items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
                  title="Nhấp để tải ảnh đại diện từ thiết bị của bạn"
                >
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                  Đổi ảnh
                </button>
                {/* Visible quick action badge button on mobile and desktop */}
                <button
                  type="button"
                  onClick={() => {
                    avatarFileInputRef.current?.click();
                  }}
                  className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#613bd1] hover:bg-[#522eb8] text-white shadow-md border-2 border-white transition-transform active:scale-90 cursor-pointer"
                  title="Tải ảnh mới từ thiết bị"
                >
                  <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                </button>
              </div>

              <h3 className="mt-3 font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-slate-900">
                {name || 'Tên KOC của bạn'}
              </h3>
              
              {/* Omni-channel Social Handles */}
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
                <a
                  href={channelLink || (tiktokHandle ? `https://www.tiktok.com/${tiktokHandle.startsWith('@') ? tiktokHandle : `@${tiktokHandle}`}` : '#')}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#613bd1] hover:underline bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100"
                >
                  <span className="text-[10px] text-slate-500 font-sans">TT:</span>
                  <span>{tiktokHandle ? (tiktokHandle.startsWith('@') ? tiktokHandle : `@${tiktokHandle}`) : '@creator'}</span>
                  <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                </a>

                {instagramHandle && (
                  <a
                    href={`https://www.instagram.com/${instagramHandle.replace(/[@\s]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-pink-600 hover:underline bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100"
                  >
                    <span className="text-[10px] text-slate-500 font-sans">IG:</span>
                    <span>@{instagramHandle.replace(/[@\s]/g, '')}</span>
                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                )}

                {youtubeHandle && (
                  <a
                    href={`https://www.youtube.com/@${youtubeHandle.replace(/[@\s]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-rose-600 hover:underline bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100"
                  >
                    <span className="text-[10px] text-slate-500 font-sans">YT:</span>
                    <span>@{youtubeHandle.replace(/[@\s]/g, '')}</span>
                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                )}
              </div>

              {/* KOC Member ID Badge with Quick Copy */}
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-purple-50/80 px-3 py-1 border border-purple-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Mã KOC:</span>
                <span className="font-mono text-xs font-extrabold text-[#613bd1]">#{kocMemberCode}</span>
                <button
                  type="button"
                  onClick={handleCopyMemberCode}
                  className="ml-0.5 text-slate-400 hover:text-[#613bd1] transition-colors cursor-pointer"
                  title="Sao chép mã KOC để gửi nhãn hàng hoặc đối soát quà mẫu"
                >
                  <span className="material-symbols-outlined text-[13px] leading-none">
                    {copyMemberCodeSuccess ? 'done' : 'content_copy'}
                  </span>
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-600 line-clamp-2 px-2">
                {bio || 'Chưa cập nhật phần tự giới thiệu ngắn cho nhãn hàng.'}
              </p>
            </div>

            {/* Core Vital Metrics (Bao gồm Followers, Avg Views, Tương tác, GMV) */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 rounded-2xl bg-slate-50 p-3 border border-slate-100">
              <div className="text-center p-2 rounded-xl bg-white border border-slate-100">
                <span className="text-[10px] font-medium text-slate-500 block">Followers</span>
                <span className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-extrabold text-slate-900">
                  {followers || 'Chưa có'}
                </span>
              </div>
              <div className="text-center p-2 rounded-xl bg-white border border-slate-100">
                <span className="text-[10px] font-medium text-slate-500 block">Avg Views</span>
                <span className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-extrabold text-[#316bbf]">
                  {avgViews || 'Chưa có'}
                </span>
              </div>
              <div className="text-center p-2 rounded-xl bg-white border border-slate-100">
                <span className="text-[10px] font-medium text-slate-500 block">Tương tác</span>
                <span className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-extrabold text-[#613bd1]">
                  {engagementRate || 'Chưa có'}
                </span>
              </div>
              <div className="text-center p-2 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 block flex items-center justify-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px] text-emerald-600">trending_up</span>
                  GMV Kênh
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-extrabold text-emerald-700">
                  {gmv || 'Chưa có'}
                </span>
              </div>
            </div>

            {/* Categories tags preview */}
            <div className="mt-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Ngành hàng thế mạnh
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categories.length > 0 ? (
                  categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-semibold text-[#613bd1]"
                    >
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Chưa chọn ngành hàng</span>
                )}
              </div>
            </div>

            {/* Phong cách video & Định dạng nội dung */}
            <div className="mt-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#613bd1]">movie</span>
                Phong cách video
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeContentStyles.length > 0 ? (
                  activeContentStyles.map((st, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-[#316bbf]"
                    >
                      {st}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Chưa chọn phong cách video</span>
                )}
              </div>
            </div>

            {/* Đối tượng khán giả chính (Target Demographics) */}
            <div className="mt-4 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-amber-700">groups</span>
                  Đối tượng khán giả chính
                </span>
                <span className="text-[9px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded-md">
                  Demographics
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {targetAudience || 'Độ tuổi 18 - 35 • Nam & Nữ • Học sinh, sinh viên & văn phòng'}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-900 bg-white/80 border border-amber-200 px-1.5 py-0.5 rounded">
                  18 - 35 tuổi
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-900 bg-white/80 border border-amber-200 px-1.5 py-0.5 rounded">
                  Nam & Nữ
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-900 bg-white/80 border border-amber-200 px-1.5 py-0.5 rounded">
                  Toàn quốc
                </span>
              </div>
              {targetAudienceImage && (
                <div className="mt-2 pt-2 border-t border-amber-200/60">
                  <div
                    onClick={() => setPreviewAudienceModalImage(targetAudienceImage)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-white/90 border border-amber-300 group cursor-pointer shadow-2xs hover:bg-amber-100/50 transition-colors"
                    title="Bấm để xem ảnh phân tích khán giả"
                  >
                    <img
                      src={targetAudienceImage}
                      alt="Ảnh phân tích khán giả"
                      className="h-9 w-12 object-cover rounded border border-amber-200"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-slate-800 block truncate">Biểu đồ người xem</span>
                      <span className="text-[9px] text-amber-700 flex items-center gap-0.5 font-medium">
                        <span className="material-symbols-outlined text-[11px]">zoom_in</span> Xem phóng to
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Portfolio & Case Studies Preview on Card */}
            {portfolioDriveLink || portfolioFile ? (
              <div className="mt-4 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-left space-y-2">
                <span className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider block flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#613bd1]">folder_shared</span>
                  Portfolio hoặc Video nổi bật
                </span>

                {/* Uploaded Video or PDF Document */}
                {portfolioFile && (
                  isPortfolioFileVideo(portfolioFile) ? (
                    <div className="space-y-1">
                      <div className="rounded-xl overflow-hidden bg-black aspect-video max-h-40 w-full shadow-2xs">
                        <video
                          src={portfolioFile.dataUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                        <span className="truncate max-w-[150px] font-medium text-slate-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-purple-600">movie</span>
                          {portfolioFile.name}
                        </span>
                        {portfolioFile.dataUrl && (
                          <a
                            href={portfolioFile.dataUrl}
                            download={portfolioFile.name}
                            className="text-purple-700 hover:underline font-bold text-[10px] shrink-0"
                          >
                            Tải ({portfolioFile.size})
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <a
                      href={portfolioFile.dataUrl}
                      download={portfolioFile.name}
                      className="flex items-center gap-1.5 text-xs text-rose-600 font-bold bg-white px-2.5 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 transition-colors shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[15px] text-rose-500">picture_as_pdf</span>
                      <span className="truncate max-w-[140px]">{portfolioFile.name}</span>
                      <span className="text-[10px] text-slate-400 ml-auto">{portfolioFile.size}</span>
                    </a>
                  )
                )}

                {/* Video Link Embed or Drive / Notion Button */}
                {portfolioDriveLink && (() => {
                  const parsed = parsePortfolioVideoLink(portfolioDriveLink);
                  if (!parsed) return null;
                  if (parsed.type === 'youtube') {
                    return (
                      <div className="space-y-1">
                        <div className="rounded-xl overflow-hidden bg-black aspect-video max-h-40 w-full shadow-2xs">
                          <iframe
                            src={parsed.embedUrl}
                            title="Video Portfolio YouTube"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                          <span className="flex items-center gap-1 text-red-600 font-semibold">
                            <span className="material-symbols-outlined text-[13px]">smart_display</span> YouTube Video
                          </span>
                          <a href={parsed.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-0.5">
                            Mở YouTube <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                          </a>
                        </div>
                      </div>
                    );
                  }
                  if (parsed.type === 'video') {
                    return (
                      <div className="space-y-1">
                        <div className="rounded-xl overflow-hidden bg-black aspect-video max-h-40 w-full shadow-2xs">
                          <video
                            src={parsed.embedUrl}
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                          <span className="flex items-center gap-1 text-purple-600 font-semibold">
                            <span className="material-symbols-outlined text-[13px]">movie</span> Video trực tiếp
                          </span>
                          <a href={parsed.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-0.5">
                            Mở video <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                          </a>
                        </div>
                      </div>
                    );
                  }
                  if (parsed.type === 'tiktok') {
                    return (
                      <a
                        href={parsed.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 text-white hover:bg-black transition-colors shadow-2xs group"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="material-symbols-outlined text-pink-400 text-[16px]">play_circle</span>
                          <span className="text-xs font-bold text-white truncate">Video review TikTok</span>
                        </div>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-pink-300 bg-white/10 px-2 py-0.5 rounded-md shrink-0">
                          Xem ngay <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                        </span>
                      </a>
                    );
                  }
                  return (
                    <a
                      href={parsed.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[#316bbf] font-bold bg-white px-2.5 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">link</span>
                      <span className="truncate">Drive / Notion / Canva</span>
                      <span className="material-symbols-outlined text-[13px] ml-auto">open_in_new</span>
                    </a>
                  );
                })()}
              </div>
            ) : (
              <div className="mt-4 p-3 rounded-2xl bg-purple-50/60 border border-purple-200 border-dashed text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#613bd1] uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">movie</span>
                    Video mẫu hoặc Portfolio
                  </span>
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    Khuyên dùng
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Chưa có video. Tải video review hoặc gắn link YouTube/TikTok để nhãn hàng duyệt booking nhanh hơn.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('mediaKit');
                    setTimeout(() => {
                      const input = document.getElementById('koc-portfolio-upload-input');
                      if (input) input.click();
                    }, 150);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-[#613bd1] to-[#316bbf] hover:opacity-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">video_call</span>
                  <span>Tải video hoặc Gắn link ngay</span>
                </button>
              </div>
            )}

            {/* Collaboration terms preview */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#316bbf]">check_circle</span>
                  Mẫu 0đ (Freecast)
                </span>
                <b className="text-[#316bbf]">{acceptFreecast ? 'Sẵn sàng' : 'Không nhận'}</b>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#613bd1]">bolt</span>
                  Cấp mã Spark Ads
                </span>
                <b className="text-[#613bd1]">{allowSparkAds ? 'Đồng ý' : 'Chưa thiết lập'}</b>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">payments</span>
                  Báo giá booking
                </span>
                <b className="text-emerald-700">{minBookingRate || 'Mẫu 0đ + Hoa hồng'}</b>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-slate-500">location_on</span>
                  Khu vực giao mẫu
                </span>
                <b className="text-slate-900 truncate max-w-[140px]">
                  {city ? `${city}${district ? `, ${district}` : ''}` : 'Chưa cập nhật'}
                </b>
              </div>
            </div>

            {/* Quick action buttons for Media Kit */}
            <div className="mt-5 space-y-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowMediaKitModal(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#613bd1] to-[#316bbf] hover:opacity-95 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">badge</span>
                <span>Xem & Xuất thẻ Media Kit (PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleShareMediaKit}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 py-2 text-xs font-bold text-[#613bd1] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedShareLink ? 'done' : 'link'}
                </span>
                <span>{copiedShareLink ? 'Đã sao chép link web!' : 'Sao chép link Media Kit'}</span>
              </button>
            </div>
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
                  ? 'bg-gradient-to-r from-[#613bd1] to-[#316bbf] text-white shadow-sm'
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
                  ? 'bg-gradient-to-r from-[#613bd1] to-[#316bbf] text-white shadow-sm'
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
                  ? 'bg-gradient-to-r from-[#613bd1] to-[#316bbf] text-white shadow-sm'
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
                  ? 'bg-gradient-to-r from-[#613bd1] to-[#316bbf] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">video_library</span>
              <span>4. Video & Portfolio (Media Kit)</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="mt-6 space-y-6">
            {/* TAB 1: Kênh TikTok & Chỉ số */}
            {activeTab === 'channel' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="rounded-2xl bg-gradient-to-r from-purple-50/70 to-blue-50/50 p-4 border border-purple-200">
                  <h3 className="text-xs font-bold text-[#613bd1] flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[16px] text-[#613bd1]">verified</span>
                    Khai báo chỉ số kênh chính xác
                  </h3>
                  <p className="text-[11px] text-slate-700">
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
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
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-700 min-h-[38px] flex items-center mb-1.5 leading-snug">
                      Số lượng người theo dõi (Followers)
                    </label>
                    <input
                      type="text"
                      value={followers}
                      onChange={(e) => setFollowers(e.target.value)}
                      placeholder="Ví dụ: 120K hoặc 50.000"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-700 min-h-[38px] flex items-center mb-1.5 leading-snug">
                      Lượt xem trung bình / video
                    </label>
                    <input
                      type="text"
                      value={avgViews}
                      onChange={(e) => setAvgViews(e.target.value)}
                      placeholder="Ví dụ: 25K views"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-700 min-h-[38px] flex items-center mb-1.5 leading-snug">
                      Tỷ lệ tương tác ước tính
                    </label>
                    <input
                      type="text"
                      value={engagementRate}
                      onChange={(e) => setEngagementRate(e.target.value)}
                      placeholder="Ví dụ: 6.8%"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-700 min-h-[38px] flex items-center gap-1 mb-1.5 leading-snug">
                      <span>Chỉ số GMV kênh</span>
                      <span className="material-symbols-outlined text-[15px] text-emerald-600" title="Tổng giá trị hàng hoá bán được qua kênh (Ví dụ: 150M+/tháng)">payments</span>
                    </label>
                    <input
                      type="text"
                      value={gmv}
                      onChange={(e) => setGmv(e.target.value)}
                      placeholder="Ví dụ: 150M+/tháng"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
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
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
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
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('address')}
                    className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#613bd1] to-[#316bbf] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 cursor-pointer"
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
                <div className="rounded-2xl bg-purple-50/60 p-4 border border-purple-200">
                  <h3 className="text-xs font-bold text-purple-950 flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[16px] text-[#613bd1]">local_shipping</span>
                    Giao mẫu hỏa tốc tận tay (0đ phí vận chuyển)
                  </h3>
                  <p className="text-[11px] text-purple-900">
                    Khi Brand duyệt hồ sơ, sản phẩm quà mẫu sẽ được tự động điều phối tới địa chỉ này qua GHTK / ViettelPost. Hãy điền chính xác để shipper liên hệ.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Số điện thoại nhận hàng <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0908.xxx.xxx"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
                    >
                      <option value="">-- Chọn Tỉnh / Thành phố --</option>
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
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
                    className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#613bd1] to-[#316bbf] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 cursor-pointer"
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
                              ? 'border-[#613bd1] bg-purple-50 text-[#613bd1] font-bold shadow-xs'
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
                              ? 'border-[#613bd1] bg-purple-50 text-[#613bd1] font-bold shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-[#613bd1]' : 'text-slate-400'}`}>
                            {isSelected ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                          <span>{st}</span>
                        </button>
                      );
                    })}

                    {/* Tùy chọn "Khác (tự nhập)" */}
                    <button
                      type="button"
                      onClick={() => setHasCustomStyle((prev) => !prev)}
                      className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold border transition-all cursor-pointer text-left ${
                        hasCustomStyle
                          ? 'border-[#613bd1] bg-purple-50 text-[#613bd1] font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[18px] ${hasCustomStyle ? 'text-[#613bd1]' : 'text-slate-400'}`}>
                        {hasCustomStyle ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span>Khác (tự nhập)</span>
                    </button>
                  </div>

                  {/* Khung nhập phong cách video tự nhập khi chọn Khác */}
                  {hasCustomStyle && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 animate-in fade-in duration-150 space-y-1.5">
                      <label className="text-xs font-bold text-[#613bd1] block flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">edit_note</span>
                        <span>Nhập phong cách video & định dạng nội dung riêng của bạn:</span>
                      </label>
                      <input
                        type="text"
                        value={customStyleText}
                        onChange={(e) => setCustomStyleText(e.target.value)}
                        placeholder="Ví dụ: Kể chuyện & Drama, So sánh chi tiết sản phẩm, Reaction, Parody..."
                        className="w-full rounded-xl border border-purple-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
                      />
                      <p className="text-[10px] text-slate-500">
                        Nội dung tự nhập này sẽ được lưu và hiển thị trực tiếp lên thẻ Media Kit gửi nhãn hàng.
                      </p>
                    </div>
                  )}
                </div>

                {/* Mục: Đối tượng khán giả chính & Tải ảnh phân tích nhân khẩu học */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                      <span>Đối tượng khán giả chính (Target Demographics)</span>
                      <span className="text-[10px] font-normal text-slate-500">Nhóm người xem cốt lõi của kênh</span>
                    </label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="Ví dụ: Nữ 18-28 tuổi, học sinh sinh viên & nhân viên văn phòng yêu thích làm đẹp..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
                    />
                  </div>

                  {/* Chức năng tải ảnh lên cho mục Đối tượng khán giả chính */}
                  <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50/60 to-blue-50/40 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-[#613bd1]">add_photo_alternate</span>
                        <span>Ảnh phân tích đối tượng khán giả (Demographics Analytics)</span>
                      </label>
                      <span className="text-[10px] font-semibold text-[#613bd1] bg-purple-100/80 px-2 py-0.5 rounded-md">
                        Hiển thị trên Media Kit
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Tải lên ảnh chụp màn hình phân tích người xem (Độ tuổi, Tỷ lệ giới tính Nam/Nữ, Tỉnh thành) từ TikTok Analytics / Studio để chứng minh tệp khán giả với nhãn hàng.
                    </p>

                    <input
                      ref={targetAudienceFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAudienceImageUpload(file);
                      }}
                    />

                    {targetAudienceImage ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-purple-200 shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setPreviewAudienceModalImage(targetAudienceImage)}
                            className="relative h-14 w-20 rounded-lg overflow-hidden border border-slate-200 group cursor-pointer shrink-0"
                            title="Nhấp để xem ảnh lớn"
                          >
                            <img
                              src={targetAudienceImage}
                              alt="Insight khán giả"
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px]">
                              <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
                              Đã đính kèm ảnh phân tích khán giả
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Ảnh sẽ hiển thị trực tiếp trên thẻ Media Kit gửi nhãn hàng
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setPreviewAudienceModalImage(targetAudienceImage)}
                            className="text-xs text-[#316bbf] font-bold hover:underline px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            <span>Xem ảnh</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => targetAudienceFileInputRef.current?.click()}
                            className="text-xs text-indigo-600 font-semibold hover:underline px-2 py-1 cursor-pointer"
                          >
                            Đổi ảnh
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTargetAudienceImage('');
                              if (targetAudienceFileInputRef.current) targetAudienceFileInputRef.current.value = '';
                            }}
                            className="text-xs text-rose-600 font-semibold hover:underline px-2 py-1 cursor-pointer"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => targetAudienceFileInputRef.current?.click()}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingAudienceImage(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleAudienceImageUpload(file);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingAudienceImage(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDraggingAudienceImage(false);
                        }}
                        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer bg-white ${
                          isDraggingAudienceImage
                            ? 'border-[#613bd1] bg-purple-50/70'
                            : 'border-slate-300 hover:border-[#613bd1] hover:bg-purple-50/30'
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#613bd1] border border-purple-200">
                          <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-slate-800 block">
                            Tải ảnh lên (Hỗ trợ PNG, JPG, WebP tối đa 10MB)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
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
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#613bd1] focus:ring-[#613bd1] accent-[#613bd1]"
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
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#613bd1] focus:ring-[#613bd1] accent-[#613bd1]"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
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
                    className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#613bd1] to-[#316bbf] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 cursor-pointer"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1] leading-relaxed"
                  />
                </div>

                {/* Upload & Link Portfolio Section (Yêu cầu 14 & 15) */}
                <div className="space-y-3.5 rounded-2xl bg-gradient-to-r from-purple-50/60 to-blue-50/50 p-4 sm:p-5 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-[#613bd1]">folder_shared</span>
                      <span>Hồ sơ năng lực / Portfolio của KOC</span>
                    </label>
                    <span className="text-[11px] font-semibold text-[#613bd1] bg-purple-100/80 px-2 py-0.5 rounded-md">
                      Hiển thị trực tiếp trên Media Kit
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Đính kèm file PDF hoặc liên kết Google Drive/Notion/Canva giới thiệu các video review nổi bật, phong cách quay dựng và kết quả chuyển đổi thực tế để nhãn hàng đánh giá ngay.
                  </p>

                  {/* 1. Tải tệp Video hoặc Portfolio trực tiếp */}
                  <div className="bg-white p-3.5 rounded-xl border border-purple-100 shadow-2xs space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      Cách 1: Tải tệp Video hoặc Portfolio (Video MP4/MOV tối đa 100MB, PDF/Slide tối đa 30MB)
                    </label>

                    {/* Native accessible file input */}
                    <input
                      id="koc-portfolio-upload-input"
                      ref={portfolioFileInputRef}
                      type="file"
                      accept="video/*,.mp4,.webm,.mov,.m4v,.pdf,.ppt,.pptx,.doc,.docx"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePortfolioFileUpload(file);
                        e.target.value = '';
                      }}
                    />

                    {portfolioFile ? (
                      isPortfolioFileVideo(portfolioFile) ? (
                        <div className="rounded-xl overflow-hidden bg-slate-950 border border-purple-300 shadow-xs space-y-0">
                          <video
                            src={portfolioFile.dataUrl}
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full max-h-56 bg-black object-contain"
                          />
                          <div className="flex items-center justify-between p-3 bg-white border-t border-slate-100">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-[#613bd1]">
                                <span className="material-symbols-outlined text-[20px]">movie</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate max-w-[180px] sm:max-w-[320px]">
                                  {portfolioFile.name}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {portfolioFile.size} • Video đã tải lên ({portfolioFile.uploadedAt || 'Hôm nay'})
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <label
                                htmlFor="koc-portfolio-upload-input"
                                className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                              >
                                Đổi video
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setPortfolioFile(undefined);
                                  if (portfolioFileInputRef.current) portfolioFileInputRef.current.value = '';
                                }}
                                className="text-xs text-red-600 font-semibold hover:underline cursor-pointer"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 border border-purple-200">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 shadow-2xs">
                              <span className="material-symbols-outlined text-[22px]">picture_as_pdf</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate max-w-[180px] sm:max-w-[320px]">
                                {portfolioFile.name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {portfolioFile.size} • {portfolioFile.uploadedAt || 'Đã tải lên'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {portfolioFile.dataUrl && (
                              <a
                                href={portfolioFile.dataUrl}
                                download={portfolioFile.name}
                                className="text-xs text-blue-600 font-bold hover:underline px-2.5 py-1 bg-white border border-blue-200 rounded-lg flex items-center gap-1 shadow-2xs"
                              >
                                <span className="material-symbols-outlined text-[14px]">download</span>
                                <span>Tải về</span>
                              </a>
                            )}
                            <label
                              htmlFor="koc-portfolio-upload-input"
                              className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                            >
                              Đổi tệp
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setPortfolioFile(undefined);
                                if (portfolioFileInputRef.current) portfolioFileInputRef.current.value = '';
                              }}
                              className="text-xs text-red-600 font-semibold hover:underline cursor-pointer"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      )
                    ) : (
                      <label
                        htmlFor="koc-portfolio-upload-input"
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingPortfolio(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handlePortfolioFileUpload(file);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingPortfolio(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDraggingPortfolio(false);
                        }}
                        className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                          isDraggingPortfolio
                            ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]'
                            : 'border-purple-300 bg-purple-50/30 hover:bg-purple-50/60 hover:border-purple-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-[#613bd1] shadow-2xs">
                            <span className="material-symbols-outlined text-[26px]">video_call</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              Bấm vào đây để chọn Video hoặc Tệp Portfolio
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Hỗ trợ Video MP4, MOV, WebM (tối đa 100MB) hoặc PDF, Slide (tối đa 30MB)
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#613bd1] hover:bg-[#522eb8] text-white text-xs font-bold shadow-sm transition-all pointer-events-none">
                          <span className="material-symbols-outlined text-[16px]">upload_file</span>
                          <span>Chọn tệp tải lên</span>
                        </span>
                      </label>
                    )}
                  </div>

                  {/* 2. Đường dẫn Video (YouTube, TikTok) hoặc Google Drive / Notion / Canva */}
                  <div className="bg-white p-3.5 rounded-xl border border-purple-100 shadow-2xs space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      Cách 2: Gắn link Video (YouTube, TikTok) hoặc Google Drive, Notion, Canva
                    </label>
                    <input
                      type="url"
                      value={portfolioDriveLink}
                      onChange={(e) => setPortfolioDriveLink(e.target.value)}
                      placeholder="Ví dụ: https://www.youtube.com/watch?v=... hoặc https://www.tiktok.com/@.../video/... hoặc Drive"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#613bd1] focus:outline-none focus:ring-1 focus:ring-[#613bd1]"
                    />
                    {portfolioDriveLink && (() => {
                      const parsed = parsePortfolioVideoLink(portfolioDriveLink);
                      if (parsed?.type === 'youtube') {
                        return (
                          <div className="mt-2 space-y-1 p-2.5 rounded-xl bg-red-50/60 border border-red-200">
                            <span className="text-[11px] font-bold text-red-700 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">smart_display</span>
                              Đã nhận diện video YouTube - Sẽ phát trực tiếp trên thẻ Media Kit:
                            </span>
                            <div className="aspect-video max-h-48 rounded-lg overflow-hidden bg-black shadow-xs">
                              <iframe
                                src={parsed.embedUrl}
                                title="YouTube Video Preview"
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        );
                      }
                      if (parsed?.type === 'video') {
                        return (
                          <div className="mt-2 space-y-1 p-2.5 rounded-xl bg-purple-50/60 border border-purple-200">
                            <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">movie</span>
                              Đã nhận diện file Video MP4 - Sẽ phát trực tiếp trên thẻ Media Kit:
                            </span>
                            <div className="aspect-video max-h-48 rounded-lg overflow-hidden bg-black shadow-xs">
                              <video
                                src={parsed.embedUrl}
                                controls
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>
                        );
                      }
                      if (parsed?.type === 'tiktok') {
                        return (
                          <div className="mt-2 flex items-center gap-2 p-2 rounded-xl bg-slate-900 text-white">
                            <span className="material-symbols-outlined text-[16px] text-pink-400">play_circle</span>
                            <span className="text-xs text-slate-200 font-medium truncate flex-1">
                              Đã nhận diện link video TikTok: {parsed.url}
                            </span>
                            <span className="text-[10px] font-bold text-pink-300 bg-white/10 px-2 py-0.5 rounded">TikTok</span>
                          </div>
                        );
                      }
                      return (
                        <p className="text-[10px] text-slate-500">
                          Link này sẽ hiển thị thành nút bấm trực tiếp trên Media Kit để đối tác Brand bấm vào xem ngay.
                        </p>
                      );
                    })()}
                  </div>
                </div>

                {/* Final Verification Checklist */}
                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-blue-700">verified</span>
                    Quyền lợi sau khi tạo hồ sơ KOC tại Kocity:
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1.5 list-disc pl-5">
                    <li>Duyệt nhanh hồ sơ nhận mẫu trong vòng 12h thay vì 48h thông thường.</li>
                    <li>Tự động điền nhanh form đăng ký nhận mẫu quà 0đ với một click.</li>
                    <li>Được nhãn hàng chủ động gửi lời mời booking chiến dịch độc quyền.</li>
                    <li>Trao đổi trực tiếp với đại diện Brand và đội ngũ hỗ trợ chiến dịch.</li>
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
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#613bd1] to-[#316bbf] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
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
      {/* Media Kit Fullscreen Preview Modal */}
      {showMediaKitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setShowMediaKitModal(false)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header cố định với nút Đóng (X) luôn nổi bật và rõ ràng */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-white/95 backdrop-blur-sm shrink-0 z-30">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-[#613bd1] to-[#316bbf] text-white font-black text-xs shadow-xs">
                  KC
                </span>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                    Thẻ Media Kit KOC Chính Thức (Dạng Ngang)
                  </h3>
                  <p className="font-mono text-[11px] text-[#613bd1]">{tiktokHandle || '@creator'}</p>
                </div>
              </div>

              {/* Nút đóng (X) rõ ràng, to, nổi bật */}
              <button
                type="button"
                onClick={() => setShowMediaKitModal(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 shadow-xs transition-all cursor-pointer group hover:scale-105 active:scale-95"
                title="Đóng thẻ (Esc)"
              >
                <span className="text-xs font-bold group-hover:text-rose-600">Đóng</span>
                <span className="material-symbols-outlined text-[18px] font-bold">close</span>
              </button>
            </div>

            {/* Nội dung cuộn mượt mà (dạng ngang trên desktop/tablet, không bị tràn màn hình) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Thẻ Media Kit ĐƯỢC CHỤP ẢNH XUẤT PNG (cardRef) - DẠNG NGANG (LANDSCAPE) */}
              <div
                ref={mediaKitCardRef}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
              >
                {/* Header dải băng trên thẻ Media Kit */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-[#613bd1] to-[#316bbf] text-white shadow-sm font-black text-xs">
                      KC
                    </span>
                    <div>
                      <h4 className="text-xs font-black tracking-wide text-slate-900 uppercase">
                        KOCITY CREATOR MEDIA KIT
                      </h4>
                      <p className="text-[10px] text-slate-400">Nền tảng kết nối KOC & Brand chính hãng</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 border border-purple-200">
                    <span className="text-[10px] font-semibold text-purple-700 uppercase">Mã KOC:</span>
                    <span className="font-mono text-xs font-extrabold text-[#613bd1]">#{kocMemberCode}</span>
                    <button
                      type="button"
                      onClick={handleCopyMemberCode}
                      className="ml-0.5 text-slate-400 hover:text-[#613bd1] transition-colors cursor-pointer"
                      title="Sao chép mã KOC"
                    >
                      <span className="material-symbols-outlined text-[13px] leading-none">
                        {copyMemberCodeSuccess ? 'done' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Bố cục DẠNG NGANG: 2 cột chia đôi cân đối (Left & Right) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* CỘT TRÁI (md:col-span-5): Creator Info, Socials, Bio, Categories, Highlights */}
                  <div className="md:col-span-5 space-y-3.5 md:border-r md:border-slate-100 md:pr-6">
                    {/* Avatar & Tên KOC */}
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        <img
                          src={avatar || APP_LOGOS.userProfile}
                          alt={name}
                          crossOrigin="anonymous"
                          className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-purple-200 shadow-sm"
                        />
                        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm ring-2 ring-white">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-black text-slate-900 truncate">
                          {name || 'Hồ sơ KOC'}
                        </h4>
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                          <span className="material-symbols-outlined text-[14px] text-[#316bbf]">location_on</span>
                          <span className="truncate">
                            {address ? `${address}${district ? `, ${district}` : ''}${city ? `, ${city}` : ''}` : (city || 'Toàn quốc')}
                          </span>
                        </div>
                        <span className="inline-block mt-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-200">
                          ⭐ 5.0 KOC Verified
                        </span>
                      </div>
                    </div>

                    {/* Social Handles */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="font-mono text-xs font-bold text-[#613bd1] bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                        TikTok: {tiktokHandle || '@creator'}
                      </span>
                      {instagramHandle && (
                        <span className="font-mono text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-100">
                          IG: @{instagramHandle.replace(/[@\s]/g, '')}
                        </span>
                      )}
                      {youtubeHandle && (
                        <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                          YT: @{youtubeHandle.replace(/[@\s]/g, '')}
                        </span>
                      )}
                    </div>

                    {/* Bio */}
                    {bio && (
                      <p className="text-xs text-slate-600 leading-relaxed italic bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                        "{bio}"
                      </p>
                    )}

                    {/* Lĩnh vực & Chuyên mục hoạt động */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Lĩnh vực & Chuyên mục thế mạnh:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {categories.length > 0 ? (
                          categories.map((c, i) => (
                            <span key={i} className="rounded-lg bg-purple-100 px-2.5 py-1 text-[10px] font-bold text-[#613bd1]">
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Chưa chọn ngành hàng</span>
                        )}
                      </div>
                    </div>

                    {/* Báo giá & Điều khoản hợp tác - Thiết kế 2 thẻ đối xứng cân bằng */}
                    <div className="rounded-2xl bg-slate-50/90 p-2.5 border border-slate-200/80 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Cột 1: Báo giá booking */}
                        <div className="rounded-xl bg-white p-2.5 border border-slate-200/70 shadow-2xs flex flex-col justify-between min-h-[66px]">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-emerald-600">payments</span>
                            Báo giá booking
                          </span>
                          <span className="text-xs font-black text-slate-900 mt-1 leading-snug">
                            {minBookingRate || 'Mẫu 0đ + Hoa hồng'}
                          </span>
                        </div>

                        {/* Cột 2: Mã Spark Ads */}
                        <div className="rounded-xl bg-white p-2.5 border border-slate-200/70 shadow-2xs flex flex-col justify-between min-h-[66px]">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-[#613bd1]">bolt</span>
                            Mã Spark Ads
                          </span>
                          <span className="text-xs font-black text-[#613bd1] mt-1 leading-snug">
                            {allowSparkAds ? 'Sẵn sàng cấp' : 'Thỏa thuận'}
                          </span>
                        </div>
                      </div>

                      {/* Dòng Mẫu 0đ Freecast */}
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs text-[11px]">
                        <span className="font-semibold text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-amber-600">card_giftcard</span>
                          Mẫu 0đ (Freecast):
                        </span>
                        <span className="font-extrabold text-emerald-700">
                          {acceptFreecast ? 'Sẵn sàng nhận mẫu' : 'Booking fee'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CỘT PHẢI (md:col-span-7): Metrics Grid, Video styles, Target audience, Portfolio */}
                  <div className="md:col-span-7 space-y-3.5">
                    {/* Metric Stats Grid (Bao gồm GMV Kênh) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="rounded-xl bg-purple-50/70 p-2.5 border border-purple-100">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Followers</span>
                        <b className="text-sm sm:text-base text-slate-900 font-['Plus_Jakarta_Sans'] font-black">{followers || '10K+'}</b>
                      </div>
                      <div className="rounded-xl bg-blue-50/70 p-2.5 border border-blue-100">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Avg Views</span>
                        <b className="text-sm sm:text-base text-[#316bbf] font-['Plus_Jakarta_Sans'] font-black">{avgViews || '5K+'}</b>
                      </div>
                      <div className="rounded-xl bg-pink-50/70 p-2.5 border border-pink-100">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Tương tác</span>
                        <b className="text-sm sm:text-base text-[#613bd1] font-['Plus_Jakarta_Sans'] font-black">{engagementRate || '4.5%'}</b>
                      </div>
                      <div className="rounded-xl bg-emerald-50/80 p-2.5 border border-emerald-200">
                        <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider mb-0.5 flex items-center justify-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px] text-emerald-600">trending_up</span>
                          GMV Kênh
                        </span>
                        <b className="text-sm sm:text-base text-emerald-700 font-['Plus_Jakarta_Sans'] font-black">{gmv || 'Chưa cập nhật'}</b>
                      </div>
                    </div>

                    {/* Hàng 2 cột cân đối: Phong cách video (Trái) & Đối tượng khán giả (Phải) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                      {/* Phong cách video & Định dạng nội dung */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-[#613bd1]">movie</span>
                            Phong cách video:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {activeContentStyles.length > 0 ? (
                              activeContentStyles.map((st, i) => (
                                <span key={i} className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-[10px] font-bold text-[#316bbf]">
                                  {st}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Review, Vlog, Unboxing</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Đối tượng khán giả chính (Target Audience) - Thu gọn, đầy đặn, không bị trống */}
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-amber-700">groups</span>
                              Đối tượng khán giả:
                            </span>
                            <span className="text-[9px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded-md">
                              Demographics
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium leading-relaxed">
                            {targetAudience || 'Độ tuổi 18 - 35 • Phù hợp tệp khách hàng trẻ & văn phòng'}
                          </p>

                          {/* Quick Demographic Badges để không bao giờ bị trống trải */}
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-900 bg-white/80 border border-amber-200 px-1.5 py-0.5 rounded">
                              18 - 35 tuổi
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-900 bg-white/80 border border-amber-200 px-1.5 py-0.5 rounded">
                              Nam & Nữ
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-900 bg-white/80 border border-amber-200 px-1.5 py-0.5 rounded">
                              Toàn quốc
                            </span>
                          </div>
                        </div>

                        {targetAudienceImage && (
                          <div className="mt-2 pt-2 border-t border-amber-200/60">
                            <div
                              onClick={() => setPreviewAudienceModalImage(targetAudienceImage)}
                              className="flex items-center gap-2 p-1.5 rounded-lg bg-white/90 border border-amber-300 group cursor-pointer shadow-2xs hover:bg-amber-100/50 transition-colors"
                              title="Bấm để xem ảnh phân tích phóng to"
                            >
                              <img
                                src={targetAudienceImage}
                                alt="Ảnh phân tích khán giả"
                                crossOrigin="anonymous"
                                className="h-9 w-12 object-cover rounded border border-amber-200"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-slate-800 block truncate">Biểu đồ người xem</span>
                                <span className="text-[9px] text-amber-700 flex items-center gap-0.5 font-medium">
                                  <span className="material-symbols-outlined text-[11px]">zoom_in</span> Xem phóng to
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Portfolio & Case Studies */}
                    {portfolioDriveLink || portfolioFile ? (
                      <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                        <span className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider block flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-[#613bd1]">folder_shared</span>
                          Portfolio hoặc Video nổi bật:
                        </span>

                        {/* File Portfolio or Uploaded Video */}
                        {portfolioFile && (
                          isPortfolioFileVideo(portfolioFile) ? (
                            <div className="space-y-1">
                              <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-48 sm:max-h-56 w-full shadow-xs">
                                <video
                                  src={portfolioFile.dataUrl}
                                  controls
                                  playsInline
                                  preload="metadata"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
                                <span className="truncate max-w-[220px] font-medium flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px] text-purple-600">movie</span>
                                  {portfolioFile.name}
                                </span>
                                {portfolioFile.dataUrl && (
                                  <a
                                    href={portfolioFile.dataUrl}
                                    download={portfolioFile.name}
                                    className="text-purple-700 hover:underline font-bold text-[10px] shrink-0"
                                  >
                                    Tải về ({portfolioFile.size})
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 text-xs text-rose-700 font-bold bg-white px-2.5 py-1.5 rounded-xl border border-rose-200 shadow-2xs">
                              <span className="material-symbols-outlined text-[15px] text-rose-500">picture_as_pdf</span>
                              <span className="truncate max-w-[160px]">{portfolioFile.name}</span>
                              <span className="text-[10px] text-slate-400">({portfolioFile.size})</span>
                            </div>
                          )
                        )}

                        {/* Link Portfolio or Embedded Video */}
                        {portfolioDriveLink && (() => {
                          const parsed = parsePortfolioVideoLink(portfolioDriveLink);
                          if (!parsed) return null;
                          if (parsed.type === 'youtube') {
                            return (
                              <div className="space-y-1">
                                <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-48 sm:max-h-56 w-full shadow-xs">
                                  <iframe
                                    src={parsed.embedUrl}
                                    title="Video Portfolio YouTube"
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                                  <span className="flex items-center gap-1 text-red-600 font-semibold">
                                    <span className="material-symbols-outlined text-[13px]">smart_display</span> YouTube Video
                                  </span>
                                  <a href={parsed.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-0.5">
                                    Mở trên YouTube <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                                  </a>
                                </div>
                              </div>
                            );
                          }
                          if (parsed.type === 'video') {
                            return (
                              <div className="space-y-1">
                                <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-48 sm:max-h-56 w-full shadow-xs">
                                  <video
                                    src={parsed.embedUrl}
                                    controls
                                    playsInline
                                    preload="metadata"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                                  <span className="flex items-center gap-1 text-purple-600 font-semibold">
                                    <span className="material-symbols-outlined text-[13px]">movie</span> Video trực tiếp
                                  </span>
                                  <a href={parsed.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-0.5">
                                    Mở liên kết <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                                  </a>
                                </div>
                              </div>
                            );
                          }
                          if (parsed.type === 'tiktok') {
                            return (
                              <a
                                href={parsed.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 text-white hover:bg-black transition-colors shadow-2xs group"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-pink-400 text-[15px]">play_circle</span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">Video review trên TikTok</p>
                                    <p className="text-[10px] text-slate-300 truncate">{parsed.url}</p>
                                  </div>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-300 bg-white/10 px-2 py-1 rounded-lg shrink-0 group-hover:bg-white/20">
                                  Xem TikTok <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                                </span>
                              </a>
                            );
                          }
                          return (
                            <a
                              href={parsed.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-[#316bbf] font-bold bg-white px-2.5 py-1.5 rounded-xl border border-blue-200 shadow-2xs hover:bg-blue-50 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[15px]">link</span>
                              <span>Mở Drive / Notion Portfolio</span>
                              <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                            </a>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 border-dashed flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-[#613bd1] uppercase tracking-wider block">
                            Portfolio hoặc Video nổi bật:
                          </span>
                          <span className="text-xs text-slate-500">Chưa tải video review hoặc gắn link</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMediaKitModal(false);
                            setActiveTab('mediaKit');
                            setTimeout(() => {
                              const input = document.getElementById('koc-portfolio-upload-input');
                              if (input) input.click();
                            }, 150);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#613bd1] hover:bg-[#522eb8] text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">video_call</span>
                          <span>Tải video ngay</span>
                        </button>
                      </div>
                    )}

                    {/* Watermark */}
                    <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                      <span>Xác thực bởi Kocity Platform</span>
                      <span>https://kocity.vn</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer cố định phía dưới */}
            <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/95 backdrop-blur-sm shrink-0 space-y-2 z-20">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadMediaKitImage}
                  disabled={isDownloadingMediaKit}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 disabled:opacity-50 py-2.5 px-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  title="Lưu thẻ Media Kit thành file ảnh PNG để gửi qua Zalo / Messenger"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isDownloadingMediaKit ? 'sync' : 'download'}
                  </span>
                  <span>{isDownloadingMediaKit ? 'Đang xuất ảnh...' : 'Tải ảnh thẻ (PNG)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareMediaKit}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 py-2.5 px-3 text-xs font-bold text-[#613bd1] transition-all cursor-pointer"
                  title="Sao chép link web để người khác click vào xem trực tiếp trên trình duyệt"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedShareLink ? 'done' : 'link'}
                  </span>
                  <span>{copiedShareLink ? 'Đã copy link!' : 'Copy link web'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowMediaKitModal(false)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
                <span>Đóng thẻ Media Kit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem ảnh phóng to nếu KOC có tải ảnh đối tượng khán giả */}
      {previewAudienceModalImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setPreviewAudienceModalImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewAudienceModalImage(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
            <img
              src={previewAudienceModalImage}
              alt="Ảnh phóng to phân tích khán giả"
              className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
