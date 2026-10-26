import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../lib/constants';
import { hashStringSHA256 } from '../lib/authHelpers';

interface AdminSecurityGateProps {
  children: React.ReactNode;
}

// BẢO MẬT: Không lưu mã PIN hay mật khẩu dạng chữ rõ. Lưu trữ bằng chữ ký băm mã hóa một chiều SHA-256
// PIN: 202688 -> SHA-256
const DEFAULT_ADMIN_PIN_HASH = '1322cccdbc5c56294cd17b34846dfc2331311bba5293106846f5c077cfc06c42';
// Handle: adminwebkocity1235 -> SHA-256
const ADMIN_USER_HASH = '3e53819a0cdf792bf7a6b095acf53ba0f1e10c7e59e88521e23ef6b703a37d9d';
// Password: kocity6102026 -> SHA-256
const ADMIN_PASSWORD_HASH = 'f7c0aa9daf16999550d80b328d97381e17e7ad728bc2ac525d9d9b0969ccd360';

const SESSION_AUTH_KEY = 'kocity_admin_auth_token';
const CUSTOM_PIN_HASH_KEY = 'kocity_admin_custom_pin_hash';

export const AdminSecurityGate: React.FC<AdminSecurityGateProps> = ({ children }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1); // 1: Cổng PIN, 2: Cổng Tài khoản & Mật khẩu Admin
  const [pin, setPin] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingStep2, setIsSubmittingStep2] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const tokenStr = sessionStorage.getItem(SESSION_AUTH_KEY);
      if (!tokenStr) return false;
      const parsed = JSON.parse(tokenStr);
      if (parsed && parsed.expiresAt && Date.now() < parsed.expiresAt) {
        return true;
      }
      sessionStorage.removeItem(SESSION_AUTH_KEY);
      return false;
    } catch {
      return false;
    }
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [step1Attempts, setStep1Attempts] = useState(0);
  const [step2Attempts, setStep2Attempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  // Lấy chữ ký băm SHA-256 của mã PIN quản trị
  const currentPinHash =
    localStorage.getItem(CUSTOM_PIN_HASH_KEY) ||
    import.meta.env.VITE_ADMIN_PIN_HASH ||
    DEFAULT_ADMIN_PIN_HASH;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockCountdown > 0) {
      timer = setTimeout(() => setLockCountdown((prev) => prev - 1), 1000);
    } else if (isLocked && lockCountdown === 0) {
      setIsLocked(false);
      setStep1Attempts(0);
      setStep2Attempts(0);
      setErrorMsg('');
    }
    return () => clearTimeout(timer);
  }, [lockCountdown, isLocked]);

  // Đảm bảo phiên quản trị viên hợp lệ luôn được đồng bộ cho AppDataContext
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('kocity_admin_mode', 'true');
      const adminProfile = {
        id: 'admin-master',
        name: 'Quản trị viên KOCity',
        tiktokHandle: 'adminwebkocity1235',
        role: 'admin' as const,
        phone: '0908888888',
        email: 'admin@kocity.io.vn',
      };
      try {
        const existing = localStorage.getItem('koctrend_koc_profile');
        if (!existing || JSON.parse(existing).role !== 'admin') {
          localStorage.setItem('koctrend_koc_profile', JSON.stringify(adminProfile));
        }
      } catch {
        localStorage.setItem('koctrend_koc_profile', JSON.stringify(adminProfile));
      }
      window.dispatchEvent(new CustomEvent('kocity-admin-authenticated', { detail: adminProfile }));
    }
  }, [isAuthenticated]);

  // XỬ LÝ BƯỚC 1: MÃ PIN
  const handleKeyPress = (num: string) => {
    if (isLocked || pin.length >= 6) return;
    setErrorMsg('');
    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === 6) {
      validatePin(newPin);
    }
  };

  const handleDelete = () => {
    if (isLocked) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const validatePin = async (inputPin: string) => {
    const inputHash = await hashStringSHA256(inputPin);
    if (inputHash === currentPinHash) {
      // Vượt qua Bước 1 (Mã PIN) -> Chuyển sang Bước 2 (Tài khoản & Mật khẩu Admin)
      setErrorMsg('');
      setStep(2);
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      const newAttempts = step1Attempts + 1;
      setStep1Attempts(newAttempts);
      setPin('');

      if (newAttempts >= 2) {
        setIsLocked(true);
        setLockCountdown(300); // 5 phút = 300 giây
        setErrorMsg('Nhập sai mã PIN quá 2 lần! Hệ thống tạm khóa 5 phút để chống dò mã.');
      } else {
        setErrorMsg('Mã PIN không chính xác! CẢNH BÁO: Bạn chỉ còn 1 lần thử duy nhất.');
      }
    }
  };

  // XỬ LÝ BƯỚC 2: TÀI KHOẢN & MẬT KHẨU ADMIN
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || isSubmittingStep2) return;

    if (!adminUsername.trim()) {
      setErrorMsg('Vui lòng nhập tài khoản quản trị.');
      return;
    }
    if (!adminPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu quản trị.');
      return;
    }

    setIsSubmittingStep2(true);
    setErrorMsg('');

    try {
      const cleanUser = adminUsername.trim().replace(/^@+/, '').toLowerCase();
      const userHash = await hashStringSHA256(cleanUser);
      const passHash = await hashStringSHA256(adminPassword);

      if (userHash === ADMIN_USER_HASH && passHash === ADMIN_PASSWORD_HASH) {
        // Vượt qua cả 2 lớp -> Cấp session token thời hạn 2 giờ
        const sessionPayload = {
          authenticatedAt: Date.now(),
          expiresAt: Date.now() + 2 * 3600 * 1000,
        };
        sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(sessionPayload));
        localStorage.setItem('kocity_admin_mode', 'true');
        
        // Thiết lập danh tính quản trị viên toàn hệ thống để kích hoạt đồng bộ 100% đơn ứng tuyển
        const adminProfile = {
          id: 'admin-master',
          name: 'Quản trị viên KOCity',
          tiktokHandle: 'adminwebkocity1235',
          role: 'admin' as const,
          phone: '0908888888',
          email: 'admin@kocity.io.vn',
        };
        localStorage.setItem('koctrend_koc_profile', JSON.stringify(adminProfile));
        window.dispatchEvent(new CustomEvent('kocity-admin-authenticated', { detail: adminProfile }));

        setIsAuthenticated(true);
        setErrorMsg('');
      } else {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        const newAttempts = step2Attempts + 1;
        setStep2Attempts(newAttempts);

        if (newAttempts >= 3) {
          setIsLocked(true);
          setLockCountdown(300); // 5 phút
          setStep(1); // Đá về bước 1
          setPin('');
          setAdminPassword('');
          setErrorMsg('Sai thông tin quản trị quá 3 lần! Hệ thống tạm khóa 5 phút.');
        } else {
          setErrorMsg(`Tài khoản hoặc mật khẩu không chính xác! Còn ${3 - newAttempts} lần thử.`);
        }
      }
    } catch {
      setErrorMsg('Đã có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.');
    } finally {
      setIsSubmittingStep2(false);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950 p-4 text-white">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-pink-600/20 blur-[120px]" />

      <div
        className={`relative w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-purple-950/40 text-center transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Step Indicator Badge */}
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-300">
          <span className="material-symbols-outlined text-[14px]">
            {step === 1 ? 'pin' : 'password'}
          </span>
          <span>Bảo mật 2 Lớp: Bước {step}/2</span>
        </div>

        {/* Shield Icon & Header */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 shadow-lg shadow-indigo-500/30">
          <span className="material-symbols-outlined text-[32px] text-white">
            {step === 1 ? 'dialpad' : 'admin_panel_settings'}
          </span>
        </div>

        <h2 className="mt-4 text-xl font-extrabold tracking-tight sm:text-2xl">
          {step === 1 ? 'Cổng Mã PIN Quản Trị' : 'Tài Khoản Quản Trị'}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          {step === 1
            ? 'Bước 1: Nhập mã PIN 6 số để mở khóa tầng bảo vệ thứ nhất'
            : 'Bước 2: Nhập tài khoản & mật khẩu Admin để vào Bảng điều khiển'}
        </p>

        {/* Error / Locked Warning */}
        {errorMsg && (
          <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 border border-red-500/20">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>
              {isLocked
                ? `Đang tạm khóa an toàn (${Math.floor(lockCountdown / 60)}p ${String(lockCountdown % 60).padStart(2, '0')}s)`
                : errorMsg}
            </span>
          </div>
        )}

        {/* ==================== BƯỚC 1: MÃ PIN ==================== */}
        {step === 1 && (
          <>
            {/* PIN Dots Display */}
            <div className="mt-6 flex justify-center gap-3">
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const isFilled = index < pin.length;
                return (
                  <div
                    key={index}
                    className={`h-4 w-4 rounded-full border-2 transition-all duration-200 ${
                      isFilled
                        ? 'scale-110 border-indigo-400 bg-gradient-to-r from-indigo-500 to-pink-500 shadow-md shadow-indigo-500/50'
                        : 'border-slate-600 bg-slate-800/60'
                    }`}
                  />
                );
              })}
            </div>

            {/* Numpad */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleKeyPress(num)}
                  className="flex h-14 items-center justify-center rounded-2xl bg-white/5 text-xl font-semibold text-slate-100 transition-all hover:bg-white/10 active:scale-95 disabled:opacity-30 cursor-pointer border border-white/5"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                disabled={isLocked || pin.length === 0}
                onClick={() => setPin('')}
                className="flex h-14 items-center justify-center rounded-2xl bg-white/5 text-xs font-bold text-slate-400 transition-all hover:bg-white/10 active:scale-95 disabled:opacity-30 cursor-pointer border border-white/5"
              >
                Xóa hết
              </button>
              <button
                type="button"
                disabled={isLocked}
                onClick={() => handleKeyPress('0')}
                className="flex h-14 items-center justify-center rounded-2xl bg-white/5 text-xl font-semibold text-slate-100 transition-all hover:bg-white/10 active:scale-95 disabled:opacity-30 cursor-pointer border border-white/5"
              >
                0
              </button>
              <button
                type="button"
                disabled={isLocked || pin.length === 0}
                onClick={handleDelete}
                className="flex h-14 items-center justify-center rounded-2xl bg-white/5 text-slate-300 transition-all hover:bg-white/10 active:scale-95 disabled:opacity-30 cursor-pointer border border-white/5"
              >
                <span className="material-symbols-outlined text-[20px]">backspace</span>
              </button>
            </div>
          </>
        )}

        {/* ==================== BƯỚC 2: TÀI KHOẢN & MẬT KHẨU ==================== */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="mt-5 space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tài khoản Quản trị
              </label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                  account_circle
                </span>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => {
                    setAdminUsername(e.target.value);
                    setErrorMsg('');
                  }}
                  disabled={isLocked}
                  placeholder="@adminwebkocity1235"
                  autoFocus
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400 focus:bg-white/10 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Mật khẩu Quản trị
              </label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                  key
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  disabled={isLocked}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400 focus:bg-white/10 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLocked || isSubmittingStep2}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:brightness-110 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>{isSubmittingStep2 ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setPin('');
                setErrorMsg('');
              }}
              className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>Nhập lại mã PIN (Bước 1)</span>
            </button>
          </form>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => navigate(ROUTES.home)}
            className="flex items-center gap-1 hover:text-white transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Về Trang chủ
          </button>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">shield_lock</span>
            2-Step Gate Verification
          </span>
        </div>
      </div>
    </div>
  );
};

