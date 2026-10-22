import React, { useState, useEffect, useRef } from 'react';
import { Campaign } from '../../types';
import { Icon, Button, cx } from '../ui';

interface Citizen {
  id: string;
  name: string;
  city: 'Hà Nội' | 'TP. Hồ Chí Minh';
  number: string;
  role: string;
  x: number;
  y: number;
  direction: 'left' | 'right';
  speed: number;
  minX: number;
  maxX: number;
  avatarBg: string;
  isCurrentUser?: boolean;
  bubble?: string;
}

interface BrandStation {
  id: string;
  name: string;
  brandName: string;
  district: 'Hà Nội' | 'TP. Hồ Chí Minh';
  x: number;
  y: number;
  category: string;
  sampleCount: number;
  icon: string;
  color: string;
  tagline: string;
}

interface KocityWorldModalProps {
  open: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  currentUser: any;
  isNightDefault?: boolean;
  onSelectCampaign?: (campaignId: string) => void;
}

const CHAT_PHRASES_HN = [
  'Vừa nộp đơn nhận son Cỏ Mềm nè bà con! 💄',
  'Hà Nội mùa này lên clip thời trang thu đông là bao hot! 🍂',
  'Có ai qua Cà phê Trứng bàn brief không? ☕',
  'Đã nhận mẫu 0đ tận nhà nhanh thật sự! 📦',
  'Brief mỹ phẩm thuần Việt đợt này duyệt nhanh ghê! ✨',
];

const CHAT_PHRASES_HCM = [
  'Sài Gòn vừa chốt đơn livestream xong, mệt mà vui xỉu! 🎬',
  'Tai nghe Tranyoo nghe bass đỉnh chóp luôn á! 🎧',
  'Đang đứng ở phố đi bộ Nguyễn Huệ quay TikTok nè! 📸',
  'KOCity đối soát hoa hồng minh bạch chuẩn từng đơn! 💰',
  'Ai muốn nhận mẫu dưỡng da Bielenda không, còn 15 suất! 🎁',
];

export const KocityWorldModal: React.FC<KocityWorldModalProps> = ({
  open,
  onClose,
  campaigns,
  currentUser,
  isNightDefault = false,
  onSelectCampaign,
}) => {
  const [isNight, setIsNight] = useState(isNightDefault);
  const [zoom, setZoom] = useState<number>(1);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<BrandStation | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Danh sách các trạm Brand trên bản đồ
  const brandStations: BrandStation[] = [
    {
      id: 'co-mem',
      name: 'Trạm Cỏ Mềm Mỹ Phẩm Thiên Nhiên',
      brandName: 'Cỏ Mềm',
      district: 'Hà Nội',
      x: 420,
      y: 280,
      category: 'Mỹ phẩm & Chăm sóc da',
      sampleCount: 35,
      icon: 'spa',
      color: 'from-emerald-500 to-teal-600',
      tagline: 'Lành sạch thuần Việt · Ưu tiên KOC review chân thực',
    },
    {
      id: 'tranyoo',
      name: 'Trạm Công Nghệ Âm Thanh Tranyoo',
      brandName: 'Tranyoo',
      district: 'TP. Hồ Chí Minh',
      x: 1820,
      y: 260,
      category: 'Công nghệ & Phụ kiện âm thanh',
      sampleCount: 28,
      icon: 'headphones',
      color: 'from-blue-600 to-indigo-700',
      tagline: 'Bass mạnh mẽ · Thiết kế phong cách Cyberpunk Gen Z',
    },
    {
      id: 'bielenda',
      name: 'Boutique Dược Mỹ Phẩm Bielenda',
      brandName: 'Bielenda',
      district: 'TP. Hồ Chí Minh',
      x: 1540,
      y: 290,
      category: 'Dược mỹ phẩm Châu Âu',
      sampleCount: 40,
      icon: 'water_drop',
      color: 'from-fuchsia-600 to-pink-600',
      tagline: 'Phục hồi & Dưỡng sáng da chuyên sâu',
    },
    {
      id: 'visecret',
      name: 'Showroom Thời Trang ViSecret',
      brandName: 'ViSecret',
      district: 'Hà Nội',
      x: 750,
      y: 300,
      category: 'Thời trang & Nội y cao cấp',
      sampleCount: 25,
      icon: 'checkroom',
      color: 'from-purple-600 to-pink-500',
      tagline: 'Tôn dáng thoải mái · Đăng ký nhận mẫu liền tay',
    },
  ];

  // Danh sách Cư dân KOC Chibi đi lại trong thành phố
  const [citizens, setCitizens] = useState<Citizen[]>([
    {
      id: 'c1',
      name: 'Thu Trang (QA***)',
      city: 'Hà Nội',
      number: '#0089',
      role: 'KOC Năng động',
      x: 320,
      y: 410,
      direction: 'right',
      speed: 0.6,
      minX: 200,
      maxX: 520,
      avatarBg: 'bg-gradient-to-tr from-pink-500 to-rose-400',
      bubble: 'Vừa nộp đơn nhận son Cỏ Mềm nè bà con! 💄',
    },
    {
      id: 'c2',
      name: 'Minh Thư (Thư N.)',
      city: 'TP. Hồ Chí Minh',
      number: '#0125',
      role: 'Creator Triệu View',
      x: 1720,
      y: 420,
      direction: 'left',
      speed: 0.7,
      minX: 1500,
      maxX: 1950,
      avatarBg: 'bg-gradient-to-tr from-violet-600 to-indigo-500',
      bubble: 'Sài Gòn vừa chốt đơn livestream xong, mệt mà vui xỉu! 🎬',
    },
    {
      id: 'c3',
      name: 'Huy Hoàng (HoangReview)',
      city: 'TP. Hồ Chí Minh',
      number: '#0204',
      role: 'KOC Công nghệ',
      x: 1880,
      y: 415,
      direction: 'right',
      speed: 0.5,
      minX: 1650,
      maxX: 2100,
      avatarBg: 'bg-gradient-to-tr from-blue-500 to-cyan-400',
    },
    {
      id: 'c4',
      name: 'Linh Chi (ChiChi.Beauty)',
      city: 'Hà Nội',
      number: '#0042',
      role: 'Skincare Guru',
      x: 580,
      y: 425,
      direction: 'left',
      speed: 0.45,
      minX: 420,
      maxX: 780,
      avatarBg: 'bg-gradient-to-tr from-emerald-500 to-teal-400',
    },
    {
      id: 'c5',
      name: 'Bảo Ngọc (NgocBao.OOTD)',
      city: 'TP. Hồ Chí Minh',
      number: '#0312',
      role: 'Fashion KOC',
      x: 1450,
      y: 410,
      direction: 'right',
      speed: 0.65,
      minX: 1350,
      maxX: 1680,
      avatarBg: 'bg-gradient-to-tr from-fuchsia-500 to-pink-500',
    },
    {
      id: 'c6',
      name: 'Tuấn Anh (AnhTuan.Tech)',
      city: 'Hà Nội',
      number: '#0156',
      role: 'Reviewer Đồ Hay',
      x: 820,
      y: 418,
      direction: 'left',
      speed: 0.55,
      minX: 680,
      maxX: 950,
      avatarBg: 'bg-gradient-to-tr from-amber-500 to-orange-400',
    },
  ]);

  // Thêm nhân vật của currentUser nếu đăng nhập
  useEffect(() => {
    if (currentUser?.name) {
      setCitizens((prev) => {
        if (prev.some((c) => c.isCurrentUser)) return prev;
        const userCity: 'Hà Nội' | 'TP. Hồ Chí Minh' =
          currentUser?.address?.toLowerCase().includes('hà nội') || currentUser?.address?.toLowerCase().includes('ha noi')
            ? 'Hà Nội'
            : 'TP. Hồ Chí Minh';
        const startX = userCity === 'Hà Nội' ? 480 : 1650;
        return [
          {
            id: 'user-self',
            name: `${currentUser.name} (BẠN)`,
            city: userCity,
            number: '#001',
            role: 'Cư dân Danh dự',
            x: startX,
            y: 405,
            direction: 'right',
            speed: 0.5,
            minX: startX - 250,
            maxX: startX + 250,
            avatarBg: 'bg-gradient-to-tr from-amber-400 via-pink-500 to-violet-600 ring-4 ring-amber-300 animate-pulse',
            isCurrentUser: true,
            bubble: 'Chào cả nhà, mình đã vào KOCity rồi nè! ✨',
          },
          ...prev,
        ];
      });
    }
  }, [currentUser]);

  // Vòng lặp chuyển động của cư dân (Walking loop)
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setCitizens((prev) =>
        prev.map((c) => {
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
    }, 40);

    return () => clearInterval(interval);
  }, [open]);

  // Luân phiên bong bóng chat vui nhộn
  useEffect(() => {
    if (!open) return;
    const bubbleInterval = setInterval(() => {
      setCitizens((prev) => {
        const randomIdx = Math.floor(Math.random() * prev.length);
        return prev.map((c, idx) => {
          if (idx === randomIdx) {
            const list = c.city === 'Hà Nội' ? CHAT_PHRASES_HN : CHAT_PHRASES_HCM;
            const newPhrase = list[Math.floor(Math.random() * list.length)];
            return { ...c, bubble: newPhrase };
          }
          // Xóa bớt bong bóng sau 7 giây
          if (Math.random() > 0.6) return { ...c, bubble: undefined };
          return c;
        });
      });
    }, 4500);

    return () => clearInterval(bubbleInterval);
  }, [open]);

  // Cuộn mượt đến các vị trí biểu tượng
  const scrollTo = (x: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: x, behavior: 'smooth' });
    }
  };

  // Kéo chuột để trượt bản đồ (Drag to pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };
  const handleMouseLeaveOrUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.6;
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-xl animate-fade-in text-white select-none">
      {/* ===== HEADER THANH ĐIỀU KHIỂN THÀNH PHỐ ===== */}
      <header className="relative z-20 flex flex-wrap items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-2.5 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-violet-600 text-[20px] shadow-lg shadow-pink-500/25">
            🏙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-black tracking-tight text-white sm:text-lg">
                ĐẠI ĐÔ THỊ KOCITY
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/40">
                ● 1,280 Cư dân Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Bản giao hưởng sáng tạo Bắc - Nam (Hà Nội & Sài Gòn Connected)
            </p>
          </div>
        </div>

        {/* Cụm nút di chuyển nhanh & Zoom & Day/Night */}
        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15">
            <button
              type="button"
              onClick={() => scrollTo(100)}
              className="rounded-full px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-white/20 hover:text-white cursor-pointer"
            >
              ⛩️ Quận Hà Nội
            </button>
            <button
              type="button"
              onClick={() => scrollTo(900)}
              className="rounded-full px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-white/20 hover:text-white cursor-pointer"
            >
              🌉 Cầu Kết Nối
            </button>
            <button
              type="button"
              onClick={() => scrollTo(1650)}
              className="rounded-full px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-white/20 hover:text-white cursor-pointer"
            >
              🌆 Quận Sài Gòn
            </button>
          </div>

          {/* Công tắc Ngày / Đêm */}
          <button
            type="button"
            onClick={() => setIsNight(!isNight)}
            title={isNight ? 'Chuyển sang Ban ngày' : 'Chuyển sang Ban đêm Neon'}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ring-1',
              isNight
                ? 'bg-amber-400/20 text-amber-200 ring-amber-300/40 hover:bg-amber-400/30'
                : 'bg-white/15 text-white ring-white/20 hover:bg-white/25'
            )}
          >
            <Icon name={isNight ? 'light_mode' : 'dark_mode'} className="text-[14px]" />
            <span className="hidden sm:inline">{isNight ? 'Trời sáng' : 'Đêm Neon'}</span>
          </button>

          {/* Nút Zoom */}
          <div className="hidden items-center gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15 md:flex">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.85, Number((z - 0.15).toFixed(2))))}
              title="Thu nhỏ bản đồ"
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-200 hover:bg-white/20 hover:text-white"
            >
              <Icon name="zoom_out" className="text-[16px]" />
            </button>
            <span className="px-1 text-[11px] font-bold text-slate-300">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.3, Number((z + 0.15).toFixed(2))))}
              title="Phóng to bản đồ"
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-200 hover:bg-white/20 hover:text-white"
            >
              <Icon name="zoom_in" className="text-[16px]" />
            </button>
          </div>

          {/* Nút đóng */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thành phố"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 transition hover:bg-white/25 hover:scale-105 cursor-pointer ml-1"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>
      </header>

      {/* ===== SÂN KHẤU PANORAMA THÀNH PHỐ (2400px WIDE) ===== */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        className={cx(
          'relative flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing transition-colors duration-700',
          isNight
            ? 'bg-gradient-to-b from-[#0a0518] via-[#150a33] to-[#0c071d]'
            : 'bg-gradient-to-b from-[#87ceeb] via-[#c2e4f6] to-[#f5f3ff]'
        )}
      >
        <div
          style={{ width: '2400px', height: '560px', transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          className="relative min-w-[2400px] h-[560px]"
        >
          {/* Bầu trời & Ngôi sao / Mặt trời */}
          {isNight ? (
            <div className="absolute inset-0 pointer-events-none">
              {/* Ngôi sao lấp lánh */}
              <div className="absolute top-8 left-[15%] h-1 w-1 rounded-full bg-white shadow-xs shadow-white animate-pulse" />
              <div className="absolute top-16 left-[28%] h-1.5 w-1.5 rounded-full bg-amber-200 animate-pulse" />
              <div className="absolute top-10 left-[48%] h-1 w-1 rounded-full bg-cyan-200 animate-pulse" />
              <div className="absolute top-20 left-[68%] h-1.5 w-1.5 rounded-full bg-pink-200 animate-pulse" />
              <div className="absolute top-12 left-[82%] h-1 w-1 rounded-full bg-white animate-pulse" />
              {/* Trăng khuyết Sài Gòn */}
              <div className="absolute top-10 right-[350px] flex h-14 w-14 items-center justify-center rounded-full bg-amber-200/20 shadow-lg shadow-amber-300/30">
                <span className="text-[32px]">🌙</span>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 pointer-events-none">
              {/* Mặt trời Ba Đình */}
              <div className="absolute top-8 left-[300px] flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/30 shadow-2xl shadow-amber-400">
                <span className="text-[36px]">☀️</span>
              </div>
              {/* Mây trắng trôi */}
              <div className="absolute top-12 left-[120px] text-[28px] opacity-75">☁️</div>
              <div className="absolute top-16 left-[720px] text-[34px] opacity-70">☁️</div>
              <div className="absolute top-10 right-[620px] text-[32px] opacity-80">☁️</div>
            </div>
          )}

          {/* ===== DẢI ĐƯỜNG CHÂN TRỜI & CAO ỐC PHÍA XA (BACKGROUND SKYLINE) ===== */}
          <svg className="absolute bottom-[160px] left-0 w-[2400px] h-[220px] pointer-events-none opacity-40" viewBox="0 0 2400 220">
            {/* Dãy cao ốc Hà Nội xa xa */}
            <rect x="80" y="70" width="45" height="150" fill={isNight ? '#3b1d75' : '#a5b4fc'} />
            <rect x="140" y="40" width="60" height="180" fill={isNight ? '#2e145f' : '#818cf8'} />
            <rect x="220" y="80" width="50" height="140" fill={isNight ? '#3b1d75' : '#a5b4fc'} />
            <rect x="680" y="20" width="55" height="200" fill={isNight ? '#4c1d95' : '#6366f1'} /> {/* Keangnam */}
            {/* Dãy cao ốc Sài Gòn xa xa */}
            <polygon points="1750,0 1765,220 1735,220" fill={isNight ? '#6d28d9' : '#818cf8'} /> {/* Landmark 81 đỉnh nhọn */}
            <rect x="1725" y="30" width="50" height="190" fill={isNight ? '#4c1d95' : '#6366f1'} />
            <polygon points="1920,50 1960,220 1880,220" fill={isNight ? '#3b1d75' : '#a5b4fc'} /> {/* Bitexco búp sen */}
            <rect x="1900" y="60" width="40" height="160" fill={isNight ? '#2e145f' : '#818cf8'} />
            <rect x="2020" y="70" width="50" height="150" fill={isNight ? '#4c1d95' : '#6366f1'} />
          </svg>

          {/* ===== 1. QUẬN HÀ NỘI: CỔ KÍNH & THƠ MỘNG (X: 0 - 950px) ===== */}
          <div className="absolute top-[80px] left-[50px] w-[880px] h-[340px]">
            {/* Cổng chào Quận Hà Nội */}
            <div className="absolute top-[10px] left-[10px] flex items-center gap-1.5 rounded-full bg-rose-900/40 px-3 py-1 text-xs font-black text-rose-200 ring-1 ring-rose-400/40 backdrop-blur-md">
              ⛩️ QUẬN HÀ NỘI · PHỐ CỔ SÁNG TẠO
            </div>

            {/* Hồ Gươm & Tháp Rùa & Cầu Thê Húc */}
            <div className="absolute bottom-[20px] left-[40px] flex flex-col items-center">
              {/* Tháp Rùa */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="h-6 w-10 rounded-t-sm border-t-2 border-amber-600 bg-amber-700 text-center text-[8px] text-amber-200 font-bold">
                  THÁP
                </div>
                <div className="h-7 w-12 border-t-2 border-amber-600 bg-amber-800 text-center text-[7px] text-amber-300">
                  RÙA
                </div>
                <div className="h-4 w-16 rounded-sm bg-emerald-800 shadow-md flex items-center justify-center text-[9px]">
                  🐢
                </div>
              </div>

              {/* Mặt nước Hồ Gươm */}
              <div className="mt-1 h-12 w-48 rounded-full bg-gradient-to-r from-emerald-600/50 via-teal-500/40 to-cyan-600/40 shadow-inner flex items-center justify-around text-[10px]">
                <span>🌿</span>
                <span className="text-[12px]">✨</span>
                <span>🌿</span>
              </div>
            </div>

            {/* Cầu Thê Húc đỏ son */}
            <div className="absolute bottom-[40px] left-[200px] flex flex-col items-center">
              <div className="flex h-6 w-24 items-center justify-center rounded-t-full bg-red-600 shadow-md shadow-red-500/30 text-[9px] font-bold text-white ring-1 ring-red-400">
                Cầu Thê Húc
              </div>
              <div className="h-3 w-28 bg-amber-900 rounded-sm" />
            </div>

            {/* Khu 36 Phố Phường TikTok */}
            <div className="absolute bottom-[40px] left-[340px] flex items-end gap-3">
              {/* Nhà cổ 1: Trạm Cỏ Mềm */}
              <div
                onClick={() => setSelectedBrand(brandStations[0])}
                className="group relative flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1.5"
              >
                <div className="absolute -top-7 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md animate-bounce">
                  🌿 Trạm Mẫu 0đ
                </div>
                {/* Mái ngói rêu phong */}
                <div className="h-6 w-28 rounded-t-lg bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 border-b-2 border-amber-950 text-center text-[9px] font-bold text-amber-200 pt-0.5">
                  CỎ MỀM
                </div>
                {/* Thân nhà cổ */}
                <div className="flex h-28 w-24 flex-col items-center justify-between rounded-b-sm bg-amber-100/90 p-1.5 text-slate-800 ring-1 ring-amber-300 shadow-lg group-hover:ring-2 group-hover:ring-emerald-400">
                  <span className="text-[20px]">🧴</span>
                  <span className="rounded bg-emerald-600 px-1 py-0.5 text-[9px] font-bold text-white">
                    35 Mẫu 0đ
                  </span>
                  <span className="text-[9px] font-bold text-amber-950">Mỹ Phẩm Lành</span>
                </div>
              </div>

              {/* Nhà cổ 2: Phố Hàng Mẫu & Cà Phê Trứng */}
              <div className="flex flex-col items-center">
                <div className="h-5 w-24 rounded-t-lg bg-amber-900 text-center text-[8px] font-bold text-amber-200 pt-0.5">
                  ☕ CÀ PHÊ TRỨNG
                </div>
                <div className="flex h-24 w-20 flex-col items-center justify-around bg-orange-100/90 p-1 text-slate-800 ring-1 ring-orange-200 shadow-md">
                  <span className="text-[18px]">☕</span>
                  <span className="text-[9px] font-semibold text-orange-950">KOC Lounge</span>
                </div>
              </div>

              {/* Showroom ViSecret */}
              <div
                onClick={() => setSelectedBrand(brandStations[3])}
                className="group relative flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1.5"
              >
                <div className="h-6 w-24 rounded-t-lg bg-purple-900 text-center text-[9px] font-bold text-purple-200 pt-0.5">
                  VISECRET
                </div>
                <div className="flex h-28 w-22 flex-col items-center justify-between rounded-b-sm bg-purple-50/90 p-1.5 text-slate-800 ring-1 ring-purple-300 shadow-lg group-hover:ring-2 group-hover:ring-pink-400">
                  <span className="text-[20px]">👗</span>
                  <span className="rounded bg-purple-600 px-1 py-0.5 text-[9px] font-bold text-white">
                    25 Mẫu 0đ
                  </span>
                  <span className="text-[9px] font-bold text-purple-950">Thời Trang</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== 2. CẦU KẾT NỐI BẮC - NAM & TUYẾN TÀU KOCITY EXPRESS (X: 950 - 1350px) ===== */}
          <div className="absolute top-[80px] left-[930px] w-[420px] h-[340px] flex flex-col items-center justify-end pb-8">
            {/* Dòng sông phản chiếu ánh đèn */}
            <div className="absolute bottom-[20px] w-full h-[60px] bg-gradient-to-r from-teal-600/40 via-cyan-500/50 to-indigo-600/40 rounded-full shadow-inner flex items-center justify-center">
              <span className="text-xs text-white/50 tracking-widest font-mono">
                ~ SÔNG HỒNG ⇄ SÔNG SÀI GÒN ~
              </span>
            </div>

            {/* Chiếc Cầu Ánh Sáng Vòm Cong */}
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="h-10 w-[360px] rounded-t-[100px] border-t-4 border-amber-400 bg-gradient-to-b from-amber-400/20 to-transparent flex items-center justify-center">
                <span className="text-[10px] font-black tracking-wider text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded-full ring-1 ring-amber-300/40">
                  🌉 CẦU KẾT NỐI SÁNG TẠO
                </span>
              </div>
              <div className="h-4 w-[380px] bg-slate-800 border-t-2 border-slate-600 rounded-sm flex items-center justify-between px-4">
                {/* Tuyến tàu KOCity Express */}
                <div className="flex items-center gap-1 text-[11px] font-bold text-white bg-pink-600 px-2 py-0.5 rounded shadow-sm animate-pulse">
                  🚄 KOCity Express
                </div>
                <span className="text-[9px] text-amber-300 font-semibold">Tốc hành 24h</span>
              </div>
            </div>
          </div>

          {/* ===== 3. QUẬN SÀI GÒN: HIỆN ĐẠI & KHÔNG NGỦ (X: 1350 - 2400px) ===== */}
          <div className="absolute top-[60px] left-[1350px] w-[1000px] h-[360px]">
            {/* Cổng chào Quận Sài Gòn */}
            <div className="absolute top-[30px] left-[20px] flex items-center gap-1.5 rounded-full bg-violet-900/40 px-3 py-1 text-xs font-black text-violet-200 ring-1 ring-violet-400/40 backdrop-blur-md">
              🌆 QUẬN SÀI GÒN · ĐÔ THỊ KHÔNG NGỦ
            </div>

            {/* Các công trình biểu tượng Sài Gòn */}
            <div className="absolute bottom-[40px] left-[40px] flex items-end gap-4">
              {/* Showroom Bielenda */}
              <div
                onClick={() => setSelectedBrand(brandStations[2])}
                className="group relative flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1.5"
              >
                <div className="h-7 w-26 rounded-t-lg bg-fuchsia-800 text-center text-[9px] font-bold text-fuchsia-100 pt-1">
                  BIELENDA
                </div>
                <div className="flex h-32 w-24 flex-col items-center justify-between rounded-b-sm bg-pink-50/90 p-1.5 text-slate-800 ring-1 ring-pink-300 shadow-xl group-hover:ring-2 group-hover:ring-fuchsia-500">
                  <span className="text-[22px]">✨</span>
                  <span className="rounded bg-fuchsia-600 px-1 py-0.5 text-[9px] font-bold text-white">
                    40 Mẫu 0đ
                  </span>
                  <span className="text-[9px] font-bold text-fuchsia-950">Dược Mỹ Phẩm</span>
                </div>
              </div>

              {/* Chợ Bến Thành (Kho Hàng 0đ Tốc Hành) */}
              <div className="flex flex-col items-center">
                <div className="h-8 w-28 rounded-t-xl bg-amber-600 flex flex-col items-center justify-center text-white">
                  <span className="text-[8px] font-black">CHỢ BẾN THÀNH</span>
                  <div className="h-3 w-3 rounded-full bg-white text-slate-900 text-[6px] font-bold flex items-center justify-center">
                    🕒
                  </div>
                </div>
                <div className="flex h-26 w-24 flex-col items-center justify-around bg-amber-50/95 p-1 ring-1 ring-amber-300 shadow-lg">
                  <span className="text-[20px]">📦</span>
                  <span className="text-[9px] font-bold text-amber-900">Trạm Xuất Mẫu</span>
                </div>
              </div>

              {/* Trạm Công Nghệ Tranyoo Cyberpunk */}
              <div
                onClick={() => setSelectedBrand(brandStations[1])}
                className="group relative flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1.5"
              >
                <div className="absolute -top-7 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md animate-bounce">
                  ⚡ Trạm Mẫu 0đ
                </div>
                <div className="h-8 w-28 rounded-t-lg bg-blue-900 text-center text-[10px] font-black text-cyan-300 pt-1 border-t-2 border-cyan-400">
                  TRANYOO
                </div>
                <div className="flex h-36 w-26 flex-col items-center justify-between rounded-b-sm bg-slate-900/90 p-2 text-white ring-1 ring-blue-500 shadow-2xl group-hover:ring-2 group-hover:ring-cyan-300">
                  <span className="text-[24px]">🎧</span>
                  <span className="rounded bg-gradient-to-r from-blue-600 to-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    28 Tai Nghe 0đ
                  </span>
                  <span className="text-[9px] font-bold text-cyan-300">Tech & Sound</span>
                </div>
              </div>

              {/* Tháp Landmark 81 & Bitexco KOC Tower */}
              <div className="relative flex flex-col items-center">
                <div className="h-10 w-24 rounded-t-md bg-gradient-to-t from-violet-600 to-indigo-400 text-center text-[8px] font-black text-white pt-1">
                  LANDMARK 81
                </div>
                <div className="flex h-44 w-28 flex-col items-center justify-around bg-slate-900/95 border-x-2 border-indigo-400 p-2 shadow-2xl">
                  <div className="flex items-center gap-1 text-[10px] text-pink-400 font-bold bg-pink-950/60 px-2 py-0.5 rounded-full ring-1 ring-pink-500/40">
                    🔴 MEGA LIVE
                  </div>
                  <span className="text-[26px]">🏙️</span>
                  <span className="text-[9px] font-bold text-indigo-300">KOCity Tower</span>
                </div>
              </div>

              {/* Phố đi bộ Nguyễn Huệ & Dàn Ring Light */}
              <div className="flex flex-col items-center">
                <div className="h-6 w-32 rounded-t-lg bg-slate-800 text-center text-[8px] font-bold text-slate-300 pt-1">
                  PHỐ ĐI BỘ NGUYỄN HUỆ
                </div>
                <div className="flex h-24 w-30 items-center justify-center gap-2 bg-slate-900/80 p-2 ring-1 ring-slate-700 shadow-lg">
                  <span className="text-[20px] animate-pulse">💡</span>
                  <span className="text-[9px] font-bold text-amber-300">Creator Plaza</span>
                  <span className="text-[20px] animate-pulse">💡</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== 4. VỈA HÈ & ĐƯỜNG ĐI DẠO CỦA CÁC CƯ DÂN (XUYÊN SUỐT 2400PX) ===== */}
          <div className="absolute bottom-0 left-0 w-[2400px] h-[120px] bg-gradient-to-t from-slate-900 via-slate-800 to-slate-900/90 border-t-4 border-amber-400/40">
            {/* Làn đường & Hoa văn vỉa hè */}
            <div className="h-2 w-full bg-dashed border-b border-white/20" />
            <div className="flex items-center justify-between px-10 pt-2 text-[10px] text-slate-500 font-mono">
              <span>◄ VỈA HÈ PHỐ CỔ HÀ NỘI</span>
              <span>ĐẠI LỘ KOCITY BẮC - NAM</span>
              <span>ĐẠI LỘ NGUYỄN HUỆ SÀI GÒN ►</span>
            </div>
          </div>

          {/* ===== 5. CÁC NHÂN VẬT CƯ DÂN KOC CHIBI (ANIMATED AVATARS) ===== */}
          {citizens.map((c) => (
            <div
              key={c.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCitizen(c);
              }}
              style={{ left: `${c.x}px`, top: `${c.y}px` }}
              className="absolute z-30 flex flex-col items-center cursor-pointer transition-transform hover:scale-110"
            >
              {/* Bong bóng thoại (Chat Bubble) */}
              {c.bubble && (
                <div className="relative -top-2 max-w-[190px] rounded-2xl bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-900 shadow-xl ring-2 ring-pink-500/80 animate-fade-in text-center leading-snug">
                  {c.bubble}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-white ring-r-2 ring-b-2 ring-pink-500/80" />
                </div>
              )}

              {/* Bảng tên lơ lửng trên đầu (Floating Name Tag) */}
              <div
                className={cx(
                  'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-md backdrop-blur-md ring-1 whitespace-nowrap',
                  c.isCurrentUser
                    ? 'bg-amber-400 text-slate-950 ring-white animate-bounce'
                    : isNight
                    ? 'bg-slate-900/85 text-white ring-violet-400/40'
                    : 'bg-white/95 text-slate-900 ring-slate-300'
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{c.name}</span>
                <span className="opacity-75">({c.city === 'Hà Nội' ? 'HN' : 'HCM'})</span>
                <span className="text-pink-500">{c.number}</span>
              </div>

              {/* Thân nhân vật Chibi */}
              <div className="relative mt-1 flex flex-col items-center">
                {/* Đầu chibi */}
                <div
                  className={cx(
                    'flex h-11 w-11 items-center justify-center rounded-full text-[20px] shadow-lg transition-transform',
                    c.avatarBg
                  )}
                >
                  {c.isCurrentUser ? '👑' : c.city === 'Hà Nội' ? '🌸' : '☕'}
                </div>
                {/* Chân chibi bước đi */}
                <div className="flex gap-2 -mt-1 text-[10px]">
                  <span>👟</span>
                  <span>👟</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== POPUP CHI TIẾT THẺ CƯ DÂN (KOCITY CITIZEN CARD) ===== */}
      {selectedCitizen && (
        <div
          onClick={() => setSelectedCitizen(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-violet-950 p-6 text-white shadow-2xl ring-2 ring-violet-500/40"
          >
            <button
              type="button"
              onClick={() => setSelectedCitizen(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <Icon name="close" className="text-[20px]" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className={cx('flex h-14 w-14 items-center justify-center rounded-2xl text-[28px] shadow-lg', selectedCitizen.avatarBg)}>
                {selectedCitizen.isCurrentUser ? '👑' : selectedCitizen.city === 'Hà Nội' ? '🌸' : '☕'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-lg font-bold text-white">{selectedCitizen.name}</h3>
                  <span className="rounded bg-pink-500/30 px-1.5 py-0.5 text-[10px] font-bold text-pink-300">
                    {selectedCitizen.number}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  📍 Cư dân {selectedCitizen.city} · {selectedCitizen.role}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between rounded-xl bg-white/5 p-2.5">
                <span className="text-slate-400">Trạng thái:</span>
                <span className="font-bold text-emerald-400">🟢 Đang online tại KOCity</span>
              </div>
              <div className="flex justify-between rounded-xl bg-white/5 p-2.5">
                <span className="text-slate-400">Mẫu 0đ đã nhận:</span>
                <span className="font-bold text-white">4 Sản phẩm</span>
              </div>
              <div className="flex justify-between rounded-xl bg-white/5 p-2.5">
                <span className="text-slate-400">Video TikTok đã đăng:</span>
                <span className="font-bold text-fuchsia-300">3 Clip Review</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              block
              className="mt-5 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 font-bold"
              onClick={() => setSelectedCitizen(null)}
            >
              Vẫy tay chào Cư dân 👋
            </Button>
          </div>
        </div>
      )}

      {/* ===== POPUP CHI TIẾT TRẠM NHÃN HÀNG (BRAND STATION CARD) ===== */}
      {selectedBrand && (
        <div
          onClick={() => setSelectedBrand(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-slate-900 p-6 text-white shadow-2xl ring-2 ring-violet-500/40"
          >
            <button
              type="button"
              onClick={() => setSelectedBrand(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <Icon name="close" className="text-[20px]" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className={cx('flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr text-[26px] text-white shadow-lg', selectedBrand.color)}>
                <Icon name={selectedBrand.icon} className="text-[28px]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Trạm Brand {selectedBrand.district}
                </span>
                <h3 className="font-display text-lg font-black text-white">{selectedBrand.name}</h3>
                <p className="text-xs text-slate-400">{selectedBrand.category}</p>
              </div>
            </div>

            <p className="mt-3 text-xs italic text-slate-300">
              "{selectedBrand.tagline}"
            </p>

            <div className="mt-4 rounded-2xl bg-violet-950/40 p-3 ring-1 ring-violet-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Suất mẫu 0đ đang mở tuyển:</span>
                <span className="font-display text-base font-bold text-emerald-400">
                  {selectedBrand.sampleCount} Suất
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Nhận hàng tận nhà 100% miễn phí, lên video theo brief và nhận hoa hồng theo từng đơn.
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20"
                onClick={() => setSelectedBrand(null)}
              >
                Đóng
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 font-bold"
                onClick={() => {
                  const target = campaigns.find((c) => c.brandName.toLowerCase().includes(selectedBrand.brandName.toLowerCase()));
                  setSelectedBrand(null);
                  onClose();
                  if (target && onSelectCampaign) {
                    onSelectCampaign(target.id);
                  } else {
                    document.getElementById('mau-dang-mo')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Khám phá & Nộp đơn 🎁
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER HƯỚNG DẪN TƯƠNG TÁC ===== */}
      <footer className="flex flex-wrap items-center justify-between border-t border-white/10 bg-slate-950/90 px-4 py-2 text-xs text-slate-400 sm:px-6">
        <div className="flex items-center gap-3">
          <span>💡 <strong>Mẹo:</strong> Kéo chuột hoặc vuốt ngón tay để dạo phố</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Bấm vào bất kỳ <strong>Cư dân</strong> để xem thẻ KOC</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Bấm vào <strong>Toà nhà Brand</strong> để nhận mẫu 0đ</span>
        </div>
        <div className="text-[11px] text-slate-500">
          KOCity Metaverse Beta v1.0
        </div>
      </footer>
    </div>
  );
};
