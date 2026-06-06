import { API_BASE_URL } from '@/shared/api/http';
import { createCategorySlug } from '@/shared/api/categoriesApi';
import type { Product } from '@/shared/types';
import type { ProductAdminDetailResponse, ProductCardResponse, ProductVariantResponse } from '../types';

export const resolveProductMediaUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^(blob:|data:|https?:\/\/)/i.test(url)) return url;
  return `${API_BASE_URL}/${url.replace(/^\/+/, '')}`;
};

export const createProductSlug = (name: string, id: number | string) => {
  const base = createCategorySlug(name) || 'product';
  return `${base}-${id}`;
};

export const getProductIdFromSlug = (slug?: string) => {
  if (!slug) return null;
  const match = slug.match(/-(\d+)$/);
  return match ? Number(match[1]) : null;
};

export const getDisplayVariants = (product: ProductAdminDetailResponse) => {
  const active = product.variants.filter(variant => variant.isActive);
  return active.length > 0 ? active : product.variants;
};

export const getVariantImages = (variants: ProductVariantResponse[]) => {
  const images = variants
    .flatMap(variant => variant.images)
    .map(resolveProductMediaUrl)
    .filter(Boolean);
  return Array.from(new Set(images));
};

export const getVariantPrice = (variants: ProductVariantResponse[]) => {
  const priced = variants.map(variant => variant.price).filter(price => price > 0);
  return priced.length > 0 ? Math.min(...priced) : 0;
};

export const mapProductDetailToStorefrontProduct = (
  product: ProductAdminDetailResponse,
  preferredVariant?: ProductVariantResponse | null,
): Product => {
  const variants = getDisplayVariants(product);
  const variant = preferredVariant ?? variants[0] ?? product.variants[0];
  const images = getVariantImages(variant ? [variant, ...variants.filter(item => item.id !== variant.id)] : variants);
  const price = variant?.price && variant.price > 0 ? variant.price : getVariantPrice(variants);
  const stock = variant ? variant.quantity : variants.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: String(product.id),
    variantId: variant?.id,
    sku: variant ? `SKU-${variant.id}` : `PRODUCT-${product.id}`,
    name: product.name,
    slug: createProductSlug(product.name, product.id),
    categoryId: String(product.categoryId),
    description: product.description ?? '',
    images,
    price,
    stock,
    rating: 0,
    reviewCount: 0,
    specifications: product.variantTypes.map(type => ({
      key: type.name,
      value: type.options.map(option => option.name).join(', '),
    })),
    syncSource: product.syncSource === 0 ? 'manual' : 'external',
    isActive: product.isActive,
    createdAt: product.createdAt,
  };
};

export const mapProductCardToStorefrontProduct = (product: ProductCardResponse): Product => ({
  id: String(product.id),
  variantId: product.firstVariantId ?? undefined,
  sku: `PRODUCT-${product.id}`,
  name: product.name,
  slug: createProductSlug(product.name, product.id),
  categoryId: String(product.categoryId),
  description: product.description ?? '',
  images: product.firstImage ? [resolveProductMediaUrl(product.firstImage)] : [],
  price: product.minPrice ?? 0,
  stock: product.totalQuantity,
  rating: 0,
  reviewCount: 0,
  specifications: [],
  syncSource: 'external',
  isActive: true,
  createdAt: new Date().toISOString(),
});
