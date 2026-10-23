import React, { useState } from 'react';

interface BlogContentRendererProps {
  content: string;
  className?: string;
}

export const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({ content, className = '' }) => {
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null);

  if (!content) return null;

  // Helper to safely render inline HTML + markdown formatting
  const parseInlineFormatting = (text: string): string => {
    let html = text;

    // Convert bold **text** to strong
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');

    // Convert italic *text* to em
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Convert markdown links [text](url)
    html = html.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-violet-600 hover:text-violet-800 font-bold underline decoration-violet-300 transition-colors">$1</a>'
    );

    return html;
  };

  // Split into block elements by double newlines
  const blocks = content.split(/\n\n+/);

  return (
    <div className={`space-y-4 text-slate-700 leading-relaxed ${className}`}>
      {blocks.map((block, index) => {
        const text = block.trim();
        if (!text) return null;

        // 1. Markdown Image block: ![alt](url)
        const imageMatch = text.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imageMatch) {
          const alt = imageMatch[1] || 'Hình ảnh bài viết';
          const src = imageMatch[2];
          return (
            <figure key={index} className="my-6">
              <div
                onClick={() => setZoomImage({ src, alt })}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50 shadow-md cursor-zoom-in transition-all hover:shadow-xl hover:border-violet-300"
              >
                <img
                  src={src}
                  alt={alt}
                  className="w-full max-h-[520px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-xs px-3 py-1.5 font-bold shadow-md flex items-center gap-1.5">
                    <span>🔍</span> Phóng to ảnh
                  </span>
                </div>
              </div>
              {alt && (
                <figcaption className="text-center text-xs text-slate-500 italic mt-2.5 flex items-center justify-center gap-1">
                  <span className="text-violet-500">📷</span>
                  <span>{alt}</span>
                </figcaption>
              )}
            </figure>
          );
        }

        // 2. Callout / Bí kíp KOCity (Blockquote starting with >)
        if (text.startsWith('>')) {
          const cleanText = text.replace(/^>\s*/gm, '');
          const isTip = cleanText.includes('💡') || cleanText.toLowerCase().includes('bí kíp') || cleanText.toLowerCase().includes('mẹo');
          return (
            <div
              key={index}
              className={`my-5 rounded-2xl border p-4 sm:p-5 shadow-xs transition-all ${
                isTip
                  ? 'border-violet-300 bg-gradient-to-r from-violet-50/90 via-purple-50/60 to-pink-50/40'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl select-none leading-none mt-0.5">
                  {isTip ? '💡' : '📌'}
                </span>
                <div
                  className="flex-1 text-slate-800 text-sm sm:text-base leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: parseInlineFormatting(cleanText) }}
                />
              </div>
            </div>
          );
        }

        // 3. Headings
        if (text.startsWith('## ')) {
          const headingText = text.replace('## ', '');
          return (
            <h2
              key={index}
              className="text-xl sm:text-2xl font-black text-slate-950 mt-8 mb-3 font-display border-b border-slate-100 pb-2 flex items-center gap-2"
            >
              <span className="h-6 w-1 rounded-full bg-violet-600 inline-block shrink-0"></span>
              <span dangerouslySetInnerHTML={{ __html: parseInlineFormatting(headingText) }} />
            </h2>
          );
        }

        if (text.startsWith('### ')) {
          return (
            <h3
              key={index}
              className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-2 font-display text-violet-950"
              dangerouslySetInnerHTML={{ __html: parseInlineFormatting(text.replace('### ', '')) }}
            />
          );
        }

        if (text.startsWith('#### ')) {
          return (
            <h4
              key={index}
              className="text-base sm:text-lg font-bold text-violet-800 mt-4 mb-2"
              dangerouslySetInnerHTML={{ __html: parseInlineFormatting(text.replace('#### ', '')) }}
            />
          );
        }

        // 4. Bullet lists (* or -)
        if (text.startsWith('* ') || text.startsWith('- ')) {
          const items = text.split('\n').filter(Boolean);
          return (
            <ul key={index} className="list-disc pl-5 space-y-2 text-slate-700 my-3">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: parseInlineFormatting(item.replace(/^[*-]\s+/, '')) }}
                />
              ))}
            </ul>
          );
        }

        // 5. Numbered lists (1. 2. 3.)
        if (/^\d+\.\s+/.test(text)) {
          const items = text.split('\n').filter(Boolean);
          return (
            <ol key={index} className="list-decimal pl-5 space-y-2 text-slate-700 my-3">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: parseInlineFormatting(item.replace(/^\d+\.\s+/, '')) }}
                />
              ))}
            </ol>
          );
        }

        // 6. Tables (| col1 | col2 |)
        if (text.startsWith('|')) {
          const rows = text.split('\n').filter(Boolean);
          if (rows.length >= 2) {
            const headers = rows[0].split('|').map((c) => c.trim()).filter(Boolean);
            const bodyRows = rows.slice(2).map((r) => r.split('|').map((c) => c.trim()).filter(Boolean));

            return (
              <div key={index} className="overflow-x-auto my-5 rounded-2xl border border-slate-200 shadow-xs">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100/90 font-bold text-slate-800">
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i} className="px-4 py-3 font-bold text-slate-900">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {bodyRows.map((cols, i) => (
                      <tr key={i} className="hover:bg-violet-50/30 transition-colors">
                        {cols.map((c, j) => (
                          <td
                            key={j}
                            className="px-4 py-2.5 text-slate-700"
                            dangerouslySetInnerHTML={{ __html: parseInlineFormatting(c) }}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // 7. Horizontal Divider
        if (text.startsWith('---')) {
          return <hr key={index} className="my-6 border-slate-200" />;
        }

        // 8. Custom HTML or Standard paragraph
        return (
          <div
            key={index}
            className="leading-relaxed text-slate-700"
            dangerouslySetInnerHTML={{ __html: parseInlineFormatting(text) }}
          />
        );
      })}

      {/* Lightbox Modal phóng to ảnh */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={zoomImage.src}
              alt={zoomImage.alt}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            {zoomImage.alt && (
              <p className="mt-3 text-center text-sm text-white/90 font-medium bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-xs">
                {zoomImage.alt}
              </p>
            )}
            <button
              type="button"
              onClick={() => setZoomImage(null)}
              className="absolute -top-3 -right-3 rounded-full bg-white/90 p-2 text-slate-900 hover:bg-white shadow-lg transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
