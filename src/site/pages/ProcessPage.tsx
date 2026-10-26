import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BRAND_CONTACT, ROUTES, ZALO_GROUP_URL } from '../../lib/constants';
import { Button, Icon, cx } from '../ui';

type AudienceTab = 'koc' | 'brand';

interface ProcessStep {
  number: string;
  stepTag: string;
  title: string;
  subtitle: string;
}

const KOC_STEPS: ProcessStep[] = [
  {
    number: '01',
    stepTag: 'BƯỚC 1',
    title: 'Chọn chiến dịch & Đăng ký nhận mẫu 0đ',
    subtitle: 'Tiếp cận hàng trăm chiến dịch mở từ các Brand uy tín, chọn sản phẩm đúng phong cách và tệp khán giả của bạn.',
  },
  {
    number: '02',
    stepTag: 'BƯỚC 2',
    title: 'Nhận sản phẩm mẫu 0đ tận nhà',
    subtitle: 'Sản phẩm chính hãng được đóng gói cẩn thận và chuyển phát nhanh đến tận tay bạn.',
  },
  {
    number: '03',
    stepTag: 'BƯỚC 3',
    title: 'Sản xuất video & Gắn giỏ hàng TikTok Shop',
    subtitle: 'Thỏa sức sáng tạo nội dung chân thực, gắn link giỏ hàng chính xác để kích hoạt doanh số.',
  },
  {
    number: '04',
    stepTag: 'BƯỚC 4',
    title: 'Nhận hoa hồng minh bạch & Tích điểm thưởng',
    subtitle: 'Hưởng trọn vẹn hoa hồng theo từng đơn bán thành công, tích lũy huy hiệu Creator uy tín trên KOCity.',
  },
];

const BRAND_STEPS: ProcessStep[] = [
  {
    number: '01',
    stepTag: 'BƯỚC 1',
    title: 'Tiếp nhận yêu cầu từ Thương hiệu',
    subtitle: 'Lắng nghe định vị sản phẩm, xác định mục tiêu truyền thông và thiết kế gói chiến dịch tối ưu ngân sách.',
  },
  {
    number: '02',
    stepTag: 'BƯỚC 2',
    title: 'Nghiên cứu thị trường & Đề xuất danh sách KOC',
    subtitle: 'Ứng dụng dữ liệu tương tác thực để chọn lọc nhóm Creator có tỷ lệ chuyển đổi cao nhất cho Brand.',
  },
  {
    number: '03',
    stepTag: 'BƯỚC 3',
    title: 'Điều phối kho mẫu & Vận chuyển tận tay',
    subtitle: 'Quản lý logistics chuyên nghiệp, đảm bảo 100% mẫu được giao đúng người, đúng thời điểm.',
  },
  {
    number: '04',
    stepTag: 'BƯỚC 4',
    title: 'Giám sát sản xuất & Kiểm duyệt nội dung',
    subtitle: 'Kiểm soát tiến độ 7 ngày nghiêm ngặt, đảm bảo chất lượng hình ảnh và thông điệp chuẩn mực.',
  },
  {
    number: '05',
    stepTag: 'BƯỚC 5',
    title: 'Tổng kết, đo lường & Báo cáo hiệu quả',
    subtitle: 'Báo cáo số liệu chi tiết, minh bạch từ lượt xem đến doanh thu thực tế được tạo ra.',
  },
];

export const ProcessPage: React.FC = () => {
  const [tab, setTab] = useState<AudienceTab>('koc');
  const navigate = useNavigate();

  const steps = tab === 'koc' ? KOC_STEPS : BRAND_STEPS;

  return (
    <div className="w-full pb-20">
      {/* ===== Header / Breadcrumb ===== */}
      <section className="border-b border-slate-200/60 bg-gradient-to-b from-[#faf5ff] via-white to-white px-4 pt-6 pb-8 sm:px-6 sm:pt-8 sm:pb-12">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link to={ROUTES.home} className="hover:text-slate-900">Trang chủ</Link>
            <Icon name="chevron_right" className="text-[14px] text-slate-400" />
            <span className="text-[#7c3aed] font-semibold">Hành trình nhận job</span>
          </nav>

          <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl md:text-4xl">
            Hành trình nhận job cùng Kocity
          </h1>
          <p className="mt-2.5 text-xs leading-relaxed text-slate-600 sm:text-sm md:text-base">
            Với kinh nghiệm kết nối thương hiệu và hệ sinh thái Nano & Micro KOC rộng khắp, KOCity mang đến cơ hội hợp tác với các brand uy tín cho nhà sáng tạo nội dung chỉ từ 1.000 follower. Dễ dàng tìm kiếm job phù hợp, ứng tuyển nhanh chóng với quy trình đơn giản, tối ưu và từng bước phát triển trên TikTok Shop cùng KOCity.
          </p>

          {/* Tab Switcher: KOC vs Brand */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setTab('koc')}
              className={cx(
                'inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs',
                tab === 'koc'
                  ? 'bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white shadow-violet-500/25 ring-2 ring-violet-400'
                  : 'bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200'
              )}
            >
              <Icon name="auto_awesome" className="text-[16px] sm:text-[18px]" />
              Dành cho KOC (Nhận mẫu 0đ & Hoa hồng)
            </button>
            <button
              type="button"
              onClick={() => setTab('brand')}
              className={cx(
                'inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs',
                tab === 'brand'
                  ? 'bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white shadow-violet-500/25 ring-2 ring-violet-400'
                  : 'bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200'
              )}
            >
              <Icon name="storefront" className="text-[16px] sm:text-[18px]" />
              Dành cho Brand / Doanh nghiệp
            </button>
          </div>

          {/* Quick-jump Pills */}
          <div className="mt-5 flex flex-wrap gap-1.5 sm:gap-2">
            {steps.map((st) => (
              <a
                key={st.number}
                href={`#buoc-${st.number}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-violet-100 hover:text-violet-800 transition-colors"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                  {parseInt(st.number, 10)}
                </span>
                <span className="truncate max-w-[180px] sm:max-w-[220px]">{st.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Main Timeline Content (Chỉ gồm Tên bước & 1 dòng mô tả) ===== */}
      <section className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 sm:pt-14">
        <div className="space-y-6 sm:space-y-8">
          {steps.map((st, idx) => (
            <article key={st.number} id={`buoc-${st.number}`} className="relative scroll-mt-24">
              {/* Vertical connecting line */}
              {idx < steps.length - 1 && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-5 top-12 -bottom-6 w-0.5 border-l-2 border-dashed border-violet-200 sm:left-6 sm:top-14 sm:-bottom-8"
                />
              )}

              <div className="flex items-start gap-3.5 sm:gap-5">
                {/* Large Number Badge */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#ec4899] text-base font-black text-white shadow-md shadow-violet-500/20 sm:h-12 sm:w-12 sm:text-lg">
                  {st.number}
                </div>

                {/* Step Content Card */}
                <div className="card-fx min-w-0 flex-1 rounded-2xl bg-white p-4 shadow-xs ring-1 ring-slate-100 hover:ring-violet-200 transition-all sm:p-5">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#ec4899]">
                    {st.stepTag}
                  </span>
                  <h2 className="mt-0.5 font-display text-base font-bold tracking-tight text-slate-950 sm:text-lg md:text-xl">
                    {st.title}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {st.subtitle}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ===== Bottom CTA Box ===== */}
        <div className="mt-16 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] p-6 text-white shadow-xl shadow-violet-500/25 sm:p-9 text-center">
          <h2 className="font-display text-xl font-extrabold sm:text-2xl md:text-3xl">
            {tab === 'koc' ? 'Sẵn sàng nhận mẫu 0đ đầu tiên?' : 'Sẵn sàng bùng nổ doanh số TikTok Shop?'}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-white/95 leading-relaxed font-medium">
            {tab === 'koc'
              ? 'Hàng trăm chiến dịch mở từ các thương hiệu lớn đang chờ bạn. Đăng ký chỉ 1 phút, nhận mẫu về tận tay!'
              : 'Tiếp cận mạng lưới hơn 850+ Nano & Micro KOC chất lượng cao, phủ sóng sản phẩm và đo lường GMV minh bạch.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {tab === 'koc' ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate(`${ROUTES.home}#mau-dang-mo`)}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-black text-slate-950 shadow-lg shadow-black/15 hover:bg-slate-50 hover:text-[#6d28d9] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Icon name="redeem" className="text-[18px] text-[#7c3aed]" />
                  <span>Khám phá mẫu 0đ ngay</span>
                </button>
                <a
                  href={ZALO_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0068ff] px-6 text-sm font-bold text-white shadow-lg shadow-blue-900/30 hover:bg-blue-600 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Vào nhóm Zalo KOC</span>
                  <Icon name="arrow_outward" className="text-[18px]" />
                </a>
              </>
            ) : (
              <>
                <a
                  href={BRAND_CONTACT.hotlineHref}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-black text-slate-950 shadow-lg shadow-black/15 hover:bg-slate-50 hover:text-[#6d28d9] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Icon name="phone" className="text-[18px] text-[#7c3aed]" />
                  <span>Hotline: {BRAND_CONTACT.hotline}</span>
                </a>
                <a
                  href={`mailto:${BRAND_CONTACT.email}`}
                  className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-white/80 bg-white/15 px-6 text-sm font-bold text-white backdrop-blur-md shadow-md hover:bg-white hover:text-slate-900 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Email: {BRAND_CONTACT.email}</span>
                  <Icon name="mail" className="text-[18px]" />
                </a>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
