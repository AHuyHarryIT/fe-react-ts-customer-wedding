import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactPage } from './ContactPage';

const submitPublicInquiryMock = vi.fn();

vi.mock('@/services/contactService', () => ({
  submitPublicInquiry: submitPublicInquiryMock,
}));

describe('ContactPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders minimal lead-capture contract fields', () => {
    render(<ContactPage />);

    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/package interest/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/subject/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/i agree to receive communication/i)).not.toBeInTheDocument();
  });

  it('transitions idle -> submitting -> success only after persistence and resets form', async () => {
    submitPublicInquiryMock.mockResolvedValue({
      id: 'inquiry-1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Need package details',
      phone: '+84 123',
      packageInterest: 'Premium',
      createdAt: '2026-04-15T00:00:00.000Z',
      updatedAt: '2026-04-15T00:00:00.000Z',
    });

    render(<ContactPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/your name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/phone number/i), '+84 123');
    await user.selectOptions(screen.getByLabelText(/package interest/i), 'Premium');
    await user.type(screen.getByLabelText(/^message/i), 'Need package details');

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(submitPublicInquiryMock).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+84 123',
      packageInterest: 'Premium',
      message: 'Need package details',
    });

    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();

    await waitFor(() => {
      expect(
        screen.getByText(/thanks for reaching out! we will follow up within 24 hours/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/your name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email address/i)).toHaveValue('');
    expect(screen.getByLabelText(/phone number/i)).toHaveValue('');
    expect(screen.getByLabelText(/^message/i)).toHaveValue('');
  });

  it('transitions to failure with retry guidance and preserves values', async () => {
    submitPublicInquiryMock.mockRejectedValue(new Error('Request failed'));

    render(<ContactPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/your name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/^message/i), 'Need package details');

    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/we couldn't send your inquiry right now/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/please try again in a moment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your name/i)).toHaveValue('Jane Doe');
    expect(screen.getByLabelText(/email address/i)).toHaveValue('jane@example.com');
    expect(screen.getByLabelText(/^message/i)).toHaveValue('Need package details');
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
