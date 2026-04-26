import { useState, useCallback } from 'react'
import { productService } from '../services/productService'
import type { ProductAdminDetailResponse } from '../types'

export function useProduct(id: number) {
  const [product, setProduct] = useState<ProductAdminDetailResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProduct = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await productService.getById(id)
      setProduct(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }, [id])

  return { product, loading, error, fetchProduct }
}
