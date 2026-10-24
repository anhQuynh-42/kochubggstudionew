import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../lib/constants';
import { hashStringSHA256 } from '../lib/authHelpers';

interface AdminSecurityGateProps {
  children: React.ReactNode;
}

// BẢO MẬT: Không lưu mã PIN dạng chữ rõ. Lưu trữ bằng chữ ký băm mã hóa một chiều SHA-256
const DEFAULT_ADMIN_PIN_HASH = '1322cccdbc5c56294cd17b34846dfc2331311bba5293106846f5c077cfc06c42';
const SESSION_AUTH_KEY = 'kocity_admin_auth_token';
const CUSTOM_PIN_HASH_KEY = 'kocity_admin_custom_pin_hash';

export const AdminSecurityGate: React.FC<AdminSecurityGateProps> = ({ children }) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
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
  const [attempts, setAttempts] = useState(0);
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
      setAttempts(0);
      setErrorMsg('');
    }
    return () => clearTimeout(timer);
  }, [lockCountdown, isLocked]);

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
      const sessionPayload = {
        authenticatedAt: Date.now(),
        expiresAt: Date.now() + 2 * 3600 * 1000, // Tự động hết hạn sau 2 giờ để bảo vệ phiên
      };
      sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(sessionPayload));
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin('');

      if (newAttempts >= 2) {
        setIsLocked(true);
        setLockCountdown(300); // 5 phút = 300 giây
        setErrorMsg('Nhập sai quá 2 lần! Hệ thống tạm khóa 5 phút để chống dò mã.');
      } else {
        setErrorMsg('Mã PIN không chính xác! CẢNH BÁO: Bạn chỉ còn 1 lần thử duy nhất.');
      }
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

      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-purple-950/40 text-center">
        {/* Shield Icon & Header */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 shadow-lg shadow-indigo-500/30">
          <span className="material-symbols-outlined text-[32px] text-white">admin_panel_settings</span>
        </div>

        <h2 className="mt-4 text-xl font-extrabold tracking-tight sm:text-2xl">
          Cổng Xác Thực Quản Trị
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Nhập mã PIN bảo mật 6 số để truy cập bảng điều khiển KOCity
        </p>

        {/* PIN Dots Display */}
        <div
          className={`mt-6 flex justify-center gap-3 transition-transform ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
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
          <span className="text-[11px] text-slate-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">lock</span>
            Bảo vệ 2 lớp
          </span>
        </div>
      </div>
    </div>
  );
};
