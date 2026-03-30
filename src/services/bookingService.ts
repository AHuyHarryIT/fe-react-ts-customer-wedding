import { api } from './apiClient';
import type {
  Booking,
  BookingListPayload,
  CreateBookingRequest,
  StandardResponse,
} from '@/types/booking';

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
      },
    });

    return unwrapBookingList(response.data.data);
  },

  getBookingDetails: async (bookingId: string): Promise<Booking | null> => {
    const response = await api.get<StandardResponse<Booking>>(`/bookings/${bookingId}`);
    return response.data.data || null;
  },
};
