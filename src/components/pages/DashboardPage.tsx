import { Link } from '@tanstack/react-router';
import { Calendar, Camera, MessageSquare, UserCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCustomerBookings } from '@/hooks/useCustomerBookings';
import { chatService } from '@/services/chatService';
import type { Chat } from '@/types/chat';
import type { Booking } from '@/types/booking';
import { CustomerStatePanel } from '@/components/pages/CustomerStatePanel';

const formatBookingStatus = (status: Booking['status']) => status.replace(/_/g, ' ');

export function DashboardPage() {
  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings,
  } = useCustomerBookings();
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);

  const latestBooking = bookings[0] || null;

  const daysUntilEvent = useMemo(() => {
    if (!latestBooking?.eventDate) {
      return null;
    }

    const eventTime = new Date(latestBooking.eventDate).getTime();
    return Math.ceil((eventTime - Date.now()) / (1000 * 60 * 60 * 24));
  }, [latestBooking?.eventDate]);

  const loadChats = useCallback(async () => {
    try {
      setChatsLoading(true);
      setChatsError(null);
      const chats = await chatService.getChats();
      setRecentChats(chats.slice(0, 3));
    } catch (error) {
      console.error('Failed to load recent chats:', error);
      setChatsError('We could not load your recent conversations right now.');
    } finally {
      setChatsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

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
            to="/booking"
            search={{ packageId: undefined }}
            className="rounded-2xl bg-white p-5 text-left shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="mb-3 inline-flex rounded-full bg-rose-50 p-3">
              <Calendar className="size-5 text-rose-500" />
            </div>
            <p className="text-sm font-medium text-gray-800">Create Booking</p>
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
              <CustomerStatePanel
                tone="loading"
                title="Loading your latest booking"
                description="We are pulling your booking, event date, and deposit details."
              />
            ) : bookingsError ? (
              <CustomerStatePanel
                tone="error"
                title="Could not load booking details"
                description={bookingsError}
                actions={
                  <button
                    type="button"
                    onClick={() => void refetchBookings()}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-5 py-3 font-medium text-white transition-all hover:shadow-lg"
                  >
                    Retry
                  </button>
                }
              />
            ) : latestBooking ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-rose-50 p-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    {formatBookingStatus(latestBooking.status)}
                  </p>
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
              <CustomerStatePanel
                tone="empty"
                title="No booking yet"
                description="Create your first booking from the packages flow and the studio team can review, confirm, and continue follow-up afterward."
                actions={
                  <Link
                    to="/booking"
                    search={{ packageId: undefined }}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
                  >
                    Create Booking
                  </Link>
                }
              />
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
              <CustomerStatePanel
                tone="loading"
                title="Loading recent conversations"
                description="We are checking for your latest updates from the studio team."
              />
            ) : chatsError ? (
              <CustomerStatePanel
                tone="error"
                title="Could not load conversations"
                description={chatsError}
                actions={
                  <button
                    type="button"
                    onClick={() => void loadChats()}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-5 py-3 font-medium text-white transition-all hover:shadow-lg"
                  >
                    Retry
                  </button>
                }
              />
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
              <CustomerStatePanel
                tone="empty"
                title="No conversations yet"
                description="Create a booking first or open Messages directly when you need to follow up with the studio team."
                actions={
                  <Link
                    to="/packages"
                    className="inline-flex items-center justify-center rounded-full border border-rose-200 px-5 py-3 font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    Browse Packages
                  </Link>
                }
              />
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
}
