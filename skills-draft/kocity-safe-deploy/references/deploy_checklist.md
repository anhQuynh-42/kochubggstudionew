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
- [ ] **Chốt chặn 6: Kiểm tra Tương phản Thị giác & Xung đột CSS (Visual & Contrast Gate)**
  - **Bắt buộc kiểm tra màu chữ (`text-*`) trên màu nền (`bg-*`)**: Tuyệt đối không để xảy ra lỗi chữ trắng trên nền trắng hoặc chữ đen trên nền tối.
  - Tránh xung đột class CSS khi gán đè class lên component (ví dụ gán `bg-white text-slate-900` đè lên component `variant="dark"` có sẵn `text-white`).
  - Đảm bảo độ tương phản đạt chuẩn WCAG AAA (≥ 7:1 cho văn bản và ≥ 4.5:1 cho nút bấm lớn).
- [ ] **Chốt chặn 7: Kiểm tra Đồng bộ Đa thiết bị & Đa vai trò (Cross-Device & Cross-Role Sync)**
  - **Mobile ↔ Laptop:** Giao diện trên điện thoại di động (375px - 414px) và máy tính (1280px - 1512px) đều hiển thị thoáng đãng, không bị tràn viền, không vỡ layout, chạm nút dễ dàng.
  - **KOC ↔ Admin:** Bất kỳ thay đổi nào về tên bước tiến trình, trạng thái đơn, nhãn chiến dịch đều phải được đồng bộ chính xác giữa màn hình KOC và bộ lọc/bảng quản trị Admin.
  - **Supabase Realtime:** Đảm bảo dữ liệu phát sinh (nộp đơn, duyệt KOC, đổi ảnh) được ghi nhận chuẩn xác lên cơ sở dữ liệu đám mây Supabase mà không bị lỗi PGRST hay nghẽn payload.

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

## 3. Bắt buộc Báo cáo Kết quả Đồng bộ khi Bàn giao (Mandatory Sign-off)
Mỗi lần AI hoàn thành yêu cầu sửa từ người dùng, trong câu trả lời bắt buộc phải xác nhận 3 tiêu chí:
1. ✓ **Tương phản thị giác:** Đã soát màu chữ và màu nền, nút bấm hiển thị sắc nét, không xung đột CSS.
2. ✓ **Đồng bộ thiết bị:** Hiển thị chuẩn trên cả Mobile và Laptop/PC.
3. ✓ **Đồng bộ hệ thống:** Dữ liệu khớp chuẩn giữa tài khoản KOC, bảng Admin và CSDL Supabase.

---

## 4. Kiểm tra thực tế trên Production (Post-Deploy Verification)
- [ ] Truy cập `https://www.kocity.io.vn/`:
  - Trang chủ tải mượt mà dưới 2 giây.
  - Mọi chức năng chính hoạt động ổn định trên cả máy tính và điện thoại di động.
