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

    const location = {
      pathname: '/albums/private',
      searchStr: '?view=cards',
      href: '/albums/private?view=cards',
    };

    await Route.options.beforeLoad?.({ location } as never);

    expect(requireAuthMock).toHaveBeenCalledTimes(1);
    expect(requireAuthMock).toHaveBeenCalledWith({ location });
  });

  it('registers /albums/private file-route path', async () => {
    const { Route } = await import('../albums/private');

    expect(Route.options.loaderDeps).toBeUndefined();
    expect(Route.options.beforeLoad).toBeTypeOf('function');
  });
});
