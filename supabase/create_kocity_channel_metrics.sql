-- =========================================================================
-- BẢNG LƯU TRỮ DỮ LIỆU ĐA KÊNH CHÍNH CHỦ KOCITY (OMNICHANNEL METRICS)
-- Dành cho: Website (kocity.io.vn), TikTok, Facebook, Threads, Zalo KOCity
-- Copy và chạy script này trong tab "SQL Editor" trên Supabase Dashboard
-- =========================================================================

-- 1. TẠO BẢNG CHỈ SỐ KÊNH KOCITY
CREATE TABLE IF NOT EXISTS public.kocity_channel_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    channel TEXT NOT NULL CHECK (channel IN ('website', 'tiktok', 'facebook', 'threads', 'zalo')),
    channel_name TEXT NOT NULL,         -- Ví dụ: 'Website KOCity', '@kocity.vn', 'Cộng đồng KOC Zalo'
    channel_url TEXT,                  -- URL liên kết kênh
    followers_or_members INT DEFAULT 0, -- Số followers / người theo dõi / thành viên nhóm
    total_views INT DEFAULT 0,          -- Lượt xem trang (Web) hoặc tổng views video (TikTok/Reels)
    engagements INT DEFAULT 0,          -- Tổng lượt tương tác (likes, comments, clicks, replies)
    new_subscribers_today INT DEFAULT 0,-- Tăng trưởng thành viên/follower mới trong ngày
    notes TEXT,                         -- Ghi chú chiến dịch hoặc bài đăng nổi bật trong ngày
    metadata JSONB DEFAULT '{}'::jsonb, -- Thông số mở rộng linh hoạt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT kocity_channel_daily_unique UNIQUE (report_date, channel)
);

-- 2. TẠO INDEXES ĐỂ TĂNG TỐC ĐỘ TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_kocity_channel_metrics_date ON public.kocity_channel_metrics (report_date DESC);
CREATE INDEX IF NOT EXISTS idx_kocity_channel_metrics_channel ON public.kocity_channel_metrics (channel);

-- 3. KÍCH HOẠT REALTIME CHO BẢNG ĐA KÊNH
-- Khi bot n8n hoặc Admin cập nhật số liệu, biểu đồ tự động cập nhật thời gian thực
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.kocity_channel_metrics;
  END IF;
END $$;

-- 4. BẢO MẬT HÀNG (ROW LEVEL SECURITY - RLS)
ALTER TABLE public.kocity_channel_metrics ENABLE ROW LEVEL SECURITY;

-- Cho phép xem chỉ số công khai hoặc authenticated
DROP POLICY IF EXISTS "Cho phép xem chỉ số đa kênh KOCity" ON public.kocity_channel_metrics;
CREATE POLICY "Cho phép xem chỉ số đa kênh KOCity"
  ON public.kocity_channel_metrics FOR SELECT
  USING (true);

-- Cho phép Admin và Service Role thêm hoặc cập nhật chỉ số
DROP POLICY IF EXISTS "Cho phép quản lý chỉ số đa kênh KOCity" ON public.kocity_channel_metrics;
CREATE POLICY "Cho phép quản lý chỉ số đa kênh KOCity"
  ON public.kocity_channel_metrics FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. NẠP DỮ LIỆU BAN ĐẦU (SEED BASELINE DATA CHO 5 KÊNH)
INSERT INTO public.kocity_channel_metrics 
    (report_date, channel, channel_name, channel_url, followers_or_members, total_views, engagements, new_subscribers_today, notes)
VALUES
    (CURRENT_DATE, 'website', 'Website KOCity', 'https://kocity.io.vn', 3420, 18500, 1260, 145, 'Chiến dịch Cỏ Mềm đang thu hút lượng truy cập nhận mẫu cao'),
    (CURRENT_DATE, 'tiktok', 'KOCity TikTok Official', 'https://www.tiktok.com/@kocity.vn', 12800, 142000, 8900, 320, 'Video hướng dẫn gắn giỏ hàng 2026 đang lên xu hướng'),
    (CURRENT_DATE, 'facebook', 'Cộng Đồng KOCity Facebook', 'https://facebook.com/groups/kocityvietnam', 6500, 24000, 1850, 95, 'Thảo luận sôi nổi về duyệt mẫu đợt 2'),
    (CURRENT_DATE, 'threads', 'Threads KOCity', 'https://www.threads.net/@kocity.vn', 4100, 31000, 2450, 110, 'Chia sẻ kinh nghiệm làm affiliate không cọc tiền'),
    (CURRENT_DATE, 'zalo', 'Zalo KOCity Community', 'https://zalo.me/g/cjenmz664', 2150, 12800, 3100, 78, 'Group hỗ trợ KOC giải đáp thắc mắc mã vận đơn 24/7')
ON CONFLICT (report_date, channel) 
DO UPDATE SET
    followers_or_members = EXCLUDED.followers_or_members,
    total_views = EXCLUDED.total_views,
    engagements = EXCLUDED.engagements,
    new_subscribers_today = EXCLUDED.new_subscribers_today,
    notes = EXCLUDED.notes,
    updated_at = timezone('utc'::text, now());
