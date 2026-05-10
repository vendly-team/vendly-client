import { useState } from 'react'
import { productService } from '../services/productService'
import type { ProductListResponse } from '../types'

export function useProducts() {
  const [products, setProducts] = useState<ProductListResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await productService.getAllAdmin()
      setProducts(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  return { products, loading, error, fetchProducts }
}
