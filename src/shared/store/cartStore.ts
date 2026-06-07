import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi, type CartDto } from '@/shared/api/cartApi';
import { resolveProductMediaUrl } from '@/features/products/services/storefrontProductMapper';
import type { Product, CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  hydrateFromServer: (cart: CartDto) => void;
  syncWithServer: () => Promise<void>;
  get totalItems(): number;
  get totalAmount(): number;
}

const isAuth = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (!stored) return false;
    const parsed = JSON.parse(stored) as { state?: { isAuthenticated?: boolean } };
    return parsed?.state?.isAuthenticated === true;
  } catch {
    return false;
  }
};

const fromServerCart = (cart: CartDto): CartItem[] =>
  cart.items.map(item => ({
    productId: String(item.productId),
    variantId: item.productVariantId,
    cartItemId: item.id,
    name: item.productName + (item.variantName ? ` — ${item.variantName}` : ''),
    image: resolveProductMediaUrl(item.images[0]),
    price: item.price,
    qty: item.qty,
    stock: item.stock,
    sku: `SKU-${item.productVariantId}`,
  }));

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, qty = 1) => {
        const items = get().items;
        const existing = items.find(i => i.productId === product.id);

        // Optimistic local update
        if (existing) {
          set({ items: items.map(i => i.productId === product.id ? { ...i, qty: i.qty + qty } : i) });
        } else {
          set({
            items: [...items, {
              productId: product.id,
              variantId: product.variantId,
              name: product.name,
              image: product.images[0] || '',
              price: product.salePrice ?? product.price,
              qty,
              stock: product.stock,
              sku: product.sku,
            }],
          });
        }

        if (!isAuth() || !product.variantId) return;

        cartApi.addItem(product.variantId, qty)
          .then(cart => set({ items: fromServerCart(cart) }))
          .catch(() => { /* keep optimistic state */ });
      },

      removeItem: (productId: string) => {
        const item = get().items.find(i => i.productId === productId);
        set({ items: get().items.filter(i => i.productId !== productId) });

        if (!isAuth() || !item?.cartItemId) return;
        cartApi.removeItem(item.cartItemId)
          .then(cart => set({ items: fromServerCart(cart) }))
          .catch(() => { /* local state already removed */ });
      },

      updateQty: (productId: string, qty: number) => {
        const item = get().items.find(i => i.productId === productId);

        if (qty <= 0) {
          set({ items: get().items.filter(i => i.productId !== productId) });
          if (isAuth() && item?.cartItemId) {
            cartApi.removeItem(item.cartItemId)
              .then(cart => set({ items: fromServerCart(cart) }))
              .catch(() => {});
          }
          return;
        }

        set({ items: get().items.map(i => i.productId === productId ? { ...i, qty } : i) });

        if (!isAuth() || !item?.cartItemId) return;
        cartApi.updateItem(item.cartItemId, qty)
          .then(cart => set({ items: fromServerCart(cart) }))
          .catch(() => { /* keep optimistic state */ });
      },

      clearCart: () => {
        set({ items: [] });
        if (!isAuth()) return;
        cartApi.clear().catch(() => {});
      },

      hydrateFromServer: (cart: CartDto) => {
        set({ items: fromServerCart(cart) });
      },

      syncWithServer: async () => {
        if (!isAuth()) return;
        try {
          const cart = await cartApi.get();
          set({ items: fromServerCart(cart) });
        } catch { /* keep local state */ }
      },

          get totalItems() { return get().items.reduce((sum, i) => sum + i.qty, 0); },
      get totalAmount() { return get().items.reduce((sum, i) => sum + i.price * i.qty, 0); },
    }),
    { name: 'cart-storage' }
  )
);
