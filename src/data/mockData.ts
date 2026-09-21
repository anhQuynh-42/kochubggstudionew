import { Campaign, KOCApplication, AppNotification } from '../types';
import goojodoqHero from '../assets/images/goojodoq_hero_1789451074478.jpg';
import visecretBraHero from '../assets/images/visecret_bra_hero_1789451089311.jpg';
import tranyooTechHero from '../assets/images/tranyoo_tech_hero_1789451103720.jpg';
import tranyooSampleSet from '../assets/images/tranyoo_sample_set_1789451119021.jpg';
import regeneratedImg1 from '../assets/images/regenerated_image_1789466444591.jpg';
import regeneratedImg2 from '../assets/images/regenerated_image_1789466447283.jpg';
import goojodoqLogo from '../assets/images/regenerated_image_1789519146682.jpg';
import goojodoqGallery1 from '../assets/images/regenerated_image_1789519065838.jpg';
import goojodoqGallery2 from '../assets/images/regenerated_image_1789519068205.jpg';
import goojodoqGallery3 from '../assets/images/regenerated_image_1789519070267.jpg';
import visecretLogo from '../assets/images/regenerated_image_1789468082332.jpg';
import visecretGallery1 from '../assets/images/regenerated_image_1789468085311.jpg';
import visecretGallery2 from '../assets/images/regenerated_image_1789468087208.jpg';
import visecretGallery3 from '../assets/images/regenerated_image_1789468089172.jpg';

export const APP_LOGOS = {
  kochub: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_74_qM_c9rS6xhr3GM7sF0_nhClMTLpRugvD0Zwj-E2Uvb4eFMcipolpJ__XJ9sE8w6D_0NfHalXJwy10G9KXewhxtV0YBdC4qWs98GwCVvqtVKkdXBi8P3KSHS4pR_5wTyKpvYjfEcKtxb511vZISCF8s_yD1vjd8na9RF3zutGxYP8nadCLupO7Mwr0xGHw9B-R43AVZPmpKGcJx0iJxf6Gz46VNThAgCZhuHmYTe3vOw1LvURs',
  userProfile: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoV0m73VoY07k3KAu4UYXOt7UQ4aRw3gOpFZYNUXO12CG31nzhjcvK-kkfdnGpLsEkoyVXvzvRQCeyyzz_q__iKcT97K74k5IjD3lYcToRBShK-8QK5Fzn1v9prbGRS9DMLCJyqo5sKYCbSAD0z6UA97eQ8XQhknSlGeUsve84FVC9TvAdbN6s85z5P7GeWfGPkxgpfth468LWt1dqLKVub0JApSsGP69CZ1NsVmz7xzHFvaseuw3y',
};

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'gojodoq-tech-lifestyle',
    code: 'GOJO-2025-TECH',
    title: '⭐️ GOOJODOQ VIỆT NAM – CAMPAIGN TECH & LIFESTYLE SIÊU HOT, HH 9% (FREECAST) 🔥',
    brandName: 'GOOJODOQ Vietnam',
    brandLogo: goojodoqLogo,
    category: 'Đồ công nghệ & Setup',
    daysLeft: 15,
    platform: 'TikTok Shop',
    followerRequirement: '>1.000 Followers',
    tiktokUrl: 'https://www.tiktok.com/@goojodoq.vn',
    tiktokHandle: '@goojodoq.vn',
    benefits: [
      { label: 'Tặng mẫu 100% (Freecast)', icon: 'featured_seasonal_and_gifts', type: 'sample' },
      { label: '9% Hoa hồng Affiliate', icon: 'percent', type: 'commission' },
      { label: 'Duyệt kênh > 1.000 Follower', icon: 'verified', type: 'other' }
    ],
    totalSpots: 150,
    registeredSpots: 92,
    urgent: true,
    approvalRate: '94%',
    description: 'Team KOC review công nghệ / Studygram / Lifestyle ơi, GOOJODOQ đang mở campaign với loạt sản phẩm cực kỳ dễ làm content nhaa ! 👀 Sản phẩm siêu đa dạng, nhu cầu cao: Bút cảm ứng iPad, bàn phím bluetooth, chuột không dây, tai nghe, sạc dự phòng, giá đỡ iPad... Thiết kế tối giản, hiện đại, giá siêu ưu đãi, đánh vào nhu cầu của học sinh, sinh viên và dân văn phòng.',
    fullPrice: '199.000đ - 650.000đ',
    bookingFee: 'Freecast (Mẫu 0đ)',
    commissionRate: '9%',
    productHeroImage: regeneratedImg1,
    galleryImages: [
      regeneratedImg1,
      goojodoqGallery1,
      goojodoqGallery2,
      goojodoqGallery3
    ],
    uspList: [
      {
        title: 'Sản phẩm siêu đa dạng, nhu cầu cao',
        desc: 'Bút cảm ứng, bàn phím bluetooth, chuột không dây, tai nghe, sạc dự phòng, giá đỡ iPad... Thiết kế tối giản, hiện đại, bền đẹp.',
        icon: 'devices'
      },
      {
        title: 'Đánh trúng HSSV & Dân văn phòng',
        desc: 'Tone màu pastel tinh tế, tiện dụng mang đi học, đi làm hay cafe, phân khúc giá siêu ưu đãi chuyển đổi đơn hàng vượt trội.',
        icon: 'school'
      },
      {
        title: 'Ưu tiên duyệt tặng mẫu miễn phí (Freecast)',
        desc: 'Áp dụng cho các kênh KOC đạt điều kiện từ > 1.000 Follower trở lên và có đăng video trong 7 ngày gần nhất.',
        icon: 'verified'
      }
    ],
    storySteps: [
      {
        step: 'DẠNG CONTENT 1',
        title: 'Unbox ASMR / Setup góc làm việc',
        desc: 'Bố trí góc bàn học/làm việc thẩm mỹ, âm thanh gõ phím bluetooth êm ái và bóc seal chân thực.'
      },
      {
        step: 'DẠNG CONTENT 2',
        title: 'Mẹo dùng iPad/Tablet hữu ích',
        desc: 'Chia sẻ tip ghi chép nhanh, vẽ digital art, tận dụng phím tắt thông minh cùng bút cảm ứng & bàn phím Gojodoq.'
      },
      {
        step: 'DẠNG CONTENT 3',
        title: 'Có gì trong túi đi học/đi làm (What’s in my bag)',
        desc: 'Giới thiệu những món đồ công nghệ bỏ túi gọn nhẹ không thể thiếu hàng ngày.'
      },
      {
        step: 'DẠNG CONTENT 4',
        title: 'Review đồ công nghệ ngon-bổ-rẻ',
        desc: 'Trải nghiệm mượt mà, độ nhạy cao không thua kém phụ kiện cao cấp, kêu gọi nhấp giỏ hàng nhận deal hời.'
      }
    ],
    hashtags: ['#GOOJODOQ', '#GoojodoqVietnam', '#TechReview', '#Studygram', '#DeskSetup', '#TikTokShopAffiliate'],
    cartBrandName: 'GOOJODOQ Vietnam Official Store',
    timeline: [
      {
        stepNum: '01',
        status: 'Đang diễn ra',
        date: 'Bước 1',
        title: 'Đăng Ký tham gia',
        desc: 'KOC gửi thông tin kênh (>1.000 Follower). Bên mình duyệt qua trong 12h & Brand Gojodoq duyệt.'
      },
      {
        stepNum: '02',
        status: 'Tiếp theo',
        date: 'Bước 2',
        title: 'KOC nhận mẫu free (Freecast)',
        desc: 'Gojodoq xuất kho gửi mẫu tận nhà miễn phí 100%. KOC làm video trải nghiệm (Hạn 4 - 7 ngày).'
      },
      {
        stepNum: '03',
        status: 'Nghiệm thu',
        date: 'Bước 3',
        title: 'KOC trả video (Up lên Drive)',
        desc: 'Up video lên Google Drive để bên mình & Brand duyệt trước kịch bản, âm thanh và hình ảnh.'
      },
      {
        stepNum: '04',
        status: 'Quyết toán',
        date: 'Bước 4',
        title: 'Nhận hoa hồng sau khi có đơn',
        desc: 'Nhận 9% hoa hồng trên mỗi đơn hàng phát sinh, tiền về tài khoản ngân hàng minh bạch.'
      }
    ]
  },
  {
    id: 'visecret-bra-fashion',
    code: 'VISEC-2025-FASHION',
    title: '🔥 [VISECRET BRA] TÌM KIẾM ĐỐI TÁC KOC FASHION/LIFESTYLE – VỚI CHÍNH SÁCH HOA HỒNG 10% & FREECAST 🔥',
    brandName: 'VISECRET BRA',
    brandLogo: visecretLogo,
    category: 'Thời trang & Phụ kiện',
    daysLeft: 12,
    platform: 'TikTok Shop',
    followerRequirement: '>1.000 Followers',
    tiktokUrl: 'https://www.tiktok.com/@visecret_bra',
    tiktokHandle: '@visecret_bra',
    benefits: [
      { label: 'Hỗ trợ 100% Freecast (Tặng mẫu)', icon: 'checkroom', type: 'sample' },
      { label: '10% Hoa hồng đơn thành công', icon: 'percent', type: 'commission' },
      { label: 'Duyệt kênh > 1.000 Follower', icon: 'verified', type: 'other' }
    ],
    totalSpots: 120,
    registeredSpots: 64,
    urgent: true,
    approvalRate: '91%',
    description: 'Visecret Bra tìm kiếm đối tác KOC Fashion/Lifestyle chạy số với chính sách hoa hồng 10% & 100% Freecast tặng mẫu miễn phí. Sản phẩm đa dạng, dễ lên kịch bản: Bra không gọng êm ái, áo lót "tàng hình", bra chuyên dụng cho váy hở lưng, áo trễ vai mùa hè...',
    fullPrice: '180.000đ - 450.000đ',
    bookingFee: '100% Freecast',
    commissionRate: '10%',
    productHeroImage: visecretBraHero,
    galleryImages: [
      visecretBraHero,
      visecretGallery1,
      visecretGallery2,
      visecretGallery3
    ],
    uspList: [
      {
        title: 'Bra không gọng êm ái, nâng đỡ tự nhiên',
        desc: 'Đệm mút cao cấp thoáng khí, mềm mại, không gây cảm giác hằn cấn hay bí bách suốt ngày dài năng động.',
        icon: 'favorite'
      },
      {
        title: 'Áo lót "tàng hình" không viền tiệp da',
        desc: 'Mỏng nhẹ tinh tế, không hằn ngấn viền, giải pháp hoàn hảo cho áo thun trắng ôm sát, áo dài, váy body.',
        icon: 'visibility_off'
      },
      {
        title: 'Bra chuyên dụng cho váy hở lưng & áo trễ vai',
        desc: 'Độ bám dính chắc chắn, nâng ngực định hình gợi cảm, tự tin diện váy khoét lưng và đầm trễ vai dạo phố hè.',
        icon: 'auto_awesome'
      }
    ],
    storySteps: [
      {
        step: 'DẠNG CONTENT 1',
        title: 'Mix & Match / Tips mặc đẹp',
        desc: 'Bí quyết diện váy hở lưng, áo trễ vai không lo lộ quai hay hằn viền với Visecret Bra.'
      },
      {
        step: 'DẠNG CONTENT 2',
        title: 'Unbox & Review cận chất',
        desc: 'Quay cận cảnh chất vải su đúc co giãn 4 chiều mềm mại, test độ bám dính và êm ái của đệm mút.'
      },
      {
        step: 'DẠNG CONTENT 3',
        title: 'Tuyến nội dung mẹo mặc bra không hằn viền',
        desc: 'So sánh trực quan khi diện đồ ôm sát: Áo lót thường lộ ngấn viền vs Áo lót tàng hình Visecret phẳng phiu tự tin.'
      },
      {
        step: 'DẠNG CONTENT 4',
        title: 'Daily Vlog phối đồ tự nhiên',
        desc: 'Một ngày đi học, đi làm, đi chơi thoải mái vận động cả ngày, kêu gọi bấm giỏ hàng nhận ưu đãi hời.'
      }
    ],
    hashtags: ['#VISECRET', '#VisecretBra', '#KOCFashion', '#TipsMacDep', '#BraKhongGong', '#AoLotTangHinh', '#OOTD'],
    cartBrandName: 'VISECRET BRA Official Store',
    timeline: [
      {
        stepNum: '01',
        status: 'Đang diễn ra',
        date: 'Bước 1',
        title: 'Đăng Ký tham gia',
        desc: 'Kênh TikTok mảng Fashion/Beauty/Daily Lifestyle > 1.000 Follower. Bên mình duyệt trong 12h & Brand duyệt.'
      },
      {
        stepNum: '02',
        status: 'Tiếp theo',
        date: 'Bước 2',
        title: 'KOC nhận mẫu free (100% Freecast)',
        desc: 'Nhận mẫu bra không gọng / áo lót tàng hình 0đ. Làm video review chỉn chu (Hạn 4 - 7 ngày).'
      },
      {
        stepNum: '03',
        status: 'Nghiệm thu',
        date: 'Bước 3',
        title: 'KOC trả video (Up lên Drive)',
        desc: 'Tải video lên Google Drive để bên mình & Brand duyệt trước khi gắn link Affiliate chính thức.'
      },
      {
        stepNum: '04',
        status: 'Quyết toán',
        date: 'Bước 4',
        title: 'Nhận hoa hồng sau khi có đơn',
        desc: 'Hưởng 10% hoa hồng cho các đơn hàng thành công, tiền về tài khoản ngân hàng đối soát minh bạch.'
      }
    ]
  },
  {
    id: 'tranyoo-tech-lifestyle',
    code: 'TRAN-2025-TECH',
    title: '🔥 [TRANYOO VIỆT NAM] TÌM KIẾM KOC TECH/LIFESTYLE – CHẠY SỐ CÙNG HOA HỒNG 9% & FREECAST 🔥',
    brandName: 'TRANYOO Vietnam',
    brandLogo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="%230f172a"/><rect x="15" y="15" width="90" height="90" rx="20" fill="%231e293b"/><path d="M32 38h56M60 38v46" stroke="%23f97316" stroke-width="9" stroke-linecap="round"/><path d="M42 54l18-16 18 16" stroke="%2338bdf8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="60" y="98" font-family="sans-serif" font-size="10" font-weight="900" fill="%23fdba74" text-anchor="middle" letter-spacing="1">TRANYOO</text></svg>',
    category: 'Đồ công nghệ & Setup',
    daysLeft: 18,
    platform: 'TikTok Shop',
    followerRequirement: '>1.000 Followers',
    tiktokUrl: 'https://www.tiktok.com/@tranyoo.official',
    tiktokHandle: '@tranyoo.official',
    benefits: [
      { label: 'Tặng mẫu trải nghiệm Freecast', icon: 'inventory_2', type: 'sample' },
      { label: '9% Hoa hồng siêu tốt', icon: 'percent', type: 'commission' },
      { label: 'Kênh TikTok > 1.000 Follower', icon: 'verified', type: 'other' }
    ],
    totalSpots: 200,
    registeredSpots: 135,
    urgent: true,
    approvalRate: '95%',
    description: 'Tranyoo Việt Nam tìm kiếm KOC Tech/Lifestyle chạy số cùng hoa hồng 9% & Freecast gửi tặng mẫu trải nghiệm hoàn toàn miễn phí. Sản phẩm quốc dân, cực dễ bán: Sạc dự phòng thiết kế trend, tai nghe Bluetooth âm chuẩn, cáp sạc siêu bền, củ sạc nhanh...',
    fullPrice: '150.000đ - 850.000đ',
    bookingFee: 'Freecast (Mẫu 0đ)',
    commissionRate: '9%',
    productHeroImage: tranyooTechHero,
    galleryImages: [
      tranyooTechHero,
      'https://images.unsplash.com/photo-1609592426508-cc027993a466?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=1000&q=80'
    ],
    uspList: [
      {
        title: 'Sạc dự phòng thiết kế trend & Củ sạc nhanh an toàn',
        desc: 'Thiết kế nhỏ gọn trong lòng bàn tay, dung lượng chuẩn, chip sạc thông minh chống quá tải nhiệt và chai pin.',
        icon: 'battery_charging_full'
      },
      {
        title: 'Tai nghe Bluetooth âm chuẩn, chống ồn rõ nét',
        desc: 'Kết nối ổn định không giật lag, chất âm bass uy lực, đàm thoại mic trong trẻo khi học tập hay ra ngoài.',
        icon: 'headphones'
      },
      {
        title: 'Cáp sạc siêu bền bọc dù chịu lực cao',
        desc: 'Chất liệu bện đa lớp chống đứt gãy gập gãy, công suất dòng sạc cao và truyền dữ liệu tốc độ cao.',
        icon: 'cable'
      }
    ],
    storySteps: [
      {
        step: 'DẠNG CONTENT 1',
        title: 'Unbox & Review cận cảnh',
        desc: 'Test tốc độ sạc nhanh đồng hồ bấm giờ thực tế, test chất âm bass sống động và độ bền uốn cáp sạc.'
      },
      {
        step: 'DẠNG CONTENT 2',
        title: 'Setup Desk tour / Studygram',
        desc: 'Phối phụ kiện Tranyoo vào góc học tập, làm việc tinh gọn, hiện đại và bắt mắt cho HSSV.'
      },
      {
        step: 'DẠNG CONTENT 3',
        title: 'What’s in my bag (Có gì trong túi?)',
        desc: 'Giới thiệu những món phụ kiện công nghệ thiết yếu không thể thiếu khi đi học, đi làm, đi cafe.'
      },
      {
        step: 'DẠNG CONTENT 4',
        title: 'Tips & Tricks công nghệ',
        desc: 'Chia sẻ mẹo sạc pin an toàn, cách bảo vệ pin điện thoại cho HSSV và dân văn phòng.'
      }
    ],
    hashtags: ['#TRANYOO', '#TranyooVietnam', '#TechReviewer', '#Studygram', '#PhuKienQuocDan', '#SacNhanh'],
    cartBrandName: 'TRANYOO Vietnam Official Store',
    timeline: [
      {
        stepNum: '01',
        status: 'Đang diễn ra',
        date: 'Bước 1',
        title: 'Đăng Ký tham gia',
        desc: 'Kênh TikTok tương tác ổn định > 1.000 Follower. Bên mình duyệt trong 12h & Brand Tranyoo duyệt.'
      },
      {
        stepNum: '02',
        status: 'Tiếp theo',
        date: 'Bước 2',
        title: 'KOC nhận mẫu free (Freecast)',
        desc: 'Nhận mẫu phụ kiện Tranyoo 0đ tận nhà. Làm video hoặc livestream review (Hạn 4 - 7 ngày).'
      },
      {
        stepNum: '03',
        status: 'Nghiệm thu',
        date: 'Bước 3',
        title: 'KOC trả video (Up lên Drive)',
        desc: 'Tải video lên Google Drive để bên mình & Brand nghiệm thu chất lượng trước khi gắn link Affiliate.'
      },
      {
        stepNum: '04',
        status: 'Quyết toán',
        date: 'Bước 4',
        title: 'Nhận hoa hồng sau khi có đơn',
        desc: 'Hưởng 9% hoa hồng trên mỗi đơn hàng thành công, tiền về tài khoản ngân hàng định kỳ.'
      }
    ]
  },
  {
    id: 'tranyoo-creator-sample-september',
    code: 'TRAN-2025-SEP',
    title: '🚨 [TRANYOO VIỆT NAM] OPEN CAMPAIGN CREATOR – ĐĂNG KÝ NHẬN SAMPLE THÁNG 9 ⚡️',
    brandName: 'TRANYOO Vietnam',
    brandLogo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="%230f172a"/><rect x="15" y="15" width="90" height="90" rx="20" fill="%231e293b"/><path d="M32 38h56M60 38v46" stroke="%23f97316" stroke-width="9" stroke-linecap="round"/><path d="M42 54l18-16 18 16" stroke="%2338bdf8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="60" y="98" font-family="sans-serif" font-size="10" font-weight="900" fill="%23fdba74" text-anchor="middle" letter-spacing="1">TRANYOO</text></svg>',
    category: 'Đồ công nghệ & Setup',
    daysLeft: 20,
    platform: 'TikTok Shop',
    followerRequirement: '>1.000 Followers',
    tiktokUrl: 'https://www.tiktok.com/@tranyoo.official',
    tiktokHandle: '@tranyoo.official',
    benefits: [
      { label: 'Nhận 5 Mẫu Sample Quốc Dân', icon: 'featured_seasonal_and_gifts', type: 'sample' },
      { label: '9% Hoa hồng + Deal độc quyền', icon: 'percent', type: 'commission' },
      { label: 'Ưu tiên duyệt > 1.000 Follower', icon: 'verified', type: 'other' }
    ],
    totalSpots: 180,
    registeredSpots: 112,
    urgent: true,
    approvalRate: '96%',
    description: 'Các bạn Creator/KOC mảng Tech, Setup, HSSV và Lifestyle ơi, Tranyoo đang mở form đăng ký campaign với 5 sản phẩm phụ kiện công nghệ quốc dân cực kỳ dễ lên đơn! Nhận sample sản phẩm trải nghiệm, hoa hồng cực tốt lên đến 9% cho tất cả sản phẩm + deal ưu đãi độc quyền.',
    fullPrice: '220.000đ - 1.250.000đ',
    bookingFee: 'Free Sample 5 Món Quốc Dân',
    commissionRate: '9%',
    productHeroImage: tranyooSampleSet,
    galleryImages: [
      tranyooSampleSet,
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'
    ],
    uspList: [
      {
        title: 'Tai nghe Bluetooth T-M26 (BT 5.3) & Tai nghe dây R12',
        desc: 'T-M26 thiết kế thời thượng, kết nối siêu mượt mà; Tai nghe nhét tai R12 chống ồn hiệu quả, âm thanh vòm sống động.',
        icon: 'headset'
      },
      {
        title: 'Cáp Sạc Nhanh 240W CC-9/CL-9 Type-C Siêu Tốc',
        desc: 'Công suất khủng 240W chuẩn Type-C, bọc bện chịu lực siêu bền, sạc nhanh chóng từ smartphone đến laptop.',
        icon: 'bolt'
      },
      {
        title: 'Bộ Sạc GaN 120W US9 & Sạc Nhanh 30W US13 2 Cổng',
        desc: 'Công nghệ GaN 120W hiện đại sạc nhanh mát mẻ tối ưu (1 USB-C, 1 USB-A); Bộ 30W US13 tiện lợi sạc cùng lúc nhiều thiết bị.',
        icon: 'electric_bolt'
      }
    ],
    storySteps: [
      {
        step: 'SẢN PHẨM 1 & 2',
        title: 'Tai nghe T-M26 (BT 5.3) & Tai nghe dây R12',
        desc: 'Test chất âm vòm, khả năng cách âm chống ồn và độ êm ái khi đeo nghe nhạc, xem phim, livestream.'
      },
      {
        step: 'SẢN PHẨM 3',
        title: 'Cáp Sạc Nhanh 240W CC-9/CL-9 Type-C',
        desc: 'Test công suất sạc watt kế thực tế, khoe độ bền bọc dù siêu chắc chắn, không lo đứt ngầm hay gãy cổ cáp.'
      },
      {
        step: 'SẢN PHẨM 4 & 5',
        title: 'Bộ Sạc GaN 120W US9 & Bộ Sạc 30W US13',
        desc: 'Cắm sạc đồng thời Laptop + Điện thoại + Tablet, chứng minh củ sạc GaN thông minh tản nhiệt mát lạnh.'
      },
      {
        step: 'CHỐT ĐƠN HÀNG',
        title: 'Deal ưu đãi độc quyền từ Tranyoo',
        desc: 'Hướng dẫn người xem bấm vào giỏ hàng TikTok Shop để nhận deal trợ giá cực sốc trong campaign Tháng 9.'
      }
    ],
    hashtags: ['#Tranyoo', '#TranyooSample', '#TaiNgheTM26', '#SacNhanhGaN', '#CreatorCampaign', '#AffiliateTikTok'],
    cartBrandName: 'Tranyoo Vietnam Official',
    timeline: [
      {
        stepNum: '01',
        status: 'Đang diễn ra',
        date: 'Bước 1',
        title: 'Đăng Ký tham gia',
        desc: 'Điền đúng thông tin + link kênh TikTok (>1.000 Follower) để bên mình & team Tranyoo duyệt trong 12h.'
      },
      {
        stepNum: '02',
        status: 'Tiếp theo',
        date: 'Bước 2',
        title: 'KOC nhận mẫu free (5 Sample)',
        desc: 'Nhận sample 5 món phụ kiện công nghệ quốc dân. Làm video review/setup (Hạn 4 - 7 ngày).'
      },
      {
        stepNum: '03',
        status: 'Nghiệm thu',
        date: 'Bước 3',
        title: 'KOC trả video (Up lên Drive)',
        desc: 'Tải video lên Google Drive để team Tranyoo kiểm tra và duyệt nhanh trước khi lên sóng.'
      },
      {
        stepNum: '04',
        status: 'Quyết toán',
        date: 'Bước 4',
        title: 'Nhận hoa hồng sau khi có đơn',
        desc: 'Hưởng hoa hồng 9% cho tất cả sản phẩm + cơ hội hợp tác các campaign dài hạn tiếp theo cùng Tranyoo.'
      }
    ]
  }
];

export const INITIAL_APPLICATIONS: KOCApplication[] = [
  {
    id: 'app-8492',
    code: '#KOC-8492',
    kocName: 'Nguyễn Hoàng Mai',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJsWCo9PYAWwqUi4KI2AfBMS7-_Z7PzOzCQAoBa27hi8OLdSv0rZ63Kr-j8Ke6L4QnoEfurZDV2Ow99ZIu8uyIrKq8S-Uhi4KWLNumfLSK0HLvuQ_m-N0YFJoXshVXqHm-Kc_CUIwZ2u43ziZcmG1fHDj1F5btZEamqEVuYYP41FJE5nYxjch0x_rmaxA0mZG3d9pzjAbxMwqwHPgGWUZHovVLLW3eEsV3xsT9RMQZl0FPFbBM25K5',
    phone: '0903.114.882',
    email: 'mai.lifestyle@gmail.com',
    tiktokHandle: '@mai.desksetup',
    followers: '15.4K',
    followersCount: 15400,
    avgViews: 'Avg 22K views',
    address: '124 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    shippingCode: 'GHTK: 8492104921',
    shippingStatus: 'Đã phát thành công',
    createdAtTime: '10:45',
    createdAtDate: '04/11/2024',
    status: 'Đã duyệt gửi mẫu',
    videoLink: 'https://drive.google.com/file/d/1mai-gojodoq-review/view',
    videoViews: '48.2K',
    audience: 'HSSV & Dân văn phòng thích setup bàn làm việc tối giản',
    contentConcept: 'Unbox ASMR combo bàn phím bluetooth & bút cảm ứng Gojodoq cho iPad',
    campaignId: 'gojodoq-tech-lifestyle',
    campaignName: '⭐️ Phụ Kiện Gojodoq – Tech & Lifestyle (Freecast)',
    verified: true
  },
  {
    id: 'app-8493',
    code: '#KOC-8493',
    kocName: 'Trần Bảo Duy',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3ajuXK19m_7s5JHg0QhyxiJ_5Ayw-hljWfw67zskRsr3X1RzsSb1PeqRgB0Vm5Dqjw9TpPj1u1z5oziZUMAptO1bwWHYfruFOekVzZuqBFSIR_GuK1XAuJU1GS84CyQxjzv-58RKCXq6N94qtcwFKERAp4S6DqYbrlxVxJ3P1NWp2uzcSbol71TzQWF_Znah3-3fLZlRqru4WFF_HYS_b49W8mYrCBNRvLvKSvmUkDAkLca8TVQDV',
    phone: '0978.432.199',
    email: 'duytran.tech@gmail.com',
    tiktokHandle: '@duy.techreview',
    followers: '28.5K',
    followersCount: 28500,
    avgViews: 'Avg 35K views',
    address: '88 Lê Lợi, Phường 4, Gò Vấp, TP. Hồ Chí Minh',
    shippingCode: 'GHTK: 8492109842',
    shippingStatus: 'Đang trung chuyển',
    createdAtTime: '09:15',
    createdAtDate: '04/11/2024',
    status: 'Đã duyệt gửi mẫu',
    videoLink: '',
    videoViews: '',
    audience: 'Người dùng đồ công nghệ ngon bổ rẻ, HSSV',
    contentConcept: 'Test công suất sạc GaN 120W US9 và cáp sạc 240W Tranyoo',
    campaignId: 'tranyoo-creator-sample-september',
    campaignName: '🚨 [Tranyoo VN] Open Campaign Creator Sample Tháng 9',
    verified: false
  },
  {
    id: 'app-8494',
    code: '#KOC-8494',
    kocName: 'Lê Quỳnh Anh',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuBmVAtUe_q9B1NoYj9PiGrNPconEUBtUVlCgtVKfw3tJyRrKixRnVsCYgmdVkD5PmEdqCwHp8M4MuaXVbG89TTr1T_LT-bXR1Jx-t0u9OYuBn4eYDEFGmeRWMlEOnPV70QEYtfbiXjJJyKwaNFSYtLsj0-Gf-tEokHsMc4AGH1hVjD0TYPCFsKReZmeCqRN2iTyZ3ly_O6eTtv-oDqewOi3QMRzbpa4XX_L6BjAbFgIvCHUEQcHMf',
    phone: '0912.876.543',
    email: 'quynhanh.ootd@gmail.com',
    tiktokHandle: '@quynhanh.outfits',
    followers: '18.1K',
    followersCount: 18100,
    avgViews: 'Avg 24.2K views',
    address: 'Toà S2.05 Vinhome Smart City, Nam Từ Liêm, Hà Nội',
    shippingCode: '',
    shippingStatus: 'Chờ duyệt để sinh mã',
    createdAtTime: '08:30',
    createdAtDate: '04/11/2024',
    status: 'Chờ duyệt',
    videoLink: '',
    videoViews: '',
    audience: 'Bạn nữ yêu thích thời trang váy hở lưng, đầm dự tiệc',
    contentConcept: 'Tips mặc áo trễ vai và đầm body không lo lộ viền cùng Visecret Bra',
    campaignId: 'visecret-bra-fashion',
    campaignName: '🔥 [Visecret Bra] KOC Fashion & Lifestyle Hoa Hồng 10%',
    verified: false
  },
  {
    id: 'app-8488',
    code: '#KOC-8488',
    kocName: 'Phạm Minh Triết',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4oEUAMUB0pptZhm8UKIa6kW-gCMu5DChHl3AFEV0HmGGTNPD2XMM80kyyAE_H0S8gTyQE8ZvVrHjdOjlJ4epGsrvt1o1QFJeoK2FHC-DkCjhgV46Ucsc280QeQ7Uo9qLpQPqy-yNQ-o87qd4sUqJ4P9EHZmwhHtE-6VCWEtwMPbTKHAgib-43GdNTVEG6euxp_aRzUSiL8bGiylDrUe-zw27XUVtCfBpJsedRy9xNc95znPFfxhxu',
    phone: '0944.551.233',
    email: 'triet.techgadgets@gmail.com',
    tiktokHandle: '@triet_gadget_review',
    followers: '42.8K',
    followersCount: 42800,
    avgViews: 'Avg 55K views',
    address: '45 Trần Phú, Phường Hải Châu 1, Hải Châu, Đà Nẵng',
    shippingCode: 'GHTK: 8491823901',
    shippingStatus: 'Đã phát thành công',
    createdAtTime: '16:20',
    createdAtDate: '03/11/2024',
    status: 'Đã lên bài',
    videoLink: 'https://drive.google.com/file/d/1triet-tranyoo-review/view',
    videoViews: '62.6K',
    audience: 'Học sinh sinh viên tìm phụ kiện sạc nhanh giá rẻ',
    contentConcept: 'Top 3 củ sạc nhanh & sạc dự phòng Tranyoo đáng mua nhất năm 2025',
    campaignId: 'tranyoo-tech-lifestyle',
    campaignName: '🔥 [Tranyoo VN] KOC Tech/Lifestyle Hoa Hồng 9%',
    verified: true
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Hồ sơ nhận mẫu Gojodoq đã được duyệt!',
    message: 'Nhãn hàng Phụ kiện Gojodoq đã duyệt mẫu Bút cảm ứng & Bàn phím Bluetooth cho bạn. Hàng mẫu đang được ViettelPost giao hỏa tốc.',
    time: '10 phút trước',
    read: false,
    type: 'delivery'
  },
  {
    id: 'notif-2',
    title: 'Chiến dịch mới: Tranyoo Open Sample Tháng 9',
    message: 'Tranyoo vừa mở tuyển Creator nhận sample 5 món phụ kiện công nghệ quốc dân: Sạc GaN 120W, Cáp 240W, Tai nghe BT 5.3...',
    time: '1 giờ trước',
    read: false,
    type: 'campaign'
  },
  {
    id: 'notif-3',
    title: 'Hoa hồng Visecret Bra đã được ghi nhận',
    message: 'Bạn phát sinh 12 đơn hàng thành công từ video review Bra tàng hình Visecret, hoa hồng 10% đang được cập nhật về tài khoản.',
    time: 'Hôm qua',
    read: true,
    type: 'payout'
  }
];
