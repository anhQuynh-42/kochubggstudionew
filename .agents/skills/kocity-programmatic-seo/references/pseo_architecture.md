# KOCity Programmatic SEO Architectural Patterns

## 1. Dynamic Routing & File Structure (React / Vite / Next.js)

```text
src/
├── pages/
│   ├── sample-campaigns/
│   │   ├── [brandSlug].tsx        # e.g. /mau-thu/co-mem
│   │   └── components/
│   │       ├── CampaignHero.tsx    # H1, Subhead, 0đ Offer Badge
│   │       ├── ProductGrid.tsx     # Danh sách sản phẩm mẫu kèm link affiliate
│   │       ├── KocRosterTable.tsx  # Danh sách KOC đã nhận mẫu (dữ liệu động)
│   │       └── BrandFaqAccordion.tsx # Schema FAQ động
│   └── creators/
│       ├── [tiktokHandle].tsx     # e.g. /creator/embes.bii
│       └── components/
│           ├── CreatorProfileCard.tsx
│           ├── PerformanceStats.tsx
│           └── SampleReviewShowcase.tsx
```

---

## 2. Dynamic Title & Meta Formulas

| Archetype | Title Formula (Max 60 chars) | Meta Description (Max 155 chars) |
| :--- | :--- | :--- |
| **Chiến dịch nhận mẫu** | `Mẫu Thử {Brand} 0đ Cho KOC TikTok \| KOCity` | `Đăng ký nhận mẫu sản phẩm {Brand} miễn phí 100% không cọc cho KOC TikTok. Hỗ trợ hoa hồng affiliate cao, giao tận nhà trong 48h tại KOCity.` |
| **Media Kit KOC** | `{KOC Name} (@{TikTokID}) - KOC Review {Niche} \| KOCity` | `Xem thông tin kênh, số liệu tương tác và các chiến dịch review tiêu biểu của KOC @{TikTokID}. Kết nối gửi mẫu thử 0đ & booking trực tiếp.` |
| **Hub Ngành hàng** | `Top KOC {Niche} TikTok Nhận Mẫu Thử & Booking \| KOCity` | `Khám phá danh sách Nano & Micro KOC ngành {Niche} uy tín trên TikTok. Tỷ lệ ra đơn cao, hợp tác chiến dịch sampling 0đ qua KOCity.` |

