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

const CUSTOMER_PAYMENT_BOOKING_KEY = 'customer_payment_booking_id';
const CUSTOMER_PAYMENT_MOMO_ORDER_KEY = 'customer_payment_momo_order_id';

function CustomerPaymentResultPage() {
  const search = useSearch({ from: '/bookings/payment-result' }) as PaymentResultSearch;
  const resultCode = search.resultCode !== undefined ? Number(search.resultCode) : undefined;
  const immediateError =
    resultCode !== undefined && !Number.isNaN(resultCode) && resultCode !== 0
      ? search.message || 'MoMo did not confirm the payment.'
      : null;
  const bookingId = useMemo(
    () => search.bookingId || sessionStorage.getItem(CUSTOMER_PAYMENT_BOOKING_KEY) || undefined,
    [search.bookingId]
  );
  const momoOrderId = useMemo(
    () => search.orderId || sessionStorage.getItem(CUSTOMER_PAYMENT_MOMO_ORDER_KEY) || undefined,
    [search.orderId]
  );
  const [loading, setLoading] = useState(() => Boolean(bookingId) && !immediateError);
  const [paid, setPaid] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [gatewayConfirmed, setGatewayConfirmed] = useState(false);
  const stateTone = loading
    ? 'loading'
    : paid && paid > 0
      ? 'success'
      : immediateError || !bookingId
        ? 'error'
        : 'info';
  const stateTitle = 'Deposit payment status';
  const stateDescription = loading
    ? 'We are confirming your MoMo payment and syncing the booking record.'
    : immediateError
      ? immediateError
      : !bookingId
        ? 'Missing booking reference.'
        : paid && paid > 0
          ? 'Your deposit has been recorded successfully.'
          : gatewayConfirmed
            ? 'MoMo confirmed your payment, but the booking record is still syncing.'
            : 'Payment is still being verified.';

  useEffect(() => {
    if (immediateError) {
      return;
    }

    if (!bookingId) {
      return;
    }

    let stopped = false;
    let attempts = 0;

    const poll = async () => {
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

        if (totalPaid > 0 || attempts >= 14) {
          if (totalPaid > 0) {
            sessionStorage.removeItem(CUSTOMER_PAYMENT_BOOKING_KEY);
            sessionStorage.removeItem(CUSTOMER_PAYMENT_MOMO_ORDER_KEY);
          }
          setLoading(false);
          return;
        }

        if (momoOrderId && attempts >= 2) {
          const momoStatus = await customerOrderService.checkMomoPaymentStatus(momoOrderId);

          if (stopped) {
            return;
          }

          if (momoStatus.resultCode === 0) {
            setGatewayConfirmed(true);
          } else if (momoStatus.resultCode !== 1000) {
            setLoading(false);
            return;
          }
        }
      } catch (pollError) {
        if (!stopped) {
          console.error('Failed to poll customer payment result:', pollError);
          setLoading(false);
        }
        return;
      }

      attempts += 1;
      window.setTimeout(poll, 2000);
    };

    void poll();

    return () => {
      stopped = true;
    };
  }, [bookingId, immediateError, momoOrderId]);

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
              {bookingId ? (
                <Link
                  to="/bookings/$id"
                  params={{ id: bookingId }}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
                >
                  Back to booking
                </Link>
              ) : null}
              <Link
                to="/messages"
                className="inline-flex items-center justify-center rounded-full border border-gray-200 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Open Messages
              </Link>
            </>
          }
        >
          {loading ? (
            <div className="space-y-4">
              {gatewayConfirmed ? (
                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-700">
                  MoMo has confirmed the payment request. We are waiting for the studio system to
                  finish syncing the final booking payment status.
                </div>
              ) : null}
            </div>
          ) : paid && paid > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-sm text-gray-500">Paid</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{formatMoneyVND(paid)}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-sm text-gray-500">Remaining</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    {formatMoneyVND(remaining ?? 0)}
                  </p>
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
