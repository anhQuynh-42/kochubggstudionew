# KOCity Database Safety & Zero-Sync-Bug Rules
**Target Scope:** All Supabase database queries, data mutations, and cross-device sync handlers.

---

## 1. The 4 Golden Rules of Supabase & Cloud Synchronization

### Rule 1: Never Use SQL Wildcard Characters In Unescaped Filters
- In PostgreSQL/PostgREST `like` and `ilike` operators:
  - `_` (underscore) matches **ANY SINGLE CHARACTER**.
  - `%` (percent) matches **ANY SEQUENCE OF CHARACTERS**.
- **PROHIBITED:**
  ```ts
  // ❌ NGHIÊM CẤM: '__%' khớp với mọi chuỗi có độ dài >= 2 ký tự, dẫn đến loại bỏ 100% dữ liệu!
  .not('id', 'like', '__%')
  ```
- **REQUIRED:**
  Query standard rows and filter system records (`__%`) in JavaScript:
  ```ts
  // ✅ CHUẨN: Lọc an toàn bằng JavaScript, miễn nhiễm hoàn toàn với lỗi cú pháp SQL wildcard
  const active = (data || []).filter((item) => !item.id.startsWith('__'));
  ```

### Rule 2: Single Source of Truth (Cloud Is Authoritative)
- When Supabase is configured and returns a valid list of campaigns or applications:
  - **The remote Cloud list is the Single Source of Truth (SSOT).**
  - **NEVER** re-inject or merge deleted items from `INITIAL_CAMPAIGNS` into the active list.
  - If an item was deleted on Supabase, it must stay deleted on all devices.
  - Only locally created temporary offline records (with prefixes `offline-` or `camp-local-`) may be temporarily preserved until synced.

### Rule 3: Zero Silent Failures & Zero Masking
- When a Supabase write (`insert`, `update`, `delete`, `upsert`) fails:
  - **NEVER** silently swallow the error with a simple `console.error` while letting the UI/localStorage pretend the action succeeded.
  - If a column schema mismatch occurs (`PGRST204`), it MUST be caught by `scripts/verify-cloud-sync.js` before reaching production.
  - Every application payload must be strictly validated against the actual database schema (`VALID_APPLICATION_COLUMNS`).

### Rule 4: Mandatory Automated Sync Verification Before Any Git Commit
- Every release must pass:
  ```bash
  npm run check:sync
  npm run build
  ```
- The Git pre-commit hook (`.git/hooks/pre-commit`) enforces this at the OS level. No commit can be created if Cloud sync tests fail.
