export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  coverImage: string;
  tag: string;
  readTime: string;
  isCloudCovered: boolean;
  cloudSecretLabel?: string;
  summary: string;
  content: string;
  publishedAt: string;
}

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'TikTok Shop Affiliate là gì? Tổng hợp thuật ngữ và chỉ số creator cần biết',
    slug: 'tiktok-shop-affiliate-la-gi',
    metaTitle: 'TikTok Shop Affiliate là gì? Giải thích thuật ngữ A–Z',
    metaDescription: 'Tìm hiểu TikTok Shop Affiliate, GMV, hoa hồng, CTR, tỷ lệ chuyển đổi, GMV Max và các chỉ số giúp creator đánh giá hiệu quả tiếp thị liên kết.',
    keywords: ['TikTok Shop Affiliate là gì', 'thuật ngữ TikTok Shop Affiliate', 'GMV là gì', 'hoa hồng Affiliate là gì', 'CTR là gì', 'GMV Max là gì'],
    coverImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
    tag: 'Kiến thức nền tảng',
    readTime: '5 phút đọc',
    isCloudCovered: false,
    summary: 'Giải thích toàn diện về mô hình tiếp thị liên kết TikTok Shop, cách tính hoa hồng thực tế, ý nghĩa chỉ số GMV, CTR, tỷ lệ chuyển đổi và cách đọc báo cáo để tối ưu doanh thu.',
    publishedAt: '24/10/2026',
    content: `## TikTok Shop Affiliate là gì?

TikTok Shop Affiliate là hình thức tiếp thị liên kết, trong đó nhà sáng tạo nội dung (Creator) quảng bá sản phẩm của nhà bán hàng (Seller) thông qua video, livestream, trang trưng bày sản phẩm hoặc liên kết tiếp thị. Khi khách hàng mua hàng và đơn đáp ứng điều kiện ghi nhận hoa hồng, creator có thể nhận hoa hồng theo chính sách áp dụng.

![Mô hình kết nối KOC và Seller trên TikTok Shop Affiliate](https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000&auto=format&fit=crop&q=80)

> 💡 **Bí kíp KOCity:** Khác với việc chỉ đăng video để tăng lượt xem, làm Affiliate đòi hỏi bạn quan tâm cả hành trình mua hàng: sản phẩm có được nhìn thấy không, người xem có nhấp vào sản phẩm không, có phát sinh đơn hàng không và hoa hồng thực nhận là bao nhiêu.

---

### 1. Các thuật ngữ cơ bản trong TikTok Shop Affiliate

* **Affiliate là gì?**
  Affiliate là tiếp thị liên kết. Creator quảng bá sản phẩm thông qua các kênh liên kết và nhận hoa hồng khi giao dịch đáp ứng điều kiện của chương trình.
  *Ví dụ:* Bạn đăng video giới thiệu một chiếc bình nước có gắn sản phẩm TikTok Shop. Nếu khách hàng mua hàng qua liên kết và đơn đủ điều kiện, bạn sẽ nhận hoa hồng.

* **Creator là gì?**
  Creator là nhà sáng tạo nội dung. Họ có thể sản xuất video, livestream hoặc nội dung trên mạng xã hội. Không phải creator nào cũng làm Affiliate; một số người chủ yếu phát triển cộng đồng hoặc hợp tác trực tiếp với thương hiệu.

* **KOC là gì?**
  KOC (Key Opinion Consumer) thường được hiểu là người tiêu dùng có ảnh hưởng thông qua trải nghiệm và đánh giá thực tế sản phẩm. KOC có thể xây dựng nội dung theo một lĩnh vực như làm đẹp, thời trang, gia dụng hoặc công nghệ.
  *Lưu ý:* Số follower chỉ là một phần. Mức độ phù hợp với sản phẩm, chất lượng nội dung và sự tin tưởng của khán giả mới là yếu tố quyết định thương hiệu lựa chọn bạn.

* **Cộng tác mở và Cộng tác mục tiêu:**
  Trong TikTok Shop, nhà bán hàng có thể sử dụng *Cộng tác mở* (cho phép mọi creator đủ điều kiện tự do gắn giỏ hàng) hoặc *Cộng tác mục tiêu* (Brand chủ động gửi lời mời riêng cho creator cụ thể với mức hoa hồng ưu đãi độc quyền).

---

### 2. Các thuật ngữ về doanh thu và hoa hồng

* **GMV là gì?**
  GMV là viết tắt của *Gross Merchandise Value* (tổng giá trị hàng hóa được ghi nhận). Đây **không đồng nghĩa** với lợi nhuận của Brand hoặc thu nhập của creator. Ví dụ, tạo ra GMV 10 triệu đồng với hoa hồng 10% thì thu nhập dự kiến là 1 triệu đồng.

* **Hoa hồng Affiliate là gì?**
  Là khoản tiền creator nhận được từ các đơn hàng thành công, tính trên giá thanh toán thực tế của khách hàng (sau khi trừ voucher sàn và thuế).

* **Hoa hồng ước tính vs Hoa hồng cuối cùng:**
  Hoa hồng ước tính là số tiền dự kiến hiển thị ngay khi khách vừa đặt hàng. Hoa hồng cuối cùng chỉ được quyết toán sau khi đơn hàng giao thành công và hết thời hạn đổi trả/khiếu nại.

---

### 3. Các chỉ số hiệu suất quan trọng Creator cần đọc hiểu

| Chỉ số | Ý nghĩa thực tế |
| :--- | :--- |
| **Lượt hiển thị (Impressions)** | Số lần video hoặc thẻ sản phẩm xuất hiện trên màn hình người dùng |
| **Lượt nhấp sản phẩm (Clicks)** | Số lượt người dùng bấm vào giỏ hàng màu vàng |
| **CTR (Click-Through Rate)** | Tỷ lệ nhấp trên số lần hiển thị (Lượt nhấp / Lượt hiển thị) |
| **Tỷ lệ chuyển đổi (CR)** | Tỷ lệ người đặt mua hàng trên tổng số lượt bấm vào xem sản phẩm |
| **Mặt hàng đã bán (Items Sold)** | Tổng số lượng sản phẩm giao dịch thành công |

---

### 4. Cách dùng chỉ số để cải thiện kết quả Affiliate

1. **Video nhiều view nhưng ít lượt nhấp sản phẩm:** Kiểm tra lại xem kịch bản đã làm nổi bật công dụng sản phẩm chưa, lời kêu gọi bấm vào giỏ hàng đã rõ ràng và tự nhiên chưa.
2. **Nhiều lượt nhấp nhưng ít đơn hàng:** Kiểm tra xem giá bán có bị cao so với thị trường không, đánh giá của shop có uy tín không, hoặc phí ship có quá đắt không.
3. **Có đơn nhưng hoa hồng thấp:** Hãy tìm các chiến dịch trên **KOCITY** có mức hoa hồng cam kết cao (từ 10% - 25%) để tối đa hóa thu nhập trên mỗi video.`
  },
  {
    id: 'post-2',
    title: 'Cách tìm sản phẩm win TikTok Shop để tăng đơn hàng và hoa hồng Affiliate',
    slug: 'cach-tim-san-pham-win-tiktok-shop',
    metaTitle: 'Cách tìm sản phẩm win TikTok Shop cho Affiliate',
    metaDescription: 'Học cách tìm và đánh giá sản phẩm win TikTok Shop qua nhu cầu, doanh số, hoa hồng, mức cạnh tranh và độ phù hợp với kênh trước khi làm Affiliate.',
    keywords: ['cách tìm sản phẩm win TikTok Shop', 'sản phẩm win TikTok Shop', 'tìm sản phẩm Affiliate', 'sản phẩm hoa hồng cao', 'cách chọn sản phẩm dễ ra đơn'],
    coverImage: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80',
    tag: 'Bí kíp chọn sản phẩm',
    readTime: '6 phút đọc',
    isCloudCovered: false,
    summary: 'Công thức 6 tiêu chí đánh giá sản phẩm win: Nhu cầu thị trường, xu hướng tăng trưởng, mức hoa hồng thực nhận, uy tín nhà bán và độ tương thích với tệp người xem.',
    publishedAt: '24/10/2026',
    content: `## Sản phẩm win TikTok Shop là gì?

Trong cộng đồng Affiliate, **"sản phẩm win"** là sản phẩm đáp ứng hoàn hảo 3 yếu tố: nhu cầu thị trường cao, dễ tạo nội dung chuyển đổi và mang lại tỷ lệ hoa hồng xứng đáng cho Creator.

![Phân tích sản phẩm xu hướng và đánh giá dung lượng thị trường](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80)

> 💡 **Bí kíp KOCity:** Chọn đúng sản phẩm giúp bạn giảm 70% công sức làm video. Nếu sản phẩm không có nhu cầu hoặc chất lượng kém, dù video đạt hàng trăm nghìn lượt xem thì tỷ lệ chuyển đổi vẫn rất thấp.

---

### 1. Tìm sản phẩm từ chính nhu cầu của khán giả

* **Kênh Chăm sóc sắc đẹp / Skincare:** Kem chống nắng, nước tẩy trang, son dưỡng, serum phục hồi.
* **Kênh Đời sống / Gia đình:** Đồ gia dụng thông minh, hộp bảo quản thực phẩm, nước giặt xả organic.
* **Kênh Công nghệ / Bàn làm việc:** Tai nghe Bluetooth, giá đỡ điện thoại, củ sạc nhanh, đèn bàn decor.
* **Kênh Thời trang / OOTD:** Áo thun basic, túi xách đi học, giày sneaker, phụ kiện trang sức.

---

### 2. Bảng chấm điểm sản phẩm Win trước khi xin mẫu (Thang điểm 30)

| Tiêu chí | Câu hỏi cần trả lời | Điểm (1-5) |
| :--- | :--- | :---: |
| **Nhu cầu (Demand)** | Sản phẩm có giải quyết vấn đề cấp bách của người xem không? | 1 - 5 |
| **Xu hướng (Trend)** | Doanh số đang tăng trưởng hay đang thoái trào? | 1 - 5 |
| **Hoa hồng (Commission)** | Mức hoa hồng thực tế trên mỗi đơn có đủ bù đắp công sáng tạo? | 1 - 5 |
| **Chất lượng Brand** | Shop có đánh giá từ 4.7 sao trở lên và tỷ lệ phản hồi tốt không? | 1 - 5 |
| **Độ phù hợp (Fit)** | Bạn có tự tin trải nghiệm và giới thiệu sản phẩm chân thực không? | 1 - 5 |
| **Khác biệt (Uniqueness)** | Bạn có góc quay hay kịch bản review độc đáo hơn đối thủ không? | 1 - 5 |

*Nếu tổng điểm $\ge$ 24 điểm:* Đây là sản phẩm tiềm năng rất cao, hãy đăng ký nhận mẫu ngay!

---

### 3. Tìm sản phẩm win có mẫu 0đ qua nền tảng KOCITY

Thay vì phải tự bỏ tiền túi ra mua sản phẩm về review với rủi ro không ra đơn, bạn có thể truy cập **KOCITY** để nhận sản phẩm mẫu miễn phí 0đ tận nhà từ các Brand uy tín đã được kiểm duyệt nghiêm ngặt.`
  },
  {
    id: 'post-3',
    title: 'Cách làm video review sản phẩm TikTok thu hút người xem và tăng chuyển đổi',
    slug: 'cach-lam-video-review-san-pham-tiktok',
    metaTitle: 'Cách làm video review sản phẩm TikTok hiệu quả',
    metaDescription: 'Hướng dẫn cách làm video review sản phẩm TikTok từ chọn góc nội dung, viết kịch bản, quay dựng đến theo dõi lượt nhấp và đơn hàng Affiliate.',
    keywords: ['cách làm video review sản phẩm TikTok', 'kịch bản review sản phẩm', 'video TikTok Affiliate', 'cách review sản phẩm', 'tăng chuyển đổi TikTok Shop'],
    coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    tag: 'Kỹ năng quay dựng',
    readTime: '7 phút đọc',
    isCloudCovered: false,
    summary: 'Công thức kịch bản 3 giây vàng giữ chân người xem, cấu trúc video review 3 phần chuẩn chuyển đổi và kinh nghiệm quay dựng bằng điện thoại không cần máy cơ đắt tiền.',
    publishedAt: '24/10/2026',
    content: `## Vì sao video review cần nhiều hơn một lời khen?

Người tiêu dùng hiện nay rất thông minh. Một video chỉ toàn lời khen sáo rỗng hoặc đọc lại thông số kỹ thuật của nhà sản xuất sẽ bị lướt qua trong 1 giây. Người xem cần **trải nghiệm thực tế**, thấy được ưu điểm và cả nhược điểm của sản phẩm trước khi quyết định mở ví.

![Quy trình setup góc quay và ánh sáng review sản phẩm chuyển đổi cao](https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1000&auto=format&fit=crop&q=80)

> 💡 **Bí kíp KOCity:** Không bao giờ mở đầu bằng lời chào rườm rà như "Xin chào các bạn, hôm nay mình lại review...". Hãy bắt đầu bằng vấn đề, tình huống éo le hoặc một kết quả bất ngờ để giữ chân người xem trong 3 giây đầu tiên!

---

### 1. Công thức kịch bản Review 3 phần chuẩn chuyển đổi

#### Phần 1: Hook giữ chân (3 giây đầu)
* *Sai lầm:* "Xin chào các bạn, hôm nay mình sẽ review chiếc tai nghe này..." (Người xem lướt ngay).
* *Cách làm đúng:* Bắt đầu bằng vấn đề nhức nhối hoặc một hình ảnh bất ngờ:
  * "Nếu bạn đang tìm một chiếc tai nghe chống ồn dưới 500k để học bài nơi quán cafe ồn ào, dừng lại 30s xem clip này!"
  * "3 lỗi sai khiến bạn thoa kem chống nắng cả ngày mà da vẫn đen sạm!"

#### Phần 2: Kiểm chứng thực tế (15 - 30 giây tiếp theo)
* Cho người xem thấy cận cảnh chi tiết chất liệu, độ hoàn thiện.
* Thử nghiệm trực quan (Test độ chống nước, test độ che phủ, test độ bền).
* Nêu rõ: Sản phẩm phù hợp với ai và KHÔNG phù hợp với ai. Tính trung thực chính là chìa khóa xây dựng niềm tin lâu dài.

#### Phần 3: Call to Action (5 giây cuối)
* Nhắc nhẹ nhàng người xem bấm vào góc dưới bên trái màn hình (nút giỏ hàng vàng) để kiểm tra ưu đãi flash sale hiện tại từ nhà bán hàng.

---

### 2. Quay dựng chuyên nghiệp chỉ với một chiếc điện thoại

1. **Ánh sáng:** Đặt điện thoại đối diện cửa sổ hoặc dùng một đèn led ring giá rẻ để sản phẩm hiển thị đúng màu sắc thực tế.
2. **Âm thanh:** Dùng micro cài áo không dây để giọng nói ấm rõ, không bị tạp âm tiếng gió hay tiếng xe cộ.
3. **Phụ đề:** Hơn 60% người dùng lướt TikTok khi tắt âm thanh. Luôn bật phụ đề tự động bằng CapCut để giữ chân người xem.`
  },
  {
    id: 'post-4',
    title: 'Cách tìm job KOC có hoa hồng cao và cơ hội hợp tác với thương hiệu',
    slug: 'cach-tim-job-koc',
    metaTitle: 'Tìm job KOC: Cách chọn chiến dịch có quyền lợi tốt',
    metaDescription: 'Tìm hiểu cách tìm job KOC, đánh giá hoa hồng, đọc brief, kiểm tra quyền lợi và chọn chiến dịch hợp tác phù hợp với kênh TikTok của bạn.',
    keywords: ['tìm job KOC', 'job KOC TikTok', 'chiến dịch KOC', 'KOC hợp tác thương hiệu', 'job review sản phẩm', 'hoa hồng KOC'],
    coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    tag: 'Săn Job Hoa Hồng Cao',
    readTime: '6 phút đọc',
    isCloudCovered: true,
    cloudSecretLabel: '💎 BÍ KÍP ĐỘC QUYỀN SĂN JOB HOA HỒNG CAO',
    summary: 'Chiến lược chọn lọc chiến dịch nhận mẫu 0đ, cách đàm phán hoa hồng từ 15% - 25% và 5 dấu hiệu nhận biết bẫy lừa đảo cọc tiền mà KOC mới bắt buộc phải biết.',
    publishedAt: '24/10/2026',
    content: `## Job KOC là gì?

Job KOC là cơ hội hợp tác giữa nhà sáng tạo nội dung và các thương hiệu. Tùy chiến dịch, bạn có thể nhận sản phẩm mẫu miễn phí để trải nghiệm, nhận hoa hồng theo từng đơn hàng bán ra (Affiliate), hoặc nhận thêm phí booking thù lao cố định (Fixed Fee).

![Chiến lược đàm phán hoa hồng và chọn chiến dịch chất lượng](https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1000&auto=format&fit=crop&q=80)

> 💡 **Bí kíp KOCity:** Một sản phẩm uy tín từ thương hiệu lớn với hoa hồng 15% trên giá trị 400.000đ sẽ mang lại cho bạn 60.000đ/đơn. Khi một video lên xu hướng bán được 200 đơn, bạn đã có ngay 12.000.000đ hoa hồng!

---

### 1. Đừng chỉ nhìn vào tỷ lệ phần trăm hoa hồng

Nhiều KOC mới thường bị hấp dẫn bởi những lời mời chào "hoa hồng 40% - 50%". Tuy nhiên, nếu sản phẩm giá 50.000đ nhưng chất lượng tệ và không ai mua, 40% hoa hồng của 0 đơn hàng vẫn là 0 đồng.

Ngược lại, một sản phẩm uy tín từ thương hiệu lớn với hoa hồng 15% trên giá trị 400.000đ sẽ mang lại cho bạn **60.000đ/đơn**. Khi một video lên xu hướng bán được 200 đơn, bạn đã có ngay **12.000.000đ hoa hồng**!

---

### 2. 5 Dấu hiệu nhận biết bẫy lừa đảo KOC mới cần tránh xa

* ❌ **Yêu cầu cọc tiền hoặc thanh toán trước:** Nền tảng KOC uy tín như **KOCITY cam kết 100% không thu bất kỳ khoản cọc hay phí nào** từ Creator. Bất kỳ ai yêu cầu nạp tiền để nhận job đều là lừa đảo.
* ❌ **Thương hiệu mạo danh:** Luôn kiểm tra kỹ đường link trang cá nhân và mã số thuế hoặc văn phòng đại diện của đơn vị tuyển dụng.
* ❌ **Hứa hẹn thu nhập bất thường:** Không có công việc nào chỉ cần ngồi copy-paste link mà kiếm được tiền triệu mỗi ngày. Mọi thu nhập đều đến từ chất lượng nội dung và giá trị mang lại cho người xem.

---

### 3. Bí quyết săn job độc quyền trên KOCITY

1. Hoàn thiện hồ sơ kênh TikTok trên KOCITY với đầy đủ thông tin số người theo dõi, ngành hàng thế mạnh.
2. Ứng tuyển sớm vào các chiến dịch đang mở nhận mẫu 0đ ngay trong 24 giờ đầu tiên.
3. Luôn nộp kịch bản video đúng hạn và gắn mã số Creator định danh trong brief để được Brand ưu tiên duyệt các chiến dịch lớn tiếp theo.`
  },
  {
    id: 'post-5',
    title: 'Cách xây dựng hồ sơ KOC chuyên nghiệp để tăng cơ hội hợp tác với thương hiệu',
    slug: 'cach-xay-dung-ho-so-koc',
    metaTitle: 'Hồ sơ KOC chuyên nghiệp: Cách tạo và tối ưu',
    metaDescription: 'Hướng dẫn xây dựng hồ sơ KOC với thông tin kênh, tệp khán giả, số liệu, video tiêu biểu và thế mạnh nội dung để tăng cơ hội ứng tuyển chiến dịch.',
    keywords: ['hồ sơ KOC', 'cách trở thành KOC chuyên nghiệp', 'media kit KOC', 'hồ sơ KOC TikTok', 'KOC hợp tác thương hiệu'],
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    tag: 'Xây dựng Media Kit VIP',
    readTime: '8 phút đọc',
    isCloudCovered: true,
    cloudSecretLabel: '🔒 BÍ MẬT XÂY DỰNG MEDIA KIT CHUYÊN NGHIỆP',
    summary: 'Hướng dẫn chuẩn hóa Media Kit cá nhân, cách chọn video tiêu biểu để ghi điểm với nhãn hàng và khẳng định năng lực kể cả khi kênh chỉ mới có 1.000 Follower.',
    publishedAt: '24/10/2026',
    content: `## Hồ sơ KOC (Media Kit) là gì?

Hồ sơ KOC là bản danh thiếp chuyên nghiệp giới thiệu năng lực của bạn với Brand. Một hồ sơ chuẩn chỉnh giúp bên tuyển dụng thấy ngay: bạn là ai, phong cách video của bạn ra sao, tệp khán giả của bạn có đúng đối tượng khách hàng mục tiêu của họ hay không.

![Mẫu Media Kit chuyên nghiệp chinh phục các nhãn hàng hàng đầu](https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1000&auto=format&fit=crop&q=80)

> 💡 **Bí kíp KOCity:** Khi tham gia KOCITY, bạn được hệ thống cấp sẵn một **Trang Media Kit công khai** độc quyền mang tên bạn, có mã QR và liên kết đẹp mắt để gửi thẳng cho nhãn hàng chỉ bằng một cú chạm!

---

### 1. 5 Thành phần bắt buộc phải có trong một Hồ sơ KOC chuẩn

1. **Thông tin định danh:** Tên thật, Nickname kênh, đường link kênh chính thức, email và số Zalo liên hệ công việc.
2. **Ngành hàng định vị:** Nêu rõ 1 - 2 lĩnh vực trọng tâm (Ví dụ: *Chuyên Skincare cho da dầu mụn* hoặc *Review đồ gia dụng cho sinh viên*).
3. **Số liệu tương tác thực tế:** Lượt xem trung bình mỗi video, tỷ lệ nam/nữ của người theo dõi, độ tuổi chủ đạo.
4. **Top 3 video tâm đắc nhất:** Chọn 3 video có lượt xem cao, chất lượng hình ảnh đẹp và khả năng truyền cảm hứng tốt nhất kèm liên kết trực tiếp.
5. **Đánh giá từ các Brand đã hợp tác:** Bằng chứng về số đơn hàng đã tạo ra hoặc phản hồi tích cực từ nhãn hàng đối tác trước đó.

---

### 2. Sử dụng tính năng Public Media Kit tự động của KOCITY

Thay vì phải mất công thiết kế file PDF hay PowerPoint phức tạp, khi tham gia **KOCITY**, bạn được hệ thống cấp sẵn một **Trang Media Kit công khai** độc quyền mang tên bạn, có mã QR và liên kết đẹp mắt để gửi thẳng cho nhãn hàng chỉ bằng một cú chạm!`
  }
];

import { saveBlogPostsToSupabase } from '../services/supabaseService';

const STORAGE_KEY = 'kocity_blog_posts_v2';

export const getStoredBlogPosts = (): BlogPost[] => {
  if (typeof window === 'undefined') return INITIAL_BLOG_POSTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('kocity_blog_posts_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 5) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading blog posts from storage:', e);
  }
  // Mặc định luôn có đủ 5 bài viết chuẩn SEO
  return INITIAL_BLOG_POSTS;
};

export const saveStoredBlogPosts = async (posts: BlogPost[]): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  // 1. Luôn lưu trực tiếp lên Supabase Cloud để bảo toàn dữ liệu vĩnh viễn trên mọi thiết bị
  let cloudSuccess = false;
  try {
    cloudSuccess = await saveBlogPostsToSupabase(posts);
  } catch (err) {
    console.warn('Lỗi đồng bộ Blog lên Cloud:', err);
  }

  // 2. Lưu vào bộ nhớ cục bộ localStorage (chỉ lưu 1 key v2 để tránh tràn quota)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    console.warn('Dung lượng localStorage vượt giới hạn, tiến hành dọn dẹp cache cũ:', e);
    try {
      localStorage.removeItem('kocity_blog_posts_v1');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e2) {
      console.warn('Không thể lưu vào localStorage (dữ liệu vẫn an toàn trên Cloud):', e2);
    }
  }

  window.dispatchEvent(new Event('kocity-blog-updated'));
  return cloudSuccess;
};
