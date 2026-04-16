import type { ReactNode } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BookingDetailPage } from '../BookingDetailPage';
import type { Booking, BookingSession } from '@/types/booking';

const { getBookingDetailsMock } = vi.hoisted(() => ({
  getBookingDetailsMock: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...rest }: { to: string; children?: ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useParams: () => ({ id: 'booking-1' }),
}));

vi.mock('@/services/bookingService', () => ({
  bookingService: {
    getBookingDetails: getBookingDetailsMock,
  },
}));

vi.mock('@/services/customerOrderService', () => ({
  customerOrderService: {
    checkoutDeposit: vi.fn(),
  },
}));

const createSession = (overrides: Partial<BookingSession> = {}): BookingSession => ({
  id: 'session-1',
  title: 'Main Session',
  startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  endsAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
  locationName: 'Central Studio',
  startDate: undefined,
  endDate: undefined,
  location: undefined,
  ...overrides,
});

const createBooking = (overrides: Partial<Booking> = {}): Booking => ({
  id: 'booking-1',
  customerId: 'customer-1',
  status: 'PENDING',
  eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  sessions: [createSession()],
  ...overrides,
});

const getMilestoneState = (label: string) => {
  const labelNode = screen.getByText(label);
  const item = labelNode.closest('li');
  expect(item).not.toBeNull();

  const stateNode = within(item as HTMLElement).getByTestId('milestone-state');
  return stateNode.textContent;
};

describe('BookingDetailPage timeline behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('projects confirmed status so earlier milestones are completed and confirmed is current', async () => {
    getBookingDetailsMock.mockResolvedValue(
      createBooking({
        status: 'CONFIRMED',
      })
    );

    render(<BookingDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/booking progress/i)).toBeInTheDocument();
    });

    expect(getMilestoneState('Booking requested')).toBe('Completed');
    expect(getMilestoneState('Deposit paid')).toBe('Completed');
    expect(getMilestoneState('Booking confirmed')).toBe('Current');
    expect(getMilestoneState('Completed')).toBe('Upcoming');
  });

  it('uses cancelled as terminal milestone instead of completed', async () => {
    getBookingDetailsMock.mockResolvedValue(
      createBooking({
        status: 'CANCELLED',
      })
    );

    render(<BookingDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/booking progress/i)).toBeInTheDocument();
    });

    expect(getMilestoneState('Cancelled')).toBe('Current');
    expect(getMilestoneState('Completed')).toBe('Upcoming');
  });

  it('shows neutral fallback milestone for unknown status values', async () => {
    getBookingDetailsMock.mockResolvedValue(
      createBooking({
        status: 'ARCHIVED',
      })
    );

    render(<BookingDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/booking progress/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Status update pending')).toBeInTheDocument();
    expect(screen.getByTestId('timeline-fallback-state')).toHaveTextContent('Neutral');
  });

  it('selects the earliest upcoming session for milestone enrichment when multiple sessions exist', async () => {
    const now = Date.now();
    const sessions = [
      createSession({
        id: 'session-past',
        title: 'Past Session',
        startsAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      }),
      createSession({
        id: 'session-future-2',
        title: 'Future Session 2',
        startsAt: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(),
      }),
      createSession({
        id: 'session-future-1',
        title: 'Future Session 1',
        startsAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
        locationName: 'City Hall',
      }),
    ];

    getBookingDetailsMock.mockResolvedValue(
      createBooking({
        status: 'CONFIRMED',
        sessions,
      })
    );

    render(<BookingDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/booking progress/i)).toBeInTheDocument();
    });

    expect(screen.getByTestId('timeline-session-title')).toHaveTextContent('Future Session 1');
    expect(screen.getByTestId('timeline-session-location')).toHaveTextContent('City Hall');
  });
});
