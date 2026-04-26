import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, userFromToken } from '@/shared/api/authApi';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (login: string, password: string) => Promise<boolean>;
  register: (data: { firstName: string; lastName: string; email: string; phone: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
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
            user: userFromToken(auth.accessToken, login),
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
            isAuthenticated: true,
          });

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
            user: {
              ...userFromToken(auth.accessToken, data.email || data.phone),
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone,
            },
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
            isAuthenticated: true,
          });

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
            // Local logout should still complete even if the refresh token is expired or revoked.
          }
        }

        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
      updateProfile: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
    }),
    {
      name: 'auth-storage',
      version: 2,
      migrate: (persistedState: unknown) => {
        const state = persistedState as Partial<AuthState> | undefined;

        if (!state?.accessToken) {
          return {
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          };
        }

        return state;
      },
    }
  )
);
