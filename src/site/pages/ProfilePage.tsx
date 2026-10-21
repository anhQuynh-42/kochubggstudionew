import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KOCUser } from '../../types';
import { useAppData } from '../../state/AppDataContext';
import { getApplicationProgress } from '../../lib/applicationStatus';
import { copyTextToClipboard } from '../../lib/clipboard';
import { ROUTES } from '../../lib/constants';
import { useSiteUI } from '../SiteUI';
import { Avatar, Badge, Button, EmptyState, Field, Icon, cx, inputClass } from '../ui';
import { PublicMediaKitModal, PublicMediaKitData } from '../../components/PublicMediaKitModal';

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

/** Hồ sơ KOC & Media Kit: form 4 tab + thẻ Media Kit xem trước trực tiếp */
export const ProfilePage: React.FC = () => {
  const { currentUser, myApplications, saveProfile, signOut, showToast } = useAppData();
  const { openAuth } = useSiteUI();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<KOCUser | null>(currentUser);
  const [tab, setTab] = useState<TabId>('channel');
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const audienceFileRef = useRef<HTMLInputElement>(null);

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

  // Ảnh đại diện: thu nhỏ còn 256px để lưu nhẹ nhàng lên Supabase
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

  // Vấn đề 2: Ảnh chụp màn hình phân tích người xem (TikTok Analytics)
  const onAudienceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        set('targetAudienceImage', canvas.toDataURL('image/jpeg', 0.82));
        showToast('Đã tải ảnh phân tích', 'Ảnh số liệu người xem đã được lưu vào hồ sơ.', 'success');
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Vấn đề 3: Cập nhật danh sách top 3 video TikTok nổi bật
  const highlightVideos = draft.highlightVideos || ['', '', ''];
  const updateHighlightVideo = (index: number, val: string) => {
    const next = [...highlightVideos];
    next[index] = val;
    set('highlightVideos', next);
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
      {/* Header bar */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Hồ sơ KOC & Media Kit</h1>
          <p className="mt-1 text-sm text-slate-500">Thông tin này dùng để tự điền form nhận mẫu 0đ và tạo Media Kit gửi Brand.</p>
        </div>

        {/* Vấn đề 1: Thêm nút Xem trước Media Kit chuẩn Brand */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewOpen(true)}
            className="border-violet-200 bg-violet-50/50 text-[#6d28d9] hover:bg-violet-100"
          >
            <Icon name="visibility" className="text-[18px]" /> Xem trước Media Kit
          </Button>
          <Button
            variant="outline"
            onClick={async () => (await copyTextToClipboard(shareLink)) && showToast('Đã sao chép link Media Kit', shareLink, 'success')}
          >
            <Icon name="link" className="text-[18px]" /> Sao chép link Media Kit
          </Button>
        </div>
      </div>

      {/* Vấn đề 6: Tối ưu Mobile UX - Mini card tóm tắt trên Mobile */}
      <div className="mt-4 block lg:hidden rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 p-3.5 border border-violet-100 shadow-2xs">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => fileRef.current?.click()} className="relative shrink-0">
            <Avatar name={draft.name} src={draft.avatar} size={50} />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white ring-2 ring-white">
              <Icon name="photo_camera" className="text-[11px]" />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-slate-950 truncate text-sm">{draft.name}</p>
              {draft.verified && <Icon name="verified" className="text-blue-500 text-[14px]" />}
            </div>
            <p className="text-xs text-slate-500 truncate">{draft.tiktokHandle}{draft.city ? ` · ${draft.city}` : ''}</p>
            <p className="text-[11px] text-violet-700 font-medium mt-0.5">
              {draft.followers || '0'} followers • {draft.avgViews || '0'} views TB • {draft.engagementRate || '0%'} tương tác
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPreviewOpen(true)}
            className="shrink-0 text-xs py-1.5 px-2.5 font-bold"
          >
            <Icon name="visibility" className="text-[14px]" /> Xem thẻ
          </Button>
        </div>
      </div>

      <div className="mt-4 lg:mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* ===== Thẻ Media Kit xem trước (Desktop sticky preview) ===== */}
        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
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
                {draft.workPhone && <Row icon="chat" label="Zalo liên hệ" value={draft.workPhone} />}
              </ul>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewOpen(true)}
                  className="w-full text-xs font-bold text-[#6d28d9] border-violet-200 hover:bg-violet-50"
                >
                  <Icon name="visibility" className="text-[16px]" /> Mở xem thử bản đầy đủ cho Brand
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* ===== Form 4 tab chỉnh sửa ===== */}
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
            {/* TAB 1: KÊNH & CHỈ SỐ */}
            {tab === 'channel' && (
              <>
                {/* Vấn đề 5: Chú thích gợi ý số liệu */}
                <div className="rounded-2xl bg-indigo-50/70 p-3.5 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-950">
                  <Icon name="insights" className="text-indigo-600 text-[20px] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Mẹo tối ưu hồ sơ cho KOC:</p>
                    <p className="text-indigo-800 text-[11px] mt-0.5 leading-relaxed">
                      Điền số liệu trung thực giúp Brand đánh giá năng lực kênh nhanh hơn và tăng <strong>gấp 3 lần tỷ lệ duyệt mẫu 0đ</strong>.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {text('name', 'Tên hiển thị')}
                  <Field label="ID TikTok" hint="Dùng để đăng nhập nên không đổi tại đây.">
                    {(id) => <input id={id} value={draft.tiktokHandle} disabled className={cx(inputClass, 'bg-slate-50 text-slate-500')} />}
                  </Field>
                </div>
                <Field label="Giới thiệu ngắn (Bio)">
                  {(id) => (
                    <textarea id={id} rows={2} value={draft.bio || ''} onChange={(e) => set('bio', e.target.value)} placeholder="VD: Review mỹ phẩm cho da dầu mụn, giọng kể gần gũi, chuyên tips trang điểm tự nhiên..." className={cx(inputClass, 'h-auto py-3')} />
                  )}
                </Field>

                {/* Vấn đề 5: Các chỉ số kèm hint công thức và ví dụ */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {text('followers', 'Followers', '12K', 'VD: 15K, 50.000')}
                  {text('avgViews', 'View TB / video', '5K', 'TB 10 video gần nhất (VD: 8.5K)')}
                  {text('engagementRate', 'Tỷ lệ tương tác', '6%', '(Tim+Cmt)/View × 100% (chuẩn 4%–10%)')}
                  {text('gmv', 'GMV kênh / tháng', '0', 'Ước tính qua TikTok Shop (VD: 25Tr)')}
                </div>
                {text('channelLink', 'Link kênh TikTok', 'https://www.tiktok.com/@...')}
                <div className="grid gap-4 sm:grid-cols-2">
                  {text('instagramHandle', 'Instagram (nếu có)', '@...')}
                  {text('youtubeHandle', 'YouTube (nếu có)', '@...')}
                </div>
              </>
            )}

            {/* TAB 2: ĐỐI TƯỢNG & NỘI DUNG */}
            {tab === 'audience' && (
              <>
                <Chips label="Lĩnh vực nội dung chính" options={CATEGORIES} value={draft.categories || []} onToggle={(v) => toggleIn('categories', v)} />
                <Chips label="Phong cách làm video" options={CONTENT_STYLES} value={draft.contentStyle || []} onToggle={(v) => toggleIn('contentStyle', v)} />
                {text('targetAudience', 'Mô tả tệp người xem chính', 'VD: Nữ 18–28 tuổi, sinh viên & dân văn phòng thích làm đẹp, săn deal')}

                {/* Vấn đề 2: Ô tải ảnh chụp màn hình phân tích kênh TikTok Analytics */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-slate-800">
                      Ảnh chụp màn hình phân tích kênh (TikTok Analytics)
                    </label>
                    {draft.targetAudienceImage && (
                      <button
                        type="button"
                        onClick={() => set('targetAudienceImage', '')}
                        className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        Gỡ ảnh
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    Chụp từ mục <strong>TikTok Studio &gt; Phân tích (Analytics) &gt; Người theo dõi</strong> (thể hiện % giới tính, độ tuổi, thành phố).
                  </p>

                  <input ref={audienceFileRef} type="file" accept="image/*" onChange={onAudienceImage} className="hidden" />

                  {draft.targetAudienceImage ? (
                    <div className="relative rounded-2xl border border-violet-200 bg-violet-50/50 p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={draft.targetAudienceImage}
                          alt="Ảnh phân tích khán giả"
                          className="h-16 w-24 object-cover rounded-xl border border-violet-200 shrink-0 cursor-pointer shadow-xs"
                          onClick={() => audienceFileRef.current?.click()}
                          title="Bấm để đổi ảnh khác"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                            <Icon name="check_circle" className="text-emerald-600 text-[16px]" /> Đã đính kèm ảnh phân tích
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Brand sẽ nhìn thấy ảnh số liệu này khi mở Media Kit.</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => audienceFileRef.current?.click()}
                        className="shrink-0 text-xs"
                      >
                        Đổi ảnh
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => audienceFileRef.current?.click()}
                      className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-violet-400 hover:bg-violet-50/30 transition-all cursor-pointer group"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-[#6d28d9] mb-2 group-hover:scale-110 transition-transform">
                        <Icon name="add_photo_alternate" className="text-[20px]" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Tải ảnh chụp màn hình Analytics</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ JPG, PNG (tự động nén tối ưu)</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {/* TAB 3: CHÍNH SÁCH & NHẬN MẪU */}
            {tab === 'policy' && (
              <>
                {/* Vấn đề 4: Tách thành 2 khu vực rõ ràng: Liên hệ Booking và Địa chỉ nhận mẫu */}
                <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Icon name="campaign" className="text-[#6d28d9] text-[20px]" />
                    <span className="text-sm font-bold text-slate-900">Thông tin nhận Booking & Hợp tác (Công khai trên Media Kit)</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Nhãn hàng sẽ liên hệ với bạn qua các thông tin này khi họ muốn đặt video review hoặc mở chiến dịch riêng.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Số điện thoại / Zalo công việc" hint="Brand có thể bấm nhắn tin Zalo trực tiếp">
                      {(id) => (
                        <input
                          id={id}
                          type="tel"
                          value={draft.workPhone || ''}
                          onChange={(e) => set('workPhone', e.target.value)}
                          placeholder="VD: 0908 123 456"
                          className={inputClass}
                        />
                      )}
                    </Field>
                    <Field label="Email liên hệ công việc" hint="Nhận hợp đồng và thư mời hợp tác">
                      {(id) => (
                        <input
                          id={id}
                          type="email"
                          value={draft.workEmail || ''}
                          onChange={(e) => set('workEmail', e.target.value)}
                          placeholder="VD: contact.thaonhi@gmail.com"
                          className={inputClass}
                        />
                      )}
                    </Field>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 pt-1">
                    <Toggle label="Nhận mẫu 0đ (Freecast)" checked={draft.acceptFreecast !== false} onChange={(v) => set('acceptFreecast', v)} />
                    <Toggle label="Đồng ý cấp mã Spark Ads" checked={Boolean(draft.allowSparkAds)} onChange={(v) => set('allowSparkAds', v)} />
                  </div>
                  {text('minBookingRate', 'Giá booking tối thiểu', 'VD: 500.000đ / video', 'Để trống nếu chỉ nhận mẫu 0đ')}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Icon name="lock" className="text-emerald-600 text-[18px]" />
                    <span className="text-sm font-bold text-slate-900">Địa chỉ nhận mẫu 0đ (Bảo mật nội bộ KOCity)</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Chỉ sử dụng để bưu tá giao sản phẩm mẫu tận nhà khi bạn được chọn. <strong>Tuyệt đối không công khai trên Media Kit.</strong>
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Số điện thoại nhận hàng (Shipper gọi)">
                      {(id) => <input id={id} type="tel" inputMode="tel" value={draft.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="0908 123 456" className={inputClass} />}
                    </Field>
                    <Field label="Tỉnh / Thành phố">
                      {(id) => (
                        <select id={id} value={draft.city || ''} onChange={(e) => set('city', e.target.value)} className={inputClass}>
                          <option value="">Chọn Tỉnh / Thành</option>
                          {draft.city && !CITY_OPTIONS.includes(draft.city) && <option value={draft.city}>{draft.city}</option>}
                          {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      )}
                    </Field>
                    {text('district', 'Quận / Huyện')}
                    {text('address', 'Địa chỉ chi tiết', 'Số nhà, ngõ/ngách, tên đường, phường/xã')}
                  </div>
                  {text('shippingNote', 'Ghi chú cho shipper', 'VD: Giao giờ hành chính, gọi trước 15 phút')}
                </div>
              </>
            )}

            {/* TAB 4: PORTFOLIO */}
            {tab === 'portfolio' && (
              <>
                {/* Vấn đề 3: Top 3 video TikTok tiêu biểu */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-900">
                      Top 3 Video TikTok nổi bật / Viral
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dán link các video triệu view hoặc video review sản phẩm chất lượng nhất của bạn để Brand ấn tượng.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {[0, 1, 2].map((idx) => {
                      const vUrl = highlightVideos[idx] || '';
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-700 font-bold text-xs border border-pink-100">
                            #{idx + 1}
                          </span>
                          <input
                            type="url"
                            value={vUrl}
                            onChange={(e) => updateHighlightVideo(idx, e.target.value)}
                            placeholder={`Link video TikTok tiêu biểu #${idx + 1} (https://www.tiktok.com/@.../video/...)`}
                            className={inputClass}
                          />
                          {vUrl && (
                            <a
                              href={vUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors"
                              title="Mở xem video này"
                            >
                              <Icon name="open_in_new" className="text-[14px]" />
                              <span className="hidden sm:inline">Xem thử</span>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  {text(
                    'portfolioDriveLink',
                    'Link thư mục Google Drive / Portfolio mở rộng',
                    'https://drive.google.com/drive/folders/...',
                    'Thư mục Drive chứa các video clip gốc, bảng báo giá hoặc hình ảnh feedback khách hàng.'
                  )}
                  {draft.portfolioDriveLink && (
                    <a href={draft.portfolioDriveLink} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#6d28d9] hover:underline">
                      Mở link Google Drive <Icon name="open_in_new" className="text-[14px]" />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <span className="text-sm text-slate-500">{dirty ? 'Có thay đổi chưa lưu' : 'Đã lưu đầy đủ'}</span>
            <div className="flex gap-2">
              {dirty && <Button variant="ghost" onClick={() => setDraft(currentUser)}>Hủy thay đổi</Button>}
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

      {/* Vấn đề 1: Modal xem trước Media Kit chuẩn Brand */}
      {previewOpen && (
        <PublicMediaKitModal
          data={draft as unknown as PublicMediaKitData}
          onClose={() => setPreviewOpen(false)}
          onShowToast={(title, message, type) => showToast(title, message, type === 'error' ? 'warning' : type)}
        />
      )}
    </div>
  );
};

const Row: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <li className="flex items-center gap-2 text-slate-600">
    <Icon name={icon} className="text-[18px] text-slate-400" />
    <span className="flex-1">{label}</span>
    <b className="font-semibold text-slate-900 truncate max-w-[120px]">{value}</b>
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
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl p-4 ring-1 ring-slate-200 bg-white">
    <span className="text-sm font-semibold text-slate-800">{label}</span>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
    <span className="relative h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-[#6d28d9] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
  </label>
);
