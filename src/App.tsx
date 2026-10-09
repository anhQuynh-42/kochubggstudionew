import React, { useState, useEffect } from 'react';
import { Campaign, KOCApplication, KOCUser, ApplicationStatus } from './types';
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
import { AdminView } from './components/AdminView';
import { PublicMediaKitModal, PublicMediaKitData } from './components/PublicMediaKitModal';
import { isSupabaseConfigured } from './lib/supabase';
import kocityHeroStudio from './assets/images/kocity_hero_studio.jpg';
import {
  getCampaignsFromSupabase,
  getApplicationsFromSupabase,
  submitApplicationToSupabase,
  updateApplicationStatusOnSupabase,
  createCampaignOnSupabase,
  updateCampaignOnSupabase,
  subscribeToApplicationsRealtime,
  subscribeToCampaignsRealtime,
  incrementCampaignRegisteredSpotsOnSupabase,
  getHeroBannerFromSupabase,
  saveHeroBannerToSupabase,
  deleteHeroBannerFromSupabase,
  subscribeToHeroBannerRealtime,
} from './services/supabaseService';

// Hàm tính số ngày còn lại theo thời gian thực dựa vào ngày kết thúc (endDate)
export const calculateDaysLeft = (endDateStr?: string, defaultDays: number = 15): number => {
  if (!endDateStr) return defaultDays;
  try {
    const end = new Date(endDateStr);
    const now = new Date();
    end.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  } catch {
    return defaultDays;
  }
};

export const App: React.FC = () => {
  // Authentication state: KOC starts as a guest explorer or loads saved profile
  const [currentUser, setCurrentUser] = useState<KOCUser | null>(() => {
    try {
      const saved = localStorage.getItem('koctrend_koc_profile');
      if (!saved) return null;
      return JSON.parse(saved);
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
  const [currentTab, setCurrentTab] = useState<string>(() => {
    try {
      const savedTab = localStorage.getItem('koctrend_active_tab');
      const savedUserStr = localStorage.getItem('koctrend_koc_profile');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u.role === 'admin') {
          return savedTab || 'admin';
        }
      }
      return savedTab || 'marketplace';
    } catch {
      return 'marketplace';
    }
  });

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    try {
      localStorage.setItem('koctrend_active_tab', tab);
    } catch (e) {
      console.warn(e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [editingCampaignFromExternal, setEditingCampaignFromExternal] = useState<Campaign | null>(null);

  // Core Data State: Khởi tạo với dữ liệu đã lưu hoặc mặc định, tự động tính số ngày còn lại theo thời gian thực
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem('koctrend_campaigns');
      if (saved) {
        const parsed: Campaign[] = JSON.parse(saved);
        return parsed.map((c) => ({
          ...c,
          daysLeft: calculateDaysLeft(c.endDate, c.daysLeft),
        }));
      }
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_CAMPAIGNS.map((c) => ({
      ...c,
      daysLeft: calculateDaysLeft(c.endDate, c.daysLeft),
    }));
  });
  const [applications, setApplications] = useState<KOCApplication[]>(() => {
    try {
      const saved = localStorage.getItem('koctrend_applications');
      return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Xem hồ sơ Media Kit công khai (khi có người gửi link ?mediakit=... hoặc ?mk=...)
  const [publicMediaKitData, setPublicMediaKitData] = useState<PublicMediaKitData | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const mkParam = params.get('mk');
      const mediakitHandle = params.get('mediakit');

      if (mkParam) {
        try {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(mkParam))));
          setPublicMediaKitData(decoded);
          return;
        } catch (e) {
          console.warn('Lỗi giải mã mk param:', e);
        }
      }

      if (mediakitHandle) {
        const cleanTarget = mediakitHandle.toLowerCase().replace(/[@\s]/g, '');
        const savedUsersStr = localStorage.getItem('koctrend_registered_users');
        const savedUsers: KOCUser[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];
        const found = savedUsers.find(
          (u) => (u.tiktokHandle || '').toLowerCase().replace(/[@\s]/g, '') === cleanTarget
        );
        if (found) {
          setPublicMediaKitData(found);
        } else {
          setPublicMediaKitData({
            name: mediakitHandle.replace('@', ''),
            tiktokHandle: mediakitHandle.startsWith('@') ? mediakitHandle : `@${mediakitHandle}`,
            followers: '10K+',
            avgViews: '5K+',
            engagementRate: '4.5%',
            categories: ['Làm đẹp & Mỹ phẩm', 'Thời trang & Phụ kiện'],
            bio: 'KOC sáng tạo nội dung trên nền tảng Kocity.',
          });
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Hero Image Banner State (đồng bộ localStorage và Supabase Realtime toàn hệ thống)
  const [heroImage, setHeroImage] = useState<string>(() => {
    try {
      return localStorage.getItem('kocity_custom_hero_image') || kocityHeroStudio;
    } catch {
      return kocityHeroStudio;
    }
  });

  // Kết nối Supabase: Tải dữ liệu đám mây khi khởi động & lắng nghe cập nhật Realtime
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    // 1. Tải chiến dịch thật từ Supabase (hợp nhất với dữ liệu khởi tạo để giữ ảnh 4K & danh sách sản phẩm mẫu)
    getCampaignsFromSupabase().then((data) => {
      if (data && data.length > 0) {
        setCampaigns(() => {
          const map = new Map(INITIAL_CAMPAIGNS.map((c) => [c.id, c]));
          data.forEach((supaCamp) => {
            const local = map.get(supaCamp.id);
            const calculatedDays = calculateDaysLeft(supaCamp.endDate, supaCamp.daysLeft);
            if (local) {
              map.set(supaCamp.id, {
                ...supaCamp,
                daysLeft: calculatedDays,
                productHeroImage: supaCamp.productHeroImage || local.productHeroImage,
                galleryImages:
                  supaCamp.galleryImages && supaCamp.galleryImages.length > 0
                    ? supaCamp.galleryImages
                    : local.galleryImages,
                brandLogo: supaCamp.brandLogo || local.brandLogo,
                sampleProducts: supaCamp.sampleProducts || local.sampleProducts,
              });
            } else {
              map.set(supaCamp.id, {
                ...supaCamp,
                daysLeft: calculatedDays,
              });
            }
          });
          const result = Array.from(map.values());
          try {
            localStorage.setItem('koctrend_campaigns', JSON.stringify(result));
          } catch (e) {
            console.warn(e);
          }
          return result;
        });
      }
    });

    // 2. Tải danh sách đơn nộp từ Supabase và hợp nhất với dữ liệu local
    getApplicationsFromSupabase().then((data) => {
      if (data && data.length > 0) {
        setApplications((prev) => {
          const map = new Map();
          prev.forEach((app) => map.set(app.id, app));
          data.forEach((app) => map.set(app.id, { ...(map.get(app.id) || {}), ...app }));
          const merged = Array.from(map.values()) as KOCApplication[];
          try {
            localStorage.setItem('koctrend_applications', JSON.stringify(merged));
          } catch (e) {
            console.warn(e);
          }
          return merged;
        });
      }
    });

    // 3. Tải Banner đầu trang từ Supabase
    getHeroBannerFromSupabase().then((banner) => {
      if (banner) {
        setHeroImage(banner);
        try {
          localStorage.setItem('kocity_custom_hero_image', banner);
        } catch (e) {
          console.warn(e);
        }
      }
    });

    // 4. Đăng ký nhận thông báo thời gian thực Realtime cho Đơn ứng tuyển
    const unsubscribeApps = subscribeToApplicationsRealtime(
      (newApp) => {
        setApplications((prev) => {
          if (prev.some((a) => a.id === newApp.id)) return prev;
          const updated = [newApp, ...prev];
          try {
            localStorage.setItem('koctrend_applications', JSON.stringify(updated));
          } catch (e) {
            console.warn(e);
          }
          return updated;
        });
        showToast('Đơn ứng tuyển mới!', `${newApp.kocName} vừa nộp đơn tham gia ${newApp.campaignName}`, 'info');
      },
      (updatedApp) => {
        setApplications((prev) => {
          const updated = prev.map((a) => (a.id === updatedApp.id ? { ...a, ...updatedApp } : a));
          try {
            localStorage.setItem('koctrend_applications', JSON.stringify(updated));
          } catch (e) {
            console.warn(e);
          }
          return updated;
        });
      }
    );

    // 5. Đăng ký nhận thay đổi thời gian thực cho Banner đầu trang (Hero Image Realtime)
    const unsubscribeHero = subscribeToHeroBannerRealtime((newBanner) => {
      if (newBanner) {
        setHeroImage(newBanner);
        try {
          localStorage.setItem('kocity_custom_hero_image', newBanner);
        } catch (e) {
          console.warn(e);
        }
      } else {
        setHeroImage(kocityHeroStudio);
        try {
          localStorage.removeItem('kocity_custom_hero_image');
        } catch (e) {
          console.warn(e);
        }
      }
    });

    // 6. Đăng ký nhận thay đổi thời gian thực cho Bảng Chiến Dịch (Realtime Campaigns)
    // Khi Admin sửa/đổi ảnh chiến dịch, giao diện KOC tự cập nhật tức thì
    const unsubscribeCampaigns = subscribeToCampaignsRealtime(
      (newCamp) => {
        setCampaigns((prev) => {
          if (prev.some((c) => c.id === newCamp.id)) return prev;
          const calculatedDays = calculateDaysLeft(newCamp.endDate, newCamp.daysLeft);
          const fullCamp = { ...newCamp, daysLeft: calculatedDays };
          const updated = [fullCamp, ...prev];
          try {
            localStorage.setItem('koctrend_campaigns', JSON.stringify(updated));
          } catch (e) {
            console.warn(e);
          }
          return updated;
        });
        showToast('Chiến dịch mới vừa xuất hiện!', `${newCamp.brandName} - ${newCamp.title}`, 'info');
      },
      (updatedCamp) => {
        const calculatedDays = calculateDaysLeft(updatedCamp.endDate, updatedCamp.daysLeft);
        const fullCamp = { ...updatedCamp, daysLeft: calculatedDays };
        setCampaigns((prev) => {
          const updated = prev.map((c) => (c.id === fullCamp.id ? { ...c, ...fullCamp } : c));
          try {
            localStorage.setItem('koctrend_campaigns', JSON.stringify(updated));
          } catch (e) {
            console.warn(e);
          }
          return updated;
        });
        // Cập nhật cả màn hình chi tiết nếu đang mở xem
        setSelectedCampaign((prev) => (prev && prev.id === fullCamp.id ? { ...prev, ...fullCamp } : prev));
      },
      (deletedId) => {
        setCampaigns((prev) => {
          const updated = prev.filter((c) => c.id !== deletedId);
          try {
            localStorage.setItem('koctrend_campaigns', JSON.stringify(updated));
          } catch (e) {
            console.warn(e);
          }
          return updated;
        });
      }
    );

    return () => {
      unsubscribeApps();
      unsubscribeHero();
      unsubscribeCampaigns();
    };
  }, []);

  // Bookmarks State (persisted in localStorage, mặc định rỗng chưa lưu chiến dịch nào)
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('koctrend_bookmarked_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
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
  const [pendingApplyCampaign, setPendingApplyCampaign] = useState<Campaign | null>(null);
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
      setPendingApplyCampaign(campaign);
      handleOpenLogin(
        'register',
        `Vui lòng đăng ký tài khoản KOC hoặc đăng nhập để đăng ký nhận mẫu chiến dịch "${campaign.title}".`
      );
      return;
    }
    if (currentUser.role === 'admin') {
      showToast(
        'Tài khoản Quản Trị Viên',
        'Bạn đang đăng nhập tài khoản Admin. Hãy sử dụng tài khoản KOC để đăng ký nhận mẫu chiến dịch.',
        'info'
      );
      return;
    }
    setApplyCampaign(campaign);
  };

  // Handler: Login Success (both login and register with strict role routing)
  const handleLoginSuccess = (user: KOCUser, isNewRegistration?: boolean) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('koctrend_koc_profile', JSON.stringify(user));
    } catch (e) {
      console.warn(e);
    }
    setIsLoginModalOpen(false);
    setLoginModalPrompt(null);

    // 1. Phân quyền ADMIN: Chuyển thẳng vào Admin Dashboard
    if (user.role === 'admin') {
      handleSelectTab('admin');
      showToast(
        'Đăng nhập Quản Trị Viên thành công!',
        `Chào mừng ${user.name} đến với Admin Dashboard KOCITY.`,
        'success'
      );
      return;
    }

    // 2. Phân quyền KOC: Mở form đăng ký campaign nếu trước đó đang chờ nộp
    if (pendingApplyCampaign) {
      const campToApply = pendingApplyCampaign;
      setPendingApplyCampaign(null);
      setApplyCampaign(campToApply);
      showToast(
        'Đăng nhập KOC thành công!',
        `Tiếp tục hoàn tất đăng ký nhận mẫu cho "${campToApply.title}".`,
        'success'
      );
      return;
    }

    // Nếu là đăng ký tài khoản mới: chuyển đến trang hồ sơ để hoàn tất Media Kit
    if (isNewRegistration) {
      setCurrentTab('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showToast(
      isNewRegistration ? 'Đăng ký tài khoản KOC thành công!' : 'Đăng nhập thành công!',
      isNewRegistration
        ? `Chào mừng ${user.name}! Bạn đã được kích hoạt mục "Chiến dịch của tôi" và Hồ sơ KOC.`
        : `Xin chào trở lại ${user.name}! Đã mở khóa mục "Chiến dịch của tôi".`,
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

      // Cập nhật vào danh sách tài khoản đã đăng ký (koctrend_registered_users) để khi đăng nhập lại không bị mất
      const savedUsersStr = localStorage.getItem('koctrend_registered_users');
      const savedUsers: KOCUser[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];
      const userIndex = savedUsers.findIndex(
        (u) =>
          u.id === updatedUser.id ||
          (u.tiktokHandle && updatedUser.tiktokHandle && u.tiktokHandle.toLowerCase().replace(/[@\s]/g, '') === updatedUser.tiktokHandle.toLowerCase().replace(/[@\s]/g, '')) ||
          (u.phone && updatedUser.phone && u.phone.replace(/[\s.-]/g, '') === updatedUser.phone.replace(/[\s.-]/g, ''))
      );

      let newUsersList: KOCUser[];
      if (userIndex >= 0) {
        newUsersList = [...savedUsers];
        newUsersList[userIndex] = { ...savedUsers[userIndex], ...updatedUser };
      } else {
        newUsersList = [...savedUsers, updatedUser];
      }
      localStorage.setItem('koctrend_registered_users', JSON.stringify(newUsersList));
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
      localStorage.removeItem('koctrend_active_tab');
    } catch (e) {
      console.warn(e);
    }
    handleSelectTab('marketplace');
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
    setApplications((prev) => {
      const updated = [newApp, ...prev.filter((a) => a.id !== newApp.id)];
      try {
        localStorage.setItem('koctrend_applications', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    // Gửi lên cơ sở dữ liệu Supabase đám mây
    submitApplicationToSupabase(newApp);
    // Tự động tăng số lượng đăng ký của chiến dịch trên Supabase để Admin và KOC khác thấy ngay
    incrementCampaignRegisteredSpotsOnSupabase(newApp.campaignId);

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
    setApplications((prev) => {
      const updated = prev.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            videoLink: link,
            videoViews: 'Đang quét chỉ số...',
            status: 'Đã lên bài' as ApplicationStatus,
          };
        }
        return app;
      });
      try {
        localStorage.setItem('koctrend_applications', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    // Đồng bộ lên Supabase
    updateApplicationStatusOnSupabase(appId, {
      videoLink: link,
      videoViews: 'Đang quét chỉ số...',
      status: 'Đã lên bài',
    });
  };

  // Chuẩn hóa chuỗi so khớp tài khoản KOC
  const normalizeHandle = (h?: string) => (h ? h.toLowerCase().replace(/[@\s]/g, '') : '');
  const normalizePhone = (p?: string) => (p ? p.replace(/[\s.-]/g, '') : '');

  // Count recorded campaigns for current logged-in KOC
  const userApplicationsCount = currentUser
    ? applications.filter((a) => {
        if (a.kocId && currentUser.id && a.kocId === currentUser.id) return true;

        const userHandle = normalizeHandle(currentUser.tiktokHandle);
        const appHandle = normalizeHandle(a.tiktokHandle);
        if (userHandle && appHandle && userHandle === appHandle) return true;

        const userPhone = normalizePhone(currentUser.phone);
        const appPhone = normalizePhone(a.phone);
        if (userPhone && appPhone && userPhone.length >= 9 && userPhone === appPhone) return true;

        return false;
      }).length
    : 0;

  // Handlers: Cập nhật & Khôi phục Hero Banner đầu trang (đồng bộ Supabase Realtime)
  const handleUpdateHeroImage = async (newImg: string) => {
    setHeroImage(newImg);
    try {
      localStorage.setItem('kocity_custom_hero_image', newImg);
    } catch (e) {
      console.warn(e);
    }
    const ok = await saveHeroBannerToSupabase(newImg);
    if (ok) {
      showToast(
        'Đã cập nhật ảnh Banner!',
        'Ảnh mới đã được đồng bộ lên toàn hệ thống theo thời gian thực.',
        'success'
      );
    } else {
      showToast(
        'Đã lưu ảnh cục bộ!',
        'Đã lưu trên máy của bạn (kiểm tra lại kết nối Supabase để đồng bộ mọi thiết bị).',
        'info'
      );
    }
  };

  const handleResetHeroImage = async () => {
    setHeroImage(kocityHeroStudio);
    try {
      localStorage.removeItem('kocity_custom_hero_image');
    } catch (e) {
      console.warn(e);
    }
    const ok = await deleteHeroBannerFromSupabase();
    if (ok) {
      showToast(
        'Đã khôi phục ảnh mặc định!',
        'Hệ thống đã chuyển về ảnh gốc unboxing ban đầu.',
        'info'
      );
    }
  };

  // Handlers: Cập nhật danh sách chiến dịch (Lưu state & localStorage)
  const handleUpdateCampaigns = (newCampList: Campaign[]) => {
    setCampaigns(newCampList);
    try {
      localStorage.setItem('koctrend_campaigns', JSON.stringify(newCampList));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleEditCampaignFromMarketplace = (camp: Campaign) => {
    setEditingCampaignFromExternal(camp);
    setCurrentTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateSingleCampaign = (updatedCamp: Campaign) => {
    setCampaigns((prev) => {
      const next = prev.map((c) => (c.id === updatedCamp.id ? updatedCamp : c));
      try {
        localStorage.setItem('koctrend_campaigns', JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
    setSelectedCampaign(updatedCamp);
    // Đồng bộ lên Supabase realtime
    updateCampaignOnSupabase(updatedCamp.id, updatedCamp).then((success) => {
      if (success) {
        showToast('Đã lưu ảnh chiến dịch!', 'Ảnh mới đã được đồng bộ trực tiếp lên hệ thống và Supabase.', 'success');
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf2f8] text-slate-900">
      {/* 1. Header Navigation Bar (KOC-tailored, with Guest/Logged-in state) */}
      <Header
        currentUser={currentUser}
        onOpenLogin={(mode, prompt) => handleOpenLogin(mode || 'login', prompt)}
        onLogout={handleLogout}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        notifications={notifications}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
        myCampaignsCount={userApplicationsCount}
      />

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
            currentUser={currentUser}
            heroImage={heroImage}
            onUpdateHeroImage={handleUpdateHeroImage}
            onResetHeroImage={handleResetHeroImage}
            onEditCampaign={handleEditCampaignFromMarketplace}
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
            currentUser={currentUser}
            onEditCampaign={handleEditCampaignFromMarketplace}
            onUpdateCampaign={handleUpdateSingleCampaign}
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

        {currentTab === 'admin' && (
          <AdminView
            campaigns={campaigns}
            onUpdateCampaigns={handleUpdateCampaigns}
            applications={applications}
            initialEditingCampaign={editingCampaignFromExternal}
            onClearInitialEditingCampaign={() => setEditingCampaignFromExternal(null)}
            onUpdateApplications={setApplications}
            onShowToast={showToast}
            onBackToMarketplace={handleBackToMarketplace}
          />
        )}
      </main>

      {/* 3. Footer (Hide on admin dashboard for clean experience) */}
      {currentTab !== 'admin' && (
        <Footer
          onOpenBrandContact={() => setIsBrandContactOpen(true)}
          onOpenGuidelines={() => setIsGuidelinesOpen(true)}
        />
      )}

      {/* 3.1 Brand Contact Modal */}
      <BrandContactModal
        isOpen={isBrandContactOpen}
        onClose={() => setIsBrandContactOpen(false)}
        onSubmitSuccess={(info) => {
          showToast(
            'Đã gửi thông tin đối tác Brand!',
            `Đội ngũ Kocity sẽ liên hệ với ${info.brandName} qua số ${info.phone} sớm nhất.`,
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

      {/* 7. Floating Action Buttons (Zalo Community + Job mới cập nhật !) - Chỉ hiển thị ở trang chủ Khám phá chiến dịch */}
      {currentTab === 'marketplace' && (
        <ZaloCommunityWidget
          onNavigateToMarketplace={() => {
            setSelectedCampaign(null);
            setCurrentTab('marketplace');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* 8. Public Creator Media Kit Modal (khi có người truy cập bằng link chia sẻ Media Kit) */}
      {publicMediaKitData && (
        <PublicMediaKitModal
          data={publicMediaKitData}
          onClose={() => {
            setPublicMediaKitData(null);
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('mediakit');
              url.searchParams.delete('mk');
              window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
            } catch (e) {
              console.warn(e);
            }
          }}
          onExploreCampaigns={() => {
            setPublicMediaKitData(null);
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('mediakit');
              url.searchParams.delete('mk');
              window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
            } catch (e) {
              console.warn(e);
            }
            setCurrentTab('marketplace');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onShowToast={showToast}
        />
      )}

      {/* 9. Global Toast Notification System */}
      <Toast notification={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default App;
