import { Calendar, Camera, CreditCard, MessageSquare, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { bookingService } from '@/services/bookingService';
import type { Booking } from '@/types/booking';
import { useCustomerBookings } from '@/hooks/useCustomerBookings';
import { formatMoneyVND } from '@/utils/money';
import type { BookingDetailPageProps } from '@/types/components';

export function BookingDetailPage({
  bookingId: propBookingId,
  onBack,
  onMessages,
}: BookingDetailPageProps) {
  const { bookings } = useCustomerBookings();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentBookingId = propBookingId || bookings[0]?.id;

  useEffect(() => {
    const loadBookingDetails = async () => {
      if (!currentBookingId) {
        setLoading(false);
        setBooking(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const bookingData = await bookingService.getBookingDetails(currentBookingId);
        setBooking(bookingData);
      } catch (err) {
        console.error('Failed to load booking details:', err);
        setError('Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };

    void loadBookingDetails();
  }, [currentBookingId]);

  const packageItems = useMemo(
    () => booking?.packages?.map((item) => item.package || item).filter(Boolean) || [],
    [booking?.packages]
  );

  const serviceItems = useMemo(
    () => booking?.services?.map((item) => item.service || item).filter(Boolean) || [],
    [booking?.services]
  );

  const orderSummary = booking?.order?.summary;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-rose-50 py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
          <p className="text-gray-500">Loading booking details…</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-rose-50 py-12">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="mb-3 text-2xl font-serif text-gray-900">Booking unavailable</h1>
          <p className="mb-6 text-gray-600">{error || 'No booking was found for your account.'}</p>
          <button
            onClick={onBack}
            className="rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 text-sm text-gray-600 transition-colors hover:text-rose-500"
          >
            ← Back to dashboard
          </button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-serif text-gray-900 md:text-4xl">
                Booking Details
              </h1>
              <p className="text-gray-600">Booking ID: {booking.id}</p>
            </div>
            <span className="rounded-full bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700">
              {booking.status}
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
                {booking.customer ? (
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
                ) : null}
              </div>
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
                              {pkg.description ? (
                                <p className="mt-1 text-sm text-gray-500">{pkg.description}</p>
                              ) : null}
                            </div>
                            {typeof pkg.price === 'number' ? (
                              <span className="text-sm font-medium text-rose-600">
                                {formatMoneyVND(pkg.price)}
                              </span>
                            ) : null}
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
                              {service.description ? (
                                <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                              ) : null}
                            </div>
                            {typeof service.price === 'number' ? (
                              <span className="text-sm font-medium text-rose-600">
                                {formatMoneyVND(service.price)}
                              </span>
                            ) : null}
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
              <button
                onClick={onMessages}
                className="w-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
              >
                Open Messages
              </button>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
