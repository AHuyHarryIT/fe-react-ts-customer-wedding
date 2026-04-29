import { useCallback, useEffect, useMemo, useState } from 'react';
import { albumService } from '@/services/albumService';
import { useAuthStore } from '@/stores/authStore';
import type { CustomerPrivateAlbumCard } from '@/types/album';

const normalizePrivateAlbumCards = async (
  albums: Awaited<ReturnType<typeof albumService.getCustomerPrivateAlbums>>
): Promise<CustomerPrivateAlbumCard[]> =>
  Promise.all(
    albums.map(async (album) => {
      try {
        return {
          ...album,
          assets: await albumService.getCustomerPrivateAlbumAssets(album.id),
          zipDownloadUrl: albumService.getCustomerPrivateAlbumZipDownloadLink(album.id),
        };
      } catch (error) {
        console.error(`Failed to fetch assets for album ${album.id}:`, error);
        return {
          ...album,
          assets: [],
          zipDownloadUrl: albumService.getCustomerPrivateAlbumZipDownloadLink(album.id),
        };
      }
    })
  );

export function useCustomerPrivateAlbums() {
  const { user, isAuthenticated } = useAuthStore();
  const [albums, setAlbums] = useState<CustomerPrivateAlbumCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = useMemo(() => {
    if (user && typeof user === 'object') {
      const userWithFallback = user as { id?: unknown; userId?: unknown; sub?: unknown };

      if (typeof userWithFallback.id === 'string' && userWithFallback.id.length > 0) {
        return userWithFallback.id;
      }

      if (typeof userWithFallback.userId === 'string' && userWithFallback.userId.length > 0) {
        return userWithFallback.userId;
      }

      if (typeof userWithFallback.sub === 'string' && userWithFallback.sub.length > 0) {
        return userWithFallback.sub;
      }
    }

    return '';
  }, [user]);

  const fetchAlbums = useCallback(async () => {
    if (!isAuthenticated || !currentUserId) {
      setAlbums([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const privateAlbums = await albumService.getCustomerPrivateAlbums();
      setAlbums(await normalizePrivateAlbumCards(privateAlbums));
    } catch (err) {
      console.error('Failed to fetch customer private albums:', err);
      setError('Failed to load private albums');
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentUserId]);

  useEffect(() => {
    if (!isAuthenticated || !currentUserId) {
      setAlbums([]);
      setLoading(false);
      setError(null);
      return;
    }

    fetchAlbums().catch(() => undefined);
  }, [isAuthenticated, currentUserId, fetchAlbums]);

  return {
    albums,
    loading,
    error,
    refetch: fetchAlbums,
  };
}
