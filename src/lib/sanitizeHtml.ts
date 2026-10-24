/**
 * Bộ lọc làm sạch mã HTML (XSS Sanitizer) nhẹ nhàng, không phụ thuộc thư viện ngoài
 * Chống triệt để các cuộc tấn công Cross-Site Scripting (XSS) qua bài viết và nội dung nhập liệu
 */

export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  let clean = dirtyHtml;

  // 1. Loại bỏ hoàn toàn các thẻ nguy hiểm và nội dung bên trong của chúng
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  clean = clean.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  clean = clean.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  clean = clean.replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '');
  clean = clean.replace(/<meta\b[^>]*>/gi, '');
  clean = clean.replace(/<link\b[^>]*>/gi, '');

  // 2. Loại bỏ các thuộc tính sự kiện inline (on*=...)
  // Ví dụ: onerror=..., onload=..., onclick=..., onmouseover=...
  clean = clean.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // 3. Loại bỏ pseudo-protocols (javascript:, vbscript:, data:text/html)
  clean = clean.replace(/href\s*=\s*["']?\s*(?:javascript|vbscript|data\s*:\s*text\/html)\s*:[^"'>]*/gi, 'href="#"');
  clean = clean.replace(/src\s*=\s*["']?\s*(?:javascript|vbscript|data\s*:\s*text\/html)\s*:[^"'>]*/gi, 'src=""');

  return clean;
}
