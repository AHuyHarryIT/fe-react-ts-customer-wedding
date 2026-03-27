import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/apiClient';
import type { Package, PackageListPayload, PackagePagination } from '@/types/package';

interface UsePackagesOptions {
  page?: number;
  limit?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeServices?: boolean;
  isActive?: boolean;
}

export function usePackages({
  page = 1,
  limit = 100,
  search,
  minPrice,
  maxPrice,
  sortBy,
  sortOrder,
  includeServices = true,
  isActive = true,
}: UsePackagesOptions = {}) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [pagination, setPagination] = useState<PackagePagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch packages
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = {
        page,
        limit,
        includeServices,
        isActive,
        ...(search?.trim() ? { search: search.trim() } : {}),
        ...(minPrice !== undefined ? { minPrice } : {}),
        ...(maxPrice !== undefined ? { maxPrice } : {}),
        ...(sortBy ? { sortBy } : {}),
        ...(sortOrder ? { sortOrder } : {}),
      };
      const response = await api.get('/packages', { params: queryParams });
      const payload = (response.data?.data || []) as PackageListPayload;
      const paginationPayload = response.data?.pagination as PackagePagination | undefined;

      setPackages(Array.isArray(payload) ? payload : []);
      setPagination(paginationPayload ?? null);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
      setError('Failed to load packages');
      setPackages([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [includeServices, isActive, limit, maxPrice, minPrice, page, search, sortBy, sortOrder]);

  // Fetch packages on mount
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return {
    packages,
    pagination,
    loading,
    error,
    refetch: fetchPackages,
  };
}
