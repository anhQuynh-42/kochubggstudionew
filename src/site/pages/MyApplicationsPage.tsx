import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApplicationProgress, Campaign, KOCApplication, SelectionStatus } from '../../types';
import { useAppData } from '../../state/AppDataContext';
import { getApplicationProgress, SAMPLE_LABELS, SELECTION_LABELS, VIDEO_LABELS } from '../../lib/applicationStatus';
import { copyTextToClipboard } from '../../lib/clipboard';
import { ROUTES, ZALO_GROUP_URL } from '../../lib/constants';
import { useSiteUI } from '../SiteUI';
import { Badge, Button, Chip, EmptyState, Icon, cx, inputClass } from '../ui';

type Filter = 'all' | SelectionStatus | 'done';

const SELECTION_TONE: Record<SelectionStatus, 'amber' | 'emerald' | 'slate'> = { pending: 'amber', selected: 'emerald', not_selected: 'slate' };

/** Trang "Đơn của tôi" — theo dõi đơn như theo dõi đơn hàng Shopee (CLAUDE.md 8.4) */
export const MyApplicationsPage: React.FC = () => {
  const { currentUser, myApplications, campaigns } = useAppData();
  const { openAuth } = useSiteUI();
  const [filter, setFilter] = useState<Filter>('all');

  const items = useMemo(() => myApplications.map((app) => ({ app, progress: getApplicationProgress(app) })), [myApplications]);
  const isDone = (p: ApplicationProgress) => p.video === 'posted';
  const counts: Record<Filter, number> = {
    all: items.length,
    pending: items.filter((x) => x.progress.selection === 'pending').length,
    selected: items.filter((x) => x.progress.selection === 'selected' && !isDone(x.progress)).length,
    done: items.filter((x) => isDone(x.progress)).length,
    not_selected: items.filter((x) => x.progress.selection === 'not_selected').length,
  };
  const shown = items.filter(({ progress: p }) =>
    filter === 'all' ? true : filter === 'done' ? isDone(p) : filter === 'selected' ? p.selection === 'selected' && !isDone(p) : p.selection === filter
  );

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md px-4 py-14">
        <EmptyState
          icon="inventory_2"
          title="Đăng nhập để theo dõi đơn"
          description="Xem Brand đã chọn bạn chưa, tra mã vận đơn và nộp link video — tất cả ở một nơi."
          action={<Button variant="primary" size="lg" onClick={() => openAuth('login')}>Đăng nhập / Tạo tài khoản</Button>}
        />
      </div>
    );
  }

  const FILTERS: Array<{ id: Filter; label: string }> = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ kết quả' },
    { id: 'selected', label: 'Được chọn' },
    { id: 'done', label: 'Hoàn thành' },
    { id: 'not_selected', label: 'Chưa được chọn' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pt-5 sm:px-6 sm:pt-8">
      <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">Đơn của tôi</h1>
      <p className="mt-1 text-sm text-slate-500">Theo dõi kết quả và tiến độ nhận mẫu của bạn.</p>

      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist">
        {FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
            <span className={cx('ml-1.5 text-xs', filter === f.id ? 'text-white/70' : 'text-slate-400')}>{counts[f.id]}</span>
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon="inbox"
            title={items.length === 0 ? 'Bạn chưa có đơn nào' : 'Không có đơn ở mục này'}
            description="Chọn một chiến dịch có tag Mẫu 0đ và bấm “Nhận mẫu ngay” để bắt đầu."
            action={
              <Link to={ROUTES.home}>
                <Button variant="primary" size="lg">Khám phá chiến dịch</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-5 space-y-4">
          {shown.map(({ app, progress }) => (
            <ApplicationCard key={app.id} app={app} progress={progress} campaign={campaigns.find((c) => c.id === app.campaignId)} />
          ))}
        </ul>
      )}

      <a href={ZALO_GROUP_URL} target="_blank" rel="noopener noreferrer" className="mt-6 flex items-center justify-center gap-1 text-sm font-semibold text-[#0068ff] hover:underline">
        Có thắc mắc về đơn? Hỏi trong nhóm Zalo KOC <Icon name="open_in_new" className="text-[16px]" />
      </a>
    </div>
  );
};

const ApplicationCard: React.FC<{ app: KOCApplication; progress: ApplicationProgress; campaign?: Campaign }> = ({ app, progress, campaign }) => {
  const { submitVideoLink, showToast } = useAppData();
  const [editing, setEditing] = useState(false);
  const [link, setLink] = useState(app.videoLink || '');
  const { selection, sample, video, timelineStep } = progress;
  const ended = selection === 'not_selected';
  const canSubmitVideo = selection === 'selected' && video !== 'posted';

  const steps = [
    { title: 'Đã gửi đơn', desc: [app.createdAtTime, app.createdAtDate].filter(Boolean).join(' · ') },
    {
      title: ended ? 'Chưa được chọn' : selection === 'selected' ? 'Brand đã chọn bạn' : 'Brand đang xem',
      desc: ended ? 'Brand chưa chọn bạn ở đợt này' : selection === 'selected' ? '🎉 Chúc mừng!' : 'Đang chờ kết quả',
    },
    { title: 'Gửi mẫu & vận đơn', desc: selection === 'selected' ? SAMPLE_LABELS[sample] : 'Sau khi Brand chọn' },
    { title: 'Đã lên bài', desc: selection === 'selected' ? VIDEO_LABELS[video] : '' },
  ];

  const submit = () => {
    if (!/^https?:\/\/\S+$/i.test(link.trim())) {
      showToast('Link chưa hợp lệ', 'Dán link bắt đầu bằng https:// (TikTok hoặc Google Drive).', 'warning');
      return;
    }
    submitVideoLink(app.id, link.trim());
    setEditing(false);
  };

  return (
    <li className="card-fx rounded-[28px] bg-white ring-1 ring-slate-200/70">
      <div className="flex items-start gap-3 p-4 sm:p-5">
        {campaign ? (
          <Link to={ROUTES.campaign(campaign.id)} className="shrink-0">
            <img src={campaign.productHeroImage} alt="" className="h-16 w-16 rounded-2xl object-cover" />
          </Link>
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Icon name="inventory_2" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={SELECTION_TONE[selection]}>{SELECTION_LABELS[selection]}</Badge>
            <span className="font-mono text-xs text-slate-400">{app.code}</span>
          </div>
          <p className="mt-1.5 font-bold text-slate-900">{campaign?.brandName || 'Chiến dịch'}</p>
          <p className="line-clamp-1 text-sm text-slate-500">{app.campaignName}</p>
        </div>
      </div>

      <ol className="border-t border-slate-100 px-4 py-4 sm:px-5">
        {steps.map((s, idx) => {
          const done = idx === 0 || (!ended && (idx < timelineStep || (idx === 3 && video === 'posted')));
          const current = !ended && idx === timelineStep && !done;
          const endStep = ended && idx === 1;
          const muted = !done && !current && !endStep;
          return (
            <li key={idx} className="relative flex gap-3 pb-4 last:pb-0">
              {idx < steps.length - 1 && <span className={cx('absolute left-[13px] top-7 bottom-0 w-0.5', done && !endStep ? 'bg-emerald-300' : 'bg-slate-200')} />}
              <span
                className={cx(
                  'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  endStep ? 'bg-slate-200 text-slate-500' : done ? 'bg-emerald-500 text-white' : current ? 'bg-gradient-to-br from-[#6366f1] to-[#ec4899] text-white ring-4 ring-violet-100' : 'bg-slate-100 text-slate-300'
                )}
              >
                <Icon name={endStep ? 'remove' : done ? 'check' : 'circle'} className={cx(done || endStep ? 'text-[16px]' : 'text-[10px]')} filled={!done && !endStep} />
              </span>
              <div className={cx('min-w-0 pt-0.5', muted && 'opacity-45')}>
                <p className={cx('text-sm font-semibold', current ? 'text-[#6d28d9]' : 'text-slate-900')}>{s.title}</p>
                {s.desc && <p className="text-xs text-slate-500">{s.desc}</p>}
                {idx === 2 && selection === 'selected' && app.shippingCode && (
                  <button
                    type="button"
                    onClick={async () => (await copyTextToClipboard(app.shippingCode)) && showToast('Đã sao chép mã vận đơn', app.shippingCode, 'success')}
                    className="mt-1.5 inline-flex items-center gap-1.5 rounded-xl bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-800 cursor-pointer"
                  >
                    <Icon name="local_shipping" className="text-[16px]" />
                    <span className="font-mono">{app.shippingCode}</span>
                    <Icon name="content_copy" className="text-[14px]" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Hướng dẫn KOC lên TikTok nhận mẫu miễn phí khi vừa được duyệt */}
      {selection === 'selected' && sample !== 'delivered' && (
        <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 p-3.5 text-xs text-slate-800 sm:mx-5 shadow-xs">
          <div className="flex items-start gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-sm">
              🎁
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-emerald-950 text-[13px]">
                Brand đã duyệt đơn nhận mẫu của bạn!
              </p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Vui lòng mở ứng dụng <b>TikTok</b> ➔ vào mục <b>TikTok Studio / Giỏ hàng</b> ➔ kiểm tra mục <b>&ldquo;Mẫu miễn phí&rdquo; (Free Sample)</b> để bấm xác nhận nhận sản phẩm ngay nhé!
              </p>
            </div>
          </div>
        </div>
      )}

      {selection === 'selected' && sample === 'delivered' && video === 'not_posted' && (
        <Notice tone="amber" icon="alarm">
          <b>Đã nhận mẫu — bắt đầu quay video nhé!</b> Hạn nộp 5–7 ngày từ khi nhận hàng.
        </Notice>
      )}
      {video === 'needs_revision' && (
        <Notice tone="rose" icon="feedback">
          <b>Video cần chỉnh sửa:</b> {app.adminFeedback || 'Chưa đạt yêu cầu brief. Hãy sửa và nộp lại link mới.'}
        </Notice>
      )}
      {video === 'pending_review' && <Notice tone="violet" icon="hourglass_top">Đã nộp video — đang chờ Admin duyệt.</Notice>}

      {editing && (
        <div className="flex gap-2 px-4 pb-4 sm:px-5">
          <input
            type="url"
            inputMode="url"
            autoFocus
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Dán link TikTok hoặc Google Drive"
            aria-label="Link video"
            className={cx(inputClass, 'h-11')}
          />
          <Button variant="dark" onClick={submit}>Gửi</Button>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-5">
        {app.videoLink && (
          <a href={app.videoLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#6366f1]">
            <Icon name="play_circle" className="text-[18px]" /> Video đã nộp
          </a>
        )}
        <div className="ml-auto flex gap-2">
          {campaign && (
            <Link to={ROUTES.campaign(campaign.id)}>
              <Button variant="outline" size="sm">Xem brief</Button>
            </Link>
          )}
          {ended ? (
            <Link to={ROUTES.home}>
              <Button variant="dark" size="sm">Tìm mẫu khác</Button>
            </Link>
          ) : (
            canSubmitVideo && (
              <Button variant={editing ? 'outline' : 'primary'} size="sm" onClick={() => setEditing((v) => !v)}>
                {editing ? 'Hủy' : video === 'needs_revision' ? 'Nộp lại video' : app.videoLink ? 'Sửa link video' : 'Nộp video'}
              </Button>
            )
          )}
        </div>
      </div>
    </li>
  );
};

const Notice: React.FC<{ tone: 'amber' | 'rose' | 'violet'; icon: string; children: React.ReactNode }> = ({ tone, icon, children }) => {
  const tones = { amber: 'bg-amber-50 text-amber-900', rose: 'bg-rose-50 text-rose-900', violet: 'bg-violet-50 text-violet-900' };
  return (
    <p className={cx('mx-4 mb-4 flex items-start gap-2 rounded-2xl p-3 text-sm sm:mx-5', tones[tone])}>
      <Icon name={icon} className="text-[20px]" />
      <span>{children}</span>
    </p>
  );
};
