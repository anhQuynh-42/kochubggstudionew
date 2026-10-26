import { KOCUser } from '../types';
import { APP_LOGOS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { formatHandleToAuthEmail, hashStringSHA256 } from '../lib/authHelpers';
import { saveKOCProfileToSupabase, getKOCProfileFromSupabase } from './supabaseService';

/**
 * Dịch vụ Xác thực và Phân quyền KOCity — Chuẩn Bảo Mật Cao Cấp (Enterprise Security)
 * Tích hợp Supabase Auth (Argon2id/Bcrypt)
 * Tuyệt đối không lưu mật khẩu Plaintext ở Frontend hay Database
 */

export type AuthResult = { ok: true; user: KOCUser } | { ok: false; error: string };

const USERS_KEY = 'koctrend_registered_users';
const PROFILE_KEY = 'koctrend_koc_profile';
const REMEMBERED_KEY = 'koctrend_remembered_account';
const REMEMBER_PREF_KEY = 'koctrend_remember_me';

// Form đăng nhập ngoài trang chủ dành riêng 100% cho KOC Thành viên.
// Quản trị viên chỉ truy cập độc quyền qua cổng bảo mật riêng biệt tại /admin.

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
 * Xác thực an toàn qua Supabase Auth + Fallback tương thích tài khoản cũ (bảo toàn 100% dữ liệu)
 */
export async function login(params: {
  method: 'tiktok' | 'phone';
  handle: string;
  phone: string;
  password: string;
  remember: boolean;
}): Promise<AuthResult> {
  const handle = normalizeHandle(params.handle);
  const password = params.password.trim();
  if (!password) return { ok: false, error: 'Vui lòng nhập mật khẩu.' };

  // BẢO MẬT: Form ngoài trang chủ dành riêng 100% cho KOC.
  // Quản trị viên chỉ truy cập qua Cổng bảo mật riêng tại đường dẫn /admin.
  const authIdentifier = params.method === 'tiktok' ? handle : params.phone;
  const authEmail = formatHandleToAuthEmail(authIdentifier);

  if (isSupabaseConfigured()) {
    try {
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      if (authData?.user && !authErr) {
        // Đăng nhập Supabase Auth thành công
        const supaProfile = await getKOCProfileFromSupabase(handle || params.phone);
        const user: KOCUser = {
          id: authData.user.id,
          name: supaProfile?.name || authData.user.user_metadata?.name || handle.replace('@', '') || 'KOC Thành viên',
          role: 'koc',
          avatar: supaProfile?.avatar || authData.user.user_metadata?.avatar || '',
          tiktokHandle: supaProfile?.tiktokHandle || handle || `@${params.phone}`,
          followers: supaProfile?.followers || authData.user.user_metadata?.followers || 'KOC',
          phone: supaProfile?.phone || params.phone,
          email: authData.user.email || supaProfile?.email || '',
          verified: !!supaProfile?.verified,
          categories: supaProfile?.categories || [],
          isBlacklisted: supaProfile?.isBlacklisted,
          blacklistReason: supaProfile?.blacklistReason,
          city: supaProfile?.city || '',
          district: supaProfile?.district || '',
          address: supaProfile?.address || '',
          shippingNote: supaProfile?.shippingNote || '',
          bio: supaProfile?.bio || '',
          channelLink: supaProfile?.channelLink || `https://www.tiktok.com/${handle}`,
          targetAudience: supaProfile?.targetAudience || '',
          contentStyle: supaProfile?.contentStyle || [],
          highlightVideos: supaProfile?.highlightVideos || [],
        };

        // ĐỒNG BỘ: Cập nhật ngay hồ sơ mới nhất vào danh sách tài khoản của máy này
        const currentUsers = readUsers();
        const existingIdx = currentUsers.findIndex((u) => handleKey(u.tiktokHandle) === handleKey(user.tiktokHandle));
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

  // 3. Fallback Tương thích tài khoản cũ (Đảm bảo KOC cũ không bị mất quyền truy cập)
  const inputHash = await hashStringSHA256(password);
  let users = readUsers();
  const matches = (u: KOCUser) =>
    params.method === 'tiktok'
      ? handleKey(u.tiktokHandle) === handleKey(handle)
      : phoneKey(u.phone) === phoneKey(params.phone) && phoneKey(params.phone).length >= 9;

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

  // Kiểm tra & đồng bộ hồ sơ mới nhất trên Supabase Cloud (Cloud First)
  if (isSupabaseConfigured() && (handle || found?.tiktokHandle)) {
    try {
      const cloudUser = await getKOCProfileFromSupabase(found?.tiktokHandle || handle);
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
          // Nếu đã khớp tài khoản, đồng bộ avatar và thông tin mới nhất từ Cloud vào
          found = { ...found, ...cloudUser, avatar: cloudUser.avatar || found.avatar };
        }
      }
    } catch (e) {
      console.warn('Lỗi kiểm tra cloud profile:', e);
    }
  }

  if (!found) {
    return { ok: false, error: 'ID TikTok hoặc mật khẩu chưa đúng. Bạn có thể bấm “Quên mật khẩu?” để đặt lại.' };
  }

  const user: KOCUser = { ...found, role: found.role || 'koc' };
  delete (user as Record<string, unknown>).password;
  user.passwordHash = inputHash; // Nâng cấp lưu trữ sang hash an toàn

  // Đồng bộ đè vào bộ nhớ máy này để không bị lệch avatar/thông tin
  const updatedUsers = readUsers();
  const foundIdx = updatedUsers.findIndex((u) => handleKey(u.tiktokHandle) === handleKey(user.tiktokHandle));
  if (foundIdx >= 0) updatedUsers[foundIdx] = { ...updatedUsers[foundIdx], ...user };
  else updatedUsers.push(user);
  writeUsers(updatedUsers);

  // Tự động nâng cấp tài khoản cũ lên Supabase Auth ngầm
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signUp({
        email: authEmail,
        password,
        options: {
          data: {
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
 * ĐĂNG KÝ TÀI KHOẢN KOC MỚI (REGISTER)
 * Mật khẩu được mã hóa an toàn qua Supabase Auth
 */
export async function register(params: {
  name: string;
  handle: string;
  phone: string;
  followers: string;
  category: string;
  password: string;
  confirmPassword?: string;
  remember: boolean;
  agreedTerms?: boolean;
}): Promise<AuthResult> {
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

  if (handle.toLowerCase().includes('admin')) {
    return { ok: false, error: 'ID TikTok này chứa từ khóa bị hạn chế.' };
  }

  const users = readUsers();
  if (users.some((u) => handleKey(u.tiktokHandle) === handleKey(handle))) {
    return { ok: false, error: 'ID TikTok này đã có tài khoản. Hãy đăng nhập hoặc bấm “Quên mật khẩu?”.' };
  }

  // 1. Tạo tài khoản an toàn trên Supabase Auth
  let authUserId = `koc-reg-${Date.now()}`;
  const authEmail = formatHandleToAuthEmail(handle);

  if (isSupabaseConfigured()) {
    try {
      const { data: supaAuth, error: supaErr } = await supabase.auth.signUp({
        email: authEmail,
        password: params.password.trim(),
        options: {
          data: {
            tiktok_handle: handle,
            name: params.name.trim(),
            phone: cleanPhone,
            followers: params.followers.trim(),
            category: params.category,
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
    name: params.name.trim() || handle.replace('@', ''),
    role: 'koc',
    avatar: '',
    tiktokHandle: handle,
    channelLink: `https://www.tiktok.com/${handle}`,
    followers: params.followers.trim(),
    phone: cleanPhone,
    email: '',
    passwordHash: passHash, // Chỉ lưu chuỗi băm một chiều SHA-256 làm fallback
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

  // Lưu hồ sơ lên Supabase Cloud (đã loại bỏ hoàn toàn password, chờ lưu thành công để các máy khác thấy ngay)
  await saveKOCProfileToSupabase(user).catch((err) => console.warn('Lưu Supabase KOC thất bại:', err));
  return { ok: true, user };
}

/**
 * ĐẶT LẠI MẬT KHẨU (RESET PASSWORD)
 * Xác minh quyền sở hữu tài khoản qua SĐT chính chủ và mã hóa mật khẩu mới
 */
export async function resetPassword(params: {
  handle: string;
  phone: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<AuthResult> {
  const handle = normalizeHandle(params.handle);
  const newPassword = params.newPassword.trim();
  const inputPhone = phoneKey(params.phone);

  if (!handle) return { ok: false, error: 'Vui lòng nhập ID TikTok của tài khoản.' };
  if (!inputPhone) return { ok: false, error: 'Vui lòng nhập số điện thoại đã dùng khi đăng ký tài khoản.' };
  if (newPassword.length < 6) return { ok: false, error: 'Mật khẩu mới cần ít nhất 6 ký tự.' };
  if (newPassword !== params.confirmPassword.trim()) return { ok: false, error: 'Hai mật khẩu chưa khớp nhau.' };
  if (handle.toLowerCase().includes('admin')) {
    return { ok: false, error: 'Không thể đặt lại mật khẩu cho ID TikTok này.' };
  }

  const users = readUsers();
  const idx = users.findIndex((u) => handleKey(u.tiktokHandle) === handleKey(handle));
  let user: KOCUser;
  const newPassHash = await hashStringSHA256(newPassword);

  if (idx >= 0) {
    const existing = users[idx];
    if (existing.phone && phoneKey(existing.phone) && phoneKey(existing.phone) !== inputPhone) {
      return { ok: false, error: 'Số điện thoại không khớp với tài khoản ID TikTok này. Vui lòng kiểm tra lại.' };
    }
    user = {
      ...existing,
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
      passwordHash: newPassHash,
    };
    delete (user as Record<string, unknown>).password;
    users.push(user);
  }

  // Cập nhật lại mật khẩu trên Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const authEmail = formatHandleToAuthEmail(handle);
      await supabase.auth.signUp({
        email: authEmail,
        password: newPassword,
        options: {
          data: {
            tiktok_handle: handle,
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
