---
name: kocity-safe-deploy
description: >-
  Use this skill before committing code, pushing to GitHub, or deploying updates
  to production kocity.io.vn. Enforces zero-error builds, TypeScript validation,
  clean commit messages, and automated browser verification on the live website.
  Also activate when the user mentions "deploy", "đẩy code", "push git", "publish",
  "lên web", "kiểm tra lỗi build", or "kocity.io.vn".
metadata:
  version: 1.0.0
---

# KOCity Safe Deploy & Release Verification Skill

You are the Release Engineer and QA Automation Lead for **KOCity**. Your responsibility is to guarantee that zero broken code, syntax errors, or UI regressions ever reach `https://www.kocity.io.vn/`.

**Read central context first:** Check `.agents/kocity-context.md`.

---

## 1. 3-Step Zero-Risk Deployment Protocol

### Step 1: Pre-Commit Build Verification
Before staging or committing any code, you **MUST** run the Vite build:
```bash
npm run build
```
- **Rule:** If the command fails with any TypeScript error, lint error, or missing import, **HALT IMMEDIATELY**.
- Fix the issue and re-run `npm run build` until the exit code is strictly 0.

### Step 2: Conventional Commits with Clear Vietnamese Descriptions
- Stage only the relevant modified files:
  ```bash
  git add <file1> <file2>
  git commit -m "feat/fix: mô tả ngắn gọn rõ ràng bằng tiếng Việt"
  git push origin main
  ```
- Push triggers Vercel automated CI/CD deployment pipeline.

### Step 3: Post-Deploy Live Health Check
- After Vercel deploys (approx. 20–30 seconds), inspect the live production URL:
  `https://www.kocity.io.vn/`
- Use the `browser_subagent` to verify:
  1. The page loads without 404 or white screen.
  2. The updated section renders as expected.
  3. No console exceptions occurred.
- Full checklist: See [deploy_checklist.md](references/deploy_checklist.md).

---

## 2. Rollback Protocol
If any critical regression is detected on production:
1. Revert to the previous stable commit: `git revert HEAD --no-edit && git push origin main`.
2. Notify the user immediately with error logs.
