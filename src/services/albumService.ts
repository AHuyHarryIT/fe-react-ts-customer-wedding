import { API_BASE_URL, api } from './apiClient';
import type {
  CustomerPrivateAlbum,
  CustomerPrivateAlbumAsset,
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

const resolvePrivateAlbumAssetsPayload = (responseData: { data?: unknown } | undefined) => {
  const payload = responseData?.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray((payload as { data?: unknown } | undefined)?.data)) {
    return (payload as { data: unknown[] }).data;
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

  getCustomerPrivateAlbumAssets: async (albumId: string): Promise<CustomerPrivateAlbumAsset[]> => {
    const safeAlbumId = encodeURIComponent(albumId);
    const response = await api.get<{ data?: unknown }>(`/customer/albums/${safeAlbumId}/assets`);

    return resolvePrivateAlbumAssetsPayload(response.data).flatMap((asset) => {
      if (!asset || typeof asset !== 'object') {
        return [];
      }

      const fileId = (asset as { id?: unknown }).id;
      if (typeof fileId !== 'string' || fileId.trim().length === 0) {
        return [];
      }

      return [
        {
          id: fileId,
          name: (asset as { name?: string | null }).name ?? null,
          mimeType: (asset as { mimeType?: string | null }).mimeType ?? null,
          byteSize: (asset as { byteSize?: number | null }).byteSize ?? null,
          protectedMedia: albumService.getCustomerPrivateAlbumMediaLinks(fileId),
        },
      ];
    });
  },

  getCustomerPrivateAlbumZipDownloadLink: (albumId: string): string => {
    const safeAlbumId = encodeURIComponent(albumId);
    const apiOrigin = toApiOrigin();

    return `${apiOrigin}/customer/albums/${safeAlbumId}/download.zip`;
  },
};
