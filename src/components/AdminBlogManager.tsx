import React, { useState } from 'react';
import { BlogPost, getStoredBlogPosts, saveStoredBlogPosts, INITIAL_BLOG_POSTS } from '../data/blogData';

interface AdminBlogManagerProps {
  onShowToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AdminBlogManager: React.FC<AdminBlogManagerProps> = ({ onShowToast }) => {
  const [posts, setPosts] = useState<BlogPost[]>(() => getStoredBlogPosts());
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<BlogPost>>({});

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsCreatingNew(false);
    setFormData({ ...post });
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

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.content?.trim()) {
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
      content: formData.content.trim(),
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
      onShowToast('Đã xóa bài viết!', 'Danh sách cẩm nang đã được cập nhật.', 'info');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Khôi phục 5 bài viết chuẩn SEO gốc từ tài liệu Google Docs? Các sửa đổi hiện tại sẽ được thay bằng dữ liệu chuẩn.')) {
      setPosts(INITIAL_BLOG_POSTS);
      saveStoredBlogPosts(INITIAL_BLOG_POSTS);
      onShowToast('Đã khôi phục 5 bài viết gốc!', 'Toàn bộ dữ liệu chuẩn SEO đã được thiết lập lại.', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600 text-2xl">menu_book</span>
            <h2 className="text-xl font-bold text-slate-900">Quản Lý Cẩm Nang & Bài Viết Chuẩn SEO</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chỉnh sửa 5 bài viết lên top Google, thay đổi ảnh bìa và cài đặt chế độ <strong>☁️ Mây che úp mở</strong> kích thích KOC khám phá.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title="Khôi phục lại 5 bài viết chuẩn SEO ban đầu"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Khôi phục bản gốc</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition cursor-pointer"
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
                <h3 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-2" title={post.title}>
                  {post.title}
                </h3>
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

      {/* MODAL SOẠN THẢO BÀI VIẾT */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            {/* Modal header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/70">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-700">edit_document</span>
                <h3 className="font-bold text-slate-900 text-base">
                  {isCreatingNew ? 'Thêm Bài Viết SEO Mới' : 'Chỉnh Sửa Bài Viết Cẩm Nang'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
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
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-purple-600 focus:outline-none"
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
                <label className="block font-bold text-slate-700 mb-1">Đường dẫn Ảnh Bìa (Cover Image URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.coverImage || ''}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-purple-600 focus:outline-none"
                  />
                  {formData.coverImage && (
                    <img
                      src={formData.coverImage}
                      alt="Preview"
                      className="h-10 w-16 rounded-lg object-cover border border-slate-200"
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

              {/* Nội dung chi tiết */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung chi tiết bài viết (Hỗ trợ tiêu đề ##, ###, danh sách gạch đầu dòng, bảng số liệu) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={10}
                  required
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Nhập hoặc dán toàn bộ nội dung bài viết vào đây..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 font-mono text-xs focus:border-purple-600 focus:outline-none leading-relaxed"
                />
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
