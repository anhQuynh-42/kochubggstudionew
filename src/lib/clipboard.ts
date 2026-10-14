/**
 * Tiện ích sao chép văn bản vào Clipboard tương thích 100% trên mọi nền tảng:
 * iOS Safari, Android, Webview (Zalo/Facebook), Chrome, Mac, Windows
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // Cách 1: Sử dụng Clipboard API hiện đại nếu môi trường an toàn và có hỗ trợ
  if (navigator?.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API thất bại, chuyển sang phương án fallback:', err);
    }
  }

  // Cách 2: Fallback textarea execCommand (chạy ổn định trên Safari iOS, Webview Zalo/FB)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Giữ textarea ngoài tầm nhìn của người dùng nhưng vẫn focus được
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 999999); // Hỗ trợ toàn diện cho iOS

    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (err) {
    console.error('Lỗi khi sao chép vào clipboard qua fallback:', err);
    return false;
  }
}
