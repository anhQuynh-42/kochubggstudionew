import React, { useState } from 'react';

interface BrandContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (info: { brandName: string; contactPerson: string; phone: string; note: string }) => void;
}

export const BrandContactModal: React.FC<BrandContactModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [brandName, setBrandName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('5tr - 20tr');
  const [requirements, setRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !contactPerson.trim() || !phone.trim()) {
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onSubmitSuccess) {
        onSubmitSuccess({
          brandName,
          contactPerson,
          phone,
          note: requirements,
        });
      }
    }, 600);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setBrandName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setRequirements('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header decoration */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
              <span className="material-symbols-outlined text-xl">storefront</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-slate-900 leading-tight">
                Liên hệ hợp tác dành cho Brand
              </h3>
              <p className="text-xs text-slate-500">
                Gửi mẫu sản phẩm & tuyển KOC lên bài viral cùng Ki ô xây
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-inner">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
            <div className="space-y-1">
              <h4 className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-slate-900">
                Gửi yêu cầu thành công!
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Cảm ơn <b>{brandName}</b> đã tin tưởng Ki ô xây. Đội ngũ Partnership của chúng tôi sẽ liên hệ lại với bạn qua số <b>{phone}</b> trong vòng 2 giờ làm việc.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-left border border-slate-200/80 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">verified_user</span>
                Quyền lợi độc quyền cho Nhãn hàng:
              </div>
              <ul className="text-slate-600 space-y-1 list-disc pl-5">
                <li>Tiếp cận mạng lưới hơn 1.200+ KOC đa ngành hàng (TikTok & Reels).</li>
                <li>Hệ thống ký quỹ Escrow minh bạch, chỉ giải ngân khi KOC lên bài đạt yêu cầu.</li>
                <li>Hỗ trợ lọc KOC đúng tệp khách hàng tiềm năng và cam kết doanh số.</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full rounded-2xl bg-orange-500 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-all cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên thương hiệu / Nhãn hàng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="VD: Cỏ Mềm Lab, The Cocoon, Torano..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Người đại diện / Phụ trách <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Họ và tên bạn"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại / Zalo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0987654321"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email làm việc
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="brand@congty.com"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dự kiến ngân sách booking
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white"
                >
                  <option value="Chỉ tặng mẫu Freecast (0đ phí)">Chỉ tặng mẫu 0đ (Freecast)</option>
                  <option value="5tr - 20tr">Từ 5 - 20 triệu VNĐ</option>
                  <option value="20tr - 50tr">Từ 20 - 50 triệu VNĐ</option>
                  <option value="Trên 50tr">Trên 50 triệu VNĐ (Chiến dịch lớn)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Yêu cầu sản phẩm hoặc thông tin chiến dịch
              </label>
              <textarea
                rows={2}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Tên sản phẩm muốn gửi mẫu, số lượng KOC cần tuyển, ngành hàng..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
              />
            </div>

            {/* Support hotline pill */}
            <div className="flex items-center justify-between rounded-xl bg-orange-50/70 border border-orange-200/60 p-2.5 text-xs text-orange-950">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-orange-600">headset_mic</span>
                <span className="font-semibold">Hotline Brand Partnership:</span>
              </div>
              <a href="tel:0988889999" className="font-extrabold text-orange-600 hover:underline">
                098.888.9999 (Zalo/Call)
              </a>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="flex-1 rounded-2xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-2xl bg-orange-500 py-2.5 text-xs font-extrabold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Đang gửi thông tin...' : 'Gửi yêu cầu hợp tác'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
