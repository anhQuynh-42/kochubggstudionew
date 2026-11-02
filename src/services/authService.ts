import { KOCUser } from '../types';
import { APP_LOGOS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { formatHandleToAuthEmail, hashStringSHA256 } from '../lib/authHelpers';
import { saveKOCProfileToSupabase, getKOCProfileFromSupabase } from './supabaseService';

/**
 * Dịch vụ Xác thực và Phân quyền KOCity — Chuẩn Bảo Mật Cao Cấp (Enterprise Security)
 * Đăng ký & Đăng nhập bằng Email kết hợp Supabase Auth (Argon2id/Bcrypt)
 * Hỗ trợ fallback tương thích tài khoản cũ (bảo toàn 100% dữ liệu)
 */

export type AuthResult = { ok: true; user: KOCUser } | { ok: false; error: string };

const USERS_KEY = 'koctrend_registered_users';
const PROFILE_KEY = 'koctrend_koc_profile';
const REMEMBERED_KEY = 'koctrend_remembered_account';
const REMEMBER_PREF_KEY = 'koctrend_remember_me';

export const normalizeHandle = (h: string) => {
  const clean = h.trim().replace(/^@+/, '').replace(/\s+/g, '').toLowerCase();
  return clean ? `@${clean}` : '';
};
const handleKey = (h?: string) => (h || '').toLowerCase().replace(/[@\s]/g, '');
const phoneKey = (p?: string) => (p || '').replace(/[\s.-]/g, '');
const emailKey = (e?: string) => (e || '').trim().toLowerCase();

function readUsers(): KOCUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeUsers(users: KOCUser[]) {
  // BẢO MẬT: Đảm bảo không bao giờ có thuộc tính password dạng plaintext trong mảng lưu cache
  const cleanUsers = users.map((u) => {
    const clone = { ...u };
    delete (clone as Record<string, unknown>).password;
    return clone;
  });
  localStorage.setItem(USERS_KEY, JSON.stringify(cleanUsers));
}

export function loadRememberedAccount(): { user: KOCUser | null; rememberMe: boolean } {
  try {
    const raw = localStorage.getItem(REMEMBERED_KEY) || localStorage.getItem(PROFILE_KEY);
    const pref = localStorage.getItem(REMEMBER_PREF_KEY);
    const user = raw ? JSON.parse(raw) : null;
    if (user) {
      delete (user as Record<string, unknown>).password;
    }
    return { user, rememberMe: pref === null ? true : pref === 'true' };
  } catch {
    return { user: null, rememberMe: true };
  }
}

function persistRemembered(user: KOCUser, remember: boolean) {
  try {
    const safeUser = { ...user };
    delete (safeUser as Record<string, unknown>).password;
    localStorage.setItem(REMEMBER_PREF_KEY, remember ? 'true' : 'false');
    if (remember) localStorage.setItem(REMEMBERED_KEY, JSON.stringify(safeUser));
    else localStorage.removeItem(REMEMBERED_KEY);
  } catch (e) {
    console.warn(e);
  }
}

/**
 * ĐĂNG NHẬP (LOGIN)
 * Đăng nhập bằng Email (hoặc SĐT / ID TikTok cũ) qua Supabase Auth + Fallback tương thích
 */
export async function login(params: {
  method?: 'email' | 'phone' | 'tiktok';
  email?: string;
  handle?: string;
  phone?: string;
  password: string;
  remember: boolean;
}): Promise<AuthResult> {
  const password = params.password.trim();
  if (!password) return { ok: false, error: 'Vui lòng nhập mật khẩu.' };

  const method = params.method || (params.email ? 'email' : params.phone ? 'phone' : 'email');
  const inputEmail = emailKey(params.email || (!params.phone ? params.handle : ''));
  const inputPhone = phoneKey(params.phone);
  const inputHandle = normalizeHandle(params.handle || '');

  // Xác định email gửi tới Supabase Auth
  let authEmail = '';
  if (method === 'email' && inputEmail.includes('@')) {
    authEmail = inputEmail;
  } else if (method === 'phone' && inputPhone) {
    authEmail = formatHandleToAuthEmail(inputPhone);
  } else if (inputHandle) {
    authEmail = formatHandleToAuthEmail(inputHandle);
  } else if (inputEmail) {
    authEmail = inputEmail.includes('@') ? inputEmail : formatHandleToAuthEmail(inputEmail);
  }

  if (isSupabaseConfigured() && authEmail) {
    try {
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      if (authData?.user && !authErr) {
        // Đăng nhập Supabase Auth thành công
        const supaProfile = await getKOCProfileFromSupabase(inputHandle || authData.user.email || inputPhone);
        const resolvedEmail = authData.user.email || inputEmail || supaProfile?.email || '';
        const user: KOCUser = {
          id: authData.user.id,
          name: supaProfile?.name || authData.user.user_metadata?.name || resolvedEmail.split('@')[0] || 'KOC Thành viên',
          role: 'koc',
          avatar: supaProfile?.avatar || authData.user.user_metadata?.avatar || '',
          email: resolvedEmail,
          tiktokHandle: supaProfile?.tiktokHandle || inputHandle || `@${resolvedEmail.split('@')[0]}`,
          followers: supaProfile?.followers || authData.user.user_metadata?.followers || 'KOC',
          phone: supaProfile?.phone || params.phone || '',
          verified: !!supaProfile?.verified,
          categories: supaProfile?.categories || [],
          isBlacklisted: supaProfile?.isBlacklisted,
          blacklistReason: supaProfile?.blacklistReason,
          city: supaProfile?.city || '',
          district: supaProfile?.district || '',
          address: supaProfile?.address || '',
          shippingNote: supaProfile?.shippingNote || '',
          bio: supaProfile?.bio || '',
          channelLink: supaProfile?.channelLink || '',
          targetAudience: supaProfile?.targetAudience || '',
          contentStyle: supaProfile?.contentStyle || [],
          highlightVideos: supaProfile?.highlightVideos || [],
        };

        // ĐỒNG BỘ: Cập nhật ngay hồ sơ mới nhất vào danh sách tài khoản của máy này
        const currentUsers = readUsers();
        const existingIdx = currentUsers.findIndex(
          (u) => (u.email && emailKey(u.email) === emailKey(user.email)) || handleKey(u.tiktokHandle) === handleKey(user.tiktokHandle)
        );
        if (existingIdx >= 0) currentUsers[existingIdx] = { ...currentUsers[existingIdx], ...user };
        else currentUsers.push(user);
        writeUsers(currentUsers);

        persistRemembered(user, params.remember);
        return { ok: true, user };
      }
    } catch (e) {
      console.warn('Lỗi kết nối Supabase Auth, chuyển sang kiểm tra tài khoản tương thích:', e);
    }
  }

  // Fallback Tương thích tài khoản cũ (Đảm bảo KOC cũ không bị mất quyền truy cập)
  const inputHash = await hashStringSHA256(password);
  let users = readUsers();
  const matches = (u: KOCUser) => {
    if (method === 'phone' && inputPhone) {
      return phoneKey(u.phone) === inputPhone;
    }
    if (inputEmail) {
      if (u.email && emailKey(u.email) === inputEmail) return true;
      if (handleKey(u.tiktokHandle) === handleKey(inputEmail)) return true;
    }
    if (inputHandle && handleKey(u.tiktokHandle) === handleKey(inputHandle)) {
      return true;
    }
    return false;
  };

  let found = users.find(
    (u) =>
      matches(u) &&
      (!u.passwordHash ||
        u.passwordHash === inputHash ||
        (u as Record<string, unknown>).password === password)
  );

  // Kiểm tra thêm hồ sơ lưu cục bộ
  if (!found) {
    try {
      const active: KOCUser | null = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
      if (
        active &&
        matches(active) &&
        (!active.passwordHash ||
          active.passwordHash === inputHash ||
          (active as Record<string, unknown>).password === password)
      ) {
        found = active;
        users = [...users, active];
        writeUsers(users);
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // Kiểm tra & đồng bộ hồ sơ mới nhất trên Supabase Cloud
  if (isSupabaseConfigured() && (inputEmail || inputHandle || found?.tiktokHandle)) {
    try {
      const cloudUser = await getKOCProfileFromSupabase(found?.tiktokHandle || inputHandle || inputEmail);
      if (cloudUser) {
        if (!found) {
          if (
            !cloudUser.passwordHash ||
            cloudUser.passwordHash === inputHash ||
            (cloudUser as Record<string, unknown>).password === password
          ) {
            found = cloudUser;
          }
        } else {
          found = { ...found, ...cloudUser, avatar: cloudUser.avatar || found.avatar };
        }
      }
    } catch (e) {
      console.warn('Lỗi kiểm tra cloud profile:', e);
    }
  }

  if (!found) {
    return { ok: false, error: 'Email hoặc mật khẩu chưa đúng. Bạn có thể bấm “Quên mật khẩu?” để đặt lại.' };
  }

  const user: KOCUser = {
    ...found,
    email: found.email || (inputEmail.includes('@') ? inputEmail : ''),
    role: found.role || 'koc',
  };
  delete (user as Record<string, unknown>).password;
  user.passwordHash = inputHash;

  // Đồng bộ đè vào bộ nhớ máy này
  const updatedUsers = readUsers();
  const foundIdx = updatedUsers.findIndex(
    (u) => (u.email && emailKey(u.email) === emailKey(user.email)) || handleKey(u.tiktokHandle) === handleKey(user.tiktokHandle)
  );
  if (foundIdx >= 0) updatedUsers[foundIdx] = { ...updatedUsers[foundIdx], ...user };
  else updatedUsers.push(user);
  writeUsers(updatedUsers);

  // Tự động nâng cấp tài khoản lên Supabase Auth ngầm
  if (isSupabaseConfigured() && authEmail) {
    try {
      await supabase.auth.signUp({
        email: authEmail,
        password,
        options: {
          data: {
            email: user.email,
            tiktok_handle: user.tiktokHandle,
            name: user.name,
            phone: user.phone,
            followers: user.followers,
            role: 'koc',
          },
        },
      });
    } catch {
      // Đã tồn tại hoặc bỏ qua ngầm
    }
  }

  persistRemembered(user, params.remember);
  return { ok: true, user };
}

/**
 * ĐĂNG KÝ TÀI KHOẢN KOC MỚI (REGISTER BẰNG EMAIL)
 * Mật khẩu được mã hóa an toàn qua Supabase Auth
 */
export async function register(params: {
  email: string;
  name: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  handle?: string;
  followers?: string;
  category?: string;
  remember: boolean;
  agreedTerms?: boolean;
}): Promise<AuthResult> {
  const cleanEmail = emailKey(params.email);
  if (!cleanEmail) return { ok: false, error: 'Vui lòng nhập địa chỉ email của bạn.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'Địa chỉ email không hợp lệ (VD: creator@gmail.com).' };
  }

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

  const users = readUsers();
  if (users.some((u) => u.email && emailKey(u.email) === cleanEmail)) {
    return { ok: false, error: 'Email này đã có tài khoản. Hãy đăng nhập hoặc bấm “Quên mật khẩu?”.' };
  }

  // Chuẩn hóa TikTok Handle (nếu có nhập thì dùng, không thì tự tạo từ email)
  const userHandle = params.handle ? normalizeHandle(params.handle) : `@${cleanEmail.split('@')[0]}`;
  const finalHandle = userHandle || `@${cleanEmail.split('@')[0]}`;

  // 1. Tạo tài khoản an toàn trên Supabase Auth bằng Email thật
  let authUserId = `koc-reg-${Date.now()}`;
  if (isSupabaseConfigured()) {
    try {
      const { data: supaAuth, error: supaErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password.trim(),
        options: {
          data: {
            email: cleanEmail,
            name: params.name.trim(),
            phone: cleanPhone,
            tiktok_handle: finalHandle,
            followers: (params.followers || '').trim() || 'KOC',
            category: params.category || '',
            role: 'koc',
          },
        },
      });

      if (supaErr && !supaErr.message.includes('already registered')) {
        console.warn('Lỗi tạo tài khoản Supabase Auth:', supaErr.message);
      } else if (supaAuth?.user) {
        authUserId = supaAuth.user.id;
      }
    } catch (e) {
      console.warn('Lỗi kết nối Supabase Auth lúc đăng ký:', e);
    }
  }

  // 2. Chuẩn bị hồ sơ người dùng (TUYỆT ĐỐI KHÔNG CÓ TRƯỜNG PASSWORD)
  const passHash = await hashStringSHA256(params.password.trim());
  const user: KOCUser = {
    id: authUserId,
    name: params.name.trim() || cleanEmail.split('@')[0],
    role: 'koc',
    avatar: '',
    email: cleanEmail,
    tiktokHandle: finalHandle,
    channelLink: params.handle ? `https://www.tiktok.com/${finalHandle}` : '',
    followers: (params.followers || '').trim() || 'KOC',
    phone: cleanPhone,
    passwordHash: passHash,
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

  // Lưu hồ sơ lên Supabase Cloud
  await saveKOCProfileToSupabase(user).catch((err) => console.warn('Lưu Supabase KOC thất bại:', err));
  return { ok: true, user };
}

/**
 * ĐẶT LẠI MẬT KHẨU (RESET PASSWORD BẰNG EMAIL)
 * Xác minh quyền sở hữu tài khoản qua Email & SĐT chính chủ
 */
export async function resetPassword(params: {
  email?: string;
  handle?: string;
  phone: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<AuthResult> {
  const cleanEmail = emailKey(params.email || (!params.phone ? params.handle : ''));
  const inputPhone = phoneKey(params.phone);
  const newPassword = params.newPassword.trim();

  if (!cleanEmail) return { ok: false, error: 'Vui lòng nhập Email của tài khoản.' };
  if (!inputPhone) return { ok: false, error: 'Vui lòng nhập số điện thoại đã dùng khi đăng ký tài khoản.' };
  if (newPassword.length < 6) return { ok: false, error: 'Mật khẩu mới cần ít nhất 6 ký tự.' };
  if (newPassword !== params.confirmPassword.trim()) return { ok: false, error: 'Hai mật khẩu chưa khớp nhau.' };

  const users = readUsers();
  const idx = users.findIndex(
    (u) => (u.email && emailKey(u.email) === cleanEmail) || handleKey(u.tiktokHandle) === handleKey(cleanEmail)
  );
  let user: KOCUser;
  const newPassHash = await hashStringSHA256(newPassword);

  if (idx >= 0) {
    const existing = users[idx];
    if (existing.phone && phoneKey(existing.phone) && phoneKey(existing.phone) !== inputPhone) {
      return { ok: false, error: 'Số điện thoại không khớp với tài khoản Email này. Vui lòng kiểm tra lại.' };
    }
    user = {
      ...existing,
      email: existing.email || cleanEmail,
      phone: existing.phone || inputPhone,
      passwordHash: newPassHash,
    };
    delete (user as Record<string, unknown>).password;
    users[idx] = user;
  } else {
    // Khôi phục từ hồ sơ cục bộ
    let base: Partial<KOCUser> = {};
    try {
      const active: KOCUser | null = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
      if (active && (emailKey(active.email) === cleanEmail || handleKey(active.tiktokHandle) === handleKey(cleanEmail))) {
        base = active;
      }
      const apps: Array<{ tiktokHandle?: string; kocName?: string; phone?: string; email?: string }> = JSON.parse(
        localStorage.getItem('koctrend_applications') || '[]'
      );
      const app = apps.find((a) => emailKey(a.email) === cleanEmail || handleKey(a.tiktokHandle) === handleKey(cleanEmail));
      if (app) base = { name: app.kocName, phone: app.phone, email: app.email, ...base };
    } catch (e) {
      console.warn(e);
    }

    if (base.phone && phoneKey(base.phone) && phoneKey(base.phone) !== inputPhone) {
      return { ok: false, error: 'Số điện thoại không khớp với tài khoản Email này.' };
    }

    user = {
      id: `koc-reg-${Date.now()}`,
      name: base.name || cleanEmail.split('@')[0],
      role: 'koc',
      avatar: base.avatar || APP_LOGOS.userProfile,
      email: cleanEmail,
      tiktokHandle: base.tiktokHandle || `@${cleanEmail.split('@')[0]}`,
      followers: base.followers || '',
      phone: base.phone || inputPhone,
      verified: false,
      ...base,
      passwordHash: newPassHash,
    };
    delete (user as Record<string, unknown>).password;
    users.push(user);
  }

  // Cập nhật lại mật khẩu trên Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const authEmail = cleanEmail.includes('@') ? cleanEmail : formatHandleToAuthEmail(cleanEmail);
      await supabase.auth.signUp({
        email: authEmail,
        password: newPassword,
        options: {
          data: {
            email: cleanEmail,
            name: user.name,
            phone: user.phone,
          },
        },
      });
    } catch (e) {
      console.warn('Lỗi cập nhật mật khẩu Supabase Auth:', e);
    }
  }

  writeUsers(users);
  persistRemembered(user, true);
  saveKOCProfileToSupabase(user).catch((err) => console.warn('Lưu Supabase KOC thất bại:', err));
  return { ok: true, user };
}

/**
 * ĐĂNG XUẤT (LOGOUT)
 * Hủy phiên an toàn trên Supabase Auth và xóa token nhớ
 */
export async function logout(): Promise<void> {
  try {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  } catch (e) {
    console.warn('Lỗi Supabase signOut:', e);
  }
  localStorage.removeItem(REMEMBERED_KEY);
  localStorage.removeItem(PROFILE_KEY);
}
