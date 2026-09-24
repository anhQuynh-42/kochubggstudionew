import React, { useState } from 'react';
import { Campaign, KOCApplication, KOCUser } from './types';
import { INITIAL_CAMPAIGNS, INITIAL_APPLICATIONS, INITIAL_NOTIFICATIONS } from './data/mockData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MarketplaceView } from './components/MarketplaceView';
import { CampaignDetailView } from './components/CampaignDetailView';
import { RegistrationModal } from './components/RegistrationModal';
import { MyCampaignsView } from './components/MyCampaignsView';
import { GuidelinesModal } from './components/GuidelinesModal';
import { LoginModal } from './components/LoginModal';
import { KOCProfileView } from './components/KOCProfileView';
import { ZaloCommunityWidget } from './components/ZaloCommunityWidget';
import { Toast, ToastNotification } from './components/Toast';
import { BrandContactModal } from './components/BrandContactModal';

export const App: React.FC = () => {
  // Authentication state: KOC starts as a guest explorer or loads saved profile
  const [currentUser, setCurrentUser] = useState<KOCUser | null>(() => {
    try {
      const saved = localStorage.getItem('koctrend_koc_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'register'>('login');
  const [loginModalPrompt, setLoginModalPrompt] = useState<string | null>(null);

  const handleOpenLogin = (mode: 'login' | 'register' = 'login', prompt?: string) => {
    setLoginModalMode(mode);
    setLoginModalPrompt(prompt || null);
    setIsLoginModalOpen(true);
  };

  // Navigation & Active Screen (KOC-centric)
  const [currentTab, setCurrentTab] = useState<string>('marketplace');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Core Data State
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [applications, setApplications] = useState<KOCApplication[]>(INITIAL_APPLICATIONS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Bookmarks State (persisted in localStorage)
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('koctrend_bookmarked_ids');
      return saved ? JSON.parse(saved) : ['camp-1', 'camp-4'];
    } catch {
      return ['camp-1', 'camp-4'];
    }
  });

  // Global Toast State
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = (
    title: string,
    message?: string,
    type: 'success' | 'info' | 'warning' = 'success'
  ) => {
    setToast({
      id: `toast-${Date.now()}`,
      title,
      message,
      type,
    });
  };

  const handleToggleBookmark = (campaign: Campaign) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(campaign.id);
      const updated = exists ? prev.filter((id) => id !== campaign.id) : [...prev, campaign.id];
      try {
        localStorage.setItem('koctrend_bookmarked_ids', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      showToast(
        exists ? 'Đã bỏ lưu chiến dịch' : 'Đã lưu vào danh sách yêu thích!',
        campaign.title,
        exists ? 'info' : 'success'
      );
      return updated;
    });
  };

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [applyCampaign, setApplyCampaign] = useState<Campaign | null>(null);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isBrandContactOpen, setIsBrandContactOpen] = useState(false);

  // Handler: Select Campaign to view details
  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setCurrentTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Back from Detail to Marketplace
  const handleBackToMarketplace = () => {
    setCurrentTab('marketplace');
  };

  // Handler: Open Apply Registration Form
  const handleOpenApplyModal = (campaign: Campaign) => {
    if (!currentUser) {
      handleOpenLogin('login', 'Vui lòng đăng nhập hoặc tạo tài khoản KOC để đăng ký nhận mẫu chiến dịch này.');
      return;
    }
    setApplyCampaign(campaign);
  };

  // Handler: Login Success (both login and register)
  const handleLoginSuccess = (user: KOCUser, isNewRegistration?: boolean) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('koctrend_koc_profile', JSON.stringify(user));
    } catch (e) {
      console.warn(e);
    }
    setIsLoginModalOpen(false);

    const hadPrompt = Boolean(loginModalPrompt);
    setLoginModalPrompt(null);

    // If new registration or user clicked "Tạo hồ sơ KOC", redirect them to profile!
    if (isNewRegistration || hadPrompt) {
      setCurrentTab('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showToast(
      isNewRegistration ? 'Đăng ký tài khoản KOC thành công!' : 'Đăng nhập thành công!',
      isNewRegistration
        ? `Chào mừng ${user.name}! Bạn đã được kích hoạt mục Chiến dịch của tôi và Hồ sơ KOC.`
        : `Xin chào trở lại ${user.name}! Đã mở khóa mục Chiến dịch của tôi.`,
      'success'
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: isNewRegistration ? `Chào mừng KOC ${user.name}!` : `Chào mừng trở lại!`,
        message: isNewRegistration
          ? `Tài khoản KOC ${user.tiktokHandle} đã được kích hoạt thành công. Hãy hoàn tất hồ sơ KOC và tham gia các chiến dịch nhận mẫu 0đ.`
          : `Đã đăng nhập thành công với kênh TikTok ${user.tiktokHandle}. Bạn có thể theo dõi tiến độ các chiến dịch ngay.`,
        time: 'Vừa xong',
        read: false,
        type: 'approval',
      },
      ...prev,
    ]);
  };

  // Handler: Save/Update KOC Profile
  const handleSaveProfile = (updatedUser: KOCUser) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('koctrend_koc_profile', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn(e);
    }
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Hồ sơ KOC đã được cập nhật!',
        message: `Hồ sơ ${updatedUser.name} (${updatedUser.tiktokHandle}) đã sẵn sàng cho 500+ nhãn hàng xem xét.`,
        time: 'Vừa xong',
        read: false,
        type: 'approval',
      },
      ...prev,
    ]);
  };

  // Handler: Logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('koctrend_koc_profile');
    } catch (e) {
      console.warn(e);
    }
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Đã đăng xuất',
        message: 'Bạn đã đăng xuất khỏi tài khoản KOC và chuyển về chế độ khách tìm hiểu.',
        time: 'Vừa xong',
        read: false,
        type: 'campaign',
      },
      ...prev,
    ]);
  };

  // Handler: On successfully submitting application from form
  const handleApplicationSubmitSuccess = (newApp: KOCApplication) => {
    setApplications((prev) => [newApp, ...prev]);

    // Update campaign spots
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === newApp.campaignId
          ? { ...c, registeredSpots: Math.min(c.totalSpots, c.registeredSpots + 1) }
          : c
      )
    );

    // Also update selectedCampaign if currently viewing its details
    setSelectedCampaign((prev) =>
      prev && prev.id === newApp.campaignId
        ? { ...prev, registeredSpots: Math.min(prev.totalSpots, prev.registeredSpots + 1) }
        : prev
    );

    // Add notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Đã nộp hồ sơ ${newApp.code} - Đang chờ Brand duyệt`,
        message: `Hồ sơ đăng ký ${newApp.campaignName} đã gửi thành công. Brand sẽ xem qua kênh TikTok/Reels để đánh giá độ phù hợp trước khi gửi mẫu.`,
        time: 'Vừa xong',
        read: false,
        type: 'approval',
      },
      ...prev,
    ]);

    showToast(
      'Nộp hồ sơ thành công - Đang chờ duyệt',
      `Hồ sơ ${newApp.code} đã chuyển tới Brand. Nhãn hàng sẽ xem qua kênh và duyệt gửi quà mẫu nếu phù hợp!`,
      'info'
    );
  };

  // Handler: Submit video link
  const handleSubmitVideoLink = (appId: string, link: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            videoLink: link,
            videoViews: 'Đang quét chỉ số...',
            status: 'Đã lên bài',
          };
        }
        return app;
      })
    );
  };

  // Count recorded campaigns for current logged-in KOC
  const userApplicationsCount = currentUser
    ? applications.filter(
        (a) =>
          a.kocName.toLowerCase().includes(currentUser.name.toLowerCase()) ||
          a.tiktokHandle.toLowerCase().includes(currentUser.tiktokHandle.toLowerCase()) ||
          (currentUser.tiktokHandle.includes('minhthu') &&
            (a.kocName.includes('Minh Thư') ||
              a.status === 'Đã duyệt gửi mẫu' ||
              a.status === 'Chờ duyệt'))
      ).length
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 1. Header Navigation Bar (KOC-tailored, with Guest/Logged-in state) */}
      <Header
        currentUser={currentUser}
        onOpenLogin={(mode, prompt) => handleOpenLogin(mode || 'login', prompt)}
        onLogout={handleLogout}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        notifications={notifications}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
        myCampaignsCount={userApplicationsCount}
      />

      {/* Guest Exploration Banner Notice (subtle top alert for new KOC visitors) */}
      {!currentUser && currentTab === 'marketplace' && (
        <div className="bg-orange-50/70 border-b border-orange-200/80 px-4 py-2.5 text-xs text-orange-950 transition-all">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-orange-600 shrink-0">
                info
              </span>
              <span>
                <strong>Bạn đang ở chế độ khách:</strong> Tự do khám phá 500+ chiến dịch và xem quy trình hướng dẫn nhận mẫu 0đ.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() =>
                  handleOpenLogin(
                    'register',
                    'Đăng ký tài khoản KOC để kích hoạt Chiến dịch của tôi và tạo Hồ sơ KOC!'
                  )
                }
                className="font-bold text-orange-700 hover:text-orange-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Đăng ký KOC</span>
              </button>
              <span className="text-orange-300">|</span>
              <button
                onClick={() => handleOpenLogin('login')}
                className="font-bold text-orange-900 hover:text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Đăng nhập</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Content Area */}
      <main className="flex-1">
        {currentTab === 'marketplace' && (
          <MarketplaceView
            campaigns={campaigns}
            onSelectCampaign={handleSelectCampaign}
            onOpenApplyModal={handleOpenApplyModal}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {currentTab === 'detail' && selectedCampaign && (
          <CampaignDetailView
            campaign={selectedCampaign}
            onBack={handleBackToMarketplace}
            onOpenApplyModal={handleOpenApplyModal}
            isBookmarked={bookmarkedIds.includes(selectedCampaign.id)}
            onToggleBookmark={handleToggleBookmark}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'my-campaigns' && (
          <MyCampaignsView
            currentUser={currentUser}
            applications={applications}
            campaigns={campaigns}
            onSelectCampaign={handleSelectCampaign}
            onSubmitVideoLink={handleSubmitVideoLink}
            onOpenLogin={() => handleOpenLogin('login')}
            onBackToMarketplace={handleBackToMarketplace}
            onOpenProfile={() => {
              if (!currentUser) {
                handleOpenLogin(
                  'register',
                  'Vui lòng đăng ký hoặc đăng nhập tài khoản KOC để hoàn thiện hồ sơ và tạo Media Kit nhận mẫu!'
                );
              } else {
                setCurrentTab('profile');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'profile' && (
          <KOCProfileView
            currentUser={currentUser}
            onSaveProfile={handleSaveProfile}
            onExploreCampaigns={handleBackToMarketplace}
            onOpenLogin={() => handleOpenLogin('login')}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* 3. Footer */}
      <Footer
        onOpenBrandContact={() => setIsBrandContactOpen(true)}
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
      />

      {/* 3.1 Brand Contact Modal */}
      <BrandContactModal
        isOpen={isBrandContactOpen}
        onClose={() => setIsBrandContactOpen(false)}
        onSubmitSuccess={(info) => {
          showToast(
            'Đã gửi thông tin đối tác Brand!',
            `Đội ngũ Ki ô xây sẽ liên hệ với ${info.brandName} qua số ${info.phone} sớm nhất.`,
            'success'
          );
        }}
      />

      {/* 4. Application Registration Modal */}
      {applyCampaign && (
        <RegistrationModal
          campaign={applyCampaign}
          currentUser={currentUser}
          onClose={() => setApplyCampaign(null)}
          onSubmitSuccess={handleApplicationSubmitSuccess}
          onAutoLogin={(user) => {
            if (!currentUser) {
              setCurrentUser(user);
            }
          }}
          onViewMyCampaigns={() => {
            setApplyCampaign(null);
            setCurrentTab('my-campaigns');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* 5. KOC Guidelines Modal */}
      {isGuidelinesOpen && (
        <GuidelinesModal onClose={() => setIsGuidelinesOpen(false)} />
      )}

      {/* 6. KOC Login & Registration Modal */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => {
            setIsLoginModalOpen(false);
            setLoginModalPrompt(null);
          }}
          onLoginSuccess={handleLoginSuccess}
          initialMode={loginModalMode}
          promptMessage={loginModalPrompt}
          onOpenCreateProfile={() => {
            setCurrentTab('profile');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* 7. Floating Action Buttons (Zalo Community + Job mới cập nhật !) */}
      <ZaloCommunityWidget
        onNavigateToMarketplace={() => {
          setSelectedCampaign(null);
          setCurrentTab('marketplace');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 8. Global Toast Notification System */}
      <Toast notification={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default App;
