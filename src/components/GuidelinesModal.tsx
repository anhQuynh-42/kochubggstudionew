import React from 'react';
import { ZALO_GROUP_URL } from './ZaloCommunityWidget';

interface GuidelinesModalProps {
  onClose: () => void;
}

export const GuidelinesModal: React.FC<GuidelinesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl overflow-hidden my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-900 text-2xl">verified_user</span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl font-extrabold text-slate-900">
              Quy trình & Hướng dẫn dành cho KOC
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {/* Step 1 */}
          <div className="rounded-2xl bg-slate-50 p-4 sm:p-4.5 border border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#613bd1] text-white font-black text-sm shadow-sm">
                1
              </div>
              <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Đăng ký tham gia
                </h3>
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-[#613bd1]">
                  Duyệt trong 12h
                </span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl bg-slate-50 p-4 sm:p-4.5 border border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#316bbf] text-white font-black text-sm shadow-sm">
                2
              </div>
              <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span>KOC nhận mẫu free</span>
                  <span className="material-symbols-outlined text-[18px] text-[#316bbf]">package_2</span>
                </h3>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                  Miễn phí 100%
                </span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl bg-slate-50 p-4 sm:p-4.5 border border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#613bd1] text-white font-black text-sm shadow-sm">
                3
              </div>
              <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  KOC trả video
                </h3>
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-[#613bd1]">
                  Nghiệm thu
                </span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl bg-slate-50 p-4 sm:p-4.5 border border-slate-200">
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#316bbf] text-white font-black text-sm shadow-sm">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  KOC nhận hoa hồng khi có đơn
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Khách hàng đặt mua thành công qua link giỏ hàng hoặc tiếp thị liên kết (affiliate) từ video của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            id="guidelines-zalo-btn"
            href={ZALO_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-[#613bd1] hover:underline"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-r from-[#613bd1] to-[#316bbf] text-[10px] font-black text-white shadow-sm">
              Z
            </span>
            <span>Vào nhóm Zalo KOC trao đổi trực tiếp</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>

          <button
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-[#613bd1] to-[#316bbf] px-5 py-2.5 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-indigo-500/20 transition-all w-full sm:w-auto cursor-pointer"
          >
            Đã hiểu, quay lại khám phá chiến dịch
          </button>
        </div>
      </div>
    </div>
  );
};
