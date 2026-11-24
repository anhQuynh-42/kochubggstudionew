# KOCity Form CRO Reference Guide

## 1. Field Friction Hierarchy (Xếp hạng độ cản trở tâm lý của trường nhập liệu)

| Mức độ cản trở | Loại trường dữ liệu | Khắc phục trong KOCity |
| :--- | :--- | :--- |
| **Cực cao (Rơi rụng 30-40%)** | CCCD/CMND, Số tài khoản ngân hàng, Mật khẩu tài khoản TikTok | **Tuyệt đối KHÔNG thu thập** ở bước đăng ký nhận mẫu ban đầu. |
| **Cao (Rơi rụng 15-25%)** | Địa chỉ nhà chi tiết (Số nhà, ngõ, ngách, phường/xã) | Chia thành 2 bước (Multi-step), gợi ý tỉnh/thành phố dạng dropdown nhanh. |
| **Trung bình (Rơi rụng 10%)** | Link kênh TikTok | Cho phép dán trực tiếp link hoặc gõ `@username`, hệ thống tự chuẩn hóa. |
| **Thấp (Rơi rụng < 5%)** | Họ và tên, Số điện thoại Zalo | Bật tự động điền `autoComplete="name"` và `autoComplete="tel"`. |

---

## 2. Dynamic Copy Triggers (Micro-copy kích thích hành động)

- **Thay vì:** "Nhập số lượng người theo dõi của bạn"
  ➔ **Dùng:** "Kênh từ 1.000 followers là đủ điều kiện nhận quà ngay!"
- **Thay vì:** "Chọn sản phẩm"
  ➔ **Dùng:** "Chọn 1 sản phẩm Cỏ Mềm bạn muốn trải nghiệm miễn phí"
- **Thay vì:** "Cam kết nộp video sau khi nhận hàng"
  ➔ **Dùng:** "Chỉ cần 1 video review chân thực để tiếp tục nhận mẫu ở các chiến dịch kế tiếp"

