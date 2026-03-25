'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

interface GuestGuardProps {
  children: ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const { isAuthenticated, userType, _hasHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (isAuthenticated) {
      if (userType === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, userType, _hasHydrated, router]);

  if (!_hasHydrated || isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0D62D1] border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
