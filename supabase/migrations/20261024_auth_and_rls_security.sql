-- =========================================================================
-- MIGRATION AN TOÀN THÔNG TIN & SUPABASE AUTH CHUẨN DOANH NGHIỆP — KOCITY
-- Ngày tạo: 24/10/2026
-- Mục tiêu: 
-- 1. Tạo bảng profiles liên kết Supabase Auth (auth.users)
-- 2. Thiết lập RLS Policy phân quyền chặt chẽ giữa KOC và Admin
-- 3. Xoá bỏ vĩnh viễn mật khẩu Plaintext cũ trong cột description
-- =========================================================================

-- 1. TẠO BẢNG HỒ SƠ KOC (PROFILES) ĐỘC LẬP VỚI AUTH.USERS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tiktok_handle TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  avatar TEXT,
  followers TEXT DEFAULT 'KOC',
  role TEXT DEFAULT 'koc', -- 'koc' | 'admin'
  is_blacklisted BOOLEAN DEFAULT false,
  blacklist_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật RLS cho bảng profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy Profiles: Mọi người xem được thông tin KOC công khai (để hiện Media Kit/Thành phố cư dân)
DROP POLICY IF EXISTS "Public view profiles" ON public.profiles;
CREATE POLICY "Public view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Policy Profiles: Người dùng chỉ được sửa hồ sơ của chính mình
DROP POLICY IF EXISTS "User update own profile" ON public.profiles;
CREATE POLICY "User update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. TRIGGER TỰ ĐỘNG KHỞI TẠO PROFILE KHI ĐĂNG KÝ QUA SUPABASE AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    tiktok_handle,
    name,
    phone,
    email,
    avatar,
    followers,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'tiktok_handle', 'koc_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'name', 'KOC Member'),
    NEW.raw_user_meta_data->>'phone',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar',
    COALESCE(NEW.raw_user_meta_data->>'followers', 'KOC'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'koc')
  )
  ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. THIẾT LẬP RLS CHẶT CHẼ CHO BẢNG CAMPAIGNS (CHIẾN DỊCH SẢN PHẨM)
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Khách xem chỉ được xem các chiến dịch thật, CẤM xem các record hệ thống bắt đầu bằng '__'
DROP POLICY IF EXISTS "Mọi người đều được xem chiến dịch" ON public.campaigns;
DROP POLICY IF EXISTS "Cho phép xem chiến dịch công khai" ON public.campaigns;
CREATE POLICY "Cho phép xem chiến dịch công khai"
  ON public.campaigns FOR SELECT
  USING (
    id NOT LIKE '__%' 
    OR id = '__BLOG_POSTS_STORAGE__' -- Cho phép xem bài viết blog cẩm nang
    OR id = '__SITE_CONFIG__'        -- Cho phép xem banner
    OR (
      -- Admin đã đăng nhập được xem toàn bộ
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Chỉ Admin hoặc người có quyền mới được thêm/sửa/xóa chiến dịch
DROP POLICY IF EXISTS "Cho phép thêm và sửa chiến dịch" ON public.campaigns;
DROP POLICY IF EXISTS "Admin quản lý chiến dịch" ON public.campaigns;
CREATE POLICY "Admin quản lý chiến dịch"
  ON public.campaigns FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
  );

-- 4. THIẾT LẬP RLS CHẶT CHẼ CHO BẢNG APPLICATIONS (ĐƠN XIN NHẬN MẪU)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- KOC chỉ xem đơn của chính mình; Admin xem được toàn bộ
DROP POLICY IF EXISTS "Cho phép xem và cập nhật đơn ứng tuyển" ON public.applications;
DROP POLICY IF EXISTS "KOC xem đơn của mình và Admin xem tất cả" ON public.applications;
CREATE POLICY "KOC xem đơn của mình và Admin xem tất cả"
  ON public.applications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
    OR (
      -- KOC xem đơn của chính mình
      "tiktokHandle" = (SELECT tiktok_handle FROM public.profiles WHERE id = auth.uid())
      OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Cho phép KOC nộp đơn
DROP POLICY IF EXISTS "Cho phép nộp đơn ứng tuyển KOC" ON public.applications;
CREATE POLICY "Cho phép nộp đơn ứng tuyển KOC"
  ON public.applications FOR INSERT
  WITH CHECK (true);

-- Cho phép Admin duyệt đơn, gán mã vận đơn hoặc KOC cập nhật link video
DROP POLICY IF EXISTS "Cập nhật đơn ứng tuyển" ON public.applications;
CREATE POLICY "Cập nhật đơn ứng tuyển"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.role() = 'service_role'
    OR (
      "tiktokHandle" = (SELECT tiktok_handle FROM public.profiles WHERE id = auth.uid())
    )
  );

-- 5. LÀM SẠCH VÀ XOÁ BỎ HOÀN TOÀN TRƯỜNG "PASSWORD" CŨ TRONG DESCRIPTION BẢNG CAMPAIGNS
-- Script SQL này tự động loại bỏ key "password" khỏi chuỗi JSON của toàn bộ record KOC
UPDATE public.campaigns
SET description = (description::jsonb - 'password')::text
WHERE id LIKE '__KOC_PROFILE__%' AND description LIKE '%"password"%';

-- Xác nhận hoàn tất
SELECT 'Thiết lập bảo mật Supabase Auth & RLS thành công!' AS result;
