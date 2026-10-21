import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../state/AppDataContext';
import { getApplicationProgress, SELECTION_LABELS, VIDEO_LABELS } from '../../lib/applicationStatus';
import { ROUTES } from '../../lib/constants';
import { useSiteUI } from '../SiteUI';
import { Badge, Button, EmptyState, Icon, cx } from '../ui';

/** Trang "Tiến độ": tổng quan hoạt động của KOC, chỉ dùng dữ liệu thật (đơn, hồ sơ, thông báo) */
export const ProgressPage: React.FC = () => {
  const { currentUser, myApplications, campaigns, visibleNotifications } = useAppData();
  const { openAuth } = useSiteUI();

  const items = useMemo(() => myApplications.map((app) => ({ app, p: getApplicationProgress(app) })), [myApplications]);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md px-4 py-14">
        <EmptyState
          icon="monitoring"
          title="Đăng nhập để xem tiến độ"
          description="Theo dõi đơn, việc cần làm và kết quả của bạn tại một nơi."
          action={<Button variant="primary" size="lg" onClick={() => openAuth('login')}>Đăng nhập / Tạo tài khoản</Button>}
        />
      </div>
    );
  }

  const stats = [
    { label: 'Đơn đã gửi', value: items.length, icon: 'send' },
    { label: 'Chờ kết quả', value: items.filter((x) => x.p.selection === 'pending').length, icon: 'hourglass_top' },
    { label: 'Được chọn', value: items.filter((x) => x.p.selection === 'selected').length, icon: 'celebration' },
    { label: 'Đã lên bài', value: items.filter((x) => x.p.video === 'posted').length, icon: 'smart_display' },
  ];

  // Việc cần làm: suy ra từ trạng thái đơn và hồ sơ
  const brandOf = (id: string) => campaigns.find((c) => c.id === id)?.brandName || 'Chiến dịch';
  const todos = [
    ...items
      .filter((x) => x.p.video === 'needs_revision')
      .map((x) => ({ id: x.app.id, icon: 'feedback', tone: 'text-rose-500', text: `Sửa & nộp lại video cho ${brandOf(x.app.campaignId)}` })),
    ...items
      .filter((x) => x.p.selection === 'selected' && x.p.sample === 'delivered' && x.p.video === 'not_posted')
      .map((x) => ({ id: x.app.id, icon: 'videocam', tone: 'text-amber-500', text: `Quay & nộp video cho ${brandOf(x.app.campaignId)}` })),
    ...(!currentUser.phone || !currentUser.address
      ? [{ id: 'profile', icon: 'person', tone: 'text-violet-500', text: 'Bổ sung số điện thoại & địa chỉ để nộp đơn 1 chạm' }]
      : []),
  ];

  const completion = Math.round(
    ([currentUser.name, currentUser.tiktokHandle, currentUser.followers, currentUser.phone, currentUser.address, currentUser.categories?.length].filter(Boolean).length / 6) * 100
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 sm:pt-8">
      {/* Lời chào */}
      <section className="rounded-[28px] bg-[#0b0a1a] p-6 text-white sm:p-8">
        <p className="text-sm text-violet-300">Tiến độ của bạn</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">Xin chào {currentUser.name}!</h1>
        <p className="mt-1 text-sm text-white/60">
          {todos.length > 0 ? `Bạn có ${todos.length} việc cần làm.` : 'Bạn chưa có việc nào cần xử lý.'}
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse bg-[#0b0a1a] p-4">
              <dt className="mt-1 flex items-center gap-1.5 text-xs text-white/60">
                <Icon name={s.icon} className="text-[16px]" /> {s.label}
              </dt>
              <dd className="font-display text-3xl font-semibold">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Panel title="Việc cần làm" action={<Link to={ROUTES.myApplications} className="text-sm font-semibold text-[#6d28d9]">Đơn của tôi</Link>}>
            {todos.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">Không có việc nào. Tìm thêm mẫu mới nhé!</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {todos.map((t) => (
                  <li key={t.id + t.text}>
                    <Link to={t.id === 'profile' ? ROUTES.profile : ROUTES.myApplications} className="flex items-center gap-3 py-3 text-sm text-slate-800 hover:text-slate-950">
                      <Icon name={t.icon} className={cx('text-[22px]', t.tone)} />
                      <span className="flex-1">{t.text}</span>
                      <Icon name="chevron_right" className="text-slate-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Lịch sử đăng ký">
            {items.length === 0 ? (
              <div className="py-4 text-sm text-slate-500">
                Chưa có đơn nào.{' '}
                <Link to={ROUTES.home} className="font-semibold text-[#6d28d9]">Khám phá mẫu đang mở</Link>
              </div>
            ) : (
              <div className="-mx-5 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="text-xs text-slate-400">
                    <tr>
                      <th className="px-5 py-2 font-medium">Chiến dịch</th>
                      <th className="px-3 py-2 font-medium">Ngày gửi</th>
                      <th className="px-3 py-2 font-medium">Kết quả</th>
                      <th className="px-5 py-2 font-medium">Video</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map(({ app, p }) => (
                      <tr key={app.id}>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-900">{brandOf(app.campaignId)}</p>
                          <p className="font-mono text-xs text-slate-400">{app.code}</p>
                        </td>
                        <td className="px-3 py-3 text-slate-600">{app.createdAtDate}</td>
                        <td className="px-3 py-3">
                          <Badge tone={p.selection === 'selected' ? 'emerald' : p.selection === 'pending' ? 'amber' : 'slate'}>{SELECTION_LABELS[p.selection]}</Badge>
                        </td>
                        <td className="px-5 py-3 text-slate-600">{p.selection === 'selected' ? VIDEO_LABELS[p.video] : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Hoàn thiện hồ sơ" action={<span className="text-sm font-semibold text-[#6d28d9]">{completion}%</span>}>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[#6d28d9]" style={{ width: `${completion}%` }} />
            </div>
            {completion < 100 && (
              <Link to={ROUTES.profile} className="mt-3 inline-block text-sm font-semibold text-[#6d28d9]">
                Cập nhật hồ sơ →
              </Link>
            )}
          </Panel>

          <Panel title="Thông báo gần đây" action={<Link to={ROUTES.notifications} className="text-sm font-semibold text-[#6d28d9]">Xem tất cả</Link>}>
            {visibleNotifications.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">Chưa có thông báo.</p>
            ) : (
              <ul className="space-y-3">
                {visibleNotifications.slice(0, 5).map((n) => (
                  <li key={n.id} className="text-sm">
                    <p className={cx('font-semibold', n.read ? 'text-slate-700' : 'text-slate-950')}>
                      {!n.read && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#ec4899]" />}
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-400">{n.time}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Thao tác nhanh">
            <div className="grid grid-cols-2 gap-2">
              <Link to={ROUTES.home}><Button variant="primary" block>Tìm mẫu mới</Button></Link>
              <Link to={ROUTES.myApplications}><Button variant="outline" block>Nộp video</Button></Link>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
};

const Panel: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, action, children }) => (
  <section className="card-fx rounded-[24px] bg-white p-5 ring-1 ring-slate-200/70">
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);
