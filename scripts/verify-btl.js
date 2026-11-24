import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
let failures = 0;

function pass(msg) {
  console.log(`✅ ${msg}`);
}
function fail(msg) {
  console.error(`❌ ${msg}`);
  failures++;
}

console.log('🔎 [KOCity BTL Verifier] Kiểm tra đóng gói Project, Prompt Engineering & 8 AI Skills...\n');

// 1. Check required docs
const requiredDocs = [
  'README.md',
  'CLAUDE.md',
  'docs/AI_PROMPT_ENGINEERING.md',
  'docs/AI_SKILLS_BTL.md',
];
for (const rel of requiredDocs) {
  const full = path.join(ROOT, rel);
  if (fs.existsSync(full) && fs.readFileSync(full, 'utf8').trim().length > 100) {
    pass(`Tài liệu hợp lệ: ${rel}`);
  } else {
    fail(`Thiếu hoặc rỗng tài liệu: ${rel}`);
  }
}

// 2. Check all 8 AI Skills
const expectedSkills = [
  'kocity-form-conversion-cro',
  'kocity-free-tools-leadgen',
  'kocity-geo-agentic-seo',
  'kocity-programmatic-seo',
  'kocity-safe-deploy',
  'kocity-seo-editorial',
  'kocity-ui-ux-design',
  'kocity-wysiwyg-cms',
];
for (const skill of expectedSkills) {
  const skillPath = path.join(ROOT, '.agents', 'skills', skill, 'SKILL.md');
  if (!fs.existsSync(skillPath)) {
    fail(`Thiếu Skill: .agents/skills/${skill}/SKILL.md`);
    continue;
  }
  const content = fs.readFileSync(skillPath, 'utf8');
  if (/^---[\s\S]*?name:\s*\S+[\s\S]*?description:\s*\S+[\s\S]*?---/.test(content)) {
    pass(`AI Skill chuẩn frontmatter: ${skill}`);
  } else {
    fail(`AI Skill thiếu YAML frontmatter name/description: ${skill}`);
  }
}

// 3. Validate KOCity n8n workflows (excluding local secret files)
const workflowFiles = fs
  .readdirSync(ROOT)
  .filter(
    (f) =>
      f.startsWith('kocity_') &&
      (f.endsWith('.n8n') || f.endsWith('.json')) &&
      !f.endsWith('_local.json')
  );

for (const wfFile of workflowFiles) {
  try {
    const raw = fs.readFileSync(path.join(ROOT, wfFile), 'utf8');
    if (raw.includes('apify_api_')) {
      fail(`Phát hiện token bí mật trong ${wfFile}`);
      continue;
    }
    const wf = JSON.parse(raw);
    if (!Array.isArray(wf.nodes) || wf.nodes.length === 0) {
      fail(`Workflow không có nodes: ${wfFile}`);
      continue;
    }
    pass(`n8n Workflow hợp lệ (${wf.nodes.length} nodes): ${wfFile}`);
  } catch (err) {
    fail(`Lỗi JSON trong ${wfFile}: ${err.message}`);
  }
}

console.log('');
if (failures > 0) {
  console.error(`❌ [KOCity BTL Verifier] Thất bại với ${failures} lỗi.`);
  process.exit(1);
}
console.log('✨ [KOCity BTL Verifier] TẤT CẢ KIỂM TRA ĐẠT CHUẨN 100%!');
