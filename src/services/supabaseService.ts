import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Campaign, KOCApplication } from '../types';

/**
 * Service giao tiếp với cơ sở dữ liệu Supabase đám mây cho Kocity
 * Hỗ trợ đồng bộ dữ liệu thời gian thực (Realtime 2 chiều) giữa Quản trị viên và KOC
 */

// Danh sách các cột thực tế có trong bảng public.campaigns trên Supabase
const VALID_CAMPAIGN_COLUMNS = new Set([
  'id',
  'code',
  'title',
  'brandName',
  'brandLogo',
  'category',
  'daysLeft',
  'platform',
  'followerRequirement',
  'benefits',
  'totalSpots',
  'registeredSpots',
  'urgent',
  'approvalRate',
  'description',
  'fullPrice',
  'bookingFee',
  'commissionRate',
  'productHeroImage',
  'galleryImages',
  'uspList',
  'storySteps',
  'hashtags',
  'cartBrandName',
  'tiktokUrl',
  'tiktokHandle',
  'timeline',
  'created_at',
]);

/**
 * Lọc sạch payload trước khi gửi lên Supabase để tránh lỗi PGRST204 (Cột không tồn tại)
 * Bảo toàn các trường mở rộng (endDate, startDate, sampleProducts) bằng cách đóng gói vào timeline metadata
 */
export function sanitizeCampaignForSupabase(campaign: Partial<Campaign>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(campaign)) {
    if (VALID_CAMPAIGN_COLUMNS.has(key)) {
      payload[key] = value;
    }
  }

  // Đóng gói metadata cho endDate, startDate, sampleProducts vào timeline
  const existingTimeline: unknown[] = Array.isArray(campaign.timeline) ? [...campaign.timeline] : [];
  // Lọc bỏ metadata cũ nếu có
  const cleanTimeline = existingTimeline.filter(
    (item) => !item || typeof item !== 'object' || !('__metadata' in (item as Record<string, unknown>))
  );

  cleanTimeline.push({
    __metadata: true,
    endDate: campaign.endDate || null,
    startDate: campaign.startDate || null,
    sampleProducts: campaign.sampleProducts || [],
  });

  payload.timeline = cleanTimeline;
  return payload;
}

/**
 * Phục hồi các trường mở rộng (endDate, startDate, sampleProducts) từ Supabase về Campaign
 */
export function parseCampaignFromSupabase(raw: Record<string, unknown>): Campaign {
  const camp = { ...raw } as unknown as Campaign;

  if (Array.isArray(camp.timeline)) {
    const timelineList = camp.timeline as unknown as Record<string, unknown>[];
    const metaItem = timelineList.find(
      (item) => item && typeof item === 'object' && '__metadata' in item
    );

    if (metaItem) {
      if (metaItem.endDate && typeof metaItem.endDate === 'string') {
        camp.endDate = metaItem.endDate;
      }
      if (metaItem.startDate && typeof metaItem.startDate === 'string') {
        camp.startDate = metaItem.startDate;
      }
      if (Array.isArray(metaItem.sampleProducts) && metaItem.sampleProducts.length > 0) {
        camp.sampleProducts = metaItem.sampleProducts as Campaign['sampleProducts'];
      }
      // Dọn dẹp metadata khỏi timeline hiển thị
      camp.timeline = camp.timeline.filter(
        (item) => !item || typeof item !== 'object' || !('__metadata' in item)
      );
    }
  }

  return camp;
}

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

    if (!data) return [];
    return data.map((item) => parseCampaignFromSupabase(item as Record<string, unknown>));
  } catch (err) {
    console.error('Lỗi kết nối Supabase campaigns:', err);
    return null;
  }
}

// 2. Thêm chiến dịch mới lên Supabase
export async function createCampaignOnSupabase(campaign: Campaign): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const payload = sanitizeCampaignForSupabase(campaign);
    const { error } = await supabase.from('campaigns').insert([payload]);
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
    const payload = sanitizeCampaignForSupabase(updatedData);
    // Bỏ trường id khỏi payload update để an toàn
    delete payload.id;

    const { error } = await supabase
      .from('campaigns')
      .update(payload)
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

// 2.3 Tăng số lượng KOC đã đăng ký (registeredSpots) của chiến dịch trên Supabase
export async function incrementCampaignRegisteredSpotsOnSupabase(
  campaignId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { data: currentCamp } = await supabase
      .from('campaigns')
      .select('registeredSpots, totalSpots')
      .eq('id', campaignId)
      .maybeSingle();

    if (currentCamp) {
      const nextSpots = Math.min(
        currentCamp.totalSpots || 999,
        (currentCamp.registeredSpots || 0) + 1
      );
      await supabase
        .from('campaigns')
        .update({ registeredSpots: nextSpots })
        .eq('id', campaignId);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Lỗi tăng registeredSpots trên Supabase:', err);
    return false;
  }
}

// 2.4 Lắng nghe thay đổi thời gian thực cho Bảng Chiến Dịch (Realtime Campaigns)
// Khi Admin sửa chiến dịch/đổi ảnh hoặc KOC đăng ký, tất cả mọi người đang mở web đều thấy ngay
export function subscribeToCampaignsRealtime(
  onInsert?: (newCampaign: Campaign) => void,
  onUpdate?: (updatedCampaign: Campaign) => void,
  onDelete?: (deletedId: string) => void
) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('realtime_campaigns_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'campaigns',
      },
      (payload) => {
        if (payload.new && (payload.new as { id?: string }).id !== '__SITE_CONFIG__') {
          const parsed = parseCampaignFromSupabase(payload.new as Record<string, unknown>);
          if (onInsert) onInsert(parsed);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'campaigns',
      },
      (payload) => {
        if (payload.new && (payload.new as { id?: string }).id !== '__SITE_CONFIG__') {
          const parsed = parseCampaignFromSupabase(payload.new as Record<string, unknown>);
          if (onUpdate) onUpdate(parsed);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'campaigns',
      },
      (payload) => {
        if (payload.old && (payload.old as { id?: string }).id !== '__SITE_CONFIG__') {
          const delId = (payload.old as { id?: string }).id;
          if (delId && onDelete) onDelete(delId);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
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

// 6. Lắng nghe cập nhật thời gian thực (Realtime Subscription) cho Đơn ứng tuyển
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
