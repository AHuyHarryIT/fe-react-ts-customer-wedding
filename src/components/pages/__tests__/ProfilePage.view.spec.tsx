import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfilePage } from '../ProfilePage';

const { useCustomerProfileMock, updateProfileMock, changePasswordMock } = vi.hoisted(() => ({
  useCustomerProfileMock: vi.fn(),
  updateProfileMock: vi.fn(),
  changePasswordMock: vi.fn(),
}));

vi.mock('@/hooks/useCustomerProfile', () => ({
  useCustomerProfile: useCustomerProfileMock,
}));

vi.mock('@/services/authService', () => ({
  authApi: {
    updateProfile: updateProfileMock,
    changePassword: changePasswordMock,
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ProfilePage view states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateProfileMock.mockResolvedValue(undefined);
    changePasswordMock.mockResolvedValue(undefined);
  });

  it('shows explicit loading state while profile is being fetched', () => {
    useCustomerProfileMock.mockReturnValue({
      profile: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<ProfilePage />);

    expect(screen.getByText(/loading account details/i)).toBeInTheDocument();
    expect(
      screen.getByText(/we are refreshing your profile and security information/i)
    ).toBeInTheDocument();
  });

  it('shows explicit error state with retry affordance when profile fetch fails', () => {
    useCustomerProfileMock.mockReturnValue({
      profile: null,
      loading: false,
      error: 'Failed to load customer profile',
      refetch: vi.fn(),
    });

    render(<ProfilePage />);

    expect(screen.getByText(/could not load profile/i)).toBeInTheDocument();
    expect(screen.getByText(/failed to load customer profile/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('shows explicit empty state when profile data is unavailable', () => {
    useCustomerProfileMock.mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<ProfilePage />);

    expect(screen.getByText(/profile unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/we could not find your profile data/i)).toBeInTheDocument();
  });

  it('renders loaded profile fields and save-profile action copy', () => {
    useCustomerProfileMock.mockReturnValue({
      profile: {
        id: 'customer-1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phoneNumber: '0981234567',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<ProfilePage />);

    expect(screen.getByLabelText(/first name/i)).toHaveValue('Jane');
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe');
    expect(screen.getByLabelText(/email address/i)).toHaveValue('jane@example.com');
    expect(screen.getByLabelText(/phone number/i)).toHaveValue('0981234567');
    expect(screen.getByRole('button', { name: /save profile changes/i })).toBeInTheDocument();
  });
});
