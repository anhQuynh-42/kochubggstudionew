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

export interface Campaign {
  id: string;
  code: string;
  title: string;
  brandName: string;
  brandLogo: string;
  category: string;
  daysLeft: number;
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
  uspList: Array<{ title: string; desc: string; icon: string }>;
  storySteps: StoryStep[];
  hashtags: string[];
  cartBrandName: string;
  tiktokUrl?: string;
  tiktokHandle?: string;
  timeline: TimelineStep[];
}

export type ApplicationStatus =
  | 'Chờ duyệt'
  | 'Đã duyệt gửi mẫu'
  | 'Đang giao'
  | 'Đã lên bài'
  | 'Từ chối';

export interface KOCApplication {
  id: string;
  code: string;
  kocName: string;
  avatar: string;
  phone: string;
  email: string;
  tiktokHandle: string;
  followers: string;
  followersCount: number;
  avgViews: string;
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
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'campaign' | 'delivery' | 'payout' | 'approval';
}

export interface KOCUser {
  id: string;
  name: string;
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
  channelLink?: string;
  instagramHandle?: string;
  youtubeHandle?: string;
  city?: string;
  district?: string;
  address?: string;
  shippingNote?: string;
  targetAudience?: string;
  contentStyle?: string[];
  acceptFreecast?: boolean;
  minBookingRate?: string;
  allowSparkAds?: boolean;
  portfolioDriveLink?: string;
  sampleDeliveredCount?: number;
  completedVideosCount?: number;
}
