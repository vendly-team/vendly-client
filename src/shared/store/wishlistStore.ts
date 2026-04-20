import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  productIds: string[];
  toggle: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId: string) => {
        const ids = get().productIds;
        set({ productIds: ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId] });
      },
      isWishlisted: (productId: string) => get().productIds.includes(productId),
    }),
    { name: 'wishlist-storage' }
  )
);
