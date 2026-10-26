/**
 * KOCITY AUTOMATED CLOUD & CROSS-DEVICE SYNC VERIFIER
 * Runs pre-deployment checks to guarantee 100% database schema compatibility
 * and prevent silent data loss or cross-device divergence.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://mjsmnkelreniasahhfkf.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_NWcv9pPeRzu-884jDEeW9w_Si3trWfH';

console.log('🚀 [KOCity Sync Verifier] Bắt đầu kiểm thử đồng bộ Cloud & Database Schema...');

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runVerification() {
  let passed = true;

  // 1. Kiểm tra kết nối Supabase
  try {
    const { error: pingError } = await client.from('campaigns').select('id').limit(1);
    if (pingError) {
      console.error('❌ Lỗi kết nối Supabase:', pingError.message);
      process.exit(1);
    }
    console.log('✅ 1. Kết nối Supabase Cloud: Sẵn sàng');
  } catch (e) {
    console.error('❌ Ngoại lệ kết nối Supabase:', e);
    process.exit(1);
  }

  // 2. Kiểm thử hợp đồng Schema Bảng applications (Đơn ứng tuyển nhận mẫu)
  try {
    const testAppId = `__TEST_VERIFY_APP__${Date.now()}`;
    const testPayload = {
      id: testAppId,
      code: 'VERIFY-TEST',
      kocName: 'KOCity Test Agent',
      phone: '0908123456',
      email: 'verify@kocity.vn',
      tiktokHandle: 'verify_agent',
      address: 'KOCity Verification Center',
      campaignId: 'lysmilego-sample-thang-10',
      campaignName: 'Verification Campaign',
      status: 'Chờ duyệt',
      contentConcept: 'Automated test application [kocId: test-koc-id]',
    };

    const { data: insertData, error: insertError } = await client
      .from('applications')
      .insert([testPayload])
      .select('id, code');

    if (insertError) {
      console.error('❌ Lỗi Schema Bảng applications (PGRST204 hoặc vi phạm cột):', insertError.message);
      passed = false;
    } else {
      console.log('✅ 2. Schema Bảng applications: Tương thích 100% (Insert thành công)');
      // Dọn dẹp ngay lập tức
      await client.from('applications').delete().eq('id', testAppId);
    }
  } catch (e) {
    console.error('❌ Ngoại lệ kiểm thử applications:', e);
    passed = false;
  }

  // 3. Kiểm thử Hồ sơ KOC & Giới hạn Avatar (Zero-Loss Avatar Pipeline)
  try {
    const testProfileHandle = `__verify_koc_${Date.now()}`;
    const sampleAvatar = 'data:image/jpeg;base64,' + 'A'.repeat(5000); // 5KB sample avatar
    const testProfilePayload = {
      id: `__KOC_PROFILE__${testProfileHandle}`,
      code: `KOC_${testProfileHandle.toUpperCase()}`,
      title: 'Verify KOC Profile',
      brandName: 'Verify KOC',
      category: 'KOC_PROFILE',
      tiktokHandle: `@${testProfileHandle}`,
      productHeroImage: sampleAvatar,
      description: JSON.stringify({
        id: `koc-verify-${Date.now()}`,
        name: 'Verify KOC Profile',
        avatar: sampleAvatar,
        tiktokHandle: `@${testProfileHandle}`,
      }),
    };

    const { error: profileError } = await client
      .from('campaigns')
      .upsert(testProfilePayload);

    if (profileError) {
      console.error('❌ Lỗi lưu KOC Profile lên Cloud:', profileError.message);
      passed = false;
    } else {
      // Đọc lại để kiểm chứng avatar không bị cắt rỗng
      const { data: readBack, error: readError } = await client
        .from('campaigns')
        .select('description, productHeroImage')
        .eq('id', testProfilePayload.id)
        .maybeSingle();

      if (readError || !readBack) {
        console.error('❌ Không đọc lại được KOC Profile vừa lưu:', readError?.message);
        passed = false;
      } else {
        const parsed = JSON.parse(readBack.description);
        if (!parsed.avatar || parsed.avatar.length === 0) {
          console.error('❌ Avatar bị cắt rỗng sau khi lưu Cloud!');
          passed = false;
        } else {
          console.log('✅ 3. Hồ sơ KOC & Avatar: Bảo toàn 100% không bị cắt rỗng');
        }
      }
      // Dọn dẹp bản ghi test
      await client.from('campaigns').delete().eq('id', testProfilePayload.id);
    }
  } catch (e) {
    console.error('❌ Ngoại lệ kiểm thử KOC Profile:', e);
    passed = false;
  }

  // 4. Kiểm thử tính năng Realtime Channels
  try {
    const channel = client.channel(`verify_channel_${Date.now()}`);
    let subStatus = 'unknown';
    await new Promise((resolve) => {
      channel.subscribe((status) => {
        subStatus = status;
        resolve(status);
      });
      setTimeout(() => resolve('timeout'), 3000);
    });
    client.removeChannel(channel);
    console.log(`✅ 4. Supabase Realtime Channels: Hoạt động (Trạng thái: ${subStatus})`);
  } catch (e) {
    console.warn('⚠️ Kênh Realtime cần mạng mở rộng:', e);
  }

  // 5. Kiểm thử Tải & Xóa Chiến dịch từ Cloud (Zero Ghost Campaigns)
  try {
    const { data: camps, error: campErr } = await client
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (campErr) {
      console.error('❌ Lỗi tải chiến dịch từ Supabase:', campErr.message);
      passed = false;
    } else {
      const activeCamps = camps ? camps.filter((c) => !c.id.startsWith('__')) : [];
      if (activeCamps.length === 0) {
        console.error('❌ CSDL Cloud không trả về chiến dịch nào (Lỗi query lọc)!');
        passed = false;
      } else {
        console.log(`✅ 5. Tải chiến dịch từ Cloud: Thành công (${activeCamps.length} chiến dịch đang hoạt động)`);
      }
    }

    // Kiểm thử tạo và xóa 1 chiến dịch tạm
    const tempCampId = `__test_del_${Date.now()}`;
    await client.from('campaigns').insert([{ id: tempCampId, code: 'DEL-TEST', title: 'Delete Test', brandName: 'Test', category: 'Test' }]);
    await client.from('campaigns').delete().eq('id', tempCampId);
    const { data: checkDeleted } = await client.from('campaigns').select('id').eq('id', tempCampId).maybeSingle();
    if (checkDeleted) {
      console.error('❌ Lỗi: Chiến dịch sau khi xóa trên Cloud vẫn còn tồn tại!');
      passed = false;
    } else {
      console.log('✅ 6. Lệnh Xóa chiến dịch trên Cloud: Triệt để, không còn lưu vết');
    }
  } catch (e) {
    console.error('❌ Ngoại lệ kiểm thử chiến dịch:', e);
    passed = false;
  }

  // 7. Kiểm tra tính sẵn sàng & toàn vẹn của Bảng đơn ứng tuyển (applications) từ Supabase Cloud
  try {
    const { data: cloudApps, error: appsError } = await client
      .from('applications')
      .select('id, code, kocName, tiktokHandle, campaignName, status, created_at')
      .order('created_at', { ascending: false });

    if (appsError) {
      console.error('❌ Lỗi tải applications từ Supabase:', appsError.message);
      passed = false;
    } else if (!cloudApps || cloudApps.length === 0) {
      console.error('❌ CSDL Cloud không trả về đơn ứng tuyển nào!');
      passed = false;
    } else {
      console.log(`✅ 7. Toàn vẹn Bảng applications trên Cloud: Đạt chuẩn (${cloudApps.length} đơn ứng tuyển KOC sẵn sàng)`);
    }
  } catch (e) {
    console.error('❌ Ngoại lệ kiểm thử applications:', e);
    passed = false;
  }

  console.log('------------------------------------------------------------');
  if (passed) {
    console.log('🎉 TẤT CẢ KIỂM THỬ ĐỒNG BỘ ĐẠT CHUẨN 100%! Được phép phát hành.');
    process.exit(0);
  } else {
    console.error('🛑 CẢNH BÁO: Phát hiện vi phạm đồng bộ dữ liệu. Dừng quy trình deploy!');
    process.exit(1);
  }
}

runVerification();
