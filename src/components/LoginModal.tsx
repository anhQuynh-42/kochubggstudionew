import React, { useState, useEffect } from 'react';
import { KOCUser } from '../types';
import { APP_LOGOS } from '../data/mockData';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: KOCUser, isNewRegistration?: boolean) => void;
  initialMode?: 'login' | 'register';
  promptMessage?: string | null;
  onOpenCreateProfile?: () => void;
}

const CATEGORIES_OPTIONS = [
  'Làm đẹp & Mỹ phẩm',
  'Thời trang & Phụ kiện',
  'Lifestyle & Gia dụng',
  'Công nghệ & Gaming',
  'Ẩm thực & Quán xá',
  'Mẹ & Bé',
];

export const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  promptMessage,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);

  // Login form states
  const [loginMethod, setLoginMethod] = useState<'tiktok' | 'phone'>('tiktok');
  const [loginHandle, setLoginHandle] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form states
  const [regName, setRegName] = useState('');
  const [regHandle, setRegHandle] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCategory, setRegCategory] = useState('Làm đẹp & Mỹ phẩm');
  const [regPassword, setRegPassword] = useState('');
  const [regFollowers, setRegFollowers] = useState('10K+');
  const [loginError, setLoginError] = useState<string | null>(null);



  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const handleValue = loginHandle.trim().toLowerCase();
    const cleanHandle = handleValue ? (handleValue.startsWith('@') ? handleValue : `@${handleValue}`) : '';
    const phoneValue = loginPhone.trim();
    const enteredPassword = loginPassword.trim();

    // 1. KIỂM TRA ĐĂNG NHẬP ADMIN CHÍNH XÁC:
    // ID TikTok: @adminwebkocity1235
    // Mật khẩu: kocity6102026
    if (loginMethod === 'tiktok' && cleanHandle === '@adminwebkocity1235') {
      if (enteredPassword === 'kocity6102026') {
        const adminUser: KOCUser = {
          id: 'admin-kocity-root',
          name: 'Quản Trị Viên KOCITY',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          tiktokHandle: '@adminwebkocity1235',
          followers: 'Quản Trị Viên',
          phone: '0999.888.999',
          email: 'admin@kocity.vn',
          verified: true,
          city: 'Hà Nội',
          password: 'kocity6102026',
        };
        onLoginSuccess(adminUser, false);
        return;
      } else {
        setLoginError('Mật khẩu quản trị viên không chính xác. Vui lòng kiểm tra lại.');
        return;
      }
    }

    // 2. KIỂM TRA TÀI KHOẢN KOC BÌNH THƯỜNG
    const savedUsersStr = localStorage.getItem('koctrend_registered_users');
    const savedUsers: KOCUser[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];

    let foundUser = null;

    if (loginMethod === 'tiktok') {
      foundUser = savedUsers.find(
        (u) => u.tiktokHandle.toLowerCase() === cleanHandle.toLowerCase() && (u.password === enteredPassword || !u.password)
      );
    } else {
      foundUser = savedUsers.find(
        (u) => u.phone === phoneValue && (u.password === enteredPassword || !u.password)
      );
    }

    if (foundUser) {
      const role = foundUser.role || 'koc';
      onLoginSuccess({ ...foundUser, role }, false);
    } else {
      setLoginError('Tài khoản hoặc mật khẩu không chính xác. KOC có thể đăng ký nhanh bên tab "Đăng ký tài khoản".');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const cleanHandle = regHandle.trim().startsWith('@')
      ? regHandle.trim()
      : `@${regHandle.trim() || 'new.koc'}`;

    const savedUsersStr = localStorage.getItem('koctrend_registered_users');
    const savedUsers: KOCUser[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];

    const exists = savedUsers.some(
      (u) =>
        u.tiktokHandle.toLowerCase() === cleanHandle.toLowerCase() ||
        (u.phone === regPhone.trim() && regPhone.trim() !== '')
    );

    if (exists) {
      setLoginError('Tài khoản TikTok hoặc số điện thoại này đã được đăng ký.');
      return;
    }

    const newUser: KOCUser = {
      id: `koc-reg-${Date.now()}`,
      name: regName.trim() || cleanHandle.replace('@', ''),
      role: 'koc',
      avatar: APP_LOGOS.userProfile,
      tiktokHandle: cleanHandle,
      followers: regFollowers,
      phone: regPhone.trim() || '',
      email: `${cleanHandle.replace('@', '')}@gmail.com`,
      password: regPassword,
      verified: false,
      city: '',
      district: '',
      address: '',
      shippingNote: '',
      bio: '',
      categories: regCategory ? [regCategory] : [],
      avgViews: '',
      engagementRate: '',
      sampleDeliveredCount: 0,
      completedVideosCount: 0,
    };

    localStorage.setItem('koctrend_registered_users', JSON.stringify([...savedUsers, newUser]));
    onLoginSuccess(newUser, true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl overflow-hidden my-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Header Prompt if any */}
        {promptMessage && (
          <div className="mb-4 rounded-2xl bg-indigo-50 border border-indigo-200 p-3 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#6366f1] text-[18px] shrink-0 mt-0.5">
              info
            </span>
            <p className="text-xs text-indigo-950 font-medium leading-relaxed">
              {promptMessage}
            </p>
          </div>
        )}

        {loginError && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 p-3 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-red-600 text-[18px] shrink-0 mt-0.5">
              error
            </span>
            <p className="text-xs text-red-950 font-medium leading-relaxed">
              {loginError}
            </p>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-[#6366f1] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>Đăng nhập KOC</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-white text-[#6366f1] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Đăng ký tài khoản</span>
          </button>
        </div>

        {/* TAB 1: LOGIN */}
        {authMode === 'login' ? (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white">
                <span className="material-symbols-outlined text-sm">lock_open</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900">
                Đăng nhập tài khoản
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Đăng nhập để xem danh sách chiến dịch của tôi, hoàn thiện hồ sơ KOC và tham gia các chiến dịch nhận mẫu.
            </p>



            {/* Login Method Subtabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold mb-3">
              <button
                type="button"
                onClick={() => setLoginMethod('tiktok')}
                className={`flex-1 rounded-lg py-1 transition-all cursor-pointer ${
                  loginMethod === 'tiktok' ? 'bg-white text-[#6366f1] shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                Kênh TikTok
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 rounded-lg py-1 transition-all cursor-pointer ${
                  loginMethod === 'phone' ? 'bg-white text-[#6366f1] shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                Số điện thoại
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              {loginMethod === 'tiktok' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Handle TikTok
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">@</span>
                    <input
                      type="text"
                      value={loginHandle.replace('@', '')}
                      onChange={(e) => setLoginHandle(e.target.value)}
                      placeholder="minhthu.beauty"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-7 pr-3 text-xs text-slate-900 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] focus:outline-none"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Số điện thoại đã đăng ký
                  </label>
                  <input
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="0908.xxx.xxx"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] focus:outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                <span>Đăng nhập KOC ngay</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Chưa có tài khoản KOC?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="font-bold text-[#6366f1] hover:text-[#4f46e5] hover:underline cursor-pointer"
                >
                  Đăng ký tài khoản miễn phí
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* TAB 2: REGISTER */
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white">
                <span className="material-symbols-outlined text-sm">badge</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900">
                Đăng ký tài khoản KOC
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Tạo tài khoản KOC miễn phí để nhận mẫu sản phẩm 0đ và kích hoạt quản lý chiến dịch cá nhân.
            </p>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Họ và tên của bạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ví dụ: Lê Thảo Nhi"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Handle TikTok <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">@</span>
                    <input
                      type="text"
                      value={regHandle.replace('@', '')}
                      onChange={(e) => setRegHandle(e.target.value)}
                      placeholder="thaonhi.review"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-6 pr-2.5 text-xs text-slate-900 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Lượng followers
                  </label>
                  <select
                    value={regFollowers}
                    onChange={(e) => setRegFollowers(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-2.5 text-xs text-slate-900 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] focus:outline-none"
                  >
                    <option value="5K+">5K - 10K (Nano)</option>
                    <option value="15K+">10K - 50K (Micro)</option>
                    <option value="50K+">50K - 100K (Mid-tier)</option>
                    <option value="100K+">100K+ (Top Creator)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Số điện thoại nhận hàng & Zalo <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="0912.xxx.xxx"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Ngành hàng sáng tạo chính
                </label>
                <select
                  value={regCategory}
                  onChange={(e) => setRegCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] focus:outline-none"
                >
                  {CATEGORIES_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Mật khẩu bảo vệ tài khoản <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  minLength={6}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] focus:outline-none"
                  required
                />
              </div>

              <div className="rounded-xl bg-indigo-50 p-2.5 text-[11px] text-indigo-900 flex items-start gap-2 border border-indigo-200">
                <span className="material-symbols-outlined text-[16px] text-[#6366f1] shrink-0 mt-0.5">
                  verified
                </span>
                <span>
                  Đăng ký xong hệ thống sẽ <strong>tự động đăng nhập</strong> và mở khóa mục <strong>Chiến dịch của tôi</strong> cùng <strong>Hồ sơ KOC</strong>.
                </span>
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                <span>Đăng ký & Đăng nhập ngay</span>
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Đã có tài khoản KOC?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="font-bold text-[#6366f1] hover:text-[#4f46e5] hover:underline cursor-pointer"
                >
                  Đăng nhập tại đây
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
