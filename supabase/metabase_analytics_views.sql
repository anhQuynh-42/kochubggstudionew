-- ==============================================================================
-- KOCity (kocity.io.vn) - BI Analytical SQL Views (Chuẩn Schema Supabase Thực Tế)
-- Tự động tổng hợp toàn bộ chiến dịch, phễu chuyển đổi, xếp hạng KOC & xu hướng ngày
-- Dán toàn bộ script này vào Supabase SQL Editor -> bấm Run -> Kết nối thẳng vào Looker Studio!
-- ==============================================================================

-- 1. VIEW: Tổng hợp hiệu suất TOÀN BỘ CHIẾN DỊCH (Tự động 100%, không cần nhập tay)
CREATE OR REPLACE VIEW public.kocity_bi_campaign_summary AS
SELECT
    c.id AS campaign_id,
    c.code AS campaign_code,
    c.title AS campaign_title,
    c."brandName" AS brand_name,
    c.category,
    c.platform,
    COALESCE(c."totalSpots", 0) AS total_spots,
    c."commissionRate" AS commission_rate,
    c."fullPrice" AS full_price,
    COUNT(a.id) AS total_applications,
    COUNT(CASE WHEN a.status = 'Chờ duyệt' THEN 1 END) AS pending_count,
    COUNT(CASE WHEN a.status IN ('Đã duyệt gửi mẫu', 'Đang giao', 'Chờ duyệt video', 'Đã lên bài', 'Đã hoàn thành') THEN 1 END) AS approved_total_count,
    COUNT(CASE WHEN a.status = 'Đã duyệt gửi mẫu' THEN 1 END) AS approved_waiting_ship_count,
    COUNT(CASE WHEN a.status = 'Đang giao' OR a."shippingStatus" = 'Đang trung chuyển' THEN 1 END) AS shipping_count,
    COUNT(CASE WHEN a."shippingStatus" = 'Đã phát thành công' THEN 1 END) AS delivered_count,
    COUNT(CASE WHEN a.status = 'Chờ duyệt video' THEN 1 END) AS pending_video_count,
    COUNT(CASE WHEN a.status IN ('Đã lên bài', 'Đã hoàn thành') THEN 1 END) AS completed_videos_count,
    COUNT(CASE WHEN a.status IN ('Từ chối', 'Bị từ chối') THEN 1 END) AS rejected_count,
    -- Tổng Followers tiếp cận (Reach ước tính của toàn bộ KOC được duyệt)
    COALESCE(SUM(CASE WHEN a.status IN ('Đã duyệt gửi mẫu', 'Đang giao', 'Chờ duyệt video', 'Đã lên bài', 'Đã hoàn thành') THEN COALESCE(a."followersCount", 0) ELSE 0 END), 0) AS approved_total_reach,
    -- Tỷ lệ duyệt hồ sơ (%)
    ROUND(
        CASE
            WHEN COUNT(a.id) > 0
            THEN (COUNT(CASE WHEN a.status IN ('Đã duyệt gửi mẫu', 'Đang giao', 'Chờ duyệt video', 'Đã lên bài', 'Đã hoàn thành') THEN 1 END)::numeric / COUNT(a.id)::numeric) * 100
            ELSE 0
        END, 1
    ) AS approval_rate_pct,
    -- Tỷ lệ hoàn thành trả bài video trên số KOC đã duyệt (%)
    ROUND(
        CASE
            WHEN COUNT(CASE WHEN a.status IN ('Đã duyệt gửi mẫu', 'Đang giao', 'Chờ duyệt video', 'Đã lên bài', 'Đã hoàn thành') THEN 1 END) > 0
            THEN (COUNT(CASE WHEN a.status IN ('Đã lên bài', 'Đã hoàn thành') THEN 1 END)::numeric / COUNT(CASE WHEN a.status IN ('Đã duyệt gửi mẫu', 'Đang giao', 'Chờ duyệt video', 'Đã lên bài', 'Đã hoàn thành') THEN 1 END)::numeric) * 100
            ELSE 0
        END, 1
    ) AS video_completion_rate_pct,
    -- Số suất mẫu còn lại
    GREATEST(0, COALESCE(c."totalSpots", 0) - COUNT(CASE WHEN a.status IN ('Đã duyệt gửi mẫu', 'Đang giao', 'Chờ duyệt video', 'Đã lên bài', 'Đã hoàn thành') THEN 1 END)) AS remaining_spots,
    c.created_at
FROM public.campaigns c
LEFT JOIN public.applications a ON a."campaignId" = c.id
WHERE c.id NOT LIKE '__%__'
GROUP BY c.id, c.code, c.title, c."brandName", c.category, c.platform, c."totalSpots", c."commissionRate", c."fullPrice", c.created_at
ORDER BY total_applications DESC, c.created_at DESC;

-- 2. VIEW: Phễu chuyển đổi toàn hệ thống theo tháng (Conversion Funnel)
CREATE OR REPLACE VIEW public.kocity_bi_funnel_overview AS
SELECT
    DATE_TRUNC('month', a.created_at)::date AS report_month,
    COUNT(a.id) AS step_1_applied,
    COUNT(CASE WHEN a.status IN ('Đã duyệt gửi mẫu', 'Đang giao', 'Chờ duyệt video', 'Đã lên bài', 'Đã hoàn thành') THEN 1 END) AS step_2_approved,
    COUNT(CASE WHEN a.status IN ('Đang giao', 'Chờ duyệt video', 'Đã lên bài', 'Đã hoàn thành') OR a."shippingStatus" IN ('Đang trung chuyển', 'Đã phát thành công') THEN 1 END) AS step_3_shipped,
    COUNT(CASE WHEN a.status IN ('Chờ duyệt video', 'Đã lên bài', 'Đã hoàn thành') THEN 1 END) AS step_4_video_submitted,
    COUNT(CASE WHEN a.status IN ('Đã lên bài', 'Đã hoàn thành') THEN 1 END) AS step_5_completed,
    COUNT(CASE WHEN a.status IN ('Từ chối', 'Bị từ chối') THEN 1 END) AS rejected_total,
    ROUND(
        (COUNT(CASE WHEN a.status IN ('Đã duyệt gửi mẫu', 'Đang giao', 'Chờ duyệt video', 'Đã lên bài', 'Đã hoàn thành') THEN 1 END)::numeric / NULLIF(COUNT(a.id), 0)) * 100, 1
    ) AS approval_rate_pct,
    ROUND(
        (COUNT(CASE WHEN a.status IN ('Đã lên bài', 'Đã hoàn thành') THEN 1 END)::numeric / NULLIF(COUNT(CASE WHEN a.status IN ('Đã duyệt gửi mẫu', 'Đang giao', 'Chờ duyệt video', 'Đã lên bài', 'Đã hoàn thành') THEN 1 END), 0)) * 100, 1
    ) AS completion_rate_pct
FROM public.applications a
GROUP BY DATE_TRUNC('month', a.created_at)
ORDER BY report_month DESC;

-- 3. VIEW: Thống kê đơn đăng ký & duyệt mẫu theo từng ngày (Cho biểu đồ Time Series trên Looker Studio)
CREATE OR REPLACE VIEW public.kocity_bi_daily_applications AS
SELECT
    DATE(a.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') AS report_date,
    a."campaignId" AS campaign_id,
    a."campaignName" AS campaign_name,
    COUNT(a.id) AS applications_count,
    COUNT(CASE WHEN a.status IN ('Đã duyệt gửi mẫu', 'Đang giao', 'Chờ duyệt video', 'Đã lên bài', 'Đã hoàn thành') THEN 1 END) AS approved_count,
    COUNT(CASE WHEN a.status IN ('Đã lên bài', 'Đã hoàn thành') THEN 1 END) AS completed_count,
    COUNT(CASE WHEN a.status IN ('Từ chối', 'Bị từ chối') THEN 1 END) AS rejected_count,
    COALESCE(SUM(COALESCE(a."followersCount", 0)), 0) AS daily_reach_followers
FROM public.applications a
GROUP BY DATE(a.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh'), a."campaignId", a."campaignName"
ORDER BY report_date DESC;

-- 4. VIEW: Bảng xếp hạng KOC & Phân tầng Creator (Tự động từ applications)
CREATE OR REPLACE VIEW public.kocity_bi_koc_leaderboard AS
SELECT
    LOWER(TRIM(REPLACE(COALESCE(a."tiktokHandle", ''), '@', ''))) AS tiktok_handle_key,
    MAX(a."tiktokHandle") AS tiktok_handle,
    MAX(a."kocName") AS koc_name,
    MAX(COALESCE(a."followersCount", 0)) AS followers_count,
    CASE
        WHEN MAX(COALESCE(a."followersCount", 0)) >= 100000 THEN 'Macro KOC (>100k)'
        WHEN MAX(COALESCE(a."followersCount", 0)) >= 20000 THEN 'Micro KOC (20k - 100k)'
        WHEN MAX(COALESCE(a."followersCount", 0)) >= 5000 THEN 'Nano KOC (5k - 20k)'
        ELSE 'Seed KOC (<5k)'
    END AS creator_tier,
    COUNT(a.id) AS total_campaigns_applied,
    COUNT(CASE WHEN a.status IN ('Đã duyệt gửi mẫu', 'Đang giao', 'Chờ duyệt video', 'Đã lên bài', 'Đã hoàn thành') THEN 1 END) AS approved_campaigns,
    COUNT(CASE WHEN a.status IN ('Đã lên bài', 'Đã hoàn thành') THEN 1 END) AS completed_videos,
    COUNT(CASE WHEN a.status IN ('Từ chối', 'Bị từ chối') THEN 1 END) AS rejected_count
FROM public.applications a
WHERE COALESCE(a."tiktokHandle", '') <> ''
GROUP BY LOWER(TRIM(REPLACE(COALESCE(a."tiktokHandle", ''), '@', '')))
ORDER BY completed_videos DESC, approved_campaigns DESC, followers_count DESC;

-- Cấp quyền SELECT cho các role kết nối Looker Studio / Metabase / Client
GRANT SELECT ON public.kocity_bi_campaign_summary TO anon, authenticated, service_role;
GRANT SELECT ON public.kocity_bi_funnel_overview TO anon, authenticated, service_role;
GRANT SELECT ON public.kocity_bi_daily_applications TO anon, authenticated, service_role;
GRANT SELECT ON public.kocity_bi_koc_leaderboard TO anon, authenticated, service_role;
