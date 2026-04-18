import { beforeEach, describe, expect, it, vi } from 'vitest';

const getMock = vi.fn();

vi.mock('@/services/apiClient', () => ({
  API_BASE_URL: 'http://localhost:3000',
  api: {
    get: getMock,
  },
}));

describe('albumService private endpoint contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests authenticated customer private albums endpoint', async () => {
    const { albumService } = await import('./albumService');

    getMock.mockResolvedValue({
      data: {
        success: true,
        data: [],
      },
    });

    await albumService.getCustomerPrivateAlbums();

    expect(getMock).toHaveBeenCalledWith('/customer/albums/private');
  });

  it('normalizes private albums from flat paginated payload shape', async () => {
    const { albumService } = await import('./albumService');

    getMock.mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 'album-1',
            title: 'The Wedding Day',
            bookingId: 'booking-1',
            eventDate: '2026-03-01T00:00:00.000Z',
            deliveredAssetCount: 42,
            coverFile: { id: 'file-1', name: 'cover.jpg', mimeType: 'image/jpeg', byteSize: 1000 },
          },
        ],
        pagination: { page: 1, limit: 10, total: 1 },
      },
    });

    const result = await albumService.getCustomerPrivateAlbums();

    expect(result).toEqual([
      {
        id: 'album-1',
        title: 'The Wedding Day',
        bookingId: 'booking-1',
        bookingReference: 'booking-1',
        eventDate: '2026-03-01T00:00:00.000Z',
        deliveredAssetCount: 42,
        coverFile: { id: 'file-1', name: 'cover.jpg', mimeType: 'image/jpeg', byteSize: 1000 },
      },
    ]);
  });

  it('normalizes private albums from nested data payload shape', async () => {
    const { albumService } = await import('./albumService');

    getMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          data: [
            {
              id: 'album-2',
              title: 'Nested payload album',
              bookingId: null,
              bookingReference: null,
              eventDate: null,
              deliveredAssetCount: 0,
              coverFile: null,
            },
          ],
          pagination: { page: 1, limit: 10, total: 1 },
        },
      },
    });

    const result = await albumService.getCustomerPrivateAlbums();

    expect(result).toEqual([
      {
        id: 'album-2',
        title: 'Nested payload album',
        bookingId: null,
        bookingReference: null,
        eventDate: null,
        deliveredAssetCount: 0,
        coverFile: null,
      },
    ]);
  });

  it('returns an empty list when private album payload is missing or invalid', async () => {
    const { albumService } = await import('./albumService');

    getMock.mockResolvedValue({
      data: {
        success: true,
        data: { data: 'unexpected' },
      },
    });

    const result = await albumService.getCustomerPrivateAlbums();

    expect(result).toEqual([]);
  });

  it('builds protected thumbnail/content URLs for customer album file endpoints', async () => {
    const { albumService } = await import('./albumService');

    const result = albumService.getCustomerPrivateAlbumMediaLinks('file-123');

    expect(result).toEqual({
      thumbnailUrl: 'http://localhost:3000/customer/albums/file/file-123/thumbnail',
      contentUrl: 'http://localhost:3000/customer/albums/file/file-123/content',
    });
  });

  it('requests customer private album assets and normalizes per-asset preview/download links', async () => {
    const { albumService } = await import('./albumService');

    getMock.mockResolvedValue({
      data: {
        success: true,
        data: [
          {
            id: 'asset-1',
            name: 'highlight.jpg',
            mimeType: 'image/jpeg',
            byteSize: 1200,
          },
          {
            id: 'asset-2',
            name: 'dance.mov',
            mimeType: 'video/quicktime',
            byteSize: 2200,
          },
        ],
      },
    });

    const result = await albumService.getCustomerPrivateAlbumAssets('album-123');

    expect(getMock).toHaveBeenCalledWith('/customer/albums/album-123/assets');
    expect(result).toEqual([
      {
        id: 'asset-1',
        name: 'highlight.jpg',
        mimeType: 'image/jpeg',
        byteSize: 1200,
        protectedMedia: {
          thumbnailUrl: 'http://localhost:3000/customer/albums/file/asset-1/thumbnail',
          contentUrl: 'http://localhost:3000/customer/albums/file/asset-1/content',
        },
      },
      {
        id: 'asset-2',
        name: 'dance.mov',
        mimeType: 'video/quicktime',
        byteSize: 2200,
        protectedMedia: {
          thumbnailUrl: 'http://localhost:3000/customer/albums/file/asset-2/thumbnail',
          contentUrl: 'http://localhost:3000/customer/albums/file/asset-2/content',
        },
      },
    ]);
  });

  it('builds deterministic customer zip download endpoint for private albums', async () => {
    const { albumService } = await import('./albumService');

    expect(albumService.getCustomerPrivateAlbumZipDownloadLink('album-zip-id')).toBe(
      'http://localhost:3000/customer/albums/album-zip-id/download.zip'
    );
  });
});
