import { useAuthStore } from '@/shared/store/authStore';
import { useWishlistStore } from '@/shared/store/wishlistStore';
import { wishlistService } from '../services/wishlistService';

export function useWishlistToggle() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isWishlisted, addToStore, removeFromStore, serverIdMap } = useWishlistStore();

  const toggle = async (productId: string) => {
    const wishlisted = isWishlisted(productId);

    if (!isAuthenticated) {
      if (wishlisted) {
        removeFromStore(productId);
      } else {
        addToStore(productId);
      }
      return;
    }

    // Authenticated — sync with server optimistically.
    if (wishlisted) {
      removeFromStore(productId);
      const serverId = serverIdMap[productId];
      if (serverId != null) {
        try {
          await wishlistService.remove(serverId);
        } catch {
          addToStore(productId, serverId);
        }
      }
    } else {
      addToStore(productId);
      try {
        const item = await wishlistService.add(Number(productId));
        if (item) {
          useWishlistStore.getState().addToStore(productId, item.id);
        }
      } catch {
        removeFromStore(productId);
      }
    }
  };

  return { toggle, isWishlisted };
}
