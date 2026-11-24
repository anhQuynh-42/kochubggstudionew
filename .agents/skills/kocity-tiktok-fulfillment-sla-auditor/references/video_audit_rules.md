# TikTok Video Compliance & SLA Rules Reference

> **Tài liệu tham chiếu chuẩn cho Skill:** `kocity-tiktok-fulfillment-sla-auditor`  
> **Nguyên tắc cốt lõi:** Minh bạch quy chuẩn, bảo vệ tài sản mẫu thử của Brand, tạo môi trường hợp tác lành mạnh cho KOC.

---

## 1. Quy chuẩn Biểu thức Chính quy (Regex) Xác thực URL TikTok

Hệ thống chấp nhận 3 định dạng URL video TikTok hợp lệ sau:
```regex
^(https?:\/\/)?(www\.|vt\.|vm\.)?tiktok\.com\/(@[\w.-]+\/video\/\d+|\w+)(\?.*)?$
```
*Các URL dẫn đến trang cá nhân (`@username`), link livestream đang diễn ra, hoặc link video riêng tư (Private) sẽ bị từ chối với thông báo yêu cầu KOC nộp đúng link clip đã xuất bản công khai.*

---

## 2. Tiêu chuẩn Soát Lỗi Caption & Hashtag

1. **Bộ Hashtags Bắt Buộc (Mandatory Tags):**
   - Phải xuất hiện đầy đủ trong phần caption (mô tả) của video. Không phân biệt chữ hoa, chữ thường.
   - Ví dụ: `#comem`, `#kocity`, `#sonduonggao`.
2. **Cảnh báo Từ ngữ Nhạy cảm trên TikTok Shop:**
   - Cảnh báo KOC nếu trong caption hoặc lời thoại có các từ dễ bị TikTok "bóp" hiển thị hoặc cấm phân phối:
     - *"Cam kết 100%"*, *"Trị dứt điểm"*, *"Chữa khỏi"*.
     - Hướng người xem sang nền tảng khác (Zalo, Shopee, Lazada) trong clip dự thi TikTok Shop Affiliate.

---

## 3. Quy tắc Cộng / Trừ Điểm Uy tín KOC (Reputation Scoring Engine)

Điểm uy tín KOC (Khởi điểm: $100$ điểm) được cập nhật tự động sau mỗi chiến dịch:
* **Trả bài đúng hạn $\le 5$ ngày:** $+10$ điểm uy tín (Được ưu tiên duyệt các job tài trợ cao cấp).
* **Trả bài trong hạn ngày thứ 6–7:** $+5$ điểm uy tín.
* **Trễ hạn 1–3 ngày (sau khi bị nhắc nhở):** Trừ $15$ điểm uy tín.
* **Trễ hạn quá 7 ngày mà không có lý do chính đáng:** Trừ $40$ điểm, tạm khóa quyền nhận mẫu trong 30 ngày.
* **Cố tình không trả bài / Xóa video sau khi nhận:** Trừ toàn bộ điểm $\rightarrow$ Đưa vào **Blacklist vĩnh viễn**.
