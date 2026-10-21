import { AppNotification, KOCUser } from '../types';

const norm = (s?: string) => (s ? s.toLowerCase().replace(/[@\s.-]/g, '') : '');

/** Lọc thông báo phù hợp theo vai trò (Admin hoặc KOC) và người nhận đích danh */
export function getVisibleNotifications(
  notifications: AppNotification[],
  currentUser: KOCUser | null
): AppNotification[] {
  if (!currentUser) return [];

  return notifications.filter((n) => {
    if (currentUser.role === 'admin') {
      return n.targetRole === 'admin' || n.targetRole === 'all' || !n.targetRole;
    }

    // Thông báo có người nhận đích danh (chỉ dành riêng cho 1 KOC)
    if (n.targetKocId || n.targetTiktokHandle || n.targetPhone || n.targetEmail) {
      const matchId = Boolean(n.targetKocId && currentUser.id && n.targetKocId === currentUser.id);
      const matchHandle = Boolean(
        n.targetTiktokHandle && currentUser.tiktokHandle && norm(n.targetTiktokHandle) === norm(currentUser.tiktokHandle)
      );
      const matchPhone = Boolean(n.targetPhone && currentUser.phone && norm(n.targetPhone) === norm(currentUser.phone));
      const matchEmail = Boolean(n.targetEmail && currentUser.email && norm(n.targetEmail) === norm(currentUser.email));
      return matchId || matchHandle || matchPhone || matchEmail;
    }

    return n.targetRole === 'koc' || n.targetRole === 'all' || !n.targetRole;
  });
}

export const NOTIFICATION_ICON: Record<AppNotification['type'], { icon: string; className: string }> = {
  delivery: { icon: 'local_shipping', className: 'bg-sky-100 text-sky-700' },
  payout: { icon: 'payments', className: 'bg-amber-100 text-amber-700' },
  approval: { icon: 'how_to_reg', className: 'bg-emerald-100 text-emerald-700' },
  campaign: { icon: 'campaign', className: 'bg-violet-100 text-violet-700' },
  announcement: { icon: 'campaign', className: 'bg-violet-100 text-violet-700' },
};
