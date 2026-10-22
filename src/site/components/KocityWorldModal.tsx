import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Campaign } from '../../types';
import { Icon, Button, cx } from '../ui';

export type VehicleType = 'walk' | 'bicycle' | 'motorbike';

interface Citizen {
  id: string;
  name: string;
  city: 'Hà Nội' | 'TP. Hồ Chí Minh';
  number: string;
  role: string;
  jobsDone: number;
  vehicle: VehicleType;
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
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
  city: 'Hà Nội' | 'TP. Hồ Chí Minh';
  x: number;
  y: number;
  category: string;
  sampleCount: number;
  icon: string;
  color: string;
  tagline: string;
  desc: string;
}

interface KocityWorldModalProps {
  open: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  currentUser: any;
  isNightDefault?: boolean;
  onSelectCampaign?: (campaignId: string) => void;
}

const MAP_WIDTH = 2600;
const MAP_HEIGHT = 1600;

export const KocityWorldModal: React.FC<KocityWorldModalProps> = ({
  open,
  onClose,
  campaigns,
  currentUser,
  isNightDefault = false,
  onSelectCampaign,
}) => {
  const [isNight, setIsNight] = useState(isNightDefault);
  const [zoom, setZoom] = useState<number>(0.75); // Mặc định mở ra ở mức sa bàn thu nhỏ rộng lớn
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<BrandStation | null>(null);
  const [showHqModal, setShowHqModal] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const [viewportPos, setViewportPos] = useState({ x: 0, y: 0, w: 800, h: 600 });

  // Tính số job đã hoàn thành của user (nếu có tài khoản)
  const userJobsCount = currentUser?.completedApplications?.length || 0;
  const userVehicle: VehicleType = userJobsCount >= 3 ? 'motorbike' : userJobsCount >= 1 ? 'bicycle' : 'walk';

  // Danh sách các trạm Brand phân chia theo nguồn gửi mẫu thực tế
  const brandStations: BrandStation[] = [
    // --- VÙNG HÀ NỘI ---
    {
      id: 'co-mem',
      name: 'Trạm Cỏ Mềm Mỹ Phẩm Thiên Nhiên',
      brandName: 'Cỏ Mềm',
      city: 'Hà Nội',
      x: 520,
      y: 330,
      category: 'Mỹ phẩm thuần khiết',
      sampleCount: 35,
      icon: 'spa',
      color: 'from-emerald-500 to-teal-700',
      tagline: 'Lành sạch thuần Việt · Gửi mẫu hỏa tốc từ Hà Nội',
      desc: 'Kho tổng Cỏ Mềm đặt tại Hà Nội, cung cấp các dòng son dưỡng, bọt rửa mặt, serum rau má 0đ.',
    },
    {
      id: 'visecret-hn',
      name: 'Showroom Thời Trang ViSecret Hà Nội',
      brandName: 'ViSecret',
      city: 'Hà Nội',
      x: 1750,
      y: 340,
      category: 'Thời trang & May mặc cao cấp',
      sampleCount: 25,
      icon: 'checkroom',
      color: 'from-purple-600 to-pink-600',
      tagline: 'Kho may mặc Hà Nội · Form dáng chuẩn Á Đông',
      desc: 'Xuất mẫu áo bra tàng hình, đầm thiết kế miễn phí tận nhà cho KOC lên video OOTD.',
    },

    // --- VÙNG SÀI GÒN ---
    {
      id: 'tranyoo-sg',
      name: 'Trạm Công Nghệ Âm Thanh Tranyoo',
      brandName: 'Tranyoo',
      city: 'TP. Hồ Chí Minh',
      x: 620,
      y: 1180,
      category: 'Phụ kiện công nghệ Cyberpunk',
      sampleCount: 30,
      icon: 'headphones',
      color: 'from-blue-600 to-cyan-600',
      tagline: 'Kho công nghệ Sài Gòn · Giao tai nghe 0đ trong 24h',
      desc: 'Trụ sở phân phối tai nghe Bluetooth TWS, củ sạc nhanh chuẩn Gen Z.',
    },
    {
      id: 'bielenda-sg',
      name: 'Boutique Dược Mỹ Phẩm Bielenda Sài Gòn',
      brandName: 'Bielenda',
      city: 'TP. Hồ Chí Minh',
      x: 1850,
      y: 1190,
      category: 'Dược mỹ phẩm Châu Âu',
      sampleCount: 42,
      icon: 'water_drop',
      color: 'from-fuchsia-600 to-rose-600',
      tagline: 'Kho nhập khẩu Sài Gòn · Trị mụn & Phục hồi chuyên sâu',
      desc: 'Dòng sản phẩm toner acid, serum peel da được hàng triệu beauty blogger tin dùng.',
    },
  ];

  // Danh sách các Cư dân mẫu với cấp bậc phương tiện khác nhau (Đi bộ, Xe đạp, Xe máy)
  const [citizens, setCitizens] = useState<Citizen[]>([
    // Cư dân Hà Nội
    {
      id: 'c1',
      name: 'Thu Trang (QA***)',
      city: 'Hà Nội',
      number: '#0089',
      role: 'Cư dân Năng Động',
      jobsDone: 1,
      vehicle: 'bicycle',
      x: 480,
      y: 430,
      direction: 'right',
      speed: 1.5,
      minX: 300,
      maxX: 820,
      avatarBg: 'bg-pink-500',
      bubble: 'Đang đạp xe qua phố Hàng Mẫu nhận son Cỏ Mềm! 🚲',
    },
    {
      id: 'c2',
      name: 'Tuấn Anh (AnhTuan.Tech)',
      city: 'Hà Nội',
      number: '#0042',
      role: 'KOC Thâm Niên',
      jobsDone: 4,
      vehicle: 'motorbike',
      x: 850,
      y: 440,
      direction: 'left',
      speed: 2.4,
      minX: 620,
      maxX: 1250,
      avatarBg: 'bg-amber-500',
      bubble: 'Lái xe máy sang Trụ sở KOCity đối soát đơn hàng! 🛵',
    },
    {
      id: 'c3',
      name: 'Linh Chi (ChiChi.Review)',
      city: 'Hà Nội',
      number: '#0156',
      role: 'Tân Cư Dân',
      jobsDone: 0,
      vehicle: 'walk',
      x: 1420,
      y: 420,
      direction: 'right',
      speed: 0.8,
      minX: 1300,
      maxX: 1680,
      avatarBg: 'bg-emerald-500',
      bubble: 'Cố gắng làm xong 1 job để nhận xe đạp đi dạo Hồ Gươm nè 🌸',
    },

    // Cư dân Sài Gòn
    {
      id: 'c4',
      name: 'Minh Thư (Thư N.)',
      city: 'TP. Hồ Chí Minh',
      number: '#0125',
      role: 'Creator Triệu View',
      jobsDone: 6,
      vehicle: 'motorbike',
      x: 1520,
      y: 1280,
      direction: 'right',
      speed: 2.6,
      minX: 1200,
      maxX: 2100,
      avatarBg: 'bg-indigo-600',
      bubble: 'Lượn phố đi bộ Nguyễn Huệ bằng xe máy KOCity đã ghê! 🛵',
    },
    {
      id: 'c5',
      name: 'Huy Hoàng (HoangAudio)',
      city: 'TP. Hồ Chí Minh',
      number: '#0204',
      role: 'KOC Năng Động',
      jobsDone: 2,
      vehicle: 'bicycle',
      x: 820,
      y: 1290,
      direction: 'left',
      speed: 1.4,
      minX: 520,
      maxX: 1050,
      avatarBg: 'bg-cyan-500',
      bubble: 'Đạp xe ghé Trạm Tranyoo lấy tai nghe mới test bass 🎧',
    },
    {
      id: 'c6',
      name: 'Bảo Ngọc (NgocBao.OOTD)',
      city: 'TP. Hồ Chí Minh',
      number: '#0312',
      role: 'Tân Cư Dân',
      jobsDone: 0,
      vehicle: 'walk',
      x: 1820,
      y: 1275,
      direction: 'right',
      speed: 0.75,
      minX: 1650,
      maxX: 2020,
      avatarBg: 'bg-fuchsia-500',
      bubble: 'Đang đi bộ qua chợ Bến Thành ngắm đồ OOTD ✨',
    },

    // Cư dân trên Cầu Kết Nối Bắc - Nam
    {
      id: 'c7',
      name: 'Phương Linh (LinhReview)',
      city: 'Hà Nội',
      number: '#0078',
      role: 'KOC Năng Động',
      jobsDone: 1,
      vehicle: 'bicycle',
      x: 1280,
      y: 840,
      direction: 'right',
      speed: 1.3,
      minX: 1100,
      maxX: 1500,
      avatarBg: 'bg-rose-500',
      bubble: 'Đang đạp xe qua Cầu Kết Nối sang chi nhánh Sài Gòn! 🌉',
    },
  ]);

  // Thêm nhân vật của currentUser (nếu có tài khoản đăng nhập)
  useEffect(() => {
    if (currentUser?.name) {
      setCitizens((prev) => {
        if (prev.some((c) => c.isCurrentUser)) return prev;
        const userCity: 'Hà Nội' | 'TP. Hồ Chí Minh' =
          currentUser?.address?.toLowerCase().includes('hà nội') || currentUser?.address?.toLowerCase().includes('ha noi')
            ? 'Hà Nội'
            : 'TP. Hồ Chí Minh';
        const startY = userCity === 'Hà Nội' ? 425 : 1285;
        const startX = userCity === 'Hà Nội' ? 680 : 1380;
        const speed = userVehicle === 'motorbike' ? 2.5 : userVehicle === 'bicycle' ? 1.5 : 0.8;

        return [
          {
            id: 'user-self',
            name: `${currentUser.name} (BẠN)`,
            city: userCity,
            number: '#001',
            role: userJobsCount >= 3 ? 'KOC Thâm Niên' : userJobsCount >= 1 ? 'KOC Năng Động' : 'Tân Cư Dân',
            jobsDone: userJobsCount,
            vehicle: userVehicle,
            x: startX,
            y: startY,
            direction: 'right',
            speed,
            minX: startX - 350,
            maxX: startX + 350,
            avatarBg: 'bg-gradient-to-tr from-amber-400 via-pink-500 to-violet-600 ring-2 ring-amber-300 animate-pulse',
            isCurrentUser: true,
            bubble:
              userVehicle === 'motorbike'
                ? 'Đã mở khóa Xe Máy KOCity lướt siêu nhanh! 🛵💨'
                : userVehicle === 'bicycle'
                ? 'Đang đạp Xe Đạp KOCity đi nhận job 🚲'
                : 'Đang đi bộ, hoàn thành 1 job để nhận xe đạp tại Trụ sở KOCity! 🚶',
          },
          ...prev,
        ];
      });
    }
  }, [currentUser, userJobsCount, userVehicle]);

  // Vòng lặp chuyển động của các nhân vật trên đường
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

  // Luân phiên bong bóng thoại ngẫu nhiên
  useEffect(() => {
    if (!open) return;
    const bubbleTimer = setInterval(() => {
      setCitizens((prev) => {
        const randIdx = Math.floor(Math.random() * prev.length);
        return prev.map((c, i) => {
          if (i === randIdx) {
            const phrases = [
              'Vừa hoàn thành video cho Cỏ Mềm, duyệt nhanh xỉu! ✨',
              'Ghé Trụ sở KOCity nhận xe đạp mới toanh 🚲',
              'Sài Gòn hôm nay nắng đẹp, lên đồ quay TikTok thôi 📸',
              'Trạm Tranyoo vừa về thêm 30 tai nghe 0đ kìa 🎧',
              'Review chân thực để tích lũy 3 job đổi xe máy nhé bà con! 🛵',
            ];
            return { ...c, bubble: phrases[Math.floor(Math.random() * phrases.length)] };
          }
          if (Math.random() > 0.6) return { ...c, bubble: undefined };
          return c;
        });
      });
    }, 5000);

    return () => clearInterval(bubbleTimer);
  }, [open]);

  // Cập nhật toạ độ Viewport để hiển thị khung trên Minimap
  const updateViewportTracker = useCallback(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    setViewportPos({
      x: el.scrollLeft / zoom,
      y: el.scrollTop / zoom,
      w: el.clientWidth / zoom,
      h: el.clientHeight / zoom,
    });
  }, [zoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateViewportTracker);
    updateViewportTracker();
    return () => el.removeEventListener('scroll', updateViewportTracker);
  }, [updateViewportTracker, open]);

  // Khi mở modal, căn camera vào giữa (khu vực Trụ sở KOCity và Cầu Kết Nối)
  useEffect(() => {
    if (open && containerRef.current) {
      setTimeout(() => {
        if (!containerRef.current) return;
        const targetX = (MAP_WIDTH * zoom - containerRef.current.clientWidth) / 2;
        const targetY = (MAP_HEIGHT * zoom - containerRef.current.clientHeight) / 2;
        containerRef.current.scrollTo({ left: Math.max(0, targetX), top: Math.max(0, targetY), behavior: 'smooth' });
      }, 100);
    }
  }, [open, zoom]);

  // Hỗ trợ Lăn chuột để Zoom (Mouse Wheel to Zoom từ 40% đến 200%)
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey || true) {
      e.preventDefault();
      const zoomDelta = e.deltaY > 0 ? -0.08 : 0.08;
      setZoom((prev) => {
        const next = Math.max(0.4, Math.min(2.0, Number((prev + zoomDelta).toFixed(2))));
        return next;
      });
    }
  };

  // Kéo chuột tự do 360 độ (Pan 2D)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setDragStart({
      x: e.pageX,
      y: e.pageY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const dx = e.pageX - dragStart.x;
    const dy = e.pageY - dragStart.y;
    containerRef.current.scrollLeft = dragStart.scrollLeft - dx;
    containerRef.current.scrollTop = dragStart.scrollTop - dy;
  };

  const handleMouseUp = () => setIsDragging(false);

  // Nhảy camera nhanh đến địa điểm
  const jumpTo = (x: number, y: number) => {
    if (!containerRef.current) return;
    const targetLeft = x * zoom - containerRef.current.clientWidth / 2;
    const targetTop = y * zoom - containerRef.current.clientHeight / 2;
    containerRef.current.scrollTo({
      left: Math.max(0, targetLeft),
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 text-white select-none backdrop-blur-xl animate-fade-in">
      {/* ===== HEADER ĐIỀU KHIỂN THÀNH PHỐ ===== */}
      <header className="relative z-20 flex flex-wrap items-center justify-between border-b border-white/10 bg-slate-950/85 px-4 py-2 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-violet-600 text-[18px] shadow-lg shadow-pink-500/25">
            🏙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-black tracking-tight text-white sm:text-base">
                KOCITY SA BÀN ĐÔ THỊ (HÀ NỘI & SÀI GÒN)
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/40">
                ● 1,280 Cư Dân Online
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Lăn chuột để Zoom (40% - 200%) · Kéo thả để dạo quanh thành phố
            </p>
          </div>
        </div>

        {/* Cụm nút chuyển nhanh */}
        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-0.5 ring-1 ring-white/15 text-xs">
            <button
              type="button"
              onClick={() => jumpTo(650, 350)}
              className="rounded-full px-2.5 py-1 font-semibold text-slate-200 transition hover:bg-white/20 hover:text-white cursor-pointer"
            >
              ⛩️ Hà Nội
            </button>
            <button
              type="button"
              onClick={() => jumpTo(1300, 800)}
              className="rounded-full bg-violet-600/60 px-2.5 py-1 font-bold text-amber-300 transition hover:bg-violet-600 hover:text-white ring-1 ring-amber-300/40 cursor-pointer"
            >
              🏢 Trụ sở KOCity
            </button>
            <button
              type="button"
              onClick={() => jumpTo(1300, 1250)}
              className="rounded-full px-2.5 py-1 font-semibold text-slate-200 transition hover:bg-white/20 hover:text-white cursor-pointer"
            >
              🌆 Sài Gòn
            </button>
          </div>

          {/* Công tắc Ngày / Đêm */}
          <button
            type="button"
            onClick={() => setIsNight(!isNight)}
            title={isNight ? 'Chuyển sang Ban ngày' : 'Chuyển sang Ban đêm Neon'}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ring-1',
              isNight
                ? 'bg-amber-400/20 text-amber-200 ring-amber-300/40 hover:bg-amber-400/30'
                : 'bg-white/15 text-white ring-white/20 hover:bg-white/25'
            )}
          >
            <Icon name={isNight ? 'light_mode' : 'dark_mode'} className="text-[13px]" />
            <span className="hidden sm:inline">{isNight ? 'Trời sáng' : 'Đêm Neon'}</span>
          </button>

          {/* Cụm Zoom Slider & Nút */}
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-0.5 ring-1 ring-white/15">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
              title="Thu nhỏ bản đồ (40%)"
              className="flex h-6 w-6 items-center justify-center rounded-full text-slate-200 hover:bg-white/20 hover:text-white"
            >
              <Icon name="remove" className="text-[14px]" />
            </button>
            <span className="px-1 font-mono text-[11px] font-bold text-amber-300">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
              title="Phóng to bản đồ (200%)"
              className="flex h-6 w-6 items-center justify-center rounded-full text-slate-200 hover:bg-white/20 hover:text-white"
            >
              <Icon name="add" className="text-[14px]" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(0.75)}
              title="Về tỉ lệ mặc định (Sa bàn 75%)"
              className="rounded-full px-1.5 py-0.5 text-[10px] text-slate-300 hover:bg-white/20"
            >
              Mặc định
            </button>
          </div>

          {/* Nút đóng */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thành phố"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 transition hover:bg-white/25 hover:scale-105 cursor-pointer ml-1"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      </header>

      {/* ===== VÙNG BẢN ĐỒ RỘNG LỚN (2600px x 1600px) CÓ ZOOM & PAN 2 CHIỀU ===== */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={cx(
          'relative flex-1 overflow-auto cursor-grab active:cursor-grabbing transition-colors duration-700',
          isNight
            ? 'bg-gradient-to-b from-[#06030e] via-[#100826] to-[#080414]'
            : 'bg-gradient-to-b from-[#8fd0ea] via-[#cceaf7] to-[#f4f3ff]'
        )}
      >
        <div
          style={{
            width: `${MAP_WIDTH}px`,
            height: `${MAP_HEIGHT}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
          className="relative min-w-[2600px] h-[1600px] shadow-2xl"
        >
          {/* Lớp nền mây trời & ánh sao */}
          {isNight ? (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-12 left-[20%] text-[10px] text-white animate-pulse">✦</div>
              <div className="absolute top-24 left-[45%] text-[14px] text-amber-200 animate-pulse">✦</div>
              <div className="absolute top-16 left-[75%] text-[12px] text-cyan-200 animate-pulse">✦</div>
              <div className="absolute top-[800px] left-[15%] text-[10px] text-purple-200 animate-pulse">✦</div>
              <div className="absolute top-[1200px] right-[25%] text-[12px] text-pink-200 animate-pulse">✦</div>
              <div className="absolute top-10 right-[250px] text-[34px] opacity-80">🌙</div>
            </div>
          ) : (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-10 left-[250px] text-[36px]">☀️</div>
              <div className="absolute top-14 left-[680px] text-[28px] opacity-60">☁️</div>
              <div className="absolute top-20 right-[520px] text-[32px] opacity-70">☁️</div>
              <div className="absolute top-[850px] left-[180px] text-[26px] opacity-50">☁️</div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. KHU VỰC PHÍA BẮC: QUẬN HÀ NỘI (Y: 60px - 580px)                        */}
          {/* ========================================================================= */}
          <div className="absolute top-[60px] left-[100px] w-[2400px] h-[520px]">
            {/* Cổng biển Hà Nội */}
            <div className="absolute top-[10px] left-[30px] flex items-center gap-2 rounded-full bg-rose-900/40 px-3.5 py-1 text-xs font-black text-rose-200 ring-1 ring-rose-400/50 backdrop-blur-md">
              ⛩️ QUẬN HÀ NỘI · THỦ PHỦ SÁNG TẠO PHÍA BẮC (KHO MẪU MIỀN BẮC)
            </div>

            {/* Hồ Gươm, Tháp Rùa & Cầu Thê Húc đỏ son */}
            <div className="absolute top-[70px] left-[80px] flex items-center">
              {/* Mặt hồ Gươm */}
              <div className="relative flex h-[190px] w-[340px] items-center justify-center rounded-[80px] bg-gradient-to-tr from-emerald-600/40 via-teal-500/40 to-cyan-600/30 border-2 border-emerald-400/30 shadow-inner">
                {/* Tháp Rùa Đảo Ngọc */}
                <div className="flex flex-col items-center">
                  <div className="h-4 w-7 rounded-t-sm bg-amber-700 text-[6px] text-amber-200 font-bold flex items-center justify-center">
                    THÁP
                  </div>
                  <div className="h-5 w-9 bg-amber-800 text-[6px] text-amber-300 flex items-center justify-center">
                    RÙA
                  </div>
                  <div className="h-3 w-12 rounded-sm bg-emerald-800 flex items-center justify-center text-[7px] text-white">
                    🐢 Đảo Ngọc
                  </div>
                </div>

                {/* Cầu Thê Húc đỏ son uốn cong */}
                <div className="absolute right-[-45px] top-[40px] flex h-5 w-[85px] rotate-[-25deg] items-center justify-center rounded-t-full bg-red-600 text-[8px] font-bold text-white shadow-md shadow-red-500/40 ring-1 ring-red-300">
                  Cầu Thê Húc
                </div>

                <div className="absolute bottom-2 left-4 text-[10px]">🌿 Liễu rủ</div>
                <div className="absolute top-2 right-6 text-[10px]">🌸 Đào thắm</div>
              </div>
            </div>

            {/* Trạm Cỏ Mềm (Brand mỹ phẩm thiên nhiên xuất mẫu từ Hà Nội) */}
            <div
              onClick={() => setSelectedBrand(brandStations[0])}
              style={{ left: `${brandStations[0].x}px`, top: `${brandStations[0].y}px` }}
              className="absolute z-10 flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-2 group"
            >
              <div className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg animate-bounce">
                🌿 Trạm Cỏ Mềm (35 Mẫu 0đ)
              </div>
              <div className="mt-1 h-5 w-24 rounded-t-lg bg-gradient-to-r from-amber-800 to-amber-900 border-b border-amber-950 text-center text-[8px] font-bold text-amber-200 pt-0.5">
                CỎ MỀM HN
              </div>
              <div className="flex h-24 w-22 flex-col items-center justify-around rounded-b-md bg-amber-100/95 p-1 text-slate-800 ring-2 ring-emerald-500 shadow-xl group-hover:ring-4">
                <span className="text-[20px]">🧴</span>
                <span className="text-[8px] font-bold text-emerald-800 bg-emerald-100 px-1 rounded">Kho Hà Nội</span>
                <span className="text-[8px] font-semibold text-amber-950">Mỹ Phẩm Lành</span>
              </div>
            </div>

            {/* Khu 36 Phố Phường TikTok: Phố Hàng Mẫu, Cà phê Trứng */}
            <div className="absolute top-[280px] left-[780px] flex items-end gap-3">
              <div className="flex flex-col items-center">
                <div className="h-4 w-22 rounded-t-md bg-amber-900 text-[7px] text-amber-200 font-bold flex items-center justify-center">
                  ☕ CÀ PHÊ TRỨNG
                </div>
                <div className="flex h-20 w-18 flex-col items-center justify-center bg-orange-50 p-1 text-slate-800 ring-1 ring-orange-300">
                  <span className="text-[16px]">☕</span>
                  <span className="text-[7px] font-bold text-orange-950">KOC Lounge</span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-4 w-24 rounded-t-md bg-rose-900 text-[7px] text-rose-200 font-bold flex items-center justify-center">
                  🏮 PHỐ HÀNG MẪU
                </div>
                <div className="flex h-22 w-20 flex-col items-center justify-center bg-rose-50 p-1 text-slate-800 ring-1 ring-rose-300">
                  <span className="text-[16px]">📦</span>
                  <span className="text-[7px] font-bold text-rose-950">Nhận Mẫu 0đ</span>
                </div>
              </div>

              {/* Showroom ViSecret Hà Nội */}
              <div
                onClick={() => setSelectedBrand(brandStations[1])}
                className="flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-2 group"
              >
                <div className="h-5 w-24 rounded-t-lg bg-purple-900 text-center text-[8px] font-bold text-purple-200 pt-0.5">
                  VISECRET HN
                </div>
                <div className="flex h-24 w-22 flex-col items-center justify-around rounded-b-md bg-purple-50/95 p-1 text-slate-800 ring-2 ring-purple-500 shadow-xl group-hover:ring-4">
                  <span className="text-[20px]">👗</span>
                  <span className="text-[8px] font-bold text-purple-800 bg-purple-100 px-1 rounded">25 Mẫu</span>
                  <span className="text-[8px] font-semibold text-purple-950">Thời Trang</span>
                </div>
              </div>
            </div>

            {/* Cao ốc Keangnam & Lotte Hà Nội ở xa */}
            <div className="absolute top-[120px] right-[240px] flex items-end gap-3 opacity-80">
              <div className="flex h-44 w-16 flex-col items-center justify-center bg-indigo-900/80 border-t-2 border-indigo-400 text-[8px] text-indigo-200 font-bold">
                🏢 Keangnam
              </div>
              <div className="flex h-36 w-14 flex-col items-center justify-center bg-blue-900/80 border-t-2 border-blue-400 text-[8px] text-blue-200 font-bold">
                🏢 Lotte HN
              </div>
            </div>

            {/* Tuyến đường vỉa hè Hà Nội */}
            <div className="absolute bottom-[40px] left-0 w-full h-[50px] bg-slate-800/90 border-y-2 border-amber-400/40 flex items-center justify-between px-10 text-[9px] text-amber-200/80 font-mono">
              <span>◄ VỈA HÈ PHỐ CỔ HÀ NỘI · LÀN DÀNH CHO NGƯỜI ĐI BỘ & XE ĐẠP KOCITY</span>
              <span>HÀ NỘI EXPRESSWAY ►</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. KHU VỰC TRUNG TÂM: SÔNG GIAO THOA & TRỤ SỞ KOCITY (Y: 580px - 1000px)   */}
          {/* ========================================================================= */}
          <div className="absolute top-[580px] left-0 w-[2600px] h-[440px]">
            {/* Dòng sông xanh giao thoa Bắc - Nam */}
            <div className="absolute inset-0 bg-gradient-to-b from-teal-800/40 via-cyan-700/50 to-indigo-900/50 border-y-4 border-cyan-400/40 flex items-center justify-around text-xs text-white/50 tracking-widest font-mono">
              <span>~ SÔNG HỒNG (HÀ NỘI) ~</span>
              <span>~ TUYẾN GIAO THOA KẾT NỐI BẮC - NAM ~</span>
              <span>~ SÔNG SÀI GÒN (TP.HCM) ~</span>
            </div>

            {/* Chiếc Cầu Kết Nối Sáng Tạo bắc qua sông */}
            <div className="absolute top-[40px] left-[350px] w-[600px] h-[90px] rounded-t-[140px] border-t-4 border-amber-400 bg-gradient-to-b from-amber-400/15 to-transparent flex flex-col items-center justify-end">
              <span className="text-[10px] font-bold text-amber-300 bg-slate-900/90 px-3 py-0.5 rounded-full ring-1 ring-amber-300/40">
                🌉 CẦU ÁNH SÁNG KẾT NỐI BẮC - NAM
              </span>
              <div className="mt-1 h-3 w-full bg-slate-800 border-t border-slate-600 flex items-center justify-between px-4 text-[8px] text-white">
                <span>Làn Xe Máy 🛵</span>
                <span className="font-bold text-pink-400">Tàu KOCity Express 🚄</span>
                <span>Làn Xe Đạp 🚲</span>
              </div>
            </div>

            {/* ĐẠI BẢN DOANH: TRỤ SỞ CHÍNH KOCITY (KOCITY HEADQUARTERS) */}
            <div
              onClick={() => setShowHqModal(true)}
              className="absolute top-[80px] left-[1150px] z-20 flex flex-col items-center cursor-pointer transition-transform hover:scale-105 group"
            >
              <div className="rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 px-3 py-1 text-xs font-black text-white shadow-xl shadow-pink-500/40 ring-2 ring-white animate-pulse">
                👑 TRỤ SỞ CHÍNH KOCITY HQ
              </div>
              <div className="mt-1 text-[9px] font-bold text-amber-300 bg-slate-950/90 px-2 py-0.5 rounded-full ring-1 ring-amber-400/60">
                ⭐ TRẠM ĐỔI XE ĐẠP 🚲 & XE MÁY 🛵 KOCITY
              </div>

              {/* Tòa nhà KOCity Tower lộng lẫy */}
              <div className="mt-1 flex flex-col items-center">
                <div className="h-10 w-28 rounded-t-xl bg-gradient-to-t from-violet-700 via-fuchsia-600 to-pink-500 border-t-2 border-white flex items-center justify-center text-white font-black text-[11px] shadow-2xl">
                  KOCITY HUB
                </div>
                <div className="flex h-36 w-36 flex-col items-center justify-around rounded-b-xl bg-gradient-to-b from-slate-900 to-violet-950 border-2 border-fuchsia-400 p-2 shadow-2xl group-hover:border-amber-300">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    ● Trực Tuyến 24/7
                  </div>
                  <span className="text-[28px] animate-bounce">🏢</span>
                  <div className="text-center">
                    <div className="text-[9px] font-black text-white">KOCITY METAVERSE</div>
                    <div className="text-[8px] text-fuchsia-300">Bấm vào để nhận xe & thăng hạng!</div>
                  </div>
                </div>
              </div>

              {/* Bãi đỗ xe Trụ sở KOCity */}
              <div className="mt-1 flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1 ring-1 ring-amber-400/40 text-[10px]">
                <span>🚲 Xe đạp (1 Job)</span>
                <span>•</span>
                <span>🛵 Xe máy (3 Job)</span>
              </div>
            </div>

            {/* Chiếc Cầu Thứ 2 (Cầu Ba Son hiện đại) sang bờ Sài Gòn */}
            <div className="absolute top-[40px] right-[350px] w-[600px] h-[90px] rounded-t-[140px] border-t-4 border-cyan-400 bg-gradient-to-b from-cyan-400/15 to-transparent flex flex-col items-center justify-end">
              <span className="text-[10px] font-bold text-cyan-300 bg-slate-900/90 px-3 py-0.5 rounded-full ring-1 ring-cyan-300/40">
                🌉 CẦU BA SON SÀI GÒN
              </span>
              <div className="mt-1 h-3 w-full bg-slate-800 border-t border-slate-600 flex items-center justify-between px-4 text-[8px] text-white">
                <span>Sông Sài Gòn</span>
                <span className="font-bold text-amber-300">Làn Tốc Hành 🛵</span>
                <span>Đại Lộ Sài Gòn</span>
              </div>
            </div>

            {/* Đường trục cầu kết nối xuyên suốt */}
            <div className="absolute bottom-[30px] left-0 w-full h-[50px] bg-slate-800/95 border-y-2 border-cyan-400/40 flex items-center justify-between px-10 text-[9px] text-cyan-200/80 font-mono">
              <span>◄ TUYẾN ĐƯỜNG LIÊN THÀNH PHỐ HÀ NỘI ⇄ SÀI GÒN QUA TRỤ SỞ KOCITY ►</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. KHU VỰC PHÍA NAM: QUẬN SÀI GÒN (Y: 1020px - 1560px)                     */}
          {/* ========================================================================= */}
          <div className="absolute top-[1020px] left-[100px] w-[2400px] h-[520px]">
            {/* Cổng biển Sài Gòn */}
            <div className="absolute top-[10px] left-[30px] flex items-center gap-2 rounded-full bg-violet-900/40 px-3.5 py-1 text-xs font-black text-violet-200 ring-1 ring-violet-400/50 backdrop-blur-md">
              🌆 QUẬN SÀI GÒN · ĐÔ THỊ KHÔNG NGỦ & MEGA LIVESTREAM (KHO MẪU MIỀN NAM)
            </div>

            {/* Chợ Bến Thành (Kho Hàng Mẫu 0đ Tốc Hành Sài Gòn) */}
            <div className="absolute top-[80px] left-[80px] flex flex-col items-center">
              <div className="h-8 w-26 rounded-t-xl bg-amber-600 flex flex-col items-center justify-center text-white">
                <span className="text-[7px] font-black">CHỢ BẾN THÀNH</span>
                <div className="h-2.5 w-2.5 rounded-full bg-white text-slate-900 text-[6px] font-bold flex items-center justify-center">
                  🕒
                </div>
              </div>
              <div className="flex h-24 w-24 flex-col items-center justify-around bg-amber-50/95 p-1 ring-2 ring-amber-400 shadow-xl">
                <span className="text-[20px]">📦</span>
                <span className="text-[8px] font-bold text-amber-900">Kho Mẫu SG</span>
                <span className="text-[7px] text-slate-500">Giao Trong 24h</span>
              </div>
            </div>

            {/* Trạm Công Nghệ Tranyoo (Brand tai nghe / công nghệ xuất mẫu từ Sài Gòn) */}
            <div
              onClick={() => setSelectedBrand(brandStations[2])}
              style={{ left: `${brandStations[2].x - 100}px`, top: `${brandStations[2].y - 1020}px` }}
              className="absolute z-10 flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-2 group"
            >
              <div className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg animate-bounce">
                ⚡ Trạm Tranyoo (30 Tai Nghe 0đ)
              </div>
              <div className="mt-1 h-6 w-26 rounded-t-lg bg-blue-900 border-t-2 border-cyan-400 text-center text-[9px] font-black text-cyan-300 pt-0.5">
                TRANYOO SG
              </div>
              <div className="flex h-28 w-24 flex-col items-center justify-around rounded-b-md bg-slate-900/95 p-1 text-white ring-2 ring-blue-500 shadow-2xl group-hover:ring-4">
                <span className="text-[22px]">🎧</span>
                <span className="text-[8px] font-bold text-cyan-300 bg-blue-950 px-1 rounded">Kho Sài Gòn</span>
                <span className="text-[8px] font-semibold text-blue-200">Âm Thanh Gen Z</span>
              </div>
            </div>

            {/* Phố Đi Bộ Nguyễn Huệ & Sân Khấu Creator Plaza */}
            <div className="absolute top-[180px] left-[920px] flex items-end gap-3">
              <div className="flex flex-col items-center">
                <div className="h-5 w-32 rounded-t-lg bg-slate-800 text-center text-[8px] font-bold text-slate-300 pt-0.5">
                  PHỐ ĐI BỘ NGUYỄN HUỆ
                </div>
                <div className="flex h-24 w-32 items-center justify-center gap-2 bg-slate-900/90 p-2 ring-2 ring-indigo-500 shadow-xl">
                  <span className="text-[18px] animate-pulse">💡</span>
                  <div className="text-center">
                    <div className="text-[8px] font-bold text-amber-300">Creator Plaza</div>
                    <div className="text-[7px] text-pink-400">Live TikTok</div>
                  </div>
                  <span className="text-[18px] animate-pulse">💡</span>
                </div>
              </div>

              {/* Showroom Bielenda Sài Gòn */}
              <div
                onClick={() => setSelectedBrand(brandStations[3])}
                className="flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-2 group"
              >
                <div className="h-6 w-26 rounded-t-lg bg-fuchsia-900 text-center text-[8px] font-bold text-fuchsia-100 pt-0.5">
                  BIELENDA SG
                </div>
                <div className="flex h-28 w-24 flex-col items-center justify-around rounded-b-md bg-pink-50/95 p-1 text-slate-800 ring-2 ring-fuchsia-500 shadow-xl group-hover:ring-4">
                  <span className="text-[20px]">✨</span>
                  <span className="text-[8px] font-bold text-fuchsia-800 bg-fuchsia-100 px-1 rounded">42 Mẫu</span>
                  <span className="text-[8px] font-semibold text-fuchsia-950">Dược Mỹ Phẩm</span>
                </div>
              </div>
            </div>

            {/* Tháp Landmark 81 & Bitexco Sài Gòn */}
            <div className="absolute top-[80px] right-[240px] flex items-end gap-4">
              {/* Tháp Bitexco búp sen */}
              <div className="flex h-44 w-20 flex-col items-center justify-around bg-slate-900/90 border-t-2 border-indigo-400 p-1 shadow-2xl">
                <span className="text-[8px] font-bold text-indigo-300">BITEXCO</span>
                <span className="text-[20px]">🏙️</span>
              </div>
              {/* Landmark 81 chọc trời */}
              <div className="flex h-56 w-24 flex-col items-center justify-around bg-gradient-to-t from-slate-900 via-indigo-950 to-violet-700 border-t-4 border-amber-300 p-2 shadow-2xl">
                <div className="text-[7px] font-black text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded">
                  LANDMARK 81
                </div>
                <div className="flex items-center gap-1 text-[8px] font-bold text-pink-400 bg-pink-950/80 px-1.5 py-0.5 rounded-full">
                  🔴 MEGA LIVE
                </div>
                <span className="text-[26px]">⚡</span>
              </div>
            </div>

            {/* Tuyến đường vỉa hè Sài Gòn */}
            <div className="absolute bottom-[40px] left-0 w-full h-[50px] bg-slate-800/90 border-y-2 border-fuchsia-400/40 flex items-center justify-between px-10 text-[9px] text-fuchsia-200/80 font-mono">
              <span>◄ ĐẠI LỘ NGUYỄN HUỆ SÀI GÒN · LÀN DÀNH CHO XE ĐẠP 🚲 & XE MÁY 🛵 KOCITY ►</span>
              <span>SÀI GÒN METRO ►</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. CÁC NHÂN VẬT CƯ DÂN KOC CHIBI (ANIMATED AVATARS + PHƯƠNG TIỆN)          */}
          {/* ========================================================================= */}
          {citizens.map((c) => (
            <div
              key={c.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCitizen(c);
              }}
              style={{ left: `${c.x}px`, top: `${c.y}px` }}
              className="absolute z-30 flex flex-col items-center cursor-pointer transition-transform hover:scale-125"
            >
              {/* Bong bóng thoại (Chat Bubble) */}
              {c.bubble && (
                <div className="relative -top-2 max-w-[170px] rounded-xl bg-white px-2 py-0.5 text-[10px] font-bold text-slate-900 shadow-xl ring-2 ring-pink-500 animate-fade-in text-center leading-snug">
                  {c.bubble}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rotate-45 bg-white ring-r-2 ring-b-2 ring-pink-500" />
                </div>
              )}

              {/* Bảng tên lơ lửng trên đầu (Floating Name Tag) */}
              <div
                className={cx(
                  'flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold shadow-md backdrop-blur-md ring-1 whitespace-nowrap',
                  c.isCurrentUser
                    ? 'bg-amber-400 text-slate-950 ring-white animate-bounce'
                    : isNight
                    ? 'bg-slate-900/90 text-white ring-violet-400/50'
                    : 'bg-white/95 text-slate-900 ring-slate-300'
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{c.name}</span>
                <span className="text-pink-500 font-bold">{c.number}</span>
                {/* Icon phương tiện trên bảng tên */}
                <span>{c.vehicle === 'motorbike' ? '🛵' : c.vehicle === 'bicycle' ? '🚲' : '🚶'}</span>
              </div>

              {/* Thân nhân vật Chibi & Phương tiện tương ứng */}
              <div className="relative mt-0.5 flex flex-col items-center">
                {/* Đầu chibi */}
                <div
                  className={cx(
                    'flex h-8 w-8 items-center justify-center rounded-full text-[14px] shadow-md transition-transform',
                    c.avatarBg
                  )}
                >
                  {c.isCurrentUser ? '👑' : c.city === 'Hà Nội' ? '🌸' : '☕'}
                </div>

                {/* Phương tiện cư dân đang đi */}
                <div className="flex items-center justify-center -mt-1 text-[16px]">
                  {c.vehicle === 'motorbike' ? (
                    <span className="filter drop-shadow-md animate-pulse">🛵</span>
                  ) : c.vehicle === 'bicycle' ? (
                    <span className="filter drop-shadow-md">🚲</span>
                  ) : (
                    <div className="flex gap-1 text-[8px] -mt-0.5">
                      <span>👟</span>
                      <span>👟</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 5. MINIMAP GÓC DƯỚI BÊN PHẢI (BẢN ĐỒ THU NHỎ & ĐỊNH VỊ VIEWPORT) ===== */}
      <div className="absolute bottom-10 right-4 z-30 hidden sm:block">
        <div className="relative w-[190px] h-[120px] rounded-2xl bg-slate-900/90 border-2 border-violet-500/50 p-1.5 shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="text-[8px] font-black tracking-wider text-amber-300 uppercase mb-1 flex items-center justify-between">
            <span>🗺️ BẢN ĐỒ MINIMAP</span>
            <span className="text-emerald-400">● Live</span>
          </div>

          {/* Sơ đồ 3 phân khu */}
          <div className="relative w-full h-[90px] rounded-lg bg-slate-950 border border-white/10 overflow-hidden text-[7px] text-white/50">
            {/* Phân khu Hà Nội */}
            <div
              onClick={() => jumpTo(650, 350)}
              className="h-1/3 bg-rose-950/40 border-b border-rose-500/20 flex items-center justify-between px-1 hover:bg-rose-900/50 cursor-pointer"
            >
              <span>⛩️ HN</span>
              <span className="text-[6px] text-emerald-400">● Cỏ Mềm</span>
            </div>

            {/* Phân khu Trụ sở KOCity & Sông */}
            <div
              onClick={() => jumpTo(1300, 800)}
              className="h-1/3 bg-cyan-950/40 border-b border-cyan-500/20 flex items-center justify-between px-1 hover:bg-cyan-900/50 cursor-pointer"
            >
              <span>🌊 Sông</span>
              <span className="font-bold text-amber-300">🏢 KOCity HQ</span>
            </div>

            {/* Phân khu Sài Gòn */}
            <div
              onClick={() => jumpTo(1300, 1250)}
              className="h-1/3 bg-violet-950/40 flex items-center justify-between px-1 hover:bg-violet-900/50 cursor-pointer"
            >
              <span>🌆 SG</span>
              <span className="text-[6px] text-blue-400">● Tranyoo</span>
            </div>

            {/* Khung định vị Viewport (Camera đang nhìn thấy) */}
            <div
              style={{
                left: `${Math.min(150, Math.max(0, (viewportPos.x / MAP_WIDTH) * 100))}%`,
                top: `${Math.min(65, Math.max(0, (viewportPos.y / MAP_HEIGHT) * 100))}%`,
                width: `${Math.min(100, Math.max(20, (viewportPos.w / MAP_WIDTH) * 100))}%`,
                height: `${Math.min(100, Math.max(20, (viewportPos.h / MAP_HEIGHT) * 100))}%`,
              }}
              className="absolute border-2 border-amber-400 bg-amber-400/20 pointer-events-none rounded-xs transition-all duration-75"
            />
          </div>
        </div>
      </div>

      {/* ===== POPUP CHI TIẾT TRỤ SỞ KOCITY (TRẠM ĐỔI XE & THĂNG CẤP) ===== */}
      {showHqModal && (
        <div
          onClick={() => setShowHqModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-violet-950 p-6 text-white shadow-2xl ring-2 ring-amber-400"
          >
            <button
              type="button"
              onClick={() => setShowHqModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <Icon name="close" className="text-[20px]" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-pink-500 text-[28px] shadow-lg">
                🏢
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Trung Tâm Điều Hành Toàn Thành Phố
                </span>
                <h3 className="font-display text-lg font-black text-white">TRỤ SỞ CHÍNH KOCITY</h3>
                <p className="text-xs text-slate-300">Trạm Đổi Phương Tiện & Vinh Danh KOC</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Tại KOCity, mỗi chiến dịch video review bạn hoàn thành sẽ giúp bạn nâng cấp phương tiện di chuyển khắp thành phố:
              </p>

              {/* 3 Cấp bậc phương tiện */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {/* 1. Đi bộ */}
                <div
                  className={cx(
                    'rounded-2xl p-3 ring-1 transition-all',
                    userVehicle === 'walk'
                      ? 'bg-emerald-950/60 ring-emerald-400 text-emerald-200'
                      : 'bg-white/5 ring-white/10 text-slate-400'
                  )}
                >
                  <span className="text-[24px]">🚶</span>
                  <div className="mt-1 font-bold">Đi bộ</div>
                  <div className="text-[10px]">Tân cư dân (0 job)</div>
                  {userVehicle === 'walk' && <div className="mt-1 text-[9px] text-emerald-400 font-bold">Hiện tại của bạn</div>}
                </div>

                {/* 2. Xe đạp */}
                <div
                  className={cx(
                    'rounded-2xl p-3 ring-1 transition-all',
                    userVehicle === 'bicycle'
                      ? 'bg-amber-950/60 ring-amber-400 text-amber-200'
                      : 'bg-white/5 ring-white/10 text-slate-400'
                  )}
                >
                  <span className="text-[24px]">🚲</span>
                  <div className="mt-1 font-bold">Xe Đạp KOC</div>
                  <div className="text-[10px]">Xong 1 job video</div>
                  {userVehicle === 'bicycle' && <div className="mt-1 text-[9px] text-amber-400 font-bold">Hiện tại của bạn</div>}
                </div>

                {/* 3. Xe máy */}
                <div
                  className={cx(
                    'rounded-2xl p-3 ring-1 transition-all',
                    userVehicle === 'motorbike'
                      ? 'bg-fuchsia-950/60 ring-fuchsia-400 text-fuchsia-200'
                      : 'bg-white/5 ring-white/10 text-slate-400'
                  )}
                >
                  <span className="text-[24px]">🛵</span>
                  <div className="mt-1 font-bold">Xe Máy KOC</div>
                  <div className="text-[10px]">Xong từ 3 job</div>
                  {userVehicle === 'motorbike' && <div className="mt-1 text-[9px] text-fuchsia-400 font-bold">Hiện tại của bạn</div>}
                </div>
              </div>

              {/* Thông tin tiến độ tài khoản */}
              <div className="rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tài khoản:</span>
                  <span className="font-bold text-white">{currentUser?.name || 'Khách vãng lai (Chưa đăng nhập)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số video job đã hoàn thành:</span>
                  <span className="font-bold text-amber-300">{userJobsCount} Job</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phương tiện hiện tại:</span>
                  <span className="font-bold text-emerald-400">
                    {userVehicle === 'motorbike' ? '🛵 Xe Máy Tốc Hành' : userVehicle === 'bicycle' ? '🚲 Xe Đạp Sáng Tạo' : '🚶 Đi Bộ Thong Thả'}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              block
              className="mt-5 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 font-bold"
              onClick={() => setShowHqModal(false)}
            >
              Đã hiểu, quay lại thành phố ✨
            </Button>
          </div>
        </div>
      )}

      {/* ===== POPUP CHI TIẾT CƯ DÂN (KOCITY CITIZEN CARD) ===== */}
      {selectedCitizen && (
        <div
          onClick={() => setSelectedCitizen(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl bg-slate-900 p-6 text-white shadow-2xl ring-2 ring-violet-500/50"
          >
            <button
              type="button"
              onClick={() => setSelectedCitizen(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <Icon name="close" className="text-[20px]" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className={cx('flex h-14 w-14 items-center justify-center rounded-2xl text-[26px] shadow-lg', selectedCitizen.avatarBg)}>
                {selectedCitizen.isCurrentUser ? '👑' : selectedCitizen.city === 'Hà Nội' ? '🌸' : '☕'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-base font-bold text-white">{selectedCitizen.name}</h3>
                  <span className="rounded bg-pink-500/30 px-1.5 py-0.5 text-[10px] font-bold text-pink-300">
                    {selectedCitizen.number}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  📍 Cư dân {selectedCitizen.city} · {selectedCitizen.role}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between rounded-xl bg-white/5 p-2.5">
                <span className="text-slate-400">Phương tiện:</span>
                <span className="font-bold text-amber-300">
                  {selectedCitizen.vehicle === 'motorbike' ? '🛵 Xe Máy (Hoàn thành ≥3 job)' : selectedCitizen.vehicle === 'bicycle' ? '🚲 Xe Đạp (Hoàn thành 1 job)' : '🚶 Đi Bộ (Cư dân mới)'}
                </span>
              </div>
              <div className="flex justify-between rounded-xl bg-white/5 p-2.5">
                <span className="text-slate-400">Trạng thái:</span>
                <span className="font-bold text-emerald-400">🟢 Đang online tại KOCity</span>
              </div>
              <div className="flex justify-between rounded-xl bg-white/5 p-2.5">
                <span className="text-slate-400">Video review đã lên:</span>
                <span className="font-bold text-fuchsia-300">{selectedCitizen.jobsDone} Clip Hoàn Thành</span>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-slate-900 p-6 text-white shadow-2xl ring-2 ring-violet-500/50"
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
                  Trạm Gửi Mẫu Tại {selectedBrand.city}
                </span>
                <h3 className="font-display text-base font-black text-white">{selectedBrand.name}</h3>
                <p className="text-xs text-slate-400">{selectedBrand.category}</p>
              </div>
            </div>

            <p className="mt-3 text-xs italic text-slate-300">
              "{selectedBrand.tagline}"
            </p>

            <div className="mt-3 rounded-2xl bg-violet-950/40 p-3 ring-1 ring-violet-500/30 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Suất mẫu 0đ đang mở tuyển:</span>
                <span className="font-display text-sm font-bold text-emerald-400">
                  {selectedBrand.sampleCount} Suất Mẫu
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {selectedBrand.desc}
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
                Nhận Mẫu 0đ Tại Đây 🎁
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER HƯỚNG DẪN TƯƠNG TÁC ===== */}
      <footer className="flex flex-wrap items-center justify-between border-t border-white/10 bg-slate-950/90 px-4 py-2 text-xs text-slate-400 sm:px-6">
        <div className="flex items-center gap-3 text-[11px]">
          <span>💡 <strong>Lăn chuột:</strong> Zoom từ 40% đến 200%</span>
          <span className="hidden sm:inline">•</span>
          <span><strong>Kéo chuột:</strong> Lướt 360 độ bản đồ</span>
          <span className="hidden sm:inline">•</span>
          <span>Bấm <strong>🏢 Trụ sở KOCity</strong> để xem tiến độ nhận Xe đạp 🚲 / Xe máy 🛵</span>
        </div>
        <div className="text-[10px] text-slate-500">
          KOCity Vast Metaverse v2.0
        </div>
      </footer>
    </div>
  );
};
