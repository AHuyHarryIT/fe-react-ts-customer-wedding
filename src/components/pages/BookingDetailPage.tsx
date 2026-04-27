import { Calendar, Camera, CreditCard, MessageSquare, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { CustomerStatePanel } from '@/components/pages/CustomerStatePanel';
import { bookingService } from '@/services/bookingService';
import { customerOrderService } from '@/services/customerOrderService';
import type { Booking, BookingSession } from '@/types';
import { formatMoneyVND } from '@/utils/money';

const KNOWN_STATUS_ORDER = ['PENDING', 'DEPOSIT_PAID', 'CONFIRMED', 'COMPLETED'] as const;

type KnownTimelineStatus = (typeof KNOWN_STATUS_ORDER)[number] | 'CANCELLED';

type MilestoneState = 'Completed' | 'Current' | 'Upcoming' | 'Neutral';

interface BookingMilestone {
  key: string;
  label: string;
  state: MilestoneState;
}

const formatTimelineDate = (value?: string): string | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString();
};

const toKnownStatus = (status: Booking['status']): KnownTimelineStatus | null => {
  if (status === 'CANCELLED') {
    return 'CANCELLED';
  }

  if (KNOWN_STATUS_ORDER.includes(status as (typeof KNOWN_STATUS_ORDER)[number])) {
    return status as (typeof KNOWN_STATUS_ORDER)[number];
  }

  return null;
};

const projectBookingMilestones = (status: Booking['status']): BookingMilestone[] => {
  const knownStatus = toKnownStatus(status);

  if (!knownStatus) {
    return [
      {
        key: 'fallback',
        label: 'Status update pending',
        state: 'Neutral',
      },
    ];
  }

  const currentIndex =
    knownStatus === 'CANCELLED'
      ? KNOWN_STATUS_ORDER.indexOf('CONFIRMED')
      : KNOWN_STATUS_ORDER.indexOf(knownStatus);

  const milestones = [
    { key: 'PENDING', label: 'Booking requested' },
    { key: 'DEPOSIT_PAID', label: 'Deposit paid' },
    { key: 'CONFIRMED', label: 'Booking confirmed' },
    { key: 'COMPLETED', label: 'Completed' },
  ].map((milestone, index) => ({
    ...milestone,
    state:
      index < currentIndex
        ? ('Completed' as const)
        : index === currentIndex
          ? ('Current' as const)
          : ('Upcoming' as const),
  }));

  if (knownStatus === 'CANCELLED') {
    milestones.push({
      key: 'CANCELLED',
      label: 'Cancelled',
      state: 'Current',
    });
  }

  return milestones;
};

const selectTimelineSession = (sessions: Booking['sessions']): BookingSession | null => {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return null;
  }

  const now = Date.now();
  const sorted = [...sessions].sort((left, right) => {
    const leftTime = new Date(left.startsAt).getTime();
    const rightTime = new Date(right.startsAt).getTime();

    if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
      return 0;
    }

    if (Number.isNaN(leftTime)) {
      return 1;
    }

    if (Number.isNaN(rightTime)) {
      return -1;
    }

    return leftTime - rightTime;
  });

  const earliestUpcoming = sorted.find((session) => {
    const startsAtTime = new Date(session.startsAt).getTime();
    return !Number.isNaN(startsAtTime) && startsAtTime >= now;
  });

  return earliestUpcoming ?? sorted[0] ?? null;
};

const buildSessionContextLine = (session: BookingSession | null): string | null => {
  if (!session) {
    return null;
  }

  const startDate = formatTimelineDate(session.startsAt);
  const endDate = formatTimelineDate(session.endsAt);

  if (!startDate) {
    return null;
  }

  if (endDate && endDate !== startDate) {
    return `${startDate} - ${endDate}`;
  }

  return startDate;
};

const stateTone: Record<MilestoneState, string> = {
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Current: 'bg-rose-50 text-rose-700 border-rose-200',
  Upcoming: 'bg-slate-50 text-slate-600 border-slate-200',
  Neutral: 'bg-amber-50 text-amber-700 border-amber-200',
};

const CUSTOMER_APP_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:5174'
  : window.location.origin;

const getCustomerPaymentResultUrl = (bookingId: string) =>
  `${CUSTOMER_APP_BASE_URL}/bookings/payment-result?bookingId=${bookingId}`;

const CUSTOMER_PAYMENT_BOOKING_KEY = 'customer_payment_booking_id';
const CUSTOMER_PAYMENT_MOMO_ORDER_KEY = 'customer_payment_momo_order_id';
const formatBookingStatus = (status: Booking['status']) => status.replace(/_/g, ' ');

export function BookingDetailPage() {
  const { id } = useParams({ from: '/bookings/$id' });
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);

  const loadBookingDetails = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setBooking(null);
      setError('Invalid booking link. This booking could not be found.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const bookingData = await bookingService.getBookingDetails(id);
      setBooking(bookingData);
    } catch (err) {
      console.error('Failed to load booking details:', err);
      setError('Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadBookingDetails();
  }, [loadBookingDetails]);

  const packageItems = useMemo(
    () =>
      booking?.packages?.map((item) => ({
        id: item.package?.id || item.packageId,
        name: item.package?.name || 'Selected Package',
        description: item.package?.description || undefined,
        price: item.package?.price ?? item.price,
      })) || [],
    [booking?.packages]
  );

  const serviceItems = useMemo(
    () =>
      booking?.services?.map((item) => ({
        id: item.service?.id || item.serviceId,
        name: item.service?.name || 'Selected Service',
        description: item.service?.description || undefined,
        price: item.service?.price ?? item.price,
      })) || [],
    [booking?.services]
  );

  const bookingMilestones = useMemo(
    () => projectBookingMilestones(booking?.status ?? 'PENDING'),
    [booking?.status]
  );
  const isFallbackTimeline =
    bookingMilestones.length === 1 && bookingMilestones[0]?.state === 'Neutral';
  const highlightedSession = useMemo(
    () => selectTimelineSession(booking?.sessions),
    [booking?.sessions]
  );
  const sessionContextLine = useMemo(
    () => buildSessionContextLine(highlightedSession),
    [highlightedSession]
  );

  const orderSummary = booking?.order?.summary;
  const bookingTotalPrice = booking?.totalPrice ?? orderSummary?.totalPrice ?? 0;
  const depositAmount = bookingTotalPrice > 0 ? Math.ceil((bookingTotalPrice * 30) / 100) : 0;
  const totalPaid = orderSummary?.totalPaid ?? 0;
  const remainingAmount = orderSummary?.balanceRemaining ?? bookingTotalPrice;
  const depositPaid = totalPaid > 0;
  const canPayDeposit =
    Boolean(booking) &&
    bookingTotalPrice > 0 &&
    !depositPaid &&
    booking?.status !== 'CANCELLED' &&
    booking?.status !== 'COMPLETED';

  const handleDepositCheckout = async () => {
    if (!booking?.id) {
      return;
    }

    try {
      setDepositLoading(true);
      setDepositError(null);
      const redirectUrl = getCustomerPaymentResultUrl(booking.id);
      const result = await customerOrderService.checkoutDeposit(booking.id, redirectUrl);
      if (result.momo.payUrl) {
        sessionStorage.setItem(CUSTOMER_PAYMENT_BOOKING_KEY, booking.id);
        if (result.momo.orderId) {
          sessionStorage.setItem(CUSTOMER_PAYMENT_MOMO_ORDER_KEY, result.momo.orderId);
        }
        window.location.assign(result.momo.payUrl);
        return;
      }
      throw new Error('MoMo payment link was not returned.');
    } catch (err) {
      console.error('Failed to initiate deposit payment:', err);
      setDepositError(
        err instanceof Error
          ? err.message
          : 'Unable to start the deposit payment. Please contact the studio in Messages.'
      );
    } finally {
      setDepositLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-rose-50 py-12 px-4">
        <div className="w-full max-w-2xl">
          <CustomerStatePanel
            tone="loading"
            eyebrow="Booking Details"
            title="Loading your booking"
            description="We are retrieving your event date, package selection, and payment summary."
          />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-rose-50 py-12 px-4">
        <div className="w-full max-w-2xl">
          <CustomerStatePanel
            tone="error"
            eyebrow="Booking Details"
            title="Booking unavailable"
            description={error || 'No booking was found for your account.'}
            actions={
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
                >
                  Back to dashboard
                </Link>
                <Link
                  to="/messages"
                  className="inline-flex items-center justify-center rounded-full border border-rose-200 px-6 py-3 font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  Open Messages
                </Link>
              </>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            to="/dashboard"
            className="mb-4 inline-flex text-sm text-gray-600 transition-colors hover:text-rose-500"
          >
            ← Back to dashboard
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-serif text-gray-900 md:text-4xl">
                Booking Details
              </h1>
              <p className="text-gray-600">Booking ID: {booking.id}</p>
            </div>
            <span className="rounded-full bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700">
              {formatBookingStatus(booking.status)}
            </span>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-3xl bg-white p-6 shadow-lg"
            >
              <h2 className="mb-5 text-xl font-medium text-gray-900">Event Information</h2>
              <div className="space-y-4">
                <div className="flex gap-4 rounded-2xl bg-rose-50 p-4">
                  <Calendar className="mt-1 size-5 text-rose-500" />
                  <div>
                    <p className="text-sm text-gray-500">Event date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 rounded-2xl bg-rose-50 p-4">
                  <MessageSquare className="mt-1 size-5 text-rose-500" />
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-medium text-gray-900">
                      {booking.notes || 'No notes added yet.'}
                    </p>
                  </div>
                </div>
                {booking.customer && (
                  <div className="flex gap-4 rounded-2xl bg-rose-50 p-4">
                    <User className="mt-1 size-5 text-rose-500" />
                    <div>
                      <p className="text-sm text-gray-500">Customer profile</p>
                      <p className="font-medium text-gray-900">
                        {[booking.customer.firstName, booking.customer.lastName]
                          .filter(Boolean)
                          .join(' ') || booking.customer.phoneNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-3xl bg-white p-6 shadow-lg"
            >
              <h2 className="mb-5 text-xl font-medium text-gray-900">Booking progress</h2>

              {isFallbackTimeline && (
                <div
                  data-testid="timeline-fallback-state"
                  className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700"
                >
                  Neutral
                </div>
              )}

              <ol className="space-y-3" aria-label="Booking milestone timeline">
                {bookingMilestones.map((milestone) => (
                  <li
                    key={milestone.key}
                    className="rounded-2xl border border-gray-100 bg-white px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-gray-900">{milestone.label}</span>
                      <span
                        data-testid="milestone-state"
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${stateTone[milestone.state]}`}
                      >
                        {milestone.state}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>

              {highlightedSession ? (
                <div className="mt-4 rounded-2xl bg-rose-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
                    Session highlight
                  </p>
                  <p
                    data-testid="timeline-session-title"
                    className="mt-1 font-medium text-gray-900"
                  >
                    {highlightedSession.title}
                  </p>
                  {sessionContextLine && (
                    <p className="mt-1 text-sm text-gray-600">{sessionContextLine}</p>
                  )}
                  {highlightedSession.locationName && (
                    <p
                      data-testid="timeline-session-location"
                      className="mt-1 text-sm text-gray-600"
                    >
                      {highlightedSession.locationName}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-600">
                  Session details will appear here when the studio confirms the schedule.
                </p>
              )}
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl bg-white p-6 shadow-lg"
            >
              <div className="mb-5 flex items-center gap-3">
                <Camera className="size-5 text-rose-500" />
                <h2 className="text-xl font-medium text-gray-900">Packages and Services</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
                    Packages
                  </h3>
                  {packageItems.length > 0 ? (
                    <div className="space-y-3">
                      {packageItems.map((pkg) => (
                        <div key={pkg.id} className="rounded-2xl border border-gray-100 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium text-gray-900">{pkg.name}</p>
                              {pkg.description && (
                                <p className="mt-1 text-sm text-gray-500">{pkg.description}</p>
                              )}
                            </div>
                            {typeof pkg.price === 'number' && (
                              <span className="text-sm font-medium text-rose-600">
                                {formatMoneyVND(pkg.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No packages attached to this booking.</p>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
                    Services
                  </h3>
                  {serviceItems.length > 0 ? (
                    <div className="space-y-3">
                      {serviceItems.map((service) => (
                        <div key={service.id} className="rounded-2xl border border-gray-100 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium text-gray-900">{service.name}</p>
                              {service.description && (
                                <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                              )}
                            </div>
                            {typeof service.price === 'number' && (
                              <span className="text-sm font-medium text-rose-600">
                                {formatMoneyVND(service.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No services attached to this booking.</p>
                  )}
                </div>
              </div>
            </motion.section>
          </div>

          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-3xl bg-white p-6 shadow-lg"
            >
              <div className="mb-5 flex items-center gap-3">
                <CreditCard className="size-5 text-rose-500" />
                <h2 className="text-xl font-medium text-gray-900">Payment Summary</h2>
              </div>

              {orderSummary ? (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      {formatMoneyVND(orderSummary.totalPrice)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Paid</p>
                    <p className="mt-1 text-lg font-medium text-green-600">
                      {formatMoneyVND(orderSummary.totalPaid)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Remaining</p>
                    <p className="mt-1 text-lg font-medium text-rose-600">
                      {formatMoneyVND(orderSummary.balanceRemaining)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No payment summary is attached to this booking yet. The studio team will update
                  you through Messages.
                </p>
              )}

              <div className="mt-6 rounded-3xl border border-rose-100 bg-rose-50/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
                      Customer Deposit
                    </p>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Pay 30% deposit</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      The customer portal only supports the first deposit payment. Remaining
                      balance, adjustments, and payment management stay with the studio team.
                    </p>
                  </div>
                  {depositAmount > 0 && (
                    <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                      <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
                        Deposit Due
                      </p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {formatMoneyVND(depositAmount)}
                      </p>
                    </div>
                  )}
                </div>

                {depositPaid ? (
                  <div className="mt-5 rounded-2xl border border-green-100 bg-white p-4">
                    <p className="text-sm font-medium text-green-700">Deposit received</p>
                    <p className="mt-1 text-sm text-gray-600">
                      The studio has recorded your deposit. Remaining balance of{' '}
                      <span className="font-medium text-gray-900">
                        {formatMoneyVND(remainingAmount)}
                      </span>{' '}
                      will be handled by the staff team.
                    </p>
                  </div>
                ) : canPayDeposit ? (
                  <div className="mt-5 space-y-4">
                    <button
                      type="button"
                      onClick={handleDepositCheckout}
                      disabled={depositLoading}
                      className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {depositLoading ? 'Starting MoMo deposit...' : 'Pay 30% deposit with MoMo'}
                    </button>

                    {depositError && (
                      <CustomerStatePanel
                        tone="error"
                        title="Payment request could not start"
                        description={depositError}
                        className="mt-2"
                      />
                    )}
                    <p className="text-xs text-gray-500">
                      MoMo opens right after the payment request is created. When payment finishes,
                      MoMo redirects back to your customer payment result page automatically.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-rose-200 bg-white p-4 text-sm text-gray-600">
                    Deposit payment is not available yet. The studio may still be preparing the
                    final quote, or this booking is already closed.
                  </div>
                )}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl bg-[#fff8f7] p-6 shadow-lg"
            >
              <h2 className="mb-3 text-xl font-medium text-gray-900">Next Step</h2>
              <p className="mb-5 text-sm text-gray-600">
                The customer portal uses chat as the studio-safe follow-up channel for schedule,
                payment, and delivery updates.
              </p>
              <Link
                to="/messages"
                className="inline-flex w-full justify-center rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
              >
                Open Messages
              </Link>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
