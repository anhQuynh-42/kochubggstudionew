/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT — SHEET "DATA ĐĂNG KÝ MẪU" (KOCity)
 * Chuẩn hóa đúng 9 cột theo thứ tự mới mà KHÔNG làm xáo trộn ~928 dòng cũ,
 * đồng thời tự động ghi đúng cột cho mọi đơn KOC đăng ký mới từ kocity.io.vn!
 *
 * THỨ TỰ 9 CỘT CHUẨN MỚI:
 * 1. Dấu thời gian
 * 2. Brand đăng ký
 * 3. Sản phẩm đăng ký
 * 4. Tên KOC
 * 5. ID name Tiktok của bạn ?
 * 6. Link kênh TikTok
 * 7. Số điện thoại
 * 8. Email của KOC
 * 9. Đơn hàng và GMV
 *
 * HƯỚNG DẪN CÀI ĐẶT (30 GIÂY):
 * 1. Mở file Google Sheet "Data đăng ký mẫu" -> Tiện ích mở rộng (Extensions) -> Apps Script
 * 2. Dán toàn bộ đoạn code này đè lên file Code.gs -> Bấm Lưu (Ctrl + S)
 * 3. Trên thanh công cụ Apps Script, chọn hàm `chuyenDoi9CotChuan` -> bấm "Chạy" (Run) 1 lần
 *    => Toàn bộ ~928 dòng cũ trên Sheet sẽ tự động sắp xếp lại sang đúng 9 cột mới trong 2 giây!
 * 4. Bấm Triển khai (Deploy) -> Quản lý các bản triển khai (Manage deployments)
 *    -> Bấm biểu tượng bút chì (Chỉnh sửa) -> Phiên bản: "Phiên bản mới" -> Bấm "Triển khai"
 *    (Giữ nguyên URL Web App hiện tại nên website kocity.io.vn tự động ăn khớp 100%!)
 * ==============================================================================
 */

var TARGET_HEADERS = [
  'Dấu thời gian',
  'Brand đăng ký',
  'Sản phẩm đăng ký',
  'Tên KOC',
  'ID name Tiktok của bạn ?',
  'Link kênh TikTok',
  'Số điện thoại',
  'Email của KOC',
  'Đơn hàng và GMV'
];

/**
 * CHẠY HÀM NÀY 1 LẦN TRONG APPS SCRIPT ĐỂ SẮP XẾP LẠI TOÀN BỘ DỮ LIỆU CŨ SANG 9 CỘT MỚI
 */
function chuyenDoi9CotChuan() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length === 0) return;

  var rawHeaders = data[0].map(function (h) {
    return String(h || '').trim().toLowerCase();
  });

  function findColIdx(keywords, fallbackIdx) {
    for (var i = 0; i < rawHeaders.length; i++) {
      var h = rawHeaders[i];
      for (var k = 0; k < keywords.length; k++) {
        if (h.indexOf(keywords[k]) !== -1) return i;
      }
    }
    return fallbackIdx;
  }

  // Tự động nhận diện vị trí cột hiện tại theo tên (kể cả khi bạn đã kéo cột hay chưa)
  var idxTime    = findColIdx(['dấu thời gian', 'timestamp', 'thời gian'], 0);
  var idxBrand   = findColIdx(['brand'], 1);
  var idxName    = findColIdx(['tên koc', 'ten koc', 'họ tên'], 2);
  var idxPhone   = findColIdx(['số điện thoại', 'điện thoại', 'phone', 'sđt'], 3);
  var idxTiktok  = findColIdx(['id name', 'tiktok của bạn'], 4);
  var idxEmail   = findColIdx(['email'], 5);
  var idxProduct = findColIdx(['sản phẩm', 'san pham'], 6);
  var idxGmv     = findColIdx(['đơn hàng', 'gmv', 'gvm'], 7);
  var idxLink    = findColIdx(['link kênh', 'link kenh'], 8);

  var newRows = [TARGET_HEADERS];

  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    newRows.push([
      row[idxTime]    !== undefined ? row[idxTime]    : '',
      row[idxBrand]   !== undefined ? row[idxBrand]   : '',
      row[idxProduct] !== undefined ? row[idxProduct] : '',
      row[idxName]    !== undefined ? row[idxName]    : '',
      row[idxTiktok]  !== undefined ? row[idxTiktok]  : '',
      row[idxLink]    !== undefined ? row[idxLink]    : '',
      row[idxPhone]   !== undefined ? row[idxPhone]   : '',
      row[idxEmail]   !== undefined ? row[idxEmail]   : '',
      row[idxGmv]     !== undefined ? row[idxGmv]     : ''
    ]);
  }

  // Ghi đè lại đúng 9 cột chuẩn mới trong 1 lần
  sheet.getRange(1, 1, newRows.length, TARGET_HEADERS.length).setValues(newRows);
  SpreadsheetApp.flush();
}

/**
 * NHẬN ĐƠN ĐĂNG KÝ MỚI TỪ WEBSITE KOCITY.IO.VN -> GHI ĐÚNG VÀO CỘT TƯƠNG ỨNG THEO TÊN CỘT
 */
function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var data = JSON.parse(raw);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    var timestamp = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy hh:mm a');
    var brand = data.campaignName || data.brandName || '';
    var product = data.contentConcept || data.registeredSample || data.sampleProduct || data.selectedSampleName || '';
    var kocName = data.kocName || '';
    var tiktokHandle = data.tiktokHandle || '';
    var channelLink = data.channelLink || (tiktokHandle ? 'https://www.tiktok.com/' + String(tiktokHandle).replace(/^@?/, '@') : '');
    var phone = data.phone ? ("'" + String(data.phone).replace(/^'+/, '')) : '';
    var email = data.email || data.kocEmail || data.address || '';
    var ordersAndGmv = data.ordersAndGmv || (
      (data.monthlyOrders || data.monthlyAvgGmv)
        ? ('— Đơn bán/tháng: ' + (data.monthlyOrders || '') + ' • GMV TB/tháng: ' + (data.monthlyAvgGmv || ''))
        : ''
    );

    // Đọc tiêu đề dòng 1 hiện tại của Sheet để luôn ghi đúng cột (dù Sheet đang ở thứ tự cũ hay mới)
    var lastCol = Math.max(sheet.getLastColumn(), 9);
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) {
      return String(h || '').trim().toLowerCase();
    });

    // Nếu Sheet chưa có tiêu đề, tự tạo dòng tiêu đề chuẩn 9 cột mới
    if (!headers[0] && !headers[1]) {
      sheet.getRange(1, 1, 1, TARGET_HEADERS.length).setValues([TARGET_HEADERS]);
      headers = TARGET_HEADERS.map(function (h) { return h.toLowerCase(); });
    }

    var rowValues = new Array(TARGET_HEADERS.length);
    for (var i = 0; i < TARGET_HEADERS.length; i++) rowValues[i] = '';

    function setByKeyword(keywords, fallbackIdx, val) {
      for (var c = 0; c < headers.length; c++) {
        var h = headers[c];
        for (var k = 0; k < keywords.length; k++) {
          if (h.indexOf(keywords[k]) !== -1) {
            rowValues[c] = val;
            return;
          }
        }
      }
      if (rowValues[fallbackIdx] === '') rowValues[fallbackIdx] = val;
    }

    setByKeyword(['dấu thời gian', 'timestamp', 'thời gian'], 0, timestamp);
    setByKeyword(['brand'], 1, brand);
    setByKeyword(['sản phẩm', 'san pham'], 2, product);
    setByKeyword(['tên koc', 'ten koc', 'họ tên'], 3, kocName);
    setByKeyword(['id name', 'tiktok của bạn'], 4, tiktokHandle);
    setByKeyword(['link kênh', 'link kenh'], 5, channelLink);
    setByKeyword(['số điện thoại', 'điện thoại', 'phone'], 6, phone);
    setByKeyword(['email'], 7, email);
    setByKeyword(['đơn hàng', 'gmv', 'gvm'], 8, ordersAndGmv);

    sheet.appendRow(rowValues);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, message: 'Đã ghi đơn KOC vào đúng cột chuẩn!' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
