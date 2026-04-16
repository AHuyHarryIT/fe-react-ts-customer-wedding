import { beforeEach, describe, expect, it, vi } from 'vitest';

const getMock = vi.fn();
const postMock = vi.fn();

vi.mock('@/services/apiClient', () => ({
  api: {
    get: getMock,
    post: postMock,
  },
}));

describe('bookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests customer bookings with includePackages and updated-desc sorting', async () => {
    const { bookingService } = await import('./bookingService');

    getMock.mockResolvedValue({
      data: {
        success: true,
        data: { data: [] },
      },
    });

    await bookingService.getCustomerBookings();

    expect(getMock).toHaveBeenCalledWith('/bookings', {
      params: {
        includePackages: true,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      },
    });
  });
});
