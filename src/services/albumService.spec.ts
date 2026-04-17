import { beforeEach, describe, expect, it, vi } from 'vitest';

const getMock = vi.fn();

vi.mock('@/services/apiClient', () => ({
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
});
