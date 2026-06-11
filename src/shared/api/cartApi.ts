import { apiRequest } from './http';

export type CartItemDto = {
  id: number;
  productVariantId: number;
  productId: number;
  productName: string;
  variantName: string | null;
  price: number;
  images: string[];
  qty: number;
  stock: number;
};

export type CartDto = {
  id: number;
  items: CartItemDto[];
  totalAmount: number;
  isLocked: boolean;
};

export const cartApi = {
  get: () =>
    apiRequest<CartDto>('/api/carts/'),

  addItem: (productVariantId: number, qty: number) =>
    apiRequest<CartDto>('/api/carts/items/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productVariantId, qty }),
    }),

  updateItem: (cartItemId: number, qty: number) =>
    apiRequest<CartDto>(`/api/carts/items/${cartItemId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qty }),
    }),

  removeItem: (cartItemId: number) =>
    apiRequest<CartDto>(`/api/carts/items/${cartItemId}/`, { method: 'DELETE' }),

  clear: () =>
    apiRequest<void>('/api/carts/', { method: 'DELETE' }),
};
