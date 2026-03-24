import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/bookingService';

export interface Package {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive?: boolean;
  coverImageUrl?: string | null;
  images?: Array<{
    id: string;
    imageUrl: string;
    sortOrder: number;
  }>;
  services?: Array<{
    serviceId: string;
    service?: {
      id: string;
      name: string;
      description?: string | null;
      price?: number;
    };
  }>;
  createdAt?: string;
  updatedAt?: string;
}

type PackageListPayload =
  | Package[]
  | {
      data?: Package[];
      pagination?: unknown;
    };

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
