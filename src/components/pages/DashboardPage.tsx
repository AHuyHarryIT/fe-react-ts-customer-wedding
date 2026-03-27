import { Link } from '@tanstack/react-router';
import { Calendar, Camera, MessageSquare, UserCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { useCustomerBookings } from '@/hooks/useCustomerBookings';
import { chatService } from '@/services/chatService';
import type { Chat } from '@/types/chat';

export function DashboardPage() {
  const { bookings, loading: bookingsLoading } = useCustomerBookings();
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);

  const latestBooking = bookings[0] || null;

  const daysUntilEvent = useMemo(() => {
    if (!latestBooking?.eventDate) {
      return null;
    }

    const eventTime = new Date(latestBooking.eventDate).getTime();
    return Math.ceil((eventTime - Date.now()) / (1000 * 60 * 60 * 24));
  }, [latestBooking?.eventDate]);

  useEffect(() => {
    const loadChats = async () => {
      try {
        setChatsLoading(true);
        const chats = await chatService.getChats();
        setRecentChats(chats.slice(0, 3));
      } finally {
        setChatsLoading(false);
      }
    };

    void loadChats();
  }, []);

  const quickActions = [
    { icon: MessageSquare, label: 'Messages', to: '/messages' as const },
    { icon: Camera, label: 'Browse Packages', to: '/packages' as const },
    { icon: UserCircle, label: 'Profile', to: '/profile' as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="mb-2 text-3xl font-serif text-gray-900 md:text-4xl">Customer Dashboard</h1>
          <p className="text-gray-600">
            Track your current booking, continue the studio conversation, and review packages.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          <Link
            to="/bookings"
            search={{ packageId: undefined }}
            className="rounded-2xl bg-white p-5 text-left shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="mb-3 inline-flex rounded-full bg-rose-50 p-3">
              <Calendar className="size-5 text-rose-500" />
            </div>
            <p className="text-sm font-medium text-gray-800">Start Consultation</p>
          </Link>
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="rounded-2xl bg-white p-5 text-left shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="mb-3 inline-flex rounded-full bg-rose-50 p-3">
                <action.icon className="size-5 text-rose-500" />
              </div>
              <p className="text-sm font-medium text-gray-800">{action.label}</p>
            </Link>
          ))}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl bg-white p-6 shadow-lg"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-900">Latest Booking</h2>
              {latestBooking && (
                <Link
                  to="/bookings/$id"
                  params={{ id: latestBooking.id }}
                  className="text-sm font-medium text-rose-500 transition-colors hover:text-rose-600"
                >
                  View details
                </Link>
              )}
            </div>

            {bookingsLoading ? (
              <div className="py-12 text-center text-gray-500">Loading booking details…</div>
            ) : latestBooking ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-rose-50 p-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">{latestBooking.status}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Event date</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {new Date(latestBooking.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Days until event</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {typeof daysUntilEvent === 'number' ? `${daysUntilEvent} days` : 'Not set'}
                    </p>
                  </div>
                </div>
                {latestBooking.packages && latestBooking.packages.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="mb-3 text-sm text-gray-500">Selected packages</p>
                    <div className="space-y-2">
                      {latestBooking.packages.map((pkg) => (
                        <div
                          key={pkg.package?.id || pkg.packageId}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="font-medium text-gray-800">
                            {pkg.package?.name || 'Selected Package'}
                          </span>
                          <span className="text-gray-500">Package</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/70 p-8 text-center">
                <h3 className="mb-2 text-lg font-medium text-gray-900">No booking yet</h3>
                <p className="mx-auto mb-5 max-w-lg text-sm text-gray-600">
                  The backend does not expose customer booking creation directly, so the current
                  portal starts with a consultation request through chat.
                </p>
                <Link
                  to="/bookings"
                  search={{ packageId: undefined }}
                  className="rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
                >
                  Start Consultation
                </Link>
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-3xl bg-white p-6 shadow-lg"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-900">Recent Conversations</h2>
              <Link
                to="/messages"
                className="text-sm font-medium text-rose-500 transition-colors hover:text-rose-600"
              >
                Open Messages
              </Link>
            </div>

            {chatsLoading ? (
              <div className="py-12 text-center text-gray-500">Loading chats…</div>
            ) : recentChats.length > 0 ? (
              <div className="space-y-3">
                {recentChats.map((chat) => (
                  <Link
                    key={chat.id}
                    to="/messages"
                    className="flex w-full items-center justify-between rounded-2xl border border-gray-100 p-4 text-left transition-colors hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">Studio HaMy</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {chat.lastMessage || 'Open the conversation to continue chatting.'}
                      </p>
                    </div>
                    {chat.unreadCount ? (
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-600">
                        {chat.unreadCount}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-gray-50 p-6 text-sm text-gray-600">
                You have no conversations yet. Start from Packages or the consultation page and the
                studio team will reply in Messages.
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
}
