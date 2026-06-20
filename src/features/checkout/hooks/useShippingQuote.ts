import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '@/shared/api/http'
import { shippingService } from '../services/shipping.service'
import type { ShippingQuote } from '../types'

/**
 * Fetches the BTS delivery cost for the current cart and the given address.
 * Re-runs whenever the address changes; the cart weight is computed server-side.
 */
export function useShippingQuote(addressId: number | null | undefined) {
  const { t } = useTranslation()
  const [quote, setQuote] = useState<ShippingQuote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!addressId) {
      setQuote(null)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const run = async () => {
      try {
        const result = await shippingService.quoteForAddress(addressId)
        if (!cancelled) setQuote(result)
      } catch (e) {
        if (cancelled) return
        setQuote(null)
        const code = e instanceof ApiError ? e.code : null
        const byCode: Record<string, string> = {
          'Shipping.RouteUnavailable': t('checkout.errors.routeUnavailable'),
          'Shipping.WeightMissing': t('checkout.errors.weightMissing'),
          'Shipping.CalculateFailed': t('checkout.errors.deliveryCalcFailed'),
        }
        setError((code && byCode[code]) ?? (e instanceof Error ? e.message : t('common.error')))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [addressId, t])

  return { quote, loading, error }
}
