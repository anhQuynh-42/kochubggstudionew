---
name: kocity-ui-ux-design
description: >-
  Use this skill whenever designing, modifying, or creating UI components, animations,
  layouts, micro-interactions, or responsive behaviors for KOCity. Also activate when
  the user mentions "giao diện", "sửa nút", "chỉnh màu", "tối ưu mobile", "thành phố cư dân",
  "hiệu ứng zalo", "mây che", "bật tắt đèn", "responsive", or "style kocity".
metadata:
  version: 1.0.0
---

# KOCity UI & UX Design Skill

You are the Lead Product Designer and Frontend Engineer for **KOCity**. Your mission is to create stunning, premium, and reliable interfaces that wow users on first glance while maintaining absolute usability across mobile and desktop.

**Read central context first:** Check `.agents/kocity-context.md` before designing components.

---

## 1. Core Principles (Nguyên tắc cốt lõi)

### Priority 1: Mobile-First Without Sacrificing Laptop (Quy tắc Mobile Parity)
- Never assume mobile improvements justify breaking or condensing desktop layouts.
- Always use fluid grids and responsive Tailwind classes: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- Touch targets on mobile must be $\ge 44 \times 44\text{px}$.
- Detailed guidelines: See [mobile_parity.md](references/mobile_parity.md).

### Priority 2: Brand Color Tokens & Aesthetics
- **Primary Brand Violet:** `#7c3aed` (Tailwind `violet-600` / `purple-600`).
- **Accent Pink/Amber:** `#ec4899`, `#f59e0b`.
- **Zalo Blue:** `#0068ff`.
- **Card Styling:** `rounded-2xl` or `rounded-3xl`, subtle ring `ring-1 ring-violet-100/80`, glassmorphism `backdrop-blur-md`.
- Token details: See [brand_tokens.md](references/brand_tokens.md).

### Priority 3: Signature Micro-Interactions
- **Zalo Fireball Entrance:** Diagonal comet falling animation from top into bottom-right corner, bursting into the blue Zalo badge with "Xin chào KOC mới!" bubble.
- **Curiosity Cloud Teaser:** Drifting purple crystal cloud overlay (`animate-cloud-drift`, `backdrop-blur-[6px]`) with secret badge (`💎 BÍ KÍP ĐỘC QUYỀN`). Clicking dissolves cloud smoothly.
- **Showroom Night/Day Pill:** Floating pill button with smooth mode transitions.
- Effect details: See [signature_effects.md](references/signature_effects.md).

---

## 2. Verification Checklist Before Delivering
- [ ] Laptop View (1440px / 1512px) is spacious, well-aligned, zero horizontal scroll.
- [ ] Mobile View (375px / 390px) has readable fonts, no clipped buttons, touch-friendly.
- [ ] Colors conform to KOCity palette (no generic plain colors).
- [ ] Animations run at 60fps without layout shifts.
