export type OrderStatusName =
  | 'Draft'
  | 'New'
  | 'Accepted'
  | 'Preparing'
  | 'Shipped'
  | 'InTransit'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Cancelled'
  | 'ReturnRequested'
  | 'Returned';

export type PaymentStatusName = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export type DeliveryStatusName =
  | 'Pending'
  | 'InTransit'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Failed'
  | 'Unknown';

export interface OrderListItem {
  id: number;
  orderNumber: string;
  status: OrderStatusName;
  paymentStatus: PaymentStatusName;
  deliveryStatus: DeliveryStatusName;
  subtotal: number;
  deliveryCost: number;
  totalAmount: number;
  itemCount: number;
  deliveryCity: string;
  items: OrderItem[];
  customerName?: string | null;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  productId?: number | null;
  productName: string;
  sku: string;
  image: string;
  qty: number;
  price: number;
  total: number;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatusName;
  note?: string | null;
  createdAt: string;
}

export interface OrderNote {
  id: number;
  note: string;
  createdAt: string;
}

export interface OrderDelivery {
  city: string;
  district: string;
  street: string;
  house: string;
  extra?: string | null;
  btsCityCode: string;
  btsBarcode?: string | null;
  btsTrackingUrl?: string | null;
  btsStickerUrl?: string | null;
  btsLastStatusName?: string | null;
  deliveredAt?: string | null;
}

export interface OrderPayment {
  provider: string;
  status: PaymentStatusName;
  amount: number;
  paidAt?: string | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatusName;
  paymentStatus: PaymentStatusName;
  deliveryStatus: DeliveryStatusName;
  subtotal: number;
  deliveryCost: number;
  discountAmount: number;
  totalAmount: number;
  delivery: OrderDelivery;
  payment?: OrderPayment | null;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
  notes: OrderNote[];
  customerName?: string | null;
  createdAt: string;
}

export interface OrderFilter {
  status?: string;
  search?: string;
}
