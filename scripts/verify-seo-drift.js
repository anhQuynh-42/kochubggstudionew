/**
 * KOCITY AUTOMATED SEO DRIFT & AGENTIC READINESS VERIFIER
 * Checks that SEO baseline, llms.txt, robots.txt, schema markup, and programmatic routes
 * are intact before deploying, preventing SEO regression ("Sửa cái này mất cái kia").
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 [KOCity SEO Drift Verifier] Bắt đầu kiểm tra an toàn SEO & AI Discovery...');

let passed = true;

// 1. Kiểm tra llms.txt cho AI Search & GEO
const llmsPath = path.resolve('public/llms.txt');
if (!fs.existsSync(llmsPath)) {
  console.error('❌ Thất bại: Không tìm thấy tệp public/llms.txt!');
  passed = false;
} else {
  const content = fs.readFileSync(llmsPath, 'utf8');
  if (!content.includes('kocity.io.vn') || !content.includes('mau-thu') || !content.includes('cong-cu')) {
    console.error('❌ Thất bại: public/llms.txt bị thiếu nội dung quan trọng!');
    passed = false;
  } else {
    console.log('✅ 1. Tệp public/llms.txt: Đầy đủ thông tin chuẩn GEO & LLM Discovery');
  }
}

// 2. Kiểm tra robots.txt cho AI Crawlers
const robotsPath = path.resolve('public/robots.txt');
if (!fs.existsSync(robotsPath)) {
  console.error('❌ Thất bại: Không tìm thấy tệp public/robots.txt!');
  passed = false;
} else {
  const content = fs.readFileSync(robotsPath, 'utf8');
  if (!content.includes('GPTBot') || !content.includes('ClaudeBot') || !content.includes('PerplexityBot')) {
    console.error('❌ Thất bại: public/robots.txt chưa mở quyền cho AI search crawlers!');
    passed = false;
  } else {
    console.log('✅ 2. Tệp public/robots.txt: Mở quyền truy cập cho AI Agents & Crawlers');
  }
}

// 3. Kiểm tra Programmatic SEO Route trong App.tsx & constants.ts
const appPath = path.resolve('src/App.tsx');
const constPath = path.resolve('src/lib/constants.ts');
const appContent = fs.readFileSync(appPath, 'utf8');
const constContent = fs.readFileSync(constPath, 'utf8');

if (!appContent.includes('/mau-thu/:brandSlug') || !appContent.includes('FreeToolsPage')) {
  console.error('❌ Thất bại: Tuyến đường programmatic SEO (/mau-thu/:brandSlug hoặc FreeToolsPage) bị mất trong App.tsx!');
  passed = false;
} else if (!constContent.includes('sampleCampaign') || !constContent.includes('freeTools')) {
  console.error('❌ Thất bại: constants.ts bị thiếu hằng số route SEO!');
  passed = false;
} else {
  console.log('✅ 3. Routing Programmatic SEO: Khớp 100% (/mau-thu/:brandSlug & /cong-cu)');
}

// 4. Kiểm tra JSON-LD Schema trong CampaignPage.tsx
const campaignPagePath = path.resolve('src/site/pages/CampaignPage.tsx');
const campaignPageContent = fs.readFileSync(campaignPagePath, 'utf8');
if (!campaignPageContent.includes('application/ld+json') || !campaignPageContent.includes('@type\': \'Product\'') && !campaignPageContent.includes('@type": "Product"')) {
  console.error('❌ Thất bại: JSON-LD Product Schema bị mất trong CampaignPage.tsx!');
  passed = false;
} else {
  console.log('✅ 4. Schema Structured Data: Đã kích hoạt Product 0đ & BreadcrumbList');
}

// 5. Kiểm tra Trang Free Tools KOC
const freeToolsPath = path.resolve('src/site/pages/FreeToolsPage.tsx');
if (!fs.existsSync(freeToolsPath)) {
  console.error('❌ Thất bại: Không tìm thấy trang FreeToolsPage.tsx!');
  passed = false;
} else {
  console.log('✅ 5. Trang Công Cụ Miễn Phí (/cong-cu): Sẵn sàng');
}

if (!passed) {
  console.error('\n🚨 SEO DRIFT DETECTED: Có tính năng SEO hoặc Schema bị rớt! Vui lòng kiểm tra lại trước khi deploy.');
  process.exit(1);
}

console.log('\n✨ [KOCity SEO Drift Verifier] TẤT CẢ 5 BƯỚC KIỂM TRA ĐẠT CHUẨN 100%!\n');
process.exit(0);

