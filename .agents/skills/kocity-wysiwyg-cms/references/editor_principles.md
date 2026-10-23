# KOCity Editor Principles — Triết Lý Thiết Kế Bộ Soạn Thảo

## 1. Vấn đề của các bộ soạn thảo truyền thống
* Các plugin như TinyMCE, CKEditor thường có thanh công cụ khổng lồ 2-3 tầng, chiếm tới 30-40% chiều cao màn hình laptop và gần như không thể dùng trên điện thoại.
* Một số trình soạn thảo Markdown lại bắt người dùng phải nhìn các đoạn mã như `**chữ đậm**`, `<span style="color: #7c3aed;">chữ tím</span>`, gây cảm giác phức tạp, thô kệch và dễ nhầm lẫn.

---

## 2. Tiêu chuẩn Mini Sticky Toolbar KOCity
* **Độ cao thanh công cụ:** $\le 38\text{px}$ (chỉ chiếm 1 hàng gọn gàng).
* **Vị trí:** Ghim nhẹ ở mép trên của khung văn bản (`sticky top-0 z-10`).
* **Bảng màu 8 chấm tròn tinh tế (Quick Palette Dots):**
  * Thay vì mở bảng chọn màu phức tạp, chỉ hiển thị 8 chấm tròn nhỏ (14px):
    1. ⬛ Đen than (`#0f172a`)
    2. 🟣 Tím Kocity (`#7c3aed`)
    3. 🔵 Xanh dương (`#2563eb`)
    4. 🟢 Xanh lục (`#059669`)
    5. 🟠 Cam cháy (`#ea580c`)
    6. 🔴 Đỏ nhấn (`#dc2626`)
    7. 🌸 Hồng sen (`#db2777`)
    8. 🔘 Xám ghi (`#64748b`)
* **Nút bấm trực quan:**
  * `[🖼️ Tải ảnh]` (nén nhẹ tự động)
  * `[B] [I] [U] [≡]`
  * `[💡 Hộp mẹo]` (chèn khung bí kíp KOCity)
  * `[📊 Bảng]` (chèn bảng so sánh)
