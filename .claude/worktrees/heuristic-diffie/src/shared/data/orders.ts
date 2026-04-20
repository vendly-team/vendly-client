export type OrderStatus = 'new' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface OrderData {
  id: string;
  orderNumber: string;
  customerId: string;
  items: { productId: string; productName: string; productImage: string; sku: string; qty: number; priceSnapshot: number }[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider?: 'click' | 'payme' | 'card';
  totalAmount: number;
  deliveryAddress: { city: string; district: string; street: string };
  deliveryCost: number;
  estimatedDelivery: string;
  statusHistory: { status: OrderStatus; date: string; note?: string }[];
  createdAt: string;
}

export const orders: OrderData[] = [
  {
    id: 'o1', orderNumber: 'ORD-2025-001', customerId: 'c1',
    items: [{ productId: '1', productName: 'Samsung French Door Refrigerator', productImage: 'https://picsum.photos/seed/prod1a/600/600', sku: 'BT-00001', qty: 1, priceSnapshot: 999.99 }],
    status: 'delivered', paymentStatus: 'paid', paymentProvider: 'card', totalAmount: 1009.99, deliveryCost: 10,
    deliveryAddress: { city: 'New York', district: 'Manhattan', street: '5th Avenue 42B' },
    estimatedDelivery: '2025-06-08', statusHistory: [
      { status: 'new', date: '2025-06-01T10:00:00Z' }, { status: 'accepted', date: '2025-06-01T12:00:00Z' },
      { status: 'in_transit', date: '2025-06-03T09:00:00Z' }, { status: 'delivered', date: '2025-06-05T14:00:00Z' }
    ], createdAt: '2025-06-01T10:00:00Z'
  },
  {
    id: 'o2', orderNumber: 'ORD-2025-002', customerId: 'c2',
    items: [{ productId: '7', productName: 'Samsung QLED 55" 4K TV', productImage: 'https://picsum.photos/seed/prod7a/600/600', sku: 'BT-00007', qty: 1, priceSnapshot: 649.99 },
            { productId: '15', productName: 'Ninja Professional Blender', productImage: 'https://picsum.photos/seed/prod15a/600/600', sku: 'BT-00015', qty: 2, priceSnapshot: 129.99 }],
    status: 'in_transit', paymentStatus: 'paid', paymentProvider: 'payme', totalAmount: 919.97, deliveryCost: 10,
    deliveryAddress: { city: 'Los Angeles', district: 'Hollywood', street: 'Sunset Blvd 101' },
    estimatedDelivery: '2025-06-12', statusHistory: [
      { status: 'new', date: '2025-06-05T08:00:00Z' }, { status: 'accepted', date: '2025-06-05T10:00:00Z' },
      { status: 'in_transit', date: '2025-06-07T11:00:00Z' }
    ], createdAt: '2025-06-05T08:00:00Z'
  },
  {
    id: 'o3', orderNumber: 'ORD-2025-003', customerId: 'c3',
    items: [{ productId: '12', productName: 'Dyson V15 Detect Vacuum', productImage: 'https://picsum.photos/seed/prod12a/600/600', sku: 'BT-00012', qty: 1, priceSnapshot: 599.99 }],
    status: 'accepted', paymentStatus: 'paid', paymentProvider: 'click', totalAmount: 609.99, deliveryCost: 10,
    deliveryAddress: { city: 'San Francisco', district: 'SOMA', street: 'Market St 500' },
    estimatedDelivery: '2025-06-14', statusHistory: [
      { status: 'new', date: '2025-06-08T09:00:00Z' }, { status: 'accepted', date: '2025-06-08T14:00:00Z' }
    ], createdAt: '2025-06-08T09:00:00Z'
  },
  {
    id: 'o4', orderNumber: 'ORD-2025-004', customerId: 'c1',
    items: [{ productId: '14', productName: 'KitchenAid Stand Mixer', productImage: 'https://picsum.photos/seed/prod14a/600/600', sku: 'BT-00014', qty: 1, priceSnapshot: 379.99 }],
    status: 'new', paymentStatus: 'pending', totalAmount: 389.99, deliveryCost: 10,
    deliveryAddress: { city: 'New York', district: 'Manhattan', street: '5th Avenue 42B' },
    estimatedDelivery: '2025-06-15', statusHistory: [
      { status: 'new', date: '2025-06-09T07:00:00Z' }
    ], createdAt: '2025-06-09T07:00:00Z'
  },
  {
    id: 'o5', orderNumber: 'ORD-2025-005', customerId: 'c6',
    items: [{ productId: '5', productName: 'Daikin Split AC 1.5 Ton', productImage: 'https://picsum.photos/seed/prod5a/600/600', sku: 'BT-00005', qty: 2, priceSnapshot: 479.99 }],
    status: 'delivered', paymentStatus: 'paid', paymentProvider: 'card', totalAmount: 969.98, deliveryCost: 10,
    deliveryAddress: { city: 'Houston', district: 'Midtown', street: 'Main St 75A' },
    estimatedDelivery: '2025-06-10', statusHistory: [
      { status: 'new', date: '2025-05-28T10:00:00Z' }, { status: 'accepted', date: '2025-05-28T15:00:00Z' },
      { status: 'in_transit', date: '2025-05-30T08:00:00Z' }, { status: 'delivered', date: '2025-06-01T16:00:00Z' }
    ], createdAt: '2025-05-28T10:00:00Z'
  },
  {
    id: 'o6', orderNumber: 'ORD-2025-006', customerId: 'c7',
    items: [{ productId: '8', productName: 'LG OLED 65" TV', productImage: 'https://picsum.photos/seed/prod8a/600/600', sku: 'BT-00008', qty: 1, priceSnapshot: 1899.99 }],
    status: 'cancelled', paymentStatus: 'failed', totalAmount: 1909.99, deliveryCost: 10,
    deliveryAddress: { city: 'Seattle', district: 'Capitol Hill', street: 'Broadway E 330' },
    estimatedDelivery: '2025-06-12', statusHistory: [
      { status: 'new', date: '2025-06-02T11:00:00Z' }, { status: 'cancelled', date: '2025-06-02T18:00:00Z', note: 'Payment failed' }
    ], createdAt: '2025-06-02T11:00:00Z'
  },
  {
    id: 'o7', orderNumber: 'ORD-2025-007', customerId: 'c3',
    items: [{ productId: '16', productName: 'Philips Air Fryer XXL', productImage: 'https://picsum.photos/seed/prod16a/600/600', sku: 'BT-00016', qty: 1, priceSnapshot: 249.99 },
            { productId: '9', productName: 'Panasonic Convection Microwave', productImage: 'https://picsum.photos/seed/prod9a/600/600', sku: 'BT-00009', qty: 1, priceSnapshot: 199.99 }],
    status: 'new', paymentStatus: 'paid', paymentProvider: 'payme', totalAmount: 459.98, deliveryCost: 10,
    deliveryAddress: { city: 'San Francisco', district: 'SOMA', street: 'Market St 500' },
    estimatedDelivery: '2025-06-16', statusHistory: [
      { status: 'new', date: '2025-06-09T12:00:00Z' }
    ], createdAt: '2025-06-09T12:00:00Z'
  },
  {
    id: 'o8', orderNumber: 'ORD-2025-008', customerId: 'c4',
    items: [{ productId: '3', productName: 'Bosch Front Load Washer', productImage: 'https://picsum.photos/seed/prod3a/600/600', sku: 'BT-00003', qty: 1, priceSnapshot: 749.99 }],
    status: 'in_transit', paymentStatus: 'paid', paymentProvider: 'card', totalAmount: 759.99, deliveryCost: 10,
    deliveryAddress: { city: 'Denver', district: 'Downtown', street: 'Colfax Ave 88' },
    estimatedDelivery: '2025-06-13', statusHistory: [
      { status: 'new', date: '2025-06-06T14:00:00Z' }, { status: 'accepted', date: '2025-06-06T17:00:00Z' },
      { status: 'in_transit', date: '2025-06-08T09:00:00Z' }
    ], createdAt: '2025-06-06T14:00:00Z'
  },
  {
    id: 'o9', orderNumber: 'ORD-2025-009', customerId: 'c7',
    items: [{ productId: '13', productName: 'iRobot Roomba j7+', productImage: 'https://picsum.photos/seed/prod13a/600/600', sku: 'BT-00013', qty: 1, priceSnapshot: 599.99 }],
    status: 'delivered', paymentStatus: 'paid', paymentProvider: 'click', totalAmount: 609.99, deliveryCost: 10,
    deliveryAddress: { city: 'Seattle', district: 'Capitol Hill', street: 'Broadway E 330' },
    estimatedDelivery: '2025-06-08', statusHistory: [
      { status: 'new', date: '2025-05-30T10:00:00Z' }, { status: 'accepted', date: '2025-05-30T14:00:00Z' },
      { status: 'in_transit', date: '2025-06-01T08:00:00Z' }, { status: 'delivered', date: '2025-06-03T12:00:00Z' }
    ], createdAt: '2025-05-30T10:00:00Z'
  },
  {
    id: 'o10', orderNumber: 'ORD-2025-010', customerId: 'c6',
    items: [{ productId: '2', productName: 'LG InstaView Refrigerator', productImage: 'https://picsum.photos/seed/prod2a/600/600', sku: 'BT-00002', qty: 1, priceSnapshot: 1599.99 }],
    status: 'accepted', paymentStatus: 'paid', paymentProvider: 'card', totalAmount: 1609.99, deliveryCost: 10,
    deliveryAddress: { city: 'Houston', district: 'Midtown', street: 'Main St 75A' },
    estimatedDelivery: '2025-06-15', statusHistory: [
      { status: 'new', date: '2025-06-09T08:00:00Z' }, { status: 'accepted', date: '2025-06-09T11:00:00Z' }
    ], createdAt: '2025-06-09T08:00:00Z'
  },
];
