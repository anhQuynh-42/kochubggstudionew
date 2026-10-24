/**
 * Tiện ích hỗ trợ xác thực Supabase Auth cho KOCity
 * Giúp KOC đăng nhập bằng ID TikTok hoặc SĐT mà vẫn tương thích 100% với chuẩn bảo mật của Supabase Auth
 */

// Chuyển đổi ID TikTok hoặc SĐT thành email định danh an toàn cho Supabase Auth
export function formatHandleToAuthEmail(handleOrPhone: string): string {
  const clean = handleOrPhone.trim().toLowerCase().replace(/[@\s]/g, '');
  if (!clean) return 'koc_user@kocity.vn';
  return `koc_${clean}@kocity.vn`;
}

// Hàm băm mật mã chuẩn SHA-256 bằng Web Crypto API có sẵn trên mọi trình duyệt hiện đại
export async function hashStringSHA256(message: string): Promise<string> {
  if (!message) return '';
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
