import React, { useEffect, useState } from 'react';
import { KOCUser } from '../../types';
import { loadRememberedAccount, login, register, resetPassword } from '../../services/authService';
import { Avatar, Button, Field, Icon, PasswordInput, Sheet, TikTokHandleInput, cx, inputClass } from '../ui';

export type AuthMode = 'login' | 'register' | 'forgot';

const CATEGORIES = ['Làm đẹp & Mỹ phẩm', 'Thời trang & Phụ kiện', 'Lifestyle & Gia dụng', 'Công nghệ & Gaming', 'Ẩm thực & Quán xá', 'Mẹ & Bé'];

const TITLES: Record<AuthMode, { title: string; subtitle: string }> = {
  register: { title: 'Tạo tài khoản KOC', subtitle: 'Đăng ký nhanh bằng Email · Hoàn toàn miễn phí' },
  login: { title: 'Chào mừng trở lại', subtitle: 'Đăng nhập tài khoản KOC bằng Email' },
  forgot: { title: 'Đặt lại mật khẩu', subtitle: 'Xác minh Email và số điện thoại đã đăng ký' },
};

interface AuthSheetProps {
  open: boolean;
  initialMode: AuthMode;
  /** Lý do mở form, VD: "Tạo tài khoản để nhận mẫu Cỏ Mềm" */
  reason?: string | null;
  onClose: () => void;
  onSuccess: (user: KOCUser, isNew: boolean) => void;
}

export const AuthSheet: React.FC<AuthSheetProps> = ({ open, initialMode, reason, onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [remembered, setRemembered] = useState<KOCUser | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  // Thông tin đăng nhập & đăng ký
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Thông tin KOC bổ sung khi đăng ký
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [followers, setFollowers] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setError(null);
    setPassword('');
    setConfirmPassword('');
    setAgreedTerms(false);
    setIsTermsModalOpen(false);
    const saved = loadRememberedAccount();
    setRemembered(saved.user && saved.user.role !== 'admin' ? saved.user : null);
    setRememberMe(saved.rememberMe);
    if (saved.user && saved.user.role !== 'admin') {
      if (saved.user.email) setEmail(saved.user.email);
      if (saved.user.tiktokHandle) setHandle(saved.user.tiktokHandle);
      if (saved.user.phone) setPhone(saved.user.phone);
      if (saved.user.name) setName(saved.user.name);
    }
  }, [open, initialMode]);

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        setError('Vui lòng nhập địa chỉ email của bạn.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setError('Địa chỉ email không hợp lệ (VD: creator@gmail.com).');
        return;
      }
      if (!name.trim()) {
        setError('Vui lòng nhập tên hiển thị của bạn.');
        return;
      }
      const cleanPhone = phone.replace(/[\s.-]/g, '');
      if (!cleanPhone || cleanPhone.length < 10) {
        setError('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 10 chữ số) để liên hệ nhận mẫu.');
        return;
      }
      if (password.length < 6) {
        setError('Mật khẩu cần ít nhất 6 ký tự để bảo vệ tài khoản.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Hai mật khẩu chưa khớp nhau. Vui lòng kiểm tra lại.');
        return;
      }
      if (!agreedTerms) {
        setError('Vui lòng tích chọn đồng ý với Điều khoản dịch vụ & Chính sách bảo mật.');
        return;
      }

      const result = await register({
        email: cleanEmail,
        name: name.trim(),
        phone: cleanPhone,
        handle: handle.trim(),
        followers: followers.trim(),
        category,
        password,
        confirmPassword,
        remember: rememberMe,
        agreedTerms,
      });

      if ('error' in result) {
        setError(result.error);
        return;
      }
      onSuccess(result.user, true);
      return;
    }

    if (mode === 'login') {
      if (loginMethod === 'email') {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
          setError('Vui lòng nhập địa chỉ email.');
          return;
        }
      } else {
        const cleanPhone = phone.replace(/[\s.-]/g, '');
        if (!cleanPhone) {
          setError('Vui lòng nhập số điện thoại.');
          return;
        }
      }
      if (!password.trim()) {
        setError('Vui lòng nhập mật khẩu.');
        return;
      }

      const result = await login({
        method: loginMethod,
        email: email.trim(),
        phone: phone.trim(),
        handle: handle.trim(),
        password,
        remember: rememberMe,
      });

      if ('error' in result) {
        setError(result.error);
        return;
      }
      onSuccess(result.user, false);
      return;
    }

    if (mode === 'forgot') {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        setError('Vui lòng nhập địa chỉ email đã đăng ký.');
        return;
      }
      const cleanPhone = phone.replace(/[\s.-]/g, '');
      if (!cleanPhone) {
        setError('Vui lòng nhập số điện thoại đã dùng khi tạo tài khoản để xác minh.');
        return;
      }
      if (password.length < 6) {
        setError('Mật khẩu mới cần ít nhất 6 ký tự.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Hai mật khẩu chưa khớp nhau. Vui lòng kiểm tra lại.');
        return;
      }

      const result = await resetPassword({
        email: cleanEmail,
        phone: cleanPhone,
        newPassword: password,
        confirmPassword,
      });

      if ('error' in result) {
        setError(result.error);
        return;
      }
      onSuccess(result.user, false);
    }
  };

  const { title, subtitle } = TITLES[mode];
  const submitLabel = mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Tạo tài khoản KOC' : 'Đặt lại & Đăng nhập';

  return (
    <>
      <Sheet open={open} onClose={onClose} title={title} subtitle={subtitle}>
        {mode === 'forgot' && (
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="-mt-1 mb-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            Quay lại đăng nhập
          </button>
        )}

        {reason && mode !== 'forgot' && (
          <p className="mb-4 flex items-start gap-2 rounded-2xl bg-gradient-to-r from-indigo-50 to-pink-50 p-3 text-sm text-slate-700">
            <Icon name="redeem" className="text-[20px] text-[#8b5cf6]" />
            {reason}
          </p>
        )}

        {mode === 'login' && remembered && (
          <button
            type="button"
            onClick={() => onSuccess(remembered, false)}
            className="mb-4 flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 ring-violet-200 transition-colors hover:bg-violet-50 cursor-pointer"
          >
            <Avatar name={remembered.name} src={remembered.avatar} size={40} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-slate-900">Tiếp tục với {remembered.name}</span>
              <span className="block truncate text-xs text-slate-500">
                {remembered.email || remembered.tiktokHandle} · đã lưu trên máy này
              </span>
            </span>
            <Icon name="arrow_forward" className="text-[#8b5cf6]" />
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
              <Icon name="error" className="text-[20px]" />
              {error}
            </p>
          )}

          {/* Ô NHẬP TÀI KHOẢN KHI ĐĂNG NHẬP (MẶC ĐỊNH EMAIL, CÓ THỂ ĐỔI SANG SĐT) */}
          {mode === 'login' && (
            <>
              {loginMethod === 'phone' ? (
                <Field
                  label="Số điện thoại"
                  required
                  action={
                    <button
                      type="button"
                      onClick={() => setLoginMethod('email')}
                      className="text-xs font-semibold text-[#6366f1] cursor-pointer"
                    >
                      Đăng nhập bằng Email
                    </button>
                  }
                >
                  {(id) => (
                    <input
                      id={id}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0908 123 456"
                      className={inputClass}
                    />
                  )}
                </Field>
              ) : (
                <Field
                  label="Địa chỉ Email"
                  required
                  action={
                    <button
                      type="button"
                      onClick={() => setLoginMethod('phone')}
                      className="text-xs font-semibold text-[#6366f1] cursor-pointer"
                    >
                      Dùng số điện thoại
                    </button>
                  }
                >
                  {(id) => (
                    <input
                      id={id}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="VD: creator@gmail.com"
                      className={inputClass}
                    />
                  )}
                </Field>
              )}

              <Field
                label="Mật khẩu"
                required
                action={
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs font-semibold text-[#6366f1] cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                }
              >
                {(id) => (
                  <PasswordInput
                    id={id}
                    value={password}
                    onChange={setPassword}
                    placeholder="Mật khẩu của bạn"
                    autoComplete="current-password"
                  />
                )}
              </Field>
            </>
          )}

          {/* CÁC TRƯỜNG ĐẶC BIỆT KHI ĐĂNG KÝ MỚI BẰNG EMAIL */}
          {mode === 'register' && (
            <>
              <Field label="Địa chỉ Email" required hint="Dùng để đăng nhập tài khoản KOC và nhận thông báo duyệt đơn">
                {(id) => (
                  <input
                    id={id}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="VD: creator@gmail.com"
                    className={inputClass}
                  />
                )}
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Tên hiển thị" required>
                  {(id) => (
                    <input
                      id={id}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="VD: Thảo Nhi"
                      autoComplete="nickname"
                      className={inputClass}
                    />
                  )}
                </Field>
                <Field label="Số điện thoại" required hint="Liên hệ nhận mẫu 0đ">
                  {(id) => (
                    <input
                      id={id}
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0908 123 456"
                      autoComplete="tel"
                      className={inputClass}
                    />
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="ID TikTok" hint="VD: @thaonhi (không bắt buộc)">
                  {(id) => <TikTokHandleInput id={id} value={handle} onChange={setHandle} />}
                </Field>
                <Field label="Followers">
                  {(id) => (
                    <input
                      id={id}
                      value={followers}
                      onChange={(e) => setFollowers(e.target.value)}
                      placeholder="VD: 12K"
                      className={inputClass}
                    />
                  )}
                </Field>
              </div>

              <Field label="Lĩnh vực chính">
                {(id) => (
                  <select
                    id={id}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={cx(inputClass, 'cursor-pointer')}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Mật khẩu" required>
                  {(id) => (
                    <PasswordInput
                      id={id}
                      value={password}
                      onChange={setPassword}
                      placeholder="Ít nhất 6 ký tự"
                      autoComplete="new-password"
                    />
                  )}
                </Field>
                <Field label="Nhập lại mật khẩu" required>
                  {(id) => (
                    <PasswordInput
                      id={id}
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      placeholder="Nhập lại mật khẩu"
                      autoComplete="new-password"
                    />
                  )}
                </Field>
              </div>

              {/* Checkbox Đồng ý Điều khoản & Chính sách */}
              <div className="rounded-2xl bg-violet-50/70 p-3.5 border border-violet-100">
                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#6d28d9] cursor-pointer"
                  />
                  <span className="leading-relaxed">
                    Tôi đã đọc và đồng ý với{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsTermsModalOpen(true);
                      }}
                      className="font-bold text-[#6d28d9] underline underline-offset-2 hover:text-[#5b21b6] cursor-pointer"
                    >
                      Điều khoản dịch vụ
                    </button>{' '}
                    &amp;{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsTermsModalOpen(true);
                      }}
                      className="font-bold text-[#6d28d9] underline underline-offset-2 hover:text-[#5b21b6] cursor-pointer"
                    >
                      Chính sách bảo mật
                    </button>{' '}
                    của KOCITY.
                  </span>
                </label>
              </div>
            </>
          )}

          {/* KHI QUÊN MẬT KHẨU: XÁC MINH BẰNG EMAIL & SĐT */}
          {mode === 'forgot' && (
            <>
              <Field label="Địa chỉ Email đã đăng ký" required>
                {(id) => (
                  <input
                    id={id}
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="VD: creator@gmail.com"
                    autoComplete="email"
                    className={inputClass}
                  />
                )}
              </Field>

              <Field label="Số điện thoại đã đăng ký" required>
                {(id) => (
                  <input
                    id={id}
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập SĐT dùng khi tạo tài khoản"
                    autoComplete="tel"
                    className={inputClass}
                  />
                )}
              </Field>

              <Field label="Mật khẩu mới" required>
                {(id) => (
                  <PasswordInput
                    id={id}
                    value={password}
                    onChange={setPassword}
                    placeholder="Ít nhất 6 ký tự"
                    autoComplete="new-password"
                  />
                )}
              </Field>

              <Field label="Nhập lại mật khẩu mới" required>
                {(id) => (
                  <PasswordInput
                    id={id}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Nhập lại mật khẩu mới"
                    autoComplete="new-password"
                  />
                )}
              </Field>
            </>
          )}

          {mode !== 'forgot' && (
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 accent-[#8b5cf6]"
              />
              Ghi nhớ trên thiết bị này
            </label>
          )}

          <Button type="submit" variant="primary" size="lg" block>
            {submitLabel}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <span className="material-symbols-outlined text-[15px] text-emerald-600">verified_user</span>
            <span>Dữ liệu cá nhân được mã hóa &amp; bảo vệ an toàn</span>
          </p>

          {mode !== 'forgot' && (
            <p className="pb-1 text-center text-sm text-slate-500">
              {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="font-bold text-[#6366f1] cursor-pointer"
              >
                {mode === 'login' ? 'Tạo tài khoản KOC' : 'Đăng nhập'}
              </button>
            </p>
          )}
        </form>
      </Sheet>

      {/* POPUP MODAL ĐIỀU KHOẢN DỊCH VỤ & CHÍNH SÁCH BẢO MẬT */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsTermsModalOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-[#6d28d9]">
                  <span className="material-symbols-outlined text-2xl">verified_user</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    Điều Khoản Dịch Vụ &amp; Bảo Mật
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Nền tảng kết nối KOC &amp; Brand KOCITY</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="rounded-2xl bg-violet-50/70 p-4 border border-violet-100 space-y-1">
                <p className="font-bold text-[#6d28d9] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Cam kết đồng hành &amp; Quyền lợi KOC
                </p>
                <p className="text-xs text-slate-600">
                  KOCITY tạo môi trường hợp tác minh bạch, bảo vệ quyền lợi tối đa cho Creator sáng tạo nội dung.
                </p>
              </div>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-black">
                    1
                  </span>
                  Quyền lợi của KOC
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>
                    <strong>Nhận mẫu miễn phí:</strong> Có cơ hội nhận sản phẩm trải nghiệm 0đ (Freecast) từ các thương hiệu uy tín.
                  </li>
                  <li>
                    <strong>Hoa hồng Affiliate:</strong> Hưởng mức hoa hồng theo chính sách từng chiến dịch, được cập nhật và đối soát minh bạch.
                  </li>
                  <li>
                    <strong>Quyền sở hữu nội dung:</strong> KOC giữ quyền sở hữu đối với video do mình sáng tạo, trừ trường hợp có thỏa thuận sử dụng nội dung riêng với nhãn hàng.
                  </li>
                  <li>
                    <strong>Ưu tiên hợp tác:</strong> KOC đạt điểm tín nhiệm cao (⭐ 5 sao) được ưu tiên đề xuất tham gia các chiến dịch phù hợp từ những thương hiệu lớn.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700 text-xs font-black">
                    2
                  </span>
                  Trách nhiệm &amp; Cam kết nhận mẫu
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>
                    <strong>Đúng hạn:</strong> Đăng tải video đáp ứng yêu cầu nghiệm thu lên kênh TikTok đã đăng ký trong vòng{' '}
                    <strong>5–7 ngày</strong> kể từ khi nhận sản phẩm mẫu, trừ khi chiến dịch có quy định khác.
                  </li>
                  <li>
                    <strong>Đúng brief:</strong> Sáng tạo nội dung theo yêu cầu của nhãn hàng, gắn đúng liên kết sản phẩm trên TikTok Shop hoặc mã ưu đãi được cung cấp (nếu có).
                  </li>
                  <li>
                    <strong>Cam kết nhận mẫu:</strong> Không nhận mẫu rồi tự ý bỏ ngang chiến dịch hoặc bán lại sản phẩm mẫu được tài trợ. Trường hợp vi phạm, KOCITY có quyền áp dụng biện pháp cảnh báo, hạn chế tham gia chiến dịch hoặc khóa tài khoản tùy theo mức độ vi phạm.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700 text-xs font-black">
                    3
                  </span>
                  Chính sách bảo mật dữ liệu (Privacy Policy)
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>
                    <strong>Bảo vệ thông tin:</strong> KOCITY cam kết áp dụng các biện pháp bảo mật phù hợp nhằm bảo vệ dữ liệu cá nhân của KOC và ngăn chặn truy cập trái phép.
                  </li>
                  <li>
                    <strong>Thông tin giao hàng:</strong> KOCITY không thu thập hoặc lưu trữ trái phép dữ liệu. Thông tin giao hàng chỉ dùng cho mục đích chuyển phát mẫu chiến dịch.
                  </li>
                  <li>
                    <strong>Mục đích sử dụng:</strong> Email và số điện thoại chỉ dùng để trao đổi công việc, xác thực tài khoản và hỗ trợ KOC.
                  </li>
                  <li>
                    <strong>Cam kết bảo mật:</strong> KOCITY không mua bán hoặc chia sẻ dữ liệu cá nhân của KOC cho bên thứ ba nhằm mục đích quảng cáo trái phép.
                  </li>
                </ul>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setAgreedTerms(true);
                  setIsTermsModalOpen(false);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#6d28d9] text-white hover:bg-[#5b21b6] shadow-sm shadow-violet-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Tôi đã hiểu &amp; Đồng ý điều khoản</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
