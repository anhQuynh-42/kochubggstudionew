import React, { useEffect, useState } from 'react';
import { Campaign, KOCApplication } from '../../types';
import { APP_LOGOS } from '../../data/mockData';
import { useAppData } from '../../state/AppDataContext';
import { getCommissionLabel, getScarcity, hasFreeSample } from '../../lib/campaignDisplay';
import { copyTextToClipboard } from '../../lib/clipboard';
import { normalizeHandle } from '../../services/authService';
import { Badge, Button, Field, Icon, Sheet, TikTokHandleInput, cx, inputClass } from '../ui';

type Step = 1 | 2 | 3;
const STEP_LABELS: Record<Step, string> = { 1: 'Nhận hàng', 2: 'Kênh TikTok', 3: 'Chọn mẫu & gửi' };
const CITY_OPTIONS = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Khác'];
const EXPECTED_DAYS = ['Trong 3 ngày sau khi nhận mẫu', 'Trong 5 ngày sau khi nhận mẫu', 'Trong 7 ngày sau khi nhận mẫu'];

interface ApplySheetProps {
  campaign: Campaign | null;
  onClose: () => void;
  onViewApplications: () => void;
}

/** Form nhận mẫu 3 bước (CLAUDE.md 8.3). Lần thứ 2 trở đi: 1 chạm dùng thông tin đã nhớ. */
export const ApplySheet: React.FC<ApplySheetProps> = ({ campaign, onClose, onViewApplications }) => {
  const { currentUser, submitApplication, rememberFromApplication } = useAppData();

  const [step, setStep] = useState<Step>(1);
  const [useRemembered, setUseRemembered] = useState(false);
  const [error, setError] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(CITY_OPTIONS[0]);
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [shippingNote, setShippingNote] = useState('');
  const [handle, setHandle] = useState('');
  const [followers, setFollowers] = useState('');
  const [avgViews, setAvgViews] = useState('');
  const [productCode, setProductCode] = useState('');
  const [concept, setConcept] = useState('');
  const [expectedDays, setExpectedDays] = useState(EXPECTED_DAYS[1]);
  const [sparkAds, setSparkAds] = useState(false);
  const [committed, setCommitted] = useState(false);

  // Mỗi lần mở form: tự điền từ hồ sơ
  useEffect(() => {
    if (!campaign) return;
    const u = currentUser;
    setStep(1);
    setError('');
    setSubmittedCode('');
    setFullName(u?.name || '');
    setPhone(u?.phone || '');
    setCity(u?.city || CITY_OPTIONS[0]);
    setDistrict(u?.district || '');
    setAddress(u?.address || '');
    setShippingNote(u?.shippingNote || '');
    setHandle(u?.tiktokHandle || '');
    setFollowers(u?.followers || '');
    setAvgViews(u?.avgViews || '');
    setProductCode(campaign.sampleProducts?.[0]?.code || '');
    setConcept('');
    setSparkAds(Boolean(u?.allowSparkAds));
    setCommitted(false);
    setUseRemembered(Boolean(u?.name && u?.phone && u?.address && u?.tiktokHandle && u?.followers));
    // Chỉ chạy khi mở form cho chiến dịch khác — không chạy lại khi hồ sơ được ghi nhớ sau lúc gửi đơn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign?.id]);

  if (!campaign) return null;

  const scarcity = getScarcity(campaign);
  const commission = getCommissionLabel(campaign);
  const suggestions = (campaign.storySteps || []).map((s) => s.title).filter(Boolean).slice(0, 4);
  const product = campaign.sampleProducts?.find((p) => p.code === productCode);

  const validate = (s: Step): string => {
    if (s === 1) {
      if (!fullName.trim()) return 'Vui lòng nhập tên người nhận.';
      if (phone.replace(/\D/g, '').length < 9) return 'Số điện thoại cần ít nhất 9 chữ số.';
      if (!address.trim()) return 'Vui lòng nhập địa chỉ nhận mẫu.';
    }
    if (s === 2) {
      if (!normalizeHandle(handle)) return 'Vui lòng nhập ID TikTok.';
      if (!followers.trim()) return 'Vui lòng nhập số followers hiện tại.';
    }
    if (s === 3) {
      if (concept.trim().length < 10) return 'Viết ngắn ý tưởng video (ít nhất 10 ký tự) hoặc chọn một gợi ý.';
      if (!committed) return 'Vui lòng tích ô cam kết trước khi gửi.';
    }
    return '';
  };

  const next = () => {
    const e = validate(step);
    setError(e);
    if (!e && step < 3) setStep((step + 1) as Step);
  };

  const back = () => {
    setError('');
    setStep(step === 3 && useRemembered ? 1 : ((step - 1) as Step));
  };

  const useSaved = () => {
    const e = validate(1) || validate(2);
    if (e) {
      setUseRemembered(false);
      setError(e);
      return;
    }
    setError('');
    setStep(3);
  };

  const submit = () => {
    const e = validate(1) || validate(2) || validate(3);
    if (e) return setError(e);
    if (scarcity.isFull) return setError('Chiến dịch này đã hết suất.');

    const cleanHandle = normalizeHandle(handle);
    const followersLower = followers.toLowerCase();
    const num = parseFloat(followers.replace(',', '.'));
    const followersCount = followersLower.includes('m')
      ? Math.round(num * 1_000_000) || 0
      : followersLower.includes('k')
      ? Math.round(num * 1000) || 0
      : parseInt(followers.replace(/\D/g, ''), 10) || 0;
    const code = `#KOC-${Math.floor(1000 + Math.random() * 9000)}`;
    const channelLink =
      currentUser?.channelLink && normalizeHandle(currentUser.tiktokHandle || '') === cleanHandle ? currentUser.channelLink : `https://www.tiktok.com/${cleanHandle}`;

    const app: KOCApplication = {
      id: `app-${Date.now()}`,
      kocId: currentUser?.id,
      code,
      kocName: fullName.trim(),
      avatar: currentUser?.avatar || APP_LOGOS.userProfile,
      phone: phone.trim(),
      email: currentUser?.email || '',
      tiktokHandle: cleanHandle,
      followers: followers.trim(),
      followersCount,
      avgViews: avgViews.trim() ? `Avg ${avgViews.trim().replace(/^Avg\s*/i, '')}` : 'Chưa cập nhật',
      address: [address.trim(), district.trim(), city].filter(Boolean).join(', '),
      shippingCode: '',
      shippingStatus: 'Chờ duyệt để sinh mã',
      createdAtTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAtDate: new Date().toLocaleDateString('vi-VN'),
      status: 'Chờ duyệt',
      videoLink: '',
      videoViews: '',
      audience: currentUser?.targetAudience || currentUser?.categories?.join(', ') || '',
      contentConcept:
        (product ? `[Mẫu đăng ký: ${product.code} - ${product.name}] ` : '') +
        concept.trim() +
        `\n— Lên bài: ${expectedDays} • Spark Ads: ${sparkAds ? 'Đồng ý' : 'Chưa đồng ý'}`,
      campaignId: campaign.id,
      campaignName: campaign.title,
      verified: Boolean(currentUser?.verified),
    };

    // Gửi sang Google Sheets Webhook (giữ nguyên cơ chế hiện tại)
    const WEBHOOK_URL = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
    if (WEBHOOK_URL) {
      fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Tránh CORS preflight trên Apps Script
        body: JSON.stringify(app),
      }).catch((err) => console.error('Lỗi khi gửi data đến Google Sheets', err));
    }

    submitApplication(app);
    if (currentUser) {
      rememberFromApplication({
        ...currentUser,
        name: fullName.trim(),
        phone: phone.trim(),
        city,
        district: district.trim(),
        address: address.trim(),
        shippingNote: shippingNote.trim(),
        tiktokHandle: cleanHandle,
        channelLink,
        followers: followers.trim(),
        avgViews: avgViews.trim(),
        allowSparkAds: sparkAds,
      });
    }
    setSubmittedCode(code);
  };

  // ---------- Màn hình gửi thành công ----------
  if (submittedCode) {
    return (
      <Sheet open onClose={onClose} label="Đã gửi đơn">
        <div className="pt-4 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#ec4899] text-white shadow-lg shadow-violet-500/30">
            <Icon name="check" className="text-[32px]" />
          </span>
          <h2 className="mt-4 font-display text-2xl font-extrabold text-slate-900">Đã gửi đơn!</h2>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-slate-600">
            <b>{campaign.brandName}</b> sẽ xem kênh của bạn. Kết quả hiện trong mục <b>Đơn của tôi</b>.
          </p>
          <button
            type="button"
            onClick={async () => {
              if (await copyTextToClipboard(submittedCode)) {
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-violet-50 px-4 py-2 text-sm cursor-pointer"
          >
            <span className="text-slate-500">Mã đơn</span>
            <b className="font-mono text-violet-700">{submittedCode}</b>
            <Icon name={copied ? 'check' : 'content_copy'} className="text-[16px] text-violet-500" />
          </button>
        </div>
        <ol className="mx-auto mt-6 max-w-xs space-y-3">
          {['Đã gửi đơn', 'Brand đang xem', 'Duyệt gửi mẫu & vận đơn', 'Đã lên bài'].map((label, idx) => (
            <li key={label} className="flex items-center gap-3">
              <span
                className={cx(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                  idx === 0 ? 'bg-emerald-500 text-white' : idx === 1 ? 'bg-violet-500 text-white ring-4 ring-violet-100' : 'bg-slate-100 text-slate-400'
                )}
              >
                {idx === 0 ? <Icon name="check" className="text-[16px]" /> : idx + 1}
              </span>
              <span className={cx('text-sm', idx <= 1 ? 'font-semibold text-slate-900' : 'text-slate-400')}>{label}</span>
            </li>
          ))}
        </ol>
        <div className="mt-7 grid gap-2 pb-2">
          <Button variant="primary" size="lg" block onClick={onViewApplications}>
            Theo dõi đơn của tôi
          </Button>
          <Button variant="ghost" size="lg" block onClick={onClose}>
            Xem chiến dịch khác
          </Button>
        </div>
      </Sheet>
    );
  }

  // ---------- Form 3 bước ----------
  const header = (
    <span className="flex items-center gap-3">
      <img src={campaign.productHeroImage} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
      <span className="min-w-0">
        <span className="block truncate text-base font-bold text-slate-900">{campaign.brandName}</span>
        <span className="mt-0.5 flex flex-wrap gap-1.5">
          {hasFreeSample(campaign) && <Badge tone="emerald">Mẫu 0đ</Badge>}
          {commission && <Badge tone="violet">HH {commission}</Badge>}
          <Badge tone={scarcity.isAlmostFull ? 'pink' : 'slate'}>
            Còn {scarcity.spotsLeft}/{scarcity.totalSpots} suất
          </Badge>
        </span>
      </span>
    </span>
  );

  const footer = (
    <div className="flex gap-2">
      {step > 1 && (
        <Button variant="outline" size="lg" onClick={back} aria-label="Quay lại" className="w-12 px-0">
          <Icon name="arrow_back" />
        </Button>
      )}
      {step === 1 && useRemembered ? (
        <Button variant="primary" size="lg" block onClick={useSaved}>
          <Icon name="bolt" className="text-[18px]" /> Dùng thông tin này
        </Button>
      ) : step < 3 ? (
        <Button variant="dark" size="lg" block onClick={next}>
          Tiếp tục
        </Button>
      ) : (
        <Button variant="primary" size="lg" block onClick={submit} disabled={scarcity.isFull}>
          <Icon name="send" className="text-[18px]" /> Gửi đơn nhận mẫu
        </Button>
      )}
    </div>
  );

  return (
    <Sheet open onClose={onClose} title={header} label={`Nhận mẫu ${campaign.brandName}`} footer={footer}>
      {/* Thanh tiến trình */}
      <div className="mb-5">
        <div className="flex gap-1.5">
          {([1, 2, 3] as Step[]).map((s) => (
            <span key={s} className={cx('h-1.5 flex-1 rounded-full', s <= step ? 'bg-gradient-to-r from-[#6366f1] to-[#ec4899]' : 'bg-slate-100')} />
          ))}
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-500">
          Bước {step}/3 · {STEP_LABELS[step]}
        </p>
      </div>

      {error && (
        <p role="alert" className="mb-4 flex items-start gap-2 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
          <Icon name="error" className="text-[20px]" />
          {error}
        </p>
      )}

      {step === 1 && useRemembered && (
        <div className="rounded-3xl bg-gradient-to-br from-indigo-50 via-violet-50 to-pink-50 p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-700">
              <Icon name="bolt" className="text-[18px]" /> Thông tin đã nhớ
            </span>
            <button type="button" onClick={() => setUseRemembered(false)} className="rounded-full px-3 py-1 text-sm font-semibold text-[#6366f1] hover:bg-white cursor-pointer">
              Sửa
            </button>
          </div>
          <dl className="mt-3 space-y-2.5 text-sm">
            {[
              ['person', <><b className="text-slate-900">{fullName}</b> · {phone}</>],
              ['home', [address, district, city].filter(Boolean).join(', ')],
              ['smart_display', <><b className="text-slate-900">{normalizeHandle(handle)}</b> · {followers} followers</>],
            ].map(([icon, content], i) => (
              <div key={i} className="flex gap-2.5 text-slate-700">
                <dt>
                  <Icon name={icon as string} className="text-[18px] text-slate-400" />
                  <span className="sr-only">{['Người nhận', 'Địa chỉ', 'Kênh'][i]}</span>
                </dt>
                <dd>{content}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {step === 1 && !useRemembered && (
        <div className="space-y-4">
          <Field label="Tên người nhận" required>
            {(id) => <input id={id} autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Minh Thư" className={inputClass} />}
          </Field>
          <Field label="Số điện thoại" required>
            {(id) => <input id={id} type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0908 123 456" className={inputClass} />}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tỉnh / Thành" required>
              {(id) => (
                <select id={id} value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
                  {!CITY_OPTIONS.includes(city) && <option value={city}>{city}</option>}
                  {CITY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Quận / Huyện">
              {(id) => <input id={id} value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Quận 1" className={inputClass} />}
            </Field>
          </div>
          <Field label="Địa chỉ chi tiết" required>
            {(id) => <input id={id} autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, đường, phường/xã" className={inputClass} />}
          </Field>
          <Field label="Ghi chú cho shipper">
            {(id) => <input id={id} value={shippingNote} onChange={(e) => setShippingNote(e.target.value)} placeholder="VD: Gọi trước khi giao" className={inputClass} />}
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Field label="ID TikTok" required>
            {(id) => <TikTokHandleInput id={id} value={handle} onChange={setHandle} />}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Followers" required>
              {(id) => <input id={id} value={followers} onChange={(e) => setFollowers(e.target.value)} placeholder="VD: 12.5K" className={inputClass} />}
            </Field>
            <Field label="View TB / video">
              {(id) => <input id={id} value={avgViews} onChange={(e) => setAvgViews(e.target.value)} placeholder="VD: 5K" className={inputClass} />}
            </Field>
          </div>
          <p className="flex items-center gap-1.5 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
            <Icon name="info" className="text-[18px] text-[#8b5cf6]" />
            Yêu cầu kênh: <b className="text-slate-800">{campaign.followerRequirement}</b>
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          {campaign.sampleProducts && campaign.sampleProducts.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-slate-800">
                Chọn mẫu muốn nhận <span className="text-[#ec4899]">*</span>
              </legend>
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {campaign.sampleProducts.map((p) => (
                  <label
                    key={p.code}
                    className={cx(
                      'flex cursor-pointer items-center gap-3 rounded-2xl p-3 text-sm transition-colors',
                      p.code === productCode ? 'bg-violet-50 ring-2 ring-[#8b5cf6]' : 'ring-1 ring-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <input type="radio" name="sample" checked={p.code === productCode} onChange={() => setProductCode(p.code)} className="h-4 w-4 accent-[#8b5cf6]" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-slate-900">{p.name}</span>
                      <span className="text-xs text-slate-500">Mã {p.code}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <Field label="Ý tưởng video" required>
            {(id) => (
              <>
                {suggestions.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setConcept(s)}
                        className={cx(
                          'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                          concept === s ? 'bg-violet-50 text-violet-700 ring-2 ring-[#8b5cf6]' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-violet-300'
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <textarea
                  id={id}
                  rows={3}
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Chọn gợi ý ở trên hoặc mô tả ngắn: góc quay, câu mở đầu, cách giới thiệu sản phẩm..."
                  className={cx(inputClass, 'h-auto py-3 leading-relaxed')}
                />
              </>
            )}
          </Field>

          <Field label="Dự kiến lên video">
            {(id) => (
              <select id={id} value={expectedDays} onChange={(e) => setExpectedDays(e.target.value)} className={inputClass}>
                {EXPECTED_DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
          </Field>

          <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={committed} onChange={(e) => setCommitted(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#8b5cf6]" />
              <span>
                <b className="text-slate-900">Tôi cam kết</b> làm video đúng brief, gắn giỏ hàng chính hãng của Brand, thông tin kênh và địa chỉ là chính xác.
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={sparkAds} onChange={(e) => setSparkAds(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#8b5cf6]" />
              <span>Đồng ý cung cấp mã Spark Ads nếu video có chỉ số tốt (không bắt buộc)</span>
            </label>
          </div>
        </div>
      )}
    </Sheet>
  );
};
