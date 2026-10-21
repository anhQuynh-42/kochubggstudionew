import React, { useRef, useState } from 'react';
import { useAppData } from '../../state/AppDataContext';
import { Button, Sheet, inputClass } from '../ui';

/** Admin đổi ảnh banner trang chủ: tải ảnh (tự nén ≤ 1920px) hoặc dán URL; có khôi phục ảnh mặc định */
export const HeroImageSheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { heroImage, updateHeroImage, resetHeroImage } = useAppData();
  const [preview, setPreview] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Vui lòng chọn ảnh dưới 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1920 / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return setPreview(reader.result as string);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPreview(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const run = async (action: () => Promise<void>) => {
    setSaving(true);
    try {
      await action();
    } finally {
      setSaving(false);
      setPreview(null);
      setUrl('');
      onClose();
    }
  };

  const next = preview || url.trim();
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Đổi ảnh banner trang chủ"
      footer={
        <div className="flex gap-2">
          <Button variant="ghost" size="lg" disabled={saving} onClick={() => run(resetHeroImage)} className="flex-1">
            Ảnh mặc định
          </Button>
          <Button variant="dark" size="lg" disabled={saving || !next} onClick={() => run(() => updateHeroImage(next))} className="flex-[2]">
            {saving ? 'Đang lưu...' : 'Lưu & đồng bộ'}
          </Button>
        </div>
      }
    >
      <img src={next || heroImage} alt="Xem trước" className="aspect-[16/10] w-full rounded-2xl object-cover ring-1 ring-slate-100" />
      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
      <Button variant="soft" size="lg" block className="mt-4" onClick={() => fileRef.current?.click()}>
        Chọn ảnh từ máy
      </Button>
      <input
        type="url"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setPreview(null);
        }}
        placeholder="Hoặc dán đường dẫn ảnh https://..."
        aria-label="Đường dẫn ảnh"
        className={`${inputClass} mt-3`}
      />
    </Sheet>
  );
};
