import { API_BASE_URL, api } from './apiClient';
import type {
  CustomerPrivateAlbum,
  CustomerPrivateAlbumAsset,
  CustomerPrivateAlbumListEnvelope,
  CustomerPrivateAlbumListResult,
  CustomerPrivateAlbumMediaLinks,
  PublicAlbum,
  PublicAlbumDetail,
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
): CustomerPrivateAlbumListResult => {
  const payload = responseData?.data;

  if (Array.isArray(payload)) {
    return {
      data: payload,
      pagination: responseData?.pagination ?? null,
    };
  }

  if (payload && typeof payload === 'object') {
    return {
      data: Array.isArray(payload.data) ? payload.data : [],
      pagination: payload.pagination ?? responseData?.pagination ?? null,
    };
  }

  return {
    data: [],
    pagination: responseData?.pagination ?? null,
  };
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

const resolvePublicAlbumDetailPayload = (responseData: { data?: unknown } | undefined) => {
  const payload = responseData?.data;

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data?: unknown }).data;
  }

  return payload;
};

export const albumService = {
  getPublicAlbumCoverThumbnailUrl: (fileId: string): string => {
    const safeFileId = encodeURIComponent(fileId);
    const apiOrigin = toApiOrigin();

    return `${apiOrigin}/albums/public/file/${safeFileId}/thumbnail`;
  },

  getPublicAlbumContentUrl: (fileId: string): string => {
    const safeFileId = encodeURIComponent(fileId);
    const apiOrigin = toApiOrigin();

    return `${apiOrigin}/albums/public/file/${safeFileId}/content`;
  },

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

  getPublicAlbumByShareToken: async (token: string): Promise<PublicAlbumDetail | null> => {
    const safeToken = encodeURIComponent(token);
    const response = await api.get<{ data?: unknown }>(`/albums/share/${safeToken}`);
    const payload = resolvePublicAlbumDetailPayload(response.data);

    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const files = Array.isArray((payload as { files?: unknown }).files)
      ? (payload as { files: unknown[] }).files
          .filter((entry) => entry && typeof entry === 'object')
          .map((entry) => {
            const mapped = entry as {
              fileId?: unknown;
              albumId?: unknown;
              sortOrder?: unknown;
              caption?: unknown;
              file?: unknown;
            };

            const nestedFile = mapped.file;
            const normalizedFile = nestedFile && typeof nestedFile === 'object' ? nestedFile : {};

            return {
              fileId: typeof mapped.fileId === 'string' ? mapped.fileId : '',
              albumId: typeof mapped.albumId === 'string' ? mapped.albumId : '',
              sortOrder: typeof mapped.sortOrder === 'number' ? mapped.sortOrder : 0,
              caption: typeof mapped.caption === 'string' ? mapped.caption : null,
              file: {
                id:
                  typeof (normalizedFile as { id?: unknown }).id === 'string'
                    ? ((normalizedFile as { id: string }).id as string)
                    : '',
                name:
                  typeof (normalizedFile as { name?: unknown }).name === 'string'
                    ? ((normalizedFile as { name: string }).name as string)
                    : null,
                mimeType:
                  typeof (normalizedFile as { mimeType?: unknown }).mimeType === 'string'
                    ? ((normalizedFile as { mimeType: string }).mimeType as string)
                    : null,
                byteSize:
                  typeof (normalizedFile as { byteSize?: unknown }).byteSize === 'number'
                    ? ((normalizedFile as { byteSize: number }).byteSize as number)
                    : null,
                storageUrl:
                  typeof (normalizedFile as { storageUrl?: unknown }).storageUrl === 'string'
                    ? ((normalizedFile as { storageUrl: string }).storageUrl as string)
                    : null,
              },
            };
          })
          .filter((entry) => entry.fileId.length > 0 && entry.file.id.length > 0)
      : [];

    return {
      id:
        typeof (payload as { id?: unknown }).id === 'string' ? (payload as { id: string }).id : '',
      title:
        typeof (payload as { title?: unknown }).title === 'string'
          ? (payload as { title: string }).title
          : 'Public Album',
      description:
        typeof (payload as { description?: unknown }).description === 'string'
          ? (payload as { description: string }).description
          : null,
      createdAt:
        typeof (payload as { createdAt?: unknown }).createdAt === 'string'
          ? (payload as { createdAt: string }).createdAt
          : new Date().toISOString(),
      files,
    };
  },

  getPublicAlbumById: async (albumId: string): Promise<PublicAlbumDetail | null> => {
    const safeAlbumId = encodeURIComponent(albumId);
    const response = await api.get<{ data?: unknown }>(`/albums/public/${safeAlbumId}`);
    const payload = resolvePublicAlbumDetailPayload(response.data);

    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const files = Array.isArray((payload as { files?: unknown }).files)
      ? (payload as { files: unknown[] }).files
          .filter((entry) => entry && typeof entry === 'object')
          .map((entry) => {
            const mapped = entry as {
              fileId?: unknown;
              albumId?: unknown;
              sortOrder?: unknown;
              caption?: unknown;
              file?: unknown;
            };

            const nestedFile = mapped.file;
            const normalizedFile = nestedFile && typeof nestedFile === 'object' ? nestedFile : {};

            return {
              fileId: typeof mapped.fileId === 'string' ? mapped.fileId : '',
              albumId: typeof mapped.albumId === 'string' ? mapped.albumId : '',
              sortOrder: typeof mapped.sortOrder === 'number' ? mapped.sortOrder : 0,
              caption: typeof mapped.caption === 'string' ? mapped.caption : null,
              file: {
                id:
                  typeof (normalizedFile as { id?: unknown }).id === 'string'
                    ? ((normalizedFile as { id: string }).id as string)
                    : '',
                name:
                  typeof (normalizedFile as { name?: unknown }).name === 'string'
                    ? ((normalizedFile as { name: string }).name as string)
                    : null,
                mimeType:
                  typeof (normalizedFile as { mimeType?: unknown }).mimeType === 'string'
                    ? ((normalizedFile as { mimeType: string }).mimeType as string)
                    : null,
                byteSize:
                  typeof (normalizedFile as { byteSize?: unknown }).byteSize === 'number'
                    ? ((normalizedFile as { byteSize: number }).byteSize as number)
                    : null,
                storageUrl:
                  typeof (normalizedFile as { storageUrl?: unknown }).storageUrl === 'string'
                    ? ((normalizedFile as { storageUrl: string }).storageUrl as string)
                    : null,
              },
            };
          })
          .filter((entry) => entry.fileId.length > 0 && entry.file.id.length > 0)
      : [];

    return {
      id:
        typeof (payload as { id?: unknown }).id === 'string' ? (payload as { id: string }).id : '',
      title:
        typeof (payload as { title?: unknown }).title === 'string'
          ? (payload as { title: string }).title
          : 'Public Album',
      description:
        typeof (payload as { description?: unknown }).description === 'string'
          ? (payload as { description: string }).description
          : null,
      createdAt:
        typeof (payload as { createdAt?: unknown }).createdAt === 'string'
          ? (payload as { createdAt: string }).createdAt
          : new Date().toISOString(),
      files,
    };
  },

  getCustomerPrivateAlbums: async (): Promise<CustomerPrivateAlbum[]> => {
    const response = await api.get<CustomerPrivateAlbumListEnvelope>('/customer/albums/private');
    const payload = resolvePrivateAlbumsPayload(response.data);

    return payload.data.map((album) => ({
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
