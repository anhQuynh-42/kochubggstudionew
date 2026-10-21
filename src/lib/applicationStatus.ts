import { ApplicationProgress, KOCApplication, SampleStage, SelectionStatus, VideoStage } from '../types';

/**
 * Suy ra 3 lớp trạng thái (CLAUDE.md mục 3) từ dữ liệu đơn hiện có.
 *
 * Hiện database chỉ có một cột `status` gộp chung, nên kết quả Brand chọn được suy ra:
 *   'Chờ duyệt'  → pending (Chờ kết quả)
 *   'Từ chối'    → not_selected (Chưa được chọn)
 *   còn lại      → selected (Brand đã chọn, đơn đang ở các bước gửi mẫu / video)
 * Khi có cột đồng bộ từ Google Sheet, chỉ cần đọc cột đó ở getSelectionStatus().
 */
export function getSelectionStatus(app: KOCApplication): SelectionStatus {
  if (app.status === 'Chờ duyệt') return 'pending';
  if (app.status === 'Từ chối') return 'not_selected';
  return 'selected';
}

function getSampleStage(app: KOCApplication, selection: SelectionStatus): SampleStage {
  if (selection === 'not_selected' || app.shippingStatus === 'Không gửi mẫu') return 'none';
  if (selection === 'pending') return 'waiting';
  if (app.shippingStatus === 'Đã phát thành công') return 'delivered';
  if (app.shippingStatus === 'Đang trung chuyển' || app.status === 'Đang giao') return 'in_transit';
  return 'approved';
}

function getVideoStage(app: KOCApplication): VideoStage {
  if (app.status === 'Đã hoàn thành' || app.status === 'Đã lên bài') return 'posted';
  if (app.status === 'Bị từ chối') return 'needs_revision';
  if (app.status === 'Chờ duyệt video' || app.videoLink) return 'pending_review';
  return 'not_posted';
}

export function getApplicationProgress(app: KOCApplication): ApplicationProgress {
  const selection = getSelectionStatus(app);
  const sample = getSampleStage(app, selection);
  const video = getVideoStage(app);

  let timelineStep: ApplicationProgress['timelineStep'] = 1;
  if (selection === 'selected') timelineStep = video === 'posted' ? 3 : 2;

  return { selection, sample, video, timelineStep };
}

export const SELECTION_LABELS: Record<SelectionStatus, string> = {
  pending: 'Chờ kết quả',
  selected: 'Được chọn',
  not_selected: 'Chưa được chọn',
};

export const SAMPLE_LABELS: Record<SampleStage, string> = {
  none: 'Không gửi mẫu',
  waiting: 'Chờ Brand chọn',
  approved: 'Đã duyệt gửi mẫu',
  in_transit: 'Đang giao hàng',
  delivered: 'Đã nhận mẫu',
};

export const VIDEO_LABELS: Record<VideoStage, string> = {
  not_posted: 'Chưa đăng video',
  pending_review: 'Chờ duyệt video',
  needs_revision: 'Cần sửa video',
  posted: 'Đã lên bài',
};
