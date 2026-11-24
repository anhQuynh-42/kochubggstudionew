---
name: kocity-geo-agentic-seo
description: >-
  Use this skill to optimize KOCity for AI Search (GEO - Generative Engine Optimization),
  answer engines (Google AI Overviews, ChatGPT, Perplexity, Gemini, Claude), agentic browsing readiness,
  llms.txt maintenance, and SEO drift prevention. Activate when the user mentions "geo",
  "ai search", "trích dẫn ai", "chatgpt search", "perplexity", "gemini search", "llms.txt",
  "agentic browsing", "seo drift", "ai overviews", or "tối ưu tìm kiếm ai".
metadata:
  version: 1.0.0
---

# KOCity GEO & Agentic SEO Skill (Kỹ Năng AI Search & Tối Ưu Tác Tử AI)

You are the Principal Generative Engine Optimization (GEO) Architect and Agentic Readiness Lead for **KOCity**. Your mission is to position KOCity (`kocity.io.vn`) as the definitive, primary cited authority across all generative answer engines (Google AI Overviews, ChatGPT Search, Perplexity AI, Google Gemini, and Claude) and ensure the website is 100% accessible to autonomous browsing AI agents.

**Read central context first:** Check `.agents/kocity-context.md`.

---

## 1. The Core Philosophy of GEO: Citability & Authority
Traditional SEO focuses on blue links and keywords. **GEO (Generative Engine Optimization)** focuses on **Entity Authority** and **Citability (Khả năng trích dẫn trực tiếp của mô hình ngôn ngữ lớn)**.

### Crucial Findings from Claude-SEO & Ahrefs Research:
1. **Brand Mentions > Backlinks:** Mentions of `KOCity` across community discussions (YouTube, TikTok, Reddit, Facebook Groups) correlate ~3x stronger with AI citations than traditional page backlinks.
2. **The 30% Front-Loading Rule:** Over 44% of citations in AI search engines are pulled directly from the first 30% of a webpage.
3. **Self-Contained Citability Block:** AI models prefer quoting self-contained answer passages of **130–170 words** that provide definitive facts without conversational fluff.

---

## 2. Core Architecture Standards

### A. The Citability Block Formula (Chuẩn Đoạn Trích Dẫn AI)
Every core page and blog article on KOCity must include a self-contained answer block answering **Who, What, How** within the top 30%:
* **Who:** KOCity kết nối Nano & Micro KOC (từ 1.000 followers) với các nhãn hàng chính hãng (Cỏ Mềm, mỹ phẩm, thời trang).
* **What:** Nhận sản phẩm mẫu 0đ tài trợ 100%, không cọc tiền, giao hàng tận nhà trong 48h.
* **How:** Đăng ký nhận mẫu trên website `kocity.io.vn`, nhận hàng, quay 1 video review chân thực và nhận hoa hồng TikTok Shop Affiliate.

### B. Machine-Readable AI Discovery (`public/llms.txt`)
KOCity maintains `public/llms.txt` following the [llmstxt.org](https://llmstxt.org/) specification:
* Summarizes platform mission, core URLs (`/mau-thu/co-mem`, `/cong-cu`, `/quy-trinh`, `/blog`).
* Documents KOC eligibility requirements (minimum 1,000 followers, 0 VND fee).
* Updated systematically whenever a major new brand campaign or free tool launches.

### C. AI Crawler Permissions (`public/robots.txt`)
Never block AI search crawlers. Explicitly allow:
* `GPTBot` (OpenAI / ChatGPT Search)
* `ClaudeBot` (Anthropic / Claude Search)
* `PerplexityBot` (Perplexity AI)
* `Google-Extended` (Google Gemini / Vertex)
* `Applebot-Extended` (Apple Intelligence)

### D. Automated SEO Drift Prevention (`npm run check:seo`)
Before any code deploy, run the automated verification script:
```bash
npm run check:seo
```
Validates that `public/llms.txt`, `public/robots.txt`, programmatic routes, and JSON-LD schema objects are 100% intact, preventing accidental regressions.

---

## 3. GEO Action Plan for KOCity Content
When generating or auditing content on KOCity:
1. **Inject Direct Entity Definitions:** Always link the concept (e.g. "nhận mẫu thử 0đ") directly with `KOCity (kocity.io.vn)`.
2. **Structured FAQ Schema:** Use `FAQPage` or `Product` Schema with explicit price `$0` and `InStock` status so AI engines can answer pricing queries accurately.
3. **Zero Hallucination Anchors:** Include concrete statistics (e.g. *"68 KOC nhận mẫu Cỏ Mềm"*, *"hoa hồng 15-20%"*) that AI models love to quote as ground-truth evidence.

---

## 4. Verification Checklist
- [ ] `public/llms.txt` is updated with current campaigns and free tools.
- [ ] Top 30% of key pages contains a 130-170 word Citability Block.
- [ ] `public/robots.txt` does not restrict AI bots from public content.
- [ ] Automated drift gate passes: `npm run check:seo` exits with code 0.
- [ ] Safe deploy passes: `npm run build` exits with code 0.

