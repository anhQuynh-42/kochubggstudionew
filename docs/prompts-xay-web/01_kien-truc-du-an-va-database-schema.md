# PROMPT 01: KHỞI TẠO KIẾN TRÚC DỰ ÁN, TYPESCRIPT INTERFACES, DỮ LIỆU MẪU (MOCK DATA) & SUPABASE SCHEMA

* **Giai đoạn:** 1. Ý tưởng / Cấu trúc & Cơ sở dữ liệu
* **Thứ tự chạy:** 01 (Chạy đầu tiên trong chuỗi `01 -> 02 -> 03 -> 04 -> 05 -> 07`)
* **Phụ thuộc:** Không có

---

## 1. Mục đích
Khởi tạo toàn bộ khung dự án React 19 + TypeScript + Vite 6 + Tailwind CSS v4 cho nền tảng **KOCity**, bao gồm:
1. Cấu hình `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`.
2. Định nghĩa hệ thống kiểu dữ liệu trung tâm (`src/types.ts`) gồm Chiến dịch (`Campaign`), Đơn ứng tuyển (`KOCApplication`), Tài khoản KOC (`KOCUser`), Thông báo (`AppNotification`) và Máy trạng thái ứng tuyển 3 lớp (`SelectionStatus`, `SampleStage`, `VideoStage`).
3. Xây dựng các tiện ích nền tảng (`src/lib/constants.ts`, `src/lib/applicationStatus.ts`, `src/lib/campaignDisplay.ts`, `src/lib/clipboard.ts`, `src/lib/liveActivity.ts`, `src/lib/notifications.ts`, `src/lib/sanitizeHtml.ts`).
4. Xây dựng kho dữ liệu mẫu phong phú (`src/data/mockData.ts` và `src/data/blogData.ts`) cùng cấu hình kết nối Supabase an toàn (`src/lib/supabase.ts`) sao cho **khi không có file `.env` hoặc không có API key, toàn bộ website vẫn tự động chạy 100% tính năng bằng Mock Data + LocalStorage**.
5. Tạo file kịch bản SQL (`supabase/schema.sql`) định nghĩa bảng `campaigns`, `applications`, Realtime và Row Level Security (RLS).

---

## 2. Input cần có
* Một thư mục dự án trống trên máy tính (có cài sẵn Node.js `>= 18.x`).
* Các biến cấu hình mẫu trong Prompt:
  * `{{project_name}}`: `"kocity"`
  * `{{brand_hotline}}`: `"0900 000 000"`
  * `{{brand_email}}`: `"contact@example.com"`
  * `{{zalo_group_url}}`: `"https://zalo.me/g/sample_group_id"`

---

## 3. Prompt hoàn chỉnh (Copy toàn bộ nội dung trong khung dưới đây gửi cho AI Agent)

```markdown
Bạn là một Senior Full-stack Engineer chuyên về React 19, TypeScript, Vite 6 và Tailwind CSS v4.
Hãy khởi tạo nền tảng web "{{project_name}}" (KOCity) — nền tảng B2B2C kết nối Nhãn hàng (Brands/SMEs) với cộng đồng Nano KOC (từ 1.000 followers) và Micro KOC (từ 5.000 followers) trên TikTok để nhận sản phẩm mẫu miễn phí 0đ (Freecast) và làm video review nhận hoa hồng Affiliate.

Giá trị tham số đầu vào:
- {{project_name}} = "kocity"
- {{brand_hotline}} = "0900 000 000"
- {{brand_email}} = "contact@example.com"
- {{zalo_group_url}} = "https://zalo.me/g/sample_group_id"

Hãy tạo chính xác các file sau với đầy đủ mã nguồn hoàn chỉnh (không viết tắt, không bỏ trống TODO):

### 1. Cấu hình gốc dự án (`package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`)
- `package.json`:
  - `dependencies`: `react` (^19.0.1), `react-dom` (^19.0.1), `react-router-dom` (^7.18.4), `@supabase/supabase-js` (^2.117.2), `@tailwindcss/vite` (^4.1.14), `@vitejs/plugin-react` (^5.0.4), `html-to-image` (^1.11.13), `lucide-react` (^0.546.0), `motion` (^12.23.24), `@google/genai` (^2.4.0).
  - `devDependencies`: `typescript` (~5.8.2), `vite` (^6.2.3), `tailwindcss` (^4.1.14), `@types/react`, `@types/react-dom`, `@types/node`.
  - `scripts`: `"dev": "vite --port=3000 --host=0.0.0.0"`, `"build": "vite build"`, `"preview": "vite preview"`, `"lint": "tsc --noEmit"`, `"check:sync": "node scripts/verify-cloud-sync.js"`.
- `vite.config.ts`: Cấu hình plugin `react()` và `tailwindcss()` từ `@tailwindcss/vite`, alias `'@'` trỏ về thư mục gốc, và chia `manualChunks` cho `vendor-react`, `vendor-supabase`, `vendor-html-to-image`.
- `index.html`:
  - Tiêu đề: `"KOCity — Nhận mẫu 0đ & Hoa hồng TikTok Affiliate cho Nano/Micro KOC"`.
  - Nhúng Google Fonts: `Inter` (400, 500, 600, 700, 800) và `Plus Jakarta Sans` (600, 700, 800).
  - Nhúng icon font: `Material Symbols Outlined` (`https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200`).
  - Thẻ `<div id="root"></div>` và `<script type="module" src="/src/main.tsx"></script>`.

### 2. Hệ thống TypeScript Interfaces (`src/types.ts`)
Định nghĩa đầy đủ các kiểu dữ liệu sau:
- `Benefit`: `{ label: string; icon: string; type: 'sample' | 'commission' | 'budget' | 'other' }`
- `StoryStep`: `{ step: string; title: string; desc: string }`
- `TimelineStep`: `{ stepNum: string; status: string; date: string; title: string; desc: string }`
- `SampleProduct`: `{ id?: string; code: string; name: string; image?: string; category?: string; commission?: string; shortDesc?: string; detailDesc?: string; reviewTips?: string; tags?: string; affiliateLink?: string; disabled?: boolean }`
- `Campaign`: `{ id: string; code: string; title: string; brandName: string; brandLogo: string; category: string; daysLeft: number; startDate?: string; endDate?: string; platform: string; followerRequirement: string; benefits: Benefit[]; totalSpots: number; registeredSpots: number; urgent?: boolean; approvalRate?: string; description: string; fullPrice?: string; bookingFee?: string; commissionRate?: string; productHeroImage: string; galleryImages: string[]; uspList?: Array<{ title: string; desc: string; icon: string }>; storySteps?: StoryStep[]; hashtags?: string[]; cartBrandName: string; tiktokUrl?: string; tiktokHandle?: string; timeline: TimelineStep[]; sampleProducts?: SampleProduct[]; registrationFormUrl?: string; zaloGroupUrl?: string; minVideos?: number; videoDeadline?: string; contentRequirement?: string; approvalCondition?: string }`
- `ApplicationStatus`: `'Chờ duyệt' | 'Đã duyệt gửi mẫu' | 'Đang giao' | 'Chờ duyệt video' | 'Đã hoàn thành' | 'Bị từ chối' | 'Đã lên bài' | 'Từ chối'`
- `KOCApplication`: `{ id: string; kocId?: string; code: string; kocName: string; avatar: string; phone: string; email: string; tiktokHandle: string; channelLink?: string; followers: string; followersCount: number; avgViews: string; monthlyOrders?: string; monthlyAvgGmv?: string; address: string; shippingCode: string; shippingStatus: 'Đã phát thành công' | 'Đang trung chuyển' | 'Chờ duyệt để sinh mã' | 'Không gửi mẫu'; createdAtTime: string; createdAtDate: string; status: ApplicationStatus; videoLink?: string; videoViews?: string; audience: string; contentConcept: string; campaignId: string; campaignName: string; verified?: boolean; adminFeedback?: string; videoSubmittedAt?: string; selectedSampleCode?: string; selectedSampleName?: string; selectedSampleImage?: string }`
- `AppNotification`: `{ id: string; title: string; message: string; time: string; read: boolean; type: 'campaign' | 'delivery' | 'payout' | 'approval' | 'announcement'; targetRole?: 'koc' | 'admin' | 'all'; targetKocId?: string; targetTiktokHandle?: string; targetPhone?: string; targetEmail?: string; linkTab?: 'admin' | 'marketplace' | 'my-campaigns' | 'profile'; adminSubTab?: 'applications' | 'campaigns' | 'content' | 'koc-crm' | 'dashboard' }`
- `KOCUser`: `{ id: string; name: string; role?: 'koc' | 'admin'; avatar: string; tiktokHandle: string; followers: string; phone: string; email?: string; passwordHash?: string; verified: boolean; bio?: string; categories?: string[]; avgViews?: string; engagementRate?: string; gmv?: string; monthlyOrders?: string; monthlyAvgGmv?: string; isBlacklisted?: boolean; blacklistReason?: string; channelLink?: string; instagramHandle?: string; youtubeHandle?: string; city?: string; district?: string; address?: string; shippingNote?: string; targetAudience?: string; targetAudienceImage?: string; contentStyle?: string[]; acceptFreecast?: boolean; minBookingRate?: string; allowSparkAds?: boolean; portfolioDriveLink?: string; portfolioFile?: { name: string; size: string; dataUrl?: string; type?: string; uploadedAt?: string }; highlightVideos?: string[]; workPhone?: string; workEmail?: string; sampleDeliveredCount?: number; completedVideosCount?: number; completedCampaignsCount?: number }`
- Máy trạng thái 3 lớp:
  - `SelectionStatus = 'pending' | 'selected' | 'not_selected'`
  - `SampleStage = 'none' | 'waiting' | 'approved' | 'in_transit' | 'delivered'`
  - `VideoStage = 'not_posted' | 'pending_review' | 'needs_revision' | 'posted'`
  - `ApplicationProgress = { selection: SelectionStatus; sample: SampleStage; video: VideoStage; timelineStep: 0 | 1 | 2 | 3 }`
- `LiveActivityItem = { id: string; displayName: string; city: string; brandName: string; action: 'applied' | 'selected' | 'posted'; dateLabel: string }`

### 3. Các thư viện tiện ích trong `src/lib/`
1. `src/lib/constants.ts`:
   - `ZALO_GROUP_URL = '{{zalo_group_url}}'`
   - `SOCIAL_LINKS`: TikTok (`@kocityvn`), Facebook (`Cộng đồng KOCITY`), Threads (`@kocity_booking`).
   - `BRAND_CONTACT`: `{ hotline: '{{brand_hotline}}', hotlineHref: 'tel:0900000000', email: '{{brand_email}}' }`.
   - `ROUTES`:
     ```ts
     export const ROUTES = {
       home: '/',
       campaign: (id: string) => `/c/${encodeURIComponent(id)}`,
       process: '/quy-trinh',
       progress: '/tien-do',
       myApplications: '/don-cua-toi',
       notifications: '/thong-bao',
       profile: '/ho-so',
       admin: '/admin',
     } as const;
     ```
2. `src/lib/applicationStatus.ts`:
   - Hàm `getSelectionStatus(app)`: `'Chờ duyệt'` -> `'pending'`; `'Từ chối'` -> `'not_selected'`; còn lại -> `'selected'`.
   - Hàm `getApplicationProgress(app)` trả về `{ selection, sample, video, timelineStep }` cùng các bảng nhãn tiếng Việt `SELECTION_LABELS`, `SAMPLE_LABELS`, `VIDEO_LABELS`.
3. `src/lib/campaignDisplay.ts`:
   - `hasFreeSample(campaign)`: kiểm tra chiến dịch có gửi mẫu 0đ (Freecast) không.
   - `getCommissionLabel(campaign)`: trích xuất tỷ lệ hoa hồng (VD: `10%`, `12%`).
   - `getScarcity(campaign)`: tính `{ totalSpots, registeredSpots, spotsLeft, percent, isFull, isAlmostFull }` (dùng `Math.max` để khi Admin chỉnh `registeredSpots >= totalSpots` thì hiển thị đúng `isFull = true`).
   - `formatFollowerRequirement(req)`: định dạng ngắn gọn yêu cầu follower.
4. `src/lib/clipboard.ts`: Hàm `copyTextToClipboard(text: string): Promise<boolean>` dùng `navigator.clipboard.writeText` kèm fallback `textarea`.
5. `src/lib/liveActivity.ts`: Hàm `buildLiveActivity(applications, campaigns)` tạo danh sách hoạt động thời gian thực cho thanh Live Ticker (ẩn danh tên KOC và không lộ SĐT/địa chỉ).
6. `src/lib/notifications.ts`: Hàm `getVisibleNotifications(notifications, currentUser, isAdmin)` lọc thông báo đúng đối tượng (Admin xem thông báo `targetRole === 'admin'`, KOC chỉ xem thông báo cá nhân khớp `tiktokHandle`/`phone`/`kocId` hoặc thông báo chung `targetRole === 'all'`).
7. `src/lib/sanitizeHtml.ts`: Hàm `sanitizeHtml(dirtyHtml: string): string` làm sạch mã HTML trong trình soạn thảo bài viết (loại bỏ `<script>`, `<iframe>`, thuộc tính `on*`, `javascript:`), giữ lại các thẻ định dạng văn bản, bảng, hình ảnh và khối callout.
8. `src/lib/supabase.ts`:
   - **YÊU CẦU QUAN TRỌNG VỀ CHẾ ĐỘ KHÔNG CẦN KEY (OFFLINE / MOCK DATA MODE):**
     Đọc `import.meta.env.VITE_SUPABASE_URL` và `import.meta.env.VITE_SUPABASE_ANON_KEY`. Nếu người chạy KHÔNG cấu hình biến môi trường (hoặc để trống / giá trị mẫu `https://your-project.supabase.co` / `https://placeholder.supabase.co`), hàm `isSupabaseConfigured()` PHẢI trả về `false`, và client `supabase` khởi tạo an toàn với `'https://placeholder.supabase.co'` và `'placeholder-key'` để ứng dụng không bao giờ bị lỗi khởi tạo và tự động vận hành 100% bằng dữ liệu mẫu (`mockData.ts`, `blogData.ts`) + `localStorage`.

### 4. Kho dữ liệu mẫu khởi tạo (`src/data/mockData.ts` & `src/data/blogData.ts`)
1. `src/data/mockData.ts`:
   - Khai báo `APP_LOGOS` và mảng `INITIAL_CAMPAIGNS` gồm tối thiểu 6 chiến dịch thực tế thuộc các ngành hàng:
     1. **Cỏ Mềm** (`id: 'co-mem-sample-20-10'`, ngành `Mỹ phẩm`, hoa hồng `8%`, Freecast Mẫu 0đ, yêu cầu `>= 1.000`, kèm danh sách `sampleProducts` có mã `CM01`, `CM02`, `CM03`, `CM04` và `storySteps`).
     2. **Bielenda** (`id: 'bielenda-sample-thang-10'`, ngành `Mỹ phẩm`, hoa hồng `11%`, Freecast, các mã mẫu `BL01`, `BL10`).
     3. **REDUBEAUTY x LYSMILEGO** (`id: 'lysmilego-sample-thang-10'`, ngành `Chăm sóc cá nhân`, hoa hồng `12%`, các mã mẫu `LY01`, `LY02`, `LY03`).
     4. **TRANYOO Vietnam** (`id: 'tranyoo-tech-lifestyle'`, ngành `công nghệ`, hoa hồng `9%`, các mã mẫu `M01`, `M02`).
     5. **GOOJODOQ Vietnam** (`id: 'gojodoq-tech-lifestyle'`, ngành `công nghệ`, hoa hồng `9%`, quạt cầm tay mini & phụ kiện).
     6. **VISECRET BRA** (`id: 'visecret-bra-fashion'`, ngành `Thời trang`, hoa hồng `10%`, áo bra không gọng).
   - Khai báo `INITIAL_APPLICATIONS` (5-8 đơn ứng tuyển mẫu với SĐT mẫu dạng `0900000001`, `0900000002` ở các trạng thái `'Chờ duyệt'`, `'Đã duyệt gửi mẫu'`, `'Đang giao'`, `'Đã lên bài'`) và `INITIAL_NOTIFICATIONS`.
2. `src/data/blogData.ts`:
   - Định nghĩa interface `BlogPost`: `{ id: string; slug: string; title: string; metaTitle: string; metaDescription: string; keywords: string[]; tag: string; readTime: string; publishedAt: string; coverImage: string; excerpt: string; content: string; isCloudCovered?: boolean; cloudTeaserText?: string; updatedAt?: number }`.
   - Khai báo `INITIAL_BLOG_POSTS` gồm 5 bài viết Cẩm nang KOC chuẩn SEO (có bảng so sánh, hộp `> 💡 **Bí kíp KOCity:** ...`, kịch bản 3 phần Hook – Proof – CTA). Trong đó **bài số 4 và bài số 5** có `isCloudCovered: true` (hiệu ứng mây mù che phủ bài viết VIP, yêu cầu KOC đăng nhập rồi bấm nút xua tan mây để đọc).
   - Cung cấp các hàm `getStoredBlogPosts()`, `saveStoredBlogPosts(posts)` và `mergeBlogPosts(cloudPosts, localPosts)` (hợp nhất 2 chiều không bao giờ làm mất bài viết mới tạo kèm két dự phòng `kocity_blog_admin_vault_v1`).

### 5. Kịch bản SQL khởi tạo Supabase (`supabase/schema.sql`)
Viết script PostgreSQL tạo 2 bảng `public.campaigns` và `public.applications` (đầy đủ các cột khớp với `Campaign` và `KOCApplication`), bật `supabase_realtime` cho cả 2 bảng và cấu hình Row Level Security (RLS) policies.
```

---

## 4. Output mong đợi
Sau khi AI Agent thực thi Prompt 01, các file sau được tạo đầy đủ:
* `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
* `src/types.ts`
* `src/lib/constants.ts`, `src/lib/applicationStatus.ts`, `src/lib/campaignDisplay.ts`, `src/lib/clipboard.ts`, `src/lib/liveActivity.ts`, `src/lib/notifications.ts`, `src/lib/sanitizeHtml.ts`, `src/lib/supabase.ts`
* `src/data/mockData.ts`, `src/data/blogData.ts`
* `supabase/schema.sql`

---

## 5. Cách kiểm tra đã chạy đúng
1. Kiểm tra file `src/lib/supabase.ts`: Khi chưa tạo file `.env`, hàm `isSupabaseConfigured()` trả về `false` và không quăng lỗi `supabaseUrl is required`.
2. Kiểm tra `src/data/mockData.ts` và `src/data/blogData.ts`: Có đủ 6 chiến dịch mẫu (mỗi chiến dịch có mảng `sampleProducts` và `storySteps`) và 5 bài viết cẩm nang SEO (2 bài cuối có `isCloudCovered: true`).
3. Kiểm tra `src/types.ts`: Có đủ định nghĩa cho 3 lớp trạng thái (`SelectionStatus`, `SampleStage`, `VideoStage`).
