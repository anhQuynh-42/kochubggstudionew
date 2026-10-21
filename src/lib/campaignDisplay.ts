import { Campaign } from '../types';

/** Chiến dịch có tặng mẫu 0đ (Freecast) hay không */
export function hasFreeSample(campaign: Campaign): boolean {
  if (campaign.benefits.some((b) => b.type === 'sample')) return true;
  return /free|0đ|mẫu|sample/i.test(campaign.bookingFee || '');
}

/**
 * Chuẩn hóa yêu cầu kênh về dạng "≥ 1.000 followers".
 * Dữ liệu đang có nhiều kiểu viết: ">1.000 Followers", "≥ 2.000 Followers", ">= 1.000"...
 * Nếu không có con số (VD: "Không yêu cầu Follower") thì giữ nguyên câu gốc.
 */
export function formatFollowerRequirement(requirement: string): string {
  const match = requirement.match(/(\d{1,3}(?:[.,]\d{3})+|\d+\s*[kK]|\d+)/);
  if (!match) return requirement.trim();
  const value = match[1].replace(/\s/g, '').replace(/k$/i, 'K');
  return `≥ ${value} followers`;
}

/** Nhãn hoa hồng ngắn gọn, ưu tiên `commissionRate`, sau đó tìm trong danh sách quyền lợi */
export function getCommissionLabel(campaign: Campaign): string | null {
  if (campaign.commissionRate?.trim()) return campaign.commissionRate.trim();
  const fromBenefit = campaign.benefits.find((b) => b.type === 'commission' || b.label.includes('%'));
  const match = fromBenefit?.label.match(/\d+(?:[.,]\d+)?\s*%(?:\s*-\s*\d+(?:[.,]\d+)?\s*%)?/);
  return match ? match[0].replace(/\s+/g, ' ') : null;
}

export interface ScarcityInfo {
  spotsLeft: number;
  totalSpots: number;
  /** Phần trăm suất CÒN LẠI (0–100) để vẽ thanh tiến độ */
  remainingPercent: number;
  isFull: boolean;
  /** Còn ≤ 20% suất (hoặc ≤ 3 suất) → nhấn mạnh "Sắp hết" */
  isAlmostFull: boolean;
}

export function getScarcity(campaign: Campaign): ScarcityInfo {
  const totalSpots = Math.max(0, campaign.totalSpots);
  const spotsLeft = Math.max(0, totalSpots - campaign.registeredSpots);
  const remainingPercent = totalSpots > 0 ? Math.round((spotsLeft / totalSpots) * 100) : 0;
  const isFull = spotsLeft <= 0;
  return {
    spotsLeft,
    totalSpots,
    remainingPercent,
    isFull,
    isAlmostFull: !isFull && (remainingPercent <= 20 || spotsLeft <= 3),
  };
}
