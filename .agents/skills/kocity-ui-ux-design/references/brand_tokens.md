# KOCity Brand Tokens & Design System

## 1. Color Palette (Bảng màu chuẩn)
| Mục đích | Mã Hex / Tailwind | Sử dụng cho |
| :--- | :--- | :--- |
| **Primary Violet** | `#7c3aed` (`violet-600`) | Nút chính, viền active, icon thương hiệu, liên kết |
| **Deep Violet** | `#4c1d95` (`violet-900`) | Tiêu đề chính, thanh điều hướng ban đêm |
| **Accent Pink** | `#ec4899` (`pink-500`) | Badge khuyến mãi, gradient nút CTA nổi bật |
| **Amber Gold** | `#f59e0b` (`amber-500`) | Huy hiệu độc quyền, điểm thưởng, VIP |
| **Zalo Brand** | `#0068ff` | Nút hỗ trợ Zalo 24/7, hotline KOC |
| **Night Background**| `#0f0a1e` / `#1e1338` | Showroom chế độ ban đêm |
| **Surface White** | `#ffffff` / `bg-white/95` | Thẻ card, modal popups kết hợp `backdrop-blur-md` |

## 2. Radiuses & Shadows (Bo góc & Bóng đổ)
- **Standard Cards:** `rounded-2xl` (16px), `shadow-xs hover:shadow-md transition-all`
- **Modals & Hero Sheets:** `rounded-3xl` (24px) hoặc `rounded-[28px]`
- **Buttons / Pills:** `rounded-full` (dành cho CTA, badge, ticker)
- **Borders:** `ring-1 ring-violet-100/80` hoặc `border border-slate-200/80`

## 3. Typography
- **Headings (H1, H2, H3):** `font-display` kết hợp `font-black text-slate-950`
- **Body Text:** `font-sans text-slate-700 leading-relaxed text-sm sm:text-base`
- **Metadata / Slugs:** `font-mono text-xs text-purple-700`
