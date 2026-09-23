import React, { useState, useRef } from 'react';
import { Campaign, KOCApplication, KOCUser } from '../types';
import { ZALO_GROUP_URL } from './ZaloCommunityWidget';

interface RegistrationModalProps {
  campaign: Campaign;
  currentUser?: KOCUser | null;
  onClose: () => void;
  onSubmitSuccess: (newApp: KOCApplication) => void;
  onViewMyCampaigns: () => void;
  onAutoLogin?: (user: KOCUser) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  campaign,
  currentUser,
  onClose,
  onSubmitSuccess,
  onViewMyCampaigns,
  onAutoLogin,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedAppCode, setGeneratedAppCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [fullName, setFullName] = useState(currentUser?.name || 'Nguyễn Minh Thư');
  const [phone, setPhone] = useState(currentUser?.phone || '0908.123.456');
  const [email, setEmail] = useState(currentUser?.email || 'minhthu.koc@gmail.com');
  const [city, setCity] = useState(currentUser?.city || 'TP. Hồ Chí Minh');
  const [district, setDistrict] = useState(currentUser?.district || 'Quận 1');
  const [address, setAddress] = useState(currentUser?.address || 'Số 45, Đường Lê Duẩn, Phường Bến Nghé');
  const [shippingNote, setShippingNote] = useState(currentUser?.shippingNote || 'Giao trong giờ hành chính, gọi trước khi đến.');

  // Step 2
  const [platform, setPlatform] = useState('TikTok');
  const [channelLink, setChannelLink] = useState(
    currentUser?.channelLink ||
      (currentUser?.tiktokHandle ? `https://www.tiktok.com/${currentUser.tiktokHandle}` : 'https://www.tiktok.com/@minhthu.creator')
  );
  const [tiktokHandle, setTiktokHandle] = useState(currentUser?.tiktokHandle || '@minhthu.creator');
  const [followers, setFollowers] = useState(currentUser?.followers || '15.2K');
  const [avgViews, setAvgViews] = useState(currentUser?.avgViews || '25K views');
  const [audience, setAudience] = useState(currentUser?.targetAudience || 'HSSV & Dân văn phòng, yêu thích Lifestyle và đồ tiện ích');
  const [hasUploadedProof, setHasUploadedProof] = useState(false);
  const [uploadedProofFile, setUploadedProofFile] = useState<{
    name: string;
    size: string;
    previewUrl?: string;
  }>({
    name: '',
    size: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingProof, setIsDraggingProof] = useState(false);
  const [isPreviewImageModalOpen, setIsPreviewImageModalOpen] = useState(false);

  const handleProcessFile = (file: File) => {
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Định dạng tệp không hợp lệ. Vui lòng tải ảnh PNG, JPG hoặc WebP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Kích thước ảnh vượt quá giới hạn 10MB.');
      return;
    }
    setErrorMessage('');
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const previewUrl = URL.createObjectURL(file);
    setUploadedProofFile({
      name: file.name,
      size: `${sizeInMB} MB • Đã tải lên thành công`,
      previewUrl,
    });
    setHasUploadedProof(true);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingProof(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingProof(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingProof(false);
  };

  // Step 3
  const [concept, setConcept] = useState(() => {
    if (campaign.category.includes('Thời trang')) {
      return 'Mix & Match outfit hè, review cận cảnh chất liệu áo lót tàng hình Visecret không hằn viền và chia sẻ mẹo mặc váy hở lưng.';
    }
    return 'Unbox ASMR và setup góc học tập/làm việc gọn gàng, test tốc độ sạc & chất âm thực tế cùng phụ kiện chính hãng.';
  });
  const [expectedDays, setExpectedDays] = useState('Trong 3-5 ngày sau khi nhận mẫu');
  const [agreeBrief, setAgreeBrief] = useState(true);
  const [agreeSparkAds, setAgreeSparkAds] = useState(true);
  const [agreeTruth, setAgreeTruth] = useState(true);

  const handleNext = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!fullName.trim() || !phone.trim() || !address.trim()) {
        setErrorMessage('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận mẫu.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!channelLink.trim() || !tiktokHandle.trim()) {
        setErrorMessage('Vui lòng điền link kênh và handle mạng xã hội.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = () => {
    setErrorMessage('');
    if (!agreeBrief || !agreeTruth) {
      setErrorMessage('Vui lòng tích chọn cam kết trước khi nộp hồ sơ.');
      return;
    }

    if (campaign.registeredSpots >= campaign.totalSpots) {
      setErrorMessage('Chiến dịch này hiện đã hết slot nhận mẫu.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const randomCode = `#KOC-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedAppCode(randomCode);

      const newApplication: KOCApplication = {
        id: `app-${Date.now()}`,
        code: randomCode,
        kocName: fullName,
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDoV0m73VoY07k3KAu4UYXOt7UQ4aRw3gOpFZYNUXO12CG31nzhjcvK-kkfdnGpLsEkoyVXvzvRQCeyyzz_q__iKcT97K74k5IjD3lYcToRBShK-8QK5Fzn1v9prbGRS9DMLCJyqo5sKYCbSAD0z6UA97eQ8XQhknSlGeUsve84FVC9TvAdbN6s85z5P7GeWfGPkxgpfth468LWt1dqLKVub0JApSsGP69CZ1NsVmz7xzHFvaseuw3y',
        phone,
        email,
        tiktokHandle,
        followers,
        followersCount: 120000,
        avgViews: `Avg ${avgViews}`,
        address: `${address}, ${district}, ${city}`,
        shippingCode: 'GHTK: Chờ sinh mã',
        shippingStatus: 'Chờ duyệt để sinh mã',
        createdAtTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAtDate: new Date().toLocaleDateString('vi-VN'),
        status: 'Chờ duyệt',
        videoLink: '',
        videoViews: '',
        audience,
        contentConcept: concept,
        campaignId: campaign.id,
        campaignName: campaign.title,
        verified: true,
      };

      onSubmitSuccess(newApplication);

      if (onAutoLogin) {
        onAutoLogin({
          id: `koc-${Date.now()}`,
          name: fullName,
          avatar: newApplication.avatar,
          tiktokHandle: newApplication.tiktokHandle,
          followers: newApplication.followers,
          phone: newApplication.phone,
          email: newApplication.email,
          verified: true,
        });
      }

      setIsSubmitting(false);
      setIsSuccess(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-900">how_to_reg</span>
            <span className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900">
              Đăng ký chiến dịch nhận mẫu
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {!isSuccess ? (
          <div className="p-6">
            {/* Progressive 3-step indicator matching screen 3 */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                    step >= 1 ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  1
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[11px] font-bold text-slate-900">Cá nhân & Nhận mẫu</div>
                  <div className="text-[9px] text-slate-500">Địa chỉ giao hỏa tốc</div>
                </div>
              </div>

              <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-orange-500' : 'bg-slate-200'}`}></div>

              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                    step >= 2 ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  2
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[11px] font-bold text-slate-900">Kênh & Chỉ số</div>
                  <div className="text-[9px] text-slate-500">Followers & Tương tác</div>
                </div>
              </div>

              <div className={`h-0.5 flex-1 mx-2 ${step === 3 ? 'bg-orange-500' : 'bg-slate-200'}`}></div>

              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                    step === 3 ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  3
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[11px] font-bold text-slate-900">Ý tưởng & Cam kết</div>
                  <div className="text-[9px] text-slate-500">Brief & Thời hạn video</div>
                </div>
              </div>
            </div>

            {/* Campaign mini summary card */}
            <div className="mb-6 flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <img
                src={campaign.productHeroImage}
                alt={campaign.title}
                className="h-14 w-14 shrink-0 rounded-xl object-cover border border-slate-200"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-sm">
                    {campaign.title}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="rounded bg-orange-100 border border-orange-200 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                    Đã đăng ký: {campaign.registeredSpots}/{campaign.totalSpots} slot (Còn {Math.max(0, campaign.totalSpots - campaign.registeredSpots)})
                  </span>
                  {campaign.benefits.map((b, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-800"
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message banner */}
            {errorMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Personal & Shipping Address */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Họ và tên KOC <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                      placeholder="Nguyễn Minh Thư"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Số điện thoại nhận hàng <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                      placeholder="0908.xxx.xxx"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Email liên hệ / Hợp đồng
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                      placeholder="minhthu.koc@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Tỉnh / Thành phố <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    >
                      <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Cần Thơ">Cần Thơ</option>
                      <option value="Hải Phòng">Hải Phòng</option>
                      <option value="Lâm Đồng">Lâm Đồng</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Địa chỉ nhận hàng chi tiết (Số nhà, đường, phường/xã) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    placeholder="Số 45, Đường Lê Duẩn, Phường Bến Nghé, Quận 1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Ghi chú giao hàng cho Shipper
                  </label>
                  <input
                    type="text"
                    value={shippingNote}
                    onChange={(e) => setShippingNote(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    placeholder="Giao trong giờ hành chính..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Channel & Analytics Proof */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Nền tảng chính
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    >
                      <option value="TikTok">TikTok (@handle)</option>
                      <option value="Instagram">Instagram</option>
                      <option value="YouTube">YouTube Shorts</option>
                      <option value="Facebook">Facebook Reels</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Handle kênh TikTok <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={tiktokHandle}
                      onChange={(e) => setTiktokHandle(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                      placeholder="@minhthu.beauty"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Link kênh mạng xã hội <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="url"
                    value={channelLink}
                    onChange={(e) => setChannelLink(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    placeholder="https://www.tiktok.com/@minhthu.beauty"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Số Followers hiện tại
                    </label>
                    <input
                      type="text"
                      value={followers}
                      onChange={(e) => setFollowers(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                      placeholder="120K"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Lượt xem trung bình / clip
                    </label>
                    <input
                      type="text"
                      value={avgViews}
                      onChange={(e) => setAvgViews(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                      placeholder="45K views"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Tệp người xem chính của kênh
                  </label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                    placeholder="Ví dụ: Nữ 18-28 tuổi, quan tâm chăm sóc da dầu mụn..."
                  />
                </div>

                {/* Upload analytics proof */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Ảnh chụp màn hình phân tích kênh (TikTok Studio / Analytics)
                  </label>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />

                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => {
                      if (!hasUploadedProof) {
                        fileInputRef.current?.click();
                      }
                    }}
                    className={`flex items-center gap-3 rounded-2xl border-2 border-dashed p-4 transition-all ${
                      hasUploadedProof
                        ? 'border-blue-300 bg-blue-50/40'
                        : isDraggingProof
                        ? 'border-orange-500 bg-orange-50/60 scale-[1.01] cursor-pointer'
                        : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 cursor-pointer'
                    }`}
                  >
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl overflow-hidden transition-colors ${
                        hasUploadedProof
                          ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-xs'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {hasUploadedProof && uploadedProofFile.previewUrl ? (
                        <img
                          src={uploadedProofFile.previewUrl}
                          alt="Xem trước ảnh phân tích"
                          className="h-full w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPreviewImageModalOpen(true);
                          }}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[24px]">
                          {hasUploadedProof ? 'image' : 'cloud_upload'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {hasUploadedProof ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-blue-800 flex items-center gap-1 truncate">
                              <span className="material-symbols-outlined text-[15px] shrink-0">check_circle</span>
                              <span className="truncate">{uploadedProofFile.name}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {uploadedProofFile.size}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {uploadedProofFile.previewUrl && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPreviewImageModalOpen(true);
                                  }}
                                  className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline cursor-pointer bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                                  <span>Xem lại ảnh</span>
                                </button>
                                <span className="text-slate-300">|</span>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                              className="text-xs text-orange-600 font-semibold hover:underline cursor-pointer"
                            >
                              Đổi ảnh
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setHasUploadedProof(false);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                              className="text-xs text-red-600 font-semibold hover:underline cursor-pointer"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            Kéo thả ảnh vào đây hoặc{' '}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                              className="text-orange-600 hover:text-orange-700 underline font-bold cursor-pointer inline p-0 bg-transparent border-0"
                            >
                              tải ảnh lên
                            </button>
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Hỗ trợ PNG, JPG, WebP tối đa 10MB (Nhấp trực tiếp vào ô để chọn ảnh)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Concept & Commitments */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Ý tưởng kịch bản & Góc tiếp cận sản phẩm <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-slate-900 focus:outline-none leading-relaxed"
                    placeholder="Mô tả ngắn góc quay, hook giật tít và cách bạn lồng ghép USP sản phẩm..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Thời gian dự kiến lên bài sau khi nhận hàng mẫu
                  </label>
                  <select
                    value={expectedDays}
                    onChange={(e) => setExpectedDays(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    <option value="Trong 3 ngày sau khi nhận mẫu">Trong 3 ngày sau khi nhận mẫu (Ưu tiên duyệt)</option>
                    <option value="Trong 5 ngày sau khi nhận mẫu">Trong 5 ngày sau khi nhận mẫu</option>
                    <option value="Trong 7 ngày sau khi nhận mẫu">Trong 7 ngày sau khi nhận mẫu</option>
                  </select>
                </div>

                {/* 3 Commitments */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    Cam kết của Creator khi tham gia:
                  </span>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={agreeBrief}
                      onChange={(e) => setAgreeBrief(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 accent-orange-500"
                    />
                    <span>
                      Tôi cam kết thực hiện đúng theo Brief kịch bản, nêu đủ USP và gắn giỏ hàng TikTok Shop chính hãng của Brand.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={agreeSparkAds}
                      onChange={(e) => setAgreeSparkAds(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 accent-orange-500"
                    />
                    <span>
                      Đồng ý cung cấp mã Spark Ads để Brand chạy quảng cáo đẩy GMV (nếu video đạt chỉ số tốt).
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={agreeTruth}
                      onChange={(e) => setAgreeTruth(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 accent-orange-500"
                    />
                    <span>
                      Cam kết số liệu chỉ số kênh và thông tin địa chỉ nhận mẫu là hoàn toàn chính xác.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Quay lại</span>
                </button>
              ) : (
                <div></div>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Tiếp tục</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50 active:scale-95 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                      <span>Đang gửi hồ sơ...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>Xác nhận nộp hồ sơ</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Success Screen matching Screen 5 */
          <div className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-sm">
              <span className="material-symbols-outlined text-3xl">check</span>
            </div>

            <h3 className="mt-4 font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-slate-900">
              Đã gửi hồ sơ - Đang chờ Brand duyệt!
            </h3>
            <p className="mt-2 text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Hồ sơ của bạn đã được chuyển tới nhãn hàng <b>{campaign.brandName}</b>. Nhãn hàng sẽ xem qua kênh TikTok/Reels của bạn, đánh giá phong cách nội dung xem có phù hợp với sản phẩm hay không trước khi phê duyệt gửi quà mẫu.
            </p>

            {/* Application Code Pill */}
            <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50/70 p-3">
              <span className="text-xs text-orange-800 font-medium">Mã hồ sơ:</span>
              <span className="font-mono text-sm font-extrabold text-orange-900">
                {generatedAppCode}
              </span>
              <span className="rounded-md bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                Chờ duyệt
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedAppCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="rounded-lg bg-orange-200 px-2 py-1 text-[11px] font-bold text-orange-900 hover:bg-orange-300 cursor-pointer"
              >
                {copiedCode ? 'Đã chép!' : 'Sao chép'}
              </button>
            </div>

            {/* Review notice callout */}
            <div className="mt-4 rounded-2xl bg-amber-50/80 border border-amber-200 p-3 text-left max-w-md mx-auto text-xs text-amber-950 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-amber-700 shrink-0 mt-0.5">info</span>
              <div>
                <span className="font-bold">Lưu ý quan trọng:</span> Sau khi nộp hồ sơ, KOC ở trạng thái <b>Chờ duyệt</b>. Nhãn hàng sẽ xét duyệt chất lượng kênh, lượt tương tác và tệp khán giả. Khi được duyệt chính thức, quà mẫu sẽ được đóng gói giao ngay!
              </div>
            </div>

            {/* Delivery notice */}
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left max-w-md mx-auto text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Người nhận:</span>
                <span className="font-bold text-slate-900">{fullName} ({phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Địa chỉ:</span>
                <span className="font-medium text-slate-900 truncate max-w-[240px]">{address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Đơn vị vận chuyển:</span>
                <span className="font-bold text-blue-700">ViettelPost / GHTK (Hỏa tốc)</span>
              </div>
            </div>

            {/* Next steps workflow overview */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left max-w-md mx-auto">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2.5">
                <span className="material-symbols-outlined text-[16px] text-orange-600">alt_route</span>
                Lộ trình 4 bước tiếp theo của bạn:
              </h4>
              <div className="space-y-2 text-[11px] text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">Brand xem xét kênh:</span> Nhãn hàng đánh giá kênh & chọn KOC phù hợp (12h - 24h).
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">Khi được duyệt:</span> Brand gửi quà mẫu 0đ hỏa tốc để KOC trải nghiệm & lên video.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white mt-0.5">
                    3
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">KOC trả video:</span> Up lên Drive (Google Drive) để duyệt.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white mt-0.5">
                    4
                  </span>
                  <div>
                    <span className="font-bold text-blue-800">Nhận hoa hồng sau khi có đơn:</span> Tiền về tài khoản ngân hàng.
                  </div>
                </div>
              </div>
            </div>

            {/* Zalo group prompt for fast tracking & direct support */}
            <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50/60 p-4 text-left max-w-md mx-auto">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white font-extrabold text-xs shadow-sm">
                  Zalo
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Cần duyệt mẫu nhanh hoặc trao đổi thêm?
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Tham gia nhóm Zalo KOC để Admin KOCHub ưu tiên xử lý hồ sơ và cập nhật thông tin vận đơn trực tiếp.
                  </p>
                </div>
              </div>
              <a
                id="modal-success-zalo-btn"
                href={ZALO_GROUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 py-2 px-3 text-xs font-bold text-white shadow-sm transition-all"
              >
                <span>Vào nhóm Zalo KOC trao đổi ngay</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onViewMyCampaigns();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-orange-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                <span>Xem trong Chiến dịch của tôi</span>
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Tiếp tục khám phá chiến dịch
              </button>
            </div>
          </div>
        )}

        {/* Modal xem lại ảnh chụp màn hình phân tích kênh */}
        {isPreviewImageModalOpen && uploadedProofFile.previewUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-150"
            onClick={() => setIsPreviewImageModalOpen(false)}
          >
            <div
              className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-orange-600 text-[20px]">image</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {uploadedProofFile.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {uploadedProofFile.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPreviewImageModalOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">sync</span>
                    <span>Đổi ảnh khác</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreviewImageModalOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Đóng xem trước"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              {/* Image Preview Body */}
              <div className="p-4 bg-slate-950/5 max-h-[70vh] flex items-center justify-center overflow-auto">
                <img
                  src={uploadedProofFile.previewUrl}
                  alt={uploadedProofFile.name}
                  className="max-h-[65vh] w-auto object-contain rounded-lg shadow-sm border border-slate-200"
                />
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Ảnh đã sẵn sàng để gửi kèm đơn đăng ký nhận mẫu.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPreviewImageModalOpen(false)}
                  className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  Xác nhận ảnh này
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
