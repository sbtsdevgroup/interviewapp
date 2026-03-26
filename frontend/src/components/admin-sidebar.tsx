'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  TrendingUp,
} from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push('/auth/admin');
  };

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'Students',
      href: '/admin/students',
      icon: <Users className="h-5 w-5" />,
    },
    // {
    //   name: 'Assessments',
    //   href: '/admin/assessments',
    //   icon: <FileText className="h-5 w-5" />,
    // },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-white text-slate-800 w-64 border-r border-slate-200">
      {/* Logo/Header */}
      <div className="px-6 py-7">
        <div className="h-12 w-12 rounded-full bg-[#155dfc] text-white flex items-center justify-center">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h2 className="text-base font-semibold text-slate-900 mt-4">ICBM Training</h2>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <p className="px-3 text-xs uppercase tracking-wide text-slate-400 mb-2">Main Menu</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-[15px]',
                isActive
                  ? 'bg-[#155dfc] text-white font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-1 text-xs bg-green-500 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
