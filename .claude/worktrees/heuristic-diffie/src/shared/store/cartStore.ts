import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  get totalItems(): number;
  get totalAmount(): number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Product, qty = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === product.id);
        if (existing) {
          set({ items: items.map((i) => i.productId === product.id ? { ...i, qty: i.qty + qty } : i) });
        } else {
          set({
            items: [...items, {
              productId: product.id,
              name: product.name,
              image: product.images[0] || '',
              price: product.salePrice ?? product.price,
              qty,
              sku: product.sku,
            }],
          });
        }
      },
      removeItem: (productId: string) => set({ items: get().items.filter((i) => i.productId !== productId) }),
      updateQty: (productId: string, qty: number) => {
        if (qty <= 0) { set({ items: get().items.filter((i) => i.productId !== productId) }); return; }
        set({ items: get().items.map((i) => i.productId === productId ? { ...i, qty } : i) });
      },
      clearCart: () => set({ items: [] }),
      get totalItems() { return get().items.reduce((sum, i) => sum + i.qty, 0); },
      get totalAmount() { return get().items.reduce((sum, i) => sum + i.price * i.qty, 0); },
    }),
    { name: 'cart-storage' }
  )
);
