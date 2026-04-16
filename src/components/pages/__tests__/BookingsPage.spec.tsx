import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BookingsPage } from '../BookingsPage';
import type { Booking } from '@/types/booking';

const { useCustomerBookingsMock, useSearchMock } = vi.hoisted(() => ({
  useCustomerBookingsMock: vi.fn(),
  useSearchMock: vi.fn(),
}));

vi.mock('@/hooks/useCustomerBookings', () => ({
  useCustomerBookings: useCustomerBookingsMock,
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    params,
    search,
    children,
    ...rest
  }: {
    to: string;
    params?: { id?: string };
    search?: Record<string, string | undefined>;
    children?: ReactNode;
  }) => {
    const pathname = to === '/bookings/$id' ? `/bookings/${params?.id}` : to;
    const query = search?.packageId ? `?packageId=${encodeURIComponent(search.packageId)}` : '';

    return (
      <a href={`${pathname}${query}`} {...rest}>
        {children}
      </a>
    );
  },
  useSearch: useSearchMock,
}));

vi.mock('@/components/pages/CustomerStatePanel', () => ({
  CustomerStatePanel: ({
    tone,
    title,
    description,
    actions,
    children,
  }: {
    tone: string;
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
    children?: ReactNode;
  }) => (
    <section data-testid={`state-${tone}`}>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {children}
      {actions}
    </section>
  ),
}));

const createBooking = (overrides: Partial<Booking>): Booking => ({
  id: 'booking-1',
  customerId: 'customer-1',
  status: 'PENDING',
  eventDate: '2026-12-01T00:00:00.000Z',
  createdAt: '2026-04-16T00:00:00.000Z',
  updatedAt: '2026-04-16T00:00:00.000Z',
  ...overrides,
});

describe('BookingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSearchMock.mockReturnValue({ packageId: undefined });
  });

  it('shows empty state with secondary create action', () => {
    useCustomerBookingsMock.mockReturnValue({
      bookings: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<BookingsPage />);

    expect(screen.getByTestId('state-empty')).toBeInTheDocument();
    expect(screen.getByText(/no bookings yet/i)).toBeInTheDocument();

    const createLinks = screen.getAllByRole('link', { name: /create booking/i });
    expect(createLinks.some((link) => link.getAttribute('href') === '/booking')).toBe(true);
  });

  it('shows populated bookings with status, event date, and detail links', () => {
    useCustomerBookingsMock.mockReturnValue({
      bookings: [
        createBooking({ id: 'booking-1', status: 'DEPOSIT_PAID' }),
        createBooking({ id: 'booking-2', status: 'CONFIRMED' }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<BookingsPage />);

    expect(screen.getByText(/deposit paid/i)).toBeInTheDocument();
    expect(screen.getByText(/confirmed/i)).toBeInTheDocument();

    const bookingRows = screen.getAllByRole('article');
    expect(bookingRows).toHaveLength(2);
    bookingRows.forEach((row) => {
      expect(within(row).getByText(/event date:/i)).toBeInTheDocument();
    });

    const detailLinks = screen.getAllByRole('link', { name: /view booking details/i });
    expect(detailLinks).toHaveLength(2);
    expect(detailLinks[0]).toHaveAttribute('href', '/bookings/booking-1');
    expect(detailLinks[1]).toHaveAttribute('href', '/bookings/booking-2');
  });
});
