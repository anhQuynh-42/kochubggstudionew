import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Campaign } from '../../types';
import { Icon, Button, cx } from '../ui';

export type VehicleType = 'walk' | 'bicycle' | 'motorbike';
export type MapLayerType = 'satellite' | 'street' | 'night';

interface Citizen {
  id: string;
  name: string;
  city: 'Hà Nội' | 'TP. Hồ Chí Minh';
  number: string;
  role: string;
  jobsDone: number;
  vehicle: VehicleType;
  lat: number;
  lng: number;
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
  lat: number;
  lng: number;
  category: string;
  sampleCount: number;
  icon: string;
  badgeBg: string;
  tagline: string;
  desc: string;
  address: string;
}

interface KocityWorldModalProps {
  open: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  currentUser: any;
  isNightDefault?: boolean;
  onSelectCampaign?: (campaignId: string) => void;
}

// Toạ độ thực tế các địa danh
const COORDS = {
  vietnamCenter: [16.0544, 106.5] as [number, number],
  hanoiCenter: [21.0285, 105.8542] as [number, number], // Hồ Gươm
  saigonCenter: [10.7745, 106.703] as [number, number], // Phố Đi Bộ Nguyễn Huệ
  kocityHQ: [21.0245, 105.8525] as [number, number], // Trụ sở KOCity
};

// Các nguồn Tile bản đồ
const TILE_PROVIDERS: Record<MapLayerType, { url: string; attribution: string; subdomains?: string }> = {
  // 🛰️ Ảnh vệ tinh chụp thật độ nét cao từ trên cao (Esri World Imagery)
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  // 🗺️ Bản đồ đường phố sáng đẹp (CartoDB Voyager)
  street: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
  },
  // 🌆 Bản đồ đêm Neon Cyber (CartoDB Dark Matter)
  night: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
  },
};

export const KocityWorldModal: React.FC<KocityWorldModalProps> = ({
  open,
  onClose,
  campaigns,
  currentUser,
  isNightDefault = false,
  onSelectCampaign,
}) => {
  const [mapLayer, setMapLayer] = useState<MapLayerType>('satellite'); // Mặc định mở ngay Ảnh Vệ Tinh Chụp Thật
  const [activeRegion, setActiveRegion] = useState<'hanoi' | 'saigon' | 'vietnam'>('hanoi');
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<BrandStation | null>(null);
  const [showHqModal, setShowHqModal] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Tiến độ nhận xe của tài khoản
  const userJobsCount = currentUser?.completedApplications?.length || 0;
  const userVehicle: VehicleType = userJobsCount >= 3 ? 'motorbike' : userJobsCount >= 1 ? 'bicycle' : 'walk';

  // Danh sách các Trạm Brand cắm tại toạ độ thật ngoài đời
  const brandStations: BrandStation[] = [
    // --- KHU VỰC HÀ NỘI ---
    {
      id: 'co-mem-hn',
      name: 'Trạm Cỏ Mềm Homelab Hà Nội',
      brandName: 'Cỏ Mềm',
      city: 'Hà Nội',
      lat: 21.0225,
      lng: 105.8485,
      category: 'Mỹ phẩm thiên nhiên thuần khiết',
      sampleCount: 35,
      icon: 'spa',
      badgeBg: 'bg-emerald-600',
      tagline: 'Lành sạch thuần Việt · Kho tổng xuất mẫu từ Hà Nội',
      desc: 'Kho Cỏ Mềm tại Hà Nội gửi son dưỡng, bọt rửa mặt, serum rau má 0đ tận nhà cho KOC.',
      address: 'Phố Bà Triệu, Q. Hoàn Kiếm, Hà Nội',
    },
    {
      id: 'visecret-hn',
      name: 'Showroom Thời Trang ViSecret',
      brandName: 'ViSecret',
      city: 'Hà Nội',
      lat: 21.018,
      lng: 105.854,
      category: 'Thời trang & May mặc cao cấp',
      sampleCount: 25,
      icon: 'checkroom',
      badgeBg: 'bg-purple-600',
      tagline: 'Kho may mặc Hà Nội · Tôn dáng chuẩn KOC',
      desc: 'Xuất mẫu áo bra tàng hình, đầm thiết kế miễn phí tận nhà cho KOC lên video OOTD.',
      address: 'Phố Huế, Q. Hai Bà Trưng, Hà Nội',
    },

    // --- KHU VỰC SÀI GÒN ---
    {
      id: 'tranyoo-sg',
      name: 'Showroom Công Nghệ Tranyoo',
      brandName: 'Tranyoo',
      city: 'TP. Hồ Chí Minh',
      lat: 10.7715,
      lng: 106.6965,
      category: 'Tai nghe & Phụ kiện Cyberpunk',
      sampleCount: 30,
      icon: 'headphones',
      badgeBg: 'bg-blue-600',
      tagline: 'Kho công nghệ Sài Gòn · Giao tai nghe 0đ trong 24h',
      desc: 'Trụ sở phân phối tai nghe Bluetooth TWS, củ sạc nhanh chuẩn Gen Z.',
      address: 'Đường Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
    },
    {
      id: 'bielenda-sg',
      name: 'Boutique Dược Mỹ Phẩm Bielenda',
      brandName: 'Bielenda',
      city: 'TP. Hồ Chí Minh',
      lat: 10.7765,
      lng: 106.7025,
      category: 'Dược mỹ phẩm phục hồi da Châu Âu',
      sampleCount: 42,
      icon: 'water_drop',
      badgeBg: 'bg-fuchsia-600',
      tagline: 'Kho nhập khẩu Sài Gòn · Trị mụn & Phục hồi chuyên sâu',
      desc: 'Dòng sản phẩm toner acid, serum peel da được hàng triệu beauty blogger tin dùng.',
      address: 'Đường Đồng Khởi, Quận 1, TP.HCM',
    },
  ];

  // Danh sách các Cư dân mẫu đi lại trên các tuyến đường thật
  const [citizens, setCitizens] = useState<Citizen[]>([
    {
      id: 'c1',
      name: 'Thu Trang (QA***)',
      city: 'Hà Nội',
      number: '#0089',
      role: 'Cư dân Năng Động',
      jobsDone: 1,
      vehicle: 'bicycle',
      lat: 21.029,
      lng: 105.853,
      direction: 'right',
      speed: 0.0001,
      minX: 105.851,
      maxX: 105.856,
      avatarColor: '#ec4899',
      bubble: 'Đạp xe quanh Hồ Gươm chụp ảnh nhận son Cỏ Mềm! 🚲',
    },
    {
      id: 'c2',
      name: 'Tuấn Anh (AnhTuan.Tech)',
      city: 'Hà Nội',
      number: '#0042',
      role: 'KOC Thâm Niên',
      jobsDone: 4,
      vehicle: 'motorbike',
      lat: 21.026,
      lng: 105.855,
      direction: 'left',
      speed: 0.0002,
      minX: 105.852,
      maxX: 105.858,
      avatarColor: '#f59e0b',
      bubble: 'Lái xe máy qua Trụ sở KOCity đối soát hoa hồng! 🛵',
    },
    {
      id: 'c3',
      name: 'Linh Chi (ChiChi.Review)',
      city: 'Hà Nội',
      number: '#0156',
      role: 'Tân Cư Dân',
      jobsDone: 0,
      vehicle: 'walk',
      lat: 21.0315,
      lng: 105.852,
      direction: 'right',
      speed: 0.00006,
      minX: 105.8505,
      maxX: 105.8545,
      avatarColor: '#10b981',
      bubble: 'Đi bộ phố Hàng Mẫu, cố gắng xong 1 job để nhận xe đạp 🌸',
    },
    {
      id: 'c4',
      name: 'Minh Thư (Thư N.)',
      city: 'TP. Hồ Chí Minh',
      number: '#0125',
      role: 'Creator Triệu View',
      jobsDone: 7,
      vehicle: 'motorbike',
      lat: 10.774,
      lng: 106.7035,
      direction: 'right',
      speed: 0.00022,
      minX: 106.701,
      maxX: 106.706,
      avatarColor: '#6366f1',
      bubble: 'Lượn xe máy dọc phố đi bộ Nguyễn Huệ cực đã! 🛵',
    },
    {
      id: 'c5',
      name: 'Huy Hoàng (HoangAudio)',
      city: 'TP. Hồ Chí Minh',
      number: '#0204',
      role: 'KOC Năng Động',
      jobsDone: 2,
      vehicle: 'bicycle',
      lat: 10.7725,
      lng: 106.699,
      direction: 'left',
      speed: 0.00012,
      minX: 106.697,
      maxX: 106.702,
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
      lat: 10.773,
      lng: 106.701,
      direction: 'right',
      speed: 0.00007,
      minX: 106.6995,
      maxX: 106.703,
      avatarColor: '#d946ef',
      bubble: 'Đang đi bộ qua chợ Bến Thành ngắm đồ OOTD ✨',
    },
  ]);

  // Thêm nhân vật của currentUser nếu có tài khoản
  useEffect(() => {
    if (currentUser?.name) {
      setCitizens((prev) => {
        if (prev.some((c) => c.isCurrentUser)) return prev;
        const isHN =
          currentUser?.address?.toLowerCase().includes('hà nội') || currentUser?.address?.toLowerCase().includes('ha noi');
        const userCity: 'Hà Nội' | 'TP. Hồ Chí Minh' = isHN ? 'Hà Nội' : 'TP. Hồ Chí Minh';
        const startLat = isHN ? 21.0275 : 10.7738;
        const startLng = isHN ? 105.8535 : 106.7025;
        const speed = userVehicle === 'motorbike' ? 0.0002 : userVehicle === 'bicycle' ? 0.00012 : 0.00006;

        return [
          {
            id: 'user-self',
            name: `${currentUser.name} (BẠN)`,
            city: userCity,
            number: '#001',
            role: userJobsCount >= 3 ? 'KOC Thâm Niên' : userJobsCount >= 1 ? 'KOC Năng Động' : 'Tân Cư Dân',
            jobsDone: userJobsCount,
            vehicle: userVehicle,
            lat: startLat,
            lng: startLng,
            direction: 'right',
            speed,
            minX: startLng - 0.003,
            maxX: startLng + 0.003,
            avatarColor: '#f59e0b',
            isCurrentUser: true,
            bubble:
              userVehicle === 'motorbike'
                ? 'Đã mở khóa Xe Máy KOCity lướt siêu êm trên phố thật! 🛵💨'
                : userVehicle === 'bicycle'
                ? 'Đang đạp Xe Đạp KOCity đi nhận job 🚲'
                : 'Đang đi bộ, hoàn thành 1 job để nhận xe đạp tại Trụ sở KOCity! 🚶',
          },
          ...prev,
        ];
      });
    }
  }, [currentUser, userJobsCount, userVehicle]);

  // Vòng lặp chuyển động của các cư dân trên đường phố
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setCitizens((prev) =>
        prev.map((c) => {
          let nextLng = c.lng + (c.direction === 'right' ? c.speed : -c.speed);
          let nextDir = c.direction;
          if (nextLng >= c.maxX) {
            nextLng = c.maxX;
            nextDir = 'left';
          } else if (nextLng <= c.minX) {
            nextLng = c.minX;
            nextDir = 'right';
          }
          return { ...c, lng: nextLng, direction: nextDir };
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, [open]);

  // Khởi tạo bản đồ Leaflet & SỬA TRIỆT ĐỂ LỖI KÍCH THƯỚC QUA INVALIDATESIZE()
  useEffect(() => {
    if (!open || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: COORDS.hanoiCenter,
        zoom: 16, // Zoom sát Hồ Gươm ngắm ảnh vệ tinh tuyệt đẹp
        minZoom: 5,
        maxZoom: 18,
        zoomControl: false,
      });

      // Lớp Tile ảnh vệ tinh Esri World Imagery
      const config = TILE_PROVIDERS[mapLayer];
      const tileLayer = L.tileLayer(config.url, {
        attribution: config.attribution,
        subdomains: config.subdomains || 'abc',
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Lớp nhãn đường phố để đọc tên đường trên nền vệ tinh
      const labelLayer = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.85 }
      ).addTo(map);
      labelLayerRef.current = labelLayer;

      // Layer group chứa các markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;

      // SỬA TRIỆT ĐỂ LỖI KHÔNG NẠP ĐƯỢC ẢNH BẢN ĐỒ KHI MỞ MODAL:
      // Gọi invalidateSize liên tiếp để Leaflet tải full 100% mảnh ảnh vệ tinh
      setTimeout(() => map.invalidateSize(), 150);
      setTimeout(() => map.invalidateSize(), 400);
      setTimeout(() => map.invalidateSize(), 800);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [open]);

  // Cập nhật lớp Tile khi đổi chế độ Vệ tinh / Đường phố / Đêm
  useEffect(() => {
    if (!tileLayerRef.current || !mapInstanceRef.current) return;
    const config = TILE_PROVIDERS[mapLayer];
    tileLayerRef.current.setUrl(config.url);

    // Nếu là chế độ vệ tinh thì bật nhãn đường phố, ngược lại thì ẩn nhãn để tránh đè chữ
    if (labelLayerRef.current) {
      if (mapLayer === 'satellite') {
        if (!mapInstanceRef.current.hasLayer(labelLayerRef.current)) {
          labelLayerRef.current.addTo(mapInstanceRef.current);
        }
      } else {
        if (mapInstanceRef.current.hasLayer(labelLayerRef.current)) {
          labelLayerRef.current.remove();
        }
      }
    }
  }, [mapLayer]);

  // Render các Marker 3D Sáng Tạo (Cư dân, Brand, Trụ sở KOCity) nổi bật trên nền vệ tinh
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    // 1. CẮM GHIM TRỤ SỞ KOCITY (VƯƠNG MIỆN PHÁT SÁNG HÀO QUANG 3D)
    const hqIcon = L.divIcon({
      className: 'custom-hq-marker',
      html: `
        <div style="transform: translate(-50%, -100%); cursor: pointer;" class="flex flex-col items-center group">
          <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6);" class="px-3.5 py-1.5 rounded-full text-white text-xs font-black shadow-2xl ring-2 ring-amber-300 animate-pulse whitespace-nowrap flex items-center gap-1.5 border border-white">
            <span class="text-[14px]">👑</span>
            <span>TRỤ SỞ KOCITY HQ</span>
            <span class="bg-amber-400 text-slate-950 text-[9px] px-1.5 py-0.2 rounded-full font-bold">ĐỔI XE</span>
          </div>
          <div class="h-3 w-3 bg-fuchsia-600 rotate-45 -mt-1.5 shadow-xl border-r border-b border-white/50"></div>
          <div class="h-2 w-7 rounded-full bg-black/60 blur-xs mt-1"></div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const hqMarker = L.marker(COORDS.kocityHQ, { icon: hqIcon }).addTo(layer);
    hqMarker.on('click', () => setShowHqModal(true));

    // 2. CẮM GHIM CÁC TRẠM BRAND 3D NỔI BẬT TRÊN NỀN VỆ TINH
    brandStations.forEach((station) => {
      const isCoMem = station.brandName.includes('Cỏ Mềm');
      const isTranyoo = station.brandName.includes('Tranyoo');
      const isBielenda = station.brandName.includes('Bielenda');

      const brandIcon = L.divIcon({
        className: 'custom-brand-marker',
        html: `
          <div style="transform: translate(-50%, -100%); cursor: pointer;" class="flex flex-col items-center group">
            <div class="${station.badgeBg} text-white px-3 py-1 rounded-full text-xs font-black shadow-2xl ring-2 ring-white whitespace-nowrap flex items-center gap-1.5 transition-transform group-hover:scale-110 border border-white/30">
              <span class="text-[14px]">${isCoMem ? '🌿' : isTranyoo ? '🎧' : isBielenda ? '✨' : '👗'}</span>
              <span>${station.brandName}</span>
              <span class="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">${station.sampleCount} Mẫu 0đ</span>
            </div>
            <div class="h-2.5 w-2.5 ${station.badgeBg} rotate-45 -mt-1 shadow-md border-r border-b border-white/40"></div>
            <div class="h-2 w-6 rounded-full bg-black/50 blur-xs mt-0.5"></div>
          </div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker([station.lat, station.lng], { icon: brandIcon }).addTo(layer);
      marker.on('click', () => setSelectedBrand(station));
    });

    // 3. CẮM CÁC CƯ DÂN KOC CHIBI LƯỚT XE TRÊN ĐƯỜNG PHỐ THẬT
    citizens.forEach((c) => {
      const citizenIcon = L.divIcon({
        className: 'custom-citizen-marker',
        html: `
          <div style="transform: translate(-50%, -100%); cursor: pointer;" class="flex flex-col items-center group">
            ${
              c.bubble
                ? `<div class="bg-white text-slate-900 px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-2xl ring-2 ring-pink-500 max-w-[170px] text-center mb-1 leading-snug whitespace-normal animate-bounce">
                    ${c.bubble}
                  </div>`
                : ''
            }
            <div class="${c.isCurrentUser ? 'bg-amber-400 text-slate-950 ring-2 ring-white animate-pulse' : 'bg-slate-900/95 text-white ring-1 ring-violet-300'} px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xl whitespace-nowrap flex items-center gap-1">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>${c.name}</span>
              <span class="text-pink-400 font-extrabold">${c.number}</span>
              <span>${c.vehicle === 'motorbike' ? '🛵' : c.vehicle === 'bicycle' ? '🚲' : '🚶'}</span>
            </div>
            <div class="mt-0.5 flex flex-col items-center">
              <div style="background-color: ${c.avatarColor};" class="h-8 w-8 rounded-full text-white text-[14px] flex items-center justify-center font-bold shadow-xl ring-2 ring-white">
                ${c.isCurrentUser ? '👑' : c.city === 'Hà Nội' ? '🌸' : '☕'}
              </div>
              <div class="text-[18px] -mt-1.5 filter drop-shadow-md">
                ${c.vehicle === 'motorbike' ? '🛵' : c.vehicle === 'bicycle' ? '🚲' : '👟'}
              </div>
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker([c.lat, c.lng], { icon: citizenIcon }).addTo(layer);
      marker.on('click', () => setSelectedCitizen(c));
    });
  }, [citizens, mapLayer]);

  // Chuyển vùng camera mượt mà (Fly-to)
  const flyToRegion = (region: 'hanoi' | 'saigon' | 'vietnam') => {
    setActiveRegion(region);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (region === 'hanoi') {
      map.flyTo(COORDS.hanoiCenter, 16, { duration: 1.8 });
    } else if (region === 'saigon') {
      map.flyTo(COORDS.saigonCenter, 16, { duration: 2.0 });
    } else {
      map.flyTo(COORDS.vietnamCenter, 6, { duration: 1.6 });
    }
  };

  const flyToHQ = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(COORDS.kocityHQ, 17, { duration: 1.5 });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none animate-fade-in">
      {/* ===== HEADER ĐIỀU KHIỂN BẢN ĐỒ VỆ TINH KOCITY ===== */}
      <header className="relative z-30 flex flex-wrap items-center justify-between border-b border-white/15 bg-slate-950/90 px-4 py-2.5 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-violet-600 text-[20px] shadow-lg shadow-pink-500/25">
            🛰️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-black tracking-tight text-white sm:text-base">
                KOCITY REAL SATELLITE METAVERSE
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/40">
                ● Ảnh Vệ Tinh Chụp Thật
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Ngắm nhìn nóc nhà, mặt nước Hồ Gươm, sông Sài Gòn & đường phố thật từ trên cao
            </p>
          </div>
        </div>

        {/* Cụm nút chuyển vùng & Chế độ Vệ tinh & Nút đóng */}
        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
          {/* Chọn Thành Phố Bay Lướt */}
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15 text-xs">
            <button
              type="button"
              onClick={() => flyToRegion('hanoi')}
              className={cx(
                'rounded-full px-3 py-1 font-semibold transition cursor-pointer',
                activeRegion === 'hanoi' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-200 hover:bg-white/20'
              )}
            >
              ⛩️ Hà Nội
            </button>
            <button
              type="button"
              onClick={flyToHQ}
              className="rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-3 py-1 font-black text-white shadow-md transition hover:opacity-95 ring-1 ring-amber-300/40 cursor-pointer"
            >
              👑 Trụ sở KOCity
            </button>
            <button
              type="button"
              onClick={() => flyToRegion('saigon')}
              className={cx(
                'rounded-full px-3 py-1 font-semibold transition cursor-pointer',
                activeRegion === 'saigon' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-200 hover:bg-white/20'
              )}
            >
              🌆 Sài Gòn
            </button>
            <button
              type="button"
              onClick={() => flyToRegion('vietnam')}
              className={cx(
                'rounded-full px-3 py-1 font-semibold transition cursor-pointer hidden md:inline-block',
                activeRegion === 'vietnam' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-200 hover:bg-white/20'
              )}
            >
              🇻🇳 Toàn Cảnh VN
            </button>
          </div>

          {/* Chọn Chế Độ Bản Đồ: Vệ Tinh / Đường Phố / Đêm */}
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15 text-xs">
            <button
              type="button"
              onClick={() => setMapLayer('satellite')}
              title="Ảnh Vệ Tinh chụp thật độ nét cao"
              className={cx(
                'rounded-full px-2.5 py-1 font-bold transition cursor-pointer flex items-center gap-1',
                mapLayer === 'satellite' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-white/20'
              )}
            >
              <span>🛰️</span>
              <span className="hidden sm:inline">Vệ Tinh</span>
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('street')}
              title="Bản đồ đường phố sáng đẹp"
              className={cx(
                'rounded-full px-2.5 py-1 font-bold transition cursor-pointer flex items-center gap-1',
                mapLayer === 'street' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/20'
              )}
            >
              <span>🗺️</span>
              <span className="hidden sm:inline">Đường Phố</span>
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('night')}
              title="Bản đồ đêm Neon Cyber"
              className={cx(
                'rounded-full px-2.5 py-1 font-bold transition cursor-pointer flex items-center gap-1',
                mapLayer === 'night' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-white/20'
              )}
            >
              <span>🌙</span>
              <span className="hidden sm:inline">Đêm Neon</span>
            </button>
          </div>

          {/* Cụm Zoom Button */}
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15">
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              title="Thu nhỏ bản đồ"
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-200 hover:bg-white/20 hover:text-white cursor-pointer"
            >
              <Icon name="remove" className="text-[16px]" />
            </button>
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              title="Phóng to bản đồ"
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-200 hover:bg-white/20 hover:text-white cursor-pointer"
            >
              <Icon name="add" className="text-[16px]" />
            </button>
          </div>

          {/* Nút đóng */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bản đồ"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 transition hover:bg-white/25 hover:scale-105 cursor-pointer ml-1"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>
      </header>

      {/* ===== KHUNG BẢN ĐỒ VỆ TINH TOÀN MÀN HÌNH ===== */}
      <div className="relative flex-1 w-full h-full bg-[#0a0518]">
        {/* Bản đồ Leaflet Container */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Thanh trạng thái định vị */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:flex flex-col gap-1.5">
          <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl ring-1 ring-white/15 text-xs text-slate-200 shadow-2xl max-w-xs">
            📍 <strong>Khu vực:</strong>{' '}
            {activeRegion === 'hanoi'
              ? 'Hồ Gươm & Phố Cổ Hà Nội'
              : activeRegion === 'saigon'
              ? 'Phố Đi Bộ Nguyễn Huệ & Quận 1 Sài Gòn'
              : 'Tuyến Kết Nối Sáng Tạo Bắc - Nam'}
          </div>
          <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-xl ring-1 ring-white/10 text-[11px] text-amber-300">
            🚲 Cư dân xong 1 job có xe đạp · 🛵 xong 3 job có xe máy
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
                Tại KOCity, mỗi chiến dịch video review bạn hoàn thành sẽ giúp bạn nâng cấp phương tiện di chuyển khắp các tuyến đường thật:
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
              className="mt-5 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 font-bold cursor-pointer"
              onClick={() => setShowHqModal(false)}
            >
              Đã hiểu, quay lại bản đồ ✨
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
              className="mt-5 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 font-bold cursor-pointer"
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
                <p className="text-xs text-slate-400">{selectedBrand.address}</p>
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
      <footer className="flex flex-wrap items-center justify-between border-t border-white/15 bg-slate-950/90 px-4 py-2 text-xs text-slate-400 sm:px-6 z-30">
        <div className="flex items-center gap-3 text-[11px]">
          <span>💡 <strong>Lăn chuột / Chạm 2 ngón tay:</strong> Zoom ngắm ảnh vệ tinh sắc nét từ trên không</span>
          <span className="hidden sm:inline">•</span>
          <span>Bấm <strong>[ ⛩️ Hà Nội ]</strong> hoặc <strong>[ 🌆 Sài Gòn ]</strong> để bay lướt camera</span>
          <span className="hidden sm:inline">•</span>
          <span>Bấm <strong>👑 Trụ sở KOCity</strong> để nhận Xe đạp 🚲 / Xe máy 🛵</span>
        </div>
        <div className="text-[10px] text-slate-500">
          KOCity Satellite Engine v5.0
        </div>
      </footer>
    </div>
  );
};
