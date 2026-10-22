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
  direction: 'left' | 'right';
  speed: number;
  minX: number;
  maxX: number;
  avatarColor: string;
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
  badgeBg: string;
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

const MAP_W = 2800;
const MAP_H = 1700;

export const KocityWorldModal: React.FC<KocityWorldModalProps> = ({
  open,
  onClose,
  campaigns,
  currentUser,
  isNightDefault = false,
  onSelectCampaign,
}) => {
  const [isNight, setIsNight] = useState(isNightDefault);
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: -500, y: -300 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<BrandStation | null>(null);
  const [showHqModal, setShowHqModal] = useState<boolean>(false);

  // Tiến độ của tài khoản người dùng
  const userJobsCount = currentUser?.completedApplications?.length || 0;
  const userVehicle: VehicleType = userJobsCount >= 3 ? 'motorbike' : userJobsCount >= 1 ? 'bicycle' : 'walk';

  // Danh sách các Trạm Brand phân chia theo nguồn gửi mẫu thật
  const brandStations: BrandStation[] = [
    {
      id: 'co-mem-hn',
      name: 'Nhà Rường Cỏ Mềm Homelab',
      brandName: 'Cỏ Mềm',
      city: 'Hà Nội',
      x: 620,
      y: 350,
      category: 'Mỹ phẩm thiên nhiên thuần khiết',
      sampleCount: 35,
      icon: 'spa',
      badgeBg: 'bg-emerald-600',
      tagline: 'Lành sạch thuần Việt · Kho tổng xuất mẫu từ Hà Nội',
      desc: 'Kho Cỏ Mềm tại Hà Nội gửi son dưỡng, bọt rửa mặt, serum rau má 0đ tận nhà cho KOC.',
    },
    {
      id: 'visecret-hn',
      name: 'Boutique Thời Trang ViSecret',
      brandName: 'ViSecret',
      city: 'Hà Nội',
      x: 1820,
      y: 360,
      category: 'Thời trang & Nội y thiết kế',
      sampleCount: 25,
      icon: 'checkroom',
      badgeBg: 'bg-purple-600',
      tagline: 'Kho may mặc Hà Nội · Tôn dáng chuẩn KOC',
      desc: 'Xuất mẫu áo bra tàng hình, đầm thiết kế miễn phí tận nhà cho KOC lên video OOTD.',
    },
    {
      id: 'tranyoo-sg',
      name: 'Showroom Âm Thanh Tranyoo',
      brandName: 'Tranyoo',
      city: 'TP. Hồ Chí Minh',
      x: 720,
      y: 1300,
      category: 'Tai nghe & Phụ kiện Cyberpunk',
      sampleCount: 30,
      icon: 'headphones',
      badgeBg: 'bg-blue-600',
      tagline: 'Kho công nghệ Sài Gòn · Giao tai nghe 0đ trong 24h',
      desc: 'Trụ sở phân phối tai nghe Bluetooth TWS, củ sạc nhanh chuẩn Gen Z.',
    },
    {
      id: 'bielenda-sg',
      name: 'Boutique Dược Mỹ Phẩm Bielenda',
      brandName: 'Bielenda',
      city: 'TP. Hồ Chí Minh',
      x: 1950,
      y: 1310,
      category: 'Dược mỹ phẩm phục hồi da Châu Âu',
      sampleCount: 42,
      icon: 'water_drop',
      badgeBg: 'bg-fuchsia-600',
      tagline: 'Kho nhập khẩu Sài Gòn · Trị mụn & Phục hồi chuyên sâu',
      desc: 'Dòng sản phẩm toner acid, serum peel da được hàng triệu beauty blogger tin dùng.',
    },
  ];

  // Danh sách các Cư dân mẫu với xe đạp, xe máy, đi bộ
  const [citizens, setCitizens] = useState<Citizen[]>([
    {
      id: 'c1',
      name: 'Thu Trang (QA***)',
      city: 'Hà Nội',
      number: '#0089',
      role: 'Cư dân Năng Động',
      jobsDone: 1,
      vehicle: 'bicycle',
      x: 520,
      y: 460,
      direction: 'right',
      speed: 1.6,
      minX: 350,
      maxX: 920,
      avatarColor: '#ec4899',
      bubble: 'Đạp xe qua phố Hàng Mẫu nhận son Cỏ Mềm! 🚲',
    },
    {
      id: 'c2',
      name: 'Tuấn Anh (AnhTuan.Tech)',
      city: 'Hà Nội',
      number: '#0042',
      role: 'KOC Thâm Niên',
      jobsDone: 4,
      vehicle: 'motorbike',
      x: 980,
      y: 470,
      direction: 'left',
      speed: 2.8,
      minX: 750,
      maxX: 1400,
      avatarColor: '#f59e0b',
      bubble: 'Lái xe máy qua Trụ sở KOCity đối soát đơn hàng! 🛵',
    },
    {
      id: 'c3',
      name: 'Linh Chi (ChiChi.Review)',
      city: 'Hà Nội',
      number: '#0156',
      role: 'Tân Cư Dân',
      jobsDone: 0,
      vehicle: 'walk',
      x: 1450,
      y: 450,
      direction: 'right',
      speed: 0.9,
      minX: 1320,
      maxX: 1720,
      avatarColor: '#10b981',
      bubble: 'Cố gắng xong 1 job để đến KOCity HQ nhận xe đạp 🌸',
    },
    {
      id: 'c4',
      name: 'Minh Thư (Thư N.)',
      city: 'TP. Hồ Chí Minh',
      number: '#0125',
      role: 'Creator Triệu View',
      jobsDone: 7,
      vehicle: 'motorbike',
      x: 1620,
      y: 1390,
      direction: 'right',
      speed: 3.0,
      minX: 1300,
      maxX: 2200,
      avatarColor: '#6366f1',
      bubble: 'Lượn phố đi bộ Nguyễn Huệ bằng xe máy KOCity cực đã! 🛵',
    },
    {
      id: 'c5',
      name: 'Huy Hoàng (HoangAudio)',
      city: 'TP. Hồ Chí Minh',
      number: '#0204',
      role: 'KOC Năng Động',
      jobsDone: 2,
      vehicle: 'bicycle',
      x: 880,
      y: 1400,
      direction: 'left',
      speed: 1.5,
      minX: 580,
      maxX: 1150,
      avatarColor: '#06b6d4',
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
      x: 1980,
      y: 1385,
      direction: 'right',
      speed: 0.8,
      minX: 1800,
      maxX: 2180,
      avatarColor: '#d946ef',
      bubble: 'Đang đi bộ qua chợ Bến Thành ngắm đồ OOTD ✨',
    },
    {
      id: 'c7',
      name: 'Phương Linh (LinhReview)',
      city: 'Hà Nội',
      number: '#0078',
      role: 'KOC Năng Động',
      jobsDone: 1,
      vehicle: 'bicycle',
      x: 1320,
      y: 910,
      direction: 'right',
      speed: 1.4,
      minX: 1100,
      maxX: 1550,
      avatarColor: '#f43f5e',
      bubble: 'Đang đạp xe qua Cầu Ánh Sáng sang chi nhánh Sài Gòn! 🌉',
    },
  ]);

  // Thêm nhân vật của currentUser (nếu có tài khoản)
  useEffect(() => {
    if (currentUser?.name) {
      setCitizens((prev) => {
        if (prev.some((c) => c.isCurrentUser)) return prev;
        const userCity: 'Hà Nội' | 'TP. Hồ Chí Minh' =
          currentUser?.address?.toLowerCase().includes('hà nội') || currentUser?.address?.toLowerCase().includes('ha noi')
            ? 'Hà Nội'
            : 'TP. Hồ Chí Minh';
        const startY = userCity === 'Hà Nội' ? 455 : 1395;
        const startX = userCity === 'Hà Nội' ? 740 : 1480;
        const speed = userVehicle === 'motorbike' ? 2.8 : userVehicle === 'bicycle' ? 1.6 : 0.9;

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
            minX: startX - 400,
            maxX: startX + 400,
            avatarColor: '#f59e0b',
            isCurrentUser: true,
            bubble:
              userVehicle === 'motorbike'
                ? 'Đã mở khóa Xe Máy KOCity lướt siêu êm! 🛵💨'
                : userVehicle === 'bicycle'
                ? 'Đang đạp Xe Đạp KOCity đi nhận job 🚲'
                : 'Đang đi bộ, hoàn thành 1 job để nhận xe đạp tại Trụ sở KOCity! 🚶',
          },
          ...prev,
        ];
      });
    }
  }, [currentUser, userJobsCount, userVehicle]);

  // Vòng lặp chuyển động mượt mà của các cư dân
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
    }, 35);
    return () => clearInterval(interval);
  }, [open]);

  // Luân phiên bong bóng thoại vui nhộn
  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => {
      setCitizens((prev) => {
        const randIdx = Math.floor(Math.random() * prev.length);
        const quotes = [
          'Vừa hoàn thành video cho Cỏ Mềm, duyệt nhanh xỉu! ✨',
          'Ghé Trụ sở KOCity nhận xe đạp mới toanh 🚲',
          'Sài Gòn hôm nay nắng đẹp, lên đồ quay TikTok thôi 📸',
          'Trạm Tranyoo vừa về thêm 30 tai nghe 0đ kìa 🎧',
          'Lên video review chân thực để đổi xe máy KOCity nhé! 🛵',
          'Cầu Ánh Sáng Bắc - Nam lung linh quá mọi người ơi! 🌉',
        ];
        return prev.map((c, i) => {
          if (i === randIdx) {
            return { ...c, bubble: quotes[Math.floor(Math.random() * quotes.length)] };
          }
          if (Math.random() > 0.6) return { ...c, bubble: undefined };
          return c;
        });
      });
    }, 5500);
    return () => clearInterval(timer);
  }, [open]);

  // Khi mở modal, định vị camera vào trung tâm
  useEffect(() => {
    if (open && wrapperRef.current) {
      const containerW = wrapperRef.current.clientWidth;
      const containerH = wrapperRef.current.clientHeight;
      setPan({
        x: containerW / 2 - (MAP_W * 0.85) / 2,
        y: containerH / 2 - (MAP_H * 0.85) / 2,
      });
      setZoom(0.85);
    }
  }, [open]);

  // CƠ CHẾ ZOOM LĂN CHUỘT CHUẨN FIGMA / GOOGLE MAPS (ANCHOR ZOOM)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomStep = e.deltaY < 0 ? 1.12 : 0.89;
    const nextZoom = Math.min(Math.max(zoom * zoomStep, 0.4), 2.2);

    // Tính toán lại toạ độ Pan để giữ nguyên điểm con trỏ chuột khi zoom
    const nextPanX = mouseX - (mouseX - pan.x) * (nextZoom / zoom);
    const nextPanY = mouseY - (mouseY - pan.y) * (nextZoom / zoom);

    setZoom(Number(nextZoom.toFixed(3)));
    setPan({ x: Number(nextPanX.toFixed(1)), y: Number(nextPanY.toFixed(1)) });
  };

  // KÉO CHUỘT TỰ DO 360 ĐỘ (SMOOTH PAN)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Nhảy camera nhanh đến địa điểm
  const jumpTo = (targetMapX: number, targetMapY: number) => {
    if (!wrapperRef.current) return;
    const containerW = wrapperRef.current.clientWidth;
    const containerH = wrapperRef.current.clientHeight;
    setPan({
      x: containerW / 2 - targetMapX * zoom,
      y: containerH / 2 - targetMapY * zoom,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070410] text-white select-none backdrop-blur-2xl animate-fade-in">
      {/* ===== HEADER ĐIỀU KHIỂN SA BÀN ===== */}
      <header className="relative z-30 flex flex-wrap items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-2.5 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-violet-600 text-[20px] shadow-lg shadow-pink-500/25">
            🏙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-black tracking-tight text-white sm:text-base">
                KOCITY SA BÀN MINH HỌA (HÀ NỘI & SÀI GÒN)
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/40">
                ● 1,280 Cư Dân Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Lăn bánh xe chuột để Zoom mượt mà · Kéo thả chuột để dạo quanh khắp phố
            </p>
          </div>
        </div>

        {/* Cụm nút di chuyển nhanh & Zoom & Day/Night */}
        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15 text-xs">
            <button
              type="button"
              onClick={() => jumpTo(700, 420)}
              className="rounded-full px-3 py-1 font-semibold text-slate-200 transition hover:bg-white/20 hover:text-white cursor-pointer"
            >
              ⛩️ Hà Nội
            </button>
            <button
              type="button"
              onClick={() => jumpTo(1400, 850)}
              className="rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-3 py-1 font-black text-white shadow-md transition hover:opacity-90 ring-1 ring-amber-300/40 cursor-pointer"
            >
              🏢 Trụ sở KOCity
            </button>
            <button
              type="button"
              onClick={() => jumpTo(1400, 1350)}
              className="rounded-full px-3 py-1 font-semibold text-slate-200 transition hover:bg-white/20 hover:text-white cursor-pointer"
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
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ring-1',
              isNight
                ? 'bg-amber-400/20 text-amber-200 ring-amber-300/40 hover:bg-amber-400/30'
                : 'bg-white/15 text-white ring-white/20 hover:bg-white/25'
            )}
          >
            <Icon name={isNight ? 'light_mode' : 'dark_mode'} className="text-[14px]" />
            <span className="hidden sm:inline">{isNight ? 'Trời sáng' : 'Đêm Neon'}</span>
          </button>

          {/* Cụm Zoom Slider & Nút */}
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1 ring-1 ring-white/15">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
              title="Thu nhỏ bản đồ (40%)"
              className="flex h-6 w-6 items-center justify-center rounded-full text-slate-200 hover:bg-white/20 hover:text-white cursor-pointer"
            >
              <Icon name="remove" className="text-[14px]" />
            </button>
            <span className="font-mono text-xs font-bold text-amber-300 min-w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.15).toFixed(2))))}
              title="Phóng to bản đồ (220%)"
              className="flex h-6 w-6 items-center justify-center rounded-full text-slate-200 hover:bg-white/20 hover:text-white cursor-pointer"
            >
              <Icon name="add" className="text-[14px]" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(0.85);
                jumpTo(1400, 850);
              }}
              title="Về tỉ lệ mặc định"
              className="rounded-full px-2 py-0.5 text-[10px] text-slate-300 hover:bg-white/20 cursor-pointer ml-1"
            >
              Mặc định
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

      {/* ===== KHÔNG GIAN BẢN ĐỒ VIRTUAL CANVAS (KHÔNG THANH CUỘN GIẬT LAG) ===== */}
      <div
        ref={wrapperRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={cx(
          'relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing transition-colors duration-700',
          isNight
            ? 'bg-radial-[at_50%_40%] from-[#150a2e] via-[#090416] to-[#04020a]'
            : 'bg-radial-[at_50%_40%] from-[#c6e9fa] via-[#e2f1f8] to-[#f4f2ff]'
        )}
      >
        {/* Lớp biến đổi toạ độ Zoom & Pan mượt mà */}
        <div
          style={{
            width: `${MAP_W}px`,
            height: `${MAP_H}px`,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
          className="relative pointer-events-auto will-change-transform"
        >
          {/* ========================================================================= */}
          {/* LỚP NỀN NGHỆ THUẬT: BẦU TRỜI, DÒNG SÔNG & CÁC CÔNG TRÌNH BIỂU TƯỢNG SVG     */}
          {/* ========================================================================= */}
          <svg
            width={MAP_W}
            height={MAP_H}
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="absolute inset-0 pointer-events-none"
          >
            <defs>
              {/* Gradient Sông Hồng & Sài Gòn */}
              <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isNight ? '#09253d' : '#22d3ee'} stopOpacity="0.8" />
                <stop offset="50%" stopColor={isNight ? '#164e63' : '#38bdf8'} stopOpacity="0.85" />
                <stop offset="100%" stopColor={isNight ? '#0c4a6e' : '#0ea5e9'} stopOpacity="0.8" />
              </linearGradient>

              {/* Gradient Cầu Ánh Sáng */}
              <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>

              {/* Mái ngói rêu phong Hà Nội */}
              <pattern id="tileHanoi" width="16" height="8" patternUnits="userSpaceOnUse">
                <path d="M 0,0 Q 8,6 16,0" fill="none" stroke={isNight ? '#5c1d09' : '#9a3412'} strokeWidth="1.2" />
              </pattern>

              {/* Kính cao ốc Landmark 81 */}
              <linearGradient id="landmarkGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isNight ? '#38bdf8' : '#e0f2fe'} stopOpacity="0.95" />
                <stop offset="50%" stopColor={isNight ? '#1e40af' : '#60a5fa'} stopOpacity="0.9" />
                <stop offset="100%" stopColor={isNight ? '#1e1b4b' : '#2563eb'} stopOpacity="0.95" />
              </linearGradient>
            </defs>

            {/* ----- 1. DÒNG SÔNG GIAO THOA UỐN LƯỢN (Y: 650 - 1050) ----- */}
            <path
              d="
                M 0,720
                C 400,680 800,780 1200,750
                C 1600,720 2000,820 2800,760
                L 2800,1050
                C 2200,1080 1800,980 1400,1020
                C 1000,1060 500,960 0,1010
                Z
              "
              fill="url(#riverGrad)"
            />

            {/* Sóng nước phản chiếu */}
            <g stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity={isNight ? 0.35 : 0.6}>
              <path d="M 200,800 Q 250,795 300,800 M 500,850 Q 550,845 600,850" />
              <path d="M 900,820 Q 950,815 1000,820 M 1700,860 Q 1750,855 1800,860" />
              <path d="M 2200,830 Q 2250,825 2300,830 M 2500,900 Q 2550,895 2600,900" />
            </g>

            {/* Cù lao trung tâm (Đảo KOCity Hub) */}
            <path
              d="
                M 1150,820
                C 1250,780 1550,780 1650,820
                C 1720,860 1700,940 1600,970
                C 1480,1000 1280,1000 1200,970
                C 1120,930 1100,850 1150,820
                Z
              "
              fill={isNight ? '#1e1145' : '#e0e7ff'}
              stroke={isNight ? '#a855f7' : '#818cf8'}
              strokeWidth="3"
            />

            {/* Nhịp Cầu Ánh Sáng vòm thép nối 2 bờ */}
            <path
              d="M 1050,740 Q 1200,690 1350,810"
              fill="none"
              stroke="url(#bridgeGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 1450,970 Q 1600,1090 1750,1040"
              fill="none"
              stroke="url(#bridgeGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* ----- 2. HỒ GƯƠM & THÁP RÙA HÀ NỘI (X: 120 - 480, Y: 180 - 420) ----- */}
            {/* Mặt hồ Gươm */}
            <ellipse
              cx="320"
              cy="280"
              rx="180"
              ry="110"
              fill={isNight ? '#064e3b' : '#34d399'}
              fillOpacity={isNight ? 0.45 : 0.4}
              stroke={isNight ? '#059669' : '#10b981'}
              strokeWidth="2.5"
            />
            {/* Đảo Ngọc Tháp Rùa */}
            <ellipse cx="320" cy="275" rx="42" ry="24" fill={isNight ? '#065f46' : '#6ee7b7'} />
            {/* Tháp Rùa 3 tầng cổ kính */}
            <g transform="translate(320, 270)">
              {/* Tầng 1: 3 vòm cửa */}
              <rect x="-24" y="-18" width="48" height="18" rx="2" fill="#d97706" stroke="#78350f" strokeWidth="1" />
              <path d="M -16,0 A 4,4 0 0,1 -8,0 M -4,0 A 4,4 0 0,1 4,0 M 8,0 A 4,4 0 0,1 16,0" fill="#78350f" />
              {/* Mái tầng 1 */}
              <path d="M -28,-18 Q 0,-24 28,-18" fill="none" stroke="#78350f" strokeWidth="2.5" />
              {/* Tầng 2 */}
              <rect x="-16" y="-30" width="32" height="13" rx="1.5" fill="#b45309" stroke="#78350f" strokeWidth="1" />
              <path d="M -10,-17 A 3,3 0 0,1 -4,-17 M 4,-17 A 3,3 0 0,1 10,-17" fill="#78350f" />
              {/* Mái tầng 2 */}
              <path d="M -20,-30 Q 0,-35 20,-30" fill="none" stroke="#78350f" strokeWidth="2" />
              {/* Tầng 3 chóp nhọn */}
              <polygon points="0,-44 -10,-32 10,-32" fill="#92400e" stroke="#78350f" strokeWidth="1" />
              <circle cx="0" cy="-45" r="2" fill="#fef08a" />
            </g>

            {/* Cầu Thê Húc đỏ son uốn cong dẫn ra đảo */}
            <path
              d="M 440,240 Q 480,265 520,300"
              fill="none"
              stroke="#dc2626"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Trụ cầu và lan can đỏ */}
            <path
              d="M 440,238 Q 480,263 520,298"
              fill="none"
              stroke="#fca5a5"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Cây liễu rủ ven hồ */}
            <g stroke={isNight ? '#047857' : '#059669'} strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
              <path d="M 180,220 Q 160,250 170,280 M 180,220 Q 185,255 180,285" />
              <path d="M 460,350 Q 440,370 450,390 M 460,350 Q 475,375 470,395" />
            </g>

            {/* ----- 3. CHỢ BẾN THÀNH SÀI GÒN (X: 120 - 450, Y: 1150 - 1380) ----- */}
            <g transform="translate(260, 1260)">
              {/* Thân chợ Bến Thành */}
              <rect x="-80" y="0" width="160" height="70" fill={isNight ? '#451a03' : '#fef3c7'} stroke="#d97706" strokeWidth="2" rx="4" />
              {/* 3 Cửa vòm chợ */}
              <path d="M -55,70 A 15,15 0 0,1 -25,70 M -15,70 A 15,15 0 0,1 15,70 M 25,70 A 15,15 0 0,1 55,70" fill={isNight ? '#1e293b' : '#78350f'} />
              {/* Mái ngói chữ nhật tam giác cổ điển */}
              <polygon points="0,-45 -45,0 45,0" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
              {/* Tháp đồng hồ 4 mặt Bến Thành */}
              <rect x="-22" y="-35" width="44" height="35" fill="#fef9c3" stroke="#b45309" strokeWidth="1.5" />
              <circle cx="0" cy="-18" r="9" fill="#ffffff" stroke="#78350f" strokeWidth="1.5" />
              {/* Kim đồng hồ */}
              <line x1="0" y1="-18" x2="0" y2="-23" stroke="#78350f" strokeWidth="1.5" />
              <line x1="0" y1="-18" x2="4" y2="-18" stroke="#78350f" strokeWidth="1.5" />
              <text x="0" y="-38" textAnchor="middle" fill="#fef08a" fontSize="8" fontWeight="bold">CHỢ BẾN THÀNH</text>
            </g>

            {/* ----- 4. TOÀ THÁP LANDMARK 81 & BITEXCO (X: 2250 - 2550, Y: 1100 - 1500) ----- */}
            {/* Landmark 81 vươn cao với các vệt kính phản quang */}
            <g transform="translate(2450, 1150)">
              {/* Thân tháp bậc thang bó tre */}
              <rect x="-35" y="100" width="70" height="220" fill="url(#landmarkGlass)" rx="3" />
              <rect x="-26" y="20" width="52" height="160" fill="url(#landmarkGlass)" rx="2" />
              <rect x="-18" y="-70" width="36" height="150" fill="url(#landmarkGlass)" rx="2" />
              <rect x="-10" y="-150" width="20" height="120" fill="url(#landmarkGlass)" rx="1.5" />
              {/* Kim phát sóng chọc trời */}
              <line x1="0" y1="-150" x2="0" y2="-220" stroke="#f43f5e" strokeWidth="3" />
              <circle cx="0" cy="-220" r="4" fill="#fb7185" className="animate-ping" />
              {/* Vệt sáng LED neon ban đêm */}
              <line x1="-35" y1="180" x2="35" y2="180" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
              <line x1="-26" y1="90" x2="26" y2="90" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
              <line x1="-18" y1="0" x2="18" y2="0" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
              <text x="0" y="-235" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="black">LANDMARK 81</text>
            </g>

            {/* Tháp Bitexco búp sen có sân trực thăng vươn ra */}
            <g transform="translate(2250, 1280)">
              {/* Thân tháp cong mềm */}
              <path
                d="M -25,180 Q -15,0 0,-70 Q 15,0 25,180 Z"
                fill="url(#landmarkGlass)"
                stroke="#60a5fa"
                strokeWidth="1.5"
              />
              {/* Sân đỗ trực thăng vươn ra ở tầng 52 */}
              <ellipse cx="-22" cy="20" rx="18" ry="6" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
              <text x="-22" y="23" textAnchor="middle" fill="#78350f" fontSize="6" fontWeight="bold">H</text>
              <text x="0" y="-85" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="bold">BITEXCO</text>
            </g>

            {/* Tuyến đường phố lát đá Hà Nội (Y: 480 - 540) */}
            <rect x="0" y="480" width={MAP_W} height="60" fill={isNight ? '#1e1438' : '#e2e8f0'} />
            <line x1="0" y1="510" x2={MAP_W} y2="510" stroke={isNight ? '#9333ea' : '#cbd5e1'} strokeWidth="2" strokeDasharray="16 16" />

            {/* Tuyến đường đại lộ Sài Gòn (Y: 1410 - 1470) */}
            <rect x="0" y="1410" width={MAP_W} height="60" fill={isNight ? '#1e1438' : '#e2e8f0'} />
            <line x1="0" y1="1440" x2={MAP_W} y2="1440" stroke={isNight ? '#f43f5e' : '#cbd5e1'} strokeWidth="2" strokeDasharray="16 16" />
          </svg>

          {/* ========================================================================= */}
          {/* CÁC ĐỊA DANH KIẾN TRÚC & TRẠM BRAND CHI TIẾT (INTERACTIVE VECTOR CARDS)     */}
          {/* ========================================================================= */}

          {/* 1. TRẠM CỎ MỀM HÀ NỘI (Nhà Rường Mộc Mạc Thuần Việt) */}
          <div
            onClick={() => setSelectedBrand(brandStations[0])}
            style={{ left: `${brandStations[0].x}px`, top: `${brandStations[0].y}px` }}
            className="absolute z-20 flex flex-col items-center cursor-pointer transition-transform hover:scale-105 group"
          >
            <div className="rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-black text-white shadow-lg animate-bounce ring-2 ring-emerald-300">
              🌿 Trạm Mẫu Cỏ Mềm (35 Suất 0đ)
            </div>
            {/* Nhà ngói rêu phong Cỏ Mềm */}
            <div className="mt-1 flex flex-col items-center">
              <div className="h-6 w-32 rounded-t-xl bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 border-b-2 border-amber-950 flex items-center justify-center text-amber-200 text-[10px] font-black shadow-md">
                CỎ MỀM HOMELAB
              </div>
              <div className="flex h-28 w-28 flex-col items-center justify-between rounded-b-xl bg-gradient-to-b from-amber-50 to-emerald-50/80 p-2 text-slate-800 ring-2 ring-emerald-500 shadow-xl group-hover:ring-4 group-hover:ring-emerald-400">
                <span className="text-[26px]">🧴</span>
                <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[9px] font-bold text-white">
                  Kho Tổng Hà Nội
                </span>
                <span className="text-[10px] font-bold text-emerald-950">Mỹ Phẩm Thiên Nhiên</span>
              </div>
            </div>
          </div>

          {/* 2. SHOWROOM VISECRET HÀ NỘI */}
          <div
            onClick={() => setSelectedBrand(brandStations[1])}
            style={{ left: `${brandStations[1].x}px`, top: `${brandStations[1].y}px` }}
            className="absolute z-20 flex flex-col items-center cursor-pointer transition-transform hover:scale-105 group"
          >
            <div className="rounded-full bg-purple-600 px-3 py-0.5 text-xs font-black text-white shadow-lg ring-2 ring-purple-300">
              👗 Showroom ViSecret (25 Mẫu 0đ)
            </div>
            <div className="mt-1 flex flex-col items-center">
              <div className="h-6 w-30 rounded-t-xl bg-purple-950 border-b-2 border-purple-800 flex items-center justify-center text-purple-200 text-[10px] font-black shadow-md">
                VISECRET BOUTIQUE
              </div>
              <div className="flex h-28 w-26 flex-col items-center justify-between rounded-b-xl bg-gradient-to-b from-purple-50 to-pink-50 p-2 text-slate-800 ring-2 ring-purple-500 shadow-xl group-hover:ring-4">
                <span className="text-[26px]">👗</span>
                <span className="rounded-full bg-purple-700 px-2 py-0.5 text-[9px] font-bold text-white">
                  Kho May Mặc HN
                </span>
                <span className="text-[10px] font-bold text-purple-950">Thời Trang Tôn Dáng</span>
              </div>
            </div>
          </div>

          {/* 3. TRỤ SỞ CHÍNH KOCITY HQ (TRUNG TÂM GIAO THOA CẢ 2 MIỀN) */}
          <div
            onClick={() => setShowHqModal(true)}
            style={{ left: '1240px', top: '720px' }}
            className="absolute z-20 flex flex-col items-center cursor-pointer transition-transform hover:scale-105 group"
          >
            <div className="rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 px-4 py-1 text-xs font-black text-white shadow-xl shadow-pink-500/40 ring-2 ring-white animate-pulse">
              👑 TRỤ SỞ CHÍNH KOCITY
            </div>
            <div className="mt-1 text-[10px] font-black text-amber-300 bg-slate-950/90 px-3 py-0.5 rounded-full ring-1 ring-amber-400">
              ⭐ ĐỔI XE ĐẠP 🚲 & XE MÁY 🛵 KOCITY
            </div>

            {/* Toà tháp Pha Lê KOCity */}
            <div className="mt-1 flex flex-col items-center">
              <div className="h-10 w-36 rounded-t-2xl bg-gradient-to-t from-violet-700 via-fuchsia-600 to-pink-500 border-t-2 border-white flex items-center justify-center text-white font-black text-xs shadow-2xl">
                KOCITY METAVERSE
              </div>
              <div className="flex h-40 w-44 flex-col items-center justify-around rounded-b-2xl bg-gradient-to-b from-slate-900 to-violet-950 border-2 border-fuchsia-400 p-2.5 shadow-2xl group-hover:border-amber-300">
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full">
                  ● Trực Tuyến 24/7
                </div>
                <span className="text-[36px] animate-bounce">🏢</span>
                <div className="text-center">
                  <div className="text-[10px] font-black text-amber-300">ĐẠI BẢN DOANH CREATOR</div>
                  <div className="text-[9px] text-fuchsia-300 font-semibold">Bấm vào để nhận xe & thăng hạng!</div>
                </div>
              </div>
            </div>

            {/* Bãi đỗ xe Trụ sở KOCity */}
            <div className="mt-1.5 flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1 ring-1 ring-amber-400/40 text-xs">
              <span className="text-amber-300 font-bold">🚲 1 Job: Xe Đạp</span>
              <span className="text-white/40">•</span>
              <span className="text-fuchsia-400 font-bold">🛵 3 Job: Xe Máy</span>
            </div>
          </div>

          {/* 4. TRẠM TRANYOO SÀI GÒN (Công Nghệ Âm Thanh) */}
          <div
            onClick={() => setSelectedBrand(brandStations[2])}
            style={{ left: `${brandStations[2].x}px`, top: `${brandStations[2].y}px` }}
            className="absolute z-20 flex flex-col items-center cursor-pointer transition-transform hover:scale-105 group"
          >
            <div className="rounded-full bg-blue-600 px-3 py-0.5 text-xs font-black text-white shadow-lg animate-bounce ring-2 ring-cyan-300">
              ⚡ Trạm Tranyoo (30 Tai Nghe 0đ)
            </div>
            <div className="mt-1 flex flex-col items-center">
              <div className="h-6 w-32 rounded-t-xl bg-blue-950 border-t-2 border-cyan-400 flex items-center justify-center text-cyan-300 text-[10px] font-black shadow-md">
                TRANYOO CYBER
              </div>
              <div className="flex h-28 w-28 flex-col items-center justify-between rounded-b-xl bg-slate-900/95 p-2 text-white ring-2 ring-blue-500 shadow-xl group-hover:ring-4 group-hover:ring-cyan-300">
                <span className="text-[26px]">🎧</span>
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white">
                  Kho Tổng Sài Gòn
                </span>
                <span className="text-[10px] font-bold text-cyan-300">Âm Thanh Gen Z</span>
              </div>
            </div>
          </div>

          {/* 5. BOUTIQUE BIELENDA SÀI GÒN */}
          <div
            onClick={() => setSelectedBrand(brandStations[3])}
            style={{ left: `${brandStations[3].x}px`, top: `${brandStations[3].y}px` }}
            className="absolute z-20 flex flex-col items-center cursor-pointer transition-transform hover:scale-105 group"
          >
            <div className="rounded-full bg-fuchsia-600 px-3 py-0.5 text-xs font-black text-white shadow-lg ring-2 ring-pink-300">
              ✨ Boutique Bielenda (42 Mẫu 0đ)
            </div>
            <div className="mt-1 flex flex-col items-center">
              <div className="h-6 w-32 rounded-t-xl bg-fuchsia-950 border-t-2 border-pink-400 flex items-center justify-center text-pink-200 text-[10px] font-black shadow-md">
                BIELENDA PARIS
              </div>
              <div className="flex h-28 w-28 flex-col items-center justify-between rounded-b-xl bg-pink-50/95 p-2 text-slate-800 ring-2 ring-fuchsia-500 shadow-xl group-hover:ring-4">
                <span className="text-[26px]">✨</span>
                <span className="rounded-full bg-fuchsia-600 px-2 py-0.5 text-[9px] font-bold text-white">
                  Kho Nhập Khẩu SG
                </span>
                <span className="text-[10px] font-bold text-fuchsia-950">Dược Mỹ Phẩm</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CÁC CƯ DÂN KOC CHIBI (ANIMATED AVATARS + XE ĐẠP 🚲 / XE MÁY 🛵)            */}
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
                <div className="relative -top-2 max-w-[190px] rounded-xl bg-white px-2.5 py-1 text-[10px] font-bold text-slate-900 shadow-xl ring-2 ring-pink-500 animate-fade-in text-center leading-snug">
                  {c.bubble}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-white ring-r-2 ring-b-2 ring-pink-500" />
                </div>
              )}

              {/* Bảng tên lơ lửng trên đầu (Floating Name Tag) */}
              <div
                className={cx(
                  'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shadow-md backdrop-blur-md ring-1 whitespace-nowrap',
                  c.isCurrentUser
                    ? 'bg-amber-400 text-slate-950 ring-white animate-bounce'
                    : isNight
                    ? 'bg-slate-900/90 text-white ring-violet-400/50'
                    : 'bg-white/95 text-slate-900 ring-slate-300'
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{c.name}</span>
                <span className="text-pink-500 font-extrabold">{c.number}</span>
                <span>{c.vehicle === 'motorbike' ? '🛵' : c.vehicle === 'bicycle' ? '🚲' : '🚶'}</span>
              </div>

              {/* Nhân vật Chibi và Phương tiện */}
              <div className="relative mt-0.5 flex flex-col items-center">
                {/* Đầu chibi */}
                <div
                  style={{ backgroundColor: c.avatarColor }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[16px] shadow-lg text-white font-bold"
                >
                  {c.isCurrentUser ? '👑' : c.city === 'Hà Nội' ? '🌸' : '☕'}
                </div>

                {/* Phương tiện xe đạp / xe máy / bước chân */}
                <div className="flex items-center justify-center -mt-1 text-[20px]">
                  {c.vehicle === 'motorbike' ? (
                    <span className="filter drop-shadow-md animate-pulse">🛵</span>
                  ) : c.vehicle === 'bicycle' ? (
                    <span className="filter drop-shadow-md">🚲</span>
                  ) : (
                    <div className="flex gap-1 text-[10px]">
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

      {/* ===== MINIMAP THU NHỎ Ở GÓC DƯỚI BÊN PHẢI ===== */}
      <div className="absolute bottom-11 right-4 z-30 hidden sm:block">
        <div className="relative w-[200px] h-[130px] rounded-2xl bg-slate-900/90 border-2 border-violet-500/50 p-2 shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="text-[9px] font-black tracking-wider text-amber-300 uppercase mb-1 flex items-center justify-between">
            <span>🗺️ MINIMAP KOCITY</span>
            <span className="text-emerald-400 font-mono">● LIVE</span>
          </div>

          <div className="relative w-full h-[95px] rounded-lg bg-slate-950 border border-white/10 overflow-hidden text-[8px] text-white/70">
            {/* Phân khu Hà Nội */}
            <div
              onClick={() => jumpTo(700, 420)}
              className="h-1/3 bg-rose-950/40 border-b border-rose-500/20 flex items-center justify-between px-2 hover:bg-rose-900/50 cursor-pointer"
            >
              <span>⛩️ Quận Hà Nội</span>
              <span className="text-emerald-400">● Cỏ Mềm</span>
            </div>

            {/* Phân khu Trụ sở KOCity */}
            <div
              onClick={() => jumpTo(1400, 850)}
              className="h-1/3 bg-cyan-950/40 border-b border-cyan-500/20 flex items-center justify-between px-2 hover:bg-cyan-900/50 cursor-pointer"
            >
              <span>🌊 Sông & Cầu</span>
              <span className="font-bold text-amber-300">🏢 KOCity HQ</span>
            </div>

            {/* Phân khu Sài Gòn */}
            <div
              onClick={() => jumpTo(1400, 1350)}
              className="h-1/3 bg-violet-950/40 flex items-center justify-between px-2 hover:bg-violet-900/50 cursor-pointer"
            >
              <span>🌆 Quận Sài Gòn</span>
              <span className="text-blue-400">● Tranyoo</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== POPUP CHI TIẾT TRỤ SỞ KOCITY (TRẠM ĐỔI XE ĐẠP / XE MÁY) ===== */}
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
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
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
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <Icon name="close" className="text-[20px]" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div
                style={{ backgroundColor: selectedCitizen.avatarColor }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-[26px] shadow-lg text-white font-bold"
              >
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
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <Icon name="close" className="text-[20px]" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className={cx('flex h-14 w-14 items-center justify-center rounded-2xl text-[26px] text-white shadow-lg', selectedBrand.badgeBg)}>
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
                className="flex-1 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                onClick={() => setSelectedBrand(null)}
              >
                Đóng
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 font-bold cursor-pointer"
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
          <span>💡 <strong>Lăn chuột:</strong> Zoom mượt mà vào vị trí con trỏ (40% - 220%)</span>
          <span className="hidden sm:inline">•</span>
          <span><strong>Kéo chuột:</strong> Lướt 360 độ bản đồ</span>
          <span className="hidden sm:inline">•</span>
          <span>Bấm <strong>🏢 Trụ sở KOCity</strong> để nhận Xe đạp 🚲 / Xe máy 🛵</span>
        </div>
        <div className="text-[10px] text-slate-500">
          KOCity Illustrated Vector Map v3.0
        </div>
      </footer>
    </div>
  );
};
