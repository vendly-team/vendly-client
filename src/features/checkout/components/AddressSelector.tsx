import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, SquarePen, Trash2, Store, Truck, ArrowLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAddresses, AddressForm } from '@/features/addresses'
import type { Address, CreateAddressRequest } from '@/features/addresses'
import { useCheckoutSelectionStore } from '@/shared/store/checkoutSelectionStore'
import { MapAddressPicker } from './MapAddressPicker'

export type AddressSelectorProps = {
  onContinue: () => void
  loading?: boolean
}

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; address: Address }

export function AddressSelector({ onContinue, loading = false }: AddressSelectorProps) {
  const { t } = useTranslation()
  const { addresses, loading: addressesLoading, createAddress, updateAddress, deleteAddress } = useAddresses()
  const { selectedAddressId, setSelectedAddressId } = useCheckoutSelectionStore()
  const [mode, setMode] = useState<Mode>({ kind: 'list' })
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Address | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'courier'>(() => {
    const saved = localStorage.getItem('checkout_delivery_method')
    // "courier" (Uyga yetkazib berish) is currently disabled — Coming soon.
    return saved === 'courier' ? 'pickup' : (saved as 'pickup' | 'courier') || 'pickup'
  })

  // Persist delivery method to localStorage
  useEffect(() => {
    localStorage.setItem('checkout_delivery_method', deliveryMethod)
  }, [deliveryMethod])

  // Auto-select default address when list loads
  useEffect(() => {
    if (addressesLoading || selectedAddressId !== null) return
    if (addresses.length === 0) return

    const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0]
    if (defaultAddr) setSelectedAddressId(defaultAddr.id)
  }, [addresses, addressesLoading, selectedAddressId, setSelectedAddressId])

  // If selected address was deleted, clear selection
  useEffect(() => {
    if (selectedAddressId === null) return
    if (!addressesLoading && !addresses.some((a) => a.id === selectedAddressId)) {
      setSelectedAddressId(null)
    }
  }, [addresses, addressesLoading, selectedAddressId, setSelectedAddressId])

  const showForm = mode.kind !== 'list' || (!addressesLoading && addresses.length === 0)

  const handleCreate = async (request: CreateAddressRequest) => {
    setSubmitting(true)
    const created = await createAddress(request)
    setSubmitting(false)
    if (created) {
      setSelectedAddressId(created.id)
      setMode({ kind: 'list' })
      onContinue()
    }
  }

  const handleUpdate = async (request: CreateAddressRequest) => {
    if (mode.kind !== 'edit') return
    setSubmitting(true)
    const updated = await updateAddress(mode.address.id, request)
    setSubmitting(false)
    if (updated) {
      setSelectedAddressId(updated.id)
      setMode({ kind: 'list' })
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    const ok = await deleteAddress(confirmDelete.id)
    setConfirmDelete(null)
    if (ok && selectedAddressId === confirmDelete.id) {
      setSelectedAddressId(null)
    }
  }

  const handleContinueWithSelected = () => {
    if (selectedAddressId !== null) onContinue()
  }

  if (addressesLoading && addresses.length === 0) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Delivery method selection — horizontal pills on mobile, 2-col on desktop */}
      <div className="border-b border-border pb-5">
        <h3 className="text-[15px] font-semibold tracking-[-0.011em] text-foreground mb-3">
          {t('checkout.deliveryMethod', { defaultValue: 'Delivery Method' })}
        </h3>
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2.5">
          {/* Pickup Point */}
          <button
            type="button"
            onClick={() => setDeliveryMethod('pickup')}
            className={`flex items-center gap-3 p-3.5 border-2 rounded-xl transition-all min-h-[52px] ${
              deliveryMethod === 'pickup'
                ? 'border-accent bg-accent/5'
                : 'border-border bg-card active:bg-muted/50'
            }`}
          >
            <Store size={20} className={deliveryMethod === 'pickup' ? 'text-accent' : 'text-muted-foreground'} />
            <span className="text-[14px] font-semibold tracking-[-0.006em] text-foreground">
              {t('checkout.pickupPoint', { defaultValue: 'Topshirish punkti' })}
            </span>
          </button>

          {/* Home Delivery — Coming soon */}
          <div
            className={`relative flex items-center gap-3 p-3.5 border-2 rounded-xl transition-all opacity-60 cursor-not-allowed min-h-[52px] ${
              deliveryMethod === 'courier'
                ? 'border-accent bg-accent/5'
                : 'border-border bg-card'
            }`}
            aria-disabled="true"
          >
            <Truck size={20} className={deliveryMethod === 'courier' ? 'text-accent' : 'text-muted-foreground'} />
            <span className="text-[14px] font-semibold tracking-[-0.006em] text-foreground">
              {t('checkout.courier', { defaultValue: 'Uyga yetkazib berish' })}
            </span>
            <span className="absolute top-1.5 right-2 text-[9px] font-bold tracking-[-0.005em] uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
              {t('checkout.comingSoon', { defaultValue: 'Tez orada' })}
            </span>
          </div>
        </div>
      </div>

      {/* Home Delivery - Map Picker */}
      {deliveryMethod === 'courier' && (
        <MapAddressPicker onAddressSelected={createAddress} />
      )}

      {/* Pickup Point - Branch Selector */}
      {deliveryMethod === 'pickup' && !showForm && addresses.length > 0 && (
        <>
          <h3 className="text-[15px] font-semibold tracking-[-0.011em] text-foreground">
            {t('checkout.savedAddresses')}
          </h3>

          <div className="space-y-2.5">
            {addresses.map((a: Address) => (
              <div
                key={a.id}
                onClick={() => setSelectedAddressId(a.id)}
                className={`flex items-center gap-3 p-3.5 border rounded-xl transition-colors cursor-pointer ${
                  selectedAddressId === a.id ? 'border-accent bg-accent/5' : 'border-border bg-card active:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Selection indicator — check mark instead of radio dot */}
                  <div className={`h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    selectedAddressId === a.id ? 'border-accent bg-accent' : 'border-border'
                  }`}>
                    {selectedAddressId === a.id && <Check size={12} className="text-accent-foreground" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-semibold tracking-[-0.011em] truncate">
                        {a.label}
                      </span>
                      {a.isDefault && (
                        <span className="text-[9px] font-bold tracking-[-0.005em] uppercase bg-success/10 text-success px-1.5 py-0.5 rounded">
                          {t('common.default')}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] font-normal tracking-[-0.006em] text-muted-foreground break-words mt-0.5">
                      {a.city}, {a.district}
                    </p>
                    <p className="text-[13px] font-normal tracking-[-0.006em] text-muted-foreground break-words">
                      {a.street}, {a.house}
                    </p>
                    {a.extra && (
                      <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground mt-1 break-words">
                        {a.extra}
                      </p>
                    )}
                  </div>
                </div>

                {/* Edit / Delete — larger touch targets */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setMode({ kind: 'edit', address: a })
                    }}
                    aria-label={t('common.edit')}
                    className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <SquarePen size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setConfirmDelete(a)
                    }}
                    aria-label={t('common.delete')}
                    className="p-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add new address — dashed outline button */}
          <button
            type="button"
            onClick={() => setMode({ kind: 'create' })}
            className="flex items-center justify-center gap-2 w-full h-[52px] border-2 border-dashed border-border rounded-xl text-[14px] font-semibold tracking-[-0.006em] text-muted-foreground hover:text-foreground hover:border-accent/50 hover:bg-accent/5 transition-colors"
          >
            <Plus size={18} />
            {t('checkout.newAddress')}
          </button>

          {/* Continue — sticky on mobile */}
          <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+72px)] md:bottom-4 z-30">
            <Button
              type="button"
              className="w-full h-[52px] shadow-lg shadow-accent/20 text-[15px]"
              disabled={selectedAddressId === null || loading}
              onClick={handleContinueWithSelected}
            >
              {loading ? t('common.loading') : t('common.continue')}
            </Button>
          </div>
        </>
      )}

      {showForm && (
        <>
          {/* Back button — mobile-friendly with bigger touch area */}
          {addresses.length > 0 && (
            <button
              type="button"
              onClick={() => setMode({ kind: 'list' })}
              className="flex items-center gap-1 text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
              {t('common.back')}
            </button>
          )}
          {mode.kind === 'edit' ? (
            <AddressForm
              key={`edit-${mode.address.id}`}
              initialAddress={mode.address}
              onSubmit={handleUpdate}
              loading={submitting}
              submitLabel={t('common.save')}
            />
          ) : (
            <AddressForm
              key="create"
              onSubmit={handleCreate}
              loading={submitting}
              submitLabel={t('common.continue')}
            />
          )}
        </>
      )}

      {/* Confirm delete — bottom sheet on mobile, centered modal on desktop */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-foreground/50 flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-card border border-border w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:pb-6 px-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle — mobile only */}
            <div className="sm:hidden mx-auto w-10 h-1 rounded-full bg-muted mb-4" />
            <h3 className="text-[17px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-3">
              {t('addresses.deleteConfirm')}
            </h3>
            <div className="bg-muted/40 rounded-lg p-3 mb-3">
              <p className="text-[14px] font-semibold tracking-[-0.006em] text-foreground mb-1">
                {confirmDelete.label}
              </p>
              <p className="text-[13px] font-normal tracking-[-0.006em] text-muted-foreground break-words">
                {confirmDelete.city}, {confirmDelete.district}, {confirmDelete.street},{' '}
                {confirmDelete.house}
              </p>
            </div>
            <p className="text-[13px] font-normal tracking-[-0.006em] text-muted-foreground mb-5">
              {t('addresses.deleteWarning')}
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 h-[48px] border border-border rounded-xl text-[14px] font-medium tracking-[-0.011em] hover:bg-muted transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 h-[48px] bg-destructive text-destructive-foreground rounded-xl text-[14px] font-semibold tracking-[-0.011em] hover:bg-destructive/90 transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
