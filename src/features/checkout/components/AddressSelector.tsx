import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useAddresses, AddressForm } from '@/features/addresses'
import type { Address, CreateAddressRequest } from '@/features/addresses'
import { useCheckoutSelectionStore } from '@/shared/store/checkoutSelectionStore'

export type AddressSelectorProps = {
  onContinue: () => void
}

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'edit'; address: Address }

export function AddressSelector({ onContinue }: AddressSelectorProps) {
  const { t } = useTranslation()
  const { addresses, loading, createAddress, updateAddress, deleteAddress } = useAddresses()
  const { selectedAddressId, setSelectedAddressId } = useCheckoutSelectionStore()
  const [mode, setMode] = useState<Mode>({ kind: 'list' })
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Address | null>(null)

  // Auto-select default address when list loads
  useEffect(() => {
    if (loading || selectedAddressId !== null) return
    if (addresses.length === 0) return

    const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0]
    if (defaultAddr) setSelectedAddressId(defaultAddr.id)
  }, [addresses, loading, selectedAddressId, setSelectedAddressId])

  // If selected address was deleted, clear selection
  useEffect(() => {
    if (selectedAddressId === null) return
    if (!loading && !addresses.some((a) => a.id === selectedAddressId)) {
      setSelectedAddressId(null)
    }
  }, [addresses, loading, selectedAddressId, setSelectedAddressId])

  const showForm = mode.kind !== 'list' || (!loading && addresses.length === 0)

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

  if (loading && addresses.length === 0) {
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
      {!showForm && addresses.length > 0 && (
        <>
          <h3 className="text-[15px] font-semibold tracking-[-0.011em] text-foreground">
            {t('checkout.savedAddresses')}
          </h3>

          <RadioGroup
            value={selectedAddressId !== null ? String(selectedAddressId) : ''}
            onValueChange={(v) => setSelectedAddressId(Number(v))}
            className="space-y-2"
          >
            {addresses.map((a: Address) => (
              <div
                key={a.id}
                className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                  selectedAddressId === a.id ? 'border-accent bg-accent/5' : 'border-border'
                }`}
              >
                <Label
                  htmlFor={`addr-${a.id}`}
                  className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                >
                  <RadioGroupItem id={`addr-${a.id}`} value={String(a.id)} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-semibold tracking-[-0.011em]">
                        {a.label}
                      </span>
                      {a.isDefault && (
                        <span className="text-[10px] font-semibold tracking-[-0.005em] uppercase bg-success/10 text-success px-1.5 py-0.5 rounded">
                          {t('common.default')}
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground break-words">
                      {a.city}, {a.district}
                    </p>
                    <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground break-words">
                      {a.street}, {a.house}
                    </p>
                    {a.extra && (
                      <p className="text-[12px] font-normal tracking-[-0.003em] text-muted-foreground mt-1 break-words">
                        {a.extra}
                      </p>
                    )}
                  </div>
                </Label>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setMode({ kind: 'edit', address: a })
                    }}
                    aria-label={t('common.edit')}
                    className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setConfirmDelete(a)
                    }}
                    aria-label={t('common.delete')}
                    className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </RadioGroup>

          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto h-11"
            onClick={() => setMode({ kind: 'create' })}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('checkout.newAddress')}
          </Button>

          <Button
            type="button"
            className="w-full h-11"
            disabled={selectedAddressId === null}
            onClick={handleContinueWithSelected}
          >
            {t('common.continue')}
          </Button>
        </>
      )}

      {showForm && (
        <>
          {addresses.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMode({ kind: 'list' })}
              className="text-[13px]"
            >
              ← {t('common.back')}
            </Button>
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

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[18px] font-semibold tracking-[-0.016em] leading-[1.2] font-display mb-2">
              {t('addresses.deleteConfirm')}
            </h3>
            <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground mb-1">
              {confirmDelete.label}
            </p>
            <p className="text-[13px] font-normal tracking-[-0.006em] text-muted-foreground mb-4 break-words">
              {confirmDelete.city}, {confirmDelete.district}, {confirmDelete.street},{' '}
              {confirmDelete.house}
            </p>
            <p className="text-[14px] font-normal tracking-[-0.006em] text-muted-foreground mb-4">
              {t('addresses.deleteWarning')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 h-10 border border-border rounded-md text-[14px] font-medium tracking-[-0.011em]"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 h-10 bg-destructive text-destructive-foreground rounded-md text-[14px] font-semibold tracking-[-0.011em]"
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
