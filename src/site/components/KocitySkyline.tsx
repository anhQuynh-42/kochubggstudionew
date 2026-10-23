import React from 'react';

/**
 * KocitySkyline - Dải thành phố (Skyline Silhouette 2 lớp)
 * Tái hiện thành phố KOCity với các toà nhà studio, tháp truyền hình phát sóng,
 * ánh đèn cửa sổ và beacon nhấp nháy, chuyển tiếp mượt mà từ Hero banner xuống hàng LIVE.
 */
export const KocitySkyline: React.FC<{ className?: string; isNight?: boolean }> = ({
  className = '',
  isNight = false,
}) => {
  return (
    <div
      aria-hidden="true"
      className={`relative w-full overflow-hidden select-none pointer-events-none transition-all duration-700 ${className}`}
    >
      <style>{`
        @keyframes kocityBeacon {
          0%, 100% { opacity: 0.35; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes kocitySignalWave {
          0% { r: 2px; opacity: 0.95; stroke-width: 1.5px; }
          100% { r: 16px; opacity: 0; stroke-width: 0.5px; }
        }
        @keyframes kocityWindow1 {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.95; }
        }
        @keyframes kocityWindow2 {
          0%, 100% { opacity: 0.9; }
          40% { opacity: 0.25; }
          75% { opacity: 0.85; }
        }
        @keyframes kocityWindow3 {
          0%, 100% { opacity: 0.5; }
          30% { opacity: 1; }
          70% { opacity: 0.2; }
        }
        @keyframes kocityBillboardPulse {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; filter: drop-shadow(0 0 6px rgba(236, 72, 153, 0.6)); }
        }
        .kc-beacon-pink {
          transform-origin: 720px 4px;
          animation: kocityBeacon 1.8s ease-in-out infinite;
        }
        .kc-beacon-violet {
          transform-origin: 375px 8px;
          animation: kocityBeacon 2.3s ease-in-out infinite 0.4s;
        }
        .kc-beacon-amber {
          transform-origin: 1245px 6px;
          animation: kocityBeacon 2s ease-in-out infinite 0.9s;
        }
        .kc-wave-1 {
          animation: kocitySignalWave 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        }
        .kc-wave-2 {
          animation: kocitySignalWave 2.4s cubic-bezier(0, 0.2, 0.8, 1) infinite 1.2s;
        }
        @keyframes kocityDanglingLegs {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(8deg); }
        }
        .kc-dangling-legs {
          transform-origin: 236.5px 40px;
          animation: kocityDanglingLegs 2.2s ease-in-out infinite;
        }
        .kc-w1 { animation: kocityWindow1 3.2s ease-in-out infinite; }
        .kc-w2 { animation: kocityWindow2 2.7s ease-in-out infinite 0.5s; }
        .kc-w3 { animation: kocityWindow3 3.8s ease-in-out infinite 1.1s; }
        .kc-billboard { animation: kocityBillboardPulse 2.5s ease-in-out infinite; }
      `}</style>

      <svg
        viewBox="0 0 1440 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="block h-14 w-full sm:h-20 md:h-24 lg:h-26"
      >
        <defs>
          {/* Vùng hừng sáng chân trời ban đêm (Backlight glow) giúp toà nhà không bị chìm */}
          <linearGradient id="kc-night-horizon-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0" />
            <stop offset="45%" stopColor="#a855f7" stopOpacity="0.45" />
            <stop offset="75%" stopColor="#ec4899" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fafafc" stopOpacity="0" />
          </linearGradient>

          {/* Dải neon viền nóc toà nhà ban đêm */}
          <linearGradient id="kc-neon-roofline" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e879f9" />
            <stop offset="25%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#f472b6" />
            <stop offset="75%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Lớp xa: tím nhạt ban ngày hoặc tím than sâu ban đêm */}
          <linearGradient id="kc-skyline-back" x1="720" y1="0" x2="720" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isNight ? '#4c1d95' : '#a78bfa'} stopOpacity={isNight ? 0.95 : 0.45} />
            <stop offset="55%" stopColor={isNight ? '#3b0764' : '#c4b5fd'} stopOpacity={isNight ? 0.85 : 0.3} />
            <stop offset="100%" stopColor={isNight ? '#f8f7ff' : '#fafafc'} stopOpacity={isNight ? 0.05 : 0.15} />
          </linearGradient>

          {/* Lớp gần: tím hồng rực rỡ mang bản sắc KOCity */}
          <linearGradient id="kc-skyline-front" x1="720" y1="18" x2="720" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isNight ? '#7c3aed' : '#8b5cf6'} stopOpacity={isNight ? 0.95 : 0.65} />
            <stop offset="35%" stopColor={isNight ? '#9333ea' : '#a855f7'} stopOpacity={isNight ? 0.9 : 0.55} />
            <stop offset="70%" stopColor={isNight ? '#c026d3' : '#ec4899'} stopOpacity={isNight ? 0.8 : 0.35} />
            <stop offset="100%" stopColor={isNight ? '#f8f7ff' : '#fafafc'} stopOpacity={0.95} />
          </linearGradient>

          {/* Màn sương đáy làm mượt đường nối với nền trang (Phương án 1: Loang mềm mại từ Hero xuống #f8f7ff) */}
          <linearGradient id="kc-skyline-fog" x1="720" y1="42" x2="720" y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isNight ? '#f8f7ff' : '#fafafc'} stopOpacity="0" />
            <stop offset="50%" stopColor={isNight ? '#f8f7ff' : '#fafafc'} stopOpacity={isNight ? 0.6 : 0.45} />
            <stop offset="85%" stopColor={isNight ? '#f8f7ff' : '#fafafc'} stopOpacity={isNight ? 0.95 : 0.85} />
            <stop offset="100%" stopColor={isNight ? '#f8f7ff' : '#fafafc'} stopOpacity="1" />
          </linearGradient>

          {/* Gradient bảng đèn LED KOCity */}
          <linearGradient id="kc-led-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* ===== VÙNG HỪNG SÁNG CHÂN TRỜI KHI TẮT ĐÈN (giúp thành phố nổi bật, không bị chìm) ===== */}
        {isNight && (
          <rect x="0" y="10" width="1440" height="80" fill="url(#kc-night-horizon-glow)" />
        )}

        {/* ===== SÓNG TÍN HIỆU PHÁT SÓNG TỪ THÁP TRUYỀN HÌNH CHÍNH (x=720, y=4) ===== */}
        <circle cx="720" cy="4" fill="none" stroke="#ec4899" className="kc-wave-1" />
        <circle cx="720" cy="4" fill="none" stroke="#8b5cf6" className="kc-wave-2" />

        {/* ===== LỚP XA: SILHOUETTE TÒA NHÀ NỀN (FAR LAYER) ===== */}
        <path
          d="
            M 0,96
            L 0,54
            L 36,54 L 36,44 L 72,44 L 72,60
            L 96,60 L 96,32 L 115,14 L 115,32 L 138,32 L 138,64
            L 175,64 L 175,46 L 225,46 L 225,62
            L 260,62 L 260,34 L 310,34 L 310,66
            L 350,66 L 350,22 L 375,8 L 400,22 L 400,60
            L 445,60 L 445,40 L 495,40 L 495,66
            L 540,66 L 540,28 L 585,28 L 585,58
            L 630,58 L 630,36 L 680,36
            L 705,18 L 720,4 L 735,18 L 760,36
            L 805,36 L 805,54 L 850,54 L 850,26 L 900,26 L 900,62
            L 945,62 L 945,38 L 970,16 L 995,38 L 995,66
            L 1040,66 L 1040,44 L 1090,44 L 1090,60
            L 1130,60 L 1130,30 L 1180,30 L 1180,64
            L 1220,64 L 1220,20 L 1245,6 L 1270,20 L 1270,56
            L 1315,56 L 1315,40 L 1365,40 L 1365,60
            L 1400,60 L 1400,48 L 1440,48
            L 1440,96
            Z
          "
          fill="url(#kc-skyline-back)"
        />

        {/* ===== LỚP GẦN: KIẾN TRÚC HIỆN ĐẠI KOCITY (NEAR LAYER) ===== */}
        <path
          d="
            M 0,96
            L 0,68
            L 45,68 L 45,56 L 85,56 L 85,74
            L 120,74 L 120,48 L 155,48 L 155,70
            L 190,70 L 190,40 L 240,40 L 240,66
            L 280,66 L 280,50 L 330,50 L 330,72
            L 370,72 L 370,36 L 420,36 L 420,62
            L 460,62 L 460,46 L 510,46 L 510,70
            L 555,70 L 555,34 L 605,34 L 605,64
            L 645,64 L 645,44 L 675,44 L 675,24 L 710,24 L 710,44 L 745,44 L 745,66
            L 785,66 L 785,42 L 835,42 L 835,68
            L 875,68 L 875,32 L 925,32 L 925,62
            L 965,62 L 965,48 L 1015,48 L 1015,72
            L 1060,72 L 1060,38 L 1110,38 L 1110,66
            L 1150,66 L 1150,52 L 1200,52 L 1200,74
            L 1240,74 L 1240,36 L 1290,36 L 1290,64
            L 1335,64 L 1335,48 L 1385,48 L 1385,68
            L 1440,68
            L 1440,96
            Z
          "
          fill="url(#kc-skyline-front)"
        />

        {/* Nét viền neon nóc toà nhà (chỉ viền nóc bên trên, tuyệt đối không viền đáy tránh vệt đen) */}
        {isNight && (
          <path
            d="
              M 0,68
              L 45,68 L 45,56 L 85,56 L 85,74
              L 120,74 L 120,48 L 155,48 L 155,70
              L 190,70 L 190,40 L 240,40 L 240,66
              L 280,66 L 280,50 L 330,50 L 330,72
              L 370,72 L 370,36 L 420,36 L 420,62
              L 460,62 L 460,46 L 510,46 L 510,70
              L 555,70 L 555,34 L 605,34 L 605,64
              L 645,64 L 645,44 L 675,44 L 675,24 L 710,24 L 710,44 L 745,44 L 745,66
              L 785,66 L 785,42 L 835,42 L 835,68
              L 875,68 L 875,32 L 925,32 L 925,62
              L 965,62 L 965,48 L 1015,48 L 1015,72
              L 1060,72 L 1060,38 L 1110,38 L 1110,66
              L 1150,66 L 1150,52 L 1200,52 L 1200,74
              L 1240,74 L 1240,36 L 1290,36 L 1290,64
              L 1335,64 L 1335,48 L 1385,48 L 1385,68
              L 1440,68
            "
            fill="none"
            stroke="url(#kc-neon-roofline)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* ===== ĐÈN CỬA SỔ PHÁT SÁNG NHẤP NHÁY (WINDOW LIGHTS) ===== */}
        {/* Nhóm 1: Cửa sổ tòa nhà 190-240 */}
        <g fill="#fef08a" opacity="0.85">
          <rect x="200" y="46" width="3" height="4" rx="0.5" className="kc-w1" />
          <rect x="208" y="46" width="3" height="4" rx="0.5" className="kc-w2" />
          <rect x="216" y="46" width="3" height="4" rx="0.5" className="kc-w3" />
          <rect x="224" y="46" width="3" height="4" rx="0.5" className="kc-w1" />
          <rect x="200" y="54" width="3" height="4" rx="0.5" className="kc-w2" />
          <rect x="216" y="54" width="3" height="4" rx="0.5" className="kc-w1" />
          <rect x="224" y="54" width="3" height="4" rx="0.5" className="kc-w3" />
        </g>

        {/* Nhóm 2: Cửa sổ tòa nhà 370-420 */}
        <g fill="#a5f3fc" opacity="0.9">
          <rect x="380" y="42" width="3.5" height="4" rx="0.5" className="kc-w2" />
          <rect x="390" y="42" width="3.5" height="4" rx="0.5" className="kc-w1" />
          <rect x="400" y="42" width="3.5" height="4" rx="0.5" className="kc-w3" />
          <rect x="380" y="50" width="3.5" height="4" rx="0.5" className="kc-w3" />
          <rect x="390" y="50" width="3.5" height="4" rx="0.5" className="kc-w2" />
          <rect x="400" y="50" width="3.5" height="4" rx="0.5" className="kc-w1" />
        </g>

        {/* Nhóm 3: Bảng điện tử LED Studio KOCity (x=562, y=40) */}
        <g className="kc-billboard">
          <rect x="562" y="40" width="36" height="15" rx="3" fill="url(#kc-led-grad)" />
          <rect x="564" y="42" width="32" height="11" rx="2" fill="#180c2e" />
          <circle cx="570" cy="47.5" r="1.5" fill="#ec4899" className="kc-beacon-pink" />
          <text
            x="574"
            y="50"
            fill="#ffffff"
            fontSize="6.5"
            fontWeight="bold"
            fontFamily="system-ui, sans-serif"
            letterSpacing="0.5"
          >
            KOCity
          </text>
        </g>

        {/* Nhóm 4: Cửa sổ tháp trung tâm (x=675-710) */}
        <g fill="#fef08a" opacity="0.85">
          <rect x="682" y="30" width="3" height="3" rx="0.5" className="kc-w1" />
          <rect x="690" y="30" width="3" height="3" rx="0.5" className="kc-w3" />
          <rect x="698" y="30" width="3" height="3" rx="0.5" className="kc-w2" />
          <rect x="682" y="36" width="3" height="3" rx="0.5" className="kc-w2" />
          <rect x="698" y="36" width="3" height="3" rx="0.5" className="kc-w1" />
        </g>

        {/* Nhóm 5: Cửa sổ tòa nhà 785-835 */}
        <g fill="#fbcfe8" opacity="0.85">
          <rect x="795" y="48" width="3.5" height="4" rx="0.5" className="kc-w3" />
          <rect x="805" y="48" width="3.5" height="4" rx="0.5" className="kc-w1" />
          <rect x="815" y="48" width="3.5" height="4" rx="0.5" className="kc-w2" />
          <rect x="795" y="56" width="3.5" height="4" rx="0.5" className="kc-w2" />
          <rect x="815" y="56" width="3.5" height="4" rx="0.5" className="kc-w3" />
        </g>

        {/* Nhóm 6: Cửa sổ tòa nhà 875-925 */}
        <g fill="#a5f3fc" opacity="0.85">
          <rect x="886" y="38" width="3" height="4" rx="0.5" className="kc-w1" />
          <rect x="896" y="38" width="3" height="4" rx="0.5" className="kc-w2" />
          <rect x="906" y="38" width="3" height="4" rx="0.5" className="kc-w3" />
          <rect x="886" y="46" width="3" height="4" rx="0.5" className="kc-w3" />
          <rect x="906" y="46" width="3" height="4" rx="0.5" className="kc-w1" />
        </g>

        {/* Nhóm 7: Cửa sổ tòa nhà 1060-1110 */}
        <g fill="#fef08a" opacity="0.85">
          <rect x="1072" y="44" width="3.5" height="4" rx="0.5" className="kc-w2" />
          <rect x="1082" y="44" width="3.5" height="4" rx="0.5" className="kc-w1" />
          <rect x="1092" y="44" width="3.5" height="4" rx="0.5" className="kc-w3" />
          <rect x="1072" y="52" width="3.5" height="4" rx="0.5" className="kc-w1" />
          <rect x="1092" y="52" width="3.5" height="4" rx="0.5" className="kc-w2" />
        </g>

        {/* Nhóm 8: Cửa sổ tòa nhà 1240-1290 */}
        <g fill="#fed7aa" opacity="0.85">
          <rect x="1252" y="42" width="3" height="4" rx="0.5" className="kc-w3" />
          <rect x="1262" y="42" width="3" height="4" rx="0.5" className="kc-w1" />
          <rect x="1272" y="42" width="3" height="4" rx="0.5" className="kc-w2" />
          <rect x="1252" y="50" width="3" height="4" rx="0.5" className="kc-w1" />
          <rect x="1272" y="50" width="3" height="4" rx="0.5" className="kc-w3" />
        </g>

        {/* ===== ĐÈN TÍN HIỆU BEACON TRÊN CÁC NÓC THÁP (ANTENNA BEACONS) ===== */}
        {/* Tháp trung tâm (Landmark chính) */}
        <circle cx="720" cy="4" r="2.5" fill="#ec4899" className="kc-beacon-pink" />
        <circle cx="720" cy="4" r="1" fill="#ffffff" />

        {/* Tháp trái */}
        <circle cx="375" cy="8" r="2" fill="#8b5cf6" className="kc-beacon-violet" />
        <circle cx="375" cy="8" r="0.8" fill="#ffffff" />

        {/* Tháp phải */}
        <circle cx="1245" cy="6" r="2" fill="#f43f5e" className="kc-beacon-amber" />
        <circle cx="1245" cy="6" r="0.8" fill="#ffffff" />

        {/* Tháp phụ xa */}
        <circle cx="115" cy="14" r="1.5" fill="#a855f7" opacity="0.75" />
        <circle cx="970" cy="16" r="1.5" fill="#ec4899" opacity="0.75" />

        {/* ===== ĐIỂM XUYẾT 2 BÓNG CREATOR VECTOR RÕ NÉT TRÊN NÓC NHÀ ===== */}
        {/* Điểm xuyết 1: Bạn KOC ngồi vắt vẻo mép nóc toà nhà (x=240, y=40) đung đưa chân + điện thoại selfie phát sáng */}
        <g id="koc-tiny-sitting">
          {/* Đầu & búi tóc kẹp */}
          <circle cx="230" cy="18" r="5" fill="#3b0764" />
          <circle cx="225" cy="15" r="2.4" fill="#3b0764" />

          {/* Thân ngồi tựa thoải mái */}
          <path
            d="M 225,23 C 225,23 235,23 236,27 L 238,39 L 224,39 Z"
            fill="#3b0764"
          />

          {/* Cánh tay giơ điện thoại quay selfie */}
          <path
            d="M 226,27 L 218,25"
            stroke="#3b0764"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Điện thoại phát sáng trên tay */}
          <rect
            x="214"
            y="20"
            width="4.5"
            height="7.5"
            rx="1"
            fill="#ffffff"
            filter={isNight ? 'drop-shadow(0 0 6px #38bdf8) drop-shadow(0 0 10px #ffffff)' : 'drop-shadow(0 0 3px #ffffff)'}
          />
          <rect x="215" y="21" width="2.5" height="5.5" rx="0.5" fill="#38bdf8" />

          {/* Đôi chân vắt qua mép tường đung đưa */}
          <g className="kc-dangling-legs">
            {/* Đùi gác qua mép */}
            <path d="M 235,37 L 244,38 L 244,43 L 235,42 Z" fill="#3b0764" />
            {/* Cẳng chân thả thõng */}
            <path d="M 241,41 L 243,53 L 247,53 L 244,41 Z" fill="#3b0764" />
            {/* Giày sneaker hồng */}
            <path d="M 243,51 L 249,53 L 248,55 L 242,54 Z" fill="#ec4899" />
          </g>
        </g>

        {/* Điểm xuyết 2: Bạn KOC livestream cạnh cây đèn Ring light trên sân thượng (x=790-825, y=42) */}
        <g id="koc-tiny-livestream">
          {/* Bạn KOC đứng: Đầu & Tai nghe tai mèo phát sáng */}
          <circle cx="798" cy="18" r="5" fill="#3b0764" />
          <path d="M 794,15 L 795,10.5 L 798,14 Z" fill="#ec4899" />
          <path d="M 798,14 L 801,10.5 L 802,15 Z" fill="#ec4899" />

          {/* Thân người đứng dáng Creator */}
          <path
            d="M 793,23 L 803,23 L 804,42 L 792,42 Z"
            fill="#3b0764"
          />

          {/* Cánh tay giơ tương tác camera */}
          <path
            d="M 801,27 L 808,24"
            stroke="#3b0764"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* CÂY ĐÈN RING LIGHT TRÊN TRIPOD */}
          {/* 3 Chân tripod */}
          <line x1="818" y1="26" x2="818" y2="42" stroke="#3b0764" strokeWidth="1.8" />
          <line x1="818" y1="33" x2="812" y2="42" stroke="#3b0764" strokeWidth="1.8" />
          <line x1="818" y1="33" x2="824" y2="42" stroke="#3b0764" strokeWidth="1.8" />

          {/* Vòng tròn Ring light phát sáng tròn rõ rệt */}
          <circle
            cx="818"
            cy="17"
            r="8"
            fill="rgba(254, 240, 138, 0.3)"
            stroke="#ffffff"
            strokeWidth={isNight ? 3 : 2.5}
            filter={isNight ? 'drop-shadow(0 0 8px #ffffff) drop-shadow(0 0 14px #ec4899)' : 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.95))'}
          />
          {/* Smartphone kẹp giữa Ring light */}
          <rect x="816.5" y="14" width="3" height="6" rx="0.5" fill="#ec4899" />
          <circle cx="818" cy="17" r="1.2" fill="#ffffff" className="kc-w1" />
        </g>

        {/* ===== MÀN SƯƠNG ĐÁY CHUYỂN TIẾP MƯỢT VÀO NỀN TRANG (BOTTOM FOG) ===== */}
        <rect x="0" y="42" width="1440" height="55" fill="url(#kc-skyline-fog)" />
      </svg>
    </div>
  );
};
