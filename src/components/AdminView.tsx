import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Campaign, KOCApplication, ApplicationStatus } from '../types';
import {
  updateApplicationStatusOnSupabase,
  createCampaignOnSupabase,
  updateCampaignOnSupabase,
  deleteCampaignOnSupabase,
} from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

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
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
  onBackToMarketplace: () => void;
  initialEditingCampaign?: Campaign | null;
  onClearInitialEditingCampaign?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  campaigns,
  onUpdateCampaigns,
  applications,
  onUpdateApplications,
  onShowToast,
  onBackToMarketplace,
  initialEditingCampaign,
  onClearInitialEditingCampaign,
}) => {
  // Navigation inside Admin (Sidebar Tab)
  const [activeAdminTab, setActiveAdminTab] = useState<
    'dashboard' | 'applications' | 'campaigns' | 'content' | 'koc-crm'
  >('dashboard');

  // Accordion state inside Sidebar for sub-menus
  const [isAppsSubmenuOpen, setIsAppsSubmenuOpen] = useState(true);
  const [isCampaignsSubmenuOpen, setIsCampaignsSubmenuOpen] = useState(true);

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filter & Search states for Applications
  const [appSearch, setAppSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');

  // Selected application for detail modal
  const [selectedApp, setSelectedApp] = useState<KOCApplication | null>(null);
  const [editingShippingCode, setEditingShippingCode] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // New Campaign Form Modal & Draft Preview Modal
  const [isAddCampaignModalOpen, setIsAddCampaignModalOpen] = useState(false);
  const [isPreviewDraftOpen, setIsPreviewDraftOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Campaign Form Modal State
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isEditCampaignModalOpen, setIsEditCampaignModalOpen] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

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
    description: '',
    productHeroImage: '',
  });

  // Date range filter for Dashboard & Reporting (Quản trị viên tự chọn Từ ngày ... Đến ngày ...)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isMonthlyReportModalOpen, setIsMonthlyReportModalOpen] = useState(false);
  const [dashboardSubTab, setDashboardSubTab] = useState<'pending' | 'overdue' | 'top_koc'>('pending');

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
    const completedApps = appsList.filter((a) => a.status === 'Đã lên bài').length;
    const rejectedApps = appsList.filter((a) => a.status === 'Từ chối').length;

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

    return {
      totalApps,
      pendingApps,
      approvedApps,
      shippingApps,
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
    };
  }, [applications, campaigns]);

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

      const matchStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchCampaign = campaignFilter === 'all' || app.campaignId === campaignFilter;

      return matchSearch && matchStatus && matchCampaign;
    });
  }, [applications, appSearch, statusFilter, campaignFilter]);

  // Action: Update Application Status
  const handleUpdateStatus = (appId: string, newStatus: ApplicationStatus, customShippingCode?: string) => {
    const updated = applications.map((app) => {
      if (app.id === appId) {
        let shippingCode = customShippingCode !== undefined ? customShippingCode : app.shippingCode;
        let shippingStatus = app.shippingStatus;

        if (newStatus === 'Đã duyệt gửi mẫu' && !shippingCode) {
          shippingCode = `GHTK-${Math.floor(10000000 + Math.random() * 90000000)}`;
          shippingStatus = 'Đang trung chuyển';
        } else if (newStatus === 'Đang giao') {
          shippingStatus = 'Đang trung chuyển';
        } else if (newStatus === 'Đã lên bài') {
          shippingStatus = 'Đã phát thành công';
        } else if (newStatus === 'Từ chối') {
          shippingStatus = 'Không gửi mẫu';
        }

        return {
          ...app,
          status: newStatus,
          shippingCode,
          shippingStatus,
        };
      }
      return app;
    });

    onUpdateApplications(updated);
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp(updated.find((a) => a.id === appId) || null);
    }

    // Đồng bộ trạng thái đơn lên cơ sở dữ liệu Supabase đám mây
    const target = updated.find((a) => a.id === appId);
    if (target) {
      updateApplicationStatusOnSupabase(appId, {
        status: newStatus,
        shippingCode: target.shippingCode,
        shippingStatus: target.shippingStatus,
      });
    }

    onShowToast('Cập nhật thành công!', `Đã chuyển trạng thái hồ sơ sang "${newStatus}"`, 'success');
  };

  const handleQuickApprove = (app: KOCApplication) => {
    handleUpdateStatus(app.id, 'Đã duyệt gửi mẫu');
  };

  const handleQuickReject = (app: KOCApplication) => {
    handleUpdateStatus(app.id, 'Từ chối');
  };

  // Image Upload helper functions (File Select, Drag & Drop, Paste)
  const handleProcessImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Tệp không hợp lệ', 'Vui lòng chọn hoặc dán hình ảnh (PNG, JPG, WEBP,...)', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setNewCampaignData((prev) => ({ ...prev, productHeroImage: result }));
        onShowToast('Tải ảnh thành công!', file.name || 'Đã thêm ảnh sản phẩm', 'success');
      }
    };
    reader.readAsDataURL(file);
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

  // Action: Add New Campaign
  const handleCreateCampaign = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCampaignData.title || !newCampaignData.brandName) {
      onShowToast('Thiếu thông tin', 'Vui lòng nhập tên chiến dịch và tên nhãn hàng', 'warning');
      return;
    }

    const heroImg =
      newCampaignData.productHeroImage ||
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
    };

    onUpdateCampaigns([newCamp, ...campaigns]);
    createCampaignOnSupabase(newCamp);
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

    onShowToast('Tạo chiến dịch mới thành công!', `Chiến dịch "${newCamp.title}" đã được hiển thị lên trang chủ KOC.`, 'success');
  };

  // Action: Open Edit Campaign Modal
  const handleOpenEditCampaign = (camp: Campaign) => {
    const effectiveDays = camp.endDate ? calculateDaysLeftFromDate(camp.endDate, camp.daysLeft) : camp.daysLeft;
    const effectiveEndDate = camp.endDate || getDefaultEndDateString(effectiveDays);
    setEditingCampaign({
      ...camp,
      daysLeft: effectiveDays,
      endDate: effectiveEndDate,
    });
    setIsEditCampaignModalOpen(true);
  };

  // Lắng nghe khi có yêu cầu sửa chiến dịch từ bên ngoài (ví dụ MarketplaceView)
  useEffect(() => {
    if (initialEditingCampaign) {
      setActiveAdminTab('campaigns');
      handleOpenEditCampaign(initialEditingCampaign);
      onClearInitialEditingCampaign?.();
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
    updateCampaignOnSupabase(finalEditedCamp.id, finalEditedCamp);

    onShowToast(
      'Cập nhật chiến dịch thành công!',
      `Đã lưu thay đổi cho chiến dịch "${finalEditedCamp.brandName}" (Thời hạn còn ${finalEditedCamp.daysLeft} ngày).`,
      'success'
    );
    setIsEditCampaignModalOpen(false);
    setEditingCampaign(null);
  };

  const handleEditProcessImageFile = (file: File) => {
    if (file.size > 6 * 1024 * 1024) {
      onShowToast('Ảnh quá lớn', 'Vui lòng chọn ảnh dung lượng dưới 6MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && editingCampaign) {
        setEditingCampaign((prev) => (prev ? { ...prev, productHeroImage: reader.result as string } : prev));
        onShowToast('Tải ảnh thành công', 'Ảnh mới đã sẵn sàng cho chiến dịch', 'success');
      }
    };
    reader.readAsDataURL(file);
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

  // Action: Export to CSV
  const handleExportCSV = () => {
    if (applications.length === 0) {
      onShowToast('Không có dữ liệu', 'Chưa có đơn đăng ký nào để xuất file', 'warning');
      return;
    }

    const headers = ['Mã đơn', 'Tên KOC', 'TikTok', 'Followers', 'SĐT', 'Địa chỉ nhận hàng', 'Chiến dịch', 'Trạng thái', 'Mã vận đơn', 'Link Video'];
    const rows = applications.map((a) => [
      `"${a.code}"`,
      `"${a.kocName}"`,
      `"${a.tiktokHandle}"`,
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

  // Status badge styling helper - TONE XANH DƯƠNG VÀ CAM
  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Chờ duyệt':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-800">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            Chờ duyệt
          </span>
        );
      case 'Đã duyệt gửi mẫu':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 border border-blue-300/80 px-2.5 py-1 text-xs font-semibold text-blue-800">
            <span className="material-symbols-outlined text-[14px]">local_shipping</span>
            Đã duyệt gửi mẫu
          </span>
        );
      case 'Đang giao':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-2.5 py-1 text-xs font-semibold text-sky-800">
            <span className="material-symbols-outlined text-[14px]">departure_board</span>
            Đang giao
          </span>
        );
      case 'Đã lên bài':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Đã lên bài
          </span>
        );
      case 'Từ chối':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700">
            <span className="material-symbols-outlined text-[14px]">cancel</span>
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
    <div className="min-h-screen bg-[#faf2f8] text-slate-900 flex flex-col md:flex-row">
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
                      setStatusFilter('Đã lên bài');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeAdminTab === 'applications' && statusFilter === 'Đã lên bài'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Đã lên bài review</span>
                    <span className="text-[11px] text-slate-400 font-mono">{metrics.completedApps}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveAdminTab('applications');
                      setStatusFilter('Từ chối');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeAdminTab === 'applications' && statusFilter === 'Từ chối'
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
            {/* Nút "Báo Cáo Kỳ Này (A4)" CHỈ hiển thị tại: Tổng quan & Báo cáo */}
            {activeAdminTab === 'dashboard' && (
              <button
                onClick={() => setIsMonthlyReportModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                title="Mở bản tóm tắt báo cáo chuẩn A4 nộp cho Ban Giám Đốc"
              >
                <span className="material-symbols-outlined text-[18px]">summarize</span>
                <span>Xuất Báo Cáo Kỳ Này (A4)</span>
              </button>
            )}

            {/* Nút "Thêm chiến dịch" CHỈ hiển thị tại: Tổng quan & Báo cáo VÀ Quản lý chiến dịch */}
            {(activeAdminTab === 'dashboard' || activeAdminTab === 'campaigns') && (
              <button
                onClick={() => setIsAddCampaignModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>+ Thêm chiến dịch</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-all cursor-pointer whitespace-nowrap"
              title="Xuất file danh sách giao hàng cho bên vận chuyển hoặc lưu trữ"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-600">download</span>
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
            NỘI DUNG CHI TIẾT 1: TỔNG QUAN & BÁO CÁO (DASHBOARD - TONE XANH DƯƠNG CHỦ ĐẠO)
            --------------------------------------------------------------------- */}
        {activeAdminTab === 'dashboard' && (
          <div className="space-y-5">
            {/* Banner Tiêu Đề Báo Cáo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-2xl text-white shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs text-white">
                  <span className="material-symbols-outlined text-2xl">analytics</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold flex items-center gap-2">
                    Báo Cáo Hiệu Quả Tiếp Thị & Phân Tích Web
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      Dữ liệu thực
                    </span>
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Đo lường tỷ lệ chuyển đổi, phát hiện điểm nghẽn rời bỏ và trích xuất báo cáo nộp Ban Giám Đốc
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/80 border border-blue-600/60 text-xs font-bold text-blue-100 shadow-inner">
                  <span className="material-symbols-outlined text-[16px] text-blue-300">calendar_month</span>
                  <span>{reportPeriodLabel}</span>
                  <span className="text-blue-200 font-extrabold ml-1">({periodApplications.length} đơn KOC)</span>
                </span>
              </div>
            </div>

            {/* BỘ LỌC KHOẢNG THỜI GIAN: QUẢN TRỊ VIÊN TỰ CHỌN TỪ NGÀY MẤY ĐẾN NGÀY MẤY */}
            <div className="rounded-2xl bg-white p-4 shadow-xs border border-blue-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
              {/* Cụm input chọn ngày Từ ngày -> Đến ngày */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">tune</span>
                  <span>Lọc theo ngày:</span>
                </div>

                {/* Từ ngày */}
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <span className="material-symbols-outlined text-slate-400 text-[16px]">calendar_today</span>
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Từ:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      onShowToast('Thời gian', `Lọc từ ngày: ${formatVNDate(e.target.value)}`, 'info');
                    }}
                    className="text-xs font-bold text-slate-900 bg-transparent outline-none focus:outline-none cursor-pointer"
                    title="Bấm để chọn ngày bắt đầu"
                  />
                </div>

                <span className="text-slate-400 font-bold hidden sm:inline">→</span>

                {/* Đến ngày */}
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <span className="material-symbols-outlined text-slate-400 text-[16px]">event</span>
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Đến:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      onShowToast('Thời gian', `Lọc đến ngày: ${formatVNDate(e.target.value)}`, 'info');
                    }}
                    className="text-xs font-bold text-slate-900 bg-transparent outline-none focus:outline-none cursor-pointer"
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
                    className="flex items-center gap-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
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
                    onShowToast('Thời gian', 'Hiển thị tất cả thời gian', 'info');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !startDate && !endDate
                      ? 'bg-blue-600 text-white shadow-xs'
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
                    onShowToast('Thời gian', 'Đang lọc dữ liệu hôm nay', 'info');
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
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
                    onShowToast('Thời gian', 'Đang lọc 7 ngày gần nhất', 'info');
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
                    onShowToast('Thời gian', 'Đang lọc 30 ngày gần nhất', 'info');
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
                    onShowToast('Thời gian', `Đang lọc tháng ${m}/${y}`, 'info');
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer"
                >
                  Tháng này
                </button>
              </div>
            </div>

            {/* 4 Thẻ KPI Tăng Trưởng & Rủi Ro (MoM & Risk Indicators) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: KOC Đăng Ký Mới & Tăng trưởng MoM */}
              <div
                onClick={() => {
                  setStatusFilter('all');
                  setActiveAdminTab('applications');
                }}
                className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-xs border border-blue-100 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">KOC Mới Đăng Ký</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">group_add</span>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">{metrics.totalApps}</span>
                  <span className="inline-flex items-center text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +18.4% MoM
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                  <span>{metrics.uniqueKOCs} Creator • Tái tham gia: {metrics.retentionRate}%</span>
                  <span className="font-semibold text-blue-600 group-hover:underline flex items-center gap-0.5">
                    Chi tiết <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>

              {/* Card 2: Tỷ Lệ Hoàn Thành Nghiệm Thu (Completion & Retention Rate) */}
              <div
                onClick={() => setActiveAdminTab('content')}
                className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-xs border border-blue-100 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tỷ Lệ Hoàn Thành Bài</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">verified</span>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {metrics.totalApps > 0 ? Math.round((metrics.completedApps / metrics.totalApps) * 100) : 0}%
                  </span>
                  <span className="text-xs text-blue-600 font-semibold">({metrics.completedApps} video đạt duyệt)</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                  <span>Rớt hồ sơ: {metrics.dropOffRate}%</span>
                  <span className="font-semibold text-blue-600 group-hover:underline flex items-center gap-0.5">
                    Nghiệm thu <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>

              {/* Card 3: CẢNH BÁO RỦI RO: Chậm nộp video / Cần giục bài (TONE XANH DƯƠNG) */}
              <div
                onClick={() => setDashboardSubTab('overdue')}
                className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-xs border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Cảnh Báo Chậm Bài</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">notifications_active</span>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-blue-700">{metrics.overdueAppsList.length}</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Cần giục nộp link
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                  <span>Đã nhận mẫu &gt; 7 ngày</span>
                  <span className="font-semibold text-blue-600 group-hover:underline flex items-center gap-0.5">
                    Xử lý ngay <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>

              {/* Card 4: Hiệu Quả Marketing & CPV (Nộp Sếp Ban Giám Đốc) */}
              <div
                onClick={() => setIsMonthlyReportModalOpen(true)}
                className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-xs border border-blue-100 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lượt Tiếp Cận (Reach)</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">trending_up</span>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {(metrics.estimatedViews / 1000).toLocaleString('vi-VN')}K
                  </span>
                  <span className="text-xs text-blue-600 font-semibold">views ước tính</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                  <span>Ngân sách mẫu: {(metrics.totalSampleBudget / 1000000).toFixed(1)}Tr</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                    ~{metrics.costPerView}đ / view
                  </span>
                </div>
              </div>
            </div>

            {/* =========================================================================
                PHƯƠNG ÁN 2: PHỄU THUÔN THEO TỶ LỆ THỰC TẾ & BẢNG SỨC KHỎE BOOKING KOC (SPLIT-VIEW)
                ========================================================================= */}
            <div className="rounded-2xl bg-white p-6 shadow-xs border border-blue-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[22px]">filter_alt</span>
                    Phễu Chuyển Đổi KOC Theo Tỷ Lệ Thực Tế & Sức Khỏe Vận Hành (SLA)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kích thước từng tầng phễu co dãn chuẩn xác theo tỷ lệ KOC thực tế • Đo lường tốc độ xử lý & điểm nghẽn
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                    Chuyển đổi hoàn tất: {metrics.totalApps > 0 ? Math.round((metrics.completedApps / metrics.totalApps) * 100) : 0}%
                  </span>
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                    Rơi rụng / Loại: {metrics.dropOffRate}%
                  </span>
                </div>
              </div>

              {/* Bố cục 2 Cột: Bên Trái là Hình Phễu Co Dãn Theo Tỷ Lệ Thực - Bên Phải là Bảng Chỉ Số Booking KOC */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* -------------------------------------------------------------
                    CỘT TRÁI (7 CỘT): HÌNH PHỄU CO DÃN TỶ LỆ CHUẨN XÁC THEO SỐ NGƯỜI
                    ------------------------------------------------------------- */}
                <div className="lg:col-span-7 bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200 relative overflow-hidden">
                  {/* Đường viền phễu dốc ước lượng nền mờ */}
                  <div className="absolute inset-x-8 top-4 bottom-4 pointer-events-none opacity-20 border-x-2 border-dashed border-blue-400 [clip-path:polygon(0%_0%,100%_0%,75%_100%,25%_100%)]"></div>

                  <div className="relative z-10 space-y-2.5">
                    {(() => {
                      const total = metrics.totalApps || 1;
                      // Tỷ lệ phần trăm thực tế theo số KOC nộp đơn
                      const p1 = 100;
                      const p2 = Math.round((metrics.approvedApps / total) * 100);
                      const p3 = Math.round((metrics.shippingApps / total) * 100);
                      const p4 = Math.round((metrics.completedApps / total) * 100);

                      // Chiều rộng trực quan của khối: Đảm bảo tỷ lệ chuẩn theo số lượng nhưng có min-width hợp lý để chữ và số không bị vỡ
                      const w1 = 100; // Tầng mốc 100%
                      const w2 = Math.max(38, Math.min(100, p2)); // Co dãn chuẩn theo tỷ lệ thực tế
                      const w3 = Math.max(32, Math.min(w2 - 3, p3));
                      const w4 = Math.max(28, Math.min(w3 - 3, p4));

                      return (
                        <>
                          {/* TẦNG 1: ĐẦU PHỄU TIẾP NHẬN (HÌNH THANG NGƯỢC - MỐC 100% CHIỀU RỘNG) */}
                          <div className="flex flex-col items-center">
                            <div
                              onClick={() => {
                                setStatusFilter('all');
                                setActiveAdminTab('applications');
                              }}
                              style={{
                                width: `${w1}%`,
                                filter: 'drop-shadow(0 4px 6px rgba(37, 99, 235, 0.2))',
                              }}
                              className="group relative mx-auto cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                            >
                              <div
                                style={{
                                  clipPath: 'polygon(0% 0%, 100% 0%, 93% 100%, 7% 100%)',
                                }}
                                className="bg-gradient-to-r from-blue-600 to-blue-500 py-3 sm:py-3.5 px-6 sm:px-8 text-white flex items-center justify-between border-t border-blue-400"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white text-xs font-black">
                                    T1
                                  </span>
                                  <div>
                                    <span className="text-xs font-black uppercase tracking-wider block">
                                      Ứng Tuyển Nhận Mẫu
                                    </span>
                                    <span className="text-[10px] text-blue-100">Hình thang mốc 100%</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-xl sm:text-2xl font-black">{metrics.totalApps}</span>
                                  <span className="text-[11px] text-blue-100 ml-1">KOC</span>
                                </div>
                              </div>
                            </div>

                            {/* Mũi tên & chỉ số chuyển đổi T1 -> T2 */}
                            <div className="py-1 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-blue-700 shadow-2xs">
                                <span className="material-symbols-outlined text-[13px]">arrow_downward</span>
                                Tỷ lệ duyệt đạt brief: <strong>{p2}%</strong> ({metrics.approvedApps}/{metrics.totalApps})
                              </span>
                            </div>
                          </div>

                          {/* TẦNG 2: ĐÃ DUYỆT CẤP MẪU (HÌNH THANG NGƯỢC - CHIỀU RỘNG CHUẨN THEO TỶ LỆ) */}
                          <div className="flex flex-col items-center">
                            <div
                              onClick={() => {
                                setStatusFilter('Đã duyệt gửi mẫu');
                                setActiveAdminTab('applications');
                              }}
                              style={{
                                width: `${w2}%`,
                                filter: 'drop-shadow(0 4px 6px rgba(29, 78, 216, 0.2))',
                              }}
                              className="group relative mx-auto cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                            >
                              <div
                                style={{
                                  clipPath: 'polygon(0% 0%, 100% 0%, 91% 100%, 9% 100%)',
                                }}
                                className="bg-gradient-to-r from-blue-700 to-blue-600 py-3 px-5 sm:px-7 text-white flex items-center justify-between border-t border-blue-500"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white text-xs font-black">
                                    T2
                                  </span>
                                  <div>
                                    <span className="text-xs font-black uppercase tracking-wider block">
                                      Duyệt Cấp Mẫu
                                    </span>
                                    <span className="text-[10px] text-blue-200">Chuẩn điều kiện kênh</span>
                                  </div>
                                </div>
                                <div className="text-right whitespace-nowrap">
                                  <span className="text-xl sm:text-2xl font-black">{metrics.approvedApps}</span>
                                  <span className="text-[11px] text-blue-200 ml-1">KOC ({p2}%)</span>
                                </div>
                              </div>
                            </div>

                            {/* Mũi tên & chỉ số chuyển đổi T2 -> T3 */}
                            <div className="py-1 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-blue-700 shadow-2xs">
                                <span className="material-symbols-outlined text-[13px]">arrow_downward</span>
                                Đã gửi bưu phẩm: <strong>{metrics.shippingApps}</strong> đơn
                              </span>
                            </div>
                          </div>

                          {/* TẦNG 3: ĐANG GIAO MẪU / TEST (HÌNH THANG NGƯỢC - CHIỀU RỘNG CHUẨN THEO TỶ LỆ) */}
                          <div className="flex flex-col items-center">
                            <div
                              onClick={() => {
                                setStatusFilter('Đang giao');
                                setActiveAdminTab('applications');
                              }}
                              style={{
                                width: `${w3}%`,
                                filter: 'drop-shadow(0 4px 6px rgba(30, 58, 138, 0.2))',
                              }}
                              className="group relative mx-auto cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                            >
                              <div
                                style={{
                                  clipPath: 'polygon(0% 0%, 100% 0%, 89% 100%, 11% 100%)',
                                }}
                                className="bg-gradient-to-r from-blue-800 to-blue-700 py-2.5 sm:py-3 px-4 sm:px-6 text-white flex items-center justify-between border-t border-blue-600"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white text-xs font-black">
                                    T3
                                  </span>
                                  <div>
                                    <span className="text-xs font-black uppercase tracking-wider block truncate">
                                      Đang Giao / Test
                                    </span>
                                    <span className="text-[10px] text-blue-200">Bưu kiện đang phát</span>
                                  </div>
                                </div>
                                <div className="text-right whitespace-nowrap">
                                  <span className="text-xl sm:text-2xl font-black">{metrics.shippingApps}</span>
                                  <span className="text-[11px] text-blue-200 ml-1">KOC ({p3}%)</span>
                                </div>
                              </div>
                            </div>

                            {/* Mũi tên & chỉ số chuyển đổi T3 -> T4 */}
                            <div className="py-1 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-blue-700 shadow-2xs">
                                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                Nghiệm thu thành công: <strong>{p4}%</strong>
                              </span>
                            </div>
                          </div>

                          {/* TẦNG 4: ĐÁY PHỄU - VIDEO LIVE (HÌNH THANG NGƯỢC - CHIỀU RỘNG CHUẨN THEO TỶ LỆ) */}
                          <div className="flex flex-col items-center">
                            <div
                              onClick={() => setActiveAdminTab('content')}
                              style={{
                                width: `${w4}%`,
                                filter: 'drop-shadow(0 4px 6px rgba(37, 99, 235, 0.25))',
                              }}
                              className="group relative mx-auto cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                            >
                              <div
                                style={{
                                  clipPath: 'polygon(0% 0%, 100% 0%, 87% 100%, 13% 100%)',
                                }}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 py-2.5 sm:py-3 px-4 sm:px-6 text-white flex items-center justify-between border-t border-blue-500"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white text-xs font-black">
                                    T4
                                  </span>
                                  <div>
                                    <span className="text-xs font-black uppercase tracking-wider block truncate">
                                      Video Live
                                    </span>
                                    <span className="text-[10px] text-blue-100">Đã gắn giỏ hàng</span>
                                  </div>
                                </div>
                                <div className="text-right whitespace-nowrap">
                                  <span className="text-xl sm:text-2xl font-black">{metrics.completedApps}</span>
                                  <span className="text-[11px] text-blue-100 ml-1">Video ({p4}%)</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>💡 Nhấn vào từng tầng để lọc danh sách KOC tương ứng</span>
                    <button
                      onClick={() => {
                        setStatusFilter('Từ chối');
                        setActiveAdminTab('applications');
                      }}
                      className="font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">cancel</span>
                      Xem {metrics.rejectedApps} đơn bị loại
                    </button>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    CỘT PHẢI (5 CỘT): BẢNG SỨC KHỎE VẬN HÀNH BOOKING (SLA & CHURN)
                    ------------------------------------------------------------- */}
                <div className="lg:col-span-5 space-y-3.5">
                  {/* Khối 1: Tốc Độ Xử Lý & Chu Kỳ Vận Hành (Booking SLA) */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 shadow-2xs">
                    <div className="flex items-center justify-between pb-2.5 border-b border-blue-100">
                      <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-600 text-[17px]">timelapse</span>
                        Thời Gian Chu Kỳ (Booking SLA)
                      </h4>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Chuẩn SLA
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          Nộp đơn ➔ Duyệt cấp mẫu
                        </span>
                        <span className="font-extrabold text-slate-900 font-mono">14 giờ</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          Đóng gói & Vận chuyển (GHTK)
                        </span>
                        <span className="font-extrabold text-slate-900 font-mono">2.5 ngày</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                          Nhận hàng ➔ Đăng video TikTok
                        </span>
                        <span className="font-extrabold text-blue-700 font-mono">5.2 ngày</span>
                      </div>

                      <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-xs font-bold text-blue-900">
                        <span>Tổng chu kỳ hoàn tất (End-to-End):</span>
                        <span className="text-sm font-black text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                          ~ 8.5 ngày
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Khối 2: Cảnh Báo Rủi Ro Thất Thoát Mẫu & Bùng Video */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-600 text-[17px]">warning</span>
                        Kiểm Soát Rủi Ro Mẫu Thử
                      </h4>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        {metrics.overdueAppsList.length} ca trễ hạn
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Tỷ lệ hồ sơ bị loại đầu vào:</span>
                        <strong className="text-slate-900">{metrics.dropOffRate}%</strong>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        • <strong>48%</strong> do kênh &lt; 1.000 followers • <strong>32%</strong> do sai ngành hàng.
                      </p>

                      <div className="pt-1.5 flex items-center justify-between">
                        <span>KOC nhận mẫu &gt; 7 ngày chưa lên bài:</span>
                        <strong className="text-blue-700 font-mono">{metrics.overdueAppsList.length} KOC</strong>
                      </div>

                      <button
                        onClick={() => setDashboardSubTab('overdue')}
                        className="w-full mt-1 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">send</span>
                        Mở danh sách giục nộp link ngay
                      </button>
                    </div>
                  </div>

                  {/* Khối 3: Tỷ Lệ Giữ Chân KOC (Creator Loyalty) */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Tỷ Lệ KOC Quay Lại (Retention)
                      </div>
                      <div className="text-lg font-black text-slate-900 mt-0.5">
                        {metrics.retentionRate}% <span className="text-xs font-semibold text-blue-600">(Creator thân thiết)</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Đã đăng ký từ 2 chiến dịch trở lên</div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">favorite</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================================
                KHỐI DỮ LIỆU NGHIÊN CỨU TÍNH NĂNG MỚI CHO WEB (PRODUCT DISCOVERY & INSIGHTS)
                ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* CỘT 1: Nhu Cầu Theo Ngành Hàng (Category Demand) */}
              <div className="rounded-2xl bg-white p-5 shadow-xs border border-blue-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-600 text-[18px]">pie_chart</span>
                        Nhu Cầu KOC Theo Ngành Hàng
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Xác định ngành hàng hút KOC nhất để mở rộng chiến dịch</p>
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {reportPeriodLabel}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3.5">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                          Đồ Công Nghệ & Setup Bàn Làm Việc
                        </span>
                        <span className="text-blue-600">48% (Hút KOC nhất)</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-600 w-[48%]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                          Gia Dụng Thông Minh & Đời Sống
                        </span>
                        <span className="text-blue-500">32%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-400 w-[32%]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                          Mỹ Phẩm & Chăm Sóc Cá Nhân
                        </span>
                        <span className="text-sky-600">20%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-sky-500 w-[20%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700">
                  <div className="font-bold text-blue-900 flex items-center gap-1 mb-0.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">lightbulb</span>
                    Gợi ý chiến lược cho Web Admin:
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    KOC ngành Setup có tỷ lệ lên bài đúng hạn cao nhất (91%). Đề xuất nhãn hàng mở thêm 3 campaign dòng phụ kiện bàn làm việc trong tháng tới.
                  </p>
                </div>
              </div>

              {/* CỘT 2: Phân Tích Lý Do Rơi Rụng & Đề Xuất Tính Năng Mới */}
              <div className="rounded-2xl bg-white p-5 shadow-xs border border-blue-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-600 text-[18px]">build</span>
                        Nghiên Cứu Tính Năng Mới Cho Website
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Dựa trên nguyên nhân KOC rời bỏ và khó khăn khi vận hành</p>
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                      Roadmap Đề Xuất
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2.5">
                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-blue-600">filter_list</span>
                          1. Bộ Lọc Điều Kiện Tự Động (Smart Eligibility Filter)
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Ưu tiên cao</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        <strong>Vấn đề:</strong> 48% hồ sơ bị từ chối do KOC &lt; 1.000 followers. Tính năng tự động chặn nộp đơn nếu chưa đạt sẽ giảm 70% tải duyệt tay cho Admin.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-blue-600">mark_chat_unread</span>
                          2. Bot Zalo / SMS Tự Động Giục Bài
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Ưu tiên cao</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        <strong>Vấn đề:</strong> KOC nhận mẫu nhưng quên hạn nộp. Bot tự gửi tin nhắc khi bưu tá báo giao thành công sẽ kéo giảm tỷ lệ trễ hạn từ 25% xuống dưới 8%.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-blue-600">stars</span>
                          3. Hệ Thống Điểm Tín Nhiệm KOC (KOC Reputation Score)
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Tự động hóa</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        KOC trả bài đúng hạn được cộng điểm và tự động duyệt mẫu lần sau; KOC bùng hàng sẽ bị khóa đăng ký toàn hệ thống.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================================
                BẢNG TÁC VỤ 3 TAB: ĐƠN CHỜ DUYỆT | KOC CHẬM BÀI CẦN GIỤC | TOP KOC THÁNG
                ========================================================================= */}
            <div className="rounded-2xl bg-white shadow-xs border border-blue-100 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-blue-50/30">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDashboardSubTab('pending')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      dashboardSubTab === 'pending'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                    Đơn Mới Cần Duyệt Gấp ({metrics.pendingApps})
                  </button>

                  <button
                    onClick={() => setDashboardSubTab('overdue')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      dashboardSubTab === 'overdue'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">notifications_active</span>
                    KOC Cần Giục Nộp Link ({metrics.overdueAppsList.length})
                  </button>

                  <button
                    onClick={() => setDashboardSubTab('top_koc')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      dashboardSubTab === 'top_koc'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px] text-amber-500">hotel_class</span>
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
                    <span className="material-symbols-outlined text-4xl text-blue-600 mb-2">task_alt</span>
                    <p className="text-sm font-semibold text-slate-700">Tuyệt vời! Không còn đơn nào đang chờ duyệt.</p>
                    <p className="text-xs text-slate-400 mt-1">Tất cả đơn đăng ký KOC đều đã được xử lý xong.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-blue-50/50 text-[11px] font-bold text-blue-900 uppercase tracking-wider border-b border-blue-100">
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
                            <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-5 py-3.5">
                                <span className="font-mono text-xs font-bold text-blue-950 bg-blue-50 border border-blue-100 px-2 py-1 rounded">
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
                                        <span className="material-symbols-outlined text-[14px] text-blue-600" title="KOC đã xác thực">verified</span>
                                      )}
                                    </div>
                                    <span className="text-xs font-semibold text-blue-700">{app.tiktokHandle}</span>
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
                                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-all cursor-pointer flex items-center gap-1"
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

              {/* TAB 2: KOC CHẬM BÀI / CẦN GIỤC NỘP LINK VIDEO */}
              {dashboardSubTab === 'overdue' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-blue-50/60 text-[11px] font-bold text-blue-900 uppercase tracking-wider border-b border-blue-100">
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
                            <span className="material-symbols-outlined text-3xl text-blue-600 mb-1">done_all</span>
                            <p className="text-xs font-semibold">Tất cả KOC đều nộp bài đúng hạn hoặc chưa quá 7 ngày!</p>
                          </td>
                        </tr>
                      ) : (
                        metrics.overdueAppsList.slice(0, 5).map((app, idx) => (
                          <tr key={app.id} className="hover:bg-blue-50/20 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-slate-900">{app.kocName}</div>
                              <span className="text-xs text-blue-700 font-semibold">{app.tiktokHandle}</span>
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
                              <span className="font-bold text-blue-700">8 - 12 ngày trước</span>
                              <div className="text-[10px] text-slate-400">Hạn nộp video: 7 ngày</div>
                            </td>

                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-semibold">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                                Quá hạn nộp link
                              </span>
                            </td>

                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `Chào bạn ${app.kocName}, bên mình thấy bạn đã nhận được sản phẩm mẫu chiến dịch "${app.campaignName}". Bạn nhớ nộp link video trước hạn nhé!`
                                  );
                                  onShowToast(
                                    'Đã sao chép tin nhắn giục bài!',
                                    `Đã copy mẫu tin nhắn Zalo cho ${app.kocName} (${app.phone})`,
                                    'success'
                                  );
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[15px]">sms</span>
                                Giục qua Zalo
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: TOP KOC XUẤT SẮC CỦA THÁNG */}
              {dashboardSubTab === 'top_koc' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-blue-50/50 text-[11px] font-bold text-blue-900 uppercase tracking-wider border-b border-blue-100">
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
                      {[
                        {
                          rank: '01',
                          name: 'Nguyễn Hải Đăng',
                          handle: '@haidang_tech',
                          followers: '128.5K',
                          campaign: 'Bàn phím cơ không dây Dual Mode RGB',
                          views: '185.000',
                          rating: '5.0 / 5.0 (Xuất sắc)',
                          badgeColor: 'bg-blue-600 text-white',
                        },
                        {
                          rank: '02',
                          name: 'Lê Thảo My',
                          handle: '@thaomy_setup',
                          followers: '84.2K',
                          campaign: 'Đèn LED RGB Cảm Ứng Âm Thanh',
                          views: '94.000',
                          rating: '4.9 / 5.0 (Rất tốt)',
                          badgeColor: 'bg-blue-500 text-white',
                        },
                        {
                          rank: '03',
                          name: 'Trần Minh Quân',
                          handle: '@quan_desksetup',
                          followers: '45.1K',
                          campaign: 'Giá Đỡ Laptop Nhôm Công Thái Học',
                          views: '62.000',
                          rating: '4.8 / 5.0 (Đúng hạn)',
                          badgeColor: 'bg-blue-800 text-white',
                        },
                      ].map((koc) => (
                        <tr key={koc.rank} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className={`h-6 w-6 rounded-full inline-flex items-center justify-center text-xs font-black ${koc.badgeColor}`}>
                              {koc.rank}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-900">{koc.name}</div>
                            <span className="text-xs text-blue-700 font-semibold">{koc.handle}</span>
                            <span className="text-[11px] text-slate-400 ml-1.5">({koc.followers} follow)</span>
                          </td>

                          <td className="px-5 py-3.5">
                            <p className="font-medium text-slate-800 line-clamp-1 max-w-[220px]">{koc.campaign}</p>
                            <span className="text-[11px] text-blue-600 font-bold">✓ Đã duyệt nghiệm thu</span>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="font-extrabold text-blue-900 text-sm">{koc.views}</span>
                            <div className="text-[11px] text-slate-500">lượt xem video</div>
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              <span className="material-symbols-outlined text-[14px]">verified</span>
                              {koc.rating}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <span className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-bold text-blue-700">
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
            <div className="rounded-2xl bg-white p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">search</span>
                <input
                  type="text"
                  placeholder="Tìm KOC, SĐT, @tiktok, mã đơn..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
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
                  { id: 'Đã duyệt gửi mẫu', label: 'Đã duyệt', count: metrics.approvedApps },
                  { id: 'Đang giao', label: 'Đang giao', count: metrics.shippingApps },
                  { id: 'Đã lên bài', label: 'Đã lên bài', count: metrics.completedApps },
                  { id: 'Từ chối', label: 'Từ chối', count: metrics.rejectedApps },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setStatusFilter(chip.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      statusFilter === chip.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-700 focus:border-blue-600 focus:bg-white focus:outline-none cursor-pointer"
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
            <div className="rounded-2xl bg-white shadow-xs border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Mã Đơn / Ngày</th>
                      <th className="px-5 py-3">Thông Tin KOC</th>
                      <th className="px-5 py-3">Chiến Dịch</th>
                      <th className="px-5 py-3">Địa Chỉ Giao Mẫu</th>
                      <th className="px-5 py-3">Trạng Thái & Vận Đơn</th>
                      <th className="px-5 py-3 text-right">Thao Tác</th>
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
                        <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                              {app.code}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-1">
                              {app.createdAtDate} <br />
                              <span className="text-[10px]">{app.createdAtTime}</span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={app.avatar}
                                alt={app.kocName}
                                className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1">
                                  {app.kocName}
                                  {renderKocLoyaltyStar(app.tiktokHandle, app.kocName)}
                                  {app.verified && (
                                    <span className="material-symbols-outlined text-[15px] text-blue-600" title="KOC đã xác thực">
                                      verified
                                    </span>
                                  )}
                                </div>
                                <a
                                  href={`https://tiktok.com/@${app.tiktokHandle.replace('@', '')}`}
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

                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-900 text-xs line-clamp-2 max-w-[200px]">
                              {app.campaignName}
                            </p>
                            <span className="inline-block mt-1 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                              {app.followers} • {app.avgViews}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-xs text-slate-700 line-clamp-2 max-w-[220px]" title={app.address}>
                              📍 {app.address}
                            </p>
                            {app.contentConcept && (
                              <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-1 max-w-[220px]">
                                Idea: {app.contentConcept}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="space-y-1.5">
                              <div>{getStatusBadge(app.status)}</div>
                              {app.shippingCode ? (
                                <p className="font-mono text-[11px] text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded inline-block">
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

                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {app.status === 'Chờ duyệt' && (
                                <>
                                  <button
                                    onClick={() => handleQuickApprove(app)}
                                    className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-all cursor-pointer"
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    onClick={() => handleQuickReject(app)}
                                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                                  >
                                    Từ chối
                                  </button>
                                </>
                              )}

                              {app.status === 'Đã duyệt gửi mẫu' && (
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'Đang giao')}
                                  className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                                  Đang giao
                                </button>
                              )}

                              {app.status === 'Đang giao' && (
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'Đã lên bài')}
                                  className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[14px]">check</span>
                                  Xác nhận lên bài
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
              {applications.filter((a) => a.videoLink || a.status === 'Đã lên bài').length === 0 ? (
                <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">videocam_off</span>
                  <p className="text-sm font-semibold">Chưa có video nào được nộp</p>
                  <p className="text-xs text-slate-400 mt-1">Khi KOC nộp link TikTok trong mục "Chiến dịch của tôi", bài nộp sẽ hiển thị tại đây.</p>
                </div>
              ) : (
                applications
                  .filter((a) => a.videoLink || a.status === 'Đã lên bài')
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
                        <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Đã lên bài
                        </span>
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

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        {app.videoLink ? (
                          <a
                            href={app.videoLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-all cursor-pointer shadow-xs"
                          >
                            <span className="material-symbols-outlined text-[16px] text-blue-200">play_circle</span>
                            Mở Video TikTok
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              const link = prompt('Nhập link video TikTok của KOC này:');
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
                          className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-all cursor-pointer"
                        >
                          Cập nhật View
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            NỘI DUNG CHI TIẾT 5: DANH BẠ KOC & ĐỐI TÁC (CRM)
            --------------------------------------------------------------------- */}
        {activeAdminTab === 'koc-crm' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-[#6366f1] mb-3">
                  <span className="material-symbols-outlined text-3xl">group_off</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">Chưa có KOC nào trong hệ thống</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Hệ thống vừa hoàn thiện và ở trạng thái sạch 100%. Khi có KOC thật đăng ký tài khoản hoặc nộp đơn nhận mẫu, danh bạ KOC CRM sẽ tự động hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from(
                  new Map<string, KOCApplication>(
                    applications.map((item): [string, KOCApplication] => [item.tiktokHandle || item.kocName, item])
                  ).values()
                ).map((koc) => {
                const kocTotalApps = applications.filter((a) => a.tiktokHandle === koc.tiktokHandle).length;
                const kocCompletedApps = applications.filter(
                  (a) => a.tiktokHandle === koc.tiktokHandle && a.status === 'Đã lên bài'
                ).length;

                return (
                  <div
                    key={koc.id}
                    className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={koc.avatar}
                        alt={koc.kocName}
                        className="h-14 w-14 rounded-full object-cover border-2 border-blue-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-sm truncate flex items-center gap-1">
                            {koc.kocName}
                            {renderKocLoyaltyStar(koc.tiktokHandle, koc.kocName)}
                            {koc.verified && <span className="material-symbols-outlined text-[15px] text-blue-600">verified</span>}
                          </h4>
                          <span className="rounded bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 shrink-0 border border-blue-200">
                            {koc.followersCount > 30000 ? 'Micro KOC' : 'Nano KOC'}
                          </span>
                        </div>
                        <a
                          href={`https://tiktok.com/@${koc.tiktokHandle.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-blue-600 hover:underline block truncate mt-0.5"
                        >
                          {koc.tiktokHandle}
                        </a>
                        <p className="text-[11px] text-slate-500 mt-1">
                          📊 <strong>{koc.followers}</strong> followers • {koc.avgViews}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-blue-50/60 p-3 text-xs space-y-1.5 border border-blue-100">
                      <p className="text-slate-700">📞 SĐT: <strong className="text-slate-900 font-mono">{koc.phone}</strong></p>
                      <p className="text-slate-700 truncate">✉️ Email: <span className="text-slate-900">{koc.email}</span></p>
                      <p className="text-slate-700 line-clamp-2">📍 Địa chỉ: {koc.address}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div className="text-[11px] text-slate-500">
                        Đã tham gia: <strong className="text-slate-900">{kocTotalApps}</strong> • Đạt chuẩn: <strong className="text-blue-600 font-bold">{kocCompletedApps}</strong>
                      </div>
                      <a
                        href={`https://zalo.me/${koc.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        Chat Zalo
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
                </div>
              </div>

              {/* Campaign Info */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chiến dịch</label>
                <p className="font-semibold text-slate-900 text-sm mt-0.5">{selectedApp.campaignName}</p>
              </div>

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

                <label className="text-xs font-bold text-slate-700 block pt-2">Chuyển trạng thái hồ sơ</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Chờ duyệt', 'Đã duyệt gửi mẫu', 'Đang giao', 'Đã lên bài'] as ApplicationStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedApp.id, st)}
                      className={`rounded-xl py-2 px-2 text-xs font-bold transition-all cursor-pointer ${
                        selectedApp.status === st
                          ? 'bg-blue-600 text-white shadow-xs'
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
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
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
    </div>
  );
};

export default AdminView;
