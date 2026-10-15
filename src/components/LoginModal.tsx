import React, { useState, useEffect } from 'react';
import { KOCUser } from '../types';
import { APP_LOGOS } from '../data/mockData';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: KOCUser, isNewRegistration?: boolean) => void;
  initialMode?: 'login' | 'register' | 'forgot_password';
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
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>(initialMode);

  // Login form states
  const [loginMethod, setLoginMethod] = useState<'tiktok' | 'phone'>('tiktok');
  const [loginHandle, setLoginHandle] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [rememberedUser, setRememberedUser] = useState<KOCUser | null>(null);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regHandle, setRegHandle] = useState('');
  const [regCategory, setRegCategory] = useState('Làm đẹp & Mỹ phẩm');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regFollowers, setRegFollowers] = useState('1K+');

  // Forgot password form states
  const [forgotHandle, setForgotHandle] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessNotice, setLoginSuccessNotice] = useState<string | null>(null);

  // Tải thông tin tài khoản đã ghi nhớ trên máy này
  useEffect(() => {
    try {
      const rememberedStr = localStorage.getItem('koctrend_remembered_account');
      if (rememberedStr) {
        const parsed: KOCUser = JSON.parse(rememberedStr);
        setRememberedUser(parsed);
        if (parsed.tiktokHandle) {
          setLoginHandle(parsed.tiktokHandle);
          setForgotHandle(parsed.tiktokHandle);
        }
      } else {
        const profileStr = localStorage.getItem('koctrend_koc_profile');
        if (profileStr) {
          const parsed: KOCUser = JSON.parse(profileStr);
          setRememberedUser(parsed);
          if (parsed.tiktokHandle) {
            setLoginHandle(parsed.tiktokHandle);
            setForgotHandle(parsed.tiktokHandle);
          }
        }
      }

      const prefRemember = localStorage.getItem('koctrend_remember_me');
      if (prefRemember !== null) {
        setRememberMe(prefRemember === 'true');
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Xử lý lưu hoặc xoá tài khoản ghi nhớ
  const persistRememberedUser = (user: KOCUser, shouldRemember: boolean) => {
    try {
      localStorage.setItem('koctrend_remember_me', shouldRemember ? 'true' : 'false');
      if (shouldRemember) {
        localStorage.setItem('koctrend_remembered_account', JSON.stringify(user));
      } else {
        localStorage.removeItem('koctrend_remembered_account');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccessNotice(null);
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
        persistRememberedUser(adminUser, rememberMe);
        onLoginSuccess(adminUser, false);
        return;
      } else {
        setLoginError('Mật khẩu quản trị viên không chính xác. Vui lòng kiểm tra lại.');
        return;
      }
    }

    // 2. KIỂM TRA TÀI KHOẢN KOC BÌNH THƯỜNG
    const savedUsersStr = localStorage.getItem('koctrend_registered_users');
    let savedUsers: KOCUser[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];

    let foundUser: KOCUser | undefined = undefined;

    const normTargetHandle = cleanHandle.toLowerCase().replace(/[@\s]/g, '');
    const normTargetPhone = phoneValue.replace(/[\s.-]/g, '');

    if (loginMethod === 'tiktok') {
      foundUser = savedUsers.find(
        (u) =>
          (u.tiktokHandle || '').toLowerCase().replace(/[@\s]/g, '') === normTargetHandle &&
          (!enteredPassword || !u.password || u.password === enteredPassword)
      );
    } else {
      foundUser = savedUsers.find(
        (u) =>
          (u.phone || '').replace(/[\s.-]/g, '') === normTargetPhone &&
          (!enteredPassword || !u.password || u.password === enteredPassword)
      );
    }

    // Fallback: nếu chưa có trong savedUsers nhưng có trong hồ sơ đang lưu koctrend_koc_profile
    if (!foundUser) {
      try {
        const activeProfileStr = localStorage.getItem('koctrend_koc_profile');
        if (activeProfileStr) {
          const activeUser: KOCUser = JSON.parse(activeProfileStr);
          const activeHandleNorm = (activeUser.tiktokHandle || '').toLowerCase().replace(/[@\s]/g, '');
          const activePhoneNorm = (activeUser.phone || '').replace(/[\s.-]/g, '');
          if (
            (loginMethod === 'tiktok' && activeHandleNorm === normTargetHandle) ||
            (loginMethod === 'phone' && activePhoneNorm === normTargetPhone)
          ) {
            foundUser = activeUser;
            savedUsers = [...savedUsers, activeUser];
            localStorage.setItem('koctrend_registered_users', JSON.stringify(savedUsers));
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }

    if (foundUser) {
      const role = foundUser.role || 'koc';
      const completeUser = { ...foundUser, role };
      persistRememberedUser(completeUser, rememberMe);
      onLoginSuccess(completeUser, false);
    } else {
      setLoginError(
        'Tài khoản hoặc mật khẩu không chính xác. Nếu quên mật khẩu, bạn có thể bấm "Quên mật khẩu?" ngay bên dưới để đặt lại mà không lo mất dữ liệu.'
      );
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccessNotice(null);
    const cleanHandle = regHandle.trim().startsWith('@')
      ? regHandle.trim()
      : `@${regHandle.trim() || 'new.koc'}`;

    const savedUsersStr = localStorage.getItem('koctrend_registered_users');
    const savedUsers: KOCUser[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];

    const normRegHandle = cleanHandle.toLowerCase().replace(/[@\s]/g, '');

    const exists = savedUsers.some(
      (u) => (u.tiktokHandle || '').toLowerCase().replace(/[@\s]/g, '') === normRegHandle
    );

    if (exists) {
      setLoginError('Tài khoản TikTok này đã được đăng ký. Bạn có thể sang tab Đăng nhập hoặc bấm Quên mật khẩu.');
      return;
    }

    const newUser: KOCUser = {
      id: `koc-reg-${Date.now()}`,
      name: regName.trim() || cleanHandle.replace('@', ''),
      role: 'koc',
      avatar: APP_LOGOS.userProfile,
      tiktokHandle: cleanHandle,
      followers: regFollowers.trim() || '1K+',
      phone: '',
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
    persistRememberedUser(newUser, rememberMe);
    onLoginSuccess(newUser, true);
  };

  // 3. XỬ LÝ QUÊN MẬT KHẨU & ĐẶT LẠI MẬT KHẨU MỚI (BẢO TOÀN 100% DỮ LIỆU)
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccessNotice(null);

    const handleValue = forgotHandle.trim().toLowerCase();
    const cleanHandle = handleValue ? (handleValue.startsWith('@') ? handleValue : `@${handleValue}`) : '';
    const newPass = forgotNewPassword.trim();
    const confirmPass = forgotConfirmPassword.trim();

    if (!cleanHandle) {
      setLoginError('Vui lòng nhập Handle TikTok của tài khoản cần lấy lại.');
      return;
    }

    if (newPass.length < 6) {
      setLoginError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPass !== confirmPass) {
      setLoginError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    // Nếu là tài khoản Admin
    if (cleanHandle === '@adminwebkocity1235') {
      setLoginError('Tài khoản Quản trị viên sử dụng mật khẩu hệ thống cố định: kocity6102026. Bạn hãy quay lại Đăng nhập để sử dụng mật khẩu này.');
      return;
    }

    const savedUsersStr = localStorage.getItem('koctrend_registered_users');
    let savedUsers: KOCUser[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];
    const normTargetHandle = cleanHandle.toLowerCase().replace(/[@\s]/g, '');

    let foundIndex = savedUsers.findIndex(
      (u) => (u.tiktokHandle || '').toLowerCase().replace(/[@\s]/g, '') === normTargetHandle
    );

    let targetUser: KOCUser;

    if (foundIndex >= 0) {
      // Giữ nguyên 100% toàn bộ thông tin hồ sơ, chỉ cập nhật password mới
      targetUser = { ...savedUsers[foundIndex], password: newPass };
      savedUsers[foundIndex] = targetUser;
    } else {
      // Nếu chưa có trong savedUsers nhưng có trong active profile hoặc đơn ứng tuyển: khôi phục nguyên vẹn
      let fallbackName = cleanHandle.replace('@', '');
      let fallbackAvatar = APP_LOGOS.userProfile;
      let fallbackFollowers = '1K+';
      let fallbackPhone = '';
      let fallbackEmail = `${cleanHandle.replace('@', '')}@gmail.com`;
      let fallbackCategories = ['Làm đẹp & Mỹ phẩm'];

      try {
        const activeProfileStr = localStorage.getItem('koctrend_koc_profile');
        if (activeProfileStr) {
          const activeUser: KOCUser = JSON.parse(activeProfileStr);
          if ((activeUser.tiktokHandle || '').toLowerCase().replace(/[@\s]/g, '') === normTargetHandle) {
            fallbackName = activeUser.name || fallbackName;
            fallbackAvatar = activeUser.avatar || fallbackAvatar;
            fallbackFollowers = activeUser.followers || fallbackFollowers;
            fallbackPhone = activeUser.phone || fallbackPhone;
            fallbackEmail = activeUser.email || fallbackEmail;
            fallbackCategories = activeUser.categories || fallbackCategories;
          }
        }
      } catch (err) {
        console.warn(err);
      }

      try {
        const appsStr = localStorage.getItem('koctrend_applications');
        if (appsStr) {
          const apps = JSON.parse(appsStr);
          const foundApp = apps.find(
            (a: { tiktokHandle?: string; kocName?: string; phone?: string; email?: string }) =>
              (a.tiktokHandle || '').toLowerCase().replace(/[@\s]/g, '') === normTargetHandle
          );
          if (foundApp) {
            fallbackName = foundApp.kocName || fallbackName;
            fallbackPhone = foundApp.phone || fallbackPhone;
            fallbackEmail = foundApp.email || fallbackEmail;
          }
        }
      } catch (err) {
        console.warn(err);
      }

      targetUser = {
        id: `koc-reg-${Date.now()}`,
        name: fallbackName,
        role: 'koc',
        avatar: fallbackAvatar,
        tiktokHandle: cleanHandle,
        followers: fallbackFollowers,
        phone: fallbackPhone,
        email: fallbackEmail,
        password: newPass,
        verified: false,
        city: '',
        district: '',
        address: '',
        shippingNote: '',
        bio: '',
        categories: fallbackCategories,
        avgViews: '',
        engagementRate: '',
        sampleDeliveredCount: 0,
        completedVideosCount: 0,
      };
      savedUsers = [...savedUsers, targetUser];
    }

    // Lưu trữ bền vững dữ liệu mới cập nhật
    localStorage.setItem('koctrend_registered_users', JSON.stringify(savedUsers));
    localStorage.setItem('koctrend_koc_profile', JSON.stringify(targetUser));
    persistRememberedUser(targetUser, true);

    // Đăng nhập ngay lập tức cho người dùng
    onLoginSuccess(targetUser, false);
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

        {/* Header Prompt if any (ẩn ở tab đăng ký) */}
        {promptMessage && authMode !== 'register' && (
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

        {loginSuccessNotice && (
          <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
              check_circle
            </span>
            <p className="text-xs text-emerald-950 font-medium leading-relaxed">
              {loginSuccessNotice}
            </p>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        {authMode !== 'forgot_password' ? (
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
              }}
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
              onClick={() => {
                setAuthMode('register');
                setLoginError(null);
              }}
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
        ) : (
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#6366f1] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Quay lại Đăng nhập</span>
            </button>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              Khôi phục mật khẩu
            </span>
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {authMode === 'login' && (
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

            {/* Quick 1-click Login for Remembered User */}
            {rememberedUser && rememberedUser.role !== 'admin' && (
              <div className="mb-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-3 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={rememberedUser.avatar || APP_LOGOS.userProfile}
                    alt={rememberedUser.name}
                    className="h-9 w-9 rounded-full object-cover border border-indigo-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {rememberedUser.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {rememberedUser.tiktokHandle} • Đã lưu trên máy
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onLoginSuccess(rememberedUser, false)}
                  className="shrink-0 flex items-center gap-1 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white px-3 py-1.5 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  title="Đăng nhập ngay với tài khoản đã lưu"
                >
                  <span>Vào ngay</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            )}

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
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-10 text-xs text-slate-900 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 flex items-center justify-center cursor-pointer"
                    title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showLoginPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#6366f1] focus:ring-[#6366f1] cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-600">Lưu đăng nhập lần sau</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot_password');
                    setForgotHandle(loginHandle);
                    setLoginError(null);
                  }}
                  className="text-[11px] font-bold text-[#6366f1] hover:text-[#4f46e5] hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
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
        )}

        {/* TAB 2: REGISTER */}
        {authMode === 'register' && (
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
                  Tên tài khoản <span className="text-red-500">*</span>
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
                    Lượng followers (Từ 1K)
                  </label>
                  <input
                    type="text"
                    value={regFollowers}
                    onChange={(e) => setRegFollowers(e.target.value)}
                    placeholder="VD: 1K, 2.5K, 15.000..."
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] focus:outline-none"
                  />
                </div>
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
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    minLength={6}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-10 text-xs text-slate-900 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 flex items-center justify-center cursor-pointer"
                    title={showRegPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showRegPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember me on register */}
              <div className="flex items-center text-xs pt-0.5">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#6366f1] focus:ring-[#6366f1] cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-slate-600">Lưu đăng nhập tài khoản này trên thiết bị</span>
                </label>
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

        {/* TAB 3: FORGOT PASSWORD */}
        {authMode === 'forgot_password' && (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 text-white">
                <span className="material-symbols-outlined text-sm">lock_reset</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900">
                Lấy lại mật khẩu tài khoản
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Nhập Handle TikTok của bạn và tạo mật khẩu mới. <strong>Mọi dữ liệu hồ sơ và chiến dịch của bạn được bảo toàn 100%.</strong>
            </p>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Handle TikTok đã đăng ký <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">@</span>
                  <input
                    type="text"
                    value={forgotHandle.replace('@', '')}
                    onChange={(e) => setForgotHandle(e.target.value)}
                    placeholder="minhthu.beauty"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-7 pr-3 text-xs text-slate-900 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showForgotNewPassword ? 'text' : 'password'}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    minLength={6}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-10 text-xs text-slate-900 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 flex items-center justify-center cursor-pointer"
                    title={showForgotNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showForgotNewPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Xác nhận lại mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showForgotConfirmPassword ? 'text' : 'password'}
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Nhập lại chính xác mật khẩu mới"
                    minLength={6}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-10 text-xs text-slate-900 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 flex items-center justify-center cursor-pointer"
                    title={showForgotConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showForgotConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 p-2.5 text-[11px] text-amber-900 flex items-start gap-2 border border-amber-200">
                <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0 mt-0.5">
                  verified_user
                </span>
                <span>
                  Việc đặt lại mật khẩu <strong>không làm thay đổi hay mất bất kỳ dữ liệu</strong> nào: danh sách đơn nhận mẫu, trạng thái duyệt đơn và hồ sơ Media Kit của bạn vẫn nguyên vẹn 100%.
                </span>
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                <span>Cập nhật mật khẩu & Đăng nhập ngay</span>
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setLoginError(null);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                <span>Quay lại trang Đăng nhập</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
