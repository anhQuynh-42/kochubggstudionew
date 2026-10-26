import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppNotification, ApplicationStatus, Campaign, KOCApplication, KOCUser, LiveActivityItem } from '../types';
import { INITIAL_APPLICATIONS, INITIAL_CAMPAIGNS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import { isSupabaseConfigured } from '../lib/supabase';
import { getVisibleNotifications } from '../lib/notifications';
import { buildLiveActivity } from '../lib/liveActivity';
import kocityHeroStudio from '../assets/images/kocity_hero_studio.jpg';
import {
  deleteHeroBannerFromSupabase,
  getApplicationsFromSupabase,
  getMyApplicationsFromSupabase,
  getCampaignsFromSupabase,
  getHeroBannerFromSupabase,
  getKOCProfileFromSupabase,
  incrementCampaignRegisteredSpotsOnSupabase,
  saveHeroBannerToSupabase,
  saveKOCProfileToSupabase,
  submitApplicationToSupabase,
  subscribeToApplicationsRealtime,
  subscribeToCampaignsRealtime,
  subscribeToHeroBannerRealtime,
  subscribeToKOCProfileRealtime,
  updateApplicationStatusOnSupabase,
  updateCampaignOnSupabase,
  getBlogPostsFromSupabase,
  subscribeToBlogPostsRealtime,
} from '../services/supabaseService';
import { logout } from '../services/authService';

/**
 * Nguồn dữ liệu chung cho cả website KOC mới và trang Admin cũ.
 * Toàn bộ logic dưới đây được chuyển nguyên từ App.tsx cũ (tải Supabase, Realtime, localStorage),
 * chỉ gom lại một chỗ và tách khỏi giao diện.
 */

export type ToastType = 'success' | 'info' | 'warning';
export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

export interface PublicMediaKitPayload {
  name: string;
  tiktokHandle: string;
  [key: string]: unknown;
}

type AdminSubTab = 'dashboard' | 'applications' | 'campaigns' | 'content' | 'koc-crm';

interface AppDataValue {
  currentUser: KOCUser | null;
  isAdmin: boolean;
  campaigns: Campaign[];
  isCloudSynced: boolean;
  applications: KOCApplication[];
  myApplications: KOCApplication[];
  notifications: AppNotification[];
  visibleNotifications: AppNotification[];
  unreadCount: number;
  liveActivity: LiveActivityItem[];
  heroImage: string;
  bookmarkedIds: string[];
  toast: ToastMessage | null;
  publicMediaKit: PublicMediaKitPayload | null;
  adminTargetSubTab?: AdminSubTab;
  editingCampaignFromExternal: Campaign | null;

  showToast: (title: string, message?: string, type?: ToastType) => void;
  dismissToast: () => void;
  signIn: (user: KOCUser, isNew: boolean) => void;
  signOut: () => void;
  saveProfile: (user: KOCUser) => void;
  rememberFromApplication: (user: KOCUser) => void;
  submitApplication: (app: KOCApplication) => void;
  submitVideoLink: (appId: string, link: string) => void;
  toggleBookmark: (campaign: Campaign) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateHeroImage: (img: string) => Promise<void>;
  resetHeroImage: () => Promise<void>;
  closePublicMediaKit: () => void;
  // Dành cho Admin cũ
  setCampaignsFromAdmin: (list: Campaign[]) => void;
  setApplicationsFromAdmin: (list: KOCApplication[]) => void;
  updateSingleCampaign: (camp: Campaign) => void;
  addNotification: (notif: AppNotification) => void;
  setAdminTargetSubTab: (tab?: AdminSubTab) => void;
  setEditingCampaignFromExternal: (camp: Campaign | null) => void;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData phải nằm trong <AppDataProvider>');
  return ctx;
};

// ---------- tiện ích ----------
export const calculateDaysLeft = (endDateStr?: string, defaultDays: number = 15): number => {
  if (!endDateStr) return defaultDays;
  try {
    const end = new Date(endDateStr);
    const now = new Date();
    end.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  } catch {
    return defaultDays;
  }
};

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(e);
  }
}

const normHandle = (h?: string) => (h ? h.toLowerCase().replace(/[@\s]/g, '') : '');
const normPhone = (p?: string) => (p ? p.replace(/[\s.-]/g, '') : '');

/** Đơn này có thuộc KOC đang đăng nhập không (khớp theo ID tài khoản, ID TikTok hoặc SĐT) */
export function isOwnApplication(app: KOCApplication, user: KOCUser | null): boolean {
  if (!user) return false;
  if (app.kocId && user.id && app.kocId === user.id) return true;
  if (normHandle(user.tiktokHandle) && normHandle(app.tiktokHandle) === normHandle(user.tiktokHandle)) return true;
  const phone = normPhone(user.phone);
  return phone.length >= 9 && normPhone(app.phone) === phone;
}

const STATUS_NOTIFICATION: Partial<Record<ApplicationStatus, (a: KOCApplication) => { title: string; message: string; type: AppNotification['type']; linkTab: AppNotification['linkTab'] }>> = {
  'Đã duyệt gửi mẫu': (a) => ({
    title: `🎉 Brand đã chọn bạn: ${a.campaignName}`,
    message: `Đơn ${a.code} đã được duyệt gửi mẫu.${a.shippingCode ? ` Mã vận đơn: ${a.shippingCode}.` : ''}`,
    type: 'approval',
    linkTab: 'my-campaigns',
  }),
  'Đang giao': (a) => ({
    title: `🚚 Mẫu đang được giao: ${a.campaignName}`,
    message: `Mẫu cho đơn ${a.code} đang trên đường tới bạn. Mã vận đơn: ${a.shippingCode || 'đang cập nhật'}.`,
    type: 'delivery',
    linkTab: 'my-campaigns',
  }),
  'Đã lên bài': (a) => ({
    title: `🌟 Video đã được duyệt: ${a.campaignName}`,
    message: `Video cho đơn ${a.code} đã được nghiệm thu. Cảm ơn bạn!`,
    type: 'approval',
    linkTab: 'my-campaigns',
  }),
  'Đã hoàn thành': (a) => ({
    title: `🌟 Hoàn thành: ${a.campaignName}`,
    message: `Đơn ${a.code} đã hoàn thành. Cảm ơn bạn đã đồng hành!`,
    type: 'approval',
    linkTab: 'my-campaigns',
  }),
  'Bị từ chối': (a) => ({
    title: `Video cần chỉnh sửa: ${a.campaignName}`,
    message: a.adminFeedback || `Video cho đơn ${a.code} cần chỉnh sửa theo brief. Hãy nộp lại link mới nhé.`,
    type: 'approval',
    linkTab: 'my-campaigns',
  }),
  'Từ chối': (a) => ({
    title: `Kết quả: ${a.campaignName}`,
    message: `Brand chưa chọn bạn ở đợt này (${a.code}). Còn nhiều chiến dịch khác đang chờ bạn!`,
    type: 'approval',
    linkTab: 'marketplace',
  }),
};

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<KOCUser | null>(() => readJSON('koctrend_koc_profile', null));
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser; // Realtime callback luôn đọc người dùng MỚI NHẤT (sửa lỗi closure cũ)

  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    readJSON<Campaign[]>('koctrend_campaigns', INITIAL_CAMPAIGNS).map((c) => ({ ...c, daysLeft: calculateDaysLeft(c.endDate, c.daysLeft) }))
  );
  const [applications, setApplications] = useState<KOCApplication[]>(() => readJSON('koctrend_applications', INITIAL_APPLICATIONS));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => readJSON('koctrend_notifications', INITIAL_NOTIFICATIONS));
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => readJSON('koctrend_bookmarked_ids', []));
  const [heroImage, setHeroImage] = useState<string>(() => {
    try {
      return localStorage.getItem('kocity_custom_hero_image') || kocityHeroStudio;
    } catch {
      return kocityHeroStudio;
    }
  });
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [publicMediaKit, setPublicMediaKit] = useState<PublicMediaKitPayload | null>(null);
  const [adminTargetSubTab, setAdminTargetSubTab] = useState<AdminSubTab | undefined>(undefined);
  const [editingCampaignFromExternal, setEditingCampaignFromExternal] = useState<Campaign | null>(null);

  // Lưu xuống localStorage mỗi khi thay đổi
  useEffect(() => writeJSON('koctrend_applications', applications), [applications]);
  useEffect(() => writeJSON('koctrend_notifications', notifications), [notifications]);
  useEffect(() => writeJSON('koctrend_campaigns', campaigns), [campaigns]);
  useEffect(() => writeJSON('koctrend_bookmarked_ids', bookmarkedIds), [bookmarkedIds]);

  const showToast = useCallback((title: string, message?: string, type: ToastType = 'success') => {
    setToast({ id: `toast-${Date.now()}`, title, message, type });
  }, []);

  const pushNotification = useCallback((notif: AppNotification) => {
    setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
  }, []);

  // ---------- Supabase: tải dữ liệu + Realtime ----------
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    getCampaignsFromSupabase().then((data) => {
      if (!data) return;
      setIsCloudSynced(true);

      // Nếu Cloud trả về mảng rỗng (toàn bộ chiến dịch đã bị xóa), phản ánh trung thực lên giao diện
      if (data.length === 0) {
        setCampaigns([]);
        return;
      }

      // Ưu tiên kết hợp dữ liệu đã chỉnh sửa từ localStorage để không bị đè mất
      const localSaved = readJSON<Campaign[]>('koctrend_campaigns', INITIAL_CAMPAIGNS);
      const baseMap = new Map<string, Campaign>();
      INITIAL_CAMPAIGNS.forEach((c) => baseMap.set(c.id, c));
      localSaved.forEach((c) => baseMap.set(c.id, c));

      const isBadPlaceholder = (url?: string) =>
        !url || url.includes('via.placeholder') || url === 'placeholder';

      const mergedList: Campaign[] = data.map((remote) => {
        const local = baseMap.get(remote.id);
        const daysLeft = calculateDaysLeft(remote.endDate, remote.daysLeft);
        return {
          ...(local || {}),
          ...remote,
          daysLeft,
          productHeroImage: isBadPlaceholder(remote.productHeroImage)
            ? local?.productHeroImage || remote.productHeroImage
            : remote.productHeroImage,
          brandLogo: isBadPlaceholder(remote.brandLogo)
            ? local?.brandLogo || remote.brandLogo
            : remote.brandLogo,
          sampleProducts:
            remote.sampleProducts && remote.sampleProducts.length > 0
              ? remote.sampleProducts
              : local?.sampleProducts || [],
        };
      });

      // ĐỒNG BỘ CLOUD-FIRST: Supabase Cloud là Chân lý duy nhất cho Chiến dịch
      // Chỉ giữ lại các chiến dịch tạo offline (nếu có) chưa kịp đồng bộ, không làm sống lại chiến dịch Admin đã xóa trên điện thoại
      localSaved.forEach((localCamp) => {
        if ((localCamp.id.startsWith('offline-') || localCamp.id.startsWith('camp-local-')) && !mergedList.some((c) => c.id === localCamp.id)) {
          mergedList.push(localCamp);
        }
      });

      setCampaigns(mergedList);
    });

    // (Dữ liệu đơn ứng tuyển được đồng bộ tự động đa thiết bị qua useEffect chuyên biệt bên dưới)

    getHeroBannerFromSupabase().then((banner) => {
      if (!banner) return;
      setHeroImage(banner);
      try {
        localStorage.setItem('kocity_custom_hero_image', banner);
      } catch (e) {
        console.warn(e);
      }
    });

    // Đồng bộ bài viết Blog (Cẩm nang KOC) từ Supabase đám mây
    getBlogPostsFromSupabase().then((cloudPosts) => {
      if (cloudPosts && cloudPosts.length >= 5) {
        try {
          localStorage.setItem('kocity_blog_posts_v2', JSON.stringify(cloudPosts));
          localStorage.setItem('kocity_blog_posts_v1', JSON.stringify(cloudPosts));
          window.dispatchEvent(new Event('kocity-blog-updated'));
        } catch (e) {
          console.warn('Lỗi lưu cloud blog vào storage:', e);
        }
      }
    });

    const unsubApps = subscribeToApplicationsRealtime(
      (newApp) => {
        setApplications((prev) => (prev.some((a) => a.id === newApp.id) ? prev : [newApp, ...prev]));
        // Chỉ Admin mới được báo có đơn mới (không lộ tên KOC khác cho người dùng thường)
        if (currentUserRef.current?.role === 'admin') {
          showToast('Đơn ứng tuyển mới!', `${newApp.kocName} vừa nộp đơn ${newApp.campaignName}`, 'info');
        }
      },
      (updatedApp) => {
        setApplications((prev) => {
          const old = prev.find((a) => a.id === updatedApp.id);
          if (old && old.status !== updatedApp.status) {
            const build = STATUS_NOTIFICATION[updatedApp.status];
            if (build) {
              const n = build(updatedApp);
              pushNotification({
                id: `koc-realtime-notif-${updatedApp.id}-${updatedApp.status}`,
                title: n.title,
                message: n.message,
                time: 'Vừa xong',
                read: false,
                type: n.type,
                targetRole: 'koc',
                targetKocId: updatedApp.kocId,
                targetTiktokHandle: updatedApp.tiktokHandle,
                targetPhone: updatedApp.phone,
                targetEmail: updatedApp.email,
                linkTab: n.linkTab,
              });
              const me = currentUserRef.current;
              if (me && me.role !== 'admin' && isOwnApplication(updatedApp, me)) showToast(n.title, n.message, 'success');
            }
          }
          return prev.map((a) => (a.id === updatedApp.id ? { ...a, ...updatedApp } : a));
        });
      }
    );

    const unsubHero = subscribeToHeroBannerRealtime((url) => {
      setHeroImage(url || kocityHeroStudio);
      try {
        if (url) localStorage.setItem('kocity_custom_hero_image', url);
        else localStorage.removeItem('kocity_custom_hero_image');
      } catch (e) {
        console.warn(e);
      }
    });

    const unsubCampaigns = subscribeToCampaignsRealtime(
      (c) => setCampaigns((prev) => (prev.some((x) => x.id === c.id) ? prev : [{ ...c, daysLeft: calculateDaysLeft(c.endDate, c.daysLeft) }, ...prev])),
      (c) => setCampaigns((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...c, daysLeft: calculateDaysLeft(c.endDate, c.daysLeft) } : x))),
      (id) => setCampaigns((prev) => prev.filter((x) => x.id !== id))
    );

    const unsubBlog = subscribeToBlogPostsRealtime((cloudPosts) => {
      if (cloudPosts && cloudPosts.length >= 5) {
        try {
          localStorage.setItem('kocity_blog_posts_v2', JSON.stringify(cloudPosts));
          localStorage.setItem('kocity_blog_posts_v1', JSON.stringify(cloudPosts));
          window.dispatchEvent(new Event('kocity-blog-updated'));
        } catch (e) {
          console.warn('Lỗi lưu realtime blog vào storage:', e);
        }
      }
    });

    return () => {
      unsubApps();
      unsubHero();
      unsubCampaigns();
      unsubBlog();
    };
  }, [pushNotification, showToast]);

  // ---------- TỰ ĐỘNG ĐỒNG BỘ HỒ SƠ & AVATAR ĐA THIẾT BỊ (Cloud-First Single Source of Truth) ----------
  useEffect(() => {
    if (!currentUser?.tiktokHandle || !isSupabaseConfigured()) return;
    const handle = currentUser.tiktokHandle;

    const syncProfileFromCloud = () => {
      getKOCProfileFromSupabase(handle).then((cloud) => {
        if (!cloud) return;
        setCurrentUser((prev) => {
          if (!prev) return cloud;
          const hasChange =
            (cloud.avatar && cloud.avatar !== prev.avatar) ||
            cloud.name !== prev.name ||
            cloud.phone !== prev.phone ||
            cloud.address !== prev.address ||
            cloud.followers !== prev.followers ||
            cloud.bio !== prev.bio;

          if (hasChange) {
            const updated: KOCUser = {
              ...prev,
              ...cloud,
              avatar: cloud.avatar || prev.avatar,
            };
            try {
              localStorage.setItem('koctrend_koc_profile', JSON.stringify(updated));
              const users = readJSON<KOCUser[]>('koctrend_registered_users', []);
              const idx = users.findIndex((u) => normHandle(u.tiktokHandle) === normHandle(handle));
              if (idx >= 0) users[idx] = { ...users[idx], ...updated };
              else users.push(updated);
              writeJSON('koctrend_registered_users', users);
            } catch (e) {
              console.warn(e);
            }
            return updated;
          }
          return prev;
        });
      });
    };

    // 1. Tự động kiểm tra ngay khi khởi động
    syncProfileFromCloud();

    // 2. Tự động kiểm tra khi người dùng chuyển lại tab KOCity từ thiết bị khác
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncProfileFromCloud();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // 3. Lắng nghe Realtime qua Supabase: khi điện thoại đổi Avatar/Profile, màn hình máy tính tự nhảy ngay trong 1s
    const unsubRealtimeProfile = subscribeToKOCProfileRealtime(handle, (cloudProfile) => {
      setCurrentUser((prev) => {
        if (!prev) return cloudProfile;
        const updated: KOCUser = {
          ...prev,
          ...cloudProfile,
          avatar: cloudProfile.avatar || prev.avatar,
        };
        try {
          localStorage.setItem('koctrend_koc_profile', JSON.stringify(updated));
          const users = readJSON<KOCUser[]>('koctrend_registered_users', []);
          const idx = users.findIndex((u) => normHandle(u.tiktokHandle) === normHandle(handle));
          if (idx >= 0) users[idx] = { ...users[idx], ...updated };
          else users.push(updated);
          writeJSON('koctrend_registered_users', users);
        } catch (e) {
          console.warn(e);
        }
        return updated;
      });
    });

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      unsubRealtimeProfile();
    };
  }, [currentUser?.tiktokHandle]);

  // ---------- TỰ ĐỘNG ĐỒNG BỘ ĐƠN ỨNG TUYỂN ĐA THIẾT BỊ (Applications Multi-Device Sync) ----------
  useEffect(() => {
    if (!isSupabaseConfigured() || !currentUser) return;

    if (currentUser.role === 'admin') {
      getApplicationsFromSupabase().then((cloudApps) => {
        if (!cloudApps) return;
        setApplications((prev) => {
          const map = new Map(cloudApps.map((a) => [a.id, a]));
          // Bảo lưu đơn offline cục bộ nếu có
          prev.forEach((a) => {
            if (!map.has(a.id) && (a.id.startsWith('offline-') || a.id.startsWith('app-local-'))) {
              map.set(a.id, a);
            }
          });
          return Array.from(map.values());
        });
      });
    } else if (currentUser.tiktokHandle) {
      getMyApplicationsFromSupabase(currentUser.tiktokHandle).then((cloudApps) => {
        if (!cloudApps) return;
        setApplications((prev) => {
          const map = new Map(cloudApps.map((a) => [a.id, a]));
          // Tự động đẩy đơn đang có trên máy này lên Supabase Cloud nếu Cloud chưa có
          prev.forEach((localApp) => {
            if (isOwnApplication(localApp, currentUser)) {
              if (!map.has(localApp.id)) {
                map.set(localApp.id, localApp);
                submitApplicationToSupabase(localApp).catch((e) => console.warn('Tự động đẩy đơn offline lên Cloud thất bại:', e));
              }
            }
          });
          return Array.from(map.values());
        });
      });
    }
  }, [currentUser?.id, currentUser?.tiktokHandle, currentUser?.role]);

  // ---------- Link Media Kit công khai (?mk=... hoặc ?mediakit=...) — giữ để link KOC đã chia sẻ vẫn mở được ----------
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const mk = params.get('mk');
      const handle = params.get('mediakit');
      if (mk) {
        setPublicMediaKit(JSON.parse(decodeURIComponent(escape(atob(mk)))));
        return;
      }
      if (!handle) return;
      const clean = normHandle(handle);
      const local = readJSON<KOCUser[]>('koctrend_registered_users', []).find((u) => normHandle(u.tiktokHandle) === clean);
      if (local) setPublicMediaKit(local as unknown as PublicMediaKitPayload);
      getKOCProfileFromSupabase(clean).then((cloud) => {
        if (cloud) setPublicMediaKit((prev) => ({ ...(prev || {}), ...(cloud as unknown as PublicMediaKitPayload) }));
        else if (!local) setPublicMediaKit({ name: clean, tiktokHandle: `@${clean}` });
      });
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const closePublicMediaKit = useCallback(() => {
    setPublicMediaKit(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('mediakit');
      url.searchParams.delete('mk');
      window.history.replaceState({}, '', url.pathname + url.search);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // ---------- Tài khoản ----------
  const persistUser = (user: KOCUser | null) => {
    setCurrentUser(user);
    try {
      if (user) localStorage.setItem('koctrend_koc_profile', JSON.stringify(user));
      else localStorage.removeItem('koctrend_koc_profile');
    } catch (e) {
      console.warn(e);
    }
  };

  const signIn = useCallback(
    (user: KOCUser, isNew: boolean) => {
      persistUser(user);
      showToast(isNew ? `Chào mừng ${user.name}!` : `Xin chào ${user.name}!`, isNew ? 'Tài khoản đã sẵn sàng.' : undefined, 'success');
    },
    [showToast]
  );

  const signOut = useCallback(() => {
    logout().catch((e) => console.warn(e));
    persistUser(null);
    showToast('Đã đăng xuất', undefined, 'info');
  }, [showToast]);

  /** Lưu hồ sơ + cập nhật danh sách tài khoản trên máy + đồng bộ Supabase */
  const saveProfile = useCallback(
    (user: KOCUser) => {
      persistUser(user);
      const users = readJSON<KOCUser[]>('koctrend_registered_users', []);
      const idx = users.findIndex((u) => u.id === user.id || (normHandle(u.tiktokHandle) && normHandle(u.tiktokHandle) === normHandle(user.tiktokHandle)));
      if (idx >= 0) users[idx] = { ...users[idx], ...user };
      else users.push(user);
      writeJSON('koctrend_registered_users', users);
      saveKOCProfileToSupabase(user).catch((e) => console.warn(e));
      showToast('Đã lưu hồ sơ', undefined, 'success');
    },
    [showToast]
  );

  /** Ghi nhớ thông tin vừa điền ở form nhận mẫu để lần sau tự điền (không hiện thông báo) */
  const rememberFromApplication = useCallback((user: KOCUser) => {
    persistUser(user);
    const users = readJSON<KOCUser[]>('koctrend_registered_users', []);
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
      writeJSON('koctrend_registered_users', users);
    }
  }, []);

  // ---------- Đơn nhận mẫu ----------
  const submitApplication = useCallback(
    (app: KOCApplication) => {
      setApplications((prev) => [app, ...prev.filter((a) => a.id !== app.id)]);
      submitApplicationToSupabase(app);
      incrementCampaignRegisteredSpotsOnSupabase(app.campaignId);
      setCampaigns((prev) =>
        prev.map((c) => (c.id === app.campaignId ? { ...c, registeredSpots: Math.min(c.totalSpots, c.registeredSpots + 1) } : c))
      );
      const now = Date.now();
      pushNotification({
        id: `admin-notif-app-${now}`,
        title: `Hồ sơ KOC mới: ${app.kocName}`,
        message: `KOC ${app.tiktokHandle} vừa gửi hồ sơ nhận mẫu cho chiến dịch "${app.campaignName}".`,
        time: 'Vừa xong',
        read: false,
        type: 'approval',
        targetRole: 'admin',
        linkTab: 'admin',
        adminSubTab: 'applications',
      });
      pushNotification({
        id: `koc-notif-${now}`,
        title: `Đã gửi đơn ${app.code}`,
        message: `Brand đang xem kênh của bạn cho chiến dịch "${app.campaignName}". Kết quả sẽ báo tại đây.`,
        time: 'Vừa xong',
        read: false,
        type: 'approval',
        targetRole: 'koc',
        targetKocId: app.kocId,
        targetTiktokHandle: app.tiktokHandle,
        linkTab: 'my-campaigns',
      });
    },
    [pushNotification]
  );

  const submitVideoLink = useCallback(
    (appId: string, link: string) => {
      const submittedAt = new Date().toISOString();
      const target = applications.find((a) => a.id === appId);
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, videoLink: link, videoViews: '', status: 'Chờ duyệt video' as ApplicationStatus, videoSubmittedAt: submittedAt, adminFeedback: undefined }
            : a
        )
      );
      updateApplicationStatusOnSupabase(appId, { videoLink: link, status: 'Chờ duyệt video', videoSubmittedAt: submittedAt });
      pushNotification({
        id: `admin-notif-video-${Date.now()}`,
        title: `Video mới cần duyệt${target ? `: ${target.kocName}` : ''}`,
        message: `KOC vừa nộp link video${target ? ` cho "${target.campaignName}"` : ''}.`,
        time: 'Vừa xong',
        read: false,
        type: 'delivery',
        targetRole: 'admin',
        linkTab: 'admin',
        adminSubTab: 'content',
      });
      showToast('Đã nộp video', 'Admin sẽ kiểm tra và cập nhật trạng thái cho bạn.', 'success');
    },
    [applications, pushNotification, showToast]
  );

  const toggleBookmark = useCallback(
    (campaign: Campaign) => {
      const exists = bookmarkedIds.includes(campaign.id);
      setBookmarkedIds((prev) => (exists ? prev.filter((id) => id !== campaign.id) : [...prev, campaign.id]));
      showToast(exists ? 'Đã bỏ lưu' : 'Đã lưu chiến dịch', campaign.brandName, exists ? 'info' : 'success');
    },
    [bookmarkedIds, showToast]
  );

  // ---------- Thông báo ----------
  const visibleNotifications = useMemo(() => getVisibleNotifications(notifications, currentUser), [notifications, currentUser]);
  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);
  const markAllNotificationsRead = useCallback(() => {
    const visibleIds = new Set(visibleNotifications.map((n) => n.id));
    setNotifications((prev) => prev.map((n) => (visibleIds.has(n.id) ? { ...n, read: true } : n)));
  }, [visibleNotifications]);

  // ---------- Ảnh banner (Admin) ----------
  const updateHeroImage = useCallback(
    async (img: string) => {
      setHeroImage(img);
      try {
        localStorage.setItem('kocity_custom_hero_image', img);
      } catch (e) {
        console.warn(e);
      }
      const ok = await saveHeroBannerToSupabase(img);
      showToast(ok ? 'Đã cập nhật ảnh banner' : 'Đã lưu ảnh trên máy này', ok ? undefined : 'Chưa đồng bộ được lên Supabase.', ok ? 'success' : 'info');
    },
    [showToast]
  );
  const resetHeroImage = useCallback(async () => {
    setHeroImage(kocityHeroStudio);
    try {
      localStorage.removeItem('kocity_custom_hero_image');
    } catch (e) {
      console.warn(e);
    }
    await deleteHeroBannerFromSupabase();
    showToast('Đã khôi phục ảnh mặc định', undefined, 'info');
  }, [showToast]);

  // ---------- Dành cho Admin cũ ----------
  const updateSingleCampaign = useCallback(
    (camp: Campaign) => {
      setCampaigns((prev) => prev.map((c) => (c.id === camp.id ? camp : c)));
      updateCampaignOnSupabase(camp.id, camp).then((ok) => ok && showToast('Đã lưu chiến dịch', undefined, 'success'));
    },
    [showToast]
  );

  const myApplications = useMemo(
    () => (currentUser && currentUser.role !== 'admin' ? applications.filter((a) => isOwnApplication(a, currentUser)) : []),
    [applications, currentUser]
  );
  const liveActivity = useMemo(() => buildLiveActivity(applications, campaigns), [applications, campaigns]);

  const value: AppDataValue = {
    currentUser,
    isAdmin: currentUser?.role === 'admin',
    campaigns,
    isCloudSynced,
    applications,
    myApplications,
    notifications,
    visibleNotifications,
    unreadCount,
    liveActivity,
    heroImage,
    bookmarkedIds,
    toast,
    publicMediaKit,
    adminTargetSubTab,
    editingCampaignFromExternal,
    showToast,
    dismissToast: () => setToast(null),
    signIn,
    signOut,
    saveProfile,
    rememberFromApplication,
    submitApplication,
    submitVideoLink,
    toggleBookmark,
    markNotificationRead,
    markAllNotificationsRead,
    updateHeroImage,
    resetHeroImage,
    closePublicMediaKit,
    setCampaignsFromAdmin: setCampaigns,
    setApplicationsFromAdmin: setApplications,
    updateSingleCampaign,
    addNotification: pushNotification,
    setAdminTargetSubTab,
    setEditingCampaignFromExternal,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};
