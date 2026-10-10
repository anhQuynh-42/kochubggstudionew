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

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-600">Kênh Kocity:</span>
              <div className="flex items-center gap-1.5">
                <a
                  href="https://www.tiktok.com/@kocityvn?_r=1&_t=ZS-9A8gzzNTl0m"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-700 hover:text-black transition-colors"
                  title="TikTok: @kocityvn"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.31 0 .61.05.89.14V9.45a6.34 6.34 0 0 0-.89-.06 6.34 6.34 0 1 0 6.34 6.34V8.58a8.28 8.28 0 0 0 4.76 1.57V6.69z"/>
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/share/g/1EwZtfF6Ru/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-md hover:bg-blue-50 text-slate-700 hover:text-[#1877F2] transition-colors"
                  title="Facebook: Cộng đồng KOCITY"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://www.threads.com/@kocity_booking?igshid=NTc4MTIwNjQ2YQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-700 hover:text-black transition-colors"
                  title="Threads: @kocity_booking"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.186 24C5.58 24 0 18.57 0 12.146 0 5.72 5.58.293 12.186.293c6.43 0 11.758 5.12 11.758 11.853 0 .73-.06 1.45-.19 2.15l-3.23-.55c.1-.53.15-1.07.15-1.6 0-4.99-3.83-8.81-8.488-8.81-4.78 0-8.666 3.93-8.666 8.81 0 4.88 3.886 8.81 8.666 8.81 2.37 0 4.54-.93 6.13-2.61l2.36 2.3c-2.22 2.33-5.22 3.61-8.49 3.61v.001zm3.83-8.23c-.35 1.55-1.52 2.58-3.08 2.58-1.92 0-3.37-1.49-3.37-3.48 0-1.99 1.45-3.48 3.37-3.48 1.48 0 2.65.92 3.03 2.34l-6.27 1.43c.12.82.77 1.42 1.62 1.42.79 0 1.41-.5 1.63-1.22l3.07.41zm-3.15-4.13c-.76 0-1.37.49-1.55 1.19l3.05-.7c-.24-.49-.78-.49-1.5-.49z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons (Stacked Vertically, Compact Circular Shape) */}
      <div className="flex flex-col items-end gap-2.5">
        {/* 1. New Job Updated Button - Circular compact shape */}
        <button
          type="button"
          onClick={() => {
            if (onNavigateToMarketplace) {
              onNavigateToMarketplace();
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 via-rose-600 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-lg shadow-rose-500/30 transition-all cursor-pointer animate-shake-delayed hover:scale-110 active:scale-95"
          title="Xem ngay các chiến dịch và Job mới cập nhật"
          aria-label="Job mới cập nhật"
        >
          {/* Subtle glowing pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-rose-500/25 -z-10 animate-pulse-ring pointer-events-none" />

          {/* Icon loa chiến dịch */}
          <span className="material-symbols-outlined text-[20px] sm:text-[22px] drop-shadow-xs">
            campaign
          </span>

          {/* New alert notification dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 border-2 border-white shadow-xs"></span>
          </span>

          {/* Tooltip on hover (Desktop) */}
          <span className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-bold rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
            Job mới cập nhật !
          </span>
        </button>

        {/* 2. Zalo Community Button - Circular compact shape */}
        <a
          href={ZALO_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#0068FF] hover:bg-[#0054cc] text-white shadow-lg shadow-blue-500/35 transition-all cursor-pointer animate-shake-attention hover:scale-110 active:scale-95"
          title="Nhấp để vào nhóm Zalo KOC trao đổi trực tiếp"
          aria-label="Nhóm Zalo KOC"
        >
          {/* Subtle glowing ring behind button */}
          <span className="absolute -inset-1 rounded-full bg-[#0068FF]/30 -z-10 animate-pulse-ring pointer-events-none" />

          {/* Chữ Zalo thương hiệu */}
          <span className="font-black text-[13px] sm:text-[14px] tracking-tight drop-shadow-xs">
            Zalo
          </span>

          {/* Online notification dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white shadow-xs"></span>
          </span>

          {/* Tooltip on hover (Desktop) */}
          <span className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-bold rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
            Nhóm Zalo KOC
          </span>
        </a>
      </div>
    </aside>
  );
};
