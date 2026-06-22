import { create } from 'zustand'

type CheckoutSelectionState = {
  selectedAddressId: number | null
  draftOrderId: number | null
  setSelectedAddressId: (id: number | null) => void
  setDraftOrderId: (id: number | null) => void
  reset: () => void
}

export const useCheckoutSelectionStore = create<CheckoutSelectionState>((set) => ({
  selectedAddressId: null,
  draftOrderId: null,
  setSelectedAddressId: (id) => set({ selectedAddressId: id }),
  setDraftOrderId: (id) => set({ draftOrderId: id }),
  reset: () => set({ selectedAddressId: null, draftOrderId: null }),
}))
