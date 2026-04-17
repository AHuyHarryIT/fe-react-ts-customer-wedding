import { api } from './apiClient';
import type { CustomerPrivateAlbum, PublicAlbum } from '@/types/album';

export const albumService = {
  getPublicAlbums: async (): Promise<PublicAlbum[]> => {
    const response = await api.get<{ data?: PublicAlbum[] | { data?: PublicAlbum[] } }>(
      '/albums/public'
    );

    const payload = response.data?.data;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    return [];
  },

  getCustomerPrivateAlbums: async (): Promise<CustomerPrivateAlbum[]> => {
    const response = await api.get<{
      data?: CustomerPrivateAlbum[] | { data?: CustomerPrivateAlbum[] };
    }>('/customer/albums/private');

    const payload = response.data?.data;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    return [];
  },
};
