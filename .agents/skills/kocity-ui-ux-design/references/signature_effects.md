# KOCity Signature Effects & Animations

## 1. Quả Cầu Lửa Zalo (Zalo Fireball Entrance)
- **Hiệu ứng:** Khi người dùng vừa vào trang, một quả cầu lửa phát sáng với đuôi sao chổi từ góc trên rơi chéo xuống góc dưới bên phải màn hình.
- **Biến hình:** Chạm đích sẽ tan tia sáng và biến thành nút Zalo tròn màu xanh `#0068ff`.
- **Thông điệp:** Sau 0.6 giây, hiện bong bóng lời chào `👋 Xin chào KOC mới!` kèm nút đóng (X).
- **CSS Keyframes:** `@keyframes zalo-meteor-fall`, `@keyframes pulse-glow`.

## 2. Lớp Mây Pha Lê Che Úp Mở (Curiosity Cloud Teaser)
- **Mục đích:** Che một phần nội dung bài viết cẩm nang hoặc chiến dịch VIP ngoài trang chủ để kích thích trí tò mò của KOC.
- **Hiệu ứng:** 
  - Lớp phủ gradient tím sương mù: `bg-gradient-to-t from-slate-950/95 via-violet-950/75 to-slate-900/35`.
  - Kính mờ: `backdrop-blur-[6px]`.
  - Chuyển động bồng bềnh: `animate-cloud-drift` (trôi chậm theo chiều ngang).
  - Huy hiệu bí mật: `💎 BÍ KÍP ĐỘC QUYỀN`.
- **Tương tác:** Khi người dùng bấm vào $\rightarrow$ kích hoạt hiệu ứng tan mây `animate-cloud-dissolve` và mở modal bài đọc đầy đủ.

## 3. Showroom Chế Độ Tối / Sáng (Night & Day Switcher)
- **Vị trí:** Floating pill cố định ở góc dưới bên trái (`fixed bottom-5 left-5 z-40`).
- **Chuyển đổi:** Đổi màu nền trang chủ sang sắc tím than huyền ảo `#0f0a1e`, ánh trăng sao chổi và các card phát quang neon tím.
