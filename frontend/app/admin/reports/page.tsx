'use client';

import { AdminLayout } from '@/lib/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle>Reports</CardTitle>
            </div>
            <CardDescription>Generate and view detailed reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">This page will contain report generation and viewing features.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

