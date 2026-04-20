import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Address } from '../types';

interface AddressState {
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefault: (id: string) => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [
        { id: 'addr-1', city: 'New York', district: 'Manhattan', street: '5th Avenue', house: '42B', isDefault: true },
      ],
      addAddress: (address) => {
        const newAddr = { ...address, id: 'addr-' + Date.now() };
        if (newAddr.isDefault) {
          set({ addresses: [...get().addresses.map((a) => ({ ...a, isDefault: false })), newAddr] });
        } else {
          set({ addresses: [...get().addresses, newAddr] });
        }
      },
      updateAddress: (id, data) => set({ addresses: get().addresses.map((a) => a.id === id ? { ...a, ...data } : a) }),
      deleteAddress: (id) => set({ addresses: get().addresses.filter((a) => a.id !== id) }),
      setDefault: (id) => set({ addresses: get().addresses.map((a) => ({ ...a, isDefault: a.id === id })) }),
    }),
    { name: 'address-storage' }
  )
);
