import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Calendar, CheckCircle, ChevronLeft, MapPin, MessageSquare, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { usePackages } from '@/hooks/usePackages';
import { chatService } from '@/services/chatService';
import { useAuthStore } from '@/stores/authStore';
import { formatMoneyVND } from '@/utils/money';
import type { BookingFlowPageProps } from '@/types/components';

export function BookingFlowPage({ initialPackageId = '', onBack }: BookingFlowPageProps) {
  const { user } = useAuthStore();
  const { packages, loading: packagesLoading } = usePackages();
  const [selectedPackageId, setSelectedPackageId] = useState(initialPackageId);
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedPackage = useMemo(
    () => packages.find((pkg) => pkg.id === selectedPackageId) || null,
    [packages, selectedPackageId]
  );

  const messagePreview = useMemo(() => {
    const lines = [
      'Hello Studio HaMy, I would like to start a consultation.',
      selectedPackage ? `Package of interest: ${selectedPackage.name}` : null,
      eventDate ? `Preferred event date: ${eventDate}` : null,
      eventLocation ? `Event location: ${eventLocation}` : null,
      guestCount ? `Estimated guests: ${guestCount}` : null,
      notes ? `Notes: ${notes}` : null,
    ].filter(Boolean);

    return lines.join('\n');
  }, [eventDate, eventLocation, guestCount, notes, selectedPackage]);

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to contact the studio.');
      return;
    }

    setIsSubmitting(true);

    try {
      const chat = await chatService.createChat(user.id);

      if (!chat) {
        throw new Error('Unable to start a consultation chat.');
      }

      const sentMessage = await chatService.sendMessage(chat.id, messagePreview);

      if (!sentMessage) {
        throw new Error('Unable to send your consultation request.');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Consultation request failed:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to contact the studio. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-white p-8 text-center shadow-xl"
          >
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="size-9 text-green-600" />
            </div>
            <h1 className="mb-3 text-3xl font-serif text-gray-900">Consultation Request Sent</h1>
            <p className="mx-auto mb-8 max-w-xl text-gray-600">
              Your message has been sent to the Studio HaMy team through the customer chat. You can
              continue the conversation from the Messages page.
            </p>
            <div className="space-y-3">
              <Link
                to="/messages"
                className="w-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
              >
                Open Messages
              </Link>
              <Link
                to="/dashboard"
                className="w-full rounded-full border border-gray-200 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                Back to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-rose-500"
        >
          <ChevronLeft className="size-4" />
          Back to packages
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white p-8 shadow-xl"
          >
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-rose-500">
                Start With Chat
              </p>
              <h1 className="mb-3 text-4xl font-serif text-gray-900">Plan Your Consultation</h1>
              <p className="max-w-2xl text-gray-600">
                The current customer portal uses the studio chat as the safe first step. Share your
                package interest and event details here, and the staff team will continue with you
                in Messages.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Package of interest
                </label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="">Choose a package</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} · {formatMoneyVND(pkg.price)}
                    </option>
                  ))}
                </select>
                {packagesLoading && <p className="mt-2 text-sm text-gray-500">Loading packages…</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="size-4 text-rose-500" />
                    Preferred event date
                  </span>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Users className="size-4 text-rose-500" />
                    Estimated guests
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    placeholder="150"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="size-4 text-rose-500" />
                  Event location
                </span>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="City, venue, or destination"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  Notes for the studio
                </span>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share your style, timeline, or anything else the studio should know."
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </label>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MessageSquare className="size-4" />
                {isSubmitting ? 'Sending request…' : 'Send Consultation Request'}
              </button>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl bg-[#fff8f7] p-8 shadow-lg"
          >
            <h2 className="mb-4 text-xl font-medium text-gray-900">What Happens Next</h2>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="rounded-2xl bg-white p-4">
                <p className="font-medium text-gray-800">1. We open a support chat</p>
                <p className="mt-1">Your request is sent through the existing customer chat API.</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="font-medium text-gray-800">2. The studio reviews your details</p>
                <p className="mt-1">
                  Package interest, location, date, and notes help the team respond faster.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="font-medium text-gray-800">3. You continue in Messages</p>
                <p className="mt-1">
                  Pricing, availability, and next steps stay inside one customer-safe channel.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-rose-100 bg-white p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-rose-500">
                Message Preview
              </p>
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-600">
                {messagePreview}
              </pre>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
