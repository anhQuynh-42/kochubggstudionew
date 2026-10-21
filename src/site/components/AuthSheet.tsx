import React, { useEffect, useState } from 'react';
import { KOCUser } from '../../types';
import { loadRememberedAccount, login, register, resetPassword } from '../../services/authService';
import { Avatar, Button, Field, Icon, PasswordInput, Sheet, TikTokHandleInput, cx, inputClass } from '../ui';

export type AuthMode = 'login' | 'register' | 'forgot';

const CATEGORIES = ['Làm đẹp & Mỹ phẩm', 'Thời trang & Phụ kiện', 'Lifestyle & Gia dụng', 'Công nghệ & Gaming', 'Ẩm thực & Quán xá', 'Mẹ & Bé'];

const TITLES: Record<AuthMode, { title: string; subtitle: string }> = {
  register: { title: 'Tạo tài khoản KOC', subtitle: 'Miễn phí · chưa tới 1 phút' },
  login: { title: 'Chào mừng trở lại', subtitle: 'Đăng nhập bằng ID TikTok' },
  forgot: { title: 'Đặt lại mật khẩu', subtitle: 'Nhập ID TikTok và mật khẩu mới' },
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

  // Đăng nhập
  const [loginMethod, setLoginMethod] = useState<'tiktok' | 'phone'>('tiktok');
  const [handle, setHandle] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  // Đăng ký
  const [name, setName] = useState('');
  const [followers, setFollowers] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  // Quên mật khẩu
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setError(null);
    setPassword('');
    setConfirmPassword('');
    const saved = loadRememberedAccount();
    setRemembered(saved.user && saved.user.role !== 'admin' ? saved.user : null);
    setRememberMe(saved.rememberMe);
    if (saved.user?.tiktokHandle && saved.user.role !== 'admin') setHandle(saved.user.tiktokHandle);
  }, [open, initialMode]);

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result =
      mode === 'login'
        ? login({ method: loginMethod, handle, phone, password, remember: rememberMe })
        : mode === 'register'
        ? register({ name, handle, followers, category, password, remember: rememberMe })
        : resetPassword({ handle, newPassword: password, confirmPassword });
    if ('error' in result) {
      setError(result.error);
      return;
    }
    onSuccess(result.user, mode === 'register');
  };

  const { title, subtitle } = TITLES[mode];
  const submitLabel = mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Tạo tài khoản' : 'Đặt lại & đăng nhập';

  return (
    <Sheet open={open} onClose={onClose} title={title} subtitle={subtitle}>
      {mode === 'forgot' && (
        <button type="button" onClick={() => switchMode('login')} className="-mt-1 mb-3 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-900 cursor-pointer">
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
            <span className="block truncate text-xs text-slate-500">{remembered.tiktokHandle} · đã lưu trên máy này</span>
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

        {mode === 'login' && loginMethod === 'phone' ? (
          <Field
            label="Số điện thoại"
            action={
              <button type="button" onClick={() => setLoginMethod('tiktok')} className="text-xs font-semibold text-[#6366f1] cursor-pointer">
                Dùng ID TikTok
              </button>
            }
          >
            {(id) => <input id={id} type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0908 123 456" className={inputClass} />}
          </Field>
        ) : (
          <Field
            label="ID TikTok"
            required={mode === 'register'}
            action={
              mode === 'login' && (
                <button type="button" onClick={() => setLoginMethod('phone')} className="text-xs font-semibold text-[#6366f1] cursor-pointer">
                  Dùng số điện thoại
                </button>
              )
            }
          >
            {(id) => <TikTokHandleInput id={id} value={handle} onChange={setHandle} />}
          </Field>
        )}

        {mode === 'register' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tên hiển thị" required>
                {(id) => <input id={id} value={name} onChange={(e) => setName(e.target.value)} placeholder="Thảo Nhi" autoComplete="nickname" className={inputClass} />}
              </Field>
              <Field label="Followers">
                {(id) => <input id={id} value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="VD: 12K" className={inputClass} />}
              </Field>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-slate-800">Bạn làm nội dung về</legend>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    aria-pressed={category === c}
                    className={cx(
                      'h-9 rounded-full px-3.5 text-sm font-semibold transition-colors cursor-pointer',
                      category === c ? 'bg-violet-50 text-[#6d28d9] ring-2 ring-[#8b5cf6]' : 'bg-white text-slate-600 ring-1 ring-slate-200'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>
          </>
        )}

        <Field
          label={mode === 'forgot' ? 'Mật khẩu mới' : 'Mật khẩu'}
          required={mode !== 'login'}
          action={
            mode === 'login' && (
              <button type="button" onClick={() => switchMode('forgot')} className="text-xs font-semibold text-[#6366f1] cursor-pointer">
                Quên mật khẩu?
              </button>
            )
          }
        >
          {(id) => (
            <PasswordInput
              id={id}
              value={password}
              onChange={setPassword}
              placeholder={mode === 'login' ? 'Mật khẩu của bạn' : 'Ít nhất 6 ký tự'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          )}
        </Field>

        {mode === 'forgot' && (
          <Field label="Nhập lại mật khẩu mới" required>
            {(id) => <PasswordInput id={id} value={confirmPassword} onChange={setConfirmPassword} placeholder="Nhập lại mật khẩu" autoComplete="new-password" />}
          </Field>
        )}

        {mode !== 'forgot' && (
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 accent-[#8b5cf6]" />
            Ghi nhớ trên thiết bị này
          </label>
        )}

        <Button type="submit" variant="primary" size="lg" block>
          {submitLabel}
        </Button>

        {mode !== 'forgot' && (
          <p className="pb-1 text-center text-sm text-slate-500">
            {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} className="font-bold text-[#6366f1] cursor-pointer">
              {mode === 'login' ? 'Tạo tài khoản KOC' : 'Đăng nhập'}
            </button>
          </p>
        )}
      </form>
    </Sheet>
  );
};
