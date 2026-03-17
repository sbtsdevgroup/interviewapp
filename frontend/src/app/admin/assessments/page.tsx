'use client';

import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function AssessmentsPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Assessments Management</CardTitle>
            </div>
            <CardDescription>View and manage student assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">This page will contain assessment results and management features.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

