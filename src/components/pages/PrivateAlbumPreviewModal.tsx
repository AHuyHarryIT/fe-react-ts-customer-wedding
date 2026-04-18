import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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

export function PrivateAlbumPreviewModal({
  open,
  albumTitle,
  assets,
  activeIndex,
  onClose,
  onSelectIndex,
}: PrivateAlbumPreviewModalProps) {
  const safeIndex = getSafeIndex(activeIndex, assets.length);
  const activeAsset = assets[safeIndex] ?? null;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }

      if (event.key === 'ArrowRight' && assets.length > 1) {
        event.preventDefault();
        onSelectIndex((safeIndex + 1) % assets.length);
      }

      if (event.key === 'ArrowLeft' && assets.length > 1) {
        event.preventDefault();
        onSelectIndex((safeIndex - 1 + assets.length) % assets.length);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, onSelectIndex, safeIndex, assets.length]);

  if (!open || !activeAsset) {
    return null;
  }

  const canNavigate = assets.length > 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${albumTitle} preview`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium text-gray-900">{albumTitle}</h2>
            <p className="text-sm text-gray-600">
              Asset {safeIndex + 1} of {assets.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-11 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
            aria-label="Close preview"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-rose-100 bg-rose-50/40">
          <img
            src={activeAsset.protectedMedia.thumbnailUrl}
            alt="Asset preview"
            className="h-[60vh] w-full object-contain"
          />

          {canNavigate ? (
            <>
              <button
                type="button"
                onClick={() => onSelectIndex((safeIndex - 1 + assets.length) % assets.length)}
                className="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-rose-200 bg-white/90 text-rose-600 transition hover:bg-white"
                aria-label="Previous asset"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => onSelectIndex((safeIndex + 1) % assets.length)}
                className="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-rose-200 bg-white/90 text-rose-600 transition hover:bg-white"
                aria-label="Next asset"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600">{activeAsset.name ?? 'Private album asset'}</p>
          <a
            href={activeAsset.protectedMedia.contentUrl}
            className="inline-flex items-center justify-center rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
          >
            Open full asset
          </a>
        </div>
      </div>
    </div>
  );
}
