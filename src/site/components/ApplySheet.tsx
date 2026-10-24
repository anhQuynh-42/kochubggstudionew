import React, { useEffect, useState } from 'react';
import { Campaign, KOCApplication } from '../../types';
import { APP_LOGOS } from '../../data/mockData';
import { useAppData } from '../../state/AppDataContext';
import { getCommissionLabel, getScarcity, hasFreeSample } from '../../lib/campaignDisplay';
import { copyTextToClipboard } from '../../lib/clipboard';
import { normalizeHandle } from '../../services/authService';
import { ROUTES } from '../../lib/constants';
import { Badge, Button, Field, Icon, Sheet, TikTokHandleInput, cx, inputClass } from '../ui';

type Step = 1 | 2;
const STEP_LABELS: Record<Step, string> = { 1: 'Kênh TikTok & Hiệu suất bán', 2: 'Chọn mẫu & Gửi đơn' };
const EXPECTED_DAYS = ['Trong 3 ngày sau khi nhận mẫu', 'Trong 5 ngày sau khi nhận mẫu', 'Trong 7 ngày sau khi nhận mẫu'];

interface ApplySheetProps {
  campaign: Campaign | null;
  onClose: () => void;
  onViewApplications: () => void;
}

/** Form nhận mẫu 2 bước tối giản: Kênh & Số liệu bán hàng -> Chọn mẫu & Gửi đơn */
export const ApplySheet: React.FC<ApplySheetProps> = ({ campaign, onClose, onViewApplications }) => {
  const { currentUser, applications, submitApplication, rememberFromApplication } = useAppData();

  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [handle, setHandle] = useState('');
  const [followers, setFollowers] = useState('');
  const [avgViews, setAvgViews] = useState('');
  const [monthlyOrders, setMonthlyOrders] = useState('');
  const [monthlyAvgGmv, setMonthlyAvgGmv] = useState('');
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
    setIsSubmitting(false);
    setHandle(u?.tiktokHandle || '');
    setFollowers(u?.followers || '');
    setAvgViews(u?.avgViews || '');
    setMonthlyOrders(u?.monthlyOrders || '');
    setMonthlyAvgGmv(u?.monthlyAvgGmv || u?.gmv || '');
    const firstAvailable = campaign.sampleProducts?.find((p) => !p.disabled) || campaign.sampleProducts?.[0];
    setProductCode(firstAvailable?.code || '');
    setConcept('');
    setSparkAds(Boolean(u?.allowSparkAds));
    setCommitted(false);
  }, [campaign?.id]);

  if (!campaign) return null;

  const scarcity = getScarcity(campaign);
  const commission = getCommissionLabel(campaign);
  const suggestions = (campaign.storySteps || []).map((s) => s.title).filter(Boolean).slice(0, 4);
  const product = campaign.sampleProducts?.find((p) => p.code === productCode);

  const validate = (s: Step): string => {
    if (s === 1) {
      if (!normalizeHandle(handle)) return 'Vui lòng nhập ID TikTok.';
      if (!followers.trim()) return 'Vui lòng nhập số followers hiện tại.';
    }
    if (s === 2) {
      if (concept.trim().length < 10) return 'Viết ngắn ý tưởng video (ít nhất 10 ký tự) hoặc chọn một gợi ý.';
      if (!committed) return 'Vui lòng tích ô cam kết trước khi gửi.';
    }
    return '';
  };

  const next = () => {
    const e = validate(step);
    setError(e);
    if (!e && step < 2) setStep(2);
  };

  const back = () => {
    setError('');
    setStep(1);
  };

  const submit = () => {
    if (isSubmitting) return;

    const e = validate(1) || validate(2);
    if (e) return setError(e);
    if (scarcity.isFull) return setError('Chiến dịch này đã hết suất.');

    // Chống Spam: Rate Limiting 20s giữa các lần nộp đơn
    const lastSubmit = Number(sessionStorage.getItem('kocity_last_apply_ts') || '0');
    if (Date.now() - lastSubmit < 20000) {
      return setError('Hệ thống đang xử lý, vui lòng chờ 20 giây trước khi gửi đơn tiếp theo!');
    }

    const cleanHandle = normalizeHandle(handle);

    // Chặn Blacklist: Kiểm tra KOC vi phạm không trả video hoặc bị cấm nhận mẫu
    if (currentUser?.isBlacklisted) {
      return setError(
        `⛔ BỊ CHẶN: Tài khoản của bạn đã bị tạm khoá quyền nhận mẫu (${currentUser.blacklistReason || 'Vi phạm điều khoản nhận mẫu nhưng không trả video nghiệm thu'}). Vui lòng liên hệ Admin để được hỗ trợ!`
      );
    }
    try {
      const savedUsersStr = localStorage.getItem('koctrend_registered_users');
      if (savedUsersStr) {
        const list = JSON.parse(savedUsersStr);
        const matched = list.find((u: any) => {
          const h = (u.tiktokHandle || u.name || '').toLowerCase().replace(/[@\s]/g, '');
          const p = (u.phone || '').replace(/\D/g, '');
          const curP = (currentUser?.phone || '').replace(/\D/g, '');
          return (h === cleanHandle.toLowerCase().replace(/[@\s]/g, '')) || (curP && p && curP === p);
        });
        if (matched && matched.isBlacklisted) {
          return setError(
            `⛔ BỊ CHẶN: Kênh @${cleanHandle} hoặc số điện thoại này đang nằm trong danh sách hạn chế nhận mẫu (${matched.blacklistReason || 'Vi phạm điều khoản nghiệm thu video'}). Vui lòng liên hệ Admin!`
          );
        }
      }
    } catch (e) {
      console.warn('Lỗi kiểm tra blacklist:', e);
    }

    // Chống gửi trùng lặp: Kiểm tra xem kênh này đã có đơn chờ duyệt cho chiến dịch này chưa
    const alreadyApplied = applications.some(
      (a) =>
        a.campaignId === campaign.id &&
        normalizeHandle(a.tiktokHandle) === cleanHandle &&
        a.status !== 'Từ chối' &&
        a.status !== 'Bị từ chối'
    );
    if (alreadyApplied) {
      return setError(`Kênh @${cleanHandle} đã có đơn đăng ký cho chiến dịch này đang được xử lý!`);
    }

    setIsSubmitting(true);
    sessionStorage.setItem('kocity_last_apply_ts', Date.now().toString());
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
      kocName: currentUser?.name || cleanHandle || 'KOC Thành viên',
      avatar: currentUser?.avatar || APP_LOGOS.userProfile,
      phone: currentUser?.phone || '',
      email: currentUser?.email || '',
      tiktokHandle: cleanHandle,
      followers: followers.trim(),
      followersCount,
      avgViews: avgViews.trim() ? `Avg ${avgViews.trim().replace(/^Avg\s*/i, '')}` : 'Chưa cập nhật',
      monthlyOrders: monthlyOrders.trim() || undefined,
      monthlyAvgGmv: monthlyAvgGmv.trim() || undefined,
      address: currentUser?.address || 'Nhận mẫu trực tiếp qua kênh',
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
        `\n— Lên bài: ${expectedDays} • Spark Ads: ${sparkAds ? 'Đồng ý' : 'Chưa đồng ý'}` +
        (monthlyOrders.trim() ? `\n— Đơn bán/tháng: ${monthlyOrders.trim()}` : '') +
        (monthlyAvgGmv.trim() ? ` • GMV TB/tháng: ${monthlyAvgGmv.trim()}` : ''),
      campaignId: campaign.id,
      campaignName: campaign.title,
      verified: Boolean(currentUser?.verified),
      selectedSampleCode: product?.code,
      selectedSampleName: product?.name,
      selectedSampleImage: product?.image || campaign.productHeroImage,
    };

    // Gửi sang Google Sheets Webhook
    const WEBHOOK_URL = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
    if (WEBHOOK_URL) {
      fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(app),
      }).catch((err) => console.error('Lỗi khi gửi data đến Google Sheets', err));
    }

    submitApplication(app);
    if (currentUser) {
      rememberFromApplication({
        ...currentUser,
        tiktokHandle: cleanHandle,
        channelLink,
        followers: followers.trim(),
        avgViews: avgViews.trim(),
        monthlyOrders: monthlyOrders.trim(),
        monthlyAvgGmv: monthlyAvgGmv.trim(),
        gmv: monthlyAvgGmv.trim() || currentUser.gmv,
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

  // ---------- Form 2 bước ----------
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
      {step === 1 ? (
        <Button variant="dark" size="lg" block onClick={next}>
          Tiếp tục sang chọn mẫu
        </Button>
      ) : (
        <Button variant="primary" size="lg" block onClick={submit} disabled={scarcity.isFull || isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Đang gửi hồ sơ...</span>
            </span>
          ) : (
            <>
              <Icon name="send" className="text-[18px]" /> Gửi đơn nhận mẫu
            </>
          )}
        </Button>
      )}
    </div>
  );

  return (
    <Sheet open onClose={onClose} title={header} label={`Nhận mẫu ${campaign.brandName}`} footer={footer}>
      {/* Thanh tiến trình 2 bước */}
      <div className="mb-4">
        <div className="flex gap-1.5">
          {([1, 2] as Step[]).map((s) => (
            <span key={s} className={cx('h-1.5 flex-1 rounded-full transition-all duration-300', s <= step ? 'bg-gradient-to-r from-[#6366f1] to-[#ec4899]' : 'bg-slate-100')} />
          ))}
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-500">
          Bước {step}/2 · {STEP_LABELS[step]}
        </p>
      </div>

      {/* Banner xem nhanh Brief chiến dịch */}
      <div className="mb-4 flex items-center justify-between rounded-xl bg-violet-50/80 border border-violet-100 p-2.5 text-xs text-violet-900">
        <span className="flex items-center gap-1.5 min-w-0">
          <Icon name="info" className="text-[17px] text-violet-600 shrink-0" />
          <span className="truncate">Chưa nắm rõ yêu cầu & kịch bản?</span>
        </span>
        <a
          href={ROUTES.campaign(campaign.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-violet-700 hover:text-violet-950 hover:underline shrink-0 ml-2"
        >
          <span>Xem Brief</span>
          <Icon name="open_in_new" className="text-[13px]" />
        </a>
      </div>

      {error && (
        <p role="alert" className="mb-4 flex items-start gap-2 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
          <Icon name="error" className="text-[20px]" />
          {error}
        </p>
      )}

      {/* Bước 1: Kênh TikTok & Hiệu suất bán hàng */}
      {step === 1 && (
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

          <div className="grid grid-cols-2 gap-3">
            <Field label="Số đơn bán ra / tháng">
              {(id) => (
                <input
                  id={id}
                  value={monthlyOrders}
                  onChange={(e) => setMonthlyOrders(e.target.value)}
                  placeholder="VD: 150 đơn"
                  className={inputClass}
                />
              )}
            </Field>
            <Field label="GMV trung bình tháng">
              {(id) => (
                <input
                  id={id}
                  value={monthlyAvgGmv}
                  onChange={(e) => setMonthlyAvgGmv(e.target.value)}
                  placeholder="VD: 35.000.000đ"
                  className={inputClass}
                />
              )}
            </Field>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/60 p-3.5 border border-indigo-100/80 flex items-start gap-2.5">
            <Icon name="verified" className="text-[20px] text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 leading-relaxed">
              <p className="font-semibold text-indigo-900">Yêu cầu kênh: {campaign.followerRequirement}</p>
              <p className="text-indigo-700/80 mt-0.5">
                Số đơn và GMV tháng giúp Brand đánh giá năng lực ra số thực tế của bạn để ưu tiên duyệt gửi mẫu sớm.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bước 2: Chọn mẫu & Gửi đơn */}
      {step === 2 && (
        <div className="space-y-5">
          {campaign.sampleProducts && campaign.sampleProducts.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-slate-800">
                Chọn mẫu muốn nhận <span className="text-[#ec4899]">*</span>
              </legend>
              <div className="max-h-60 space-y-2.5 overflow-y-auto pr-1">
                {campaign.sampleProducts.map((p) => {
                  const sampleImg = p.image || campaign.productHeroImage;
                  const isSelected = p.code === productCode;
                  const isDisabled = Boolean(p.disabled);

                  return (
                    <label
                      key={p.code}
                      className={cx(
                        'flex items-center gap-3 rounded-2xl p-3 text-sm transition-all border',
                        isDisabled
                          ? 'opacity-50 cursor-not-allowed bg-slate-100/70 border-slate-200'
                          : isSelected
                            ? 'bg-violet-50/80 border-violet-500 ring-2 ring-violet-400/50 cursor-pointer shadow-xs'
                            : 'bg-white border-slate-200 hover:border-violet-300 hover:bg-slate-50 cursor-pointer'
                      )}
                    >
                      <input
                        type="radio"
                        name="sample"
                        disabled={isDisabled}
                        checked={isSelected}
                        onChange={() => !isDisabled && setProductCode(p.code)}
                        className="h-4 w-4 accent-[#8b5cf6] shrink-0"
                      />
                      {sampleImg && (
                        <img
                          src={sampleImg}
                          alt={p.name}
                          className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-900 text-xs sm:text-sm">{p.name}</span>
                          <span className="rounded bg-violet-100 text-violet-700 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                            {p.code}
                          </span>
                        </div>
                        {isDisabled ? (
                          <span className="text-[11px] font-medium text-red-500 block mt-0.5">
                            (Đã tạm dừng nhận đăng ký mẫu này)
                          </span>
                        ) : p.shortDesc ? (
                          <span className="text-xs text-slate-500 line-clamp-1 block mt-0.5">{p.shortDesc}</span>
                        ) : null}
                      </div>
                    </label>
                  );
                })}
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
                <b className="text-slate-900">Tôi cam kết</b> làm video đúng brief, gắn giỏ hàng chính hãng của Brand, thông tin kênh và số liệu bán hàng là chính xác.
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
