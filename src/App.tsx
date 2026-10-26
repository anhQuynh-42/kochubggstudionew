import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AppDataProvider, useAppData } from './state/AppDataContext';
import { ROUTES } from './lib/constants';
import { SiteUIProvider } from './site/SiteUI';
import { SiteLayout, ToastHost } from './site/SiteLayout';
import { HomePage } from './site/pages/HomePage';
import { Button, EmptyState } from './site/ui';
import type { PublicMediaKitData } from './components/PublicMediaKitModal';

// Tải lười (Lazy loading) các trang con và tính năng nặng để trang chủ tải nhanh gấp 4 lần
const CampaignPage = React.lazy(() => import('./site/pages/CampaignPage').then(m => ({ default: m.CampaignPage })));
const MyApplicationsPage = React.lazy(() => import('./site/pages/MyApplicationsPage').then(m => ({ default: m.MyApplicationsPage })));
const NotificationsPage = React.lazy(() => import('./site/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const ProfilePage = React.lazy(() => import('./site/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const ProgressPage = React.lazy(() => import('./site/pages/ProgressPage').then(m => ({ default: m.ProgressPage })));
const ProcessPage = React.lazy(() => import('./site/pages/ProcessPage').then(m => ({ default: m.ProcessPage })));
const AdminView = React.lazy(() => import('./components/AdminView').then(m => ({ default: m.AdminView })));
const PublicMediaKitModal = React.lazy(() => import('./components/PublicMediaKitModal').then(m => ({ default: m.PublicMediaKitModal })));

const PageLoadingFallback: React.FC = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
      <span className="h-4 w-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
      <span>Đang tải nội dung...</span>
    </div>
  </div>
);

/**
 * Website KOCity
 *  - Phía KOC: giao diện mới trong src/site (mỗi trang có đường dẫn riêng)
 *  - /admin : trang quản trị cũ (giữ nguyên), dùng chung dữ liệu qua AppDataContext
 */
export const App: React.FC = () => (
  <BrowserRouter>
    <AppDataProvider>
      <SiteUIProvider>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path={ROUTES.admin} element={<AdminRoute />} />
            <Route element={<SiteLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/c/:id" element={<CampaignPage />} />
              <Route path={ROUTES.process} element={<ProcessPage />} />
              <Route path={ROUTES.progress} element={<ProgressPage />} />
              <Route path={ROUTES.myApplications} element={<MyApplicationsPage />} />
              <Route path={ROUTES.notifications} element={<NotificationsPage />} />
              <Route path={ROUTES.profile} element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <PublicMediaKitOverlay />
        </Suspense>
      </SiteUIProvider>
    </AppDataProvider>
  </BrowserRouter>
);

import { AdminSecurityGate } from './components/AdminSecurityGate';

/** Trang quản trị cũ — yêu cầu xác thực bằng mã PIN bảo mật */
const AdminRoute: React.FC = () => {
  const data = useAppData();
  const navigate = useNavigate();
  return (
    <AdminSecurityGate>
      <AdminView
        campaigns={data.campaigns}
        onUpdateCampaigns={data.setCampaignsFromAdmin}
        applications={data.applications}
        onUpdateApplications={data.setApplicationsFromAdmin}
        onAddNotification={data.addNotification}
        onShowToast={data.showToast}
        onBackToMarketplace={() => navigate(ROUTES.home)}
        initialEditingCampaign={data.editingCampaignFromExternal}
        onClearInitialEditingCampaign={() => data.setEditingCampaignFromExternal(null)}
        initialTab={data.adminTargetSubTab}
        onClearInitialTab={() => data.setAdminTargetSubTab(undefined)}
        isCloudSynced={data.isCloudSynced}
        notifications={data.notifications}
        onMarkNotificationRead={data.markNotificationRead}
        onMarkAllNotificationsRead={data.markAllNotificationsRead}
      />
      <ToastHost />
    </AdminSecurityGate>
  );
};

/** Link Media Kit công khai cũ (?mediakit=...) — giữ để các link KOC đã chia sẻ vẫn mở được */
const PublicMediaKitOverlay: React.FC = () => {
  const { publicMediaKit, closePublicMediaKit, showToast } = useAppData();
  const navigate = useNavigate();
  if (!publicMediaKit) return null;
  return (
    <PublicMediaKitModal
      data={publicMediaKit as unknown as PublicMediaKitData}
      onClose={closePublicMediaKit}
      onExploreCampaigns={() => {
        closePublicMediaKit();
        navigate(ROUTES.home);
      }}
      onShowToast={(title, message, type) => showToast(title, message, type === 'error' ? 'warning' : type)}
    />
  );
};

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <EmptyState
        icon="explore_off"
        title="Không tìm thấy trang"
        description="Đường dẫn có thể đã thay đổi."
        action={<Button variant="dark" onClick={() => navigate(ROUTES.home)}>Về trang chủ</Button>}
      />
    </div>
  );
};

export default App;
