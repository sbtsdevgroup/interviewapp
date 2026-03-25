'use client';

import { ReactNode } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ChevronDown, Menu, Search } from 'lucide-react';
import { Notifications } from './notifications';
import { useUIStore } from '@/lib/store/ui-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { AuthGuard } from './auth/auth-guard';
import { useAuthStore } from '@/lib/store/auth-store';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/auth/admin');
  };

  return (
    <AuthGuard allowedRole="admin">
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <AdminSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleSidebar}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search something here"
                className="pl-9 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 lg:gap-3 ml-auto">
              <div className="relative border border-slate-200 rounded-full">
                <Notifications userType="admin" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors">
                    <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-semibold">
                      AD
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      <span className="text-sm font-medium text-slate-800">Administrator</span>
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 lg:p-6 max-w-[1400px] mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
