# KOCity Regression Safeguards & Data Isolation Architecture

Tài liệu này quy định các nguyên tắc kỹ thuật bắt buộc để ngăn chặn 100% tình trạng **"sửa cái này mất cái kia"** trong dự án KOCity.

---

## 1. Nguyên Tắc Cách Ly Dữ Liệu (Data Isolation)
1. **Mỗi module phải có khóa lưu trữ và phạm vi độc lập:**
   - Chiến dịch: `koctrend_campaigns` và record `campaigns` trên Supabase.
   - Ứng viên: `koctrend_applications` và bảng `applications` trên Supabase.
   - Bài viết Blog: `kocity_blog_posts_v2` và record riêng `__BLOG_POSTS_STORAGE__`.
   - Cấu hình banner: `kocity_custom_hero_image` và record `__SITE_CONFIG__`.
2. **Quy tắc kiểm thử không phá hủy (Non-Destructive Testing):**
   - Khi chạy script kiểm tra API hoặc test cơ sở dữ liệu, **TUYỆT ĐỐI CẤM** dùng các ID hệ thống thật (`__BLOG_POSTS_STORAGE__`, `__SITE_CONFIG__`, v.v.).
   - Luôn sử dụng tiền tố `__TEST_TEMP_...__` và bắt buộc phải dọn dẹp (cleanup/delete) ngay trong khối `finally`.

---

## 2. Cơ Chế Fallback 3 Lớp Bất Khả Xâm Phạm (Triple-Layer Fallback)
Mọi hàm nạp dữ liệu từ xa (Supabase / REST API) phải tuân thủ kiến trúc 3 lớp:
1. **Lớp 1 (Cloud Data):** Lấy dữ liệu từ Supabase nếu có kết nối mạng và dữ liệu hợp lệ.
2. **Lớp 2 (Local Storage Cache):** Nếu Cloud chưa có hoặc mạng yếu, ưu tiên lấy dữ liệu đã lưu trong `localStorage`.
3. **Lớp 3 (Immutable Seed Constant):** Nếu cả Cloud và Local đều rỗng hoặc bị lỗi, luôn fallback về mảng dữ liệu gốc trong mã nguồn (`INITIAL_CAMPAIGNS`, `INITIAL_BLOG_POSTS`, v.v.).

> **Quy tắc cấm:** Tuyệt đối không bao giờ được `setCampaigns([])` hoặc `setPosts([])` khi remote trả về rỗng, gây ra lỗi màn hình trắng cho người dùng.

---

## 3. Quy Trình Merge Dữ Liệu Thông Minh
Khi kết hợp dữ liệu từ Cloud về máy client:
- Phải dùng `Map` để giữ lại các bản ghi cục bộ mà Admin vừa chỉnh sửa hoặc tạo mới trên máy nhưng Cloud chưa kịp đồng bộ.
- Không được dùng mảng Cloud đè trắng mảng Local.

---

## 4. Kiểm Soát Thay Đổi (Git Diff Boundary)
Trước khi commit:
- Chạy `git diff --stat` để kiểm tra số lượng file thay đổi.
- Nếu người dùng yêu cầu sửa Module A (ví dụ: Form nhận mẫu), thì các file của Module B (Blog) hoặc Module C (Auth) **không được có thay đổi**.
- Nếu phát hiện thay đổi ngoài phạm vi yêu cầu, phải dùng `git checkout` hoặc `git restore` file đó ngay lập tức.
