import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BRAND_CONTACT, ROUTES, ZALO_GROUP_URL } from '../../lib/constants';
import { Button, Icon, cx } from '../ui';

type AudienceTab = 'koc' | 'brand';

interface ProcessStepCard {
  title: string;
  desc: string;
}

interface ProcessStep {
  number: string;
  stepTag: string;
  title: string;
  subtitle: string;
  cards: ProcessStepCard[];
}

const KOC_STEPS: ProcessStep[] = [
  {
    number: '01',
    stepTag: 'BƯỚC 1',
    title: 'Chọn chiến dịch & Đăng ký nhận mẫu 0đ',
    subtitle: 'Tiếp cận hàng trăm chiến dịch mở từ các Brand uy tín, chọn sản phẩm đúng phong cách và tệp khán giả của bạn.',
    cards: [
      {
        title: 'Tiêu chuẩn kênh tham gia',
        desc: 'Kênh TikTok từ 1.000 followers, có định hướng nội dung review hoặc phong cách sống rõ ràng, không vi phạm chính sách cộng đồng.',
      },
      {
        title: 'Hồ sơ & Địa chỉ nhận hàng',
        desc: 'Điền thông tin 3 bước nhanh gọn (link kênh, số điện thoại, địa chỉ nhận hàng). Hệ thống tự lưu cho các lần nhận mẫu sau.',
      },
      {
        title: 'Duyệt hồ sơ nhanh 24h - 48h',
        desc: 'Brand và đội ngũ KOCity xét duyệt hồ sơ nhanh chóng và thông báo kết quả trực tiếp qua tin nhắn website.',
      },
      {
        title: 'Không cọc, không phụ phí',
        desc: 'Mẫu sản phẩm gửi về tận nhà hoàn toàn miễn phí 100%. Bạn không cần cọc tiền hay chịu bất kỳ chi phí vận chuyển nào.',
      },
    ],
  },
  {
    number: '02',
    stepTag: 'BƯỚC 2',
    title: 'Nhận sản phẩm mẫu 0đ tận nhà',
    subtitle: 'Sản phẩm chính hãng được đóng gói cẩn thận và chuyển phát nhanh đến tận tay bạn.',
    cards: [
      {
        title: 'Tra cứu vận đơn thời gian thực',
        desc: 'Mã vận đơn bưu tá được cập nhật ngay trong mục “Đơn của tôi” để bạn chủ động theo dõi thời gian nhận hàng.',
      },
      {
        title: 'Kiểm tra & Trải nghiệm thực tế',
        desc: 'Mở hộp kiểm tra sản phẩm nguyên vẹn, chụp ảnh xác nhận trên hệ thống và tự mình trải nghiệm trước khi bấm máy.',
      },
      {
        title: 'Nhận Brief & Hướng dẫn quay',
        desc: 'Xem kỹ tài liệu brief về USP sản phẩm, kịch bản mẫu, góc quay gợi ý và danh sách hashtag chính thức của chiến dịch.',
      },
      {
        title: 'Hỗ trợ 1:1 qua nhóm Zalo KOC',
        desc: 'Đội ngũ Admin KOCity luôn sẵn sàng giải đáp thắc mắc về công dụng sản phẩm hoặc kỹ thuật quay dựng 24/7.',
      },
    ],
  },
  {
    number: '03',
    stepTag: 'BƯỚC 3',
    title: 'Sản xuất video & Gắn giỏ hàng TikTok Shop',
    subtitle: 'Thỏa sức sáng tạo nội dung chân thực, gắn link giỏ hàng chính xác để kích hoạt doanh số.',
    cards: [
      {
        title: 'Thời hạn lên bài 7 - 10 ngày',
        desc: 'Hoàn thành và đăng tải video đúng hạn cam kết để duy trì điểm uy tín cao và được ưu tiên nhận các deal độc quyền tiếp theo.',
      },
      {
        title: 'Nội dung chân thực, đúng brief',
        desc: 'Kể câu chuyện chân thật theo phong cách riêng của bạn, làm nổi bật công dụng sản phẩm và tuân thủ các lưu ý từ Brand.',
      },
      {
        title: 'Gắn link giỏ hàng TikTok Shop',
        desc: 'Gắn đúng link sản phẩm của Brand vào video để hệ thống TikTok tự động ghi nhận hoa hồng theo từng đơn hàng phát sinh.',
      },
      {
        title: 'Nộp link video nghiệm thu',
        desc: 'Dán link video TikTok đã đăng vào hệ thống KOCity để hoàn tất chỉ tiêu và bắt đầu chu kỳ tính hoa hồng.',
      },
    ],
  },
  {
    number: '04',
    stepTag: 'BƯỚC 4',
    title: 'Nhận hoa hồng minh bạch & Tích điểm thưởng',
    subtitle: 'Hưởng trọn vẹn hoa hồng theo từng đơn bán thành công, tích lũy huy hiệu Creator uy tín trên KOCity.',
    cards: [
      {
        title: 'Hoa hồng 15% - 30% theo đơn',
        desc: 'Hưởng tỷ lệ hoa hồng hấp dẫn trên mỗi đơn hàng thành công phát sinh từ giỏ hàng video TikTok của bạn.',
      },
      {
        title: 'Đối soát & Rút tiền thuận tiện',
        desc: 'Số liệu hoa hồng minh bạch, đối soát rõ ràng theo chu kỳ TikTok Shop và rút về tài khoản ngân hàng dễ dàng.',
      },
      {
        title: 'Tích điểm thăng hạng Creator',
        desc: 'KOC có video lên xu hướng hoặc hoàn thành đúng hạn sẽ được cộng điểm uy tín, thăng cấp Nano → Micro → Key KOC.',
      },
      {
        title: 'Đặc quyền hợp tác dài hạn',
        desc: 'Cơ hội nhận các gói tài trợ độc quyền, vé mời tham dự sự kiện ra mắt thương hiệu và hợp tác booking cố định.',
      },
    ],
  },
];

const BRAND_STEPS: ProcessStep[] = [
  {
    number: '01',
    stepTag: 'BƯỚC 1',
    title: 'Tiếp nhận yêu cầu từ Thương hiệu',
    subtitle: 'Lắng nghe định vị sản phẩm, xác định mục tiêu truyền thông và thiết kế gói chiến dịch tối ưu ngân sách.',
    cards: [
      {
        title: 'Ngành nghề & Tệp khách hàng',
        desc: 'Phân tích định vị sản phẩm (Mỹ phẩm, Chăm sóc cá nhân, Thời trang, F&B, Công nghệ...) và tệp khách hàng tiềm năng.',
      },
      {
        title: 'Mục tiêu chiến dịch',
        desc: 'Xác định rõ trọng tâm: phủ sóng nhận diện thương hiệu (Awareness), tạo hiệu ứng đám đông hay thúc đẩy doanh số bán lẻ (GMV).',
      },
      {
        title: 'Ngân sách & Số lượng mẫu 0đ',
        desc: 'Lên kế hoạch số lượng suất mẫu (50, 100 hay 500+ mẫu) kết hợp cơ chế hoa hồng Affiliate tối ưu để thu hút KOC chất lượng.',
      },
      {
        title: 'KPI & Lộ trình triển khai',
        desc: 'Thống nhất số lượng video cam kết, mốc thời gian bắt đầu, hạn chót KOC nhận mẫu và thời điểm đồng loạt lên bài.',
      },
    ],
  },
  {
    number: '02',
    stepTag: 'BƯỚC 2',
    title: 'Nghiên cứu thị trường & Đề xuất danh sách KOC',
    subtitle: 'Ứng dụng dữ liệu tương tác thực để chọn lọc nhóm Creator có tỷ lệ chuyển đổi cao nhất cho Brand.',
    cards: [
      {
        title: 'Sàng lọc KOC chất lượng cao',
        desc: 'Hệ thống lọc danh sách Nano/Micro KOC có lượng tương tác thật, tệp fan trùng khớp chân dung khách hàng mục tiêu.',
      },
      {
        title: 'Phân tích đối thủ cạnh tranh',
        desc: 'Đánh giá các chiến dịch thành công trong cùng ngành hàng để tìm ra góc tiếp cận nội dung độc đáo, nổi bật.',
      },
      {
        title: 'Đề xuất tuyến nội dung review',
        desc: 'Gợi ý các concept video hiệu quả: mở hộp unboxing, thử nghiệm độ bền, so sánh tính năng hoặc tình huống đời thường.',
      },
      {
        title: 'Brand toàn quyền phê duyệt',
        desc: 'Thương hiệu trực tiếp duyệt và lựa chọn danh sách KOC phù hợp phong cách thương hiệu trước khi gửi mẫu.',
      },
    ],
  },
  {
    number: '03',
    stepTag: 'BƯỚC 3',
    title: 'Điều phối kho mẫu & Vận chuyển tận tay',
    subtitle: 'Quản lý logistics chuyên nghiệp, đảm bảo 100% mẫu được giao đúng người, đúng thời điểm.',
    cards: [
      {
        title: 'Tiếp nhận kho mẫu tập trung',
        desc: 'KOCity tiếp nhận lô sản phẩm mẫu từ Brand, lưu kho an toàn và chuẩn bị quy trình đóng gói theo tiêu chuẩn.',
      },
      {
        title: 'Phân phối & Cập nhật vận đơn',
        desc: 'Chuyển phát nhanh đến từng KOC trên toàn quốc với mã vận đơn theo dõi trực tiếp trạng thái giao nhận.',
      },
      {
        title: 'Tài liệu Briefing chuyên sâu',
        desc: 'Cung cấp hướng dẫn chi tiết về USP sản phẩm, thông điệp cốt lõi, quy chuẩn từ khóa và các hashtag bắt buộc.',
      },
      {
        title: 'Nhóm hỗ trợ chuyên trách',
        desc: 'Quản lý nhóm Zalo riêng để giải đáp kỹ thuật, hỗ trợ KOC sản xuất video nhanh chóng và đúng định hướng Brand.',
      },
    ],
  },
  {
    number: '04',
    stepTag: 'BƯỚC 4',
    title: 'Giám sát sản xuất & Kiểm duyệt nội dung',
    subtitle: 'Kiểm soát tiến độ 7 ngày nghiêm ngặt, đảm bảo chất lượng hình ảnh và thông điệp chuẩn mực.',
    cards: [
      {
        title: 'Kiểm soát tiến độ 7 ngày',
        desc: 'Đôn đốc và nhắc nhở KOC bấm máy, đảm bảo 100% video lên sóng đúng thời điểm vàng của chiến dịch.',
      },
      {
        title: 'Kiểm duyệt nội dung & Góc quay',
        desc: 'Hỗ trợ kiểm duyệt nội dung, chỉnh sửa câu từ tuân thủ chính sách quảng cáo TikTok và bảo vệ uy tín thương hiệu.',
      },
      {
        title: 'Gắn giỏ hàng chính xác',
        desc: 'Đảm bảo liên kết sản phẩm TikTok Shop được gắn chuẩn xác để kích hoạt doanh số affiliate ngay khi video viral.',
      },
      {
        title: 'Xử lý sự cố phát sinh',
        desc: 'Kịp thời xử lý các trường hợp video bị bóp tương tác hoặc KOC chậm tiến độ bằng các phương án Creator dự phòng.',
      },
    ],
  },
  {
    number: '05',
    stepTag: 'BƯỚC 5',
    title: 'Tổng kết, đo lường & Báo cáo hiệu quả',
    subtitle: 'Báo cáo số liệu chi tiết, minh bạch từ lượt xem đến doanh thu thực tế được tạo ra.',
    cards: [
      {
        title: 'Báo cáo chỉ số chi tiết',
        desc: 'Thống kê tổng lượt xem (Views), lượt tương tác (Likes, Comments, Shares), tỷ lệ click giỏ hàng và số đơn phát sinh.',
      },
      {
        title: 'Đo lường doanh thu GMV',
        desc: 'Đối soát doanh số bán hàng trực tiếp qua affiliate link của từng video trong chiến dịch.',
      },
      {
        title: 'Xếp hạng Creator hiệu suất cao',
        desc: 'Danh sách các KOC có tỷ lệ chuyển đổi tốt nhất để Brand chủ động ký hợp đồng đại sứ hoặc booking độc quyền.',
      },
      {
        title: 'Đề xuất chiến lược tối ưu',
        desc: 'Phân tích điểm chạm thành công và đề xuất hướng mở rộng ngân sách cho các mùa Mega Sale tiếp theo.',
      },
    ],
  },
];

export const ProcessPage: React.FC = () => {
  const [tab, setTab] = useState<AudienceTab>('koc');
  const navigate = useNavigate();

  const steps = tab === 'koc' ? KOC_STEPS : BRAND_STEPS;

  return (
    <div className="w-full pb-20">
      {/* ===== Header / Breadcrumb ===== */}
      <section className="border-b border-slate-200/60 bg-gradient-to-b from-[#faf5ff] via-white to-white px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-14">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link to={ROUTES.home} className="hover:text-slate-900">Trang chủ</Link>
            <Icon name="chevron_right" className="text-[14px] text-slate-400" />
            <span className="text-[#7c3aed] font-semibold">Hành trình nhận job</span>
          </nav>

          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Hành trình nhận job cùng Kocity
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Với kinh nghiệm kết nối thương hiệu và hệ sinh thái Nano & Micro KOC rộng khắp, KOCity mang đến cơ hội hợp tác với các brand uy tín cho nhà sáng tạo nội dung chỉ từ 1.000 follower. Dễ dàng tìm kiếm job phù hợp, ứng tuyển nhanh chóng với quy trình đơn giản, tối ưu và từng bước phát triển trên TikTok Shop cùng KOCity.
          </p>

          {/* Tab Switcher: KOC vs Brand */}
          <div className="mt-8 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setTab('koc')}
              className={cx(
                'inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all cursor-pointer shadow-sm',
                tab === 'koc'
                  ? 'bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white shadow-violet-500/25 ring-2 ring-violet-400'
                  : 'bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200'
              )}
            >
              <Icon name="auto_awesome" className="text-[18px]" />
              Dành cho KOC (Nhận mẫu 0đ & Hoa hồng)
            </button>
            <button
              type="button"
              onClick={() => setTab('brand')}
              className={cx(
                'inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all cursor-pointer shadow-sm',
                tab === 'brand'
                  ? 'bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white shadow-violet-500/25 ring-2 ring-violet-400'
                  : 'bg-white text-slate-700 hover:bg-slate-50 ring-1 ring-slate-200'
              )}
            >
              <Icon name="storefront" className="text-[18px]" />
              Dành cho Brand / Doanh nghiệp
            </button>
          </div>

          {/* Quick-jump Pills (như ảnh mẫu) */}
          <div className="mt-6 flex flex-wrap gap-2">
            {steps.map((st) => (
              <a
                key={st.number}
                href={`#buoc-${st.number}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-violet-100 hover:text-violet-800 transition-colors"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                  {parseInt(st.number, 10)}
                </span>
                <span className="truncate max-w-[200px]">{st.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Main Timeline Content ===== */}
      <section className="mx-auto max-w-5xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="space-y-16 sm:space-y-20">
          {steps.map((st, idx) => (
            <article key={st.number} id={`buoc-${st.number}`} className="relative scroll-mt-24">
              {/* Vertical connecting line */}
              {idx < steps.length - 1 && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-5 top-16 -bottom-16 w-0.5 border-l-2 border-dashed border-violet-200 sm:left-6 sm:top-20 sm:-bottom-20"
                />
              )}

              <div className="flex items-start gap-4 sm:gap-6">
                {/* Large Number Badge */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#ec4899] text-lg font-black text-white shadow-lg shadow-violet-500/20 sm:h-14 sm:w-14 sm:rounded-3xl sm:text-2xl">
                  {st.number}
                </div>

                {/* Step Title Header */}
                <div className="min-w-0 flex-1 pt-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#ec4899] sm:text-xs">
                    {st.stepTag}
                  </span>
                  <h2 className="mt-0.5 font-display text-xl font-bold tracking-tight text-slate-950 sm:text-2xl md:text-3xl">
                    {st.title}
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {st.subtitle}
                  </p>

                  {/* Grid of detail cards (như ảnh mẫu) */}
                  <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-2 sm:gap-4">
                    {st.cards.map((card) => (
                      <div
                        key={card.title}
                        className="card-fx flex flex-col justify-between rounded-2xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-slate-100 hover:ring-violet-200 transition-all"
                      >
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-[15px]">
                            {card.title}
                          </h3>
                          <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                            {card.desc}
                          </p>
                        </div>
                        <div className="mt-3.5 flex items-center gap-1 text-[11px] font-semibold text-[#7c3aed]">
                          <span>Quy chuẩn KOCity</span>
                          <Icon name="check_circle" className="text-[14px] text-emerald-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ===== Bottom CTA Box ===== */}
        <div className="mt-20 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] p-6 text-white shadow-xl shadow-violet-500/25 sm:p-10 text-center">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
            {tab === 'koc' ? 'Sẵn sàng nhận mẫu 0đ đầu tiên?' : 'Sẵn sàng bùng nổ doanh số TikTok Shop?'}
          </h2>
          <p className="mx-auto mt-2.5 max-w-xl text-xs text-white/90 sm:text-sm">
            {tab === 'koc'
              ? 'Hàng trăm chiến dịch mở từ các thương hiệu lớn đang chờ bạn. Đăng ký chỉ 1 phút, nhận mẫu về tận tay!'
              : 'Tiếp cận mạng lưới hơn 850+ Nano & Micro KOC chất lượng cao, phủ sóng sản phẩm và đo lường GMV minh bạch.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {tab === 'koc' ? (
              <>
                <Button
                  variant="dark"
                  size="lg"
                  className="rounded-full bg-white text-slate-900 hover:bg-slate-100 shadow-md px-7"
                  onClick={() => navigate(`${ROUTES.home}#mau-dang-mo`)}
                >
                  Khám phá mẫu 0đ ngay
                </Button>
                <a
                  href={ZALO_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white/20 px-6 font-semibold text-white backdrop-blur hover:bg-white/30"
                >
                  Vào nhóm Zalo KOC <Icon name="arrow_outward" className="text-[18px]" />
                </a>
              </>
            ) : (
              <>
                <a
                  href={BRAND_CONTACT.hotlineHref}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 font-bold text-slate-900 shadow-md hover:bg-slate-100"
                >
                  <Icon name="phone" className="text-[18px] text-[#7c3aed]" />
                  Hotline: {BRAND_CONTACT.hotline}
                </a>
                <a
                  href={`mailto:${BRAND_CONTACT.email}`}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white/20 px-6 font-semibold text-white backdrop-blur hover:bg-white/30"
                >
                  Email: {BRAND_CONTACT.email} <Icon name="mail" className="text-[18px]" />
                </a>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
