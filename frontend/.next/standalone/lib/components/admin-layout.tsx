'use client';

import { ReactNode, useState } from 'react';
import { AdminSidebar } from './admin-sidebar';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { Notifications } from './notifications';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
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
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">ICBM Admin</h1>
          <div className="flex items-center gap-2">
            <Notifications userType="admin" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex bg-white shadow-sm p-4 items-center justify-end">
          <Notifications userType="admin" />
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

