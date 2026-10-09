import React, { useState } from 'react';
import { AppNotification, KOCUser } from '../types';
import { ZALO_GROUP_URL } from './ZaloCommunityWidget';

interface HeaderProps {
  currentUser: KOCUser | null;
  onOpenLogin: (initialMode?: 'login' | 'register', prompt?: string) => void;
  onLogout: () => void;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  notifications: AppNotification[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenGuidelines?: () => void;
  myCampaignsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenLogin,
  onLogout,
  currentTab,
  onSelectTab,
  notifications,
  searchQuery,
  onSearchChange,
  onOpenGuidelines,
  myCampaignsCount = 0,
}) => {
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <button
            id="kochub-logo-btn"
            onClick={() => onSelectTab('marketplace')}
            className="group flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
          >
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] p-1.5 shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-xl text-white">hub</span>
            </div>
            <div className="flex flex-col">
              <span className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                Ko<span className="text-[#6366f1]">city</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 -mt-1 hidden sm:inline">
                Cổng nhận mẫu & Booking KOC
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {/* 1. Khám phá chiến dịch */}
            <button
              id="nav-marketplace-btn"
              onClick={() => onSelectTab('marketplace')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'marketplace' || currentTab === 'detail'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 hover:bg-indigo-50/70 hover:text-[#6366f1]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              <span>Khám phá chiến dịch</span>
            </button>

            {/* 2. Quy trình và hướng dẫn (chỉ dành cho KOC / Khách, ẩn ở tài khoản Admin) */}
            {onOpenGuidelines && currentUser?.role !== 'admin' && (
              <button
                id="nav-guidelines-btn"
                onClick={onOpenGuidelines}
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-indigo-50/70 hover:text-[#6366f1] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span>Quy trình và hướng dẫn</span>
              </button>
            )}

            {/* Sau khi đăng nhập: Chiến dịch của tôi (dành cho KOC) */}
            {currentUser && currentUser.role !== 'admin' && (
              <button
                id="nav-my-campaigns-btn"
                onClick={() => onSelectTab('my-campaigns')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'my-campaigns'
                    ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 hover:bg-indigo-50/70 hover:text-[#6366f1]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                <span>Chiến dịch của tôi</span>
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    currentTab === 'my-campaigns' ? 'bg-white/25 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  }`}
                >
                  {myCampaignsCount}
                </span>
              </button>
            )}

            {/* Sau khi đăng nhập: Hồ sơ KOC (dành cho KOC) */}
            {currentUser && currentUser.role !== 'admin' && (
              <button
                id="nav-profile-btn"
                onClick={() => onSelectTab('profile')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer ${
                  currentTab === 'profile'
                    ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 hover:bg-indigo-50/70 hover:text-[#6366f1]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">badge</span>
                <span>Hồ sơ KOC</span>
              </button>
            )}

            {/* Khi là ADMIN: nút truy cập nhanh Admin Dashboard trên navbar */}
            {currentUser && currentUser.role === 'admin' && (
              <button
                id="nav-admin-dashboard-btn"
                onClick={() => onSelectTab('admin')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition-all cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-md shadow-indigo-500/20'
                    : 'text-[#6366f1] bg-purple-50 hover:bg-purple-100'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] text-purple-600">admin_panel_settings</span>
                <span>Admin Dashboard</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right: Quick Search, Notifs & KOC Profile / Login */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search */}
          <div className="relative hidden lg:block w-52 xl:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">
              search
            </span>
            <input
              id="global-search-input"
              type="text"
              placeholder="Tìm chiến dịch, brand..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 transition-all focus:border-[#6366f1] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Admin Mode Toggle Button (Chỉ hiển thị khi đã đăng nhập Admin) */}
          {currentUser?.role === 'admin' && (
            <button
              id="header-admin-toggle-btn"
              onClick={() => onSelectTab(currentTab === 'admin' ? 'marketplace' : 'admin')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-300'
                  : 'bg-slate-900 text-slate-100 hover:bg-slate-800'
              }`}
              title="Chuyển đổi giao diện Quản Trị Hệ Thống"
            >
              <span className="material-symbols-outlined text-[16px] text-purple-300">
                admin_panel_settings
              </span>
              <span className="hidden sm:inline">
                {currentTab === 'admin' ? 'Xem giao diện KOC' : 'Admin Dashboard'}
              </span>
            </button>
          )}

          {/* Conditional Rendering: Logged-in vs Guest */}
          {currentUser ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  id="notifications-btn"
                  onClick={() => setShowNotif(!showNotif)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Thông báo"
                >
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6366f1] px-1 text-[10px] font-bold text-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900">
                          Thông báo của bạn
                        </span>
                        <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {unreadCount} mới
                        </span>
                      </div>
                      <button
                        onClick={() => setShowNotif(false)}
                        className="text-xs text-slate-900 font-medium hover:underline cursor-pointer"
                      >
                        Đóng
                      </button>
                    </div>

                    <div className="mt-3 divide-y divide-slate-100 max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-2.5 rounded-xl transition-colors hover:bg-slate-50 ${
                            !notif.read ? 'bg-slate-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                notif.type === 'delivery'
                                  ? 'bg-blue-100 text-blue-700'
                                  : notif.type === 'payout'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-900'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {notif.type === 'delivery'
                                  ? 'local_shipping'
                                  : notif.type === 'payout'
                                  ? 'account_balance_wallet'
                                  : 'campaign'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-slate-900 leading-snug">
                                {notif.title}
                              </p>
                              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>
                              <span className="mt-1 block text-[10px] font-medium text-slate-400">
                                {notif.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Logged in KOC Profile */}
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 rounded-xl border p-1 pr-2.5 transition-all cursor-pointer ${
                    currentTab === 'profile'
                      ? 'border-indigo-300 bg-indigo-50/80 ring-2 ring-indigo-200 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-slate-100">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-500"></span>
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900">{currentUser.name}</span>
                      <span className="material-symbols-outlined text-[14px] text-slate-900 fill-current">
                        verified
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">
                      {currentUser.tiktokHandle}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-slate-500">
                    arrow_drop_down
                  </span>
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-600 font-medium">{currentUser.tiktokHandle}</p>
                      <span className="inline-block mt-1 rounded bg-purple-100 text-purple-800 px-2 py-0.5 text-[9px] font-bold border border-purple-200">
                        {currentUser.role === 'admin' ? '🛡️ Quản Trị Viên Kocity' : `KOC Creator (${currentUser.followers})`}
                      </span>
                    </div>

                    <div className="py-1">
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            onSelectTab('admin');
                            setShowUserMenu(false);
                          }}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold cursor-pointer transition-colors mb-1 ${
                            currentTab === 'admin'
                              ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-xs'
                              : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                          <span>Admin Dashboard</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onSelectTab('profile');
                          setShowUserMenu(false);
                        }}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                          currentTab === 'profile'
                            ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-xs font-bold'
                            : 'text-slate-800 hover:bg-indigo-50 hover:text-[#6366f1]'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[16px] ${currentTab === 'profile' ? 'text-white' : 'text-[#6366f1]'}`}>
                          badge
                        </span>
                        Hồ sơ KOC & Media Kit
                      </button>

                      <button
                        onClick={() => {
                          onSelectTab('my-campaigns');
                          setShowUserMenu(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer transition-colors ${
                          currentTab === 'my-campaigns'
                            ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-xs font-bold'
                            : 'text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined text-[16px] ${currentTab === 'my-campaigns' ? 'text-white' : 'text-slate-900'}`}>
                            inventory_2
                          </span>
                          <span>Quản lý đơn nhận mẫu</span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            currentTab === 'my-campaigns'
                              ? 'bg-white/20 text-white'
                              : 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                          }`}
                        >
                          {myCampaignsCount}
                        </span>
                      </button>

                      <div className="my-1 border-t border-slate-100"></div>

                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserMenu(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          logout
                        </span>
                        Đăng xuất tài khoản
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Guest mode: chỉ hiển thị Đăng ký và Đăng nhập trên thanh điều hướng */
            <div className="flex items-center gap-2">
              <button
                id="header-register-btn"
                onClick={() => onOpenLogin('register', 'Đăng ký tài khoản KOC để nhận mẫu 0đ và quản lý các chiến dịch!')}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/80 hover:bg-purple-100 px-3.5 py-2 text-xs sm:text-sm font-bold text-[#6366f1] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Đăng ký</span>
              </button>
              <button
                id="header-login-btn"
                onClick={() => onOpenLogin('login')}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-95 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Đăng nhập</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-200 px-3 py-2 overflow-x-auto gap-2 bg-slate-50 items-center justify-between">
        <div className="flex gap-1.5">
          {/* 1. Khám phá */}
          <button
            onClick={() => onSelectTab('marketplace')}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              currentTab === 'marketplace' || currentTab === 'detail'
                ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-sm'
                : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">explore</span>
            Khám phá chiến dịch
          </button>

          {/* 2. Quy trình & hướng dẫn (chỉ dành cho KOC / Khách, ẩn ở tài khoản Admin) */}
          {onOpenGuidelines && currentUser?.role !== 'admin' && (
            <button
              onClick={onOpenGuidelines}
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              Quy trình & Hướng dẫn
            </button>
          )}

          {/* 3. Chế độ Quản trị Admin (Mobile - Chỉ hiện khi đã đăng nhập Admin) */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => onSelectTab(currentTab === 'admin' ? 'marketplace' : 'admin')}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-sm'
                  : 'text-slate-800 bg-slate-200/80 hover:bg-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              Quản trị
            </button>
          )}

          {/* Sau khi đăng nhập: Chiến dịch của tôi */}
          {currentUser && (
            <button
              onClick={() => onSelectTab('my-campaigns')}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                currentTab === 'my-campaigns'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-sm'
                  : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
              <span>Chiến dịch của tôi ({myCampaignsCount})</span>
            </button>
          )}

          {/* Sau khi đăng nhập: Hồ sơ KOC (Mobile) */}
          {currentUser && currentUser.role !== 'admin' && (
            <button
              onClick={() => onSelectTab('profile')}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                currentTab === 'profile'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-sm'
                  : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">badge</span>
              <span>Hồ sơ KOC</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!currentUser && (
            <button
              onClick={() => onOpenLogin('login')}
              className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-95 px-2.5 py-1.5 text-[11px] font-bold text-white whitespace-nowrap shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">login</span>
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
