# PROMPT 04: XÁC THỰC TÀI KHOẢN (SHA-256), NỘP ĐƠN NHẬN MẪU 2 BƯỚC, THEO DÕI TIẾN ĐỘ & PUBLIC MEDIA KIT

* **Giai đoạn:** 4. Chức năng cốt lõi phía KOC (Auth, Nộp đơn, Theo dõi đơn & Hồ sơ Media Kit)
* **Thứ tự chạy:** 04 (Trong chuỗi `01 -> 02 -> 03 -> 04 -> 05 -> 07`)
* **Phụ thuộc:** Cần chạy xong **Prompt 01, 02, 03**

---

## 1. Mục đích
Xây dựng toàn bộ các luồng chức năng tương tác cốt lõi dành cho người dùng KOC trên nền tảng **KOCity**:
1. Tiện ích băm mật khẩu bảo mật một chiều SHA-256 (`src/lib/authHelpers.ts`) và dịch vụ xác thực KOC (`src/services/authService.ts`) hỗ trợ song song cả chế độ Offline/LocalStorage lẫn Supabase Auth (tuyệt đối không lưu mật khẩu plaintext).
2. Hộp thoại Đăng nhập / Tạo tài khoản KOC / Quên mật khẩu (`src/site/components/AuthSheet.tsx`) kèm Modal Điều khoản dịch vụ & Chính sách bảo mật.
3. Hộp thoại Nộp đơn nhận mẫu 2 bước tối giản (`src/site/components/ApplySheet.tsx`): Tự động điền thông tin từ hồ sơ, tự sinh Link kênh TikTok từ ID TikTok, chọn sản phẩm mẫu theo mã, chọn kịch bản gợi ý, chống spam (rate-limit 20 giây), chặn KOC nằm trong danh sách Blacklist, chống gửi trùng đơn, lưu dữ liệu và bắn Webhook sang Google Sheets (nếu có biến môi trường `VITE_GOOGLE_SHEETS_WEBHOOK_URL`).
4. Trang **Đơn của tôi** (`src/site/pages/MyApplicationsPage.tsx`) và Trang **Tiến độ** (`src/site/pages/ProgressPage.tsx`): Theo dõi lộ trình đơn 4 bước trực quan kiểu Shopee, tra mã vận đơn và nộp link video TikTok nghiệm thu.
5. Trang **Hồ sơ KOC & Media Kit** 4 tab (`src/site/pages/ProfilePage.tsx`) và Modal xuất thẻ **Public Media Kit** (`src/components/PublicMediaKitModal.tsx`): Tự động nén ảnh đại diện & ảnh TikTok Analytics bằng HTML5 Canvas, tạo link chia sẻ công khai `?mediakit=handle` (ẩn địa chỉ nhà và SĐT nhận hàng) và tải thẻ Media Kit thành file ảnh PNG.

---

## 2. Input cần có
* Các file đã tạo ở **Prompt 01, 02, 03**.
* Các biến cấu hình mẫu:
  * `{{apply_rate_limit_ms}}`: `20000` (20 giây chống spam giữa 2 lần nộp đơn)
  * `{{auth_email_domain}}`: `"kocity.auth.local"` (Domain nội bộ dùng để ánh xạ TikTok Handle sang định dạng email của Supabase Auth)

---

## 3. Prompt hoàn chỉnh (Copy toàn bộ nội dung trong khung dưới đây gửi cho AI Agent)

```markdown
Bạn là một Senior Full-stack React & Security Engineer.
Dựa trên các file nền tảng đã xây dựng của dự án KOCity, hãy lập trình hoàn chỉnh phân hệ Xác thực KOC, Form nộp đơn nhận mẫu 2 bước, Trang theo dõi đơn/tiến độ và Hồ sơ Public Media Kit.

Giá trị tham số đầu vào:
- {{apply_rate_limit_ms}} = 20000
- {{auth_email_domain}} = "kocity.auth.local"

Hãy tạo đầy đủ mã nguồn cho các file sau:

### 1. Tiện ích Băm Mật Khẩu Bảo Mật (`src/lib/authHelpers.ts`) & Dịch Vụ Xác Thực (`src/services/authService.ts`)
1. `src/lib/authHelpers.ts`:
   - Hàm `hashStringSHA256(input: string): Promise<string>`: Sử dụng Web Crypto API (`crypto.subtle.digest('SHA-256', ...)`) để băm chuỗi một chiều thành chuỗi hex 64 ký tự.
   - Hàm `formatHandleToAuthEmail(identifier: string): string`: Chuyển hóa ID TikTok hoặc SĐT thành email định danh nội bộ `koc.<clean_id>@{{auth_email_domain}}`.
2. `src/services/authService.ts`:
   - Hàm `normalizeHandle(h: string)`: Chuẩn hóa ID TikTok về chữ thường có tiền tố `@` (ví dụ: `@thaonhi`).
   - Lưu danh sách tài khoản vào `localStorage` (`koctrend_registered_users`, `koctrend_koc_profile`, `koctrend_remembered_account`). **Quy tắc bảo mật bắt buộc:** Trước khi ghi xuống `localStorage`, luôn xóa thuộc tính `password` dạng chữ rõ (`delete clone.password`), chỉ lưu chuỗi băm một chiều `passwordHash` (SHA-256).
   - Cung cấp 3 hàm chính hoạt động mượt mà cả khi KHÔNG có Supabase key (Offline/LocalStorage mode) lẫn khi có Supabase:
     - `register(params)`: Kiểm tra ID TikTok, tên hiển thị, SĐT Việt Nam hợp lệ (`^(0|\+84)[0-9]{8,10}$`), mật khẩu `>= 6` ký tự, khớp mật khẩu nhập lại và đã tích đồng ý điều khoản. Băm mật khẩu bằng `hashStringSHA256`, lưu vào `localStorage` và đồng bộ lên Supabase nếu `isSupabaseConfigured() === true`.
     - `login(params)`: Hỗ trợ đăng nhập bằng `ID TikTok` hoặc `Số điện thoại`. Đối chiếu `passwordHash === await hashStringSHA256(password)` (kèm kết nối Supabase Auth & Cloud Profile nếu có cấu hình).
     - `resetPassword(params)`: Xác minh đồng thời cả `ID TikTok` và `Số điện thoại đã đăng ký` khớp nhau thì mới cho phép đặt lại mật khẩu mới.

### 2. Hộp Thoại Đăng Nhập / Đăng Ký / Quên Mật Khẩu (`src/site/components/AuthSheet.tsx`)
- Hiển thị trong component `<Sheet>` với 3 chế độ (`mode`: `'login' | 'register' | 'forgot'`):
  - **Chế độ Đăng nhập (`login`):** Cho phép chuyển đổi giữa đăng nhập bằng `ID TikTok` hoặc `Số điện thoại`, ô mật khẩu, nút `"Quên mật khẩu?"`, hộp kiểm `"Ghi nhớ trên thiết bị này"`, và nút đăng nhập nhanh 1 chạm `"Tiếp tục với [Tên KOC]"` nếu trình duyệt đã lưu tài khoản trước đó.
  - **Chế độ Tạo tài khoản KOC (`register`):** Nhập `ID TikTok`, `Tên hiển thị`, `Số điện thoại` (ví dụ mẫu: `0900 000 000`), `Followers`, `Lĩnh vực chính` (Làm đẹp & Mỹ phẩm, Thời trang & Phụ kiện, Lifestyle & Gia dụng, Công nghệ & Gaming, Ẩm thực & Quán xá, Mẹ & Bé), `Mật khẩu`, `Nhập lại mật khẩu` và checkbox đồng ý với **Điều khoản dịch vụ & Chính sách bảo mật** (bấm vào mở popup đọc chi tiết điều khoản cam kết nhận mẫu 0đ và không bùng video).
  - **Chế độ Quên mật khẩu (`forgot`):** Yêu cầu nhập đúng `ID TikTok` + `Số điện thoại đã đăng ký` để đặt mật khẩu mới.

### 3. Form Nhận Mẫu 2 Bước Tối Giản (`src/site/components/ApplySheet.tsx`)
- Hiển thị trong `<Sheet>` với thanh tiến trình 2 bước và banner xem nhanh Brief chiến dịch:
  - **Bước 1 (Kênh TikTok & Hiệu suất bán):**
    - Tự động điền sẵn từ `currentUser` (nếu đã đăng nhập): `ID TikTok`, `Link kênh TikTok` (tự động cập nhật thành `https://www.tiktok.com/@username` ngay khi KOC gõ ID TikTok), `Followers` (bắt buộc), `View TB / video`, `Số đơn bán ra / tháng`, `GMV trung bình tháng`.
  - **Bước 2 (Chọn mẫu & Gửi đơn):**
    - Danh sách radio chọn sản phẩm mẫu từ `campaign.sampleProducts` (hiển thị ảnh mẫu, tên mẫu, mã code `CM01`/`BL01`, mô tả ngắn; vô hiệu hóa các mẫu có `p.disabled === true`).
    - Ô nhập `Ý tưởng video` (bắt buộc `>= 10` ký tự) kèm các nút chip gợi ý lấy từ `campaign.storySteps` (bấm vào chip sẽ điền nhanh ý tưởng).
    - Chọn thời gian `Dự kiến lên video` (*Trong 3 ngày*, *Trong 5 ngày*, *Trong 7 ngày sau khi nhận mẫu*).
    - Hai ô checkbox: **Cam kết làm video đúng brief & gắn giỏ hàng chính hãng** (bắt buộc) và **Đồng ý cung cấp mã Spark Ads** (tùy chọn).
- **Các chốt chặn an toàn khi bấm `"Gửi đơn nhận mẫu"`:**
  1. Kiểm tra chiến dịch còn suất (`!scarcity.isFull`).
  2. Chống Spam (Rate Limiting): Kiểm tra `sessionStorage.getItem('kocity_last_apply_ts')`, yêu cầu chờ đủ `{{apply_rate_limit_ms}}` (20 giây) giữa 2 lần gửi đơn.
  3. Chặn Blacklist: Nếu `currentUser.isBlacklisted === true` (hoặc kênh/SĐT nằm trong danh sách bị cấm nhận mẫu do vi phạm không trả video), chặn gửi đơn và hiển thị thông báo lý do rõ ràng.
  4. Chống nộp đơn trùng lặp: Kiểm tra nếu kênh TikTok này đã có đơn đang xử lý cho cùng `campaign.id` (trạng thái khác `'Từ chối'` và `'Bị từ chối'`) thì báo lỗi không cho nộp trùng.
  5. Tạo mã đơn `#KOC-XXXX`, lưu đơn qua `submitApplication(app)`, tự động lưu nhớ thông tin kênh vào hồ sơ qua `rememberFromApplication(...)`, và nếu có biến môi trường `import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL` thì gửi `fetch(WEBHOOK_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(app) })`.
  6. Hiển thị màn hình **Đã gửi đơn thành công** kèm mã đơn (bấm để copy) và timeline 4 bước.

### 4. Trang "Đơn của tôi" (`src/site/pages/MyApplicationsPage.tsx`) & Trang "Tiến độ" (`src/site/pages/ProgressPage.tsx`)
1. `src/site/pages/MyApplicationsPage.tsx`:
   - Bộ lọc Chip đếm số lượng theo trạng thái: `Tất cả`, `Chờ kết quả`, `Được chọn`, `Hoàn thành`, `Chưa được chọn`.
   - Mỗi thẻ đơn (`ApplicationCard`) hiển thị:
     - Ảnh chiến dịch, tên Brand, tên chiến dịch, mã đơn `#KOC-XXXX` và Badge trạng thái (`Chờ kết quả` / `Được chọn` / `Chưa được chọn`).
     - **Timeline 4 bước trực quan:** (1) *Đã gửi đơn* -> (2) *Brand đang xem / Brand đã chọn bạn* -> (3) *Hãy làm video để kịp tiến độ (kèm trạng thái giao mẫu & Mã vận đơn bấm để copy)* -> (4) *Đã lên bài*.
     - **Khu vực nộp link video nghiệm thu:** Khi đơn đã được chọn (`selection === 'selected'`), hiển thị ô nhập link video TikTok hoặc Google Drive (`https://...`) để KOC nộp bài cho Admin nghiệm thu (hoặc hiển thị phản hồi `adminFeedback` nếu video cần chỉnh sửa).
2. `src/site/pages/ProgressPage.tsx`:
   - Bảng thống kê 4 chỉ số thật của KOC: `Đơn đã gửi`, `Chờ kết quả`, `Được chọn`, `Đã lên bài`.
   - Danh sách **"Việc cần làm"** tự động suy ra từ trạng thái đơn (ví dụ: *"Quay & nộp video cho [Brand]"* khi mẫu đã giao, *"Sửa & nộp lại video"* khi bị từ chối video, hoặc *"Bổ sung số điện thoại & địa chỉ để nộp đơn 1 chạm"*).
   - Bảng lịch sử đăng ký, thanh % mức độ hoàn thiện hồ sơ và danh sách thông báo gần đây.

### 5. Trang Hồ sơ KOC 4 Tab (`src/site/pages/ProfilePage.tsx`) & Modal Public Media Kit (`src/components/PublicMediaKitModal.tsx`)
1. `src/site/pages/ProfilePage.tsx`:
   - Cột trái (trên Desktop) / Thẻ tóm tắt (trên Mobile): Xem trước trực tiếp thẻ Media Kit, đổi ảnh đại diện (tự động cắt vuông 160x160px và nén JPEG chất lượng 0.8 qua HTML5 Canvas để dung lượng chỉ ~20KB), nút **"Xem trước Media Kit"** và nút **"Sao chép link Media Kit"** (`/?mediakit=handle`).
   - Cột phải gồm 4 Tab chỉnh sửa hồ sơ:
     - **Tab 1 (Kênh & chỉ số):** Tên hiển thị, ID TikTok, Giới thiệu ngắn (Bio), Followers, View TB/video, Tỷ lệ tương tác, GMV kênh/tháng, Link kênh TikTok, Instagram, YouTube.
     - **Tab 2 (Đối tượng & nội dung):** Chọn chips Lĩnh vực nội dung chính, Phong cách làm video, Mô tả tệp người xem và **Tải ảnh chụp màn hình phân tích kênh (TikTok Analytics)** (tự động nén tối đa 1200px qua Canvas).
     - **Tab 3 (Chính sách & nhận mẫu):** Tách rõ 2 khung:
       1. *Thông tin nhận Booking & Hợp tác (Công khai trên Media Kit):* SĐT/Zalo công việc (`workPhone`, ví dụ `0900 000 000`), Email công việc (`workEmail`), nút bật/tắt Nhận mẫu 0đ & Cấp mã Spark Ads, Giá booking tối thiểu.
       2. *Địa chỉ nhận mẫu 0đ (Bảo mật nội bộ KOCity - Tuyệt đối không công khai trên Media Kit):* SĐT nhận hàng shipper gọi (`phone`), Tỉnh/Thành phố, Quận/Huyện, Địa chỉ chi tiết (`address`), Ghi chú cho shipper.
     - **Tab 4 (Portfolio):** Nhập link tới 3 video TikTok nổi bật nhất (tự động làm sạch query params) và link Google Drive Portfolio.
2. `src/components/PublicMediaKitModal.tsx`:
   - Hiển thị hồ sơ Media Kit chuyên nghiệp của KOC dành cho Nhãn hàng xem (gồm Avatar, Huy hiệu Verified, thống kê Followers/Views/Engagement/GMV, biểu đồ/ảnh chụp TikTok Analytics, danh sách video nổi bật, nút liên hệ Zalo công việc).
   - **Bảo mật dữ liệu cá nhân:** Chỉ hiển thị `workPhone` / `workEmail` nếu KOC cho phép công khai; tuyệt đối không hiển thị địa chỉ nhà riêng (`address`) và SĐT nhận hàng cá nhân (`phone`).
   - Tích hợp thư viện `html-to-image` (`toPng`) để KOC hoặc Brand bấm nút **"Tải ảnh Media Kit (PNG)"** về máy với độ nét cao.
```

---

## 4. Output mong đợi
Các file sau được tạo hoàn chỉnh:
* `src/lib/authHelpers.ts`
* `src/services/authService.ts`
* `src/site/components/AuthSheet.tsx`
* `src/site/components/ApplySheet.tsx`
* `src/site/pages/MyApplicationsPage.tsx`
* `src/site/pages/ProgressPage.tsx`
* `src/site/pages/ProfilePage.tsx`
* `src/components/PublicMediaKitModal.tsx`

---

## 5. Cách kiểm tra đã chạy đúng
1. Mở hộp thoại `AuthSheet`, tạo tài khoản KOC mới với SĐT mẫu `0900000000` và mật khẩu mẫu `123456`. Kiểm tra `localStorage.getItem('koctrend_registered_users')` đảm bảo chỉ có trường `passwordHash` (chuỗi hex 64 ký tự SHA-256) và **không có** trường `password` chữ rõ.
2. Mở một chiến dịch và bấm **"Nhận mẫu ngay"**: Bước 1 tự động điền ID TikTok và sinh link `https://www.tiktok.com/@...`; Bước 2 chọn được sản phẩm mẫu, gửi đơn thành công và sinh mã `#KOC-XXXX`.
3. Vào trang `/don-cua-toi` và `/ho-so`: Xem được đơn vừa nộp trên timeline 4 bước, cập nhật được hồ sơ 4 tab và mở được `PublicMediaKitModal`.
