-- ==============================================================================
-- KOCity (kocity.io.vn) - Metabase BI Analytical SQL Views
-- Hỗ trợ phân tích chiến dịch, ROI phát mẫu 0đ, xếp hạng KOC và phễu chuyển đổi
-- ==============================================================================

-- 1. VIEW: Tổng quan hiệu quả & ROI chiến dịch (Campaign ROI Summary)
-- Đo lường chi phí tài trợ mẫu thử 0đ so với doanh thu TikTok Shop (GMV) mang lại
CREATE OR REPLACE VIEW kocity_analytics_campaign_roi AS
SELECT 
    c.id AS campaign_id,
    c.title AS campaign_title,
    c.brand_name,
    c.total_sample_slots,
    c.disbursed_samples_count,
    COUNT(a.id) AS total_applications,
    COUNT(CASE WHEN a.status = 'Được chọn' THEN 1 END) AS selected_kocs_count,
    COUNT(CASE WHEN a.status = 'Đã lên bài' OR a.status = 'Hoàn thành' THEN 1 END) AS completed_videos_count,
    -- Ước tính tổng chi phí phát mẫu (giá niêm yết * số mẫu đã phát)
    COALESCE(c.product_retail_price * c.disbursed_samples_count, 0) AS estimated_sample_cost_vnd,
    -- Ước tính tổng GMV thu về từ các KOC hoàn thành bài
    COALESCE(SUM(CASE WHEN a.status = 'Đã lên bài' OR a.status = 'Hoàn thành' THEN a.estimated_gmv ELSE 0 END), 0) AS total_generated_gmv_vnd,
    -- Tính tỷ lệ hoàn thành nghiệm thu video (%)
    ROUND(
        CASE 
            WHEN COUNT(CASE WHEN a.status = 'Được chọn' THEN 1 END) > 0 
            THEN (COUNT(CASE WHEN a.status = 'Đã lên bài' OR a.status = 'Hoàn thành' THEN 1 END)::numeric / COUNT(CASE WHEN a.status = 'Được chọn' THEN 1 END)::numeric) * 100 
            ELSE 0 
        END, 2
    ) AS fulfillment_rate_pct
FROM campaigns c
LEFT JOIN applications a ON a.campaign_id = c.id
GROUP BY c.id, c.title, c.brand_name, c.total_sample_slots, c.disbursed_samples_count, c.product_retail_price;

-- 2. VIEW: Bảng xếp hạng Top KOC (KOC Performance Leaderboard)
-- Xếp hạng theo doanh số GMV, số video trả bài và lượng followers
CREATE OR REPLACE VIEW kocity_analytics_koc_leaderboard AS
SELECT 
    a.tiktok_handle,
    a.koc_name,
    a.followers_count,
    -- Phân loại tầng Creator
    CASE 
        WHEN a.followers_count >= 100000 THEN 'Macro KOC (>100k)'
        WHEN a.followers_count >= 20000 THEN 'Micro KOC (20k - 100k)'
        WHEN a.followers_count >= 5000 THEN 'Nano KOC (5k - 20k)'
        ELSE 'Seed KOC (1k - 5k)'
    END AS creator_tier,
    COUNT(a.id) AS total_campaigns_joined,
    COUNT(CASE WHEN a.status = 'Hoàn thành' OR a.status = 'Đã lên bài' THEN 1 END) AS completed_reviews_count,
    COALESCE(SUM(a.estimated_gmv), 0) AS total_estimated_gmv,
    COALESCE(AVG(a.video_views), 0)::integer AS average_video_views,
    -- Đánh giá mức độ uy tín KOC
    CASE 
        WHEN COUNT(CASE WHEN a.status = 'Hoàn thành' THEN 1 END) >= 3 THEN '⭐⭐⭐⭐⭐ VIP Creator'
        WHEN COUNT(CASE WHEN a.status = 'Hoàn thành' THEN 1 END) >= 1 THEN '⭐⭐⭐⭐ Active KOC'
        ELSE '⭐⭐⭐ New Member'
    END AS creator_reputation
FROM applications a
GROUP BY a.tiktok_handle, a.koc_name, a.followers_count
ORDER BY total_estimated_gmv DESC, completed_reviews_count DESC;

-- 3. VIEW: Phễu chuyển đổi toàn diện KOCity (Conversion Funnel)
-- Phân tích từng bước từ lúc KOC nộp đơn đến khi tạo doanh số
CREATE OR REPLACE VIEW kocity_analytics_funnel AS
SELECT 
    DATE_TRUNC('month', a.created_at) AS report_month,
    COUNT(a.id) AS step_1_applied_count,
    COUNT(CASE WHEN a.status = 'Được chọn' OR a.status = 'Đã lên bài' OR a.status = 'Hoàn thành' THEN 1 END) AS step_2_brand_approved_count,
    COUNT(CASE WHEN a.shipping_status = 'Đã phát' OR a.shipping_status = 'Đang giao' THEN 1 END) AS step_3_sample_disbursed_count,
    COUNT(CASE WHEN a.status = 'Đã lên bài' OR a.status = 'Hoàn thành' THEN 1 END) AS step_4_video_published_count,
    ROUND(
        (COUNT(CASE WHEN a.status = 'Được chọn' OR a.status = 'Đã lên bài' OR a.status = 'Hoàn thành' THEN 1 END)::numeric / NULLIF(COUNT(a.id), 0)) * 100, 2
    ) AS brand_approval_rate_pct,
    ROUND(
        (COUNT(CASE WHEN a.status = 'Đã lên bài' OR a.status = 'Hoàn thành' THEN 1 END)::numeric / NULLIF(COUNT(CASE WHEN a.status = 'Được chọn' THEN 1 END), 0)) * 100, 2
    ) AS video_conversion_rate_pct
FROM applications a
GROUP BY DATE_TRUNC('month', a.created_at)
ORDER BY report_month DESC;

-- Cấp quyền SELECT cho role authenticated và service_role
GRANT SELECT ON kocity_analytics_campaign_roi TO authenticated, service_role;
GRANT SELECT ON kocity_analytics_koc_leaderboard TO authenticated, service_role;
GRANT SELECT ON kocity_analytics_funnel TO authenticated, service_role;
