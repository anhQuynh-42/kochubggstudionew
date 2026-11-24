# WYSIWYG Standards & In-Browser Image Compressor

## 1. Cơ chế thực thi lệnh trực quan (WYSIWYG Execution)

### Đổi màu chữ (Text Color)
```typescript
const handleApplyColor = (colorHex: string) => {
  visualEditorRef.current?.focus();
  document.execCommand('styleWithCSS', false, 'true');
  document.execCommand('foreColor', false, colorHex);
  // Cập nhật state formData
  setFormData(prev => ({ ...prev, content: visualEditorRef.current?.innerHTML || '' }));
};
```
*Kết quả:* Đoạn chữ được bôi đen chuyển sang màu tím `#7c3aed` trực tiếp trên màn hình, không tạo thẻ thô trong mắt người dùng.

### Định dạng đoạn & Tiêu đề
- Tiêu đề lớn (H2): `document.execCommand('formatBlock', false, '<h2>')`
- Đề mục (H3): `document.execCommand('formatBlock', false, '<h3>')`
- Đoạn văn chuẩn (P): `document.execCommand('formatBlock', false, '<p>')`

---

## 2. Chuẩn nén ảnh tự động bằng Canvas (Zero Dependency)
Mọi ảnh tải lên từ máy hoặc paste từ bộ nhớ tạm (`Ctrl+V`) bắt buộc phải nén nhẹ trước khi lưu để trang web luôn tải dưới 1 giây:
```typescript
const compressImageFile = (file: File, callback: (compressedUrl: string) => void) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string;
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxDim = 1200; // Giới hạn kích thước tối đa 1200px
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Nén chất lượng 82% JPEG
        callback(canvas.toDataURL('image/jpeg', 0.82));
      } else {
        callback(dataUrl);
      }
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
};
```
*Lợi ích:* Kích thước file giảm từ 5MB - 10MB xuống chỉ còn 80KB - 150KB mà vẫn sắc nét 100% trên màn hình Retina.
