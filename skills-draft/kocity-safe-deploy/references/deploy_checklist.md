# KOCity Production Release & Zero-Regression Checklist

## 1. Bảng Kiểm Tra Hồi Quy 5 Chốt Chặn Bắt Buộc (5-Pillar Regression Checklist)
*Bắt buộc phải tích đủ trước khi bàn giao cho người dùng hoặc push lên production:*

- [ ] **Chốt chặn 1: Trang chủ & 5 Bài viết Cẩm nang KOC**
  - Đủ 5 bài viết chuẩn SEO với hình ảnh, tiêu đề, thẻ tag và thời gian đọc.
  - Bài 4 và Bài 5 hiển thị đúng hiệu ứng **Mây che úp mở bí kíp độc quyền**.
  - Widget Zalo hỗ trợ và quả cầu lửa hiển thị bình thường.
- [ ] **Chốt chặn 2: Quy trình Đăng ký Nhận Mẫu (ApplySheet)**
  - Đúng chuẩn 2 bước tinh gọn:
    - Bước 1: Kênh TikTok & Hiệu suất bán (có đủ ô *Số đơn bán ra / tháng* và *GMV trung bình tháng*).
    - Bước 2: Chọn mẫu & Gửi đơn.
  - Không còn bước hỏi địa chỉ rườm rà.
- [ ] **Chốt chặn 3: Hệ thống Quản trị (Admin CMS)**
  - Đăng nhập vào được `/admin`.
  - Quản lý chiến dịch: xem, sửa, tạo mới hoạt động và lưu được.
  - Quản lý ứng viên: xem đơn, duyệt gửi mẫu, xem được *Số đơn/tháng* và *GMV*.
  - Quản lý Blog: mở bài viết cũ nạp đầy đủ nội dung vào trình soạn thảo trực quan WYSIWYG, lưu thành công.
- [ ] **Chốt chặn 4: Tính toàn vẹn dữ liệu (Data Integrity)**
  - Sau khi F5 (Reload) trang web, dữ liệu vẫn còn nguyên vẹn 100%.
  - Cơ chế fallback an toàn: nếu mất mạng hay Supabase chậm, web vẫn hiển thị đủ dữ liệu gốc, tuyệt đối không bị trang trắng hay mất bài.
- [ ] **Chốt chặn 5: Giới hạn phạm vi Git Diff**
  - Chạy `git diff --stat`: chỉ có các file phục vụ đúng yêu cầu mới được sửa đổi.
  - Không có file rác, file nháp hay API key bí mật bị đưa vào Git.

---

## 2. Kiểm tra trước khi Commit (Pre-Commit Gates)
- [ ] `npm run build` chạy thành công 100% với exit code 0.
- [ ] TypeScript strict: không có lỗi `any` bừa bãi hay kiểu dữ liệu không khớp.
- [ ] Commit message viết bằng tiếng Việt chuẩn theo quy ước:
  - `feat:` Thêm tính năng mới
  - `fix:` Sửa lỗi
  - `style:` Tối ưu giao diện / CSS
  - `refactor:` Tối ưu cấu trúc code

---

## 3. Kiểm tra thực tế trên Production (Post-Deploy Verification)
- [ ] Truy cập `https://www.kocity.io.vn/`:
  - Trang chủ tải mượt mà dưới 2 giây.
  - Mọi chức năng chính hoạt động ổn định trên cả máy tính và điện thoại di động.
