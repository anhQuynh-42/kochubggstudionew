# PROMPT 02: HỆ THỐNG GIAO DIỆN (DESIGN SYSTEM), KHUNG ĐIỀU HƯỚNG, THÀNH PHỐ KOCITY & TRỢ LÝ DRONE

* **Giai đoạn:** 2. Giao diện (Design System, Layout & Hiệu ứng tương tác đặc trưng)
* **Thứ tự chạy:** 02 (Trong chuỗi `01 -> 02 -> 03 -> 04 -> 05 -> 07`)
* **Phụ thuộc:** Cần chạy xong **Prompt 01** (`01_kien-truc-du-an-va-database-schema.md`)

---

## 1. Mục đích
Xây dựng toàn bộ lớp giao diện nền tảng, hệ thống hiệu ứng CSS, bộ UI Components dùng chung và các thành phần thị giác đặc trưng của KOCity:
1. File `src/index.css`: Thiết lập Tailwind CSS v4, biến màu thương hiệu (`#6366f1`, `#8b5cf6`, `#ec4899`, nền `#fafafc`), font chữ (`Inter`, `Plus Jakarta Sans`) và toàn bộ hệ thống Keyframe Animations (`marquee-horizontal`, `card-fx`, `shine-sweep`, `meteor-fall`, `cloud-drift`, `cloud-dissolve`).
2. Bộ UI Kit (`src/site/ui.tsx`): Các component nguyên tử (`Icon`, `Button`, `IconButton`, `Badge`, `Chip`, `Field`, `TikTokHandleInput`, `PasswordInput`, `Avatar`, `EmptyState`, `SectionTitle`, và `Sheet` — tự động trượt từ đáy màn hình trên điện thoại và hiển thị dạng modal giữa màn hình trên máy tính).
3. Khung bố cục chung (`src/site/SiteLayout.tsx`): Thanh điều hướng trên cùng (`TopBar`) kèm ô tìm kiếm và chuông thông báo, thanh điều hướng cố định dưới đáy màn hình điện thoại (`BottomNav`), chân trang (`Footer`), nút nổi cộng đồng Zalo (`ZaloFab`) và hệ thống thông báo nhanh (`ToastHost`).
4. Dải đường chân trời Thành phố KOCity (`src/site/components/KocitySkyline.tsx`) hỗ trợ chuyển đổi chế độ **Ban ngày / Ban đêm** và cửa sổ khám phá thế giới cư dân KOC (`src/site/components/KocityWorldModal.tsx`).
5. Trợ lý ảo Drone giao mẫu (`src/site/components/DeliveryDroneAssistant.tsx`) bay theo chuột và phát thoại thông minh theo trạng thái chiến dịch.

---

## 2. Input cần có
* Các file đã tạo ở **Prompt 01** (`src/types.ts`, `src/lib/constants.ts`, `src/lib/notifications.ts`).
* Các biến cấu hình thiết kế mẫu:
  * `{{primary_indigo}}`: `"#6366f1"`
  * `{{primary_violet}}`: `"#8b5cf6"`
  * `{{primary_pink}}`: `"#ec4899"`
  * `{{canvas_bg}}`: `"#fafafc"`

---

## 3. Prompt hoàn chỉnh (Copy toàn bộ nội dung trong khung dưới đây gửi cho AI Agent)

```markdown
Bạn là một Senior UI/UX Engineer chuyên thiết kế giao diện Creator Economy theo phong cách Gen Z & TikTok Shop.
Tiếp nối cấu trúc dự án KOCity đã khởi tạo, hãy xây dựng hệ thống Design System, UI Components, Layout điều hướng, Thành phố KOCity Skyline và Trợ lý Drone tương tác.

Giá trị tham số thiết kế:
- {{primary_indigo}} = "#6366f1"
- {{primary_violet}} = "#8b5cf6"
- {{primary_pink}} = "#ec4899"
- {{canvas_bg}} = "#fafafc"

Hãy tạo đầy đủ mã nguồn cho các file sau:

### 1. Hệ thống CSS & Hiệu ứng chuyển động (`src/index.css`)
- Sử dụng `@import "tailwindcss";` và khai báo khối `@theme`:
  - `--color-brand-indigo: {{primary_indigo}};`
  - `--color-brand-violet: {{primary_violet}};`
  - `--color-brand-pink: {{primary_pink}};`
  - `--color-canvas: {{canvas_bg}};`
  - `--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;`
  - `--font-display: 'Plus Jakarta Sans', 'Inter', ui-sans-serif, sans-serif;`
- Định nghĩa class `.material-symbols-outlined` và `.no-scrollbar` (ẩn thanh cuộn ngang).
- Định nghĩa các hiệu ứng CSS đặc trưng của KOCity:
  1. `.animate-marquee-infinite`: Chạy chữ ngang vô tận 40s (`translateX(0%)` -> `translateX(-50%)`) cho thanh Live Ticker, tự động `paused` khi người dùng hover chuột vào.
  2. `.card-fx` và `.btn-fx`: Khi hover trên thiết bị có chuột (`@media (hover: hover)`), thẻ nổi lên `translateY(-5px)`, đổ bóng tím `0 22px 45px -18px rgba(124, 58, 237, 0.45)`, ảnh bên trong phóng nhẹ `scale(1.04)` và có vệt sáng lấp lánh (`shine-sweep`) quét chéo qua bề mặt.
  3. `.animate-fab-float`: Hiệu ứng nhấp nhô êm ái biên độ `-5px` chu kỳ 3s cho nút nổi Zalo.
  4. `.animate-meteor-fall`, `.animate-shockwave`, `.animate-fireball-core`: Hiệu ứng quả cầu lửa sao băng rơi chéo góc phải.
  5. `.animate-cloud-drift` & `.animate-cloud-dissolve`: Hiệu ứng đám mây trôi bồng bềnh che phủ bài viết Cẩm nang VIP và hiệu ứng tan biến (`blur(35px)`, `scale(1.4)`, `opacity: 0`) khi KOC bấm mở khóa.

### 2. Bộ UI Kit dùng chung (`src/site/ui.tsx`)
Xây dựng và export các component tái sử dụng:
- `cx(...classes)`: Hàm ghép nối class Tailwind gọn nhẹ.
- `inputClass`: Chuỗi class chuẩn cho ô nhập liệu (`h-11 w-full rounded-2xl bg-slate-50 px-3.5 text-sm text-slate-900 ring-1 ring-slate-200/90 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]`).
- `Icon`: Hiển thị `<span className="material-symbols-outlined">...</span>` (hỗ trợ prop `filled`).
- `Button`: Hỗ trợ các `variant` (`'primary'` với nền gradient `from-[#6366f1] via-[#8b5cf6] to-[#ec4899]`, `'dark'` nền `bg-slate-900`, `'soft'` nền `bg-violet-50 text-[#6d28d9]`, `'outline'`, `'ghost'`), `size` (`'sm' | 'md' | 'lg'`), và `block` (full-width).
- `IconButton`: Nút tròn chứa icon.
- `Badge`: Nhãn trạng thái bo tròn với các `tone`: `'violet' | 'pink' | 'emerald' | 'amber' | 'slate' | 'dark'`.
- `Chip`: Nút lọc dạng viên thuốc (pill) có trạng thái `active` (nền `bg-slate-900 text-white`).
- `Field`: Khung bọc ô input có `label`, dấu `*` (`required`), `hint` hướng dẫn và `action` góc phải, tự động sinh `id` bằng `useId()`.
- `TikTokHandleInput`: Ô nhập ID TikTok có chữ `@` cố định bên trái, tự động xóa ký tự `@` thừa hoặc khoảng trắng khi người dùng gõ.
- `PasswordInput`: Ô nhập mật khẩu có nút mắt bật/tắt hiển thị mật khẩu.
- `Avatar`: Hiển thị ảnh đại diện tròn hoặc chữ cái đầu tên KOC trên nền gradient tím-hồng nếu chưa có ảnh.
- `EmptyState`: Khung thông báo trạng thái trống có icon, tiêu đề, mô tả và nút hành động.
- `SectionTitle`: Tiêu đề mục lớn kèm `eyebrow`, `subtitle` và `action`.
- `Sheet`: Hộp thoại đa năng (trên mobile trượt từ đáy màn hình `rounded-t-[28px]`, trên desktop hiển thị giữa màn hình `sm:rounded-[28px]`), khoá cuộn trang nền, bấm phím `Escape` hoặc bấm nền mờ để đóng.

### 3. Dải đường chân trời Thành phố KOCity (`src/site/components/KocitySkyline.tsx`) & Thế giới Cư dân (`src/site/components/KocityWorldModal.tsx`)
1. `src/site/components/KocitySkyline.tsx`:
   - Vẽ vector SVG (`viewBox="0 0 1440 96"`) tái hiện đường chân trời thành phố KOCity 2 lớp (Far Layer & Front Layer) với các tòa nhà studio, tháp truyền hình trung tâm phát sóng tròn (`kc-wave-1`, `kc-wave-2`), đèn cửa sổ nhấp nháy (`kc-w1`, `kc-w2`, `kc-w3`), bảng đèn LED `KOCITY` trên nóc tòa nhà và hình nhân vật KOC nhỏ ngồi đung đưa chân trên mái nhà (`kc-dangling-legs`).
   - Hỗ trợ prop `isNight?: boolean`: Khi `isNight = false` (Ban ngày) dùng tông tím pastel sáng; khi `isNight = true` (Ban đêm) bật vùng hừng sáng chân trời (`kc-night-horizon-glow`), viền neon nóc tòa nhà và cửa sổ phát sáng rực rỡ.
2. `src/site/components/KocityWorldModal.tsx`:
   - Modal toàn màn hình khám phá **"Thành phố cư dân KOCity"** gồm 3 khu vực:
     - **Trạm phát mẫu Brand Stations:** 4 trạm chính (*Cỏ Mềm Homelab*, *Bielenda Official*, *Tranyoo Tech*, *ViSecret Design*) hiển thị số lượng mẫu, mức hoa hồng và nút bấm chuyển thẳng tới đăng ký chiến dịch đó.
     - **Bảng vinh danh cư dân KOC (Honor Roll):** Vinh danh Top KOC tiêu biểu đã được ẩn danh bảo mật (`KOC @m***h`, `KOC @h***y`, `KOC @t***o`, `KOC @n***m`) kèm huy hiệu thành tích và tỷ lệ đúng hạn 100%.
     - **Kho kịch bản Hook 3 giây mẫu:** Cho phép KOC bấm sao chép nhanh các mẫu câu mở đầu video đập hộp 0đ.
3. `src/site/components/HeroImageSheet.tsx`:
   - Hộp thoại `Sheet` dành riêng cho Admin để tải lên hoặc dán link đổi ảnh Hero Banner trang chủ (tự động nén ảnh qua Canvas) hoặc khôi phục ảnh mặc định.

### 4. Trợ lý ảo Drone tương tác (`src/site/components/DeliveryDroneAssistant.tsx`)
- Vẽ SVG chiếc Drone giao hàng KOCity đeo hộp quà mẫu 0đ có cánh quạt quay tít, đèn tín hiệu nhấp nháy và nút nhỏ `[x]` nếu người dùng muốn thu gọn thành nút tròn `"Drone"` ở góc trái dưới màn hình.
- Hành vi thông minh:
  1. **Trên máy tính (Desktop):** Drone bay mượt mà theo sau con trỏ chuột bằng thuật toán nội suy tuyến tính (`Linear Interpolation - lerp 0.12`). Khi người dùng rê chuột vào thẻ chiến dịch (`article, .campaign-card, [data-campaign-card]`), Drone bay tới đậu ở góc trên bên phải thẻ đó.
  2. **Nhận diện trạng thái chiến dịch:**
     - Nếu thẻ chiến dịch có thuộc tính `data-campaign-full="true"` (hoặc khi trang chi tiết chiến dịch hết suất bắn sự kiện `window.dispatchEvent(new CustomEvent('kocity:drone-speak', { detail: { text: 'Oh no hết suất rồi!' } }))`), Drone lập tức bật bong bóng thoại: **"Oh no hết suất rồi!"**.
     - Nếu chiến dịch còn suất, Drone phát ngẫu nhiên các câu thoại ngắn khích lệ (giãn cách tối thiểu 3.5 giây): *"Job ngon kìa bạn ơi!"*, *"Mẫu xịn nè bạn ơi!"*, *"Hoa hồng cao lắm nè!"*, *"Vào nhận mẫu lẹ bạn ơi!"*.

### 5. Khung bố cục & Điều hướng (`src/site/SiteLayout.tsx`)
- `TopBar` (sticky top, hiệu ứng kính mờ `bg-white/80 backdrop-blur-xl`):
  - Logo **Kocity** (biểu tượng `hub` trên nền gradient tím-hồng).
  - Menu ngang trên máy tính: `Khám phá` (`/`), `Quy trình` (`/quy-trinh`), `Tiến độ` (`/tien-do`), `Đơn của tôi` (`/don-cua-toi` — có badge đếm số đơn).
  - Ô tìm kiếm nhanh chiến dịch/brand trên máy tính (gõ từ khóa và Enter sẽ điều hướng về `/?q=...#mau-dang-mo`).
  - Nút chuông thông báo (`notifications`) có chấm hồng đếm số thông báo chưa đọc; trên máy tính mở dropdown xem nhanh, trên điện thoại chuyển tới `/thong-bao`.
  - Khu vực tài khoản: Nếu chưa đăng nhập hiển thị nút `"Đăng nhập"` và `"Tạo tài khoản KOC"`; nếu đã đăng nhập hiển thị Avatar + menu thả xuống (`Hồ sơ & Media Kit`, `Đơn của tôi`, `Tiến độ`, nút vào `Trang quản trị` nếu là Admin, và `Đăng xuất`).
- `BottomNav` (chỉ hiển thị trên điện thoại `md:hidden`, cố định dưới đáy màn hình): Gồm 5 tab `Khám phá`, `Quy trình`, `Tiến độ`, `Đơn của tôi`, `Hồ sơ`.
- `Footer`: Hiển thị thông tin KOCity, liên kết nhanh, thông tin liên hệ lấy từ `BRAND_CONTACT` và `SOCIAL_LINKS`, cùng đường dẫn ẩn nhỏ tới `/admin` ở cuối chân trang.
- `ZaloFab`: Nút tròn nổi góc phải dưới màn hình dẫn tới `ZALO_GROUP_URL` với hiệu ứng `.animate-fab-float`.
- `ToastHost`: Hiển thị thông báo nổi góc dưới màn hình khi có sự kiện (`toast` từ `useAppData()`).
```

---

## 4. Output mong đợi
Các file giao diện và hiệu ứng sau được tạo hoàn chỉnh:
* `src/index.css`
* `src/site/ui.tsx`
* `src/site/components/KocitySkyline.tsx`
* `src/site/components/KocityWorldModal.tsx`
* `src/site/components/HeroImageSheet.tsx`
* `src/site/components/DeliveryDroneAssistant.tsx`
* `src/site/SiteLayout.tsx`

---

## 5. Cách kiểm tra đã chạy đúng
1. Kiểm tra `src/index.css`: Có đủ các class `.animate-marquee-infinite`, `.card-fx`, `.animate-cloud-drift`, `.animate-cloud-dissolve` và `@theme` Tailwind v4.
2. Kiểm tra `src/site/components/DeliveryDroneAssistant.tsx`: Có lắng nghe sự kiện `kocity:drone-speak`, kiểm tra `data-campaign-full="true"` và có nút thu gọn/bật lại Drone.
3. Kiểm tra `src/site/SiteLayout.tsx`: Hiển thị đúng `TopBar` trên Desktop và `BottomNav` trên Mobile, sử dụng hằng số từ `src/lib/constants.ts`.
