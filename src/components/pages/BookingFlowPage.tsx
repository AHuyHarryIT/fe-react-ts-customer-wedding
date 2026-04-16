import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useId, useMemo, useState } from 'react';
import { Calendar, ChevronLeft, MapPin, ReceiptText, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { usePackages } from '@/hooks/usePackages';
import { bookingService } from '@/services/bookingService';
import { useAuthStore } from '@/stores/authStore';
import { formatMoneyVND } from '@/utils/money';

export function BookingFlowPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/booking' });
  const packageSelectId = useId();
  const eventDateId = useId();
  const guestCountId = useId();
  const eventLocationId = useId();
  const notesId = useId();
  const { user } = useAuthStore();
  const { packages, loading: packagesLoading } = usePackages({
    limit: 100,
    includeServices: false,
  });
  const [selectedPackageId, setSelectedPackageId] = useState(search.packageId ?? '');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedPackageId(search.packageId ?? '');
  }, [search.packageId]);

  const selectedPackage = useMemo(
    () => packages.find((pkg) => pkg.id === selectedPackageId) || null,
    [packages, selectedPackageId]
  );

  const bookingSummary = useMemo(() => {
    const lines = [
      selectedPackage ? `Package: ${selectedPackage.name}` : null,
      eventDate ? `Event date: ${eventDate}` : null,
      eventLocation ? `Event location: ${eventLocation}` : null,
      guestCount ? `Estimated guests: ${guestCount}` : null,
      notes ? `Notes: ${notes}` : null,
    ].filter(Boolean);

    return lines.join('\n');
  }, [eventDate, eventLocation, guestCount, notes, selectedPackage]);

  const bookingNotes = useMemo(() => {
    const noteLines = [
      eventLocation ? `Event location: ${eventLocation}` : null,
      guestCount ? `Estimated guests: ${guestCount}` : null,
      notes ? `Additional notes: ${notes}` : null,
    ].filter(Boolean);

    return noteLines.join('\n');
  }, [eventLocation, guestCount, notes]);

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to create a booking.');
      return;
    }

    if (!selectedPackageId) {
      toast.error('Please choose a package before creating the booking.');
      return;
    }

    if (!eventDate || !eventLocation || !guestCount) {
      toast.error('Event date, location, and guest count are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const booking = await bookingService.createBooking({
        packageIds: [selectedPackageId],
        eventDate: new Date(eventDate).toISOString(),
        notes: bookingNotes || undefined,
      });

      toast.success('Booking created successfully.');
      await navigate({
        to: '/bookings/$id',
        params: { id: booking.id },
      });
    } catch (error) {
      console.error('Booking creation failed:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create your booking. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/packages"
          className="mb-8 flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-rose-500"
        >
          <ChevronLeft className="size-4" />
          Back to packages
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white p-8 shadow-xl"
          >
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-rose-500">
                Real Booking
              </p>
              <h1 className="mb-3 text-4xl font-serif text-gray-900">Create Your Booking</h1>
              <p className="max-w-2xl text-gray-600">
                Choose your package and share the event details that should be stored with the
                booking. The studio team can confirm, update, and continue follow-up after the
                booking is created.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor={packageSelectId}
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Package of interest
                </label>
                <select
                  id={packageSelectId}
                  name="packageId"
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
                {packagesLoading ? (
                  <p className="mt-2 text-sm text-gray-500">Loading packages…</p>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
                    id={`${eventDateId}-label`}
                  >
                    <Calendar className="size-4 text-rose-500" />
                    Preferred event date
                  </span>
                  <input
                    id={eventDateId}
                    name="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    aria-labelledby={`${eventDateId}-label`}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </label>

                <label className="block">
                  <span
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
                    id={`${guestCountId}-label`}
                  >
                    <Users className="size-4 text-rose-500" />
                    Estimated guests
                  </span>
                  <input
                    id={guestCountId}
                    name="guestCount"
                    type="number"
                    min="0"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    placeholder="150"
                    aria-labelledby={`${guestCountId}-label`}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </label>
              </div>

              <label className="block">
                <span
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
                  id={`${eventLocationId}-label`}
                >
                  <MapPin className="size-4 text-rose-500" />
                  Event location
                </span>
                <input
                  id={eventLocationId}
                  name="eventLocation"
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="City, venue, or destination"
                  aria-labelledby={`${eventLocationId}-label`}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </label>

              <label className="block">
                <span
                  className="mb-2 block text-sm font-medium text-gray-700"
                  id={`${notesId}-label`}
                >
                  Notes for the studio
                </span>
                <textarea
                  id={notesId}
                  name="notes"
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share your style, timeline, or anything else the studio should know."
                  aria-labelledby={`${notesId}-label`}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </label>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ReceiptText className="size-4" />
                {isSubmitting ? 'Creating booking…' : 'Create Booking'}
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
                <p className="font-medium text-gray-800">1. Your booking is created</p>
                <p className="mt-1">The customer portal saves a real booking record immediately.</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="font-medium text-gray-800">2. The studio reviews your booking</p>
                <p className="mt-1">
                  Package choice, location, date, and notes help the team confirm the next steps.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="font-medium text-gray-800">
                  3. Deposit and follow-up continue afterward
                </p>
                <p className="mt-1">
                  Once the booking exists, payment and studio follow-up can continue from your
                  booking detail and messages pages.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-rose-100 bg-white p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-rose-500">
                Booking Summary
              </p>
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-600">
                {bookingSummary}
              </pre>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
