import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Campaign } from '../../types';
import { calculateDaysLeft, useAppData } from '../../state/AppDataContext';
import { formatFollowerRequirement, getCommissionLabel, getScarcity, hasFreeSample } from '../../lib/campaignDisplay';
import { copyTextToClipboard } from '../../lib/clipboard';
import { ROUTES } from '../../lib/constants';
import { useSiteUI } from '../SiteUI';
import { Badge, Button, EmptyState, Icon, IconButton, cx } from '../ui';

export const CampaignPage: React.FC = () => {
  const { id = '' } = useParams();
  const { campaigns, bookmarkedIds, toggleBookmark, isAdmin, setEditingCampaignFromExternal } = useAppData();
  const navigate = useNavigate();
  const campaign = campaigns.find((c) => c.id === decodeURIComponent(id));

  if (!campaign) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          icon="travel_explore"
          title="Không tìm thấy chiến dịch"
          description="Chiến dịch có thể đã kết thúc hoặc đường dẫn chưa đúng."
          action={<Button variant="dark" onClick={() => navigate(ROUTES.home)}>Xem mẫu đang mở</Button>}
        />
      </div>
    );
  }

  const isBookmarked = bookmarkedIds.includes(campaign.id);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-3 pb-32 sm:px-6 sm:pt-6 lg:pb-10">
      <div className="flex items-center justify-between">
        <Link to={ROUTES.home} className="inline-flex h-10 items-center gap-1 rounded-xl pr-3 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <Icon name="arrow_back" className="text-[20px]" /> Khám phá
        </Link>
        <div className="flex gap-1">
          {isAdmin && (
            <Button
              variant="soft"
              size="sm"
              onClick={() => {
                setEditingCampaignFromExternal(campaign);
                navigate(ROUTES.admin);
              }}
            >
              <Icon name="edit" className="text-[18px]" /> Sửa
            </Button>
          )}
          <ShareButton campaign={campaign} />
          <IconButton
            icon="favorite"
            filled={isBookmarked}
            label={isBookmarked ? 'Bỏ lưu' : 'Lưu chiến dịch'}
            onClick={() => toggleBookmark(campaign)}
            className={isBookmarked ? 'text-[#ec4899] hover:bg-pink-50' : undefined}
          />
        </div>
      </div>

      <div className="mt-2 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <Gallery campaign={campaign} />

          <div className="mt-5 flex items-center gap-2.5">
            <img src={campaign.brandLogo} alt="" className="h-9 w-9 rounded-xl bg-white object-contain p-0.5 ring-1 ring-slate-100" />
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-900">{campaign.brandName}</p>
              <p className="text-xs text-slate-500">
                {campaign.category} · {campaign.platform}
              </p>
            </div>
            {campaign.tiktokUrl && (
              <a href={campaign.tiktokUrl} target="_blank" rel="noopener noreferrer" className="ml-auto shrink-0 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                {campaign.tiktokHandle || 'TikTok'}
              </a>
            )}
          </div>
          <h1 className="mt-3 font-display text-xl font-extrabold leading-snug text-slate-900 sm:text-3xl">{campaign.title}</h1>

          <KeyStats campaign={campaign} />

          {/* Thẻ nhận mẫu cho điện thoại/tablet (máy tính dùng cột phải) */}
          <div className="mt-5 lg:hidden">
            <ScarcityBar campaign={campaign} />
          </div>

          {campaign.description && (
            <Section title="Về chiến dịch">
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-700">{campaign.description}</p>
            </Section>
          )}

          {campaign.uspList?.length > 0 && (
            <Section title="Vì sao nên nhận mẫu này">
              <ul className="grid gap-3 sm:grid-cols-2">
                {campaign.uspList.map((u) => (
                  <li key={u.title} className="card-fx rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                    <Icon name={u.icon || 'star'} className="text-[22px] text-[#8b5cf6]" />
                    <p className="mt-2 font-semibold text-slate-900">{u.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{u.desc}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {campaign.sampleProducts && campaign.sampleProducts.length > 0 && (
            <Section title={`Mẫu bạn có thể chọn (${campaign.sampleProducts.length})`}>
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
                {campaign.sampleProducts.map((p) => (
                  <li key={p.code} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <Badge tone="violet" className="shrink-0">{p.code}</Badge>
                    </div>
                    {p.shortDesc && <p className="mt-1 text-sm text-slate-600">{p.shortDesc}</p>}
                    {p.reviewTips && (
                      <p className="mt-2 flex gap-1.5 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900">
                        <Icon name="lightbulb" className="text-[16px]" /> {p.reviewTips}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {campaign.storySteps?.length > 0 && (
            <Section title="Gợi ý ý tưởng video">
              <ul className="space-y-3">
                {campaign.storySteps.map((s) => (
                  <li key={s.title} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                    <Icon name="movie" className="text-[22px] text-[#ec4899]" />
                    <div>
                      <p className="font-semibold text-slate-900">{s.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {(campaign.contentRequirement || campaign.videoDeadline || campaign.hashtags?.length > 0) && (
            <Section title="Yêu cầu khi lên video">
              <div className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                {campaign.contentRequirement && <Row icon="checklist" text={campaign.contentRequirement} />}
                {campaign.videoDeadline && <Row icon="schedule" text={`Hạn nộp video: ${campaign.videoDeadline}`} />}
                {campaign.minVideos && <Row icon="video_library" text={`Tối thiểu ${campaign.minVideos} video`} />}
                {campaign.hashtags?.length > 0 && <HashtagRow tags={campaign.hashtags} />}
              </div>
            </Section>
          )}

          {campaign.timeline?.length > 0 && (
            <Section title="Quy trình">
              <ol className="space-y-0">
                {campaign.timeline.map((t, i) => (
                  <li key={`${t.stepNum}-${t.title}`} className="relative flex gap-3 pb-5 last:pb-0">
                    {i < campaign.timeline.length - 1 && <span className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-200" />}
                    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{i + 1}</span>
                    <div className="pt-1">
                      <p className="font-semibold text-slate-900">{t.title}</p>
                      <p className="mt-0.5 text-sm text-slate-600">{t.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          )}
        </div>

        {/* Cột phải (máy tính): thẻ nhận mẫu dính khi cuộn */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-[28px] bg-white p-5 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
            <ApplyPanel campaign={campaign} />
          </div>
        </aside>
      </div>

      {/* Nút dính đáy (điện thoại/tablet) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">{hasFreeSample(campaign) ? 'Mẫu 0đ' : 'Nhận mẫu'}{getCommissionLabel(campaign) ? ` · HH ${getCommissionLabel(campaign)}` : ''}</p>
            <p className={cx('text-sm font-bold', getScarcity(campaign).isAlmostFull ? 'text-[#ec4899]' : 'text-slate-900')}>
              {getScarcity(campaign).isFull ? 'Đã hết suất' : `Còn ${getScarcity(campaign).spotsLeft}/${campaign.totalSpots} suất`}
            </p>
          </div>
          <ApplyButton campaign={campaign} className="ml-auto flex-1" />
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mt-9">
    <h2 className="mb-3 font-display text-lg font-extrabold text-slate-900">{title}</h2>
    {children}
  </section>
);

const Row: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <p className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
    <Icon name={icon} className="text-[20px] text-slate-400" />
    {text}
  </p>
);

const HashtagRow: React.FC<{ tags: string[] }> = ({ tags }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-start gap-2.5">
      <Icon name="tag" className="text-[20px] text-slate-400" />
      <p className="flex-1 text-sm font-medium text-[#6366f1]">{tags.join(' ')}</p>
      <button
        type="button"
        onClick={async () => {
          if (await copyTextToClipboard(tags.join(' '))) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }
        }}
        className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 cursor-pointer"
      >
        {copied ? 'Đã chép' : 'Sao chép'}
      </button>
    </div>
  );
};

const ShareButton: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const { showToast } = useAppData();
  return (
    <IconButton
      icon="ios_share"
      label="Chia sẻ"
      onClick={async () => {
        const url = window.location.origin + ROUTES.campaign(campaign.id);
        if (navigator.share) {
          try {
            await navigator.share({ title: campaign.brandName, url });
            return;
          } catch {
            /* người dùng hủy chia sẻ */
          }
        }
        if (await copyTextToClipboard(url)) showToast('Đã sao chép link chiến dịch', undefined, 'success');
      }}
    />
  );
};

const Gallery: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const images = Array.from(new Set([campaign.productHeroImage, ...(campaign.galleryImages || [])].filter(Boolean)));
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={i === 0 ? campaign.brandName : ''}
          className={cx('aspect-[4/3] shrink-0 snap-center rounded-[28px] bg-slate-100 object-cover', images.length > 1 ? 'w-[88%] sm:w-[70%]' : 'w-full')}
        />
      ))}
    </div>
  );
};

const KeyStats: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const free = hasFreeSample(campaign);
  const commission = getCommissionLabel(campaign);
  const req = formatFollowerRequirement(campaign.followerRequirement);
  const days = calculateDaysLeft(campaign.endDate, campaign.daysLeft);
  const stats = [
    { label: 'Mẫu thử', value: free ? '0đ' : '—', tone: 'text-emerald-600' },
    { label: 'Hoa hồng', value: commission || '—', tone: 'text-[#7c3aed]' },
    { label: 'Yêu cầu kênh', value: req.startsWith('≥') ? req.replace(/ followers$/, '') : 'Mọi kênh', tone: 'text-[#db2777]' },
    { label: 'Hạn đăng ký', value: days > 0 ? `${days} ngày` : 'Hết hạn', tone: days <= 3 ? 'text-[#ec4899]' : 'text-slate-900' },
  ];
  return (
    <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="card-fx rounded-2xl bg-white p-3.5 ring-1 ring-slate-100">
          <dt className="text-xs text-slate-500">{s.label}</dt>
          <dd className={cx('mt-0.5 truncate font-display text-xl font-extrabold', s.tone)} title={s.value}>{s.value}</dd>
        </div>
      ))}
    </dl>
  );
};

const ScarcityBar: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const s = getScarcity(campaign);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">
          {s.isFull ? 'Đã hết suất' : <>Còn <b className={s.isAlmostFull ? 'text-[#ec4899]' : 'text-slate-900'}>{s.spotsLeft}</b>/{s.totalSpots} suất nhận mẫu</>}
        </span>
        {s.isAlmostFull && (
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#ec4899]">
            <Icon name="local_fire_department" className="text-[16px]" /> Sắp hết
          </span>
        )}
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cx('h-full rounded-full', s.isFull ? 'bg-slate-300' : s.isAlmostFull ? 'bg-[#ec4899]' : 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]')}
          style={{ width: `${s.isFull ? 100 : Math.max(s.remainingPercent, 4)}%` }}
        />
      </div>
    </div>
  );
};

const ApplyButton: React.FC<{ campaign: Campaign; className?: string }> = ({ campaign, className }) => {
  const { requestApply, getExistingApplication } = useSiteUI();
  const navigate = useNavigate();
  const applied = getExistingApplication(campaign.id);
  const s = getScarcity(campaign);
  const expired = calculateDaysLeft(campaign.endDate, campaign.daysLeft) <= 0;
  if (applied) {
    return (
      <Button variant="soft" size="lg" className={className} onClick={() => navigate(ROUTES.myApplications)}>
        <Icon name="check_circle" className="text-[18px]" /> Đã đăng ký · Xem đơn
      </Button>
    );
  }
  return (
    <Button variant="primary" size="lg" className={className} disabled={s.isFull || expired} onClick={() => requestApply(campaign)}>
      {s.isFull ? 'Đã hết suất' : expired ? 'Đã hết hạn' : 'Nhận mẫu ngay'}
    </Button>
  );
};

const ApplyPanel: React.FC<{ campaign: Campaign }> = ({ campaign }) => (
  <>
    <div className="flex flex-wrap gap-1.5">
      {hasFreeSample(campaign) && <Badge tone="emerald">Mẫu 0đ</Badge>}
      {getCommissionLabel(campaign) && <Badge tone="violet">Hoa hồng {getCommissionLabel(campaign)}</Badge>}
    </div>
    <p className="mt-3 font-display text-lg font-extrabold text-slate-900">Nhận mẫu {campaign.brandName}</p>
    <p className="mt-1 text-sm text-slate-500">{campaign.followerRequirement}</p>
    <div className="mt-4">
      <ScarcityBar campaign={campaign} />
    </div>
    <ApplyButton campaign={campaign} className="mt-5 w-full" />
    <p className="mt-3 text-center text-xs text-slate-400">Điền 3 bước · lần sau chỉ 1 chạm</p>
  </>
);
