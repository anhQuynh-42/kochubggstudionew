import React, { useEffect, useId, useRef } from 'react';
import { APP_LOGOS } from '../data/mockData';

/** Bộ thành phần giao diện dùng chung của website KOC mới (phong cách sáng, tối giản kiểu app). */

export const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export const Icon: React.FC<{ name: string; className?: string; filled?: boolean }> = ({ name, className, filled }) => (
  <span
    aria-hidden="true"
    className={cx('material-symbols-outlined select-none', className)}
    style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
  >
    {name}
  </span>
);

type ButtonVariant = 'primary' | 'dark' | 'outline' | 'ghost' | 'soft';
const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'btn-fx bg-[#6d28d9] text-white shadow-sm shadow-violet-600/20 hover:bg-[#5b21b6] hover:shadow-lg hover:shadow-violet-600/30 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none',
  dark: 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400',
  outline: 'bg-white text-slate-800 ring-1 ring-slate-200 hover:ring-violet-300 hover:text-slate-900',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  soft: 'bg-violet-50 text-[#6d28d9] hover:bg-violet-100',
};
const BUTTON_SIZES = { sm: 'h-9 px-3.5 text-sm rounded-xl', md: 'h-11 px-4 text-sm rounded-2xl', lg: 'h-12 px-5 text-[15px] rounded-2xl' };

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: keyof typeof BUTTON_SIZES; block?: boolean }
>(({ variant = 'dark', size = 'md', block, className, type = 'button', ...rest }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cx(
      'inline-flex items-center justify-center gap-1.5 font-semibold transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:active:scale-100',
      BUTTON_VARIANTS[variant],
      BUTTON_SIZES[size],
      block && 'w-full',
      className
    )}
    {...rest}
  />
));
Button.displayName = 'Button';

export const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: string; label: string; filled?: boolean }> = ({
  icon,
  label,
  filled,
  className,
  ...rest
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cx('inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer', className || 'text-slate-600 hover:bg-slate-100')}
    {...rest}
  >
    <Icon name={icon} filled={filled} className="text-[22px]" />
  </button>
);

export const Chip: React.FC<{ active?: boolean; onClick?: () => void; children: React.ReactNode; className?: string }> = ({
  active,
  onClick,
  children,
  className,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cx(
      'inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors cursor-pointer',
      active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-violet-300',
      className
    )}
  >
    {children}
  </button>
);

export const Badge: React.FC<{ tone?: 'violet' | 'emerald' | 'amber' | 'pink' | 'slate' | 'sky'; children: React.ReactNode; className?: string }> = ({
  tone = 'slate',
  children,
  className,
}) => {
  const tones = {
    violet: 'bg-violet-50 text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-800',
    pink: 'bg-pink-50 text-pink-700',
    slate: 'bg-slate-100 text-slate-600',
    sky: 'bg-sky-50 text-sky-700',
  };
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone], className)}>{children}</span>;
};

export const inputClass =
  'h-12 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-base text-slate-900 placeholder-slate-400 transition-colors focus:border-[#8b5cf6] focus:outline-none focus:ring-4 focus:ring-violet-100 sm:text-sm';

export const Field: React.FC<{ label: string; hint?: string; required?: boolean; children: (id: string) => React.ReactNode; action?: React.ReactNode }> = ({
  label,
  hint,
  required,
  children,
  action,
}) => {
  const id = useId();
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
          {label}
          {required && <span className="text-[#ec4899]"> *</span>}
        </label>
        {action}
      </div>
      {children(id)}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
};

/** Ô nhập ID TikTok có sẵn @ */
export const TikTokHandleInput: React.FC<{ id: string; value: string; onChange: (v: string) => void; autoFocus?: boolean }> = ({
  id,
  value,
  onChange,
  autoFocus,
}) => (
  <div className="relative">
    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-semibold text-slate-400 sm:text-sm">@</span>
    <input
      id={id}
      value={value.replace(/^@+/, '')}
      onChange={(e) => onChange(e.target.value)}
      placeholder="minhthu.beauty"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      autoComplete="username"
      autoFocus={autoFocus}
      className={cx(inputClass, 'pl-8')}
    />
  </div>
);

/** Ô mật khẩu có nút hiện/ẩn */
export const PasswordInput: React.FC<{ id: string; value: string; onChange: (v: string) => void; placeholder?: string; autoComplete: string }> = ({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
}) => {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cx(inputClass, 'pr-12')}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
      >
        <Icon name={visible ? 'visibility_off' : 'visibility'} className="text-[20px]" />
      </button>
    </div>
  );
};

/**
 * Bảng trượt: trên điện thoại trồi lên từ đáy (bottom sheet), trên máy tính là hộp thoại giữa màn hình.
 * Đóng bằng nút X, phím Esc hoặc bấm ra ngoài. Khóa cuộn trang phía sau khi mở.
 */
export const Sheet: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg';
  label?: string;
}> = ({ open, onClose, title, subtitle, children, footer, size = 'md', label }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="presentation">
      <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] animate-[fadeIn_.15s_ease-out]" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label || (typeof title === 'string' ? title : undefined)}
        className={cx(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl outline-none sm:rounded-[28px] animate-[sheetUp_.22s_cubic-bezier(.2,.8,.2,1)]',
          size === 'lg' ? 'sm:max-w-xl' : 'sm:max-w-md'
        )}
      >
        <div className="flex justify-center pt-2.5 sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-slate-200" />
        </div>
        {(title || subtitle) && (
          <div className="flex items-start gap-3 px-5 pt-3 sm:px-6 sm:pt-6">
            <div className="min-w-0 flex-1">
              {title && <h2 className="font-display text-xl font-extrabold text-slate-900 sm:text-2xl">{title}</h2>}
              {subtitle && <div className="mt-1 text-sm text-slate-500">{subtitle}</div>}
            </div>
            <IconButton icon="close" label="Đóng" onClick={onClose} className="-mr-1 -mt-1 shrink-0 bg-slate-100 text-slate-500 hover:bg-slate-200" />
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
        {footer && <div className="border-t border-slate-100 bg-white px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-5">{footer}</div>}
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{ icon: string; title: string; description?: string; action?: React.ReactNode }> = ({
  icon,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center rounded-[28px] bg-white px-6 py-14 text-center ring-1 ring-slate-100">
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-pink-50 text-[#8b5cf6]">
      <Icon name={icon} className="text-[28px]" />
    </span>
    <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{title}</h3>
    {description && <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// Ảnh minh họa mặc định cũ (APP_LOGOS.userProfile) không phải ảnh của KOC → hiện chữ cái đầu thay thế
export const Avatar: React.FC<{ name?: string; src?: string; size?: number }> = ({ name, src, size = 36 }) =>
  src && src !== APP_LOGOS.userProfile ? (
    <img src={src} alt="" style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover ring-2 ring-white" />
  ) : (
    <span
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#ec4899] font-bold text-white"
    >
      {(name || '?').trim().charAt(0).toUpperCase()}
    </span>
  );

export const SectionTitle: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode; id?: string }> = ({ title, subtitle, action, id }) => (
  <div id={id} className="flex scroll-mt-20 items-end justify-between gap-3">
    <div>
      <h2 className="font-display text-xl font-extrabold text-slate-900 sm:text-2xl">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);
