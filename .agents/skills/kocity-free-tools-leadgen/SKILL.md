---
name: kocity-free-tools-leadgen
description: >-
  Use this skill when ideating, building, evaluating, or optimizing free web utilities (Engineering as Marketing)
  and psychological conversion triggers for KOCity. Covers TikTok commission calculators, KOC booking rate estimators,
  one-click Media Kit generators, and behavioral psychology models (scarcity, loss aversion, social proof).
  Also activate when the user mentions "công cụ miễn phí", "free tools", "tính hoa hồng tiktok",
  "định giá kênh koc", "lead generation", "kéo koc", "marketing psychology", "fomo", or "viral tool".
metadata:
  version: 1.0.0
---

# KOCity Free Tools Lead Generation & Behavioral Psychology Skill

You are the Lead Growth Engineer and Behavioral Marketing Specialist for **KOCity**. Your mission is to leverage "Engineering as Marketing" by creating free, interactive client-side tools that attract massive creator traffic, solve immediate pain points, and ethically convert visitors into active KOCs in KOCity's sampling and affiliate programs.

**Read central context first:** Check `.agents/kocity-context.md` before building tools.

---

## 1. The Strategy: Engineering as Marketing
Instead of paying for expensive Facebook/TikTok ads to acquire KOCs, KOCity provides high-utility **Free Web Tools** directly in the browser.
- **Instant Gratification:** 100% interactive without requiring an account or email upfront.
- **Value First, Gate Second:** Let users get their primary result immediately. Offer an advanced upgrade (Export PDF Media Kit, Lưu báo cáo, Đăng ký nhận mẫu 0đ tài trợ) in exchange for their TikTok ID or Zalo.
- **Adjacent to Core Product:** Every tool must naturally guide the user to the core call-to-action: *"Bắt đầu nhận sản phẩm mẫu 0đ từ nhãn hàng uy tín tại KOCity"*.

---

## 2. Top 3 Free Tools Blueprint for KOCity

### 🧮 Tool 1: TikTok Shop Affiliate Earnings Calculator (Bảng Tính Hoa Hồng TikTok)
* **User Problem:** KOCs do not know how much money they can earn with 1 video or 1,000 views on TikTok Shop.
* **Inputs:**
  * Giá bán sản phẩm trung bình (VNĐ).
  * Tỷ lệ hoa hồng (%): Mặc định gợi ý theo ngành (e.g. Mỹ phẩm: 15-20%, Thời trang: 12-18%).
  * Số lượt xem dự kiến hoặc Số đơn hàng ước tính/tháng.
* **Outputs:**
  * Doanh số dự kiến (GMV).
  * Tiền hoa hồng thực nhận về tài khoản.
  * **The Conversion Bridge:** *"Sản phẩm bạn đang tính hiện đang có mẫu thử 0đ tại KOCity! [Bấm nhận mẫu ngay không cọc]"*.

### 🏷️ Tool 2: KOC Rate Card & Booking Estimator (Trình Định Giá Video Booking)
* **User Problem:** Nano & Micro KOCs (1k - 50k followers) thường lúng túng khi nhãn hàng hỏi báo giá, dẫn đến việc báo giá quá thấp hoặc quá cao làm mất cơ hội.
* **Inputs:**
  * Số người theo dõi (Followers).
  * Lượt xem trung bình mỗi clip gần đây (Avg Views).
  * Lĩnh vực sáng tạo nội dung (Mỹ phẩm, Đời sống, Ẩm thực...).
* **Outputs:**
  * Khoảng giá đề xuất cho 1 video review TikTok (e.g. 500.000đ - 1.200.000đ).
  * Mức giá cho gói 3 video hoặc Live stream kèm link Affiliate.
  * **The Conversion Bridge:** *"Nhãn hàng trên KOCity đang tìm kiếm KOC trong tầm giá này! [Tạo hồ sơ nhận mẫu 0đ]"*.

### 📇 Tool 3: 1-Click KOC Public Media Kit Generator
* **User Problem:** KOC lười làm CV hoặc không biết dùng Canva để thiết kế Media Kit gửi nhãn hàng.
* **Inputs:** ID TikTok + 3 điểm mạnh nhất của kênh.
* **Outputs:** Một trang thẻ hồ sơ profile đẹp lung linh (Glassmorphism, chuẩn nhận diện KOCity tím `#7c3aed`), có nút "Tải ảnh thẻ" hoặc chia sẻ đường link `kocity.io.vn/creator/@username`.

---

## 3. Marketing Psychology & Behavioral Triggers

When designing pages and components in KOCity, systematically apply these 5 psychological triggers:

### 1. Scarcity & Urgency (Sự khan hiếm)
- People desire what is limited.
- **Application:** Display real remaining sample quotas: *"Chỉ còn 8 suất mẫu Cỏ Mềm cuối cùng hôm nay"*. Dùng màu cảnh báo Amber (`#f59e0b`).

### 2. Social Proof (Bằng chứng xã hội)
- People look to others when making decisions.
- **Application:** Dynamic roster counter: *"39/68 KOC đã xác nhận nhận mẫu"*, avatar stack của các KOC đã đăng bài.

### 3. Loss Aversion (Nỗi sợ mất mát)
- The pain of losing is twice as powerful as the pleasure of gaining.
- **Application:** *"Đừng bỏ lỡ đợt cấp mẫu miễn phí 250.000đ — Suất chưa claim sẽ được chuyển cho KOC khác sau 24h"*.

### 4. Reciprocity (Nguyên lý đáp ứng qua lại)
- When you give someone genuine value upfront, they naturally want to reciprocate.
- **Application:** Cung cấp công cụ tính hoa hồng và định giá kênh miễn phí 100% ➔ KOC sẵn sàng gửi thông tin kênh để hợp tác.

### 5. Curiosity Gap (Khoảng cách tò mò)
- An information gap creates psychological tension that must be resolved.
- **Application:** KOCity's signature **Curiosity Cloud Teaser** (`💎 BÍ KÍP ĐỘC QUYỀN`) — che một phần nội dung và mở mây khi KOC bấm khám phá.

---

## 4. Engineering & UX Guardrails
- [ ] Zero Lag: All calculators must calculate instantly via React state (`useMemo` / inline handlers), with zero backend latency.
- [ ] Mobile-First: Sliders and input counters must have comfortable touch targets ($\ge 44 \times 44\text{px}$) on mobile screens.
- [ ] Shareability: Include 1-click "Copy kết quả" or "Chia sẻ lên Zalo/Facebook" to spark organic virality.
- [ ] Brand Alignment: Always use KOCity brand tokens (`#7c3aed`, `backdrop-blur-md`, `rounded-2xl`).

