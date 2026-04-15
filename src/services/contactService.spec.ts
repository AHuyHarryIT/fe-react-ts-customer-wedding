import { beforeEach, describe, expect, it, vi } from 'vitest';

const postMock = vi.fn();

vi.mock('@/services/apiClient', () => ({
  api: {
    post: postMock,
  },
}));

describe('contactService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts payload to /public-inquiries and returns normalized inquiry data', async () => {
    const { submitPublicInquiry } = await import('./contactService');

    postMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'inquiry-1',
          name: 'Jane Doe',
          email: 'jane@example.com',
          message: 'Looking for package details',
          phone: '+84 123',
          packageInterest: 'Premium',
          createdAt: '2026-04-15T00:00:00.000Z',
          updatedAt: '2026-04-15T00:00:00.000Z',
        },
      },
    });

    const payload = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Looking for package details',
      phone: '+84 123',
      packageInterest: 'Premium',
    };

    const result = await submitPublicInquiry(payload);

    expect(postMock).toHaveBeenCalledWith('/public-inquiries', payload);
    expect(result).toEqual({
      id: 'inquiry-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Looking for package details',
      phone: '+84 123',
      packageInterest: 'Premium',
      createdAt: '2026-04-15T00:00:00.000Z',
      updatedAt: '2026-04-15T00:00:00.000Z',
    });
  });

  it('propagates API errors for retry UX handling', async () => {
    const { submitPublicInquiry } = await import('./contactService');

    const failure = new Error('network failed');
    postMock.mockRejectedValue(failure);

    await expect(
      submitPublicInquiry({
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Need details',
      })
    ).rejects.toThrow('network failed');
  });
});
