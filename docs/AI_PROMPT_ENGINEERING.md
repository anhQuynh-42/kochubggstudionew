# 🧠 AI Prompt Engineering — Xây dựng Website KOCity & Hệ thống AI Agents

> **Dự án:** KOCity ([https://kocity.io.vn](https://kocity.io.vn)) — Nền tảng B2B2C kết nối Nano/Micro KOC (≥ 1.000 followers) với Nhãn hàng  
> **Mục tiêu tài liệu:** Hệ thống hóa toàn bộ phương pháp luận, kiến trúc System Prompt, các kỹ thuật Prompt Engineering thực chiến đã sử dụng để xây dựng Website KOCity và đội ngũ AI Agents / Automation Workflows trong Bài Tập Lớn (BTL).

---

## 📑 Mục lục
1. [Phương pháp luận Prompt Engineering áp dụng trong dự án](#1-phương-pháp-luận-prompt-engineering-áp-dụng-trong-dự-án)
2. [Phần 1: AI Prompt Engineering để xây dựng Website KOCity](#2-phần-1-ai-prompt-engineering-để-xây-dựng-website-kocity)
3. [Phần 2: AI Prompt Engineering để xây dựng AI Agents & Automation](#3-phần-2-ai-prompt-engineering-để-xây-dựng-ai-agents--automation)
4. [Tổng hợp kết quả thực tế đạt được](#4-tổng-hợp-kết-quả-thực-tế-đạt-được)

---

## 1. Phương pháp luận Prompt Engineering áp dụng trong dự án

Thay vì viết các câu lệnh rời rạc (ad-hoc prompting), nhóm thiết kế **kiến trúc Prompt phân tầng (Layered Prompt Architecture)** gồm 4 lớp:

| Tầng Prompt | Vai trò | Hiện thực trong Repo |
| :--- | :--- | :--- |
| **Tầng 1: Master Context Prompt** | Định nghĩa tầm nhìn sản phẩm, phân quyền 3 vai trò (KOC / Admin / Brand), máy trạng thái nghiệp vụ, Tech Stack & quy tắc bảo mật | [CLAUDE.md](../CLAUDE.md) |
| **Tầng 2: Domain Skill Prompts** | 8 bộ hướng dẫn chuyên môn kích hoạt theo ngữ cảnh (UI/UX, CRO, SEO, GEO, Programmatic SEO, Free Tools, CMS, Safe Deploy) | [.agents/skills/](../.agents/skills/) |
| **Tầng 3: Task & Engineering Prompts** | Prompt giao việc chi tiết có Input/Output rõ ràng, ràng buộc không phá vỡ tính năng cũ (Zero-Regression) | Thực thi từng sprint tính năng |
| **Tầng 4: Runtime Agent Prompts** | System Prompt chạy trực tiếp ở phía người dùng & luồng tự động hóa (Chatbot Miu + n8n Workflows + Telegram Bot) | [KocityAiChatWidget.tsx](../src/site/components/KocityAiChatWidget.tsx), `kocity_*.n8n` |

### Các kỹ thuật Prompt Engineering cốt lõi được áp dụng:
1. **Role & Persona Prompting:** Phân vai rõ ràng cho từng AI Agent (ví dụ: *Lead Product Designer*, *CRO & Funnel Engineer*, *GEO Specialist*, *Trợ lý Miu thân thiện Gen Z*).
2. **Constraint-Driven Prompting (Đặt rào chắn nghiệp vụ):** Khóa chặt các nguyên tắc không được vi phạm (VD: *Ô trống trên Google Sheet tuyệt đối KHÔNG coi là từ chối*; *Không hardcode API secret vào Frontend*; *Không phá vỡ bảng BI hay dữ liệu Supabase hiện có*).
3. **Structured Output & Schema Prompting:** Ép AI sinh đúng cấu trúc TypeScript interface (`src/types.ts`), JSON-LD Schema, RFC-4180 CSV parser và JSON workflow chuẩn schema của n8n v4.2 / `splitInBatches` v3.
4. **Verification-First Prompting:** Mọi prompt chỉnh sửa code đều gắn điều kiện nghiệm thu bắt buộc: chạy `npm run check:seo`, `npm run build` (0 lỗi) và kiểm thử thực tế trên endpoint/trình duyệt trước khi đẩy lên GitHub.

---

## 2. Phần 1: AI Prompt Engineering để xây dựng Website KOCity

### 2.1. Master System Prompt định hướng toàn bộ Codebase (`CLAUDE.md`)
Mọi phiên làm việc với AI Coding Assistant đều nạp [CLAUDE.md](../CLAUDE.md) làm ngữ cảnh gốc, bao gồm:
- **Triết lý nghiệp vụ:** Không thay thế quy trình duyệt trên Google Sheet của Brand; Website đóng vai trò cầu nối tự động hóa 2 chiều.
- **Máy trạng thái 3 lớp độc lập:**
  - `Brand duyệt KOC` → `pending` | `selected` | `not_selected`
  - `ADFI duyệt sample` → `Chờ duyệt mẫu` → `Đã duyệt gửi mẫu` → `Đang trung chuyển` → `Đã phát thành công`
  - `KOC đăng video` → `Chưa đăng video` → `Chờ duyệt video` → `Đã lên bài` → `Hoàn thành`
- **Resilience & Security:** Mọi lời gọi Supabase đều bọc `try/catch` có fallback; tuyệt đối không lộ khóa bí mật ở phía Client.

### 2.2. Prompt xây dựng Giao diện Creator-Centric & Tối ưu Chuyển đổi (UI/UX + CRO)
**Mẫu Prompt thực tế sử dụng:**
```text
Vai trò: Lead Product Designer & CRO Engineer cho KOCity (kocity.io.vn).
Mục tiêu: Thiết kế giao diện Mobile-First phong cách Gen Z TikTok Creator với nhận diện thương hiệu tím #7c3aed (gradient Indigo -> Violet -> Pink).
Yêu cầu bắt buộc:
1. Hero Banner nhấn mạnh 3 giá trị trong 3 giây đầu: "Mẫu 0đ tận tay • Hoa hồng minh bạch • Dành riêng cho kênh từ 1.000 followers".
2. Thẻ chiến dịch hiển thị nổi bật: Tag Mẫu 0đ, % Hoa hồng (15%-25%), yêu cầu ≥ 1.000 followers và thanh tiến độ khan hiếm suất.
3. Form đăng ký nhận mẫu (ApplySheet) tối giản 3 bước, tự động điền lại thông tin cũ (Auto-fill) để giảm rơi rụng trên di động.
4. Giữ nguyên tính năng nút Zalo Community nổi và hiệu ứng Curiosity Cloud.
Kiểm thử: Chạy `npm run build` đạt 0 lỗi và đảm bảo bố cục không tràn ngang ở màn hình 375px.
```

### 2.3. Prompt xây dựng SEO, Programmatic SEO & GEO (Tối ưu tìm kiếm AI)
**Mẫu Prompt thực tế sử dụng:**
```text
Vai trò: GEO & Programmatic SEO Architect cho KOCity.
Nhiệm vụ:
1. Tạo hệ thống trang đích chiến dịch động `/mau-thu/:brandSlug` kèm JSON-LD Schema (Product / Offer 0đ / FAQPage).
2. Cập nhật `public/llms.txt` và `robots.txt` để các công cụ AI Search (ChatGPT Search, Perplexity, Gemini, Google AI Overviews) đọc và trích dẫn chính xác về KOCity.
3. Mỗi bài viết Cẩm nang KOC phải có Citability Block 130–170 từ trả lời trực diện câu hỏi chính ở đầu bài.
Nghiệm thu: Chạy `npm run check:seo` đạt 100% pass.
```

### 2.4. Prompt xây dựng Admin BI Analytics & Đồng bộ Live Google Sheets
**Mẫu Prompt thực tế sử dụng:**
```text
Vai trò: Full-stack BI Engineer cho trang Admin KOCity (`src/components/AdminBIAnalyticsTab.tsx`).
Bối cảnh dữ liệu thực tế:
- Sheet 1 (KOC đăng ký hệ thống, ~540 dòng): ID `1oDyaZtnnVIe5Nv6sAsolml2-w-1m_-UZ8spKSDmrS1M`
- Sheet 2 (Chiến dịch Cỏ Mềm 3 đợt): ID `16HWYJ3w8x2k_lLvOnB7OGdtWe2KhAAVmNNG6SNkYuZo`
  + Đợt 1: `gid=1896058750`
  + Đợt 2: `gid=459414595`
  + Campaign mới: `gid=557155338`
  + Tab Hệ sinh thái BI: `gid=1422698354`
- Nhóm Zalo KOCity: 329 thành viên.
Yêu cầu:
1. Đọc CSV công khai bằng bộ phân tích RFC-4180 hỗ trợ ô xuống dòng (không dùng `.split('\n')` đơn giản).
2. Xây dựng Phễu chuyển đổi 4 bước Cỏ Mềm (Đăng ký -> Brand duyệt -> ADFI duyệt mẫu -> Lên video) và Bảng hiệu quả theo từng sản phẩm (lọc đợt, tìm kiếm, sắp xếp, xuất CSV).
3. Tích hợp 3-panel Ecosystem Insights (Threads `@kocity_booking`, Website GA4, Facebook) và khung nhúng Looker Studio.
4. Gỡ bỏ dải 6-KPI Supabase cũ để tránh trùng lặp số liệu.
```

### 2.5. Prompt xử lý lỗi Tracking Click Beacon trên Website (`BlogContentRenderer.tsx`)
**Mẫu Prompt thực tế sử dụng:**
```text
Vấn đề: 68 nút nhận mẫu Cỏ Mềm trong bài công bố dùng thuộc tính `<a ping="...">` bị trình duyệt di động/Zalo chặn và bài viết cũ còn cache trong Supabase/localStorage trỏ về webhook cũ.
Yêu cầu:
1. Trong `src/site/components/BlogContentRenderer.tsx`, gắn bộ lắng nghe click ủy quyền (event delegation).
2. Tự động chuẩn hóa mọi URL webhook cũ sang Production Webhook URL mới (`https://thanhloc2005.app.n8n.cloud/webhook/koc-sample-claim`) mà vẫn giữ nguyên query params (`koc`, `product`, `followers`, `affLink`).
3. Bắn tín hiệu bằng `fetch(url, { method: 'POST', mode: 'no-cors', keepalive: true })` kèm fallback `navigator.sendBeacon` và gỡ thuộc tính `ping` gốc để không bắn trùng 2 lần.
```

---

## 3. Phần 2: AI Prompt Engineering để xây dựng AI Agents & Automation

### 3.1. Kiến trúc Đa tác tử (Multi-Agent Team: 8 AI Agents `kocity-core`)
Trong quá trình xây dựng và vận hành KOCity, nhóm thiết kế **đội ngũ 8 AI Agents chuyên trách** được định nghĩa trong [CLAUDE.md](../CLAUDE.md), mỗi Agent gắn liền với 1 bộ Skill chuyên sâu:

| STT | Agent ID | Vai trò | Nhiệm vụ chuyên trách |
| :---: | :--- | :--- | :--- |
| 1 | `geo-agentic-seo` | GEO & AI Search Specialist | Tối ưu trích dẫn AI Search, quản lý `llms.txt`, `robots.txt`, Citability Block |
| 2 | `form-conversion-cro` | CRO & Funnel Engineer | Tối ưu tỷ lệ hoàn thành form nhận mẫu 0đ (`ApplySheet`), giảm drop-off |
| 3 | `programmatic-seo` | Programmatic SEO Architect | Tự động hóa trang đích `/mau-thu/:brandSlug` & JSON-LD Rich Snippets |
| 4 | `free-tools-leadgen` | Growth & Free Tools Engineer | Xây dựng công cụ miễn phí (tính hoa hồng TikTok, định giá kênh, Media Kit) |
| 5 | `ui-ux-designer` | Lead Product Designer | Chuẩn hóa thiết kế `#7c3aed`, Mobile-First Parity, Curiosity Cloud |
| 6 | `safe-deploy-guardian` | QA & Release Engineer | Bảo vệ Zero-Regression, kiểm tra build/SEO trước khi release |
| 7 | `seo-content-editor` | Content & Editorial Lead | Biên soạn bài viết Cẩm nang KOC & kịch bản TikTok chuẩn SEO |
| 8 | `wysiwyg-cms-engineer` | Admin CMS Specialist | Phát triển & bảo vệ bộ soạn thảo WYSIWYG CMS, chống lỗi HTML/CSS |

**Cú pháp Prompt điều phối Agent:**
```text
Hãy đóng vai agent @[tên-agent] dựa trên quy chuẩn tại `.agents/skills/[tên-skill]/SKILL.md` để thực hiện: [mô tả mục tiêu cụ thể]. Báo cáo rõ file thay đổi và kết quả kiểm thử.
```

### 3.2. System Prompt cho Trợ lý AI KOCity ("Miu" — Chatbot trực tuyến trên Web)
Triển khai tại [src/site/components/KocityAiChatWidget.tsx](../src/site/components/KocityAiChatWidget.tsx), kết nối Webhook n8n + Gemini LLM:

```text
[SYSTEM PROMPT — TRỢ LÝ AI KOCITY "MIU"]
Vai trò: Bạn là Miu — Trợ lý AI chính thức của nền tảng KOCity (kocity.io.vn), giọng điệu trẻ trung, nhiệt tình, gần gũi với cộng đồng Nano/Micro KOC Gen Z Việt Nam.

Kiến thức cốt lõi bắt buộc tuân thủ:
1. Điều kiện nhận mẫu 0đ: Kênh TikTok từ 500–1.000 followers trở lên, nhận mẫu 0đ miễn phí 100% (Freeship tận nhà), cam kết nộp video gắn giỏ hàng trong 5–7 ngày kể từ lúc nhận hàng.
2. Khung kịch bản TikTok 60s chuẩn chuyển đổi:
   - 0–3s (Hook): Giật tít đánh vào nỗi đau hoặc sự tò mò.
   - 4–40s (Trải nghiệm thật): Quay cận chất liệu/chất kem, nêu 2–3 USP chân thật, không đọc quảng cáo sáo rỗng.
   - 41–60s (CTA): Kêu gọi bấm giỏ hàng vàng góc trái kèm ưu đãi trợ giá.
3. Chính sách hoa hồng: 10%–25% hoa hồng Affiliate trực tiếp từ TikTok Shop + thưởng nóng (booking bonus) nếu có; TikTok quyết toán tự động về ngân hàng.
4. Giới hạn an toàn: Tuyệt đối khẳng định KOCity KHÔNG thu bất kỳ khoản cọc hay phí tham gia nào. Không bịa đặt thông tin chiến dịch không có thật.

Định dạng trả lời: Ngắn gọn, chia gạch đầu dòng rõ ràng, dùng emoji vừa phải, luôn kết thúc bằng lời gợi mở hành động (CTA) cụ thể.
```

### 3.3. Prompt Engineering thiết kế các AI / Automation Agents trên n8n
Nhóm sử dụng Prompt Engineering để thiết kế, sinh code xử lý dữ liệu (JavaScript Code Nodes) và kiểm thử **5 luồng Agent tự động hóa thực tế**:

#### A. Agent theo dõi 68 KOC bấm nhận mẫu Realtime ([kocity_tracking_koc_sample_workflow.n8n](../kocity_tracking_koc_sample_workflow.n8n))
- **Prompt thiết kế:** Nhận Webhook `POST`/`GET` tại `/webhook/koc-sample-claim`, làm sạch TikTok handle (loại bỏ `https://tiktok.com/@`, `@www...`), lưu danh sách KOC độc nhất không trùng lặp bằng `$getWorkflowStaticData('global')`, tính `% tiến độ / 68 KOC` và bắn tin nhắn HTML về nhóm Telegram Admin (`-5348405193`).

#### B. Agent quét Video Cỏ Mềm theo Hashtag `#comem` `#ADFI` ([kocity_comem_hashtag_apify_workflow.n8n](../kocity_comem_hashtag_apify_workflow.n8n))
- **Prompt tối ưu chi phí & độ chính xác:**
  - *Bài toán:* Nếu quét cả 68 kênh KOC sẽ tốn nhiều credit; nếu chỉ đếm số video tăng sẽ báo nhầm video của brand khác.
  - *Giải pháp Prompt:*
    1. Tải danh sách 68 KOC `Brand duyệt = TRUE` trực tiếp từ Google Sheet CSV công khai (0đ, không cần Google OAuth, dùng RFC-4180 parser).
    2. Gọi Apify `clockworks~tiktok-scraper` quét đúng **4 hashtag chiến dịch** (`comem`, `comemhomelab`, `adfi`, `kocity`) với `Authentication: None` + Query Parameter `token` (tránh lỗi Custom Auth, tiết kiệm ~15 lần credit so với quét 68 kênh).
    3. Đối chiếu 2 lớp: `authorMeta.name` phải nằm trong 68 KOC đã duyệt **VÀ** caption/hashtag chứa từ khóa Cỏ Mềm (`#comem`, `cỏ mềm`, `son dưỡng gạo`, `notes of nature`, `sâm 1700`...).
    4. Chống báo trùng video cũ qua `staticData.detectedVideoIds`, bắn báo cáo Telegram kèm link video thật, caption, lượt xem và tên sản phẩm KOC đã nhận.

#### C. Agent theo dõi Kênh TikTok 0đ ([kocity_auto_tiktok_crawler_workflow.n8n](../kocity_auto_tiktok_crawler_workflow.n8n))
- Đọc trực tiếp trang công khai `https://www.tiktok.com/@<handle>` (phân tích JSON `__UNIVERSAL_DATA_FOR_REHYDRATION__`), lặp từng KOC qua `splitInBatches` v3 kết hợp `Wait 1.5s` chống chặn, phát hiện biến động `videoCount` hoàn toàn 0đ.

#### D. Agent đồng bộ BI 5 Kênh & Google Apps Script ([kocity_sync_5_channels_to_sheets_workflow.json](../kocity_sync_5_channels_to_sheets_workflow.json), [google_apps_script_kocity_all_in_one.gs](../google_apps_script_kocity_all_in_one.gs))
- Thu thập chỉ số từ TikTok, Facebook, Threads, Zalo và Website GA4, đẩy về tab `BI_He_Sinh_Thai` trên Google Sheets qua Apps Script Web App POST để hiển thị realtime trên Admin Dashboard.

---

## 4. Tổng hợp kết quả thực tế đạt được

| Hạng mục | Kết quả đo lường thực tế |
| :--- | :--- |
| **Website Production** | Triển khai live tại [https://kocity.io.vn](https://kocity.io.vn), `vite build` 0 lỗi, `npm run check:seo` pass 100% |
| **Dữ liệu thực tế vận hành** | Đồng bộ trực tiếp **~540 KOC đăng ký**, **3 đợt chiến dịch Cỏ Mềm** (**68 KOC duyệt đợt mới**), **329 thành viên Zalo** |
| **Tự động hóa vận hành** | Giảm 100% thao tác kiểm tra thủ công việc KOC bấm nhận mẫu & đăng video Cỏ Mềm nhờ hệ thống n8n + Telegram Bot |
| **Tái sử dụng tri thức AI** | Đóng gói hoàn chỉnh thành **8 AI Skills** chuẩn hóa tại [.agents/skills/](../.agents/skills/) (xem chi tiết tại [AI_SKILLS_BTL.md](AI_SKILLS_BTL.md)) |
