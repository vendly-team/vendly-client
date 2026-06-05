export interface CheckoutResponse {
  paymentUrl: string;
  orderNumber: string;
}

export interface CheckoutStatusResponse {
  orderNumber: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded' | string;
  orderStatus: string;
}
