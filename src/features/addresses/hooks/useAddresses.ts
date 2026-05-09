import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { addressService } from '../services/addressService'
import type { Address, CreateAddressRequest, UpdateAddressRequest } from '../types'

export function useAddresses() {
  const { t } = useTranslation()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAddresses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await addressService.getAll()
      setAddresses(data ?? [])
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('addresses.loadFailed')
      setError(msg)
      toast.error(t('addresses.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const createAddress = useCallback(
    async (request: CreateAddressRequest): Promise<Address | null> => {
      try {
        const created = await addressService.create(request)
        await fetchAddresses()
        toast.success(t('addresses.created'))
        return created
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('addresses.saveFailed'))
        return null
      }
    },
    [fetchAddresses, t],
  )

  const updateAddress = useCallback(
    async (id: number, request: UpdateAddressRequest): Promise<Address | null> => {
      try {
        const updated = await addressService.update(id, request)
        await fetchAddresses()
        toast.success(t('addresses.updated'))
        return updated
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('addresses.saveFailed'))
        return null
      }
    },
    [fetchAddresses, t],
  )

  const deleteAddress = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await addressService.remove(id)
        await fetchAddresses()
        toast.success(t('addresses.deleted'))
        return true
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('addresses.saveFailed'))
        return false
      }
    },
    [fetchAddresses, t],
  )

  const setDefaultAddress = useCallback(
    async (id: number): Promise<Address | null> => {
      try {
        const updated = await addressService.setDefault(id)
        await fetchAddresses()
        toast.success(t('addresses.defaultSet'))
        return updated
      } catch (e) {
        toast.error(e instanceof Error ? e.message : t('addresses.saveFailed'))
        return null
      }
    },
    [fetchAddresses, t],
  )

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  }
}
