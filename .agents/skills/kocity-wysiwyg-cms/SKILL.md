---
name: kocity-wysiwyg-cms
description: >-
  Use this skill when developing, refactoring, styling, or debugging the Admin CMS,
  rich-text editors, blog management tools, or media upload features in KOCity.
  Also activate when the user mentions "soạn thảo", "bộ soạn thảo", "wysiwyg",
  "đổi màu chữ", "thêm ảnh bài viết", "thanh công cụ", "lỗi span", or "cms admin".
metadata:
  version: 1.0.0
---

# KOCity WYSIWYG & CMS Architecture Skill

You are the Fullstack Engineer responsible for the **Admin CMS and Content Authoring System** of KOCity.

**Read central context first:** Check `.agents/kocity-context.md`.

---

## 1. Core Principles (Nguyên tắc cốt lõi)

### Priority 1: Gọn gàng – Không to – Không che chữ (Non-Intrusive Mini Toolbar)
- The editor toolbar must never occupy multiple bulky rows like Word ribbons.
- Restrict to a **Single Sticky Mini Ribbon** ($\le 38\text{px}$ height) with compact icon buttons (28px).
- It must stick smoothly at the top of the editing area without obscuring cursor view.
- Guidelines: See [editor_principles.md](references/editor_principles.md).

### Priority 2: 100% Visual Editing (Zero Raw HTML Tag Leakage)
- When a user highlights text and clicks a color, font family, or font size, the change must apply **visually on-screen immediately** (`document.execCommand('foreColor', false, hex)` with `styleWithCSS`).
- **NEVER** insert raw `<span style="color: ...">` code into the user's visual editing view.
- Always provide 3 distinct viewing modes:
  1. `[ ✏️ Trực quan (Word/Docs) ]`: Default visual WYSIWYG.
  2. `[ < > Mã HTML ]`: Clean underlying code for advanced pasting.
  3. `[ 👁️ Xem trước (Live Preview) ]`: Real-time rendered article with images & callouts.

### Priority 3: Automatic In-Browser Image Compression
- Any image uploaded from machine or pasted via `Ctrl+V` must be compressed via HTML5 Canvas (max 1200px width/height, JPEG 0.82 quality) before insertion.
- Inserted images must render with caption (`<figcaption>`) and support click-to-zoom (Lightbox).
- Technical standards: See [wysiwyg_standards.md](references/wysiwyg_standards.md).

---

## 2. Verification Checklist Before Delivering
- [ ] Changing text color immediately changes text color visually; no `<span>` tag is shown in visual mode.
- [ ] Heading selection (H2, H3) formats blocks visually without displaying markdown hashes (`## `).
- [ ] Pasting an image (`Ctrl+V`) or dragging an image into editor compresses and renders image immediately.
- [ ] Switch to Live Preview renders the exact design seen on the public website.
