import React, { useState, useRef, useEffect } from 'react';
import { BlogPost, getStoredBlogPosts, saveStoredBlogPosts, INITIAL_BLOG_POSTS } from '../data/blogData';
import { BlogContentRenderer } from '../site/components/BlogContentRenderer';

interface AdminBlogManagerProps {
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

const COLOR_PALETTE = [
  { label: 'Đen than', hex: '#0f172a' },
  { label: 'Tím Kocity', hex: '#7c3aed' },
  { label: 'Xanh dương', hex: '#2563eb' },
  { label: 'Xanh lục', hex: '#059669' },
  { label: 'Cam cháy', hex: '#ea580c' },
  { label: 'Đỏ nhấn', hex: '#dc2626' },
  { label: 'Hồng sen', hex: '#db2777' },
  { label: 'Xám ghi', hex: '#64748b' },
];

export const AdminBlogManager: React.FC<AdminBlogManagerProps> = ({ onShowToast }) => {
  const [posts, setPosts] = useState<BlogPost[]>(() => getStoredBlogPosts());
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<BlogPost>>({});
  const [editorTab, setEditorTab] = useState<'visual' | 'code' | 'preview'>('visual');

  // Refs for editor & file upload
  const visualEditorRef = useRef<HTMLDivElement>(null);
  const codeAreaRef = useRef<HTMLTextAreaElement>(null);
  const inArticleFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Convert markdown to visual HTML for WYSIWYG editing
  const markdownToVisualHtml = (md: string): string => {
    if (!md) return '';
    if (md.includes('<p>') || md.includes('<div>') || md.includes('<h2')) {
      return md; // already HTML
    }
    let html = md;
    // images
    html = html.replace(/^!\[(.*?)\]\((.*?)\)$/gim, '<figure class="my-4"><img src="$2" alt="$1" class="rounded-xl w-full max-h-[460px] object-cover shadow-sm" /><figcaption class="text-center text-xs text-slate-500 italic mt-1.5">📷 $1</figcaption></figure>');
    // headings
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-900 mt-6 mb-2 border-b border-slate-100 pb-1">$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-violet-950 mt-4 mb-2">$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-base font-bold text-violet-800 mt-3 mb-1">$1</h4>');
    // callout tip
    html = html.replace(/^>\s*(.*?)$/gim, '<div class="my-4 rounded-xl border border-violet-200 bg-violet-50/70 p-4 text-violet-950 font-medium">💡 $1</div>');
    // bold & italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // paragraphs
    const blocks = html.split(/\n\n+/);
    html = blocks.map(b => {
      const trimmed = b.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<figure') || trimmed.startsWith('<div') || trimmed.startsWith('<table')) {
        return trimmed;
      }
      return `<p class="mb-3 leading-relaxed">${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');
    return html;
  };

  // Synchronize visual editor DOM when editing post changes or tab switches to visual
  useEffect(() => {
    if (editingPost && visualEditorRef.current && editorTab === 'visual') {
      const targetHtml = markdownToVisualHtml(formData.content || '');
      if (visualEditorRef.current.innerHTML !== targetHtml) {
        visualEditorRef.current.innerHTML = targetHtml;
      }
    }
  }, [editingPost?.id, editorTab]);

  // In-browser lightweight image compression (max 1200px, 82% quality)
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
        const maxDim = 1200;
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
          callback(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          callback(dataUrl);
        }
      };
      img.onerror = () => callback(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsCreatingNew(false);
    setFormData({ ...post });
    setEditorTab('visual');
  };

  const handleOpenCreate = () => {
    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      title: '',
      slug: '',
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      coverImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
      tag: 'Cẩm nang KOC',
      readTime: '5 phút đọc',
      isCloudCovered: false,
      cloudSecretLabel: '💎 BÍ KÍP ĐỘC QUYỀN KOCITY',
      summary: '',
      content: '',
      publishedAt: new Date().toLocaleDateString('vi-VN'),
    };
    setEditingPost(newPost);
    setIsCreatingNew(true);
    setFormData(newPost);
    setEditorTab('visual');
  };

  const handleToggleCloud = (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const nextState = !p.isCloudCovered;
        return { ...p, isCloudCovered: nextState };
      }
      return p;
    });
    setPosts(updated);
    saveStoredBlogPosts(updated);
    onShowToast('Đã cập nhật trạng thái mây che!', 'Bài viết đã được cập nhật hiển thị ngoài trang chủ.', 'success');
  };

  // Helper to insert or wrap text in code mode
  const insertAtCursorInCodeMode = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = codeAreaRef.current;
    if (!textarea) {
      setFormData((prev) => ({
        ...prev,
        content: (prev.content || '') + before + defaultText + after,
      }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.substring(start, end) || defaultText;

    const newText = currentText.substring(0, start) + before + selectedText + after + currentText.substring(end);
    setFormData((prev) => ({ ...prev, content: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 10);
  };

  // Apply color visually (WYSIWYG)
  const handleApplyColor = (colorHex: string) => {
    if (editorTab === 'code') {
      insertAtCursorInCodeMode(`<span style="color: ${colorHex};">`, '</span>', 'Đoạn chữ đổi màu');
      return;
    }
    visualEditorRef.current?.focus();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('foreColor', false, colorHex);
    if (visualEditorRef.current) {
      setFormData((prev) => ({ ...prev, content: visualEditorRef.current?.innerHTML || '' }));
    }
  };

  // Execute visual commands (bold, italic, underline, align)
  const handleExec = (command: string, value: string = '') => {
    if (editorTab === 'code') {
      if (command === 'bold') insertAtCursorInCodeMode('**', '**', 'chữ đậm');
      if (command === 'italic') insertAtCursorInCodeMode('*', '*', 'chữ nghiêng');
      if (command === 'underline') insertAtCursorInCodeMode('<u>', '</u>', 'chữ gạch chân');
      if (command === 'justifyCenter') insertAtCursorInCodeMode('<div align="center">\n\n', '\n\n</div>', 'Căn giữa');
      return;
    }
    visualEditorRef.current?.focus();
    document.execCommand(command, false, value);
    if (visualEditorRef.current) {
      setFormData((prev) => ({ ...prev, content: visualEditorRef.current?.innerHTML || '' }));
    }
  };

  // Font family formatting
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    if (editorTab === 'code') {
      insertAtCursorInCodeMode(`<span style="font-family: ${val};">`, '</span>', 'Đoạn văn bản');
    } else {
      visualEditorRef.current?.focus();
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontName', false, val);
      if (visualEditorRef.current) {
        setFormData((prev) => ({ ...prev, content: visualEditorRef.current?.innerHTML || '' }));
      }
    }
    e.target.value = '';
  };

  // Font size / Heading formatting
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    if (editorTab === 'code') {
      if (val.startsWith('#')) {
        insertAtCursorInCodeMode(`\n\n${val} `, '', 'Tiêu đề');
      } else {
        insertAtCursorInCodeMode(`<span style="font-size: ${val};">`, '</span>', 'Đoạn văn');
      }
    } else {
      visualEditorRef.current?.focus();
      if (val === '##') {
        document.execCommand('formatBlock', false, '<h2>');
      } else if (val === '###') {
        document.execCommand('formatBlock', false, '<h3>');
      } else if (val === 'p') {
        document.execCommand('formatBlock', false, '<p>');
      } else {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const span = document.createElement('span');
          span.style.fontSize = val;
          span.appendChild(range.extractContents());
          range.insertNode(span);
        }
      }
      if (visualEditorRef.current) {
        setFormData((prev) => ({ ...prev, content: visualEditorRef.current?.innerHTML || '' }));
      }
    }
    e.target.value = '';
  };

  // Insert tip callout
  const handleInsertTipBox = () => {
    if (editorTab === 'code') {
      insertAtCursorInCodeMode('\n\n> 💡 **Bí kíp KOCity:** ', '\n\n', 'Nhập lưu ý hoặc mẹo quan trọng tại đây...');
    } else {
      visualEditorRef.current?.focus();
      const tipHtml = `<div class="my-4 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50/90 via-purple-50/60 to-pink-50/40 p-4 text-violet-950 font-medium flex items-start gap-3 shadow-2xs"><span class="text-2xl select-none leading-none">💡</span><div class="flex-1 leading-relaxed"><strong>Bí kíp KOCity:</strong> Nhập lưu ý quan trọng tại đây...</div></div><p><br></p>`;
      document.execCommand('insertHTML', false, tipHtml);
      if (visualEditorRef.current) {
        setFormData((prev) => ({ ...prev, content: visualEditorRef.current?.innerHTML || '' }));
      }
    }
  };

  // Insert sample table
  const handleInsertTable = () => {
    if (editorTab === 'code') {
      insertAtCursorInCodeMode('\n\n| Tiêu chí | Nội dung chi tiết |\n| --- | --- |\n| ', ' | Mô tả ví dụ |\n\n', 'Bước 1');
    } else {
      visualEditorRef.current?.focus();
      const tableHtml = `<div class="overflow-x-auto my-4 rounded-xl border border-slate-200"><table class="min-w-full divide-y divide-slate-200 text-xs sm:text-sm"><thead class="bg-slate-50 font-bold text-slate-800"><tr><th class="px-4 py-2 text-left">Tiêu chí</th><th class="px-4 py-2 text-left">Chi tiết</th></tr></thead><tbody class="divide-y divide-slate-100 bg-white"><tr><td class="px-4 py-2 text-slate-700">Bước 1</td><td class="px-4 py-2 text-slate-600">Đăng ký nhận mẫu</td></tr><tr><td class="px-4 py-2 text-slate-700">Bước 2</td><td class="px-4 py-2 text-slate-600">Lên video review</td></tr></tbody></table></div><p><br></p>`;
      document.execCommand('insertHTML', false, tableHtml);
      if (visualEditorRef.current) {
        setFormData((prev) => ({ ...prev, content: visualEditorRef.current?.innerHTML || '' }));
      }
    }
  };

  // Upload in-article image from computer
  const handleProcessInArticleImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Tệp không hợp lệ', 'Vui lòng chọn hình ảnh (PNG, JPG, WEBP,...)', 'warning');
      return;
    }
    compressImageFile(file, (optimizedUrl) => {
      const caption = file.name.replace(/\.[^/.]+$/, '') || 'Hình ảnh minh họa';
      if (editorTab === 'code') {
        insertAtCursorInCodeMode(`\n\n![${caption}](${optimizedUrl})\n\n`, '');
      } else {
        visualEditorRef.current?.focus();
        const imgHtml = `<figure class="my-5"><img src="${optimizedUrl}" alt="${caption}" class="rounded-2xl w-full max-h-[480px] object-cover shadow-md border border-slate-200" /><figcaption class="text-center text-xs text-slate-500 italic mt-2">📷 ${caption}</figcaption></figure><p><br></p>`;
        document.execCommand('insertHTML', false, imgHtml);
        if (visualEditorRef.current) {
          setFormData((prev) => ({ ...prev, content: visualEditorRef.current?.innerHTML || '' }));
        }
      }
      onShowToast('Đã chèn ảnh vào bài viết!', file.name, 'success');
    });
  };

  // Upload cover image
  const handleProcessCoverImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Tệp không hợp lệ', 'Vui lòng chọn file hình ảnh', 'warning');
      return;
    }
    compressImageFile(file, (optimizedUrl) => {
      setFormData((prev) => ({ ...prev, coverImage: optimizedUrl }));
      onShowToast('Đã cập nhật ảnh bìa!', file.name, 'success');
    });
  };

  // Insert image URL
  const handleInsertImageUrl = () => {
    const url = prompt('Nhập đường dẫn hình ảnh (URL):', 'https://images.unsplash.com/...');
    if (!url || !url.trim()) return;
    const caption = prompt('Nhập mô tả / chú thích ảnh (tùy chọn):', 'Ảnh minh họa bài viết') || 'Hình ảnh';
    if (editorTab === 'code') {
      insertAtCursorInCodeMode(`\n\n![${caption}](${url.trim()})\n\n`, '');
    } else {
      visualEditorRef.current?.focus();
      const imgHtml = `<figure class="my-5"><img src="${url.trim()}" alt="${caption}" class="rounded-2xl w-full max-h-[480px] object-cover shadow-md border border-slate-200" /><figcaption class="text-center text-xs text-slate-500 italic mt-2">📷 ${caption}</figcaption></figure><p><br></p>`;
      document.execCommand('insertHTML', false, imgHtml);
      if (visualEditorRef.current) {
        setFormData((prev) => ({ ...prev, content: visualEditorRef.current?.innerHTML || '' }));
      }
    }
  };

  // Drag & drop image
  const handleDropImage = (e: React.DragEvent) => {
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      e.preventDefault();
      handleProcessInArticleImage(file);
    }
  };

  // Paste image
  const handlePasteImage = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleProcessInArticleImage(file);
          break;
        }
      }
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalContent = editorTab === 'visual' && visualEditorRef.current
      ? visualEditorRef.current.innerHTML.trim()
      : (formData.content || '').trim();

    if (!formData.title?.trim() || !finalContent) {
      onShowToast('Vui lòng điền đủ thông tin', 'Tiêu đề và nội dung bài viết không được để trống.', 'warning');
      return;
    }

    const postToSave: BlogPost = {
      id: formData.id || `post-${Date.now()}`,
      title: formData.title.trim(),
      slug: formData.slug?.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      metaTitle: formData.metaTitle?.trim() || formData.title.trim(),
      metaDescription: formData.metaDescription?.trim() || formData.summary?.trim() || '',
      keywords: typeof formData.keywords === 'string'
        ? (formData.keywords as string).split(',').map((k: string) => k.trim()).filter(Boolean)
        : formData.keywords || [],
      coverImage: formData.coverImage?.trim() || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
      tag: formData.tag?.trim() || 'Cẩm nang',
      readTime: formData.readTime?.trim() || '5 phút đọc',
      isCloudCovered: Boolean(formData.isCloudCovered),
      cloudSecretLabel: formData.cloudSecretLabel?.trim() || '💎 BÍ KÍP ĐỘC QUYỀN',
      summary: formData.summary?.trim() || formData.title.trim(),
      content: finalContent,
      publishedAt: formData.publishedAt || new Date().toLocaleDateString('vi-VN'),
    };

    let updated: BlogPost[];
    if (isCreatingNew) {
      updated = [postToSave, ...posts];
    } else {
      updated = posts.map((p) => (p.id === postToSave.id ? postToSave : p));
    }

    setPosts(updated);
    saveStoredBlogPosts(updated);
    setEditingPost(null);
    setIsCreatingNew(false);
    onShowToast(
      isCreatingNew ? 'Đã thêm bài viết mới!' : 'Đã lưu bài viết thành công!',
      'Nội dung đã được cập nhật trực tiếp lên trang chủ KOCITY.',
      'success'
    );
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này khỏi cẩm nang?')) {
      const updated = posts.filter((p) => p.id !== postId);
      setPosts(updated);
      saveStoredBlogPosts(updated);
      onShowToast('Đã xóa bài viết', 'Danh sách đã được làm mới.', 'info');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Khôi phục lại 5 bài viết chuẩn SEO gốc theo tài liệu? Những thay đổi thủ công của bạn sẽ được thiết lập lại.')) {
      setPosts(INITIAL_BLOG_POSTS);
      saveStoredBlogPosts(INITIAL_BLOG_POSTS);
      onShowToast('Đã khôi phục 5 bài gốc!', 'Toàn bộ nội dung chuẩn SEO đã được khôi phục.', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={inArticleFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleProcessInArticleImage(file);
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={coverFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleProcessCoverImage(file);
          e.target.value = '';
        }}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-purple-500/30 px-2.5 py-1 text-xs font-bold text-purple-200 backdrop-blur-xs">
              CMS Cẩm Nang & SEO
            </span>
            <span className="text-xs text-purple-300">({posts.length} bài viết)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1 font-display">
            Quản Lý Bài Viết & Bí Kíp KOCity
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/90 mt-1 max-w-xl">
            Tự do thêm ảnh ở đầu, giữa bài, chỉnh phông chữ, cỡ chữ, màu sắc trực quan (như Word/Docs) và bật/tắt mây che úp mở ngoài trang chủ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer"
            title="Khôi phục lại 5 bài viết chuẩn SEO mặc định"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Khôi phục gốc</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-xs font-bold text-white shadow-lg hover:from-purple-600 hover:to-pink-600 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Thêm bài viết mới</span>
          </button>
        </div>
      </div>

      {/* Grid danh sách bài viết */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, idx) => (
          <div
            key={post.id}
            className={`flex flex-col justify-between rounded-2xl bg-white border p-4 shadow-xs transition-all hover:shadow-md ${
              post.isCloudCovered ? 'border-purple-300 ring-2 ring-purple-100' : 'border-slate-200'
            }`}
          >
            <div className="space-y-3">
              {/* Ảnh bìa */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-2 left-2 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                  {post.tag}
                </span>

                {post.isCloudCovered && (
                  <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-purple-900/90 px-2 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur-xs shadow-md">
                    <span>☁️</span>
                    <span>Đang bật Mây Che</span>
                  </span>
                )}
              </div>

              {/* Thông tin bài viết */}
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                  Bài {idx + 1} · {post.readTime}
                </span>
                <h3
                  className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-2"
                  title={post.title}
                  dangerouslySetInnerHTML={{ __html: post.title }}
                />
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                  {post.summary}
                </p>
              </div>

              {/* URL slug & keywords */}
              <div className="rounded-lg bg-slate-50 p-2 text-[11px] space-y-1 text-slate-600 border border-slate-100">
                <div className="flex items-center gap-1 truncate font-mono text-purple-700">
                  <span>🔗</span>
                  <span>/blog/{post.slug}</span>
                </div>
                {post.cloudSecretLabel && post.isCloudCovered && (
                  <div className="text-[10px] font-bold text-amber-700 truncate">
                    🏷️ Nhãn mây: {post.cloudSecretLabel}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleToggleCloud(post.id)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  post.isCloudCovered
                    ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title="Bật/Tắt hiệu ứng mây sương mù che úp mở bài viết này ngoài trang chủ"
              >
                <span>{post.isCloudCovered ? '☁️ Tắt mây' : '☁️ Bật mây che'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(post)}
                  className="rounded-lg bg-slate-100 p-1.5 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                  title="Chỉnh sửa nội dung và hình ảnh bài viết"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePost(post.id)}
                  className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition cursor-pointer"
                  title="Xóa bài viết này"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL SOẠN THẢO BÀI VIẾT WYSIWYG TRỰC QUAN */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/70">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-700">edit_document</span>
                <h3 className="font-bold text-slate-900 text-base">
                  {isCreatingNew ? 'Thêm Bài Viết SEO Mới' : 'Soạn Thảo Bài Viết Trực Quan'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
              {/* Tiêu đề & Slug */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tiêu đề bài viết (H1) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: TikTok Shop Affiliate là gì?..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-semibold focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL đề xuất (Slug)</label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="tiktok-shop-affiliate-la-gi"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 font-mono text-xs focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chủ đề / Thẻ Tag</label>
                  <input
                    type="text"
                    value={formData.tag || ''}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="Kiến thức nền tảng, Săn Job..."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Meta SEO info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={formData.metaTitle || ''}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="Tiêu đề hiển thị trên Google..."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Từ khóa chính / phụ (cách nhau bởi dấu phẩy)</label>
                  <input
                    type="text"
                    value={Array.isArray(formData.keywords) ? formData.keywords.join(', ') : formData.keywords || ''}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value as any })}
                    placeholder="tiktok shop affiliate, hoa hong koc, gmv..."
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Meta Description (Mô tả ngắn cho Google)</label>
                <textarea
                  rows={2}
                  value={formData.metaDescription || ''}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="Mô tả tóm tắt 1-2 câu xuất hiện dưới kết quả tìm kiếm Google..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-purple-600 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Ảnh bìa */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ảnh Bìa Bài Viết (Cover Image)</label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="url"
                    value={formData.coverImage || ''}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="Dán link ảnh https://... hoặc bấm nút bên phải để tải từ máy"
                    className="flex-1 min-w-[200px] rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-purple-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2.5 font-bold transition cursor-pointer"
                    title="Tải ảnh bìa từ máy tính"
                  >
                    <span className="material-symbols-outlined text-[17px] text-purple-600">upload_file</span>
                    <span>Tải ảnh bìa</span>
                  </button>
                  {formData.coverImage && (
                    <img
                      src={formData.coverImage}
                      alt="Preview"
                      className="h-10 w-16 rounded-lg object-cover border border-slate-200 shadow-2xs"
                    />
                  )}
                </div>
              </div>

              {/* Tùy chọn Mây Che Úp Mở ☁️ */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>☁️</span>
                      <span>Chế độ Phủ Mây Úp Mở (Curiosity Teaser)</span>
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bật tính năng này sẽ phủ một lớp mây pha lê che khuất một nửa bài viết ngoài trang chủ để kích thích KOC bấm vào đọc.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isCloudCovered)}
                      onChange={(e) => setFormData({ ...formData, isCloudCovered: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {formData.isCloudCovered && (
                  <div>
                    <label className="block font-bold text-purple-900 mb-1">Nhãn Huy Hiệu Bí Mật</label>
                    <input
                      type="text"
                      value={formData.cloudSecretLabel || ''}
                      onChange={(e) => setFormData({ ...formData, cloudSecretLabel: e.target.value })}
                      placeholder="Ví dụ: 💎 BÍ KÍP ĐỘC QUYỀN SĂN JOB HOA HỒNG CAO"
                      className="w-full rounded-xl border border-purple-300 bg-white p-2.5 text-slate-900 focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Tóm tắt */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Đoạn tóm tắt hiển thị trên Card bài viết</label>
                <textarea
                  rows={2}
                  value={formData.summary || ''}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Đoạn tóm tắt ngắn gọn 2-3 dòng..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-purple-600 focus:outline-none leading-relaxed"
                />
              </div>

              {/* KHUNG SOẠN THẢO TRỰC QUAN (WYSIWYG) & MINI STICKY TOOLBAR */}
              <div className="space-y-2 pt-2">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditorTab('visual')}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        editorTab === 'visual'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                      <span>Trực quan (Word/Docs)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditorTab('code')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        editorTab === 'code'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">code</span>
                      <span>Mã HTML</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        editorTab === 'preview'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">visibility</span>
                      <span>Xem trước (Live)</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    ✨ Bôi đen chữ & bấm màu để thấy chữ đổi màu trực tiếp
                  </span>
                </div>

                {editorTab === 'preview' ? (
                  /* LIVE PREVIEW */
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 max-h-[520px] overflow-y-auto space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                      <div className="border-b border-slate-100 pb-4">
                        <span className="rounded-full bg-violet-100 px-3 py-0.5 text-xs font-bold text-violet-700">
                          {formData.tag || 'Cẩm nang KOC'}
                        </span>
                        <h2
                          className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-display"
                          dangerouslySetInnerHTML={{ __html: formData.title || '(Chưa nhập tiêu đề bài viết)' }}
                        />
                        {formData.metaDescription && (
                          <p className="text-xs text-slate-500 italic mt-2 border-l-2 border-violet-500 pl-3">
                            {formData.metaDescription}
                          </p>
                        )}
                      </div>

                      {formData.coverImage && (
                        <div className="rounded-xl overflow-hidden max-h-[320px] shadow-sm">
                          <img
                            src={formData.coverImage}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <BlogContentRenderer content={formData.content || ''} />
                    </div>
                  </div>
                ) : (
                  /* EDIT MODE (VISUAL OR CODE) WITH MINI STICKY TOOLBAR */
                  <div className="space-y-2">
                    {/* MINI STICKY TOOLBAR */}
                    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/95 p-1.5 backdrop-blur-md shadow-2xs">
                      {/* Group 1: Ảnh */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => inArticleFileInputRef.current?.click()}
                          className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300 transition-colors shadow-2xs cursor-pointer"
                          title="Tải ảnh từ máy tính (nén nhẹ tự động)"
                        >
                          <span className="material-symbols-outlined text-[16px] text-violet-600">add_photo_alternate</span>
                          <span>Tải ảnh</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleInsertImageUrl}
                          className="rounded-lg bg-white border border-slate-200 p-1 text-slate-600 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300 transition-colors shadow-2xs cursor-pointer"
                          title="Chèn ảnh từ đường link URL"
                        >
                          <span className="material-symbols-outlined text-[16px]">link</span>
                        </button>
                      </div>

                      <span className="h-4 w-px bg-slate-200 mx-0.5"></span>

                      {/* Group 2: Phông chữ & Kích thước */}
                      <select
                        onChange={handleFontFamilyChange}
                        defaultValue=""
                        className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-violet-500 cursor-pointer shadow-2xs"
                        title="Đổi phông chữ cho đoạn bôi đen"
                      >
                        <option value="" disabled>Phông chữ</option>
                        <option value="sans-serif">Mặc định (Sans)</option>
                        <option value="Georgia, serif">Báo chí (Serif)</option>
                        <option value="'Plus Jakarta Sans', sans-serif">Tiêu đề (Display)</option>
                        <option value="monospace">Kịch bản (Mono)</option>
                      </select>

                      <select
                        onChange={handleFontSizeChange}
                        defaultValue=""
                        className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-violet-500 cursor-pointer shadow-2xs"
                        title="Đổi kích cỡ cho đoạn bôi đen"
                      >
                        <option value="" disabled>Cỡ chữ</option>
                        <option value="##">Tiêu đề lớn (H2)</option>
                        <option value="###">Đề mục vừa (H3)</option>
                        <option value="p">Đoạn văn (Chuẩn)</option>
                        <option value="1.125rem">Chữ to (18px)</option>
                        <option value="0.8125rem">Chữ nhỏ (13px)</option>
                      </select>

                      <span className="h-4 w-px bg-slate-200 mx-0.5"></span>

                      {/* Group 3: Định dạng cơ bản */}
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleExec('bold')}
                          className="h-7 w-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-800 hover:bg-slate-100 transition shadow-2xs cursor-pointer flex items-center justify-center text-xs"
                          title="In đậm (Bold)"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExec('italic')}
                          className="h-7 w-7 rounded-lg bg-white border border-slate-200 italic font-serif text-slate-800 hover:bg-slate-100 transition shadow-2xs cursor-pointer flex items-center justify-center text-xs"
                          title="In nghiêng (Italic)"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExec('underline')}
                          className="h-7 w-7 rounded-lg bg-white border border-slate-200 underline text-slate-800 hover:bg-slate-100 transition shadow-2xs cursor-pointer flex items-center justify-center text-xs"
                          title="Gạch chân (Underline)"
                        >
                          U
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExec('justifyCenter')}
                          className="h-7 w-7 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 transition shadow-2xs cursor-pointer flex items-center justify-center text-xs"
                          title="Căn giữa nội dung"
                        >
                          <span className="material-symbols-outlined text-[15px]">format_align_center</span>
                        </button>
                      </div>

                      <span className="h-4 w-px bg-slate-200 mx-0.5"></span>

                      {/* Group 4: 8 Chấm màu (Quick Color Dots) - Đổi màu trực quan ngay tại chỗ */}
                      <div className="flex items-center gap-1 px-1.5 bg-white border border-slate-200 rounded-lg h-7 shadow-2xs">
                        {COLOR_PALETTE.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => handleApplyColor(c.hex)}
                            className="h-3.5 w-3.5 rounded-full transition-transform hover:scale-135 cursor-pointer shadow-2xs border border-black/10 focus:outline-none"
                            style={{ backgroundColor: c.hex }}
                            title={`Đổi màu chữ: ${c.label}`}
                          />
                        ))}
                      </div>

                      <span className="h-4 w-px bg-slate-200 mx-0.5"></span>

                      {/* Group 5: Tiện ích bài viết */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleInsertTipBox}
                          className="inline-flex items-center gap-1 rounded-lg bg-violet-100 hover:bg-violet-200 text-violet-800 px-2 py-1 text-xs font-bold transition shadow-2xs cursor-pointer"
                          title="Chèn hộp lưu ý Bí kíp KOCity"
                        >
                          <span>💡</span>
                          <span className="hidden sm:inline">Hộp mẹo</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleInsertTable}
                          className="rounded-lg bg-white border border-slate-200 p-1 text-slate-700 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
                          title="Chèn bảng số liệu mẫu"
                        >
                          <span className="material-symbols-outlined text-[16px]">table</span>
                        </button>
                      </div>
                    </div>

                    {/* VÙNG SOẠN THẢO TRỰC QUAN (WYSIWYG) */}
                    {editorTab === 'visual' ? (
                      <div
                        ref={visualEditorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={() => {
                          if (visualEditorRef.current) {
                            setFormData((prev) => ({
                              ...prev,
                              content: visualEditorRef.current?.innerHTML || '',
                            }));
                          }
                        }}
                        onDrop={handleDropImage}
                        onPaste={handlePasteImage}
                        className="min-h-[350px] max-h-[550px] overflow-y-auto p-4 rounded-2xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-white font-sans text-sm text-slate-800 leading-relaxed shadow-inner"
                      />
                    ) : (
                      /* CHẾ ĐỘ MÃ HTML / CODE */
                      <textarea
                        ref={codeAreaRef}
                        rows={16}
                        required
                        value={formData.content || ''}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        onDrop={handleDropImage}
                        onPaste={handlePasteImage}
                        placeholder="Nhập hoặc dán mã HTML/Markdown vào đây..."
                        className="w-full rounded-2xl border border-slate-300 p-3.5 text-slate-900 font-mono text-xs focus:border-purple-600 focus:outline-none leading-relaxed transition-all"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2.5 font-bold text-white shadow-md hover:bg-purple-700 transition cursor-pointer"
                >
                  Lưu bài viết
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
