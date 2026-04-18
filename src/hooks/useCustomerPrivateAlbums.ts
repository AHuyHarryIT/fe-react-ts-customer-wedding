import { useCallback, useEffect, useState } from 'react';
import { albumService } from '@/services/albumService';
import { useAuthStore } from '@/stores/authStore';
import type { CustomerPrivateAlbumCard } from '@/types/album';

const normalizePrivateAlbumCards = async (
  albums: Awaited<ReturnType<typeof albumService.getCustomerPrivateAlbums>>
): Promise<CustomerPrivateAlbumCard[]> =>
  Promise.all(
    albums.map(async (album) => ({
      ...album,
      assets: await albumService.getCustomerPrivateAlbumAssets(album.id),
      zipDownloadUrl: albumService.getCustomerPrivateAlbumZipDownloadLink(album.id),
    }))
  );

export function useCustomerPrivateAlbums() {
  const { user, isAuthenticated } = useAuthStore();
  const [albums, setAlbums] = useState<CustomerPrivateAlbumCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
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
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setAlbums([]);
      setLoading(false);
      setError(null);
      return;
    }

    void fetchAlbums();
  }, [isAuthenticated, user?.id, fetchAlbums]);

  return {
    albums,
    loading,
    error,
    refetch: fetchAlbums,
  };
}
