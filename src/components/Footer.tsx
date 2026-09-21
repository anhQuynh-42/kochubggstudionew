import React from 'react';
import { ZALO_GROUP_URL } from './ZaloCommunityWidget';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm">
            <span className="material-symbols-outlined text-[14px]">hub</span>
          </div>
          <span className="text-xs font-semibold text-slate-800">
            KOCHub © 2025 Nền tảng kết nối KOC & Brand hàng đầu Việt Nam
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-medium">
          <a
            href={ZALO_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-bold text-orange-950 hover:text-orange-600 hover:underline"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded bg-orange-500 text-[8px] font-black text-white shadow-sm">
              Z
            </span>
            <span>Nhóm Zalo KOC (Trao đổi trực tiếp)</span>
            <span className="material-symbols-outlined text-[12px]">open_in_new</span>
          </a>
          <a href="#rules" onClick={(e) => e.preventDefault()} className="hover:text-orange-600 transition-colors">
            Quy định duyệt mẫu
          </a>
          <a href="#commission" onClick={(e) => e.preventDefault()} className="hover:text-orange-600 transition-colors">
            Chính sách hoa hồng
          </a>
          <span className="rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-[11px] font-bold text-orange-800">
            ⚡ Hỏa tốc 24H GHTK
          </span>
        </div>
      </div>
    </footer>
  );
};
