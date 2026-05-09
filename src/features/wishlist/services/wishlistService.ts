import { apiRequest } from '@/shared/api/http';

export interface WishlistItem {
  id: number;
  productId: number;
  createdAt: string;
}

export const wishlistService = {
  getAll: () => apiRequest<WishlistItem[]>('/api/wishlists'),

  add: (productId: number) =>
    apiRequest<WishlistItem>('/api/wishlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    }),

  remove: (id: number) =>
    apiRequest<void>(`/api/wishlists/${id}`, { method: 'DELETE' }),
};
