import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Camera, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Image, Modal } from 'antd';
import { motion } from 'motion/react';
import { usePublicAlbums } from '@/hooks/usePublicAlbums';
import { albumService } from '@/services/albumService';
import type { PublicAlbumDetail } from '@/types/album';
import { ImageWithFallback } from '@components/figma/ImageWithFallback';

const DEFAULT_ALBUM_IMAGE =
  'https://images.unsplash.com/photo-1765350226723-a96ab0705403?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

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

const getPublicThumbnailSrc = (file: { id: string; storageUrl?: string | null }) => {
  if (file.id) {
    return albumService.getPublicAlbumCoverThumbnailUrl(file.id);
  }

  return file.storageUrl || DEFAULT_ALBUM_IMAGE;
};

const getPublicPreviewSrc = (file: { id: string; storageUrl?: string | null }) => {
  if (file.id) {
    return albumService.getPublicAlbumContentUrl(file.id);
  }

  if (file.storageUrl) {
    return file.storageUrl;
  }

  return DEFAULT_ALBUM_IMAGE;
};

const getPublicPreviewFallback = (file: { id: string; storageUrl?: string | null }) => {
  if (file.id) {
    return albumService.getPublicAlbumContentUrl(file.id);
  }

  return DEFAULT_ALBUM_IMAGE;
};

export function GalleryPage() {
  const { albums, loading, error } = usePublicAlbums();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<PublicAlbumDetail | null>(null);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const selectedAsset = useMemo(() => {
    if (!selectedAlbum || selectedAlbum.files.length === 0) {
      return null;
    }

    const safeIndex = Math.min(selectedAssetIndex, selectedAlbum.files.length - 1);
    return selectedAlbum.files[safeIndex] ?? null;
  }, [selectedAlbum, selectedAssetIndex]);

  useEffect(() => {
    if (!selectedAlbumId) {
      setSelectedAlbum(null);
      setSelectedAssetIndex(0);
      setDetailError(null);
      setDetailLoading(false);
      return;
    }

    let isMounted = true;

    const loadAlbumDetail = async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);
        const detail = await albumService.getPublicAlbumById(selectedAlbumId);

        if (!isMounted) {
          return;
        }

        if (!detail) {
          setSelectedAlbum(null);
          setDetailError('Public album details are unavailable.');
          return;
        }

        setSelectedAlbum(detail);
        setSelectedAssetIndex(0);
      } catch {
        if (!isMounted) {
          return;
        }

        setSelectedAlbum(null);
        setDetailError('Failed to load this public album.');
      } finally {
        if (isMounted) {
          setDetailLoading(false);
        }
      }
    };

    loadAlbumDetail().catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [selectedAlbumId]);

  const closePreview = () => {
    setSelectedAlbumId(null);
    setSelectedAlbum(null);
    setSelectedAssetIndex(0);
    setPreviewOpen(false);
    setDetailError(null);
    setDetailLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="mb-3 text-4xl font-serif text-gray-900 md:text-5xl">Public Gallery</h1>
          <p className="max-w-3xl text-gray-600">
            Explore the studio&apos;s public portfolio highlights here. Private client delivery
            albums are protected and can only be accessed after login.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-3xl bg-white shadow-lg">
                <div className="aspect-[4/3] animate-pulse bg-gray-200" />
                <div className="space-y-3 p-6">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-lg">
            <p className="text-gray-600">{error}</p>
          </div>
        ) : albums.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {albums.map((album, index) => (
              <motion.article
                key={album.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="overflow-hidden rounded-3xl bg-white shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAlbumId(album.id);
                    setPreviewOpen(false);
                  }}
                  className="block w-full text-left"
                  aria-label={`Open ${album.title}`}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <ImageWithFallback
                      src={
                        (album.coverFile?.id
                          ? albumService.getPublicAlbumCoverThumbnailUrl(album.coverFile.id)
                          : undefined) ||
                        album.coverFile?.storageUrl ||
                        DEFAULT_ALBUM_IMAGE
                      }
                      alt={album.title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="space-y-4 p-6">
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-rose-500">
                        Public album
                      </p>
                      <h2 className="text-2xl font-serif text-gray-900">{album.title}</h2>
                    </div>
                    <p className="text-sm text-gray-600">
                      {album.description || 'A public portfolio album shared by the studio.'}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{new Date(album.createdAt).toLocaleDateString()}</span>
                      <span>{album.owner?.email || 'Studio HaMy'}</span>
                    </div>
                    <p className="text-sm font-medium text-rose-500">Click to open album</p>
                  </div>
                </button>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-10 text-center shadow-lg">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-rose-50">
              <ImageIcon className="size-7 text-rose-500" />
            </div>
            <h2 className="mb-2 text-2xl font-serif text-gray-900">No public albums yet</h2>
            <p className="mx-auto mb-6 max-w-2xl text-gray-600">
              The backend public gallery endpoint is available, but the studio has not published any
              customer-visible albums yet.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
            >
              <Camera className="size-4" />
              Contact the Studio
            </Link>
          </div>
        )}

        <Modal
          title={selectedAlbum?.title || 'Public album preview'}
          open={Boolean(selectedAlbumId)}
          onCancel={closePreview}
          footer={null}
          width={1000}
          destroyOnHidden
        >
          {detailLoading ? (
            <div className="space-y-3 py-2">
              <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
              <div className="h-[320px] w-full animate-pulse rounded-2xl bg-gray-200" />
            </div>
          ) : detailError ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">
              {detailError}
            </div>
          ) : selectedAlbum && selectedAlbum.files.length > 0 && selectedAsset ? (
            <>
              <p className="mb-2 text-sm text-gray-600">{selectedAlbum.files.length} images</p>
              <p className="mb-4 text-xs text-gray-500">Click an image to open AntD preview.</p>

              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3">
                <p className="mb-3 text-sm font-medium text-gray-700">Image list</p>
                <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
                  {selectedAlbum.files.map((asset, assetIndex) => (
                    <button
                      key={asset.fileId}
                      type="button"
                      onClick={() => {
                        setSelectedAssetIndex(assetIndex);
                        setPreviewOpen(true);
                      }}
                      className={`overflow-hidden rounded-lg border transition ${
                        selectedAssetIndex === assetIndex
                          ? 'border-rose-400 ring-2 ring-rose-200'
                          : 'border-rose-100 hover:border-rose-300'
                      }`}
                      aria-label={`Preview image ${assetIndex + 1}`}
                    >
                      <Image
                        src={getPublicThumbnailSrc(asset.file)}
                        alt={asset.file.name || `Album image ${assetIndex + 1}`}
                        preview={false}
                        className="h-24 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-rose-100 bg-white p-4">
                <p className="text-sm font-medium text-gray-800">
                  {selectedAsset.file.name || `Album image ${selectedAssetIndex + 1}`}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  {selectedAsset.file.mimeType || 'Unknown type'} •{' '}
                  {formatByteSize(selectedAsset.file.byteSize)} • #{selectedAssetIndex + 1}
                </p>
              </div>

              <Image.PreviewGroup
                preview={{
                  open: previewOpen,
                  current: selectedAssetIndex,
                  onOpenChange: (visible) => {
                    setPreviewOpen(visible);
                  },
                  onChange: (current) => {
                    setSelectedAssetIndex(current);
                  },
                }}
              >
                <div className="hidden" aria-hidden>
                  {selectedAlbum.files.map((asset, assetIndex) => (
                    <Image
                      key={`preview-public-${asset.fileId}`}
                      src={getPublicPreviewSrc(asset.file)}
                      fallback={getPublicPreviewFallback(asset.file)}
                      alt={asset.file.name || `Album image ${assetIndex + 1}`}
                    />
                  ))}
                </div>
              </Image.PreviewGroup>
            </>
          ) : (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">
              This public album has no preview assets yet.
            </div>
          )}
        </Modal>

        <div className="mt-10 rounded-3xl border border-rose-100 bg-white/80 p-6">
          <p className="mb-2 text-sm font-medium text-gray-900">
            Need your private delivery gallery?
          </p>
          <p className="text-sm text-gray-600">
            This page only shows public portfolio work. For your private wedding album delivery,
            please log in to continue securely.
          </p>
          <Link
            to="/auth"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-rose-500 transition-colors hover:text-rose-600"
          >
            Access My Private Album
            <ExternalLink className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
