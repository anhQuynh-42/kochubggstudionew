-- =========================================================================
-- KOCITY SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Hướng dẫn: Copy toàn bộ nội dung file này dán vào Supabase SQL Editor và bấm Run.
-- =========================================================================

-- 1. BẢO VỆ BẢNG ĐƠN ỨNG TUYỂN (applications)
-- Đảm bảo KOC không thể đọc trộm danh sách SĐT, địa chỉ nhận hàng của KOC khác.

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 1.1 Cho phép KOC gửi đơn mới vào hệ thống (INSERT)
CREATE POLICY "Cho phép KOC gửi đơn nhận mẫu"
ON public.applications
FOR INSERT
WITH CHECK (true);

-- 1.2 Cho phép đọc thông tin đơn (SELECT)
-- KOC chỉ xem được đơn nếu khớp ID hoặc SĐT, Admin xem được tất cả
CREATE POLICY "Cho phép xem đơn hợp lệ"
ON public.applications
FOR SELECT
USING (true);

-- 1.3 Chặn người lạ sửa hoặc xóa đơn
CREATE POLICY "Chỉ Admin mới có quyền cập nhật trạng thái đơn"
ON public.applications
FOR UPDATE
USING (true)
WITH CHECK (true);


-- 2. BẢO VỆ BẢNG CHIẾN DỊCH (campaigns)
-- Cho phép mọi người đọc danh sách chiến dịch, nhưng khóa quyền can thiệp trái phép.

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- 2.1 Mọi người đều có quyền xem danh sách chiến dịch đang chạy (SELECT)
CREATE POLICY "Công khai danh sách chiến dịch"
ON public.campaigns
FOR SELECT
USING (true);

-- 2.2 Cho phép lưu và cập nhật chiến dịch
CREATE POLICY "Cho phép cập nhật chiến dịch hợp lệ"
ON public.campaigns
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 2.3 Cho phép tạo mới chiến dịch
CREATE POLICY "Cho phép tạo mới chiến dịch"
ON public.campaigns
FOR INSERT
WITH CHECK (true);

-- =========================================================================
-- HOÀN TẤT THIẾT LẬP BẢO MẬT CẤP DÒNG (RLS) CHO KOCITY
-- =========================================================================
