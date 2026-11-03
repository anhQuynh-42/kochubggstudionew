/**
 * GOOGLE APPS SCRIPT CHO SHEET "Data KOC" CỦA KOCITY
 * 
 * Hướng dẫn cài đặt vào Google Sheets:
 * 1. Mở file Google Sheets: https://docs.google.com/spreadsheets/d/13QyPjS4BPRrrd6-_1eOM7BN0RhUENoJpzImhBENsu7o/edit
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa hết code cũ trong file Code.gs và dán toàn bộ đoạn mã bên dưới vào.
 * 4. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải -> "Quản lý bản triển khai" (Manage deployments) -> Chọn biểu tượng cây bút chỉnh sửa -> Chọn "Phiên bản mới" (New version) -> Bấm Triển khai (Deploy).
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    // Tìm sheet "Data KOC" hoặc sheet đầu tiên
    var sheet = ss.getSheetByName("Data KOC") || ss.getSheets()[0];
    
    // Parse dữ liệu gửi từ Website KOCity
    var rawContents = e.postData.contents;
    var data = JSON.parse(rawContents);

    // Danh sách 9 cột chuẩn theo yêu cầu mới nhất:
    // 1. Dấu thời gian
    // 2. Brand đăng ký
    // 3. Tên KOC
    // 4. Số điện thoại
    // 5. ID name Tiktok của bạn ?
    // 6. Email của KOC
    // 7. Sản phẩm đăng ký
    // 8. Đơn hàng và GMV
    // 9. Link kênh TikTok
    
    var timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
    var brand = data.campaignName || "";
    var kocName = data.kocName || "";
    var phone = "'" + (data.phone || ""); // Thêm dấu ' ở đầu để Google Sheet giữ nguyên số 0 của SĐT
    var tiktokHandle = data.tiktokHandle || "";
    var email = data.email || data.kocEmail || "";
    
    // Tách riêng sản phẩm đăng ký
    var sampleProduct = data.sampleProduct || data.selectedSampleName || "Mẫu mặc định";
    
    // Tách riêng đơn hàng và GMV
    var ordersAndGmv = data.ordersAndGmv || "";
    if (!ordersAndGmv) {
      var orders = data.monthlyOrders ? data.monthlyOrders : "";
      var gmv = data.monthlyAvgGmv ? data.monthlyAvgGmv : "";
      if (orders && gmv) {
        ordersAndGmv = orders + " • GMV: " + gmv;
      } else if (orders) {
        ordersAndGmv = orders;
      } else if (gmv) {
        ordersAndGmv = "GMV: " + gmv;
      } else {
        ordersAndGmv = "Chưa cập nhật";
      }
    }
    
    var channelLink = data.channelLink || (tiktokHandle ? "https://www.tiktok.com/" + tiktokHandle.replace(/^@/, '') : "");

    // Ghi thêm dòng mới vào Google Sheet
    sheet.appendRow([
      timestamp,
      brand,
      kocName,
      phone,
      tiktokHandle,
      email,
      sampleProduct,
      ordersAndGmv,
      channelLink
    ]);

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: "Đã thêm KOC thành công vào Google Sheet!",
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
