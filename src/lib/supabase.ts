import { createClient } from '@supabase/supabase-js';

// Đọc thông tin kết nối từ biến môi trường Vite (.env) hoặc fallback dự phòng ổn định
const DEFAULT_SUPABASE_URL = 'https://mjsmnkelreniasahhfkf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_NWcv9pPeRzu-884jDEeW9w_Si3trWfH';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Kiểm tra xem người dùng đã cấu hình Supabase thực tế chưa
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
};

// Khởi tạo Supabase client an toàn
// Nếu chưa cấu hình, fallback sang client rỗng để tránh crash ứng dụng
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
