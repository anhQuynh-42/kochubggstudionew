# CLAUDE.md — KOCity Project Guide & Context

> **Tài liệu tham chiếu chuẩn dành cho AI Coding Assistant (Claude Code / Antigravity)**  
> **Dự án:** KOCity (KOC Hub GG Studio)  
> **Phiên bản PRD:** 1.1 (Product Specification & Google Sheets Sync Design)  
> **Đối tượng:** Nano KOC & Micro KOC (từ 1.000 followers trở lên) trên TikTok  

---

## 1. 🎯 Tổng quan sản phẩm & Triết lý cốt lõi (Product Vision)

KOCity là nền tảng B2B2C trung gian kết nối các Nhãn hàng (đặc biệt là SMEs) với cộng đồng Nano/Micro KOC trong các chiến dịch Marketing trên TikTok.

### Nguyên tắc bất di bất dịch:
1. **Không thay thế quy trình duyệt của Brand:** Brand tiếp tục duyệt và lựa chọn KOC trực tiếp trên **Google Sheet riêng của từng Campaign**.
2. **Website đóng vai trò cầu nối tự động hóa:**
   - Tiếp nhận hồ sơ đăng ký từ KOC -> Lưu vào Database -> Đồng bộ tức thời sang đúng Google Sheet của Campaign.
   - Quét dữ liệu định kỳ (chu kỳ 10 phút) từ Google Sheet -> Cập nhật trạng thái ứng tuyển trên hệ thống -> Đưa thông báo vào hàng đợi gửi KOC.
   - Hỗ trợ Admin theo dõi tiến độ tổng thể (Duyệt ứng tuyển -> Duyệt gửi mẫu `ADFI` -> Tiến độ đăng video TikTok -> Báo cáo hiệu quả).

---

## 2. 👥 Phân quyền & Vai trò người dùng (Roles)

- **KOC:**
  - Khám phá các chiến dịch phù hợp với ngành hàng và lượng followers.
  - Đăng ký nhận mẫu sản phẩm (cung cấp TikTok ID, Link kênh, số followers tại thời điểm nộp đơn, sản phẩm mong muốn, concept làm video).
  - Theo dõi trạng thái ứng tuyển trong tab `MyCampaignsView`.
  - Nhận thông báo kết quả (Được chọn / Chưa được chọn).
- **Admin (Nhóm vận hành KOCity):**
  - Tạo, chỉnh sửa, mở/đóng Campaign; **gắn link Google Sheet tương ứng cho từng Campaign**.
  - Quản lý danh sách ứng tuyển, theo dõi tình trạng đồng bộ 2 chiều với Google Sheets.
  - Theo dõi tiến độ nội bộ: duyệt mẫu (`ADFI duyệt sample`), cấp mã vận đơn, kiểm tra nộp link video (`KOC đăng video`).
  - Quản trị KOC CRM, Media Kit và đo lường các chỉ số hiệu quả (tỷ lệ duyệt, số video hoàn thành, lượt xem/tương tác).
- **Brand:**
  - Làm việc trực tiếp trên file Google Sheet được chia sẻ.
  - Đưa ra quyết định lựa chọn tại cột `Brand duyệt KOC`. Không bắt buộc tạo tài khoản trên website trong giai đoạn này.

---

## 3. 📊 Máy trạng thái ứng tuyển & Ánh xạ Google Sheets

Hệ thống tách biệt rõ ràng **3 lớp trạng thái độc lập** — tuyệt đối không gộp chung gây sai lệch luồng nghiệp vụ:

### 3.1. Trạng thái tuyển chọn (Selection Status - Cột `Brand duyệt KOC`)
Nguồn quyết định duy nhất để gửi thông báo kết quả cho KOC:

| Mã trạng thái | Tên hiển thị | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- |
| `pending` | **Chờ kết quả** | Chưa có kết quả hợp lệ từ cột *Brand duyệt KOC* trên Sheet. |
| `selected` | **Được chọn** | Brand xác nhận lựa chọn KOC tham gia chiến dịch. |
| `not_selected` | **Chưa được chọn** | Brand xác nhận không lựa chọn KOC đợt này. |

> ⚠️ **Quy tắc quan trọng:**
> - Ô trống trên Sheet **KHÔNG** được tự ý coi là từ chối. Phải giữ trạng thái `pending` hoặc đánh dấu dữ liệu cần xử lý.
> - Chỉ gửi thông báo mới khi có sự thay đổi trạng thái hợp lệ. Không gửi lặp lại thông báo khi quét lại cùng một trạng thái.

### 3.2. Trạng thái duyệt mẫu nội bộ (Sample Status - Cột `ADFI duyệt sample`)
- Dùng cho đội ngũ vận hành theo dõi quy trình gửi hàng mẫu trải nghiệm.
- Không quyết định thông báo trúng tuyển của Brand.
- Các bước: `Chờ duyệt mẫu` -> `Đã duyệt gửi mẫu` -> `Đang trung chuyển` -> `Đã phát thành công`.

### 3.3. Trạng thái thực hiện video (Video Posting Status - Cột `KOC đăng video`)
- Theo dõi việc KOC hoàn thành cam kết nộp bài: `Chưa đăng video` -> `Chờ duyệt video` -> `Đã lên bài` -> `Hoàn thành`.
- Thu thập link video, lượt views, likes, comments (hiện tại nhập thủ công trên Sheet hoặc qua form nộp bài).

---

## 4. 🔗 Thiết kế tích hợp Google Sheets 2 chiều

### 4.1. Định danh hồ sơ (Data Identity)
- Mỗi Campaign liên kết với một Google Sheet riêng (cấu hình trong Campaign model).
- Trên Google Sheet, phải có cột khóa kỹ thuật: **`KOCity_Application_ID`**.
- Khóa đối chiếu dữ liệu:
  - `campaign_id`: ID chiến dịch trong hệ thống KOCity.
  - `application_id` (`KOCity_Application_ID`): Mã định danh duy nhất cho từng đơn nộp.
  - `koc_user_id`: ID tài khoản KOC.
- Tuyệt đối **không** dùng tên TikTok, tên hiển thị hay link kênh làm khóa chính (vì có thể thay đổi hoặc trùng lặp).

### 4.2. Luồng đồng bộ Web -> Sheet (Khi KOC nộp đơn)
1. KOC submit form đăng ký tại `RegistrationModal.tsx`.
2. Hệ thống lưu hồ sơ ứng tuyển vào cơ sở dữ liệu Supabase trước (`public.applications`).
3. Xác định link Google Sheet tương ứng của Campaign đó.
4. Ghi thông tin đăng ký vào dòng mới trên Sheet với đầy đủ `KOCity_Application_ID`.
5. *Nguyên tắc an toàn:* Lưu Database thành công là ưu tiên số 1. Nếu việc ghi Sheet bị lỗi mạng/API, lưu trạng thái lỗi để Admin bấm thử lại (Retry), tuyệt đối không làm mất đơn đăng ký của KOC.

### 4.3. Luồng đồng bộ Sheet -> Web (Cập nhật kết quả định kỳ)
1. Bộ đồng bộ chạy định kỳ theo chu kỳ **10 phút** (hoặc kích hoạt thủ công từ Admin Dashboard).
2. Đọc Sheet của các chiến dịch đang mở.
3. Đối chiếu dòng bằng `KOCity_Application_ID`.
4. Đọc cột `Brand duyệt KOC`, ánh xạ sang `pending` / `selected` / `not_selected`.
5. So sánh với trạng thái hiện tại trong DB:
   - Nếu có thay đổi hợp lệ: Cập nhật DB, lưu log lịch sử (`previous_status`, `new_status`, `synced_at`), tạo notification vào hàng đợi gửi KOC.
   - Nếu KOC đã ấn "Hủy tham gia" trên web: Không để chu kỳ quét tự động ghi đè hủy thành tham gia.

---

## 5. 🛠 Tech Stack & Lệnh thực thi (Commands)

### Công nghệ sử dụng:
- **Frontend:** React 19, TypeScript (~5.8), Vite 6
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`, CSS imports tại `src/index.css`)
- **Backend / Database:** Supabase (PostgreSQL, Row Level Security, Realtime Pub/Sub)
- **AI Agent Integration:** Google GenAI SDK (`@google/genai`)
- **UI Libraries:** `lucide-react` (icon), `motion` (animation), `html-to-image`

### Lệnh chạy thường dùng (trên Windows dùng `npm.cmd` nếu gặp ExecutionPolicy):
```bash
# Khởi động môi trường phát triển (Port 3000, Host 0.0.0.0)
npm.cmd run dev

# Kiểm tra lỗi TypeScript / Lint
npm.cmd run lint      # (hoặc: npx.cmd tsc --noEmit)

# Build bundle sản phẩm
npm.cmd run build

# Xem thử bản build production
npm.cmd run preview
```

---

## 6. 📂 Cấu trúc thư mục mã nguồn (Codebase Structure)

```text
kochubggstudionew/
├── CLAUDE.md                     # File chỉ dẫn ngữ cảnh cốt lõi này
├── package.json                  # Scripts & dependencies
├── vite.config.ts                # Cấu hình Vite & Tailwind v4 plugin
├── supabase/
│   └── schema.sql                # DDL Database Schema & RLS Policies
├── src/
│   ├── App.tsx                   # Main layout & router giữa các view
│   ├── index.css                 # Import Tailwind CSS v4 & custom animations
│   ├── types.ts                  # Định nghĩa TypeScript interfaces (Campaign, KOCApplication, KOCUser...)
│   ├── components/
│   │   ├── AdminView.tsx         # Bảng điều khiển quản trị viên (Campaigns, KOC, Sync status)
│   │   ├── MarketplaceView.tsx   # Danh sách chiến dịch mở cho KOC tìm kiếm & lọc
│   │   ├── CampaignDetailView.tsx# Trang chi tiết chiến dịch & thông tin sample/concept
│   │   ├── RegistrationModal.tsx # Form đăng ký nhận mẫu 3 bước của KOC
│   │   ├── MyCampaignsView.tsx   # Danh sách chiến dịch KOC đã ứng tuyển & theo dõi kết quả
│   │   ├── KOCProfileView.tsx    # Hồ sơ cá nhân KOC & tạo Public Media Kit
│   │   ├── LoginModal.tsx        # Đăng nhập / Chuyển đổi tài khoản KOC / Admin
│   │   ├── Toast.tsx             # Thông báo nhanh trên UI
│   │   └── ZaloCommunityWidget.tsx # Widget cộng đồng KOCity Zalo
│   ├── services/
│   │   └── supabaseService.ts    # Service tầng dữ liệu: CRUD Campaign, Application, Realtime
│   ├── lib/
│   │   ├── supabase.ts           # Khởi tạo Supabase client & kiểm tra biến môi trường
│   │   └── clipboard.ts          # Utility sao chép nội dung
│   └── data/
│       └── mockData.ts           # Dữ liệu mock ban đầu cho dev / offline mode
```

---

## 7. 🔐 Bảo mật & Quy ước phát triển (Engineering Conventions)

1. **Tuyệt đối không lưu khóa bí mật ở Client:**
   - Client chỉ được chứa `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.
   - Private Service Account Key của Google Sheets hoặc API Secret tuyệt đối **không** được bundle vào mã nguồn frontend. Sử dụng Supabase Edge Functions hoặc Proxy Backend cho các tác vụ nhạy cảm.
2. **TypeScript Strictness:**
   - Luôn định nghĩa types trong `src/types.ts`.
   - Không lạm dụng `any`. Sau mỗi lần refactor hoặc thêm tính năng, luôn chạy `npm.cmd run lint` (`tsc --noEmit`) để xác nhận 0 lỗi types.
3. **Resilience & Fallback First:**
   - Các hàm gọi Supabase luôn bọc trong `try/catch`. Nếu Supabase chưa được cấu hình hoặc offline, ứng dụng tự động fallback về `mockData` để đảm bảo trải nghiệm người dùng không bị crash màn hình trắng.
4. **Idempotency trong xử lý dữ liệu:**
   - Kiểm tra trùng lặp đơn ứng tuyển (`campaignId` + `kocId`/`tiktokHandle`).
   - Ghi nhận trạng thái và cờ đã gửi thông báo để không bao giờ gửi spam thông báo lặp lại cho KOC.

---

## 8. 🎨 UI/UX Design System & Retention Strategy (Creator-Centric & Mobile-First)

Mục tiêu giao diện: **Thu hút KOC ngay trong 3 giây đầu và giữ chân họ quay lại mỗi ngày.**

### 8.1. Phong cách thẩm mỹ (Creator Aesthetics - Gen Z & TikTok Style)
- **Màu sắc:** Nền sáng sạch (Clean White), điểm nhấn gradient tím - hồng neon (`#6366f1` Indigo sang `#8b5cf6` Violet và `#ec4899` Pink).
- **Hình khối:** Bo góc lớn (`rounded-2xl`, `rounded-3xl`), Glassmorphism nhẹ, đổ bóng nổi khối hiện đại.
- **Hero Banner:** Nhấn mạnh 3 quyền lợi cốt lõi: *"Mẫu 0đ tận tay • Hoa hồng minh bạch • Dành riêng cho kênh từ 1.000 followers"*. Kèm thanh Live Ticker chạy hoạt động thời gian thực (FOMO).

### 8.2. Thiết kế Thẻ Chiến Dịch (Campaign Card - Chuẩn TikTok Shop)
- 3 thông số bắt buộc nổi bật nhất:
  1. **Tag Mẫu 0đ (Freecast):** Màu xanh mint hoặc tím.
  2. **Tỷ lệ Hoa hồng (% Commission):** Ví dụ: `15% - 25%` in đậm.
  3. **Yêu cầu kênh:** Ghi rõ `≥ 1.000 followers` (để Nano KOC tự tin đăng ký).
- **Urgency (Độ khan hiếm):** Thanh tiến độ *"Còn lại 4/20 suất"* kích thích nộp đơn ngay.
- **Nút 1-chạm:** *"Nhận mẫu ngay"* mở pop-up trực tiếp.

### 8.3. Quy trình nộp đơn Zero-Friction (Registration Modal)
- Wizard 3 bước ngắn gọn, tối ưu tự điền (Auto-fill) thông tin TikTok, SĐT, địa chỉ nếu KOC đã từng nộp một lần.

### 8.4. Giữ chân KOC (Retention Pillars)
1. **Tiến trình đơn dạng Timeline (MyCampaignsView):** Trực quan như theo dõi đơn hàng Shopee (`Đã nộp đơn` -> `Brand đang xem` -> `Duyệt gửi mẫu & Vận đơn` -> `Đã lên bài`).
2. **KOC Media Kit Cá Nhân Hóa:** Cho phép KOC xuất link & ảnh Card Profile Media Kit đẹp mắt để tự đi pitching nhãn hàng.
3. **Cộng đồng Zalo hỗ trợ 24/7:** Widget kết nối cộng đồng ghim góc màn hình.
4. **Mobile-First:** Thanh Bottom Navigation cố định dưới đáy màn hình điện thoại & nút Sticky CTA khi xem chi tiết chiến dịch.
