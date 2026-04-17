import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requireAuthMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
}));

vi.mock('@/shared/routeConfig', () => ({
  requireAuth: requireAuthMock,
}));

describe('private albums route contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthMock.mockResolvedValue(undefined);
  });

  it('remains auth-gated and forwards location to requireAuth', async () => {
    const { Route } = await import('../albums/private');

    const location = { pathname: '/albums/private', searchStr: '' };
    await Route.options.beforeLoad?.({ location } as never);

    expect(requireAuthMock).toHaveBeenCalledWith({ location });
  });

  it('registers /albums/private file-route path', async () => {
    const { Route } = await import('../albums/private');

    expect(Route.id).toBe('/albums/private');
    expect(Route.path).toBe('/albums/private');
  });
});
