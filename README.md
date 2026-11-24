# 🚀 KOCity — Nền tảng Kết nối Nano/Micro KOC & Nhãn hàng (Mẫu 0đ & Affiliate TikTok Shop)

> **Website Production:** [https://kocity.io.vn](https://kocity.io.vn)  
> **Repository:** [anhQuynh-42/kochubggstudionew](https://github.com/anhQuynh-42/kochubggstudionew)  
> **Tech Stack:** React 19 • TypeScript 5.8 • Vite 6 • Tailwind CSS v4 • Supabase • Google Sheets Live Sync • n8n AI/Automation Workflows • Google GenAI (Gemini)

---

## 📌 Tài liệu nộp Bài Tập Lớn (BTL) — 2 Hạng mục Trọng tâm

| STT | Hạng mục yêu cầu | Tài liệu chi tiết | Thư mục nguồn liên quan |
| :---: | :--- | :--- | :--- |
| **1** | **AI Prompt Engineering** *(dùng để xây website & xây AI Agents)* | 👉 [docs/AI_PROMPT_ENGINEERING.md](docs/AI_PROMPT_ENGINEERING.md) | [CLAUDE.md](CLAUDE.md), [KocityAiChatWidget.tsx](src/site/components/KocityAiChatWidget.tsx), các file `kocity_*.n8n` |
| **2** | **Bộ AI Skills dùng trong BTL** *(10 Skills chuyên biệt + 18 file tham chiếu + file tổng hợp `SKILL.md`)* | 👉 [SKILL.md](SKILL.md) & [docs/AI_SKILLS_BTL.md](docs/AI_SKILLS_BTL.md) | [.agents/skills/](.agents/skills/) |

---

## ✨ Những cập nhật mới nhất đã hoàn thiện & triển khai

### 1. Website & Sản phẩm KOCity (`kocity.io.vn`)
- **Marketplace chiến dịch nhận mẫu 0đ & Affiliate:** Dành riêng cho Nano/Micro KOC từ ≥ 1.000 followers với quy trình đăng ký 3 bước (`ApplySheet`) giảm rơi rụng.
- **Hệ thống Blog SEO / GEO & Trang công bố 68 KOC Cỏ Mềm:** Tích hợp tìm kiếm realtime trên bảng KOC, phóng to ảnh Lightbox và cơ chế **click beacon `fetch keepalive`** trong [BlogContentRenderer.tsx](src/site/components/BlogContentRenderer.tsx) giúp tự động ghi nhận ngay khi KOC bấm nhận mẫu trên mọi trình duyệt (Chrome, Safari, Zalo, TikTok).
- **Công cụ miễn phí (Free Tools / Engineering as Marketing):** Bộ công cụ tính hoa hồng TikTok Shop, định giá kênh KOC và tạo Public Media Kit 1 chạm tại `/cong-cu`.
- **Trợ lý AI KOCity ("Miu"):** Widget chat AI ([KocityAiChatWidget.tsx](src/site/components/KocityAiChatWidget.tsx)) kết nối n8n Webhook + Gemini AI, hỗ trợ hỏi đáp nhận mẫu 0đ, gợi ý kịch bản TikTok 60s chuẩn Hook–USP–CTA và có cơ chế fallback offline.

### 2. Admin BI Analytics & Đồng bộ Dữ liệu Thực tế (Live Data)
- **Đồng bộ trực tiếp Google Sheets công khai (0đ, không cần OAuth)** trong [AdminBIAnalyticsTab.tsx](src/components/AdminBIAnalyticsTab.tsx):
  - Danh sách **~540 KOC đăng ký hệ thống** (`1oDyaZtnnVIe5Nv6sAsolml2-w-1m_-UZ8spKSDmrS1M`).
  - Dữ liệu **3 đợt chiến dịch Cỏ Mềm Homelab** (`16HWYJ3w8x2k_lLvOnB7OGdtWe2KhAAVmNNG6SNkYuZo`): Đợt 1, Đợt 2 và Campaign mới (**68 KOC `Brand duyệt = TRUE`**).
  - Cộng đồng **Zalo KOCity (329 thành viên)**.
- **Phễu chuyển đổi 4 bước Cỏ Mềm & Bảng hiệu quả theo từng sản phẩm:** Hỗ trợ lọc theo đợt, tìm kiếm, sắp xếp và xuất CSV.
- **Dashboard Hệ sinh thái 3 kênh + Looker Studio Embed:** Hiển thị trực quan chỉ số Threads (`@kocity_booking`), Website GA4 (`kocity.io.vn`), Facebook Meta Suite đọc trực tiếp từ tab `BI_He_Sinh_Thai` và nhúng báo cáo Looker Studio.

### 3. Hệ thống AI Agents & Tự động hóa n8n + Telegram + Google Apps Script
| Workflow / Script | Vai trò tự động hóa | File |
| :--- | :--- | :--- |
| **Theo dõi KOC bấm nhận mẫu Realtime** | Nhận tín hiệu `POST`/`GET` từ 68 nút nhận mẫu trên `kocity.io.vn`, lọc trùng KOC qua `staticData`, báo tiến độ `X/68 KOC` về nhóm Telegram Admin | [kocity_tracking_koc_sample_workflow.n8n](kocity_tracking_koc_sample_workflow.n8n) |
| **Quét Video Cỏ Mềm theo Hashtag `#comem` `#ADFI`** | Đọc danh sách 68 KOC `Brand duyệt = TRUE` từ Google Sheet CSV (0đ) → quét 4 hashtag (`#comem`, `#comemhomelab`, `#adfi`, `#kocity`) qua Apify Free → đối chiếu đúng 68 KOC & lọc 100% đúng video Cỏ Mềm → bắn Telegram | [kocity_comem_hashtag_apify_workflow.n8n](kocity_comem_hashtag_apify_workflow.n8n) |
| **Theo dõi Kênh TikTok 0đ (Video Delta)** | Quét trực tiếp trang TikTok công khai (0đ), phát hiện tăng số lượng video của 68 KOC Cỏ Mềm và thông báo Telegram | [kocity_auto_tiktok_crawler_workflow.n8n](kocity_auto_tiktok_crawler_workflow.n8n) |
| **Đồng bộ 5 kênh Hệ sinh thái về Sheets** | Thu thập chỉ số TikTok, Facebook, Threads, Zalo, Website về tab `BI_He_Sinh_Thai` | [kocity_sync_5_channels_to_sheets_workflow.json](kocity_sync_5_channels_to_sheets_workflow.json) |
| **Google Apps Script All-in-One** | Nhận dữ liệu BI & dự phòng bắn thông báo Telegram 24/7 không phụ thuộc server | [google_apps_script_kocity_all_in_one.gs](google_apps_script_kocity_all_in_one.gs) |
| **Email duyệt KOC tự động** | Tự động gửi email thông báo khi Brand duyệt KOC trên Google Sheets | [kocity_koc_approval_email_workflow.json](kocity_koc_approval_email_workflow.json) |

---

## 🛠️ Hướng dẫn chạy dự án Local

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy môi trường phát triển (http://localhost:3000)
npm run dev

# 3. Kiểm tra toàn bộ TypeScript, SEO/GEO & Đóng gói BTL (8 Skills + Workflows)
npm run lint
npm run check:seo
npm run verify:btl

# 4. Build bản production
npm run build
```

---

## 🔐 Lưu ý Bảo mật
- Tuyệt đối không commit các API Token cá nhân (Apify Token, Telegram Bot Token, Supabase Service Key) vào repository.
- Các file cấu hình local chứa secret (như `*_local.json`, `.env`) đều được loại trừ qua `.gitignore`.
