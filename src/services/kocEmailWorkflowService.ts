import { KOCApplication, ApplicationStatus } from '../types';

export type EmailDecisionType = 'approved' | 'rejected' | 'video_approved' | 'video_rejected';

export interface KocEmailWebhookPayload {
  event: 'koc_status_updated';
  decision: EmailDecisionType;
  status: ApplicationStatus;
  timestamp: string;
  applicationId: string;
  applicationCode: string;
  kocName: string;
  kocEmail: string;
  tiktokHandle: string;
  channelLink: string;
  phone: string;
  campaignId: string;
  campaignName: string;
  selectedSample: string;
  shippingCode: string;
  shippingStatus: string;
  adminFeedback: string;
  emailSubject: string;
  emailHtml: string;
  emailPlainText: string;
  actionUrl: string;
}

export interface EmailWorkflowLogItem {
  id: string;
  timestamp: string;
  kocName: string;
  kocEmail: string;
  tiktokHandle: string;
  campaignName: string;
  decision: EmailDecisionType;
  statusLabel: string;
  emailSubject: string;
  deliveryStatus: 'sent' | 'skipped_invalid_email' | 'failed';
  webhookTarget: string;
}

const STORAGE_KEY_WEBHOOK_URL = 'kocity_n8n_email_webhook_url';
const STORAGE_KEY_EMAIL_LOGS = 'kocity_email_workflow_logs';
const STORAGE_KEY_ENABLED = 'kocity_email_workflow_enabled';

const DEFAULT_N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/kocity-koc-email';

export function getEmailWebhookUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_WEBHOOK_URL);
    if (saved !== null && saved.trim() !== '') return saved.trim();
  } catch {}
  return (import.meta.env.VITE_N8N_EMAIL_WEBHOOK_URL as string) || DEFAULT_N8N_WEBHOOK_URL;
}

export function setEmailWebhookUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_WEBHOOK_URL, url.trim());
  } catch {}
}

export function isEmailWorkflowEnabled(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ENABLED);
    if (saved !== null) return saved === 'true';
  } catch {}
  return true; // Mặc định bật tự động gửi email khi duyệt / từ chối
}

export function setEmailWorkflowEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false');
  } catch {}
}

export function getEmailWorkflowLogs(): EmailWorkflowLogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMAIL_LOGS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function appendEmailWorkflowLog(item: EmailWorkflowLogItem): void {
  try {
    const current = getEmailWorkflowLogs();
    const updated = [item, ...current].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_EMAIL_LOGS, JSON.stringify(updated));
  } catch {}
}

export function isValidKocRealEmail(email?: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (!clean.includes('@')) return false;
  // Loại bỏ email tự sinh nội bộ khi KOC đăng nhập bằng SĐT/TikTok mà chưa điền email thật
  if (clean.endsWith('@kocity.local') || clean.endsWith('@koctrend.local')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
}

/**
 * Tạo nội dung Email HTML chuẩn thương hiệu KOCity cho từng trạng thái Duyệt / Từ chối
 */
export function buildKocStatusEmailTemplate(
  app: KOCApplication,
  newStatus: ApplicationStatus,
  feedback?: string
): {
  decision: EmailDecisionType;
  subject: string;
  html: string;
  plainText: string;
  actionUrl: string;
} | null {
  let decision: EmailDecisionType | null = null;
  if (newStatus === 'Đã duyệt gửi mẫu') decision = 'approved';
  else if (newStatus === 'Từ chối') decision = 'rejected';
  else if (newStatus === 'Đã hoàn thành' || newStatus === 'Đã lên bài') decision = 'video_approved';
  else if (newStatus === 'Bị từ chối') decision = 'video_rejected';

  if (!decision) return null;

  const kocName = app.kocName || app.tiktokHandle || 'Bạn';
  const handle = app.tiktokHandle?.startsWith('@') ? app.tiktokHandle : `@${app.tiktokHandle || ''}`;
  const campaignName = app.campaignName || 'Chiến dịch KOCity';
  const code = app.code || '#KOC';
  const shippingCode = app.shippingCode || 'Đang cập nhật mã vận đơn';
  const sampleName = app.selectedSampleName || 'Bộ sản phẩm mẫu 0đ theo chiến dịch';
  const reasonText =
    feedback?.trim() ||
    (decision === 'rejected'
      ? 'Hồ sơ hoặc tệp người xem hiện tại của kênh chưa khớp với tiêu chí ưu tiên trong đợt phát mẫu này của Nhãn hàng.'
      : 'Video cần bổ sung thêm cảnh trải nghiệm thực tế và gắn đầy đủ link giỏ hàng theo yêu cầu của Brief.');

  const myAppsUrl = 'https://kocity.io.vn/don-cua-toi';
  const marketplaceUrl = 'https://kocity.io.vn';

  if (decision === 'approved') {
    const subject = `🎉 [KOCity] Chúc mừng ${kocName}! Hồ sơ nhận mẫu "${campaignName}" đã được DUYỆT`;
    const plainText = `Chúc mừng ${kocName} (${handle})!\nHồ sơ đăng ký nhận mẫu (${code}) cho chiến dịch "${campaignName}" đã được DUYỆT THÀNH CÔNG.\n- Sản phẩm mẫu: ${sampleName}\n- Mã vận đơn: ${shippingCode}\n- Lưu ý: Sau khi nhận hàng, bạn vui lòng lên bài video review trong vòng 5-7 ngày và nộp link tại: ${myAppsUrl}`;
    const html = `
<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:20px;">
  <div style="background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);padding:28px 24px;border-radius:16px 16px 0 0;color:#ffffff;text-align:center;">
    <div style="display:inline-block;background:rgba(255,255,255,0.2);padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:0.5px;margin-bottom:10px;">
      KOCITY OFFICIAL NOTIFICATION
    </div>
    <h1 style="margin:0;font-size:22px;font-weight:800;line-height:1.35;">🎉 Hồ Sơ Nhận Mẫu 0đ Đã Được Duyệt!</h1>
    <p style="margin:8px 0 0;font-size:14px;opacity:0.92;">Chiến dịch: <strong>${campaignName}</strong></p>
  </div>

  <div style="background:#ffffff;padding:28px 24px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none;color:#1e293b;">
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
      Xin chào <strong>${kocName}</strong> (<span style="color:#7c3aed;font-weight:600;">${handle}</span>),
    </p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#475569;">
      Chúc mừng bạn! Nhãn hàng và đội ngũ vận hành <strong>KOCity</strong> đã xét duyệt <strong>THÀNH CÔNG</strong> đơn đăng ký nhận mẫu trải nghiệm miễn phí của bạn.
    </p>

    <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:18px;margin-bottom:22px;">
      <p style="margin:0 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;color:#6d28d9;letter-spacing:0.5px;">
        📦 Thông tin đơn gửi mẫu của bạn
      </p>
      <table style="width:100%;font-size:13.5px;border-collapse:collapse;color:#334155;">
        <tr>
          <td style="padding:6px 0;color:#64748b;width:38%;">Mã hồ sơ:</td>
          <td style="padding:6px 0;font-weight:700;color:#0f172a;">${code}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b;">Sản phẩm mẫu:</td>
          <td style="padding:6px 0;font-weight:700;color:#7c3aed;">${sampleName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b;">Mã vận đơn:</td>
          <td style="padding:6px 0;font-weight:700;color:#059669;">${shippingCode}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b;">Chi phí mẫu & ship:</td>
          <td style="padding:6px 0;font-weight:700;color:#059669;">0đ (Nhãn hàng tài trợ 100%)</td>
        </tr>
      </table>
    </div>

    ${
      feedback
        ? `<div style="background:#ecfdf5;border-left:4px solid #10b981;padding:12px 16px;border-radius:8px;margin-bottom:20px;font-size:13px;color:#065f46;">
            <strong>💬 Lời nhắn từ Admin:</strong> "${feedback}"
          </div>`
        : ''
    }

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:24px;font-size:13px;color:#475569;line-height:1.6;">
      <strong style="color:#0f172a;display:block;margin-bottom:6px;">📌 3 bước tiếp theo dành cho KOC:</strong>
      1. Chú ý điện thoại để nhận bưu phẩm mẫu trong 2 - 4 ngày tới.<br/>
      2. Mở hộp trải nghiệm và sáng tạo video theo đúng định hướng Brief của chiến dịch.<br/>
      3. Đăng video gắn giỏ hàng TikTok Shop trong vòng <strong>5 - 7 ngày</strong> sau khi nhận mẫu và dán link nghiệm thu trên web KOCity.
    </div>

    <div style="text-align:center;margin:26px 0 12px;">
      <a href="${myAppsUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:12px;">
        Theo Dõi Đơn & Nộp Link Video →
      </a>
    </div>
  </div>

  <div style="text-align:center;padding-top:18px;font-size:12px;color:#94a3b8;">
    <p style="margin:0;">KOCity — Nền tảng kết nối KOC & Nhận mẫu thử 0đ hàng đầu Việt Nam</p>
    <p style="margin:4px 0 0;"><a href="https://kocity.io.vn" style="color:#7c3aed;text-decoration:none;">kocity.io.vn</a> • Hotline/Zalo hỗ trợ: 098 395 62 43</p>
  </div>
</div>`.trim();

    return { decision, subject, html, plainText, actionUrl: myAppsUrl };
  }

  if (decision === 'rejected') {
    const subject = `📩 [KOCity] Thông báo kết quả xét duyệt hồ sơ chiến dịch "${campaignName}"`;
    const plainText = `Xin chào ${kocName} (${handle}),\nCảm ơn bạn đã đăng ký tham gia chiến dịch "${campaignName}" (${code}).\nRất tiếc hồ sơ của bạn chưa nằm trong danh sách duyệt gửi mẫu đợt này.\nPhản hồi: ${reasonText}\nBạn hãy khám phá các chiến dịch mẫu 0đ khác đang mở tại: ${marketplaceUrl}`;
    const html = `
<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:20px;">
  <div style="background:linear-gradient(135deg,#334155 0%,#0f172a 100%);padding:26px 24px;border-radius:16px 16px 0 0;color:#ffffff;text-align:center;">
    <div style="display:inline-block;background:rgba(255,255,255,0.15);padding:5px 14px;border-radius:999px;font-size:12px;font-weight:700;margin-bottom:10px;">
      KOCITY CAMPAIGN UPDATE
    </div>
    <h1 style="margin:0;font-size:20px;font-weight:800;">Kết Quả Xét Duyệt Hồ Sơ Nhận Mẫu</h1>
    <p style="margin:8px 0 0;font-size:13.5px;opacity:0.85;">Chiến dịch: <strong>${campaignName}</strong></p>
  </div>

  <div style="background:#ffffff;padding:28px 24px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none;color:#1e293b;">
    <p style="margin:0 0 14px;font-size:15px;">
      Xin chào <strong>${kocName}</strong> (<span style="color:#7c3aed;font-weight:600;">${handle}</span>),
    </p>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#475569;">
      Cảm ơn bạn đã quan tâm và gửi hồ sơ đăng ký (<strong>${code}</strong>) cho chiến dịch <strong>${campaignName}</strong> trên nền tảng KOCity.
    </p>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#475569;">
      Do số lượng suất mẫu thử 0đ trong đợt này có giới hạn, rất tiếc hồ sơ của bạn chưa được lựa chọn trong đợt phát mẫu lần này.
    </p>

    <div style="background:#fff1f2;border-left:4px solid #f43f5e;padding:14px 16px;border-radius:8px;margin-bottom:22px;font-size:13.5px;color:#881337;line-height:1.5;">
      <strong>📋 Phản hồi từ Ban Quản Trị / Nhãn hàng:</strong><br/>
      "${reasonText}"
    </div>

    <p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:#475569;">
      Đừng nản lòng nhé! Trên <strong>KOCity</strong> hiện vẫn đang có rất nhiều chiến dịch nhận mẫu 0đ từ các thương hiệu uy tín khác phù hợp với định hướng kênh của bạn.
    </p>

    <div style="text-align:center;margin:24px 0 10px;">
      <a href="${marketplaceUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:12px;">
        Khám Phá Chiến Dịch Mẫu 0đ Khác →
      </a>
    </div>
  </div>

  <div style="text-align:center;padding-top:18px;font-size:12px;color:#94a3b8;">
    <p style="margin:0;">KOCity — Nền tảng kết nối KOC & Nhận mẫu thử 0đ hàng đầu Việt Nam</p>
    <p style="margin:4px 0 0;"><a href="https://kocity.io.vn" style="color:#7c3aed;text-decoration:none;">kocity.io.vn</a></p>
  </div>
</div>`.trim();

    return { decision, subject, html, plainText, actionUrl: marketplaceUrl };
  }

  if (decision === 'video_approved') {
    const subject = `🌟 [KOCity] Nghiệm thu thành công video chiến dịch "${campaignName}"!`;
    const plainText = `Chúc mừng ${kocName} (${handle})!\nVideo nghiệm thu của bạn cho chiến dịch "${campaignName}" (${code}) đã được duyệt HOÀN THÀNH. Điểm uy tín KOC của bạn đã được cộng thêm!`;
    const html = `
<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:20px;">
  <div style="background:linear-gradient(135deg,#059669 0%,#0d9488 100%);padding:26px 24px;border-radius:16px 16px 0 0;color:#ffffff;text-align:center;">
    <h1 style="margin:0;font-size:21px;font-weight:800;">🌟 Nghiệm Thu Video Thành Công!</h1>
    <p style="margin:8px 0 0;font-size:13.5px;opacity:0.9;">Chiến dịch: <strong>${campaignName}</strong></p>
  </div>
  <div style="background:#ffffff;padding:26px 24px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none;color:#1e293b;">
    <p style="font-size:15px;">Chúc mừng <strong>${kocName}</strong> (${handle}),</p>
    <p style="font-size:14px;line-height:1.6;color:#475569;">
      Video review của bạn cho hồ sơ <strong>${code}</strong> đã được Quản trị viên nghiệm thu <strong>ĐÃ HOÀN THÀNH</strong>. Hồ sơ của bạn đã được nâng hạng ưu tiên duyệt mẫu nhanh cho các chiến dịch tiếp theo!
    </p>
    <div style="text-align:center;margin:24px 0 10px;">
      <a href="${marketplaceUrl}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 26px;border-radius:12px;">
        Nhận Thêm Mẫu Chiến Dịch Mới →
      </a>
    </div>
  </div>
</div>`.trim();

    return { decision, subject, html, plainText, actionUrl: marketplaceUrl };
  }

  // video_rejected
  const subject = `⚠️ [KOCity] Cần chỉnh sửa video nghiệm thu chiến dịch "${campaignName}"`;
  const plainText = `Xin chào ${kocName} (${handle}),\nVideo nghiệm thu cho chiến dịch "${campaignName}" (${code}) cần chỉnh sửa thêm.\nGóp ý từ Admin: ${reasonText}\nVui lòng cập nhật lại tại: ${myAppsUrl}`;
  const html = `
<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:20px;">
  <div style="background:linear-gradient(135deg,#d97706 0%,#ea580c 100%);padding:26px 24px;border-radius:16px 16px 0 0;color:#ffffff;text-align:center;">
    <h1 style="margin:0;font-size:20px;font-weight:800;">⚠️ Yêu Cầu Bổ Sung / Chỉnh Sửa Video</h1>
    <p style="margin:8px 0 0;font-size:13.5px;opacity:0.9;">Chiến dịch: <strong>${campaignName}</strong></p>
  </div>
  <div style="background:#ffffff;padding:26px 24px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none;color:#1e293b;">
    <p style="font-size:15px;">Xin chào <strong>${kocName}</strong> (${handle}),</p>
    <p style="font-size:14px;line-height:1.6;color:#475569;">
      Đội ngũ nghiệm thu đã xem video của bạn cho hồ sơ <strong>${code}</strong> và có một số góp ý để video đạt chuẩn chiến dịch:
    </p>
    <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:14px 16px;border-radius:8px;margin-bottom:20px;font-size:13.5px;color:#92400e;">
      <strong>💬 Góp ý chỉnh sửa:</strong><br/>"${reasonText}"
    </div>
    <div style="text-align:center;margin:24px 0 10px;">
      <a href="${myAppsUrl}" style="display:inline-block;background:#ea580c;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 26px;border-radius:12px;">
        Nộp Lại Link Video Đã Sửa →
      </a>
    </div>
  </div>
</div>`.trim();

  return { decision, subject, html, plainText, actionUrl: myAppsUrl };
}

/**
 * Kích hoạt gửi Email thông báo kết quả Duyệt / Từ chối cho KOC qua n8n Webhook
 */
export async function triggerKocStatusEmailWorkflow(
  app: KOCApplication,
  newStatus: ApplicationStatus,
  feedback?: string
): Promise<{ sent: boolean; reason?: string; payload?: KocEmailWebhookPayload }> {
  if (!isEmailWorkflowEnabled()) {
    return { sent: false, reason: 'disabled' };
  }

  const template = buildKocStatusEmailTemplate(app, newStatus, feedback);
  if (!template) {
    return { sent: false, reason: 'not_an_email_status' };
  }

  const webhookUrl = getEmailWebhookUrl();
  const cleanEmail = (app.email || '').trim();

  if (!isValidKocRealEmail(cleanEmail)) {
    appendEmailWorkflowLog({
      id: `email-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleString('vi-VN'),
      kocName: app.kocName || app.tiktokHandle,
      kocEmail: cleanEmail || '(Trống)',
      tiktokHandle: app.tiktokHandle,
      campaignName: app.campaignName,
      decision: template.decision,
      statusLabel: newStatus,
      emailSubject: template.subject,
      deliveryStatus: 'skipped_invalid_email',
      webhookTarget: webhookUrl,
    });
    return { sent: false, reason: 'invalid_email' };
  }

  const payload: KocEmailWebhookPayload = {
    event: 'koc_status_updated',
    decision: template.decision,
    status: newStatus,
    timestamp: new Date().toISOString(),
    applicationId: app.id,
    applicationCode: app.code,
    kocName: app.kocName || app.tiktokHandle,
    kocEmail: cleanEmail,
    tiktokHandle: app.tiktokHandle,
    channelLink: app.channelLink || `https://www.tiktok.com/@${app.tiktokHandle.replace(/^@/, '')}`,
    phone: app.phone || '',
    campaignId: app.campaignId,
    campaignName: app.campaignName,
    selectedSample: app.selectedSampleName || 'Mẫu tiêu chuẩn',
    shippingCode: app.shippingCode || '',
    shippingStatus: app.shippingStatus || '',
    adminFeedback: feedback || app.adminFeedback || '',
    emailSubject: template.subject,
    emailHtml: template.html,
    emailPlainText: template.plainText,
    actionUrl: template.actionUrl,
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    appendEmailWorkflowLog({
      id: `email-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleString('vi-VN'),
      kocName: app.kocName || app.tiktokHandle,
      kocEmail: cleanEmail,
      tiktokHandle: app.tiktokHandle,
      campaignName: app.campaignName,
      decision: template.decision,
      statusLabel: newStatus,
      emailSubject: template.subject,
      deliveryStatus: 'sent',
      webhookTarget: webhookUrl,
    });

    return { sent: true, payload };
  } catch (err) {
    console.warn('Lỗi gửi webhook email KOC:', err);
    appendEmailWorkflowLog({
      id: `email-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleString('vi-VN'),
      kocName: app.kocName || app.tiktokHandle,
      kocEmail: cleanEmail,
      tiktokHandle: app.tiktokHandle,
      campaignName: app.campaignName,
      decision: template.decision,
      statusLabel: newStatus,
      emailSubject: template.subject,
      deliveryStatus: 'failed',
      webhookTarget: webhookUrl,
    });
    return { sent: false, reason: 'network_error', payload };
  }
}
