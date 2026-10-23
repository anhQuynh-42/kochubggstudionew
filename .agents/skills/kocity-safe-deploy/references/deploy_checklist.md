# KOCity Production Release & Deployment Checklist

## 1. Kiểm tra trước khi Commit (Pre-Commit Gates)
- [ ] `npm run build` chạy thành công 100% với exit code 0.
- [ ] Không có file thừa, file rác, file `.env.local` chứa API key bí mật bị đưa nhầm vào Git.
- [ ] Đã kiểm tra giao diện cơ bản trên môi trường dev nội bộ (`http://localhost:3001/`).

---

## 2. Tiêu chuẩn Commit Message
- Commit message phải được viết bằng tiếng Việt rõ ràng, đúng tiền tố:
  - `feat:` Khi thêm tính năng mới (ví dụ: `feat: thêm thanh công cụ mini cho editor`)
  - `fix:` Khi sửa lỗi (ví dụ: `fix: sửa lỗi đổi màu chữ không hiện thẻ span`)
  - `style:` Khi chỉnh sửa CSS/Giao diện
  - `refactor:` Khi tối ưu lại cấu trúc code

---

## 3. Kiểm tra thực tế trên Production (Post-Deploy Gates)
- [ ] Truy cập `https://www.kocity.io.vn/` trên trình duyệt:
  - Trang chủ tải mượt mà dưới 2 giây.
  - Các nút bấm, widget Zalo quả cầu lửa hoạt động bình thường.
  - Phần Cẩm nang 5 bài viết hiển thị đúng hiệu ứng mây che úp mở.
- [ ] Truy cập `https://www.kocity.io.vn/admin`:
  - Đăng nhập và mở được tab bài viết, các nút Sửa/Tắt mây hoạt động trơn tru.
