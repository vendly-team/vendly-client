import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  productIds: string[];
  serverIdMap: Record<string, number>; // productId → wishlist entry id
  toggle: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  hydrateFromServer: (items: { id: number; productId: number }[]) => void;
  addToStore: (productId: string, serverId?: number) => void;
  removeFromStore: (productId: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      serverIdMap: {},

      toggle: (productId: string) => {
        const ids = get().productIds;
        if (ids.includes(productId)) {
          const { [productId]: _, ...rest } = get().serverIdMap;
          set({ productIds: ids.filter((id) => id !== productId), serverIdMap: rest });
        } else {
          set({ productIds: [...ids, productId] });
        }
      },

      isWishlisted: (productId: string) => get().productIds.includes(productId),

      hydrateFromServer: (items) => {
        const productIds = items.map((item) => String(item.productId));
        const serverIdMap = Object.fromEntries(items.map((item) => [String(item.productId), item.id]));
        set({ productIds, serverIdMap });
      },

      addToStore: (productId, serverId) => {
        if (get().productIds.includes(productId)) return;
        set((s) => ({
          productIds: [...s.productIds, productId],
          serverIdMap: serverId != null ? { ...s.serverIdMap, [productId]: serverId } : s.serverIdMap,
        }));
      },

      removeFromStore: (productId) => {
        const { [productId]: _, ...rest } = get().serverIdMap;
        set((s) => ({
          productIds: s.productIds.filter((id) => id !== productId),
          serverIdMap: rest,
        }));
      },
    }),
    { name: 'wishlist-storage' }
  )
);
