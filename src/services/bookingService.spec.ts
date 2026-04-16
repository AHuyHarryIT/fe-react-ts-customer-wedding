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

  it('normalizes booking detail sessions from canonical backend keys', async () => {
    const { bookingService } = await import('./bookingService');

    getMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'booking-1',
          customerId: 'customer-1',
          status: 'CONFIRMED',
          eventDate: '2026-11-01T00:00:00.000Z',
          createdAt: '2026-04-16T00:00:00.000Z',
          updatedAt: '2026-04-16T00:00:00.000Z',
          sessions: [
            {
              id: 'session-1',
              title: 'Ceremony',
              startsAt: '2026-11-20T09:00:00.000Z',
              endsAt: '2026-11-20T12:00:00.000Z',
              locationName: 'Downtown Hall',
            },
          ],
        },
      },
    });

    const result = await bookingService.getBookingDetails('booking-1');

    expect(getMock).toHaveBeenCalledWith('/bookings/booking-1');
    expect(result?.sessions?.[0]).toMatchObject({
      startsAt: '2026-11-20T09:00:00.000Z',
      endsAt: '2026-11-20T12:00:00.000Z',
      locationName: 'Downtown Hall',
      startDate: '2026-11-20T09:00:00.000Z',
      endDate: '2026-11-20T12:00:00.000Z',
      location: 'Downtown Hall',
    });
  });

  it('normalizes booking detail sessions from legacy alias keys', async () => {
    const { bookingService } = await import('./bookingService');

    getMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'booking-2',
          customerId: 'customer-1',
          status: 'PENDING',
          eventDate: '2026-12-01T00:00:00.000Z',
          createdAt: '2026-04-16T00:00:00.000Z',
          updatedAt: '2026-04-16T00:00:00.000Z',
          sessions: [
            {
              id: 'session-2',
              title: 'Reception',
              startDate: '2026-12-18T13:00:00.000Z',
              endDate: '2026-12-18T17:00:00.000Z',
              location: 'Garden Venue',
            },
          ],
        },
      },
    });

    const result = await bookingService.getBookingDetails('booking-2');

    expect(result?.sessions?.[0]).toMatchObject({
      startsAt: '2026-12-18T13:00:00.000Z',
      endsAt: '2026-12-18T17:00:00.000Z',
      locationName: 'Garden Venue',
      startDate: '2026-12-18T13:00:00.000Z',
      endDate: '2026-12-18T17:00:00.000Z',
      location: 'Garden Venue',
    });
  });

  it('preserves unknown booking status for safe UI fallback handling', async () => {
    const { bookingService } = await import('./bookingService');

    getMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'booking-3',
          customerId: 'customer-1',
          status: 'ARCHIVED',
          eventDate: '2026-12-15T00:00:00.000Z',
          createdAt: '2026-04-16T00:00:00.000Z',
          updatedAt: '2026-04-16T00:00:00.000Z',
          sessions: [],
        },
      },
    });

    const result = await bookingService.getBookingDetails('booking-3');

    expect(result?.status).toBe('ARCHIVED');
  });
});
