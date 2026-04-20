import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { firstName: string; lastName: string; email: string; phone: string; password: string }) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        if (email === 'admin@test.com' && password === 'admin123') {
          set({ user: { id: 'u1', firstName: 'Admin', lastName: 'User', email, phone: '+1 (800) 000-0001', role: 'admin' }, isAuthenticated: true });
          return true;
        }
        if (email === 'manager@test.com' && password === 'manager123') {
          set({ user: { id: 'u2', firstName: 'Manager', lastName: 'User', email, phone: '+1 (800) 000-0002', role: 'manager' }, isAuthenticated: true });
          return true;
        }
        // Any other valid-looking credentials → customer
        if (email && password && password.length >= 8) {
          set({ user: { id: 'c1', firstName: 'Alex', lastName: 'Morgan', email, phone: '+1 (555) 100-1001', role: 'customer' }, isAuthenticated: true });
          return true;
        }
        return false;
      },
      register: (data) => {
        set({
          user: { id: 'c-new-' + Date.now(), firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone, role: 'customer' },
          isAuthenticated: true,
        });
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      updateProfile: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
    }),
    { name: 'auth-storage' }
  )
);
