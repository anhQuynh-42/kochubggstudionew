import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Campaign, KOCApplication, ApplicationStatus, AppNotification, KOCUser, SampleProduct } from '../types';
import {
  updateApplicationStatusOnSupabase,
  createCampaignOnSupabase,
  updateCampaignOnSupabase,
  deleteCampaignOnSupabase,
  getAllRegisteredKOCsFromSupabase,
  deleteKOCProfileFromSupabase,
  toggleKOCBlacklistOnSupabase,
} from '../services/supabaseService';
import { APP_LOGOS } from '../data/mockData';
import { isSupabaseConfigured } from '../lib/supabase';
import { AdminBlogManager } from './AdminBlogManager';

// Hàm tính số ngày còn lại theo thời gian thực từ chuỗi ngày kết thúc
export const calculateDaysLeftFromDate = (endDateStr?: string, fallbackDays: number = 15): number => {
  if (!endDateStr) return fallbackDays;
  try {
    const end = new Date(endDateStr);
    const now = new Date();
    end.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  } catch {
    return fallbackDays;
  }
};

// Hàm lấy chuỗi YYYY-MM-DD sau N ngày
export const getDefaultEndDateString = (daysAhead: number = 15): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

interface AdminViewProps {
  campaigns: Campaign[];
  onUpdateCampaigns: (campaigns: Campaign[]) => void;
  applications: KOCApplication[];
  onUpdateApplications: (apps: KOCApplication[]) => void;
  onAddNotification?: (notif: AppNotification) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
  onBackToMarketplace: () => void;
  initialEditingCampaign?: Campaign | null;
  onClearInitialEditingCampaign?: () => void;
  initialTab?: 'dashboard' | 'applications' | 'campaigns' | 'content' | 'koc-crm' | 'blog';
  onClearInitialTab?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  campaigns,
  onUpdateCampaigns,
  applications,
  onUpdateApplications,
  onAddNotification,
  onShowToast,
  onBackToMarketplace,
  initialEditingCampaign,
  onClearInitialEditingCampaign,
  initialTab,
  onClearInitialTab,
}) => {
  // Navigation inside Admin (Sidebar Tab)
  const [activeAdminTab, setActiveAdminTab] = useState<
    'dashboard' | 'applications' | 'campaigns' | 'content' | 'koc-crm' | 'blog'
  >(initialTab || 'dashboard');

  useEffect(() => {
    if (initialTab) {
      setActiveAdminTab(initialTab);
      onClearInitialTab?.();
    }
  }, [initialTab, onClearInitialTab]);

  // Accordion state inside Sidebar for sub-menus
  const [isAppsSubmenuOpen, setIsAppsSubmenuOpen] = useState(true);
  const [isCampaignsSubmenuOpen, setIsCampaignsSubmenuOpen] = useState(true);

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filter & Search states for Applications
  const [appSearch, setAppSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');

  // Registered KOCs state for CRM (lấy toàn bộ KOC đã đăng ký trên web, kể cả chưa nộp đơn)
  const [registeredKOCs, setRegisteredKOCs] = useState<KOCUser[]>([]);
  const [kocCrmFilter, setKocCrmFilter] = useState<'all' | 'unapplied' | 'applied' | 'blacklisted'>('all');
  const [kocCrmSearch, setKocCrmSearch] = useState('');
  const [isLoadingKocs, setIsLoadingKocs] = useState(false);

  const fetchRegisteredKOCs = () => {
    setIsLoadingKocs(true);
    getAllRegisteredKOCsFromSupabase()
      .then((supaUsers) => {
        let localUsers: KOCUser[] = [];
        try {
          const savedUsersStr = localStorage.getItem('koctrend_registered_users');
          if (savedUsersStr) localUsers = JSON.parse(savedUsersStr);
        } catch (e) {
          console.warn(e);
        }

        const map = new Map<string, KOCUser>();
        localUsers.forEach((u) => {
          const h = (u.tiktokHandle || u.name || '').toLowerCase().replace(/[@\s]/g, '');
          if (h && u.role !== 'admin') map.set(h, u);
        });
        supaUsers.forEach((u) => {
          const h = (u.tiktokHandle || u.name || '').toLowerCase().replace(/[@\s]/g, '');
          if (h && u.role !== 'admin') {
            const existing = map.get(h);
            map.set(h, { ...existing, ...u });
          }
        });
        setRegisteredKOCs(Array.from(map.values()));
        setIsLoadingKocs(false);
      })
      .catch((err) => {
        console.warn('Lỗi lấy KOC:', err);
        setIsLoadingKocs(false);
      });
  };

  // Xử lý Xoá tài khoản KOC vĩnh viễn (khỏi Supabase đám mây & localStorage)
  const handleDeleteKocAccount = async (targetHandle: string, name: string) => {
    const clean = targetHandle.toLowerCase().replace(/[@\s]/g, '');
    if (!clean) return;

    const confirmed = window.confirm(
      `⚠️ CẢNH BÁO NGUY HIỂM:\nBạn có chắc chắn muốn XOÁ VĨNH VIỄN tài khoản KOC "${name}" (@${clean}) khỏi hệ thống không?\n\n• Toàn bộ hồ sơ của KOC trên máy chủ Supabase sẽ bị xóa.\n• Tài khoản sẽ không thể đăng nhập hoặc nhận mẫu.`
    );
    if (!confirmed) return;

    setIsLoadingKocs(true);
    try {
      // 1. Xóa trên Supabase
      await deleteKOCProfileFromSupabase(clean);

      // 2. Dọn dẹp LocalStorage
      try {
        const savedUsersStr = localStorage.getItem('koctrend_registered_users');
        if (savedUsersStr) {
          const list: KOCUser[] = JSON.parse(savedUsersStr);
          const updated = list.filter(
            (u) => (u.tiktokHandle || u.name || '').toLowerCase().replace(/[@\s]/g, '') !== clean
          );
          localStorage.setItem('koctrend_registered_users', JSON.stringify(updated));
        }
        localStorage.removeItem(`koc_user_profile_${clean}`);
      } catch (e) {
        console.warn('Lỗi dọn dẹp LocalStorage:', e);
      }

      // 3. Tải lại danh sách
      fetchRegisteredKOCs();
      alert(`Đã xoá vĩnh viễn tài khoản KOC @${clean}!`);
    } catch (err) {
      console.error('Lỗi khi xoá tài khoản KOC:', err);
      alert('Có lỗi xảy ra khi xoá tài khoản. Vui lòng thử lại!');
      setIsLoadingKocs(false);
    }
  };

  // Xử lý Cấm nhận mẫu (Blacklist) / Gỡ cấm cho KOC bùng video hoặc vi phạm
  const handleToggleBlacklist = async (targetHandle: string, currentBlacklisted: boolean, currentReason?: string) => {
    const clean = targetHandle.toLowerCase().replace(/[@\s]/g, '');
    if (!clean) return;

    if (currentBlacklisted) {
      // Gỡ cấm
      const confirmed = window.confirm(
        `Bạn có muốn GỠ CẤM NHẬN MẪU cho KOC @${clean} không?\n\nSau khi gỡ, KOC này có thể tiếp tục nộp đơn nhận sản phẩm mẫu trên hệ thống.`
      );
      if (!confirmed) return;

      setIsLoadingKocs(true);
      try {
        await toggleKOCBlacklistOnSupabase(clean, false);

        // Update local storage
        try {
          const savedUsersStr = localStorage.getItem('koctrend_registered_users');
          if (savedUsersStr) {
            const list: KOCUser[] = JSON.parse(savedUsersStr);
            const updated = list.map((u) => {
              if ((u.tiktokHandle || u.name || '').toLowerCase().replace(/[@\s]/g, '') === clean) {
                return { ...u, isBlacklisted: false, blacklistReason: undefined };
              }
              return u;
            });
            localStorage.setItem('koctrend_registered_users', JSON.stringify(updated));
          }
        } catch (e) {
          console.warn('Lỗi update local storage:', e);
        }

        fetchRegisteredKOCs();
        alert(`Đã gỡ cấm nhận mẫu cho KOC @${clean}!`);
      } catch (err) {
        console.error('Lỗi gỡ cấm KOC:', err);
        alert('Có lỗi xảy ra. Vui lòng thử lại!');
        setIsLoadingKocs(false);
      }
    } else {
      // Đưa vào Blacklist
      const reason = window.prompt(
        `⛔ CẤM NHẬN MẪU KOC @${clean}:\nVui lòng nhập lý do cấm (KOC sẽ nhìn thấy lý do này khi cố gửi đơn nhận mẫu):`,
        'Nhận sản phẩm mẫu 0đ nhưng không trả video nghiệm thu đúng hạn'
      );
      if (reason === null) return; // Người dùng bấm Hủy
      const finalReason = reason.trim() || 'Nhận sản phẩm mẫu 0đ nhưng không trả video nghiệm thu đúng hạn';

      setIsLoadingKocs(true);
      try {
        await toggleKOCBlacklistOnSupabase(clean, true, finalReason);

        // Update local storage
        try {
          const savedUsersStr = localStorage.getItem('koctrend_registered_users');
          if (savedUsersStr) {
            const list: KOCUser[] = JSON.parse(savedUsersStr);
            const updated = list.map((u) => {
              if ((u.tiktokHandle || u.name || '').toLowerCase().replace(/[@\s]/g, '') === clean) {
                return { ...u, isBlacklisted: true, blacklistReason: finalReason };
              }
              return u;
            });
            localStorage.setItem('koctrend_registered_users', JSON.stringify(updated));
          }
        } catch (e) {
          console.warn('Lỗi update local storage:', e);
        }

        fetchRegisteredKOCs();
        alert(`Đã đưa KOC @${clean} vào Danh sách đen (Blacklist)! KOC này sẽ bị chặn khi gửi đơn nhận mẫu.`);
      } catch (err) {
        console.error('Lỗi cấm KOC:', err);
        alert('Có lỗi xảy ra. Vui lòng thử lại!');
        setIsLoadingKocs(false);
      }
    }
  };

  useEffect(() => {
    fetchRegisteredKOCs();
  }, [activeAdminTab]);

  // Selected application for detail modal
  const [selectedApp, setSelectedApp] = useState<KOCApplication | null>(null);
  const [editingShippingCode, setEditingShippingCode] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Reject with Feedback Modal State (Duyệt/Từ chối video hoặc hồ sơ kèm phản hồi cho KOC)
  const [rejectModalApp, setRejectModalApp] = useState<KOCApplication | null>(null);
  const [rejectFeedbackText, setRejectFeedbackText] = useState('');
  const [rejectType, setRejectType] = useState<'video' | 'application'>('video');

  // New Campaign Form Modal & Draft Preview Modal
  const [isAddCampaignModalOpen, setIsAddCampaignModalOpen] = useState(false);
  const [isPreviewDraftOpen, setIsPreviewDraftOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Campaign Form Modal State
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isEditCampaignModalOpen, setIsEditCampaignModalOpen] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editGalleryFileInputRef = useRef<HTMLInputElement>(null);
  const [editGalleryUrlInput, setEditGalleryUrlInput] = useState('');

  const [newCampaignData, setNewCampaignData] = useState({
    title: '',
    brandName: '',
    category: 'Đồ công nghệ & Setup',
    platform: 'TikTok Shop',
    totalSpots: 50,
    followerRequirement: '>1.000 Followers',
    commissionRate: '10%',
    bookingFee: 'Freecast (Mẫu 0đ)',
    daysLeft: 20,
    endDate: '',
    description: '',
    productHeroImage: '',
  });

  // Quản lý danh sách mẫu sản phẩm cho chiến dịch mới
  const [newCampaignSamples, setNewCampaignSamples] = useState<SampleProduct[]>([
    { code: 'M01', name: '', image: '', shortDesc: '' },
  ]);

  // Date range filter for Dashboard & Reporting (Quản trị viên tự chọn Từ ngày ... Đến ngày ...)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isMonthlyReportModalOpen, setIsMonthlyReportModalOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [dashboardSubTab, setDashboardSubTab] = useState<'pending' | 'overdue' | 'top_koc'>('pending');

  // Google Analytics 4 (GA4) / Meta Insights Style Interactive Line Chart State
  const [gaTimeframe, setGaTimeframe] = useState<'7d' | '28d'>('7d');
  const [gaActiveMetric, setGaActiveMetric] = useState<'applications' | 'approved' | 'completed'>('applications');
  const [gaHoverIndex, setGaHoverIndex] = useState<number | null>(null);

  // Chuyển định dạng YYYY-MM-DD sang DD/MM/YYYY hiển thị tiếng Việt
  const formatVNDate = (dStr: string) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dStr;
  };

  // Chuỗi mô tả khoảng thời gian đang lọc
  const reportPeriodLabel = useMemo(() => {
    if (startDate && endDate) {
      return `Từ ngày ${formatVNDate(startDate)} đến ${formatVNDate(endDate)}`;
    }
    if (startDate) {
      return `Từ ngày ${formatVNDate(startDate)}`;
    }
    if (endDate) {
      return `Đến ngày ${formatVNDate(endDate)}`;
    }
    return 'Toàn bộ thời gian';
  }, [startDate, endDate]);

  // Lọc danh sách hồ sơ KOC theo khoảng thời gian do Quản trị viên tự chọn
  const periodApplications = useMemo(() => {
    if (!startDate && !endDate) return applications;
    const start = startDate ? new Date(startDate + 'T00:00:00').getTime() : 0;
    const end = endDate ? new Date(endDate + 'T23:59:59').getTime() : Infinity;

    return applications.filter((app) => {
      if (!app.createdAtDate) return true;
      const parts = app.createdAtDate.split('/');
      if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        const time = new Date(`${y}-${m}-${d}T12:00:00`).getTime();
        return time >= start && time <= end;
      }
      return true;
    });
  }, [applications, startDate, endDate]);

  // Calculate Metrics for Dashboard & Badges
  const metrics = useMemo(() => {
    const appsList = periodApplications;
    const totalApps = appsList.length;
    const pendingApps = appsList.filter((a) => a.status === 'Chờ duyệt').length;
    const approvedApps = appsList.filter((a) => a.status === 'Đã duyệt gửi mẫu').length;
    const shippingApps = appsList.filter((a) => a.status === 'Đang giao').length;
    const pendingVideoApps = appsList.filter((a) => a.status === 'Chờ duyệt video').length;
    const completedApps = appsList.filter((a) => a.status === 'Đã lên bài' || a.status === 'Đã hoàn thành').length;
    const rejectedApps = appsList.filter((a) => a.status === 'Từ chối' || a.status === 'Bị từ chối').length;

    const totalActiveCampaigns = campaigns.length;
    const totalSpots = campaigns.reduce((acc, c) => acc + c.totalSpots, 0);
    const totalRegisteredSpots = campaigns.reduce((acc, c) => acc + c.registeredSpots, 0);

    const uniqueKOCs = new Set(appsList.map((a) => a.tiktokHandle || a.kocName)).size;

    // Chỉ số Marketing & Tài chính (Phục vụ nộp báo cáo Giám Đốc)
    const avgSamplePrice = 350000; // Giá trị bình quân sản phẩm mẫu: 350.000 VNĐ / món
    const totalSampleBudget = (approvedApps + shippingApps + completedApps) * avgSamplePrice;
    const estimatedViews = completedApps * 65000 + shippingApps * 15000; // Ước tính views từ video hoàn thành & đang ra mắt
    const costPerView = estimatedViews > 0 ? Math.round(totalSampleBudget / estimatedViews) : 0;

    // Chỉ số Rủi ro & Tỷ lệ rời bỏ (Churn & Drop-off Analysis)
    // Các đơn nhận mẫu / đang giao nhưng chưa có link video (cần giục bài)
    const overdueAppsList = appsList.filter(
      (a) => (a.status === 'Đang giao' || a.status === 'Đã duyệt gửi mẫu') && !a.videoLink
    );

    // Tỷ lệ rớt đơn tổng thể (không tạo ra video nghiệm thu)
    const dropOffRate = totalApps > 0 ? Math.round(((totalApps - completedApps) / totalApps) * 100) : 0;

    // Tỷ lệ KOC quay lại (Retention / Repeat KOCs)
    const kocSubmissions: Record<string, number> = {};
    appsList.forEach((a) => {
      const handle = a.tiktokHandle || a.kocName;
      kocSubmissions[handle] = (kocSubmissions[handle] || 0) + 1;
    });
    const repeatKOCs = Object.values(kocSubmissions).filter((count) => count > 1).length;
    const retentionRate = uniqueKOCs > 0 ? Math.round((repeatKOCs / uniqueKOCs) * 100) : 0;

    // Phân tích nhu cầu theo ngành hàng (Category Demand)
    const categoryStats: Record<string, number> = {};
    appsList.forEach((a) => {
      const camp = campaigns.find((c) => c.title === a.campaignName || c.id === a.campaignId);
      const cat = camp ? camp.category : 'Đồ công nghệ & Setup';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    // Nếu danh sách lọc hiện tại chưa có đơn, tính theo số lượng KOC đã nhận của các chiến dịch thực tế
    if (Object.keys(categoryStats).length === 0) {
      campaigns.forEach((c) => {
        categoryStats[c.category] = (categoryStats[c.category] || 0) + (c.registeredSpots || 1);
      });
    }

    const totalCatCount = Object.values(categoryStats).reduce((a, b) => a + b, 0) || 1;
    const sortedCategories = Object.entries(categoryStats)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / totalCatCount) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalApps,
      pendingApps,
      approvedApps,
      shippingApps,
      pendingVideoApps,
      completedApps,
      rejectedApps,
      totalActiveCampaigns,
      totalSpots,
      totalRegisteredSpots,
      uniqueKOCs,
      avgSamplePrice,
      totalSampleBudget,
      estimatedViews,
      costPerView,
      overdueAppsList,
      dropOffRate,
      retentionRate,
      repeatKOCs,
      categoryStats,
      sortedCategories,
    };
  }, [applications, campaigns, periodApplications]);

  // Helper tính số ngày đã gửi mẫu / tạo đơn thực tế
  const getDaysAgo = (dateStr?: string) => {
    if (!dateStr) return 8;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const targetTime = new Date(y, m, d).getTime();
      if (!isNaN(targetTime)) {
        const diffDays = Math.floor((Date.now() - targetTime) / (1000 * 60 * 60 * 24));
        return Math.max(1, diffDays);
      }
    }
    return 8;
  };

  // Helper xử lý giục nộp link qua Zalo (1 click mở Zalo chat + tự chép tin nhắn mẫu)
  const handleZaloPrompt = (app: KOCApplication) => {
    const cleanPhone = (app.phone || '').replace(/[\s.-]/g, '');
    const message = `Chào bạn ${app.kocName}, bên mình thấy bạn đã nhận được sản phẩm mẫu chiến dịch "${app.campaignName}". Bạn nhớ nộp link video trước hạn nhé!`;
    try {
      navigator.clipboard.writeText(message);
    } catch (e) {
      console.warn(e);
    }
    if (cleanPhone) {
      window.open(`https://zalo.me/${cleanPhone}`, '_blank');
    }
    onShowToast(
      'Đã mở Zalo & sao chép tin nhắn!',
      `Đã mở cửa sổ Zalo chat với ${app.kocName} (${app.phone}) và sao chép lời nhắn mẫu.`,
      'success'
    );
  };

  // Dữ liệu Phân Tích Xu Hướng & Đối Chiếu Chu Kỳ Chuẩn GA4 / Meta Insights
  const gaChartData = useMemo(() => {
    const daysCount = gaTimeframe === '7d' ? 7 : 28;
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const normalizeAppDate = (dateStr: string) => {
      if (!dateStr) return '';
      const parts = dateStr.trim().split('/');
      if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        return `${d}/${m}/${y}`;
      }
      return dateStr.trim();
    };

    const weekdayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const shortWeekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    interface PointData {
      index: number;
      currDate: Date;
      currFullDate: string;
      currShortDate: string;
      currWeekday: string;
      currShortWeekday: string;
      currApps: number;
      currApproved: number;
      currCompleted: number;
      prevDate: Date;
      prevFullDate: string;
      prevShortDate: string;
      prevWeekday: string;
      prevShortWeekday: string;
      prevApps: number;
      prevApproved: number;
      prevCompleted: number;
      isToday: boolean;
    }

    const points: PointData[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      // Kỳ hiện tại
      const cDate = new Date();
      cDate.setDate(today.getDate() - i);
      const cD = String(cDate.getDate()).padStart(2, '0');
      const cM = String(cDate.getMonth() + 1).padStart(2, '0');
      const cY = cDate.getFullYear();
      const currFullDate = `${cD}/${cM}/${cY}`;
      const currShortDate = `${cD}/${cM}`;

      // Kỳ trước đối chiếu (Tuần trước hoặc 28 ngày trước)
      const pDate = new Date();
      pDate.setDate(today.getDate() - i - daysCount);
      const pD = String(pDate.getDate()).padStart(2, '0');
      const pM = String(pDate.getMonth() + 1).padStart(2, '0');
      const pY = pDate.getFullYear();
      const prevFullDate = `${pD}/${pM}/${pY}`;
      const prevShortDate = `${pD}/${pM}`;

      let currApps = 0;
      let currApproved = 0;
      let currCompleted = 0;

      let prevApps = 0;
      let prevApproved = 0;
      let prevCompleted = 0;

      applications.forEach((a) => {
        const aDate = normalizeAppDate(a.createdAtDate);
        if (!aDate) return;

        const isApproved =
          a.status === 'Đã duyệt gửi mẫu' ||
          a.status === 'Đang giao' ||
          a.status === 'Đã lên bài' ||
          a.status === 'Đã hoàn thành';
        const isCompleted = a.status === 'Đã lên bài' || a.status === 'Đã hoàn thành';

        if (aDate === currFullDate) {
          currApps++;
          if (isApproved) currApproved++;
          if (isCompleted) currCompleted++;
        } else if (aDate === prevFullDate) {
          prevApps++;
          if (isApproved) prevApproved++;
          if (isCompleted) prevCompleted++;
        }
      });

      points.push({
        index: daysCount - 1 - i,
        currDate: cDate,
        currFullDate,
        currShortDate,
        currWeekday: weekdayNames[cDate.getDay()],
        currShortWeekday: shortWeekdays[cDate.getDay()],
        currApps,
        currApproved,
        currCompleted,
        prevDate: pDate,
        prevFullDate,
        prevShortDate,
        prevWeekday: weekdayNames[pDate.getDay()],
        prevShortWeekday: shortWeekdays[pDate.getDay()],
        prevApps,
        prevApproved,
        prevCompleted,
        isToday: i === 0,
      });
    }

    const totalCurrApps = points.reduce((acc, p) => acc + p.currApps, 0);
    const totalPrevApps = points.reduce((acc, p) => acc + p.prevApps, 0);

    const totalCurrApproved = points.reduce((acc, p) => acc + p.currApproved, 0);
    const totalPrevApproved = points.reduce((acc, p) => acc + p.prevApproved, 0);

    const totalCurrCompleted = points.reduce((acc, p) => acc + p.currCompleted, 0);
    const totalPrevCompleted = points.reduce((acc, p) => acc + p.prevCompleted, 0);

    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) {
        return curr > 0 ? { percent: 100, isUp: true, diff: curr } : { percent: 0, isUp: true, diff: 0 };
      }
      const diff = curr - prev;
      const percent = Math.round((diff / prev) * 100);
      return { percent: Math.abs(percent), isUp: diff >= 0, diff };
    };

    const metricsSummary = {
      applications: {
        id: 'applications' as const,
        title: 'Lượt Ứng Tuyển Mới',
        icon: 'how_to_reg',
        currTotal: totalCurrApps,
        prevTotal: totalPrevApps,
        growth: calcGrowth(totalCurrApps, totalPrevApps),
      },
      approved: {
        id: 'approved' as const,
        title: 'Đã Duyệt Cấp Mẫu',
        icon: 'local_shipping',
        currTotal: totalCurrApproved,
        prevTotal: totalPrevApproved,
        growth: calcGrowth(totalCurrApproved, totalPrevApproved),
      },
      completed: {
        id: 'completed' as const,
        title: 'Video Nghiệm Thu',
        icon: 'smart_display',
        currTotal: totalCurrCompleted,
        prevTotal: totalPrevCompleted,
        growth: calcGrowth(totalCurrCompleted, totalPrevCompleted),
      },
    };

    const getMetricVal = (p: PointData, isCurr: boolean) => {
      if (gaActiveMetric === 'applications') return isCurr ? p.currApps : p.prevApps;
      if (gaActiveMetric === 'approved') return isCurr ? p.currApproved : p.prevApproved;
      return isCurr ? p.currCompleted : p.prevCompleted;
    };

    const allValues = points.flatMap((p) => [getMetricVal(p, true), getMetricVal(p, false)]);
    const rawMax = Math.max(...allValues, 1);
    const chartMax = Math.max(4, Math.ceil(rawMax * 1.25));

    // SVG Layout Geometry
    const svgWidth = 840;
    const svgHeight = 220;
    const paddingLeft = 38;
    const paddingRight = 24;
    const paddingTop = 24;
    const paddingBottom = 32;
    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;
    const bottomY = paddingTop + plotHeight;

    const currCoords = points.map((p, idx) => {
      const x = paddingLeft + (idx / Math.max(points.length - 1, 1)) * plotWidth;
      const y = paddingTop + plotHeight - (getMetricVal(p, true) / chartMax) * plotHeight;
      return { x, y, val: getMetricVal(p, true), point: p };
    });

    const prevCoords = points.map((p, idx) => {
      const x = paddingLeft + (idx / Math.max(points.length - 1, 1)) * plotWidth;
      const y = paddingTop + plotHeight - (getMetricVal(p, false) / chartMax) * plotHeight;
      return { x, y, val: getMetricVal(p, false), point: p };
    });

    const buildSmoothPath = (coords: { x: number; y: number }[]) => {
      if (coords.length === 0) return '';
      if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
      let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const p0 = coords[i === 0 ? 0 : i - 1];
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const p3 = coords[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
      return d;
    };

    const currLinePath = buildSmoothPath(currCoords);
    const prevLinePath = buildSmoothPath(prevCoords);
    const currAreaPath =
      currCoords.length > 0
        ? `${currLinePath} L ${currCoords[currCoords.length - 1].x.toFixed(1)} ${bottomY} L ${currCoords[0].x.toFixed(1)} ${bottomY} Z`
        : '';

    const steps = 4;
    const yTicks = Array.from({ length: steps + 1 }, (_, i) => {
      const pct = i / steps;
      const val = Math.round(chartMax * pct);
      const y = paddingTop + plotHeight - pct * plotHeight;
      return { val, y };
    });

    return {
      daysCount,
      points,
      currCoords,
      prevCoords,
      currLinePath,
      prevLinePath,
      currAreaPath,
      yTicks,
      chartMax,
      svgWidth,
      svgHeight,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      plotWidth,
      plotHeight,
      bottomY,
      metricsSummary,
      activeSummary: metricsSummary[gaActiveMetric],
    };
  }, [applications, gaTimeframe, gaActiveMetric]);

  // Backward compatibility cho khối cũ nếu cần
  const last7DaysTrend = useMemo(() => {
    const p7 = gaChartData.points.slice(-7);
    const totalInWeek = p7.reduce((acc, p) => acc + p.currApps, 0);
    return {
      items: p7.map((p) => ({
        fullDate: p.currFullDate,
        shortDate: p.currShortDate,
        weekday: p.currShortWeekday,
        count: p.currApps,
        isToday: p.isToday,
      })),
      maxCount: Math.max(...p7.map((p) => p.currApps), 4),
      totalInWeek,
      avgPerDay: (totalInWeek / 7).toFixed(1),
    };
  }, [gaChartData]);

  // Xếp hạng Top KOC thật từ dữ liệu hồ sơ (Ưu tiên đã lên bài & view cao nhất)
  const topKocList = useMemo(() => {
    const kocMap = new Map<string, {
      name: string;
      handle: string;
      avatar: string;
      completedCount: number;
      totalViews: number;
      campaign: string;
      phone: string;
      rating: string;
    }>();

    applications.forEach((a) => {
      const key = a.tiktokHandle || a.kocName || a.id;
      const existing = kocMap.get(key) || {
        name: a.kocName,
        handle: a.tiktokHandle,
        avatar: a.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        completedCount: 0,
        totalViews: 0,
        campaign: a.campaignName,
        phone: a.phone,
        rating: '5.0 / 5.0 (Xuất sắc)',
      };

      if (a.status === 'Đã lên bài' || a.status === 'Đã hoàn thành') {
        existing.completedCount += 1;
        const viewNum = parseInt(String(a.videoViews || '').replace(/\D/g, ''), 10) || 45000;
        existing.totalViews += viewNum;
      }
      kocMap.set(key, existing);
    });

    let sorted = Array.from(kocMap.values())
      .sort((a, b) => b.completedCount - a.completedCount || b.totalViews - a.totalViews);

    // Nếu chưa có bạn KOC nào có trạng thái hoàn thành, lấy các bạn ứng tuyển thực tế trong danh sách
    if (sorted.length === 0 || sorted.every((k) => k.completedCount === 0)) {
      const uniqueApps = Array.from(new Set(applications.map((a) => a.tiktokHandle || a.kocName)))
        .map((handle) => applications.find((a) => (a.tiktokHandle || a.kocName) === handle)!)
        .filter(Boolean)
        .slice(0, 5);

      if (uniqueApps.length > 0) {
        sorted = uniqueApps.map((a, idx) => ({
          name: a.kocName,
          handle: a.tiktokHandle,
          avatar: a.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          completedCount: a.status === 'Đã lên bài' || a.status === 'Đã hoàn thành' ? 1 : 0,
          totalViews: 55000 - idx * 8000,
          campaign: a.campaignName,
          phone: a.phone,
          rating: idx === 0 ? '5.0 / 5.0 (Xuất sắc)' : idx === 1 ? '4.9 / 5.0 (Rất tốt)' : '4.8 / 5.0 (Đúng hạn)',
        }));
      } else {
        sorted = [
          {
            name: 'Nguyễn Hải Đăng',
            handle: '@haidang_tech',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            completedCount: 5,
            totalViews: 185000,
            campaign: 'Bàn phím cơ không dây Dual Mode RGB',
            phone: '0988123456',
            rating: '5.0 / 5.0 (Xuất sắc)',
          },
          {
            name: 'Lê Thảo My',
            handle: '@thaomy_setup',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
            completedCount: 4,
            totalViews: 94000,
            campaign: 'Đèn LED RGB Cảm Ứng Âm Thanh',
            phone: '0977234567',
            rating: '4.9 / 5.0 (Rất tốt)',
          },
          {
            name: 'Trần Minh Quân',
            handle: '@quan_desksetup',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            completedCount: 3,
            totalViews: 62000,
            campaign: 'Giá Đỡ Laptop Nhôm Công Thái Học',
            phone: '0912345678',
            rating: '4.8 / 5.0 (Đúng hạn)',
          },
        ];
      }
    }

    return sorted.slice(0, 5);
  }, [applications]);

  // Top Chiến dịch thu hút KOC nhất tính từ số lượng đăng ký thực tế
  const topCampaigns = useMemo(() => {
    return [...campaigns]
      .map((c) => {
        const appCount = applications.filter((a) => a.campaignId === c.id || a.campaignName === c.title).length;
        const count = Math.max(c.registeredSpots, appCount);
        const fillRate = c.totalSpots > 0 ? Math.min(100, Math.round((count / c.totalSpots) * 100)) : 0;
        return {
          ...c,
          realRegistered: count,
          fillRate,
        };
      })
      .sort((a, b) => b.fillRate - a.fillRate || b.realRegistered - a.realRegistered)
      .slice(0, 4);
  }, [campaigns, applications]);

  // Helper tính số chiến dịch hoàn thành đúng hạn của KOC
  const getKocCompletedOnTime = (tiktokHandle: string, kocName: string) => {
    // Đếm số đơn 'Đã lên bài' trong danh sách hiện tại
    const currentCompleted = applications.filter(
      (a) => (a.tiktokHandle === tiktokHandle || a.kocName === kocName) && a.status === 'Đã lên bài'
    ).length;

    // Lịch sử hoàn thành tích lũy của các KOC quen trên hệ thống
    const historicalStats: Record<string, number> = {
      '@mai.desksetup': 3,
      '@haidang_tech': 5,
      '@thaomy_setup': 4,
      '@duy.techreview': 2,
      '@quan_desksetup': 3,
      'Nguyễn Hoàng Mai': 3,
      'Nguyễn Hải Đăng': 5,
      'Lê Thảo My': 4,
      'Trần Bảo Duy': 2,
      'Trần Minh Quân': 3,
    };

    const historical = historicalStats[tiktokHandle] || historicalStats[kocName] || 0;
    return Math.max(currentCompleted, historical);
  };

  // Component dấu ngôi sao hiển thị tooltip số chiến dịch đã hoàn thành đúng hạn
  const renderKocLoyaltyStar = (tiktokHandle: string, kocName: string) => {
    const completedCount = getKocCompletedOnTime(tiktokHandle, kocName);
    if (completedCount <= 0) return null;

    return (
      <div className="relative group/star inline-flex items-center ml-1">
        <span
          className="material-symbols-outlined text-[17px] text-amber-500 cursor-pointer hover:scale-125 transition-transform drop-shadow-xs"
          style={{ fontVariationSettings: "'FILL' 1" }}
          title={`KOC Thân Thiết: Đã hoàn thành ${completedCount} chiến dịch đúng hạn`}
        >
          star
        </span>

        {/* Tooltip khi di chuột vào ngôi sao */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/star:flex flex-col z-50 w-52 p-2.5 rounded-xl bg-slate-900/95 text-white text-[11px] shadow-xl backdrop-blur-xs border border-slate-700 pointer-events-none animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1 border-b border-slate-700 pb-1">
            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span>KOC Thân Thiết / Uy Tín</span>
          </div>
          <div className="text-slate-200">
            Đã hoàn thành <strong className="text-amber-300 font-extrabold">{completedCount}</strong> chiến dịch đúng hạn
          </div>
          <div className="flex items-center justify-between text-[10px] text-blue-300 font-semibold mt-1">
            <span>✓ Trả bài đúng deadline</span>
            <span>⭐ 5.0 Rating</span>
          </div>
          {/* Mũi tên tooltip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
        </div>
      </div>
    );
  };

  // Filtered Applications list
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        app.kocName.toLowerCase().includes(appSearch.toLowerCase()) ||
        app.tiktokHandle.toLowerCase().includes(appSearch.toLowerCase()) ||
        app.phone.includes(appSearch) ||
        app.code.toLowerCase().includes(appSearch.toLowerCase()) ||
        app.campaignName.toLowerCase().includes(appSearch.toLowerCase());

      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'Đã hoàn thành'
          ? app.status === 'Đã hoàn thành' || app.status === 'Đã lên bài'
          : statusFilter === 'Bị từ chối'
          ? app.status === 'Bị từ chối' || app.status === 'Từ chối'
          : app.status === statusFilter;
      const matchCampaign = campaignFilter === 'all' || app.campaignId === campaignFilter;

      return matchSearch && matchStatus && matchCampaign;
    });
  }, [applications, appSearch, statusFilter, campaignFilter]);

  // Action: Update Application Status
  const handleUpdateStatus = (
    appId: string,
    newStatus: ApplicationStatus,
    customShippingCode?: string,
    feedback?: string,
    customShippingStatus?: KOCApplication['shippingStatus']
  ) => {
    const updated = applications.map((app) => {
      if (app.id === appId) {
        let shippingCode = customShippingCode !== undefined ? customShippingCode : app.shippingCode;
        let shippingStatus = customShippingStatus !== undefined ? customShippingStatus : app.shippingStatus;

        if (newStatus === 'Đã duyệt gửi mẫu' && !shippingCode) {
          shippingCode = `GHTK-${Math.floor(10000000 + Math.random() * 90000000)}`;
          if (!customShippingStatus) shippingStatus = 'Đang trung chuyển';
        } else if (newStatus === 'Đang giao') {
          if (!customShippingStatus) shippingStatus = 'Đang trung chuyển';
        } else if (newStatus === 'Đã lên bài' || newStatus === 'Đã hoàn thành') {
          if (!customShippingStatus) shippingStatus = 'Đã phát thành công';
        } else if (newStatus === 'Từ chối' || newStatus === 'Bị từ chối') {
          if (!customShippingStatus) shippingStatus = 'Không gửi mẫu';
        }

        return {
          ...app,
          status: newStatus,
          shippingCode,
          shippingStatus,
          ...(feedback !== undefined ? { adminFeedback: feedback } : {}),
        };
      }
      return app;
    });

    onUpdateApplications(updated);
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp(updated.find((a) => a.id === appId) || null);
    }

    // Đồng bộ trạng thái đơn lên cơ sở dữ liệu Supabase đám mây & Bắn thông báo cho KOC
    const target = updated.find((a) => a.id === appId);
    const prevApp = applications.find((a) => a.id === appId);

    if (target) {
      updateApplicationStatusOnSupabase(appId, {
        status: newStatus,
        shippingCode: target.shippingCode,
        shippingStatus: target.shippingStatus,
        ...(feedback !== undefined ? { adminFeedback: feedback } : {}),
      });

      // Tự động tạo thông báo gửi tới tài khoản KOC
      const isJustDelivered =
        (customShippingStatus === 'Đã phát thành công' || target.shippingStatus === 'Đã phát thành công') &&
        prevApp?.shippingStatus !== 'Đã phát thành công';

      if (prevApp && (prevApp.status !== newStatus || feedback || isJustDelivered)) {
        let notifTitle = '';
        let notifMessage = '';
        let notifType: AppNotification['type'] = 'approval';
        let notifLinkTab: AppNotification['linkTab'] = 'my-campaigns';

        if (isJustDelivered && newStatus !== 'Đã hoàn thành' && newStatus !== 'Đã lên bài') {
          notifTitle = `📦 Quà mẫu đã giao thành công - Bắt đầu làm video!`;
          notifMessage = `Bưu tá đã phát thành công sản phẩm mẫu cho chiến dịch "${target.campaignName}". Bạn hãy mở hộp trải nghiệm sản phẩm và bắt đầu quay video ngay để hoàn thành nộp bài đúng hạn trong 5 - 7 ngày nhé!`;
          notifType = 'delivery';
          notifLinkTab = 'my-campaigns';
        } else if (newStatus === 'Đã duyệt gửi mẫu') {
          notifTitle = `🎉 Hồ sơ được duyệt: ${target.campaignName}`;
          notifMessage = `Chúc mừng ${target.kocName}! Hồ sơ đăng ký (${target.code}) đã được duyệt gửi mẫu.${target.shippingCode ? ` Mã vận đơn: ${target.shippingCode}.` : ''} Hãy chuẩn bị nhận hàng và lên bài đúng hạn nhé!`;
          notifType = 'approval';
          notifLinkTab = 'my-campaigns';
        } else if (newStatus === 'Đang giao') {
          notifTitle = `🚚 Quà mẫu đang được giao: ${target.campaignName}`;
          notifMessage = `Mẫu sản phẩm cho hồ sơ (${target.code}) đang được chuyển phát đến bạn. Mã vận đơn: ${target.shippingCode || 'GHTK'}.`;
          notifType = 'delivery';
          notifLinkTab = 'my-campaigns';
        } else if (newStatus === 'Đã hoàn thành' || newStatus === 'Đã lên bài') {
          notifTitle = `🌟 Đã hoàn thành nghiệm thu: ${target.campaignName}`;
          notifMessage = `Chúc mừng ${target.kocName}! Video review cho chiến dịch "${target.campaignName}" (${target.code}) đã được Quản trị viên duyệt Đã hoàn thành. Thù lao và hoa hồng chiến dịch đã được ghi nhận!`;
          notifType = 'approval';
          notifLinkTab = 'my-campaigns';
        } else if (newStatus === 'Bị từ chối') {
          notifTitle = `⚠️ Video chưa đạt yêu cầu: ${target.campaignName}`;
          notifMessage = feedback
            ? `Phản hồi từ Quản trị viên: "${feedback}". Vui lòng kiểm tra và nộp lại link video đã sửa trong mục "Chiến dịch của tôi".`
            : `Video nộp cho chiến dịch "${target.campaignName}" (${target.code}) chưa đạt yêu cầu brief. Vui lòng kiểm tra và nộp lại.`;
          notifType = 'approval';
          notifLinkTab = 'my-campaigns';
        } else if (newStatus === 'Chờ duyệt video') {
          notifTitle = `⏳ Video đang chờ nghiệm thu: ${target.campaignName}`;
          notifMessage = `Video cho chiến dịch "${target.campaignName}" đang chờ Quản trị viên kiểm tra và duyệt nghiệm thu.`;
          notifType = 'delivery';
          notifLinkTab = 'my-campaigns';
        } else if (newStatus === 'Từ chối') {
          notifTitle = `Kết quả xét duyệt: ${target.campaignName}`;
          notifMessage = feedback
            ? `Phản hồi từ Quản trị viên: "${feedback}".`
            : `Rất tiếc hồ sơ đăng ký (${target.code}) chưa phù hợp với tiêu chí xét duyệt đợt này của Brand. Kocity còn nhiều chiến dịch hấp dẫn khác đang chờ bạn!`;
          notifType = 'approval';
          notifLinkTab = 'marketplace';
        }

        if (notifTitle) {
          const kocNotification: AppNotification = {
            id: `koc-status-notif-${appId}-${Date.now()}`,
            title: notifTitle,
            message: notifMessage,
            time: 'Vừa xong',
            read: false,
            type: notifType,
            targetRole: 'koc',
            targetKocId: target.kocId,
            targetTiktokHandle: target.tiktokHandle,
            targetPhone: target.phone,
            targetEmail: target.email,
            linkTab: notifLinkTab,
          };
          onAddNotification?.(kocNotification);
        }
      }
    }

    onShowToast('Cập nhật thành công!', `Đã chuyển trạng thái hồ sơ sang "${newStatus}"`, 'success');
  };

  const handleQuickApprove = (app: KOCApplication) => {
    handleUpdateStatus(app.id, 'Đã duyệt gửi mẫu');
  };

  const handleQuickReject = (app: KOCApplication) => {
    setRejectModalApp(app);
    setRejectType('application');
    setRejectFeedbackText(app.adminFeedback || '');
  };

  // Image Upload helper functions (File Select, Drag & Drop, Paste)
  // Helper nén ảnh bằng Canvas trước khi tải lên Supabase để đồng bộ cực nhanh
  const compressImageFile = (file: File, callback: (compressedUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          callback(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          callback(dataUrl);
        }
      };
      img.onerror = () => callback(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleProcessImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Tệp không hợp lệ', 'Vui lòng chọn hoặc dán hình ảnh (PNG, JPG, WEBP,...)', 'warning');
      return;
    }
    compressImageFile(file, (optimizedUrl) => {
      setNewCampaignData((prev) => ({ ...prev, productHeroImage: optimizedUrl }));
      onShowToast('Tải ảnh thành công!', file.name || 'Đã thêm ảnh sản phẩm', 'success');
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessImageFile(file);
    }
  };

  const handleImagePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleProcessImageFile(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessImageFile(file);
    }
  };

  // =========================================================================
  // XỬ LÝ QUẢN LÝ MẪU SẢN PHẨM TRONG CHIẾN DỊCH (TẠO MỚI & CHỈNH SỬA)
  // =========================================================================

  // 1. Thêm mẫu mới vào chiến dịch mới
  const handleAddSampleToNewCampaign = () => {
    const nextIdx = newCampaignSamples.length + 1;
    const nextCode = `M${nextIdx < 10 ? '0' : ''}${nextIdx}`;
    setNewCampaignSamples((prev) => [
      ...prev,
      { code: nextCode, name: '', image: '', shortDesc: '' },
    ]);
  };

  // 2. Xóa mẫu khỏi chiến dịch mới (Bắt buộc giữ lại ít nhất 1 mẫu)
  const handleRemoveSampleFromNewCampaign = (index: number) => {
    if (newCampaignSamples.length <= 1) {
      onShowToast('Không thể xóa', 'Chiến dịch phải có ít nhất một mẫu sản phẩm', 'warning');
      return;
    }
    setNewCampaignSamples((prev) => prev.filter((_, i) => i !== index));
  };

  // 3. Cập nhật thông tin mẫu trong chiến dịch mới
  const handleUpdateSampleInNewCampaign = (index: number, updates: Partial<SampleProduct>) => {
    setNewCampaignSamples((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  // 4. Xử lý tải ảnh đại diện cho mẫu trong chiến dịch mới
  const handleNewSampleImageFile = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Tệp không hợp lệ', 'Vui lòng chọn hình ảnh hợp lệ (PNG, JPG, WEBP)', 'warning');
      return;
    }
    compressImageFile(file, (optimizedUrl) => {
      handleUpdateSampleInNewCampaign(index, { image: optimizedUrl });
      onShowToast('Tải ảnh mẫu thành công!', file.name, 'success');
    });
  };

  // 5. Thêm mẫu vào chiến dịch đang chỉnh sửa
  const handleAddSampleToEditCampaign = () => {
    if (!editingCampaign) return;
    const current = editingCampaign.sampleProducts || [];
    const nextIdx = current.length + 1;
    const nextCode = `M${nextIdx < 10 ? '0' : ''}${nextIdx}`;
    const newSample: SampleProduct = { code: nextCode, name: '', image: '', shortDesc: '' };
    setEditingCampaign({
      ...editingCampaign,
      sampleProducts: [...current, newSample],
    });
  };

  // 6. Cập nhật mẫu trong chiến dịch đang chỉnh sửa (Chỉ đổi mẫu đó, không ảnh hưởng mẫu khác)
  const handleUpdateSampleInEditCampaign = (index: number, updates: Partial<SampleProduct>) => {
    if (!editingCampaign) return;
    const current = editingCampaign.sampleProducts ? [...editingCampaign.sampleProducts] : [];
    current[index] = { ...current[index], ...updates };
    setEditingCampaign({
      ...editingCampaign,
      sampleProducts: current,
    });
  };

  // 7. Xử lý tải/đổi ảnh đại diện cho mẫu trong chiến dịch đang chỉnh sửa
  const handleEditSampleImageFile = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Tệp không hợp lệ', 'Vui lòng chọn hình ảnh hợp lệ (PNG, JPG, WEBP)', 'warning');
      return;
    }
    compressImageFile(file, (optimizedUrl) => {
      handleUpdateSampleInEditCampaign(index, { image: optimizedUrl });
      onShowToast('Đã cập nhật ảnh mẫu thành công!', file.name, 'success');
    });
  };

  // 8. Xóa mẫu khỏi chiến dịch đang chỉnh sửa (Bảo toàn lịch sử đăng ký của KOC)
  const handleRemoveSampleFromEditCampaign = (index: number) => {
    if (!editingCampaign) return;
    const current = editingCampaign.sampleProducts || [];
    if (current.length <= 1) {
      onShowToast('Không thể xóa', 'Chiến dịch phải có ít nhất một mẫu sản phẩm. Hãy thêm mẫu thay thế trước khi xóa.', 'warning');
      return;
    }

    const sampleToDelete = current[index];
    // Kiểm tra xem mẫu đã có KOC đăng ký hay chưa
    const registeredCount = applications.filter(
      (a) =>
        a.campaignId === editingCampaign.id &&
        (a.selectedSampleCode === sampleToDelete.code ||
          (a.contentConcept && a.contentConcept.includes(sampleToDelete.code)))
    ).length;

    if (registeredCount > 0) {
      const confirmDeactivate = window.confirm(
        `⚠️ CẢNH BÁO QUAN TRỌNG:\n\n` +
          `Mẫu "${sampleToDelete.name || sampleToDelete.code}" đã có ${registeredCount} KOC đăng ký nhận trong hệ thống!\n\n` +
          `Để bảo toàn 100% lịch sử đơn của KOC, hệ thống khuyến nghị bạn chọn "Ngừng nhận đăng ký" (mẫu sẽ ẩn với KOC mới nhưng bảo toàn lịch sử đơn cũ).\n\n` +
          `• Nhấn OK để NGỪNG NHẬN ĐĂNG KÝ mẫu này (Khuyên dùng, an toàn tuyệt đối).\n` +
          `• Nhấn Cancel để hủy bỏ thao tác.`
      );
      if (confirmDeactivate) {
        handleUpdateSampleInEditCampaign(index, { disabled: true });
        onShowToast('Đã ngừng nhận đăng ký', `Mẫu ${sampleToDelete.name} đã được chuyển sang trạng thái tạm dừng nhận mẫu.`, 'info');
      }
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn mẫu "${sampleToDelete.name || sampleToDelete.code}"?`)) {
      setEditingCampaign({
        ...editingCampaign,
        sampleProducts: current.filter((_, i) => i !== index),
      });
      onShowToast('Đã xóa mẫu', 'Đã xóa mẫu sản phẩm khỏi chiến dịch', 'info');
    }
  };

  // Action: Add New Campaign
  const handleCreateCampaign = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCampaignData.title || !newCampaignData.brandName) {
      onShowToast('Thiếu thông tin', 'Vui lòng nhập tên chiến dịch và tên nhãn hàng', 'warning');
      return;
    }

    // Yêu cầu: Phải có ít nhất một mẫu hợp lệ trước khi cho phép tạo chiến dịch thành công
    if (!newCampaignSamples || newCampaignSamples.length === 0) {
      onShowToast('Thiếu mẫu sản phẩm', 'Chiến dịch phải có ít nhất một mẫu sản phẩm', 'warning');
      return;
    }

    const emptyNameIdx = newCampaignSamples.findIndex((s) => !s.name.trim());
    if (emptyNameIdx !== -1) {
      onShowToast('Thiếu tên mẫu', `Vui lòng nhập tên cho Mẫu số ${emptyNameIdx + 1}`, 'warning');
      return;
    }

    const heroImg =
      newCampaignData.productHeroImage ||
      newCampaignSamples[0]?.image ||
      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=60';

    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      code: `CAMP-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newCampaignData.title,
      brandName: newCampaignData.brandName,
      brandLogo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&auto=format&fit=crop&q=60',
      category: newCampaignData.category,
      daysLeft: newCampaignData.endDate
        ? calculateDaysLeftFromDate(newCampaignData.endDate, Number(newCampaignData.daysLeft) || 15)
        : Number(newCampaignData.daysLeft) || 15,
      endDate: newCampaignData.endDate || getDefaultEndDateString(Number(newCampaignData.daysLeft) || 15),
      startDate: new Date().toISOString().split('T')[0],
      platform: newCampaignData.platform,
      followerRequirement: newCampaignData.followerRequirement,
      totalSpots: Number(newCampaignData.totalSpots) || 50,
      registeredSpots: 0,
      benefits: [
        { label: 'Tặng mẫu 100% 0đ', icon: 'featured_seasonal_and_gifts', type: 'sample' },
        { label: `${newCampaignData.commissionRate} Hoa hồng`, icon: 'percent', type: 'commission' },
        { label: newCampaignData.bookingFee, icon: 'payments', type: 'budget' },
      ],
      description: newCampaignData.description || 'Chiến dịch trải nghiệm và đánh giá sản phẩm dành cho KOC.',
      productHeroImage: heroImg,
      galleryImages: [heroImg],
      uspList: [
        { title: 'Sản phẩm chính hãng 100%', desc: 'Được gửi trực tiếp từ kho nhãn hàng', icon: 'verified' },
        { title: 'Hỗ trợ đẩy trend', desc: 'Có ngân sách ads hỗ trợ video chất lượng tốt', icon: 'trending_up' },
      ],
      storySteps: [],
      hashtags: ['#kochub', '#review', '#tiktokshop'],
      cartBrandName: newCampaignData.brandName,
      timeline: [
        { stepNum: '01', status: 'Đang mở', date: 'Hôm nay', title: 'Đăng ký nhận mẫu', desc: 'Duyệt trong 24h' },
        { stepNum: '02', status: 'Sắp tới', date: '3 ngày sau', title: 'Giao mẫu miễn phí', desc: 'Ship tận nhà' },
        { stepNum: '03', status: 'Sắp tới', date: '7 ngày sau', title: 'Đăng video review', desc: 'Gắn giỏ hàng & hashtag' },
      ],
      sampleProducts: newCampaignSamples,
    };

    onUpdateCampaigns([newCamp, ...campaigns]);
    createCampaignOnSupabase(newCamp).then((ok) => {
      if (ok) {
        onShowToast('Đã lưu lên Đám mây (Cloud)!', `Chiến dịch "${newCamp.title}" đã đồng bộ thành công lên Supabase.`, 'success');
      } else {
        onShowToast('Đã lưu trên máy này!', `Chiến dịch "${newCamp.title}" đã lưu ở trình duyệt, chưa kết nối được tới Cloud.`, 'info');
      }
    });
    setIsAddCampaignModalOpen(false);
    setIsPreviewDraftOpen(false);
    setNewCampaignData({
      title: '',
      brandName: '',
      category: 'Đồ công nghệ & Setup',
      platform: 'TikTok Shop',
      totalSpots: 50,
      followerRequirement: '>1.000 Followers',
      commissionRate: '10%',
      bookingFee: 'Freecast (Mẫu 0đ)',
      daysLeft: 20,
      endDate: getDefaultEndDateString(20),
      description: '',
      productHeroImage: '',
    });
    setNewCampaignSamples([{ code: 'M01', name: '', image: '', shortDesc: '' }]);
  };

  // Action: Open Edit Campaign Modal
  const handleOpenEditCampaign = (camp: Campaign) => {
    const effectiveDays = camp.endDate ? calculateDaysLeftFromDate(camp.endDate, camp.daysLeft) : camp.daysLeft;
    const effectiveEndDate = camp.endDate || getDefaultEndDateString(effectiveDays);
    const effectiveSamples: SampleProduct[] =
      camp.sampleProducts && camp.sampleProducts.length > 0
        ? camp.sampleProducts.map((p, idx) => ({
            ...p,
            code: p.code || `M0${idx + 1}`,
            name: p.name || `Mẫu ${idx + 1}`,
            image: p.image || '',
          }))
        : [
            {
              code: 'M01',
              name: camp.title || 'Mẫu trải nghiệm',
              image: camp.productHeroImage || '',
              shortDesc: '',
            },
          ];

    setEditingCampaign({
      ...camp,
      daysLeft: effectiveDays,
      endDate: effectiveEndDate,
      sampleProducts: effectiveSamples,
    });
    setIsEditCampaignModalOpen(true);
  };

  // Lắng nghe khi có yêu cầu sửa chiến dịch từ bên ngoài (ví dụ MarketplaceView hoặc CampaignDetailView)
  useEffect(() => {
    if (initialEditingCampaign) {
      setActiveAdminTab('campaigns');
      handleOpenEditCampaign(initialEditingCampaign);
      const timer = setTimeout(() => {
        onClearInitialEditingCampaign?.();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [initialEditingCampaign]);

  // Handler đổi ngày kết thúc trong form sửa
  const handleEditEndDateChange = (newDate: string) => {
    if (!editingCampaign) return;
    const newDays = calculateDaysLeftFromDate(newDate, editingCampaign.daysLeft);
    setEditingCampaign({
      ...editingCampaign,
      endDate: newDate,
      daysLeft: newDays,
    });
  };

  // Handler đổi số ngày còn lại trong form sửa
  const handleEditDaysLeftChange = (newDays: number) => {
    if (!editingCampaign) return;
    const newDate = getDefaultEndDateString(newDays);
    setEditingCampaign({
      ...editingCampaign,
      daysLeft: newDays,
      endDate: newDate,
    });
  };

  // Handler đổi ngày kết thúc trong form tạo mới
  const handleCreateEndDateChange = (newDate: string) => {
    const newDays = calculateDaysLeftFromDate(newDate, newCampaignData.daysLeft);
    setNewCampaignData({
      ...newCampaignData,
      endDate: newDate,
      daysLeft: newDays,
    });
  };

  // Handler đổi số ngày còn lại trong form tạo mới
  const handleCreateDaysLeftChange = (newDays: number) => {
    const newDate = getDefaultEndDateString(newDays);
    setNewCampaignData({
      ...newCampaignData,
      daysLeft: newDays,
      endDate: newDate,
    });
  };

  // Action: Save Edited Campaign
  const handleSaveEditCampaign = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingCampaign) return;

    if (!editingCampaign.title.trim() || !editingCampaign.brandName.trim()) {
      onShowToast('Thiếu thông tin', 'Vui lòng nhập tên chiến dịch và tên nhãn hàng', 'warning');
      return;
    }

    // Yêu cầu: Phải có ít nhất một mẫu hợp lệ trước khi cho phép lưu
    const currentSamples = editingCampaign.sampleProducts || [];
    if (currentSamples.length === 0) {
      onShowToast('Thiếu mẫu sản phẩm', 'Chiến dịch phải có ít nhất một mẫu sản phẩm', 'warning');
      return;
    }
    const emptyNameIdx = currentSamples.findIndex((s) => !s.name.trim());
    if (emptyNameIdx !== -1) {
      onShowToast('Thiếu tên mẫu', `Vui lòng nhập tên cho Mẫu số ${emptyNameIdx + 1}`, 'warning');
      return;
    }

    const calculatedDays = editingCampaign.endDate
      ? calculateDaysLeftFromDate(editingCampaign.endDate, editingCampaign.daysLeft)
      : editingCampaign.daysLeft;

    const finalEditedCamp: Campaign = {
      ...editingCampaign,
      daysLeft: calculatedDays,
    };

    const updatedList = campaigns.map((c) =>
      c.id === finalEditedCamp.id ? finalEditedCamp : c
    );
    onUpdateCampaigns(updatedList);

    // Đồng bộ lên Supabase nếu có kết nối
    updateCampaignOnSupabase(finalEditedCamp.id, finalEditedCamp).then((ok) => {
      if (ok) {
        onShowToast(
          'Đã lưu lên Đám mây (Cloud)!',
          `Chiến dịch "${finalEditedCamp.brandName}" đã cập nhật thành công trên Supabase và toàn hệ thống.`,
          'success'
        );
      } else {
        onShowToast(
          'Đã lưu trên máy này!',
          `Chiến dịch "${finalEditedCamp.brandName}" đã lưu tạm ở trình duyệt, chưa kết nối được tới Cloud.`,
          'info'
        );
      }
    });

    setIsEditCampaignModalOpen(false);
    setEditingCampaign(null);
  };

  const handleEditProcessImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Tệp không hợp lệ', 'Vui lòng chọn hình ảnh hợp lệ (JPG, PNG, WEBP,...)', 'warning');
      return;
    }
    compressImageFile(file, (optimizedUrl) => {
      setEditingCampaign((prev) => (prev ? { ...prev, productHeroImage: optimizedUrl } : prev));
      onShowToast('Tải ảnh thành công!', 'Ảnh mới đã sẵn sàng cho chiến dịch', 'success');
    });
  };

  const handleEditImagePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleEditProcessImageFile(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleEditProcessGalleryImages = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      onShowToast('Tệp không hợp lệ', 'Vui lòng chọn hình ảnh hợp lệ', 'warning');
      return;
    }
    let count = 0;
    const newUrls: string[] = [];
    fileArray.forEach((file) => {
      compressImageFile(file, (optimizedUrl) => {
        newUrls.push(optimizedUrl);
        count++;
        if (count === fileArray.length) {
          setEditingCampaign((prev) => {
            if (!prev) return prev;
            const current = Array.isArray(prev.galleryImages) ? prev.galleryImages : [];
            return {
              ...prev,
              galleryImages: [...current, ...newUrls],
            };
          });
          onShowToast('Tải ảnh thành công!', `Đã thêm ${newUrls.length} ảnh vào album chi tiết.`, 'success');
        }
      });
    });
  };

  const handleDeleteGalleryImageInEdit = (idx: number) => {
    setEditingCampaign((prev) => {
      if (!prev) return prev;
      const current = Array.isArray(prev.galleryImages) ? prev.galleryImages : [];
      return {
        ...prev,
        galleryImages: current.filter((_, i) => i !== idx),
      };
    });
  };

  const handleAddGalleryUrlInEdit = () => {
    const url = editGalleryUrlInput.trim();
    if (!url) return;
    setEditingCampaign((prev) => {
      if (!prev) return prev;
      const current = Array.isArray(prev.galleryImages) ? prev.galleryImages : [];
      return {
        ...prev,
        galleryImages: [...current, url],
      };
    });
    setEditGalleryUrlInput('');
    onShowToast('Thêm ảnh thành công!', 'Đã thêm ảnh vào album chi tiết.', 'success');
  };

  // Action: Export to CSV
  const handleExportCSV = () => {
    if (applications.length === 0) {
      onShowToast('Không có dữ liệu', 'Chưa có đơn đăng ký nào để xuất file', 'warning');
      return;
    }

    const headers = ['Mã đơn', 'Tên KOC', 'TikTok', 'Link kênh TikTok', 'Followers', 'SĐT', 'Địa chỉ nhận hàng', 'Chiến dịch', 'Trạng thái', 'Mã vận đơn', 'Link Video'];
    const rows = applications.map((a) => [
      `"${a.code}"`,
      `"${a.kocName}"`,
      `"${a.tiktokHandle}"`,
      `"${a.channelLink || (a.tiktokHandle ? (a.tiktokHandle.startsWith('http') ? a.tiktokHandle : `https://www.tiktok.com/${a.tiktokHandle.startsWith('@') ? a.tiktokHandle : '@' + a.tiktokHandle}`) : '')}"`,
      `"${a.followers}"`,
      `"${a.phone}"`,
      `"${a.address.replace(/"/g, '""')}"`,
      `"${a.campaignName.replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${a.shippingCode}"`,
      `"${a.videoLink || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_koc_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast('Đã xuất file CSV thành công!', 'File sẵn sàng để gửi cho đơn vị vận chuyển hoặc lưu trữ.', 'success');
  };

  // Status badge styling helper - Tinh gọn dạng Pill chuẩn Modern SaaS
  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Chờ duyệt':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Chờ duyệt
          </span>
        );
      case 'Đã duyệt gửi mẫu':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 shadow-2xs">
            <span className="material-symbols-outlined text-[13px]">local_shipping</span>
            Đã duyệt gửi mẫu
          </span>
        );
      case 'Đang giao':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 shadow-2xs">
            <span className="material-symbols-outlined text-[13px]">departure_board</span>
            Đang giao
          </span>
        );
      case 'Chờ duyệt video':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping"></span>
            Chờ duyệt video
          </span>
        );
      case 'Đã lên bài':
      case 'Đã hoàn thành':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 shadow-2xs">
            <span className="material-symbols-outlined text-[13px]">check_circle</span>
            Đã hoàn thành
          </span>
        );
      case 'Bị từ chối':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 shadow-2xs">
            <span className="material-symbols-outlined text-[13px]">cancel</span>
            Bị từ chối
          </span>
        );
      case 'Từ chối':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            <span className="material-symbols-outlined text-[13px]">cancel</span>
            Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  // Breadcrumb title helper (Không chứa số thứ tự)
  const getTabTitle = () => {
    switch (activeAdminTab) {
      case 'dashboard':
        return 'Tổng Quan & Báo Cáo';
      case 'applications':
        return `Xét Duyệt Hồ Sơ KOC (${statusFilter === 'all' ? 'Tất cả' : statusFilter})`;
      case 'campaigns':
        return 'Quản Lý Chiến Dịch';
      case 'content':
        return 'Nghiệm Thu Video';
      case 'koc-crm':
        return 'Danh Bạ KOC & Đối Tác';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row">
      {/* Mobile Top Header with Toggle (Nền trắng, viền xanh dương nhẹ) */}
      <div className="md:hidden flex items-center justify-between bg-white text-slate-900 px-4 py-3 border-b border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
          </div>
          <span className="font-bold text-sm text-slate-900">Quản Trị Kocity</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1.5 text-xs font-semibold text-blue-700 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isMobileSidebarOpen ? 'close' : 'menu'}
            </span>
            <span>Menu quản lý</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          THANH MENU QUẢN LÝ (SIDEBAR BÊN TRÁI - NỀN TRẮNG, ACTIVE XANH DƯƠNG, BỎ SỐ 1 2 3 4 5)
          ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white text-slate-700 flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 border-r border-slate-200 shadow-md md:shadow-none ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm font-bold">
                <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">Kocity Admin</h2>
                  <span className="rounded bg-blue-50 px-1.5 py-0.2 text-[10px] font-bold text-blue-700 border border-blue-200">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Bảng điều khiển trung tâm</p>
              </div>
            </div>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Quick Stat Pill in Sidebar */}
          <div className="mx-4 my-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
              <span className="text-xs font-semibold text-blue-900">Đơn chờ duyệt</span>
            </div>
            <span className="rounded-full bg-blue-600 text-white text-xs font-bold px-2 py-0.5 shadow-xs">
              {metrics.pendingApps} hồ sơ
            </span>
          </div>

          {/* Vertical Menu Navigation List (Không có số thứ tự 1, 2, 3, 4, 5) */}
          <nav className="p-3 space-y-1 text-sm font-medium">
            {/* MỤC: TỔNG QUAN & BÁO CÁO */}
            <button
              onClick={() => {
                setActiveAdminTab('dashboard');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeAdminTab === 'dashboard'
                  ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                <span>Tổng Quan & Báo Cáo</span>
              </div>
            </button>

            {/* MỤC: DUYỆT HỒ SƠ KOC */}
            <div className="pt-1">
              <div
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeAdminTab === 'applications'
                    ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
                onClick={() => {
                  setActiveAdminTab('applications');
                  setIsAppsSubmenuOpen(!isAppsSubmenuOpen);
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                  <span>Duyệt Hồ Sơ KOC</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {metrics.pendingApps > 0 && (
                    <span
                      className={`rounded-full text-[10px] font-extrabold px-1.5 py-0.2 ${
                        activeAdminTab === 'applications'
                          ? 'bg-white text-blue-700'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {metrics.pendingApps}
                    </span>
                  )}
                  <span
                    className={`material-symbols-outlined text-[18px] transition-transform ${
                      isAppsSubmenuOpen ? 'rotate-180' : ''
                    } ${activeAdminTab === 'applications' ? 'text-white' : 'text-slate-400'}`}
                  >
                    expand_more
                  </span>
                </div>
              </div>

              {/* Accordion Submenu: Bung ra các trạng thái khi bấm vào mục Duyệt hồ sơ */}
              {isAppsSubmenuOpen && (
                <div className="mt-1 ml-4 pl-3 border-l-2 border-blue-100 space-y-1 py-1 animate-in fade-in duration-200">
                  <button
                    onClick={() => {
                      setActiveAdminTab('applications');
                      setStatusFilter('all');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeAdminTab === 'applications' && statusFilter === 'all'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Tất cả hồ sơ</span>
                    <span className="text-[11px] text-slate-400 font-mono">{metrics.totalApps}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveAdminTab('applications');
                      setStatusFilter('Chờ duyệt');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeAdminTab === 'applications' && statusFilter === 'Chờ duyệt'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                      Chờ duyệt mẫu
                    </span>
                    <span className="rounded bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2">
                      {metrics.pendingApps}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveAdminTab('applications');
                      setStatusFilter('Đã duyệt gửi mẫu');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeAdminTab === 'applications' && statusFilter === 'Đã duyệt gửi mẫu'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Đã duyệt gửi mẫu</span>
                    <span className="text-[11px] text-slate-400 font-mono">{metrics.approvedApps}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveAdminTab('applications');
                      setStatusFilter('Đang giao');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeAdminTab === 'applications' && statusFilter === 'Đang giao'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Đang giao mẫu</span>
                    <span className="text-[11px] text-slate-400 font-mono">{metrics.shippingApps}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveAdminTab('applications');
                      setStatusFilter('Chờ duyệt video');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeAdminTab === 'applications' && statusFilter === 'Chờ duyệt video'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                      Chờ duyệt video
                    </span>
                    <span className="rounded bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2">
                      {metrics.pendingVideoApps}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveAdminTab('applications');
                      setStatusFilter('Đã hoàn thành');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeAdminTab === 'applications' && (statusFilter === 'Đã hoàn thành' || statusFilter === 'Đã lên bài')
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Đã hoàn thành</span>
                    <span className="text-[11px] text-slate-400 font-mono">{metrics.completedApps}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveAdminTab('applications');
                      setStatusFilter('Bị từ chối');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeAdminTab === 'applications' && (statusFilter === 'Bị từ chối' || statusFilter === 'Từ chối')
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Bị từ chối</span>
                    <span className="text-[11px] text-slate-400 font-mono">{metrics.rejectedApps}</span>
                  </button>
                </div>
              )}
            </div>

            {/* MỤC: QUẢN LÝ CHIẾN DỊCH */}
            <div className="pt-1">
              <div
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeAdminTab === 'campaigns'
                    ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
                onClick={() => {
                  setActiveAdminTab('campaigns');
                  setIsCampaignsSubmenuOpen(!isCampaignsSubmenuOpen);
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">campaign</span>
                  <span>Quản Lý Chiến Dịch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded text-[10px] font-bold px-1.5 py-0.2 ${
                      activeAdminTab === 'campaigns'
                        ? 'bg-white text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {metrics.totalActiveCampaigns}
                  </span>
                  <span
                    className={`material-symbols-outlined text-[18px] transition-transform ${
                      isCampaignsSubmenuOpen ? 'rotate-180' : ''
                    } ${activeAdminTab === 'campaigns' ? 'text-white' : 'text-slate-400'}`}
                  >
                    expand_more
                  </span>
                </div>
              </div>

              {isCampaignsSubmenuOpen && (
                <div className="mt-1 ml-4 pl-3 border-l-2 border-blue-100 space-y-1 py-1">
                  <button
                    onClick={() => {
                      setActiveAdminTab('campaigns');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeAdminTab === 'campaigns'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Danh sách chiến dịch</span>
                    <span className="text-[11px] text-slate-400 font-mono">{metrics.totalActiveCampaigns}</span>
                  </button>
                </div>
              )}
            </div>

            {/* MỤC: NGHIỆM THU VIDEO */}
            <button
              onClick={() => {
                setActiveAdminTab('content');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeAdminTab === 'content'
                  ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">smart_display</span>
                <span>Nghiệm Thu Video</span>
              </div>
              <span
                className={`rounded-full text-[10px] font-bold px-2 py-0.5 ${
                  activeAdminTab === 'content' ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {metrics.completedApps}
              </span>
            </button>

            {/* MỤC: DANH BẠ KOC & ĐỐI TÁC */}
            <button
              onClick={() => {
                setActiveAdminTab('koc-crm');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeAdminTab === 'koc-crm'
                  ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">contact_phone</span>
                <span>Danh Bạ KOC & Đối Tác</span>
              </div>
              <span
                className={`rounded text-[10px] font-bold px-1.5 py-0.2 ${
                  activeAdminTab === 'koc-crm' ? 'bg-white text-blue-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {metrics.uniqueKOCs}
              </span>
            </button>

            {/* MỤC: CẨM NANG & BÀI VIẾT SEO */}
            <button
              onClick={() => {
                setActiveAdminTab('blog');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeAdminTab === 'blog'
                  ? 'bg-purple-600 text-white font-bold shadow-sm shadow-purple-500/20'
                  : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">menu_book</span>
                <span>Cẩm Nang & Bài Viết SEO</span>
              </div>
              <span
                className={`rounded text-[10px] font-bold px-2 py-0.5 ${
                  activeAdminTab === 'blog' ? 'bg-white text-purple-700' : 'bg-purple-100 text-purple-700'
                }`}
              >
                5 bài
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer: Xuất Excel & Quay lại trang KOC */}
        <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/50">
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-600">download</span>
            <span>Xuất Danh Sách Excel (.CSV)</span>
          </button>

          <button
            onClick={onBackToMarketplace}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Quay lại trang KOC</span>
          </button>

          <button
            onClick={() => {
              sessionStorage.removeItem('kocity_admin_auth_token');
              window.location.reload();
            }}
            title="Đăng xuất và khóa bảo vệ quyền quản trị"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <span>Khóa bảo vệ Admin</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
        ></div>
      )}

      {/* =========================================================================
          RIGHT MAIN WORKSPACE: BUNG RA NỘI DUNG CHI TIẾT
          ========================================================================= */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Top Control Bar in Workspace */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
              <span>Hệ thống quản trị</span>
              <span>/</span>
              <span className="text-blue-600 font-bold">{getTabTitle()}</span>
              {isSupabaseConfigured() && (
                <span
                  title="Đã kết nối cơ sở dữ liệu Supabase đám mây"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700 ml-1 shadow-2xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Supabase Đã Kết Nối
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{getTabTitle()}</h2>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Menu Xổ Xuống Xuất Dữ Liệu (Gọn gàng & Sang trọng) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                title="Bấm để chọn xuất Báo cáo A4 hoặc tải file Excel"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-500">file_download</span>
                <span>Xuất dữ liệu</span>
                <span
                  className="material-symbols-outlined text-[16px] text-slate-400 transition-transform duration-200"
                  style={{ transform: isExportDropdownOpen ? 'rotate(180deg)' : 'none' }}
                >
                  expand_more
                </span>
              </button>

              {isExportDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsExportDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 z-30 w-56 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportDropdownOpen(false);
                        setIsMonthlyReportModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px]">summarize</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Báo cáo chuẩn A4</p>
                        <p className="text-[10px] text-slate-400">Tóm tắt KPI nộp BGĐ</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsExportDropdownOpen(false);
                        handleExportCSV();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left mt-0.5"
                    >
                      <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px]">table_chart</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Xuất file Excel (.CSV)</p>
                        <p className="text-[10px] text-slate-400">Danh sách KOC & Vận đơn</p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Nút "+ Thêm chiến dịch" Nổi bật Duy nhất */}
            <button
              onClick={() => setIsAddCampaignModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25 transition-all cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Thêm chiến dịch</span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
            NỘI DUNG CHI TIẾT 1: TỔNG QUAN & BÁO CÁO (MODERN SAAS DASHBOARD)
            --------------------------------------------------------------------- */}
        {activeAdminTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Banner Tiêu Đề Báo Cáo Chuẩn SaaS */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white shadow-xs border border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 backdrop-blur-xs">
                  <span className="material-symbols-outlined text-2xl">analytics</span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold flex items-center gap-2">
                    Báo Cáo Hiệu Quả Tiếp Thị & Vận Hành KOC
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Dữ liệu thực 100%
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Đo lường phễu chuyển đổi toàn trình, nhịp độ ứng tuyển theo ngày và kiểm soát rủi ro thất thoát mẫu
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-slate-100 backdrop-blur-xs">
                  <span className="material-symbols-outlined text-[16px] text-indigo-300">calendar_month</span>
                  <span>{reportPeriodLabel}</span>
                  <span className="text-indigo-300 font-extrabold ml-1">({periodApplications.length} đơn KOC)</span>
                </span>
              </div>
            </div>

            {/* BỘ LỌC KHOẢNG THỜI GIAN: LỌC ÊM DỊU REAL-TIME (KHÔNG SPAM TOAST) */}
            <div className="rounded-2xl bg-white p-3.5 sm:p-4 shadow-xs border border-slate-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Cụm input chọn ngày Từ ngày -> Đến ngày */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mr-1">
                  <span className="material-symbols-outlined text-indigo-600 text-[18px]">tune</span>
                  <span>Lọc theo ngày:</span>
                </div>

                {/* Từ ngày */}
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 px-2.5 py-1.5 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <span className="material-symbols-outlined text-slate-400 text-[16px]">calendar_today</span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Từ:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-transparent outline-none focus:outline-none cursor-pointer"
                    title="Bấm để chọn ngày bắt đầu"
                  />
                </div>

                <span className="text-slate-300 font-bold hidden sm:inline">→</span>

                {/* Đến ngày */}
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 px-2.5 py-1.5 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <span className="material-symbols-outlined text-slate-400 text-[16px]">event</span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Đến:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-transparent outline-none focus:outline-none cursor-pointer"
                    title="Bấm để chọn ngày kết thúc"
                  />
                </div>

                {/* Nút Xóa lọc ngày (khi có chọn khoảng ngày) */}
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      onShowToast('Thời gian', 'Đã xóa lọc ngày, hiển thị toàn bộ thời gian.', 'info');
                    }}
                    className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
                    title="Bỏ lọc khoảng ngày để xem tất cả"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                    <span>Xóa lọc</span>
                  </button>
                )}
              </div>

              {/* Phím tắt chọn nhanh thuận tiện */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-400 mr-1 hidden sm:inline">Chọn nhanh:</span>
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !startDate && !endDate
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const dStr = today.toISOString().split('T')[0];
                    setStartDate(dStr);
                    setEndDate(dStr);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    startDate && startDate === endDate && startDate === new Date().toISOString().split('T')[0]
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const past7 = new Date();
                    past7.setDate(today.getDate() - 7);
                    setStartDate(past7.toISOString().split('T')[0]);
                    setEndDate(today.toISOString().split('T')[0]);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  7 ngày qua
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const past30 = new Date();
                    past30.setDate(today.getDate() - 30);
                    setStartDate(past30.toISOString().split('T')[0]);
                    setEndDate(today.toISOString().split('T')[0]);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  30 ngày qua
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const y = today.getFullYear();
                    const m = String(today.getMonth() + 1).padStart(2, '0');
                    const lastDay = new Date(y, today.getMonth() + 1, 0).getDate();
                    setStartDate(`${y}-${m}-01`);
                    setEndDate(`${y}-${m}-${lastDay}`);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all cursor-pointer"
                >
                  Tháng này
                </button>
              </div>
            </div>

            {/* 4 THẺ KPI TĂNG TRƯỞNG & RỦI RO (CHUẨN MINIMALIST SAAS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: KOC Mới Đăng Ký */}
              <div
                onClick={() => {
                  setStatusFilter('all');
                  setActiveAdminTab('applications');
                }}
                className="group rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">KOC Mới Đăng Ký</span>
                  <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-indigo-600 transition-colors">
                    group_add
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2.5">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">{metrics.totalApps}</span>
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    <span className="material-symbols-outlined text-[13px]">arrow_upward</span> +18.4%
                  </span>
                </div>
                <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                  <span>{metrics.uniqueKOCs} Creator · Tái tham gia: <strong className="text-slate-700">{metrics.retentionRate}%</strong></span>
                  <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all">
                    arrow_forward
                  </span>
                </div>
              </div>

              {/* Card 2: Tỷ Lệ Hoàn Thành Bài */}
              <div
                onClick={() => setActiveAdminTab('content')}
                className="group rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tỷ Lệ Hoàn Thành Bài</span>
                  <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-emerald-600 transition-colors">
                    verified
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2.5">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {metrics.totalApps > 0 ? Math.round((metrics.completedApps / metrics.totalApps) * 100) : 0}%
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    ({metrics.completedApps}/{metrics.totalApps} video duyệt)
                  </span>
                </div>
                <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                  <span>Rớt hồ sơ: <strong className="text-slate-700">{metrics.dropOffRate}%</strong></span>
                  <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all">
                    arrow_forward
                  </span>
                </div>
              </div>

              {/* Card 3: Cảnh Báo Chậm Bài */}
              <div
                onClick={() => setDashboardSubTab('overdue')}
                className={`group rounded-2xl bg-white p-5 border shadow-2xs transition-all cursor-pointer flex flex-col justify-between ${
                  metrics.overdueAppsList.length > 0
                    ? 'border-amber-200 hover:border-amber-400 hover:shadow-sm'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cảnh Báo Chậm Bài</span>
                  <span className={`material-symbols-outlined text-[20px] ${
                    metrics.overdueAppsList.length > 0 ? 'text-amber-500' : 'text-slate-400'
                  }`}>
                    notifications_active
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2.5">
                  <span className={`text-3xl font-black tracking-tight ${
                    metrics.overdueAppsList.length > 0 ? 'text-amber-600' : 'text-slate-900'
                  }`}>
                    {metrics.overdueAppsList.length}
                  </span>
                  <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
                    metrics.overdueAppsList.length > 0
                      ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {metrics.overdueAppsList.length > 0 ? 'Cần nhắc nộp link' : 'Đúng hạn'}
                  </span>
                </div>
                <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                  <span>Đã nhận mẫu &gt; 7 ngày</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all">
                    arrow_forward
                  </span>
                </div>
              </div>

              {/* Card 4: Lượt Tiếp Cận (Reach) & CPV */}
              <div
                onClick={() => setIsMonthlyReportModalOpen(true)}
                className="group rounded-2xl bg-white p-5 border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lượt Tiếp Cận (Reach)</span>
                  <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-indigo-600 transition-colors">
                    visibility
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2.5">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {(metrics.estimatedViews / 1000).toLocaleString('vi-VN')}K
                  </span>
                  <span className="text-xs font-semibold text-slate-500">views ước tính</span>
                </div>
                <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                  <span>Ngân sách: <strong className="text-slate-700">{(metrics.totalSampleBudget / 1000000).toFixed(1)}Tr</strong> (~{metrics.costPerView}đ/view)</span>
                  <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all">
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>

            {/* =========================================================================
                BIỂU ĐỒ ĐỐI CHIẾU XU HƯỚNG KOC CHUẨN GOOGLE ANALYTICS 4 & META INSIGHTS
                ========================================================================= */}
            <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-xs border border-slate-200/80">
              {/* Header: Title + Timeframe Switcher */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50/50">
                    <span className="material-symbols-outlined text-[22px]">ssid_chart</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">
                        Nhịp Độ & Xu Hướng Tăng Trưởng KOC
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        GA4 Insights Live
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Đối chiếu chu kỳ thời gian thực · Đường nét liền (Kỳ này) vs Đường nét đứt (Kỳ trước)
                    </p>
                  </div>
                </div>

                {/* Bộ Chọn 7 Ngày / 28 Ngày */}
                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                  <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/70 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setGaTimeframe('7d');
                        setGaHoverIndex(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        gaTimeframe === '7d'
                          ? 'bg-white text-indigo-700 font-extrabold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      7 ngày qua
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGaTimeframe('28d');
                        setGaHoverIndex(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        gaTimeframe === '28d'
                          ? 'bg-white text-indigo-700 font-extrabold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      28 ngày qua
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Metric Scorecard Tabs (GA4 Style) */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['applications', 'approved', 'completed'] as const).map((mKey) => {
                  const mData = gaChartData.metricsSummary[mKey];
                  const isActive = gaActiveMetric === mKey;
                  return (
                    <button
                      key={mKey}
                      type="button"
                      onClick={() => setGaActiveMetric(mKey)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500/20'
                          : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-300'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600" />
                      )}
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-bold flex items-center gap-1.5 text-slate-700">
                          <span className={`material-symbols-outlined text-[16px] ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {mData.icon}
                          </span>
                          {mData.title}
                        </span>
                        <span
                          className={`inline-flex items-center gap-0.5 text-[11px] font-extrabold px-1.5 py-0.5 rounded-md ${
                            mData.growth.isUp
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                              : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {mData.growth.isUp ? 'trending_up' : 'trending_down'}
                          </span>
                          {mData.growth.isUp ? '+' : '-'}{mData.growth.percent}%
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                          {mData.currTotal}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          vs kỳ trước: <span className="font-semibold text-slate-600">{mData.prevTotal}</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend & Guide note */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-0.5 bg-indigo-600 rounded-full inline-block" />
                    <span className="font-semibold text-slate-700">
                      Kỳ này ({gaTimeframe === '7d' ? '7 ngày qua' : '28 ngày qua'})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 border-t-2 border-dashed border-slate-400 inline-block" />
                    <span className="font-semibold text-slate-500">
                      Kỳ trước đối chiếu ({gaTimeframe === '7d' ? '7 ngày trước đó' : '28 ngày trước đó'})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="material-symbols-outlined text-[14px] text-indigo-500">touch_app</span>
                  <span>Rê chuột trên biểu đồ để xem chi tiết đối chiếu</span>
                </div>
              </div>

              {/* Chart SVG Canvas with Vertical Guideline & Tooltip */}
              <div className="relative mt-3 select-none">
                <svg
                  viewBox={`0 0 ${gaChartData.svgWidth} ${gaChartData.svgHeight}`}
                  className="w-full h-auto overflow-visible cursor-crosshair"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const pct = Math.max(0, Math.min(1, mouseX / rect.width));
                    const targetSvgX = pct * gaChartData.svgWidth;
                    let closest = 0;
                    let minDiff = Infinity;
                    gaChartData.currCoords.forEach((pt, idx) => {
                      const diff = Math.abs(pt.x - targetSvgX);
                      if (diff < minDiff) {
                        minDiff = diff;
                        closest = idx;
                      }
                    });
                    setGaHoverIndex(closest);
                  }}
                  onMouseLeave={() => setGaHoverIndex(null)}
                >
                  <defs>
                    <linearGradient id="gaAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
                      <stop offset="60%" stopColor="#818cf8" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                    </linearGradient>
                    <filter id="gaGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.35" />
                    </filter>
                  </defs>

                  {/* Invisible Hit-box backdrop for responsive hover tracking */}
                  <rect
                    x="0"
                    y="0"
                    width={gaChartData.svgWidth}
                    height={gaChartData.svgHeight}
                    fill="transparent"
                    style={{ pointerEvents: 'all' }}
                  />

                  {/* Horizontal Gridlines & Y-Axis Labels */}
                  {gaChartData.yTicks.map((tick, i) => (
                    <g key={i}>
                      <line
                        x1={gaChartData.paddingLeft}
                        y1={tick.y}
                        x2={gaChartData.svgWidth - gaChartData.paddingRight}
                        y2={tick.y}
                        stroke="#e2e8f0"
                        strokeDasharray={i === 0 ? 'none' : '3 3'}
                        strokeWidth="1"
                      />
                      <text
                        x={gaChartData.paddingLeft - 8}
                        y={tick.y + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="#94a3b8"
                        fontFamily="ui-monospace, monospace"
                      >
                        {tick.val}
                      </text>
                    </g>
                  ))}

                  {/* Area fill under Current curve */}
                  {gaChartData.currAreaPath && (
                    <path d={gaChartData.currAreaPath} fill="url(#gaAreaGrad)" />
                  )}

                  {/* Previous Period: Dashed Gray Line */}
                  {gaChartData.prevLinePath && (
                    <path
                      d={gaChartData.prevLinePath}
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeDasharray="5 4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Current Period: Solid Indigo Line */}
                  {gaChartData.currLinePath && (
                    <path
                      d={gaChartData.currLinePath}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#gaGlow)"
                    />
                  )}

                  {/* X-Axis Date Labels */}
                  {gaChartData.points.map((p, idx) => {
                    const coord = gaChartData.currCoords[idx];
                    // On 28d timeframe, avoid label crowding: show every 4 days + last day
                    const shouldShowLabel =
                      gaTimeframe === '7d' ||
                      idx === 0 ||
                      idx === gaChartData.points.length - 1 ||
                      idx % 4 === 0;

                    if (!shouldShowLabel) return null;

                    return (
                      <g key={idx} transform={`translate(${coord.x}, ${gaChartData.bottomY + 16})`}>
                        <text
                          textAnchor="middle"
                          fontSize={gaTimeframe === '7d' ? '11' : '10'}
                          fontWeight={p.isToday ? '700' : '500'}
                          fill={p.isToday ? '#4f46e5' : '#64748b'}
                        >
                          {gaTimeframe === '7d' ? (p.isToday ? 'Hôm nay' : p.currShortWeekday) : p.currShortDate}
                        </text>
                        {gaTimeframe === '7d' && (
                          <text
                            y="12"
                            textAnchor="middle"
                            fontSize="9"
                            fill="#94a3b8"
                            fontFamily="ui-monospace, monospace"
                          >
                            {p.currShortDate}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Hover Guideline & Crosshair Elements */}
                  {gaHoverIndex !== null && gaChartData.currCoords[gaHoverIndex] && (
                    <g>
                      {/* Vertical Crosshair Line (Thước Gióng) */}
                      <line
                        x1={gaChartData.currCoords[gaHoverIndex].x}
                        y1={gaChartData.paddingTop}
                        x2={gaChartData.currCoords[gaHoverIndex].x}
                        y2={gaChartData.bottomY}
                        stroke="#6366f1"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        opacity="0.8"
                      />

                      {/* Point on Previous Curve (Gray) */}
                      <circle
                        cx={gaChartData.prevCoords[gaHoverIndex].x}
                        cy={gaChartData.prevCoords[gaHoverIndex].y}
                        r="5"
                        fill="#ffffff"
                        stroke="#94a3b8"
                        strokeWidth="2.5"
                      />

                      {/* Point on Current Curve (Indigo Glowing) */}
                      <circle
                        cx={gaChartData.currCoords[gaHoverIndex].x}
                        cy={gaChartData.currCoords[gaHoverIndex].y}
                        r="7"
                        fill="#ffffff"
                        stroke="#6366f1"
                        strokeWidth="3.5"
                        filter="url(#gaGlow)"
                      />
                    </g>
                  )}

                  {/* Default pulse on latest day when not hovering */}
                  {gaHoverIndex === null && gaChartData.currCoords.length > 0 && (() => {
                    const lastPt = gaChartData.currCoords[gaChartData.currCoords.length - 1];
                    return (
                      <g>
                        <circle
                          cx={lastPt.x}
                          cy={lastPt.y}
                          r="5"
                          fill="#6366f1"
                          stroke="#ffffff"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx={lastPt.x}
                          cy={lastPt.y}
                          r="9"
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="1.5"
                          opacity="0.4"
                        />
                      </g>
                    );
                  })()}

                  {/* Individual Date Column Hit-Boxes for Guaranteed Hover Detection */}
                  {gaChartData.currCoords.map((coord, idx) => {
                    const colWidth = gaChartData.plotWidth / Math.max(gaChartData.points.length - 1, 1);
                    return (
                      <rect
                        key={`hit-${idx}`}
                        x={coord.x - colWidth / 2}
                        y={gaChartData.paddingTop}
                        width={colWidth}
                        height={gaChartData.plotHeight + 30}
                        fill="transparent"
                        style={{ pointerEvents: 'all' }}
                        className="cursor-crosshair"
                        onMouseEnter={() => setGaHoverIndex(idx)}
                      />
                    );
                  })}
                </svg>

                {/* Floating Comparison Tooltip Card */}
                {gaHoverIndex !== null && gaChartData.currCoords[gaHoverIndex] && (() => {
                  const p = gaChartData.points[gaHoverIndex];
                  const currCoord = gaChartData.currCoords[gaHoverIndex];
                  const prevCoord = gaChartData.prevCoords[gaHoverIndex];
                  const diff = currCoord.val - prevCoord.val;
                  const pct = prevCoord.val === 0 ? (currCoord.val > 0 ? 100 : 0) : Math.round((diff / prevCoord.val) * 100);
                  const isRightHalf = gaHoverIndex > gaChartData.points.length / 2;
                  const leftPercent = (currCoord.x / gaChartData.svgWidth) * 100;

                  return (
                    <div
                      className="pointer-events-none absolute z-30 transition-all duration-75 ease-out"
                      style={{
                        left: `${leftPercent}%`,
                        top: '10px',
                        transform: isRightHalf ? 'translateX(calc(-100% - 14px))' : 'translateX(14px)',
                      }}
                    >
                      <div className="w-64 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md p-3.5 shadow-xl ring-1 ring-black/5 text-xs">
                        {/* Tooltip Header Date */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                          <div>
                            <span className="font-extrabold text-slate-900 block">
                              {p.currWeekday}, {p.currFullDate}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Đối chiếu: {p.prevWeekday}, {p.prevFullDate}
                            </span>
                          </div>
                          {p.isToday && (
                            <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[9px] font-black text-indigo-700">
                              Hôm nay
                            </span>
                          )}
                        </div>

                        {/* Metric Row 1: Current Period */}
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block shadow-xs" />
                            <span className="text-slate-600 font-medium">Kỳ này:</span>
                          </div>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {currCoord.val} <span className="text-[11px] font-normal text-slate-500">đơn</span>
                          </span>
                        </div>

                        {/* Metric Row 2: Comparison Period */}
                        <div className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400 inline-block" />
                            <span className="text-slate-500">Kỳ trước:</span>
                          </div>
                          <span className="font-bold text-slate-600">
                            {prevCoord.val} <span className="text-[11px] font-normal text-slate-400">đơn</span>
                          </span>
                        </div>

                        {/* Metric Row 3: Growth & Delta */}
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">Tăng trưởng:</span>
                          <span
                            className={`inline-flex items-center gap-0.5 font-black text-xs px-2 py-0.5 rounded-md ${
                              diff > 0
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                : diff < 0
                                ? 'text-rose-700 bg-rose-50 border border-rose-200'
                                : 'text-slate-600 bg-slate-100'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {diff > 0 ? 'arrow_upward' : diff < 0 ? 'arrow_downward' : 'remove'}
                            </span>
                            {diff > 0 ? `+${diff}` : diff} ({diff > 0 ? `+${pct}%` : `${pct}%`})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Bottom Quick KPI Summary Pill */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Chỉ số đang xem:</span>
                  <strong className="text-slate-800 font-extrabold">
                    {gaChartData.activeSummary.title}
                  </strong>
                  <span className="text-slate-300">•</span>
                  <span>Tổng kỳ này: <strong className="text-indigo-600 font-black">{gaChartData.activeSummary.currTotal}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Tổng kỳ trước: <strong className="text-slate-700 font-bold">{gaChartData.activeSummary.prevTotal}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Trung bình ngày:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {(gaChartData.activeSummary.currTotal / gaChartData.daysCount).toFixed(1)} / ngày
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400">Kỳ trước:</span>
                  <span className="font-mono text-slate-500">
                    {(gaChartData.activeSummary.prevTotal / gaChartData.daysCount).toFixed(1)} / ngày
                  </span>
                </div>
              </div>
            </div>

            {/* =========================================================================
                PHỄU CHUYỂN ĐỔI KOC TOÀN TRÌNH & BẢNG SỨC KHỎE VẬN HÀNH (SLA)
                ========================================================================= */}
            <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200/80">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600 text-[22px]">filter_alt</span>
                    Phễu Chuyển Đổi KOC Toàn Trình & Tốc Độ Vận Hành (SLA)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Theo dõi tỷ lệ lọt phễu từng giai đoạn và đo lường chu kỳ gửi mẫu - nộp video nghiệm thu
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                    Chuyển đổi hoàn tất: {metrics.totalApps > 0 ? Math.round((metrics.completedApps / metrics.totalApps) * 100) : 0}%
                  </span>
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                    Rơi rụng / Loại: {metrics.dropOffRate}%
                  </span>
                </div>
              </div>

              {/* Bố cục 2 Cột: Bên Trái là Thẻ Phễu Chuyển Đổi Chuẩn SaaS - Bên Phải là Chỉ Số SLA */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* -------------------------------------------------------------
                    CỘT TRÁI (7 CỘT): 4 CARD PHỄU PHÂN TẦNG VỚI TỶ LỆ RƠI RỤNG RÕ RÀNG
                    ------------------------------------------------------------- */}
                <div className="lg:col-span-7 space-y-3">
                  {(() => {
                    const total = metrics.totalApps || 1;
                    const p1 = 100;
                    const p2 = Math.round((metrics.approvedApps / total) * 100);
                    const p3 = Math.round((metrics.shippingApps / total) * 100);
                    const p4 = Math.round((metrics.completedApps / total) * 100);

                    return (
                      <>
                        {/* TẦNG 1: ĐẦU PHỄU TIẾP NHẬN */}
                        <div
                          onClick={() => {
                            setStatusFilter('all');
                            setActiveAdminTab('applications');
                          }}
                          className="group relative p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200/80 hover:border-indigo-400 hover:shadow-sm transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white text-xs font-black shadow-xs">
                                01
                              </span>
                              <div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 group-hover:text-indigo-600 transition-colors">
                                  Hồ Sơ Ứng Tuyển Nhận Mẫu
                                </h4>
                                <span className="text-[11px] text-slate-500">Tiếp nhận qua sàn Freecast</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-black text-slate-900">{metrics.totalApps}</span>
                              <span className="text-xs font-bold text-slate-500 ml-1">KOC ({p1}%)</span>
                            </div>
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="mt-2.5 h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full w-full"></div>
                          </div>
                        </div>

                        {/* Mũi tên connector T1 -> T2 */}
                        <div className="flex items-center justify-center gap-2 text-[11px] font-bold py-0.5">
                          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs">
                            <span className="material-symbols-outlined text-[13px] text-indigo-600">arrow_downward</span>
                            Tỷ lệ duyệt brief: <strong className="text-indigo-600">{p2}%</strong> ({metrics.approvedApps}/{metrics.totalApps})
                          </span>
                          <span className="text-[10px] text-slate-400">Rớt vòng lọc: {Math.max(0, 100 - p2)}%</span>
                        </div>

                        {/* TẦNG 2: ĐÃ DUYỆT CẤP MẪU */}
                        <div
                          onClick={() => {
                            setStatusFilter('Đã duyệt gửi mẫu');
                            setActiveAdminTab('applications');
                          }}
                          className="group relative p-4 rounded-2xl bg-sky-50/40 border border-sky-200/80 hover:border-sky-400 hover:shadow-sm transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-white text-xs font-black shadow-xs">
                                02
                              </span>
                              <div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 group-hover:text-sky-600 transition-colors">
                                  Đã Duyệt Cấp Mẫu
                                </h4>
                                <span className="text-[11px] text-slate-500">Đạt brief kênh & lượt xem</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-black text-slate-900">{metrics.approvedApps}</span>
                              <span className="text-xs font-bold text-sky-700 ml-1">KOC ({p2}%)</span>
                            </div>
                          </div>
                          <div className="mt-2.5 h-1.5 w-full bg-sky-100 rounded-full overflow-hidden">
                            <div style={{ width: `${p2}%` }} className="h-full bg-sky-600 rounded-full"></div>
                          </div>
                        </div>

                        {/* Mũi tên connector T2 -> T3 */}
                        <div className="flex items-center justify-center gap-2 text-[11px] font-bold py-0.5">
                          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs">
                            <span className="material-symbols-outlined text-[13px] text-amber-600">arrow_downward</span>
                            Đang chuyển hàng & test: <strong className="text-amber-700">{metrics.shippingApps} đơn</strong>
                          </span>
                        </div>

                        {/* TẦNG 3: ĐANG GIAO / TEST MẪU */}
                        <div
                          onClick={() => {
                            setStatusFilter('Đang giao');
                            setActiveAdminTab('applications');
                          }}
                          className="group relative p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white text-xs font-black shadow-xs">
                                03
                              </span>
                              <div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 group-hover:text-amber-600 transition-colors">
                                  Đang Giao & Trải Nghiệm Mẫu
                                </h4>
                                <span className="text-[11px] text-slate-500">Bưu kiện đã gửi qua GHTK / Viettel Post</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-black text-slate-900">{metrics.shippingApps}</span>
                              <span className="text-xs font-bold text-amber-700 ml-1">KOC ({p3}%)</span>
                            </div>
                          </div>
                          <div className="mt-2.5 h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
                            <div style={{ width: `${p3}%` }} className="h-full bg-amber-500 rounded-full"></div>
                          </div>
                        </div>

                        {/* Mũi tên connector T3 -> T4 */}
                        <div className="flex items-center justify-center gap-2 text-[11px] font-bold py-0.5">
                          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs">
                            <span className="material-symbols-outlined text-[13px] text-emerald-600">check_circle</span>
                            Nghiệm thu thành công: <strong className="text-emerald-700">{p4}%</strong>
                          </span>
                        </div>

                        {/* TẦNG 4: ĐÁY PHỄU - VIDEO LIVE */}
                        <div
                          onClick={() => setActiveAdminTab('content')}
                          className="group relative p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 hover:border-emerald-400 hover:shadow-sm transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white text-xs font-black shadow-xs">
                                04
                              </span>
                              <div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 group-hover:text-emerald-600 transition-colors">
                                  Video Live Nghiệm Thu
                                </h4>
                                <span className="text-[11px] text-slate-500">Video TikTok đã đăng & gắn giỏ hàng</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-black text-emerald-700">{metrics.completedApps}</span>
                              <span className="text-xs font-bold text-emerald-700 ml-1">Video ({p4}%)</span>
                            </div>
                          </div>
                          <div className="mt-2.5 h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                            <div style={{ width: `${p4}%` }} className="h-full bg-emerald-600 rounded-full"></div>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>💡 Nhấn vào từng tầng để mở danh sách hồ sơ tương ứng</span>
                    <button
                      onClick={() => {
                        setStatusFilter('Từ chối');
                        setActiveAdminTab('applications');
                      }}
                      className="font-bold text-slate-600 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">cancel</span>
                      Xem {metrics.rejectedApps} đơn bị loại
                    </button>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    CỘT PHẢI (5 CỘT): BẢNG CHỈ SỐ VẬN HÀNH BOOKING (SLA & CHURN)
                    ------------------------------------------------------------- */}
                <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-indigo-600">health_and_safety</span>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                        Sức Khỏe Vận Hành & SLA
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Tự động tính
                    </span>
                  </div>

                  {/* Section 1: Chu kỳ vận hành SLA dạng Pipeline tinh gọn */}
                  <div className="py-4 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-2.5 text-xs">
                      <span className="font-bold text-slate-700">Vòng đời hoàn tất (End-to-End):</span>
                      <span className="font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 rounded-md">
                        ~8.5 ngày
                      </span>
                    </div>

                    {/* Timeline 3 chặng */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="block text-[10px] text-slate-500 font-medium truncate">Duyệt cấp mẫu</span>
                        <strong className="block text-xs font-extrabold text-slate-900 font-mono mt-0.5">&lt; 24h</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="block text-[10px] text-slate-500 font-medium truncate">Giao hàng GHTK</span>
                        <strong className="block text-xs font-extrabold text-slate-900 font-mono mt-0.5">2.5 ngày</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="block text-[10px] text-slate-500 font-medium truncate">Lên video TikTok</span>
                        <strong className="block text-xs font-extrabold text-indigo-600 font-mono mt-0.5">5.2 ngày</strong>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Kiểm soát rủi ro & KOC trễ hạn */}
                  <div className="py-4 border-b border-slate-100">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            metrics.overdueAppsList.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                          }`} />
                          Trễ hạn nộp video (&gt; 7 ngày)
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          Tỷ lệ lọc loại đầu vào: <strong className="text-slate-600">{metrics.dropOffRate}%</strong> (kênh &lt; 1K follow)
                        </span>
                      </div>

                      {metrics.overdueAppsList.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setDashboardSubTab('overdue')}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          <span className="material-symbols-outlined text-[15px]">send</span>
                          Nhắc ngay ({metrics.overdueAppsList.length})
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0">
                          0 ca trễ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Tỷ lệ KOC quay lại (Retention) */}
                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        KOC Tái Tham Gia (Retention)
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5 block">
                        Đã tham gia từ 2 chiến dịch trở lên
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, metrics.retentionRate)}%` }}
                          className="h-full bg-indigo-600 rounded-full"
                        />
                      </div>
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {metrics.retentionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================================
                KHỐI DỮ LIỆU ĐỘNG 100%: NHU CẦU NGÀNH HÀNG & TOP CHIẾN DỊCH HÚT KOC NHẤT
                ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* CỘT 1: Nhu Cầu Theo Ngành Hàng (100% Dữ Liệu Thật Từ Chiến Dịch & Hồ Sơ) */}
              <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-indigo-600 text-[18px]">pie_chart</span>
                        Nhu Cầu KOC Theo Ngành Hàng (Dữ Liệu Thật)
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Thống kê theo số lượt đăng ký thực tế của từng ngành</p>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                      {reportPeriodLabel}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3.5">
                    {metrics.sortedCategories.map((cat, idx) => {
                      const colors = [
                        { bar: 'bg-indigo-600', text: 'text-indigo-600', dot: 'bg-indigo-600' },
                        { bar: 'bg-sky-500', text: 'text-sky-600', dot: 'bg-sky-500' },
                        { bar: 'bg-emerald-500', text: 'text-emerald-600', dot: 'bg-emerald-500' },
                        { bar: 'bg-amber-500', text: 'text-amber-600', dot: 'bg-amber-500' },
                        { bar: 'bg-purple-500', text: 'text-purple-600', dot: 'bg-purple-500' },
                      ];
                      const c = colors[idx % colors.length];

                      return (
                        <div key={cat.name}>
                          <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                            <span className="flex items-center gap-1.5">
                              <span className={`h-2 w-2 rounded-full ${c.dot}`}></span>
                              {cat.name}
                            </span>
                            <span className={c.text}>
                              {cat.percent}% ({cat.count} đơn)
                            </span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              style={{ width: `${cat.percent}%` }}
                              className={`h-full rounded-full ${c.bar} transition-all duration-500`}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700">
                  <div className="font-bold text-indigo-950 flex items-center gap-1 mb-0.5">
                    <span className="material-symbols-outlined text-[16px] text-indigo-600">lightbulb</span>
                    Gợi ý chiến lược cho Web Admin:
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {metrics.sortedCategories.length > 0 ? (
                      <>
                        Ngành <strong>"{metrics.sortedCategories[0].name}"</strong> đang hút KOC nhất chiếm{' '}
                        <strong>{metrics.sortedCategories[0].percent}%</strong> tổng lượt đăng ký. Đề xuất ưu tiên mở thêm
                        chiến dịch thuộc nhóm này để đẩy nhanh tốc độ phủ sóng.
                      </>
                    ) : (
                      'Chưa có đủ dữ liệu để đưa ra gợi ý ngành hàng.'
                    )}
                  </p>
                </div>
              </div>

              {/* CỘT 2: Top Chiến Dịch Thu Hút KOC Nhất (Chuẩn Minimalist SaaS Data List) */}
              <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-indigo-600 text-[18px]">workspace_premium</span>
                        Top Chiến Dịch Hút KOC Nhất
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Xếp hạng theo số KOC đăng ký & tỷ lệ lấp đầy slot</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveAdminTab('campaigns')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer transition-colors"
                    >
                      Tất cả <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </button>
                  </div>

                  <div className="mt-2 divide-y divide-slate-100">
                    {topCampaigns.map((camp, idx) => {
                      const rankBadges = [
                        'text-amber-700 bg-amber-50 border-amber-200/80',
                        'text-slate-700 bg-slate-100 border-slate-200',
                        'text-amber-800 bg-amber-50/60 border-amber-200/50',
                        'text-slate-500 bg-slate-50 border-slate-200/60',
                      ];

                      return (
                        <div
                          key={camp.id}
                          className="py-2.5 px-2 -mx-2 rounded-xl hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 group"
                        >
                          {/* Rank + Image + Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border ${
                              rankBadges[idx] || 'text-slate-500 bg-slate-50'
                            }`}>
                              #{idx + 1}
                            </span>

                            <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {camp.productHeroImage || camp.brandLogo ? (
                                <img
                                  src={camp.productHeroImage || camp.brandLogo}
                                  alt={camp.title}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `<span class="text-xs font-bold text-indigo-600">${(camp.brandName || camp.title || 'K').slice(0, 2).toUpperCase()}</span>`;
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-xs font-bold text-indigo-600">
                                  {(camp.brandName || camp.title || 'K').slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                {camp.title}
                              </h5>
                              <span className="text-[11px] text-slate-500 block truncate">
                                {camp.brandName} • {camp.category}
                              </span>
                            </div>
                          </div>

                          {/* Slot count & mini progress bar */}
                          <div className="text-right shrink-0">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-xs font-bold text-slate-900 font-mono">
                                {camp.realRegistered}/{camp.totalSpots} KOC
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                camp.fillRate >= 100
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-indigo-50 text-indigo-700'
                              }`}>
                                {camp.fillRate}%
                              </span>
                            </div>
                            <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden mt-1 ml-auto">
                              <div
                                style={{ width: `${Math.min(100, camp.fillRate)}%` }}
                                className={`h-full rounded-full transition-all duration-300 ${
                                  camp.fillRate >= 100 ? 'bg-rose-500' : 'bg-indigo-600'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Tổng chiến dịch: <strong className="text-slate-800">{metrics.totalActiveCampaigns}</strong></span>
                  <span>
                    Tổng slot đã cấp: <strong className="text-indigo-600 font-mono">{metrics.totalRegisteredSpots}/{metrics.totalSpots}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* =========================================================================
                BẢNG TÁC VỤ 3 TAB: ĐƠN CHỜ DUYỆT | KOC CHẬM BÀI CẦN GIỤC | TOP KOC THÁNG
                ========================================================================= */}
            <div className="rounded-2xl bg-white shadow-xs border border-slate-200/80 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDashboardSubTab('pending')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      dashboardSubTab === 'pending'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                    Đơn Mới Cần Duyệt Gấp ({metrics.pendingApps})
                  </button>

                  <button
                    onClick={() => setDashboardSubTab('overdue')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      dashboardSubTab === 'overdue'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">notifications_active</span>
                    KOC Cần Giục Nộp Link ({metrics.overdueAppsList.length})
                  </button>

                  <button
                    onClick={() => setDashboardSubTab('top_koc')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      dashboardSubTab === 'top_koc'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px] text-amber-400">hotel_class</span>
                    Top KOC Xuất Sắc Của Tháng
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  {dashboardSubTab === 'pending' && 'Duyệt nhanh để chuyển kho gửi mẫu kịp tiến độ'}
                  {dashboardSubTab === 'overdue' && 'Gửi tin nhắn giục bài để bảo toàn tiến độ chiến dịch'}
                  {dashboardSubTab === 'top_koc' && 'Ưu tiên duyệt chiến dịch mới & đề xuất thưởng'}
                </div>
              </div>

              {/* TAB 1: ĐƠN CHỜ DUYỆT */}
              {dashboardSubTab === 'pending' && (
                applications.filter((a) => a.status === 'Chờ duyệt').length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl text-indigo-600 mb-2">task_alt</span>
                    <p className="text-sm font-semibold text-slate-700">Tuyệt vời! Không còn đơn nào đang chờ duyệt.</p>
                    <p className="text-xs text-slate-400 mt-1">Tất cả đơn đăng ký KOC đều đã được xử lý xong.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200/80">
                        <tr>
                          <th className="px-5 py-3">Mã Đơn / Ngày</th>
                          <th className="px-5 py-3">Thông Tin KOC</th>
                          <th className="px-5 py-3">Chiến Dịch Đăng Ký</th>
                          <th className="px-5 py-3">Chỉ Số Kênh</th>
                          <th className="px-5 py-3">Ý Tưởng (Concept)</th>
                          <th className="px-5 py-3 text-right">Thao Tác Duyệt Nhanh</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {applications
                          .filter((a) => a.status === 'Chờ duyệt')
                          .slice(0, 4)
                          .map((app) => (
                            <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-3.5">
                                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                                  {app.code}
                                </span>
                                <div className="text-[11px] text-slate-400 mt-1">
                                  {app.createdAtDate} <br />
                                  <span className="text-[10px]">{app.createdAtTime}</span>
                                </div>
                              </td>

                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={app.avatar}
                                    alt={app.kocName}
                                    className="h-9 w-9 rounded-full object-cover border border-slate-200"
                                  />
                                  <div>
                                    <div className="font-bold text-slate-900 flex items-center gap-1">
                                      {app.kocName}
                                      {renderKocLoyaltyStar(app.tiktokHandle, app.kocName)}
                                      {app.verified && (
                                        <span className="material-symbols-outlined text-[14px] text-indigo-600" title="KOC đã xác thực">verified</span>
                                      )}
                                    </div>
                                    <span className="text-xs font-semibold text-indigo-600">{app.tiktokHandle}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-3.5">
                                <p className="font-medium text-slate-800 line-clamp-1 max-w-[220px]">{app.campaignName}</p>
                                <span className="text-[11px] text-slate-400">{app.createdAtDate} • {app.createdAtTime}</span>
                              </td>

                              <td className="px-5 py-3.5">
                                <div className="text-xs">
                                  <span className="font-bold text-slate-900">{app.followers}</span> followers
                                  <p className="text-[11px] text-slate-500">{app.avgViews}</p>
                                  {(app.monthlyOrders || app.monthlyAvgGmv) && (
                                    <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                                      {app.monthlyOrders && (
                                        <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                          📦 {app.monthlyOrders.includes('đơn') ? app.monthlyOrders : `${app.monthlyOrders} đơn/th`}
                                        </span>
                                      )}
                                      {app.monthlyAvgGmv && (
                                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                          💰 {app.monthlyAvgGmv}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="px-5 py-3.5">
                                <p className="text-xs text-slate-600 line-clamp-2 max-w-[260px] italic">
                                  "{app.contentConcept}"
                                </p>
                              </td>

                              <td className="px-5 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleQuickApprove(app)}
                                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[15px]">check</span>
                                    Duyệt gửi mẫu
                                  </button>
                                  <button
                                    onClick={() => handleQuickReject(app)}
                                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                                  >
                                    Từ chối
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedApp(app);
                                      setEditingShippingCode(app.shippingCode);
                                      setIsDetailModalOpen(true);
                                    }}
                                    className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                    title="Xem chi tiết hồ sơ"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* TAB 2: KOC CHẬM BÀI / CẦN GIỤC NỘP LINK VIDEO (1 CLICK MỞ ZALO + TÍNH SỐ NGÀY THẬT) */}
              {dashboardSubTab === 'overdue' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200/80">
                      <tr>
                        <th className="px-5 py-3">Mã Đơn / KOC</th>
                        <th className="px-5 py-3">Chiến Dịch</th>
                        <th className="px-5 py-3">Mã Vận Đơn</th>
                        <th className="px-5 py-3">Số Ngày Đã Gửi Mẫu</th>
                        <th className="px-5 py-3">Trạng Thái Rủi Ro</th>
                        <th className="px-5 py-3 text-right">Hành Động Giục Bài</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {metrics.overdueAppsList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                            <span className="material-symbols-outlined text-3xl text-emerald-600 mb-1">done_all</span>
                            <p className="text-xs font-semibold">Tất cả KOC đều nộp bài đúng hạn hoặc chưa quá 7 ngày!</p>
                          </td>
                        </tr>
                      ) : (
                        metrics.overdueAppsList.slice(0, 5).map((app) => {
                          const daysAgo = getDaysAgo(app.createdAtDate);
                          const isHighRisk = daysAgo >= 10;
                          return (
                            <tr key={app.id} className="hover:bg-amber-50/20 transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="font-bold text-slate-900">{app.kocName}</div>
                                <span className="text-xs text-indigo-600 font-semibold">{app.tiktokHandle}</span>
                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{app.phone}</div>
                              </td>

                              <td className="px-5 py-3.5">
                                <p className="font-medium text-slate-800 line-clamp-1 max-w-[200px]">{app.campaignName}</p>
                                <span className="text-[11px] text-slate-400">Mã đơn: {app.code}</span>
                              </td>

                              <td className="px-5 py-3.5">
                                <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  {app.shippingCode || 'Đang tạo mã'}
                                </span>
                                <div className="text-[11px] text-slate-500 mt-0.5">{app.shippingStatus}</div>
                              </td>

                              <td className="px-5 py-3.5">
                                <span className={`font-bold ${isHighRisk ? 'text-rose-600 font-black' : 'text-amber-700'}`}>
                                  {daysAgo} ngày trước
                                </span>
                                <div className="text-[10px] text-slate-400">Hạn nộp video: 7 ngày</div>
                              </td>

                              <td className="px-5 py-3.5">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  isHighRisk
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${isHighRisk ? 'bg-rose-600' : 'bg-amber-600'}`}></span>
                                  {isHighRisk ? `Trễ ${daysAgo - 7} ngày (Rủi ro cao)` : `Quá hạn nộp link (${daysAgo - 7} ngày)`}
                                </span>
                              </td>

                              <td className="px-5 py-3.5 text-right">
                                <button
                                  onClick={() => handleZaloPrompt(app)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
                                  title="Mở chat Zalo và sao chép mẫu tin nhắn"
                                >
                                  <span className="material-symbols-outlined text-[15px]">chat</span>
                                  Giục qua Zalo
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: TOP KOC XUẤT SẮC CỦA THÁNG (100% DỮ LIỆU THẬT) */}
              {dashboardSubTab === 'top_koc' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200/80">
                      <tr>
                        <th className="px-5 py-3">Hạng</th>
                        <th className="px-5 py-3">KOC & Kênh</th>
                        <th className="px-5 py-3">Chiến Dịch Đã Hoàn Thành</th>
                        <th className="px-5 py-3">Lượt Xem Ước Tính</th>
                        <th className="px-5 py-3">Đánh Giá Tín Nhiệm</th>
                        <th className="px-5 py-3 text-right">Đề Xuất Hợp Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topKocList.map((koc, idx) => (
                        <tr key={koc.handle} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className={`h-6 w-6 rounded-full inline-flex items-center justify-center text-xs font-black ${
                              idx === 0
                                ? 'bg-amber-400 text-slate-900 shadow-xs'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-800'
                                : idx === 2
                                ? 'bg-amber-700 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              0{idx + 1}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={koc.avatar}
                                alt={koc.name}
                                className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1">
                                  {koc.name}
                                  {renderKocLoyaltyStar(koc.handle, koc.name)}
                                </div>
                                <span className="text-xs text-indigo-600 font-semibold">{koc.handle}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <p className="font-medium text-slate-800 line-clamp-1 max-w-[220px]">{koc.campaign}</p>
                            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                              <span className="material-symbols-outlined text-[13px]">check_circle</span>
                              {koc.completedCount > 0 ? `Đã hoàn tất ${koc.completedCount} chiến dịch` : 'Hồ sơ đạt tiêu chuẩn'}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="font-extrabold text-slate-900 text-sm">
                              {koc.totalViews.toLocaleString('vi-VN')}
                            </span>
                            <div className="text-[11px] text-slate-500">lượt xem video</div>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <span className="material-symbols-outlined text-[14px]">verified</span>
                              {koc.rating}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <span className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-bold text-indigo-700">
                              Ưu tiên duyệt mẫu
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            NỘI DUNG CHI TIẾT 2: DUYỆT HỒ SƠ KOC (APPLICATIONS)
            --------------------------------------------------------------------- */}
        {activeAdminTab === 'applications' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="rounded-2xl bg-white p-3.5 sm:p-4 shadow-xs border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">search</span>
                <input
                  type="text"
                  placeholder="Tìm KOC, SĐT, @tiktok, mã đơn..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 py-2 pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100/70 transition-all"
                />
                {appSearch && (
                  <button onClick={() => setAppSearch('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'Tất cả', count: applications.length },
                  { id: 'Chờ duyệt', label: 'Chờ duyệt', count: metrics.pendingApps },
                  { id: 'Đã duyệt gửi mẫu', label: 'Đã duyệt gửi mẫu', count: metrics.approvedApps },
                  { id: 'Đang giao', label: 'Đang giao', count: metrics.shippingApps },
                  { id: 'Chờ duyệt video', label: 'Chờ duyệt video', count: metrics.pendingVideoApps },
                  { id: 'Đã hoàn thành', label: 'Đã hoàn thành', count: metrics.completedApps },
                  { id: 'Bị từ chối', label: 'Bị từ chối', count: metrics.rejectedApps },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setStatusFilter(chip.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      statusFilter === chip.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    <span>{chip.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        statusFilter === chip.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {chip.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Campaign Filter Dropdown */}
              <select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                className="rounded-xl border border-slate-200/80 bg-slate-50/70 py-2 px-3 text-xs text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100/70 cursor-pointer transition-all"
              >
                <option value="all">Tất cả chiến dịch ({campaigns.length})</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.brandName} - {c.title.slice(0, 35)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Applications Table */}
            <div className="rounded-2xl bg-white shadow-xs border border-slate-200/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                    <tr>
                      <th className="px-4 py-3 sm:px-5 sm:py-3.5">Mã Đơn / Ngày</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-3.5">Thông Tin KOC</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-3.5">Chiến Dịch</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-3.5">Địa Chỉ Giao Mẫu</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-3.5">Trạng Thái & Vận Đơn</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-3.5 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">inbox</span>
                          <p className="text-sm font-semibold">Không tìm thấy hồ sơ KOC nào phù hợp</p>
                          <p className="text-xs text-slate-400 mt-1">Hãy thử đổi từ khóa tìm kiếm hoặc bấm chọn tab khác.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 sm:px-5 sm:py-3.5 whitespace-nowrap">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded">
                              {app.code}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-1">
                              {app.createdAtDate} <br />
                              <span className="text-[10px]">{app.createdAtTime}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3 sm:px-5 sm:py-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={app.avatar}
                                alt={app.kocName}
                                className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1 text-xs sm:text-sm">
                                  {app.kocName}
                                  {renderKocLoyaltyStar(app.tiktokHandle, app.kocName)}
                                  {app.verified && (
                                    <span className="material-symbols-outlined text-[15px] text-blue-600" title="KOC đã xác thực">
                                      verified
                                    </span>
                                  )}
                                </div>
                                <a
                                  href={app.channelLink || `https://tiktok.com/@${app.tiktokHandle.replace('@', '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                                >
                                  {app.tiktokHandle}
                                  <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                                </a>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  📞 {app.phone} • ✉️ {app.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 sm:px-5 sm:py-3.5">
                            <p className="font-medium text-slate-900 text-xs line-clamp-2 max-w-[200px]">
                              {app.campaignName}
                            </p>
                            <span className="inline-block mt-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded">
                              {app.followers} • {app.avgViews}
                            </span>
                            {(app.monthlyOrders || app.monthlyAvgGmv) && (
                              <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                                {app.monthlyOrders && (
                                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    📦 {app.monthlyOrders}
                                  </span>
                                )}
                                {app.monthlyAvgGmv && (
                                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    💰 {app.monthlyAvgGmv}
                                  </span>
                                )}
                              </div>
                            )}
                            {/* Mẫu sản phẩm KOC đã đăng ký nhận */}
                            {(app.selectedSampleName || app.selectedSampleCode) && (
                              <div className="mt-1.5 flex items-center gap-1.5 p-1 rounded-lg bg-indigo-50 border border-indigo-100 max-w-[200px]">
                                {app.selectedSampleImage ? (
                                  <img
                                    src={app.selectedSampleImage}
                                    alt={app.selectedSampleName}
                                    className="w-6 h-6 rounded-md object-cover border border-indigo-200 shrink-0"
                                  />
                                ) : (
                                  <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold shrink-0">
                                    SP
                                  </span>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] font-bold text-indigo-900 truncate">
                                    {app.selectedSampleCode ? `[${app.selectedSampleCode}] ` : ''}
                                    {app.selectedSampleName}
                                  </p>
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3 sm:px-5 sm:py-3.5">
                            <p className="text-xs text-slate-700 line-clamp-2 max-w-[220px]" title={app.address}>
                              📍 {app.address}
                            </p>
                            {app.contentConcept && (
                              <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-1 max-w-[220px]">
                                Idea: {app.contentConcept}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3 sm:px-5 sm:py-3.5">
                            <div className="space-y-1.5">
                              <div>{getStatusBadge(app.status)}</div>
                              {app.shippingCode ? (
                                <p className="font-mono text-[11px] text-slate-800 font-semibold bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded inline-block">
                                  📦 {app.shippingCode}
                                </p>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic block">Chưa có mã vận đơn</span>
                              )}
                              {app.videoLink && (
                                <a
                                  href={app.videoLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                                >
                                  <span className="material-symbols-outlined text-[14px]">videocam</span>
                                  Xem video TikTok ({app.videoViews || 'Đang đếm'})
                                </a>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3 sm:px-5 sm:py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {app.status === 'Chờ duyệt' && (
                                <>
                                  <button
                                    onClick={() => handleQuickApprove(app)}
                                    className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs transition-all cursor-pointer"
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    onClick={() => handleQuickReject(app)}
                                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer"
                                  >
                                    Từ chối
                                  </button>
                                </>
                              )}

                              {app.status === 'Đã duyệt gửi mẫu' && (
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'Đang giao')}
                                  className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                                  Đang giao
                                </button>
                              )}

                              {app.status === 'Đang giao' && app.shippingStatus !== 'Đã phát thành công' && (
                                <button
                                  onClick={() => {
                                    handleUpdateStatus(app.id, app.status, undefined, undefined, 'Đã phát thành công');
                                    onShowToast('Đã đánh dấu giao thành công!', 'Hệ thống đã gửi thông báo giục KOC làm video đúng hạn 5 - 7 ngày.', 'success');
                                  }}
                                  className="rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-amber-700 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                                  title="Đánh dấu bưu tá đã giao thành công và gửi thông báo giục KOC làm video 5 - 7 ngày"
                                >
                                  <span className="material-symbols-outlined text-[14px]">task_alt</span>
                                  Giao thành công
                                </button>
                              )}

                              {app.status === 'Đang giao' && (
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'Chờ duyệt video')}
                                  className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[14px]">video_library</span>
                                  Chờ nộp video
                                </button>
                              )}

                              {app.status === 'Chờ duyệt video' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(app.id, 'Đã hoàn thành')}
                                    className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-all cursor-pointer flex items-center gap-1"
                                    title="Duyệt hoàn thành video nghiệm thu"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                    Duyệt
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectModalApp(app);
                                      setRejectType('video');
                                      setRejectFeedbackText(app.adminFeedback || '');
                                    }}
                                    className="rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-1"
                                    title="Từ chối video và gửi feedback cho KOC"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">cancel</span>
                                    Từ chối
                                  </button>
                                </>
                              )}

                              {app.status === 'Bị từ chối' && (
                                <button
                                  onClick={() => {
                                    setRejectModalApp(app);
                                    setRejectType('video');
                                    setRejectFeedbackText(app.adminFeedback || '');
                                  }}
                                  className="rounded-lg border border-rose-200 bg-rose-50/70 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
                                  title="Xem hoặc cập nhật Feedback gửi KOC"
                                >
                                  Sửa Feedback
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedApp(app);
                                  setEditingShippingCode(app.shippingCode);
                                  setIsDetailModalOpen(true);
                                }}
                                className="rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-all cursor-pointer"
                              >
                                Chi tiết
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            NỘI DUNG CHI TIẾT 3: QUẢN LÝ CHIẾN DỊCH (CAMPAIGNS)
            --------------------------------------------------------------------- */}
        {activeAdminTab === 'campaigns' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="rounded-2xl bg-white overflow-hidden shadow-xs border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header Image */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100 group">
                      <img
                        src={camp.productHeroImage}
                        alt={camp.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-lg bg-blue-900/85 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-blue-700/40">
                        <span>{camp.brandName}</span>
                      </div>
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
                        <span className="material-symbols-outlined text-[13px]">timer</span>
                        <span>
                          {(() => {
                            const days = calculateDaysLeftFromDate(camp.endDate, camp.daysLeft);
                            return days > 0 ? `Còn ${days} ngày` : 'Hết hạn';
                          })()}
                        </span>
                      </div>
                      {/* Nút sửa ảnh nhanh khi hover ảnh */}
                      <button
                        onClick={() => handleOpenEditCampaign(camp)}
                        className="absolute inset-0 bg-black/45 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                        <span>Đổi ảnh / Sửa chiến dịch</span>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <h4 className="font-bold text-slate-900 line-clamp-2 text-sm leading-snug">
                        {camp.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{camp.description}</p>

                      {/* Spots Progress Bar */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                          <span>Tiến độ nhận mẫu</span>
                          <span>
                            <strong className="text-blue-600">{camp.registeredSpots}</strong> / {camp.totalSpots} slot
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{
                              width: `${Math.min(100, (camp.registeredSpots / camp.totalSpots) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Benefits tag */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {camp.benefits.map((b, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700"
                          >
                            {b.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/70">
                    <span className="font-mono text-[11px] text-slate-400 font-bold">{camp.code}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditCampaign(camp)}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 font-bold transition-all cursor-pointer shadow-sm shadow-blue-600/20 active:scale-95"
                        title="Chỉnh sửa thông tin chiến dịch, đổi ảnh, cài đặt ngày đếm ngược"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span>Sửa chiến dịch</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xoá chiến dịch "${camp.title}"?`)) {
                            onUpdateCampaigns(campaigns.filter((c) => c.id !== camp.id));
                            deleteCampaignOnSupabase(camp.id);
                            onShowToast('Đã xoá chiến dịch', camp.title, 'info');
                          }
                        }}
                        className="flex items-center gap-1 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 px-2.5 py-1.5 font-bold transition-all cursor-pointer"
                        title="Xoá chiến dịch"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                        <span>Xoá</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            NỘI DUNG CHI TIẾT 4: NGHIỆM THU VIDEO TIKTOK (CONTENT)
            --------------------------------------------------------------------- */}
        {activeAdminTab === 'content' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.filter((a) => a.videoLink || a.status === 'Chờ duyệt video' || a.status === 'Đã hoàn thành' || a.status === 'Bị từ chối' || a.status === 'Đã lên bài').length === 0 ? (
                <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">videocam_off</span>
                  <p className="text-sm font-semibold">Chưa có video nào được nộp</p>
                  <p className="text-xs text-slate-400 mt-1">Khi KOC nộp link TikTok trong mục "Chiến dịch của tôi", bài nộp sẽ hiển thị tại đây để bạn kiểm tra, duyệt hoàn thành hoặc từ chối kèm phản hồi.</p>
                </div>
              ) : (
                applications
                  .filter((a) => a.videoLink || a.status === 'Chờ duyệt video' || a.status === 'Đã hoàn thành' || a.status === 'Bị từ chối' || a.status === 'Đã lên bài')
                  .map((app) => (
                    <div
                      key={app.id}
                      className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={app.avatar}
                            alt={app.kocName}
                            className="h-12 w-12 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                              {app.kocName}
                              {renderKocLoyaltyStar(app.tiktokHandle, app.kocName)}
                              {app.verified && <span className="material-symbols-outlined text-[15px] text-blue-600">verified</span>}
                            </h4>
                            <span className="text-xs font-semibold text-blue-600">{app.tiktokHandle}</span>
                            <p className="text-[11px] text-slate-500">Followers: {app.followers}</p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {app.status === 'Đã hoàn thành' || app.status === 'Đã lên bài' ? (
                          <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Đã hoàn thành
                          </span>
                        ) : app.status === 'Bị từ chối' ? (
                          <span className="rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">cancel</span>
                            Bị từ chối
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                            Chờ duyệt video
                          </span>
                        )}
                      </div>

                      <div className="rounded-xl bg-blue-50/60 p-3 text-xs space-y-1.5 border border-blue-100">
                        <p className="font-semibold text-slate-800 line-clamp-1">
                          Chiến dịch: <span className="text-blue-700 font-bold">{app.campaignName}</span>
                        </p>
                        <p className="text-slate-600 italic">
                          Ý tưởng kịch bản: "{app.contentConcept}"
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-blue-200/60">
                          <span>Lượt xem video: <strong className="text-blue-800">{app.videoViews || 'Đang cập nhật'}</strong></span>
                          <span>Mã vận đơn: {app.shippingCode}</span>
                        </div>
                      </div>

                      {/* Display feedback if rejected */}
                      {app.status === 'Bị từ chối' && app.adminFeedback && (
                        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-900 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-rose-800">
                            <span className="material-symbols-outlined text-[15px] text-rose-600">feedback</span>
                            <span>Feedback đã gửi cho KOC:</span>
                          </div>
                          <p className="text-rose-800 italic bg-white/80 p-2.5 rounded-lg border border-rose-200/60 leading-relaxed font-medium">
                            "{app.adminFeedback}"
                          </p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          {app.videoLink ? (
                            <a
                              href={app.videoLink}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[16px] text-indigo-600">play_circle</span>
                              Xem Video
                            </a>
                          ) : (
                            <button
                              onClick={() => {
                                const link = prompt('Nhập link video TikTok hoặc Drive của KOC này:');
                                if (link) {
                                  onUpdateApplications(
                                    applications.map((a) => (a.id === app.id ? { ...a, videoLink: link } : a))
                                  );
                                  onShowToast('Đã lưu link video!', link, 'success');
                                }
                              }}
                              className="rounded-xl border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 cursor-pointer"
                            >
                              + Nhập link video
                            </button>
                          )}

                          <button
                            onClick={() => {
                              const newViews = prompt('Cập nhật số lượt xem (views) thực tế của video:', app.videoViews || '50K views');
                              if (newViews) {
                                onUpdateApplications(
                                  applications.map((a) => (a.id === app.id ? { ...a, videoViews: newViews } : a))
                                );
                                onShowToast('Đã cập nhật chỉ số views!', newViews, 'success');
                              }
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            Cập nhật View
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setRejectModalApp(app);
                              setRejectType('video');
                              setRejectFeedbackText(app.adminFeedback || '');
                            }}
                            className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
                            title="Từ chối video và gửi phản hồi cho KOC"
                          >
                            <span className="material-symbols-outlined text-[14px]">cancel</span>
                            Từ chối video
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(app.id, 'Đã hoàn thành')}
                            className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                            title="Duyệt hoàn thành nghiệm thu video"
                          >
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Duyệt hoàn thành
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            NỘI DUNG CHI TIẾT 5: DANH BẠ KOC & ĐỐI TÁC (CRM)
            Hiển thị toàn bộ KOC đã tạo tài khoản trên web kể cả chưa nộp đơn nào
            --------------------------------------------------------------------- */}
        {activeAdminTab === 'koc-crm' && (() => {
          // 1. Hợp nhất danh sách KOC từ Supabase/LocalStorage và các đơn applications
          const map = new Map<
            string,
            {
              id: string;
              name: string;
              tiktokHandle: string;
              followers: string;
              followersCount: number;
              phone: string;
              email: string;
              address: string;
              avatar: string;
              categories: string[];
              verified: boolean;
              totalApplications: number;
              completedApplications: number;
              hasApplied: boolean;
              isBlacklisted?: boolean;
              blacklistReason?: string;
            }
          >();

          // Thêm KOC đã đăng ký tài khoản trên web
          registeredKOCs.forEach((u) => {
            const h = (u.tiktokHandle || u.name || '').toLowerCase().replace(/[@\s]/g, '');
            if (!h || u.role === 'admin') return;

            const userApps = applications.filter(
              (a) => (a.tiktokHandle || '').toLowerCase().replace(/[@\s]/g, '') === h
            );

            const fStr = u.followers || 'KOC';
            const numF = parseInt(fStr.replace(/[^0-9]/g, '')) || 0;
            const calcCount = fStr.toLowerCase().includes('k') ? numF * 1000 : numF;

            map.set(h, {
              id: u.id || `koc-${h}`,
              name: u.name || h,
              tiktokHandle: u.tiktokHandle || `@${h}`,
              followers: u.followers || 'KOC',
              followersCount: calcCount,
              phone: u.phone || '',
              email: u.email || '',
              address: u.address || (u.city ? `${u.district ? u.district + ', ' : ''}${u.city}` : ''),
              avatar: u.avatar || APP_LOGOS.userProfile,
              categories: u.categories || [],
              verified: !!u.verified,
              totalApplications: userApps.length,
              completedApplications: userApps.filter((a) => a.status === 'Đã lên bài').length,
              hasApplied: userApps.length > 0,
              isBlacklisted: !!u.isBlacklisted,
              blacklistReason: u.blacklistReason || '',
            });
          });

          // Bổ sung hoặc cập nhật từ applications
          applications.forEach((app) => {
            const h = (app.tiktokHandle || app.kocName || '').toLowerCase().replace(/[@\s]/g, '');
            if (!h) return;

            const userApps = applications.filter(
              (a) => (a.tiktokHandle || '').toLowerCase().replace(/[@\s]/g, '') === h
            );

            const existing = map.get(h);
            if (existing) {
              map.set(h, {
                ...existing,
                name: existing.name || app.kocName,
                phone: existing.phone || app.phone,
                email: existing.email || app.email,
                address: existing.address || app.address,
                avatar:
                  existing.avatar && !existing.avatar.includes('dicebear')
                    ? existing.avatar
                    : app.avatar || existing.avatar,
                totalApplications: userApps.length,
                completedApplications: userApps.filter((a) => a.status === 'Đã lên bài').length,
                hasApplied: true,
              });
            } else {
              map.set(h, {
                id: app.id,
                name: app.kocName,
                tiktokHandle: app.tiktokHandle,
                followers: app.followers || `${app.followersCount || 0}`,
                followersCount: app.followersCount || 0,
                phone: app.phone || '',
                email: app.email || '',
                address: app.address || '',
                avatar: app.avatar || APP_LOGOS.userProfile,
                categories: [],
                verified: !!app.verified,
                totalApplications: userApps.length,
                completedApplications: userApps.filter((a) => a.status === 'Đã lên bài').length,
                hasApplied: true,
                isBlacklisted: false,
                blacklistReason: '',
              });
            }
          });

          const allKOCs = Array.from(map.values());

          // 2. Lọc theo bộ lọc và tìm kiếm
          const filteredKOCs = allKOCs.filter((koc) => {
            if (kocCrmFilter === 'unapplied' && koc.hasApplied) return false;
            if (kocCrmFilter === 'applied' && !koc.hasApplied) return false;
            if (kocCrmFilter === 'blacklisted' && !koc.isBlacklisted) return false;

            if (kocCrmSearch.trim()) {
              const q = kocCrmSearch.toLowerCase().trim();
              const matchName = (koc.name || '').toLowerCase().includes(q);
              const matchHandle = (koc.tiktokHandle || '').toLowerCase().includes(q);
              const matchPhone = (koc.phone || '').toLowerCase().includes(q);
              const matchEmail = (koc.email || '').toLowerCase().includes(q);
              return matchName || matchHandle || matchPhone || matchEmail;
            }

            return true;
          });

          const unappliedCount = allKOCs.filter((k) => !k.hasApplied).length;
          const appliedCount = allKOCs.filter((k) => k.hasApplied).length;
          const blacklistedCount = allKOCs.filter((k) => k.isBlacklisted).length;

          return (
            <div className="space-y-4">
              {/* Thẻ Thống kê & Bộ lọc KOC CRM */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-600 text-[22px]">contact_page</span>
                      <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900">
                        Danh bạ & Quản trị KOC (CRM)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Theo dõi toàn bộ KOC đã đăng ký, quản lý quyền nhận mẫu, phát hiện KOC bùng video và xoá tài khoản ảo/rác.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchRegisteredKOCs}
                    disabled={isLoadingKocs}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    title="Tải lại danh sách KOC từ máy chủ Supabase"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${isLoadingKocs ? 'animate-spin' : ''}`}>
                      refresh
                    </span>
                    <span>{isLoadingKocs ? 'Đang tải...' : 'Làm mới danh sách'}</span>
                  </button>
                </div>

                {/* 4 Thẻ thống kê số lượng */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                  <div className="rounded-xl bg-purple-50/70 border border-purple-100 p-3">
                    <p className="text-[11px] font-semibold text-purple-700">Tổng KOC hệ thống</p>
                    <p className="text-xl font-extrabold text-purple-900 mt-0.5">{allKOCs.length} KOC</p>
                  </div>
                  <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-3">
                    <p className="text-[11px] font-semibold text-amber-700">⚡ Mới tạo (Chưa nộp)</p>
                    <p className="text-xl font-extrabold text-amber-900 mt-0.5">{unappliedCount} KOC</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-3">
                    <p className="text-[11px] font-semibold text-emerald-700">🎯 Đã nộp đơn</p>
                    <p className="text-xl font-extrabold text-emerald-900 mt-0.5">{appliedCount} KOC</p>
                  </div>
                  <div className="rounded-xl bg-red-50/70 border border-red-100 p-3">
                    <p className="text-[11px] font-semibold text-red-700">⛔ Cấm nhận mẫu</p>
                    <p className="text-xl font-extrabold text-red-900 mt-0.5">{blacklistedCount} KOC</p>
                  </div>
                </div>

                {/* Bộ lọc tab và thanh tìm kiếm */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setKocCrmFilter('all')}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        kocCrmFilter === 'all'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Tất cả ({allKOCs.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setKocCrmFilter('unapplied')}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        kocCrmFilter === 'unapplied'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ⚡ Mới tạo ({unappliedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setKocCrmFilter('applied')}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        kocCrmFilter === 'applied'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      🎯 Đã nộp đơn ({appliedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setKocCrmFilter('blacklisted')}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        kocCrmFilter === 'blacklisted'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      ⛔ Bị cấm nhận mẫu ({blacklistedCount})
                    </button>
                  </div>

                  <div className="relative w-full md:w-64">
                    <span className="material-symbols-outlined text-slate-400 absolute left-3 top-2.5 text-[18px]">
                      search
                    </span>
                    <input
                      type="text"
                      value={kocCrmSearch}
                      onChange={(e) => setKocCrmSearch(e.target.value)}
                      placeholder="Tìm tên, ID TikTok, SĐT..."
                      className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Danh sách thẻ KOC */}
              {filteredKOCs.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-[#6366f1] mb-3">
                    <span className="material-symbols-outlined text-3xl">person_search</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {kocCrmSearch ? 'Không tìm thấy KOC nào phù hợp' : 'Chưa có KOC nào trong danh mục này'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    {kocCrmSearch
                      ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Làm mới danh sách".'
                      : 'Khi có KOC đăng ký tài khoản mới trên website hoặc gửi đơn nhận mẫu, thông tin sẽ tự động hiển thị tại đây.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredKOCs.map((koc) => (
                    <div
                      key={koc.id || koc.tiktokHandle}
                      className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <img
                          src={koc.avatar || APP_LOGOS.userProfile}
                          alt={koc.name}
                          className="h-14 w-14 rounded-full object-cover border-2 border-purple-200 shrink-0 bg-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-slate-900 text-sm truncate flex items-center gap-1">
                              {koc.name}
                              {renderKocLoyaltyStar(koc.tiktokHandle, koc.name)}
                              {koc.verified && (
                                <span className="material-symbols-outlined text-[15px] text-blue-600">
                                  verified
                                </span>
                              )}
                            </h4>
                            <div className="flex items-center gap-1 shrink-0">
                              {koc.isBlacklisted && (
                                <span className="rounded bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 border border-red-200">
                                  ⛔ Cấm mẫu
                                </span>
                              )}
                              {koc.hasApplied ? (
                                <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 border border-emerald-200">
                                  Đã nộp ({koc.totalApplications})
                                </span>
                              ) : (
                                <span className="rounded bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 border border-amber-200 flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[12px]">bolt</span>
                                  <span>Chưa nộp đơn</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <a
                            href={`https://tiktok.com/@${koc.tiktokHandle.replace('@', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-purple-600 hover:underline block truncate mt-0.5"
                          >
                            {koc.tiktokHandle}
                          </a>
                          <p className="text-[11px] text-slate-500 mt-1">
                            📊 <strong>{koc.followers}</strong> followers
                          </p>
                          {koc.categories && koc.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {koc.categories.map((c, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cảnh báo nếu KOC nằm trong danh sách đen / cấm nhận mẫu */}
                      {koc.isBlacklisted && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-700 flex items-start gap-2">
                          <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">block</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-red-800">⛔ Đang bị cấm nhận mẫu</p>
                            <p className="text-[11px] text-red-600 mt-0.5 break-words">
                              {koc.blacklistReason || 'Vi phạm điều khoản nhận mẫu nhưng không trả video nghiệm thu.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Thông tin liên hệ */}
                      <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1.5 border border-slate-100">
                        <p className="text-slate-700">
                          📞 SĐT:{' '}
                          {koc.phone ? (
                            <strong className="text-slate-900 font-mono">{koc.phone}</strong>
                          ) : (
                            <span className="text-slate-400 italic">Chưa cập nhật</span>
                          )}
                        </p>
                        <p className="text-slate-700 truncate">
                          ✉️ Email:{' '}
                          {koc.email ? (
                            <span className="text-slate-900">{koc.email}</span>
                          ) : (
                            <span className="text-slate-400 italic">Chưa cập nhật</span>
                          )}
                        </p>
                        {koc.address && (
                          <p className="text-slate-700 line-clamp-2">📍 Địa chỉ: {koc.address}</p>
                        )}
                      </div>

                      {/* Footer trạng thái & liên hệ */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <div className="text-[11px] text-slate-500">
                          {koc.hasApplied ? (
                            <span>
                              Đã nộp: <strong className="text-slate-900">{koc.totalApplications} đơn</strong> • Đạt: <strong className="text-emerald-600 font-bold">{koc.completedApplications}</strong>
                            </span>
                          ) : (
                            <span className="text-amber-700 font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">person_check</span>
                              <span>Tài khoản mới tạo</span>
                            </span>
                          )}
                        </div>
                        {koc.phone ? (
                          <a
                            href={`https://zalo.me/${koc.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 hover:underline shrink-0"
                          >
                            <span className="material-symbols-outlined text-[14px]">chat</span>
                            Chat Zalo
                          </a>
                        ) : (
                          <a
                            href={`https://tiktok.com/@${koc.tiktokHandle.replace('@', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 font-bold text-purple-600 hover:text-purple-800 hover:underline shrink-0"
                          >
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            Kênh TikTok
                          </a>
                        )}
                      </div>

                      {/* Bảng thao tác Quản trị viên: Cấm nhận mẫu & Xóa tài khoản */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleToggleBlacklist(koc.tiktokHandle, !!koc.isBlacklisted, koc.blacklistReason)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            koc.isBlacklisted
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                          }`}
                          title={koc.isBlacklisted ? 'Gỡ cấm nhận mẫu cho KOC này' : 'Chặn KOC không cho nhận mẫu 0đ (KOC bùng video)'}
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {koc.isBlacklisted ? 'lock_open' : 'do_not_disturb_on'}
                          </span>
                          <span>{koc.isBlacklisted ? 'Gỡ cấm' : 'Cấm nhận mẫu'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteKocAccount(koc.tiktokHandle, koc.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 transition-all cursor-pointer"
                          title="Xóa vĩnh viễn tài khoản KOC khỏi hệ thống và máy chủ Supabase"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete_forever</span>
                          <span>Xoá KOC</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB QUẢN LÝ BÀI VIẾT CẨM NANG & SEO */}
        {activeAdminTab === 'blog' && (
          <AdminBlogManager onShowToast={onShowToast} />
        )}
      </main>

      {/* DETAIL & SHIPPING UPDATE MODAL */}
      {isDetailModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/60">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                  {selectedApp.code}
                </span>
                <h3 className="font-bold text-slate-900 text-base">Hồ Sơ Đăng Ký KOC</h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* KOC Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <img
                  src={selectedApp.avatar}
                  alt={selectedApp.kocName}
                  className="h-14 w-14 rounded-full object-cover border-2 border-blue-200"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                    {selectedApp.kocName}
                    {renderKocLoyaltyStar(selectedApp.tiktokHandle, selectedApp.kocName)}
                    {selectedApp.verified && <span className="material-symbols-outlined text-[16px] text-blue-600">verified</span>}
                  </h4>
                  <a
                    href={`https://tiktok.com/@${selectedApp.tiktokHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {selectedApp.tiktokHandle}
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </a>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedApp.followers} Followers • {selectedApp.avgViews}
                  </p>
                  {(selectedApp.monthlyOrders || selectedApp.monthlyAvgGmv) && (
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                      {selectedApp.monthlyOrders && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-700 border border-amber-200">
                          📦 {selectedApp.monthlyOrders.includes('đơn') ? selectedApp.monthlyOrders : `${selectedApp.monthlyOrders} đơn/tháng`}
                        </span>
                      )}
                      {selectedApp.monthlyAvgGmv && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 border border-emerald-200">
                          💰 GMV: {selectedApp.monthlyAvgGmv}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Campaign Info */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chiến dịch</label>
                <p className="font-semibold text-slate-900 text-sm mt-0.5">{selectedApp.campaignName}</p>
              </div>

              {/* Mẫu sản phẩm KOC đăng ký nhận */}
              {(selectedApp.selectedSampleName || selectedApp.selectedSampleCode) && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 space-y-1.5">
                  <label className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-indigo-600">inventory_2</span>
                    Mẫu sản phẩm KOC yêu cầu nhận
                  </label>
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-indigo-100">
                    {selectedApp.selectedSampleImage ? (
                      <img
                        src={selectedApp.selectedSampleImage}
                        alt={selectedApp.selectedSampleName}
                        className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {selectedApp.selectedSampleCode || 'SP'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-indigo-700">
                          {selectedApp.selectedSampleCode || 'Mẫu'}
                        </span>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {selectedApp.selectedSampleName}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Vui lòng đóng gói và dán nhãn đúng phân loại mẫu trên khi xuất kho gửi KOC.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
                  <p className="font-mono text-sm text-slate-900 font-semibold">{selectedApp.phone}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                  <p className="text-xs text-slate-900 truncate">{selectedApp.email}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ nhận mẫu</label>
                <p className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-0.5">
                  📍 {selectedApp.address}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ý tưởng kịch bản (Concept)</label>
                <p className="text-xs text-slate-700 italic bg-blue-50/50 p-2.5 rounded-lg border border-blue-200 mt-0.5">
                  "{selectedApp.contentConcept}"
                </p>
              </div>

              {/* Video link & views info if submitted */}
              {selectedApp.videoLink && (
                <div className="rounded-xl bg-indigo-50/70 p-3 border border-indigo-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-indigo-600">play_circle</span>
                      Link video nghiệm thu:
                    </span>
                    <a
                      href={selectedApp.videoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-[#6366f1] hover:underline flex items-center gap-0.5"
                    >
                      <span>Xem video</span>
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate font-mono">{selectedApp.videoLink}</p>
                </div>
              )}

              {/* Admin feedback if exists */}
              {selectedApp.adminFeedback && (
                <div className="rounded-xl bg-rose-50 p-3 border border-rose-200 text-xs space-y-1">
                  <span className="font-bold text-rose-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-rose-600">feedback</span>
                    Phản hồi đã gửi KOC:
                  </span>
                  <p className="text-rose-900 bg-white/70 p-2 rounded-lg border border-rose-200/60 font-medium">
                    "{selectedApp.adminFeedback}"
                  </p>
                </div>
              )}

              {/* Status and Shipping Code Edit */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <label className="text-xs font-bold text-slate-700 block">Cập nhật Mã vận đơn gửi hàng</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="VD: GHTK-8492019482"
                    value={editingShippingCode}
                    onChange={(e) => setEditingShippingCode(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedApp.id, selectedApp.status, editingShippingCode);
                      onShowToast('Đã lưu mã vận đơn!', editingShippingCode, 'success');
                    }}
                    className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                  >
                    Lưu mã
                  </button>
                </div>

                <label className="text-xs font-bold text-slate-700 block pt-2">Tình trạng giao quà mẫu</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedApp.id, selectedApp.status, undefined, undefined, 'Đang trung chuyển');
                      onShowToast('Cập nhật thành công', 'Trạng thái vận đơn: Đang trung chuyển', 'info');
                    }}
                    className={`rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer border ${
                      selectedApp.shippingStatus === 'Đang trung chuyển'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🚚 Đang giao hàng
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedApp.id, selectedApp.status, undefined, undefined, 'Đã phát thành công');
                      onShowToast('Đã đánh dấu giao thành công!', 'Hệ thống đã gửi thông báo giục KOC quay video trong 5 - 7 ngày.', 'success');
                    }}
                    className={`rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer border ${
                      selectedApp.shippingStatus === 'Đã phát thành công'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-800'
                    }`}
                    title="Đánh dấu bưu tá đã phát mẫu và kích hoạt thông báo giục KOC làm video 5 - 7 ngày"
                  >
                    📦 Giao thành công (Nhắc video)
                  </button>
                </div>

                <label className="text-xs font-bold text-slate-700 block pt-2">Chuyển trạng thái hồ sơ</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['Chờ duyệt', 'Đã duyệt gửi mẫu', 'Đang giao', 'Chờ duyệt video', 'Đã hoàn thành', 'Bị từ chối'] as ApplicationStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        if (st === 'Bị từ chối' || st === 'Từ chối') {
                          setRejectModalApp(selectedApp);
                          setRejectType('video');
                          setRejectFeedbackText(selectedApp.adminFeedback || '');
                        } else {
                          handleUpdateStatus(selectedApp.id, st);
                        }
                      }}
                      className={`rounded-xl py-2 px-2 text-xs font-bold transition-all cursor-pointer ${
                        selectedApp.status === st
                          ? st === 'Đã hoàn thành'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : st === 'Bị từ chối'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: THÊM CHIẾN DỊCH MỚI (UPLOAD ẢNH TRỰC TIẾP / DÁN ẢNH & XEM BẢN NHÁP)
          ========================================================================= */}
      {isAddCampaignModalOpen && (
        <div
          onPaste={handleImagePaste}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/60">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">campaign</span>
                Tạo Chiến Dịch Mới Cho KOC
              </h3>
              <button
                onClick={() => setIsAddCampaignModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-700">Tên chiến dịch *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Trải nghiệm combo tai nghe & sạc nhanh Tranyoo..."
                  value={newCampaignData.title}
                  onChange={(e) => setNewCampaignData({ ...newCampaignData, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Tên Nhãn Hàng (Brand) *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Tranyoo Vietnam"
                    value={newCampaignData.brandName}
                    onChange={(e) => setNewCampaignData({ ...newCampaignData, brandName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Ngành hàng / Danh mục</label>
                  <select
                    value={newCampaignData.category}
                    onChange={(e) => setNewCampaignData({ ...newCampaignData, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Đồ công nghệ & Setup">Đồ công nghệ & Setup</option>
                    <option value="Thời trang & Phụ kiện">Thời trang & Phụ kiện</option>
                    <option value="Mỹ phẩm & Làm đẹp">Mỹ phẩm & Làm đẹp</option>
                    <option value="Đồ gia dụng & Đời sống">Đồ gia dụng & Đời sống</option>
                    <option value="Mẹ & Bé">Mẹ & Bé</option>
                    <option value="Ẩm thực & F&B">Ẩm thực & F&B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Số lượng mẫu (Spots)</label>
                  <input
                    type="number"
                    min="1"
                    value={newCampaignData.totalSpots}
                    onChange={(e) => setNewCampaignData({ ...newCampaignData, totalSpots: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Hoa hồng (%)</label>
                  <input
                    type="text"
                    value={newCampaignData.commissionRate}
                    onChange={(e) => setNewCampaignData({ ...newCampaignData, commissionRate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Yêu cầu Follower</label>
                  <input
                    type="text"
                    value={newCampaignData.followerRequirement}
                    onChange={(e) => setNewCampaignData({ ...newCampaignData, followerRequirement: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Ngày kết thúc & Thời gian đếm ngược theo thời gian thực */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[17px] text-blue-600">timer</span>
                    <span>Cài đặt thời hạn & Đếm ngược theo thời gian thực</span>
                  </label>
                  <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                    {calculateDaysLeftFromDate(newCampaignData.endDate, newCampaignData.daysLeft) > 0
                      ? `Còn ${calculateDaysLeftFromDate(newCampaignData.endDate, newCampaignData.daysLeft)} ngày`
                      : 'Hết hạn'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                      1. Chọn ngày kết thúc chiến dịch:
                    </span>
                    <input
                      type="date"
                      value={newCampaignData.endDate}
                      onChange={(e) => handleCreateEndDateChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                      2. Hoặc nhập số ngày đếm ngược:
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={newCampaignData.daysLeft}
                      onChange={(e) => handleCreateDaysLeftChange(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* =========================================================================
                  KHU VỰC TẢI ẢNH TRỰC TIẾP HOẶC DÁN (PASTE) TỪ CLIPBOARD
                  ========================================================================= */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ảnh sản phẩm *
                  <span className="font-normal text-slate-400 ml-1">(Tải tệp từ máy tính hoặc nhấn Ctrl+V / Cmd+V để Dán)</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {newCampaignData.productHeroImage ? (
                  <div className="relative rounded-2xl border border-blue-200 bg-blue-50/30 p-3 overflow-hidden">
                    <div className="flex items-center gap-3">
                      <img
                        src={newCampaignData.productHeroImage}
                        alt="Preview"
                        className="h-24 w-32 rounded-xl object-cover border border-slate-200 shadow-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Ảnh đã tải lên thành công!
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Hình ảnh sẽ làm banner đại diện cho chiến dịch trên trang khám phá KOC.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                          >
                            Đổi ảnh khác
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewCampaignData({ ...newCampaignData, productHeroImage: '' })}
                            className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleImageDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="group rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/80 p-6 text-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform mb-2">
                        <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Bấm vào đây để chọn ảnh từ máy tính hoặc kéo thả vào đây
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Hỗ trợ PNG, JPG, WEBP. Hoặc bấm <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-blue-700 font-bold">Ctrl+V</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-blue-700 font-bold">Cmd+V</kbd> để dán ảnh trực tiếp!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* QUẢN LÝ DANH SÁCH MẪU SẢN PHẨM (CHO CHIẾN DỊCH MỚI) */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[17px] text-indigo-600">inventory_2</span>
                      <span>Danh sách mẫu sản phẩm ({newCampaignSamples.length} mẫu) *</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tự do tạo 1 hoặc nhiều mẫu (phân loại màu sắc, mùi hương, dòng sản phẩm) để KOC chọn khi nhận mẫu.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSampleToNewCampaign}
                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>Thêm mẫu</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {newCampaignSamples.map((sample, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3 transition-all hover:border-indigo-300"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                            Mẫu #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={sample.code}
                            onChange={(e) => handleUpdateSampleInNewCampaign(idx, { code: e.target.value })}
                            placeholder="Mã mẫu (VD: M01)"
                            className="w-20 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-mono font-bold text-slate-700 text-center uppercase focus:bg-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        {newCampaignSamples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSampleFromNewCampaign(idx)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                            title="Xóa mẫu này"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            <span>Xóa</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                        {/* Cột tải ảnh mẫu */}
                        <div className="sm:col-span-4">
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Hình ảnh mẫu
                          </label>
                          <input
                            type="file"
                            id={`new-sample-file-${idx}`}
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleNewSampleImageFile(idx, f);
                            }}
                            className="hidden"
                          />
                          {sample.image ? (
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 group h-24 bg-slate-50">
                              <img
                                src={sample.image}
                                alt={sample.name || 'Mẫu SP'}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                                <label
                                  htmlFor={`new-sample-file-${idx}`}
                                  className="px-2 py-1 rounded bg-white text-slate-800 text-[10px] font-bold hover:bg-slate-100 cursor-pointer shadow-xs"
                                >
                                  Đổi ảnh
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSampleInNewCampaign(idx, { image: '' })}
                                  className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 cursor-pointer shadow-xs"
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label
                              htmlFor={`new-sample-file-${idx}`}
                              className="flex flex-col items-center justify-center h-24 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/80 text-center cursor-pointer transition-colors p-2"
                            >
                              <span className="material-symbols-outlined text-[20px] text-indigo-500 mb-0.5">
                                add_photo_alternate
                              </span>
                              <span className="text-[10px] font-bold text-indigo-700">Tải ảnh mẫu</span>
                              <span className="text-[9px] text-slate-400 mt-0.5">Từ máy tính</span>
                            </label>
                          )}
                        </div>

                        {/* Cột tên & mô tả */}
                        <div className="sm:col-span-8 space-y-2">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                              Tên mẫu sản phẩm *
                            </label>
                            <input
                              type="text"
                              required
                              value={sample.name}
                              onChange={(e) => handleUpdateSampleInNewCampaign(idx, { name: e.target.value })}
                              placeholder="VD: Kem dưỡng cấp ẩm 50ml, Son kem #03 Đỏ gạch..."
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                              Mô tả phân loại / Ghi chú (tùy chọn)
                            </label>
                            <input
                              type="text"
                              value={sample.shortDesc || ''}
                              onChange={(e) => handleUpdateSampleInNewCampaign(idx, { shortDesc: e.target.value })}
                              placeholder="VD: Dành cho da dầu mụn / Tặng kèm mút tán..."
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Mô tả sản phẩm & Brief kịch bản</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả các tính năng nổi bật, điểm bán hàng độc nhất (USP) và yêu cầu gắn giỏ hàng..."
                  value={newCampaignData.description}
                  onChange={(e) => setNewCampaignData({ ...newCampaignData, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none resize-none"
                ></textarea>
              </div>

              {/* Nút hành động: Hủy, Xem bản nháp, Đăng chiến dịch */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCampaignModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>

                <div className="flex items-center gap-2">
                  {/* Nút "Xem bản nháp" (Không tự động đăng khi xem) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!newCampaignData.title || !newCampaignData.brandName) {
                        onShowToast('Thiếu thông tin', 'Vui lòng nhập tên chiến dịch và tên nhãn hàng để xem bản nháp', 'warning');
                        return;
                      }
                      setIsPreviewDraftOpen(true);
                    }}
                    className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Xem bản nháp</span>
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                  >
                    Đăng chiến dịch
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CHỈNH SỬA CHIẾN DỊCH (EDIT CAMPAIGN)
          ========================================================================= */}
      {isEditCampaignModalOpen && editingCampaign && (
        <div
          onPaste={handleEditImagePaste}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-blue-50/70">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Chỉnh Sửa Chiến Dịch: {editingCampaign.brandName}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">Mã: {editingCampaign.code}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditCampaignModalOpen(false);
                  setEditingCampaign(null);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditCampaign} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-700">Tên chiến dịch *</label>
                <input
                  type="text"
                  required
                  value={editingCampaign.title}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Tên Nhãn Hàng (Brand) *</label>
                  <input
                    type="text"
                    required
                    value={editingCampaign.brandName}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, brandName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Ngành hàng / Danh mục</label>
                  <select
                    value={editingCampaign.category}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Mỹ phẩm & Chăm sóc da">Mỹ phẩm & Skincare</option>
                    <option value="Chăm sóc cá nhân & Răng miệng">Chăm sóc cá nhân & Răng miệng</option>
                    <option value="Đồ công nghệ & Setup">Đồ công nghệ & Setup</option>
                    <option value="Thời trang & Phụ kiện">Thời trang & Phụ kiện</option>
                    <option value="Đồ gia dụng & Đời sống">Đồ gia dụng & Đời sống</option>
                    <option value="F&B & Đồ uống">F&B & Ăn uống</option>
                    <option value="Mẹ & Bé">Mẹ & Bé</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Tổng số slot</label>
                  <input
                    type="number"
                    min="1"
                    value={editingCampaign.totalSpots}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, totalSpots: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Đã đăng ký</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCampaign.registeredSpots}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, registeredSpots: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Hoa hồng (%)</label>
                  <input
                    type="text"
                    value={editingCampaign.commissionRate || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, commissionRate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Cài đặt thời hạn & Đếm ngược thời gian thực */}
              <div className="rounded-2xl border border-indigo-100 bg-linear-to-r from-blue-50/60 to-indigo-50/60 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">schedule</span>
                    Cài đặt thời gian chiến dịch (Đếm ngược thời gian thực)
                  </label>
                  <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                    {calculateDaysLeftFromDate(editingCampaign.endDate, editingCampaign.daysLeft) > 0
                      ? `Còn ${calculateDaysLeftFromDate(editingCampaign.endDate, editingCampaign.daysLeft)} ngày`
                      : 'Hết hạn'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                      1. Chọn ngày kết thúc chiến dịch:
                    </span>
                    <input
                      type="date"
                      value={editingCampaign.endDate || getDefaultEndDateString(editingCampaign.daysLeft)}
                      onChange={(e) => handleEditEndDateChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                      2. Hoặc chỉnh số ngày đếm ngược:
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={editingCampaign.daysLeft}
                      onChange={(e) => handleEditDaysLeftChange(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Yêu cầu Follower</label>
                  <input
                    type="text"
                    value={editingCampaign.followerRequirement}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, followerRequirement: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                    placeholder="VD: >1.000 Followers"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Quà tặng / Booking Fee</label>
                  <input
                    type="text"
                    value={editingCampaign.bookingFee || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, bookingFee: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                    placeholder="VD: Freecast (Mẫu 0đ)"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Nền tảng</label>
                  <input
                    type="text"
                    value={editingCampaign.platform}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, platform: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                    placeholder="VD: TikTok Shop"
                  />
                </div>
              </div>

              {/* Ảnh sản phẩm (Hero) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ảnh sản phẩm đại diện *
                  <span className="font-normal text-slate-400 ml-1">(Dán ảnh Ctrl+V/Cmd+V hoặc chọn từ máy tính)</span>
                </label>
                <input
                  type="file"
                  ref={editFileInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleEditProcessImageFile(f);
                  }}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {editingCampaign.productHeroImage && (
                    <img
                      src={editingCampaign.productHeroImage}
                      alt="Hero"
                      className="h-20 w-28 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  )}
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      placeholder="Dán URL link ảnh trực tiếp tại đây..."
                      value={editingCampaign.productHeroImage}
                      onChange={(e) => setEditingCampaign({ ...editingCampaign, productHeroImage: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                      Chọn ảnh khác từ máy tính
                    </button>
                  </div>
                </div>
              </div>

              {/* QUẢN LÝ DANH SÁCH MẪU SẢN PHẨM (CHO CHIẾN DỊCH ĐANG CHỈNH SỬA) */}
              <div className="rounded-2xl border-2 border-indigo-200 bg-linear-to-b from-indigo-50/70 to-indigo-50/20 p-4 space-y-3.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-indigo-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                        <span className="material-symbols-outlined text-[17px]">inventory_2</span>
                      </span>
                      <label className="text-sm font-bold text-slate-900">
                        Danh sách mẫu sản phẩm ({editingCampaign.sampleProducts?.length || 0} mẫu) *
                      </label>
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700">
                        Bắt buộc $\ge$ 1 mẫu
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Chỉnh sửa tên, mã mẫu hoặc đổi hình ảnh cho từng mẫu. KOC sẽ nhìn thấy và chọn các mẫu này khi ứng tuyển.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSampleToEditCampaign}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>+ Thêm mẫu mới</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(editingCampaign.sampleProducts || []).map((sample, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border p-3.5 shadow-2xs space-y-3 transition-all ${
                        sample.disabled
                          ? 'border-red-200 bg-red-50/40'
                          : 'border-slate-200 bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                              sample.disabled ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            Mẫu #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={sample.code}
                            onChange={(e) => handleUpdateSampleInEditCampaign(idx, { code: e.target.value })}
                            placeholder="Mã mẫu (VD: M01)"
                            className="w-20 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-mono font-bold text-slate-700 text-center uppercase focus:bg-white focus:border-indigo-500 focus:outline-none"
                          />
                          {sample.disabled && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100/70 px-2 py-0.5 rounded-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                              Tạm dừng nhận mẫu
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {sample.disabled ? (
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateSampleInEditCampaign(idx, { disabled: false });
                                onShowToast('Đã kích hoạt lại mẫu', `Mẫu ${sample.name} đã sẵn sàng nhận KOC đăng ký.`, 'success');
                              }}
                              className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            >
                              <span className="material-symbols-outlined text-[15px]">check_circle</span>
                              <span>Kích hoạt lại</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemoveSampleFromEditCampaign(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                              title="Xóa hoặc ngừng nhận mẫu này"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                              <span>Xóa / Tạm dừng</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                        {/* Cột hình ảnh mẫu */}
                        <div className="sm:col-span-4">
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Hình ảnh mẫu
                          </label>
                          <input
                            type="file"
                            id={`edit-sample-file-${idx}`}
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleEditSampleImageFile(idx, f);
                            }}
                            className="hidden"
                          />
                          {sample.image ? (
                            <div className="relative rounded-xl overflow-hidden border border-slate-200 group h-24 bg-slate-50">
                              <img
                                src={sample.image}
                                alt={sample.name || 'Mẫu SP'}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                                <label
                                  htmlFor={`edit-sample-file-${idx}`}
                                  className="px-2 py-1 rounded bg-white text-slate-800 text-[10px] font-bold hover:bg-slate-100 cursor-pointer shadow-xs"
                                >
                                  Đổi ảnh
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSampleInEditCampaign(idx, { image: '' })}
                                  className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 cursor-pointer shadow-xs"
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label
                              htmlFor={`edit-sample-file-${idx}`}
                              className="flex flex-col items-center justify-center h-24 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/80 text-center cursor-pointer transition-colors p-2"
                            >
                              <span className="material-symbols-outlined text-[20px] text-indigo-500 mb-0.5">
                                add_photo_alternate
                              </span>
                              <span className="text-[10px] font-bold text-indigo-700">Tải ảnh mẫu</span>
                              <span className="text-[9px] text-slate-400 mt-0.5">Từ máy tính</span>
                            </label>
                          )}
                        </div>

                        {/* Cột tên & mô tả */}
                        <div className="sm:col-span-8 space-y-2">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                              Tên mẫu sản phẩm *
                            </label>
                            <input
                              type="text"
                              required
                              value={sample.name}
                              onChange={(e) => handleUpdateSampleInEditCampaign(idx, { name: e.target.value })}
                              placeholder="VD: Kem dưỡng cấp ẩm 50ml, Son kem #03..."
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">
                              Mô tả phân loại / Ghi chú (tùy chọn)
                            </label>
                            <input
                              type="text"
                              value={sample.shortDesc || ''}
                              onChange={(e) => handleUpdateSampleInEditCampaign(idx, { shortDesc: e.target.value })}
                              placeholder="VD: Tone màu ấm / Dung tích 50ml..."
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Album ảnh chi tiết & Moodboard (Gallery Images) */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">photo_library</span>
                      Album ảnh chi tiết & Moodboard ({editingCampaign.galleryImages?.length || 0} ảnh)
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Các ảnh này hiển thị khi KOC bấm "Xem chi tiết" chiến dịch.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={editGalleryFileInputRef}
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) handleEditProcessGalleryImages(files);
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => editGalleryFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">add_photo_alternate</span>
                      <span>+ Thêm từ máy</span>
                    </button>
                  </div>
                </div>

                {/* Dán URL ảnh */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Hoặc dán URL link ảnh cần thêm vào album..."
                    value={editGalleryUrlInput}
                    onChange={(e) => setEditGalleryUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGalleryUrlInEdit();
                      }
                    }}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryUrlInEdit}
                    disabled={!editGalleryUrlInput.trim()}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                  >
                    Thêm link
                  </button>
                </div>

                {/* Thumbnails list */}
                {editingCampaign.galleryImages && editingCampaign.galleryImages.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-48 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                    {editingCampaign.galleryImages.map((imgUrl, gIdx) => (
                      <div
                        key={gIdx}
                        className="group relative h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
                      >
                        <img src={imgUrl} alt={`Ảnh ${gIdx + 1}`} className="h-full w-full object-cover" />
                        <div className="absolute top-1 left-1 rounded bg-black/60 px-1 text-[9px] text-white">
                          #{gIdx + 1}
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCampaign({ ...editingCampaign, productHeroImage: imgUrl });
                              onShowToast('Đã chọn ảnh đại diện!', 'Ảnh này sẽ được dùng làm ảnh chính', 'success');
                            }}
                            className="p-1 rounded bg-amber-400 text-slate-900 hover:bg-amber-300 text-[10px] font-bold cursor-pointer"
                            title="Đặt làm ảnh đại diện chính"
                          >
                            <span className="material-symbols-outlined text-[13px]">star</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryImageInEdit(gIdx)}
                            className="p-1 rounded bg-red-600 text-white hover:bg-red-700 text-[10px] font-bold cursor-pointer"
                            title="Xóa ảnh này khỏi album"
                          >
                            <span className="material-symbols-outlined text-[13px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400">
                    Chưa có ảnh nào trong album chi tiết. Hãy tải ảnh lên hoặc thêm link để KOC xem trọn bộ sản phẩm!
                  </div>
                )}
              </div>

              {/* Links & Zalo group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Link nhóm Zalo hỗ trợ</label>
                  <input
                    type="text"
                    placeholder="https://zalo.me/g/..."
                    value={editingCampaign.zaloGroupUrl || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, zaloGroupUrl: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Link Form đăng ký gốc (nếu có)</label>
                  <input
                    type="text"
                    placeholder="https://forms.gle/..."
                    value={editingCampaign.registrationFormUrl || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, registrationFormUrl: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Yêu cầu video & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Yêu cầu nội dung video</label>
                  <input
                    type="text"
                    placeholder="VD: Review lộ mặt, có lồng tiếng, không lắc SP"
                    value={editingCampaign.contentRequirement || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, contentRequirement: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Hạn nộp video</label>
                  <input
                    type="text"
                    placeholder="VD: 10 ngày từ khi nhận SP"
                    value={editingCampaign.videoDeadline || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, videoDeadline: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Hashtags & Cart Store */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Tên gian hàng TikTok Shop gắn giỏ</label>
                  <input
                    type="text"
                    value={editingCampaign.cartBrandName || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, cartBrandName: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Hashtags (cách nhau bởi dấu phẩy)</label>
                  <input
                    type="text"
                    value={editingCampaign.hashtags?.join(', ') || ''}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                      setEditingCampaign({ ...editingCampaign, hashtags: tags });
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Checkbox Urgent */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgent-edit-checkbox"
                  checked={Boolean(editingCampaign.urgent)}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, urgent: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="urgent-edit-checkbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Đánh dấu là chiến dịch Gấp / Hot (Hiển thị nhãn lửa 🔥)
                </label>
              </div>

              {/* Mô tả */}
              <div>
                <label className="text-xs font-bold text-slate-700">Mô tả chiến dịch</label>
                <textarea
                  rows={3}
                  value={editingCampaign.description || ''}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none resize-none"
                ></textarea>
              </div>

              {/* Actions footer */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditCampaignModalOpen(false);
                    setEditingCampaign(null);
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: XEM BẢN NHÁP CHIẾN DỊCH (DRAFT PREVIEW) - GIAO DIỆN KOC SẼ NHÌN THẤY
          ========================================================================= */}
      {isPreviewDraftOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            {/* Header modal xem trước */}
            <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">preview</span>
                <div>
                  <h3 className="font-extrabold text-sm">Bản Xem Trước Chiến Dịch (Draft Preview)</h3>
                  <p className="text-[11px] text-blue-100">Giao diện mà KOC sẽ nhìn thấy trên hệ thống</p>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewDraftOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Nội dung xem trước y hệt thẻ chiến dịch của KOC */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5 bg-slate-50">
              {/* Thẻ Chiến Dịch KOC Preview */}
              <div className="max-w-md mx-auto rounded-2xl bg-white overflow-hidden shadow-md border border-slate-200">
                <div className="relative h-48 w-full bg-slate-100">
                  <img
                    src={
                      newCampaignData.productHeroImage ||
                      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=60'
                    }
                    alt={newCampaignData.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3 rounded-lg bg-blue-900/80 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white border border-blue-700/40">
                    {newCampaignData.brandName || 'Tên Nhãn Hàng'}
                  </div>
                  <div className="absolute top-3 right-3 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                    Còn {newCampaignData.daysLeft} ngày
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-700">
                    <span className="material-symbols-outlined text-[15px]">category</span>
                    <span>{newCampaignData.category}</span>
                    <span>•</span>
                    <span>{newCampaignData.platform}</span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
                    {newCampaignData.title || 'Tiêu đề chiến dịch mẫu'}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {newCampaignData.description || 'Chưa nhập mô tả chi tiết sản phẩm.'}
                  </p>

                  {/* Tiến độ slot */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Tiến độ nhận mẫu</span>
                      <span>
                        <strong className="text-blue-600">0</strong> / {newCampaignData.totalSpots} slot
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-600 w-0"></div>
                    </div>
                  </div>

                  {/* Quyền lợi tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      🎁 Mẫu thử 0đ
                    </span>
                    <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      📈 {newCampaignData.commissionRate} Hoa hồng
                    </span>
                    <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      💰 {newCampaignData.bookingFee}
                    </span>
                    <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      👤 {newCampaignData.followerRequirement}
                    </span>
                  </div>

                  {/* Nút giả lập KOC bấm */}
                  <div className="pt-2">
                    <div className="w-full rounded-xl bg-blue-600 py-2.5 text-center text-xs font-bold text-white shadow-xs">
                      Đăng Ký Nhận Mẫu Ngay (Giao diện KOC)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal Xem Trước: Quay lại chỉnh sửa hoặc Đăng ngay */}
            <div className="p-4 px-6 bg-white border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsPreviewDraftOpen(false)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Quay lại chỉnh sửa</span>
              </button>

              <button
                type="button"
                onClick={() => handleCreateCampaign()}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">publish</span>
                <span>Xác nhận đăng chiến dịch</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =========================================================================
          MODAL: BÁO CÁO THÁNG DÀNH CHO BAN GIÁM ĐỐC (EXECUTIVE MONTHLY REPORT MODAL)
          ========================================================================= */}
      {isMonthlyReportModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
            {/* Header Modal */}
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-900 to-blue-800 text-white">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-2xl text-blue-300">assessment</span>
                <div>
                  <h3 className="font-extrabold text-base">Báo Cáo Tiếp Thị & Vận Hành KOC ({reportPeriodLabel})</h3>
                  <p className="text-xs text-blue-200">Định dạng tóm tắt điều hành (Executive Summary) nộp Ban Giám Đốc</p>
                </div>
              </div>
              <button
                onClick={() => setIsMonthlyReportModalOpen(false)}
                className="rounded-lg p-1.5 text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Nội dung báo cáo A4 cuộn */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 bg-slate-50/50 text-sm">
              {/* Tiêu đề văn bản */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600">
                      KOCITY • PHÒNG MARKETING & SẢN PHẨM WEB
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      BÁO CÁO HIỆU QUẢ VẬN HÀNH KOC & ĐỀ XUẤT PHÁT TRIỂN WEB
                    </h2>
                    <p className="text-xs text-slate-500">
                      Kỳ báo cáo: <strong>{reportPeriodLabel}</strong> • Tần suất: Theo kỳ chọn của Quản trị viên
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                      <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                      Đạt 94% KPI Kế Hoạch
                    </span>
                  </div>
                </div>

                {/* 4 Chỉ số tài chính & hiệu quả cốt lõi */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                    <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">KOC Đăng Ký</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalApps}</div>
                    <div className="text-[11px] text-blue-600 font-bold mt-0.5">+18.4% tăng trưởng</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                    <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">Video Hoàn Thành</div>
                    <div className="text-2xl font-black text-blue-700 mt-1">{metrics.completedApps}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Tỷ lệ hoàn tất: {metrics.totalApps > 0 ? Math.round((metrics.completedApps / metrics.totalApps) * 100) : 0}%
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                    <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">Ngân Sách Mẫu Chi</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">
                      {(metrics.totalSampleBudget / 1000000).toFixed(1)}Tr
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">Giá trị sản phẩm mẫu</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                    <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">Lượt Xem Tạo Ra</div>
                    <div className="text-2xl font-black text-blue-700 mt-1">
                      {(metrics.estimatedViews / 1000).toLocaleString('vi-VN')}K
                    </div>
                    <div className="text-[11px] text-blue-600 font-bold mt-0.5">
                      CPV: ~{metrics.costPerView}đ / view
                    </div>
                  </div>
                </div>
              </div>

              {/* Phần 1: Tóm tắt kết quả tiếp thị & ROI */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">verified</span>
                  1. Tóm Tắt Kết Quả Tiếp Thị & ROI (Executive Summary)
                </h4>
                <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  <p>
                    • Trong kỳ báo cáo ({reportPeriodLabel}), nền tảng đã thu hút thành công <strong>{metrics.uniqueKOCs} KOC độc lập</strong> ứng tuyển, triển khai qua <strong>{metrics.totalActiveCampaigns} chiến dịch</strong> hợp tác với các nhãn hàng công nghệ và đời sống.
                  </p>
                  <p>
                    • <strong>Hiệu quả kinh tế vượt trội:</strong> Với tổng ngân sách phát mẫu thử là <strong>{(metrics.totalSampleBudget).toLocaleString('vi-VN')} VNĐ</strong>, chiến dịch đã mang về ước tính <strong>{(metrics.estimatedViews).toLocaleString('vi-VN')} lượt xem tự nhiên</strong> trên TikTok. Chi phí trên mỗi lượt xem (CPV) đạt mức <strong>{metrics.costPerView} VNĐ/view</strong>, giúp công ty tiết kiệm <strong>82% chi phí</strong> so với việc chạy quảng cáo TikTok Ads trả phí thông thường (CPV thị trường dao động 80 - 150 VNĐ).
                  </p>
                  <p>
                    • <strong>Tỷ lệ giữ chân KOC (Retention Rate):</strong> Đạt <strong>{metrics.retentionRate}%</strong> KOC quay lại nhận mẫu chiến dịch thứ hai trên hệ thống, chứng minh sức hút của mô hình Freecast (Mẫu 0đ) và trải nghiệm website.
                  </p>
                </div>
              </div>

              {/* Phần 2: Phân tích điểm nghẽn rời bỏ & Rủi ro */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">warning</span>
                  2. Phân Tích Điểm Nghẽn Rơi Bỏ (Drop-off Analysis) & Rủi Ro Vận Hành
                </h4>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">
                      A. Điểm rơi rụng ở khâu nộp đơn (Rớt {metrics.dropOffRate}%):
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Có <strong>{metrics.rejectedApps} hồ sơ KOC</strong> bị từ chối cấp mẫu. Nguyên nhân chính: 48% do follower kênh TikTok chưa đạt điều kiện tối thiểu (&lt; 1.000 follow); 32% do định hướng kênh không phù hợp với brief sản phẩm.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                    <div className="font-bold text-blue-900 mb-1">
                      B. Rủi ro trễ hạn nộp video nghiệm thu (Có {metrics.overdueAppsList.length} ca cần theo dõi):
                    </div>
                    <p className="text-[11px] text-blue-800">
                      Có {metrics.overdueAppsList.length} KOC đã nhận sản phẩm mẫu quá 7 ngày nhưng chưa hoàn thành nộp link video. Đội ngũ Marketing đang liên hệ trực tiếp qua Zalo/Điện thoại để giục bài và thu hồi tài sản nếu cần thiết.
                    </p>
                  </div>
                </div>
              </div>

              {/* Phần 3: Đề xuất nghiên cứu tính năng mới cho Web */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">rocket_launch</span>
                  3. Đề Xuất Phát Triển Tính Năng Web Mới (Product Roadmap)
                </h4>
                <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  <p>
                    <strong>1. Tính năng Smart Eligibility Filter (Bộ lọc tự động đủ điều kiện):</strong> Hệ thống tự động kiểm tra số lượng follower của KOC ngay khi họ nhập link TikTok. Nếu chưa đủ tiêu chuẩn, chặn nộp form ngay từ đầu. <em>(Mục tiêu: Giảm 70% tải duyệt tay hồ sơ cho Admin).</em>
                  </p>
                  <p>
                    <strong>2. Tích hợp Bot Zalo Thông Báo Tự Động:</strong> Tự động kích hoạt tin nhắn Zalo gửi KOC ngay khi bưu tá báo giao hàng thành công, đính kèm hướng dẫn quay video và link nộp bài. <em>(Mục tiêu: Kéo giảm tỷ lệ trễ hạn từ 25% xuống dưới 8%).</em>
                  </p>
                  <p>
                    <strong>3. Hệ thống KOC Tín Nhiệm & Huy Hiệu KOC Thân Thiết (⭐):</strong> Nhận diện và gắn huy hiệu ⭐ kèm số lượng chiến dịch hoàn thành đúng hạn để Quản trị viên ưu tiên duyệt đơn nhanh thủ công (không tự động duyệt nhằm giữ vững quyền kiểm soát chất lượng 100%). <em>(Mục tiêu: Tăng tỷ lệ Retention KOC lên trên 40%).</em>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Modal: Hành động Tải Excel & In PDF */}
            <div className="p-4 px-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium">
                Sẵn sàng xuất file để đính kèm email hoặc in trực tiếp nộp Ban Giám Đốc
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">table_view</span>
                  <span>Tải File Excel (.csv)</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>In Báo Cáo / Lưu PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMonthlyReportModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer whitespace-nowrap"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TỪ CHỐI VIDEO / HỒ SƠ & GỬI FEEDBACK GÓP Ý CHO KOC
          ========================================================================= */}
      {rejectModalApp && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-xs">
                  <span className="material-symbols-outlined text-xl">rate_review</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {rejectType === 'video' ? 'Từ chối Video & Gửi Feedback' : 'Từ chối Hồ sơ & Gửi Feedback'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Phản hồi sẽ được hiển thị trực tiếp tại trang "Chiến dịch của tôi" của KOC
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setRejectModalApp(null);
                  setRejectFeedbackText('');
                }}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* KOC & Video Information Card */}
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={rejectModalApp.avatar}
                    alt={rejectModalApp.kocName}
                    className="h-9 w-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{rejectModalApp.kocName}</p>
                    <p className="text-[11px] text-blue-600 font-semibold">{rejectModalApp.tiktokHandle}</p>
                  </div>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {rejectModalApp.code}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-slate-600">Chiến dịch: <b className="text-slate-800">{rejectModalApp.campaignName}</b></span>
                {rejectModalApp.videoLink && (
                  <a
                    href={rejectModalApp.videoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#6366f1] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Xem video nộp</span>
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Templates Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                💡 Chọn nhanh lý do / góp ý mẫu:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Video chưa chèn hashtag hoặc tag kênh thương hiệu theo brief',
                  'Thiếu phân cảnh unbox và trải nghiệm thực tế sản phẩm',
                  'Chưa gắn link giỏ hàng TikTok Shop / chưa cấp mã Spark Ads',
                  'Chất lượng âm thanh/hình ảnh chưa rõ nét hoặc dính bản quyền âm nhạc',
                  'Chưa nêu bật tính năng cốt lõi và chương trình ưu đãi của Brand',
                ].map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (rejectFeedbackText) {
                        setRejectFeedbackText((prev) => `${prev}. ${tmpl}`);
                      } else {
                        setRejectFeedbackText(tmpl);
                      }
                    }}
                    className="text-[11px] rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 px-2.5 py-1 text-slate-700 transition-colors text-left cursor-pointer"
                  >
                    + {tmpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea for Feedback */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nội dung Feedback gửi cho KOC <span className="text-rose-600">*</span>:
              </label>
              <textarea
                rows={4}
                value={rejectFeedbackText}
                onChange={(e) => setRejectFeedbackText(e.target.value)}
                placeholder="Nhập chi tiết yêu cầu sửa đổi để KOC nắm rõ và quay/sửa lại video (Ví dụ: Bạn bổ sung thêm phân cảnh trải nghiệm thực tế và gắn link giỏ hàng nhé)..."
                className="w-full rounded-2xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 focus:outline-none transition-all leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                KOC sẽ nhận thông báo chuông và thấy lời nhắn này tại trang "Chiến dịch của tôi" kèm nút nộp lại video đã sửa.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setRejectModalApp(null);
                  setRejectFeedbackText('');
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!rejectFeedbackText.trim()) {
                    onShowToast('Vui lòng nhập feedback!', 'Cần nhập lý do hoặc chọn mẫu phản hồi để KOC biết cách chỉnh sửa.', 'warning');
                    return;
                  }
                  handleUpdateStatus(
                    rejectModalApp.id,
                    rejectType === 'video' ? 'Bị từ chối' : 'Từ chối',
                    undefined,
                    rejectFeedbackText.trim()
                  );
                  setRejectModalApp(null);
                  setRejectFeedbackText('');
                  onShowToast(
                    'Đã từ chối & gửi feedback!',
                    'Trạng thái tại trang KOC đã cập nhật thành "Bị từ chối" cùng phản hồi của bạn.',
                    'success'
                  );
                }}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-500/20 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Xác nhận Từ chối & Gửi phản hồi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
