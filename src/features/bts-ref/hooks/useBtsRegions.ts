import { useEffect, useState } from 'react'
import { btsRefService } from '../services/btsRefService'
import type { BtsRegion } from '../types'

export function useBtsRegions() {
  const [regions, setRegions] = useState<BtsRegion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchRegions = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await btsRefService.getRegions()
        if (!cancelled) setRegions(data ?? [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load regions')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchRegions()

    return () => {
      cancelled = true
    }
  }, [])

  return { regions, loading, error }
}
