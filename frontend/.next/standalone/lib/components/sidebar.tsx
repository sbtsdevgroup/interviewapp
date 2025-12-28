'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/lib/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MenuItem {
  name: string;
  href: string;
  icon: string;
  badge?: string | number;
}

interface SidebarProps {
  interviewLink?: string;
  interviewScheduled?: boolean;
  interviewCompleted?: boolean;
}

export function Sidebar({ interviewLink, interviewScheduled, interviewCompleted }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { student } = useAuthStore();

  const handleLogout = () => {
    useAuthStore.getState().clearAuth();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('student');
    }
    router.push('/login');
  };

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
    },
    {
      name: 'My Profile',
      href: '/dashboard/profile',
      icon: '👤',
    },
    {
      name: 'Application Status',
      href: '/dashboard/status',
      icon: '📋',
    },
    {
      name: 'Interview',
      href: '/dashboard/interview',
      icon: '🎤',
      badge: interviewScheduled && !interviewCompleted ? 'Active' : undefined,
    },
  ];

  const handleInterviewClick = (e: React.MouseEvent) => {
    if (interviewLink && interviewScheduled && !interviewCompleted) {
      e.preventDefault();
      window.open(interviewLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-purple-600 to-purple-800 text-white w-64 fixed left-0 top-0 shadow-lg">
      {/* Logo/Header */}
      <div className="p-6 border-b border-purple-500">
        <h2 className="text-xl font-bold">ICBM Portal</h2>
        <p className="text-sm text-purple-200 mt-1">Student Dashboard</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-purple-500">
        <p className="text-sm font-medium truncate">{student?.fullName || 'Student'}</p>
        <p className="text-xs text-purple-200 truncate">{student?.applicationId || ''}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const isInterview = item.href === '/dashboard/interview';
          const showInterviewLink = isInterview && interviewLink && interviewScheduled && !interviewCompleted;

          return (
            <div key={item.href}>
              {showInterviewLink ? (
                <button
                  onClick={handleInterviewClick}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors',
                    'hover:bg-purple-700 active:bg-purple-600',
                    'text-left'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs bg-green-500 rounded-full font-semibold animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-white text-purple-600 font-semibold'
                      : 'hover:bg-purple-700 active:bg-purple-600'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs bg-green-500 rounded-full font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-purple-500">
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
        >
          🚪 Logout
        </Button>
      </div>
    </div>
  );
}

