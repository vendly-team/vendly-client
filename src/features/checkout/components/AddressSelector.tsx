import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
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

export function AddressSelector({ onContinue }: AddressSelectorProps) {
  const { t } = useTranslation()
  const { addresses, loading, createAddress } = useAddresses()
  const { selectedAddressId, setSelectedAddressId } = useCheckoutSelectionStore()
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Auto-select default address when list loads
  useEffect(() => {
    if (loading || selectedAddressId !== null) return
    if (addresses.length === 0) return

    const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0]
    if (defaultAddr) setSelectedAddressId(defaultAddr.id)
  }, [addresses, loading, selectedAddressId, setSelectedAddressId])

  const showForm = isAddingNew || (!loading && addresses.length === 0)

  const handleCreate = async (request: CreateAddressRequest) => {
    setSubmitting(true)
    const created = await createAddress(request)
    setSubmitting(false)
    if (created) {
      setSelectedAddressId(created.id)
      setIsAddingNew(false)
      onContinue()
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
              <Label
                key={a.id}
                htmlFor={`addr-${a.id}`}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAddressId === a.id ? 'border-accent bg-accent/5' : 'border-border'
                }`}
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
            ))}
          </RadioGroup>

          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto h-11"
            onClick={() => setIsAddingNew(true)}
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
              onClick={() => setIsAddingNew(false)}
              className="text-[13px]"
            >
              ← {t('common.back')}
            </Button>
          )}
          <AddressForm
            onSubmit={handleCreate}
            loading={submitting}
            submitLabel={t('common.continue')}
          />
        </>
      )}
    </div>
  )
}
