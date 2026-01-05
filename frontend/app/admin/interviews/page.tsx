'use client';

import { AdminLayout } from '@/lib/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Calendar } from 'lucide-react';

export default function InterviewsPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Interviews Management</CardTitle>
            </div>
            <CardDescription>View and manage all interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">This page will contain interview scheduling and management features.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

