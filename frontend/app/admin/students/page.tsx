'use client';

import { AdminLayout } from '@/lib/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Users } from 'lucide-react';

export default function StudentsPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Students Management</CardTitle>
            </div>
            <CardDescription>Manage all registered students</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">This page will contain detailed student management features.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

