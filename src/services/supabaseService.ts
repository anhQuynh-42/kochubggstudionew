import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Campaign, KOCApplication } from '../types';

/**
 * Service giao tiếp với cơ sở dữ liệu Supabase đám mây cho Kocity
 */

// 1. Lấy danh sách chiến dịch từ Supabase
export async function getCampaignsFromSupabase(): Promise<Campaign[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .neq('id', '__SITE_CONFIG__')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Lỗi khi lấy danh sách chiến dịch từ Supabase:', error.message);
      return null;
    }

    return (data as unknown as Campaign[]) || [];
  } catch (err) {
    console.error('Lỗi kết nối Supabase campaigns:', err);
    return null;
  }
}

// 2. Thêm chiến dịch mới lên Supabase
export async function createCampaignOnSupabase(campaign: Campaign): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('campaigns').insert([campaign]);
    if (error) {
      console.error('Lỗi khi thêm chiến dịch lên Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Lỗi thêm chiến dịch:', err);
    return false;
  }
}

// 2.1 Cập nhật chiến dịch trên Supabase
export async function updateCampaignOnSupabase(
  campaignId: string,
  updatedData: Partial<Campaign>
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('campaigns')
      .update(updatedData)
      .eq('id', campaignId);
    if (error) {
      console.error('Lỗi khi cập nhật chiến dịch trên Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Lỗi cập nhật chiến dịch:', err);
    return false;
  }
}

// 2.2 Xóa chiến dịch trên Supabase
export async function deleteCampaignOnSupabase(campaignId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId);
    if (error) {
      console.error('Lỗi khi xóa chiến dịch trên Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Lỗi xóa chiến dịch:', err);
    return false;
  }
}

// 3. Lấy danh sách hồ sơ KOC ứng tuyển từ Supabase
export async function getApplicationsFromSupabase(): Promise<KOCApplication[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Lỗi khi lấy danh sách ứng tuyển từ Supabase:', error.message);
      return null;
    }

    return (data as unknown as KOCApplication[]) || [];
  } catch (err) {
    console.error('Lỗi kết nối Supabase applications:', err);
    return null;
  }
}

// 4. KOC gửi đơn nộp xin mẫu mới lên Supabase
export async function submitApplicationToSupabase(application: KOCApplication): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('applications').insert([application]);
    if (error) {
      console.error('Lỗi khi nộp đơn lên Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Lỗi nộp đơn:', err);
    return false;
  }
}

// 5. Quản trị viên cập nhật trạng thái đơn (Duyệt, Gửi mẫu, Gắn mã vận đơn...)
export async function updateApplicationStatusOnSupabase(
  applicationId: string,
  updates: Partial<KOCApplication>
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', applicationId);

    if (error) {
      console.error('Lỗi khi cập nhật trạng thái đơn:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Lỗi cập nhật:', err);
    return false;
  }
}

// 6. Lắng nghe cập nhật thời gian thực (Realtime Subscription)
// Khi có KOC nộp đơn mới hoặc Admin duyệt đơn, màn hình tự cập nhật mà không cần F5
export function subscribeToApplicationsRealtime(
  onInsert?: (newApp: KOCApplication) => void,
  onUpdate?: (updatedApp: KOCApplication) => void
) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('realtime_applications_channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'applications' },
      (payload) => {
        if (onInsert && payload.new) {
          onInsert(payload.new as KOCApplication);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'applications' },
      (payload) => {
        if (onUpdate && payload.new) {
          onUpdate(payload.new as KOCApplication);
        }
      }
    )
    .subscribe();

  // Trả về hàm hủy đăng ký khi component unmount
  return () => {
    supabase.removeChannel(channel);
  };
}

// 7. Lấy ảnh Banner đầu trang (Hero Image) từ cấu hình đám mây Supabase
export async function getHeroBannerFromSupabase(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('productHeroImage')
      .eq('id', '__SITE_CONFIG__')
      .maybeSingle();

    if (error || !data) return null;
    return data.productHeroImage || null;
  } catch (err) {
    console.error('Lỗi lấy Hero Banner từ Supabase:', err);
    return null;
  }
}

// 8. Lưu ảnh Banner đầu trang lên Supabase (Đồng bộ cho tất cả người dùng xem web)
export async function saveHeroBannerToSupabase(imageUrl: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const payload = {
      id: '__SITE_CONFIG__',
      code: 'CONFIG',
      title: 'Site Configuration',
      brandName: 'KOCITY',
      category: 'SYSTEM_CONFIG',
      productHeroImage: imageUrl,
    };

    const { error } = await supabase.from('campaigns').upsert(payload);
    if (error) {
      console.error('Lỗi khi lưu Hero Banner lên Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Lỗi lưu Hero Banner:', err);
    return false;
  }
}

// 9. Khôi phục ảnh Banner về mặc định trên Supabase
export async function deleteHeroBannerFromSupabase(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('campaigns').delete().eq('id', '__SITE_CONFIG__');
    if (error) {
      console.error('Lỗi khi xóa cấu hình Hero Banner trên Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Lỗi xóa cấu hình Hero Banner:', err);
    return false;
  }
}

// 10. Lắng nghe cập nhật Hero Banner theo thời gian thực (Realtime)
// Khi Quản trị viên đổi ảnh, tất cả người dùng đang mở web sẽ tự đổi ảnh tức thì
export function subscribeToHeroBannerRealtime(onBannerUpdate: (newUrl: string | null) => void) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('realtime_hero_banner_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'campaigns',
        filter: 'id=eq.__SITE_CONFIG__',
      },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          onBannerUpdate(null);
        } else if (payload.new && (payload.new as { productHeroImage?: string }).productHeroImage) {
          onBannerUpdate((payload.new as { productHeroImage?: string }).productHeroImage || null);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
