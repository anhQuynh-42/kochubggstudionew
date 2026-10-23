import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Campaign } from '../../types';
import { calculateDaysLeft } from '../../state/AppDataContext';
import { formatFollowerRequirement, getCommissionLabel, getScarcity, hasFreeSample } from '../../lib/campaignDisplay';
import { ROUTES } from '../../lib/constants';
import { Button, Icon, cx } from '../ui';

interface CampaignCardProps {
  campaign: Campaign;
  isBookmarked: boolean;
  hasApplied: boolean;
  onApply: () => void;
  onToggleBookmark: () => void;
}

/** Thẻ chiến dịch chuẩn TikTok Shop (CLAUDE.md 8.2): Mẫu 0đ · % Hoa hồng · Yêu cầu kênh + độ khan hiếm + nút 1 chạm */
export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign: c, isBookmarked, hasApplied, onApply, onToggleBookmark }) => {
  const navigate = useNavigate();
  const scarcity = getScarcity(c);
  const commission = getCommissionLabel(c);
  const freeSample = hasFreeSample(c);
  const followerReq = formatFollowerRequirement(c.followerRequirement);
  const followerValue = followerReq.startsWith('≥') ? followerReq.replace(/ followers$/, '') : 'Mọi kênh';
  const daysLeft = calculateDaysLeft(c.endDate, c.daysLeft);
  const href = ROUTES.campaign(c.id);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    navigate(href);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleBookmark();
  };

  return (
    <article
      onClick={handleCardClick}
      className="card-fx group flex flex-col rounded-[28px] bg-white ring-1 ring-slate-200/70 hover:ring-violet-300 hover:shadow-lg transition-all cursor-pointer"
    >
      <Link to={href} className="relative block aspect-[16/10] overflow-hidden bg-slate-100" aria-label={`Xem chi tiết ${c.brandName}`}>
        <img
          src={c.productHeroImage}
          alt=""
          loading="lazy"
          className={cx(
            'h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]',
            scarcity.isFull && 'grayscale-[25%] contrast-[95%]'
          )}
        />

        {/* Lớp phủ ảnh: Mờ nhẹ sang trọng tạo cảm giác "cháy hàng" */}
        {scarcity.isFull && (
          <span className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px] z-[5]" />
        )}

        {/* Đóng con dấu / Badge đỏ rực: [ ⛔ FULL 100/100 · NGƯNG NHẬN KOC ] */}
        {scarcity.isFull && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-3 pointer-events-none">
            <div className="rotate-[-6deg] rounded-xl border-2 border-dashed border-white/95 bg-rose-600/95 px-3 py-1.5 text-center text-white shadow-2xl backdrop-blur-md ring-4 ring-rose-500/40">
              <p className="flex items-center justify-center gap-1.5 text-xs sm:text-[13px] font-black uppercase tracking-wider drop-shadow-md whitespace-nowrap">
                <span>⛔</span>
                <span>FULL 100/100 · NGƯNG NHẬN KOC</span>
              </p>
            </div>
          </div>
        )}

        <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent z-[6]" />
        <span className="absolute bottom-3 left-3 flex items-center gap-2 z-[7]">
          <img src={c.brandLogo} alt="" className="h-7 w-7 rounded-lg bg-white object-contain p-0.5 shadow" />
          <span className="text-sm font-bold text-white drop-shadow">{c.brandName}</span>
        </span>
        {freeSample && !scarcity.isFull && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-400 px-2.5 py-1 text-[11px] font-black tracking-wide text-emerald-950 shadow z-[7]">MẪU 0Đ</span>
        )}
      </Link>

      <button
        type="button"
        onClick={handleBookmarkClick}
        aria-pressed={isBookmarked}
        aria-label={isBookmarked ? 'Bỏ lưu' : 'Lưu chiến dịch'}
        className={cx(
          'absolute right-3 top-3 z-20 flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-full shadow-md backdrop-blur transition-all active:scale-90 cursor-pointer',
          isBookmarked ? 'bg-[#ec4899] text-white' : 'bg-white/90 text-slate-600 hover:text-[#ec4899]'
        )}
      >
        <Icon name="favorite" filled={isBookmarked} className="text-[18px]" />
      </button>

      <div className="flex flex-1 flex-col p-4">
        <Link to={href} className="line-clamp-2 text-[15px] font-semibold leading-snug text-slate-800 hover:text-slate-950" title={c.title}>
          {c.title}
        </Link>

        <dl className="mt-3 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50 py-2.5 text-center">
          <div>
            <dt className="text-[11px] text-slate-500">Mẫu thử</dt>
            <dd className={cx('font-display text-lg font-extrabold', freeSample ? 'text-emerald-600' : 'text-slate-300')}>{freeSample ? '0đ' : '—'}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-slate-500">Hoa hồng</dt>
            <dd className="truncate px-1 font-display text-lg font-extrabold text-[#7c3aed]">{commission || '—'}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-slate-500">Followers</dt>
            <dd className="truncate px-1 font-display text-lg font-extrabold text-[#db2777]" title={followerReq}>
              {followerValue}
            </dd>
          </div>
        </dl>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">
              {scarcity.isFull ? (
                <span className="font-bold text-rose-600 flex items-center gap-1">
                  <span>⛔</span>
                  100/100 KOC đã nhận mẫu (FULL 100%)
                </span>
              ) : (
                <>
                  Còn <b className={scarcity.isAlmostFull ? 'text-[#ec4899]' : 'text-slate-900'}>{scarcity.spotsLeft}</b>/{scarcity.totalSpots} suất
                </>
              )}
            </span>
            <span className={cx('font-medium', scarcity.isFull ? 'font-bold text-rose-500' : daysLeft <= 3 ? 'font-bold text-[#ec4899]' : 'text-slate-400')}>
              {scarcity.isFull ? 'Ngưng nhận KOC' : daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Hết hạn'}
            </span>
          </div>

          {/* Thanh tiến độ: Kéo kịch kim 100/100 KOC đã nhận mẫu (FULL 100%) */}
          <div
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Số suất còn lại"
            aria-valuemin={0}
            aria-valuemax={scarcity.totalSpots}
            aria-valuenow={scarcity.isFull ? scarcity.totalSpots : scarcity.spotsLeft}
          >
            <div
              className={cx(
                'h-full rounded-full transition-all',
                scarcity.isFull
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 w-full'
                  : scarcity.isAlmostFull
                  ? 'bg-[#ec4899]'
                  : 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]'
              )}
              style={{ width: `${scarcity.isFull ? 100 : Math.max(scarcity.remainingPercent, 4)}%` }}
            />
          </div>

          {hasApplied ? (
            <Button variant="soft" size="lg" block className="mt-4" onClick={onApply}>
              <Icon name="check_circle" className="text-[18px]" /> Đã đăng ký · Xem đơn
            </Button>
          ) : (
            <Button
              variant={scarcity.isFull ? 'dark' : 'primary'}
              size="lg"
              block
              className={cx('mt-4', scarcity.isFull && 'opacity-90 bg-slate-800 text-slate-200 border border-slate-700 cursor-not-allowed')}
              disabled={scarcity.isFull || daysLeft <= 0}
              onClick={onApply}
            >
              {scarcity.isFull ? (
                <span className="flex items-center justify-center gap-1.5">
                  <span className="text-sm">⛔</span>
                  <span>Đã đủ 100/100 · Ngưng nhận KOC</span>
                </span>
              ) : daysLeft <= 0 ? (
                'Đã hết hạn'
              ) : (
                'Nhận mẫu ngay'
              )}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};
