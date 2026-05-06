import { apiRequest } from '@/shared/api/http'
import type {
  ProductListResponse,
  ProductAdminDetailResponse,
  ProductSearchResponse,
  CreateProductRequest,
  UpdateProductRequest,
  CreateVariantTypeRequest,
  CreateVariantOptionRequest,
  UpdateVariantRequest,
  BulkUpdateVariantsRequest,
} from '../types'

export const productService = {
  getAll: () => apiRequest<ProductListResponse[]>('/api/products'),

  getById: (id: number) =>
    apiRequest<ProductAdminDetailResponse>(`/api/products/${id}`),

  search: (query: string, signal?: AbortSignal) =>
    apiRequest<ProductSearchResponse[]>(
      `/api/products/search?q=${encodeURIComponent(query)}`,
      { signal },
    ),

  create: (data: CreateProductRequest) =>
    apiRequest<number>('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateProductRequest) =>
    apiRequest<void>(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest<void>(`/api/products/${id}`, { method: 'DELETE' }),

  toggleActive: (id: number) =>
    apiRequest<void>(`/api/products/${id}/toggle`, { method: 'PATCH' }),

  addVariantType: (productId: number, data: CreateVariantTypeRequest) =>
    apiRequest<void>(`/api/products/${productId}/variant-types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  deleteVariantType: (typeId: number) =>
    apiRequest<void>(`/api/products/variant-types/${typeId}`, { method: 'DELETE' }),

  addVariantOption: (typeId: number, data: CreateVariantOptionRequest) => {
    const form = new FormData()
    form.append('name', data.name)
    if (data.image) form.append('image', data.image)
    if (data.displayOrder != null) form.append('displayOrder', String(data.displayOrder))
    return apiRequest<void>(`/api/products/variant-types/${typeId}/options`, {
      method: 'POST',
      body: form,
    })
  },

  deleteVariantOption: (optionId: number) =>
    apiRequest<void>(`/api/products/variant-options/${optionId}`, { method: 'DELETE' }),

  regenerateVariants: (productId: number) =>
    apiRequest<void>(`/api/products/${productId}/regenerate-variants`, { method: 'POST' }),

  updateVariant: (variantId: number, data: UpdateVariantRequest) => {
    const form = new FormData()
    if (data.name != null) form.append('name', data.name)
    form.append('price', String(data.price))
    form.append('quantity', String(data.quantity))
    form.append('isActive', String(data.isActive))
    if (data.image) form.append('image', data.image)
    return apiRequest<void>(`/api/products/variants/${variantId}`, {
      method: 'PUT',
      body: form,
    })
  },

  bulkUpdateVariants: (productId: number, data: BulkUpdateVariantsRequest) => {
    const form = new FormData()
    data.variants.forEach((item, i) => {
      form.append(`Variants[${i}].Id`, String(item.id))
      if (item.name != null) form.append(`Variants[${i}].Name`, item.name)
      form.append(`Variants[${i}].Price`, String(item.price))
      form.append(`Variants[${i}].Quantity`, String(item.quantity))
      form.append(`Variants[${i}].IsActive`, String(item.isActive))
      if (item.image) form.append(`Variants[${i}].Image`, item.image)
    })
    return apiRequest<void>(`/api/products/${productId}/variants/bulk`, {
      method: 'PUT',
      body: form,
    })
  },

  deleteVariant: (variantId: number) =>
    apiRequest<void>(`/api/products/variants/${variantId}`, { method: 'DELETE' }),
}
