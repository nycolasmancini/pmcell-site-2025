import { useState, useEffect, useCallback } from 'react'

interface Product {
  id: string
  name: string
  price: number
  image?: string
  category_id: string
  [key: string]: any
}

interface UseProductsWithCacheReturn {
  products: Product[]
  loading: boolean
  error: string | null
  hasCache: boolean
  refresh: () => void
}

export function useProductsWithCache(
  categoryId?: string,
  searchTerm?: string
): UseProductsWithCacheReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasCache, setHasCache] = useState(false)

  const fetchProducts = useCallback(async () => {
    try {
      setError(null)
      
      const params = new URLSearchParams()
      if (categoryId) params.set('category', categoryId)
      if (searchTerm) params.set('search', searchTerm)
      
      const response = await fetch(`/api/products?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`)
      }
      
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
      setHasCache(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [categoryId, searchTerm])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    setLoading(true)
    setHasCache(false)
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    hasCache,
    refresh
  }
}