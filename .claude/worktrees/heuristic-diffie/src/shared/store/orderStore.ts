import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrderData } from '../data/orders';

interface OrderStore {
  userOrders: OrderData[];
  addOrder: (order: OrderData) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      userOrders: [],
      addOrder: (order) => set({ userOrders: [order, ...get().userOrders] }),
    }),
    { name: 'order-storage' }
  )
);
