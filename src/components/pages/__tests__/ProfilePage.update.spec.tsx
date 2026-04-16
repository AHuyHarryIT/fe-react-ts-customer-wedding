import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfilePage } from '../ProfilePage';

const {
  useCustomerProfileMock,
  updateProfileMock,
  changePasswordMock,
  refetchMock,
  toastSuccessMock,
  toastErrorMock,
} = vi.hoisted(() => ({
  useCustomerProfileMock: vi.fn(),
  updateProfileMock: vi.fn(),
  changePasswordMock: vi.fn(),
  refetchMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
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
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

const baseProfile = {
  id: 'user-1',
  phoneNumber: '0981234567',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ProfilePage update behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    refetchMock.mockResolvedValue(undefined);

    useCustomerProfileMock.mockReturnValue({
      profile: baseProfile,
      loading: false,
      error: null,
      refetch: refetchMock,
    });

    updateProfileMock.mockResolvedValue(baseProfile);
    changePasswordMock.mockResolvedValue({ success: true, message: 'Password changed' });
  });

  it('blocks personal submit on invalid email and invalid phone with inline validation', async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    await user.clear(screen.getByLabelText(/email address/i));
    await user.type(screen.getByLabelText(/email address/i), 'invalid-email');

    await user.clear(screen.getByLabelText(/phone number/i));
    await user.type(screen.getByLabelText(/phone number/i), '12345');

    await user.click(screen.getByRole('button', { name: /save profile changes/i }));

    expect(updateProfileMock).not.toHaveBeenCalled();
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter a valid vietnamese phone number/i)).toBeInTheDocument();
  });

  it('submits trimmed payload with phoneNumber key for valid personal updates', async () => {
    const user = userEvent.setup();
    render(<ProfilePage />);

    await user.clear(screen.getByLabelText(/first name/i));
    await user.type(screen.getByLabelText(/first name/i), '  Jane  ');

    await user.clear(screen.getByLabelText(/last name/i));
    await user.type(screen.getByLabelText(/last name/i), '  Smith  ');

    await user.clear(screen.getByLabelText(/email address/i));
    await user.type(screen.getByLabelText(/email address/i), '  jane.smith@example.com  ');

    await user.clear(screen.getByLabelText(/phone number/i));
    await user.type(screen.getByLabelText(/phone number/i), '  +84981234567  ');

    await user.click(screen.getByRole('button', { name: /save profile changes/i }));

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phoneNumber: '+84981234567',
      });
    });

    const firstCall = updateProfileMock.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(firstCall).not.toHaveProperty('phone');
  });

  it('maps backend details.fields to inline input errors including phone alias', async () => {
    updateProfileMock.mockRejectedValue({
      response: {
        data: {
          message: 'Validation failed',
          details: {
            fields: [
              { field: 'email', code: 'CONFLICT', message: 'Email already exists' },
              { field: 'phone', code: 'CONFLICT', message: 'Phone number already exists' },
            ],
          },
        },
      },
    });

    const user = userEvent.setup();
    render(<ProfilePage />);

    await user.click(screen.getByRole('button', { name: /save profile changes/i }));

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('Email already exists')).toBeInTheDocument();
    expect(screen.getByText('Phone number already exists')).toBeInTheDocument();
  });
});
