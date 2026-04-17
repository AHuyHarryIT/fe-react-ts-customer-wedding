import { useCallback, useEffect, useState } from 'react';
import { albumService } from '@/services/albumService';
import type { CustomerPrivateAlbum } from '@/types/album';

export function useCustomerPrivateAlbums() {
  const [albums, setAlbums] = useState<CustomerPrivateAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const privateAlbums = await albumService.getCustomerPrivateAlbums();
      setAlbums(privateAlbums);
    } catch (err) {
      console.error('Failed to fetch customer private albums:', err);
      setError('Failed to load private albums');
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
