'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  UserCheck,
  ClipboardList,
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

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
    }
    router.push('/login');
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
    {
      name: 'Interviews',
      href: '/admin/interviews',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: 'Assessments',
      href: '/admin/assessments',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#155dfc] to-[#0d4bc4] text-white w-64 shadow-lg">
      {/* Logo/Header */}
      <div className="p-6 border-b border-blue-400/30">
        <h2 className="text-xl font-bold">ICBM Admin</h2>
        <p className="text-sm text-blue-100 mt-1">Management Portal</p>
      </div>

      {/* Admin Info */}
      <div className="p-4 border-b border-blue-400/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">Administrator</p>
            <p className="text-xs text-blue-100">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-white text-[#155dfc] font-semibold shadow-sm'
                  : 'hover:bg-blue-600/80 active:bg-blue-500/80'
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
      <div className="p-4 border-t border-blue-400/30">
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

