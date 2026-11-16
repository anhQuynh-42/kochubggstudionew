# KOCity Free Tools Technical Formulas

## 1. TikTok Affiliate Calculator Formulas

```typescript
interface AffiliateEstimateInput {
  avgViewsPerMonth: number;
  clickThroughRate: number; // e.g. 0.02 (2% click vào giỏ hàng)
  conversionRate: number;   // e.g. 0.05 (5% người vào giỏ bấm mua)
  avgProductPrice: number;  // e.g. 200,000 VND
  commissionRate: number;   // e.g. 0.15 (15%)
}

export function calculateAffiliateEarnings(input: AffiliateEstimateInput) {
  const estimatedOrders = Math.round(input.avgViewsPerMonth * input.clickThroughRate * input.conversionRate);
  const totalGmv = estimatedOrders * input.avgProductPrice;
  const netCommission = totalGmv * input.commissionRate;

  return {
    estimatedOrders,
    totalGmv,
    netCommission,
  };
}
```

---

## 2. KOC Booking Rate Card Formulas (Ước lượng giá nhận video)

```typescript
export function estimateKocBookingFee(followers: number, avgViews: number, niche: 'beauty' | 'fashion' | 'lifestyle' | 'food') {
  const nicheMultiplier = {
    beauty: 1.25,    // Mỹ phẩm thường có ngân sách booking cao nhất
    fashion: 1.1,
    food: 1.0,
    lifestyle: 0.95
  }[niche] || 1.0;

  // Công thức: Kết hợp cả followers và views thực tế
  // Base rate theo lượt view thực tế (độ uy tín cao hơn số follower ảo)
  const viewBaseFee = Math.max(avgViews * 0.08, 300000); // 80đ/view, tối thiểu 300k
  const followerWeight = followers * 0.02; // 20đ/follower

  const estimatedMin = Math.round((viewBaseFee * 0.8 + followerWeight * 0.2) * nicheMultiplier / 50000) * 50000;
  const estimatedMax = Math.round(estimatedMin * 1.5 / 50000) * 50000;

  return {
    minPrice: estimatedMin,
    maxPrice: estimatedMax,
    suggestedLivestreamPrice: Math.round(estimatedMin * 1.8 / 50000) * 50000
  };
}
```

