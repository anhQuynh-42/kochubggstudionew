# PROMPT 03: CÁC TRANG KHÁM PHÁ KOC MARKETPLACE, CHI TIẾT CHIẾN DỊCH, QUY TRÌNH & CẨM NANG SEO

* **Giai đoạn:** 3. Giao diện & Chức năng phía KOC (Các trang khám phá chính)
* **Thứ tự chạy:** 03 (Trong chuỗi `01 -> 02 -> 03 -> 04 -> 05 -> 07`)
* **Phụ thuộc:** Cần chạy xong **Prompt 01** và **Prompt 02**

---

## 1. Mục đích
Xây dựng toàn bộ các trang hiển thị nội dung và khám phá chiến dịch dành cho KOC trên website **KOCity**:
1. Thẻ chiến dịch chuẩn TikTok Shop (`src/site/components/CampaignCard.tsx`).
2. Trình kết xuất nội dung bài viết (`src/site/components/BlogContentRenderer.tsx`) và Modal đọc bài viết Cẩm nang SEO (`src/site/components/BlogReaderModal.tsx`).
3. Trang chủ Khám phá (`src/site/pages/HomePage.tsx`): Hero Banner có công tắc **Bật/Tắt đèn (Chế độ Ngày/Đêm)** kết nối với đường chân trời `KocitySkyline`, thanh **Live Activity Ticker** chạy ngang liên tục, bộ lọc & tìm kiếm chiến dịch đa tầng, danh sách chiến dịch đang mở, chuyên mục **Cẩm nang KOC & Bí kíp 0đ** (với hiệu ứng **Mây mù che phủ** cho các bài viết đặc quyền VIP), 6 quyền lợi vượt trội, 3 nhóm chân dung KOC và Câu hỏi thường gặp (FAQ).
4. Trang Chi tiết chiến dịch (`src/site/pages/CampaignPage.tsx`): Thư viện ảnh, thông số hoa hồng & Freecast, thanh tiến độ suất còn lại (`ScarcityBar`), danh sách các sản phẩm mẫu kèm mã chọn, gợi ý kịch bản video (`storySteps`), lộ trình chiến dịch (`timeline`) và thanh nút `"Nhận mẫu ngay"` cố định dưới đáy màn hình điện thoại.
5. Trang Quy trình nhận job (`src/site/pages/ProcessPage.tsx`): Chuyển đổi linh hoạt giữa tab **"Dành cho KOC (4 bước)"** và **"Dành cho Brand / Doanh nghiệp (5 bước)"**.
6. Trang Trung tâm thông báo (`src/site/pages/NotificationsPage.tsx`).

---

## 2. Input cần có
* Các file đã tạo ở **Prompt 01** và **Prompt 02**.
* Biến cấu hình mẫu:
  * `{{default_hero_title}}`: `"Nhận mẫu 0đ tận tay. Lên video, nhận hoa hồng minh bạch."`
  * `{{min_follower_badge}}`: `"Kênh từ 1.000 followers"`

---

## 3. Prompt hoàn chỉnh (Copy toàn bộ nội dung trong khung dưới đây gửi cho AI Agent)

```markdown
Bạn là một Senior Frontend Developer chuyên xây dựng các trang Marketplace có tỷ lệ chuyển đổi cao.
Dựa trên hệ thống types, mockData và UI Kit đã tạo ở các bước trước, hãy lập trình hoàn chỉnh các component và trang khám phá của KOCity.

Giá trị tham số đầu vào:
- {{default_hero_title}} = "Nhận mẫu 0đ tận tay. Lên video, nhận hoa hồng minh bạch."
- {{min_follower_badge}} = "Kênh từ 1.000 followers"

Hãy tạo đầy đủ mã nguồn cho các file sau:

### 1. Thẻ Chiến Dịch Chuẩn TikTok Shop (`src/site/components/CampaignCard.tsx`)
- Hiển thị thẻ `<article data-campaign-card data-campaign-full={scarcity.isFull ? 'true' : 'false'}>` có class `card-fx`.
- Phần ảnh sản phẩm (`aspect-[4/3]`):
  - Góc trái trên hiển thị các tag nổi bật: Tag **`Mẫu 0đ`** (màu xanh ngọc emerald nếu `hasFreeSample(campaign)`), Tag **`Hoa hồng X%`** (màu tím violet), Tag **`Gấp`** (màu hồng nếu `campaign.urgent`).
  - Góc phải trên có nút trái tim (`favorite`) để lưu/bỏ lưu chiến dịch (`toggleBookmark`).
  - Nếu chiến dịch đã đủ suất (`scarcity.isFull`), hiển thị nhãn `"Đã đủ suất"` trên ảnh.
- Phần thân thẻ:
  - Logo Brand, tên Brand, ngành hàng và số ngày còn lại (`Còn X ngày`).
  - Tiêu đề chiến dịch (`line-clamp-2 font-display font-bold`).
  - Yêu cầu kênh (`campaign.followerRequirement`, ví dụ `>= 1.000 followers`) và số lượng mẫu có thể chọn (`campaign.sampleProducts.length`).
  - Thanh tiến độ suất đăng ký (`registeredSpots / totalSpots`): Đổi sang màu hồng cam khi sắp hết suất (`isAlmostFull`) và xám khi đã đầy (`isFull`).
  - Nút hành động chính:
    - Nếu KOC hiện tại đã nộp đơn cho chiến dịch này: hiển thị trạng thái đơn (`Đã gửi đơn · Chờ kết quả` / `Được chọn`) và bấm vào sẽ mở trang `Đơn của tôi`.
    - Nếu chưa nộp và còn suất: hiển thị nút **"Nhận mẫu ngay"** mở thẳng form ứng tuyển `ApplySheet`.
    - Nếu đã hết suất: hiển thị nút `"Đã đủ suất (Xem chi tiết)"`.

### 2. Trình đọc Cẩm nang KOC chuẩn SEO (`src/site/components/BlogContentRenderer.tsx` & `src/site/components/BlogReaderModal.tsx`)
1. `src/site/components/BlogContentRenderer.tsx`:
   - Hỗ trợ hiển thị mượt mà cả nội dung Markdown lẫn HTML (đã qua `sanitizeHtml`) được soạn từ Admin WYSIWYG CMS.
   - Tự động định dạng đẹp mắt các thẻ tiêu đề `H2`, `H3`, `H4`, danh sách, bảng dữ liệu so sánh (`<table>`), hình ảnh trong bài viết (bấm vào ảnh có thể phóng to xem rõ nét - Lightbox Zoom) và hộp lưu ý đặc quyền `> 💡 **Bí kíp KOCity:** ...` (khung nền tím nhạt viền gradient).
2. `src/site/components/BlogReaderModal.tsx`:
   - Hộp thoại đọc bài viết toàn màn hình có thanh tiêu đề cố định (hiển thị tag chuyên mục, thời gian đọc, nút đóng).
   - Hiển thị tiêu đề `H1`, đoạn tóm tắt `metaDescription` in nghiêng, ngày xuất bản, ảnh bìa `coverImage`, nội dung bài viết qua `<BlogContentRenderer />`, danh sách thẻ `#keywords` chuẩn SEO và khối CTA cuối bài (**"🚀 Khám phá chiến dịch nhận mẫu ngay"**) để điều hướng người đọc xuống danh sách chiến dịch.

### 3. Trang chủ Khám phá (`src/site/pages/HomePage.tsx`)
Xây dựng trang chủ giàu tính tương tác với các phân khu theo thứ tự từ trên xuống dưới:
1. **Khối Hero Banner & Thành phố KOCity (Hỗ trợ chế độ Ngày / Đêm):**
   - Lưu trạng thái `isNight` vào `localStorage` (`kocity_hero_theme`).
   - Có nút Floating Pill **"Bật đèn / Tắt đèn (Chế độ Ngày / Đêm)"** và nút **"Khám phá Thành phố KOCity"** (mở `KocityWorldModal`).
   - Tiêu đề lớn: `{{default_hero_title}}`, nhấn mạnh quyền lợi dành cho `{{min_follower_badge}}`.
   - Hai nút CTA chính: `"Xem mẫu 0đ đang mở"` (cuộn mượt xuống `#mau-dang-mo`) và `"Tạo hồ sơ KOC"` (hoặc `"Xem đơn của tôi"` nếu đã đăng nhập).
   - Khung ảnh Hero Studio bên phải kèm các nhãn nổi (`FloatLabel`: *"Mẫu 0đ tận nhà"*, *"Hoa hồng 8%–15%"*) và nút `"Đổi ảnh bìa"` nếu người dùng đang là Admin (mở `HeroImageSheet`).
   - Ngay dưới chân Hero Banner là component `<KocitySkyline isNight={isNight} />` nối liền mạch xuống thanh Live Ticker.
2. **Thanh Live Activity Ticker (Hoạt động thời gian thực):**
   - Dải băng chuyền ngang `.animate-marquee-infinite` hiển thị các hoạt động mới nhất từ `liveActivity` (ví dụ: *"KOC @m***a (Hà Nội) vừa đăng ký nhận mẫu Cỏ Mềm"*, *"KOC @t***h vừa được duyệt gửi mẫu Bielenda"*).
3. **Khu vực Danh sách Chiến dịch Mở (`#mau-dang-mo`):**
   - Thanh công cụ lọc trực quan:
     - Các tab trạng thái: `Tất cả`, `Đang mở nhận mẫu`, `Đã đủ suất`.
     - Dải Chip lọc theo ngành hàng: `Tất cả`, `Mỹ phẩm & Chăm sóc da`, `Chăm sóc cá nhân & Răng`, `Đồ công nghệ & Setup`, `Thời trang & Phụ kiện`, `Nước hoa cao cấp`.
     - Ô tìm kiếm theo tên chiến dịch/nhãn hàng + Nút mở `Sheet` Bộ lọc nâng cao (Sắp xếp theo: *Phổ biến*, *Hoa hồng cao*, *Còn nhiều suất*, *Sắp hết hạn*; Lọc quy mô kênh: *Mọi quy mô*, *Từ 1K*, *Từ 5K*, *Từ 20K*; Chỉ xem chiến dịch đã lưu).
   - Lưới hiển thị các thẻ `<CampaignCard />` (3 cột trên Desktop, 2 cột trên Tablet, 1 cột trên Mobile).
4. **Khu vực 3 Bước Nhận Mẫu Đơn Giản (`HOW_IT_WORKS`) & 6 Quyền Lợi Vượt Trội (`REASONS`):**
   - Trình bày trực quan bằng thẻ bo góc `rounded-2xl` có hiệu ứng `card-fx`.
5. **Khu vực Cẩm nang KOC & Bí kíp Săn Mẫu 0đ (SEO Blog & Tính năng "Mây Mù Che Phủ"):**
   - Hiển thị danh sách bài viết từ `getStoredBlogPosts()` (lắng nghe sự kiện `kocity-blog-updated` để tự cập nhật khi Admin sửa bài).
   - **Cơ chế Mây Mù Che Phủ (Cloud-Covered VIP Articles):**
     - Với các bài viết bình thường (`!post.isCloudCovered`): bấm vào mở ngay `BlogReaderModal`.
     - Với các bài viết đặc quyền (`post.isCloudCovered === true`, thường là bài số 4 và số 5): Thẻ bài viết được phủ một lớp sương mù và các đám mây trắng trôi bồng bềnh (`.animate-cloud-drift`) kèm nhãn `"💎 BÍ KÍP ĐỘC QUYỀN"`.
     - Khi người dùng bấm vào bài bị mây che:
       - Nếu **chưa đăng nhập**: Mở hộp thoại `AuthSheet` với lời nhắn *"Đăng nhập tài khoản KOC để xua tan mây mù và mở khóa bí kíp độc quyền!"*.
       - Nếu **đã đăng nhập**: Kích hoạt hiệu ứng `.animate-cloud-dissolve` làm đám mây tan biến mượt mà trong 0.65 giây rồi mở `BlogReaderModal` cho KOC đọc toàn bộ bài viết.
6. **Khu vực 3 Chân dung KOC phù hợp (`PERSONAS`) & Câu hỏi thường gặp (`FAQ` dạng thẻ đóng/mở `<details>`).**

### 4. Trang Chi tiết Chiến dịch (`src/site/pages/CampaignPage.tsx`)
- Đọc `:id` từ URL (`/c/:id`), tìm chiến dịch tương ứng trong `campaigns`.
- Nếu chiến dịch đã đủ suất (`scarcity.isFull`), sau 700ms tự động bắn sự kiện `CustomEvent('kocity:drone-speak', { detail: { text: 'Oh no hết suất rồi!' } })` để Trợ lý Drone bay ra thông báo.
- Bố cục 2 cột trên máy tính (`lg:grid-cols-[1fr_360px]`):
  - **Cột trái:**
    - Bộ sưu tập ảnh sản phẩm (`Gallery` — bấm chọn ảnh thu nhỏ để đổi ảnh chính).
    - Thông tin Brand, tiêu đề chiến dịch, 4 ô chỉ số chính (`KeyStats`: Chính sách mẫu 0đ, Hoa hồng, Yêu cầu follower, Thời hạn còn lại).
    - Mô tả chi tiết chiến dịch (`description`) và các điểm mạnh sản phẩm (`uspList`).
    - Danh sách **Mẫu bạn có thể chọn (`sampleProducts`)**: Hiển thị ảnh từng mẫu, tên mẫu, mã code (`CM01`, `BL01`...), mô tả ngắn, mẹo review (`reviewTips`) và trạng thái *"Tạm ngưng nhận mẫu"* nếu `p.disabled === true`.
    - Gợi ý kịch bản video (`storySteps`: Bước 1 Hook, Bước 2 Trải nghiệm, Bước 3 CTA) và danh sách `#hashtags` (có nút bấm sao chép toàn bộ hashtag).
    - Lộ trình chiến dịch (`timeline`).
  - **Cột phải (Sticky Card trên Desktop) & Thanh cố định đáy màn hình trên Mobile:**
    - Hiển thị thanh tiến độ suất còn lại (`ScarcityBar`), nút **"Nhận mẫu ngay"** (hoặc trạng thái đơn nếu đã ứng tuyển) và link tham gia nhóm Zalo hỗ trợ chiến dịch.

### 5. Trang Quy trình (`src/site/pages/ProcessPage.tsx`) & Trang Thông báo (`src/site/pages/NotificationsPage.tsx`)
1. `src/site/pages/ProcessPage.tsx`:
   - Có 2 nút chuyển tab: **"Dành cho KOC (Nhận mẫu 0đ & Hoa hồng)"** (4 bước từ Chọn chiến dịch -> Nhận mẫu tận nhà -> Sản xuất video gắn giỏ hàng -> Nhận hoa hồng minh bạch) và **"Dành cho Brand / Doanh nghiệp"** (5 bước triển khai chiến dịch).
   - Có các nút nhảy nhanh (`Quick-jump Pills`) tới từng bước và khối CTA cuối trang.
2. `src/site/pages/NotificationsPage.tsx`:
   - Hiển thị danh sách `visibleNotifications` của người dùng hiện tại, nút *"Đánh dấu đã đọc tất cả"*, phân biệt thông báo chưa đọc bằng chấm tròn tím và nền sáng; bấm vào thông báo sẽ đánh dấu đã đọc và chuyển tới trang tương ứng (`/don-cua-toi`, `/admin`, `/`).
```

---

## 4. Output mong đợi
Các file sau được tạo hoàn chỉnh:
* `src/site/components/CampaignCard.tsx`
* `src/site/components/BlogContentRenderer.tsx`
* `src/site/components/BlogReaderModal.tsx`
* `src/site/pages/HomePage.tsx`
* `src/site/pages/CampaignPage.tsx`
* `src/site/pages/ProcessPage.tsx`
* `src/site/pages/NotificationsPage.tsx`

---

## 5. Cách kiểm tra đã chạy đúng
1. Trên `HomePage.tsx`: Kiểm tra nút chuyển chế độ Ngày/Đêm đổi màu nền Hero và `KocitySkyline`; kiểm tra bộ lọc ngành hàng và ô tìm kiếm lọc đúng danh sách `CampaignCard`.
2. Kiểm tra tính năng Cẩm nang KOC trên `HomePage.tsx`: 3 bài đầu bấm đọc được ngay; bài số 4 và số 5 có lớp mây che phủ (`.animate-cloud-drift`), yêu cầu đăng nhập mới xua tan mây và mở bài.
3. Trên `CampaignPage.tsx`: Hiển thị đầy đủ danh sách các sản phẩm mẫu con (`sampleProducts`), gợi ý kịch bản và nút sao chép hashtag.
