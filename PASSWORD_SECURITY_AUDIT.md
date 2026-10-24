# BÁO CÁO KIỂM TOÁN VÀ KHẮC PHỤC LỖ HỔNG LƯU MẬT KHẨU PLAINTEXT — KOCITY
**Dự án:** KOCity Platform (kocity.io.vn)  
**Thời gian kiểm toán:** 24/10/2026  
**Chuyên môn:** Senior Full-stack Developer & Web Security Engineer  
**Trạng thái kiểm toán:** Giai đoạn 1 — Đã hoàn thành kiểm tra, phân tích và xuất báo cáo. **Chưa chỉnh sửa bất kỳ file mã nguồn hay dữ liệu nào.**

---

## 1. TỔNG QUAN VÀ MỤC TIÊU KIỂM TOÁN

Báo cáo này tập trung rà soát toàn bộ các điểm chạm liên quan đến việc khởi tạo, truyền nhận, lưu trữ và xác thực mật khẩu cũng như mã PIN quản trị trên nền tảng KOCity.

Mục tiêu cốt lõi:
1. Xác định chính xác các điểm yếu chí mạng trong việc lưu trữ và xác thực mật khẩu/PIN dạng văn bản thô (plaintext).
2. Xây dựng lộ trình chuyển đổi (migration) sang kiến trúc xác thực tiêu chuẩn **Supabase Auth** trên PostgreSQL.
3. **Nguyên tắc bất di bất dịch:** Bảo vệ tuyệt đối an toàn dữ liệu, giữ nguyên vẹn 100% hồ sơ KOC hiện tại, lịch sử đăng ký chiến dịch, không làm gián đoạn trải nghiệm người dùng và không làm sai lệch liên kết dữ liệu.

---

## 2. BẢNG PHÁT HIỆN LỖ HỔNG CHI TIẾT

> **Lưu ý bảo mật:** Báo cáo này tuyệt đối không hiển thị mật khẩu, mã PIN hoặc dữ liệu cá nhân thật (được ký hiệu bằng `[REDACTED]`).

| ID | Vị trí phát hiện (File & Dòng) | Phân loại rủi ro | Mức độ | Nguy cơ bảo mật | Trạng thái xác minh |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | `src/services/supabaseService.ts` (L560-L585) | Rò rỉ Plaintext Password lên Cloud DB | **CRITICAL** | Mật khẩu KOC lưu thẳng vào Supabase và lộ qua API công khai | **Đã xác nhận trong Code & DB** |
| **SEC-02** | `src/services/authService.ts` (L22-L23) | Hardcoded Admin Credentials | **CRITICAL** | Lộ tài khoản & mật khẩu Admin trong mã nguồn build JS | **Đã xác nhận trong Code & Git** |
| **SEC-03** | `src/components/AdminSecurityGate.tsx` (L9, L60-L80) | Hardcoded Admin PIN & Client Auth | **HIGH** | Vượt qua cổng bảo vệ Admin qua F12 Console hoặc đọc bundle | **Đã xác nhận trong Code** |
| **SEC-04** | `src/services/authService.ts` (L32-L41, L158-L184) | Plaintext Password trong LocalStorage | **HIGH** | Đánh cắp tài khoản KOC qua tấn công XSS hoặc máy dùng chung | **Đã xác nhận trong Code** |
| **SEC-05** | `supabase/schema.sql` (L76-L95) | RLS Policies cấu hình Permissive (`true`) | **CRITICAL** | Cho phép bypass toàn bộ xác thực để đọc/sửa dữ liệu trực tiếp | **Đã xác nhận trong Schema** |
| **SEC-06** | `src/state/AppDataContext.tsx` (L266-L273) | Data Exposure qua API Client | **HIGH** | Bất kỳ ai mở F12 cũng đọc được SĐT, địa chỉ KOC | **Đã xác nhận trong Code** |

---

## 3. PHÂN TÍCH SÂU TỪNG LỖ HỔNG

### 🔴 Lỗ hổng SEC-01: Mật khẩu KOC được lưu trữ dưới dạng JSON Plaintext lên Supabase Cloud và trả về công khai qua API
- **Vị trí:** [src/services/supabaseService.ts](file:///Users/quynhanh/Documents/Năm%204/Kocnewmoinhat29-9/kochubggstudionew/src/services/supabaseService.ts#L560-L585) (hàm `saveKOCProfileToSupabase`).
- **Mô tả kỹ thuật:**
  Khi KOC đăng ký (`register`) hoặc đặt lại mật khẩu (`resetPassword`), đối tượng `KOCUser` chứa trường `password` dạng chữ rõ. Hàm `saveKOCProfileToSupabase` thực hiện:
  ```ts
  const safeProfile = { ...profile };
  // safeProfile không hề loại bỏ trường password!
  const payload = {
    id: `__KOC_PROFILE__${cleanHandle}`,
    description: JSON.stringify(safeProfile), // Chứa "password": "..."
  };
  await supabase.from('campaigns').upsert(payload);
  ```
- **Xác minh thực tế trên cơ sở dữ liệu:**
  Kiểm tra bản sao lưu Supabase thực tế xác nhận **toàn bộ 8 hồ sơ KOC** hiện có trên hệ thống đều đang chứa chuỗi `"password": "[REDACTED]"` trong cột `description`.
- **Nguy cơ bảo mật:**
  Hàm `getCampaignsFromSupabase()` truy vấn `supabase.from('campaigns').select('*')` không lọc điều kiện `id` trên máy chủ. Gói tin API trả về từ Supabase gửi toàn bộ các record `__KOC_PROFILE__` về trình duyệt của mọi người dùng truy cập web. Bất kỳ ai mở tab F12 Network đều đọc được mật khẩu của toàn bộ KOC.

---

### 🔴 Lỗ hổng SEC-02: Hardcoded Mật khẩu & Tài khoản Quản trị viên trong mã nguồn Frontend
- **Vị trí:** [src/services/authService.ts](file:///Users/quynhanh/Documents/Năm%204/Kocnewmoinhat29-9/kochubggstudionew/src/services/authService.ts#L22-L23) (dòng 22–23).
- **Mô tả kỹ thuật:**
  ```ts
  // Vẫn còn tồn tại comment TODO trong code
  const ADMIN_HANDLE = '@adminweb[REDACTED]';
  const ADMIN_PASSWORD = '[REDACTED]';
  ```
- **Nguy cơ bảo mật:**
  Vì Vite đóng gói toàn bộ mã nguồn Frontend thành các file JavaScript tĩnh đặt tại thư mục `dist/assets/`, chuỗi tài khoản và mật khẩu này nằm công khai trong file script gửi đến mọi trình duyệt. Kẻ xấu chỉ cần tìm kiếm từ khóa trong file `.js` là có được quyền truy cập tối cao của Admin. Lịch sử Git cũng đã ghi nhận chuỗi này từ commit `4597ca1`.

---

### 🟠 Lỗ hổng SEC-03: Mã PIN Quản trị viên viết cứng và kiểm tra hoàn toàn ở phía Trình duyệt (Client-side Security)
- **Vị trí:** [src/components/AdminSecurityGate.tsx](file:///Users/quynhanh/Documents/Năm%204/Kocnewmoinhat29-9/kochubggstudionew/src/components/AdminSecurityGate.tsx#L9-L62).
- **Mô tả kỹ thuật:**
  1. Hằng số `DEFAULT_ADMIN_PIN = '20****'` được viết công khai trong code.
  2. Xác thực thành công chỉ bằng việc kiểm tra chuỗi `inputPin === currentPin` trên máy khách và gán:
     ```ts
     sessionStorage.setItem('kocity_admin_auth_token', 'true');
     ```
- **Nguy cơ bảo mật:**
  Bất kỳ ai mở Console trình duyệt và gõ `sessionStorage.setItem('kocity_admin_auth_token', 'true')` đều có thể vượt qua cổng mã PIN và vào thẳng giao diện Admin.

---

### 🟠 Lỗ hổng SEC-04: Lưu mật khẩu người dùng dạng Plaintext trong `localStorage`
- **Vị trí:** [src/services/authService.ts](file:///Users/quynhanh/Documents/Năm%204/Kocnewmoinhat29-9/kochubggstudionew/src/services/authService.ts#L32-L41, L158-L184).
- **Mô tả kỹ thuật:**
  Mọi tài khoản đăng ký mới đều được đẩy trực tiếp vào mảng đối tượng trong `localStorage` với key `koctrend_registered_users` kèm theo `password: params.password.trim()`.
- **Nguy cơ bảo mật:**
  Nếu trang web xảy ra lỗ hổng XSS (chèn mã độc) hoặc người dùng sử dụng máy tính nơi công cộng, mật khẩu của người dùng có thể bị trích xuất dễ dàng thông qua bộ nhớ trình duyệt.

---

### 🔴 Lỗ hổng SEC-05: Chính sách Row Level Security (RLS) trên Supabase mở cửa hoàn toàn (`USING (true)`)
- **Vị trí:** [supabase/schema.sql](file:///Users/quynhanh/Documents/Năm%204/Kocnewmoinhat29-9/kochubggstudionew/supabase/schema.sql#L76-L95).
- **Mô tả kỹ thuật:**
  Bảng `campaigns` và `applications` đã bật RLS nhưng các policy lại áp dụng điều kiện `USING (true)` và `WITH CHECK (true)` cho tất cả mọi người (`public` / `anon`).
- **Nguy cơ bảo mật:**
  Ai có Supabase URL và Anon Key (vốn nằm công khai trong code web) đều có thể dùng các công cụ API như Postman, cURL để:
  - Xem toàn bộ danh sách đơn hàng và thông tin cá nhân.
  - Sửa hoặc xoá vĩnh viễn dữ liệu chiến dịch hoặc đơn ứng tuyển mà không cần thông qua giao diện web hay nhập mã PIN.

---

## 4. PHƯƠNG ÁN KHẮC PHỤC TOÀN DIỆN (KIẾN TRÚC SUPABASE AUTH)

### A. Kiến trúc mục tiêu (Target Security Architecture)

```
[ Trình duyệt KOC / Admin ]
          │
          ├── (1) Đăng ký / Đăng nhập ──> [ Supabase Auth (GoTrue API) ]
          │                                      │ (Mã hóa Argon2id / Bcrypt)
          │                                      ▼
          │                                [ auth.users table ] (An toàn tuyệt đối)
          │                                      │
          ├── (2) Lấy JWT Token (Role-based) <────┘
          │
          ▼ (Gửi kèm Bearer JWT)
[ Supabase Database (PostgreSQL) ]
          │
          ├── Bảng public.profiles (Chỉ chứa ID TikTok, Tên, SĐT, Avatar - KHÔNG CÓ PASSWORD)
          │      └── Policy: Người dùng chỉ xem/sửa hồ sơ của chính mình
          ├── Bảng public.campaigns (Chiến dịch sản phẩm mẫu)
          │      └── Policy: Public chỉ được SELECT, Admin mới được INSERT/UPDATE/DELETE
          └── Bảng public.applications (Đơn nhận mẫu)
                 └── Policy: KOC chỉ thấy đơn của mình, Admin thấy toàn bộ
```

### B. Nguyên tắc triển khai Supabase Auth:
1. **Tuyệt đối không tự viết thuật toán băm/mã hóa:** Sử dụng 100% cơ chế băm mật khẩu chuẩn của Supabase Auth (Argon2id/Bcrypt).
2. **Không lưu mật khẩu ở Client:** Mật khẩu chỉ tồn tại trong bộ nhớ RAM tạm thời khi người dùng bấm submit form đăng nhập/đăng ký. Không bao giờ lưu vào `localStorage`, `sessionStorage` hay cột `description`.
3. **Xác thực quyền Admin ở cấp Server:** Phân quyền Admin thông qua `user_metadata` hoặc bảng `public.user_roles` được kiểm soát bởi RLS policy, loại bỏ hoàn toàn việc gán `role = 'admin'` thủ công ở Frontend.

---

## 5. PHƯƠNG ÁN CHUYỂN ĐỔI DỮ LIỆU CŨ (MIGRATION PLAN)

Để **bảo toàn 100% tài khoản, hồ sơ và lịch sử ứng tuyển** của các KOC hiện tại mà không làm mất dữ liệu:

### Bước 1: Chuẩn bị bảng ánh xạ và làm sạch dữ liệu
1. Tạo bảng `public.koc_profiles` độc lập (thay thế cho việc lưu tạm vào `campaigns.description`).
2. Di chuyển toàn bộ 8 hồ sơ KOC hiện có sang bảng mới, **loại bỏ hoàn toàn trường `password` plaintext** trong quá trình chuyển dịch.
3. Giữ nguyên trường `id` và `tiktokHandle` làm khóa định danh duy nhất (Unique Handle) để liên kết chính xác với bảng `applications`.

### Bước 2: Kế hoạch xử lý mật khẩu cũ an toàn
Vì mật khẩu cũ đã bị lưu plaintext và có nguy cơ lộ lọt:
* **Phương án tối ưu (Khuyến nghị ngành bảo mật):**
  - Đồng bộ danh sách tài khoản sang Supabase Auth với cơ chế **Email / TikTok Handle Magic Link** hoặc **Buộc đặt mật khẩu mới khi đăng nhập lần đầu (Force Password Reset on First Login)**.
  - Khi KOC đăng nhập lần đầu sau khi nâng cấp: Hệ thống hiển thị thông báo *"KOCity đã nâng cấp hệ thống bảo mật cấp cao. Vui lòng thiết lập mật khẩu mới an toàn cho tài khoản @handle của bạn"*.
  - Xác thực quyền sở hữu bằng SĐT chính chủ đã đăng ký trước đó ➔ Ghi nhận mật khẩu mới trực tiếp vào `Supabase Auth` (được băm an toàn tự động).

### Bước 3: Kế hoạch xử lý Credentials đã lộ trong Git History
* Thu hồi và đổi toàn bộ thông tin quản trị:
  - Thay đổi tài khoản Admin mới trên Supabase Auth.
  - Đổi mã PIN quản trị mới bằng cơ chế Server-side Verification.
  - Sau khi hoàn tất, sử dụng `git-filter-repo` hoặc BFG Repo-Cleaner để làm sạch lịch sử Git nếu cần thiết.

---

## 6. DANH SÁCH FILE CẦN THAY ĐỔI VÀ TẠO MỚI (KHI THỰC HIỆN GIAI ĐOẠN 2)

### File chỉnh sửa:
1. `src/services/authService.ts`: Viết lại toàn bộ hàm `login`, `register`, `resetPassword`, `loadRememberedAccount` bằng Supabase Auth client (`supabase.auth.*`). Xóa bỏ `ADMIN_HANDLE` và `ADMIN_PASSWORD`.
2. `src/services/supabaseService.ts`:
   - Loại bỏ trường `password` khi upsert hồ sơ KOC.
   - Bổ sung bộ lọc server `.not('id', 'like', '__%')` trong `getCampaignsFromSupabase()`.
   - Cập nhật các hàm query đơn hàng phân quyền theo User ID.
3. `src/components/AdminSecurityGate.tsx`: Thay thế việc so sánh mã PIN thô bằng việc xác thực session Token của Admin từ Supabase.
4. `src/state/AppDataContext.tsx`: Cập nhật state quản lý người dùng theo `supabase.auth.onAuthStateChange`. Không tự ý tải toàn bộ đơn hàng ở trang chủ.
5. `src/types.ts`: Loại bỏ trường `password?: string;` khỏi interface `KOCUser`.

### File tạo mới:
1. `supabase/migrations/20261024_create_auth_and_rls.sql`: File SQL thiết lập bảng `profiles`, kích hoạt các policy RLS bảo vệ dữ liệu.
2. `src/lib/authHelpers.ts`: Các hàm tiện ích hỗ trợ format tài khoản TikTok ID thành định dạng tương thích với Supabase Auth.

---

## 7. ĐÁNH GIÁ ẢNH HƯỞNG ĐẾN WEBSITE (IMPACT ANALYSIS)

| Chức năng | Khả năng bị ảnh hưởng | Giải pháp bảo đảm không gián đoạn |
| :--- | :--- | :--- |
| **Giao diện trang chủ & Chiến dịch** | **Không ảnh hưởng** | Giữ nguyên 100% UI/UX và logic hiển thị chiến dịch |
| **5 bài viết Cẩm nang KOC (SEO)** | **Không ảnh hưởng** | Dữ liệu blog được bảo vệ nguyên vẹn trên Supabase |
| **Form nộp đơn nhận mẫu (`ApplySheet`)** | Ảnh hưởng nhẹ (luồng lấy User ID) | Tự động lấy User ID từ Supabase Auth session, thông tin kênh TikTok vẫn tự điền mượt mà |
| **Trang "Đơn của tôi" (`MyApplicationsPage`)** | Cần cập nhật query | KOC vẫn xem đầy đủ đơn của mình thông qua `tiktokHandle` |
| **Trang Admin (`AdminView` & `CRM`)** | Cần đăng nhập tài khoản Admin Auth | Admin được cấp tài khoản bảo mật riêng, xem được toàn bộ danh sách đơn và hồ sơ KOC |

---

## 8. KẾ HOẠCH KIỂM THỬ AN TOÀN (TESTING SUITE)

Sau khi chuyển đổi sang Supabase Auth ở Giai đoạn 2, các kịch bản kiểm thử bắt buộc:
1. **Kiểm thử Đăng ký mới:** Tạo tài khoản KOC mới ➔ Kiểm tra Supabase Auth có record băm an toàn ➔ Kiểm tra `localStorage` và `campaigns` không hề có chữ password nào.
2. **Kiểm thử Đăng nhập KOC cũ:** KOC cũ nhập ID và mật khẩu mới ➔ Xác thực thành công ➔ Toàn bộ lịch sử nộp đơn cũ vẫn hiển thị đầy đủ.
3. **Kiểm thử Phân quyền (Security Penetration Test):**
   - Đăng nhập tài khoản KOC thường ➔ Cố truy cập `/admin` ➔ Bị chặn đứng.
   - Mở Console F12 giả lập `sessionStorage` ➔ Vẫn bị chặn vì thiếu Admin JWT Token từ server.
   - Thử gửi request cURL trực tiếp vào Supabase API để xóa chiến dịch ➔ Supabase RLS trả về mã lỗi `403 Forbidden`.
4. **Kiểm thử Build & Production:** Chạy `npm run build` đảm bảo 0 lỗi TypeScript, 0 warning.

---

## 9. DANH SÁCH THAO TÁC CẦN SỰ CHO PHÉP CỦA BẠN (APPROVAL CHECKLIST)

Trước khi tiến hành Giai đoạn 2, bạn cần phê duyệt các mục sau:

- [ ] **Chấp thuận khởi tạo nhánh làm việc riêng:** `git checkout -b security/supabase-auth-migration` để code và test độc lập, không ảnh hưởng nhánh `main`.
- [ ] **Chấp thuận chạy đoạn mã SQL Migration trên Supabase:** Chạy script tạo bảng `profiles` và kích hoạt Row Level Security trong Supabase SQL Editor.
- [ ] **Chấp thuận cấp tài khoản Quản trị viên mới trên Supabase Auth:** Khởi tạo email/mật khẩu Admin chính thức trên hệ thống Supabase Auth để thay thế hoàn toàn mã PIN thô cũ.
- [ ] **Chấp thuận kế hoạch làm sạch dữ liệu mật khẩu plaintext cũ trên Supabase Cloud.**

---

**KẾT LUẬN GIAI ĐOẠN 1:**  
Toàn bộ mã nguồn và cơ sở dữ liệu đã được rà soát chính xác, các lỗ hổng đã được xác định cụ thể cùng phương án vá lỗi tiêu chuẩn. Hiện tại hệ thống chưa bị can thiệp hay thay đổi bất kỳ dòng code nào. Tôi đang dừng lại và chờ bạn xem xét báo cáo để tiến hành Giai đoạn 2!
