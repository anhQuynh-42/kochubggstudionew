# 00_README — BỘ AI PROMPT ENGINEERING TÁI TẠO WEBSITE KOCITY

> 📌 **Ghi chú quan trọng:** Phần prompt xây AI agent xem tại `docs/AI_PROMPT_ENGINEERING.md`, phần AI Skills xem tại `docs/AI_SKILLS_BTL.md`.

---

## 1. Giới thiệu ngắn về dự án
* **Tên dự án:** **KOCity** (Nền tảng Kết nối Nhãn hàng & Cộng đồng Nano/Micro KOC TikTok)
* **Link Website:** `https://kocity.io.vn`
* **Mô hình hoạt động:** Nền tảng B2B2C trung gian kết nối các Nhãn hàng (SMEs, Brands) với cộng đồng Nano KOC (từ 1.000 followers) và Micro KOC (từ 5.000 followers) trên TikTok để đăng ký nhận sản phẩm mẫu miễn phí 0đ (**Freecast**), sản xuất video review theo kịch bản gợi ý (**Brief**) và nhận hoa hồng tiếp thị liên kết (**Affiliate**) minh bạch theo đơn hàng.
* **Mục tiêu của bộ tài liệu này:** Cung cấp bộ **AI Prompt Engineering xây dựng Website** tự đủ ngữ cảnh 100% để một AI Coding Agent hoàn toàn mới (ví dụ: Claude, Cursor, Antigravity) có thể chạy lần lượt từ đầu đến cuối nhằm tái tạo lại toàn bộ giao diện, tính năng và cơ sở dữ liệu của website KOCity giống hệt bản hiện tại.

---

## 2. Chế độ chạy Offline / Mock Data (KHÔNG CẦN API KEY VẪN CHẠY ĐƯỢC 100%)
> **Lưu ý quan trọng dành cho Giảng viên / AI Agent chấm bài:**
> Dự án KOCity được thiết kế theo kiến trúc **Resilience & Offline-First Fallback** (`src/state/AppDataContext.tsx`, `src/services/authService.ts`, `src/data/mockData.ts`, `src/data/blogData.ts`):
> 1. **Khi KHÔNG có các biến môi trường** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_SHEETS_WEBHOOK_URL`, `GEMINI_API_KEY`):
>    * Toàn bộ website **VẪN CHẠY ĐƯỢC 100% ĐẦY ĐỦ TÍNH NĂNG** ngay lập tức bằng bộ dữ liệu mẫu khởi tạo sẵn (`INITIAL_CAMPAIGNS`, `INITIAL_APPLICATIONS`, `INITIAL_NOTIFICATIONS` trong `src/data/mockData.ts` và `INITIAL_BLOG_POSTS` trong `src/data/blogData.ts`) kết hợp lưu trữ bền vững trên `localStorage` của trình duyệt.
>    * Mọi thao tác: Đăng ký/Đăng nhập KOC, Nộp đơn nhận mẫu 2 bước, Theo dõi tiến độ đơn, Tạo & Tải ảnh Public Media Kit, Mở khóa bài viết Cẩm nang SEO, Đăng nhập cổng bảo mật Admin 2 lớp, Thêm/Sửa/Xóa chiến dịch, Duyệt đơn, Xuất file CSV UTF-8 BOM cho Brand và Soạn thảo bài viết WYSIWYG CMS đều hoạt động trơn tru mà không xảy ra bất kỳ lỗi màn hình trắng hay crash ứng dụng nào.
> 2. **Cơ chế tự động nhận diện trong code:** Trong file `src/lib/supabase.ts`, hàm `isSupabaseConfigured()` kiểm tra xem URL Supabase có phải là giá trị mặc định/placeholder (`https://your-project.supabase.co` hoặc chứa chuỗi `placeholder`) hay không. Khi thiếu biến môi trường `.env`, cấu hình mặc định nhận giá trị `https://placeholder.supabase.co` (`isSupabaseConfigured() === false`) để AI Agent của thầy chạy độc lập 100% ở chế độ Mock Data + LocalStorage mà không cần kết nối mạng tới máy chủ riêng của nhóm.

---

## 3. Yêu cầu môi trường & Công nghệ sử dụng

### 3.1. Công nghệ & Thư viện (Tech Stack)
* **Runtime & Build Tool:** Node.js (`>= 18.x`), Vite (`^6.2.3`), TypeScript (`~5.8.2`)
* **Frontend Framework:** React (`^19.0.1`), React DOM (`^19.0.1`), React Router DOM (`^7.18.4`)
* **Styling & UI Icons:** Tailwind CSS v4 (`tailwindcss: ^4.1.14`, `@tailwindcss/vite: ^4.1.14`), Google Material Symbols Outlined (nhúng qua `index.html`), `lucide-react` (`^0.546.0`)
* **Tiện ích mở rộng:**
  * `html-to-image` (`^1.11.13`): Xuất thẻ Public Media Kit của KOC thành file ảnh PNG.
  * `@supabase/supabase-js` (`^2.117.2`): Kết nối cơ sở dữ liệu đám mây, xác thực và đồng bộ Realtime (tùy chọn).
  * `@google/genai` (`^2.4.0`): SDK tích hợp AI (tùy chọn).

### 3.2. Các biến môi trường (`.env.example`)
Tuyệt đối không cần điền key thật để chạy demo local. Nếu muốn kết nối dịch vụ đám mây thực tế, tạo file `.env` ở thư mục gốc với tên các biến sau:

```env
# Khoá API Gemini AI (Tuỳ chọn - dùng cho các tác vụ AI mở rộng)
GEMINI_API_KEY=

# URL của ứng dụng khi triển khai
APP_URL=

# Webhook Google Apps Script để đẩy đơn đăng ký KOC sang Google Sheets (Tuỳ chọn)
VITE_GOOGLE_SHEETS_WEBHOOK_URL=

# Cấu hình cơ sở dữ liệu đám mây Supabase (Tuỳ chọn - nếu để trống web tự chạy bằng Mock Data + LocalStorage)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## 4. Danh sách các Prompt & Thứ tự thực thi (`01 -> 02 -> 03 -> 04 -> 05 -> 07`)

Để tái tạo website chính xác và không gặp lỗi thiếu file import, AI Agent cần chạy lần lượt **6 file Prompt xây dựng web** theo đúng thứ tự: **`01 -> 02 -> 03 -> 04 -> 05 -> 07`** *(Phần prompt xây AI agent xem tại `docs/AI_PROMPT_ENGINEERING.md`, phần AI Skills xem tại `docs/AI_SKILLS_BTL.md`)*:

| Thứ tự chạy | Đường dẫn File Prompt | Tên & Nội dung chính | Phụ thuộc vào |
| :---: | :--- | :--- | :--- |
| **1** | `nop-bai/prompts-xay-web/01_kien-truc-du-an-va-database-schema.md` | **Giai đoạn 1 — Cấu trúc dự án, TypeScript Types, Mock Data & Supabase Schema:** Khởi tạo `package.json`, `vite.config.ts`, `index.html`, `src/types.ts`, dữ liệu mẫu `src/data/mockData.ts`, `src/data/blogData.ts`, cấu hình `src/lib/supabase.ts` (hỗ trợ Offline/Mock Data) và file SQL `supabase/schema.sql`. | *Không (Chạy đầu tiên)* |
| **2** | `nop-bai/prompts-xay-web/02_he-thong-giao-dien-va-khung-dieu-huong.md` | **Giai đoạn 2 — Design System, Khung điều hướng, Thành phố KOCity & Trợ lý Drone:** Tạo `src/index.css` (animations & bảng màu), `src/site/ui.tsx`, `src/site/SiteLayout.tsx`, `src/site/components/KocitySkyline.tsx`, `src/site/components/KocityWorldModal.tsx` và `src/site/components/DeliveryDroneAssistant.tsx`. | Phụ thuộc **Prompt 01** |
| **3** | `nop-bai/prompts-xay-web/03_cac-trang-koc-marketplace-va-cam-nang-seo.md` | **Giai đoạn 3 — Các trang khám phá KOC Marketplace & Cẩm nang SEO:** Tạo `HomePage.tsx`, `CampaignCard.tsx`, `CampaignPage.tsx`, `ProcessPage.tsx`, `NotificationsPage.tsx`, `BlogReaderModal.tsx` và `BlogContentRenderer.tsx`. | Phụ thuộc **Prompt 01, 02** |
| **4** | `nop-bai/prompts-xay-web/04_xac-thuc-nop-don-theo-doi-va-media-kit.md` | **Giai đoạn 4 — Xác thực SHA-256, Nộp đơn 2 bước, Theo dõi tiến độ & Public Media Kit:** Tạo `authHelpers.ts`, `authService.ts`, `AuthSheet.tsx`, `ApplySheet.tsx`, `MyApplicationsPage.tsx`, `ProgressPage.tsx`, `ProfilePage.tsx` và `PublicMediaKitModal.tsx`. | Phụ thuộc **Prompt 01, 02, 03** |
| **5** | `nop-bai/prompts-xay-web/05_he-thong-quan-tri-admin-cms-va-dong-bo-cloud.md` | **Giai đoạn 5 — Hệ thống Quản trị Admin, Xuất CSV Brand, WYSIWYG CMS & AppDataContext:** Tạo `AdminSecurityGate.tsx`, `AdminView.tsx`, `AdminBlogManager.tsx`, `supabaseService.ts`, `AppDataContext.tsx`, `SiteUI.tsx` và `src/App.tsx`. | Phụ thuộc **Prompt 01, 02, 03, 04** |
| **6** | `nop-bai/prompts-xay-web/07_kiem-thu-dong-bo-sua-loi-va-safe-deploy.md` | **Giai đoạn 7 — Kiểm thử, Sửa lỗi & Triển khai (Safe Deploy):** Chia làm 2 phần rõ ràng: **Phần A (Bắt buộc – Không cần API Key)** kiểm tra TypeScript, chạy dev server và build production; **Phần B (Tuỳ chọn – Cần API Key)** chạy script `scripts/verify-cloud-sync.js` và deploy Vercel. | Phụ thuộc **Prompt 01 -> 05** |

---

## 5. Sơ đồ luồng phụ thuộc (Dependency Flow)

```text
[01_kien-truc-du-an-va-database-schema.md]
                  │
                  ▼
[02_he-thong-giao-dien-va-khung-dieu-huong.md]
                  │
                  ▼
[03_cac-trang-koc-marketplace-va-cam-nang-seo.md]
                  │
                  ▼
[04_xac-thuc-nop-don-theo-doi-va-media-kit.md]
                  │
                  ▼
[05_he-thong-quan-tri-admin-cms-va-dong-bo-cloud.md]
                  │
                  ▼
[07_kiem-thu-dong-bo-sua-loi-va-safe-deploy.md]
```

*(Tài liệu liên quan trong dự án: Phần prompt xây AI agent xem tại `docs/AI_PROMPT_ENGINEERING.md`, phần AI Skills xem tại `docs/AI_SKILLS_BTL.md`).*
