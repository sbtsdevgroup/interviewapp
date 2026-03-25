'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lock, LogIn, Mail } from 'lucide-react';

import { useAuthStore } from '@/lib/store/auth-store';
import { GuestGuard } from '@/components/auth/guest-guard';

export default function AdminAuthPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/admin/login', {
        email: email.trim(),
        password,
      });

      const token = (res.data as any)?.token;
      const admin = (res.data as any)?.admin ?? { email: email.trim() };

      if (token) {
        setAuth(token, admin, 'admin');
        router.push('/admin');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestGuard>
      <div className="relative min-h-screen overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: "url('/banner2.png')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-[#0D62D1]/95 to-[#022552]/95"
        />

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-xl rounded-[14px]">
            <CardHeader className="space-y-2 text-center">
              <div className="flex justify-center items-center">
                <div className="h-20 w-20 rounded-full bg-[#0D62D1]/10 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Lock className="h-6 w-6 text-[#0D62D1]" aria-hidden="true" />
                  </div>
                </div>
              </div>

              <CardTitle className="text-2xl font-semibold tracking-tight">
                Admin Portal
              </CardTitle>
              <CardDescription>
                Welcome back! Please login with your admin credentials
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      autoFocus
                      disabled={loading}
                      className="bg-[#EAEAEA] pl-9"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    className="bg-[#EAEAEA]"
                    autoComplete="current-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0D62D1] hover:bg-[#0D62D1]/90 rounded-[14px]"
                  disabled={loading || !email.trim() || !password}
                >
                  <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </GuestGuard>
  );
}
