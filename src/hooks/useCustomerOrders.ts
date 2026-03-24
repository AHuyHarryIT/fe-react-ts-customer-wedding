import { useEffect, useState, useCallback } from 'react';
import { orderService, type Order } from '../services/bookingService';
import { useAuthStore } from '../stores/authStore';

export function useCustomerOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch customer orders
  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getCustomerOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Get order for specific booking
  const getOrderForBooking = useCallback(async (bookingId: string) => {
    try {
      const order = await orderService.getOrderByBookingId(bookingId);
      return order;
    } catch (err) {
      console.error('Failed to fetch order:', err);
      return null;
    }
  }, []);

  // Get order status for specific booking
  const getOrderStatus = useCallback(async (bookingId: string) => {
    try {
      const status = await orderService.getOrderStatus(bookingId);
      return status;
    } catch (err) {
      console.error('Failed to fetch order status:', err);
      return null;
    }
  }, []);

  // Fetch orders on mount or when user changes
  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user?.id, fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    getOrderForBooking,
    getOrderStatus,
  };
}
