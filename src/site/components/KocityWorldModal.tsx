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

interface BrandStation {
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

  // Tiến độ của tài khoản người dùng
  const userJobsCount = currentUser?.completedApplications?.length || 0;
  const userVehicle: VehicleType = userJobsCount >= 3 ? 'motorbike' : userJobsCount >= 1 ? 'bicycle' : 'walk';

  // Chu kỳ đèn giao thông ngã tư thông minh
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setTrafficTimer((prev) => {
        if (prev > 1) return prev - 1;
        setTrafficLight((current) => {
          if (current === 'green') {
            setTrafficTimer(2);
            return 'yellow';
          }
          if (current === 'yellow') {
            setTrafficTimer(6);
            return 'red';
          }
          setTrafficTimer(8);
          return 'green';
        });
        return 8;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open]);

  // Danh sách các Brand chia theo từng phố ngành hàng
  const brandStations: BrandStation[] = [
    // --- PHỐ MỸ PHẨM & SKINCARE ---
    {
      id: 'co-mem',
      name: 'Trạm Cỏ Mềm Greenlab',
      brandName: 'Cỏ Mềm',
      streetName: 'Phố Mỹ Phẩm & Skincare',
      x: 1980,
      y: 380,
      category: 'Mỹ phẩm thiên nhiên thuần khiết',
      sampleCount: 35,
      icon: 'spa',
      badgeBg: 'bg-emerald-600',
      badgeEmoji: '🌿',
      tagline: 'Lành sạch thuần Việt · Kho tổng xuất mẫu từ Hà Nội',
      desc: 'Kho Cỏ Mềm gửi son dưỡng, bọt rửa mặt, serum rau má 0đ tận nhà cho KOC lên video trải nghiệm.',
    },
    {
      id: 'bielenda',
      name: 'Boutique Bielenda Skin House',
      brandName: 'Bielenda',
      streetName: 'Phố Mỹ Phẩm & Skincare',
      x: 2360,
      y: 380,
      category: 'Dược mỹ phẩm Châu Âu',
      sampleCount: 42,
      icon: 'water_drop',
      badgeBg: 'bg-fuchsia-600',
      badgeEmoji: '✨',
      tagline: 'Kho nhập khẩu Sài Gòn · Trị mụn & Phục hồi chuyên sâu',
      desc: 'Dòng sản phẩm toner acid, serum peel da được hàng triệu beauty blogger tin dùng.',
    },

    // --- PHỐ THỜI TRANG & OOTD ---
    {
      id: 'visecret',
      name: 'Showroom Thời Trang ViSecret',
      brandName: 'ViSecret',
      streetName: 'Phố Thời Trang & OOTD',
      x: 2080,
      y: 840,
      category: 'Thời trang & Nội y thiết kế',
      sampleCount: 25,
      icon: 'checkroom',
      badgeBg: 'bg-purple-600',
      badgeEmoji: '👗',
      tagline: 'Kho may mặc Hà Nội · Tôn dáng chuẩn KOC',
      desc: 'Xuất mẫu áo bra tàng hình, đầm thiết kế miễn phí tận nhà cho KOC lên video biến hình OOTD.',
    },

    // --- PHỐ CÔNG NGHỆ & GAMING ---
    {
      id: 'tranyoo',
      name: 'Flagship Tranyoo Cyber Arena',
      brandName: 'Tranyoo',
      streetName: 'Phố Công Nghệ & Live Commerce',
      x: 2180,
      y: 1280,
      category: 'Tai nghe & Phụ kiện Cyberpunk',
      sampleCount: 30,
      icon: 'headphones',
      badgeBg: 'bg-blue-600',
      badgeEmoji: '🎧',
      tagline: 'Kho công nghệ Sài Gòn · Giao tai nghe 0đ trong 24h',
      desc: 'Trụ sở phân phối tai nghe Bluetooth TWS, củ sạc nhanh chuẩn Gen Z cho creator livestream.',
    },
  ];

  // Danh sách các cư dân KOC di chuyển giữa Khu Cư Xá và Khu Brand
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
      bubble: 'Đạp xe từ Cư Xá qua Phố Mỹ Phẩm nhận son Cỏ Mềm! 🚲',
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
      bubble: 'Vít ga xe máy qua ngã tư ghé chào Chú Bảo Vệ! 🛵💨',
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
      bubble: 'Đi bộ ra quán cafe Cư Xá, ráng xong 1 job để nhận xe đạp 🌸',
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
      bubble: 'Vừa ghé ViSecret lấy váy OOTD, giờ chạy về Cư Xá dựng clip 👗',
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
      bubble: 'Đạp xe qua Trạm Tranyoo test thử tai nghe chống ồn 🎧',
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
      bubble: 'Đi dạo công viên Cư Xá ngắm hoa bằng lăng nở rộ ✨',
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
                ? 'Đã nhận Xe Máy KOCity từ Chú Bảo Vệ, vi vu khắp các phố brand! 🛵💨'
                : userVehicle === 'bicycle'
                ? 'Đang đạp Xe Đạp KOCity đi nhận job 🚲'
                : 'Đang đi bộ, xong 1 job ghé Chú Bảo Vệ nhận xe đạp ngay! 🚶',
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

  // =========================================================================
  // THUẬT TOÁN ZOOM GOOGLE MAPS (ZOOM TOWARDS CURSOR / FOCAL POINT MATH)
  // =========================================================================
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    // Tọa độ thực tế trên bản đồ thế giới trước khi zoom
    const worldX = (cursorX - pan.x) / zoom;
    const worldY = (cursorY - pan.y) / zoom;

    // Tỉ lệ scale co giãn mượt mà theo gia tốc con lăn chuột
    const zoomFactor = Math.exp(-e.deltaY * 0.0022);
    const newZoom = Math.min(1.6, Math.max(0.35, zoom * zoomFactor));

    // Điểm neo dưới con trỏ chuột giữ nguyên vị trí tuyệt đối trên màn hình
    const newPanX = cursorX - worldX * newZoom;
    const newPanY = cursorY - worldY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // NHẤP ĐÚP CHUỘT (DOUBLE CLICK) ĐỂ PHÓNG TO VÀO ĐÚNG ĐIỂM ĐÓ NHƯ GOOGLE MAPS
  const handleDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, .clickable-element')) return;
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const worldX = (cursorX - pan.x) / zoom;
    const worldY = (cursorY - pan.y) / zoom;

    // Phóng to 1.35x và đưa điểm click dần về giữa màn hình
    const targetZoom = Math.min(1.6, zoom * 1.35);
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newPanX = centerX - worldX * targetZoom;
    const newPanY = centerY - worldY * targetZoom;

    setZoom(targetZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // ZOOM THEO TÂM MÀN HÌNH KHI BẤM NÚT [+] VÀ [-]
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

  // Kéo thả chuột (Pan / Drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, .clickable-element')) return;
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

  // Xử lý Touch Mobile: 1 ngón vuốt di chuyển, 2 ngón chụm/tách (Pinch-to-zoom đa điểm)
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

  // Bay camera (Fly-to) đến các vị trí trọng điểm
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
                  Google Maps Zoom Engine v7.0
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 hidden sm:flex">
              <span>🏠 Khu Cư Xá</span>
              <span>↔️</span>
              <span>🚦 Ngã Tư & Chú Bảo Vệ</span>
              <span>↔️</span>
              <span>🏢 Các Phố Brand</span>
            </p>
          </div>
        </div>

        {/* Cụm Nút Di Chuyển Camera Nhanh */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <div className="hidden lg:flex items-center gap-1 bg-white/10 p-1 rounded-full ring-1 ring-white/15">
            <button
              type="button"
              onClick={() => flyTo(650, 850, 0.95)}
              className="rounded-full px-3 py-1 font-semibold text-slate-200 hover:bg-white/20 transition cursor-pointer"
            >
              🏠 Khu Cư Xá
            </button>
            <button
              type="button"
              onClick={() => flyTo(1350, 850, 1.05)}
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 font-bold text-slate-950 shadow transition hover:opacity-95 cursor-pointer"
            >
              👮 Chú Bảo Vệ & Ngã Tư
            </button>
            <button
              type="button"
              onClick={() => flyTo(1400, 1000, 1.0)}
              className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1 font-black text-white shadow transition hover:opacity-95 ring-1 ring-amber-300/40 cursor-pointer"
            >
              👑 Trụ Sở KOCity
            </button>
            <button
              type="button"
              onClick={() => flyTo(2150, 420, 0.95)}
              className="rounded-full px-2.5 py-1 font-semibold text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
            >
              🌿 Phố Mỹ Phẩm
            </button>
            <button
              type="button"
              onClick={() => flyTo(2100, 850, 0.95)}
              className="rounded-full px-2.5 py-1 font-semibold text-purple-300 hover:bg-purple-500/20 transition cursor-pointer"
            >
              👗 Phố Thời Trang
            </button>
            <button
              type="button"
              onClick={() => flyTo(2200, 1300, 0.95)}
              className="rounded-full px-2.5 py-1 font-semibold text-blue-300 hover:bg-blue-500/20 transition cursor-pointer"
            >
              🎧 Phố Công Nghệ
            </button>
            <button
              type="button"
              onClick={() => flyTo(1400, 850, 0.42)}
              className="rounded-full px-3 py-1 font-bold text-amber-300 hover:bg-white/20 transition cursor-pointer"
            >
              🗺️ Toàn Cảnh
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
        {/* LỚP NỀN TRỜI & HIỆU ỨNG ÁNH SÁNG */}
        <div
          className={cx(
            'absolute inset-0 pointer-events-none transition-opacity duration-1000',
            isNight ? 'opacity-80 bg-radial from-violet-900/20 via-transparent to-black' : 'opacity-30 bg-radial from-amber-200/40 to-transparent'
          )}
        />

        {/* CONTAINER THÀNH PHỐ CHÍNH (ĐƯỢC SCALE & TRANSLATE THEO CON TRỎ CHUỘT) */}
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
          {/* 1. MẶT CỎ, VỈA HÈ & KHU VỰC ĐÔ THỊ NỀN                                   */}
          {/* ========================================================================= */}
          <div
            className={cx(
              'absolute inset-0 rounded-3xl border-4 transition-colors duration-700',
              isNight ? 'bg-[#0f172a] border-slate-800' : 'bg-[#e2e8f0] border-slate-300'
            )}
          >
            {/* Phân khu Tây: Đất Khu Cư Xá (Nền cỏ xanh mát) */}
            <div
              style={{ left: 80, top: 80, width: 1040, height: 1540 }}
              className={cx(
                'absolute rounded-3xl transition-colors duration-700 border-2',
                isNight ? 'bg-[#142323] border-emerald-950/50' : 'bg-[#dcfce7] border-emerald-200'
              )}
            />

            {/* Phân khu Đông: Đất Khu Phố Brand (Nền thương mại hiện đại) */}
            <div
              style={{ left: 1680, top: 80, width: 1040, height: 1540 }}
              className={cx(
                'absolute rounded-3xl transition-colors duration-700 border-2',
                isNight ? 'bg-[#1e1b4b] border-indigo-950/50' : 'bg-[#e0e7ff] border-indigo-200'
              )}
            />
          </div>

          {/* ========================================================================= */}
          {/* 2. HỆ THỐNG ĐƯỜNG XÁ, ĐẠI LỘ HUYẾT MẠCH & NGÃ TƯ TRUNG TÂM               */}
          {/* ========================================================================= */}
          {/* ĐẠI LỘ ĐÔNG - TÂY (Nối Khu Cư Xá <-> Ngã Tư <-> Khu Brand) */}
          <div
            style={{ left: 0, top: 760, width: MAP_W, height: 180 }}
            className={cx(
              'absolute transition-colors duration-700 shadow-2xl flex flex-col justify-between',
              isNight ? 'bg-[#1e293b]' : 'bg-[#334155]'
            )}
          >
            {/* Vỉa hè trên */}
            <div className="h-6 w-full bg-[#cbd5e1] border-b-2 border-dashed border-slate-400 flex items-center justify-around px-8">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="h-3 w-1.5 bg-slate-400/50 rounded-xs" />
              ))}
            </div>

            {/* Dải phân cách giữa có hoa cúc vàng & hoa đỏ */}
            <div className="h-5 w-full bg-emerald-800/90 border-y border-amber-300/40 flex items-center justify-around px-4">
              {Array.from({ length: 35 }).map((_, i) => (
                <span key={i} className="text-[10px] select-none">
                  {i % 2 === 0 ? '🌼' : '🌺'}
                </span>
              ))}
            </div>

            {/* Vỉa hè dưới */}
            <div className="h-6 w-full bg-[#cbd5e1] border-t-2 border-dashed border-slate-400 flex items-center justify-around px-8">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="h-3 w-1.5 bg-slate-400/50 rounded-xs" />
              ))}
            </div>
          </div>

          {/* ĐẠI LỘ BẮC - NAM (Nối Trụ sở KOCity & Công viên Trung tâm qua Ngã Tư) */}
          <div
            style={{ left: 1260, top: 0, width: 180, height: MAP_H }}
            className={cx(
              'absolute transition-colors duration-700 shadow-2xl flex justify-between',
              isNight ? 'bg-[#1e293b]' : 'bg-[#334155]'
            )}
          >
            <div className="w-6 h-full bg-[#cbd5e1] border-r-2 border-dashed border-slate-400" />
            <div className="w-2 h-full flex flex-col justify-around py-4">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="w-2 h-8 bg-amber-400/80 rounded-full" />
              ))}
            </div>
            <div className="w-6 h-full bg-[#cbd5e1] border-l-2 border-dashed border-slate-400" />
          </div>

          {/* GIAO LỘ NGÃ TƯ TRUNG TÂM & 4 VẠCH NGỰA VẰN SANG ĐƯỜNG */}
          <div
            style={{ left: 1230, top: 730, width: 240, height: 240 }}
            className="absolute pointer-events-none"
          >
            <div className="absolute left-0 top-12 bottom-12 w-8 flex flex-col justify-around">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-2 w-full bg-white shadow-md rounded-xs" />
              ))}
            </div>
            <div className="absolute right-0 top-12 bottom-12 w-8 flex flex-col justify-around">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-2 w-full bg-white shadow-md rounded-xs" />
              ))}
            </div>
            <div className="absolute top-0 left-12 right-12 h-8 flex justify-around">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-2 h-full bg-white shadow-md rounded-xs" />
              ))}
            </div>
            <div className="absolute bottom-0 left-12 right-12 h-8 flex justify-around">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-2 h-full bg-white shadow-md rounded-xs" />
              ))}
            </div>
          </div>

          {/* CỘT ĐÈN GIAO THÔNG THÔNG MINH (4 HƯỚNG TỰ ĐỔI MÀU XANH/VÀNG/ĐỎ) */}
          <div
            style={{ left: 1200, top: 700 }}
            className="absolute z-20 flex flex-col items-center drop-shadow-2xl"
          >
            <div className="bg-slate-900 border-2 border-amber-400/70 rounded-2xl p-2 flex flex-col items-center gap-1.5 shadow-2xl ring-2 ring-black">
              <div className="text-[9px] font-black tracking-widest text-amber-300">NGÃ TƯ</div>
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
          {/* 3. TÂM ĐIỂM TRUNG TÂM: TRỤ SỞ KOCITY HQ & BỐT GÁC CHÚ BẢO VỆ            */}
          {/* ========================================================================= */}
          <div
            style={{ left: 1470, top: 970 }}
            className="absolute z-20 cursor-pointer group clickable-element"
            onClick={() => setShowHqModal(true)}
          >
            <div className="relative flex flex-col items-center">
              <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 px-4 py-1.5 rounded-full text-white text-xs font-black shadow-2xl ring-2 ring-amber-300 whitespace-nowrap flex items-center gap-1.5 border border-white animate-pulse">
                <span>👑</span>
                <span>TRỤ SỞ KOCITY HQ</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  ĐỔI XE
                </span>
              </div>

              <div
                className={cx(
                  'w-56 h-64 mt-2 rounded-3xl border-4 p-4 shadow-2xl transition-all duration-500 group-hover:scale-105 flex flex-col justify-between',
                  isNight
                    ? 'bg-gradient-to-b from-purple-900 via-slate-900 to-black border-amber-400/80 shadow-purple-500/30'
                    : 'bg-gradient-to-b from-white via-indigo-50 to-purple-100 border-purple-500 shadow-indigo-300/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-[10px] font-bold text-amber-400">TRUNG TÂM ĐIỀU HÀNH</span>
                  </div>
                  <span className="text-2xl">👑</span>
                </div>

                <div className="grid grid-cols-4 gap-2 my-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className={cx(
                        'h-7 rounded-md transition-colors',
                        isNight
                          ? i % 3 === 0
                            ? 'bg-amber-300/90 shadow-sm shadow-amber-300'
                            : 'bg-purple-400/50'
                          : 'bg-indigo-200 border border-indigo-300'
                      )}
                    />
                  ))}
                </div>

                <div className="bg-white/10 rounded-xl p-2 text-center border border-white/20">
                  <div className="text-[11px] font-extrabold text-amber-300">
                    SẢNH VINH DANH & CẤP XE
                  </div>
                  <div className="text-[9px] text-slate-300 mt-0.5">
                    🚲 Xong 1 job: Xe Đạp · 🛵 Xong 3 job: Xe Máy
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 bg-slate-900/80 px-3 py-1 rounded-full ring-1 ring-white/20 text-[12px]">
                <span title="Xe đạp KOCity">🚲 🚲</span>
                <span className="text-slate-400">|</span>
                <span title="Xe máy KOCity">🛵 🛵</span>
              </div>
            </div>
          </div>

          {/* BỐT GÁC AN NINH & CHÚ BẢO VỆ THÂN THIỆN */}
          <div
            style={{ left: 1330, top: 980 }}
            className="absolute z-20 cursor-pointer group clickable-element"
            onClick={() => setShowGuardModal(true)}
          >
            <div className="flex flex-col items-center">
              <div className="bg-amber-300 text-slate-950 px-3 py-1 rounded-2xl text-[11px] font-black shadow-2xl ring-2 ring-white whitespace-nowrap mb-1 animate-bounce">
                👮 "Chào cháu! Ghé chú đổi xe nha!"
              </div>

              <div className="relative flex items-center gap-2 bg-slate-900/95 border-2 border-amber-400 px-3 py-2 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-xl shadow-lg">
                    👮
                  </div>
                  <div className="text-[9px] font-bold text-amber-300 mt-0.5">BẢO VỆ</div>
                </div>

                <div className="flex flex-col text-left">
                  <div className="text-[11px] font-black text-white">BỐT AN NINH KOCITY</div>
                  <div className="text-[9px] text-slate-300">Kiểm tra thẻ & Hướng dẫn</div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="h-2 w-10 bg-repeating-linear-gradient from-red-500 to-white rounded-full border border-white" />
                    <span className="text-[8px] text-emerald-400 font-bold">MỞ CỔNG</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. PHÂN KHU TÂY: KHU ĐÔ THỊ CƯ XÁ KOC (NƠI Ở CỦA CÁC CREATOR)            */}
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

          {/* DÃY NHÀ PHỐ CƯ DÂN LIỀN KỀ (DÃY TRÊN) */}
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

          {/* QUÁN CAFE CÓC VỈA HÈ & CÔNG VIÊN CƯ XÁ (DÃY DƯỚI) */}
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
          {/* 5. PHÂN KHU ĐÔNG: KHU PHỐ THƯƠNG MẠI BRAND (CHIA THEO PHỐ NGÀNH HÀNG)   */}
          {/* ========================================================================= */}
          <div
            style={{ left: 1950, top: 120 }}
            className="absolute z-10 flex flex-col items-center cursor-pointer clickable-element"
            onClick={() => flyTo(2150, 850, 0.85)}
          >
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-2 rounded-2xl text-white font-black text-sm shadow-2xl ring-2 ring-white flex items-center gap-2 border border-white/40">
              <span>🏢</span>
              <span>ĐẠI LỘ CÁC THƯƠNG HIỆU CHIẾN LƯỢC</span>
              <span>🛍️</span>
            </div>
            <div className="text-[11px] text-slate-300 bg-slate-900/80 px-3 py-0.5 rounded-full mt-1 border border-white/20">
              Chia thành các tuyến phố chuyên ngành: Mỹ Phẩm · Thời Trang · Công Nghệ
            </div>
          </div>

          {/* TUYẾN 1: PHỐ MỸ PHẨM & SKINCARE */}
          <div style={{ left: 1750, top: 220 }} className="absolute z-10 flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 bg-emerald-600/90 text-white text-xs font-black px-4 py-1.5 rounded-full ring-2 ring-white self-start shadow-xl">
              <span>📍</span>
              <span>PHỐ MỸ PHẨM & SKINCARE</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Kho xuất mẫu HN & SG</span>
            </div>

            <div className="flex items-center gap-6 mt-2">
              <div
                className="w-72 h-64 bg-gradient-to-b from-emerald-900 via-slate-900 to-black border-3 border-emerald-400 rounded-3xl p-4 shadow-2xl flex flex-col justify-between cursor-pointer group hover:scale-105 transition-all clickable-element"
                onClick={() => setSelectedBrand(brandStations[0])}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🌿</span>
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    35 Mẫu 0đ
                  </span>
                </div>
                <div>
                  <div className="text-sm font-black text-white group-hover:text-emerald-300 transition">
                    Cỏ Mềm Greenlab
                  </div>
                  <div className="text-[11px] text-emerald-300 mt-0.5">Mỹ phẩm thuần khiết</div>
                  <div className="text-[10px] text-slate-300 mt-1 line-clamp-2">
                    Son dưỡng, bọt rửa mặt, serum rau má xuất mẫu miễn phí.
                  </div>
                </div>
                <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-xl py-1 text-center text-[10px] font-bold text-emerald-300 group-hover:bg-emerald-500 group-hover:text-white transition">
                  Bấm xem kho mẫu 0đ ➡️
                </div>
              </div>

              <div
                className="w-72 h-64 bg-gradient-to-b from-fuchsia-900 via-slate-900 to-black border-3 border-fuchsia-400 rounded-3xl p-4 shadow-2xl flex flex-col justify-between cursor-pointer group hover:scale-105 transition-all clickable-element"
                onClick={() => setSelectedBrand(brandStations[1])}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">✨</span>
                  <span className="bg-fuchsia-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    42 Mẫu 0đ
                  </span>
                </div>
                <div>
                  <div className="text-sm font-black text-white group-hover:text-fuchsia-300 transition">
                    Bielenda Skin House
                  </div>
                  <div className="text-[11px] text-fuchsia-300 mt-0.5">Dược mỹ phẩm Châu Âu</div>
                  <div className="text-[10px] text-slate-300 mt-1 line-clamp-2">
                    Toner acid, serum phục hồi da chuyên sâu cho beauty creator.
                  </div>
                </div>
                <div className="bg-fuchsia-500/20 border border-fuchsia-400/40 rounded-xl py-1 text-center text-[10px] font-bold text-fuchsia-300 group-hover:bg-fuchsia-500 group-hover:text-white transition">
                  Bấm xem kho mẫu 0đ ➡️
                </div>
              </div>
            </div>
          </div>

          {/* TUYẾN 2: PHỐ THỜI TRANG & OOTD */}
          <div style={{ left: 1750, top: 680 }} className="absolute z-10 flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 bg-purple-600/90 text-white text-xs font-black px-4 py-1.5 rounded-full ring-2 ring-white self-start shadow-xl">
              <span>📍</span>
              <span>PHỐ THỜI TRANG & OOTD</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">May mặc & Phụ kiện</span>
            </div>

            <div className="flex items-center gap-6 mt-2">
              <div
                className="w-80 h-60 bg-gradient-to-b from-purple-900 via-slate-900 to-black border-3 border-purple-400 rounded-3xl p-4 shadow-2xl flex flex-col justify-between cursor-pointer group hover:scale-105 transition-all clickable-element"
                onClick={() => setSelectedBrand(brandStations[2])}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">👗</span>
                  <span className="bg-purple-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    25 Mẫu 0đ
                  </span>
                </div>
                <div>
                  <div className="text-sm font-black text-white group-hover:text-purple-300 transition">
                    ViSecret Showroom
                  </div>
                  <div className="text-[11px] text-purple-300 mt-0.5">Thời trang & Nội y thiết kế</div>
                  <div className="text-[10px] text-slate-300 mt-1 line-clamp-2">
                    Mẫu bra tàng hình, váy đầm thiết kế tôn dáng cực chuẩn.
                  </div>
                </div>
                <div className="bg-purple-500/20 border border-purple-400/40 rounded-xl py-1 text-center text-[10px] font-bold text-purple-300 group-hover:bg-purple-500 group-hover:text-white transition">
                  Bấm xem kho mẫu 0đ ➡️
                </div>
              </div>

              <div className="w-64 h-60 bg-slate-900/90 border-2 border-slate-700 rounded-3xl p-4 flex flex-col justify-between">
                <div className="text-2xl">📸</div>
                <div>
                  <div className="text-xs font-black text-slate-200">STUDIO CHỤP OOTD</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Góc chụp phông trắng & ánh sáng vàng ấm cho KOC lên đồ.
                  </div>
                </div>
                <div className="text-[9px] text-amber-400 font-bold">✨ Miễn phí cho cư dân KOCity</div>
              </div>
            </div>
          </div>

          {/* TUYẾN 3: PHỐ CÔNG NGHỆ & GAMING */}
          <div style={{ left: 1750, top: 1120 }} className="absolute z-10 flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 bg-blue-600/90 text-white text-xs font-black px-4 py-1.5 rounded-full ring-2 ring-white self-start shadow-xl">
              <span>📍</span>
              <span>PHỐ CÔNG NGHỆ & GAMING</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Phụ kiện & Âm thanh</span>
            </div>

            <div className="flex items-center gap-6 mt-2">
              <div
                className="w-80 h-60 bg-gradient-to-b from-blue-900 via-slate-900 to-black border-3 border-blue-400 rounded-3xl p-4 shadow-2xl flex flex-col justify-between cursor-pointer group hover:scale-105 transition-all clickable-element"
                onClick={() => setSelectedBrand(brandStations[3])}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🎧</span>
                  <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    30 Mẫu 0đ
                  </span>
                </div>
                <div>
                  <div className="text-sm font-black text-white group-hover:text-blue-300 transition">
                    Tranyoo Cyber Arena
                  </div>
                  <div className="text-[11px] text-blue-300 mt-0.5">Tai nghe Bluetooth & Sạc nhanh</div>
                  <div className="text-[10px] text-slate-300 mt-1 line-clamp-2">
                    Kho công nghệ Sài Gòn giao tai nghe 0đ trong 24h cho KOC test âm thanh.
                  </div>
                </div>
                <div className="bg-blue-500/20 border border-blue-400/40 rounded-xl py-1 text-center text-[10px] font-bold text-blue-300 group-hover:bg-blue-500 group-hover:text-white transition">
                  Bấm xem kho mẫu 0đ ➡️
                </div>
              </div>

              <div className="w-64 h-60 bg-slate-900/60 border-2 border-dashed border-amber-400/40 rounded-3xl p-4 flex flex-col justify-between text-center items-center">
                <div className="text-3xl">📦</div>
                <div>
                  <div className="text-xs font-black text-amber-300">PHỐ TIÊU DÙNG MỞ RỘNG</div>
                  <div className="text-[10px] text-slate-300 mt-1">
                    Sẵn sàng chào đón các Brand FMCG, Mẹ & Bé, Gia dụng mới gia nhập KOCity!
                  </div>
                </div>
                <div className="text-[9px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  Sức chứa mở rộng vô hạn
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 6. HỆ THỐNG CÂY XANH RỢP BÓNG & CỘT ĐÈN ĐƯỜNG CHIẾU SÁNG TOÀN THÀNH PHỐ  */}
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
          {/* 7. CƯ DÂN KOC DI CHUYỂN TRÊN ĐƯỜNG & CHUYỂN ĐỘNG THEO TÍN HIỆU ĐÈN ĐỎ     */}
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
              <span>🚦</span>
              <span>ĐẠI LỘ ĐÔNG - TÂY KOCITY</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              • 🏠 <strong>Tây:</strong> Khu Cư Xá KOC (Nơi ở, ban công, cafe cóc)<br />
              • 🚦 <strong>Trung tâm:</strong> Ngã Tư Đèn Giao Thông & Chú Bảo Vệ Trụ Sở<br />
              • 🏢 <strong>Đông:</strong> Phố Mỹ Phẩm · Phố Thời Trang · Phố Công Nghệ
            </div>
          </div>
          <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-xl ring-1 ring-white/10 text-[11px] text-emerald-300">
            💡 Nhấp đúp chuột vào bất kỳ đâu để phóng to ngay điểm đó!
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CỤM ĐIỀU KHIỂN BẢN ĐỒ NỔI GÓC DƯỚI BÊN PHẢI (CHUẨN GOOGLE MAPS CONTROLS)   */}
        {/* ========================================================================= */}
        <div className="absolute bottom-6 right-6 z-30 flex flex-col items-end gap-2.5">
          {/* Cụm Nút Phóng to / Thu nhỏ & Định vị trung tâm */}
          <div className="flex flex-col rounded-2xl bg-slate-900/95 border border-white/20 p-1 shadow-2xl backdrop-blur-md ring-2 ring-black/40">
            {/* Phóng to */}
            <button
              type="button"
              onClick={() => zoomAtScreenCenter(1.22)}
              title="Phóng to (Zoom In)"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/15 active:scale-95 transition cursor-pointer font-black text-lg border-b border-white/10"
            >
              +
            </button>

            {/* Thu nhỏ */}
            <button
              type="button"
              onClick={() => zoomAtScreenCenter(0.82)}
              title="Thu nhỏ (Zoom Out)"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/15 active:scale-95 transition cursor-pointer font-black text-lg border-b border-white/10"
            >
              −
            </button>

            {/* Định vị về Trụ Sở KOCity & Chú Bảo Vệ */}
            <button
              type="button"
              onClick={() => flyTo(1400, 950, 1.0)}
              title="Về Trọng Tâm KOCity HQ & Chú Bảo Vệ"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-amber-300 hover:bg-white/15 active:scale-95 transition cursor-pointer text-base"
            >
              🎯
            </button>
          </div>

          {/* Thanh đo tỉ lệ Google Maps (Scale Bar) */}
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
      {/* 8. CÁC MODAL CHI TIẾT TƯƠNG TÁC (CHÚ BẢO VỆ / TRỤ SỞ / BRAND / CƯ DÂN)    */}
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

      {/* MODAL 2: TRỤ SỞ KOCITY HQ & ĐỔI XE */}
      {showHqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-purple-500 p-6 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setShowHqModal(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-violet-600 text-2xl shadow-lg ring-2 ring-amber-300">
                👑
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Trụ Sở KOCity HQ</h3>
                <p className="text-xs text-purple-300">Tòa Thị Chính & Trung Tâm Nâng Cấp Phương Tiện</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div
                className={cx(
                  'p-3.5 rounded-2xl border flex items-center justify-between',
                  userJobsCount >= 1
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-white/5 border-white/10 text-slate-400'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🚲</span>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Xe Đạp KOCity</span>
                      {userJobsCount >= 1 && (
                        <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.2 rounded-full font-black">
                          ĐÃ MỞ KHÓA
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">Yêu cầu hoàn thành: ≥ 1 Job</div>
                  </div>
                </div>
                <div className="text-right font-mono text-xs">
                  {userJobsCount >= 1 ? '✅ Đủ điều kiện' : `${userJobsCount}/1 Job`}
                </div>
              </div>

              <div
                className={cx(
                  'p-3.5 rounded-2xl border flex items-center justify-between',
                  userJobsCount >= 3
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                    : 'bg-white/5 border-white/10 text-slate-400'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🛵</span>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Xe Máy KOCity</span>
                      {userJobsCount >= 3 && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full font-black">
                          ĐÃ MỞ KHÓA
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">Yêu cầu hoàn thành: ≥ 3 Job</div>
                  </div>
                </div>
                <div className="text-right font-mono text-xs">
                  {userJobsCount >= 3 ? '✅ Đủ điều kiện' : `${userJobsCount}/3 Job`}
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              block
              onClick={() => setShowHqModal(false)}
              className="bg-gradient-to-r from-pink-500 to-violet-600 text-white font-black"
            >
              Đã Rõ! Tiếp Tục Khám Phá Thành Phố
            </Button>
          </div>
        </div>
      )}

      {/* MODAL 3: CHI TIẾT TRẠM BRAND THEO PHỐ */}
      {selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-white/20 p-6 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedBrand(null)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div
                className={cx(
                  'flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-lg ring-2 ring-white/30',
                  selectedBrand.badgeBg
                )}
              >
                {selectedBrand.badgeEmoji}
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                  {selectedBrand.streetName}
                </span>
                <h3 className="text-lg font-black text-white">{selectedBrand.name}</h3>
                <p className="text-xs text-slate-400">{selectedBrand.category}</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Kho mẫu 0đ sẵn có:</span>
                <span className="font-extrabold text-amber-300 text-sm">
                  {selectedBrand.sampleCount} Sản phẩm
                </span>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed border-t border-white/10 pt-2">
                {selectedBrand.desc}
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="primary"
                block
                onClick={() => {
                  const match = campaigns.find((c) =>
                    c.title.toLowerCase().includes(selectedBrand.brandName.toLowerCase())
                  );
                  if (match && onSelectCampaign) {
                    onSelectCampaign(match.id);
                    setSelectedBrand(null);
                    onClose();
                  } else {
                    setSelectedBrand(null);
                  }
                }}
                className={cx('font-black text-white shadow-lg cursor-pointer', selectedBrand.badgeBg)}
              >
                Đăng Ký Nhận Mẫu 0đ Ngay 🎁
              </Button>
              <Button
                variant="ghost"
                block
                onClick={() => setSelectedBrand(null)}
                className="text-slate-400 hover:text-white"
              >
                Đóng
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

      {/* ===== FOOTER HƯỚNG DẪN TƯƠNG TÁC ===== */}
      <footer className="flex flex-wrap items-center justify-between border-t border-white/10 bg-slate-950/90 px-4 py-2 text-xs text-slate-400 sm:px-6 z-30">
        <div className="flex items-center gap-3 text-[11px]">
          <span>💡 <strong>Lăn chuột vào điểm cần xem:</strong> Tự động bám và phóng to đúng con trỏ chuột</span>
          <span className="hidden sm:inline">•</span>
          <span><strong>Nhấp đúp chuột:</strong> Phóng to 1 chạm vào vị trí đó</span>
          <span className="hidden sm:inline">•</span>
          <span><strong>Chụm 2 ngón tay (Mobile):</strong> Zoom đa điểm mượt mà</span>
        </div>
        <div className="text-[10px] text-slate-500 hidden md:block">
          Google Maps Anchor Math Engine
        </div>
      </footer>
    </div>
  );
};
