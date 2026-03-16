import { Calendar, Camera, CreditCard, Download, MessageSquare, Clock, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const booking = {
    id: 'WED-2026-001',
    package: 'Premium Photography',
    status: 'confirmed',
    weddingDate: '2026-06-15',
    location: 'The Grand Hotel, Los Angeles',
    totalAmount: 3999,
    paidAmount: 1999,
    photographer: 'Michael Chen'
  };

  const timeline = [
    { event: 'Booking Confirmed', date: '2026-02-03', status: 'completed' },
    { event: 'Engagement Session', date: '2026-04-10', status: 'upcoming' },
    { event: 'Final Planning Meeting', date: '2026-06-01', status: 'upcoming' },
    { event: 'Wedding Day', date: '2026-06-15', status: 'upcoming' },
    { event: 'Photo Delivery', date: '2026-07-30', status: 'upcoming' }
  ];

  const recentMessages = [
    {
      from: 'Studio Team',
      message: 'Looking forward to your engagement session!',
      time: '2 days ago',
      unread: true
    },
    {
      from: 'Michael Chen',
      message: 'I have some great location ideas for you',
      time: '5 days ago',
      unread: false
    }
  ];

  const quickActions = [
    { icon: MessageSquare, label: 'Messages', badge: 1, action: 'messages' },
    { icon: Calendar, label: 'View Booking', action: 'booking-detail' },
    { icon: Download, label: 'Upload Docs', action: 'booking-detail' },
    { icon: ImageIcon, label: 'Gallery', action: 'gallery' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-serif text-gray-800 mb-2">
            Welcome Back!
          </h1>
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
                    <p className="font-medium text-gray-800">{booking.package}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-lg">
                  <Calendar className="size-5 text-rose-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Wedding Date</p>
                    <p className="font-medium text-gray-800">
                      {new Date(booking.weddingDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-lg">
                  <Camera className="size-5 text-rose-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Photographer</p>
                    <p className="font-medium text-gray-800">{booking.photographer}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('booking-detail')}
                className="w-full mt-6 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full hover:shadow-lg transition-all font-medium"
              >
                View Full Details
              </button>
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

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-xl font-medium text-gray-800">
                    ${booking.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="text-lg font-medium text-green-600">
                    ${booking.paidAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Balance Due</span>
                  <span className="text-lg font-medium text-rose-500">
                    ${(booking.totalAmount - booking.paidAmount).toLocaleString()}
                  </span>
                </div>

                <div className="pt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Payment Progress</span>
                    <span>{Math.round((booking.paidAmount / booking.totalAmount) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all"
                      style={{ width: `${(booking.paidAmount / booking.totalAmount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
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
                          item.status === 'completed'
                            ? 'bg-green-100'
                            : 'bg-rose-100'
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
                          year: 'numeric'
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
                      {msg.unread && (
                        <div className="size-2 bg-rose-500 rounded-full" />
                      )}
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
              <h3 className="text-lg font-medium mb-4">Days Until Wedding</h3>
              <p className="text-5xl font-serif mb-2">132</p>
              <p className="text-rose-100">We can't wait to capture your special day!</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
