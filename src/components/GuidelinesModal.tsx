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

        <div className="mt-6 space-y-4">
          {/* Step 1 */}
          <div className="rounded-2xl bg-slate-50 p-4 sm:p-5 border border-slate-200">
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white font-black text-sm shadow-sm">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Đăng ký tham gia</span>
                  <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-800">
                    Duyệt trong 12h
                  </span>
                </h3>
                <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-orange-600">schedule</span>
                    <span><b>Bên mình duyệt qua (12h):</b> Đội ngũ kiểm tra nhanh thông tin kênh và số liệu tương tác.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">verified</span>
                    <span><b>Brand duyệt:</b> Nhãn hàng xác nhận chọn kênh phù hợp để gửi sản phẩm mẫu.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl bg-slate-50 p-4 sm:p-5 border border-slate-200">
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white font-black text-sm shadow-sm">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>KOC nhận mẫu free</span>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
                    Miễn phí 100%
                  </span>
                </h3>
                <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-orange-600">package_2</span>
                    <span><b>KOC nhận mẫu free:</b> Sản phẩm được gửi hỏa tốc về tận tay (0đ chi phí).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-orange-600">videocam</span>
                    <span><b>Làm video (Hạn 4 - 7 ngày):</b> Trải nghiệm và sản xuất video review/sáng tạo đúng hạn.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl bg-slate-50 p-4 sm:p-5 border border-slate-200">
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white font-black text-sm shadow-sm">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>KOC trả video</span>
                  <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-800">
                    Nghiệm thu
                  </span>
                </h3>
                <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-orange-600">drive_file_move</span>
                    <span><b>Up lên Drive (Google Drive):</b> Tải video lên link Google Drive để bên mình & Brand duyệt nội dung.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">publish</span>
                    <span>Sau khi duyệt xong, KOC tiến hành đăng video chính thức lên kênh kèm link giỏ hàng/affiliate.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl bg-slate-50 p-4 sm:p-5 border border-slate-200">
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm shadow-sm">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Nhận hoa hồng sau khi có đơn</span>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
                    Thanh toán nhanh
                  </span>
                </h3>
                <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">shopping_cart_checkout</span>
                    <span><b>Có đơn hàng:</b> Khách hàng mua qua link giỏ hàng hoặc affiliate từ video của bạn.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">account_balance_wallet</span>
                    <span><b>Tiền về tài khoản:</b> Hoa hồng và thù lao được đối soát rõ ràng và chuyển thẳng về tài khoản ngân hàng.</span>
                  </div>
                </div>
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
            className="flex items-center gap-2 text-xs font-bold text-orange-950 hover:text-orange-600 hover:underline"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-500 text-[10px] font-black text-white shadow-sm">
              Z
            </span>
            <span>Vào nhóm Zalo KOC trao đổi trực tiếp</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>

          <button
            onClick={onClose}
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-orange-600 shadow-sm transition-colors w-full sm:w-auto cursor-pointer"
          >
            Đã hiểu, quay lại khám phá chiến dịch
          </button>
        </div>
      </div>
    </div>
  );
};
