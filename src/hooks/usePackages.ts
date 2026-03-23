import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/bookingService';

export interface Package {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch packages
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/packages');
      const data = response.data?.data || [];
      setPackages(Array.isArray(data) ? data : []);
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
    refetch: fetchPackages
  };
}
