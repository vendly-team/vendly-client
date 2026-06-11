import type { OrderStatusName } from './types';

/** Forward order lifecycle, used for the timeline UI. */
export const ORDER_TIMELINE: OrderStatusName[] = [
  'New',
  'Accepted',
  'Preparing',
  'Shipped',
  'InTransit',
  'OutForDelivery',
  'Delivered',
];

export const ORDER_STATUS_COLORS: Record<OrderStatusName, string> = {
  Draft: 'bg-muted text-muted-foreground',
  New: 'bg-info/10 text-info',
  Accepted: 'bg-purple-100 text-purple-700',
  Preparing: 'bg-purple-100 text-purple-700',
  Shipped: 'bg-warning/10 text-warning',
  InTransit: 'bg-warning/10 text-warning',
  OutForDelivery: 'bg-warning/10 text-warning',
  Delivered: 'bg-success/10 text-success',
  Cancelled: 'bg-destructive/10 text-destructive',
  ReturnRequested: 'bg-destructive/10 text-destructive',
  Returned: 'bg-destructive/10 text-destructive',
};

/** i18n key for an order status label. */
export const orderStatusKey = (status: string) => `orderStatus.${status}`;

/** Mirrors the backend OrderStatusTransitions (admin manual forward steps). */
export const ALLOWED_NEXT_STATUS: Record<string, OrderStatusName[]> = {
  Accepted: ['Preparing'],
  Preparing: ['Shipped'],
  Shipped: ['InTransit'],
  InTransit: ['OutForDelivery'],
  OutForDelivery: ['Delivered'],
};

export const CANCELLABLE_STATUSES: OrderStatusName[] = [
  'New',
  'Accepted',
  'Preparing',
  'Shipped',
  'InTransit',
  'OutForDelivery',
];

export const isCancellable = (status: string): boolean =>
  CANCELLABLE_STATUSES.includes(status as OrderStatusName);
