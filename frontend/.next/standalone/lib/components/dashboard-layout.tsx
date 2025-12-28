'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from './sidebar';
import { Button } from './ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
  interviewLink?: string;
  interviewScheduled?: boolean;
  interviewCompleted?: boolean;
}

export function DashboardLayout({
  children,
  interviewLink,
  interviewScheduled,
  interviewCompleted,
}: DashboardLayoutProps) {
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
        <Sidebar
          interviewLink={interviewLink}
          interviewScheduled={interviewScheduled}
          interviewCompleted={interviewCompleted}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">ICBM Portal</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="text-2xl">☰</span>
          </Button>
        </div>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

