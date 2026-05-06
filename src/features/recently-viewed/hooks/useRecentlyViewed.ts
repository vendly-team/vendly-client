import { useEffect, useState } from 'react';
import { useRecentlyViewedStore } from '@/shared/store/recentlyViewedStore';
import { useAuthStore } from '@/shared/store/authStore';
import { productService } from '@/features/products/services/productService';
import { mapProductDetailToStorefrontProduct } from '@/features/products/services/storefrontProductMapper';
import { recentlyViewedService } from '../services/recentlyViewedService';
import type { Product } from '@/shared/types';

interface UseRecentlyViewedOptions {
  excludeProductId?: number;
  limit?: number;
}

export const useRecentlyViewed = ({ excludeProductId, limit = 8 }: UseRecentlyViewedOptions = {}) => {
  const items = useRecentlyViewedStore((state) => state.items);
  const hydrateFromServer = useRecentlyViewedStore((state) => state.hydrateFromServer);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    void recentlyViewedService
      .getAll()
      .then((entries) => {
        if (cancelled) return;
        hydrateFromServer(
          entries.map((entry) => ({ productId: entry.productId, viewedAt: new Date(entry.viewedAt).getTime() })),
        );
      })
      .catch(() => {
        // Server fetch failed; local items remain in place.
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, hydrateFromServer]);

  useEffect(() => {
    let cancelled = false;

    const productIds = items
      .map((item) => item.productId)
      .filter((id) => id !== excludeProductId)
      .slice(0, limit);

    if (productIds.length === 0) {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    Promise.all(
      productIds.map(async (id) => {
        try {
          const detail = await productService.getById(id);
          if (!detail.isActive) return null;
          return mapProductDetailToStorefrontProduct(detail);
        } catch {
          return null;
        }
      }),
    )
      .then((results) => {
        if (cancelled) return;
        setProducts(results.filter((product): product is Product => product !== null));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [items, excludeProductId, limit]);

  return { products, isLoading };
};
