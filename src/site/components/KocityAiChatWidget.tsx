import React, { useState, useEffect, useRef } from 'react';
import { Icon, cx } from '../ui';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  '🎁 Điều kiện nhận mẫu 0đ?',
  '🎬 Gợi ý kịch bản TikTok 60s',
  '⏰ Hạn nộp video là bao lâu?',
  '💰 Cách nhận hoa hồng affiliate?',
];

// Trả lời thông minh tự động (Fallback khi chưa nối n8n URL hoặc test local)
const getOfflineFallbackReply = (query: string): string => {
  const lower = query.toLowerCase();

  if (lower.includes('điều kiện') || lower.includes('nhận mẫu') || lower.includes('ai có thể')) {
    return `**Điều kiện nhận mẫu 0đ tại KOCity:**\n\n` +
      `1. **Kênh TikTok:** Dành cho cả **Nano & Micro KOC** (từ 500 – 1.000 followers trở lên có video sáng tạo nội dung đều đặn).\n` +
      `2. **Chi phí:** Nhận mẫu **0đ 100% miễn phí** (Freeship tận nhà).\n` +
      `3. **Cam kết:** Nộp video review gắn link giỏ hàng trong vòng **5 – 7 ngày** kể từ khi nhận sản phẩm.\n\n` +
      `👉 *Bạn chỉ cần chọn chiến dịch trên trang chủ và bấm "Đăng ký nhận mẫu" nhé!*`;
  }

  if (lower.includes('kịch bản') || lower.includes('tiktok') || lower.includes('script') || lower.includes('quay')) {
    return `🎬 **Khung Kịch Bản Video TikTok 60s Chuẩn Viral & Ra Đơn:**\n\n` +
      `• **0 – 3s (Hook giật tít):** *"Đừng mua món này nếu bạn chưa biết điều này..."* hoặc *"Đây là lý do đồ này đang cháy hàng TikTok!"*\n` +
      `• **4 – 40s (Trải nghiệm thực tế):** Review 2–3 ưu điểm nổi bật (USP), quay cận chất liệu/chất kem, chia sẻ cảm nhận chân thật, tránh đọc quảng cáo sáo rỗng.\n` +
      `• **41 – 60s (Call To Action - Kêu gọi mua):** *"Mẫu này đang được trợ giá cực hời, mọi người bấm ngay góc trái giỏ hàng màu vàng kẻo hết nhé!"*`;
  }

  if (lower.includes('hạn') || lower.includes('thời hạn') || lower.includes('bao lâu') || lower.includes('mấy ngày')) {
    return `⏰ **Thời hạn nộp video:**\n\n` +
      `• Hạn chót là **5 – 7 ngày** kể từ ngày bưu tá giao hàng thành công.\n` +
      `• Khi nộp video, bạn vào mục **"Đơn của tôi"** ➔ Dán link video TikTok đã đăng công khai để Admin duyệt.\n` +
      `• Trả video đúng hạn giúp bạn giữ điểm uy tín cao và được ưu tiên duyệt các job lớn tiếp theo!`;
  }

  if (lower.includes('hoa hồng') || lower.includes('tiền') || lower.includes('affiliate') || lower.includes('rút')) {
    return `💰 **Chính sách hoa hồng KOCity:**\n\n` +
      `• Bạn nhận được **Hoa hồng Affiliate TikTok Shop** trực tiếp từ giỏ hàng (từ 10% - 25% tùy chiến dịch).\n` +
      `• Ngoài ra, nhiều chiến dịch có thêm **Thưởng nóng (Booking bonus)** khi video đạt mốc view hoặc doanh số ấn tượng!\n` +
      `• Tiền hoa hồng được TikTok quyết toán tự động về tài khoản ngân hàng của bạn.`;
  }

  return `Chào bạn! Mình là **Trợ lý AI KOCity** (Powered by Gemini & n8n).\n\n` +
    `Mình có thể hỗ trợ bạn:\n` +
    `• Hướng dẫn quy trình nhận mẫu 0đ và duyệt đơn.\n` +
    `• Lên ý tưởng & kịch bản video TikTok 60s bắt trend.\n` +
    `• Giải đáp chính sách hoa hồng, hạn nộp video.\n\n` +
    `Bạn có câu hỏi cụ thể nào cho chiến dịch bạn đang quan tâm không? ✨`;
};

export const KocityAiChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = sessionStorage.getItem('kocity_ai_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'welcome',
        sender: 'assistant',
        text: 'Xin chào! Mình là **Trợ lý AI KOCity**. Bạn cần hỗ trợ nhận mẫu 0đ hay gợi ý kịch bản video TikTok hôm nay?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lưu lịch sử vào sessionStorage
  useEffect(() => {
    sessionStorage.setItem('kocity_ai_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const DEFAULT_N8N_URL = 'https://kocity-n8n.onrender.com/webhook/kocity-ai-chat';
      const envChatUrl = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL;
      const webhookUrl = (!envChatUrl || envChatUrl.includes('thanhloc.app.n8n.cloud') || envChatUrl.includes('localhost'))
        ? DEFAULT_N8N_URL
        : envChatUrl;

      let sessionId = sessionStorage.getItem('kocity_ai_session_id');
      if (!sessionId) {
        sessionId = `session-${Date.now()}`;
        sessionStorage.setItem('kocity_ai_session_id', sessionId);
      }

      let replyText = '';

      if (webhookUrl && webhookUrl.startsWith('http')) {
        // Gọi Webhook n8n thật nếu đã cấu hình
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            sessionId,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          replyText = data.reply || data.output || data.text || 'Đã nhận được phản hồi từ AI.';
        } else {
          replyText = getOfflineFallbackReply(query);
        }
      } else {
        // Mô phỏng độ trễ suy nghĩ của AI (400ms)
        await new Promise((r) => setTimeout(r, 450));
        replyText = getOfflineFallbackReply(query);
      }

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: getOfflineFallbackReply(query),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const welcome: ChatMessage = {
      id: 'welcome',
      sender: 'assistant',
      text: 'Cuộc trò chuyện mới đã bắt đầu. Bạn muốn mình giải đáp điều gì nè?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcome]);
  };

  return (
    <>
      {/* NÚT TRÒ CHUYỆN AI NỔI (Bên cạnh Zalo trên Desktop, xếp trên Zalo trên Mobile) */}
      <div
        className={cx(
          'fixed z-40 select-none transition-all duration-300',
          'right-4 bottom-[calc(9.75rem+env(safe-area-inset-bottom))]',
          'md:bottom-6 md:right-24'
        )}
      >
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 text-white shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-108 hover:shadow-violet-500/50 active:scale-95 cursor-pointer ring-2 ring-white/40"
            title="Chat với Trợ lý AI KOCity (Gemini)"
          >
            {/* Vòng hào quang lấp lánh */}
            <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 opacity-40 blur-sm group-hover:opacity-80 transition duration-300 animate-pulse" />
            <Icon name="smart_toy" className="relative text-[26px]" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
          </button>
        )}
      </div>

      {/* CỬA SỔ HỘP THOẠI CHATBOT */}
      {isOpen && (
        <aside
          aria-label="Cửa sổ Trợ lý AI KOCity"
          className="fixed bottom-4 right-4 z-50 flex h-[580px] max-h-[85vh] w-[92vw] max-w-[390px] flex-col overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl shadow-violet-950/60 ring-1 ring-white/15 backdrop-blur-xl animate-welcome-pop"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-violet-900/60 via-slate-900 to-indigo-950/60 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-md shadow-violet-500/30">
                <Icon name="auto_awesome" className="text-[20px] text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  KOCity AI Assistant
                  <span className="rounded-full bg-violet-500/30 px-1.5 py-0.2 text-[9px] font-semibold text-violet-300 ring-1 ring-violet-400/40">
                    Gemini
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Trợ lý KOC & Sáng tạo kịch bản 24/7</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                title="Làm mới cuộc trò chuyện"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <Icon name="refresh" className="text-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng cửa sổ"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
          </div>

          {/* TIN NHẮN CUỘC TRÒ CHUYỆN */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-white/10 text-sm">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className={cx('flex flex-col', isUser ? 'items-end' : 'items-start')}>
                  <div
                    className={cx(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-[13px]',
                      isUser
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-xs shadow-md shadow-violet-600/20'
                        : 'bg-slate-900/90 text-slate-200 border border-white/10 rounded-bl-xs'
                    )}
                  >
                    {/* Render format dòng đơn giản cho AI message */}
                    <div className="whitespace-pre-wrap space-y-1">
                      {m.text.split('\n').map((line, idx) => {
                        // In đậm nếu có **
                        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return (
                          <p
                            key={idx}
                            dangerouslySetInnerHTML={{ __html: formatted }}
                            className="min-h-[1.1rem]"
                          />
                        );
                      })}
                    </div>
                  </div>
                  <span className="mt-1 text-[10px] text-slate-500 px-1">{m.time}</span>
                </div>
              );
            })}

            {/* Indicator khi AI đang phản hồi */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-1 rounded-2xl bg-slate-900 border border-white/10 px-3.5 py-2 text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs ml-1.5 text-slate-400">Gemini đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* GỢI Ý CÂU HỎI NHANH (QUICK CHIPS) */}
          <div className="flex gap-1.5 overflow-x-auto px-3.5 py-2 border-t border-white/5 bg-slate-900/60 no-scrollbar">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap rounded-full bg-white/5 hover:bg-violet-600/20 hover:border-violet-500/40 border border-white/10 px-2.5 py-1 text-[11px] text-slate-300 hover:text-violet-200 transition cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* KHUNG NHẬP TIN NHẮN */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-white/10 bg-slate-950 p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi hoặc yêu cầu kịch bản..."
              disabled={isLoading}
              className="flex-1 rounded-xl bg-slate-900/90 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
            >
              <Icon name="send" className="text-[18px]" />
            </button>
          </form>
        </aside>
      )}
    </>
  );
};
