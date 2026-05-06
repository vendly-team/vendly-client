import { useEffect, useState } from 'react'
import { btsRefService } from '../services/btsRefService'
import type { BtsCity } from '../types'

export function useBtsCities(regionCode: string | null | undefined) {
  const [cities, setCities] = useState<BtsCity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!regionCode) {
      setCities([])
      setError(null)
      return
    }

    let cancelled = false

    const fetchCities = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await btsRefService.getCitiesByRegion(regionCode)
        if (!cancelled) setCities(data ?? [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load cities')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchCities()

    return () => {
      cancelled = true
    }
  }, [regionCode])

  return { cities, loading, error }
}
