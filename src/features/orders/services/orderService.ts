import { apiRequest } from '@/shared/api/http';
import type { Order, OrderListItem, OrderFilter, OrderNote } from '../types';

const toQuery = (filter?: OrderFilter): string => {
  const params = new URLSearchParams();
  if (filter?.status) params.set('status', filter.status);
  if (filter?.search) params.set('search', filter.search);
  const s = params.toString();
  return s ? `?${s}` : '';
};

export type CreateOrderResponse = { id: number; orderNumber: string }

export const orderService = {
  // ── Customer — checkout flow ──
  createDraft: (addressId: number) =>
    apiRequest<CreateOrderResponse>('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addressId }),
    }),
  setAddress: (orderId: number, addressId: number) =>
    apiRequest<void>(`/api/orders/${orderId}/address`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addressId }),
    }),

  // Active (non-terminal) orders: the single unpaid draft/new + any in-fulfillment ones.
  getActiveOrders: () =>
    apiRequest<OrderListItem[]>('/api/orders/active'),
  // Cancel an unpaid (draft/new) order by id.
  cancelDraft: (orderId: number) =>
    apiRequest<void>(`/api/orders/${orderId}`, { method: 'DELETE' }),

  // ── Customer — read ──
  getMyOrders: (filter?: OrderFilter) =>
    apiRequest<OrderListItem[]>(`/api/orders${toQuery(filter)}`),
  getMyOrder: (id: number) => apiRequest<Order>(`/api/orders/${id}`),

  // ── Admin ──
  getAll: (filter?: OrderFilter) =>
    apiRequest<OrderListItem[]>(`/api/admin/orders${toQuery(filter)}`),
  getById: (id: number) => apiRequest<Order>(`/api/admin/orders/${id}`),
  updateStatus: (id: number, status: string, note?: string) =>
    apiRequest<Order>(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    }),
  addNote: (id: number, note: string) =>
    apiRequest<OrderNote>(`/api/admin/orders/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    }),
  cancel: (id: number, reasonCode?: string, reasonText?: string) =>
    apiRequest<Order>(`/api/admin/orders/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reasonCode, reasonText }),
    }),
  getSticker: (id: number) =>
    apiRequest<{ sticker: string }>(`/api/admin/orders/${id}/sticker`),
};
