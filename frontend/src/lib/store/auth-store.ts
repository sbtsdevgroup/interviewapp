import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Student {
  id: string;
  applicationId: string;
  email: string;
  fullName: string;
  registrationNumber?: string;
}

interface Admin {
  id?: string;
  email: string;
  fullName?: string;
}

export type UserType = 'admin' | 'student';

interface AuthState {
  token: string | null;
  student: Student | null;
  admin: Admin | null;
  userType: UserType | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (token: string, user: Student | Admin, type: UserType) => void;
  clearAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      student: null,
      admin: null,
      userType: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (token, user, type) =>
        set({
          token,
          student: type === 'student' ? (user as Student) : null,
          admin: type === 'admin' ? (user as Admin) : null,
          userType: type,
          isAuthenticated: !!token,
        }),
      clearAuth: () =>
        set({
          token: null,
          student: null,
          admin: null,
          userType: null,
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

