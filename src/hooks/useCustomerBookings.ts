import { useEffect, useState, useCallback } from 'react';
import { bookingService } from '../services/bookingService';
import type { Booking } from '@/types';
import { useAuthStore } from '../stores/authStore';

export function useCustomerBookings() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch customer bookings
  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getCustomerBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch customer bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch bookings on mount or when user changes
  useEffect(() => {
    if (user?.id) {
      void fetchBookings();
      return;
    }

    setBookings([]);
    setLoading(false);
    setError(null);
  }, [user?.id, fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
    getLatestBooking: () => bookings[0] || null,
  };
}
