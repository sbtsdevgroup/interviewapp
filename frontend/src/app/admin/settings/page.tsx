'use client';

import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Settings</CardTitle>
            </div>
            <CardDescription>Manage system settings and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">This page will contain system settings and configuration options.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

