import { KOCUser } from '../types';
import { APP_LOGOS } from '../data/mockData';
import { saveKOCProfileToSupabase } from './supabaseService';

/**
 * Đăng nhập / đăng ký / đặt lại mật khẩu KOC.
 *
 * Logic được giữ nguyên từ LoginModal cũ (lưu tài khoản trong localStorage của trình duyệt),
 * chỉ tách ra khỏi giao diện để website mới dùng lại.
 * ⚠️ Đây CHƯA phải cơ chế đăng nhập an toàn — kế hoạch là chuyển sang Supabase Auth
 * (KOC vẫn đăng nhập bằng ID TikTok + mật khẩu).
 */

export type AuthResult = { ok: true; user: KOCUser } | { ok: false; error: string };

const USERS_KEY = 'koctrend_registered_users';
const PROFILE_KEY = 'koctrend_koc_profile';
const REMEMBERED_KEY = 'koctrend_remembered_account';
const REMEMBER_PREF_KEY = 'koctrend_remember_me';

// TODO(bảo mật): tài khoản Admin đang viết cứng trong code frontend — cần chuyển lên Supabase Auth.
const ADMIN_HANDLE = '@adminwebkocity1235';
const ADMIN_PASSWORD = 'kocity6102026';

export const normalizeHandle = (h: string) => {
  const clean = h.trim().replace(/^@+/, '').replace(/\s+/g, '').toLowerCase();
  return clean ? `@${clean}` : '';
};
const handleKey = (h?: string) => (h || '').toLowerCase().replace(/[@\s]/g, '');
const phoneKey = (p?: string) => (p || '').replace(/[\s.-]/g, '');

function readUsers(): KOCUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}
function writeUsers(users: KOCUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loadRememberedAccount(): { user: KOCUser | null; rememberMe: boolean } {
  try {
    const raw = localStorage.getItem(REMEMBERED_KEY) || localStorage.getItem(PROFILE_KEY);
    const pref = localStorage.getItem(REMEMBER_PREF_KEY);
    return { user: raw ? JSON.parse(raw) : null, rememberMe: pref === null ? true : pref === 'true' };
  } catch {
    return { user: null, rememberMe: true };
  }
}

function persistRemembered(user: KOCUser, remember: boolean) {
  try {
    localStorage.setItem(REMEMBER_PREF_KEY, remember ? 'true' : 'false');
    if (remember) localStorage.setItem(REMEMBERED_KEY, JSON.stringify(user));
    else localStorage.removeItem(REMEMBERED_KEY);
  } catch (e) {
    console.warn(e);
  }
}

export function login(params: {
  method: 'tiktok' | 'phone';
  handle: string;
  phone: string;
  password: string;
  remember: boolean;
}): AuthResult {
  const handle = normalizeHandle(params.handle);
  const password = params.password.trim();
  if (!password) return { ok: false, error: 'Vui lòng nhập mật khẩu.' };

  if (params.method === 'tiktok' && handle === ADMIN_HANDLE) {
    if (password !== ADMIN_PASSWORD) return { ok: false, error: 'Mật khẩu quản trị viên không chính xác.' };
    const admin: KOCUser = {
      id: 'admin-kocity-root',
      name: 'Quản Trị Viên KOCITY',
      role: 'admin',
      avatar: '',
      tiktokHandle: ADMIN_HANDLE,
      followers: 'Quản Trị Viên',
      phone: '',
      email: 'admin@kocity.vn',
      verified: true,
    };
    persistRemembered(admin, params.remember);
    return { ok: true, user: admin };
  }

  let users = readUsers();
  const matches = (u: KOCUser) =>
    params.method === 'tiktok'
      ? handleKey(u.tiktokHandle) === handleKey(handle)
      : phoneKey(u.phone) === phoneKey(params.phone) && phoneKey(params.phone).length >= 9;
  // Tài khoản cũ tạo khi nộp đơn không có mật khẩu (!u.password) vẫn cho đăng nhập để không mất dữ liệu
  let found = users.find((u) => matches(u) && (!u.password || u.password === password));

  // Hồ sơ đang lưu trên máy nhưng chưa có trong danh sách tài khoản
  if (!found) {
    try {
      const active: KOCUser | null = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
      if (active && matches(active) && (!active.password || active.password === password)) {
        found = active;
        users = [...users, active];
        writeUsers(users);
      }
    } catch (e) {
      console.warn(e);
    }
  }

  if (!found) {
    return { ok: false, error: 'ID TikTok hoặc mật khẩu chưa đúng. Bạn có thể bấm “Quên mật khẩu?” để đặt lại.' };
  }
  const user = { ...found, role: found.role || 'koc' };
  persistRemembered(user, params.remember);
  return { ok: true, user };
}

export function register(params: {
  name: string;
  handle: string;
  phone: string;
  followers: string;
  category: string;
  password: string;
  confirmPassword?: string;
  remember: boolean;
  agreedTerms?: boolean;
}): AuthResult {
  const handle = normalizeHandle(params.handle);
  if (!handle) return { ok: false, error: 'Vui lòng nhập ID TikTok.' };
  if (!params.name.trim()) return { ok: false, error: 'Vui lòng nhập tên hiển thị của bạn.' };

  const cleanPhone = (params.phone || '').replace(/[\s.-]/g, '');
  if (!cleanPhone) return { ok: false, error: 'Vui lòng nhập số điện thoại để liên hệ nhận mẫu.' };
  if (!/^(0|\+84)[0-9]{8,10}$/.test(cleanPhone)) {
    return { ok: false, error: 'Số điện thoại không hợp lệ (cần từ 10 chữ số, VD: 0908 123 456).' };
  }

  if (params.password.trim().length < 6) return { ok: false, error: 'Mật khẩu cần ít nhất 6 ký tự.' };
  if (params.confirmPassword !== undefined && params.password.trim() !== params.confirmPassword.trim()) {
    return { ok: false, error: 'Hai mật khẩu chưa khớp nhau. Vui lòng kiểm tra lại.' };
  }

  if (params.agreedTerms === false) {
    return { ok: false, error: 'Vui lòng đồng ý với Điều khoản dịch vụ & Chính sách bảo mật để tiếp tục.' };
  }

  if (handle === ADMIN_HANDLE) return { ok: false, error: 'ID TikTok này không dùng được.' };

  const users = readUsers();
  if (users.some((u) => handleKey(u.tiktokHandle) === handleKey(handle))) {
    return { ok: false, error: 'ID TikTok này đã có tài khoản. Hãy đăng nhập hoặc bấm “Quên mật khẩu?”.' };
  }

  const user: KOCUser = {
    id: `koc-reg-${Date.now()}`,
    name: params.name.trim() || handle.replace('@', ''),
    role: 'koc',
    avatar: '',
    tiktokHandle: handle,
    channelLink: `https://www.tiktok.com/${handle}`,
    followers: params.followers.trim(),
    phone: cleanPhone,
    email: '',
    password: params.password.trim(),
    verified: false,
    city: '',
    district: '',
    address: '',
    shippingNote: '',
    bio: '',
    categories: params.category ? [params.category] : [],
    avgViews: '',
    engagementRate: '',
    sampleDeliveredCount: 0,
    completedVideosCount: 0,
  };

  writeUsers([...users, user]);
  persistRemembered(user, params.remember);
  saveKOCProfileToSupabase(user).catch((err) => console.warn('Lưu Supabase KOC thất bại:', err));
  return { ok: true, user };
}

export function resetPassword(params: {
  handle: string;
  phone: string;
  newPassword: string;
  confirmPassword: string;
}): AuthResult {
  const handle = normalizeHandle(params.handle);
  const newPassword = params.newPassword.trim();
  const inputPhone = phoneKey(params.phone);

  if (!handle) return { ok: false, error: 'Vui lòng nhập ID TikTok của tài khoản.' };
  if (!inputPhone) return { ok: false, error: 'Vui lòng nhập số điện thoại đã dùng khi đăng ký tài khoản.' };
  if (newPassword.length < 6) return { ok: false, error: 'Mật khẩu mới cần ít nhất 6 ký tự.' };
  if (newPassword !== params.confirmPassword.trim()) return { ok: false, error: 'Hai mật khẩu chưa khớp nhau.' };
  if (handle === ADMIN_HANDLE) {
    return { ok: false, error: 'Tài khoản quản trị không đặt lại mật khẩu tại đây. Vui lòng liên hệ quản lý hệ thống.' };
  }

  const users = readUsers();
  const idx = users.findIndex((u) => handleKey(u.tiktokHandle) === handleKey(handle));
  let user: KOCUser;

  if (idx >= 0) {
    const existing = users[idx];
    // Bảo vệ tài khoản: Kiểm tra số điện thoại xác minh chính chủ
    if (existing.phone && phoneKey(existing.phone) && phoneKey(existing.phone) !== inputPhone) {
      return { ok: false, error: 'Số điện thoại không khớp với tài khoản ID TikTok này. Vui lòng kiểm tra lại.' };
    }
    user = { ...existing, phone: existing.phone || inputPhone, password: newPassword };
    users[idx] = user;
  } else {
    // Khôi phục từ hồ sơ / đơn đã nộp trên máy này nếu có, để không mất dữ liệu
    let base: Partial<KOCUser> = {};
    try {
      const active: KOCUser | null = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
      if (active && handleKey(active.tiktokHandle) === handleKey(handle)) base = active;
      const apps: Array<{ tiktokHandle?: string; kocName?: string; phone?: string; email?: string }> = JSON.parse(
        localStorage.getItem('koctrend_applications') || '[]'
      );
      const app = apps.find((a) => handleKey(a.tiktokHandle) === handleKey(handle));
      if (app) base = { name: app.kocName, phone: app.phone, email: app.email, ...base };
    } catch (e) {
      console.warn(e);
    }

    if (base.phone && phoneKey(base.phone) && phoneKey(base.phone) !== inputPhone) {
      return { ok: false, error: 'Số điện thoại không khớp với tài khoản ID TikTok này.' };
    }

    user = {
      id: `koc-reg-${Date.now()}`,
      name: base.name || handle.replace('@', ''),
      role: 'koc',
      avatar: base.avatar || APP_LOGOS.userProfile,
      tiktokHandle: handle,
      followers: base.followers || '',
      phone: base.phone || inputPhone,
      email: base.email || '',
      verified: false,
      ...base,
      password: newPassword,
    };
    users.push(user);
  }

  writeUsers(users);
  persistRemembered(user, true);
  saveKOCProfileToSupabase(user).catch((err) => console.warn('Lưu Supabase KOC thất bại:', err));
  return { ok: true, user };
}
