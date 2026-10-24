import React, { useState, useEffect, useRef } from 'react';

// Danh sách câu thoại ngắn, thuần chữ, tuyệt đối không có icon
const SHORT_MESSAGES = [
  'Job ngon kìa bạn ơi!',
  'Mẫu xịn nè bạn ơi!',
  'Hoa hồng cao lắm nè!',
  'Bấm xem thử đi bạn!',
  'Chiến dịch hot nè bạn ơi!',
  'Vào nhận mẫu lẹ bạn ơi!',
];

export const DeliveryDroneAssistant: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [message, setMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeakTimeRef = useRef<number>(0);
  const targetPosRef = useRef({ x: -100, y: -100 });
  const animFrameRef = useRef<number | null>(null);

  // Nhận biết thiết bị di động
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hàm phát câu thoại ngẫu nhiên (có giãn cách tối thiểu 4 giây giữa các lần)
  const triggerSpeech = (customText?: string) => {
    const now = Date.now();
    if (now - lastSpeakTimeRef.current < 4000) return;
    lastSpeakTimeRef.current = now;

    const chosen = customText || SHORT_MESSAGES[Math.floor(Math.random() * SHORT_MESSAGES.length)];
    setMessage(chosen);
    setIsSpeaking(true);

    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setIsSpeaking(false);
    }, 3200);
  };

  // 1. Desktop: Drone bay mềm mại theo con trỏ chuột khi hover qua thẻ chiến dịch
  useEffect(() => {
    if (isMobile) return;

    let currentX = window.innerWidth - 120;
    let currentY = window.innerHeight - 150;

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const card = target?.closest('article, .campaign-card, [data-campaign-card]');

      if (card) {
        const rect = card.getBoundingClientRect();
        targetPosRef.current = {
          x: Math.min(window.innerWidth - 90, rect.right - 40),
          y: Math.max(70, rect.top - 30),
        };
        if (!isHoveringCard) {
          setIsHoveringCard(true);
          triggerSpeech('Job ngon kìa bạn ơi!');
        }
      } else {
        // Trôi nhẹ nhàng sau chuột với độ lệch tự nhiên
        targetPosRef.current = {
          x: Math.min(window.innerWidth - 90, e.clientX + 25),
          y: Math.max(70, e.clientY - 45),
        };
        setIsHoveringCard(false);
      }
    };

    // Vòng lặp chuyển động mượt mà (Linear Interpolation)
    const render = () => {
      currentX += (targetPosRef.current.x - currentX) * 0.12;
      currentY += (targetPosRef.current.y - currentY) * 0.12;
      setPos({ x: currentX, y: currentY });
      animFrameRef.current = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isMobile, isHoveringCard]);

  // 2. Mobile & Desktop Scroll: Lắng nghe lướt màn hình
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Kiểm tra xem có thẻ chiến dịch nào đang ở trong khung nhìn không
        const cards = document.querySelectorAll('article');
        let hasCardInView = false;
        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          if (rect.top >= 50 && rect.bottom <= window.innerHeight + 100) {
            hasCardInView = true;
          }
        });

        if (hasCardInView) {
          triggerSpeech('Job ngon kìa bạn ơi!');
        }
      }, 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  if (!visible) {
    // Nút nhỏ để gọi lại Drone nếu KOC đã từng bấm ẩn
    return (
      <button
        type="button"
        onClick={() => setVisible(true)}
        title="Bật Drone trợ lý KOCity"
        className="fixed bottom-24 left-4 z-40 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg backdrop-blur-md transition hover:scale-110 cursor-pointer border border-white/20"
      >
        <span className="text-xs font-bold">Drone</span>
      </button>
    );
  }

  // GIAO DIỆN TRÊN ĐIỆN THOẠI (Mobile): Cố định nổi ở góc trái dưới, không che nút Zalo
  if (isMobile) {
    return (
      <aside aria-label="Drone trợ lý KOCity" className="fixed bottom-20 left-3 z-40 pointer-events-auto flex items-end gap-2 select-none">
        <div
          onClick={() => triggerSpeech()}
          className="relative flex flex-col items-center cursor-pointer transition-transform active:scale-90"
        >
          {/* Bong bóng thoại câu ngắn (Thuần chữ, KHÔNG ICON) */}
          <div
            className={`absolute bottom-full left-0 mb-2 whitespace-nowrap rounded-2xl bg-slate-900/95 px-3.5 py-1.5 text-xs font-bold text-white shadow-xl backdrop-blur-md border border-white/10 transition-all duration-300 ${
              isSpeaking ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-2 pointer-events-none'
            }`}
          >
            {message}
            {/* Mũi nhọn bong bóng */}
            <div className="absolute top-full left-4 h-0 w-0 border-x-4 border-x-transparent border-t-6 border-t-slate-900/95" />
          </div>

          {/* Drone SVG */}
          <div className="h-12 w-12 animate-[bounce_3s_ease-in-out_infinite] drop-shadow-lg">
            <DroneGraphic />
          </div>
        </div>

        {/* Nút đóng nhỏ */}
        <button
          type="button"
          onClick={() => setVisible(false)}
          title="Thu gọn"
          className="h-5 w-5 rounded-full bg-slate-800/80 text-[10px] text-slate-400 hover:text-white flex items-center justify-center backdrop-blur-xs cursor-pointer border border-white/10 mb-1"
        >
          ✕
        </button>
      </aside>
    );
  }

  // GIAO DIỆN TRÊN LAPTOP / MÁY TÍNH (Desktop): Bay mượt mà theo chuột
  return (
    <aside
      aria-label="Drone trợ lý KOCity"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        pointerEvents: 'none',
      }}
      className="fixed top-0 left-0 z-50 transition-opacity duration-300 select-none"
    >
      <div className="relative pointer-events-auto group">
        {/* Bong bóng thoại câu ngắn (Thuần chữ, KHÔNG ICON) */}
        <div
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-2xl bg-slate-950/95 px-4 py-2 text-xs font-bold text-white shadow-2xl backdrop-blur-md border border-white/15 transition-all duration-300 ${
            isSpeaking ? 'opacity-100 scale-100 -translate-y-1' : 'opacity-0 scale-85 translate-y-2 pointer-events-none'
          }`}
        >
          {message}
          {/* Mũi nhọn bong bóng */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 h-0 w-0 border-x-5 border-x-transparent border-t-6 border-t-slate-950/95" />
        </div>

        {/* Drone SVG với hiệu ứng lượn */}
        <div
          onClick={() => triggerSpeech()}
          className="h-14 w-14 cursor-pointer transition-transform hover:scale-110 active:scale-95 animate-[bounce_2.5s_ease-in-out_infinite] drop-shadow-xl"
        >
          <DroneGraphic />
        </div>

        {/* Nút ẩn Drone khi hover */}
        <button
          type="button"
          onClick={() => setVisible(false)}
          title="Tạm ẩn Drone"
          className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-slate-800/90 text-[9px] text-slate-300 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/15"
        >
          ✕
        </button>
      </div>
    </aside>
  );
};

// ĐỒ HỌA CHÚ DRONE GIAO MẪU MINI BẰNG SVG VECTOR CAO CẤP
const DroneGraphic: React.FC = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <linearGradient id="droneBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
      <linearGradient id="droneVisorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
      <linearGradient id="sampleBoxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <filter id="droneGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Cánh quạt trái quay */}
    <g className="origin-[30px_22px] animate-[spin_0.35s_linear_infinite]">
      <ellipse cx="30" cy="22" rx="16" ry="3.5" fill="#94a3b8" fillOpacity="0.75" />
      <circle cx="30" cy="22" r="3" fill="#475569" />
    </g>

    {/* Cánh quạt phải quay */}
    <g className="origin-[70px_22px] animate-[spin_0.35s_linear_infinite]">
      <ellipse cx="70" cy="22" rx="16" ry="3.5" fill="#94a3b8" fillOpacity="0.75" />
      <circle cx="70" cy="22" r="3" fill="#475569" />
    </g>

    {/* Thanh càng đỡ cánh quạt */}
    <path d="M30 22 L45 38 M70 22 L55 38" stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" />

    {/* Thân chính Drone (Hình tròn Chibi) */}
    <circle cx="50" cy="45" r="22" fill="url(#droneBodyGrad)" stroke="#cbd5e1" strokeWidth="2.5" />

    {/* Mắt kính công nghệ cao (Visor) */}
    <rect x="36" y="38" width="28" height="13" rx="6.5" fill="url(#droneVisorGrad)" filter="url(#droneGlow)" />
    {/* Đốm sáng trên mắt kính */}
    <circle cx="43" cy="43" r="2.5" fill="#ffffff" />
    <circle cx="57" cy="43" r="2.5" fill="#ffffff" />

    {/* Đèn tín hiệu nhỏ trên đỉnh */}
    <circle cx="50" cy="23" r="3" fill="#10b981" className="animate-pulse" />

    {/* Dây treo hộp quà mẫu */}
    <path d="M44 67 L44 74 M56 67 L56 74" stroke="#475569" strokeWidth="2" strokeDasharray="2 2" />

    {/* Hộp hàng mẫu 0đ mini treo dưới bụng Drone */}
    <g transform="translate(37, 73)">
      <rect x="0" y="0" width="26" height="20" rx="4" fill="url(#sampleBoxGrad)" stroke="#d97706" strokeWidth="1.5" />
      {/* Nơ ruy băng hộp quà */}
      <rect x="11" y="0" width="4" height="20" fill="#ffffff" fillOpacity="0.9" />
      <rect x="0" y="8" width="26" height="4" fill="#ffffff" fillOpacity="0.9" />
    </g>
  </svg>
);
