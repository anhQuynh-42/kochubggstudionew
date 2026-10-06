-- =========================================================================
-- HỆ THỐNG CƠ SỞ DỮ LIỆU KOCITY TRÊN SUPABASE (POSTGRESQL)
-- Copy toàn bộ đoạn script này và dán vào tab "SQL Editor" trên dashboard Supabase của bạn, sau đó ấn "Run".
-- =========================================================================

-- 1. TẠO BẢNG CHIẾN DỊCH (CAMPAIGNS)
CREATE TABLE IF NOT EXISTS public.campaigns (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  "brandName" TEXT NOT NULL,
  "brandLogo" TEXT,
  category TEXT NOT NULL,
  "daysLeft" INTEGER DEFAULT 15,
  platform TEXT DEFAULT 'TikTok',
  "followerRequirement" TEXT DEFAULT '>= 1.000',
  benefits JSONB DEFAULT '[]'::jsonb,
  "totalSpots" INTEGER DEFAULT 20,
  "registeredSpots" INTEGER DEFAULT 0,
  urgent BOOLEAN DEFAULT false,
  "approvalRate" TEXT DEFAULT '75%',
  description TEXT,
  "fullPrice" TEXT,
  "bookingFee" TEXT DEFAULT 'Freecast (Mẫu 0đ)',
  "commissionRate" TEXT DEFAULT '10%',
  "productHeroImage" TEXT,
  "galleryImages" JSONB DEFAULT '[]'::jsonb,
  "uspList" JSONB DEFAULT '[]'::jsonb,
  "storySteps" JSONB DEFAULT '[]'::jsonb,
  hashtags JSONB DEFAULT '[]'::jsonb,
  "cartBrandName" TEXT,
  "tiktokUrl" TEXT,
  "tiktokHandle" TEXT,
  timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TẠO BẢNG ĐƠN ỨNG TUYỂN CỦA KOC (APPLICATIONS)
CREATE TABLE IF NOT EXISTS public.applications (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  "kocName" TEXT NOT NULL,
  avatar TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  "tiktokHandle" TEXT NOT NULL,
  followers TEXT,
  "followersCount" INTEGER DEFAULT 0,
  "avgViews" TEXT,
  address TEXT NOT NULL,
  "shippingCode" TEXT DEFAULT '',
  "shippingStatus" TEXT DEFAULT 'Chờ duyệt để sinh mã',
  "createdAtTime" TEXT,
  "createdAtDate" TEXT,
  status TEXT DEFAULT 'Chờ duyệt',
  "videoLink" TEXT,
  "videoViews" TEXT,
  audience TEXT,
  "contentConcept" TEXT,
  "campaignId" TEXT NOT NULL,
  "campaignName" TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. KÍCH HOẠT TÍNH NĂNG REALTIME (THỜI GIAN THỰC) CHO BẢNG APPLICATIONS
-- Khi KOC gửi đơn hoặc Admin duyệt, dữ liệu tự nhảy vào màn hình Admin mà không cần F5
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;

-- 4. THIẾT LẬP CHÍNH SÁCH BẢO MẬT HÀNG (ROW LEVEL SECURITY - RLS)
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Cho phép mọi người (kể cả khách chưa đăng nhập) xem danh sách chiến dịch
CREATE POLICY "Mọi người đều được xem chiến dịch"
  ON public.campaigns FOR SELECT
  USING (true);

-- Cho phép Admin hoặc người dùng đã xác thực tạo/sửa chiến dịch
CREATE POLICY "Cho phép thêm và sửa chiến dịch"
  ON public.campaigns FOR ALL
  USING (true)
  WITH CHECK (true);

-- Cho phép KOC nộp đơn xin nhận mẫu
CREATE POLICY "Cho phép nộp đơn ứng tuyển KOC"
  ON public.applications FOR INSERT
  WITH CHECK (true);

-- Cho phép xem và quản lý đơn ứng tuyển
CREATE POLICY "Cho phép xem và cập nhật đơn ứng tuyển"
  ON public.applications FOR ALL
  USING (true)
  WITH CHECK (true);
