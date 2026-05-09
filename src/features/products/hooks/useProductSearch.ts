import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { productService } from '../services/productService'
import type { ProductSearchResponse } from '../types'
import { PRODUCT_SEARCH_MIN_LENGTH } from '../types'

export type ProductSearchState = {
  results: ProductSearchResponse[]
  loading: boolean
  error: string | null
  /** True when the latest non-empty query is below the minimum length. */
  tooShort: boolean
}

/**
 * Debounced product search.
 *
 * - Returns an empty results list while the trimmed query is shorter than
 *   `PRODUCT_SEARCH_MIN_LENGTH` (matches backend behaviour).
 * - Cancels in-flight requests when the query changes.
 */
export function useProductSearch(query: string, debounceMs = 300): ProductSearchState {
  const debouncedQuery = useDebounce(query.trim(), debounceMs)

  const [results, setResults] = useState<ProductSearchResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tooShort =
    debouncedQuery.length > 0 && debouncedQuery.length < PRODUCT_SEARCH_MIN_LENGTH

  useEffect(() => {
    if (debouncedQuery.length < PRODUCT_SEARCH_MIN_LENGTH) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await productService.search(debouncedQuery, controller.signal)
        if (!cancelled) setResults(data ?? [])
      } catch (e) {
        if (cancelled || controller.signal.aborted) return
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : 'Failed to search')
        setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [debouncedQuery])

  return { results, loading, error, tooShort }
}
