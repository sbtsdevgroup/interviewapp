import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Student {
  id: string;
  applicationId: string;
  email: string;
  fullName: string;
  registrationNumber?: string;
}

interface AuthState {
  token: string | null;
  student: Student | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (token: string, student: Student) => void;
  clearAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      student: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (token, student) =>
        set({
          token,
          student,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          token: null,
          student: null,
          isAuthenticated: false,
        }),
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

