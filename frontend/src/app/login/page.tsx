'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent } from '@/lib/hooks/use-student';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Headset, HelpCircle, LogIn } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { GuestGuard } from '@/components/auth/guest-guard';

export default function LoginPage() {
  const [applicationId, setApplicationId] = useState('');
  const { login, loginLoading, loginError } = useStudent();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (applicationId.trim()) {
      console.log('Attempting login with Application ID:', applicationId);
      try {
        login({ applicationId });
      } catch (error) {
        console.error('Login submission error:', error);
      }
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
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="80"
                    height="80"
                    rx="40"
                    fill="#0D62D1"
                    fillOpacity="0.1"
                  />
                  <path
                    d="M43.739 57.076C41.8813 55.1253 40.9524 52.7667 40.9524 50C40.9524 47.2333 41.8813 44.8753 43.739 42.926C45.5968 40.9767 47.8425 40.0013 50.4762 40C53.1098 39.9987 55.3562 40.974 57.2152 42.926C59.0743 44.878 60.0025 47.236 60 50C59.9975 52.764 59.0686 55.1227 57.2133 57.076C55.3581 59.0293 53.1124 60.004 50.4762 60C47.84 59.996 45.5943 59.0227 43.739 57.076ZM51.3333 55.65C51.5556 55.4167 51.6667 55.1167 51.6667 54.75C51.6667 54.3833 51.5556 54.0833 51.3333 53.85C51.1111 53.6167 50.8254 53.5 50.4762 53.5C50.127 53.5 49.8413 53.6167 49.619 53.85C49.3968 54.0833 49.2857 54.3833 49.2857 54.75C49.2857 55.1167 49.3968 55.4167 49.619 55.65C49.8413 55.8833 50.127 56 50.4762 56C50.8254 56 51.1111 55.8833 51.3333 55.65ZM49.619 52.2H51.381V51.7C51.381 51.3333 51.4686 51.008 51.6438 50.724C51.819 50.44 52.033 50.1653 52.2857 49.9C52.7302 49.5 53.0794 49.1167 53.3333 48.75C53.5873 48.3833 53.7143 47.8667 53.7143 47.2C53.7143 46.2333 53.4127 45.4587 52.8095 44.876C52.2063 44.2933 51.4286 44.0013 50.4762 44C49.746 44 49.0876 44.2253 48.5009 44.676C47.9143 45.1267 47.4933 45.7347 47.2381 46.5L48.7619 47.2C48.8571 46.8 49.0559 46.45 49.3581 46.15C49.6603 45.85 50.033 45.7 50.4762 45.7C50.9524 45.7 51.3257 45.8253 51.5962 46.076C51.8667 46.3267 52.0013 46.7013 52 47.2C52 47.5667 51.9048 47.8753 51.7143 48.126C51.5238 48.3767 51.3016 48.6347 51.0476 48.9C50.8571 49.1 50.659 49.3 50.4533 49.5C50.2476 49.7 50.0648 49.9333 49.9048 50.2C49.8095 50.4 49.7384 50.6 49.6914 50.8C49.6444 51 49.6203 51.2333 49.619 51.5V52.2ZM23.8095 56C22.7619 56 21.8654 55.6087 21.12 54.826C20.3746 54.0433 20.0013 53.1013 20 52V48C20 46.9 20.3733 45.9587 21.12 45.176C21.8667 44.3933 22.7632 44.0013 23.8095 44H25.7143V34C25.7143 30.1 27.0083 26.792 29.5962 24.076C32.1841 21.36 35.3346 20.0013 39.0476 20C42.7606 19.9987 45.9117 21.3573 48.5009 24.076C51.0902 26.7947 52.3835 30.1027 52.381 34V36.15C52.0635 36.0833 51.7536 36.042 51.4514 36.026C51.1492 36.01 50.8241 36.0013 50.4762 36C46.7936 36 43.6508 37.3587 41.0476 40.076C38.4444 42.7933 37.1429 46.1013 37.1429 50C37.1429 51.0333 37.2463 52.0587 37.4533 53.076C37.6603 54.0933 37.9854 55.068 38.4286 56H23.8095ZM31.4286 40H35.2381V34C35.2381 32.9 35.6114 31.9587 36.3581 31.176C37.1048 30.3933 38.0013 30.0013 39.0476 30V26C36.9524 26 35.1587 26.7833 33.6667 28.35C32.1746 29.9167 31.4286 31.8 31.4286 34V40Z"
                    fill="#0D62D1"
                  />
                </svg>
              </div>

              <CardTitle className="text-2xl font-semibold tracking-tight">
                Interview Portal
              </CardTitle>
              <CardDescription>
                Welcome! Please login with your Application ID
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {(loginError as any)?.response?.data?.error ||
                      "Login failed. Please check your credentials."}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="applicationId">Application ID</Label>
                  <Input
                    id="applicationId"
                    type="text"
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value)}
                    placeholder="Please Enter your application ID"
                    required
                    autoFocus
                    disabled={loginLoading}
                    className="bg-[#EAEAEA]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0D62D1] hover:bg-[#0D62D1]/90 rounded-[14px]"
                  disabled={loginLoading || !applicationId.trim()}
                >
                  <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                  {loginLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </GuestGuard>
  );
}
