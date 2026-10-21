import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppData } from '../state/AppDataContext';
import { BRAND_CONTACT, ROUTES, SOCIAL_LINKS, ZALO_GROUP_URL } from '../lib/constants';
import { useSiteUI } from './SiteUI';
import { Avatar, Button, Icon, cx } from './ui';

const NAV = [
  { to: ROUTES.home, label: 'Khám phá', icon: 'explore', end: true },
  { to: ROUTES.process, label: 'Quy trình', icon: 'alt_route' },
  { to: ROUTES.progress, label: 'Tiến độ', icon: 'monitoring' },
  { to: ROUTES.myApplications, label: 'Đơn của tôi', icon: 'inventory_2' },
  { to: ROUTES.notifications, label: 'Thông báo', icon: 'notifications' },
  { to: ROUTES.profile, label: 'Hồ sơ', icon: 'account_circle' },
];

/** Khung chung: thanh trên, nội dung trang, chân trang, thanh điều hướng dưới (điện thoại), thông báo nổi */
export const SiteLayout: React.FC = () => {
  const location = useLocation();
  const isCampaignPage = location.pathname.startsWith('/c/');

  // Về đầu trang mỗi khi chuyển trang
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className={cx('flex min-h-dvh flex-col', !isCampaignPage && 'pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0')}>
      <TopBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {!isCampaignPage && <BottomNav />}
      <ZaloFab raised={!isCampaignPage} />
      <ToastHost />
    </div>
  );
};

const Logo: React.FC = () => (
  <Link to={ROUTES.home} className="flex shrink-0 items-center gap-2" aria-label="Kocity – trang chủ">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#ec4899] text-white shadow-md shadow-violet-500/25">
      <Icon name="hub" className="text-[20px]" />
    </span>
    <span className="font-display text-xl font-extrabold tracking-tight text-slate-900">
      Ko<span className="text-[#7c3aed]">city</span>
    </span>
  </Link>
);

const TopBar: React.FC = () => {
  const { currentUser, isAdmin, unreadCount, myApplications, signOut } = useAppData();
  const { openAuth } = useSiteUI();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => menuRef.current && !menuRef.current.contains(e.target as Node) && setMenuOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const badgeFor = (to: string) => (to === ROUTES.myApplications ? myApplications.length : to === ROUTES.notifications ? unreadCount : 0);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />

        {/* Menu giống nhau dù đã đăng nhập hay chưa; khách bấm vào sẽ thấy lời mời đăng nhập */}
        {!isAdmin && (
          <nav aria-label="Menu chính" className="hidden items-center gap-1 md:flex">
            {NAV.filter((item) => item.to !== ROUTES.notifications && item.to !== ROUTES.profile).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cx(
                    'inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-colors',
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
              >
                {item.label}
                {badgeFor(item.to) > 0 && (
                  <span className="rounded-full bg-[#ec4899] px-1.5 text-[11px] font-bold leading-5 text-white">{badgeFor(item.to)}</span>
                )}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Tìm kiếm chiến dịch (máy tính) → chuyển tới trang Khám phá kèm từ khóa */}
          {!isAdmin && (
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                const q = new FormData(e.currentTarget).get("q")?.toString().trim() || "";
                navigate(q ? `${ROUTES.home}?q=${encodeURIComponent(q)}#mau-dang-mo` : ROUTES.home);
              }}
              className="relative hidden lg:block"
            >
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400" />
              <input
                name="q"
                type="search"
                placeholder="Tìm chiến dịch, brand..."
                aria-label="Tìm chiến dịch"
                className="h-10 w-56 rounded-full bg-slate-100 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:w-72 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] xl:w-64"
              />
            </form>
          )}

          {/* Nút chuông thông báo */}
          {!isAdmin && (
            <Link
              to={ROUTES.notifications}
              aria-label={`Thông báo${unreadCount ? ` (${unreadCount} chưa đọc)` : ""}`}
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 md:flex"
            >
              <Icon name="notifications" className="text-[22px]" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ec4899] px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {isAdmin && (
            <Button variant="soft" size="sm" onClick={() => navigate(ROUTES.admin)}>
              <Icon name="admin_panel_settings" className="text-[18px]" />
              Trang quản trị
            </Button>
          )}

          {currentUser ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-label="Tài khoản"
                className="flex items-center gap-2.5 rounded-full p-0.5 transition-colors hover:bg-slate-50 md:py-1 md:pl-1 md:pr-3 md:ring-1 md:ring-slate-200 cursor-pointer"
              >
                <Avatar name={currentUser.name} src={currentUser.avatar} size={34} />
                <span className="hidden max-w-[10rem] text-left leading-tight md:block">
                  <span className="block truncate text-sm font-semibold text-slate-900">{currentUser.name}</span>
                  <span className="block truncate text-xs text-slate-500">{isAdmin ? "Quản trị viên" : currentUser.tiktokHandle}</span>
                </span>
                <Icon name="expand_more" className="hidden text-[18px] text-slate-400 md:block" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-slate-200">
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-bold text-slate-900">{currentUser.name}</p>
                    <p className="truncate text-xs text-slate-500">{isAdmin ? 'Quản trị viên' : currentUser.tiktokHandle}</p>
                  </div>
                  <div className="my-1 h-px bg-slate-100" />
                  {!isAdmin && (
                    <MenuItem icon="monitoring" label="Tiến độ" onClick={() => { navigate(ROUTES.progress); setMenuOpen(false); }} />
                  )}
                  {!isAdmin && (
                    <MenuItem icon="account_circle" label="Hồ sơ của tôi" onClick={() => { navigate(ROUTES.profile); setMenuOpen(false); }} />
                  )}
                  <MenuItem
                    icon="logout"
                    label="Đăng xuất"
                    danger
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                      navigate(ROUTES.home);
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <Button variant="dark" size="sm" onClick={() => openAuth('login')}>
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

const MenuItem: React.FC<{ icon: string; label: string; onClick: () => void; danger?: boolean }> = ({ icon, label, onClick, danger }) => (
  <button
    type="button"
    onClick={onClick}
    className={cx('flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm cursor-pointer', danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-700 hover:bg-slate-50')}
  >
    <Icon name={icon} className="text-[20px] opacity-70" />
    {label}
  </button>
);

const BottomNav: React.FC = () => {
  const { unreadCount, myApplications, isAdmin } = useAppData();
  if (isAdmin) return null;
  const badgeFor = (to: string) => (to === ROUTES.myApplications ? myApplications.length : to === ROUTES.notifications ? unreadCount : 0);

  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul className="grid grid-cols-4">
        {NAV.filter((item) => item.to !== ROUTES.progress && item.to !== ROUTES.process).map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end} className="flex h-[4.25rem] flex-col items-center justify-center gap-1">
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon name={item.icon} filled={isActive} className={cx('text-[26px]', isActive ? 'text-[#7c3aed]' : 'text-slate-400')} />
                    {badgeFor(item.to) > 0 && (
                      <span className="absolute -right-2.5 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ec4899] px-1 text-[10px] font-bold text-white ring-2 ring-white">
                        {badgeFor(item.to)}
                      </span>
                    )}
                  </span>
                  <span className={cx('text-[11px] font-semibold', isActive ? 'text-slate-900' : 'text-slate-500')}>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const Footer: React.FC = () => (
  <footer className="mt-16 border-t border-slate-200/70 bg-white">
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        <Logo />
        <p className="mt-3 max-w-sm text-sm text-slate-500">Nền tảng nhận mẫu 0đ và hợp tác hoa hồng dành cho Nano & Micro KOC TikTok.</p>
        <div className="mt-3">
          <Link to={ROUTES.process} className="inline-flex items-center gap-1 text-xs font-semibold text-[#7c3aed] hover:underline">
            Xem quy trình dịch vụ KOCity <Icon name="arrow_forward" className="text-[12px]" />
          </Link>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-900">Cộng đồng</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>
            <a href={ZALO_GROUP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#6366f1]">Nhóm Zalo KOC</a>
          </li>
          {SOCIAL_LINKS.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-[#6366f1]">
                {s.label} · {s.handle}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-900">Dành cho Brand</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>
            Hotline/Zalo: <a href={BRAND_CONTACT.hotlineHref} className="font-semibold text-slate-800 hover:text-[#6366f1]">{BRAND_CONTACT.hotline}</a>
          </li>
          <li>
            Email: <a href={`mailto:${BRAND_CONTACT.email}`} className="font-semibold text-slate-800 hover:text-[#6366f1]">{BRAND_CONTACT.email}</a>
          </li>
        </ul>
      </div>
    </div>
    <p className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} Kocity</p>
  </footer>
);

/** Nút Zalo nổi góc dưới bên phải (nằm trên thanh điều hướng/nút dính đáy khi dùng điện thoại) */
const ZaloFab: React.FC<{ raised: boolean }> = ({ raised }) => (
  <a
    href={ZALO_GROUP_URL}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Hỗ trợ qua nhóm Zalo KOC"
    className={cx(
      'group fixed right-4 z-40 flex items-center gap-2 rounded-full bg-[#0068ff] p-1.5 pr-1.5 text-white shadow-xl shadow-blue-600/30 ring-4 ring-white transition-all hover:pr-4 md:bottom-6 md:right-6',
      raised ? 'bottom-[calc(5.25rem+env(safe-area-inset-bottom))]' : 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-6'
    )}
  >
    <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-[13px] font-black text-[#0068ff]">
      Zalo
      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#0068ff]" />
    </span>
    <span className="hidden text-sm font-semibold md:inline">Hỗ trợ KOC</span>
  </a>
);

export const ToastHost: React.FC = () => {
  const { toast, dismissToast } = useAppData();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismissToast, 3500);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);
  if (!toast) return null;
  const icon = toast.type === 'success' ? 'check_circle' : toast.type === 'warning' ? 'warning' : 'info';
  const color = toast.type === 'success' ? 'text-emerald-500' : toast.type === 'warning' ? 'text-amber-500' : 'text-[#8b5cf6]';
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(4.5rem+env(safe-area-inset-top))] z-[60] flex justify-center px-4 md:inset-x-auto md:right-6 md:top-auto md:bottom-6">
      <div role="status" className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-slate-900 p-3.5 text-white shadow-2xl animate-[sheetUp_.2s_ease-out]">
        <Icon name={icon} filled className={cx('text-[22px]', color)} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.message && <p className="mt-0.5 text-xs text-slate-300">{toast.message}</p>}
        </div>
        <button type="button" onClick={dismissToast} aria-label="Đóng thông báo" className="text-slate-400 hover:text-white cursor-pointer">
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
};
