import { apiRequest } from '@/shared/api/http';
import type { CheckoutResponse, CheckoutStatusResponse } from '../types';

export const paymentService = {
  /** Initiates payment for a draft order and returns the Hamkorbank payment page URL. */
  initiatePayment: (orderId: number) =>
    apiRequest<CheckoutResponse>(`/api/orders/${orderId}/payment`, {
      method: 'POST',
    }),

  /** Returns the payment/order status for a given order number. */
  getStatus: (orderNumber: string) =>
    apiRequest<CheckoutStatusResponse>(`/api/checkout/status/${orderNumber}`),
};
