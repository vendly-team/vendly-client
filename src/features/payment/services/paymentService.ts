import { apiRequest } from '@/shared/api/http';
import type { CheckoutResponse, CheckoutStatusResponse, PaymentProvider } from '../types';

export const paymentService = {
  /** Initiates payment for a draft order with the chosen provider; returns the provider's payment page URL. */
  initiatePayment: (orderId: number, provider: PaymentProvider) =>
    apiRequest<CheckoutResponse>(`/api/orders/${orderId}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    }),

  /** Returns the payment/order status for a given order number. */
  getStatus: (orderNumber: string) =>
    apiRequest<CheckoutStatusResponse>(`/api/checkout/status/${orderNumber}`),
};
