export interface CustomerOrderPayment {
  id: string;
  amount: number;
  paymentType?: 'DEPOSIT' | 'FULL' | 'REMAINING' | 'INSTALLMENT' | 'ADJUSTMENT';
  status:
    | 'PENDING'
    | 'SUCCESSFUL'
    | 'FAILED'
    | 'CANCELLED'
    | 'ABANDONED'
    | 'REFUNDED'
    | 'PARTIAL_PAID';
}

export interface CustomerOrderSummary {
  totalPrice: number;
  remainingAmount: number;
  totalPaid: number;
  isPaid: boolean;
  pendingAmount: number;
}

export interface CustomerOrder {
  id: string;
  bookingId: string;
  totalPrice: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  payments?: CustomerOrderPayment[];
  summary?: CustomerOrderSummary;
}

export interface CustomerMomoPayment {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl?: string | null;
  deeplink?: string | null;
  qrCodeUrl?: string | null;
  deeplinkMiniApp?: string | null;
  qrCode?: string | null;
}

export interface CustomerDepositCheckoutResponse {
  order: CustomerOrder;
  paymentId: string;
  momo: CustomerMomoPayment;
}
