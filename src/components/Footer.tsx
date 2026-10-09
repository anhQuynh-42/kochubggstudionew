import React from 'react';
import { KOCUser } from '../types';

interface FooterProps {
  onOpenBrandContact?: () => void;
  onOpenGuidelines?: () => void;
  currentUser?: KOCUser | null;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBrandContact,
  onOpenGuidelines,
  currentUser,
}) => {
  return (
    <footer id="footer-section" className="mt-12 border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Main row divided into 3 clear balanced sections: Kocity (Left), Mạng xã hội (Middle), Hợp tác Brand (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pb-5 border-b border-slate-100">
          {/* Phần 1 (Bên trái): Kocity */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#613bd1] to-[#316bbf] text-white shadow-xs">
                <span className="material-symbols-outlined text-base">hub</span>
              </div>
              <span className="font-['Plus_Jakarta_Sans'] text-base font-extrabold tracking-tight text-slate-900">
                Ko<span className="text-[#613bd1]">city</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cổng nhận mẫu sản phẩm 0đ và booking KOC hàng đầu Việt Nam.
            </p>
            {onOpenGuidelines && currentUser?.role !== 'admin' && (
              <button
                type="button"
                onClick={onOpenGuidelines}
                className="text-left text-xs text-slate-500 hover:text-[#613bd1] hover:underline transition-colors cursor-pointer block pt-0.5"
              >
                Hướng dẫn nhận mẫu & hoa hồng
              </button>
            )}
          </div>

          {/* Phần 2 (Ở giữa): Mạng xã hội */}
          <div className="space-y-2">
            <h4 className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider text-slate-900">
              Mạng xã hội Kocity
            </h4>
            <div className="flex flex-col space-y-2 text-xs">
              <a
                href="https://www.tiktok.com/@kocityvn?_r=1&_t=ZS-9A8gzzNTl0m"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-slate-600 hover:text-black transition-colors w-fit"
                title="Kênh TikTok chính thức của Kocity: @kocityvn"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-slate-200 text-slate-900 transition-colors shadow-xs">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.31 0 .61.05.89.14V9.45a6.34 6.34 0 0 0-.89-.06 6.34 6.34 0 1 0 6.34 6.34V8.58a8.28 8.28 0 0 0 4.76 1.57V6.69z"/>
                  </svg>
                </span>
                <span className="font-semibold group-hover:underline">TikTok: @kocityvn</span>
                <span className="material-symbols-outlined text-[13px] text-slate-400 group-hover:text-slate-700">open_in_new</span>
              </a>

              <a
                href="https://www.facebook.com/share/g/1EwZtfF6Ru/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-slate-600 hover:text-[#1877F2] transition-colors w-fit"
                title="Nhóm Facebook Cộng đồng KOC Kocity"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 text-[#1877F2] transition-colors shadow-xs">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </span>
                <span className="font-semibold group-hover:underline">Facebook: Cộng đồng KOCITY</span>
                <span className="material-symbols-outlined text-[13px] text-slate-400 group-hover:text-slate-700">open_in_new</span>
              </a>

              <a
                href="https://www.threads.com/@kocity_booking?igshid=NTc4MTIwNjQ2YQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-slate-600 hover:text-black transition-colors w-fit"
                title="Kênh Threads Kocity: @kocity_booking"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-slate-200 text-slate-900 transition-colors shadow-xs">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.186 24C5.58 24 0 18.57 0 12.146 0 5.72 5.58.293 12.186.293c6.43 0 11.758 5.12 11.758 11.853 0 .73-.06 1.45-.19 2.15l-3.23-.55c.1-.53.15-1.07.15-1.6 0-4.99-3.83-8.81-8.488-8.81-4.78 0-8.666 3.93-8.666 8.81 0 4.88 3.886 8.81 8.666 8.81 2.37 0 4.54-.93 6.13-2.61l2.36 2.3c-2.22 2.33-5.22 3.61-8.49 3.61v.001zm3.83-8.23c-.35 1.55-1.52 2.58-3.08 2.58-1.92 0-3.37-1.49-3.37-3.48 0-1.99 1.45-3.48 3.37-3.48 1.48 0 2.65.92 3.03 2.34l-6.27 1.43c.12.82.77 1.42 1.62 1.42.79 0 1.41-.5 1.63-1.22l3.07.41zm-3.15-4.13c-.76 0-1.37.49-1.55 1.19l3.05-.7c-.24-.49-.78-.49-1.5-.49z"/>
                  </svg>
                </span>
                <span className="font-semibold group-hover:underline">Threads: @kocity_booking</span>
                <span className="material-symbols-outlined text-[13px] text-slate-400 group-hover:text-slate-700">open_in_new</span>
              </a>
            </div>
          </div>

          {/* Phần 3 (Bên phải): Hợp tác Brand */}
          <div className="space-y-1.5">
            <h4 className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider text-slate-900">
              Hợp tác Brand
            </h4>
            <div className="flex flex-col space-y-1 text-xs">
              {onOpenBrandContact && (
                <button
                  type="button"
                  onClick={onOpenBrandContact}
                  className="text-left font-semibold text-[#613bd1] hover:text-[#316bbf] hover:underline transition-colors cursor-pointer w-fit"
                >
                  Gửi thông tin hợp tác nhãn hàng
                </button>
              )}
              <a
                href="tel:0988889999"
                className="text-slate-600 hover:text-[#613bd1] transition-colors w-fit"
              >
                <span className="text-slate-500">Hotline/Zalo: </span>
                <span className="font-semibold text-slate-800 hover:underline">098.888.9999</span>
              </a>
              <a
                href="mailto:brand@kocity.vn"
                className="text-slate-600 hover:text-[#613bd1] transition-colors w-fit"
              >
                <span className="text-slate-500">Email: </span>
                <span className="font-medium text-slate-700 hover:underline">brand@kocity.vn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Chân trang đáy */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>© 2025 Kocity. Nền tảng kết nối KOC & Brand hàng đầu Việt Nam.</p>
          <div className="flex items-center gap-3">
            <span>Duyệt mẫu 24/7</span>
            <span>•</span>
            <span>Ký quỹ Escrow minh bạch</span>
            <span>•</span>
            <span>Giao mẫu nhanh</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
