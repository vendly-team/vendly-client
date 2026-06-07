import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService } from '@/features/cart';
import { useAuthStore } from './authStore';
import type { BackendCart } from '@/features/cart';
import type { Product, CartItem } from '../types';

interface CartState {
  items: CartItem[];
  loading: boolean;
  loaded: boolean;
  isLocked: boolean;
  addItem: (product: Product, qty?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQty: (productId: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  /** Pulls authoritative state from the server and replaces local items. */
  hydrateFromServer: () => Promise<void>;
  /** Pushes guest local items to backend (additively), then hydrates from server. */
  mergeIntoServer: () => Promise<void>;
  /** Replaces local state with empty (used on logout without backend call). */
  resetLocal: () => void;
}

const PLACEHOLDER_CART_ITEM_ID = 0;

const isAuthenticated = () => useAuthStore.getState().isAuthenticated;

const mapBackendToCartItems = (cart: BackendCart): { items: CartItem[]; isLocked: boolean } => ({
  isLocked: cart.isLocked,
  items: cart.items.map((item) => ({
    cartItemId: item.id,
    productVariantId: item.productVariantId,
    productId: `${item.productId}:${item.productVariantId}`,
    name: item.productName,
    image: item.images?.[0] ?? '',
    price: item.price,
    qty: item.qty,
    sku: `SKU-${item.productVariantId}`,
    stock: item.stock,
  })),
});

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      loaded: false,
      isLocked: false,

      addItem: async (product: Product, qty = 1) => {
        const variantId = product.variantId;
        const compositeId = variantId ? `${product.id}:${variantId}` : product.id;

        // Optimistic local update first — UI updates immediately, then backend sync.
        const items = get().items;
        const existing = items.find((i) => i.productId === compositeId);
        const optimistic: CartItem[] = existing
          ? items.map((i) => (i.productId === compositeId ? { ...i, qty: i.qty + qty } : i))
          : [
              ...items,
              {
                cartItemId: existing?.cartItemId ?? PLACEHOLDER_CART_ITEM_ID,
                productVariantId: variantId ?? 0,
                productId: compositeId,
                name: product.name,
                image: product.images[0] || '',
                price: product.salePrice ?? product.price,
                qty,
                sku: product.sku,
                stock: product.stock,
              },
            ];
        set({ items: optimistic });

        // Anonymous users persist only locally.
        if (!isAuthenticated() || !variantId) return;

        try {
          const cart = await cartService.addItem({ productVariantId: variantId, qty });
          set({ ...mapBackendToCartItems(cart), loaded: true });
        } catch (e) {
          // Roll back the optimistic update on failure.
          set({ items });
          throw e;
        }
      },

      removeItem: async (productId: string) => {
        const item = get().items.find((i) => i.productId === productId);
        const snapshot = get().items;
        set({ items: snapshot.filter((i) => i.productId !== productId) });

        if (!isAuthenticated() || !item || item.cartItemId === PLACEHOLDER_CART_ITEM_ID) return;

        try {
          const cart = await cartService.removeItem(item.cartItemId);
          set({ ...mapBackendToCartItems(cart), loaded: true });
        } catch (e) {
          set({ items: snapshot });
          throw e;
        }
      },

      updateQty: async (productId: string, qty: number) => {
        const snapshot = get().items;
        const item = snapshot.find((i) => i.productId === productId);

        // Local optimistic update.
        const optimistic =
          qty <= 0
            ? snapshot.filter((i) => i.productId !== productId)
            : snapshot.map((i) => (i.productId === productId ? { ...i, qty } : i));
        set({ items: optimistic });

        if (!isAuthenticated() || !item || item.cartItemId === PLACEHOLDER_CART_ITEM_ID) return;

        try {
          const cart =
            qty <= 0
              ? await cartService.removeItem(item.cartItemId)
              : await cartService.updateItem(item.cartItemId, { qty });
          set({ ...mapBackendToCartItems(cart), loaded: true });
        } catch (e) {
          set({ items: snapshot });
          throw e;
        }
      },

      clearCart: async () => {
        const snapshot = get().items;
        set({ items: [] });

        if (!isAuthenticated()) return;

        try {
          await cartService.clear();
          set({ loaded: true });
        } catch (e) {
          set({ items: snapshot });
          throw e;
        }
      },

      hydrateFromServer: async () => {
        if (!isAuthenticated()) return;
        set({ loading: true });
        try {
          const cart = await cartService.getOrCreate();
          set({ ...mapBackendToCartItems(cart), loaded: true });
        } finally {
          set({ loading: false });
        }
      },

      mergeIntoServer: async () => {
        if (!isAuthenticated()) return;
        const guestItems = get().items.filter(
          (i) => i.cartItemId === PLACEHOLDER_CART_ITEM_ID && i.productVariantId > 0,
        );

        for (const item of guestItems) {
          try {
            await cartService.addItem({ productVariantId: item.productVariantId, qty: item.qty });
          } catch {
            // Skip items the backend rejects (e.g. out of stock) — final hydrate will reflect truth.
          }
        }

        try {
          const cart = await cartService.getOrCreate();
          set({ ...mapBackendToCartItems(cart), loaded: true });
        } catch {
          // Keep current state if hydration fails.
        }
      },

      resetLocal: () => set({ items: [], loaded: false, isLocked: false }),
    }),
    {
      name: 'cart-storage',
      version: 2,
      // Only persist items array (not loading/loaded flags).
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState: unknown, version) => {
        // v1 cart items lacked cartItemId/productVariantId/stock — wipe them so backend sync starts clean.
        if (version < 2) {
          return { items: [] };
        }
        return persistedState as { items: CartItem[] };
      },
    },
  ),
);
