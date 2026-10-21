import { Campaign, KOCApplication, LiveActivityItem } from '../types';
import { getApplicationProgress } from './applicationStatus';

/**
 * Che tên KOC để hiển thị công khai trên Live Ticker.
 * "Nguyễn Minh Thư" → "Thư N." ; "minhthu.beauty" → "mi***"
 */
export function maskName(fullName: string): string {
  const words = fullName.trim().replace(/^@/, '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'Một KOC';
  if (words.length === 1) return `${words[0].slice(0, 2)}***`;
  return `${words[words.length - 1]} ${words[0].charAt(0).toUpperCase()}.`;
}

/** Lấy tỉnh/thành từ địa chỉ dạng "Số nhà, Phường, Quận, Tỉnh" (phần cuối cùng) */
function extractCity(address: string): string {
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

function formatDateLabel(createdAtDate: string): string {
  if (!createdAtDate) return '';
  if (createdAtDate === new Date().toLocaleDateString('vi-VN')) return 'Hôm nay';
  const [day, month] = createdAtDate.split('/');
  return day && month ? `${day}/${month}` : createdAtDate;
}

/**
 * Dựng danh sách hoạt động thật cho Live Ticker từ các đơn đã nộp.
 * - Chỉ dùng tên đã che + tỉnh/thành, KHÔNG đưa SĐT, email, địa chỉ chi tiết ra ngoài.
 * - Bỏ qua đơn "Chưa được chọn" (không công khai kết quả không tích cực của KOC).
 * - Không tạo hoạt động giả: ít dữ liệu thì trả về ít (hoặc rỗng).
 */
export function buildLiveActivity(
  applications: KOCApplication[],
  campaigns: Campaign[],
  limit = 12
): LiveActivityItem[] {
  const brandByCampaign = new Map(campaigns.map((c) => [c.id, c.brandName]));
  const items: LiveActivityItem[] = [];

  for (const app of applications) {
    if (items.length >= limit) break;
    const { selection, video } = getApplicationProgress(app);
    if (selection === 'not_selected') continue;

    items.push({
      id: app.id,
      displayName: maskName(app.kocName || app.tiktokHandle || ''),
      city: extractCity(app.address || ''),
      brandName: brandByCampaign.get(app.campaignId) || app.campaignName,
      action: selection === 'pending' ? 'applied' : video === 'posted' ? 'posted' : 'selected',
      dateLabel: formatDateLabel(app.createdAtDate),
    });
  }

  return items;
}

export const LIVE_ACTION_TEXT: Record<LiveActivityItem['action'], string> = {
  applied: 'vừa đăng ký nhận mẫu',
  selected: 'được Brand chọn gửi mẫu',
  posted: 'đã lên video cho',
};
