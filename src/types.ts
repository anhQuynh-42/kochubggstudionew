export interface Benefit {
  label: string;
  icon: string;
  type: 'sample' | 'commission' | 'budget' | 'other';
}

export interface StoryStep {
  step: string;
  title: string;
  desc: string;
}

export interface TimelineStep {
  stepNum: string;
  status: string;
  date: string;
  title: string;
  desc: string;
}

export interface SampleProduct {
  id?: string;
  code: string;
  name: string;
  image?: string;
  category?: string;
  commission?: string;
  shortDesc?: string;
  detailDesc?: string;
  reviewTips?: string;
  tags?: string;
  affiliateLink?: string;
  disabled?: boolean;
}

export interface Campaign {
  id: string;
  code: string;
  title: string;
  brandName: string;
  brandLogo: string;
  category: string;
  daysLeft: number;
  startDate?: string;
  endDate?: string;
  platform: string;
  followerRequirement: string;
  benefits: Benefit[];
  totalSpots: number;
  registeredSpots: number;
  urgent?: boolean;
  approvalRate?: string;
  description: string;
  fullPrice?: string;
  bookingFee?: string;
  commissionRate?: string;
  productHeroImage: string;
  galleryImages: string[];
  uspList?: Array<{ title: string; desc: string; icon: string }>;
  storySteps?: StoryStep[];
  hashtags?: string[];
  cartBrandName: string;
  tiktokUrl?: string;
  tiktokHandle?: string;
  timeline: TimelineStep[];
  sampleProducts?: SampleProduct[];
  registrationFormUrl?: string;
  zaloGroupUrl?: string;
  minVideos?: number;
  videoDeadline?: string;
  contentRequirement?: string;
  approvalCondition?: string;
}

export type ApplicationStatus =
  | 'Chờ duyệt'
  | 'Đã duyệt gửi mẫu'
  | 'Đang giao'
  | 'Chờ duyệt video'
  | 'Đã hoàn thành'
  | 'Bị từ chối'
  | 'Đã lên bài'
  | 'Từ chối';

export interface KOCApplication {
  id: string;
  kocId?: string;
  code: string;
  kocName: string;
  avatar: string;
  phone: string;
  email: string;
  tiktokHandle: string;
  followers: string;
  followersCount: number;
  avgViews: string;
  monthlyOrders?: string;
  monthlyAvgGmv?: string;
  address: string;
  shippingCode: string;
  shippingStatus: 'Đã phát thành công' | 'Đang trung chuyển' | 'Chờ duyệt để sinh mã' | 'Không gửi mẫu';
  createdAtTime: string;
  createdAtDate: string;
  status: ApplicationStatus;
  videoLink?: string;
  videoViews?: string;
  audience: string;
  contentConcept: string;
  campaignId: string;
  campaignName: string;
  verified?: boolean;
  adminFeedback?: string;
  videoSubmittedAt?: string;
  selectedSampleCode?: string;
  selectedSampleName?: string;
  selectedSampleImage?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'campaign' | 'delivery' | 'payout' | 'approval' | 'announcement';
  targetRole?: 'koc' | 'admin' | 'all';
  targetKocId?: string;
  targetTiktokHandle?: string;
  targetPhone?: string;
  targetEmail?: string;
  linkTab?: 'admin' | 'marketplace' | 'my-campaigns' | 'profile';
  adminSubTab?: 'applications' | 'campaigns' | 'content' | 'koc-crm' | 'dashboard';
}

export interface KOCUser {
  id: string;
  name: string;
  role?: 'koc' | 'admin';
  avatar: string;
  tiktokHandle: string;
  followers: string;
  phone: string;
  email: string;
  password?: string;
  verified: boolean;
  bio?: string;
  categories?: string[];
  avgViews?: string;
  engagementRate?: string;
  gmv?: string;
  monthlyOrders?: string;
  monthlyAvgGmv?: string;
  channelLink?: string;
  instagramHandle?: string;
  youtubeHandle?: string;
  city?: string;
  district?: string;
  address?: string;
  shippingNote?: string;
  targetAudience?: string;
  targetAudienceImage?: string;
  contentStyle?: string[];
  acceptFreecast?: boolean;
  minBookingRate?: string;
  allowSparkAds?: boolean;
  portfolioDriveLink?: string;
  portfolioFile?: {
    name: string;
    size: string;
    dataUrl?: string;
    type?: string;
    uploadedAt?: string;
  };
  highlightVideos?: string[];
  workPhone?: string;
  workEmail?: string;
  sampleDeliveredCount?: number;
  completedVideosCount?: number;
  completedCampaignsCount?: number;
}

// ---------------------------------------------------------------------------
// Trạng thái hiển thị 3 lớp theo CLAUDE.md mục 3 (chỉ dùng cho giao diện).
// Hiện được suy ra từ `KOCApplication.status` qua src/lib/applicationStatus.ts;
// khi database có cột đồng bộ từ Google Sheet, chỉ cần đổi nguồn trong file đó.
// ---------------------------------------------------------------------------

/** Kết quả Brand chọn (cột `Brand duyệt KOC` trên Google Sheet) */
export type SelectionStatus = 'pending' | 'selected' | 'not_selected';

/** Tiến độ gửi mẫu nội bộ (cột `ADFI duyệt sample`) */
export type SampleStage = 'none' | 'waiting' | 'approved' | 'in_transit' | 'delivered';

/** Tiến độ đăng video (cột `KOC đăng video`) */
export type VideoStage = 'not_posted' | 'pending_review' | 'needs_revision' | 'posted';

export interface ApplicationProgress {
  selection: SelectionStatus;
  sample: SampleStage;
  video: VideoStage;
  /** Vị trí trên timeline 4 bước: 0 Đã gửi đơn → 1 Brand đang xem → 2 Duyệt gửi mẫu → 3 Đã lên bài */
  timelineStep: 0 | 1 | 2 | 3;
}

/** Một dòng hoạt động trên Live Ticker (đã che tên, không chứa thông tin liên hệ) */
export interface LiveActivityItem {
  id: string;
  displayName: string;
  city: string;
  brandName: string;
  action: 'applied' | 'selected' | 'posted';
  dateLabel: string;
}
