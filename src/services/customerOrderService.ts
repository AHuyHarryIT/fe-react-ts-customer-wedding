import { api } from './apiClient';
import type { CustomerDepositCheckoutResponse, StandardResponse } from '@/types';

export const customerOrderService = {
  checkoutDeposit: async (
    bookingId: string,
    redirectUrl?: string
  ): Promise<CustomerDepositCheckoutResponse> => {
    const response = await api.post<StandardResponse<CustomerDepositCheckoutResponse>>(
      `/customer/orders/${bookingId}/deposit`,
      {
        redirectUrl,
      }
    );

    if (!response.data.data) {
      throw new Error('Deposit payment could not be started.');
    }

    return response.data.data;
  },

  checkMomoPaymentStatus: async (orderId: string) => {
    const response = await api.post<
      StandardResponse<{
        orderId: string;
        resultCode: number;
        message: string;
        transId?: string;
      }>
    >('/orders/momo/check-status', {
      orderId,
    });

    if (!response.data.data) {
      throw new Error('Payment status could not be verified.');
    }

    return response.data.data;
  },
};
