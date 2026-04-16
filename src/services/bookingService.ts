import { api } from './apiClient';
import type {
  Booking,
  BookingListPayload,
  BookingSession,
  CreateBookingRequest,
  StandardResponse,
} from '@/types/booking';
const normalizeBookingSession = (session: BookingSession): BookingSession => {
  const startsAt = session.startsAt ?? session.startDate ?? '';
  const endsAt = session.endsAt ?? session.endDate;
  const locationName = session.locationName ?? session.location;

  return {
    ...session,
    startsAt,
    endsAt,
    locationName,
    startDate: startsAt || undefined,
    endDate: endsAt,
    location: locationName,
  };
};

const normalizeBookingDetail = (booking: Booking | null | undefined): Booking | null => {
  if (!booking) {
    return null;
  }

  return {
    ...booking,
    status: booking.status,
    sessions: Array.isArray(booking.sessions)
      ? booking.sessions.map((session) => normalizeBookingSession(session))
      : [],
  };
};

const unwrapBookingList = (payload: BookingListPayload | undefined): Booking[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};

export const bookingService = {
  createBooking: async (payload: CreateBookingRequest): Promise<Booking> => {
    const response = await api.post<StandardResponse<Booking>>('/customer/bookings', payload);
    return response.data.data as Booking;
  },

  getCustomerBookings: async (): Promise<Booking[]> => {
    const response = await api.get<StandardResponse<BookingListPayload>>('/bookings', {
      params: {
        includePackages: true,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      },
    });

    return unwrapBookingList(response.data.data);
  },

  getBookingDetails: async (bookingId: string): Promise<Booking | null> => {
    const response = await api.get<StandardResponse<Booking>>(`/bookings/${bookingId}`);
    return normalizeBookingDetail(response.data.data);
  },
};
