import React from 'react';

interface FooterProps {
  onOpenBrandContact?: () => void;
  onOpenGuidelines?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBrandContact,
  onOpenGuidelines,
}) => {
  return (
    <footer id="footer-section" className="mt-12 border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Main row divided into 3 clear balanced sections: Ki ô xây (Left), Mạng xã hội (Middle), Hợp tác Brand (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pb-5 border-b border-slate-100">
          {/* Phần 1 (Bên trái): Ki ô xây */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white shadow-xs">
                <span className="material-symbols-outlined text-base">hub</span>
              </div>
              <span className="font-['Plus_Jakarta_Sans'] text-base font-extrabold tracking-tight text-slate-900">
                Ki ô <span className="text-orange-600">xây</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cổng nhận mẫu sản phẩm 0đ và booking KOC hàng đầu Việt Nam.
            </p>
            {onOpenGuidelines && (
              <button
                type="button"
                onClick={onOpenGuidelines}
                className="text-left text-xs text-slate-500 hover:text-orange-600 hover:underline transition-colors cursor-pointer block pt-0.5"
              >
                Hướng dẫn nhận mẫu & hoa hồng
              </button>
            )}
          </div>

          {/* Phần 2 (Ở giữa): Mạng xã hội */}
          <div className="space-y-1.5">
            <h4 className="font-['Plus_Jakarta_Sans'] text-xs font-bold uppercase tracking-wider text-slate-900">
              Mạng xã hội
            </h4>
            <div className="flex flex-col space-y-1 text-xs">
              <a
                href="https://www.tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-orange-600 hover:underline transition-colors w-fit"
              >
                TikTok Ki ô xây
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-orange-600 hover:underline transition-colors w-fit"
              >
                Facebook Fanpage
              </a>
              <a
                href="https://www.threads.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-orange-600 hover:underline transition-colors w-fit"
              >
                Threads Official
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
                  className="text-left font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors cursor-pointer w-fit"
                >
                  Gửi thông tin hợp tác nhãn hàng
                </button>
              )}
              <a
                href="tel:0988889999"
                className="text-slate-600 hover:text-orange-600 transition-colors w-fit"
              >
                <span className="text-slate-500">Hotline/Zalo: </span>
                <span className="font-semibold text-slate-800 hover:underline">098.888.9999</span>
              </a>
              <a
                href="mailto:brand@kioxay.vn"
                className="text-slate-600 hover:text-orange-600 transition-colors w-fit"
              >
                <span className="text-slate-500">Email: </span>
                <span className="font-medium text-slate-700 hover:underline">brand@kioxay.vn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Chân trang đáy */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <p>© 2025 Ki ô xây. Nền tảng kết nối KOC & Brand hàng đầu Việt Nam.</p>
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
