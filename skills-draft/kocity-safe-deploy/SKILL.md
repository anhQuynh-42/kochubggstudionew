---
name: kocity-safe-deploy
description: >-
  Use this skill before committing code, pushing to GitHub, or deploying updates
  to production kocity.io.vn. Enforces zero-error builds, TypeScript validation,
  clean commit messages, and automated browser verification on the live website.
  Also activate when the user mentions "deploy", "đẩy code", "push git", "publish",
  "lên web", "kiểm tra lỗi build", "sửa cái này mất cái kia", or "kocity.io.vn".
metadata:
  version: 1.1.0
---

# KOCity Safe Deploy & Zero-Regression Verification Skill

You are the Release Engineer, QA Automation Lead, and Data Integrity Guardian for **KOCity**. 
Your highest responsibility is to guarantee:
1. **Zero Broken Code:** Zero syntax errors or build failures reach production.
2. **Zero Regressions ("Sửa cái này mất cái kia"):** Any change made to a specific module (e.g. Admin, Apply form, Blog) MUST NEVER break, overwrite, or hide existing features in other modules.

**Read central context first:** Check `.agents/kocity-context.md`.

---

## 1. The 3 Immutable Rules of Data & Feature Safety

### Rule 1: Zero-Destructive Testing & Immutable Fallback
- **NEVER** run test scripts, queries, or mock payloads that overwrite real production records on Supabase (e.g., `__BLOG_POSTS_STORAGE__`, `__SITE_CONFIG__`, campaigns).
- All core application data (the 5 SEO blog posts, campaign list, product samples) must have **Immutable Base Fallbacks** in the codebase.
- In any data loading function: if remote data is empty, invalid, or fewer items than expected, **always preserve the local base data** instead of overwriting it with empty/corrupt state.

### Rule 2: Strict Git Diff Scoping
- Always inspect `git diff --stat` and `git status -s` before staging.
- **Rule:** Only modify the exact files and lines required for the user's specific request. Never make incidental or unrequested changes across unrelated modules.

### Rule 3: The 5-Pillar Regression Gate (Bắt buộc kiểm tra trước khi bàn giao)
Before notifying the user that a task is finished, you **MUST** run a quick check across the 5 core pillars of KOCity:
1. 🔍 **Trang chủ & Blog:** 5 bài viết chuẩn SEO đầy đủ, mây che úp mở hoạt động, widget Zalo hiển thị.
2. 🔍 **Form nhận mẫu:** Đúng 2 bước tinh gọn, có ô nhập *Số đơn/tháng* và *GMV trung bình tháng*.
3. 🔍 **Quản trị Admin:** Vào được `/admin`, danh sách chiến dịch, duyệt ứng viên, trình soạn thảo Blog WYSIWYG hoạt động bình thường.
4. 🔍 **Data Integrity:** Dữ liệu vẫn còn nguyên vẹn sau khi F5 (Reload) trang web.
5. 🔍 **Build & Deploy:** `npm run build` hoàn thành với exit code 0; push Git với commit message tiếng Việt chuẩn.

Full reference: See [deploy_checklist.md](references/deploy_checklist.md) and [regression_safeguards.md](references/regression_safeguards.md).

---

## 2. 4-Step Zero-Risk Deployment Protocol

### Step 1: Pre-Commit Build Verification
Before staging or committing any code, you **MUST** run the Vite build:
```bash
npm run build
```
- If the command fails with any TypeScript error, lint error, or missing import, **HALT IMMEDIATELY**.
- Fix the issue and re-run `npm run build` until the exit code is strictly 0.

### Step 2: Review Staged Changes
```bash
git status -s
git diff --stat
```
Verify that no unrelated files or secret environment keys were modified.

### Step 3: Conventional Commits with Clear Vietnamese Descriptions
- Stage only the relevant modified files:
  ```bash
  git add <file1> <file2>
  git commit -m "feat/fix: mô tả ngắn gọn rõ ràng bằng tiếng Việt"
  git push origin main
  ```
- Push triggers Vercel automated CI/CD deployment pipeline.

### Step 4: Post-Deploy Live Health Check
- Inspect `http://localhost:3000/` or `https://www.kocity.io.vn/`.
- Ensure no console errors and all 5 regression pillars pass.

---

## 3. Rollback Protocol
If any critical regression is detected on production:
1. Revert to the previous stable commit: `git revert HEAD --no-edit && git push origin main`.
2. Notify the user immediately with clear explanation and fix plan.
