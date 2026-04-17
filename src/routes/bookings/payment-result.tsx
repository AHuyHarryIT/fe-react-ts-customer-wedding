import { createFileRoute, Link, useSearch } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { CustomerStatePanel } from '@/components/pages/CustomerStatePanel';
import { bookingService } from '@/services/bookingService';
import { customerOrderService } from '@/services/customerOrderService';
import { formatMoneyVND } from '@/utils/money';

type PaymentResultSearch = {
  bookingId?: string;
  orderId?: string;
  resultCode?: string;
  message?: string;
};

type PaymentResultState =
  | 'checking'
  | 'success'
  | 'gateway-confirmed-syncing'
  | 'terminal-failure-needs-action'
  | 'payment-reference-missing';

const CUSTOMER_PAYMENT_BOOKING_KEY = 'customer_payment_booking_id';
const CUSTOMER_PAYMENT_MOMO_ORDER_KEY = 'customer_payment_momo_order_id';

const POLLING_CADENCE_MS = 2000;
const POLLING_ATTEMPTS_CAP = 14;
const MOMO_PENDING_RESULT_CODE = 1000;
const MOMO_SUCCESS_HINT_CODES = new Set<number>([0, 9000]);

const PAYMENT_RESULT_COPY = {
  success: 'Your deposit has been recorded successfully.',
  syncing: 'MoMo confirmed your payment, but the booking record is still syncing.',
  checking: 'We are confirming your MoMo payment and syncing the booking record.',
  terminalFailure:
    'We couldn’t confirm this payment after the final verification checks. Return to booking to review status, or open Messages and share your booking ID + payment time so the studio can help.',
  missingReference:
    'We couldn’t verify this payment because the booking reference is missing. Return to your booking and restart payment from the deposit section.',
} as const;

const parseResultCode = (resultCode: string | undefined): number | null => {
  if (resultCode === undefined) {
    return null;
  }

  const value = Number(resultCode);
  return Number.isNaN(value) ? null : value;
};

function CustomerPaymentResultPage() {
  const search = useSearch({ from: '/bookings/payment-result' }) as PaymentResultSearch;
  const bookingId = useMemo(
    () => search.bookingId || sessionStorage.getItem(CUSTOMER_PAYMENT_BOOKING_KEY) || undefined,
    [search.bookingId]
  );
  const momoOrderId = useMemo(
    () => search.orderId || sessionStorage.getItem(CUSTOMER_PAYMENT_MOMO_ORDER_KEY) || undefined,
    [search.orderId]
  );
  const queryResultCode = parseResultCode(search.resultCode);

  const [state, setState] = useState<PaymentResultState>(() =>
    bookingId ? 'checking' : 'payment-reference-missing'
  );
  const [paid, setPaid] = useState<number>(0);
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!bookingId) {
      setState('payment-reference-missing');
      return;
    }

    let stopped = false;
    let attempts = 0;
    let gatewaySuccessHint = MOMO_SUCCESS_HINT_CODES.has(queryResultCode ?? Number.NaN);

    const poll = async () => {
      attempts += 1;

      try {
        const booking = await bookingService.getBookingDetails(bookingId);
        const summary = booking?.order?.summary;
        const totalPaid = summary?.totalPaid ?? 0;
        const balanceRemaining = summary?.balanceRemaining ?? 0;

        if (stopped) {
          return;
        }

        setPaid(totalPaid);
        setRemaining(balanceRemaining);

        if (totalPaid > 0) {
          sessionStorage.removeItem(CUSTOMER_PAYMENT_BOOKING_KEY);
          sessionStorage.removeItem(CUSTOMER_PAYMENT_MOMO_ORDER_KEY);
          setState('success');
          return;
        }

        if (momoOrderId && attempts >= 2) {
          const momoStatus = await customerOrderService.checkMomoPaymentStatus(momoOrderId);

          if (stopped) {
            return;
          }

          if (MOMO_SUCCESS_HINT_CODES.has(momoStatus.resultCode)) {
            gatewaySuccessHint = true;
          } else if (momoStatus.resultCode !== MOMO_PENDING_RESULT_CODE) {
            setState('terminal-failure-needs-action');
            return;
          }
        }

        if (attempts >= POLLING_ATTEMPTS_CAP) {
          setState(
            gatewaySuccessHint
              ? 'gateway-confirmed-syncing'
              : 'terminal-failure-needs-action'
          );
          return;
        }

        setState(gatewaySuccessHint ? 'gateway-confirmed-syncing' : 'checking');
        window.setTimeout(poll, POLLING_CADENCE_MS);
      } catch (pollError) {
        if (stopped) {
          return;
        }

        console.error('Failed to poll customer payment result:', pollError);
        setState('terminal-failure-needs-action');
      }
    };

    void poll();

    return () => {
      stopped = true;
    };
  }, [bookingId, momoOrderId, queryResultCode]);

  const stateTone =
    state === 'checking'
      ? 'loading'
      : state === 'success'
        ? 'success'
        : state === 'gateway-confirmed-syncing'
          ? 'info'
          : 'error';

  const stateTitle =
    state === 'payment-reference-missing' ? 'Payment reference missing' : 'Deposit payment status';

  const stateDescription =
    state === 'success'
      ? PAYMENT_RESULT_COPY.success
      : state === 'gateway-confirmed-syncing'
        ? PAYMENT_RESULT_COPY.syncing
        : state === 'terminal-failure-needs-action'
          ? PAYMENT_RESULT_COPY.terminalFailure
          : state === 'payment-reference-missing'
            ? PAYMENT_RESULT_COPY.missingReference
            : PAYMENT_RESULT_COPY.checking;

  const backToBookingAction = bookingId ? (
    <Link
      to="/bookings/$id"
      params={{ id: bookingId }}
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
    >
      Back to booking
    </Link>
  ) : (
    <Link
      to="/bookings"
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
    >
      Back to booking
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <CustomerStatePanel
          tone={stateTone}
          eyebrow="Payment Result"
          title={stateTitle}
          description={stateDescription}
          actions={
            <>
              {backToBookingAction}
              <Link
                to="/messages"
                className="inline-flex items-center justify-center rounded-full border border-gray-200 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Open Messages
              </Link>
            </>
          }
        >
          {state === 'gateway-confirmed-syncing' ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-700">
                MoMo has confirmed the payment request. We are waiting for the studio system to
                finish syncing the final booking payment status.
              </div>
            </div>
          ) : null}

          {state === 'success' ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-sm text-gray-500">Paid</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{formatMoneyVND(paid)}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-sm text-gray-500">Remaining</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{formatMoneyVND(remaining)}</p>
                </div>
              </div>
            </div>
          ) : null}
        </CustomerStatePanel>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/bookings/payment-result')({
  component: CustomerPaymentResultPage,
  validateSearch: (search: Record<string, unknown>): PaymentResultSearch => ({
    bookingId: typeof search.bookingId === 'string' ? search.bookingId : undefined,
    orderId: typeof search.orderId === 'string' ? search.orderId : undefined,
    resultCode: typeof search.resultCode === 'string' ? search.resultCode : undefined,
    message: typeof search.message === 'string' ? search.message : undefined,
  }),
});
