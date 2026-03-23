import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add authorization header interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface BookingPackage {
  id: string;
  name: string;
  description?: string;
  price: number;
}

export interface Photographer {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

export interface BookingSession {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
}

export interface Booking {
  id: string;
  customerId: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  eventDate: string;
  createdAt: string;
  updatedAt: string;
  packages?: BookingPackage[];
  package?: BookingPackage;
  sessions?: BookingSession[];
  staffName?: string;
}

export interface StandardResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

// Booking API service
export const bookingService = {
  // Get customer's bookings
  getCustomerBookings: async (customerId: string) => {
    try {
      const response = await api.get<StandardResponse<Booking[]>>(
        `/bookings?customerId=${customerId}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      return [];
    }
  },

  // Get single booking details
  getBookingDetails: async (bookingId: string) => {
    try {
      const response = await api.get<StandardResponse<Booking>>(
        `/bookings/${bookingId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return null;
    }
  },
};

export interface Payment {
  id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  method: string;
  createdAt: string;
}

export interface Order {
  id: string;
  bookingId: string;
  status: string;
  totalAmount: number;
  paidAmount?: number;
  balanceRemaining?: number;
  payments?: Payment[];
  summary?: {
    totalPrice: number;
    totalPaid: number;
    balanceRemaining: number;
    isPaid: boolean;
    isPartiallyPaid: boolean;
  };
}

// Order/Payment API service
export const orderService = {
  // Get order for booking
  getOrderByBookingId: async (bookingId: string) => {
    try {
      const response = await api.get<StandardResponse<Order>>(
        `/orders/${bookingId}`
      );
      return response.data.data || null;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  // Get order status
  getOrderStatus: async (bookingId: string) => {
    try {
      const response = await api.get<
        StandardResponse<{
          bookingId: string;
          orderId: string;
          status: string;
          totalPrice: number;
          totalPaid: number;
          balanceRemaining: number;
          isPaid: boolean;
          isPartiallyPaid: boolean;
        }>
      >(`/orders/${bookingId}/status`);
      return response.data.data || null;
    } catch (error) {
      console.error('Error fetching order status:', error);
      return null;
    }
  },

  // Get all orders for customer
  getCustomerOrders: async () => {
    try {
      const response = await api.get<StandardResponse<Order[]>>('/orders');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  },
};
