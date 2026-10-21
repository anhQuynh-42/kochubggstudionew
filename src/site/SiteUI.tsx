import React, { createContext, useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Campaign, KOCUser } from '../types';
import { useAppData } from '../state/AppDataContext';
import { getApplicationProgress } from '../lib/applicationStatus';
import { ROUTES } from '../lib/constants';
import { AuthMode, AuthSheet } from './components/AuthSheet';
import { ApplySheet } from './components/ApplySheet';

/**
 * Điều phối các bảng trượt dùng chung toàn website:
 * - openAuth(): mở đăng nhập / đăng ký
 * - requestApply(campaign): luồng nhận mẫu. Chưa đăng nhập → tạo tài khoản → tự mở tiếp form nhận mẫu.
 *   Đã có đơn đang xử lý cho chiến dịch này → đưa tới "Đơn của tôi" (tránh nộp trùng, CLAUDE.md 7.4).
 */
interface SiteUIValue {
  openAuth: (mode?: AuthMode, reason?: string) => void;
  requestApply: (campaign: Campaign) => void;
  getExistingApplication: (campaignId: string) => ReturnType<typeof findActive>;
}

const SiteUIContext = createContext<SiteUIValue | null>(null);
export const useSiteUI = () => {
  const ctx = useContext(SiteUIContext);
  if (!ctx) throw new Error('useSiteUI phải nằm trong <SiteUIProvider>');
  return ctx;
};

function findActive(apps: ReturnType<typeof useAppData>['myApplications'], campaignId: string) {
  return apps.find((a) => a.campaignId === campaignId && getApplicationProgress(a).selection !== 'not_selected');
}

export const SiteUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, myApplications, signIn, showToast } = useAppData();
  const navigate = useNavigate();

  const [auth, setAuth] = useState<{ open: boolean; mode: AuthMode; reason: string | null }>({ open: false, mode: 'login', reason: null });
  const [pendingCampaign, setPendingCampaign] = useState<Campaign | null>(null);
  const [applyCampaign, setApplyCampaign] = useState<Campaign | null>(null);

  const openAuth = useCallback((mode: AuthMode = 'login', reason?: string) => setAuth({ open: true, mode, reason: reason || null }), []);

  const getExistingApplication = useCallback((campaignId: string) => findActive(myApplications, campaignId), [myApplications]);

  const requestApply = useCallback(
    (campaign: Campaign) => {
      if (isAdmin) {
        showToast('Tài khoản quản trị không nộp đơn', 'Hãy dùng tài khoản KOC để thử luồng nhận mẫu.', 'info');
        return;
      }
      if (!currentUser) {
        setPendingCampaign(campaign);
        openAuth('register', `Tạo tài khoản KOC để nhận mẫu ${campaign.brandName}. Xong là vào thẳng form nhận mẫu.`);
        return;
      }
      if (getExistingApplication(campaign.id)) {
        showToast('Bạn đã đăng ký chiến dịch này', 'Xem tiến độ trong Đơn của tôi.', 'info');
        navigate(ROUTES.myApplications);
        return;
      }
      setApplyCampaign(campaign);
    },
    [currentUser, isAdmin, getExistingApplication, navigate, openAuth, showToast]
  );

  const handleAuthSuccess = (user: KOCUser, isNew: boolean) => {
    signIn(user, isNew);
    setAuth((a) => ({ ...a, open: false }));
    if (user.role === 'admin') {
      setPendingCampaign(null);
      navigate(ROUTES.admin);
      return;
    }
    if (pendingCampaign) {
      setApplyCampaign(pendingCampaign);
      setPendingCampaign(null);
    }
  };

  return (
    <SiteUIContext.Provider value={{ openAuth, requestApply, getExistingApplication }}>
      {children}
      <AuthSheet
        open={auth.open}
        initialMode={auth.mode}
        reason={auth.reason}
        onClose={() => {
          setAuth((a) => ({ ...a, open: false }));
          setPendingCampaign(null);
        }}
        onSuccess={handleAuthSuccess}
      />
      <ApplySheet
        campaign={applyCampaign}
        onClose={() => setApplyCampaign(null)}
        onViewApplications={() => {
          setApplyCampaign(null);
          navigate(ROUTES.myApplications);
        }}
      />
    </SiteUIContext.Provider>
  );
};
