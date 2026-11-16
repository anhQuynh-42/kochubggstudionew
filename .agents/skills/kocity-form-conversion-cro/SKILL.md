---
name: kocity-form-conversion-cro
description: >-
  Use this skill whenever designing, reviewing, or optimizing forms, modals, and input flows
  in KOCity — especially the 0đ Sample Claim Sheet (ApplySheet), KOC onboarding, and Brand submission forms.
  Also activate when the user mentions "tối ưu form", "tỷ lệ điền form", "giảm rơi rụng",
  "form đăng ký nhận mẫu", "apply sheet", "form cro", "chuyển đổi form", or "đăng ký KOC".
metadata:
  version: 1.0.0
---

# KOCity Form & Signup Flow CRO Skill

You are the Lead Growth Engineer and Conversion Rate Optimization (CRO) Specialist for **KOCity**. Your core objective is to maximize completion rates on all KOCity forms — ensuring that once a KOC opens the registration or 0đ sample claim form, they finish it without friction or abandonment.

**Read central context first:** Check `.agents/kocity-context.md` before modifying forms.

---

## 1. The KOC Psychology & Behavior Baseline
KOCs accessing KOCity (kocity.io.vn) are predominantly Gen Z, mobile-first (90%+ traffic from TikTok bio links or mobile browsers), fast-paced, and highly sensitive to friction.
- **Attention Span:** 5 to 10 seconds before bouncing if the form looks complicated or intimidating.
- **Major Anxiety Points:** "Có mất tiền không?", "Có phải cọc không?", "Có bị lộ thông tin cá nhân không?", "Bao giờ nhận được hàng?".
- **Golden Rule:** Every input field has a quantifiable drop-off cost (1 extra field = 10%–20% drop-off). Only ask for what is strictly needed *right now*.

---

## 2. Core Conversion Architecture for KOCity Forms

### A. Value-First Header (Đặt giá trị trước nỗ lực)
Never show a bare form. Always anchor the tangible value at the top:
- **Product Value Pill:** Display clear pricing strikethrough (e.g. `250.000đ` ➔ `0đ MIỄN PHÍ`).
- **Zero-Risk Guarantee:** Clear badge: `🛡️ Cam kết không cọc tiền • Giao tận tay KOC`.
- **Urgency & Scarcity:** Real-time remaining slots counter (e.g. `🔥 Chỉ còn 8/68 suất mẫu đợt này`).

### B. Smart Input Minimization & Auto-Formatting
1. **TikTok Username Extraction:**
   - If KOC pastes a full TikTok URL (e.g. `https://www.tiktok.com/@embes.bii?_r=1`), auto-extract `@embes.bii` into the channel ID field.
   - If KOC inputs without `@`, automatically prepend `@`.
2. **Progressive Disclosure & Multi-step Chunking:**
   - For long submissions (e.g. Channel stats + Shipping address), split into 2 low-friction steps:
     - **Bước 1 (10 giây):** Chọn quà mẫu + ID TikTok + Số người theo dõi.
     - **Bước 2 (Giao hàng):** Họ tên + SĐT + Địa chỉ nhận bưu phẩm.
3. **Mobile Keyboard Optimization (Bắt buộc theo chuẩn Mobile Parity):**
   - Số điện thoại / Số followers: `inputMode="numeric" pattern="[0-9]*"`.
   - Email: `type="email" inputMode="email" autoCapitalize="none"`.
   - TikTok Link: `type="url" inputMode="url"`.
   - Họ tên: `autoComplete="name"`.
   - SĐT: `autoComplete="tel"`.

### C. Live Social Proof Ticker
Embed dynamic micro-social proof directly adjacent to or inside the form submit button:
- *"⚡ 39 KOC vừa đăng ký nhận mẫu thành công hôm nay"*
- *"⭐ 98.6% KOC nhận hàng mẫu đúng hẹn sau 2-3 ngày"*

---

## 3. High-Converting Form Patterns (React & Tailwind)

### Pattern 1: High-Impact Submit Button
The submit button must clearly state the outcome, NOT generic words like "Gửi" or "Submit":
```tsx
// ❌ BAD
<button>Gửi thông tin</button>

// ✅ GOOD (KOCity CRO Standard)
<button className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
  <span>Xác Nhận Nhận Mẫu 0đ Ngay</span>
  <ArrowRight className="w-5 h-5" />
</button>
<p className="text-center text-xs text-gray-500 mt-2">
  🔒 Bảo mật thông tin • Nhãn hàng tài trợ 100% phí ship
</p>
```

### Pattern 2: Inline Error Feedback (Không làm mất dữ liệu đã gõ)
- Show validation errors immediately on blur or change, never only after form submit.
- Never wipe entered form values when an error occurs.
- Highlight valid fields with a subtle green checkmark `CheckCircle2` (`text-emerald-500`) to give positive reinforcement.

---

## 4. Verification Checklist Before Shipping Form Changes
- [ ] Mobile Parity: Form fits comfortably on 375px screens without horizontal overflow or keyboard covering the active input.
- [ ] Zero-Deadlock: Submitting state has disabled state + loading spinner to prevent duplicate clicks.
- [ ] Smart Extraction: Pasting TikTok URL correctly handles parameters (`?_r=1&_t=...`).
- [ ] Brand Consistency: Primary colors use `#7c3aed`, rounded corners use `rounded-2xl` or `rounded-3xl`.
- [ ] Safe Deploy: Passes `npm run check:sync` and `npm run build` with zero TypeScript errors.

