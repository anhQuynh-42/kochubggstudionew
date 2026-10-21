import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KOCUser } from '../../types';
import { useAppData } from '../../state/AppDataContext';
import { getApplicationProgress } from '../../lib/applicationStatus';
import { copyTextToClipboard } from '../../lib/clipboard';
import { ROUTES } from '../../lib/constants';
import { useSiteUI } from '../SiteUI';
import { Avatar, Badge, Button, EmptyState, Field, Icon, cx, inputClass } from '../ui';

const CATEGORIES = ['Làm đẹp & Mỹ phẩm', 'Thời trang & Phụ kiện', 'Lifestyle & Gia dụng', 'Công nghệ & Gaming', 'Ẩm thực & Quán xá', 'Mẹ & Bé'];
const CONTENT_STYLES = ['Review chân thật', 'Unbox / ASMR', 'Hài hước', 'Hướng dẫn / Tips', 'Vlog đời thường', 'Livestream'];
const CITY_OPTIONS = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Khác'];
const TABS = [
  { id: 'channel', label: 'Kênh & chỉ số', icon: 'monitoring' },
  { id: 'audience', label: 'Đối tượng & nội dung', icon: 'groups' },
  { id: 'policy', label: 'Chính sách & nhận mẫu', icon: 'local_shipping' },
  { id: 'portfolio', label: 'Portfolio', icon: 'video_library' },
] as const;
type TabId = (typeof TABS)[number]['id'];

/** Hồ sơ KOC & Media Kit: form 4 tab + thẻ Media Kit xem trước cập nhật trực tiếp */
export const ProfilePage: React.FC = () => {
  const { currentUser, myApplications, saveProfile, signOut, showToast } = useAppData();
  const { openAuth } = useSiteUI();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<KOCUser | null>(currentUser);
  const [tab, setTab] = useState<TabId>('channel');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(currentUser), [currentUser]);

  if (!currentUser || !draft) {
    return (
      <div className="mx-auto max-w-md px-4 py-14">
        <EmptyState
          icon="badge"
          title="Tạo hồ sơ & Media Kit"
          description="Lưu thông tin kênh một lần: nộp đơn nhanh hơn và có Media Kit để gửi Brand."
          action={<Button variant="primary" size="lg" onClick={() => openAuth('register')}>Tạo tài khoản KOC</Button>}
        />
      </div>
    );
  }

  const set = <K extends keyof KOCUser>(key: K, value: KOCUser[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));
  const toggleIn = (key: 'categories' | 'contentStyle', v: string) => {
    const list = draft[key] || [];
    set(key, list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  };
  const dirty = JSON.stringify(draft) !== JSON.stringify(currentUser);

  // Ảnh đại diện: thu nhỏ còn 256px để lưu được lên Supabase (giới hạn ~100KB)
  const onAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        set('avatar', canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const shareLink = `${window.location.origin}/?mediakit=${encodeURIComponent((currentUser.tiktokHandle || '').replace(/^@/, ''))}`;
  const posted = myApplications.filter((a) => getApplicationProgress(a).video === 'posted').length;

  const text = (key: keyof KOCUser, label: string, placeholder?: string, hint?: string) => (
    <Field label={label} hint={hint}>
      {(id) => (
        <input id={id} value={(draft[key] as string) || ''} onChange={(e) => set(key, e.target.value as never)} placeholder={placeholder} className={inputClass} />
      )}
    </Field>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 sm:pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Hồ sơ KOC & Media Kit</h1>
          <p className="mt-1 text-sm text-slate-500">Thông tin này dùng để tự điền form nhận mẫu và tạo Media Kit gửi Brand.</p>
        </div>
        <Button
          variant="outline"
          onClick={async () => (await copyTextToClipboard(shareLink)) && showToast('Đã sao chép link Media Kit', shareLink, 'success')}
        >
          <Icon name="link" className="text-[18px]" /> Sao chép link Media Kit
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* ===== Thẻ Media Kit xem trước ===== */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-[28px] bg-white ring-1 ring-slate-200/70">
            <div className="h-20 bg-[#0b0a1a] bg-[radial-gradient(circle_at_30%_0%,rgba(139,92,246,0.55),transparent_60%)]" />
            <div className="-mt-10 px-5 pb-5 text-center">
              <button type="button" onClick={() => fileRef.current?.click()} className="relative mx-auto block cursor-pointer" aria-label="Đổi ảnh đại diện">
                <span className="block rounded-full ring-4 ring-white">
                  <Avatar name={draft.name} src={draft.avatar} size={80} />
                </span>
                <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white ring-2 ring-white">
                  <Icon name="photo_camera" className="text-[15px]" />
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={onAvatar} className="hidden" />
              <p className="mt-3 font-display text-xl font-bold text-slate-950">{draft.name}</p>
              <p className="text-sm text-slate-500">{draft.tiktokHandle}{draft.city ? ` · ${draft.city}` : ''}</p>
              {draft.bio && <p className="mt-2 text-sm leading-relaxed text-slate-600">{draft.bio}</p>}

              <dl className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50 py-3">
                {[
                  ['Followers', draft.followers],
                  ['View TB', draft.avgViews],
                  ['Tương tác', draft.engagementRate],
                ].map(([l, v]) => (
                  <div key={l} className="flex flex-col-reverse">
                    <dt className="text-[11px] text-slate-500">{l}</dt>
                    <dd className="font-display text-lg font-semibold text-slate-900">{v || '—'}</dd>
                  </div>
                ))}
              </dl>

              {(draft.categories?.length || 0) > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {draft.categories!.map((c) => <Badge key={c} tone="violet">{c}</Badge>)}
                </div>
              )}

              <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-left text-sm">
                <Row icon="redeem" label="Nhận mẫu 0đ" value={draft.acceptFreecast === false ? 'Không' : 'Có'} />
                <Row icon="payments" label="Booking từ" value={draft.minBookingRate || '—'} />
                <Row icon="campaign" label="Spark Ads" value={draft.allowSparkAds ? 'Đồng ý' : 'Chưa'} />
                <Row icon="smart_display" label="Video đã lên trên KOCity" value={String(posted)} />
              </ul>
            </div>
          </div>
        </aside>

        {/* ===== Form 4 tab ===== */}
        <form
          className="min-w-0 rounded-[28px] bg-white p-5 ring-1 ring-slate-200/70 sm:p-6"
          onSubmit={(e) => {
            e.preventDefault();
            saveProfile({ ...draft, name: draft.name.trim() || currentUser.name });
          }}
        >
          <div role="tablist" className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto border-b border-slate-100 px-5 sm:-mx-6 sm:px-6">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cx(
                  '-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-semibold transition-colors cursor-pointer',
                  tab === t.id ? 'border-[#6d28d9] text-[#6d28d9]' : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
              >
                <span className="text-xs opacity-60">{i + 1}.</span> {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-4 pt-5">
            {tab === 'channel' && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {text('name', 'Tên hiển thị')}
                  <Field label="ID TikTok" hint="Dùng để đăng nhập nên không đổi tại đây.">
                    {(id) => <input id={id} value={draft.tiktokHandle} disabled className={cx(inputClass, 'bg-slate-50 text-slate-500')} />}
                  </Field>
                </div>
                <Field label="Giới thiệu ngắn">
                  {(id) => (
                    <textarea id={id} rows={2} value={draft.bio || ''} onChange={(e) => set('bio', e.target.value)} placeholder="VD: Review mỹ phẩm cho da dầu mụn, giọng kể gần gũi" className={cx(inputClass, 'h-auto py-3')} />
                  )}
                </Field>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {text('followers', 'Followers', '12K')}
                  {text('avgViews', 'View TB / video', '5K')}
                  {text('engagementRate', 'Tỷ lệ tương tác', '6%')}
                  {text('gmv', 'GMV kênh', '0')}
                </div>
                {text('channelLink', 'Link kênh TikTok', 'https://www.tiktok.com/@...')}
                <div className="grid gap-4 sm:grid-cols-2">
                  {text('instagramHandle', 'Instagram (nếu có)', '@...')}
                  {text('youtubeHandle', 'YouTube (nếu có)', '@...')}
                </div>
              </>
            )}

            {tab === 'audience' && (
              <>
                <Chips label="Lĩnh vực nội dung" options={CATEGORIES} value={draft.categories || []} onToggle={(v) => toggleIn('categories', v)} />
                <Chips label="Phong cách video" options={CONTENT_STYLES} value={draft.contentStyle || []} onToggle={(v) => toggleIn('contentStyle', v)} />
                {text('targetAudience', 'Tệp người xem chính', 'VD: Nữ 18–28, sinh viên & dân văn phòng')}
              </>
            )}

            {tab === 'policy' && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Toggle label="Nhận mẫu 0đ (Freecast)" checked={draft.acceptFreecast !== false} onChange={(v) => set('acceptFreecast', v)} />
                  <Toggle label="Đồng ý cung cấp Spark Ads" checked={Boolean(draft.allowSparkAds)} onChange={(v) => set('allowSparkAds', v)} />
                </div>
                {text('minBookingRate', 'Giá booking tối thiểu', 'VD: 500.000đ / video')}
                <p className="pt-2 text-sm font-semibold text-slate-900">Địa chỉ nhận mẫu <span className="font-normal text-slate-500">— dùng để tự điền</span></p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Số điện thoại">
                    {(id) => <input id={id} type="tel" inputMode="tel" value={draft.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="0908 123 456" className={inputClass} />}
                  </Field>
                  <Field label="Tỉnh / Thành">
                    {(id) => (
                      <select id={id} value={draft.city || ''} onChange={(e) => set('city', e.target.value)} className={inputClass}>
                        <option value="">Chọn</option>
                        {draft.city && !CITY_OPTIONS.includes(draft.city) && <option value={draft.city}>{draft.city}</option>}
                        {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    )}
                  </Field>
                  {text('district', 'Quận / Huyện')}
                  {text('address', 'Địa chỉ chi tiết', 'Số nhà, đường, phường/xã')}
                </div>
                {text('shippingNote', 'Ghi chú cho shipper')}
              </>
            )}

            {tab === 'portfolio' && (
              <>
                {text('portfolioDriveLink', 'Link Portfolio / video nổi bật', 'https://drive.google.com/...', 'Thư mục Drive hoặc video TikTok tiêu biểu để Brand xem nhanh.')}
                {draft.portfolioDriveLink && (
                  <a href={draft.portfolioDriveLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#6d28d9]">
                    Mở link <Icon name="open_in_new" className="text-[16px]" />
                  </a>
                )}
              </>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <span className="text-sm text-slate-500">{dirty ? 'Có thay đổi chưa lưu' : 'Đã lưu'}</span>
            <div className="flex gap-2">
              {dirty && <Button variant="ghost" onClick={() => setDraft(currentUser)}>Hủy</Button>}
              <Button type="submit" variant="primary" disabled={!dirty}>Lưu hồ sơ</Button>
            </div>
          </div>
        </form>
      </div>

      <Button
        variant="ghost"
        size="lg"
        className="mx-auto mt-6 flex text-rose-600 hover:bg-rose-50"
        onClick={() => {
          signOut();
          navigate(ROUTES.home);
        }}
      >
        <Icon name="logout" className="text-[20px]" /> Đăng xuất
      </Button>
    </div>
  );
};

const Row: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <li className="flex items-center gap-2 text-slate-600">
    <Icon name={icon} className="text-[18px] text-slate-400" />
    <span className="flex-1">{label}</span>
    <b className="font-semibold text-slate-900">{value}</b>
  </li>
);

const Chips: React.FC<{ label: string; options: string[]; value: string[]; onToggle: (v: string) => void }> = ({ label, options, value, onToggle }) => (
  <fieldset>
    <legend className="mb-2 text-sm font-semibold text-slate-800">{label}</legend>
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onToggle(o)}
          aria-pressed={value.includes(o)}
          className={cx(
            'h-9 rounded-full px-3.5 text-sm font-semibold transition-colors cursor-pointer',
            value.includes(o) ? 'bg-violet-50 text-[#6d28d9] ring-2 ring-[#8b5cf6]' : 'bg-white text-slate-600 ring-1 ring-slate-200'
          )}
        >
          {o}
        </button>
      ))}
    </div>
  </fieldset>
);

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl p-4 ring-1 ring-slate-200">
    <span className="text-sm font-semibold text-slate-800">{label}</span>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
    <span className="relative h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-[#6d28d9] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
  </label>
);
