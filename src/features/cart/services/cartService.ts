import { apiRequest } from '@/shared/api/http';
import type { AddCartItemRequest, BackendCart, UpdateCartItemRequest } from '../types';

export const cartService = {
  /** Returns the current user's cart, creating one if missing. */
  getOrCreate: () => apiRequest<BackendCart>('/api/carts'),

  /** Adds a variant to the cart (or increments qty if already present). */
  addItem: (request: AddCartItemRequest) =>
    apiRequest<BackendCart>('/api/carts/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    }),

  /** Updates the quantity of a cart item. qty <= 0 removes the item. */
  updateItem: (cartItemId: number, request: UpdateCartItemRequest) =>
    apiRequest<BackendCart>(`/api/carts/items/${cartItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    }),

  /** Removes a single item from the cart. */
  removeItem: (cartItemId: number) =>
    apiRequest<BackendCart>(`/api/carts/items/${cartItemId}`, {
      method: 'DELETE',
    }),

  /** Removes all items from the cart. */
  clear: () =>
    apiRequest<void>('/api/carts', {
      method: 'DELETE',
    }),
};
