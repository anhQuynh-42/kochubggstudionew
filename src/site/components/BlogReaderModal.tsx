import React, { useEffect } from 'react';
import { BlogPost } from '../../data/blogData';
import { Icon, Button } from '../ui';

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

          {/* Article Body (Markdown parsed as styled blocks) */}
          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
            {post.content.split('\n\n').map((paragraph, index) => {
              const text = paragraph.trim();
              if (!text) return null;

              if (text.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-xl sm:text-2xl font-black text-slate-950 mt-8 mb-3 font-display border-b border-slate-100 pb-2">
                    {text.replace('## ', '')}
                  </h2>
                );
              }

              if (text.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-2 font-display">
                    {text.replace('### ', '')}
                  </h3>
                );
              }

              if (text.startsWith('#### ')) {
                return (
                  <h4 key={index} className="text-base sm:text-lg font-bold text-violet-800 mt-4 mb-2">
                    {text.replace('#### ', '')}
                  </h4>
                );
              }

              if (text.startsWith('* ') || text.startsWith('- ')) {
                const items = text.split('\n').filter(Boolean);
                return (
                  <ul key={index} className="list-disc pl-5 space-y-1.5 text-slate-700 my-3">
                    {items.map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        {item.replace(/^[*-]\s+/, '')}
                      </li>
                    ))}
                  </ul>
                );
              }

              if (text.startsWith('1. ') || text.startsWith('2. ') || text.startsWith('3. ')) {
                const items = text.split('\n').filter(Boolean);
                return (
                  <ol key={index} className="list-decimal pl-5 space-y-1.5 text-slate-700 my-3">
                    {items.map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        {item.replace(/^\d+\.\s+/, '')}
                      </li>
                    ))}
                  </ol>
                );
              }

              if (text.startsWith('|')) {
                const rows = text.split('\n').filter(Boolean);
                if (rows.length < 2) return null;
                const headers = rows[0].split('|').map((c) => c.trim()).filter(Boolean);
                const bodyRows = rows.slice(2).map((r) => r.split('|').map((c) => c.trim()).filter(Boolean));

                return (
                  <div key={index} className="overflow-x-auto my-4 rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 font-bold text-slate-800">
                        <tr>
                          {headers.map((h, i) => (
                            <th key={i} className="px-4 py-2.5 font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {bodyRows.map((cols, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            {cols.map((c, j) => (
                              <td key={j} className="px-4 py-2 text-slate-600">{c}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              if (text.startsWith('---')) {
                return <hr key={index} className="my-6 border-slate-200" />;
              }

              return (
                <p key={index} className="leading-relaxed text-slate-700">
                  {text}
                </p>
              );
            })}
          </div>

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
