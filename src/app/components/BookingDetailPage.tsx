import {
  Calendar,
  MapPin,
  Camera,
  CreditCard,
  Download,
  Upload,
  FileText,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { bookingService, orderService } from '../../services/bookingService';
import { useCustomerBookings } from '../../hooks/useCustomerBookings';

interface BookingDetailPageProps {
  bookingId?: string;
  onBack: () => void;
}

export function BookingDetailPage({ bookingId: propBookingId, onBack }: BookingDetailPageProps) {
  const { bookings } = useCustomerBookings();
  const [booking, setBooking] = useState<Record<string, unknown> | null>(null);
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the first booking from the list or the prop
  const currentBookingId = propBookingId || bookings?.[0]?.id;

  useEffect(() => {
    const loadBookingDetails = async () => {
      if (!currentBookingId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch booking details
        const bookingData = await bookingService.getBookingDetails(currentBookingId);
        setBooking(bookingData);

        // Fetch order for this booking
        const orderData = await orderService.getOrderByBookingId(currentBookingId);
        setOrder(orderData);
      } catch (err) {
        console.error('Failed to load booking details:', err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    loadBookingDetails();
  }, [currentBookingId]);

  // Fallback data structure while loading
  const displayBooking = booking || {
    id: 'WED-2026-001',
    package: 'Premium Photography',
    status: 'confirmed',
    weddingDate: '2026-06-15',
    weddingTime: '3:00 PM',
    location: 'The Grand Hotel, 123 Wedding Lane, Los Angeles, CA 90210',
    brideName: 'Sarah Johnson',
    groomName: 'Michael Thompson',
    photographer: 'Michael Chen',
    assistantPhotographer: 'Emily Rodriguez',
    totalAmount: 3999,
    paidAmount: 1999,
    paymentSchedule: [
      { date: '2026-02-03', amount: 1999, status: 'paid', description: 'Booking Deposit (50%)' },
      { date: '2026-05-15', amount: 2000, status: 'pending', description: 'Final Payment (50%)' },
    ],
    services: [
      'Full Day Coverage (10 hours)',
      '800+ Edited Photos',
      'Online Gallery',
      'Engagement Session',
      'Premium Photo Album',
      '2 Photographers',
      'USB Drive with all photos',
    ],
  };

  const documents = [
    { name: 'Wedding Photography Contract.pdf', size: '245 KB', uploaded: true },
    { name: 'Timeline & Shot List.pdf', size: '182 KB', uploaded: true },
    { name: 'Venue Information.pdf', size: '156 KB', uploaded: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="size-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !displayBooking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error || 'No booking found'}</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-rose-500 mb-4 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-gray-800 mb-2">
                Booking Details
              </h1>
              <p className="text-gray-600">Booking ID: {displayBooking.id}</p>
            </div>
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium capitalize">
              {displayBooking.status}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wedding Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-medium text-gray-800 mb-6">Wedding Information</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-rose-50 rounded-lg">
                  <Calendar className="size-6 text-rose-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium text-gray-800">
                      {displayBooking.eventDate
                        ? new Date(displayBooking.eventDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'TBD'}
                    </p>
                    <p className="text-sm text-gray-700">
                      {displayBooking.weddingTime || 'Time TBD'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-rose-50 rounded-lg">
                  <MapPin className="size-6 text-rose-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-800">
                      {displayBooking.location || 'Location TBD'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-rose-50 rounded-lg">
                  <User className="size-6 text-rose-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Couple</p>
                    <p className="font-medium text-gray-800">
                      {displayBooking.brideName} & {displayBooking.groomName}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Package Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Camera className="size-6 text-rose-500" />
                <h2 className="text-xl font-medium text-gray-800">
                  {displayBooking.package || 'Wedding Package'}
                </h2>
              </div>

              <div className="space-y-3">
                {displayBooking.services && displayBooking.services.length > 0 ? (
                  displayBooking.services.map((service: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 text-gray-700">
                      <div className="size-2 bg-rose-400 rounded-full" />
                      <span>{service}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No services listed</p>
                )}
              </div>
            </motion.div>

            {/* Team */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-medium text-gray-800 mb-6">Your Team</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                    MC
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{booking.photographer}</p>
                    <p className="text-sm text-gray-600">Lead Photographer</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="size-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                    ER
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{booking.assistantPhotographer}</p>
                    <p className="text-sm text-gray-600">Assistant Photographer</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Documents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-gray-800">Documents</h2>
                <button className="px-4 py-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-2">
                  <Upload className="size-4" />
                  Upload
                </button>
              </div>

              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-rose-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-800">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.size}</p>
                      </div>
                    </div>
                    {doc.uploaded ? (
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Download className="size-5 text-gray-600" />
                      </button>
                    ) : (
                      <span className="text-sm text-amber-600">Pending Upload</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
            >
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="size-6 text-rose-500" />
                <h2 className="text-xl font-medium text-gray-800">Payment</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-2xl font-medium text-gray-800">
                    ${(order?.totalAmount || displayBooking.totalAmount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="h-px bg-gray-200" />

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-medium text-green-600">
                    $
                    {(
                      order?.paidAmount ||
                      order?.summary?.totalPaid ||
                      displayBooking.paidAmount ||
                      0
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Balance Due</span>
                  <span className="font-medium text-rose-500">
                    $
                    {(
                      order?.balanceRemaining ||
                      order?.summary?.balanceRemaining ||
                      displayBooking.totalAmount - displayBooking.paidAmount ||
                      0
                    ).toLocaleString()}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Payment Progress</span>
                    <span>
                      {order?.totalAmount > 0
                        ? Math.round(
                            ((order.paidAmount || order.summary?.totalPaid || 0) /
                              order.totalAmount) *
                              100
                          )
                        : displayBooking.totalAmount > 0
                          ? Math.round(
                              (displayBooking.paidAmount / displayBooking.totalAmount) * 100
                            )
                          : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-400 to-pink-500"
                      style={{
                        width: `${
                          order?.totalAmount > 0
                            ? Math.round(
                                ((order.paidAmount || order.summary?.totalPaid || 0) /
                                  order.totalAmount) *
                                  100
                              )
                            : displayBooking.totalAmount > 0
                              ? Math.round(
                                  (displayBooking.paidAmount / displayBooking.totalAmount) * 100
                                )
                              : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Schedule */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-800 text-sm">Payment Information</h3>
                {displayBooking.paymentSchedule && displayBooking.paymentSchedule.length > 0 ? (
                  (displayBooking.paymentSchedule as Record<string, unknown>[]).map(
                    (payment: Record<string, unknown>, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          payment.status === 'paid' ? 'bg-green-50' : 'bg-amber-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-gray-800">
                            ${payment.amount.toLocaleString()}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              payment.status === 'paid'
                                ? 'bg-green-200 text-green-800'
                                : 'bg-amber-200 text-amber-800'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{payment.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {new Date(payment.date).toLocaleDateString()}
                        </p>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-sm text-gray-600">No payment schedule available</p>
                )}
              </div>

              {(order?.balanceRemaining || displayBooking.totalAmount - displayBooking.paidAmount) >
                0 && (
                <button className="w-full mt-6 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-lg transition-all font-medium">
                  Make Payment
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
