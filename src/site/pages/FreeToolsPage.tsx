import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/constants';
import { Badge, Button, Icon, cx } from '../ui';
import { copyTextToClipboard } from '../../lib/clipboard';

type ToolTab = 'affiliate' | 'booking';

export const FreeToolsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ToolTab>('affiliate');
  const [copied, setCopied] = useState(false);

  // --- State Tool 1: Tính hoa hồng TikTok Affiliate ---
  const [views, setViews] = useState<number>(50000);
  const [productPrice, setProductPrice] = useState<number>(220000);
  const [commissionRate, setCommissionRate] = useState<number>(15);
  const [ctrPercent, setCtrPercent] = useState<number>(2.0); // 2% người xem click vào link giỏ hàng

  // Tính toán hoa hồng
  const affiliateResults = useMemo(() => {
    // Ước tính lượt click giỏ hàng
    const cartClicks = Math.round(views * (ctrPercent / 100));
    // Ước tính tỷ lệ mua hàng từ click (trung bình TikTok Shop VN ~ 3.5% - 5%)
    const conversionRate = 0.04;
    const estimatedOrders = Math.max(1, Math.round(cartClicks * conversionRate));
    const totalGmv = estimatedOrders * productPrice;
    const netCommission = Math.round(totalGmv * (commissionRate / 100));

    return {
      cartClicks,
      estimatedOrders,
      totalGmv,
      netCommission,
    };
  }, [views, productPrice, commissionRate, ctrPercent]);

  // --- State Tool 2: Định giá Booking Video KOC ---
  const [followers, setFollowers] = useState<number>(15000);
  const [avgViews, setAvgViews] = useState<number>(6000);
  const [niche, setNiche] = useState<'beauty' | 'fashion' | 'tech' | 'food'>('beauty');

  // Tính toán mức giá Booking đề xuất
  const bookingResults = useMemo(() => {
    const nicheMultiplier = {
      beauty: 1.25,
      tech: 1.15,
      fashion: 1.05,
      food: 0.95,
    }[niche];

    // Trọng số: 75% theo lượt view thực tế, 25% theo followers
    const viewBase = Math.max(avgViews * 0.09, 350000);
    const followerWeight = followers * 0.02;
    const basePrice = (viewBase * 0.75 + followerWeight * 0.25) * nicheMultiplier;

    // Làm tròn đến 50.000đ
    const minPrice = Math.round((basePrice * 0.85) / 50000) * 50000;
    const maxPrice = Math.round((basePrice * 1.35) / 50000) * 50000;
    const livePrice = Math.round((minPrice * 1.8) / 50000) * 50000;

    return {
      minPrice,
      maxPrice,
      livePrice,
    };
  }, [followers, avgViews, niche]);

  const handleCopyResult = async (text: string) => {
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Header Banner */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3.5 py-1 text-xs font-bold text-violet-700 ring-1 ring-violet-200/80 mb-3">
          <Icon name="bolt" className="text-[16px] text-amber-500" />
          <span>Bộ Tiện Ích Miễn Phí Cho KOC TikTok</span>
        </div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-4xl">
          Công Cụ <span className="text-[#7c3aed]">Định Giá & Tính Hoa Hồng</span> KOC
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
          Dành riêng cho Nano & Micro Creator: Tính toán thu nhập tiềm năng và định giá kênh chuyên nghiệp trước khi hợp tác với nhãn hàng.
        </p>
      </div>

      {/* Tabs Chuyển Công Cụ */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 ring-1 ring-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('affiliate')}
            className={cx(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer',
              activeTab === 'affiliate'
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Icon name="calculate" className="text-[18px]" />
            <span>Tính Hoa Hồng TikTok Shop</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('booking')}
            className={cx(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer',
              activeTab === 'booking'
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Icon name="sell" className="text-[18px]" />
            <span>Định Giá Video Booking</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BẢNG TÍNH HOA HỒNG TIKTOK SHOP */}
      {activeTab === 'affiliate' && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Cột Trái: Bộ điều khiển nhập liệu */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 space-y-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Icon name="tune" className="text-violet-600" />
              <span>Nhập thông số dự kiến</span>
            </h2>

            {/* Slider Lượt Xem */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Lượt xem video dự kiến (Views)</label>
                <span className="font-mono font-bold text-violet-700 text-sm">{views.toLocaleString()} views</span>
              </div>
              <input
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={views}
                onChange={(e) => setViews(Number(e.target.value))}
                className="w-full accent-[#7c3aed] cursor-pointer"
              />
              <div className="flex gap-2 mt-2">
                {[10000, 30000, 50000, 100000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setViews(v)}
                    className={cx(
                      'rounded-lg px-2 py-1 text-[11px] font-medium border cursor-pointer',
                      views === v ? 'bg-violet-50 text-violet-700 border-violet-300 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200'
                    )}
                  >
                    {(v / 1000)}k views
                  </button>
                ))}
              </div>
            </div>

            {/* Giá sản phẩm trung bình */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Giá bán sản phẩm mẫu</label>
                <span className="font-mono font-bold text-slate-900 text-sm">{formatVND(productPrice)}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="1000000"
                step="20000"
                value={productPrice}
                onChange={(e) => setProductPrice(Number(e.target.value))}
                className="w-full accent-[#7c3aed] cursor-pointer"
              />
              <div className="flex gap-2 mt-2">
                {[150000, 220000, 350000, 500000].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProductPrice(p)}
                    className={cx(
                      'rounded-lg px-2 py-1 text-[11px] font-medium border cursor-pointer',
                      productPrice === p ? 'bg-violet-50 text-violet-700 border-violet-300 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200'
                    )}
                  >
                    {p.toLocaleString()}đ
                  </button>
                ))}
              </div>
            </div>

            {/* Tỷ lệ hoa hồng */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Tỷ lệ hoa hồng (%)</label>
                <span className="font-mono font-bold text-emerald-600 text-sm">{commissionRate}%</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 15, 20, 25].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setCommissionRate(rate)}
                    className={cx(
                      'rounded-xl py-2 text-xs font-bold border transition-all cursor-pointer',
                      commissionRate === rate
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-400 ring-2 ring-emerald-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cột Phải: Bảng kết quả & Cầu nối nhận mẫu KOCity */}
          <div className="space-y-5">
            <div className="rounded-3xl bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-200">Ước tính thu nhập</span>
                <Badge tone="emerald" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                  Dựa trên thuật toán TikTok Shop
                </Badge>
              </div>

              <div className="mt-4">
                <p className="text-xs text-violet-300">Hoa hồng KOC thực nhận (Net):</p>
                <p className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-1">
                  {formatVND(affiliateResults.netCommission)}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs text-violet-300">Ước tính số đơn:</p>
                  <p className="font-mono font-bold text-lg text-white mt-0.5">~{affiliateResults.estimatedOrders} đơn hàng</p>
                </div>
                <div>
                  <p className="text-xs text-violet-300">Tổng doanh số GMV:</p>
                  <p className="font-mono font-bold text-lg text-white mt-0.5">{formatVND(affiliateResults.totalGmv)}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleCopyResult(
                    `📊 Dự toán thu nhập TikTok Affiliate:\n• Lượt xem: ${views.toLocaleString()}\n• Ước tính: ${affiliateResults.estimatedOrders} đơn hàng\n• Doanh số GMV: ${formatVND(affiliateResults.totalGmv)}\n• Hoa hồng nhận về: ${formatVND(affiliateResults.netCommission)}\n(Tính bằng công cụ KOCity - kocity.io.vn)`
                  )
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer backdrop-blur-md"
              >
                <Icon name={copied ? 'check' : 'content_copy'} className="text-[16px]" />
                <span>{copied ? 'Đã sao chép báo cáo!' : 'Sao chép kết quả'}</span>
              </button>
            </div>

            {/* Conversion Bridge: Kích thích KOC nhận mẫu 0đ ngay */}
            <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-violet-500/10 to-transparent p-5 border border-amber-200/60">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                  <Icon name="card_giftcard" className="text-[20px]" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Bắt đầu kiếm hoa hồng ngay hôm nay!</h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Bạn không cần bỏ vốn mua hàng. KOCity đang có các chiến dịch <b>Mẫu thử 0đ từ Cỏ Mềm</b> tài trợ hoàn toàn sản phẩm và phí giao hàng.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-3.5 shadow-md shadow-violet-500/20"
                    onClick={() => navigate(ROUTES.home)}
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <span>Xem & nhận mẫu 0đ ngay</span>
                      <Icon name="arrow_forward" className="text-[14px]" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ĐỊNH GIÁ BOOKING VIDEO KOC */}
      {activeTab === 'booking' && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Cột Trái: Nhập thông số kênh */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 space-y-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Icon name="analytics" className="text-violet-600" />
              <span>Chỉ số kênh của bạn</span>
            </h2>

            {/* Followers */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Số người theo dõi (Followers)</label>
                <span className="font-mono font-bold text-violet-700 text-sm">{followers.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={followers}
                onChange={(e) => setFollowers(Number(e.target.value))}
                className="w-full accent-[#7c3aed] cursor-pointer"
              />
              <div className="flex gap-2 mt-2">
                {[3000, 10000, 25000, 50000].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFollowers(f)}
                    className={cx(
                      'rounded-lg px-2 py-1 text-[11px] font-medium border cursor-pointer',
                      followers === f ? 'bg-violet-50 text-violet-700 border-violet-300 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200'
                    )}
                  >
                    {(f / 1000)}k followers
                  </button>
                ))}
              </div>
            </div>

            {/* Avg Views */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Lượt xem trung bình / clip (Avg Views)</label>
                <span className="font-mono font-bold text-slate-900 text-sm">{avgViews.toLocaleString()} views</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={avgViews}
                onChange={(e) => setAvgViews(Number(e.target.value))}
                className="w-full accent-[#7c3aed] cursor-pointer"
              />
            </div>

            {/* Lĩnh vực nội dung */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Lĩnh vực sáng tạo</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { key: 'beauty', label: 'Mỹ phẩm & Da', icon: 'spa' },
                  { key: 'fashion', label: 'Thời trang', icon: 'checkroom' },
                  { key: 'tech', label: 'Công nghệ', icon: 'devices' },
                  { key: 'food', label: 'Food / Review', icon: 'restaurant' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setNiche(item.key as any)}
                    className={cx(
                      'flex flex-col items-center gap-1 rounded-2xl p-2.5 text-xs font-semibold border transition-all cursor-pointer',
                      niche === item.key
                        ? 'bg-violet-50 text-violet-700 border-violet-400 ring-2 ring-violet-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    <Icon name={item.icon} className="text-[20px]" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cột Phải: Bảng Báo Giá Đề Xuất */}
          <div className="space-y-5">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rate Card Đề Xuất</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Mức giá báo nhãn hàng hợp lý:</h3>

              <div className="mt-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 p-4 border border-violet-100">
                <p className="text-xs text-slate-500">1 Video Review chuẩn TikTok (bao gồm gắn link giỏ hàng):</p>
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#7c3aed] mt-1">
                  {formatVND(bookingResults.minPrice)} – {formatVND(bookingResults.maxPrice)}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <p className="text-slate-500">Livestream 60 phút:</p>
                  <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{formatVND(bookingResults.livePrice)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <p className="text-slate-500">Quyền chạy Spark Ads:</p>
                  <p className="font-mono font-bold text-emerald-600 text-sm mt-0.5">+20% – 30% giá video</p>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500 leading-relaxed italic">
                💡 <b>Mẹo thương lượng:</b> Với kênh Nano, nên đề xuất phương án nhận <b>mẫu thử 0đ + % hoa hồng Affiliate cao</b> để chốt hợp tác nhanh chóng với Brand.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleCopyResult(
                    `📑 Báo giá KOC Review đề xuất:\n• Kênh: ${followers.toLocaleString()} followers (${avgViews.toLocaleString()} avg views)\n• Video Review TikTok: ${formatVND(bookingResults.minPrice)} - ${formatVND(bookingResults.maxPrice)}\n• Livestream 1h: ${formatVND(bookingResults.livePrice)}\n(Ước tính theo KOCity Rate Card - kocity.io.vn)`
                  )
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-all cursor-pointer shadow-md"
              >
                <Icon name={copied ? 'check' : 'content_copy'} className="text-[16px]" />
                <span>{copied ? 'Đã sao chép báo giá!' : 'Sao chép bảng báo giá gửi Brand'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

