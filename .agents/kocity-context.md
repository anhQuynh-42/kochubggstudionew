# KOCity Context Foundation — Tệp Bối Cảnh Trung Tâm

> **Dành cho:** Tất cả các Skill và AI Assistant làm việc trên dự án KOCity.
> **Mục tiêu:** Cung cấp hiểu biết nền tảng duy nhất, nhất quán về sản phẩm, đối tượng người dùng, triết lý thiết kế và quy tắc nghiệp vụ.

---

## 1. 🎯 Sứ mệnh & Mô hình hoạt động KOCity
* **Tên nền tảng:** KOCity (kocity.io.vn)
* **Mô hình:** Nền tảng B2B2C trung gian kết nối các Nhãn hàng (SMEs, Brands) với cộng đồng Nano KOC & Micro KOC.
* **Đối tượng trọng tâm:** 
  * Nano KOC (từ 1.000 followers) & Micro KOC (từ 5.000 followers) trên TikTok.
  * Tôn chỉ: Kênh nhỏ vẫn nhận được sản phẩm mẫu thật 0đ tận nhà và tạo thu nhập minh bạch từ hoa hồng theo đơn hàng thực tế (Affiliate).
* **Quyền lợi KOC:** 
  * Nhận mẫu 0đ không cọc tiền, không rủi ro.
  * Được cấp Public Media Kit tự động mang tên mình.
  * Được cung cấp cẩm nang, kịch bản mẫu và hỗ trợ 24/7 qua Zalo nhóm.

---

## 2. 🎨 Nhận diện Thương hiệu & Design Tokens
* **Màu sắc chủ đạo:**
  * Màu tím thương hiệu chính: `#7c3aed` (Violet 600) / Gradient Violet-Indigo-Pink (`from-violet-600 via-indigo-600 to-pink-600`).
  * Màu nhấn Zalo / Hỗ trợ: `#0068ff` (Zalo Blue).
  * Màu cảnh báo / Điểm nhấn đặc quyền: Vàng kim `#f59e0b` / Amber `#d97706`.
  * Nền tối Showroom ban đêm: `#0f0a1e` / `#1e1338`.
* **Typography:**
  * Font chính: `font-sans` (Inter, Plus Jakarta Sans).
  * Font tiêu đề đặc sắc: `font-display`.
* **Phong cách giao diện:**
  * Bo góc mềm mại: `rounded-2xl` (16px) hoặc `rounded-3xl` (24px).
  * Hiệu ứng kính mờ cao cấp: `backdrop-blur-md` kết hợp viền mờ `border-white/10` hoặc `border-violet-100/80`.
  * Chế độ Showroom Ngày / Đêm dạng Floating Pill.

---

## 3. 🛡️ Nguyên tắc vàng phát triển sản phẩm (Product Guardrails)
1. **Quy tắc Mobile Parity:** Bất kỳ nâng cấp nào tối ưu cho điện thoại di động TUYỆT ĐỐI không được làm vỡ hoặc ảnh hưởng tiêu cực đến layout trên Laptop.
2. **Quy tắc WYSIWYG Editor:** Trình soạn thảo trong Admin phải trực quan 100% (như Word/Docs), đổi màu tại chỗ, không bao giờ làm lộ mã thẻ code HTML (như `<span...>`) ra cho người dùng thấy.
3. **Quy tắc Kiểm thử Vercel:** Mọi thay đổi trước khi deploy lên nhánh `main` phải vượt qua `npm run build` với 0 lỗi.
