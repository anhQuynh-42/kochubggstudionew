import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message?: string;
}

export type ToastNotification = ToastMessage;

interface ToastProps {
  toasts?: ToastMessage[];
  notification?: ToastMessage | null;
  onDismiss?: (id: string) => void;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts = [], notification, onDismiss, onClose }) => {
  // Support both array mode or single notification mode
  const activeList = notification ? [notification] : toasts;

  useEffect(() => {
    if (activeList.length === 0) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
      if (onDismiss && activeList[0]) onDismiss(activeList[0].id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [activeList, onClose, onDismiss]);

  if (activeList.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {activeList.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 duration-200 ${
              isSuccess
                ? 'border-emerald-200 bg-white/95 text-slate-900'
                : isWarning
                ? 'border-amber-200 bg-white/95 text-slate-900'
                : 'border-orange-200 bg-white/95 text-slate-900'
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                isSuccess
                  ? 'bg-emerald-100 text-emerald-700'
                  : isWarning
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-orange-100 text-orange-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSuccess ? 'check_circle' : isWarning ? 'warning' : 'info'}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-['Plus_Jakarta_Sans'] text-xs font-bold leading-tight text-slate-900">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="mt-0.5 text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                if (onClose) onClose();
                if (onDismiss) onDismiss(toast.id);
              }}
              className="shrink-0 text-slate-400 hover:text-slate-800 transition-colors p-1 cursor-pointer"
              title="Đóng"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
