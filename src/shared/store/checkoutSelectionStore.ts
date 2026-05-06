import { create } from 'zustand'

type CheckoutSelectionState = {
  selectedAddressId: number | null
  setSelectedAddressId: (id: number | null) => void
  reset: () => void
}

export const useCheckoutSelectionStore = create<CheckoutSelectionState>((set) => ({
  selectedAddressId: null,
  setSelectedAddressId: (id) => set({ selectedAddressId: id }),
  reset: () => set({ selectedAddressId: null }),
}))
