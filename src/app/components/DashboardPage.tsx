import {
  Calendar,
  Camera,
  CreditCard,
  Download,
  MessageSquare,
  Clock,
  CheckCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useCustomerBookings } from '../../hooks/useCustomerBookings';

interface DashboardPageProps {
  onNavigate: (page: string, data?: Record<string, unknown>) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { bookings, loading: bookingsLoading } = useCustomerBookings();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);

  // Get the most recent booking
  const booking = bookings?.[0];

  // Fetch order for the booking
  useEffect(() => {
    if (booking?.id) {
      const fetchOrder = async () => {
        setOrderLoading(true);
        try {
          const { orderService } = await import('../../services/bookingService');
          const orderData = await orderService.getOrderByBookingId(booking.id);
          setOrder(orderData);
        } finally {
          setOrderLoading(false);
        }
      };
      fetchOrder();
    }
  }, [booking?.id]);

  // Calculate days until wedding
  const daysUntilWedding = booking?.eventDate
    ? Math.ceil((new Date(booking.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Timeline with milestones (generic for now)
  const timeline = [
    {
      event: 'Booking Confirmed',
      date: booking?.createdAt || new Date().toISOString(),
      status: 'completed',
    },
    {
      event: 'Event Planning',
      date: booking?.eventDate || new Date().toISOString(),
      status: 'upcoming',
    },
    {
      event: 'Final Confirmation',
      date: booking?.eventDate
        ? new Date(new Date(booking.eventDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        : new Date().toISOString(),
      status: 'upcoming',
    },
    {
      event: 'Wedding Day',
      date: booking?.eventDate || new Date().toISOString(),
      status: 'upcoming',
    },
    {
      event: 'Photo Delivery',
      date: booking?.eventDate
        ? new Date(new Date(booking.eventDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : new Date().toISOString(),
      status: 'upcoming',
    },
  ];

  const recentMessages = [
    {
      from: 'Studio Team',
      message: 'Looking forward to your event!',
      time: '2 days ago',
      unread: true,
    },
    {
      from: 'Studio',
      message: 'We have some great ideas for you',
      time: '5 days ago',
      unread: false,
    },
  ];

  const quickActions = [
    { icon: MessageSquare, label: 'Messages', badge: 1, action: 'messages' },
    { icon: Calendar, label: 'View Booking', action: 'booking-detail' },
    { icon: Download, label: 'Upload Docs', action: 'booking-detail' },
    { icon: ImageIcon, label: 'Gallery', action: 'gallery' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-gray-800 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Here's an overview of your wedding planning</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => onNavigate(action.action)}
              className="relative bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all group"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-rose-50 rounded-full group-hover:bg-rose-100 transition-colors">
                  <action.icon className="size-6 text-rose-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </div>
              {action.badge && (
                <div className="absolute top-4 right-4 size-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">{action.badge}</span>
                </div>
              )}
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              {bookingsLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="text-gray-500">Loading booking details...</div>
                </div>
              ) : booking ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-gray-800">Booking Overview</h2>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm capitalize">
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-lg">
                      <Camera className="size-5 text-rose-500" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Package</p>
                        <p className="font-medium text-gray-800">
                          {booking.packages?.[0]?.name || 'Wedding Photography Package'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-lg">
                      <Calendar className="size-5 text-rose-500" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Wedding Date</p>
                        <p className="font-medium text-gray-800">
                          {booking.eventDate
                            ? new Date(booking.eventDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'TBD'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-lg">
                      <Camera className="size-5 text-rose-500" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-medium text-gray-800 capitalize">{booking.status}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('booking-detail')}
                    className="w-full mt-6 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-lg transition-all font-medium"
                  >
                    View Full Details
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No bookings found. Create a booking to get started!
                  </p>
                  <button
                    onClick={() => onNavigate('booking')}
                    className="mt-4 py-2 px-6 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-lg transition-all font-medium"
                  >
                    Create Booking
                  </button>
                </div>
              )}
            </motion.div>

            {/* Payment Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="size-6 text-rose-500" />
                <h2 className="text-xl font-medium text-gray-800">Payment Status</h2>
              </div>

              {orderLoading ? (
                <div className="text-gray-500">Loading payment info...</div>
              ) : order ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-xl font-medium text-gray-800">
                      ${(order.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="text-lg font-medium text-green-600">
                      ${(order.paidAmount || order.summary?.totalPaid || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Balance Due</span>
                    <span className="text-lg font-medium text-rose-500">
                      $
                      {(
                        order.balanceRemaining ||
                        order.summary?.balanceRemaining ||
                        0
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Payment Progress</span>
                      <span>
                        {order.totalAmount > 0
                          ? Math.round(
                              ((order.paidAmount || order.summary?.totalPaid || 0) /
                                order.totalAmount) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all"
                        style={{
                          width: `${
                            order.totalAmount > 0
                              ? Math.round(
                                  ((order.paidAmount || order.summary?.totalPaid || 0) /
                                    order.totalAmount) *
                                    100
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No payment information available yet</div>
              )}
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Clock className="size-6 text-rose-500" />
                <h2 className="text-xl font-medium text-gray-800">Timeline</h2>
              </div>

              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`size-10 rounded-full flex items-center justify-center ${
                          item.status === 'completed' ? 'bg-green-100' : 'bg-rose-100'
                        }`}
                      >
                        {item.status === 'completed' ? (
                          <CheckCircle className="size-5 text-green-600" />
                        ) : (
                          <Clock className="size-5 text-rose-500" />
                        )}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h3 className="font-medium text-gray-800">{item.event}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Messages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-800">Messages</h2>
                <button
                  onClick={() => onNavigate('messages')}
                  className="text-sm text-rose-500 hover:text-rose-600"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {recentMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg cursor-pointer hover:bg-rose-50 transition-colors ${
                      msg.unread ? 'bg-rose-50' : 'bg-gray-50'
                    }`}
                    onClick={() => onNavigate('messages')}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-gray-800">{msg.from}</p>
                      {msg.unread && <div className="size-2 bg-rose-500 rounded-full" />}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{msg.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{msg.time}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl shadow-lg p-6 text-white"
            >
              <h3 className="text-lg font-medium mb-4">Days Until Event</h3>
              <p className="text-5xl font-serif mb-2">
                {daysUntilWedding !== null && daysUntilWedding >= 0 ? daysUntilWedding : '—'}
              </p>
              <p className="text-rose-100">
                {booking
                  ? "We can't wait to capture your special day!"
                  : 'Create a booking to see countdown'}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
