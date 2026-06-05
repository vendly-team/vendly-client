import { apiRequest } from '@/shared/api/http';
import type { CheckoutResponse, CheckoutStatusResponse } from '../types';

export const paymentService = {
  /** Creates an order from the cart and returns the Hamkorbank payment page URL. */
  checkout: (addressId: number) =>
    apiRequest<CheckoutResponse>('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addressId }),
    }),

  /** Returns the payment/order status for a given order number. */
  getStatus: (orderNumber: string) =>
    apiRequest<CheckoutStatusResponse>(`/api/checkout/status/${orderNumber}`),
};
