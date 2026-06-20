import { apiRequest } from '@/shared/api/http'
import type { ShippingQuote, ShippingQuoteRequest } from '../types'

export const shippingService = {
  quote: (data: ShippingQuoteRequest) =>
    apiRequest<ShippingQuote>('/api/shipping/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // Server computes the cart weight for the user; only the chosen address is sent.
  quoteForAddress: (addressId: number) =>
    apiRequest<ShippingQuote>(`/api/orders/shipping-quote?addressId=${addressId}`),
}
