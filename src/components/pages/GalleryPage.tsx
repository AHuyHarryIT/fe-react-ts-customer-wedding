import { Link } from '@tanstack/react-router';
import { Camera, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { usePublicAlbums } from '@/hooks/usePublicAlbums';
import { ImageWithFallback } from '@components/figma/ImageWithFallback';

const DEFAULT_ALBUM_IMAGE =
  'https://images.unsplash.com/photo-1765350226723-a96ab0705403?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

export function GalleryPage() {
  const { albums, loading, error } = usePublicAlbums();

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
            This page is now driven by the backend public albums endpoint. It shows the albums the
            studio has explicitly made public for customer viewing.
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
                <div className="aspect-[4/3] overflow-hidden">
                  <ImageWithFallback
                    src={album.coverFile?.storageUrl || DEFAULT_ALBUM_IMAGE}
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
                </div>
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

        <div className="mt-10 rounded-3xl border border-rose-100 bg-white/80 p-6">
          <p className="mb-2 text-sm font-medium text-gray-900">
            Need your private delivery gallery?
          </p>
          <p className="text-sm text-gray-600">
            Private delivery and booking-specific gallery access still happens through the studio
            team. Use Messages for share links or delivery updates.
          </p>
          <Link
            to="/messages"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-rose-500 transition-colors hover:text-rose-600"
          >
            Open Messages
            <ExternalLink className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
