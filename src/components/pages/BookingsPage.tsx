import { Link, useSearch } from '@tanstack/react-router';
import { Calendar, PlusCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import { CustomerStatePanel } from '@/components/pages/CustomerStatePanel';
import { useCustomerBookings } from '@/hooks/useCustomerBookings';
import type { Booking, BookingOrderStatus } from '@/types/booking';

type BookingDisplayStatus = 'PENDING' | 'CONFIRM' | 'CANCEL' | 'COMPLETE';
type PaymentDisplayStatus = 'PENDING' | 'REMAINING' | 'COMPLETE';

const getBookingDisplayStatus = (status: Booking['status']): BookingDisplayStatus => {
  if (status === 'CONFIRMED' || status === 'DEPOSIT_PAID') {
    return 'CONFIRM';
  }
  if (status === 'COMPLETED') {
    return 'COMPLETE';
  }
  if (status === 'CANCELLED') {
    return 'CANCEL';
  }
  return 'PENDING';
};

const getPaymentDisplayStatus = (
  orderStatus?: BookingOrderStatus,
  bookingStatus?: Booking['status']
): PaymentDisplayStatus => {
  if (orderStatus === 'PAID' || bookingStatus === 'COMPLETED') {
    return 'COMPLETE';
  }
  if (orderStatus === 'PARTIAL' || bookingStatus === 'DEPOSIT_PAID') {
    return 'REMAINING';
  }
  return 'PENDING';
};

const formatEventDate = (eventDate: string) => {
  const parsedDate = new Date(eventDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date not set';
  }

  return parsedDate.toLocaleDateString();
};

export function BookingsPage() {
  const search = useSearch({ from: '/bookings/' });
  const { bookings, loading, error, refetch } = useCustomerBookings();

  const createBookingSearch = useMemo(
    () => ({ packageId: search.packageId ?? undefined }),
    [search.packageId]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-serif text-gray-900 md:text-4xl">Your Bookings</h1>
              <p className="mt-2 text-gray-600">
                Track booking status, event date, and next steps with the studio team.
              </p>
            </div>
            <Link
              to="/booking"
              search={createBookingSearch}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 px-5 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
            >
              <PlusCircle className="size-4" />
              Create Booking
            </Link>
          </div>

          {loading ? (
            <CustomerStatePanel
              tone="loading"
              title="Loading your bookings"
              description="We are retrieving your latest booking updates."
            />
          ) : error ? (
            <CustomerStatePanel
              tone="error"
              title="We could not load your bookings"
              description={error}
              actions={
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-5 py-3 font-medium text-white transition-all hover:shadow-lg"
                >
                  Retry
                </button>
              }
            />
          ) : bookings.length === 0 ? (
            <CustomerStatePanel
              tone="empty"
              title="No bookings yet"
              description="You do not have any bookings in your account yet. Start from the dashboard booking action or contact the studio for help creating one."
              actions={
                <Link
                  to="/booking"
                  search={createBookingSearch}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
                >
                  Create Booking
                </Link>
              }
            />
          ) : (
            <CustomerStatePanel
              tone="info"
              title="Your active bookings"
              description="Most recently updated bookings appear first."
            >
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
                            Booking Status
                          </p>
                          <p className="mt-1 text-lg font-medium text-gray-900">
                            {getBookingDisplayStatus(booking.status)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
                            Payment Status
                          </p>
                          <p className="mt-1 text-lg font-medium text-gray-900">
                            {getPaymentDisplayStatus(
                              booking.order?.status ?? booking.orders?.[0]?.status,
                              booking.status
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="size-4 text-rose-500" />
                        <span className="font-medium text-gray-700">Event date:</span>
                        <span>{formatEventDate(booking.eventDate)}</span>
                      </div>

                      <Link
                        to="/bookings/$id"
                        params={{ id: booking.id }}
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg"
                      >
                        View Booking Details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </CustomerStatePanel>
          )}
        </motion.div>
      </div>
    </div>
  );
}
