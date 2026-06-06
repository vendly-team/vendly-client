export interface Product {
  id: string;
  variantId?: number;
  sku: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  images: string[];
  price: number;
  salePrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  specifications: { key: string; value: string }[];
  syncSource: 'manual' | 'external';
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  isActive: boolean;
}

export interface CartItem {
  /** Backend cart item id. 0 for pending/anonymous items (not yet synced to backend). */
  cartItemId: number;
  productVariantId: number;
  /** Composite for compatibility with existing UI keys/links: `${productId}:${variantId}` or just `${productId}`. */
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  sku: string;
  stock: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'manager';
}

export interface Address {
  id: string;
  city: string;
  district: string;
  street: string;
  house: string;
  notes?: string;
  isDefault: boolean;
}

export type OrderStatus = 'new' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
