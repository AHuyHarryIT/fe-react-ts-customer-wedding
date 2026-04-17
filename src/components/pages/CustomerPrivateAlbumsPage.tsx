import { Link } from '@tanstack/react-router';
import { Calendar, FolderHeart, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { CustomerStatePanel } from '@/components/pages/CustomerStatePanel';
import { useCustomerPrivateAlbums } from '@/hooks/useCustomerPrivateAlbums';
import type { CustomerPrivateAlbum } from '@/types/album';

const formatEventDate = (eventDate: CustomerPrivateAlbum['eventDate']) => {
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
              description={error}
              actions={
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-5 py-3 font-medium text-white transition-all hover:shadow-lg"
                >
                  Retry
                </button>
              }
            />
          ) : albums.length === 0 ? (
            <CustomerStatePanel
              tone="empty"
              title="No private albums yet"
              description="Your photographer will publish your private delivery album here once files are ready."
            />
          ) : (
            <CustomerStatePanel
              tone="info"
              title="Private album deliveries"
              description="Only authenticated owners can access these private delivery cards."
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {albums.map((album) => (
                  <article
                    key={album.id}
                    className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-sm"
                  >
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-rose-600">
                      <FolderHeart className="size-3.5" />
                      Private Delivery
                    </div>
                    <h2 className="text-lg font-medium text-gray-900">{album.title}</h2>
                    <p className="mt-3 inline-flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="size-4 text-rose-500" />
                      {formatEventDate(album.eventDate)}
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-700">
                      {album.deliveredAssetCount} assets
                    </p>
                  </article>
                ))}
              </div>
            </CustomerStatePanel>
          )}
        </motion.div>
      </div>
    </div>
  );
}
