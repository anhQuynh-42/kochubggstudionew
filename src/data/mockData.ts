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

import comemGiftHero from '../assets/images/comem_gift_set_hero.jpg';
import bielendaHero from '../assets/images/bielenda_skincare_hero.jpg';
import lysmilegoHero from '../assets/images/lysmilego_hero.jpg';

export const COMEM_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="%23ecfdf5"/><rect x="15" y="15" width="90" height="90" rx="20" fill="%23059669"/><path d="M60 30c-15 0-25 10-25 25 0 18 25 35 25 35s25-17 25-35c0-15-10-25-25-25z" fill="%2334d399"/><path d="M60 40c-8 0-14 6-14 14 0 10 14 20 14 20s14-10 14-20c0-8-6-14-14-14z" fill="%23ffffff"/><text x="60" y="102" font-family="sans-serif" font-size="9" font-weight="900" fill="%23065f46" text-anchor="middle" letter-spacing="1">CỎ MỀM</text></svg>';

export const BIELENDA_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="%23f0f9ff"/><rect x="15" y="15" width="90" height="90" rx="20" fill="%230284c7"/><path d="M50 35h20v50H50z" fill="%23ffffff"/><path d="M35 50h50v20H35z" fill="%23ffffff"/><circle cx="60" cy="60" r="8" fill="%230284c7"/><text x="60" y="102" font-family="sans-serif" font-size="9" font-weight="900" fill="%230369a1" text-anchor="middle" letter-spacing="1">BIELENDA</text></svg>';

export const LYSMILEGO_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="%23faf5ff"/><rect x="15" y="15" width="90" height="90" rx="20" fill="%236366f1"/><path d="M40 45c0-10 10-15 20-15s20 5 20 15c0 15-8 35-20 45C48 80 40 60 40 45z" fill="%23ffffff"/><path d="M52 48l6 6 12-12" stroke="%236366f1" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><text x="60" y="102" font-family="sans-serif" font-size="8.5" font-weight="900" fill="%234338ca" text-anchor="middle" letter-spacing="1">LYSMILEGO</text></svg>';

export const APP_LOGOS = {
  kochub: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_74_qM_c9rS6xhr3GM7sF0_nhClMTLpRugvD0Zwj-E2Uvb4eFMcipolpJ__XJ9sE8w6D_0NfHalXJwy10G9KXewhxtV0YBdC4qWs98GwCVvqtVKkdXBi8P3KSHS4pR_5wTyKpvYjfEcKtxb511vZISCF8s_yD1vjd8na9RF3zutGxYP8nadCLupO7Mwr0xGHw9B-R43AVZPmpKGcJx0iJxf6Gz46VNThAgCZhuHmYTe3vOw1LvURs',
  userProfile: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoV0m73VoY07k3KAu4UYXOt7UQ4aRw3gOpFZYNUXO12CG31nzhjcvK-kkfdnGpLsEkoyVXvzvRQCeyyzz_q__iKcT97K74k5IjD3lYcToRBShK-8QK5Fzn1v9prbGRS9DMLCJyqo5sKYCbSAD0z6UA97eQ8XQhknSlGeUsve84FVC9TvAdbN6s85z5P7GeWfGPkxgpfth468LWt1dqLKVub0JApSsGP69CZ1NsVmz7xzHFvaseuw3y',
};

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "co-mem-sample-20-10",
    code: "CM-SAMPLE-2010",
    title: "🌸 [CỎ MỀM] SAMPLE 20/10 – COMBO QUÀ TẶNG THIÊN NHIÊN, HOA HỒNG 8% & 100% FREECAST 🎁",
    brandName: "Cỏ Mềm",
    brandLogo: COMEM_LOGO,
    category: "Mỹ phẩm & Chăm sóc da",
    daysLeft: 14,
    platform: "TikTok Shop",
    followerRequirement: "≥ 2.000 Followers",
    benefits: [{
        label: "Tặng mẫu 100% (Freecast)",
        icon: "featured_seasonal_and_gifts",
        type: "sample"
      }, {
        label: "8% Hoa hồng (Ưu đãi +2%)",
        icon: "percent",
        type: "commission"
      }, {
        label: "Kênh TikTok ≥ 2.000 Follower",
        icon: "verified",
        type: "other"
      }, {
        label: "15 Set quà 20/10 để chọn",
        icon: "redeem",
        type: "budget"
      }],
    totalSpots: 150,
    registeredSpots: 0,
    urgent: true,
    approvalRate: "95%",
    description: "Chiến dịch tặng mẫu Freecast đặc biệt chào mừng ngày Phụ Nữ Việt Nam 20/10 cùng Cỏ Mềm! Tuyển KOC trải nghiệm 15 combo quà tặng thiên nhiên hot nhất: Set Son Lụa Diễm + Cushion Thủy Tinh, Set Tơ Tằm dưỡng ẩm, Combo Sữa dưỡng thể Homelab 500g, Dầu gội xả giảm rụng tóc... Hoa hồng ưu đãi lên tới 8% (tăng 2% so với thông thường), hỗ trợ gắn link MCN độc quyền và đẩy traffic TikTok Shop! KOC nhận mẫu cam kết trả tối thiểu 2 video trong vòng 10 ngày từ khi nhận sản phẩm.",
    fullPrice: "220.000đ - 650.000đ",
    bookingFee: "Freecast (Mẫu 0đ)",
    commissionRate: "8%",
    productHeroImage: comemGiftHero,
    galleryImages: [comemGiftHero],
    uspList: [{
        title: "15 Set quà 20/10 đóng hộp sang trọng",
        desc: "Đầy đủ các dòng makeup, skincare tơ tằm, dưỡng thể homelab và chăm sóc tóc, cực kỳ dễ lên kịch bản quà tặng 20/10 cho Mẹ, Vợ, Người yêu, Cô giáo.",
        icon: "featured_seasonal_and_gifts"
      }, {
        title: "Mỹ phẩm thiên nhiên Lành & Thật",
        desc: "Thương hiệu Việt Nam uy tín hàng đầu, thành phần an toàn cho mẹ bầu và da nhạy cảm, không cồn khô, không hóa chất độc hại.",
        icon: "spa"
      }, {
        title: "Chính sách MCN: Hoa hồng 8% & Đẩy Traffic",
        desc: "Mức hoa hồng ưu đãi 8% (+2% so với thường). Ưu tiên duyệt nhanh KOC gắn link sản phẩm vào Showcase trang trưng bày TikTok.",
        icon: "trending_up"
      }],
    storySteps: [{
        step: "DẠNG CONTENT 1",
        title: "Gợi ý quà tặng 20/10 tinh tế & thiết thực",
        desc: "Unbox hộp quà chỉn chu, giới thiệu set quà vừa túi tiền nhưng cực sang trọng tặng Mẹ, Vợ, Người yêu, Cô giáo."
      }, {
        step: "DẠNG CONTENT 2",
        title: "Makeup nhanh 1 phút cùng Son Lụa & Cushion",
        desc: "Test chất son Lụa Diễm mềm môi, cushion thủy tinh mỏng nhẹ tự nhiên, quay cận hạt phấn dưới ánh sáng thật."
      }, {
        step: "DẠNG CONTENT 3",
        title: "Routine Skincare Tơ Tằm mùa hanh khô",
        desc: "Trải nghiệm Serum và Kem dưỡng Tơ Tằm, chia sẻ cảm nhận da mọng nước, mịn màng không bí rít."
      }, {
        step: "DẠNG CONTENT 4",
        title: "Chăm sóc cơ thể & tóc thư giãn tại nhà",
        desc: "Thử bọt sữa tắm thơm mát, dưỡng thể Homelab mềm mại và combo gội xả thảo mộc phục hồi tóc gãy rụng."
      }],
    hashtags: ["#CoMem", "#CoMemHomelab", "#QuaTang2010", "#SetQua2010", "#MyPhamThienNhien", "#TikTokShopAffiliate"],
    cartBrandName: "Cỏ Mềm Official Store",
    tiktokUrl: "https://forms.gle/d8N1RGBsFjyHwkMV8",
    tiktokHandle: "@comem_homelab",
    registrationFormUrl: "https://forms.gle/d8N1RGBsFjyHwkMV8",
    zaloGroupUrl: "https://zalo.me/g/eoq0vrp0q4ktnim57utc",
    minVideos: 2,
    videoDeadline: "10 ngày từ khi nhận SP",
    contentRequirement: "Review sản phẩm, lộ mặt hoặc unbox, có lồng tiếng. KHÔNG lắc sản phẩm",
    approvalCondition: "Thêm SP của brand vào trang trưng bày (showcase); ưu tiên duyệt KOC đã thêm",
    timeline: [{
        stepNum: "01",
        status: "Đang nhận đơn",
        date: "Bước 1",
        title: "Đăng ký & Chọn set mẫu 20/10",
        desc: "KOC điền form chọn 1 trong 15 set quà 20/10 (yêu cầu kênh TikTok ≥ 2.000 Follower). Duyệt hồ sơ trong 12h-24h."
      }, {
        stepNum: "02",
        status: "Giao hàng",
        date: "Bước 2",
        title: "Nhận sản phẩm mẫu Freecast",
        desc: "Cỏ Mềm gửi hộp quà mẫu chính hãng tận nhà miễn phí 100% qua đơn vị vận chuyển hỏa tốc."
      }, {
        stepNum: "03",
        status: "Lên bài",
        date: "Bước 3",
        title: "Lên tối thiểu 2 video trong 10 ngày",
        desc: "Sản xuất 2 video review/unbox theo brief, gắn đúng link MCN TikTok Shop và nộp link bài đăng trên web."
      }, {
        stepNum: "04",
        status: "Hoa hồng",
        date: "Bước 4",
        title: "Nhận 8% hoa hồng Affiliate",
        desc: "Tận dụng cao điểm mua sắm 20/10 để bùng nổ doanh số, nhận hoa hồng 8% trực tiếp từ TikTok Shop."
      }],
    sampleProducts: [{
        code: "CM01",
        name: "Set quà 20/10: Sữa dưỡng thể Homelab 500g + Kem dưỡng da tay",
        category: "Chăm sóc cơ thể",
        commission: "8%",
        shortDesc: "Bộ đôi dưỡng ẩm toàn thân và đôi tay, đóng hộp quà sẵn cho 20/10.",
        detailDesc: "Set gồm sữa dưỡng thể dòng Homelab dung tích 500g và kem dưỡng da tay của Cỏ Mềm, thương hiệu mỹ phẩm theo định hướng thành phần thiên nhiên. Sữa dưỡng thể giúp bổ sung độ ẩm cho da toàn thân, kem tay giúp đôi tay mềm mại, hạn chế khô ráp khi trời chuyển hanh. Đóng hộp quà sẵn, phù hợp tặng mẹ, vợ, người yêu hay cô giáo.",
        reviewTips: "Unbox hộp quà, test chất kem trên mu bàn tay; nhấn vào ý 'quà thiết thực mùa hanh khô', dung tích 500g dùng lâu.",
        tags: "20/10, quà tặng, dưỡng thể, dưỡng tay",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALYJuHiuC1p8"
      }, {
        code: "CM02",
        name: "Set quà 20/10: Son Lụa Diễm + Cushion Thủy Tinh",
        category: "Trang điểm",
        commission: "8%",
        shortDesc: "Combo trang điểm tự nhiên gồm son lụa và cushion, đủ cho một lớp makeup nhẹ nhàng.",
        detailDesc: "Set trang điểm gồm son Lụa Diễm chất mềm mịn và cushion phấn nước Thủy Tinh của Cỏ Mềm, hướng tới lớp nền mỏng nhẹ và đôi môi có sắc tự nhiên. Phù hợp với người thích makeup đơn giản đi học, đi làm hằng ngày. Đóng hộp quà, tiện làm quà 20/10.",
        reviewTips: "Video makeup nhanh 1 phút trước gương: dặm cushion, tô son, quay cận độ che phủ và màu son dưới ánh sáng tự nhiên.",
        tags: "20/10, quà tặng, trang điểm, son, cushion",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALYJxOwOQ2kp"
      }, {
        code: "CM03",
        name: "Set quà 20/10: Serum + Kem dưỡng Tơ Tằm",
        category: "Chăm sóc da mặt",
        commission: "8%",
        shortDesc: "Bộ đôi dưỡng da dòng Tơ Tằm: serum và kem dưỡng cho quy trình skincare cơ bản.",
        detailDesc: "Combo gồm serum và kem dưỡng thuộc dòng Tơ Tằm của Cỏ Mềm, dùng nối tiếp trong bước dưỡng để giúp da mềm mượt và đủ ẩm. Phù hợp làm quà cho người đã có thói quen skincare hoặc muốn bắt đầu một quy trình đơn giản.",
        reviewTips: "Quay texture serum và kem trên tay, chia sẻ cảm nhận sau vài ngày dùng; gợi ý thứ tự dùng serum trước, kem sau.",
        tags: "20/10, quà tặng, skincare, serum, kem dưỡng",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALYJuHiuT6nb"
      }, {
        code: "CM04",
        name: "Set quà 20/10: Bộ Đôi Môi Xinh (Son thiên nhiên + Son dưỡng)",
        category: "Chăm sóc môi",
        commission: "8%",
        shortDesc: "Son màu và son dưỡng đi cùng nhau: dưỡng trước, tô màu sau.",
        detailDesc: "Bộ đôi gồm một thỏi son màu và một thỏi son dưỡng của Cỏ Mềm, định hướng thành phần thiên nhiên. Son dưỡng giúp môi đủ ẩm trước khi tô màu, son màu cho đôi môi tươi tắn nhẹ nhàng. Giá vừa phải, dễ làm quà số lượng nhiều (cô giáo, đồng nghiệp).",
        reviewTips: "Swatch màu son trên môi, so môi trước – sau khi dưỡng; góc 'quà 20/10 vừa túi tiền'.",
        tags: "20/10, quà tặng, son, son dưỡng",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALYJxOwOhGEi"
      }, {
        code: "CM05",
        name: "Set quà 20/10: Kem dưỡng da tay + Bọt rửa mặt",
        category: "Chăm sóc da mặt",
        commission: "8%",
        shortDesc: "Combo làm sạch da mặt và dưỡng tay, hai món dùng mỗi ngày.",
        detailDesc: "Set gồm bọt rửa mặt và kem dưỡng da tay Cỏ Mềm. Bọt rửa mặt dạng tạo bọt sẵn, tiện dùng sáng và tối; kem tay giúp đôi tay mềm mại hơn. Đây là những món dùng hằng ngày nên rất 'thiết thực' khi làm quà.",
        reviewTips: "Quay độ bọt khi bấm vòi, cảm giác da sau rửa; kết hợp cảnh thoa kem tay lúc làm việc.",
        tags: "20/10, quà tặng, rửa mặt, dưỡng tay",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALYJuHiukJ4A"
      }, {
        code: "CM06",
        name: "Set quà 20/10: Bộ gội xả hỗ trợ giảm rụng & phục hồi tóc",
        category: "Chăm sóc tóc",
        commission: "8%",
        shortDesc: "Bộ gội xả dành cho tóc hư tổn, hỗ trợ hạn chế gãy rụng.",
        detailDesc: "Bộ dầu gội và dầu xả của Cỏ Mềm hướng tới mái tóc hư tổn, khô xơ, giúp làm sạch nhẹ nhàng và nuôi dưỡng tóc mềm mượt hơn, hỗ trợ hạn chế tình trạng gãy rụng khi chải gội. Phù hợp với người hay nhuộm, uốn, sấy.",
        reviewTips: "Quay mùi hương, độ bọt, cảm giác tóc sau khi xả và sấy khô; tránh cam kết 'hết rụng tóc' trong video.",
        tags: "20/10, quà tặng, dầu gội, dầu xả, tóc hư tổn",
        affiliateLink: ""
      }, {
        code: "CM07",
        name: "Set quà 20/10: Sữa tắm + Sữa dưỡng thể sáng da",
        category: "Chăm sóc cơ thể",
        commission: "8%",
        shortDesc: "Bộ chăm sóc da toàn thân: tắm sạch và dưỡng sáng, hỗ trợ chống lão hóa.",
        detailDesc: "Set gồm sữa tắm và sữa dưỡng thể Cỏ Mềm, dùng nối tiếp trong quy trình chăm sóc cơ thể. Sữa tắm làm sạch dịu nhẹ, sữa dưỡng thể giúp da mềm mịn, hỗ trợ da trông sáng khỏe và hạn chế dấu hiệu lão hóa khi dùng đều đặn.",
        reviewTips: "Routine tắm tối: quay texture, mùi hương, cảm giác da sau dưỡng; nói rõ hiệu quả cần dùng đều.",
        tags: "20/10, quà tặng, sữa tắm, dưỡng thể",
        affiliateLink: ""
      }, {
        code: "CM08",
        name: "Set quà 20/10: Bọt rửa mặt + Mặt nạ chiết xuất thiên nhiên",
        category: "Chăm sóc da mặt",
        commission: "8%",
        shortDesc: "Combo làm sạch và đắp mặt nạ dưỡng da, chiết xuất thiên nhiên.",
        detailDesc: "Set gồm bọt rửa mặt và mặt nạ dưỡng da Cỏ Mềm. Rửa mặt sạch trước, sau đó đắp mặt nạ để bổ sung độ ẩm, giúp da dịu và mềm hơn sau một ngày dài. Phù hợp làm quà 'chăm sóc bản thân' cho người bận rộn.",
        reviewTips: "Video 'tối thư giãn': rửa mặt, đắp mặt nạ, quay da trước – sau 15 phút.",
        tags: "20/10, quà tặng, rửa mặt, mặt nạ",
        affiliateLink: ""
      }, {
        code: "CM09",
        name: "Set quà 20/10: Sữa rửa mặt tạo bọt + Son dưỡng môi",
        category: "Chăm sóc da mặt",
        commission: "8%",
        shortDesc: "Combo làm sạch da mặt và dưỡng môi, hỗ trợ cải thiện môi khô nẻ.",
        detailDesc: "Set gồm sữa rửa mặt tạo bọt và son dưỡng môi thiên nhiên Cỏ Mềm. Sữa rửa mặt làm sạch nhẹ nhàng, son dưỡng giúp môi đủ ẩm, hỗ trợ giảm khô nẻ và thâm môi khi dùng thường xuyên. Hai món nhỏ gọn, dùng hằng ngày.",
        reviewTips: "Cận cảnh môi khô trước và sau vài ngày dùng son dưỡng; test bọt rửa mặt.",
        tags: "20/10, quà tặng, rửa mặt, son dưỡng",
        affiliateLink: ""
      }, {
        code: "CM10",
        name: "Set quà 20/10: Dầu gội + Sữa tắm dưỡng ẩm",
        category: "Chăm sóc tóc & cơ thể",
        commission: "8%",
        shortDesc: "Bộ đôi cho phòng tắm: dầu gội và sữa tắm dưỡng ẩm từ thiên nhiên.",
        detailDesc: "Combo gồm dầu gội và sữa tắm Cỏ Mềm, giúp làm sạch tóc và cơ thể, đồng thời bổ sung độ ẩm để da mềm mịn, trông sáng khỏe hơn. Món quà dùng hằng ngày, hợp tặng mẹ hoặc cả gia đình.",
        reviewTips: "Góc 'quà tặng mẹ': unbox, quay mùi hương, độ bọt; nhấn vào yếu tố dùng được cho cả nhà.",
        tags: "20/10, quà tặng, dầu gội, sữa tắm",
        affiliateLink: ""
      }, {
        code: "CM11",
        name: "Set quà 20/10: Son dưỡng + Kem dưỡng da tay",
        category: "Chăm sóc môi & tay",
        commission: "8%",
        shortDesc: "Hai món nhỏ gọn để trong túi: son dưỡng và kem tay dưỡng ẩm.",
        detailDesc: "Combo son dưỡng thiên nhiên và kem dưỡng da tay Cỏ Mềm, giúp môi và tay luôn đủ ẩm, mềm mịn trong mùa hanh khô. Kích thước nhỏ gọn, mang theo đi học, đi làm. Mức giá dễ chịu, hợp mua tặng nhiều người.",
        reviewTips: "Video 'trong túi mình có gì mùa thu', dùng son và kem tay giữa ngày.",
        tags: "20/10, quà tặng, son dưỡng, dưỡng tay",
        affiliateLink: ""
      }, {
        code: "CM12",
        name: "Set quà 20/10: Son dưỡng + Hộp 5 mặt nạ",
        category: "Chăm sóc môi & da mặt",
        commission: "8%",
        shortDesc: "Son dưỡng môi kèm hộp 5 mặt nạ dưỡng da cho cả tuần.",
        detailDesc: "Set gồm một thỏi son dưỡng và hộp 5 miếng mặt nạ dưỡng da Cỏ Mềm. Mặt nạ giúp bổ sung ẩm, làm dịu da sau ngày dài; son dưỡng giữ môi mềm. Phù hợp tặng người muốn có 'góc chăm sóc bản thân' đơn giản.",
        reviewTips: "Vlog 5 ngày đắp mặt nạ, quay da trước – sau; kết thúc bằng son dưỡng.",
        tags: "20/10, quà tặng, mặt nạ, son dưỡng",
        affiliateLink: ""
      }, {
        code: "CM13",
        name: "Set quà 20/10: Sữa tắm + Kem dưỡng da tay",
        category: "Chăm sóc cơ thể",
        commission: "8%",
        shortDesc: "Sữa tắm và kem tay: bộ chăm sóc cơ bản, dùng mỗi ngày.",
        detailDesc: "Combo gồm sữa tắm và kem dưỡng da tay Cỏ Mềm. Sữa tắm làm sạch dịu nhẹ, kem tay giúp đôi tay mềm mại, giảm khô ráp. Món quà thiết thực cho bạn gái, mẹ hoặc cô giáo.",
        reviewTips: "Góc 'quà cho bạn gái dưới 200k' (kiểm tra giá thực tế trước khi nói), unbox và test sản phẩm.",
        tags: "20/10, quà tặng, sữa tắm, dưỡng tay",
        affiliateLink: ""
      }, {
        code: "CM14",
        name: "Set quà 20/10: Kem dưỡng da tay + Hộp 5 mặt nạ thạch dừa",
        category: "Chăm sóc tay & da mặt",
        commission: "8%",
        shortDesc: "Kem tay kèm 5 miếng mặt nạ thạch dừa mát lạnh, ôm sát da.",
        detailDesc: "Set gồm kem dưỡng da tay và hộp 5 miếng mặt nạ dạng thạch dừa của Cỏ Mềm. Mặt nạ thạch dừa có chất liệu ôm sát mặt, giúp cấp ẩm và làm dịu da; kem tay giúp tay mềm mịn. Món quà nhỏ nhưng có trải nghiệm thú vị.",
        reviewTips: "Quay cận chất liệu thạch dừa khi bóc mặt nạ (điểm khác biệt), cảm giác da sau khi gỡ.",
        tags: "20/10, quà tặng, mặt nạ thạch dừa, dưỡng tay",
        affiliateLink: ""
      }, {
        code: "CM15",
        name: "Hộp quà cao cấp 20/10 – Set Quà Thanh Xuân",
        category: "Set quà cao cấp",
        commission: "8%",
        shortDesc: "Phiên bản hộp quà cao cấp, tập trung chăm sóc và hỗ trợ ngừa lão hóa da.",
        detailDesc: "Set Quà Thanh Xuân là phiên bản đặc biệt của Cỏ Mềm, đóng hộp cao cấp với các sản phẩm chăm sóc da hướng tới hỗ trợ hạn chế dấu hiệu lão hóa. Phù hợp làm quà trang trọng cho mẹ, vợ hoặc cô giáo. (Cần xác nhận thành phần trong hộp với brand.)",
        reviewTips: "Unbox sang trọng, giới thiệu từng món trong hộp; góc 'quà 20/10 cho mẹ'.",
        tags: "20/10, quà tặng cao cấp, chống lão hóa",
        affiliateLink: ""
      }]
  },
  {
    id: "bielenda-sample-thang-10",
    code: "BL-SAMPLE-1025",
    title: "✨ [TOPTOTOES x BIELENDA] DƯỢC MỸ PHẨM BA LAN – HOA HỒNG 11% & TẶNG MẪU FREECAST THÁNG 10 🔬",
    brandName: "TOPTOTOES x BIELENDA",
    brandLogo: BIELENDA_LOGO,
    category: "Mỹ phẩm & Chăm sóc da",
    daysLeft: 16,
    platform: "TikTok Shop",
    followerRequirement: "≥ 1.000 Followers",
    benefits: [{
        label: "Tặng mẫu 100% (Freecast)",
        icon: "featured_seasonal_and_gifts",
        type: "sample"
      }, {
        label: "11% Hoa hồng Affiliate (Độc quyền)",
        icon: "percent",
        type: "commission"
      }, {
        label: "Kênh TikTok ≥ 1.000 Follower",
        icon: "verified",
        type: "other"
      }, {
        label: "11 Sản phẩm Skincare chuẩn Lab",
        icon: "science",
        type: "budget"
      }],
    totalSpots: 120,
    registeredSpots: 0,
    urgent: true,
    approvalRate: "93%",
    description: "Chiến dịch Dược mỹ phẩm Bielenda Ba Lan phối hợp cùng TOPTOTOES dành riêng cho Creator đam mê Skincare khoa học! Nhận mẫu 0đ loạt siêu phẩm bán chạy hàng đầu: Toner Bielenda Super Power Mezo, Kem dưỡng ẩm Niacinamide Dr Medica Anti-acne, Toner Good Skin Acid Peel, Dưỡng thể Bio Vitamin C, Toner Compliment Glycolic Acid... Hoa hồng lên đến 11% (+1% ưu đãi), hỗ trợ gắn link showcase và duyệt kênh thần tốc!",
    fullPrice: "185.000đ - 420.000đ",
    bookingFee: "Freecast (Mẫu 0đ)",
    commissionRate: "11%",
    productHeroImage: bielendaHero,
    galleryImages: [bielendaHero],
    uspList: [{
        title: "Dược mỹ phẩm hàng đầu Ba Lan & Châu Âu",
        desc: "Bielenda nổi tiếng với các hoạt chất chuẩn khoa học: Niacinamide, AHA/BHA Acid Peel, Vitamin C sinh học, an toàn cho mọi loại da.",
        icon: "science"
      }, {
        title: "11 Sản phẩm Skincare giải quyết từng vấn đề da",
        desc: "Từ kiềm dầu mờ mụn Dr Medica, căng bóng mờ thâm Super Power Mezo đến phục hồi Good Skin và dưỡng sáng cơ thể Bio Vitamin C.",
        icon: "healing"
      }, {
        title: "Hoa hồng 11% & Cơ chế hỗ trợ KOC",
        desc: "Hoa hồng cực cao 11%, KOC chỉ cần gắn link showcase, lên tối thiểu 2 video review chân thật trong vòng 10 ngày từ khi nhận mẫu.",
        icon: "trending_up"
      }],
    storySteps: [{
        step: "DẠNG CONTENT 1",
        title: "Skincare Routine da mụn & da dầu cùng Dr Medica",
        desc: "Chia sẻ tình trạng da thật, test toner kiềm dầu và kem dưỡng Niacinamide thấm nhanh không bóng dầu."
      }, {
        step: "DẠNG CONTENT 2",
        title: "Trải nghiệm Toner Acid Peel tẩy da chết nhẹ nhàng",
        desc: "Hướng dẫn cách dùng AHA/BHA chuẩn khoa học cho người mới, thoa bông nhẹ nhàng và nhắc nhở chống nắng kỹ ban ngày."
      }, {
        step: "DẠNG CONTENT 3",
        title: "Review Serum Super Power Mezo căng bóng mờ thâm",
        desc: "Cận cảnh giọt tinh chất đậm đặc, cảm nhận độ ngậm nước sau 1 đêm ngủ dậy và so sánh độ mịn da."
      }, {
        step: "DẠNG CONTENT 4",
        title: "Dưỡng thể sáng da Bio Vitamin C toàn thân",
        desc: "Test chất sữa dưỡng thể mỏng nhẹ, hương thơm cam quýt sảng khoái và dưỡng sáng tự nhiên không nuôi lông."
      }],
    hashtags: ["#Bielenda", "#ToptoToes", "#BielendaVietnam", "#DrMedica", "#SkincareRoutine", "#TikTokShopAffiliate"],
    cartBrandName: "Toptotoes.vn Official",
    tiktokUrl: "https://forms.gle/p1DWbmxjk2DLk4oa7",
    tiktokHandle: "@toptotoes.vn",
    registrationFormUrl: "https://forms.gle/p1DWbmxjk2DLk4oa7",
    zaloGroupUrl: "https://zalo.me/g/nmlvkzudkdtttsvfbczm",
    minVideos: 2,
    videoDeadline: "10 ngày từ khi nhận SP",
    contentRequirement: "Review sản phẩm, lộ mặt hoặc unbox, có lồng tiếng. KHÔNG lắc sản phẩm",
    approvalCondition: "Thêm SP của brand vào trang trưng bày (showcase); ưu tiên duyệt KOC đã thêm",
    timeline: [{
        stepNum: "01",
        status: "Đang nhận đơn",
        date: "Bước 1",
        title: "Đăng ký & Chọn SKU Dược Mỹ Phẩm",
        desc: "KOC điền form chọn sản phẩm phù hợp loại da (yêu cầu kênh TikTok ≥ 1.000 Follower). Duyệt hồ sơ trong 12h."
      }, {
        stepNum: "02",
        status: "Giao hàng",
        date: "Bước 2",
        title: "Nhận sản phẩm mẫu Bielenda 0đ",
        desc: "Kho xuất hàng chính ngạch Ba Lan gửi tận nơi. KOC kiểm tra seal và chuẩn bị nội dung review."
      }, {
        stepNum: "03",
        status: "Lên bài",
        date: "Bước 3",
        title: "Đăng 2 video review khoa học",
        desc: "Lên video lộ mặt/unbox chia sẻ kiến thức skincare, gắn link sản phẩm showcase trong vòng 10 ngày."
      }, {
        stepNum: "04",
        status: "Hoa hồng",
        date: "Bước 4",
        title: "Hưởng 11% hoa hồng độc quyền",
        desc: "Mức hoa hồng 11% cực cao cho mảng dược mỹ phẩm, chuyển tiền đối soát minh bạch hàng tuần."
      }],
    sampleProducts: [{
        code: "BL01",
        name: "Toner Bielenda Super Power Mezo 200ml (Correcting / Moisturizing)",
        category: "Toner",
        commission: "11%",
        shortDesc: "Toner dòng Super Power Mezo, có bản Correcting (đều màu da) và Moisturizing (cấp ẩm).",
        detailDesc: "Toner thuộc dòng Super Power Mezo Skin Clinic của Bielenda (Ba Lan), dung tích 200ml. Phiên bản Correcting hướng tới hỗ trợ da đều màu, mờ thâm; phiên bản Moisturizing tập trung cấp ẩm cho da khô, mất nước. Dùng sau bước làm sạch để cân bằng da và chuẩn bị cho các bước dưỡng tiếp theo. (Xác nhận phiên bản gửi mẫu với brand.)",
        reviewTips: "Nói rõ mình nhận bản nào và vì sao hợp da mình; quay texture, cách vỗ bằng tay hoặc bông.",
        tags: "toner, Bielenda, Super Power Mezo, cấp ẩm, mờ thâm",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALXwpsra7TIr"
      }, {
        code: "BL02",
        name: "Toner Bielenda Dr Medica Anti-acne 250ml",
        category: "Toner",
        commission: "11%",
        shortDesc: "Toner dòng Dr Medica dành cho da dầu, da dễ nổi mụn.",
        detailDesc: "Toner thuộc dòng Dr Medica Anti-acne của Bielenda, dung tích 250ml, dành cho làn da dầu và dễ nổi mụn. Giúp làm sạch sâu sau bước rửa mặt, hỗ trợ kiểm soát dầu và giữ lỗ chân lông thông thoáng. Phù hợp đưa vào routine hằng ngày của da mụn.",
        reviewTips: "Phù hợp KOC có da dầu/mụn: chia sẻ tình trạng da thật, cập nhật sau 7–10 ngày; tránh cam kết 'trị mụn'.",
        tags: "toner, da mụn, da dầu, Bielenda, Dr Medica",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALXwpsnVxVum"
      }, {
        code: "BL03",
        name: "Kem dưỡng ẩm Niacinamide Bielenda Dr Medica Anti-acne",
        category: "Kem dưỡng",
        commission: "11%",
        shortDesc: "Kem dưỡng chứa Niacinamide cho da mụn, cấp ẩm mà không gây nặng mặt.",
        detailDesc: "Kem dưỡng ẩm dòng Dr Medica Anti-acne của Bielenda với Niacinamide, dành cho da dầu mụn. Giúp cấp ẩm cần thiết cho da, hỗ trợ điều tiết dầu và làm dịu vùng da đang có mụn. Có thể dùng cùng toner Dr Medica Anti-acne để tạo bộ đôi chăm sóc da mụn.",
        reviewTips: "Ghép với toner BL02 thành routine da mụn; quay độ thấm, mức độ bóng dầu sau vài giờ.",
        tags: "kem dưỡng, niacinamide, da mụn, Bielenda",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALXwpsraOZuZ"
      }, {
        code: "BL04",
        name: "Toner Bielenda Good Skin 200ml",
        category: "Toner",
        commission: "11%",
        shortDesc: "Toner dòng Good Skin giúp cân bằng và chuẩn bị da cho bước dưỡng.",
        detailDesc: "Toner thuộc dòng Good Skin của Bielenda, dung tích 200ml. Dùng sau bước làm sạch để cân bằng da, làm sạch lại cặn bẩn còn sót và giúp các bước dưỡng sau thẩm thấu tốt hơn. Phù hợp cho routine skincare cơ bản hằng ngày. (Xác nhận phiên bản/thành phần chính với brand.)",
        reviewTips: "Video routine sáng đơn giản 3 bước có toner; quay texture và cảm giác da sau khi vỗ.",
        tags: "toner, Bielenda, Good Skin",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALXwpsnWEa6E"
      }, {
        code: "BL05",
        name: "Serum Bielenda Super Power Mezo – căng bóng, mờ thâm",
        category: "Serum",
        commission: "11%",
        shortDesc: "Serum dòng Super Power Mezo giúp da căng bóng, hỗ trợ mờ thâm.",
        detailDesc: "Serum thuộc dòng Super Power Mezo Skin Clinic của Bielenda, hướng tới làn da căng bóng, đủ ẩm và hỗ trợ làm mờ vết thâm khi dùng đều đặn. Dùng sau toner, trước kem dưỡng. Có thể kết hợp toner và kem dưỡng cùng dòng để tạo bộ chăm sóc đồng bộ.",
        reviewTips: "Quay độ căng bóng của da dưới ánh sáng tự nhiên; theo dõi vết thâm sau 10 ngày (nói rõ cần dùng lâu hơn để thấy rõ).",
        tags: "serum, căng bóng, mờ thâm, Bielenda, Super Power Mezo",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALXwpsrafYdn"
      }, {
        code: "BL06",
        name: "Kem dưỡng Bielenda Super Power Mezo Correcting – sáng da, mờ thâm",
        category: "Kem dưỡng",
        commission: "11%",
        shortDesc: "Kem dưỡng dòng Super Power Mezo Correcting, hỗ trợ sáng da và mờ thâm.",
        detailDesc: "Kem dưỡng Super Power Mezo Skin Clinic phiên bản Correcting của Bielenda, giúp khóa ẩm ở bước cuối routine và hỗ trợ da sáng hơn, đều màu hơn, làm mờ thâm khi dùng thường xuyên. Phù hợp với da xỉn màu, có vết thâm sau mụn.",
        reviewTips: "Ghép với serum BL05; quay texture kem, độ thấm, da sau 1 đêm.",
        tags: "kem dưỡng, sáng da, mờ thâm, Bielenda",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALXwpsnWVoxn"
      }, {
        code: "BL07",
        name: "Toner tẩy da chết Bielenda Good Skin Acid Peel 200ml",
        category: "Toner tẩy tế bào chết",
        commission: "11%",
        shortDesc: "Toner chứa acid giúp tẩy tế bào chết nhẹ nhàng, da mịn và thông thoáng hơn.",
        detailDesc: "Toner Good Skin Acid Peel của Bielenda, dung tích 200ml, có cơ chế tẩy tế bào chết hóa học dịu nhẹ (micro-exfoliating). Giúp loại bỏ lớp da chết, hỗ trợ bề mặt da mịn hơn và lỗ chân lông thông thoáng. Nên dùng buổi tối và luôn dùng kem chống nắng vào ban ngày. Đang có chương trình sale theo bài đăng của brand.",
        reviewTips: "Nhắc người xem test vùng nhỏ trước và dùng kem chống nắng; quay bề mặt da cận cảnh trước – sau.",
        tags: "toner, tẩy tế bào chết, AHA/BHA, Bielenda, Good Skin, sale",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALXwpsrawbJs"
      }, {
        code: "BL08",
        name: "Kem dưỡng đêm Bielenda Dr Medica Overpigmentation – Step 2",
        category: "Kem dưỡng đêm",
        commission: "11%",
        shortDesc: "Kem dưỡng ban đêm hỗ trợ làm sáng và cải thiện vùng da tăng sắc tố.",
        detailDesc: "Kem dưỡng đêm thuộc dòng Dr Medica Overpigmentation của Bielenda, là bước 2 trong bộ chăm sóc da tăng sắc tố. Giúp dưỡng ẩm qua đêm, hỗ trợ làm sáng da và làm mờ các vùng da sẫm màu khi dùng kiên trì. Phù hợp với da có thâm, nám nhẹ, da không đều màu.",
        reviewTips: "Routine tối; nhấn mạnh là 'Step 2' và giải thích vị trí trong quy trình; dùng kem chống nắng ban ngày.",
        tags: "kem dưỡng đêm, sáng da, tăng sắc tố, Bielenda, Dr Medica",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALXwph9evemK"
      }, {
        code: "BL09",
        name: "Sữa dưỡng thể Bielenda Bio Vitamin C + Niacinamide 250ml",
        category: "Dưỡng thể",
        commission: "11%",
        shortDesc: "Sữa dưỡng thể Vitamin C kết hợp Niacinamide, giúp da sáng mịn. Tặng găng tay thoa kem.",
        detailDesc: "Sữa dưỡng thể dòng Bio Vitamin C của Bielenda kết hợp Niacinamide, dung tích 250ml. Giúp dưỡng ẩm và hỗ trợ làn da cơ thể sáng mịn, đều màu hơn khi dùng thường xuyên. Theo bài đăng của brand, sản phẩm có tặng kèm găng tay thoa kem body.",
        reviewTips: "Quay texture, độ thấm trên tay/chân, mùi hương; cho thấy cách dùng găng tay thoa kem.",
        tags: "dưỡng thể, vitamin C, niacinamide, Bielenda, quà tặng kèm",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALXwpsrbDfbj"
      }, {
        code: "BL10",
        name: "Dưỡng thể Bielenda Bio Vitamin C 400ml (mua 1 tặng 1)",
        category: "Dưỡng thể",
        commission: "11%",
        shortDesc: "Combo mua 1 tặng 1 dưỡng thể Vitamin C 400ml, dưỡng ẩm và làm đẹp da.",
        detailDesc: "Dưỡng thể Bio Vitamin C của Bielenda dung tích 400ml, giúp dưỡng ẩm và hỗ trợ làn da cơ thể mềm mịn, tươi sáng. Chương trình mua 1 tặng 1 (tổng 2 chai 400ml), dùng được lâu, phù hợp cả gia đình hoặc chia sẻ với bạn bè.",
        reviewTips: "Nhấn mạnh deal mua 1 tặng 1 ngay 3 giây đầu; quay 2 chai, texture và cảm giác da.",
        tags: "dưỡng thể, vitamin C, mua 1 tặng 1, Bielenda",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALXwph9fChD8"
      }, {
        code: "BL11",
        name: "Toner Compliment 10% Glycolic Acid & Lô hội",
        category: "Toner tẩy tế bào chết",
        commission: "11%",
        shortDesc: "Toner Glycolic Acid 10% kết hợp lô hội: tẩy da chết nhẹ và cấp nước.",
        detailDesc: "Toner của thương hiệu Compliment với 10% Glycolic Acid (AHA) kết hợp chiết xuất lô hội. Glycolic Acid giúp tẩy tế bào chết, hỗ trợ da mịn và sáng hơn; lô hội giúp cấp nước, làm dịu. Nên dùng buổi tối, bắt đầu với tần suất thấp và luôn dùng kem chống nắng ban ngày. (SP chỉ có trong form, không có trong bài đăng nhóm – xác nhận lại với brand.)",
        reviewTips: "Hướng dẫn tần suất dùng cho người mới với AHA, nhắc patch test và chống nắng.",
        tags: "toner, glycolic acid, AHA, lô hội, Compliment",
        affiliateLink: ""
      }]
  },
  {
    id: "lysmilego-sample-thang-10",
    code: "LY-SAMPLE-1025",
    title: "🦷 [REDUBEAUTY x LYSMILEGO] TẨY TRẮNG RĂNG TẠI NHÀ – HOA HỒNG 12% & KHÔNG GIỚI HẠN FOLLOWER 🔥",
    brandName: "REDUBEAUTY x LYSMILEGO",
    brandLogo: LYSMILEGO_LOGO,
    category: "Chăm sóc cá nhân & Răng miệng",
    daysLeft: 18,
    platform: "TikTok Shop",
    followerRequirement: "Không yêu cầu Follower (Cả Newbie)",
    benefits: [{
        label: "Tặng mẫu 100% (Freecast)",
        icon: "featured_seasonal_and_gifts",
        type: "sample"
      }, {
        label: "12% Hoa hồng (Khủng nhất mảng)",
        icon: "percent",
        type: "commission"
      }, {
        label: "Không giới hạn Follower",
        icon: "verified",
        type: "other"
      }, {
        label: "3 Sản phẩm Hot Trend nụ cười",
        icon: "mood",
        type: "budget"
      }],
    totalSpots: 100,
    registeredSpots: 0,
    urgent: true,
    approvalRate: "96%",
    description: "Chiến dịch bùng nổ chăm sóc nụ cười cùng REDUBEAUTY x LYSMILEGO! Cơ hội vàng cho KOC mọi cấp độ (kể cả kênh mới lập): Tặng mẫu 0đ Miếng dán trắng răng không dấu vết, Miếng dán trắng răng PAP Gen 2 không ê buốt và Kem đánh răng Probiotics bảo vệ 7 lớp. Mức hoa hồng Affiliate cao kỷ lục 12% (tăng 4% so với thường)! Yêu cầu nộp 2 video trong 10 ngày sau khi nhận mẫu.",
    fullPrice: "150.000đ - 390.000đ",
    bookingFee: "Freecast (Mẫu 0đ)",
    commissionRate: "12%",
    productHeroImage: lysmilegoHero,
    galleryImages: [lysmilegoHero],
    uspList: [{
        title: "Công nghệ làm trắng răng PAP Gen 2 tân tiến",
        desc: "Không chứa peroxide độc hại, không gây ê buốt hay kích ứng nướu, có thể dùng hàng ngày cực kỳ êm ái cho răng nhạy cảm.",
        icon: "sentiment_very_satisfied"
      }, {
        title: "Kem đánh răng Probiotics bảo vệ 7 lớp",
        desc: "Bổ sung lợi khuẩn đường miệng, khử khuẩn hôi miệng suốt 24h và hỗ trợ trắng sáng 4 lớp chuyên sâu.",
        icon: "clean_hands"
      }, {
        title: "Hoa hồng 12% & Không giới hạn Follower",
        desc: "Phù hợp mọi KOC Newbie, hoa hồng 12% cao nhất thị trường, dễ dàng tạo viral video trước/sau khi dán.",
        icon: "celebration"
      }],
    storySteps: [{
        step: "DẠNG CONTENT 1",
        title: "Demo cách dán răng & Thử thách 7 ngày răng sáng",
        desc: "Quay cận cảnh dán miếng LYSMILEGO trong suốt, vừa làm việc vừa dán cực kỳ tiện lợi."
      }, {
        step: "DẠNG CONTENT 2",
        title: "Chia sẻ cảm nhận Không hề ê buốt một chút nào",
        desc: "Nhấn mạnh công nghệ PAP Gen 2 êm dịu, đánh tan nỗi sợ ê buốt khi tẩy trắng răng của giới trẻ."
      }, {
        step: "DẠNG CONTENT 3",
        title: "Routine chăm sóc răng miệng sáng & tối với Probiotics",
        desc: "Quay bọt kem đánh răng thơm bạc hà mát lạnh, hơi thở thơm tho tự tin giao tiếp cả ngày."
      }, {
        step: "DẠNG CONTENT 4",
        title: "So sánh nụ cười Trước - Sau dưới cùng góc ánh sáng",
        desc: "Bảng đo độ trắng răng chân thực, kích thích khách hàng bấm ngay vào giỏ hàng Shopee/TikTok Shop."
      }],
    hashtags: ["#Lysmilego", "#ReduBeauty", "#MiengDanTrangRang", "#TrangRangTaiNha", "#PAPGen2", "#KemDanhRangProbiotics"],
    cartBrandName: "LYSMILEGO Vietnam Official",
    tiktokUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfk6gsMW2L4O_YuM7IG4Cih5CBfOf6sF3VDgr8Cr2ibqF1Z6A/viewform",
    tiktokHandle: "@lysmilego.vn",
    registrationFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfk6gsMW2L4O_YuM7IG4Cih5CBfOf6sF3VDgr8Cr2ibqF1Z6A/viewform",
    zaloGroupUrl: "https://zalo.me/g/eoq0vrp0q4ktnim57utc",
    minVideos: 2,
    videoDeadline: "10 ngày từ khi nhận SP",
    contentRequirement: "Review sản phẩm, lộ mặt hoặc unbox, có lồng tiếng. KHÔNG lắc sản phẩm",
    approvalCondition: "Thêm SP của brand vào trang trưng bày (showcase); ưu tiên duyệt KOC đã thêm",
    timeline: [{
        stepNum: "01",
        status: "Đang nhận đơn",
        date: "Bước 1",
        title: "Đăng ký nhận set trắng răng",
        desc: "Không giới hạn số lượng Follower! Bất kỳ KOC nào có tài khoản TikTok đều có thể đăng ký nhận mẫu 0đ."
      }, {
        stepNum: "02",
        status: "Giao hàng",
        date: "Bước 2",
        title: "Nhận sản phẩm trải nghiệm tại nhà",
        desc: "Giao hàng nhanh miếng dán trắng răng hoặc kem đánh răng Probiotics miễn phí 100%."
      }, {
        stepNum: "03",
        status: "Lên bài",
        date: "Bước 3",
        title: "Trả 2 video trải nghiệm trong 10 ngày",
        desc: "Lên bài so sánh nụ cười, demo cách dán và review cảm nhận êm dịu không ê buốt."
      }, {
        stepNum: "04",
        status: "Hoa hồng",
        date: "Bước 4",
        title: "Nhận hoa hồng khủng 12%",
        desc: "Mức hoa hồng kỷ lục 12% cho mỗi tuýp kem và hộp miếng dán bán ra qua link affiliate."
      }],
    sampleProducts: [{
        code: "LY01",
        name: "Miếng dán hỗ trợ trắng răng LYSMILEGO (không để lại dấu vết)",
        category: "Làm trắng răng",
        commission: "12%",
        shortDesc: "Miếng dán trắng răng mỏng, không để lại dấu vết, dùng tại nhà.",
        detailDesc: "Miếng dán hỗ trợ làm trắng răng của LYSMILEGO, thiết kế mỏng, bám sát bề mặt răng và không để lại dấu vết sau khi gỡ. Tiện dùng tại nhà, có thể vừa dán vừa làm việc khác. Hỗ trợ cải thiện màu răng ố vàng khi dùng theo liệu trình hướng dẫn.",
        reviewTips: "Quay cận răng trước – sau liệu trình dưới cùng một điều kiện ánh sáng; demo cách dán và gỡ.",
        tags: "trắng răng, miếng dán, LYSMILEGO, chăm sóc răng miệng",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALV7uEmykzkB"
      }, {
        code: "LY02",
        name: "Miếng dán trắng răng PAP thế hệ 2 LYSMILEGO",
        category: "Làm trắng răng",
        commission: "12%",
        shortDesc: "Miếng dán trắng răng dùng PAP, được brand giới thiệu là dịu nhẹ, dùng hằng ngày.",
        detailDesc: "Miếng dán trắng răng thế hệ 2 của LYSMILEGO sử dụng PAP – hoạt chất làm trắng không chứa peroxide, được brand giới thiệu là dịu nhẹ, hạn chế ê buốt và kích ứng nên có thể dùng hằng ngày. Phù hợp với người có răng nhạy cảm muốn cải thiện màu răng tại nhà.",
        reviewTips: "Nói về cảm giác ê buốt (có/không) sau khi dùng; so sánh màu răng bằng bảng màu hoặc ảnh cùng ánh sáng.",
        tags: "trắng răng, PAP, răng nhạy cảm, LYSMILEGO",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALV7vtkhh4rJ"
      }, {
        code: "LY03",
        name: "Kem đánh răng Probiotics LYSMILEGO – trắng sáng 4 lớp, bảo vệ 7 lớp",
        category: "Kem đánh răng",
        commission: "12%",
        shortDesc: "Kem đánh răng bổ sung lợi khuẩn, hỗ trợ trắng sáng và bảo vệ răng miệng.",
        detailDesc: "Kem đánh răng LYSMILEGO bổ sung Probiotics (lợi khuẩn), được brand giới thiệu với cơ chế trắng sáng 4 lớp và bảo vệ 7 lớp. Giúp làm sạch, hỗ trợ răng trắng sáng hơn và hơi thở thơm mát. Có thể dùng hằng ngày, kết hợp với miếng dán trắng răng cùng thương hiệu.",
        reviewTips: "Quay chất kem, độ bọt, cảm giác hơi thở; ghép với miếng dán LY01/LY02 thành routine răng trắng.",
        tags: "kem đánh răng, probiotics, trắng răng, LYSMILEGO",
        affiliateLink: "https://affiliate.tiktok.com/api/v1/share/ALV7wnwCttVb"
      }]
  },

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
    registeredSpots: 0,
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
    registeredSpots: 0,
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
    registeredSpots: 0,
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
    registeredSpots: 0,
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

export const INITIAL_APPLICATIONS: KOCApplication[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

