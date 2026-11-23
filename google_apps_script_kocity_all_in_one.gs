/**
 * ==============================================================================
 * KOCity ALL-IN-ONE Google Apps Script (Chạy 24/7 Miễn Phí 0đ — Không lo sập!)
 * 1. Nhận tín hiệu khi KOC bấm yêu cầu mẫu Cỏ Mềm trên kocity.io.vn -> Bắn Telegram 24/7
 * 2. Nhận dữ liệu 5 kênh từ n8n -> Ghi vào tab BI_He_Sinh_Thai
 *
 * HƯỚNG DẪN CÀI ĐẶT (30 GIÂY):
 * 1. Mở Google Sheet -> Tiện ích mở rộng (Extensions) -> Apps Script
 * 2. Xóa code cũ, dán TOÀN BỘ đoạn code này vào
 * 3. Điền TELEGRAM_BOT_TOKEN (lấy từ @BotFather) vào dòng số 15 bên dưới
 * 4. Bấm Triển khai (Deploy) -> Quản lý các bản triển khai (Manage deployments)
 *    -> Bấm biểu tượng bút chì (Chỉnh sửa) -> Phiên bản: "Phiên bản mới" -> Bấm "Triển khai"
 *    (Giữ nguyên đúng URL /exec cũ, KHÔNG cần đổi link trên website!)
 * ==============================================================================
 */

var TELEGRAM_BOT_TOKEN = 'DAN_TELEGRAM_BOT_TOKEN_CUA_BAN_VAO_DAY';
var TELEGRAM_CHAT_ID = '-5348405193';

var PREFILLED_KOCS = [
  'embes.bii',
  'dh.t172',
  'muoi2021.pe',
  'sunnynguyen09',
  'Oanh.thu1408',
  'yyuunnii03',
  'yenlamme',
  'gaoiu2511'
];

function doGet(e) {
  return handleKocSampleClaim(e);
}

function doPost(e) {
  try {
    // 1. Nếu có tham số ?koc=... trên URL (từ thẻ <a ping="..."> trên website kocity.io.vn)
    if (e && e.parameter && (e.parameter.koc || e.parameter.reset === 'true' || e.parameter.action === 'reset')) {
      return handleKocSampleClaim(e);
    }

    // 2. Nếu có body JSON
    if (e && e.postData && e.postData.contents) {
      var rawText = e.postData.contents.trim();
      if (rawText.charAt(0) === '{' || rawText.charAt(0) === '[') {
        var data = JSON.parse(rawText);

        // 2a. Nếu là JSON gọi báo Telegram KOC claim
        if (!Array.isArray(data) && data.koc) {
          return handleKocSampleClaim({ parameter: data });
        }

        // 2b. Nếu là dữ liệu 5 kênh BI_He_Sinh_Thai từ n8n -> ghi vào Sheet
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName('BI_He_Sinh_Thai') || ss.insertSheet('BI_He_Sinh_Thai');
        var rows = Array.isArray(data) ? data : [data];
        rows.forEach(function (r) {
          if (r && r.Nen_Tang) {
            sheet.appendRow([r.Ngay, r.Nen_Tang, r.Ten_Kenh, r.Followers, r.Luot_Xem, r.Tuong_Tac, r.Tang_Moi]);
          }
        });
        return jsonOut({ ok: true, mode: 'bi_sheets', count: rows.length });
      }
    }

    return handleKocSampleClaim(e);
  } catch (err) {
    return jsonOut({ ok: false, error: err.toString() });
  }
}

function handleKocSampleClaim(e) {
  var query = (e && e.parameter) ? e.parameter : {};
  var props = PropertiesService.getScriptProperties();

  // Đọc danh sách KOC đã bấm lưu vĩnh viễn trên Google Script Properties
  var claimedKocs = [];
  try {
    var savedStr = props.getProperty('KOCITY_CLAIMED_KOCS');
    if (savedStr) claimedKocs = JSON.parse(savedStr);
  } catch (err) {
    claimedKocs = [];
  }

  if (!Array.isArray(claimedKocs) || claimedKocs.length === 0) {
    claimedKocs = PREFILLED_KOCS.slice();
  } else {
    PREFILLED_KOCS.forEach(function (pre) {
      var exists = claimedKocs.some(function (k) { return String(k).toLowerCase() === pre.toLowerCase(); });
      if (!exists) claimedKocs.push(pre);
    });
  }

  if (query.reset === 'true' || query.action === 'reset') {
    claimedKocs = PREFILLED_KOCS.slice();
  }

  // Làm sạch ID TikTok
  var rawKoc = String(query.koc || 'Ẩn danh').trim();
  rawKoc = rawKoc
    .replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, '')
    .replace(/^@*www\.tiktok\.com\/@?/i, '')
    .replace(/^@+/, '')
    .trim();

  var koc = rawKoc || 'Ẩn danh';
  var product = escapeHtml(String(query.product || 'Sản phẩm Cỏ Mềm'));
  var followers = escapeHtml(String(query.followers || 'Chưa rõ'));
  var affLink = String(query.affLink || 'https://www.tiktok.com');
  var now = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'HH:mm:ss dd/MM/yyyy');

  var kocLower = koc.toLowerCase();
  var isExisting = claimedKocs.some(function (name) { return String(name).toLowerCase() === kocLower; });
  var isValidKoc = koc && koc !== 'Ẩn danh';

  if (!isExisting && isValidKoc) {
    claimedKocs.push(koc);
  }

  // Lưu vĩnh viễn danh sách KOC không trùng lặp
  props.setProperty('KOCITY_CLAIMED_KOCS', JSON.stringify(claimedKocs));

  var totalUnique = claimedKocs.length;
  var totalTarget = 68;
  var percent = Math.round((totalUnique / totalTarget) * 100);

  var kocListText = '';
  if (totalUnique === 0) {
    kocListText = '<i>(Chưa có KOC nào)</i>';
  } else if (totalUnique <= 25) {
    kocListText = claimedKocs.map(function (name, idx) {
      return (idx + 1) + '. <code>@' + escapeHtml(name) + '</code>';
    }).join('\n');
  } else {
    kocListText = claimedKocs.map(function (name) {
      return '<code>@' + escapeHtml(name) + '</code>';
    }).join(' • ');
  }

  var statusTag = isExisting
    ? '🔄 <i>(KOC này đã từng bấm trước đó)</i>'
    : '✨ <b>[KOC MỚI BẤM LẦN ĐẦU]</b>';

  var telegramMessage =
    '🎉 <b>[KOCITY] KOC VỪA BẤM YÊU CẦU MẪU CỎ MỀM!</b>\n\n' +
    '👤 <b>KOC:</b> <code>@' + escapeHtml(koc) + '</code> ' + statusTag + '\n' +
    '📦 <b>Sản phẩm:</b> <b>' + product + '</b>\n' +
    '👥 <b>Followers:</b> ' + followers + '\n' +
    '⏰ <b>Thời gian:</b> ' + now + '\n\n' +
    '🔗 <b>Kênh TikTok:</b> https://www.tiktok.com/@' + encodeURIComponent(koc) + '\n' +
    '🎁 <b>Link mẫu đã bấm:</b> <a href="' + affLink + '">Mở TikTok Affiliate</a>\n\n' +
    '━━━━━━━━━━━━━━━━━━━━\n' +
    '📊 <b>TỔNG KẾT KOC ĐÃ BẤM NHẬN MẪU:</b>\n' +
    '🔥 <b>Tiến độ:</b> <b>' + totalUnique + '/' + totalTarget + ' KOC</b> (' + percent + '%)\n' +
    '👥 <b>Tổng số KOC độc nhất:</b> <b>' + totalUnique + ' KOC</b>\n' +
    '📋 <b>Danh sách KOC không trùng:</b>\n' + kocListText + '\n' +
    '━━━━━━━━━━━━━━━━━━━━\n\n' +
    '💡 <i>Nhắc nhở: Hãy vào TikTok Shop Seller Center kiểm tra và duyệt gửi mẫu cho KOC nhé!</i>';

  // Bắn trực tiếp sang Telegram Bot API 24/7
  var tgResult = sendTelegramMessage(telegramMessage);

  return jsonOut({
    ok: true,
    koc: koc,
    totalUnique: totalUnique,
    percent: percent,
    telegramSent: tgResult.ok,
    telegramError: tgResult.error || null
  });
}

function sendTelegramMessage(htmlText) {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN.indexOf('DAN_TELEGRAM') === 0) {
    return { ok: false, error: 'Chưa điền TELEGRAM_BOT_TOKEN' };
  }
  try {
    var url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
    var res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true,
      payload: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    var code = res.getResponseCode();
    return { ok: code >= 200 && code < 300, status: code, body: res.getContentText() };
  } catch (err) {
    return { ok: false, error: err.toString() };
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
