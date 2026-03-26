import { useCallback, useEffect, useState } from 'react';
import { albumService } from '@/services/albumService';
import type { PublicAlbum } from '@/types/album';

export function usePublicAlbums() {
  const [albums, setAlbums] = useState<PublicAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const publicAlbums = await albumService.getPublicAlbums();
      setAlbums(publicAlbums);
    } catch (err) {
      console.error('Failed to fetch public albums:', err);
      setError('Failed to load public gallery');
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAlbums();
  }, [fetchAlbums]);

  return {
    albums,
    loading,
    error,
    refetch: fetchAlbums,
  };
}
