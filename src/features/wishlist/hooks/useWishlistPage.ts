import { useEffect, useState } from 'react';
import { useAuthStore } from '@/shared/store/authStore';
import { useWishlistStore } from '@/shared/store/wishlistStore';
import { wishlistService } from '../services/wishlistService';
import { productService } from '@/features/products/services/productService';
import {
  mapProductDetailToStorefrontProduct,
  mapProductCardToStorefrontProduct,
} from '@/features/products/services/storefrontProductMapper';
import { useI18nLanguage } from '@/hooks/useI18nLanguage';
import type { Product } from '@/shared/types';

async function fetchProductsByIds(ids: number[]): Promise<Product[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        return mapProductDetailToStorefrontProduct(await productService.getById(id));
      } catch {
        try {
          const page = await productService.getAll();
          const found = page.items.find((p) => p.id === id);
          return found ? mapProductCardToStorefrontProduct(found) : null;
        } catch {
          return null;
        }
      }
    }),
  );
  return results.filter((p): p is Product => p !== null);
}

export function useWishlistPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { productIds, hydrateFromServer } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const language = useI18nLanguage();

  useEffect(() => {
    setProducts((prev) => prev.filter((p) => productIds.includes(p.id)));
  }, [productIds]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        if (isAuthenticated) {
          const items = await wishlistService.getAll();
          if (cancelled) return;
          hydrateFromServer(items);
          const fetched = await fetchProductsByIds(items.map((i) => i.productId));
          if (!cancelled) setProducts(fetched);
        } else {
          const ids = productIds.map(Number).filter(Boolean);
          if (ids.length === 0) {
            setProducts([]);
            return;
          }
          const fetched = await fetchProductsByIds(ids);
          if (!cancelled) setProducts(fetched);
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, language]);

  return { products, loading };
}
