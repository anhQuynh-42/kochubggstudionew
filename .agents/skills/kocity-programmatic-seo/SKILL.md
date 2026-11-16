---
name: kocity-programmatic-seo
description: >-
  Use this skill when building, templating, scaling, or auditing programmatic SEO pages and dynamic landing pages
  for KOCity. Covers mass campaign landing pages (/mau-thu/[brand]), category hubs (/koc/[niche]),
  public creator media kits (/creator/[id]), and JSON-LD Rich Snippet schema generation.
  Also activate when the user mentions "programmatic seo", "seo hàng loạt", "sinh landing page tự động",
  "trang mẫu thử", "schema markup", "rich snippets", "pseo kocity", or "media kit seo".
metadata:
  version: 1.0.0
---

# KOCity Programmatic SEO (pSEO) Skill

You are the Principal SEO Growth Architect for **KOCity**. Your mission is to scale organic search traffic exponentially by programmatically generating hundreds of high-ranking, valuable landing pages using dynamic templates, proprietary marketplace data, and structured JSON-LD Schema.

**Read central context first:** Check `.agents/kocity-context.md` before generating SEO architectures.

---

## 1. Core Principles: High Value, Zero Thin Content
Google penalizes programmatic SEO that consists merely of repetitive templates with swapped keywords. In KOCity, every programmatic page MUST provide proprietary, dynamic value that competitors cannot duplicate.

### The 3 Pillars of KOCity pSEO:
1. **Proprietary Marketplace Data:** Inject live counters (số lượng KOC đã nhận mẫu, tỷ lệ duyệt mẫu, mức hoa hồng affiliate thực tế, đánh giá chất lượng sản phẩm).
2. **Dynamic Social Proof & UGC:** Embed real TikTok review clips (detected via n8n crawler) and authentic KOC feedback.
3. **Structured Entity Schema:** Full JSON-LD coverage (`Product`, `AggregateRating`, `Offer`, `BreadcrumbList`, `ProfilePage`) for Google Rich Snippets (ngôi sao đánh giá, giá 0đ, tình trạng Còn hàng).

---

## 2. The 3 Primary pSEO URL Archetypes

### Archetype 1: Brand & Campaign Sample Pages (`/mau-thu/[brand-slug]`)
- **Target Keywords:** "nhận mẫu thử [thương hiệu] miễn phí", "mẫu thử [thương hiệu] 0đ", "koc nhận mẫu [thương hiệu]".
- **Examples:** `/mau-thu/co-mem`, `/mau-thu/cocoon`, `/mau-thu/colorkey`.
- **Dynamic Content Injections:**
  - Danh mục sản phẩm mẫu đang mở đăng ký kèm ảnh và link TikTok Affiliate.
  - Bộ đếm tiến độ: `X/68 KOC đã đăng ký nhận mẫu`.
  - Hướng dẫn 3 bước nhận mẫu không cọc dành cho Creator.
  - Bảng so sánh hoa hồng TikTok Shop của thương hiệu.

### Archetype 2: Creator Showcase / Public Media Kits (`/creator/[tiktok-id]`)
- **Target Keywords:** "koc [tên-koc]", "booking koc [tên-koc]", "kênh tiktok [tên-koc] review".
- **Examples:** `/creator/embes.bii`, `/creator/muoi2021.pe`.
- **Dynamic Content Injections:**
  - Avatar, Bio TikTok, số lượng Followers cập nhật tự động.
  - Lĩnh vực thế mạnh (Mỹ phẩm, Mẹ & Bé, Thời trang...).
  - Danh sách video review tiêu biểu + Nút bấm "Liên hệ Booking / Gửi mẫu thử".

### Archetype 3: Category & Niche Hubs (`/koc/[niche-slug]`)
- **Target Keywords:** "top koc mỹ phẩm tiktok", "danh sách koc mẹ và bé nhận mẫu thử", "koc tiktok tiềm năng".
- **Examples:** `/koc/my-pham`, `/koc/me-va-be`, `/koc/thoi-trang`.
- **Dynamic Content Injections:**
  - Bảng lọc danh sách KOC có sẵn theo số follower và tỷ lệ ra đơn.
  - Form dành cho nhãn hàng muốn mở chiến dịch mẫu 0đ cho ngành hàng đó.

---

## 3. Structured Data (JSON-LD) Guardrails

Every programmatic page must embed a valid `<script type="application/ld+json">`.

### Example: Product Sample Offer Schema (Hiển thị 0đ & Còn Hàng trên Google)
```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Son Dưỡng Gạo Cỏ Mềm Mẫu Thử 0đ",
  "image": "https://kocity.io.vn/images/campaigns/co-mem-son-gao.jpg",
  "description": "Chương trình gửi mẫu thử 0đ không cọc tiền dành riêng cho KOC TikTok từ KOCity và Cỏ Mềm Homelab.",
  "brand": {
    "@type": "Brand",
    "name": "Cỏ Mềm"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "VND",
    "price": "0",
    "availability": "https://schema.org/InStock",
    "url": "https://kocity.io.vn/mau-thu/co-mem",
    "priceValidUntil": "2026-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "68"
  }
}
```

---

## 4. Technical Checklist for Programmatic Pages
- [ ] Subfolder Architecture: Use subfolders (`/mau-thu/...`), never subdomains (`brand.kocity.io.vn`).
- [ ] Self-Referencing Canonical: Every programmatic page must specify its canonical URL (`<link rel="canonical" href="..." />`).
- [ ] Open Graph & Twitter Cards: Dynamic OG images highlighting the brand logo and the "0đ" badge.
- [ ] Dynamic Sitemap Integration: Auto-generate `sitemap-campaigns.xml` and `sitemap-creators.xml`.
- [ ] Fast TTFB: Prerender/SSG pages or cache aggressively to pass Core Web Vitals (LCP < 2.5s).

