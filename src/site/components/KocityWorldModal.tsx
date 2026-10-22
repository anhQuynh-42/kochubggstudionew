import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Campaign } from '../../types';
import { Icon, Button, cx } from '../ui';

export type VehicleType = 'walk' | 'bicycle' | 'motorbike';
export type TrafficLightState = 'green' | 'yellow' | 'red';

interface Citizen {
  id: string;
  name: string;
  number: string;
  role: string;
  jobsDone: number;
  vehicle: VehicleType;
  x: number;
  y: number;
  direction: 'left' | 'right';
  speed: number;
  minX: number;
  maxX: number;
  avatarColor: string;
  isCurrentUser?: boolean;
  bubble?: string;
}

export interface BrandStation {
  id: string;
  name: string;
  brandName: string;
  streetName: string;
  x: number;
  y: number;
  category: string;
  sampleCount: number;
  icon: string;
  badgeBg: string;
  tagline: string;
  desc: string;
  badgeEmoji: string;
  jobTitle: string;
  jobReward: string;
  jobRequirements: string;
  jobQuota: string;
  hasJobAlert?: boolean;
}

export interface DynamicRoad {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: 'horizontal' | 'vertical';
  type: 'asphalt' | 'bridge' | 'paved';
}

interface KocityWorldModalProps {
  open: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  currentUser: any;
  isAdmin?: boolean;
  isNightDefault?: boolean;
  onSelectCampaign?: (campaignId: string) => void;
}

export const DEFAULT_BRAND_STATIONS: BrandStation[] = [
  {
    id: 'store-comem',
    name: 'Store Cỏ Mềm Homelab',
    brandName: 'CỎ MỀM',
    streetName: 'Khu Phố Thương Mại Brand',
    x: 1760,
    y: 190,
    category: 'Mỹ phẩm thiên nhiên thuần khiết',
    sampleCount: 35,
    icon: 'spa',
    badgeBg: 'bg-emerald-600',
    badgeEmoji: '🌿',
    tagline: 'Lành sạch thuần Việt · Kho tổng xuất mẫu từ Hà Nội',
    desc: 'Kho Cỏ Mềm gửi son dưỡng gạo, bọt rửa mặt trà xanh, serum rau má 0đ tận nhà cho KOC.',
    jobTitle: 'Review Bọt Rửa Mặt & Son Gạo Thuần Khiết Cỏ Mềm',
    jobReward: 'Tài trợ 100% mẫu dùng thử 0đ + Hoa hồng affiliate 18% - 20%',
    jobRequirements: '1 Video ngắn TikTok/Reels/Shorts trải nghiệm chất bọt mịn và độ dưỡng ẩm lành sạch.',
    jobQuota: 'Còn 35 suất nhận mẫu miễn phí đợt này',
    hasJobAlert: true,
  },
  {
    id: 'store-bielenda',
    name: 'Boutique Bielenda',
    brandName: 'BIELENDA',
    streetName: 'Khu Phố Thương Mại Brand',
    x: 1950,
    y: 190,
    category: 'Dược mỹ phẩm Châu Âu',
    sampleCount: 42,
    icon: 'water_drop',
    badgeBg: 'bg-fuchsia-600',
    badgeEmoji: '✨',
    tagline: 'Kho nhập khẩu Sài Gòn · Trị mụn & Phục hồi chuyên sâu',
    desc: 'Dòng sản phẩm toner acid, serum peel da được hàng triệu beauty blogger tin dùng.',
    jobTitle: 'Chiến Dịch Routine Skincare Treatment Cùng Bielenda Skin House',
    jobReward: 'Tài trợ bộ kit skincare Châu Âu 0đ + Hoa hồng bán hàng 18%',
    jobRequirements: '1 Video review quy trình dưỡng da treatment an toàn, phục hồi căng bóng.',
    jobQuota: 'Còn 42 suất nhận mẫu miễn phí đợt này',
    hasJobAlert: true,
  },
  {
    id: 'store-visecret',
    name: 'Store ViSecret Fashion',
    brandName: 'VISECRET',
    streetName: 'Khu Phố Thương Mại Brand',
    x: 2140,
    y: 190,
    category: 'Thời trang & Nội y thiết kế',
    sampleCount: 25,
    icon: 'checkroom',
    badgeBg: 'bg-purple-600',
    badgeEmoji: '👗',
    tagline: 'Kho may mặc Hà Nội · Tôn dáng chuẩn KOC',
    desc: 'Xuất mẫu áo bra tàng hình, đầm thiết kế miễn phí tận nhà cho KOC lên video biến hình OOTD.',
    jobTitle: 'Biến Hình OOTD Đầm Thiết Kế & Áo Bra Tàng Hình Tôn Dáng',
    jobReward: 'Tặng 02 set đầm/áo thiết kế 0đ + Hoa hồng bán hàng 22%',
    jobRequirements: '1 Video biến hình OOTD chuyển cảnh cuốn hút theo nhạc trend, tôn dáng trang phục.',
    jobQuota: 'Còn 25 suất nhận mẫu miễn phí đợt này',
    hasJobAlert: true,
  },
  {
    id: 'store-tranyoo',
    name: 'Store Tranyoo Audio',
    brandName: 'TRANYOO',
    streetName: 'Khu Phố Thương Mại Brand',
    x: 2330,
    y: 190,
    category: 'Tai nghe & Phụ kiện Cyberpunk',
    sampleCount: 30,
    icon: 'headphones',
    badgeBg: 'bg-blue-600',
    badgeEmoji: '🎧',
    tagline: 'Kho công nghệ Sài Gòn · Giao tai nghe 0đ trong 24h',
    desc: 'Trụ sở phân phối tai nghe Bluetooth TWS, củ sạc nhanh chuẩn Gen Z cho creator livestream.',
    jobTitle: 'Trải Nghiệm Tai Nghe TWS Chống Ồn & Củ Sạc Siêu Tốc Cyber',
    jobReward: 'Tài trợ 01 tai nghe Bluetooth TWS 0đ + Thưởng view & Hoa hồng 15%',
    jobRequirements: '1 Video unbox, test chất âm bass cực đã hoặc livestream giới thiệu sản phẩm.',
    jobQuota: 'Còn 30 suất nhận mẫu miễn phí đợt này',
    hasJobAlert: true,
  },
  {
    id: 'store-ootd',
    name: 'Studio OOTD KOCity',
    brandName: 'STUDIO OOTD',
    streetName: 'Khu Phố Thương Mại Brand',
    x: 2520,
    y: 190,
    category: 'Phông chụp ảnh & Livestream Creator',
    sampleCount: 100,
    icon: 'photo_camera',
    badgeBg: 'bg-slate-700',
    badgeEmoji: '📸',
    tagline: 'Studio miễn phí 100% cho mọi cư dân KOCity',
    desc: 'Đầy đủ đèn livestream, phông xanh, gương toàn thân cho KOC quay video review.',
    jobTitle: 'Đặc Quyền Sử Dụng Phòng Live & Studio OOTD Miễn Phí',
    jobReward: 'Free 100% giờ quay chụp',
    jobRequirements: 'Dành riêng cho KOC thành viên đã hoàn thành từ 1 job trở lên.',
    jobQuota: 'Mở cửa 24/7',
    hasJobAlert: false,
  },
];

export const DEFAULT_LANDMARK_POS = { x: 1240, y: 480 };
export const DEFAULT_GUARD_POS = { x: 1190, y: 960 };
export const DEFAULT_BIDDING_LOT = {
  x: 1720,
  y: 1000,
  width: 960,
  height: 580,
  title: 'KHU ĐẤT TRỐNG ĐANG ĐẤU THẦU',
  area: '10.000 m²',
};

const MAP_W = 2800;
const MAP_H = 1700;

/**
 * COMPONENT STORE 3D CLAY NHỎ NHẮN CHUẨN THEO ẢNH MẪU
 * Thiết kế tỉ mỉ: Mái hiên sọc đỏ-vàng cong 3D, biển hiệu xanh da trời,
 * chữ tên Brand vàng nổi 3D, cửa kính & bệ chân đế bo tròn.
 */
const Clay3DStore: React.FC<{
  brandName: string;
  hasJobAlert?: boolean;
  onClick: () => void;
}> = ({ brandName, hasJobAlert = true, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center cursor-pointer group clickable-element transition-transform duration-200 hover:scale-110 active:scale-95"
      style={{ width: 110, height: 120 }}
    >
      {/* Huy hiệu chuông báo Job 0đ nhấp nháy trên nóc */}
      {hasJobAlert && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white animate-bounce flex items-center gap-0.5 whitespace-nowrap">
          <span>🔔</span>
          <span>JOB 0Đ</span>
        </div>
      )}

      {/* SVG 3D Clay Toy Store giống hệt ảnh mẫu */}
      <svg
        viewBox="0 0 110 120"
        className="w-full h-full filter drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`shadow-${brandName}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>

          {/* Gradient tường nhà tím phồng 3D */}
          <linearGradient id={`wallGrad-${brandName}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="45%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>

          {/* Gradient mái hiên sọc đỏ */}
          <linearGradient id={`awningRed-${brandName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>

          {/* Gradient mái hiên sọc vàng */}
          <linearGradient id={`awningYellow-${brandName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* Gradient biển hiệu xanh da trời */}
          <linearGradient id={`signGrad-${brandName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* 1. Bóng đổ sàn hình bầu dục */}
        <ellipse cx="55" cy="115" rx="46" ry="5.5" fill={`url(#shadow-${brandName})`} />

        {/* 2. Bệ nền bo tròn 3D màu xanh ngọc (Pedestal) */}
        <rect x="8" y="103" width="94" height="9" rx="4.5" fill="#38bdf8" />
        <rect x="8" y="99" width="94" height="9" rx="4.5" fill="#bae6fd" />
        <rect x="12" y="101" width="86" height="3" rx="1.5" fill="#e0f2fe" opacity="0.7" />

        {/* 3. Thân tường nhà tím phồng 3D (Body) */}
        <rect x="19" y="44" width="72" height="56" rx="10" fill={`url(#wallGrad-${brandName})`} />
        <path d="M19 95 H91 V98 C91 99.5 89.5 100 87 100 H23 C20.5 100 19 99.5 19 98 Z" fill="#0284c7" />

        {/* 4. Gờ mái bo tròn dày 3D (Roof Cornice) */}
        <rect x="15" y="40" width="80" height="9" rx="4.5" fill="#a78bfa" />
        <rect x="16" y="41" width="78" height="3" rx="1.5" fill="#ede9fe" opacity="0.7" />

        {/* 5. Biển hiệu STORE trên nóc (Roof Signboard) */}
        <rect x="26" y="16" width="58" height="26" rx="8" fill={`url(#signGrad-${brandName})`} stroke="#e0f2fe" strokeWidth="1.5" />
        <rect x="29" y="18" width="52" height="3.5" rx="1.75" fill="#e0f2fe" opacity="0.6" />
        {/* Chữ Tên Brand nổi 3D màu vàng */}
        <text
          x="55"
          y="33.5"
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#fde047"
          stroke="#b45309"
          strokeWidth="0.8"
          paintOrder="stroke fill"
          letterSpacing="0.4"
        >
          {brandName}
        </text>

        {/* 6. Mái hiên cong sọc đỏ - vàng (Striped Curved Awning) */}
        <g>
          <path d="M21 48 Q21 62 23 64 L29 64 Q27 52 27 48 Z" fill={`url(#awningRed-${brandName})`} />
          <path d="M27 48 Q27 52 29 64 L39 64 Q37 52 37 48 Z" fill={`url(#awningYellow-${brandName})`} />
          <path d="M37 48 Q37 52 39 64 L49 64 Q47 52 47 48 Z" fill={`url(#awningRed-${brandName})`} />
          <path d="M47 48 Q47 52 49 64 L59 64 Q57 52 57 48 Z" fill={`url(#awningYellow-${brandName})`} />
          <path d="M57 48 Q57 52 59 64 L69 64 Q67 52 67 48 Z" fill={`url(#awningRed-${brandName})`} />
          <path d="M67 48 Q67 52 69 64 L79 64 Q77 52 77 48 Z" fill={`url(#awningYellow-${brandName})`} />
          <path d="M77 48 Q77 52 79 64 L87 64 Q87 62 87 48 Z" fill={`url(#awningRed-${brandName})`} />

          <path
            d="M23 63 Q26 67 29 63 Q34 67 39 63 Q44 67 49 63 Q54 67 59 63 Q64 67 69 63 Q74 67 79 63 Q83 67 87 63"
            stroke="#b91c1c"
            strokeWidth="1.2"
            fill="none"
          />
        </g>

        {/* 7. Cửa ra vào bên trái */}
        <rect x="26" y="66" width="18" height="30" rx="3.5" fill="#f0f9ff" stroke="#38bdf8" strokeWidth="2.5" />
        <rect x="39" y="78" width="2" height="6" rx="1" fill="#0284c7" />

        {/* 8. Cửa sổ kính bên phải */}
        <rect x="49" y="66" width="31" height="20" rx="3.5" fill="#bae6fd" stroke="#38bdf8" strokeWidth="2.5" />
        <path d="M53 69 L74 69 L67 82 L53 82 Z" fill="#e0f2fe" opacity="0.6" />
        <rect x="46" y="86" width="37" height="4" rx="2" fill="#38bdf8" stroke="#bae6fd" strokeWidth="0.8" />
      </svg>
    </div>
  );
};

interface StoreEditorModalProps {
  initialStore?: BrandStation | null;
  onSave: (store: BrandStation) => void;
  onClose: () => void;
}

const StoreEditorModal: React.FC<StoreEditorModalProps> = ({ initialStore, onSave, onClose }) => {
  const [brandName, setBrandName] = useState(initialStore?.brandName || '');
  const [name, setName] = useState(initialStore?.name || '');
  const [category, setCategory] = useState(initialStore?.category || 'Mỹ phẩm & Chăm sóc sắc đẹp');
  const [x, setX] = useState<number>(initialStore?.x ?? 1850);
  const [y, setY] = useState<number>(initialStore?.y ?? 200);
  const [sampleCount, setSampleCount] = useState<number>(initialStore?.sampleCount ?? 50);
  const [jobTitle, setJobTitle] = useState(initialStore?.jobTitle || 'Chiến dịch Trải Nghiệm & Review Sản Phẩm Mới');
  const [jobReward, setJobReward] = useState(initialStore?.jobReward || 'Nhận sản phẩm 0đ + Hoa hồng 25%');
  const [jobQuota, setJobQuota] = useState(initialStore?.jobQuota || 'Còn 30 suất đăng ký');
  const [jobRequirements, setJobRequirements] = useState(
    initialStore?.jobRequirements || 'KOC từ 3.000 followers, có clip review tối thiểu 1.000 view.'
  );
  const [streetName, setStreetName] = useState(initialStore?.streetName || 'Khu Phố Thương Mại Brand');
  const [hasJobAlert, setHasJobAlert] = useState<boolean>(initialStore?.hasJobAlert ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      alert('Vui lòng nhập tên thương hiệu (Brand)!');
      return;
    }
    const storeToSave: BrandStation = {
      id: initialStore?.id || `store-${Date.now()}`,
      name: name.trim() || `Store ${brandName} KOCity`,
      brandName: brandName.trim().toUpperCase(),
      streetName,
      x: Number(x) || 1850,
      y: Number(y) || 200,
      category,
      sampleCount: Number(sampleCount) || 50,
      icon: 'storefront',
      badgeBg: 'bg-indigo-600',
      badgeEmoji: '🏪',
      tagline: 'Cửa hàng chính hãng tại KOCity',
      desc: 'Chi nhánh chính thức của nhãn hàng tại KOCity.',
      jobTitle,
      jobReward,
      jobRequirements,
      jobQuota,
      hasJobAlert,
    };
    onSave(storeToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-amber-400 p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-2xl font-black shadow-lg">
            🏪
          </div>
          <div>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
              QUY HOẠCH STORE BRAND
            </span>
            <h3 className="text-lg font-black text-white mt-0.5">
              {initialStore ? `Chỉnh Sửa Store: ${initialStore.brandName}` : 'Thêm Cửa Hàng Brand Mới'}
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Tên Brand (Hiển thị 3D) *</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Ví dụ: DIOR, SAMSUNG..."
                className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-400 outline-hidden"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Tên Store Đầy Đủ</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Flagship Store Dior"
                className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Ngành Hàng / Danh Mục</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Mỹ phẩm, Thời trang, Đồ gia dụng..."
              className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 bg-amber-400/10 border border-amber-400/30 p-3 rounded-2xl">
            <div>
              <label className="block text-amber-300 font-bold mb-1">Tọa độ X (Ngang: 0 - 2800)</label>
              <input
                type="number"
                value={x}
                onChange={(e) => setX(Number(e.target.value))}
                className="w-full bg-slate-800 border border-amber-400/50 rounded-xl px-3 py-2 text-amber-200 font-mono font-bold focus:border-amber-400 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-amber-300 font-bold mb-1">Tọa độ Y (Dọc: 0 - 1700)</label>
              <input
                type="number"
                value={y}
                onChange={(e) => setY(Number(e.target.value))}
                className="w-full bg-slate-800 border border-amber-400/50 rounded-xl px-3 py-2 text-amber-200 font-mono font-bold focus:border-amber-400 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Tiêu Đề Chiến Dịch / Job Tuyển KOC</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Thù Lao & Quyền Lợi KOC</label>
              <input
                type="text"
                value={jobReward}
                onChange={(e) => setJobReward(e.target.value)}
                className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Số Lượng Suất / Mẫu 0đ</label>
              <input
                type="text"
                value={jobQuota}
                onChange={(e) => setJobQuota(e.target.value)}
                placeholder="Còn 20 suất"
                className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Yêu Cầu Nội Dung Đối Với KOC</label>
            <textarea
              rows={2}
              value={jobRequirements}
              onChange={(e) => setJobRequirements(e.target.value)}
              className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white focus:border-amber-400 outline-hidden resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="chk-job-alert"
              checked={hasJobAlert}
              onChange={(e) => setHasJobAlert(e.target.checked)}
              className="h-4 w-4 rounded accent-rose-500 cursor-pointer"
            />
            <label htmlFor="chk-job-alert" className="text-slate-200 cursor-pointer font-bold">
              Hiển thị chuông báo "JOB 0Đ" nhấp nháy trên nóc nhà Store
            </label>
          </div>

          <div className="flex gap-2 pt-3 border-t border-white/10">
            <Button
              type="submit"
              variant="primary"
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black cursor-pointer"
            >
              💾 Lưu Cửa Hàng Lên Bản Đồ
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-white cursor-pointer"
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface RoadEditorModalProps {
  onAdd: (road: DynamicRoad) => void;
  onClose: () => void;
}

const RoadEditorModal: React.FC<RoadEditorModalProps> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('Đại Lộ Ánh Sáng');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [type, setType] = useState<'asphalt' | 'bridge' | 'paved'>('asphalt');
  const [x, setX] = useState<number>(1700);
  const [y, setY] = useState<number>(450);
  const [width, setWidth] = useState<number>(900);
  const [height, setHeight] = useState<number>(100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoad: DynamicRoad = {
      id: `road-${Date.now()}`,
      name: name.trim() || 'Tuyến Đường Mới',
      orientation,
      type,
      x: Number(x) || 1700,
      y: Number(y) || 450,
      width: Number(width) || (orientation === 'horizontal' ? 800 : 100),
      height: Number(height) || (orientation === 'horizontal' ? 100 : 600),
    };
    onAdd(newRoad);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-emerald-400 p-6 text-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-2xl font-black shadow-lg">
            🛣️
          </div>
          <div>
            <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
              QUY HOẠCH GIAO THÔNG
            </span>
            <h3 className="text-lg font-black text-white mt-0.5">Mở Tuyến Đường Mới</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Tên Tuyến Đường *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Đại Lộ Ngôi Sao, Phố Đi Bộ..."
              className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white font-bold focus:border-emerald-400 outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Hướng Tuyến</label>
              <select
                value={orientation}
                onChange={(e) => {
                  const val = e.target.value as 'horizontal' | 'vertical';
                  setOrientation(val);
                  if (val === 'horizontal') {
                    setWidth(800);
                    setHeight(100);
                  } else {
                    setWidth(100);
                    setHeight(600);
                  }
                }}
                className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white focus:border-emerald-400 outline-hidden font-bold"
              >
                <option value="horizontal">Ngang (Horizontal)</option>
                <option value="vertical">Dọc (Vertical)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Mặt Đường</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white focus:border-emerald-400 outline-hidden font-bold"
              >
                <option value="asphalt">Đường Nhựa Đô Thị</option>
                <option value="bridge">Cầu / Tuyến Vàng</option>
                <option value="paved">Phố Đi Bộ Lát Gạch</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-emerald-950/40 border border-emerald-400/30 p-3 rounded-2xl">
            <div>
              <label className="block text-emerald-300 font-bold mb-1">Tọa độ X</label>
              <input
                type="number"
                value={x}
                onChange={(e) => setX(Number(e.target.value))}
                className="w-full bg-slate-800 border border-emerald-400/50 rounded-xl px-3 py-2 text-emerald-200 font-mono font-bold focus:border-emerald-400 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-emerald-300 font-bold mb-1">Tọa độ Y</label>
              <input
                type="number"
                value={y}
                onChange={(e) => setY(Number(e.target.value))}
                className="w-full bg-slate-800 border border-emerald-400/50 rounded-xl px-3 py-2 text-emerald-200 font-mono font-bold focus:border-emerald-400 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Chiều rộng (W)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-400 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Chiều cao (H)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-400 outline-hidden"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-white/10">
            <Button
              type="submit"
              variant="primary"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black cursor-pointer"
            >
              🛣️ Đặt Tuyến Đường
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-white cursor-pointer"
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const KocityWorldModal: React.FC<KocityWorldModalProps> = ({
  open,
  onClose,
  campaigns,
  currentUser,
  isAdmin = false,
  isNightDefault = false,
  onSelectCampaign,
}) => {
  const isEffectiveAdmin = Boolean(
    isAdmin || currentUser?.role === 'admin' || (typeof window !== 'undefined' && localStorage.getItem('kocity_admin_mode') === 'true')
  );

  // Tính số job đã hoàn thành của user (nếu có tài khoản)
  const userJobsCount = currentUser?.completedApplications?.length || 0;
  const userVehicle: VehicleType = userJobsCount >= 3 ? 'motorbike' : userJobsCount >= 1 ? 'bicycle' : 'walk';

  const [isNight, setIsNight] = useState(isNightDefault);
  const [zoom, setZoom] = useState<number>(0.75);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: -450, y: -250 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Ref cho cử chỉ chạm 2 ngón (Pinch-to-zoom đa điểm chuẩn Google Maps)
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(zoom);
  const touchStartMidRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartPanRef = useRef<{ x: number; y: number }>(pan);

  // Trạng thái đèn giao thông ngã tư (Xanh 8s -> Vàng 2s -> Đỏ 6s)
  const [trafficLight, setTrafficLight] = useState<TrafficLightState>('green');
  const [trafficTimer, setTrafficTimer] = useState<number>(8);

  // Các Modal tương tác
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<BrandStation | null>(null);
  const [showHqModal, setShowHqModal] = useState<boolean>(false);
  const [showGuardModal, setShowGuardModal] = useState<boolean>(false);
  const [showBiddingModal, setShowBiddingModal] = useState<boolean>(false);

  // ==================== CẤU HÌNH QUY HOẠCH ĐÔ THỊ ĐỘNG (ADMIN BUILDER) ====================
  const [stores, setStores] = useState<BrandStation[]>(() => {
    try {
      const saved = localStorage.getItem('kocity_city_layout_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.stores) && parsed.stores.length > 0) {
          return parsed.stores;
        }
      }
    } catch (e) {
      console.warn('Error reading city layout', e);
    }
    return DEFAULT_BRAND_STATIONS;
  });

  const [landmarkPos, setLandmarkPos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('kocity_city_layout_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.landmarkPos) return parsed.landmarkPos;
      }
    } catch {}
    return DEFAULT_LANDMARK_POS;
  });

  const [guardPos, setGuardPos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('kocity_city_layout_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.guardPos) return parsed.guardPos;
      }
    } catch {}
    return DEFAULT_GUARD_POS;
  });

  const [biddingLot, setBiddingLot] = useState(() => {
    try {
      const saved = localStorage.getItem('kocity_city_layout_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.biddingLot) return parsed.biddingLot;
      }
    } catch {}
    return DEFAULT_BIDDING_LOT;
  });

  const [extraRoads, setExtraRoads] = useState<DynamicRoad[]>(() => {
    try {
      const saved = localStorage.getItem('kocity_city_layout_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.extraRoads)) return parsed.extraRoads;
      }
    } catch {}
    return [];
  });

  // Chế độ Quy hoạch Admin & Kéo thả
  const [isBuilderMode, setIsBuilderMode] = useState<boolean>(false);
  const [draggingItem, setDraggingItem] = useState<{
    type: 'store' | 'landmark' | 'guard' | 'bidding' | 'road';
    id: string;
    startClientX: number;
    startClientY: number;
    originX: number;
    originY: number;
  } | null>(null);

  // Form Thêm / Sửa Store
  const [editingStore, setEditingStore] = useState<BrandStation | null>(null);
  const [isAddingStore, setIsAddingStore] = useState<boolean>(false);
  const [showAddRoadModal, setShowAddRoadModal] = useState<boolean>(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const showToastNotice = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  const handleSaveCityLayout = () => {
    const config = {
      stores,
      landmarkPos,
      guardPos,
      biddingLot,
      extraRoads,
    };
    localStorage.setItem('kocity_city_layout_v2', JSON.stringify(config));
    showToastNotice('🎉 Đã lưu quy hoạch thành phố KOCity thành công!');
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục lại toàn bộ quy hoạch thành phố về mặc định ban đầu?')) {
      localStorage.removeItem('kocity_city_layout_v2');
      setStores(DEFAULT_BRAND_STATIONS);
      setLandmarkPos(DEFAULT_LANDMARK_POS);
      setGuardPos(DEFAULT_GUARD_POS);
      setBiddingLot(DEFAULT_BIDDING_LOT);
      setExtraRoads([]);
      showToastNotice('↺ Đã khôi phục quy hoạch thành phố về mặc định ban đầu!');
    }
  };

  const handleDeleteStore = (storeId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cửa hàng này khỏi thành phố?')) {
      setStores((prev) => prev.filter((s) => s.id !== storeId));
      showToastNotice('🗑️ Đã xóa cửa hàng khỏi bản đồ!');
    }
  };

  const handleSaveStoreData = (storeData: BrandStation) => {
    setStores((prev) => {
      const idx = prev.findIndex((s) => s.id === storeData.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = storeData;
        return next;
      }
      return [...prev, storeData];
    });
    setEditingStore(null);
    setIsAddingStore(false);
    showToastNotice(`✅ Đã lưu cửa hàng "${storeData.brandName}" thành công!`);
  };

  const handleAddRoad = (road: DynamicRoad) => {
    setExtraRoads((prev) => [...prev, road]);
    setShowAddRoadModal(false);
    showToastNotice(`🛣️ Đã mở tuyến đường mới: "${road.name}"!`);
  };

  const handleDeleteRoad = (roadId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa tuyến đường này?')) {
      setExtraRoads((prev) => prev.filter((r) => r.id !== roadId));
      showToastNotice('🗑️ Đã xóa tuyến đường!');
    }
  };

  const startDrag = (
    e: React.MouseEvent,
    type: 'store' | 'landmark' | 'guard' | 'bidding' | 'road',
    id: string,
    originX: number,
    originY: number
  ) => {
    if (!isBuilderMode) return;
    e.stopPropagation();
    e.preventDefault();
    setDraggingItem({
      type,
      id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      originX,
      originY,
    });
  };

  // Danh sách các cư dân KOC
  const [citizens, setCitizens] = useState<Citizen[]>([
    {
      id: 'c1',
      name: 'Thu Trang (QA***)',
      number: '#0089',
      role: 'KOC Năng Động',
      jobsDone: 1,
      vehicle: 'bicycle',
      x: 520,
      y: 830,
      direction: 'right',
      speed: 3.2,
      minX: 250,
      maxX: 2450,
      avatarColor: '#ec4899',
      bubble: 'Đạp xe qua Cầu KOCity sang Bờ Brand nhận hoa hồng cao ngất! 🚲',
    },
    {
      id: 'c2',
      name: 'Tuấn Anh (AnhTuan.Tech)',
      number: '#0042',
      role: 'KOC Thâm Niên',
      jobsDone: 4,
      vehicle: 'motorbike',
      x: 880,
      y: 890,
      direction: 'right',
      speed: 5.5,
      minX: 300,
      maxX: 2480,
      avatarColor: '#f59e0b',
      bubble: 'Vít ga xe máy qua Cầu KOCity ghé Trụ sở nhận bảo chứng hợp đồng 100%! 🛵💨',
    },
    {
      id: 'c3',
      name: 'Linh Chi (ChiChi.Review)',
      number: '#0156',
      role: 'Tân Cư Dân',
      jobsDone: 0,
      vehicle: 'walk',
      x: 380,
      y: 770,
      direction: 'right',
      speed: 1.8,
      minX: 200,
      maxX: 1600,
      avatarColor: '#10b981',
      bubble: 'Đi bộ bên Bờ KOC, xong 1 job là nhận xe đạp lướt qua Cầu KOCity nhận mẫu 0đ 🌸',
    },
    {
      id: 'c4',
      name: 'Minh Thư (Thư N.)',
      number: '#0125',
      role: 'Creator Triệu View',
      jobsDone: 8,
      vehicle: 'motorbike',
      x: 2150,
      y: 880,
      direction: 'left',
      speed: 5.2,
      minX: 350,
      maxX: 2500,
      avatarColor: '#6366f1',
      bubble: 'Vừa qua Cầu KOCity sang Store ViSecret nhận mẫu đầm 0đ hoa hồng siêu tốt 👗',
    },
    {
      id: 'c5',
      name: 'Huy Hoàng (HoangAudio)',
      number: '#0204',
      role: 'KOC Năng Động',
      jobsDone: 2,
      vehicle: 'bicycle',
      x: 1850,
      y: 840,
      direction: 'left',
      speed: 3.0,
      minX: 400,
      maxX: 2400,
      avatarColor: '#06b6d4',
      bubble: 'Đạp xe qua Cầu KOCity sang Store Tranyoo ứng tuyển job tai nghe Bluetooth 🎧',
    },
    {
      id: 'c6',
      name: 'Bảo Ngọc (NgocBao.OOTD)',
      number: '#0312',
      role: 'Tân Cư Dân',
      jobsDone: 0,
      vehicle: 'walk',
      x: 680,
      y: 780,
      direction: 'right',
      speed: 1.9,
      minX: 260,
      maxX: 1500,
      avatarColor: '#d946ef',
      bubble: 'Đi dạo Cư Xá bên Bờ Tây ngắm dòng sông và Cầu KOCity lung linh ✨',
    },
  ]);

  // Thêm nhân vật của currentUser vào thành phố
  useEffect(() => {
    if (currentUser?.name) {
      setCitizens((prev) => {
        if (prev.some((c) => c.isCurrentUser)) return prev;
        const speed = userVehicle === 'motorbike' ? 5.8 : userVehicle === 'bicycle' ? 3.4 : 2.0;

        return [
          {
            id: 'user-self',
            name: `${currentUser.name} (BẠN)`,
            number: '#001',
            role: userJobsCount >= 3 ? 'KOC Thâm Niên' : userJobsCount >= 1 ? 'KOC Năng Động' : 'Tân Cư Dân',
            jobsDone: userJobsCount,
            vehicle: userVehicle,
            x: 480,
            y: userVehicle === 'motorbike' ? 890 : userVehicle === 'bicycle' ? 840 : 775,
            direction: 'right',
            speed,
            minX: 250,
            maxX: 2480,
            avatarColor: '#f59e0b',
            isCurrentUser: true,
            bubble:
              userVehicle === 'motorbike'
                ? 'Đã nhận Xe Máy KOCity, phóng qua Cầu KOCity sang Phố Brand nhận hoa hồng cao! 🛵💨'
                : userVehicle === 'bicycle'
                ? 'Đang đạp Xe Đạp KOCity qua cầu sang Bờ Brand nhận job 0đ 🚲'
                : 'Đang đi bộ qua Cầu KOCity, bấm vào Tòa Tháp để xem đặc quyền hoa hồng cao nhé! 🚶',
          },
          ...prev,
        ];
      });
    }
  }, [currentUser, userJobsCount, userVehicle]);

  // Vòng lặp chuyển động của cư dân & XỬ LÝ DỪNG ĐÈN ĐỎ TẠI NGÃ TƯ
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setCitizens((prev) =>
        prev.map((c) => {
          const isApproachingRed =
            trafficLight === 'red' &&
            ((c.direction === 'right' && c.x >= 1200 && c.x <= 1260) ||
              (c.direction === 'left' && c.x >= 1420 && c.x <= 1480));

          if (isApproachingRed) {
            return {
              ...c,
              bubble: 'Dừng đèn đỏ ngã tư chờ sang đường an toàn! 🚦🔴',
            };
          }

          let nextX = c.x + (c.direction === 'right' ? c.speed : -c.speed);
          let nextDir = c.direction;
          if (nextX >= c.maxX) {
            nextX = c.maxX;
            nextDir = 'left';
          } else if (nextX <= c.minX) {
            nextX = c.minX;
            nextDir = 'right';
          }
          return { ...c, x: nextX, direction: nextDir };
        })
      );
    }, 45);
    return () => clearInterval(interval);
  }, [open, trafficLight]);

  // Thuật toán Zoom bám con trỏ chuột chuẩn Google Maps
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const worldX = (cursorX - pan.x) / zoom;
    const worldY = (cursorY - pan.y) / zoom;

    const zoomFactor = Math.exp(-e.deltaY * 0.0022);
    const newZoom = Math.min(1.6, Math.max(0.35, zoom * zoomFactor));

    const newPanX = cursorX - worldX * newZoom;
    const newPanY = cursorY - worldY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Nhấp đúp chuột để phóng to vào đúng điểm nhấp
  const handleDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, .clickable-element')) return;
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const worldX = (cursorX - pan.x) / zoom;
    const worldY = (cursorY - pan.y) / zoom;

    const targetZoom = Math.min(1.6, zoom * 1.35);
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newPanX = centerX - worldX * targetZoom;
    const newPanY = centerY - worldY * targetZoom;

    setZoom(targetZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Zoom bám tâm màn hình
  const zoomAtScreenCenter = (factor: number) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const worldX = (centerX - pan.x) / zoom;
    const worldY = (centerY - pan.y) / zoom;

    const newZoom = Math.min(1.6, Math.max(0.35, zoom * factor));
    const newPanX = centerX - worldX * newZoom;
    const newPanY = centerY - worldY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Kéo thả chuột (Pan)
  // Kéo thả chuột (Pan hoặc Drag Element trong Builder Mode)
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, .clickable-element, input, select')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Kéo thả phần tử trong chế độ Quy hoạch Admin
    if (draggingItem) {
      const deltaX = (e.clientX - draggingItem.startClientX) / zoom;
      const deltaY = (e.clientY - draggingItem.startClientY) / zoom;
      const newX = Math.round((draggingItem.originX + deltaX) / 10) * 10;
      const newY = Math.round((draggingItem.originY + deltaY) / 10) * 10;

      if (draggingItem.type === 'store') {
        setStores((prev) =>
          prev.map((s) => (s.id === draggingItem.id ? { ...s, x: newX, y: newY } : s))
        );
      } else if (draggingItem.type === 'landmark') {
        setLandmarkPos({ x: newX, y: newY });
      } else if (draggingItem.type === 'guard') {
        setGuardPos({ x: newX, y: newY });
      } else if (draggingItem.type === 'bidding') {
        setBiddingLot((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (draggingItem.type === 'road') {
        setExtraRoads((prev) =>
          prev.map((r) => (r.id === draggingItem.id ? { ...r, x: newX, y: newY } : r))
        );
      }
      return;
    }

    // 2. Kéo thả di chuyển bản đồ (Pan)
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    if (draggingItem) {
      setDraggingItem(null);
    }
    setIsDragging(false);
  };

  // Multi-touch pinch-to-zoom trên mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      };
      touchStartDistRef.current = null;
    } else if (e.touches.length === 2 && wrapperRef.current) {
      setIsDragging(false);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoom;
      touchStartPanRef.current = pan;

      const rect = wrapperRef.current.getBoundingClientRect();
      touchStartMidRef.current = {
        x: (t1.clientX + t2.clientX) / 2 - rect.left,
        y: (t1.clientY + t2.clientY) / 2 - rect.top,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    } else if (
      e.touches.length === 2 &&
      touchStartDistRef.current &&
      touchStartMidRef.current
    ) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const scale = currentDist / touchStartDistRef.current;
      const initialZoom = touchStartZoomRef.current;
      const initialPan = touchStartPanRef.current;
      const mid = touchStartMidRef.current;

      const newZoom = Math.min(1.6, Math.max(0.35, initialZoom * scale));

      const worldX = (mid.x - initialPan.x) / initialZoom;
      const worldY = (mid.y - initialPan.y) / initialZoom;

      const newPanX = mid.x - worldX * newZoom;
      const newPanY = mid.y - worldY * newZoom;

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
    touchStartMidRef.current = null;
  };

  // Fly-to nhanh camera
  const flyTo = (targetX: number, targetY: number, targetZoom = 0.88) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const newPanX = rect.width / 2 - targetX * targetZoom;
    const newPanY = rect.height / 2 - targetY * targetZoom;
    setZoom(targetZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden font-sans">
      {/* ===== HEADER ĐIỀU KHIỂN & ĐỊNH VỊ NHANH ===== */}
      <header className="flex flex-wrap items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-2.5 backdrop-blur-md z-30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 shadow-lg shadow-purple-500/30 ring-2 ring-white/20">
            <span className="text-xl">🏙️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>Thành Phố KOCity</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-400/30">
                  Bản Đồ 2 Bờ & Cầu Độc Quyền v10.0
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 hidden sm:flex">
              <span>🏠 Bờ KOC (Tây)</span>
              <span>↔️</span>
              <span>🌊 Dòng Sông & 🌉 Cầu KOCity Độc Quyền</span>
              <span>↔️</span>
              <span>🏪 Bờ Brand (Đông)</span>
            </p>
          </div>
        </div>

        {/* Cụm Nút Di Chuyển Camera Nhanh */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <div className="hidden lg:flex items-center gap-1 bg-white/10 p-1 rounded-full ring-1 ring-white/15">
            <button
              type="button"
              onClick={() => flyTo(650, 450, 0.95)}
              className="rounded-full px-3 py-1 font-semibold text-slate-200 hover:bg-white/20 transition cursor-pointer"
            >
              🏠 Bờ KOC (Cư Xá)
            </button>
            <button
              type="button"
              onClick={() => flyTo(1400, 850, 1.05)}
              className="rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 px-3 py-1 font-black text-white shadow-lg transition hover:opacity-95 ring-1 ring-amber-300/60 cursor-pointer"
            >
              🌉 Cầu KOCity & Tòa Tháp
            </button>
            <button
              type="button"
              onClick={() => flyTo(1220, 960, 1.15)}
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 font-bold text-slate-950 shadow transition hover:opacity-95 cursor-pointer"
            >
              👮 Chú Bảo Vệ
            </button>
            <button
              type="button"
              onClick={() => flyTo(2150, 420, 0.95)}
              className="rounded-full px-3 py-1 font-black bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow transition hover:opacity-95 cursor-pointer ring-1 ring-white/30"
            >
              🏪 Bờ Brand (Store 3D)
            </button>
            <button
              type="button"
              onClick={() => flyTo(2150, 1250, 0.95)}
              className="rounded-full px-3 py-1 font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition cursor-pointer ring-1 ring-amber-400/40"
            >
              🚧 Đất Trống Đấu Thầu
            </button>
            <button
              type="button"
              onClick={() => flyTo(1400, 850, 0.38)}
              className="rounded-full px-3 py-1 font-bold text-slate-300 hover:bg-white/20 transition cursor-pointer"
            >
              🗺️ Toàn Cảnh 2 Bờ
            </button>
          </div>

          {/* Công tắc Ngày / Đêm */}
          <button
            type="button"
            onClick={() => setIsNight(!isNight)}
            title={isNight ? 'Chuyển sang Ban ngày rực rỡ' : 'Chuyển sang Ban đêm lung linh'}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ring-1',
              isNight
                ? 'bg-amber-400/20 text-amber-200 ring-amber-300/40 hover:bg-amber-400/30'
                : 'bg-white/15 text-white ring-white/20 hover:bg-white/25'
            )}
          >
            <Icon name={isNight ? 'light_mode' : 'dark_mode'} className="text-[14px]" />
            <span className="hidden sm:inline">{isNight ? '☀️ Ban Ngày' : '🌙 Ban Đêm'}</span>
          </button>

          {/* Cụm Zoom Button Trên Header */}
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15">
            <button
              type="button"
              onClick={() => zoomAtScreenCenter(0.85)}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 font-black cursor-pointer text-sm"
              title="Thu nhỏ"
            >
              -
            </button>
            <span className="w-11 text-center font-mono text-[11px] font-bold text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => zoomAtScreenCenter(1.18)}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 font-black cursor-pointer text-sm"
              title="Phóng to"
            >
              +
            </button>
          </div>

          {/* Nút Chế Độ Quy Hoạch Admin */}
          {isEffectiveAdmin && (
            <button
              type="button"
              onClick={() => {
                const nextState = !isBuilderMode;
                setIsBuilderMode(nextState);
                if (nextState) {
                  showToastNotice('🛠️ Chế độ Quy Hoạch bật: Kéo thả các Store / Toà tháp / Bốt gác / Đường xá thoải mái!');
                } else {
                  showToastNotice('Đã tắt chế độ Quy Hoạch.');
                }
              }}
              className={cx(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer ring-2 shadow-lg',
                isBuilderMode
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white ring-amber-300 animate-pulse'
                  : 'bg-emerald-600/90 text-white ring-emerald-400 hover:bg-emerald-500'
              )}
              title="Chế độ Quản trị viên: Kéo thả các vị trí, thêm Store, mở đường mới"
            >
              <Icon name="architecture" className="text-[14px]" />
              <span>{isBuilderMode ? '🛠️ ĐANG QUY HOẠCH' : '🛠️ QUY HOẠCH (ADMIN)'}</span>
            </button>
          )}

          {/* Nút Đóng */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-rose-600 text-white transition ring-1 ring-white/20 cursor-pointer"
            title="Đóng thành phố"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>
      </header>

      {/* ===== KHU VỰC THÀNH PHỐ CANVAS 2800x1700 (PAN & ZOOM CHUẨN GOOGLE MAPS) ===== */}
      <div
        ref={wrapperRef}
        className={cx(
          'relative flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none transition-colors duration-700',
          isNight ? 'bg-[#090b16]' : 'bg-[#e9f2ea]'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className={cx(
            'absolute inset-0 pointer-events-none transition-opacity duration-1000',
            isNight ? 'opacity-80 bg-radial from-violet-900/20 via-transparent to-black' : 'opacity-30 bg-radial from-amber-200/40 to-transparent'
          )}
        />

        {/* CONTAINER THÀNH PHỐ CHÍNH */}
        <div
          style={{
            width: `${MAP_W}px`,
            height: `${MAP_H}px`,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
          className="relative transition-transform duration-75 ease-out"
        >
          {/* ========================================================================= */}
          {/* 1. MẶT BẰNG 2 BỜ SÔNG & DÒNG SÔNG KOCITY NGĂN CÁCH TỰ PHÁT                */}
          {/* ========================================================================= */}
          <div
            className={cx(
              'absolute inset-0 rounded-3xl border-4 transition-colors duration-700 overflow-hidden',
              isNight ? 'bg-[#090e1a] border-slate-800' : 'bg-[#e2e8f0] border-slate-300'
            )}
          >
            {/* BỜ TÂY (BÊN TRÁI): VÙNG ĐẤT CƯ XÁ KOC & CREATOR (Nền cỏ xanh sinh thái) */}
            <div
              style={{ left: 80, top: 80, width: 1040, height: 1540 }}
              className={cx(
                'absolute rounded-3xl transition-colors duration-700 border-2 shadow-inner',
                isNight ? 'bg-[#142323] border-emerald-950/60' : 'bg-[#dcfce7] border-emerald-200'
              )}
            >
              {/* Huy hiệu Bờ Tây */}
              <div className="absolute top-4 left-6 z-10 flex items-center gap-2 bg-emerald-900/80 backdrop-blur-md border border-emerald-400/40 px-3.5 py-1.5 rounded-2xl text-emerald-200 text-xs font-black shadow-lg">
                <span>🏠</span>
                <span>BỜ TÂY: CƯ XÁ KOC & VÙNG ĐẤT SÁNG TẠO</span>
              </div>
            </div>

            {/* DÒNG SÔNG KOCITY NGĂN CÁCH (Ở GIỮA: RỘNG 560px, TỪ BẮC XUỐNG NAM) */}
            <div
              style={{ left: 1120, top: 0, width: 560, height: MAP_H }}
              className={cx(
                'absolute transition-colors duration-700 shadow-2xl overflow-hidden',
                isNight
                  ? 'bg-gradient-to-r from-[#082f49] via-[#075985] to-[#042f2e]'
                  : 'bg-gradient-to-r from-[#0284c7] via-[#06b6d4] to-[#0d9488]'
              )}
            >
              {/* Lớp sóng nước uốn lượn lăn tăn */}
              <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="waterWavesPattern" width="120" height="40" patternUnits="userSpaceOnUse">
                      <path
                        d="M 0 20 Q 30 5, 60 20 T 120 20"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.8"
                        strokeOpacity="0.4"
                      />
                      <path
                        d="M 0 35 Q 30 25, 60 35 T 120 35"
                        fill="none"
                        stroke="#7dd3fc"
                        strokeWidth="1.2"
                        strokeOpacity="0.3"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#waterWavesPattern)" />
                </svg>
              </div>

              {/* Bờ kè đá cát hai bên mép sông */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-amber-700/40 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-amber-700/40 to-transparent pointer-events-none" />

              {/* Thuyền buồm, ca nô và đàn cá trên sông */}
              <div style={{ left: 80, top: 180 }} className="absolute text-4xl animate-bounce select-none pointer-events-none">
                ⛵
              </div>
              <div style={{ left: 380, top: 320 }} className="absolute text-3xl select-none pointer-events-none">
                🚤
              </div>
              <div style={{ left: 160, top: 480 }} className="absolute text-2xl select-none pointer-events-none">
                🪷
              </div>
              <div style={{ left: 320, top: 580 }} className="absolute text-2xl select-none pointer-events-none">
                🐟
              </div>

              <div style={{ left: 100, top: 1100 }} className="absolute text-3xl select-none pointer-events-none">
                ⛵
              </div>
              <div style={{ left: 360, top: 1240 }} className="absolute text-4xl animate-bounce select-none pointer-events-none">
                🚤
              </div>
              <div style={{ left: 140, top: 1380 }} className="absolute text-2xl select-none pointer-events-none">
                🪷
              </div>
              <div style={{ left: 400, top: 1520 }} className="absolute text-2xl select-none pointer-events-none">
                🐟
              </div>

              {/* BIỂN Ý NGHĨA TRÊN DÒNG SÔNG: RÀO CẢN NẾU TỰ KẾT NỐI TỰ PHÁT */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
                <div className="bg-sky-950/90 backdrop-blur-md border-2 border-cyan-400 px-5 py-2 rounded-2xl text-cyan-200 text-xs font-black shadow-2xl flex items-center gap-2 ring-2 ring-cyan-400/30">
                  <span className="text-base">🌊</span>
                  <span>DÒNG SÔNG NGĂN CÁCH TỰ PHÁT</span>
                  <span className="text-base">🌊</span>
                </div>
                <div className="text-[10px] text-cyan-200 font-bold bg-slate-900/80 px-3 py-0.5 rounded-full mt-1 border border-cyan-300/30 text-center">
                  (Khoảng cách & rủi ro nếu KOC tự liên hệ đơn độc)
                </div>
              </div>

              <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
                <div className="bg-sky-950/90 backdrop-blur-md border-2 border-cyan-400 px-5 py-2 rounded-2xl text-cyan-200 text-xs font-black shadow-2xl flex items-center gap-2 ring-2 ring-cyan-400/30">
                  <span className="text-base">✨</span>
                  <span>DÒNG CHẢY KẾT NỐI GIÁ TRỊ CREATOR & BRAND</span>
                  <span className="text-base">✨</span>
                </div>
              </div>
            </div>

            {/* BỜ ĐÔNG (BÊN PHẢI): VÙNG ĐẤT ĐẠI LỘ THƯƠNG HIỆU BRAND */}
            {/* Ô TRÊN CÙNG BÊN PHẢI: KHU PHỐ THƯƠNG MẠI BRAND */}
            <div
              style={{ left: 1680, top: 80, width: 1040, height: 660 }}
              className={cx(
                'absolute rounded-3xl transition-colors duration-700 border-2 shadow-sm',
                isNight ? 'bg-[#1e1b4b] border-indigo-950/60' : 'bg-[#e0e7ff] border-indigo-200'
              )}
            >
              <div className="absolute top-4 left-6 z-10 flex items-center gap-2 bg-indigo-900/80 backdrop-blur-md border border-indigo-400/40 px-3.5 py-1.5 rounded-2xl text-indigo-200 text-xs font-black shadow-lg">
                <span>🏪</span>
                <span>BỜ ĐÔNG: ĐẠI LỘ CÁC THƯƠNG HIỆU & FLAGSHIP STORE</span>
              </div>
            </div>

            {/* Ô DƯỚI CÙNG BÊN PHẢI: KHU ĐẤT TRỐNG ĐANG ĐẤU THẦU */}
            <div
              style={{ left: 1680, top: 960, width: 1040, height: 660 }}
              className={cx(
                'absolute rounded-3xl transition-colors duration-700 border-3 border-dashed shadow-sm',
                isNight ? 'bg-[#1c1917] border-amber-500/40' : 'bg-[#fef3c7]/75 border-amber-400'
              )}
            />
          </div>

          {/* ========================================================================= */}
          {/* 2. HỆ THỐNG ĐẠI LỘ VÀ CÂY CẦU KOCITY ĐỘC QUYỀN BẮC NGANG DÒNG SÔNG        */}
          {/* ========================================================================= */}
          {/* ĐOẠN ĐƯỜNG BỜ TÂY (KOC REALM) */}
          <div
            style={{ left: 0, top: 760, width: 1120, height: 180 }}
            className={cx(
              'absolute transition-colors duration-700 shadow-xl flex flex-col justify-between',
              isNight ? 'bg-[#1e293b]' : 'bg-[#334155]'
            )}
          >
            <div className="h-6 w-full bg-[#cbd5e1] border-b-2 border-dashed border-slate-400 flex items-center justify-around px-8">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="h-3 w-1.5 bg-slate-400/50 rounded-xs" />
              ))}
            </div>
            <div className="h-5 w-full bg-emerald-800/90 border-y border-amber-300/40 flex items-center justify-around px-4">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="text-[10px] select-none">
                  {i % 2 === 0 ? '🌼' : '🌺'}
                </span>
              ))}
            </div>
            <div className="h-6 w-full bg-[#cbd5e1] border-t-2 border-dashed border-slate-400 flex items-center justify-around px-8">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="h-3 w-1.5 bg-slate-400/50 rounded-xs" />
              ))}
            </div>
          </div>

          {/* ĐOẠN ĐƯỜNG BỜ ĐÔNG (BRAND REALM) */}
          <div
            style={{ left: 1680, top: 760, width: 1120, height: 180 }}
            className={cx(
              'absolute transition-colors duration-700 shadow-xl flex flex-col justify-between',
              isNight ? 'bg-[#1e293b]' : 'bg-[#334155]'
            )}
          >
            <div className="h-6 w-full bg-[#cbd5e1] border-b-2 border-dashed border-slate-400 flex items-center justify-around px-8">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="h-3 w-1.5 bg-slate-400/50 rounded-xs" />
              ))}
            </div>
            <div className="h-5 w-full bg-indigo-900/90 border-y border-amber-300/40 flex items-center justify-around px-4">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="text-[10px] select-none">
                  {i % 2 === 0 ? '✨' : '💎'}
                </span>
              ))}
            </div>
            <div className="h-6 w-full bg-[#cbd5e1] border-t-2 border-dashed border-slate-400 flex items-center justify-around px-8">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="h-3 w-1.5 bg-slate-400/50 rounded-xs" />
              ))}
            </div>
          </div>

          {/* CÁC TUYẾN ĐƯỜNG MỞ RỘNG DO ADMIN QUY HOẠCH */}
          {extraRoads.map((road) => (
            <div
              key={road.id}
              style={{
                left: road.x,
                top: road.y,
                width: road.width,
                height: road.height,
              }}
              className={cx(
                'absolute z-5 shadow-lg select-none flex items-center justify-center transition-colors',
                road.type === 'bridge'
                  ? 'bg-slate-900 border-2 border-amber-400'
                  : road.type === 'paved'
                  ? 'bg-amber-900/80 border-2 border-amber-600'
                  : isNight
                  ? 'bg-[#1e293b] border border-slate-700'
                  : 'bg-[#334155] border border-slate-600',
                isBuilderMode && 'ring-2 ring-emerald-400/80 cursor-move'
              )}
              onMouseDown={(e) => {
                if (isBuilderMode) {
                  startDrag(e, 'road', road.id, road.x, road.y);
                }
              }}
            >
              {road.orientation === 'horizontal' ? (
                <div className="w-full flex items-center justify-around px-4">
                  {Array.from({ length: Math.max(2, Math.floor(road.width / 80)) }).map((_, i) => (
                    <div key={i} className="w-8 h-2 bg-amber-300/80 rounded-full" />
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-around py-4">
                  {Array.from({ length: Math.max(2, Math.floor(road.height / 80)) }).map((_, i) => (
                    <div key={i} className="h-8 w-2 bg-amber-300/80 rounded-full" />
                  ))}
                </div>
              )}

              {/* Nhãn tên đường & nút xoá của admin */}
              <div className="absolute top-1 left-2 flex items-center gap-1.5 bg-black/80 px-2 py-0.5 rounded-full text-[10px] text-white pointer-events-auto">
                <span>🛣️ {road.name}</span>
                {isBuilderMode && (
                  <>
                    <span className="text-amber-300 font-mono">({road.x}, {road.y})</span>
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleDeleteRoad(road.id);
                      }}
                      className="text-rose-400 hover:text-rose-300 font-bold ml-1 cursor-pointer"
                      title="Xóa đường"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* CÂY CẦU KOCITY ĐỘC QUYỀN (BẮC NGANG SÔNG TỪ BỜ TÂY SANG BỜ ĐÔNG) */}
          <div
            style={{ left: 1080, top: 730, width: 640, height: 240 }}
            className="absolute z-10 drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]"
          >
            {/* Trụ cầu bê tông kiên cố cắm dưới lòng sông */}
            <div style={{ left: 60, top: 190 }} className="absolute w-14 h-16 bg-slate-700 rounded-b-xl border-x-2 border-slate-800 shadow-2xl" />
            <div style={{ left: 280, top: 190 }} className="absolute w-20 h-16 bg-slate-800 rounded-b-xl border-x-2 border-slate-900 shadow-2xl ring-2 ring-amber-400/50" />
            <div style={{ left: 510, top: 190 }} className="absolute w-14 h-16 bg-slate-700 rounded-b-xl border-x-2 border-slate-800 shadow-2xl" />

            {/* Mặt cầu chính dát đá cẩm thạch sang trọng */}
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-4 border-amber-400/80 shadow-2xl flex flex-col justify-between overflow-hidden">
              {/* Lan can cầu phía trên (có đèn lồng hoàng gia) */}
              <div className="h-7 w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 border-b-2 border-amber-300 flex items-center justify-around px-4 shadow-md">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="text-xs select-none">🏮</span>
                    <span className="h-3 w-1 bg-amber-950/60 rounded-xs" />
                  </div>
                ))}
              </div>

              {/* Làn đường xe & Dải phân cách mạ vàng sang trọng */}
              <div className="flex-1 flex flex-col justify-center items-center relative">
                {/* Vạch sơn kẻ đường cầu màu vàng phát sáng */}
                <div className="w-full flex items-center justify-around px-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-12 h-2.5 bg-amber-300 rounded-full shadow-lg shadow-amber-300/50" />
                  ))}
                </div>

                {/* Biển vòm tên cầu uốn lượn chính giữa */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-950/90 border-2 border-amber-300 px-6 py-1 rounded-full text-white font-black text-[11px] shadow-2xl tracking-wider flex items-center gap-2 ring-2 ring-amber-400/40">
                  <span>🌉</span>
                  <span className="text-amber-300 font-black">CẦU KOCITY ĐỘC QUYỀN</span>
                  <span className="bg-gradient-to-r from-pink-500 to-violet-600 text-[9px] px-2 py-0.5 rounded-full font-bold">
                    HOA HỒNG CAO NHẤT
                  </span>
                  <span>🌉</span>
                </div>
              </div>

              {/* Lan can cầu phía dưới */}
              <div className="h-7 w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 border-t-2 border-amber-300 flex items-center justify-around px-4 shadow-md">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="text-xs select-none">🏮</span>
                    <span className="h-3 w-1 bg-amber-950/60 rounded-xs" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT ĐÈN GIAO THÔNG Ở ĐẦU CẦU PHÍA TÂY */}
          <div
            style={{ left: 1140, top: 700 }}
            className="absolute z-20 flex flex-col items-center drop-shadow-2xl"
          >
            <div className="bg-slate-900 border-2 border-amber-400/70 rounded-2xl p-2 flex flex-col items-center gap-1.5 shadow-2xl ring-2 ring-black">
              <div className="text-[9px] font-black tracking-widest text-amber-300">LÊN CẦU</div>
              <div
                className={cx(
                  'h-5 w-5 rounded-full border-2 transition-all duration-300',
                  trafficLight === 'red'
                    ? 'bg-rose-500 border-white shadow-lg shadow-rose-500/80 animate-pulse'
                    : 'bg-rose-950/60 border-rose-900'
                )}
              />
              <div
                className={cx(
                  'h-5 w-5 rounded-full border-2 transition-all duration-300',
                  trafficLight === 'yellow'
                    ? 'bg-amber-400 border-white shadow-lg shadow-amber-400/80 animate-pulse'
                    : 'bg-amber-950/60 border-amber-900'
                )}
              />
              <div
                className={cx(
                  'h-5 w-5 rounded-full border-2 transition-all duration-300',
                  trafficLight === 'green'
                    ? 'bg-emerald-500 border-white shadow-lg shadow-emerald-500/80 animate-pulse'
                    : 'bg-emerald-950/60 border-emerald-900'
                )}
              />
              <div className="bg-black/90 px-1.5 py-0.5 rounded text-[11px] font-mono font-black text-amber-300">
                0{trafficTimer}s
              </div>
            </div>
            <div className="w-2.5 h-12 bg-slate-600 border-x border-slate-700 shadow-md" />
            <div className="w-6 h-2 bg-slate-700 rounded-full" />
          </div>

          {/* ========================================================================= */}
          {/* 3. TÒA THÁP KOCITY HQ TOẠ LẠC NGAY TRUNG TÂM CÂY CẦU & BỐT BẢO VỆ          */}
          {/* ========================================================================= */}
          {/* TÒA NHÀ TRỤ SỞ KOCITY HQ (TÒA NHÀ 3D ISOMETRIC CLAY THEO ẢNH MẪU) */}
          <div
            style={{ left: landmarkPos.x, top: landmarkPos.y, width: 340, height: 350 }}
            className={cx(
              'absolute z-25 flex flex-col items-center group select-none',
              isBuilderMode
                ? 'cursor-move ring-2 ring-amber-400/80 rounded-3xl bg-amber-500/10 p-1'
                : 'cursor-pointer clickable-element'
            )}
            onMouseDown={(e) => {
              if (isBuilderMode) {
                startDrag(e, 'landmark', 'kocity-landmark', landmarkPos.x, landmarkPos.y);
              }
            }}
            onClick={() => {
              if (!isBuilderMode) setShowHqModal(true);
            }}
          >
            {/* Builder indicator */}
            {isBuilderMode && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-amber-300 font-bold shadow-xl whitespace-nowrap z-30">
                ✥ Trụ Sở ({landmarkPos.x}, {landmarkPos.y})
              </div>
            )}

            {/* Huy hiệu đỉnh tháp hào quang */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 px-4 py-1.5 rounded-full text-white text-xs font-black shadow-2xl ring-4 ring-amber-300 whitespace-nowrap flex items-center gap-1.5 border border-white animate-bounce z-20 mb-[-14px]">
              <span>👑</span>
              <span>TRỤ SỞ KOCITY · CHIẾC CẦU ĐỘC QUYỀN</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black">
                HOA HỒNG CAO HƠN ✨
              </span>
            </div>

            {/* Khối tòa nhà 3D Isometric Clay theo đúng ảnh mẫu */}
            <div className="relative w-full h-[290px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 active:scale-95">
              {/* Vòng hào quang phát sáng nhẹ phía sau tòa nhà */}
              <div className="absolute inset-4 bg-gradient-to-tr from-amber-400/25 via-purple-500/20 to-sky-400/25 rounded-full blur-2xl pointer-events-none group-hover:opacity-100 opacity-60 transition-opacity" />

              {/* Ảnh 3D Tòa nhà Clay Isometric đã xử lý trong suốt chuẩn đẹp */}
              <img
                src="/assets/kocity_landmark_tower_3d.png"
                alt="Trụ Sở KOCity Landmark 3D"
                className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.65)] select-none pointer-events-none"
              />

              {/* Tag nổi bật dưới chân tòa nhà */}
              <div className="absolute bottom-2 bg-slate-950/90 border-2 border-amber-400 px-4 py-1 rounded-full text-amber-300 font-black text-[11px] shadow-2xl tracking-wide flex items-center gap-1.5 ring-2 ring-black">
                <span>🚀</span>
                <span>BẤM VÀO XEM ĐẶC QUYỀN HOA HỒNG</span>
                <span>✨</span>
              </div>
            </div>
          </div>

          {/* BỐT GÁC AN NINH & CHÚ BẢO VỆ TẠI CỔNG LÊN CẦU */}
          <div
            style={{ left: guardPos.x, top: guardPos.y }}
            className={cx(
              'absolute z-25 group select-none',
              isBuilderMode
                ? 'cursor-move ring-2 ring-amber-400/80 rounded-2xl bg-amber-500/10 p-1'
                : 'cursor-pointer clickable-element'
            )}
            onMouseDown={(e) => {
              if (isBuilderMode) {
                startDrag(e, 'guard', 'guard-booth', guardPos.x, guardPos.y);
              }
            }}
            onClick={() => {
              if (!isBuilderMode) setShowGuardModal(true);
            }}
          >
            {isBuilderMode && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-amber-400 px-2 py-0.5 rounded-full text-[10px] font-mono text-amber-300 font-bold shadow-xl whitespace-nowrap z-30">
                ✥ Bốt Gác ({guardPos.x}, {guardPos.y})
              </div>
            )}
            <div className="flex flex-col items-center">
              <div className="bg-amber-300 text-slate-950 px-3 py-1 rounded-2xl text-[11px] font-black shadow-2xl ring-2 ring-white whitespace-nowrap mb-1 animate-bounce">
                👮 "Chào cháu! Qua Cầu KOCity sang Brand hái job hoa hồng cao nhé!"
              </div>

              <div className="relative flex items-center gap-2.5 bg-slate-900/95 border-2 border-amber-400 px-3.5 py-2.5 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform ring-2 ring-black">
                <div className="flex flex-col items-center">
                  <div className="h-11 w-11 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-2xl shadow-lg">
                    👮
                  </div>
                  <div className="text-[9px] font-bold text-amber-300 mt-0.5">BẢO VỆ</div>
                </div>

                <div className="flex flex-col text-left">
                  <div className="text-[11px] font-black text-white">BỐT CỬA CẦU KOCITY</div>
                  <div className="text-[9px] text-slate-300">Hướng dẫn & Bàn giao xe</div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="h-2 w-12 bg-repeating-linear-gradient from-red-500 to-white rounded-full border border-white" />
                    <span className="text-[8px] text-emerald-400 font-bold">MỞ CỔNG QUA SÔNG</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. PHÂN KHU TÂY: KHU ĐÔ THỊ CƯ XÁ KOC                                     */}
          {/* ========================================================================= */}
          <div
            style={{ left: 450, top: 120 }}
            className="absolute z-10 flex flex-col items-center cursor-pointer clickable-element"
            onClick={() => flyTo(650, 450, 1.0)}
          >
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-2 rounded-2xl text-white font-black text-sm shadow-2xl ring-2 ring-white flex items-center gap-2 border border-white/40">
              <span>🏠</span>
              <span>CƯ XÁ KOCITY · NƠI Ở CỦA CÁC CREATOR</span>
              <span>🌳</span>
            </div>
            <div className="text-[11px] text-slate-300 bg-slate-900/80 px-3 py-0.5 rounded-full mt-1 border border-white/20">
              Dãy nhà phố liền kề, ban công ngập hoa & quán cafe cóc vỉa hè
            </div>
          </div>

          {/* DÃY NHÀ PHỐ CƯ DÂN LIỀN KỀ */}
          <div style={{ left: 120, top: 220 }} className="absolute z-10 flex items-end gap-5">
            <div className="w-48 h-56 bg-gradient-to-b from-rose-100 to-rose-200 border-2 border-rose-300 rounded-3xl p-3 shadow-xl relative flex flex-col justify-between">
              <div className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full self-start">
                #0089 · Thu Trang
              </div>
              <div className="text-3xl text-center">🏡</div>
              <div className="bg-white/80 border border-rose-300 rounded-xl p-1.5 text-center text-[10px] font-bold text-rose-700">
                🌸 Ban công hoa hồng
              </div>
            </div>

            <div className="w-52 h-64 bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-300 rounded-3xl p-3 shadow-xl relative flex flex-col justify-between">
              <div className="bg-amber-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full self-start">
                #0042 · Tuấn Anh (Tech)
              </div>
              <div className="text-3xl text-center">🏢</div>
              <div className="bg-white/80 border border-amber-300 rounded-xl p-1.5 text-center text-[10px] font-bold text-amber-800">
                🖥️ Studio dựng video 4K
              </div>
            </div>

            <div className="w-56 h-72 bg-gradient-to-b from-violet-100 via-pink-100 to-amber-100 border-3 border-amber-400 rounded-3xl p-3.5 shadow-2xl relative flex flex-col justify-between ring-4 ring-amber-300/50 animate-pulse">
              <div className="bg-gradient-to-r from-pink-500 to-violet-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full self-start shadow flex items-center gap-1">
                <span>👑</span>
                <span>NHÀ CỦA BẠN</span>
              </div>
              <div className="text-center">
                <div className="text-4xl">🏰</div>
                <div className="text-xs font-black text-slate-800 mt-1">
                  {currentUser?.name || 'KOC Thành Viên'}
                </div>
                <div className="text-[10px] text-pink-600 font-bold">
                  {userVehicle === 'motorbike'
                    ? 'Đã có Xe Máy 🛵'
                    : userVehicle === 'bicycle'
                    ? 'Đã có Xe Đạp 🚲'
                    : 'Đang đi bộ 🚶'}
                </div>
              </div>
              <div className="bg-white/90 border border-violet-300 rounded-xl p-2 text-center text-[10px] font-bold text-violet-800 shadow">
                🎁 {userJobsCount} Job đã hoàn thành
              </div>
            </div>

            <div className="w-48 h-56 bg-gradient-to-b from-emerald-100 to-emerald-200 border-2 border-emerald-300 rounded-3xl p-3 shadow-xl relative flex flex-col justify-between">
              <div className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full self-start">
                #0156 · Linh Chi
              </div>
              <div className="text-3xl text-center">🏡</div>
              <div className="bg-white/80 border border-emerald-300 rounded-xl p-1.5 text-center text-[10px] font-bold text-emerald-800">
                🌿 Giàn hoa giấy ban công
              </div>
            </div>
          </div>

          {/* QUÁN CAFE CÓC VỈA HÈ & CÔNG VIÊN CƯ XÁ */}
          <div style={{ left: 140, top: 1040 }} className="absolute z-10 flex items-center gap-8">
            <div className="bg-amber-900/90 border-2 border-amber-300 rounded-3xl p-4 text-white shadow-2xl flex items-center gap-4">
              <div className="text-4xl">☕</div>
              <div>
                <div className="text-xs font-black text-amber-300">QUÁN CAFE CÓC KOCITY</div>
                <div className="text-[10px] text-slate-200">Điểm tụ tập review kịch bản & uống cafe muối</div>
                <div className="flex items-center gap-2 mt-1 text-[11px]">
                  <span>🪑 Bàn ghế con</span>
                  <span>⛱️ Dù che nắng</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-emerald-950/80 border border-emerald-400/40 p-4 rounded-3xl text-white">
              <span className="text-3xl">🌳</span>
              <div>
                <div className="text-xs font-black text-emerald-300">CÔNG VIÊN CÂY XANH CƯ XÁ</div>
                <div className="text-[10px] text-slate-300">Ghế đá nghỉ chân, hít thở không khí trong lành</div>
              </div>
              <span className="text-3xl">🌺</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. Ô TRÊN CÙNG BÊN PHẢI: QUY TỤ TOÀN BỘ CÁC BRAND (STORE 3D CLAY)         */}
          {/* ========================================================================= */}
          {/* Khung nền & Biển hiệu Phố Thương Mại Brand */}
          <div
            style={{ left: 1720, top: 110, width: 960, height: 260 }}
            className="absolute z-10 flex flex-col justify-between p-4 bg-white/5 backdrop-blur-xs rounded-3xl border border-white/10 shadow-xl pointer-events-none"
          >
            {/* Biển hiệu phân khu */}
            <div className="flex items-center justify-between pointer-events-auto">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-5 py-2 rounded-2xl text-white font-black text-xs shadow-xl ring-2 ring-white/50 border border-white/30">
                <span className="text-base">🏪</span>
                <span>PHỐ CÁC CỬA HÀNG BRAND (STORE 3D)</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black">
                  {stores.length} THƯƠNG HIỆU
                </span>
              </div>
              <div className="text-[11px] text-amber-300 bg-slate-900/90 px-3 py-1 rounded-full border border-white/20 font-bold hidden sm:inline-block">
                💡 Bấm Store mở Thông Báo Job & Đăng ký nhận mẫu 0đ!
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-400 font-mono pointer-events-none">
              KOCity Brand Boulevard · Eastern Realm
            </div>
          </div>

          {/* DÃY CÁC STORE ĐƯỢC RENDER ĐỘNG THEO TỌA ĐỘ VÀ KÉO THẢ (BUILDER MODE) */}
          {stores.map((store) => (
            <div
              key={store.id}
              style={{ left: store.x, top: store.y }}
              className={cx(
                'absolute z-20 select-none transition-transform duration-100',
                isBuilderMode ? 'cursor-move ring-2 ring-amber-400 rounded-3xl bg-amber-500/10 p-1 shadow-2xl' : ''
              )}
              onMouseDown={(e) => {
                if (isBuilderMode) {
                  startDrag(e, 'store', store.id, store.x, store.y);
                }
              }}
            >
              {/* Overlay điều khiển của Admin Builder */}
              {isBuilderMode && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/95 border border-amber-400 px-2 py-0.5 rounded-full shadow-2xl z-30 whitespace-nowrap text-[10px]">
                  <span className="text-amber-300 font-mono font-bold">✥ ({store.x}, {store.y})</span>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setEditingStore(store);
                    }}
                    className="text-blue-400 hover:text-blue-300 px-1 py-0.5 rounded cursor-pointer font-bold"
                    title="Sửa thông tin Store"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDeleteStore(store.id);
                    }}
                    className="text-rose-400 hover:text-rose-300 px-1 py-0.5 rounded cursor-pointer font-bold"
                    title="Xoá Store"
                  >
                    🗑️
                  </button>
                </div>
              )}

              {store.id === 'store-ootd' ? (
                <div
                  onClick={() => {
                    if (!isBuilderMode) setSelectedBrand(store);
                  }}
                  className="w-28 h-28 bg-slate-900/90 border-2 border-slate-700 rounded-2xl p-2.5 flex flex-col justify-between text-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
                >
                  <div className="text-2xl">📸</div>
                  <div>
                    <div className="text-[11px] font-black text-slate-200">{store.brandName}</div>
                    <div className="text-[8px] text-slate-400">{store.category}</div>
                  </div>
                  <div className="text-[8px] text-amber-400 font-bold">Free cho KOC</div>
                </div>
              ) : (
                <Clay3DStore
                  brandName={store.brandName}
                  hasJobAlert={store.hasJobAlert}
                  onClick={() => {
                    if (!isBuilderMode) setSelectedBrand(store);
                  }}
                />
              )}
            </div>
          ))}

          {/* ========================================================================= */}
          {/* 6. Ô DƯỚI CÙNG BÊN PHẢI: KHU ĐẤT TRỐNG ĐANG ĐẤU THẦU                      */}
          {/* ========================================================================= */}
          <div
            style={{ left: biddingLot.x, top: biddingLot.y, width: biddingLot.width, height: biddingLot.height }}
            className={cx(
              'absolute z-10 flex flex-col justify-between p-6 select-none group',
              isBuilderMode ? 'cursor-move ring-2 ring-amber-400/80 rounded-3xl bg-amber-500/10' : 'cursor-pointer clickable-element'
            )}
            onMouseDown={(e) => {
              if (isBuilderMode) {
                startDrag(e, 'bidding', 'bidding-lot', biddingLot.x, biddingLot.y);
              }
            }}
            onClick={() => {
              if (!isBuilderMode) setShowBiddingModal(true);
            }}
          >
            {/* Builder indicator */}
            {isBuilderMode && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-amber-400 px-3 py-0.5 rounded-full text-[10px] font-mono text-amber-300 font-bold shadow-xl whitespace-nowrap z-30 flex items-center gap-2">
                <span>✥ Khu Đất ({biddingLot.x}, {biddingLot.y})</span>
                <button
                  type="button"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setIsAddingStore(true);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 cursor-pointer"
                  title="Duyệt mở Store tại khu đất này"
                >
                  ➕ Cấp đất mở Store
                </button>
              </div>
            )}

            {/* Tiêu đề & Rào chắn công trình */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-5 py-2 rounded-2xl text-white font-black text-xs shadow-2xl ring-2 ring-white border border-white/40 animate-pulse">
                <span className="text-lg">🚧</span>
                <span className="text-sm tracking-wide">KHU ĐẤT TRỐNG ĐANG ĐẤU THẦU</span>
                <span className="bg-white text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black">
                  MẶT BẰNG VÀNG
                </span>
              </div>
              <div className="flex items-center gap-2 text-xl select-none">
                <span>🚧</span>
                <span>⚠️</span>
                <span>🚧</span>
              </div>
            </div>

            {/* BẢNG QUY HOẠCH ĐẤU THẦU CHÍNH Ở GIỮA KHU ĐẤT */}
            <div className="bg-slate-900/90 border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md max-w-xl mx-auto text-center group-hover:scale-105 transition-transform ring-4 ring-amber-400/20">
              <div className="text-3xl mb-1">🏗️ 🚜 📐</div>
              <h3 className="text-base font-black text-amber-300 uppercase tracking-wider">
                DỰ ÁN MỞ RỘNG ĐÔ THỊ KOCITY MEGACITY
              </h3>
              <p className="text-xs text-slate-200 mt-2 font-medium leading-relaxed">
                Khu đất vàng quy hoạch dành cho các <strong>Brand Thời Trang, Mỹ Phẩm, FMCG, Điện Máy & F&B</strong> mới gia nhập thành phố.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px]">
                <span className="bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/40 font-bold">
                  📍 Diện tích: 10.000 m²
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/40 font-bold">
                  📋 Nhận hồ sơ mời thầu
                </span>
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/40 font-bold">
                  🚀 Sẵn sàng mở Store mới
                </span>
              </div>
              <div className="mt-3 text-[10px] text-slate-400 italic">
                (Bấm vào để xem thông tin dự án mở rộng mặt bằng KOCity)
              </div>
            </div>

            {/* Dưới cùng: Cọc mốc giới & Cờ đỏ quy hoạch */}
            <div className="flex items-center justify-between text-sm select-none border-t border-amber-400/30 pt-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <span>🚩 Lô Đất A1</span>
                <span>•</span>
                <span>🚩 Lô Đất A2</span>
                <span>•</span>
                <span>🚩 Lô Đất B1</span>
                <span>•</span>
                <span>🚩 Lô Đất B2</span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                KOCity Land Auction Phase 2
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 7. HỆ THỐNG CÂY XANH & CỘT ĐÈN ĐƯỜNG                                      */}
          {/* ========================================================================= */}
          <div className="absolute inset-0 pointer-events-none">
            {[200, 450, 750, 1050, 1550, 1850, 2150, 2450].map((treeX) => (
              <React.Fragment key={treeX}>
                <div
                  style={{ left: treeX, top: 710 }}
                  className="absolute text-3xl filter drop-shadow-lg"
                >
                  🌳
                </div>
                <div
                  style={{ left: treeX + 60, top: 940 }}
                  className="absolute text-3xl filter drop-shadow-lg"
                >
                  🌺
                </div>
              </React.Fragment>
            ))}

            {[350, 800, 1150, 1600, 2050, 2500].map((lampX) => (
              <div key={lampX} style={{ left: lampX, top: 720 }} className="absolute">
                <div className="text-2xl">🏮</div>
                {isNight && (
                  <div className="w-20 h-28 bg-amber-300/15 rounded-full blur-md -ml-8 -mt-2 pointer-events-none" />
                )}
              </div>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* 8. CƯ DÂN KOC DI CHUYỂN TUẦN HOÀN                                         */}
          {/* ========================================================================= */}
          {citizens.map((c) => (
            <div
              key={c.id}
              style={{
                left: c.x,
                top: c.y,
                transform: 'translate(-50%, -100%)',
                zIndex: c.isCurrentUser ? 35 : 25,
              }}
              className="absolute cursor-pointer group clickable-element transition-all duration-75"
              onClick={() => setSelectedCitizen(c)}
            >
              {c.bubble && (
                <div className="bg-white text-slate-900 px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-2xl ring-2 ring-pink-500 max-w-[170px] text-center mb-1 leading-snug whitespace-normal animate-bounce">
                  {c.bubble}
                </div>
              )}

              <div
                className={cx(
                  'px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xl whitespace-nowrap flex items-center gap-1 border',
                  c.isCurrentUser
                    ? 'bg-amber-400 text-slate-950 border-white ring-2 ring-amber-300 animate-pulse'
                    : 'bg-slate-900/95 text-white border-white/20'
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{c.name}</span>
                <span className="text-pink-400 font-extrabold">{c.number}</span>
                <span>
                  {c.vehicle === 'motorbike' ? '🛵' : c.vehicle === 'bicycle' ? '🚲' : '🚶'}
                </span>
              </div>

              <div className="mt-0.5 flex flex-col items-center">
                <div
                  style={{ backgroundColor: c.avatarColor }}
                  className="h-8 w-8 rounded-full text-white text-[14px] flex items-center justify-center font-bold shadow-xl ring-2 ring-white"
                >
                  {c.isCurrentUser ? '👑' : '🌸'}
                </div>
                <div
                  className={cx(
                    'text-[20px] -mt-1.5 filter drop-shadow-md transition-transform',
                    c.direction === 'left' ? 'scale-x-[-1]' : 'scale-x-1'
                  )}
                >
                  {c.vehicle === 'motorbike' ? '🛵' : c.vehicle === 'bicycle' ? '🚲' : '👟'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BẢNG CHÚ THÍCH HỆ THỐNG GIAO THÔNG Ở GÓC TRÊN BẢN ĐỒ */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:flex flex-col gap-1.5">
          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl ring-1 ring-white/15 text-xs text-slate-200 shadow-2xl max-w-sm">
            <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
              <span>🌉</span>
              <span>BẢN ĐỒ KOCITY: KẾT NỐI 2 BỜ SÔNG</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              • 🏠 <strong>Bờ Tây (Trái):</strong> Cư Xá KOC (Nơi ở, studio, cafe cóc)<br />
              • 🌊 <strong>Dòng Sông Ngăn Cách:</strong> Tượng trưng khó khăn nếu kết nối tự phát<br />
              • 🌉 <strong>Cầu KOCity & Tòa Tháp:</strong> Chiếc cầu độc quyền giúp KOC nhận hoa hồng cao hơn hẳn & an toàn 100%<br />
              • 🏪 <strong>Bờ Đông (Phải):</strong> Đại Lộ các Store Brand 3D & Khu đất đấu thầu
            </div>
          </div>
        </div>

        {/* CỤM ĐIỀU KHIỂN NỔI GÓC DƯỚI BÊN PHẢI (CHUẨN GOOGLE MAPS CONTROLS) */}
        <div className="absolute bottom-6 right-6 z-30 flex flex-col items-end gap-2.5">
          <div className="flex flex-col rounded-2xl bg-slate-900/95 border border-white/20 p-1 shadow-2xl backdrop-blur-md ring-2 ring-black/40">
            <button
              type="button"
              onClick={() => zoomAtScreenCenter(1.22)}
              title="Phóng to (Zoom In)"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/15 active:scale-95 transition cursor-pointer font-black text-lg border-b border-white/10"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => zoomAtScreenCenter(0.82)}
              title="Thu nhỏ (Zoom Out)"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/15 active:scale-95 transition cursor-pointer font-black text-lg border-b border-white/10"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => flyTo(1400, 950, 1.0)}
              title="Về Trọng Tâm KOCity HQ & Chú Bảo Vệ"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-amber-300 hover:bg-white/15 active:scale-95 transition cursor-pointer text-base"
            >
              🎯
            </button>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-white/15 px-2.5 py-1 text-[10px] text-slate-300 font-mono shadow-xl backdrop-blur-sm">
            <span className="font-bold text-amber-300">{Math.round(zoom * 100)}%</span>
            <span>•</span>
            <div className="flex flex-col items-center">
              <div className="w-12 h-1 border-b-2 border-x-2 border-white/80" />
              <span className="text-[9px] text-slate-400">100m</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 9. CÁC MODAL CHI TIẾT TƯƠNG TÁC (CHÚ BẢO VỆ / TRỤ SỞ / BRAND / CƯ DÂN / ĐẤU THẦU) */}
      {/* ========================================================================= */}

      {/* MODAL 1: CHÚ BẢO VỆ KOCITY THÂN THIỆN */}
      {showGuardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-400 p-6 text-white shadow-2xl ring-4 ring-amber-400/20">
            <button
              type="button"
              onClick={() => setShowGuardModal(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 border-2 border-white text-3xl shadow-lg">
                👮
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">Chú Bảo Vệ KOCity</h3>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    TRỰC CỔNG 24/7
                  </span>
                </div>
                <p className="text-xs text-amber-300">Bốt An Ninh & Trạm Bàn Giao Phương Tiện</p>
              </div>
            </div>

            <div className="bg-slate-800/90 rounded-2xl p-4 border border-white/10 text-xs text-slate-200 leading-relaxed mb-4">
              <p className="italic text-amber-200">
                "Chào cháu! Chú trực ở ngã tư này ngày đêm để phân luồng xe và giữ an ninh cho cả Cư Xá lẫn Phố Brand.
                Cháu cứ yên tâm sáng tạo, làm được 1 job là ghé chú ký nhận <strong>Xe Đạp 🚲</strong>, làm được 3 job là chú trao ngay chìa khóa <strong>Xe Máy 🛵</strong> để lượn phố nhé! Qua ngã tư nhớ chú ý đèn đỏ đấy!"
              </p>
            </div>

            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between text-xs bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-slate-300">Tiến độ của cháu:</span>
                <span className="font-bold text-amber-400">
                  {userJobsCount} Job hoàn thành
                </span>
              </div>
              <div className="flex items-center justify-between text-xs bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-slate-300">Phương tiện hiện tại:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  {userVehicle === 'motorbike'
                    ? '🛵 Xe Máy KOCity'
                    : userVehicle === 'bicycle'
                    ? '🚲 Xe Đạp KOCity'
                    : '🚶 Đi Bộ (Chưa nhận xe)'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                block
                onClick={() => {
                  setShowGuardModal(false);
                  setShowHqModal(true);
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black hover:opacity-95"
              >
                Ghé Trụ Sở Đổi Xe Ngay 🚲 🛵
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TRỤ SỞ KOCITY HQ & CHIẾC CẦU ĐỘC QUYỀN NÂNG TẦM CREATOR */}
      {showHqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border-2 border-amber-400 p-6 text-white shadow-2xl ring-4 ring-purple-500/30 my-8">
            <button
              type="button"
              onClick={() => setShowHqModal(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
            >
              ✕
            </button>

            {/* Header Modal */}
            <div className="flex items-center gap-3.5 mb-4 border-b border-white/10 pb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 border-2 border-amber-400 p-1 shadow-xl ring-2 ring-amber-300/40">
                <img
                  src="/assets/kocity_landmark_tower_3d.png"
                  alt="Trụ Sở KOCity 3D"
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    ĐẶC QUYỀN KOCITY
                  </span>
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    BẢO CHỨNG 100%
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">
                  KOCity – Chiếc Cầu Độc Quyền Nâng Tầm Creator
                </h3>
                <p className="text-xs text-purple-300">
                  Tòa Tháp Trung Tâm Kết Nối Bờ KOC & Bờ Brand
                </p>
              </div>
            </div>

            {/* Khung Thông Điệp Cốt Lõi (Ý nghĩa Dòng Sông & Cây Cầu KOCity) */}
            <div className="bg-gradient-to-br from-indigo-950/80 via-purple-950/70 to-slate-900 border-2 border-indigo-400/40 rounded-2xl p-4 text-xs text-slate-200 leading-relaxed mb-4 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                <span>🌉</span>
                <span>VÌ SAO THAM GIA QUA KOCITY LẠI NHẬN HOA HỒNG CAO HƠN?</span>
              </div>
              <p className="text-slate-200 italic font-medium">
                "KOC ở một bờ, Brand ở một bờ. Dòng sông ngăn cách tượng trưng cho những rào cản, khó khăn và rủi ro nếu bạn kết nối tự phát.
              </p>
              <p className="text-amber-200 font-semibold">
                Nhưng <strong className="text-white underline decoration-amber-400">KOCity chính là chiếc cầu độc quyền</strong> giúp KOC bước sang hái job với mức hoa hồng cao hơn hẳn và được bảo hộ quyền lợi 100%!"
              </p>
            </div>

            {/* 3 Trụ Cột Giá Trị Vàng Của KOCity */}
            <div className="space-y-2.5 mb-5 text-xs">
              {/* Lợi ích 1: Hoa hồng cao hơn hẳn */}
              <div className="bg-gradient-to-r from-amber-950/50 to-slate-900 border border-amber-400/40 rounded-2xl p-3 flex items-start gap-3">
                <div className="text-2xl mt-0.5">🚀</div>
                <div>
                  <div className="font-black text-amber-300 text-xs">
                    Mức Hoa Hồng Cao Hơn Hẳn (Commission Độc Quyền)
                  </div>
                  <div className="text-slate-300 text-[11px] mt-0.5 leading-snug">
                    Nhờ KOCity làm việc trực tiếp ở cấp đối tác chiến lược với các Brand lớn, bạn luôn nhận được mức chia sẻ hoa hồng độc quyền cao hơn thị trường tự do.
                  </div>
                </div>
              </div>

              {/* Lợi ích 2: Bảo hộ quyền lợi 100% */}
              <div className="bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-400/40 rounded-2xl p-3 flex items-start gap-3">
                <div className="text-2xl mt-0.5">🛡️</div>
                <div>
                  <div className="font-black text-emerald-300 text-xs">
                    Bảo Hộ Quyền Lợi 100% – Minh Bạch & Đúng Hạn
                  </div>
                  <div className="text-slate-300 text-[11px] mt-0.5 leading-snug">
                    Mọi hợp đồng, quyền lợi và thù lao đều được KOCity đứng ra bảo chứng và giải ngân minh bạch, chuẩn hạn, xóa tan rủi ro bùng tiền hay chậm trễ.
                  </div>
                </div>
              </div>

              {/* Lợi ích 3: Mẫu thử 0đ giao tận nhà */}
              <div className="bg-gradient-to-r from-purple-950/50 to-slate-900 border border-purple-400/40 rounded-2xl p-3 flex items-start gap-3">
                <div className="text-2xl mt-0.5">🎁</div>
                <div>
                  <div className="font-black text-purple-300 text-xs">
                    Nhận Mẫu Thử 0đ Giao Tận Nhà & Booking Chiến Dịch Lớn
                  </div>
                  <div className="text-slate-300 text-[11px] mt-0.5 leading-snug">
                    KOC được nhận miễn phí các sản phẩm hot trend mới nhất từ các nhãn hàng đối tác trước mỗi chiến dịch review / livestream.
                  </div>
                </div>
              </div>
            </div>

            {/* Tiến độ cấp xe thành phố (Xe đạp / Xe máy) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
                  <span>🚲 🛵</span>
                  <span>TIẾN ĐỘ CẤP XE KOCITY CỦA BẠN:</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {userJobsCount} Job hoàn thành
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className={cx('p-2 rounded-xl border flex items-center gap-2', userJobsCount >= 1 ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-black/30 border-white/5 text-slate-400')}>
                  <span>🚲</span>
                  <span>Xe Đạp KOCity ({userJobsCount >= 1 ? '✅ Đã mở' : '≥ 1 Job'})</span>
                </div>
                <div className={cx('p-2 rounded-xl border flex items-center gap-2', userJobsCount >= 3 ? 'bg-amber-950/40 border-amber-500/50 text-amber-300' : 'bg-black/30 border-white/5 text-slate-400')}>
                  <span>🛵</span>
                  <span>Xe Máy KOCity ({userJobsCount >= 3 ? '✅ Đã mở' : '≥ 3 Job'})</span>
                </div>
              </div>
            </div>

            {/* Cụm nút hành động điều hướng nhanh */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button
                variant="primary"
                onClick={() => {
                  setShowHqModal(false);
                  flyTo(2150, 420, 0.95);
                }}
                className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-black text-xs py-3 shadow-lg"
              >
                🏪 Bước Qua Cầu Sang Bờ Brand Hái Job
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setShowHqModal(false);
                  flyTo(650, 450, 0.95);
                }}
                className="bg-slate-800 text-slate-200 border border-white/20 hover:bg-slate-700 font-bold text-xs py-3"
              >
                🏠 Về Nhà Của Bạn (Bờ KOC)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: THÔNG BÁO JOB & CHIẾN DỊCH BRAND (KHI BẤM VÀO STORE) */}
      {selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-white/20 p-6 text-white shadow-2xl ring-4 ring-white/10">
            <button
              type="button"
              onClick={() => setSelectedBrand(null)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
            >
              ✕
            </button>

            {/* Header thông báo job từ store */}
            <div className="flex items-center gap-3.5 mb-4 border-b border-white/10 pb-4">
              <div
                className={cx(
                  'flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-lg ring-2 ring-white/30',
                  selectedBrand.badgeBg
                )}
              >
                {selectedBrand.badgeEmoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>📢</span>
                    <span>THÔNG BÁO JOB MỚI</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                    {selectedBrand.streetName}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">{selectedBrand.name}</h3>
                <p className="text-xs text-slate-400">{selectedBrand.category}</p>
              </div>
            </div>

            {/* Chi tiết công việc & Chiến dịch mẫu 0đ */}
            <div className="space-y-3 mb-5">
              <div className="bg-gradient-to-r from-purple-900/40 to-slate-900 border border-purple-400/30 rounded-2xl p-3.5">
                <div className="text-[10px] text-purple-300 font-extrabold uppercase tracking-wider">
                  Tên Chiến Dịch / Job:
                </div>
                <div className="text-sm font-black text-white mt-1 leading-snug">
                  {selectedBrand.jobTitle}
                </div>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3.5 flex items-start gap-3">
                <span className="text-2xl mt-0.5">🎁</span>
                <div>
                  <div className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider">
                    Quyền Lợi & Thù Lao KOC:
                  </div>
                  <div className="text-xs font-bold text-emerald-100 mt-0.5">
                    {selectedBrand.jobReward}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono mt-1">
                    ✅ {selectedBrand.jobQuota}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <div className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider">
                  Yêu Cầu Nội Dung:
                </div>
                <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedBrand.jobRequirements}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="primary"
                block
                onClick={() => {
                  const match = campaigns.find((c) =>
                    c.title.toLowerCase().includes(selectedBrand.brandName.toLowerCase()) ||
                    (c as any).brand?.toLowerCase().includes(selectedBrand.brandName.toLowerCase())
                  );
                  if (match && onSelectCampaign) {
                    onSelectCampaign(match.id);
                    setSelectedBrand(null);
                    onClose();
                  } else {
                    setSelectedBrand(null);
                  }
                }}
                className={cx('font-black text-white shadow-lg cursor-pointer h-12 text-sm', selectedBrand.badgeBg)}
              >
                Ứng Tuyển & Đăng Ký Nhận Mẫu 0đ Ngay 🎁
              </Button>
              <Button
                variant="ghost"
                block
                onClick={() => setSelectedBrand(null)}
                className="text-slate-400 hover:text-white"
              >
                Để Xem Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: HỒ SƠ CƯ DÂN KOC */}
      {selectedCitizen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-pink-500/50 p-6 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedCitizen(null)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div
                style={{ backgroundColor: selectedCitizen.avatarColor }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-lg ring-2 ring-white"
              >
                {selectedCitizen.isCurrentUser ? '👑' : '🌸'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-black text-white">{selectedCitizen.name}</h3>
                  <span className="text-pink-400 font-extrabold text-xs">{selectedCitizen.number}</span>
                </div>
                <p className="text-xs text-amber-300">{selectedCitizen.role}</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 space-y-2 mb-4 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Phương tiện:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  {selectedCitizen.vehicle === 'motorbike'
                    ? '🛵 Xe máy'
                    : selectedCitizen.vehicle === 'bicycle'
                    ? '🚲 Xe đạp'
                    : '🚶 Đi bộ'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số Job hoàn thành:</span>
                <span className="font-extrabold text-emerald-400">{selectedCitizen.jobsDone} Job</span>
              </div>
            </div>

            {selectedCitizen.bubble && (
              <div className="bg-pink-500/20 border border-pink-500/40 rounded-xl p-3 text-xs text-pink-200 italic mb-4">
                "{selectedCitizen.bubble}"
              </div>
            )}

            <Button
              variant="outline"
              block
              onClick={() => setSelectedCitizen(null)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Đóng
            </Button>
          </div>
        </div>
      )}

      {/* MODAL 5: THÔNG TIN KHU ĐẤT ĐANG ĐẤU THẦU */}
      {showBiddingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-400 p-6 text-white shadow-2xl ring-4 ring-amber-400/20">
            <button
              type="button"
              onClick={() => setShowBiddingModal(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 text-3xl font-black shadow-lg">
                🚧
              </div>
              <div>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  DỰ ÁN QUY HOẠCH
                </span>
                <h3 className="text-lg font-black text-white mt-1">Khu Đất Trống Đang Đấu Thầu</h3>
                <p className="text-xs text-amber-300">Phân Khu Mở Rộng KOCity Megacity</p>
              </div>
            </div>

            <div className="bg-slate-800/90 rounded-2xl p-4 border border-white/10 text-xs text-slate-200 leading-relaxed mb-4 space-y-2">
              <p>
                Đây là khu đất vàng <strong>10.000m²</strong> đã được hoàn tất giải phóng mặt bằng, sẵn sàng chào đón các <strong>Brand Thời Trang, Mỹ Phẩm, FMCG, Đồ Gia Dụng & Chuỗi F&B</strong> mới mở Flagship Store.
              </p>
              <p className="text-emerald-300 font-bold">
                🎯 KOCity đang tiếp nhận hồ sơ hợp tác chiến lược từ các nhãn hàng đối tác!
              </p>
            </div>

            {isEffectiveAdmin ? (
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black cursor-pointer"
                  onClick={() => {
                    setShowBiddingModal(false);
                    setEditingStore(null);
                    setIsAddingStore(true);
                  }}
                >
                  🏗️ Cấp Đất & Mở Store Tại Đây
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBiddingModal(false)}
                  className="border-white/20 text-white cursor-pointer"
                >
                  Đóng
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                block
                onClick={() => setShowBiddingModal(false)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black cursor-pointer"
              >
                Đã Rõ! Tiếp Tục Khám Phá
              </Button>
            )}
          </div>
        </div>
      )}

      {/* MODAL 6: THÊM / SỬA STORE BRAND (ADMIN BUILDER) */}
      {(isAddingStore || editingStore) && (
        <StoreEditorModal
          initialStore={editingStore}
          onSave={handleSaveStoreData}
          onClose={() => {
            setEditingStore(null);
            setIsAddingStore(false);
          }}
        />
      )}

      {/* MODAL 7: MỞ ĐƯỜNG MỚI (ADMIN BUILDER) */}
      {showAddRoadModal && (
        <RoadEditorModal
          onAdd={handleAddRoad}
          onClose={() => setShowAddRoadModal(false)}
        />
      )}

      {/* FLOATING ADMIN TOOLBAR QUY HOẠCH */}
      {isBuilderMode && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center gap-2 bg-slate-900/95 border-2 border-amber-400/90 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md ring-4 ring-amber-400/20 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-1.5 text-amber-300 font-black text-xs pr-2 border-r border-white/20">
            <span>🛠️</span>
            <span>BỘ CÔNG CỤ QUY HOẠCH</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingStore(null);
              setIsAddingStore(true);
            }}
            className="inline-flex items-center gap-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow cursor-pointer transition hover:scale-105"
          >
            <span>➕</span>
            <span>Thêm Store Brand</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddRoadModal(true)}
            className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow cursor-pointer transition hover:scale-105"
          >
            <span>🛣️</span>
            <span>Mở Đường Mới</span>
          </button>

          <button
            type="button"
            onClick={handleSaveCityLayout}
            className="inline-flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-xl shadow cursor-pointer transition hover:scale-105 ring-2 ring-white/60"
          >
            <span>💾</span>
            <span>Lưu Quy Hoạch</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefaults}
            className="inline-flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-xl shadow cursor-pointer transition"
            title="Khôi phục quy hoạch gốc ban đầu"
          >
            <span>↺</span>
            <span>Khôi phục gốc</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBuilderMode(false)}
            className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black cursor-pointer ml-1"
            title="Thoát chế độ quy hoạch"
          >
            ✕
          </button>
        </div>
      )}

      {/* TOAST THÔNG BÁO QUY HOẠCH */}
      {toastNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border-2 border-amber-400 text-amber-300 font-black px-5 py-2.5 rounded-2xl shadow-2xl text-xs backdrop-blur-md flex items-center gap-2 animate-bounce">
          <span>📢</span>
          <span>{toastNotice}</span>
        </div>
      )}

      {/* ===== FOOTER HƯỚNG DẪN TƯƠNG TÁC ===== */}
      <footer className="flex flex-wrap items-center justify-between border-t border-white/10 bg-slate-950/90 px-4 py-2 text-xs text-slate-400 sm:px-6 z-30">
        <div className="flex items-center gap-3 text-[11px]">
          <span>💡 <strong>Bờ Tây:</strong> Cư Xá KOC · <strong>Ở Giữa:</strong> Dòng Sông & 🌉 Cầu KOCity (Hoa Hồng Cao Hơn) · <strong>Bờ Đông:</strong> Phố Store Brand</span>
          <span className="hidden sm:inline">•</span>
          <span>Bấm <strong>👑 Trụ Sở KOCity</strong> để xem đặc quyền hoa hồng & bảo chứng 100%</span>
          <span className="hidden sm:inline">•</span>
          <span>Lăn chuột bám theo con trỏ chuẩn Google Maps 🎯</span>
        </div>
        <div className="text-[10px] text-slate-500 hidden md:block">
          KOCity 2-Bank & Exclusive Bridge Master Plan
        </div>
      </footer>
    </div>
  );
};
