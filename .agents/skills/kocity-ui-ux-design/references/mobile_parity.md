# Mobile-First Parity Rule — Quy Tắc Vàng Tối Ưu Mobile

## 1. Triết lý bất biến
> **"Tối ưu cho điện thoại nhưng TUYỆT ĐỐI không làm vỡ hoặc thu hẹp giao diện trên Laptop."**

Người dùng KOC thường duyệt web trên smartphone (TikTok in-app browser, Safari, Chrome mobile), trong khi Admin và Brand lại làm việc chủ yếu trên máy tính xách tay (Laptop/MacBook). Hai trải nghiệm này phải hoàn hảo song song, không bên nào phải chịu thiệt vì bên kia.

---

## 2. Các nguyên tắc kỹ thuật bắt buộc

### 1. Tránh tràn viền ngang (Zero Horizontal Scrollbar)
* Tuyệt đối không dùng kích thước cố định theo pixel (`width: 600px`).
* Luôn sử dụng: `w-full max-w-xl mx-auto`, `overflow-x-hidden` ở container cha.
* Các bảng số liệu phải bọc trong `<div className="overflow-x-auto">` để vuốt ngang mềm mại trên mobile mà không làm bung trang.

### 2. Kích thước cảm ứng (Touch Targets $\ge 44\text{px}$)
* Mọi nút bấm, tab, icon đóng (X), nút thả tim trên mobile phải có vùng bấm tối thiểu $44 \times 44\text{px}$ để ngón tay cái dễ thao tác.
* Khoảng cách giữa 2 nút bấm liền kề tối thiểu 8px để tránh bấm nhầm.

### 3. Font Scaling theo Breakpoint
* Tiêu đề: `text-xl sm:text-2xl lg:text-3xl font-black`
* Văn bản: `text-xs sm:text-sm md:text-base`
* Không bao giờ để cỡ chữ body trên mobile nhỏ hơn `12px` gây mỏi mắt.

### 4. Quy tắc Grid Responsive
```tsx
// Chuẩn responsive KOCity:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {/* Mobile: 1 cột rộng rãi, dễ cuộn */}
  {/* Tablet: 2 cột cân đối */}
  {/* Laptop/Desktop: 3 cột sang trọng */}
</div>
```
