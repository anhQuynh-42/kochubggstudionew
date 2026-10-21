import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AppDataProvider, useAppData } from './state/AppDataContext';
import { ROUTES } from './lib/constants';
import { SiteUIProvider } from './site/SiteUI';
import { SiteLayout, ToastHost } from './site/SiteLayout';
import { HomePage } from './site/pages/HomePage';
import { CampaignPage } from './site/pages/CampaignPage';
import { MyApplicationsPage } from './site/pages/MyApplicationsPage';
import { NotificationsPage } from './site/pages/NotificationsPage';
import { ProfilePage } from './site/pages/ProfilePage';
import { ProgressPage } from './site/pages/ProgressPage';
import { Button, EmptyState } from './site/ui';
import { AdminView } from './components/AdminView';
import { PublicMediaKitModal, PublicMediaKitData } from './components/PublicMediaKitModal';

/**
 * Website KOCity
 *  - Phía KOC: giao diện mới trong src/site (mỗi trang có đường dẫn riêng)
 *  - /admin : trang quản trị cũ (giữ nguyên), dùng chung dữ liệu qua AppDataContext
 */
export const App: React.FC = () => (
  <BrowserRouter>
    <AppDataProvider>
      <SiteUIProvider>
        <Routes>
          <Route path={ROUTES.admin} element={<AdminRoute />} />
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/c/:id" element={<CampaignPage />} />
            <Route path={ROUTES.progress} element={<ProgressPage />} />
            <Route path={ROUTES.myApplications} element={<MyApplicationsPage />} />
            <Route path={ROUTES.notifications} element={<NotificationsPage />} />
            <Route path={ROUTES.profile} element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <PublicMediaKitOverlay />
      </SiteUIProvider>
    </AppDataProvider>
  </BrowserRouter>
);

/** Trang quản trị cũ — chỉ tài khoản Admin vào được */
const AdminRoute: React.FC = () => {
  const data = useAppData();
  const navigate = useNavigate();
  if (!data.isAdmin) return <Navigate to={ROUTES.home} replace />;
  return (
    <>
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
      />
      <ToastHost />
    </>
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
