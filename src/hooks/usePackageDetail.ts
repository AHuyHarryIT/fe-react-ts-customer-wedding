import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/apiClient';
import type { Package } from '@/types/package';

export function usePackageDetail(packageId?: string) {
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackageDetail = useCallback(async () => {
    if (!packageId) {
      setPackageData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/packages/${packageId}`);
      const data = (response.data?.data || null) as Package | null;
      setPackageData(data);
    } catch (err) {
      console.error('Failed to fetch package details:', err);
      setError('Package not found.');
      setPackageData(null);
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    fetchPackageDetail();
  }, [fetchPackageDetail]);

  return {
    packageData,
    loading,
    error,
    refetch: fetchPackageDetail,
  };
}
