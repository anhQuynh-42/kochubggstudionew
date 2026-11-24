# PROMPT 05: HỆ THỐNG QUẢN TRỊ ADMIN, CỔNG BẢO MẬT 2 LỚP, XUẤT CSV BRAND, WYSIWYG CMS & ĐỒNG BỘ DỮ LIỆU

* **Giai đoạn:** 5. Chức năng Quản trị Admin, WYSIWYG CMS & Tầng Đồng bộ dữ liệu trung tâm
* **Thứ tự chạy:** 05 (Trong chuỗi `01 -> 02 -> 03 -> 04 -> 05 -> 07`)
* **Phụ thuộc:** Cần chạy xong **Prompt 01, 02, 03, 04**

---

## 1. Mục đích
Hoàn thiện phân hệ Quản trị viên (`/admin`), tầng đồng bộ dữ liệu đám mây/cục bộ và kết nối toàn bộ ứng dụng vào `src/App.tsx`:
1. Dịch vụ dữ liệu đám mây (`src/services/supabaseService.ts`) và Ngữ cảnh dữ liệu trung tâm (`src/state/AppDataContext.tsx`) hỗ trợ Realtime + Fallback 100% sang Mock Data & LocalStorage khi không có key Supabase, kèm cơ chế két dự phòng `kocity_cloud_applications_backup` chống mất đơn ứng tuyển.
2. Cổng bảo mật quản trị 2 lớp (`src/components/AdminSecurityGate.tsx`): Lớp 1 nhập Mã PIN 6 số + Lớp 2 nhập Tài khoản & Mật khẩu Admin (kiểm tra bằng chữ ký băm SHA-256, tạm khóa 5 phút nếu nhập sai quá 2 lần).
3. Trình quản lý & soạn thảo bài viết Cẩm nang SEO (`src/components/AdminBlogManager.tsx`): Bộ soạn thảo trực quan WYSIWYG (đổi màu chữ, in đậm/nghiêng, chèn hộp Bí kíp KOCity, nén & chèn ảnh minh họa, bật/tắt hiệu ứng Mây mù che phủ bài VIP, hợp nhất 2 chiều không mất bài viết).
4. Bảng điều khiển Quản trị viên (`src/components/AdminView.tsx`): Quản lý tổng quan (Dashboard), Quản lý Chiến dịch (thêm/sửa/xóa chiến dịch, thêm danh sách mã sản phẩm mẫu), Trang con quản lý KOC theo từng chiến dịch, Duyệt đơn & cấp mã vận đơn, Nghiệm thu video, Quản lý KOC CRM (cấm nhận mẫu Blacklist / xóa đồng bộ KOC & đơn ứng tuyển), và tính năng **One-Click Brand Export** (xuất file CSV chuẩn `Blob` UTF-8 BOM giữ nguyên số `0` đầu SĐT và ký tự `#`).
5. Ngữ cảnh giao diện (`src/site/SiteUI.tsx`) và bộ định tuyến gốc (`src/App.tsx`, `src/main.tsx`).

---

## 2. Input cần có
* Các file đã tạo ở **Prompt 01 -> 04**.
* Các thông tin xác thực Admin mẫu (dùng giá trị mẫu an toàn để test và chấm bài, tuyệt đối không dùng mật khẩu thật):
  * `{{admin_pin_sample}}`: `"123456"`
  * `{{admin_username_sample}}`: `"admin_demo"`
  * `{{admin_password_sample}}`: `"Admin@123456"`

---

## 3. Prompt hoàn chỉnh (Copy toàn bộ nội dung trong khung dưới đây gửi cho AI Agent)

```markdown
Bạn là một Senior Systems Architect & Full-stack React Developer.
Hãy xây dựng tầng đồng bộ dữ liệu, cổng bảo mật Admin 2 lớp, bảng điều khiển AdminView, trình soạn thảo WYSIWYG CMS và lắp ráp toàn bộ ứng dụng KOCity trong `src/App.tsx`.

Giá trị tham số xác thực Admin mẫu (dùng để băm SHA-256 kiểm tra trong cổng bảo mật `/admin`):
- {{admin_pin_sample}} = "123456"
- {{admin_username_sample}} = "admin_demo"
- {{admin_password_sample}} = "Admin@123456"

Hãy tạo đầy đủ mã nguồn cho các file sau:

### 1. Tầng Dịch Vụ Dữ Liệu (`src/services/supabaseService.ts`) & Ngữ Cảnh Trung Tâm (`src/state/AppDataContext.tsx`)
1. `src/services/supabaseService.ts`:
   - Mọi hàm truy vấn Supabase đều phải kiểm tra `if (!isSupabaseConfigured()) return null;` (hoặc `false`) ở dòng đầu tiên để khi chạy ở chế độ không có API key, ứng dụng không gọi mạng lỗi và tự động dùng dữ liệu cục bộ.
   - Các hàm cần cung cấp:
     - Chiến dịch: `getCampaignsFromSupabase()`, `updateCampaignOnSupabase(campaign)`, `deleteCampaignFromSupabase(id)`, `incrementCampaignRegisteredSpotsOnSupabase(campaignId)`, `subscribeToCampaignsRealtime(...)`.
     - Đơn ứng tuyển: `getApplicationsFromSupabase()`, `getMyApplicationsFromSupabase(cleanHandle)`, `submitApplicationToSupabase(app)`, `updateApplicationStatusOnSupabase(id, updates)`, `subscribeToApplicationsRealtime(...)`.
     - Hồ sơ KOC: `saveKOCProfileToSupabase(user)`, `getKOCProfileFromSupabase(handle)`, `getAllKOCProfilesFromSupabase()`, `deleteKOCProfileFromSupabase(targetHandle)` (xoá đồng bộ cả bản ghi hồ sơ `__KOC_PROFILE__<handle>` lẫn các đơn ứng tuyển của KOC đó trong bảng `applications`, lọc bằng JavaScript an toàn không dùng ký tự đại diện SQL `_`/`%`), `toggleKOCBlacklistOnSupabase(handle, isBlacklisted, reason)`.
     - Bài viết Blog & Hero Banner: `getBlogPostsFromSupabase()`, `saveBlogPostsToSupabase(posts)`, `subscribeToBlogPostsRealtime(...)`, `getHeroBannerFromSupabase()`, `saveHeroBannerToSupabase(img)`, `deleteHeroBannerFromSupabase()`.
2. `src/state/AppDataContext.tsx`:
   - Quản lý toàn bộ state dùng chung: `currentUser`, `isAdmin`, `campaigns` (khởi tạo từ `localStorage` `'koctrend_campaigns'` hoặc `INITIAL_CAMPAIGNS`), `applications` (khởi tạo từ `'koctrend_applications'` hoặc `INITIAL_APPLICATIONS`, đối chiếu với két dự phòng `'kocity_cloud_applications_backup'` và luôn ưu tiên bản có số lượng đơn lớn hơn để chống mất dữ liệu), `notifications`, `bookmarkedIds`, `heroImage`, `toast`, `publicMediaKit`.
   - Khi KOC nộp đơn (`submitApplication`), tăng `registeredSpots` của chiến dịch tương ứng thêm 1, tạo thông báo cho Admin và lưu xuống `localStorage` (+ Supabase nếu có cấu hình).
   - Khi Admin đổi trạng thái đơn (`'Đã duyệt gửi mẫu'`, `'Đang giao'`, `'Đã lên bài'`, `'Đã hoàn thành'`, `'Bị từ chối'`, `'Từ chối'`), tự động sinh thông báo (`AppNotification`) gửi tới đúng KOC sở hữu đơn đó.

### 2. Cổng Bảo Mật Quản Trị 2 Lớp (`src/components/AdminSecurityGate.tsx`)
- Bảo vệ đường dẫn `/admin` bằng 2 bước xác thực liên tiếp, kiểm tra bằng hàm băm `hashStringSHA256` (tuyệt đối không lưu hay so sánh mật khẩu dạng plaintext):
  - **Bước 1 (Cổng Mã PIN 6 số):** Giao diện bàn phím số trực quan để nhập mã PIN 6 chữ số (mặc định khớp với mã băm SHA-256 của `{{admin_pin_sample}}`).
  - **Bước 2 (Tài khoản & Mật khẩu Quản trị):** Sau khi đúng PIN, yêu cầu nhập Tài khoản Admin (`{{admin_username_sample}}`) và Mật khẩu Admin (`{{admin_password_sample}}`).
- **Cơ chế chống dò mật khẩu (Brute-force Protection):** Nếu nhập sai quá 2 lần ở bất kỳ bước nào, tự động khóa cổng đăng nhập trong **300 giây (5 phút)** kèm đồng hồ đếm ngược.
- Khi vượt qua cả 2 bước: Lưu session token có thời hạn 2 giờ vào `sessionStorage.setItem('kocity_admin_auth_token', ...)`, kích hoạt `localStorage.setItem('kocity_admin_mode', 'true')` và phát sự kiện `CustomEvent('kocity-admin-authenticated')` để tải toàn bộ dữ liệu quản trị.

### 3. Bộ Soạn Thảo WYSIWYG CMS Chuẩn SEO (`src/components/AdminBlogManager.tsx`)
- Quản lý danh sách bài viết Cẩm nang KOC (`getStoredBlogPosts()`, `saveStoredBlogPosts()`, hợp nhất 2 chiều `mergeBlogPosts` không bao giờ làm mất bài viết).
- Hỗ trợ 3 chế độ soạn thảo: **Trực quan (Visual WYSIWYG)**, **Mã nguồn (Markdown/HTML)** và **Xem trước (Live Preview)**:
  - Thanh công cụ WYSIWYG trực quan (như Google Docs/Word): Chọn tiêu đề `H2`, `H3`, `H4`, In đậm (`B`), In nghiêng (`I`), Gạch chân (`U`), Đổi màu chữ trực tiếp trên vùng bôi đen với bảng 8 màu (`#0f172a`, `#7c3aed`, `#2563eb`, `#059669`, `#ea580c`, `#dc2626`, `#db2777`, `#64748b`) mà không bao giờ làm lộ mã thẻ `<span...>` thô ra màn hình.
  - Nút chèn nhanh **Khung Bí kíp KOCity (`💡 Bí kíp KOCity`)**, chèn Bảng so sánh dữ liệu, và nút **Tải ảnh chèn vào bài viết** (tự động nén ảnh max 800px, quality 0.75 qua Canvas).
  - Các trường cấu hình SEO: `Tiêu đề bài viết (H1)`, `Slug URL`, `Meta Title`, `Meta Description`, `Từ khóa SEO (Keywords)`, `Chuyên mục (Tag)`, `Thời gian đọc`, và công tắc bật/tắt **"Hiệu ứng Mây mù che phủ (Bài viết VIP yêu cầu đăng nhập)"** (`isCloudCovered`).

### 4. Bảng Điều Khiển Quản Trị Viên (`src/components/AdminView.tsx`)
Xây dựng giao diện quản trị gồm 5 phân hệ (tabs):
1. **Tổng quan (Dashboard):** Thống kê tổng số chiến dịch đang mở, tổng số đơn ứng tuyển, số đơn chờ duyệt, số video đã nghiệm thu, biểu đồ phễu chuyển đổi và danh sách hoạt động mới nhất.
2. **Quản lý Chiến dịch (Campaigns) & Trang con Quản lý KOC theo Chiến dịch:**
   - Thêm mới / Chỉnh sửa / Xóa chiến dịch (đầy đủ thông tin Brand, hoa hồng, tổng số suất `totalSpots`, số suất đã đăng ký `registeredSpots` dùng `Math.max(campaign.registeredSpots, actualAppsCount)` để khi Admin chỉnh full `100/100` thì giao diện hiển thị đúng `100/100`, danh sách sản phẩm mẫu con `sampleProducts` kèm nút tạm dừng từng mẫu, gợi ý kịch bản `storySteps`).
   - Khi bấm vào một chiến dịch: Mở **Trang con Quản lý KOC của riêng chiến dịch đó** (tự động liên kết thông minh các biến thể tên chiến dịch cùng Brand, ví dụ các đợt chiến dịch của *Cỏ Mềm* hay *Tranyoo*), hiển thị danh sách KOC đã đăng ký chiến dịch đó và nút **"Xuất file CSV gửi Brand (One-Click Brand Export)"**.
3. **Thuật toán Xuất File CSV Chuẩn UTF-8 BOM (`exportToCSV` trong `AdminView.tsx`):**
   - **Bắt buộc sử dụng `new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })` và `URL.createObjectURL(blob)`** (TUYỆT ĐỐI KHÔNG dùng `data:text/csv;charset=utf-8,` hay `encodeURI(csvContent)` vì ký tự `#` trong địa chỉ nhà hoặc mã đơn `#KOC-...` sẽ làm đứt cụt file CSV!).
   - Cột Số điện thoại phải được bọc định dạng `="09..."` để khi mở bằng Microsoft Excel hoặc Google Sheets vẫn **giữ nguyên số `0` ở đầu**.
   - Đầy đủ các cột: `Mã đơn`, `Ngày đăng ký`, `Tên chiến dịch`, `Tên KOC`, `ID TikTok`, `Link kênh TikTok` (`https://www.tiktok.com/@...`), `Followers`, `View TB`, `Số điện thoại`, `Địa chỉ nhận mẫu`, `Mã mẫu & Ý tưởng video`, `Trạng thái duyệt`, `Mã vận đơn`, `Link video nghiệm thu`.
4. **Duyệt Đơn Ứng Tuyển (`applications`) & Nghiệm Thu Video (`content`):**
   - Lọc đơn theo chiến dịch, trạng thái, tìm kiếm theo tên/ID TikTok/SĐT.
   - Duyệt đơn nhanh (`Đã duyệt gửi mẫu`, `Từ chối`), nhập mã vận đơn chuyển trạng thái sang `Đang giao` / `Đã phát thành công`, xem link video KOC nộp và bấm `Nghiệm thu (Đã lên bài)` hoặc `Yêu cầu sửa lại` (kèm ghi chú `adminFeedback`).
5. **Quản lý Cộng đồng KOC (`koc-crm`):**
   - Danh sách toàn bộ KOC đã đăng ký tài khoản hoặc từng nộp đơn, hiển thị thông tin kênh, SĐT, địa chỉ, số mẫu đã nhận, số video đã trả.
   - Tính năng **Cấm nhận mẫu (Blacklist) / Gỡ cấm** đối với KOC nhận mẫu nhưng không trả video, và tính năng **Xoá vĩnh viễn tài khoản KOC** (xoá đồng bộ cả hồ sơ KOC lẫn các đơn đăng ký của KOC đó).

### 5. Ngữ cảnh Giao diện (`src/site/SiteUI.tsx`) & Ứng dụng Gốc (`src/App.tsx`, `src/main.tsx`)
- `src/site/SiteUI.tsx`: Quản lý trạng thái đóng/mở `AuthSheet` và `ApplySheet`. Khi KOC bấm `"Nhận mẫu ngay"` (`requestApply(campaign)`): nếu chưa đăng nhập thì mở `AuthSheet` trước, ngay sau khi đăng nhập/đăng ký thành công thì tự động mở tiếp `ApplySheet` của chiến dịch đó.
- `src/App.tsx`: Thiết lập `<BrowserRouter>`, `<AppDataProvider>`, `<SiteUIProvider>`, `<Suspense>` và đầy đủ các `<Route>` theo `ROUTES` (`/`, `/c/:id`, `/quy-trinh`, `/tien-do`, `/don-cua-toi`, `/thong-bao`, `/ho-so`, `/admin` bọc trong `<AdminSecurityGate>`), cùng `<PublicMediaKitOverlay />`.
- `src/main.tsx`: Render `<App />` vào `#root` và import `./index.css`.
```

---

## 4. Output mong đợi
Các file sau được tạo hoàn chỉnh:
* `src/services/supabaseService.ts`
* `src/state/AppDataContext.tsx`
* `src/components/AdminSecurityGate.tsx`
* `src/components/AdminBlogManager.tsx`
* `src/components/AdminView.tsx`
* `src/site/SiteUI.tsx`
* `src/App.tsx`
* `src/main.tsx`

---

## 5. Cách kiểm tra đã chạy đúng
1. Truy cập `/admin`: Hệ thống hiển thị cổng bảo mật Bước 1 (yêu cầu nhập mã PIN 6 số mẫu `123456`) và Bước 2 (yêu cầu nhập tài khoản mẫu `admin_demo` / mật khẩu mẫu `Admin@123456`). Nếu nhập sai 2 lần liên tiếp, cổng tự động khóa đếm ngược 5 phút.
2. Trong `/admin`: Mở một chiến dịch, bấm nút **Xuất CSV cho Brand** — file `.csv` tải về mở trên Excel hiển thị đúng tiếng Việt có dấu (nhờ `\uFEFF` UTF-8 BOM), số điện thoại giữ nguyên số `0` ở đầu và không bị cắt cụt tại dấu `#`.
3. Mở tab **Quản lý Cẩm nang (CMS)**: Đổi màu chữ trực tiếp trong trình soạn thảo Visual WYSIWYG, lưu bài viết và kiểm tra ngoài trang chủ cập nhật ngay lập tức.
