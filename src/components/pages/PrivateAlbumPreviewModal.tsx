import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
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
  }, [open, onSelectIndex, safeIndex, assets.length]);

  if (!activeAsset) {
    return null;
  }

  const canNavigate = assets.length > 1;

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl focus:outline-none">
          <Dialog.Title className="text-xl font-medium text-gray-900">{albumTitle}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-gray-600">
            Asset {safeIndex + 1} of {assets.length}
          </Dialog.Description>

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
              aria-label="Close preview"
            >
              <X className="size-5" />
            </button>
          </Dialog.Close>

          <div className="relative mt-4 overflow-hidden rounded-xl border border-rose-100 bg-rose-50/40">
            <img
              src={activeAsset.protectedMedia.thumbnailUrl}
              alt="Asset preview"
              className="h-[60vh] w-full object-contain"
            />

            {canNavigate && (
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
            )}
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
