import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BlogPost, getStoredBlogPosts } from '../../data/blogData';
import { ROUTES, ZALO_GROUP_URL } from '../../lib/constants';
import { useAppData } from '../../state/AppDataContext';
import { useSiteUI } from '../SiteUI';
import { BlogContentRenderer } from '../components/BlogContentRenderer';
import { Button, EmptyState, Icon, cx } from '../ui';

export const BlogPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { currentUser, showToast } = useAppData();
  const { openAuth } = useSiteUI();

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => getStoredBlogPosts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [uncloudedPostIds, setUncloudedPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const onUpdate = () => setBlogPosts(getStoredBlogPosts());
    window.addEventListener('kocity-blog-updated', onUpdate);
    return () => window.removeEventListener('kocity-blog-updated', onUpdate);
  }, []);

  const activePost = useMemo(() => {
    if (!slug) return null;
    const decoded = decodeURIComponent(slug).trim().toLowerCase();
    return (
      blogPosts.find(
        (p) =>
          p.slug?.toLowerCase() === decoded ||
          p.id?.toLowerCase() === decoded
      ) || null
    );
  }, [slug, blogPosts]);

  // Cập nhật tiêu đề tab trình duyệt chuẩn SEO khi xem bài viết
  useEffect(() => {
    const prevTitle = document.title;
    if (activePost) {
      const cleanTitle = (activePost.metaTitle || activePost.title).replace(/<[^>]*>/g, '');
      document.title = `${cleanTitle} | KOCity`;
    } else {
      document.title = 'Cẩm nang KOC & Thông báo Kết quả Chiến dịch | KOCity';
    }
    return () => {
      document.title = prevTitle;
    };
  }, [activePost]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    blogPosts.forEach((p) => {
      if (p.tag) set.add(p.tag);
    });
    return ['all', ...Array.from(set)];
  }, [blogPosts]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return blogPosts.filter((p) => {
      if (selectedTag !== 'all' && p.tag !== selectedTag) return false;
      if (!q) return true;
      const haystack = `${p.title} ${p.summary} ${p.tag} ${(p.keywords || []).join(' ')}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [blogPosts, selectedTag, searchQuery]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(
        'Đã sao chép đường dẫn bài viết!',
        'Bạn có thể dán gửi trực tiếp vào nhóm Zalo hoặc Bio TikTok.',
        'success'
      );
    } catch {
      showToast('Không thể sao chép tự động', 'Vui lòng copy đường dẫn trên thanh địa chỉ trình duyệt.', 'warning');
    }
  };

  // ============================================================================
  // CHẾ ĐỘ 1: TRANG ĐÍCH CHI TIẾT BÀI VIẾT (/blog/:slug)
  // ============================================================================
  if (slug) {
    if (!activePost) {
      return (
        <div className="mx-auto max-w-xl px-4 py-16">
          <EmptyState
            icon="article"
            title="Không tìm thấy bài viết"
            description="Bài viết này có thể đã được cập nhật đường dẫn mới hoặc không còn tồn tại."
            action={
              <Button variant="dark" onClick={() => navigate(ROUTES.blog)}>
                Xem tất cả bài viết Cẩm nang
              </Button>
            }
          />
        </div>
      );
    }

    const relatedPosts = blogPosts.filter((p) => p.id !== activePost.id).slice(0, 3);

    return (
      <div className="min-h-screen bg-slate-50/60 pb-16 pt-6 sm:pt-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Thanh điều hướng Breadcrumb + Nút Chia sẻ Link */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Link to={ROUTES.home} className="hover:text-[#7c3aed] transition-colors">
                Trang chủ
              </Link>
              <Icon name="chevron_right" className="text-[15px] text-slate-400" />
              <Link to={ROUTES.blog} className="hover:text-[#7c3aed] transition-colors">
                Cẩm nang & Kết quả KOC
              </Link>
              <Icon name="chevron_right" className="text-[15px] text-slate-400" />
              <span className="max-w-[180px] sm:max-w-xs truncate text-slate-800 font-semibold">
                {activePost.tag}
              </span>
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(ROUTES.blog)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs ring-1 ring-slate-200/80 hover:bg-slate-50 transition cursor-pointer"
              >
                <Icon name="arrow_back" className="text-[15px]" />
                <span>Tất cả bài viết</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-violet-500/20 hover:bg-violet-700 active:scale-95 transition cursor-pointer"
              >
                <Icon name="share" className="text-[15px]" />
                <span>Sao chép link bài viết</span>
              </button>
            </div>
          </div>

          {/* Khung bài viết chính (Rộng rãi chuẩn trang đích để hiển thị bảng 68 KOC mượt mà) */}
          <article className="overflow-hidden rounded-[28px] sm:rounded-[32px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/70">
            {/* Ảnh bìa lớn */}
            {activePost.coverImage && (
              <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-slate-900">
                <img
                  src={activePost.coverImage}
                  alt={activePost.title.replace(/<[^>]*>/g, '')}
                  className="h-full w-full object-cover opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-7 sm:left-8 sm:right-8 flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full bg-gradient-to-r from-[#7c3aed] to-[#ec4899] px-3.5 py-1 text-xs font-bold text-white shadow-md">
                    {activePost.tag}
                  </span>
                  <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white/95 backdrop-blur-md">
                    ⏱️ {activePost.readTime}
                  </span>
                  <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white/95 backdrop-blur-md">
                    📅 Xuất bản: {activePost.publishedAt}
                  </span>
                </div>
              </div>
            )}

            <div className="px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
              {/* Tiêu đề H1 & Mô tả */}
              <header className="border-b border-slate-100 pb-6 mb-6">
                <h1
                  className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 leading-tight"
                  dangerouslySetInnerHTML={{ __html: activePost.title }}
                />
                {activePost.metaDescription && (
                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed border-l-4 border-[#7c3aed] bg-violet-50/50 py-2.5 pl-4 pr-3 rounded-r-xl">
                    {activePost.metaDescription}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#ec4899] text-white font-bold text-[11px]">
                      KC
                    </span>
                    <span className="font-semibold text-slate-700">Ban Quản Trị & Đội ngũ Cố vấn KOCity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={ZALO_GROUP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
                    >
                      <span>💬</span> Hỗ trợ KOC qua Zalo
                    </a>
                  </div>
                </div>
              </header>

              {/* Nội dung chi tiết bài viết (Tự động kích hoạt thanh tìm kiếm KOC nếu có bảng danh sách) */}
              <BlogContentRenderer content={activePost.content} />

              {/* Từ khóa SEO */}
              {activePost.keywords && activePost.keywords.length > 0 && (
                <div className="mt-10 pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                    Từ khóa chủ đề:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activePost.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs text-slate-600 font-medium"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Khối kêu gọi hành động (CTA) cuối bài */}
              <div className="mt-10 rounded-3xl bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#ec4899] p-6 sm:p-8 text-white text-center shadow-xl space-y-4">
                <h3 className="text-xl sm:text-2xl font-black font-display">
                  Sẵn sàng nhận mẫu sản phẩm 0đ tiếp theo trên KOCity?
                </h3>
                <p className="text-xs sm:text-sm text-white/90 max-w-xl mx-auto leading-relaxed">
                  KOCity đồng hành cùng Nano & Micro KOC từ 1.000 Followers. Nhận sản phẩm chính hãng hoàn toàn miễn phí tận nhà, hoa hồng Affiliate minh bạch trên từng đơn hàng.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <Button
                    variant="primary"
                    className="bg-white text-violet-700 hover:bg-slate-100 font-black rounded-full px-6 py-2.5 shadow-lg cursor-pointer"
                    onClick={() => navigate(`${ROUTES.home}#mau-dang-mo`)}
                  >
                    🚀 Khám phá chiến dịch 0đ đang mở
                  </Button>
                  <a
                    href={ZALO_GROUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-5 py-2.5 text-xs sm:text-sm font-bold text-white ring-1 ring-white/40 hover:bg-white/25 transition"
                  >
                    <span>💬</span> Tham gia Nhóm Zalo KOC
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* Bài viết liên quan */}
          {relatedPosts.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900">
                  Bài viết & Cẩm nang khác dành cho bạn
                </h2>
                <Link
                  to={ROUTES.blog}
                  className="text-xs sm:text-sm font-bold text-[#7c3aed] hover:underline"
                >
                  Xem tất cả →
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={ROUTES.blogPost(post.slug)}
                    className="card-fx group flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg transition-all"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      <img
                        src={post.coverImage}
                        alt={post.title.replace(/<[^>]*>/g, '')}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-slate-800 backdrop-blur-md">
                        {post.tag}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3
                        className="font-display text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#7c3aed] transition line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: post.title }}
                      />
                      <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{post.summary}</p>
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#7c3aed]">
                        <span>Đọc bài viết →</span>
                        <span className="text-[11px] font-normal text-slate-400">{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // CHẾ ĐỘ 2: TRANG HUB DANH SÁCH BÀI VIẾT & CẨM NANG KOC (/blog)
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 pt-8 sm:pt-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Phần tiêu đề đầu trang (Hero Header) */}
        <div className="rounded-[28px] sm:rounded-[36px] bg-gradient-to-br from-[#1e1b4b] via-[#3b0764] to-[#701a75] p-6 sm:p-10 text-white shadow-xl">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold text-pink-200 backdrop-blur-md ring-1 ring-white/20">
              <Icon name="menu_book" className="text-[15px]" /> Chuyên trang Cẩm nang Creator & Công bố Kết quả
            </span>
            <h1 className="mt-3 font-display text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Cẩm nang KOC & Thông báo Danh sách Nhận Mẫu 0đ
            </h1>
            <p className="mt-2.5 text-xs sm:text-base text-violet-100/90 leading-relaxed">
              Tra cứu kết quả duyệt mẫu 0đ các chiến dịch mới nhất, đồng thời bỏ túi trọn bộ bí kíp xây kênh TikTok Affiliate và kịch bản săn hoa hồng cao từ đội ngũ cố vấn KOCity.
            </p>
          </div>

          {/* Thanh tìm kiếm bài viết & Bộ lọc chuyên mục */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Icon
                name="search"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-slate-400"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài viết, chiến dịch Cỏ Mềm, bí kíp Affiliate..."
                className="h-11 w-full rounded-2xl bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTag(t)}
                  className={cx(
                    'shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition cursor-pointer',
                    selectedTag === t
                      ? 'bg-white text-slate-950 shadow-md'
                      : 'bg-white/10 text-white/85 hover:bg-white/20'
                  )}
                >
                  {t === 'all' ? 'Tất cả bài viết' : t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lưới danh sách bài viết */}
        {filteredPosts.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              icon="search_off"
              title="Không tìm thấy bài viết phù hợp"
              description="Hãy thử từ khóa khác hoặc chọn xem Tất cả bài viết."
              action={
                <Button
                  variant="dark"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag('all');
                  }}
                >
                  Xem tất cả bài viết
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => {
              const isTeaser = post.isCloudCovered && !uncloudedPostIds.has(post.id);

              return (
                <article
                  key={post.id}
                  onClick={() => {
                    if (isTeaser) {
                      setUncloudedPostIds((prev) => new Set([...prev, post.id]));
                    }
                    navigate(ROUTES.blogPost(post.slug));
                  }}
                  className="card-fx group relative flex flex-col justify-between overflow-hidden rounded-[26px] bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                >
                  {/* Ảnh bìa */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    <img
                      src={post.coverImage}
                      alt={post.title.replace(/<[^>]*>/g, '')}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-800 backdrop-blur-md shadow-sm">
                      {post.tag}
                    </span>
                    <span className="absolute bottom-3 left-3 text-[11px] font-medium text-white/90">
                      ⏱️ {post.readTime}
                    </span>
                  </div>

                  {/* Nội dung tóm tắt */}
                  <div className="relative flex flex-1 flex-col p-5">
                    <h2
                      className="font-display text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#7c3aed] transition line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: post.title }}
                    />
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
                      {post.summary}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-[#7c3aed]">
                      <span>Mở trang bài viết →</span>
                      <span className="text-[11px] font-normal text-slate-400">{post.publishedAt}</span>
                    </div>
                  </div>

                  {/* Lớp mây pha lê che úp mở (Curiosity Cloud Teaser) */}
                  {isTeaser && (
                    <div
                      className="absolute inset-0 z-20 flex flex-col items-center justify-end p-5 text-center bg-gradient-to-t from-slate-950/95 via-violet-950/75 to-slate-900/35 backdrop-blur-[6px] animate-cloud-drift select-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUncloudedPostIds((prev) => new Set([...prev, post.id]));
                        navigate(ROUTES.blogPost(post.slug));
                      }}
                    >
                      <div className="mb-2 flex items-center justify-center h-12 w-12 rounded-full bg-violet-600/30 border border-violet-400/50 shadow-lg shadow-violet-500/30 backdrop-blur-md text-2xl animate-pulse">
                        ☁️
                      </div>
                      <span className="rounded-full bg-gradient-to-r from-amber-400 to-pink-500 px-3 py-1 text-[11px] font-black tracking-wide text-slate-950 shadow-md">
                        {post.cloudSecretLabel || '💎 BÍ KÍP ĐỘC QUYỀN'}
                      </span>
                      <p className="mt-2 text-xs font-semibold text-white/95 max-w-[240px] leading-snug drop-shadow-md">
                        Nội dung chứa bí mật hoa hồng cao & hồ sơ VIP. Chạm để mở!
                      </p>
                      <button
                        type="button"
                        className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-black text-violet-800 shadow-xl hover:bg-violet-50 active:scale-95 transition cursor-pointer"
                      >
                        <span>✨</span>
                        <span>Xua tan mây & Khám phá</span>
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

