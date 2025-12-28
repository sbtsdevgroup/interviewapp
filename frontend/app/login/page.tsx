'use client';

import { useState, FormEvent } from 'react';
import { useStudent } from '@/lib/hooks/use-student';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Button } from '@/lib/components/ui/button';

export default function LoginPage() {
  const [applicationId, setApplicationId] = useState('');
  const { login, loginLoading, loginError } = useStudent();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (applicationId.trim()) {
      console.log('Attempting login with Application ID:', applicationId);
      try {
        login(applicationId);
      } catch (error) {
        console.error('Login submission error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Interview Portal</CardTitle>
          <CardDescription>
            Welcome! Please login with your Application ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {(loginError as any)?.response?.data?.error || 'Login failed. Please check your Application ID.'}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="applicationId">Application ID</Label>
              <Input
                id="applicationId"
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="Enter your Application ID"
                required
                autoFocus
                disabled={loginLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginLoading || !applicationId.trim()}
            >
              {loginLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
