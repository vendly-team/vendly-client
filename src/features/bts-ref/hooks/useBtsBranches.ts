import { useEffect, useState } from 'react'
import { btsRefService } from '../services/btsRefService'
import type { BtsBranch } from '../types'

/**
 * Loads the BTS branches of a whole region (the selected city's region), so the
 * map and dropdown can offer every branch across that region.
 */
export function useBtsBranches(regionCode: string | null | undefined) {
  const [branches, setBranches] = useState<BtsBranch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!regionCode) {
      setBranches([])
      setError(null)
      return
    }

    let cancelled = false

    const fetchBranches = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await btsRefService.getBranchesByRegion(regionCode)
        // Defensive filter: some backends ignore the query and return every
        // branch, so keep only the ones that belong to the selected region.
        const filtered = (data ?? []).filter((b) => b.regionCode === regionCode)
        if (!cancelled) setBranches(filtered)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load branches')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchBranches()

    return () => {
      cancelled = true
    }
  }, [regionCode])

  return { branches, loading, error }
}
