'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mic,
  User,
} from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface SidebarProps {
  interviewLink?: string;
  interviewScheduled?: boolean;
  interviewCompleted?: boolean;
  onLinkClick?: () => void;
}

export function Sidebar({ interviewLink, interviewScheduled, interviewCompleted, onLinkClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { student, clearAuth } = useAuthStore();

  const initials =
    student?.fullName
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') || 'ST';

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: <User className="h-5 w-5" />,
    },
    {
      name: 'Application Status',
      href: '/dashboard/status',
      icon: <ClipboardList className="h-5 w-5" />,
    },
    // {
    //   name: 'Quizzes & Assessments',
    //   href: '/dashboard/assessments',
    //   icon: <FileText className="h-5 w-5" />,
    // },
    {
      name: 'Interview',
      href: '/dashboard/interview',
      icon: <Mic className="h-5 w-5" />,
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
    <div className="flex flex-col h-screen bg-white text-slate-900 w-64 border-r border-slate-200">
      {/* Brand */}
      <div className="p-6 my-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center text-white shadow-sm">
            <img src="/logo.svg" alt="ICBM Training" className="h-20 w-20" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold leading-tight">ICBM Training</div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-2 text-xs font-medium text-slate-400">Main Menu</div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
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
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-left',
                    'hover:bg-slate-100 active:bg-slate-200'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-700">{item.icon}</span>
                    <span className="font-medium text-slate-800">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full font-semibold">
                      {item.badge}
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(isActive ? 'text-white' : 'text-slate-600')}>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={cn(
                      'px-2 py-1 text-xs rounded-full font-semibold',
                      isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                    )}>
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
      <div className="p-4 border-t border-slate-200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
