// Thông tin liên hệ & mạng xã hội dùng chung toàn website.
// Lưu ý: hotline/email được giữ nguyên từ giao diện cũ — nhóm cần kiểm tra lại có đúng số thật không.
export const ZALO_GROUP_URL = 'https://zalo.me/g/cjeddnkeo8ngwrkv33sk';

export const SOCIAL_LINKS = [
  { label: 'TikTok', handle: '@kocityvn', href: 'https://www.tiktok.com/@kocityvn' },
  { label: 'Facebook', handle: 'Cộng đồng KOCITY', href: 'https://www.facebook.com/share/g/1EwZtfF6Ru/' },
  { label: 'Threads', handle: '@kocity_booking', href: 'https://www.threads.com/@kocity_booking' },
];

export const BRAND_CONTACT = {
  hotline: '098.888.9999',
  hotlineHref: 'tel:0988889999',
  email: 'brand@kocity.vn',
};

/** Đường dẫn các trang phía KOC */
export const ROUTES = {
  home: '/',
  campaign: (id: string) => `/c/${encodeURIComponent(id)}`,
  process: '/quy-trinh',
  progress: '/tien-do',
  myApplications: '/don-cua-toi',
  notifications: '/thong-bao',
  profile: '/ho-so',
  admin: '/admin',
} as const;
