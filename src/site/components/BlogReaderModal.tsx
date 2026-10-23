import React, { useEffect } from 'react';
import { BlogPost } from '../../data/blogData';
import { Icon, Button } from '../ui';
import { BlogContentRenderer } from './BlogContentRenderer';

interface BlogReaderModalProps {
  post: BlogPost | null;
  onClose: () => void;
  onExploreCampaigns: () => void;
}

export const BlogReaderModal: React.FC<BlogReaderModalProps> = ({
  post,
  onClose,
  onExploreCampaigns,
}) => {
  useEffect(() => {
    if (!post) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [post]);

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 animate-fade-in">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[92vh] rounded-[28px] bg-white text-slate-900 shadow-2xl overflow-hidden border border-slate-100">
        {/* Top bar header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-2 min-w-0">
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">
              {post.tag}
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">{post.readTime}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
            title="Đóng bài viết"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Article scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-8 space-y-6">
          {/* Article Header */}
          <div className="space-y-3">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
              {post.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed italic border-l-2 border-violet-500 pl-3">
              {post.metaDescription}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span>Xuất bản: {post.publishedAt}</span>
              <span>•</span>
              <span>Tác giả: Đội ngũ Cố vấn KOCITY</span>
              {post.isCloudCovered && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-amber-700">
                  ✨ Nội dung đặc quyền đã mở khóa
                </span>
              )}
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-md">
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Article Body (Rich markdown & HTML parsed with lightbox zoom) */}
          <BlogContentRenderer content={post.content} />

          {/* Keywords & SEO Tags Footer */}
          <div className="pt-6 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Từ khóa liên quan:</span>
            <div className="flex flex-wrap gap-1.5">
              {post.keywords.map((kw) => (
                <span key={kw} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 font-medium">
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          {/* Call to action at bottom */}
          <div className="rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 p-6 text-white text-center shadow-xl space-y-3">
            <h4 className="text-lg sm:text-xl font-black font-display">
              Sẵn sàng nhận mẫu sản phẩm 0đ đầu tiên?
            </h4>
            <p className="text-xs sm:text-sm text-white/90 max-w-lg mx-auto leading-relaxed">
              KOCITY đồng hành cùng Nano & Micro KOC từ 1.000 Follower. Nhận mẫu tận nhà hoàn toàn miễn phí, hoa hồng minh bạch theo từng đơn.
            </p>
            <Button
              variant="primary"
              className="bg-white text-violet-700 hover:bg-slate-100 font-black rounded-full px-6 py-2.5 shadow-lg cursor-pointer"
              onClick={() => {
                onClose();
                onExploreCampaigns();
              }}
            >
              🚀 Khám phá chiến dịch nhận mẫu ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
