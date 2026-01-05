'use client';

import { AdminLayout } from '@/lib/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle>Analytics</CardTitle>
            </div>
            <CardDescription>View detailed analytics and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">This page will contain analytics charts and insights.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

