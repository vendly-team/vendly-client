import { useRecentlyViewedStore } from '@/shared/store/recentlyViewedStore';
import { useAuthStore } from '@/shared/store/authStore';
import { recentlyViewedService } from '../services/recentlyViewedService';

export const trackProductView = (productId: number) => {
  if (!Number.isFinite(productId) || productId <= 0) return;

  useRecentlyViewedStore.getState().track(productId);

  if (useAuthStore.getState().isAuthenticated) {
    void recentlyViewedService.track(productId).catch(() => {
      // Local store is the source of truth on the client; backend sync is best-effort.
    });
  }
};
