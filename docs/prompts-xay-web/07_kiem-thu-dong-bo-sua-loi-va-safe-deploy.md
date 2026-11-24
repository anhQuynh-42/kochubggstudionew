# PROMPT 07: KIỂM THỬ, SỬA LỖI & TRIỂN KHAI AN TOÀN (SAFE DEPLOY)

* **Giai đoạn:** 7. Sửa lỗi / Kiểm thử & Deploy
* **Thứ tự chạy:** 07 (Chạy cuối cùng trong chuỗi `01 -> 02 -> 03 -> 04 -> 05 -> 07`)
* **Phụ thuộc:** Cần chạy xong **Prompt 01, 02, 03, 04, 05**

---

## 1. Mục đích
Đảm bảo toàn bộ mã nguồn dự án **KOCity** sau khi được AI Agent tái tạo đạt chuẩn **Zero-Error Build** (0 lỗi TypeScript, 0 lỗi đóng gói Vite, 0 lỗi giao diện).
Để phù hợp với môi trường chấm bài của Giảng viên (không có sẵn API Key đám mây của nhóm) cũng như môi trường Production thực tế, Prompt này được tách rõ làm **2 phần**:
* **PHẦN A — BẮT BUỘC (Chạy trực tiếp 100% KHÔNG CẦN API KEY):** Cài đặt thư viện, kiểm tra kiểu TypeScript (`npm run lint`), chạy bản build Production (`npm run build`), cấu hình `vercel.json` và kiểm tra toàn bộ chức năng trên trình duyệt bằng chế độ Mock Data + LocalStorage.
* **PHẦN B — TUỲ CHỌN (Chỉ chạy khi người dùng tự cung cấp API Key Supabase & Vercel):** Tạo và chạy script kiểm thử đồng bộ đám mây tự động `scripts/verify-cloud-sync.js` (`npm run check:sync`) và triển khai lên Vercel.

---

## 2. Input cần có
* Toàn bộ mã nguồn dự án đã được tạo từ **Prompt 01 -> 05**.
* Các biến cấu hình mẫu:
  * `{{dev_port}}`: `3000`
  * `{{build_output_dir}}`: `"dist"`

---

## 3. Prompt hoàn chỉnh (Copy toàn bộ nội dung trong khung dưới đây gửi cho AI Agent)

```markdown
Bạn là một Senior QA & DevOps Engineer phụ trách kiểm thử và đóng gói phát hành cho dự án KOCity.
Hãy thực hiện quy trình kiểm thử, sửa lỗi (nếu có) và cấu hình triển khai theo 2 phần dưới đây:
- Phần A là BẮT BUỘC và phải chạy thành công 100% mà KHÔNG CẦN bất kỳ file `.env` hay API Key nào.
- Phần B là TUỲ CHỌN dành cho trường hợp có cấu hình `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.

Giá trị tham số đầu vào:
- {{dev_port}} = 3000
- {{build_output_dir}} = "dist"

================================================================================
PHẦN A: BẮT BUỘC — KIỂM THỬ & ĐÓNG GÓI KHÔNG CẦN API KEY (OFFLINE / MOCK DATA)
================================================================================

### Bước A1. Tạo cấu hình định tuyến SPA (`vercel.json`) và mẫu biến môi trường (`.env.example`)
1. Tạo file `vercel.json` ở thư mục gốc để mọi đường dẫn con (`/c/:id`, `/quy-trinh`, `/tien-do`, `/don-cua-toi`, `/thong-bao`, `/ho-so`, `/admin`) không bị lỗi 404 khi tải lại trang:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
2. Tạo file `.env.example` (chỉ chứa tên các biến môi trường để tham khảo, tuyệt đối không điền key thật):
   ```env
   GEMINI_API_KEY=
   APP_URL=
   VITE_GOOGLE_SHEETS_WEBHOOK_URL=
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```

### Bước A2. Cài đặt phụ thuộc, Kiểm tra TypeScript & Đóng gói Production
Thực hiện lần lượt các lệnh sau (không cần tạo file `.env`):
1. Cài đặt thư viện:
   ```bash
   npm install
   ```
2. Kiểm tra tính toàn vẹn kiểu dữ liệu TypeScript:
   ```bash
   npm run lint
   ```
   *(Nếu có bất kỳ cảnh báo hoặc lỗi kiểu dữ liệu nào trong `src/`, hãy sửa triệt để cho đến khi `tsc --noEmit` trả về 0 lỗi).*
3. Đóng gói bản Production:
   ```bash
   npm run build
   ```
   *(Đảm bảo Vite đóng gói thành công ra thư mục `{{build_output_dir}}/` với 0 lỗi).*
4. Khởi chạy máy chủ phát triển tại cổng `{{dev_port}}`:
   ```bash
   npm run dev
   ```

### Bước A3. Checklist tự kiểm tra 8 luồng tính năng ở chế độ Không Cần Key (Mock Data + LocalStorage)
Xác nhận toàn bộ 8 luồng sau hoạt động trơn tru trên trình duyệt tại `http://localhost:{{dev_port}}`:
1. **Trang chủ (`/`):** Hiển thị đủ 6 chiến dịch mẫu, thanh Live Ticker chạy ngang, nút Bật/Tắt đèn chuyển đổi giao diện Ngày/Đêm của Hero & `KocitySkyline`, nút mở `KocityWorldModal` và Trợ lý Drone bay theo chuột.
2. **Cẩm nang SEO & Hiệu ứng Mây che:** 3 bài viết đầu mở đọc ngay; bài viết số 4 và số 5 có mây mù che phủ (`.animate-cloud-drift`), khi đăng nhập KOC sẽ xua tan mây (`.animate-cloud-dissolve`) và mở bài viết.
3. **Đăng ký & Đăng nhập KOC (`AuthSheet`):** Tạo tài khoản KOC mới với SĐT mẫu `0900000000`, mật khẩu được băm SHA-256 lưu vào `localStorage`.
4. **Nộp đơn nhận mẫu 2 bước (`ApplySheet`):** Chọn mẫu theo mã code (`CM01`, `BL01`...), chọn concept, gửi đơn thành công và sinh mã `#KOC-XXXX`.
5. **Theo dõi đơn (`/don-cua-toi`) & Tiến độ (`/tien-do`):** Đơn mới xuất hiện ngay trên timeline 4 bước và bảng thống kê tiến độ.
6. **Hồ sơ 4 tab (`/ho-so`) & Public Media Kit:** Chỉnh sửa hồ sơ, tải ảnh đại diện/Analytics nén qua Canvas, mở xem trước thẻ Media Kit công khai (ẩn địa chỉ nhà & SĐT nhận hàng) và tải ảnh PNG.
7. **Cổng bảo mật Admin 2 lớp (`/admin`):** Nhập đúng PIN mẫu `123456` và tài khoản mẫu `admin_demo` / `Admin@123456` để vào trang quản trị.
8. **Quản trị chiến dịch, Xuất CSV UTF-8 BOM & WYSIWYG CMS:** Duyệt đơn KOC, bấm nút xuất file CSV (kiểm tra mã nguồn dùng `new Blob(['\uFEFF' + csvContent])` và bọc SĐT `="09..."`), và soạn thảo bài viết mới trong trình WYSIWYG CMS.

================================================================================
PHẦN B: TUỲ CHỌN — KIỂM THỬ ĐỒNG BỘ SUPABASE CLOUD & DEPLOY (CẦN API KEY)
================================================================================
*(Chỉ thực hiện phần này khi có dự án Supabase thực tế và đã điền `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` vào file `.env`).*

### Bước B1. Tạo Script Kiểm thử Đồng bộ Đám mây Tự động (`scripts/verify-cloud-sync.js`)
Tạo file `scripts/verify-cloud-sync.js` đọc `process.env.VITE_SUPABASE_URL` và `process.env.VITE_SUPABASE_ANON_KEY`.
- Nếu chưa cấu hình biến môi trường Supabase, script in ra thông báo: `"ℹ️ Chưa cấu hình VITE_SUPABASE_URL — Bỏ qua bài test Cloud, ứng dụng chạy ở chế độ Offline/Mock Data."` và thoát với mã `0` (`process.exit(0)`).
- Nếu đã cấu hình biến môi trường Supabase, script tự động chạy 8 bài kiểm thử:
  1. Kiểm tra kết nối tới bảng `campaigns` trên Supabase Cloud.
  2. Kiểm thử hợp đồng Schema bảng `applications` (thử insert một bản ghi test với SĐT mẫu `0900000000` và xóa ngay).
  3. Kiểm thử lưu và đọc lại Hồ sơ KOC (`__KOC_PROFILE__...`) đảm bảo chuỗi Base64 Avatar không bị cắt rỗng.
  4. Kiểm thử kết nối kênh Supabase Realtime.
  5. Kiểm thử tải danh sách chiến dịch (lọc bỏ bản ghi `__` bằng JavaScript).
  6. Kiểm thử tạo và xóa chiến dịch tạm trên Cloud (Zero Ghost Campaigns).
  7. Kiểm tra tính toàn vẹn của bảng `applications`.
  8. Quét tĩnh mã nguồn `src/components/AdminView.tsx` để xác nhận thuật toán xuất CSV sử dụng `new Blob(['\uFEFF'` và không dùng `data:text/csv` hay `encodeURI(csvContent)`.

### Bước B2. Chạy lệnh kiểm thử đồng bộ & Triển khai lên Vercel (Tuỳ chọn)
```bash
npm run check:sync
npm run build
```
Khi cả 2 lệnh đều báo thành công 100%, có thể đẩy lên Vercel để phát hành.
```

---

## 4. Output mong đợi
* File `vercel.json`, `.env.example` và `scripts/verify-cloud-sync.js` được tạo đầy đủ.
* Ở **Phần A (Không cần key)**: Lệnh `npm run lint` và `npm run build` chạy thành công với **0 lỗi**, tạo ra thư mục `dist/` sẵn sàng chạy demo.

---

## 5. Cách kiểm tra đã chạy đúng
1. Chạy `npm run lint` -> Không có bất kỳ dòng báo lỗi TypeScript nào.
2. Chạy `npm run build` (khi không có file `.env`) -> Quá trình build hoàn tất trong ~1 giây, sinh ra đầy đủ bundle trong `dist/assets/`.
3. Chạy `npm run dev` -> Mở trình duyệt kiểm tra cả giao diện KOC (`/`) lẫn giao diện Admin (`/admin`) hoạt động đầy đủ 100% bằng dữ liệu mẫu.
