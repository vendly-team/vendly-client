export type SyncSource = 0 | 1 // 0 = Manual, 1 = External

export type ProductSearchResponse = {
  id: number
  name: string
  price: number
  skuCount: number
  images: string[]
  isAvailableForSale: boolean
  redirectUrl: string
}

export const PRODUCT_SEARCH_MIN_LENGTH = 2

// Public storefront card — backend already filters isActive=true, includes images & stock
export type ProductCardResponse = {
  id: number
  name: string
  categoryId: number
  categoryName: string
  description: string | null
  minPrice: number | null
  totalQuantity: number
  variantCount: number
  firstImage: string | null
  defaultVariantId: number | null
  firstVariantId: number | null
}

export type ProductCardsPage = {
  items: ProductCardResponse[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type ProductListResponse = {
  id: number
  categoryId: number
  categoryName: string
  name: string
  description: string | null
  syncSource: SyncSource
  isActive: boolean
  variantCount: number
  createdAt: string
  updatedAt: string | null
}

export type VariantOptionResponse = {
  id: number
  variantTypeId: number
  name: string
  imageUrl: string | null
  displayOrder: number | null
}

export type VariantTypeResponse = {
  id: number
  productId: number
  name: string
  displayOrder: number | null
  options: VariantOptionResponse[]
}

export type VariantCombinationItem = {
  optionId: number
  optionName: string
  variantTypeName: string
}

export type ProductVariantResponse = {
  id: number
  productId: number
  name: string | null
  price: number
  quantity: number
  isActive: boolean
  images: string[]
  combination: VariantCombinationItem[]
}

export type ProductAdminDetailResponse = {
  id: number
  categoryId: number
  categoryName: string
  name: string
  description: string | null
  syncSource: SyncSource
  isActive: boolean
  variantTypes: VariantTypeResponse[]
  variants: ProductVariantResponse[]
  createdAt: string
  updatedAt: string | null
}

export type CreateProductRequest = {
  categoryId: number
  name: string
  description?: string
  syncSource?: SyncSource
}

export type UpdateProductRequest = {
  categoryId: number
  name: string
  description: string | null
  isActive: boolean
  syncSource: SyncSource
}

export type CreateVariantTypeRequest = {
  name: string
  displayOrder?: number
}

export type CreateVariantOptionRequest = {
  name: string
  image?: File
  displayOrder?: number
}

export type UpdateVariantRequest = {
  name?: string
  price: number
  quantity: number
  isActive: boolean
  image?: File
}

export type BulkUpdateVariantItem = {
  id: number
  name?: string | null
  price: number
  quantity: number
  isActive: boolean
  image?: File | null
}

export type BulkUpdateVariantsRequest = {
  variants: BulkUpdateVariantItem[]
}
