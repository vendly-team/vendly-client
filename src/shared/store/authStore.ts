import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, mapServerUser } from '@/shared/api/authApi';
import { configureTokenRefresh } from '@/shared/api/http';
import { recentlyViewedService } from '@/features/recently-viewed/services/recentlyViewedService';
import { wishlistService } from '@/features/wishlist/services/wishlistService';
import { cartApi } from '@/shared/api/cartApi';
import { useRecentlyViewedStore } from './recentlyViewedStore';
import { useWishlistStore } from './wishlistStore';
import { useCartStore } from './cartStore';
import type { User } from '../types';

const syncWishlistAfterLogin = async () => {
  const { productIds, hydrateFromServer } = useWishlistStore.getState();

  // Fetch server wishlist to find what's already there.
  let serverItems: { id: number; productId: number }[] = [];
  try {
    serverItems = await wishlistService.getAll();
  } catch {
    return;
  }

  const serverProductIds = new Set(serverItems.map((item) => String(item.productId)));

  // Add local guest items that are missing on the server.
  for (const id of productIds) {
    if (!serverProductIds.has(id)) {
      try {
        await wishlistService.add(Number(id));
      } catch {
        // Skip duplicates or failures — hydrate below will reflect real state.
      }
    }
  }

  // Pull authoritative list and replace local store.
  try {
    const merged = await wishlistService.getAll();
    hydrateFromServer(merged);
  } catch {
    // Keep local list as-is if hydration fails.
  }
};

const syncCartAfterLogin = async () => {
  // Snapshot local items BEFORE any server calls
  const localItems = [...useCartStore.getState().items];

  // Push each syncable item to server
  for (const item of localItems) {
    if (item.variantId) {
      try {
        await cartApi.addItem(item.variantId, item.qty);
      } catch {
        // Out of stock or unavailable — skip
      }
    }
  }

  // Fetch authoritative server cart
  try {
    const serverCart = await cartApi.get();
    useCartStore.getState().hydrateFromServer(serverCart);

    // Re-add local items that couldn't be synced (no variantId) and aren't on server
    const serverProductIds = new Set(serverCart.items.map(i => String(i.productId)));
    const unsynced = localItems.filter(i => !i.variantId && !serverProductIds.has(i.productId));
    if (unsynced.length > 0) {
      useCartStore.setState(state => ({ items: [...state.items, ...unsynced] }));
    }
  } catch {
    // Server unreachable — restore local snapshot
    useCartStore.setState({ items: localItems });
  }
};

const syncRecentlyViewedAfterLogin = async () => {
  const { items, hydrateFromServer } = useRecentlyViewedStore.getState();

  // Push local guest views to backend (oldest first so server timestamps reflect view order).
  if (items.length > 0) {
    const productIds = [...items]
      .sort((a, b) => a.viewedAt - b.viewedAt)
      .map((item) => item.productId);

    try {
      await recentlyViewedService.sync(productIds);
    } catch {
      // Sync failed; merged list will still reflect local entries.
    }
  }

  // Pull authoritative list from backend.
  try {
    const entries = await recentlyViewedService.getAll();
    hydrateFromServer(
      entries.map((entry) => ({ productId: entry.productId, viewedAt: new Date(entry.viewedAt).getTime() })),
    );
  } catch {
    // Hydrate failed; keep local list as-is.
  }
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (login: string, password: string) => Promise<{ success: boolean; otpRequired?: boolean; phone?: string }>;
  // Register endi token bermaydi — OTP yuboradi. true = OTP yuborildi.
  register: (data: { firstName: string; lastName: string; email: string; phone: string; password: string }) => Promise<boolean>;
  // OTP tasdiqlangach userni login qiladi (token o'rnatadi).
  verifyOtp: (phone: string, code: string) => Promise<boolean>;
  resendOtp: (phone: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  _setTokens: (accessToken: string, refreshToken: string, user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (login, password) => {
        try {
          const response = await authApi.login(login, password);

          const auth = response as any;

          if ('accessToken' in auth && auth.accessToken) {
            set({
              user: mapServerUser(auth.user),
              accessToken: auth.accessToken,
              refreshToken: auth.refreshToken,
              isAuthenticated: true,
            });
            void syncCartAfterLogin();
            void syncRecentlyViewedAfterLogin();
            void syncWishlistAfterLogin();
            void useCartStore.getState().mergeIntoServer();
            return { success: true };
          } else if ('phone' in auth && 'expiresInSeconds' in auth) {
            return { success: true, otpRequired: true, phone: auth.phone };
          }

          return { success: false };
        } catch {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
          return { success: false };
        }
      },

      register: async (data) => {
        try {
          // User hali yaratilmaydi — backend OTP yuboradi, pending registration cache'da turadi.
          await authApi.register(data);
          return true;
        } catch {
          return false;
        }
      },

      verifyOtp: async (phone, code) => {
        try {
          const auth = await authApi.verifyOtp(phone, code);
          set({
            user: mapServerUser(auth.user),
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
            isAuthenticated: true,
          });
          void syncCartAfterLogin();
          void syncRecentlyViewedAfterLogin();
          void syncWishlistAfterLogin();
          void useCartStore.getState().mergeIntoServer();
          return true;
        } catch {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
          return false;
        }
      },

      resendOtp: async (phone) => {
        try {
          await authApi.resendOtp(phone);
          return true;
        } catch {
          return false;
        }
      },

      logout: async () => {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          try {
            await authApi.logout(refreshToken);
          } catch {
            // Local logout completes even if the server call fails.
          }
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        useCartStore.getState().resetLocal();
      },

      updateProfile: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),

      _setTokens: (accessToken, refreshToken, user) => {
        set({ accessToken, refreshToken, user, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
      version: 2,
      migrate: (persistedState: unknown) => {
        const state = persistedState as Partial<AuthState> | undefined;
        if (!state?.accessToken) {
          return { user: null, accessToken: null, refreshToken: null, isAuthenticated: false };
        }
        return state;
      },
    }
  )
);

// Wire up token refresh callbacks after store is created (avoids circular imports via authApi → http).
configureTokenRefresh(
  (session) => {
    useAuthStore.getState()._setTokens(
      session.accessToken,
      session.refreshToken,
      mapServerUser(session.user),
    );
  },
  () => {
    // Clear local state without calling the server — refresh token is already invalid.
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    window.location.replace('/login');
  },
);
