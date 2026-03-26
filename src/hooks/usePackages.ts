import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/apiClient';
import type { Package, PackageListPayload } from '@/types/package';

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch packages
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/packages?includeServices=true');
      const payload = (response.data?.data || []) as PackageListPayload;

      if (Array.isArray(payload)) {
        setPackages(payload);
        return;
      }

      if (Array.isArray(payload?.data)) {
        setPackages(payload.data);
        return;
      }

      setPackages([]);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
      setError('Failed to load packages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch packages on mount
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return {
    packages,
    loading,
    error,
    refetch: fetchPackages,
  };
}
