import { apiRequest } from '@/shared/api/http';

export interface RecentlyViewedServerResponse {
  id: number;
  productId: number;
  viewedAt: string;
}

export const recentlyViewedService = {
  getAll: () => apiRequest<RecentlyViewedServerResponse[]>('/api/recently-viewed'),

  track: (productId: number) =>
    apiRequest<void>('/api/recently-viewed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    }),

  sync: (productIds: number[]) =>
    apiRequest<void>('/api/recently-viewed/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds }),
    }),

  clear: () => apiRequest<void>('/api/recently-viewed', { method: 'DELETE' }),
};
