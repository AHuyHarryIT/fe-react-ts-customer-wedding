import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BookingFlowPage } from '@/components/pages/BookingFlowPage';
import { BookingsPage } from '@/components/pages/BookingsPage';

const { requireAuthMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
}));

vi.mock('@/shared/routeConfig', () => ({
  requireAuth: requireAuthMock,
}));

describe('booking route contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthMock.mockResolvedValue(undefined);
  });

  it('/bookings route remains guarded and mounts BookingsPage', async () => {
    const { Route } = await import('../bookings/index');

    expect(Route.options.component).toBe(BookingsPage);

    const location = { pathname: '/bookings', searchStr: '' };
    await Route.options.beforeLoad?.({ location } as never);

    expect(requireAuthMock).toHaveBeenCalledWith({ location });
  });

  it('/booking route remains guarded and preserves packageId search parsing', async () => {
    const { Route } = await import('../booking');

    expect(Route.options.component).toBe(BookingFlowPage);

    const validateSearch = Route.options.validateSearch as (search: Record<string, unknown>) => {
      packageId?: string;
    };

    expect(validateSearch({ packageId: 'pkg-123' })).toEqual({
      packageId: 'pkg-123',
    });
    expect(validateSearch({ packageId: 123 })).toEqual({
      packageId: undefined,
    });

    const location = { pathname: '/booking', searchStr: '?packageId=pkg-123' };
    await Route.options.beforeLoad?.({ location } as never);

    expect(requireAuthMock).toHaveBeenCalledWith({ location });
  });
});
