import { useState } from 'react';
import { Image, Modal } from 'antd';
import type { CustomerPrivateAlbumAsset } from '@/types/album';

interface PrivateAlbumPreviewModalProps {
  open: boolean;
  albumTitle: string;
  assets: CustomerPrivateAlbumAsset[];
  activeIndex: number;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

const getSafeIndex = (index: number, length: number) => {
  if (length === 0) {
    return 0;
  }

  if (index < 0) {
    return 0;
  }

  if (index >= length) {
    return length - 1;
  }

  return index;
};

const formatByteSize = (value?: number | null) => {
  if (!value || value <= 0) {
    return 'Unknown size';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
};

export function PrivateAlbumPreviewModal({
  open,
  albumTitle,
  assets,
  activeIndex,
  onClose,
  onSelectIndex,
}: PrivateAlbumPreviewModalProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const safeIndex = getSafeIndex(activeIndex, assets.length);
  const activeAsset = assets[safeIndex] ?? null;

  if (!activeAsset) {
    return null;
  }

  const handleOpenPreview = (index: number) => {
    onSelectIndex(index);
    setPreviewOpen(true);
  };

  return (
    <Modal
      title={albumTitle}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnHidden
    >
      <p className="mb-2 text-sm text-gray-600">{assets.length} images</p>
      <p className="mb-4 text-xs text-gray-500">Click an image to open AntD preview.</p>

      <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3">
        <p className="mb-3 text-sm font-medium text-gray-700">Image list</p>
        <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset, index) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => handleOpenPreview(index)}
              className={`overflow-hidden rounded-lg border transition ${
                index === safeIndex
                  ? 'border-rose-400 ring-2 ring-rose-200'
                  : 'border-rose-100 hover:border-rose-300'
              }`}
              aria-label={`Preview image ${index + 1}`}
            >
              <Image
                src={asset.protectedMedia.thumbnailUrl}
                alt={asset.name ?? `Image ${index + 1}`}
                preview={false}
                className="h-24 w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-rose-100 bg-white p-4">
        <p className="text-sm font-medium text-gray-800">
          {activeAsset.name ?? `Image ${safeIndex + 1}`}
        </p>
        <p className="mt-1 text-xs text-gray-600">
          {activeAsset.mimeType ?? 'Unknown type'} • {formatByteSize(activeAsset.byteSize)} • #
          {safeIndex + 1}
        </p>
      </div>

      <Image.PreviewGroup
        preview={{
          open: open && previewOpen,
          current: safeIndex,
          onOpenChange: (visible) => {
            setPreviewOpen(visible);
          },
          onChange: (current) => {
            onSelectIndex(current);
          },
        }}
      >
        <div className="hidden" aria-hidden>
          {assets.map((asset, index) => (
            <Image
              key={`preview-${asset.id}`}
              src={asset.protectedMedia.contentUrl}
              alt={asset.name ?? `Image ${index + 1}`}
            />
          ))}
        </div>
      </Image.PreviewGroup>
    </Modal>
  );
}
