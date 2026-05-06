import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentlyViewedEntry {
  productId: number;
  viewedAt: number;
}

interface RecentlyViewedState {
  items: RecentlyViewedEntry[];
  track: (productId: number) => void;
  hydrateFromServer: (entries: RecentlyViewedEntry[]) => void;
  clear: () => void;
}

const MAX_ITEMS = 20;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      track: (productId: number) => {
        const now = Date.now();
        const filtered = get().items.filter((item) => item.productId !== productId);
        const next = [{ productId, viewedAt: now }, ...filtered].slice(0, MAX_ITEMS);
        set({ items: next });
      },

      hydrateFromServer: (entries: RecentlyViewedEntry[]) => {
        const sorted = [...entries].sort((a, b) => b.viewedAt - a.viewedAt).slice(0, MAX_ITEMS);
        set({ items: sorted });
      },

      clear: () => set({ items: [] }),
    }),
    { name: 'recently-viewed-storage' },
  ),
);
