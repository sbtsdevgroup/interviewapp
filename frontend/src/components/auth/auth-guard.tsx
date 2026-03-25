'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

interface AuthGuardProps {
  children: ReactNode;
  allowedRole?: 'admin' | 'student';
}

export function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, userType, _hasHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      // Redirect to correct login page based on path
      if (pathname.startsWith('/admin')) {
        router.push('/auth/admin');
      } else {
        router.push('/login');
      }
    } else if (allowedRole && userType !== allowedRole) {
      // Authenticated but wrong role
      if (userType === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, userType, _hasHydrated, router, pathname, allowedRole]);

  if (!_hasHydrated || (isChecking && !isAuthenticated)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0D62D1] border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
