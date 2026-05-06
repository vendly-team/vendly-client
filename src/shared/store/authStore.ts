import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, mapServerUser } from '@/shared/api/authApi';
import { configureTokenRefresh } from '@/shared/api/http';
import { recentlyViewedService } from '@/features/recently-viewed/services/recentlyViewedService';
import { useRecentlyViewedStore } from './recentlyViewedStore';
import type { User } from '../types';

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
  login: (login: string, password: string) => Promise<boolean>;
  register: (data: { firstName: string; lastName: string; email: string; phone: string; password: string }) => Promise<boolean>;
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
          const auth = await authApi.login(login, password);
          set({
            user: mapServerUser(auth.user),
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
            isAuthenticated: true,
          });
          void syncRecentlyViewedAfterLogin();
          return true;
        } catch {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
          return false;
        }
      },

      register: async (data) => {
        try {
          const auth = await authApi.register(data);
          set({
            user: mapServerUser(auth.user),
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
            isAuthenticated: true,
          });
          void syncRecentlyViewedAfterLogin();
          return true;
        } catch {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
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
