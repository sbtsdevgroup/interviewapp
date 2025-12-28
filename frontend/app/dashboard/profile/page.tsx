'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent } from '@/lib/hooks/use-student';
import { useAuthStore } from '@/lib/store/auth-store';
import { DashboardLayout } from '@/lib/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';

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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-2">View and manage your personal information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Application ID</span>
                <span className="text-base font-medium">{student.applicationId}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Registration Number</span>
                <span className="text-base font-medium">{student.registrationNumber || 'Not assigned'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Full Name</span>
                <span className="text-base font-medium">{student.fullName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</span>
                <span className="text-base font-medium">{student.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</span>
                <span className="text-base font-medium">{student.phone}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date of Birth</span>
                <span className="text-base font-medium">{formatDate(student.dateOfBirth)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gender</span>
                <span className="text-base font-medium">{student.gender}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">State of Origin</span>
                <span className="text-base font-medium">{student.stateOfOrigin}</span>
              </div>
              <div className="flex flex-col md:col-span-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Residence</span>
                <span className="text-base font-medium">{student.currentResidence}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Educational Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Education Level</span>
                <span className="text-base font-medium">{student.education}</span>
              </div>
              <div className="flex flex-col md:col-span-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Institution</span>
                <span className="text-base font-medium">{student.institution}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Field of Study</span>
                <span className="text-base font-medium">{student.fieldOfStudy}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Graduation Year</span>
                <span className="text-base font-medium">{student.graduationYear}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">NYSC Status</span>
                <span className="text-base font-medium">{student.nyscStatus}</span>
              </div>
              {student.nyscNumber && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">NYSC Number</span>
                  <span className="text-base font-medium">{student.nyscNumber}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

