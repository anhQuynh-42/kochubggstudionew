# MCDA Matching Score Engine — Rubric & Mathematical Standards

> **Tài liệu tham chiếu chuẩn cho Skill:** `kocity-koc-strategic-matching`  
> **Nguyên tắc cốt lõi:** Chuẩn hóa dữ liệu trước khi tính toán, minh bạch trọng số, không thiên vị kênh lớn.

---

## 1. Công thức Chuẩn hóa Dữ liệu (Normalization Formulas)

Để so sánh công bằng giữa một KOC 3.000 followers và một KOC 50.000 followers, mọi chỉ số thô phải được đưa về thang điểm chuẩn $0 - 100$:

### A. Tỷ lệ tương tác (Engagement Rate - ER)
TikTok chuẩn ngành đối với Nano KOC: ER trung bình là $3\% - 6\%$. ER $> 8\%$ là xuất sắc.
$$S_{\text{ER}} = \min\left(100, \; \frac{\text{ER}}{8\%} \times 100\right)$$
*Nếu $\text{ER} > 25\%$, gắn cờ nghi vấn spam/buff ảo và hạ điểm uy tín 20 điểm.*

### B. Lượt xem trung bình (Median Views - Normalized via Logarithmic Scale)
Tránh việc 1 clip đột biến làm sai lệch toàn bộ kênh, sử dụng **trung vị (Median)** của 10 clip gần nhất:
$$S_{\text{views}} = \min\left(100, \; \frac{\log_{10}(\text{Median Views})}{\log_{10}(\text{Target Views})} \times 100\right)$$

### C. Mức độ phù hợp ngân sách (Budget Fit)
Với các chiến dịch nhận mẫu 0đ (Freecast Sampling):
- KOC sẵn sàng nhận mẫu 0đ và nhận hoa hồng TikTok Shop chuẩn ($15\% - 20\%$): **$100$ điểm**.
- KOC đòi thêm phí booking cố định vượt ngân sách chiến dịch: **Phạt trừ điểm theo tỷ lệ vượt ngân sách**.

---

## 2. Ma trận Trọng số Đa mục tiêu (Dynamic Weight Matrices)

Tùy theo mục tiêu cốt lõi của chiến dịch do Brand khai báo, bộ trọng số tự động hiệu chỉnh:

| Mục tiêu Chiến dịch (Goal) | Audience ($w_a$) | Content ($w_c$) | Performance ($w_p$) | Budget ($w_b$) | Reliability ($w_r$) | Ghi chú Trọng tâm |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Mặc định / Cân bằng** | **30%** | **25%** | **20%** | **15%** | **10%** | Áp dụng cho đa số chiến dịch mẫu 0đ phổ thông. |
| **Affiliate Sales (Bán hàng)** | **20%** | **20%** | **35%** | **15%** | **10%** | Ưu tiên KOC có tỷ lệ chuyển đổi cao và quen gắn giỏ hàng. |
| **Brand Awareness (Nhận diện)** | **35%** | **30%** | **15%** | **10%** | **10%** | Ưu tiên độ phủ tệp người xem và chất lượng hình ảnh video. |
| **Budget-Constrained (Tiết kiệm)**| **20%** | **25%** | **15%** | **30%** | **10%** | Ưu tiên Nano KOC nhận mẫu 0đ thuần túy, không đòi hỏi chi phí phụ. |

---

## 3. Thang đo Độ tin cậy Dữ liệu (Data Reliability Index - DRI)

Mỗi KOC sau khi tính điểm sẽ được gán 1 trong 3 mức độ tin cậy dữ liệu:
* **HIGH (Cao):** Đã hoàn thành $\ge 3$ chiến dịch trên KOCity VÀ có ảnh chụp TikTok Studio Analytics xác thực.
* **MEDIUM (Trung bình):** Đã liên kết kênh TikTok thật, có dữ liệu 10 video công khai, nhưng chưa từng chạy chiến dịch nhãn hàng trên hệ thống.
* **LOW (Thấp / Dữ liệu sơ khai):** Tài khoản mới tạo, chỉ có thông tin tự khai báo trên form đăng ký, chưa qua kiểm chứng thực nghiệm.
