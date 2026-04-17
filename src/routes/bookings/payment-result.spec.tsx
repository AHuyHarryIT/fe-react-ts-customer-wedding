import type { ReactElement, ReactNode } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getBookingDetailsMock,
  checkMomoPaymentStatusMock,
  routeSearchState,
} = vi.hoisted(() => ({
  getBookingDetailsMock: vi.fn(),
  checkMomoPaymentStatusMock: vi.fn(),
  routeSearchState: {
    current: {} as Record<string, string | undefined>,
  },
}));

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () =>
    (options: unknown) => ({
      options,
    }),
  useSearch: () => routeSearchState.current,
  Link: ({
    to,
    params,
    className,
    children,
  }: {
    to: string;
    params?: { id?: string };
    className?: string;
    children?: ReactNode;
  }) => {
    const href = params?.id ? to.replace('$id', params.id) : to;

    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  },
}));

vi.mock('@/services/bookingService', () => ({
  bookingService: {
    getBookingDetails: getBookingDetailsMock,
  },
}));

vi.mock('@/services/customerOrderService', () => ({
  customerOrderService: {
    checkMomoPaymentStatus: checkMomoPaymentStatusMock,
  },
}));

type BookingDetailsResponse = {
  id: string;
  order: {
    summary: {
      totalPaid: number;
      balanceRemaining: number;
      totalPrice: number;
      isPaid: boolean;
      isPartiallyPaid: boolean;
    };
  };
};

const CUSTOMER_PAYMENT_BOOKING_KEY = 'customer_payment_booking_id';
const CUSTOMER_PAYMENT_MOMO_ORDER_KEY = 'customer_payment_momo_order_id';

const POLLING_CADENCE_MS = 2000;
const POLLING_ATTEMPTS_CAP = 14;

const TERMINAL_STATES = {
  success: 'success',
  gatewayConfirmedSyncing: 'gateway-confirmed-syncing',
  terminalFailureNeedsAction: 'terminal-failure-needs-action',
} as const;

const createBookingDetails = (
  totalPaid: number,
  balanceRemaining: number,
  totalPrice = totalPaid + balanceRemaining
): BookingDetailsResponse => ({
  id: 'booking-1',
  order: {
    summary: {
      totalPaid,
      balanceRemaining,
      totalPrice,
      isPaid: totalPaid >= totalPrice,
      isPartiallyPaid: totalPaid > 0 && totalPaid < totalPrice,
    },
  },
});

const setSearch = (search: Record<string, string | undefined>) => {
  routeSearchState.current = search;
};

const renderRouteComponent = async () => {
  const { Route } = await import('./payment-result');
  const Component = Route.options.component as () => ReactElement;
  render(<Component />);
};

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const settleAsyncState = async () => {
  await act(async () => {
    await flushPromises();
  });
};

const advancePoll = async (milliseconds = POLLING_CADENCE_MS) => {
  await act(async () => {
    vi.advanceTimersByTime(milliseconds);
    await flushPromises();
  });
};

const advancePollAttempts = async (attempts: number) => {
  for (let index = 0; index < attempts; index += 1) {
    await advancePoll(POLLING_CADENCE_MS);
  }
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const hasExactText = (value: string) => {
  const regex = new RegExp(`^${escapeRegex(value)}$`);
  return (_content: string, node: Element | null) => Boolean(node && regex.test(node.textContent ?? ''));
};

const SUCCESS_MESSAGE = 'Your deposit has been recorded successfully.';
const SYNCING_MESSAGE = 'MoMo confirmed your payment, but the booking record is still syncing.';
const SYNCING_BANNER_MESSAGE =
  'MoMo has confirmed the payment request. We are waiting for the studio system to finish syncing the final booking payment status.';
const TERMINAL_FAILURE_MESSAGE =
  'We couldn’t confirm this payment after the final verification checks. Return to booking to review status, or open Messages and share your booking ID + payment time so the studio can help.';
const MISSING_REFERENCE_TITLE = 'Payment reference missing';
const MISSING_REFERENCE_MESSAGE =
  'We couldn’t verify this payment because the booking reference is missing. Return to your booking and restart payment from the deposit section.';
const LOADING_MESSAGE = 'We are confirming your MoMo payment and syncing the booking record.';

const BACK_TO_BOOKING_LABEL = 'Back to booking';
const OPEN_MESSAGES_LABEL = 'Open Messages';

const PAID_DISPLAY_VALUE = '3.000.000';
const REMAINING_DISPLAY_VALUE = '7.000.000';

const getActionLabels = () =>
  screen
    .getAllByRole('link')
    .map((node) => node.textContent?.trim())
    .filter((label): label is string => Boolean(label));

describe('payment-result route deterministic reconciliation contract (PAYM-02)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useRealTimers();
    sessionStorage.clear();
    setSearch({});
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('allows terminal success only when backend summary reports totalPaid > 0 and clears handoff keys', async () => {
    expect(Object.keys(TERMINAL_STATES)).toHaveLength(3);

    setSearch({
      bookingId: 'booking-1',
      orderId: 'momo-order-1',
      resultCode: '0',
    });

    sessionStorage.setItem(CUSTOMER_PAYMENT_BOOKING_KEY, 'booking-1');
    sessionStorage.setItem(CUSTOMER_PAYMENT_MOMO_ORDER_KEY, 'momo-order-1');

    getBookingDetailsMock.mockResolvedValue(createBookingDetails(3000000, 7000000, 10000000));

    await renderRouteComponent();

    await waitFor(() => {
      expect(screen.getByText(hasExactText(SUCCESS_MESSAGE))).toBeInTheDocument();
    });

    expect(screen.queryByText(hasExactText(SYNCING_MESSAGE))).not.toBeInTheDocument();
    expect(screen.queryByText(hasExactText(TERMINAL_FAILURE_MESSAGE))).not.toBeInTheDocument();

    expect(screen.getByText(new RegExp(PAID_DISPLAY_VALUE))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(REMAINING_DISPLAY_VALUE))).toBeInTheDocument();

    expect(getBookingDetailsMock).toHaveBeenCalledTimes(1);
    expect(checkMomoPaymentStatusMock).not.toHaveBeenCalled();

    expect(sessionStorage.getItem(CUSTOMER_PAYMENT_BOOKING_KEY)).toBeNull();
    expect(sessionStorage.getItem(CUSTOMER_PAYMENT_MOMO_ORDER_KEY)).toBeNull();

    expect(getActionLabels()).toEqual([BACK_TO_BOOKING_LABEL, OPEN_MESSAGES_LABEL]);
  });

  it('keeps gateway success hints (0/9000) in non-success syncing state when backend summary is unpaid', async () => {
    vi.useFakeTimers();

    setSearch({
      bookingId: 'booking-1',
      orderId: 'momo-order-1',
      resultCode: '9000',
    });

    sessionStorage.setItem(CUSTOMER_PAYMENT_BOOKING_KEY, 'booking-1');
    sessionStorage.setItem(CUSTOMER_PAYMENT_MOMO_ORDER_KEY, 'momo-order-1');

    getBookingDetailsMock.mockResolvedValue(createBookingDetails(0, 10000000, 10000000));
    checkMomoPaymentStatusMock.mockResolvedValue({
      orderId: 'momo-order-1',
      resultCode: 0,
      message: 'Gateway confirmed success hint',
    });

    const timeoutSpy = vi.spyOn(window, 'setTimeout');

    await renderRouteComponent();
    await settleAsyncState();

    expect(getBookingDetailsMock).toHaveBeenCalledTimes(1);

    await advancePollAttempts(POLLING_ATTEMPTS_CAP - 1);
    await settleAsyncState();

    expect(getBookingDetailsMock).toHaveBeenCalledTimes(POLLING_ATTEMPTS_CAP);

    expect(checkMomoPaymentStatusMock).toHaveBeenCalled();
    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), POLLING_CADENCE_MS);

    expect(screen.getAllByText(hasExactText(SYNCING_BANNER_MESSAGE)).length).toBeGreaterThan(0);
    expect(screen.getByText(hasExactText(SYNCING_MESSAGE))).toBeInTheDocument();
    expect(screen.queryByText(hasExactText(SUCCESS_MESSAGE))).not.toBeInTheDocument();
    expect(screen.queryByText(hasExactText(TERMINAL_FAILURE_MESSAGE))).not.toBeInTheDocument();
    expect(screen.queryByText(hasExactText(LOADING_MESSAGE))).not.toBeInTheDocument();

    expect(sessionStorage.getItem(CUSTOMER_PAYMENT_BOOKING_KEY)).toBe('booking-1');
    expect(sessionStorage.getItem(CUSTOMER_PAYMENT_MOMO_ORDER_KEY)).toBe('momo-order-1');

    expect(getActionLabels()).toEqual([BACK_TO_BOOKING_LABEL, OPEN_MESSAGES_LABEL]);
  });

  it('lands in terminal failure with recovery actions at polling cap when unpaid and no gateway success hint exists', async () => {
    vi.useFakeTimers();

    setSearch({
      bookingId: 'booking-1',
      orderId: 'momo-order-1',
    });

    sessionStorage.setItem(CUSTOMER_PAYMENT_BOOKING_KEY, 'booking-1');
    sessionStorage.setItem(CUSTOMER_PAYMENT_MOMO_ORDER_KEY, 'momo-order-1');

    getBookingDetailsMock.mockResolvedValue(createBookingDetails(0, 10000000, 10000000));
    checkMomoPaymentStatusMock.mockResolvedValue({
      orderId: 'momo-order-1',
      resultCode: 1000,
      message: 'Still processing',
    });

    const timeoutSpy = vi.spyOn(window, 'setTimeout');

    await renderRouteComponent();
    await settleAsyncState();

    expect(getBookingDetailsMock).toHaveBeenCalledTimes(1);

    await advancePollAttempts(POLLING_ATTEMPTS_CAP - 1);
    await settleAsyncState();

    expect(getBookingDetailsMock).toHaveBeenCalledTimes(POLLING_ATTEMPTS_CAP);

    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), POLLING_CADENCE_MS);

    expect(screen.getByText(hasExactText(TERMINAL_FAILURE_MESSAGE))).toBeInTheDocument();
    expect(screen.queryByText(hasExactText(SUCCESS_MESSAGE))).not.toBeInTheDocument();
    expect(screen.queryByText(hasExactText(SYNCING_MESSAGE))).not.toBeInTheDocument();
    expect(screen.queryByText(hasExactText(LOADING_MESSAGE))).not.toBeInTheDocument();

    expect(sessionStorage.getItem(CUSTOMER_PAYMENT_BOOKING_KEY)).toBe('booking-1');
    expect(sessionStorage.getItem(CUSTOMER_PAYMENT_MOMO_ORDER_KEY)).toBe('momo-order-1');

    expect(getActionLabels()).toEqual([BACK_TO_BOOKING_LABEL, OPEN_MESSAGES_LABEL]);
  });

  it('renders explicit payment-reference-missing state when booking reference is unavailable', async () => {
    await renderRouteComponent();

    expect(screen.getByText(hasExactText(MISSING_REFERENCE_TITLE))).toBeInTheDocument();
    expect(screen.getByText(hasExactText(MISSING_REFERENCE_MESSAGE))).toBeInTheDocument();
    expect(screen.queryByText(hasExactText(SUCCESS_MESSAGE))).not.toBeInTheDocument();
    expect(getActionLabels()).toEqual([BACK_TO_BOOKING_LABEL, OPEN_MESSAGES_LABEL]);
  });
});
