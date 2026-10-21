import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNotification } from '../../types';
import { useAppData } from '../../state/AppDataContext';
import { NOTIFICATION_ICON } from '../../lib/notifications';
import { ROUTES } from '../../lib/constants';
import { useSiteUI } from '../SiteUI';
import { Button, EmptyState, Icon, cx } from '../ui';

const LINK_TO_ROUTE: Record<NonNullable<AppNotification['linkTab']>, string> = {
  marketplace: ROUTES.home,
  'my-campaigns': ROUTES.myApplications,
  profile: ROUTES.profile,
  admin: ROUTES.admin,
};

export const NotificationsPage: React.FC = () => {
  const { currentUser, visibleNotifications, unreadCount, markNotificationRead, markAllNotificationsRead, setAdminTargetSubTab } = useAppData();
  const { openAuth } = useSiteUI();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md px-4 py-14">
        <EmptyState
          icon="notifications"
          title="Đăng nhập để nhận thông báo"
          description="Bạn sẽ được báo ngay khi Brand chọn bạn, khi mẫu được gửi và khi video được duyệt."
          action={<Button variant="primary" size="lg" onClick={() => openAuth('login')}>Đăng nhập / Tạo tài khoản</Button>}
        />
      </div>
    );
  }

  const open = (n: AppNotification) => {
    markNotificationRead(n.id);
    if (n.adminSubTab) setAdminTargetSubTab(n.adminSubTab);
    if (n.linkTab) navigate(LINK_TO_ROUTE[n.linkTab]);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pt-5 sm:px-6 sm:pt-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">Thông báo</h1>
          <p className="mt-1 text-sm text-slate-500">{unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Bạn đã xem hết'}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllNotificationsRead}>
            Đọc tất cả
          </Button>
        )}
      </div>

      {visibleNotifications.length === 0 ? (
        <div className="mt-5">
          <EmptyState icon="notifications_off" title="Chưa có thông báo" description="Khi đơn của bạn có cập nhật, thông báo sẽ hiện ở đây." />
        </div>
      ) : (
        <ul className="mt-5 space-y-2">
          {visibleNotifications.map((n) => {
            const style = NOTIFICATION_ICON[n.type] || NOTIFICATION_ICON.campaign;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => open(n)}
                  className={cx(
                    'flex w-full items-start gap-3 rounded-[22px] p-4 text-left transition-colors cursor-pointer',
                    n.read ? 'bg-white ring-1 ring-slate-100 hover:ring-slate-200' : 'bg-violet-50/70 ring-1 ring-violet-100 hover:ring-violet-200'
                  )}
                >
                  <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', style.className)}>
                    <Icon name={style.icon} className="text-[20px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold leading-snug text-slate-900">{n.title}</span>
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#ec4899]" aria-label="Chưa đọc" />}
                    </span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-slate-600">{n.message}</span>
                    <span className="mt-1 block text-xs text-slate-400">{n.time}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
