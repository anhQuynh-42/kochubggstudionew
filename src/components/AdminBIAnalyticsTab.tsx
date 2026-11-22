import React, { useEffect, useMemo, useState } from 'react';
import { Campaign, KOCApplication, KocityChannelMetric, KocityChannelType } from '../types';
import { copyTextToClipboard } from '../lib/clipboard';
import {
  DEFAULT_OMNICHANNEL_METRICS,
  getKocityChannelMetricsFromSupabase,
} from '../services/supabaseService';
import syncChannelsWorkflowJson from '../../kocity_sync_5_channels_to_sheets_workflow.json';

interface AdminBIAnalyticsTabProps {
  campaigns: Campaign[];
  applications: KOCApplication[];
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

const STORAGE_KEY_LOOKER_URL = 'kocity_looker_embed_url';
const STORAGE_KEY_SYNC_WEBHOOK = 'kocity_n8n_sync_channels_webhook';
const STORAGE_KEY_SHEET_URL = 'kocity_bi_sheet_csv_url';
const DEFAULT_SYNC_WEBHOOK_URL = 'http://localhost:5678/webhook/kocity-sync-channels';
const DEFAULT_BI_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/16HWYJ3w8x2k_lLvOnB7OGdtWe2KhAAVmNNG6SNkYuZo/edit?usp=sharing';
const DEFAULT_LOOKER_STUDIO_URL =
  'https://lookerstudio.google.com/embed/reporting/7c66d251-1403-49ac-b050-96ca6efd6763/page/4B6DG';

/**
 * Chuyển mọi link Google Sheet (link thường hoặc link Publish CSV) thành link xuất CSV đọc trực tiếp tab BI_He_Sinh_Thai
 */
function normalizeGoogleSheetCsvUrl(raw: string): string {
  const clean = (raw || '').trim();
  if (!clean) return '';
  if (clean.includes('output=csv') || clean.includes('format=csv') || clean.includes('tqx=out:csv')) return clean;

  const idMatch = clean.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (idMatch && idMatch[1]) {
    const gidMatch = clean.match(/[?#&]gid=(\d+)/);
    if (gidMatch && gidMatch[1]) {
      return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv&gid=${gidMatch[1]}`;
    }
    // Nếu link không có #gid=... -> đọc thẳng theo đúng tên tab BI_He_Sinh_Thai
    return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/gviz/tq?tqx=out:csv&sheet=BI_He_Sinh_Thai`;
  }
  return clean;
}

/** Parse 1 dòng CSV có hỗ trợ dấu ngoặc kép */
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

/** Parser CSV chuẩn RFC-4180 hỗ trợ ô chứa ký tự xuống dòng bên trong dấu ngoặc kép */
function parseCsvMatrix(csvText: string): string[][] {
  const text = csvText.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (ch === '\n') {
      row.push(cell.trim());
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((c) => c !== '')) rows.push(row);
  }
  return rows;
}

/** Parse số followers từ chuỗi Google Sheet (VD: "46.700", "15,2K", "1.2M") */
function parseSheetFollowerCount(raw?: string): number {
  if (!raw) return 0;
  const s = raw.toLowerCase().trim();
  if (!s) return 0;
  if (s.includes('m')) {
    const n = parseFloat(s.replace(',', '.'));
    return isNaN(n) ? 0 : Math.round(n * 1_000_000);
  }
  if (s.includes('k')) {
    const n = parseFloat(s.replace(',', '.'));
    return isNaN(n) ? 0 : Math.round(n * 1_000);
  }
  const digits = s.replace(/\D/g, '');
  return parseInt(digits, 10) || 0;
}

const SHEET_REGISTERED_ID = '1oDyaZtnnVIe5Nv6sAsolml2-w-1m_-UZ8spKSDmrS1M';
const SHEET_COMEM_WAVES_ID = '16HWYJ3w8x2k_lLvOnB7OGdtWe2KhAAVmNNG6SNkYuZo';
const ZALO_GROUP_MEMBERS_COUNT = 329;

const COMEM_WAVE_TABS = [
  { id: 'dot-1', label: 'Cỏ Mềm đợt 1', sheetTab: 'Lộc - Cỏ Mềm đợt 1', gid: '1896058750' },
  { id: 'dot-2', label: 'Cỏ Mềm đợt 2', sheetTab: 'Lộc - Cỏ Mềm đợt 2', gid: '459414595' },
  { id: 'campaign-moi', label: 'Cỏ Mềm Campaign mới', sheetTab: 'Cỏ Mềm Campaign mớii', gid: '557155338' },
] as const;

interface CoMemProductWaveRow {
  productName: string;
  waveId: string;
  waveLabel: string;
  totalSelected: number;
  brandApproved: number;
  adfiApproved: number;
  approvedReach: number;
}

interface LiveWaveReport {
  id: string;
  label: string;
  gid: string;
  totalReviewed: number;
  brandApproved: number;
  adfiApproved: number;
  approvedReach: number;
  approvalRatePct: number;
  adfiRatePct: number;
  products: CoMemProductWaveRow[];
}

interface LiveGoogleSheetsReport {
  loaded: boolean;
  loading: boolean;
  registeredTotal: number;
  registeredUniqueKocs: number;
  registeredTotalReach: number;
  waves: LiveWaveReport[];
  lastSyncedAt: string;
}

/** Đọc CSV tab BI_He_Sinh_Thai (Ngay, Nen_Tang, Ten_Kenh, Followers, Luot_Xem, Tuong_Tac, Tang_Moi) -> KocityChannelMetric[] */
function parseSheetCsvToChannelMetrics(csvText: string): KocityChannelMetric[] {
  const lines = csvText
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) =>
    h
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
  );

  const findCol = (candidates: string[], fallbackIdx: number) => {
    const idx = headers.findIndex((h) => candidates.some((c) => h.includes(c)));
    return idx >= 0 ? idx : fallbackIdx;
  };

  const iDate = findCol(['ngay', 'date'], 0);
  const iPlatform = findCol(['nen_tang', 'kenh', 'channel', 'platform'], 1);
  const iName = findCol(['ten_kenh', 'name'], 2);
  const iFollowers = findCol(['follower', 'thanh_vien', 'member'], 3);
  const iViews = findCol(['luot_xem', 'view', 'impression'], 4);
  const iEngage = findCol(['tuong_tac', 'engage', 'like'], 5);
  const iNew = findCol(['tang_moi', 'new', 'hom_nay'], 6);

  const byChannel = new Map<KocityChannelType, KocityChannelMetric>();
  const validChannels: KocityChannelType[] = ['website', 'tiktok', 'facebook', 'threads', 'zalo'];

  for (let r = 1; r < lines.length; r++) {
    const cols = splitCsvLine(lines[r]);
    const rawPlat = (cols[iPlatform] || '').toLowerCase().trim();
    const matchedChannel = validChannels.find((c) => rawPlat.includes(c));
    if (!matchedChannel) continue;

    const toNum = (v?: string) => parseInt((v || '').replace(/[^\d-]/g, ''), 10) || 0;
    // Ghi đè theo thứ tự từ trên xuống để luôn lấy dòng mới nhất cho từng kênh
    byChannel.set(matchedChannel, {
      id: `sheet-${matchedChannel}-${r}`,
      report_date: cols[iDate] || new Date().toISOString().split('T')[0],
      channel: matchedChannel,
      channel_name: cols[iName] || CHANNEL_CONFIG[matchedChannel].label,
      channel_url: CHANNEL_CONFIG[matchedChannel].defaultUrl,
      followers_or_members: toNum(cols[iFollowers]),
      total_views: toNum(cols[iViews]),
      engagements: toNum(cols[iEngage]),
      new_subscribers_today: toNum(cols[iNew]),
      notes: 'Đồng bộ trực tiếp từ Google Sheet BI_He_Sinh_Thai',
    });
  }

  return Array.from(byChannel.values());
}

const CHANNEL_CONFIG: Record<
  KocityChannelType,
  { label: string; icon: string; color: string; badge: string; defaultUrl: string }
> = {
  website: {
    label: 'Website KOCity',
    icon: 'language',
    color: 'from-violet-600 to-indigo-600',
    badge: 'bg-violet-100 text-violet-800',
    defaultUrl: 'https://kocity.io.vn',
  },
  tiktok: {
    label: 'TikTok KOCity',
    icon: 'music_note',
    color: 'from-pink-600 to-rose-600',
    badge: 'bg-pink-100 text-pink-800',
    defaultUrl: 'https://www.tiktok.com/@kocityvn',
  },
  facebook: {
    label: 'Facebook KOCity',
    icon: 'groups',
    color: 'from-blue-600 to-indigo-600',
    badge: 'bg-blue-100 text-blue-800',
    defaultUrl: 'https://www.facebook.com/profile.php?id=61595490457487',
  },
  threads: {
    label: 'Threads KOCity',
    icon: 'alternate_email',
    color: 'from-slate-800 to-slate-950',
    badge: 'bg-slate-100 text-slate-800',
    defaultUrl: 'https://www.threads.net/@kocity_booking',
  },
  zalo: {
    label: 'Zalo Community',
    icon: 'chat',
    color: 'from-sky-500 to-blue-600',
    badge: 'bg-sky-100 text-sky-800',
    defaultUrl: 'https://zalo.me/g/cjenmz664',
  },
};

/**
 * Chuẩn hóa link nhúng Looker Studio:
 * - Tự động bóc tách src="..." nếu người dùng dán cả thẻ <iframe>
 * - Tự động đổi /reporting/ -> /embed/reporting/ để hiển thị mượt trong iframe
 */
function normalizeEmbedUrl(raw: string): string {
  let clean = (raw || '').trim();
  if (!clean) return '';

  const srcMatch = clean.match(/src=["']([^"']+)["']/i);
  if (srcMatch && srcMatch[1]) {
    clean = srcMatch[1].trim();
  }

  if (
    (clean.includes('lookerstudio.google.com/reporting/') || clean.includes('datastudio.google.com/reporting/')) &&
    !clean.includes('/embed/reporting/')
  ) {
    clean = clean.replace('/reporting/', '/embed/reporting/');
  }

  return clean;
}

/** Khớp hồ sơ KOC với đúng chiến dịch (đồng bộ 100% logic của AdminView) */
function matchAppToCampaign(app: KOCApplication, camp: Campaign): boolean {
  if (app.campaignId && (app.campaignId === camp.id || app.campaignId === camp.code)) return true;
  if (!app.campaignName || !camp.title) return false;
  const aName = app.campaignName.toLowerCase().trim();
  const cTitle = camp.title.toLowerCase().trim();
  if (aName === cTitle || cTitle.includes(aName) || aName.includes(cTitle)) return true;
  if (
    (camp.id === 'comem-set-qua-duong-the' && (app.campaignId === 'co-mem-sample-20-10' || aName.includes('cỏ mềm'))) ||
    (camp.id === 'co-mem-sample-20-10' && (app.campaignId === 'comem-set-qua-duong-the' || aName.includes('cỏ mềm')))
  ) {
    return true;
  }
  return false;
}

/** Parse số follower từ followersCount hoặc chuỗi followers (VD: "15.2K", "1.2M") */
function parseFollowersNum(app: KOCApplication): number {
  if (typeof app.followersCount === 'number' && app.followersCount > 0) return app.followersCount;
  const raw = (app.followers || '').toLowerCase().trim();
  if (!raw) return 0;
  const num = parseFloat(raw.replace(',', '.'));
  if (isNaN(num)) return 0;
  if (raw.includes('m')) return Math.round(num * 1_000_000);
  if (raw.includes('k')) return Math.round(num * 1_000);
  return parseInt(raw.replace(/\D/g, ''), 10) || 0;
}

/** Parse lượt xem video (VD: "45K", "12.500") */
function parseViewsNum(raw?: string): number {
  if (!raw) return 0;
  const s = raw.toLowerCase().trim();
  const num = parseFloat(s.replace(',', '.'));
  if (isNaN(num)) return 0;
  if (s.includes('m')) return Math.round(num * 1_000_000);
  if (s.includes('k')) return Math.round(num * 1_000);
  return parseInt(s.replace(/\D/g, ''), 10) || 0;
}

const isApprovedStatus = (s: KOCApplication['status']) =>
  s === 'Đã duyệt gửi mẫu' || s === 'Đang giao' || s === 'Chờ duyệt video' || s === 'Đã lên bài' || s === 'Đã hoàn thành';

const isCompletedStatus = (s: KOCApplication['status']) => s === 'Đã lên bài' || s === 'Đã hoàn thành';

const isRejectedStatus = (s: KOCApplication['status']) => s === 'Từ chối' || s === 'Bị từ chối';

const SQL_VIEWS_SNIPPET = `-- Chạy 1 lần trong Supabase SQL Editor để Looker Studio tự động đọc số liệu tổng hợp toàn chiến dịch:
-- (File đầy đủ nằm tại: supabase/metabase_analytics_views.sql)
-- Tạo 4 View tự động:
-- 1. public.kocity_bi_campaign_summary   (Tổng hợp từng chiến dịch)
-- 2. public.kocity_bi_funnel_overview    (Phễu chuyển đổi 5 bước theo tháng)
-- 3. public.kocity_bi_daily_applications (Xu hướng đăng ký theo ngày)
-- 4. public.kocity_bi_koc_leaderboard    (Bảng xếp hạng & phân tầng KOC)`;

export const AdminBIAnalyticsTab: React.FC<AdminBIAnalyticsTabProps> = ({
  campaigns,
  applications,
  onShowToast,
}) => {
  const [viewMode, setViewMode] = useState<'campaigns-bi' | 'ecosystem' | 'looker' | 'koc-tiers' | 'sql-setup'>('campaigns-bi');
  const [campaignSearch, setCampaignSearch] = useState('');
  const [waveFilter, setWaveFilter] = useState<'all' | 'dot-1' | 'dot-2' | 'campaign-moi'>('all');
  const [sortBy, setSortBy] = useState<'apps' | 'approved' | 'completed' | 'reach'>('approved');

  // Dữ liệu lượt xem & tăng trưởng 5 kênh hệ sinh thái (TikTok, Facebook, Threads, Zalo, Website)
  const [channelMetrics, setChannelMetrics] = useState<KocityChannelMetric[]>(DEFAULT_OMNICHANNEL_METRICS);
  const [dataSourceLabel, setDataSourceLabel] = useState<'sheet' | 'supabase' | 'sample'>('sample');
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHEET_URL);
      if (saved && saved.trim()) return saved.trim();
    } catch {}
    return DEFAULT_BI_SHEET_URL;
  });
  const [syncWebhookUrl, setSyncWebhookUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SYNC_WEBHOOK);
      if (saved && saved.trim()) return saved.trim();
    } catch {}
    return DEFAULT_SYNC_WEBHOOK_URL;
  });
  const [isSyncingChannels, setIsSyncingChannels] = useState(false);

  // Báo cáo live từ 2 file Google Sheet (File KOC đăng ký + File 3 đợt Cỏ Mềm) & Zalo Group 329 TV
  const [sheetsReport, setSheetsReport] = useState<LiveGoogleSheetsReport>({
    loaded: false,
    loading: true,
    registeredTotal: 0,
    registeredUniqueKocs: 0,
    registeredTotalReach: 0,
    waves: [],
    lastSyncedAt: '',
  });

  const loadLiveGoogleSheetsReport = async (notify = false) => {
    setSheetsReport((prev) => ({ ...prev, loading: true }));
    try {
      const regUrl = `https://docs.google.com/spreadsheets/d/${SHEET_REGISTERED_ID}/gviz/tq?tqx=out:csv`;
      const wavePromises = COMEM_WAVE_TABS.map(async (tab) => {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_COMEM_WAVES_ID}/export?format=csv&gid=${tab.gid}`;
        const res = await fetch(url);
        const text = await res.text();
        const matrix = parseCsvMatrix(text);
        if (matrix.length < 2) {
          return {
            id: tab.id,
            label: tab.label,
            gid: tab.gid,
            totalReviewed: 0,
            brandApproved: 0,
            adfiApproved: 0,
            approvedReach: 0,
            approvalRatePct: 0,
            adfiRatePct: 0,
            products: [],
          };
        }
        const hdr = matrix[0].map((h) => h.toLowerCase().trim());
        const iProduct = hdr.findIndex((h) => h.includes('sản phẩm') || h.includes('muốn nhận'));
        const iHandle = hdr.findIndex((h) => h.includes('id name') || h.includes('tiktok'));
        const iFollowers = hdr.findIndex((h) => h.includes('follower'));
        const iBrand = hdr.findIndex((h) => h.includes('brand duyệt'));
        const iAdfi = hdr.findIndex((h) => h.includes('adfi'));

        const dataRows = matrix.slice(1).filter((r) => {
          const handleVal = iHandle >= 0 ? r[iHandle] : r[1];
          return Boolean((handleVal || '').trim() || (r[0] || '').trim());
        });

        let brandApproved = 0;
        let adfiApproved = 0;
        let approvedReach = 0;
        const prodMap = new Map<string, CoMemProductWaveRow>();

        dataRows.forEach((r) => {
          const rawProd = (iProduct >= 0 ? r[iProduct] : r[0] || '').replace(/\s+/g, ' ').trim() || 'Sản phẩm Cỏ Mềm khác';
          const prodKey = rawProd.toLowerCase();
          const brandVal = (iBrand >= 0 ? r[iBrand] : r[4] || '').toUpperCase().trim();
          const adfiVal = (iAdfi >= 0 ? r[iAdfi] : r[5] || '').toUpperCase().trim();
          const isBrandOk = brandVal === 'TRUE' || brandVal.includes('DUYỆT') || brandVal === 'OK' || brandVal === 'X';
          const isAdfiOk = adfiVal === 'TRUE' || adfiVal.includes('DUYỆT') || adfiVal === 'OK' || adfiVal === 'X';
          const rowFollowers = parseSheetFollowerCount(iFollowers >= 0 ? r[iFollowers] : r[3]);

          if (isBrandOk) {
            brandApproved += 1;
            approvedReach += rowFollowers;
          }
          if (isAdfiOk) adfiApproved += 1;

          const existing = prodMap.get(prodKey);
          if (!existing) {
            prodMap.set(prodKey, {
              productName: rawProd,
              waveId: tab.id,
              waveLabel: tab.label,
              totalSelected: 1,
              brandApproved: isBrandOk ? 1 : 0,
              adfiApproved: isAdfiOk ? 1 : 0,
              approvedReach: isBrandOk ? rowFollowers : 0,
            });
          } else {
            existing.totalSelected += 1;
            if (isBrandOk) {
              existing.brandApproved += 1;
              existing.approvedReach += rowFollowers;
            }
            if (isAdfiOk) existing.adfiApproved += 1;
          }
        });

        const totalReviewed = dataRows.length;
        return {
          id: tab.id,
          label: tab.label,
          gid: tab.gid,
          totalReviewed,
          brandApproved,
          adfiApproved,
          approvedReach,
          approvalRatePct: totalReviewed > 0 ? Math.round((brandApproved / totalReviewed) * 100) : 0,
          adfiRatePct: brandApproved > 0 ? Math.round((adfiApproved / brandApproved) * 100) : 0,
          products: Array.from(prodMap.values()),
        };
      });

      const [regRes, waves] = await Promise.all([fetch(regUrl), Promise.all(wavePromises)]);
      const regMatrix = parseCsvMatrix(await regRes.text());
      let registeredTotal = 0;
      let registeredTotalReach = 0;
      const uniqueHandles = new Set<string>();

      if (regMatrix.length >= 2) {
        const hdr = regMatrix[0].map((h) => h.toLowerCase().trim());
        const iHandle = hdr.findIndex((h) => h.includes('id name') || h.includes('tiktok'));
        const iFollowers = hdr.findIndex((h) => h.includes('follower'));
        const rows = regMatrix.slice(1).filter((r) => Boolean((r[0] || '').trim() || (r[2] || '').trim()));
        registeredTotal = rows.length;
        rows.forEach((r) => {
          const h = (iHandle >= 0 ? r[iHandle] : r[2] || '').toLowerCase().replace(/[@\s]/g, '');
          if (h) uniqueHandles.add(h);
          registeredTotalReach += parseSheetFollowerCount(iFollowers >= 0 ? r[iFollowers] : r[4]);
        });
      }

      setSheetsReport({
        loaded: true,
        loading: false,
        registeredTotal,
        registeredUniqueKocs: uniqueHandles.size,
        registeredTotalReach,
        waves,
        lastSyncedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      });

      if (notify) {
        onShowToast(
          'Đã đồng bộ live từ 2 file Google Sheet!',
          `Đã cập nhật ${registeredTotal} KOC đăng ký & 3 đợt duyệt Cỏ Mềm.`,
          'success'
        );
      }
    } catch {
      setSheetsReport((prev) => ({ ...prev, loading: false }));
      if (notify) {
        onShowToast('Lỗi đọc Google Sheet', 'Kiểm tra kết nối mạng hoặc quyền xem công khai của 2 file Sheet.', 'warning');
      }
    }
  };

  const loadFromGoogleSheet = async (rawUrl: string, showFeedback = false): Promise<boolean> => {
    const csvUrl = normalizeGoogleSheetCsvUrl(rawUrl);
    if (!csvUrl) return false;
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        if (showFeedback) {
          onShowToast(
            'Google Sheet chưa mở quyền xem!',
            'Vào Google Sheet -> Chia sẻ -> Bất kỳ ai có đường liên kết (Người xem) rồi thử lại.',
            'warning'
          );
        }
        return false;
      }
      const parsed = parseSheetCsvToChannelMetrics(text);
      if (parsed.length > 0) {
        setChannelMetrics(parsed);
        setDataSourceLabel('sheet');
        try {
          localStorage.setItem(STORAGE_KEY_SHEET_URL, rawUrl.trim());
        } catch {}
        if (showFeedback) {
          onShowToast(
            'Đã đồng bộ số liệu thật từ Google Sheet!',
            `Đã đọc thành công ${parsed.length} nền tảng từ tab BI_He_Sinh_Thai.`,
            'success'
          );
        }
        return true;
      }
      if (showFeedback) {
        onShowToast(
          'Sheet chưa có dữ liệu kênh hợp lệ',
          'Đảm bảo cột Nen_Tang có giá trị: tiktok, facebook, threads, zalo, website.',
          'warning'
        );
      }
      return false;
    } catch {
      if (showFeedback) {
        onShowToast(
          'Không đọc được Google Sheet',
          'Hãy bật "Tệp -> Chia sẻ -> Xuất bản lên web -> CSV" hoặc mở quyền xem công khai cho Sheet.',
          'warning'
        );
      }
      return false;
    }
  };

  useEffect(() => {
    loadLiveGoogleSheetsReport(false);
    (async () => {
      if (sheetUrl.trim()) {
        const ok = await loadFromGoogleSheet(sheetUrl, false);
        if (ok) return;
      }
      const data = await getKocityChannelMetricsFromSupabase();
      if (data && data.length > 0) {
        setChannelMetrics(data);
        setDataSourceLabel('supabase');
      }
    })();
  }, []);

  const ecosystemTotals = useMemo(() => {
    const totalViews = channelMetrics.reduce((sum, m) => sum + (Number(m.total_views) || 0), 0);
    const totalFollowers = channelMetrics.reduce((sum, m) => sum + (Number(m.followers_or_members) || 0), 0);
    const totalEngagements = channelMetrics.reduce((sum, m) => sum + (Number(m.engagements) || 0), 0);
    const totalNewToday = channelMetrics.reduce((sum, m) => sum + (Number(m.new_subscribers_today) || 0), 0);
    const maxViews = Math.max(...channelMetrics.map((m) => Number(m.total_views) || 0), 1);
    return { totalViews, totalFollowers, totalEngagements, totalNewToday, maxViews };
  }, [channelMetrics]);

  const handleTriggerN8nSync = async () => {
    const cleanUrl = syncWebhookUrl.trim();
    if (!cleanUrl) {
      onShowToast('Chưa có link Webhook n8n', 'Vui lòng dán URL webhook n8n đồng bộ 5 kênh.', 'warning');
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY_SYNC_WEBHOOK, cleanUrl);
    } catch {}
    setIsSyncingChannels(true);
    try {
      await fetch(cleanUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ trigger: 'admin_bi_sync', timestamp: new Date().toISOString() }),
      });
      setTimeout(async () => {
        if (sheetUrl.trim()) {
          await loadFromGoogleSheet(sheetUrl, false);
        }
        setIsSyncingChannels(false);
        onShowToast(
          'Đã kích hoạt n8n quét 5 kênh!',
          'n8n đang kéo số liệu mới nhất từ TikTok, Facebook, Threads, Zalo vào Google Sheet BI_He_Sinh_Thai.',
          'success'
        );
      }, 2000);
    } catch {
      setIsSyncingChannels(false);
      onShowToast('Không kết nối được n8n', 'Kiểm tra lại n8n đã bật chưa (start-n8n.bat) hoặc URL webhook.', 'warning');
    }
  };

  const handleDownloadSyncWorkflow = () => {
    const blob = new Blob([JSON.stringify(syncChannelsWorkflowJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kocity_sync_5_channels_to_sheets_workflow.json';
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(
      'Đã tải Workflow n8n -> Google Sheets!',
      'Import vào n8n -> điền Token ở Node 1 -> chọn file Google Sheet ở Node 4 -> bật Active.',
      'success'
    );
  };

  const [embedUrl, setEmbedUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOOKER_URL);
      if (saved && saved.trim()) return saved.trim();
    } catch {}
    return DEFAULT_LOOKER_STUDIO_URL;
  });
  const [draftEmbedUrl, setDraftEmbedUrl] = useState<string>(embedUrl);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isTallIframe, setIsTallIframe] = useState<boolean>(false);

  // Lọc bỏ các bản ghi kỹ thuật nội bộ (nếu có)
  const realCampaigns = useMemo(
    () => campaigns.filter((c) => c.id && !c.id.startsWith('__')),
    [campaigns]
  );

  // 1. TỔNG HỢP TỰ ĐỘNG TOÀN HỆ THỐNG TỪ DỮ LIỆU THẬT (ZERO HARDCODE)
  const overview = useMemo(() => {
    const totalCampaigns = realCampaigns.length;
    const totalSpots = realCampaigns.reduce((sum, c) => sum + (Number(c.totalSpots) || 0), 0);

    const totalApps = applications.length;
    const pendingApps = applications.filter((a) => a.status === 'Chờ duyệt').length;
    const approvedApps = applications.filter((a) => isApprovedStatus(a.status)).length;
    const shippedOrDelivered = applications.filter(
      (a) =>
        a.status === 'Đang giao' ||
        a.status === 'Chờ duyệt video' ||
        isCompletedStatus(a.status) ||
        a.shippingStatus === 'Đang trung chuyển' ||
        a.shippingStatus === 'Đã phát thành công'
    ).length;
    const deliveredApps = applications.filter(
      (a) => a.shippingStatus === 'Đã phát thành công' || isCompletedStatus(a.status)
    ).length;
    const pendingVideoApps = applications.filter((a) => a.status === 'Chờ duyệt video').length;
    const completedVideos = applications.filter((a) => isCompletedStatus(a.status)).length;
    const rejectedApps = applications.filter((a) => isRejectedStatus(a.status)).length;

    const uniqueKocHandles = new Set(
      applications
        .map((a) => (a.tiktokHandle || a.kocName || '').toLowerCase().replace(/[@\s]/g, ''))
        .filter(Boolean)
    );

    const totalReachApproved = applications
      .filter((a) => isApprovedStatus(a.status))
      .reduce((sum, a) => sum + parseFollowersNum(a), 0);

    const totalReachAll = applications.reduce((sum, a) => sum + parseFollowersNum(a), 0);

    const totalVideoViews = applications
      .filter((a) => isCompletedStatus(a.status) || a.videoViews)
      .reduce((sum, a) => sum + parseViewsNum(a.videoViews), 0);

    const approvalRate = totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0;
    const completionRate = approvedApps > 0 ? Math.round((completedVideos / approvedApps) * 100) : 0;
    const rejectionRate = totalApps > 0 ? Math.round((rejectedApps / totalApps) * 100) : 0;
    const fillRate = totalSpots > 0 ? Math.min(100, Math.round((approvedApps / totalSpots) * 100)) : 0;

    return {
      totalCampaigns,
      totalSpots,
      totalApps,
      pendingApps,
      approvedApps,
      shippedOrDelivered,
      deliveredApps,
      pendingVideoApps,
      completedVideos,
      rejectedApps,
      uniqueKocs: uniqueKocHandles.size,
      totalReachApproved,
      totalReachAll,
      totalVideoViews,
      approvalRate,
      completionRate,
      rejectionRate,
      fillRate,
    };
  }, [realCampaigns, applications]);

  // 2. TỔNG HỢP TỰ ĐỘNG TỪNG CHIẾN DỊCH (ALL CAMPAIGNS BREAKDOWN)
  const campaignRows = useMemo(() => {
    const rows = realCampaigns.map((camp) => {
      const campApps = applications.filter((a) => matchAppToCampaign(a, camp));
      const total = campApps.length;
      const pending = campApps.filter((a) => a.status === 'Chờ duyệt').length;
      const approved = campApps.filter((a) => isApprovedStatus(a.status)).length;
      const shipping = campApps.filter(
        (a) => a.status === 'Đang giao' || a.shippingStatus === 'Đang trung chuyển'
      ).length;
      const pendingVideo = campApps.filter((a) => a.status === 'Chờ duyệt video').length;
      const completed = campApps.filter((a) => isCompletedStatus(a.status)).length;
      const rejected = campApps.filter((a) => isRejectedStatus(a.status)).length;
      const reach = campApps
        .filter((a) => isApprovedStatus(a.status))
        .reduce((sum, a) => sum + parseFollowersNum(a), 0);

      const totalSpots = Number(camp.totalSpots) || 0;
      const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
      const completionRate = approved > 0 ? Math.round((completed / approved) * 100) : 0;
      const spotFillPct = totalSpots > 0 ? Math.min(100, Math.round((approved / totalSpots) * 100)) : 0;

      return {
        camp,
        total,
        pending,
        approved,
        shipping,
        pendingVideo,
        completed,
        rejected,
        reach,
        totalSpots,
        remainingSpots: Math.max(0, totalSpots - approved),
        approvalRate,
        completionRate,
        spotFillPct,
      };
    });

    const filtered = rows.filter((r) => {
      if (!campaignSearch.trim()) return true;
      const q = campaignSearch.toLowerCase();
      return (
        r.camp.title.toLowerCase().includes(q) ||
        r.camp.brandName.toLowerCase().includes(q) ||
        r.camp.category.toLowerCase().includes(q) ||
        r.camp.code.toLowerCase().includes(q)
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'approved') return b.approved - a.approved;
      if (sortBy === 'completed') return b.completed - a.completed;
      if (sortBy === 'reach') return b.reach - a.reach;
      return b.total - a.total;
    });
  }, [realCampaigns, applications, campaignSearch, sortBy]);

  // 3. PHÂN TẦNG CREATOR & XẾP HẠNG KOC TỰ ĐỘNG TỪ DỮ LIỆU THẬT
  const kocAnalytics = useMemo(() => {
    const map = new Map<
      string,
      {
        handle: string;
        name: string;
        avatar: string;
        followers: number;
        applied: number;
        approved: number;
        completed: number;
        rejected: number;
      }
    >();

    applications.forEach((a) => {
      const key = (a.tiktokHandle || a.kocName || a.id).toLowerCase().replace(/[@\s]/g, '');
      const f = parseFollowersNum(a);
      const prev = map.get(key);
      if (!prev) {
        map.set(key, {
          handle: a.tiktokHandle || a.kocName,
          name: a.kocName || a.tiktokHandle,
          avatar: a.avatar,
          followers: f,
          applied: 1,
          approved: isApprovedStatus(a.status) ? 1 : 0,
          completed: isCompletedStatus(a.status) ? 1 : 0,
          rejected: isRejectedStatus(a.status) ? 1 : 0,
        });
      } else {
        prev.followers = Math.max(prev.followers, f);
        prev.applied += 1;
        if (isApprovedStatus(a.status)) prev.approved += 1;
        if (isCompletedStatus(a.status)) prev.completed += 1;
        if (isRejectedStatus(a.status)) prev.rejected += 1;
      }
    });

    const list = Array.from(map.values());

    const tiers = [
      { id: 'seed', label: 'Seed KOC (< 5k)', min: 0, max: 5000, color: 'from-slate-500 to-slate-700', count: 0, approved: 0, completed: 0 },
      { id: 'nano', label: 'Nano KOC (5k - 20k)', min: 5000, max: 20000, color: 'from-violet-500 to-indigo-600', count: 0, approved: 0, completed: 0 },
      { id: 'micro', label: 'Micro KOC (20k - 100k)', min: 20000, max: 100000, color: 'from-blue-500 to-cyan-600', count: 0, approved: 0, completed: 0 },
      { id: 'macro', label: 'Macro KOC (> 100k)', min: 100000, max: Infinity, color: 'from-pink-500 to-rose-600', count: 0, approved: 0, completed: 0 },
    ];

    list.forEach((k) => {
      const tier = tiers.find((t) => k.followers >= t.min && k.followers < t.max) || tiers[0];
      tier.count += 1;
      tier.approved += k.approved;
      tier.completed += k.completed;
    });

    const topKocs = [...list]
      .sort((a, b) => b.completed - a.completed || b.approved - a.approved || b.followers - a.followers)
      .slice(0, 15);

    return { tiers, topKocs, totalUnique: list.length };
  }, [applications]);

  const formatCompact = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
    return num.toLocaleString('vi-VN');
  };

  const handleSaveEmbedUrl = (rawUrl?: string) => {
    const normalized = normalizeEmbedUrl(rawUrl !== undefined ? rawUrl : draftEmbedUrl);
    if (!normalized) {
      onShowToast('Link trống', 'Vui lòng dán đường dẫn Looker Studio Embed URL hợp lệ.', 'warning');
      return;
    }
    setEmbedUrl(normalized);
    setDraftEmbedUrl(normalized);
    setIframeKey((k) => k + 1);
    try {
      localStorage.setItem(STORAGE_KEY_LOOKER_URL, normalized);
    } catch {}
    onShowToast(
      'Đã lưu link Looker Studio vĩnh viễn!',
      'Báo cáo Looker Studio sẽ tự động hiển thị mỗi lần bạn mở trang Admin.',
      'success'
    );
  };

  // Xuất CSV tổng hợp toàn chiến dịch (1-click cho Looker Studio / Excel)
  const handleExportCampaignSummaryCSV = () => {
    const headers = [
      'Mã Chiến Dịch',
      'Nhãn Hàng',
      'Tên Chiến Dịch',
      'Ngành Hàng',
      'Tổng Suất Mẫu',
      'Tổng Đơn Nộp',
      'Chờ Duyệt',
      'Đã Duyệt Gửi Mẫu',
      'Đang Giao',
      'Chờ Duyệt Video',
      'Đã Hoàn Thành Video',
      'Bị Từ Chối',
      'Tỷ Lệ Duyệt (%)',
      'Tỷ Lệ Trả Bài (%)',
      'Tổng Reach KOC Duyệt',
    ];
    const csvRows = [
      headers.join(','),
      ...campaignRows.map((r) =>
        [
          `"${r.camp.code}"`,
          `"${(r.camp.brandName || '').replace(/"/g, '""')}"`,
          `"${(r.camp.title || '').replace(/"/g, '""')}"`,
          `"${(r.camp.category || '').replace(/"/g, '""')}"`,
          r.totalSpots,
          r.total,
          r.pending,
          r.approved,
          r.shipping,
          r.pendingVideo,
          r.completed,
          r.rejected,
          r.approvalRate,
          r.completionRate,
          r.reach,
        ].join(',')
      ),
    ];
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KOCity_BI_TongHop_ChienDich_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Đã xuất báo cáo tổng hợp!', `Đã tải file CSV của ${campaignRows.length} chiến dịch.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 p-5 sm:p-6 text-white shadow-lg flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              100% Tự Động Từ Supabase Realtime
            </span>
            <span className="text-xs font-semibold text-violet-200">
              {overview.totalCampaigns} chiến dịch · {overview.totalApps} hồ sơ thật
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Báo Cáo BI Tổng Hợp Toàn Chiến Dịch & Looker Studio
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
            Toàn bộ số liệu được hệ thống tự động tính toán trực tiếp từ dữ liệu chiến dịch & hồ sơ KOC — không cần nhập tay thủ công.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-wrap rounded-xl bg-white/10 p-1 border border-white/15 gap-1">
            <button
              type="button"
              onClick={() => setViewMode('campaigns-bi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'campaigns-bi' ? 'bg-white text-indigo-900 shadow-md' : 'text-white hover:bg-white/10'
              }`}
            >
              📊 Toàn Chiến Dịch (Auto)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('ecosystem')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'ecosystem' ? 'bg-white text-indigo-900 shadow-md' : 'text-white hover:bg-white/10'
              }`}
            >
              🌐 Lượt Xem TikTok / FB / Threads
            </button>
            <button
              type="button"
              onClick={() => setViewMode('looker')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'looker' ? 'bg-white text-indigo-900 shadow-md' : 'text-white hover:bg-white/10'
              }`}
            >
              📈 Looker Studio Live
            </button>
            <button
              type="button"
              onClick={() => setViewMode('koc-tiers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'koc-tiers' ? 'bg-white text-indigo-900 shadow-md' : 'text-white hover:bg-white/10'
              }`}
            >
              🏆 Xếp Hạng & Tầng KOC
            </button>
            <button
              type="button"
              onClick={() => setViewMode('sql-setup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'sql-setup' ? 'bg-white text-indigo-900 shadow-md' : 'text-white hover:bg-white/10'
              }`}
            >
              ⚙️ SQL Views Looker
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* VIEW 1: TỔNG HỢP TOÀN CHIẾN DỊCH & PHỄU CHUYỂN ĐỔI (100% AUTO BI)   */}
      {/* =================================================================== */}
      {viewMode === 'campaigns-bi' && (
        <div className="space-y-6">
          {/* BÁO CÁO LIVE TỪ 2 FILE GOOGLE SHEET (KOC ĐĂNG KÝ + 3 ĐỢT CỎ MỀM) & ZALO GROUP 329 TV */}
          {(() => {
            const totalWaveReviewed = sheetsReport.waves.reduce((s, w) => s + w.totalReviewed, 0);
            const totalWaveBrandApproved = sheetsReport.waves.reduce((s, w) => s + w.brandApproved, 0);
            const totalWaveAdfiApproved = sheetsReport.waves.reduce((s, w) => s + w.adfiApproved, 0);
            const totalWaveReach = sheetsReport.waves.reduce((s, w) => s + w.approvedReach, 0);
            const totalApprovalPct =
              totalWaveReviewed > 0 ? Math.round((totalWaveBrandApproved / totalWaveReviewed) * 100) : 0;

            return (
              <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/60 via-white to-violet-50/50 p-5 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Google Sheets Sync
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Tổng Hợp Thực Tế: Zalo Group (329 TV) & 2 File Google Sheet Cỏ Mềm
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Đọc trực tiếp theo thời gian thực từ file <b>KOC đã đăng ký</b> và file <b>3 đợt duyệt Cỏ Mềm</b> (Đợt 1, Đợt 2, Campaign mới)
                      {sheetsReport.lastSyncedAt ? ` · Cập nhật lúc ${sheetsReport.lastSyncedAt}` : ''}.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${SHEET_REGISTERED_ID}/edit?usp=sharing`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700"
                    >
                      📄 Sheet Đăng Ký ↗
                    </a>
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${SHEET_COMEM_WAVES_ID}/edit?usp=sharing`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700"
                    >
                      📊 Sheet 3 Đợt Cỏ Mềm ↗
                    </a>
                    <button
                      type="button"
                      onClick={() => loadLiveGoogleSheetsReport(true)}
                      disabled={sheetsReport.loading}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                    >
                      {sheetsReport.loading ? 'Đang tải...' : '🔄 Đồng Bộ Live'}
                    </button>
                  </div>
                </div>

                {/* 5 Thẻ tổng hợp nhanh từ Zalo + 2 Sheet */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3.5">
                    <p className="text-[10px] font-bold text-sky-800 uppercase">Group Zalo KOCity</p>
                    <p className="mt-1 text-2xl font-black text-sky-700">{ZALO_GROUP_MEMBERS_COUNT}</p>
                    <span className="text-[11px] text-sky-700 font-semibold">Thành viên cộng đồng</span>
                  </div>
                  <div className="rounded-xl border border-violet-200 bg-white p-3.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">KOC Đã Đăng Ký (File 1)</p>
                    <p className="mt-1 text-2xl font-black text-violet-700">
                      {sheetsReport.loading ? '...' : sheetsReport.registeredTotal.toLocaleString('vi-VN')}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      {sheetsReport.registeredUniqueKocs} kênh TikTok độc nhất
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Xét Duyệt 3 Đợt Cỏ Mềm</p>
                    <p className="mt-1 text-2xl font-black text-slate-900">
                      {sheetsReport.loading ? '...' : totalWaveReviewed.toLocaleString('vi-VN')}
                    </p>
                    <span className="text-[11px] text-slate-500">Đợt 1 + Đợt 2 + Mới</span>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase">Brand Đã Duyệt (TRUE)</p>
                    <p className="mt-1 text-2xl font-black text-emerald-700">
                      {sheetsReport.loading ? '...' : totalWaveBrandApproved.toLocaleString('vi-VN')}
                    </p>
                    <span className="text-[11px] text-emerald-700 font-bold">
                      Tỷ lệ duyệt {totalApprovalPct}% · ADFI: {totalWaveAdfiApproved}
                    </span>
                  </div>
                  <div className="rounded-xl border border-indigo-200 bg-white p-3.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Reach KOC Được Duyệt</p>
                    <p className="mt-1 text-2xl font-black text-indigo-700">
                      {sheetsReport.loading ? '...' : formatCompact(totalWaveReach)}
                    </p>
                    <span className="text-[11px] text-slate-500">Tổng Followers 3 đợt</span>
                  </div>
                </div>

                {/* Bảng chi tiết từng đợt Cỏ Mềm */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                        <th className="py-2.5 px-4">Đợt Chiến Dịch Cỏ Mềm</th>
                        <th className="py-2.5 px-3 text-center">Tổng Hồ Sơ Xét Duyệt</th>
                        <th className="py-2.5 px-3 text-center">Brand Duyệt KOC (TRUE)</th>
                        <th className="py-2.5 px-3 text-center">ADFI Duyệt Sample (TRUE)</th>
                        <th className="py-2.5 px-3 text-center">Tỷ Lệ Brand Duyệt</th>
                        <th className="py-2.5 px-3 text-right">Tổng Reach Followers Duyệt</th>
                        <th className="py-2.5 px-4 text-right">Link Sheet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sheetsReport.waves.map((w) => (
                        <tr key={w.id} className="hover:bg-emerald-50/30">
                          <td className="py-2.5 px-4 font-bold text-slate-900">{w.label}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                            {w.totalReviewed.toLocaleString('vi-VN')}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 font-black text-emerald-800">
                              {w.brandApproved} KOC
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="rounded-md bg-blue-50 px-2.5 py-0.5 font-bold text-blue-700">
                              {w.adfiApproved} mẫu
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-violet-700">{w.approvalRatePct}%</td>
                          <td className="py-2.5 px-3 text-right font-black text-indigo-700">
                            {formatCompact(w.approvedReach)}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <a
                              href={`https://docs.google.com/spreadsheets/d/${SHEET_COMEM_WAVES_ID}/edit#gid=${w.gid}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline font-bold"
                            >
                              Mở tab ↗
                            </a>
                          </td>
                        </tr>
                      ))}
                      {sheetsReport.waves.length > 0 && (
                        <tr className="bg-slate-50/90 font-black text-slate-900">
                          <td className="py-2.5 px-4">TỔNG CỘNG 3 ĐỢT CỎ MỀM</td>
                          <td className="py-2.5 px-3 text-center">{totalWaveReviewed.toLocaleString('vi-VN')}</td>
                          <td className="py-2.5 px-3 text-center text-emerald-700">{totalWaveBrandApproved} KOC</td>
                          <td className="py-2.5 px-3 text-center text-blue-700">{totalWaveAdfiApproved} mẫu</td>
                          <td className="py-2.5 px-3 text-center text-violet-700">{totalApprovalPct}%</td>
                          <td className="py-2.5 px-3 text-right text-indigo-700">{formatCompact(totalWaveReach)}</td>
                          <td className="py-2.5 px-4 text-right text-[11px] text-slate-400">100% Live</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* PHỄU CHUYỂN ĐỔI CHIẾN DỊCH CỎ MỀM (4 BƯỚC THỰC TẾ TỪ GOOGLE SHEETS) */}
          {(() => {
            const totalWaveReviewed = sheetsReport.waves.reduce((s, w) => s + w.totalReviewed, 0);
            const totalWaveBrandApproved = sheetsReport.waves.reduce((s, w) => s + w.brandApproved, 0);
            const totalWaveAdfiApproved = sheetsReport.waves.reduce((s, w) => s + w.adfiApproved, 0);
            const baseCount = Math.max(sheetsReport.registeredTotal, totalWaveReviewed, 1);
            const brandNotApproved = Math.max(0, totalWaveReviewed - totalWaveBrandApproved);
            const notApprovedPct = totalWaveReviewed > 0 ? Math.round((brandNotApproved / totalWaveReviewed) * 100) : 0;
            const brandPctOfReviewed =
              totalWaveReviewed > 0 ? Math.round((totalWaveBrandApproved / totalWaveReviewed) * 100) : 0;

            return (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Phễu Chuyển Đổi Chiến Dịch Cỏ Mềm (Thực Tế 3 Đợt)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tự động tổng hợp live từ file KOC đăng ký & file kết quả duyệt Cỏ Mềm (Đợt 1, Đợt 2, Campaign mới)
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700">
                      Tỷ lệ Brand duyệt: {brandPctOfReviewed}%
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-bold text-slate-600">
                      Chưa duyệt: {brandNotApproved} ({notApprovedPct}%)
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-4 pt-1">
                  {[
                    {
                      step: 'Bước 1',
                      label: 'KOC Đăng Ký (File 1)',
                      value: sheetsReport.registeredTotal,
                      pct: sheetsReport.registeredTotal > 0 ? 100 : 0,
                      sub: `${sheetsReport.registeredUniqueKocs} kênh TikTok độc nhất`,
                      color: 'from-violet-600 to-indigo-600',
                    },
                    {
                      step: 'Bước 2',
                      label: 'Đưa Vào Xét Duyệt (3 Đợt)',
                      value: totalWaveReviewed,
                      pct: Math.min(100, Math.round((totalWaveReviewed / baseCount) * 100)),
                      sub: 'Đợt 1 + Đợt 2 + Campaign mới',
                      color: 'from-blue-600 to-indigo-500',
                    },
                    {
                      step: 'Bước 3',
                      label: 'Brand Đã Duyệt KOC (TRUE)',
                      value: totalWaveBrandApproved,
                      pct: brandPctOfReviewed,
                      sub: `${brandPctOfReviewed}% trên tổng hồ sơ xét duyệt`,
                      color: 'from-emerald-500 to-teal-600',
                    },
                    {
                      step: 'Bước 4',
                      label: 'ADFI Duyệt Gửi Sample (TRUE)',
                      value: totalWaveAdfiApproved,
                      pct:
                        totalWaveBrandApproved > 0
                          ? Math.min(100, Math.round((totalWaveAdfiApproved / totalWaveBrandApproved) * 100))
                          : 0,
                      sub: 'Xác nhận xuất kho gửi mẫu 0đ',
                      color: 'from-green-500 to-emerald-600',
                    },
                  ].map((item) => (
                    <div key={item.step} className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>{item.step}</span>
                        <span className="text-slate-900">{item.pct}%</span>
                      </div>
                      <p className="text-2xl font-black text-slate-900">
                        {sheetsReport.loading ? '...' : item.value.toLocaleString('vi-VN')}
                      </p>
                      <p className="text-xs font-semibold text-slate-800">{item.label}</p>
                      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* BẢNG TỔNG HỢP HIỆU SUẤT TỪNG SẢN PHẨM CỦA CỎ MỀM (DỰA TRÊN FILE KẾT QUẢ KOC ĐÃ DUYỆT) */}
          {(() => {
            const selectedWaves =
              waveFilter === 'all' ? sheetsReport.waves : sheetsReport.waves.filter((w) => w.id === waveFilter);

            const mergedMap = new Map<
              string,
              {
                productName: string;
                waveLabels: Set<string>;
                totalSelected: number;
                brandApproved: number;
                adfiApproved: number;
                approvedReach: number;
              }
            >();

            selectedWaves.forEach((w) => {
              w.products.forEach((p) => {
                const key = p.productName.toLowerCase();
                const cur = mergedMap.get(key);
                if (!cur) {
                  mergedMap.set(key, {
                    productName: p.productName,
                    waveLabels: new Set([p.waveLabel]),
                    totalSelected: p.totalSelected,
                    brandApproved: p.brandApproved,
                    adfiApproved: p.adfiApproved,
                    approvedReach: p.approvedReach,
                  });
                } else {
                  cur.waveLabels.add(p.waveLabel);
                  cur.totalSelected += p.totalSelected;
                  cur.brandApproved += p.brandApproved;
                  cur.adfiApproved += p.adfiApproved;
                  cur.approvedReach += p.approvedReach;
                }
              });
            });

            const productRows = Array.from(mergedMap.values())
              .map((p) => ({
                ...p,
                wavesArr: Array.from(p.waveLabels),
                notApproved: Math.max(0, p.totalSelected - p.brandApproved),
                approvalRate: p.totalSelected > 0 ? Math.round((p.brandApproved / p.totalSelected) * 100) : 0,
              }))
              .filter((p) => {
                if (!campaignSearch.trim()) return true;
                return p.productName.toLowerCase().includes(campaignSearch.toLowerCase());
              })
              .sort((a, b) => {
                if (sortBy === 'apps') return b.totalSelected - a.totalSelected;
                if (sortBy === 'completed') return b.adfiApproved - a.adfiApproved;
                if (sortBy === 'reach') return b.approvedReach - a.approvedReach;
                return b.brandApproved - a.brandApproved || b.totalSelected - a.totalSelected;
              });

            const maxApproved = Math.max(...productRows.map((p) => p.brandApproved), 1);

            const handleExportProductsCSV = () => {
              const headers = [
                'Sản Phẩm Cỏ Mềm',
                'Đợt Chiến Dịch',
                'Tổng KOC Chọn',
                'Brand Đã Duyệt (TRUE)',
                'ADFI Duyệt Sample (TRUE)',
                'Chưa Duyệt',
                'Tỷ Lệ Brand Duyệt (%)',
                'Tổng Reach Followers Duyệt',
              ];
              const csvRows = [
                headers.join(','),
                ...productRows.map((p) =>
                  [
                    `"${p.productName.replace(/"/g, '""')}"`,
                    `"${p.wavesArr.join(' | ')}"`,
                    p.totalSelected,
                    p.brandApproved,
                    p.adfiApproved,
                    p.notApproved,
                    p.approvalRate,
                    p.approvedReach,
                  ].join(',')
                ),
              ];
              const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `KOCity_CoMem_HieuSuat_SanPham_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              onShowToast(
                'Đã xuất CSV sản phẩm Cỏ Mềm!',
                `Đã tải bảng hiệu suất của ${productRows.length} sản phẩm Cỏ Mềm.`,
                'success'
              );
            };

            return (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Bảng Tổng Hợp Hiệu Suất Từng Sản Phẩm Cỏ Mềm ({productRows.length} sản phẩm)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tự động gom nhóm theo từng sản phẩm từ file kết quả KOC đã được duyệt (3 đợt Cỏ Mềm)
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={waveFilter}
                      onChange={(e) => setWaveFilter(e.target.value as any)}
                      className="rounded-xl border border-emerald-300 bg-emerald-50/70 px-2.5 py-1.5 text-xs font-bold text-emerald-800 cursor-pointer"
                    >
                      <option value="all">Tất cả 3 đợt Cỏ Mềm</option>
                      <option value="dot-1">Cỏ Mềm đợt 1</option>
                      <option value="dot-2">Cỏ Mềm đợt 2</option>
                      <option value="campaign-moi">Cỏ Mềm Campaign mới</option>
                    </select>
                    <input
                      type="text"
                      value={campaignSearch}
                      onChange={(e) => setCampaignSearch(e.target.value)}
                      placeholder="Tìm tên sản phẩm Cỏ Mềm..."
                      className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-violet-500 focus:outline-none w-48"
                    />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="approved">Sắp xếp: Brand duyệt nhiều nhất</option>
                      <option value="apps">Sắp xếp: KOC chọn nhiều nhất</option>
                      <option value="completed">Sắp xếp: ADFI duyệt mẫu</option>
                      <option value="reach">Sắp xếp: Reach KOC cao nhất</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleExportProductsCSV}
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>📥 Xuất CSV Sản Phẩm</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase bg-slate-50/70">
                        <th className="py-2.5 px-3 rounded-l-lg">Sản Phẩm Cỏ Mềm</th>
                        <th className="py-2.5 px-2 text-center">Tổng KOC Chọn</th>
                        <th className="py-2.5 px-2 text-center">Brand Đã Duyệt (TRUE)</th>
                        <th className="py-2.5 px-2 text-center">ADFI Duyệt Sample</th>
                        <th className="py-2.5 px-2 text-center">Chưa Duyệt</th>
                        <th className="py-2.5 px-2 text-center">Tỷ Lệ Duyệt</th>
                        <th className="py-2.5 px-3 text-right rounded-r-lg">Reach KOC Duyệt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productRows.map((p, idx) => {
                        const barWidth = Math.round((p.brandApproved / maxApproved) * 100);
                        return (
                          <tr key={p.productName + idx} className="hover:bg-emerald-50/30 transition-colors">
                            <td className="py-3 px-3 max-w-[340px]">
                              <p className="font-bold text-slate-900 leading-snug" title={p.productName}>
                                {p.productName}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {p.wavesArr.map((wl) => (
                                  <span
                                    key={wl}
                                    className="rounded bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700"
                                  >
                                    {wl}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center font-black text-slate-900">{p.totalSelected}</td>
                            <td className="py-3 px-2 min-w-[140px]">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-black text-emerald-800">
                                  {p.brandApproved} KOC
                                </span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className="rounded-md bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
                                {p.adfiApproved}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
                                {p.notApproved}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center font-bold text-violet-700">{p.approvalRate}%</td>
                            <td className="py-3 px-3 text-right font-black text-indigo-700">
                              {formatCompact(p.approvedReach)}
                            </td>
                          </tr>
                        );
                      })}
                      {productRows.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            {sheetsReport.loading
                              ? 'Đang tải danh sách sản phẩm Cỏ Mềm từ Google Sheet...'
                              : `Không tìm thấy sản phẩm nào khớp với từ khóa "${campaignSearch}".`}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 1B: HỆ SINH THÁI 5 KÊNH (LƯỢT XEM TIKTOK / FB / THREADS / ZALO) */}
      {/* =================================================================== */}
      {viewMode === 'ecosystem' && (
        <div className="space-y-6">
          {/* Thanh kết nối trực tiếp Google Sheet + n8n Auto-Sync (Không cần Supabase cũ!) */}
          <div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-4 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900">
                    ⚡ Kết Nối Trực Tiếp Google Sheet (n8n ➔ Sheet ➔ Website BI)
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      dataSourceLabel === 'sheet'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {dataSourceLabel === 'sheet'
                      ? '🟢 Đang đọc số thật từ Google Sheet'
                      : '🟡 Chưa nối Sheet (đang hiện dữ liệu mẫu)'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Dán link tab <code>BI_He_Sinh_Thai</code> trong Google Sheet của bạn (mở quyền <i>Bất kỳ ai có đường liên kết đều có thể xem</i>) — Website BI sẽ tự đọc số thật do n8n đổ về hàng ngày.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSyncWorkflow}
                  className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  📥 Tải Workflow n8n ➔ Sheets (.json)
                </button>
              </div>
            </div>

            {/* Ô 1: Kết nối Google Sheet đọc trực tiếp */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadFromGoogleSheet(sheetUrl, true);
                }}
                placeholder="Dán link Google Sheet tab BI_He_Sinh_Thai (https://docs.google.com/spreadsheets/d/.../edit#gid=...)"
                className="flex-1 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => loadFromGoogleSheet(sheetUrl, true)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm cursor-pointer shrink-0"
              >
                🔗 Kết Nối & Đọc Số Thật
              </button>
            </div>

            {/* Ô 2: Kích hoạt n8n quét tức thì */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-violet-100">
              <input
                type="text"
                value={syncWebhookUrl}
                onChange={(e) => setSyncWebhookUrl(e.target.value)}
                placeholder="URL Webhook n8n quét 5 kênh (VD: http://localhost:5678/webhook/kocity-sync-channels)"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800"
              />
              <button
                type="button"
                onClick={handleTriggerN8nSync}
                disabled={isSyncingChannels}
                className="rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-bold text-white shadow-sm cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
              >
                <span>{isSyncingChannels ? 'Đang quét...' : '⚡ Bấm Quét Ngay Qua n8n'}</span>
              </button>
            </div>
          </div>

          {/* 4 KPI Tổng Hệ Sinh Thái */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Tổng Lượt Xem Toàn Hệ Sinh Thái</p>
              <p className="mt-1 text-2xl font-black text-pink-600">{ecosystemTotals.totalViews.toLocaleString('vi-VN')}</p>
              <span className="text-[11px] text-slate-500">Threads + Web + FB + TikTok</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Tổng Người Tiếp Cận & Cộng Đồng</p>
              <p className="mt-1 text-2xl font-black text-violet-700">{ecosystemTotals.totalFollowers.toLocaleString('vi-VN')}</p>
              <span className="text-[11px] text-emerald-600 font-bold">+{ecosystemTotals.totalNewToday} tăng mới</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Tổng Tương Tác & Sự Kiện</p>
              <p className="mt-1 text-2xl font-black text-indigo-700">{ecosystemTotals.totalEngagements.toLocaleString('vi-VN')}</p>
              <span className="text-[11px] text-slate-500">GA4 Events + Social Interactions</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Hồ Sơ KOC Thật Trên Web</p>
              <p className="mt-1 text-2xl font-black text-emerald-600">{overview.totalApps.toLocaleString('vi-VN')}</p>
              <span className="text-[11px] text-slate-500">{overview.uniqueKocs} KOC độc nhất</span>
            </div>
          </div>

          {/* 3 PANEL CHI TIẾT PHONG CÁCH INSIGHTS (THREADS • WEBSITE GA4 • FACEBOOK META SUITE) */}
          {(() => {
            const threadsRow = channelMetrics.find((m) => m.channel === 'threads');
            const webRow = channelMetrics.find((m) => m.channel === 'website');
            const fbRow = channelMetrics.find((m) => m.channel === 'facebook');

            const thViews = threadsRow?.total_views || 17445;
            const thFollowers = threadsRow?.followers_or_members || 13;
            const thEngage = threadsRow?.engagements || 218;

            const webViews = webRow?.total_views || 5300;
            const webEvents = webRow?.engagements || 11000;
            const webUsers = webRow?.followers_or_members || 770;

            const fbViews = fbRow?.total_views || 789;
            const fbFollowers = fbRow?.followers_or_members || 41;
            const fbEngage = fbRow?.engagements || 38;

            return (
              <div className="grid gap-5 lg:grid-cols-3">
                {/* PANEL 1: THREADS INSIGHTS */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-base shadow-xs">
                          @
                        </span>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">Threads Insights</h4>
                          <p className="text-[11px] text-slate-500">@kocity_booking · 90 ngày qua</p>
                        </div>
                      </div>
                      <a
                        href="https://www.threads.net/@kocity_booking"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700"
                      >
                        Mở ↗
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                        <p className="text-[11px] text-slate-500 font-medium">Lượt xem</p>
                        <p className="text-xl font-black text-slate-900 mt-0.5">{thViews.toLocaleString('vi-VN')}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                        <p className="text-[11px] text-slate-500 font-medium">Người xem</p>
                        <p className="text-xl font-black text-slate-900 mt-0.5">8.442</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                        <p className="text-[11px] text-slate-500 font-medium">Theo dõi thực</p>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl font-black text-slate-900">+{thFollowers}</span>
                          <span className="text-[11px] font-bold text-emerald-600">+260%</span>
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                        <p className="text-[11px] text-slate-500 font-medium">Lượt tương tác</p>
                        <p className="text-xl font-black text-slate-900 mt-0.5">{thEngage.toLocaleString('vi-VN')}</p>
                      </div>
                    </div>

                    {/* Biểu đồ sóng Threads */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                      <svg viewBox="0 0 260 68" className="w-full h-16 overflow-visible">
                        <defs>
                          <linearGradient id="threadsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.22" />
                            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.01" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,60 L28,58 L46,12 L62,15 L72,58 L108,58 L120,34 L128,58 L162,58 L170,40 L180,56 L218,56 L226,48 L236,56 L260,55 L260,65 L0,65 Z"
                          fill="url(#threadsGrad)"
                        />
                        <path
                          d="M0,60 L28,58 L46,12 L62,15 L72,58 L108,58 L120,34 L128,58 L162,58 L170,40 L180,56 L218,56 L226,48 L236,56 L260,55"
                          fill="none"
                          stroke="#0f172a"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>29 thg 9</span>
                        <span>Đỉnh 3.5K views/ngày</span>
                        <span>21 thg 11</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">Link bio: kocity.io.vn</p>
                      <p className="text-[11px] text-slate-500">Đăng kí nhận mẫu tại đây</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-slate-900">5</p>
                      <p className="text-[10px] text-slate-500">Lượt click</p>
                    </div>
                  </div>
                </div>

                {/* PANEL 2: WEBSITE GOOGLE ANALYTICS 4 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xs">
                          <span className="material-symbols-outlined text-[20px]">monitoring</span>
                        </span>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">Website Analytics (GA4)</h4>
                          <p className="text-[11px] text-slate-500">kocity.io.vn · 90 ngày qua</p>
                        </div>
                      </div>
                      <a
                        href="https://kocity.io.vn"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-violet-50 hover:bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-700"
                      >
                        Mở Web ↗
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl bg-violet-50/60 border border-violet-100 p-3">
                        <p className="text-[11px] text-slate-600 font-medium">Số lượt xem</p>
                        <p className="text-xl font-black text-violet-700 mt-0.5">{formatCompact(webViews)}</p>
                      </div>
                      <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-3">
                        <p className="text-[11px] text-slate-600 font-medium">Số lượng sự kiện</p>
                        <p className="text-xl font-black text-indigo-700 mt-0.5">{formatCompact(webEvents)}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                        <p className="text-[11px] text-slate-500 font-medium">Người dùng hoạt động</p>
                        <p className="text-xl font-black text-slate-900 mt-0.5">{webUsers.toLocaleString('vi-VN')}</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-3">
                        <p className="text-[11px] text-emerald-800 font-medium">Quốc gia #1</p>
                        <p className="text-base font-black text-emerald-700 mt-1">Vietnam (739)</p>
                      </div>
                    </div>

                    {/* Biểu đồ đường GA4 */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                      <svg viewBox="0 0 260 68" className="w-full h-16 overflow-visible">
                        <defs>
                          <linearGradient id="ga4Grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,62 L75,62 L110,56 L138,48 L165,24 L190,14 L212,38 L235,8 L260,26 L260,65 L0,65 Z"
                          fill="url(#ga4Grad)"
                        />
                        <path
                          d="M0,62 L75,62 L110,56 L138,48 L165,24 L190,14 L212,38 L235,8 L260,26"
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>Thg 9</span>
                        <span>Tăng trưởng mạnh Thg 11</span>
                        <span>Hiện tại</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 space-y-1.5 text-[11px]">
                    <p className="font-bold text-slate-800">Nguồn phiên truy cập hàng đầu:</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 font-semibold text-slate-700">
                        Organic Social: <b>232</b>
                      </span>
                      <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 font-semibold text-sky-700">
                        Zalo: <b>130</b>
                      </span>
                      <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 font-semibold text-blue-700">
                        Facebook: <b>68</b>
                      </span>
                      <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 font-semibold text-slate-600">
                        Direct: <b>62</b>
                      </span>
                    </div>
                  </div>
                </div>

                {/* PANEL 3: FACEBOOK META BUSINESS SUITE */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg shadow-xs">
                          f
                        </span>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">Facebook Meta Suite</h4>
                          <p className="text-[11px] text-slate-500">KOCity Việt Nam · 28 ngày qua</p>
                        </div>
                      </div>
                      <a
                        href="https://www.facebook.com/profile.php?id=61595490457487"
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-blue-50 hover:bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700"
                      >
                        Mở Page ↗
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3">
                        <p className="text-[11px] text-slate-600 font-medium">Lượt xem</p>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl font-black text-slate-900">{fbViews.toLocaleString('vi-VN')}</span>
                          <span className="text-[10px] font-bold text-emerald-600">↑1,1K%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">102 người xem (↑436,8%)</p>
                      </div>
                      <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3">
                        <p className="text-[11px] text-slate-600 font-medium">Lượt theo dõi</p>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl font-black text-slate-900">{fbFollowers}</span>
                          <span className="text-[10px] font-bold text-emerald-600">↑1,2K%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Thực tăng +35 (28 ngày)</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                        <p className="text-[11px] text-slate-500 font-medium">Lượt truy cập Trang</p>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl font-black text-slate-900">194</span>
                          <span className="text-[10px] font-bold text-emerald-600">↑708,3%</span>
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                        <p className="text-[11px] text-slate-500 font-medium">Lượt tương tác</p>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl font-black text-slate-900">{fbEngage}</span>
                          <span className="text-[10px] font-bold text-emerald-600">↑100%</span>
                        </div>
                      </div>
                    </div>

                    {/* Phân bổ tệp xem Facebook */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-2">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-blue-700">Chưa theo dõi: 76,0%</span>
                        <span className="text-slate-600">Người theo dõi: 24,0%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex">
                        <div className="h-full bg-blue-600" style={{ width: '76%' }} />
                        <div className="h-full bg-sky-400" style={{ width: '24%' }} />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        76% lượt xem đến từ tệp KOC mới tự nhiên chưa theo dõi Trang.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Tương tác từ người mới:</span>
                    <span className="font-bold text-blue-700">20 mới · 18 follower</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Biểu đồ so sánh Lượt Xem (Views) giữa 5 nền tảng */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">So Sánh Lượt Xem (Views) Giữa Các Nền Tảng</h3>
                <p className="text-xs text-slate-500">Tỷ trọng lượt xem giữa TikTok, Threads, Facebook, Website và Zalo</p>
              </div>
              <span className="rounded-lg bg-pink-50 px-2.5 py-1 text-xs font-bold text-pink-700">
                Tổng: {ecosystemTotals.totalViews.toLocaleString('vi-VN')} views
              </span>
            </div>

            <div className="space-y-3">
              {[...channelMetrics]
                .sort((a, b) => (b.total_views || 0) - (a.total_views || 0))
                .map((item) => {
                  const cfg = CHANNEL_CONFIG[item.channel] || CHANNEL_CONFIG.website;
                  const pct = Math.round(((item.total_views || 0) / ecosystemTotals.maxViews) * 100);
                  const shareOfTotal =
                    ecosystemTotals.totalViews > 0
                      ? Math.round(((item.total_views || 0) / ecosystemTotals.totalViews) * 100)
                      : 0;

                  return (
                    <div key={item.channel} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${cfg.badge}`}>
                            <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
                            {cfg.label}
                          </span>
                          <a
                            href={item.channel_url || cfg.defaultUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-blue-600 font-normal hidden sm:inline"
                          >
                            {item.channel_name} ↗
                          </a>
                        </span>
                        <span className="font-black text-slate-900">
                          {(item.total_views || 0).toLocaleString('vi-VN')} views{' '}
                          <span className="text-slate-400 font-semibold">({shareOfTotal}%)</span>
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${cfg.color} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 px-0.5">
                        <span>
                          Followers/Thành viên: <b>{(item.followers_or_members || 0).toLocaleString('vi-VN')}</b> (+{item.new_subscribers_today || 0} hôm nay)
                        </span>
                        <span>Tương tác: <b>{(item.engagements || 0).toLocaleString('vi-VN')}</b></span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 2: LOOKER STUDIO LIVE EMBED (SONG SONG VỚI 6 KPI THẬT Ở TRÊN) */}
      {/* =================================================================== */}
      {viewMode === 'looker' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Looker Studio Live Embed
                </span>
                <h3 className="text-base font-bold text-slate-900">Báo Cáo Google Looker Studio</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dán link Looker Studio (hoặc nguyên mã <code>&lt;iframe&gt;</code>) rồi bấm <b>Lưu Link Vĩnh Viễn</b>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIframeKey((k) => k + 1)}
                className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                🔄 Làm mới
              </button>
              <button
                type="button"
                onClick={() => setIsTallIframe((t) => !t)}
                className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                {isTallIframe ? '↙ Thu gọn' : '⛶ Mở rộng'}
              </button>
              <a
                href={embedUrl.replace('/embed/reporting/', '/reporting/')}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-all flex items-center gap-1 shadow-sm"
              >
                <span>Mở Looker</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={draftEmbedUrl}
              onChange={(e) => setDraftEmbedUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEmbedUrl();
              }}
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50/70 focus:bg-white px-3.5 py-2 text-xs text-slate-800 font-mono focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none"
              placeholder="Dán link Looker Studio (https://lookerstudio.google.com/...) hoặc mã <iframe> vào đây..."
            />
            <button
              type="button"
              onClick={() => handleSaveEmbedUrl()}
              className="rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer shrink-0"
            >
              💾 Lưu Link Vĩnh Viễn
            </button>
          </div>

          <div
            className={`relative w-full rounded-xl bg-slate-50 border border-slate-200 overflow-hidden transition-all duration-300 ${
              isTallIframe ? 'h-[960px]' : 'h-[740px]'
            }`}
          >
            <iframe
              key={iframeKey}
              src={embedUrl}
              title="KOCity Looker Studio Live"
              className="h-full w-full border-0"
              allowFullScreen
              sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 3: XẾP HẠNG KOC & PHÂN TẦNG CREATOR TỰ ĐỘNG                    */}
      {/* =================================================================== */}
      {viewMode === 'koc-tiers' && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kocAnalytics.tiers.map((tier) => {
              const share =
                kocAnalytics.totalUnique > 0 ? Math.round((tier.count / kocAnalytics.totalUnique) * 100) : 0;
              return (
                <div key={tier.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{tier.label}</span>
                    <span className="text-xs font-black text-violet-700">{share}%</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{tier.count} KOC</p>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${tier.color}`}
                      style={{ width: `${share}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Đã duyệt: <b>{tier.approved}</b> · Hoàn thành: <b className="text-emerald-600">{tier.completed}</b>
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">Top 15 KOC Đóng Góp Nổi Bật Nhất (Tự Động)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-2">#</th>
                    <th className="py-2">KOC / Kênh TikTok</th>
                    <th className="py-2 text-right">Followers</th>
                    <th className="py-2 text-center">Đã Đăng Ký</th>
                    <th className="py-2 text-center">Đã Duyệt</th>
                    <th className="py-2 text-center">Video Hoàn Thành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kocAnalytics.topKocs.map((k, idx) => (
                    <tr key={k.handle + idx} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-400">#{idx + 1}</td>
                      <td className="py-2.5 font-bold text-slate-900">
                        {k.name}{' '}
                        <span className="font-mono text-violet-600 font-normal">
                          ({k.handle.startsWith('@') ? k.handle : `@${k.handle}`})
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-700">{formatCompact(k.followers)}</td>
                      <td className="py-2.5 text-center">{k.applied}</td>
                      <td className="py-2.5 text-center font-bold text-blue-600">{k.approved}</td>
                      <td className="py-2.5 text-center font-black text-emerald-600">{k.completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 4: HƯỚNG DẪN NỐI SUPABASE SQL VIEWS VÀO LOOKER STUDIO          */}
      {/* =================================================================== */}
      {viewMode === 'sql-setup' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Đồng Bộ Tự Động Sang Google Looker Studio (100% Không Nhập Tay)
              </h3>
              <p className="text-xs text-slate-500">
                Chạy file <code>supabase/metabase_analytics_views.sql</code> trên Supabase để Looker Studio đọc trực tiếp 4 bảng tổng hợp tự động.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await copyTextToClipboard(SQL_VIEWS_SNIPPET);
                onShowToast('Đã sao chép ghi chú Views!', 'Mở file supabase/metabase_analytics_views.sql để chạy trong Supabase SQL Editor.', 'info');
              }}
              className="rounded-xl bg-violet-600 hover:bg-violet-700 px-3.5 py-2 text-xs font-bold text-white cursor-pointer"
            >
              📋 Chép Danh Sách Views
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs">
              <p className="font-bold text-slate-900">4 Bảng Tự Động Sẽ Xuất Hiện Trong Looker Studio:</p>
              <ul className="space-y-1.5 text-slate-700 list-disc pl-4">
                <li>
                  <code className="font-bold text-violet-700">kocity_bi_campaign_summary</code>: Tổng hợp toàn bộ chiến dịch (số đơn, chờ duyệt, đã duyệt, hoàn thành, tỷ lệ %, reach).
                </li>
                <li>
                  <code className="font-bold text-blue-700">kocity_bi_funnel_overview</code>: Phễu chuyển đổi 5 bước theo tháng.
                </li>
                <li>
                  <code className="font-bold text-emerald-700">kocity_bi_daily_applications</code>: Biểu đồ đường đơn đăng ký & duyệt mẫu theo từng ngày.
                </li>
                <li>
                  <code className="font-bold text-indigo-700">kocity_bi_koc_leaderboard</code>: Xếp hạng KOC & phân tầng Seed/Nano/Micro/Macro.
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs">
              <p className="font-bold text-slate-900">Thông Số Kết Nối PostgreSQL Trên Looker Studio:</p>
              <ul className="space-y-1.5 text-slate-700">
                <li>• <b>Host (Session Pooler IPv4):</b> <code>aws-0-ap-southeast-1.pooler.supabase.com</code></li>
                <li>• <b>Port:</b> <code>5432</code></li>
                <li>• <b>Database:</b> <code>postgres</code></li>
                <li>• <b>Username:</b> <code>postgres.mjsmnkelreniasahhfkf</code></li>
                <li>• <b>Bật SSL:</b> Không tích</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
