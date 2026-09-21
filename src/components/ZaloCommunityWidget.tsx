import React, { useState } from 'react';

export const ZALO_GROUP_URL = 'https://zalo.me/g/k1auwuyha1b10yz7rntz';

export const ZaloIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="48" height="48" rx="12" fill="#0068FF" />
    <path
      d="M13 16H25.5L16.2 27.5H26.5V31H13L22.3 19.5H13V16Z"
      fill="white"
    />
    <circle cx="34" cy="22" r="2.5" fill="white" />
    <circle cx="34" cy="29" r="2.5" fill="white" />
  </svg>
);

export const ZaloCommunityWidget: React.FC<{
  onNavigateToMarketplace?: () => void;
}> = ({ onNavigateToMarketplace }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      aria-label="Hỗ trợ qua nhóm Zalo"
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3"
    >
      {/* Expanded Popover Preview */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Cửa sổ thông tin nhóm Zalo KOC"
          className="w-80 sm:w-88 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0068FF] text-white">
                <span className="font-extrabold text-sm tracking-tight">Zalo</span>
              </div>
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-900">
                  Nhóm Zalo KOC Official
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-medium">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  <span>Admin & Brand đang online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              title="Thu nhỏ"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-600 leading-relaxed">
            Tham gia nhóm Zalo để trao đổi trực tiếp với Admin KOCHub & các nhãn hàng:
          </p>

          <ul className="mt-2.5 space-y-2 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-orange-600">
                verified
              </span>
              <span>Cập nhật chiến dịch booking & nhận mẫu mới nhất</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-orange-600">
                support_agent
              </span>
              <span>Hỗ trợ đẩy nhanh duyệt hồ sơ & mã vận đơn</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-orange-600">
                forum
              </span>
              <span>Giao lưu, chia sẻ kinh nghiệm làm video lên xu hướng</span>
            </li>
          </ul>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <a
              href={ZALO_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0068FF] hover:bg-[#0052cc] py-3 text-center text-xs font-bold text-white shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">group_add</span>
              <span>VÀO NHÓM ZALO NGAY</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
            <div className="mt-2 text-center text-[10px] text-slate-400">
              Link tham gia: <span className="font-mono text-slate-600">zalo.me/g/k1auwu...</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons (Stacked Vertically) */}
      <div className="flex flex-col items-end gap-2.5">
        {/* New Job Updated Button - Positioned above Zalo button */}
        <button
          type="button"
          onClick={() => {
            if (onNavigateToMarketplace) {
              onNavigateToMarketplace();
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="group relative flex h-12 items-center gap-2 rounded-full bg-[#0068FF] hover:bg-[#0054cc] px-4 text-white shadow-lg shadow-blue-500/30 transition-all cursor-pointer animate-shake-attention hover:scale-105 active:scale-95"
          title="Xem ngay các chiến dịch và Job mới cập nhật"
        >
          {/* Subtle glowing pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-[#0068FF]/30 -z-10 animate-pulse-ring pointer-events-none" />

          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0068FF] shadow-xs">
            <span className="material-symbols-outlined text-[18px]">campaign</span>
            {/* New alert notification dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white"></span>
            </span>
          </div>
          <div className="flex flex-col text-left pr-1">
            <span className="text-[10px] font-medium text-white/85 leading-none">Cơ hội nhận mẫu</span>
            <span className="text-xs font-extrabold text-white leading-tight whitespace-nowrap">
              Job mới cập nhật !
            </span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-white/90 group-hover:translate-x-0.5 transition-transform">
            arrow_forward
          </span>
        </button>

        {/* Existing Zalo Community Button - Positioned below */}
        <a
          href={ZALO_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex h-12 items-center gap-2.5 rounded-full bg-[#0068FF] hover:bg-[#0054cc] px-4 text-white shadow-lg shadow-blue-500/30 transition-all cursor-pointer animate-shake-attention hover:scale-105 active:scale-95"
          title="Nhấp để vào nhóm Zalo KOC trao đổi trực tiếp"
        >
          {/* Subtle glowing ring behind button */}
          <span className="absolute -inset-1 rounded-full bg-[#0068FF]/30 -z-10 animate-pulse-ring pointer-events-none" />

          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0068FF] font-extrabold text-xs shadow-xs">
            Zalo
            {/* Online notification dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 border border-white"></span>
            </span>
          </div>
          <div className="flex flex-col text-left pr-1">
            <span className="text-[10px] font-medium text-white/85 leading-none">Cộng đồng KOC</span>
            <span className="text-xs font-extrabold text-white leading-tight whitespace-nowrap">Nhóm Zalo</span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-white/90 group-hover:translate-x-0.5 transition-transform">
            open_in_new
          </span>
        </a>
      </div>
    </aside>
  );
};
