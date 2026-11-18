import React, { useState, useEffect } from 'react';
import {
  getEmailWebhookUrl,
  setEmailWebhookUrl,
  isEmailWorkflowEnabled,
  setEmailWorkflowEnabled,
  getEmailWorkflowLogs,
  triggerKocStatusEmailWorkflow,
  buildKocStatusEmailTemplate,
  EmailWorkflowLogItem,
} from '../services/kocEmailWorkflowService';
import { KOCApplication } from '../types';
import { copyTextToClipboard } from '../lib/clipboard';
import workflowJson from '../../kocity_koc_approval_email_workflow.json';

interface AdminEmailWorkflowModalProps {
  open: boolean;
  onClose: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

const SAMPLE_APPS_SCRIPT_CODE = `// Dán đoạn mã này vào Extensions -> Apps Script của Google Sheet (hoặc tạo project tại script.google.com)
// Sau đó bấm Deploy -> New deployment -> Web app (Who has access: Anyone) và dán URL vào KOCity Admin!
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.event === 'koc_status_updated' && data.kocEmail && data.kocEmail.indexOf('@') > -1) {
      MailApp.sendEmail({
        to: data.kocEmail,
        subject: data.emailSubject || '[KOCity] Thông báo trạng thái hồ sơ nhận mẫu',
        htmlBody: data.emailHtml,
        name: 'KOCity - Nền Tảng Nhận Mẫu 0đ'
      });
      return ContentService.createTextOutput(JSON.stringify({ ok: true, sentTo: data.kocEmail }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: false, reason: 'ignored' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

export const AdminEmailWorkflowModal: React.FC<AdminEmailWorkflowModalProps> = ({
  open,
  onClose,
  onShowToast,
}) => {
  const [enabled, setEnabled] = useState(true);
  const [webhookUrl, setWebhookUrlState] = useState('');
  const [testEmail, setTestEmail] = useState('kocityvn@gmail.com');
  const [testType, setTestType] = useState<'Đã duyệt gửi mẫu' | 'Từ chối'>('Đã duyệt gửi mẫu');
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'preview' | 'logs'>('config');
  const [logs, setLogs] = useState<EmailWorkflowLogItem[]>([]);
  const [copiedScript, setCopiedScript] = useState(false);

  useEffect(() => {
    if (open) {
      setEnabled(isEmailWorkflowEnabled());
      setWebhookUrlState(getEmailWebhookUrl());
      setLogs(getEmailWorkflowLogs());
    }
  }, [open]);

  if (!open) return null;

  const handleSaveConfig = () => {
    setEmailWorkflowEnabled(enabled);
    setEmailWebhookUrl(webhookUrl);
    onShowToast('Đã lưu cấu hình Email Workflow!', 'Hệ thống sẽ tự động bắn email mỗi khi bạn bấm Duyệt hoặc Từ chối KOC.', 'success');
  };

  const handleDownloadN8nWorkflow = () => {
    const blob = new Blob([JSON.stringify(workflowJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kocity_koc_approval_email_workflow.json';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Đã tải file Workflow n8n!', 'Hãy mở n8n -> Import from File -> Chọn file vừa tải.', 'success');
  };

  const handleCopyAppsScript = async () => {
    const ok = await copyTextToClipboard(SAMPLE_APPS_SCRIPT_CODE);
    if (ok) {
      setCopiedScript(true);
      onShowToast('Đã sao chép mã Apps Script!', 'Dán vào script.google.com để gửi Gmail 24/7 miễn phí.', 'success');
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim() || !testEmail.includes('@')) {
      onShowToast('Email không hợp lệ', 'Vui lòng nhập địa chỉ email nhận thử nghiệm.', 'warning');
      return;
    }
    setEmailWebhookUrl(webhookUrl);
    setEmailWorkflowEnabled(true);
    setIsTesting(true);

    const mockApp: KOCApplication = {
      id: `test-${Date.now()}`,
      code: '#KOC-8899',
      kocName: 'Minh Thư KOC (Test)',
      avatar: '',
      phone: '0983956243',
      email: testEmail.trim(),
      tiktokHandle: '@minhthu.reviews',
      channelLink: 'https://www.tiktok.com/@minhthu.reviews',
      followers: '16.5K',
      followersCount: 16500,
      avgViews: 'Avg 25K',
      address: 'Hà Nội',
      shippingCode: 'GHTK-89234129',
      shippingStatus: 'Đang trung chuyển',
      createdAtTime: '14:30',
      createdAtDate: new Date().toLocaleDateString('vi-VN'),
      status: testType,
      videoLink: '',
      videoViews: '',
      audience: 'Nữ 18-28',
      contentConcept: 'Unbox & Test chất son thực tế',
      campaignId: 'co-mem-sample',
      campaignName: 'CỎ MỀM HOMELAB – TẶNG MẪU 0Đ',
      verified: true,
      selectedSampleName: 'Combo Son Dưỡng Gạo & Kem Chống Nắng Sâm 1700',
    };

    const res = await triggerKocStatusEmailWorkflow(
      mockApp,
      testType,
      testType === 'Từ chối'
        ? 'Đợt phát mẫu lần này ưu tiên các kênh chuyên sâu về Skincare da nhạy cảm. Hẹn gặp bạn ở chiến dịch tuần tới nhé!'
        : 'Mẫu thử đã được đóng gói và bàn giao cho đơn vị vận chuyển.'
    );
    setIsTesting(false);
    setLogs(getEmailWorkflowLogs());

    if (res.sent) {
      onShowToast(
        'Đã bắn tín hiệu Email thử nghiệm!',
        `Đã gửi payload "${testType}" của ${testEmail} tới Webhook.`,
        'success'
      );
    } else {
      onShowToast('Không thể gửi thử', `Lý do: ${res.reason || 'Lỗi kết nối webhook'}`, 'warning');
    }
  };

  const previewTemplate = buildKocStatusEmailTemplate(
    {
      id: 'preview-1',
      code: '#KOC-6868',
      kocName: 'Thu Hà Beauty',
      avatar: '',
      phone: '0983956243',
      email: 'thuha.koc@gmail.com',
      tiktokHandle: '@thuha.glow',
      followers: '18.2K',
      address: 'TP.HCM',
      shippingCode: 'GHTK-99887766',
      shippingStatus: 'Đang trung chuyển',
      createdAtTime: '10:00',
      createdAtDate: '18/11/2026',
      status: testType,
      videoLink: '',
      videoViews: '',
      audience: '',
      contentConcept: '',
      campaignId: 'comem',
      campaignName: 'CỎ MỀM HOMELAB – CHIẾN DỊCH MẪU 0Đ',
      verified: true,
      selectedSampleName: 'Set Quà Tặng Dưỡng Thể Cỏ Mềm',
    },
    testType,
    testType === 'Từ chối'
      ? 'Số lượng mẫu thử 0đ đợt 1 đã phát hết. KOCity ưu tiên giữ hồ sơ của bạn cho đợt 2.'
      : 'Chúc bạn sáng tạo video thật bùng nổ đơn hàng nhé!'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 via-indigo-700 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
              <span className="material-symbols-outlined text-[22px]">forward_to_inbox</span>
            </span>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Workflow Tự Động Gửi Email Khi Duyệt / Từ Chối KOC
              </h3>
              <p className="text-xs text-violet-200">
                Tự động bắn Email HTML thương hiệu KOCity về hộp thư KOC ngay khi Admin bấm Duyệt hoặc Từ chối
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              activeTab === 'config'
                ? 'border-violet-600 text-violet-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚙️ Cấu Hình Webhook & Tải File n8n
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'border-violet-600 text-violet-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            👁️ Xem Trước Mẫu Email HTML
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'border-violet-600 text-violet-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Lịch Sử Đã Gửi ({logs.length})
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'config' && (
            <>
              {/* Toggle Enable */}
              <div className="flex items-center justify-between rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Kích hoạt tự động gửi Email khi Duyệt / Từ chối KOC
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Mỗi khi bạn ấn nút <b>"Duyệt gửi mẫu"</b>, <b>"Hoàn thành"</b> hoặc <b>"Từ chối"</b>, hệ thống sẽ tự động gửi email tới địa chỉ email của KOC.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              {/* Webhook URL Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Đường dẫn Webhook nhận lệnh gửi Email (n8n hoặc Google Apps Script)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrlState(e.target.value)}
                    placeholder="http://localhost:5678/webhook/kocity-koc-email"
                    className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:border-violet-600 focus:ring-2 focus:ring-violet-200 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveConfig}
                    className="rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    Lưu Cấu Hình
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setWebhookUrlState('http://localhost:5678/webhook/kocity-koc-email')}
                    className="text-[11px] font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-lg border border-violet-200 cursor-pointer"
                  >
                    Dùng link n8n Local (Cổng 5678)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWebhookUrlState('http://localhost:5678/webhook-test/kocity-koc-email')}
                    className="text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer"
                  >
                    Dùng link n8n Test Mode (webhook-test)
                  </button>
                </div>
              </div>

              {/* 2 Cách cài đặt nhanh */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Cách 1: n8n */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
                        Cách 1: Chạy qua n8n
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">5 Nodes chuẩn</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Import File Workflow n8n</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      File JSON đã thiết lập sẵn Webhook <code>/webhook/kocity-koc-email</code>, bộ lọc email hợp lệ, mẫu HTML và node Gmail/SMTP.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadN8nWorkflow}
                    className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Tải File Workflow n8n (.json)</span>
                  </button>
                </div>

                {/* Cách 2: Google Apps Script */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        Cách 2: Google Apps Script (24/7)
                      </span>
                      <span className="text-[11px] text-emerald-700 font-bold">Không lo sập</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Gửi Trực Tiếp Từ Gmail Của Bạn</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Nếu không muốn bật máy chạy n8n, chỉ cần dán đoạn mã này vào Google Apps Script để gửi email tự động 24/7 hoàn toàn miễn phí.
                    </p>
                  </div>
                  <button
                    onClick={handleCopyAppsScript}
                    className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 py-2.5 text-xs font-bold text-emerald-800 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    <span>{copiedScript ? '✓ Đã sao chép mã Apps Script!' : 'Sao chép mã Google Apps Script'}</span>
                  </button>
                </div>
              </div>

              {/* Box Test gửi thử */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    🧪 Test Bắn Thử Email Ngay Lập Tức
                  </h4>
                  <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setTestType('Đã duyệt gửi mẫu')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        testType === 'Đã duyệt gửi mẫu' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Mẫu Duyệt Thành Công
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestType('Từ chối')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        testType === 'Từ chối' ? 'bg-rose-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Mẫu Từ Chối
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Nhập email để nhận thử (VD: ban@gmail.com)"
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  />
                  <button
                    onClick={handleSendTest}
                    disabled={isTesting}
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>{isTesting ? 'Đang gửi...' : 'Bắn Thử Ngay'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'preview' && previewTemplate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-600">
                  Tiêu đề: <strong className="text-slate-900">{previewTemplate.subject}</strong>
                </p>
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setTestType('Đã duyệt gửi mẫu')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      testType === 'Đã duyệt gửi mẫu' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    🎉 Khi Duyệt Mẫu
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestType('Từ chối')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      testType === 'Từ chối' ? 'bg-rose-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    📩 Khi Từ Chối
                  </button>
                </div>
              </div>
              <div
                className="rounded-2xl border border-slate-200 bg-slate-100 p-4 overflow-auto max-h-[460px]"
                dangerouslySetInnerHTML={{ __html: previewTemplate.html }}
              />
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  Chưa có lịch sử gửi email nào. Hãy thử duyệt 1 KOC hoặc bấm "Bắn Thử Ngay" ở tab Cấu hình.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {logs.map((item) => (
                    <div key={item.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.decision === 'approved' || item.decision === 'video_approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.statusLabel}
                          </span>
                          <span className="font-bold text-slate-900 truncate">{item.kocName}</span>
                          <span className="text-slate-500 font-mono truncate">({item.kocEmail})</span>
                        </div>
                        <p className="text-slate-600 truncate mt-1">{item.emailSubject}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.deliveryStatus === 'sent'
                              ? 'bg-blue-50 text-blue-700'
                              : item.deliveryStatus === 'skipped_invalid_email'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {item.deliveryStatus === 'sent'
                            ? '✓ Đã bắn Webhook'
                            : item.deliveryStatus === 'skipped_invalid_email'
                            ? 'Bỏ qua (Chưa có email thật)'
                            : 'Lỗi mạng'}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            💡 Chỉ gửi cho các KOC có điền địa chỉ email thật (tự động bỏ qua các tài khoản chưa cập nhật email).
          </span>
          <button
            onClick={() => {
              handleSaveConfig();
              onClose();
            }}
            className="rounded-xl bg-violet-600 hover:bg-violet-700 px-5 py-2 text-xs font-bold text-white shadow-sm cursor-pointer"
          >
            Hoàn Tất & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
