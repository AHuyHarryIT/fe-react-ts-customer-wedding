import { API_BASE_URL, api } from './apiClient';
import type {
  CustomerPrivateAlbum,
  CustomerPrivateAlbumListEnvelope,
  CustomerPrivateAlbumMediaLinks,
  PublicAlbum,
} from '@/types/album';

const toApiOrigin = () => {
  try {
    const baseOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
    return new URL(API_BASE_URL, baseOrigin).origin;
  } catch {
    return API_BASE_URL;
  }
};

const resolvePrivateAlbumsPayload = (
  responseData: CustomerPrivateAlbumListEnvelope | undefined
) => {
  const payload = responseData?.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

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
    const response = await api.get<CustomerPrivateAlbumListEnvelope>('/customer/albums/private');

    return resolvePrivateAlbumsPayload(response.data).map((album) => ({
      ...album,
      bookingReference: album.bookingReference ?? album.bookingId ?? null,
    }));
  },

  getCustomerPrivateAlbumMediaLinks: (fileId: string): CustomerPrivateAlbumMediaLinks => {
    const safeFileId = encodeURIComponent(fileId);
    const apiOrigin = toApiOrigin();

    return {
      thumbnailUrl: `${apiOrigin}/customer/albums/file/${safeFileId}/thumbnail`,
      contentUrl: `${apiOrigin}/customer/albums/file/${safeFileId}/content`,
    };
  },
};
