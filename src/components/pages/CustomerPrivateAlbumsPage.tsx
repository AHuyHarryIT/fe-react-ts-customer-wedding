import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Calendar, Download, FolderHeart, Image as ImageIcon, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { CustomerStatePanel } from '@/components/pages/CustomerStatePanel';
import { PrivateAlbumPreviewModal } from '@/components/pages/PrivateAlbumPreviewModal';
import { useCustomerPrivateAlbums } from '@/hooks/useCustomerPrivateAlbums';
import {
  PRIVATE_ALBUM_DENIED_MESSAGE,
  PRIVATE_ALBUM_EMPTY_STATE_TITLE,
  type CustomerPrivateAlbumCard,
} from '@/types/album';

const EMPTY_STATE_BODY =
  'Your delivered photos and videos will appear here once the studio publishes your private album. Open Messages if you need a delivery status update.';

const ERROR_STATE_BODY =
  "We couldn't verify this payment or album request yet. Refresh and try again. If it still fails, open Messages and include your booking ID for support.";

const formatEventDate = (eventDate: CustomerPrivateAlbumCard['eventDate']) => {
  if (!eventDate) {
    return 'Event date pending';
  }

  const parsedDate = new Date(eventDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Event date pending';
  }

  return parsedDate.toLocaleDateString();
};

export function CustomerPrivateAlbumsPage() {
  const { albums, loading, error, refetch } = useCustomerPrivateAlbums();
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [activeAssetIndex, setActiveAssetIndex] = useState(0);

  const normalizedError = error?.trim();
  const lowerError = normalizedError?.toLowerCase() ?? '';
  const safeErrorCopy =
    lowerError.includes('do not have access') || lowerError.includes('not found')
      ? PRIVATE_ALBUM_DENIED_MESSAGE
      : ERROR_STATE_BODY;

  const activeAlbum = albums.find((album) => album.id === activeAlbumId) ?? null;

  const openPreview = (albumId: string, initialIndex = 0) => {
    setActiveAlbumId(albumId);
    setActiveAssetIndex(initialIndex);
  };

  const closePreview = () => {
    setActiveAlbumId(null);
    setActiveAssetIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-serif text-gray-900 md:text-4xl">Private Albums</h1>
              <p className="mt-2 text-gray-600">
                Access your authenticated private wedding delivery galleries and review delivered
                assets.
              </p>
            </div>
            <Link
              to="/gallery"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 px-5 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
            >
              <ImageIcon className="size-4" />
              View Public Gallery
            </Link>
          </div>

          {loading ? (
            <CustomerStatePanel
              tone="loading"
              title="Loading your private albums"
              description="We are retrieving your latest private delivery galleries."
            />
          ) : error ? (
            <CustomerStatePanel
              tone="error"
              title="We could not load your private albums"
              description={safeErrorCopy}
              actions={
                <>
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-5 py-3 font-medium text-white transition-all hover:shadow-lg"
                  >
                    Retry
                  </button>
                  <Link
                    to="/messages"
                    className="inline-flex items-center justify-center rounded-full border border-rose-200 px-5 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    Open Messages
                  </Link>
                </>
              }
            />
          ) : albums.length === 0 ? (
            <CustomerStatePanel
              tone="empty"
              title={PRIVATE_ALBUM_EMPTY_STATE_TITLE}
              description={EMPTY_STATE_BODY}
              actions={
                <Link
                  to="/messages"
                  className="inline-flex items-center justify-center rounded-full border border-rose-200 px-5 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  Open Messages
                </Link>
              }
            />
          ) : (
            <CustomerStatePanel
              tone="info"
              title="Private album deliveries"
              description="Only authenticated owners can access these private delivery cards."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {albums.map((album) => {
                  const hasAssets = album.assets.length > 0;

                  return (
                    <article
                      key={album.id}
                      className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-sm"
                    >
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-rose-600">
                        <FolderHeart className="size-3.5" />
                        Private Delivery
                      </div>
                      <h2 className="text-lg font-medium text-gray-900">{album.title}</h2>
                      <p className="mt-3 text-sm font-medium text-gray-700">
                        Booking: {album.bookingReference ?? album.bookingId ?? 'Pending assignment'}
                      </p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="size-4 text-rose-500" />
                        {formatEventDate(album.eventDate)}
                      </p>
                      <p className="mt-2 text-sm font-medium text-gray-700">
                        {album.deliveredAssetCount} assets
                      </p>

                      {hasAssets ? (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openPreview(album.id, 0)}
                            className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                            aria-label={`Preview ${album.title}`}
                          >
                            <Eye className="size-4" />
                            Preview
                          </button>
                          <a
                            href={album.zipDownloadUrl}
                            download
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-4 py-2 text-sm font-medium text-white transition hover:shadow-lg"
                            aria-label="Download Album ZIP"
                          >
                            <Download className="size-4" />
                            Download Album ZIP
                          </a>
                        </div>
                      ) : (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="text-sm text-gray-600">{PRIVATE_ALBUM_DENIED_MESSAGE}</span>
                          <Link
                            to="/messages"
                            className="inline-flex items-center justify-center rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                          >
                            Open Messages
                          </Link>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </CustomerStatePanel>
          )}
        </motion.div>
      </div>

      <PrivateAlbumPreviewModal
        open={Boolean(activeAlbum && activeAlbum.assets.length > 0)}
        albumTitle={activeAlbum?.title ?? 'Private album'}
        assets={activeAlbum?.assets ?? []}
        activeIndex={activeAssetIndex}
        onClose={closePreview}
        onSelectIndex={setActiveAssetIndex}
      />
    </div>
  );
}
