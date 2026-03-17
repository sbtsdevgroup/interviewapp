'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent } from '@/lib/hooks/use-student';
import { useAuthStore } from '@/lib/store/auth-store';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, User } from 'lucide-react';

interface StudentData {
  id: string;
  applicationId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  stateOfOrigin: string;
  currentResidence: string;
  registrationNumber?: string;
  education: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: string;
  nyscStatus: string;
  nyscNumber?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { token, isAuthenticated, _hasHydrated } = useAuthStore();
  const { studentData, isLoading } = useStudent();

  const student = studentData as StudentData | null;

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || !token) {
      router.push('/login');
    }
  }, [isAuthenticated, token, _hasHydrated, router]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#155dfc] mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">No profile data available.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Profile Details</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage your personal information</p>
        </div>

        <Card className="overflow-hidden bg-white border-none">
          <CardContent className="pt-6">
            <div className="inline-flex items-center gap-2 bg-black text-white rounded-full px-4 py-2 text-sm font-semibold">
              <User className="h-4 w-4" aria-hidden="true" />
              Personal Information
            </div>
            <div className="text-xs text-slate-500 mt-2">Your complete personal and contact information</div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
              <div>
                <div className="text-xs text-slate-500">Full Name:</div>
                <div className="font-medium text-slate-900">{student.fullName || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Email:</div>
                <div className="font-medium text-slate-900 break-words">{student.email || '—'}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Phone Number:</div>
                <div className="font-medium text-slate-900">{student.phone || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Date of Birth:</div>
                <div className="font-medium text-slate-900">{formatDate(student.dateOfBirth)}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Gender:</div>
                <div className="font-medium text-slate-900">{student.gender || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">State of Origin</div>
                <div className="font-medium text-slate-900">{student.stateOfOrigin || '—'}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Full Address</div>
                <div className="font-medium text-slate-900">{student.currentResidence || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Verification Number</div>
                <div className="font-medium text-slate-900">{student.registrationNumber || 'Not Provided'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-white border-none">
          <CardContent className="pt-6">
            <div className="inline-flex items-center gap-2 bg-black text-white rounded-full px-4 py-2 text-sm font-semibold">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              Education Background
            </div>
            <div className="text-xs text-slate-500 mt-2">Your academic qualifications and background</div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
              <div>
                <div className="text-xs text-slate-500">Educational Level</div>
                <div className="font-medium text-slate-900">{student.education || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Institution</div>
                <div className="font-medium text-slate-900">{student.institution || '—'}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Graduation Year</div>
                <div className="font-medium text-slate-900">{student.graduationYear || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Field of Study</div>
                <div className="font-medium text-slate-900">{student.fieldOfStudy || '—'}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500">NYSC Status</div>
                <div className="font-medium text-slate-900">{student.nyscStatus || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">NYSC Number</div>
                <div className="font-medium text-slate-900">{student.nyscNumber || '—'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

