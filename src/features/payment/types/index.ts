/** Payment providers supported by the backend (sent to /api/orders/{id}/payment). */
export type PaymentProvider = 'Hamkor' | 'Payme' | 'Click';

export interface CheckoutResponse {
  paymentUrl: string;
  orderNumber: string;
}

export interface CheckoutStatusResponse {
  orderNumber: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded' | string;
  orderStatus: string;
}
