'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent } from '@/lib/hooks/use-student';
import { useAuthStore } from '@/lib/store/auth-store';
import { DashboardLayout } from '@/lib/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Badge } from '@/lib/components/ui/badge';

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

interface InterviewStatus {
  interviewDate?: string;
  interviewCompleted: boolean;
  interviewScore?: number;
  interviewNotes?: string;
  interviewLink?: string;
  chosenTrack?: string;
  top3Tracks?: string[];
  assessmentStatus?: string;
  assessmentScore?: number;
  paymentCompleted: boolean;
  paymentVerified: boolean;
  paymentDate?: string;
  status?: string;
  progress?: {
    application: string;
    payment: string;
    assessment: string;
    interview: string;
    overall: {
      percentage: number;
      completed: number;
      total: number;
    };
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { token, isAuthenticated, _hasHydrated } = useAuthStore();
  const { studentData, interviewStatus, isLoading, isError, error, refetch } = useStudent();
  
  // Type assertions for data
  const student = studentData as StudentData | null;
  const interview = interviewStatus as InterviewStatus | null;

  useEffect(() => {
    // Wait for store to hydrate before checking auth
    if (!_hasHydrated) {
      console.log('Waiting for auth store to hydrate...');
      return;
    }

    // Check authentication after hydration
    if (!isAuthenticated || !token) {
      console.log('Not authenticated, redirecting to login', { 
        isAuthenticated, 
        hasToken: !!token,
        hasHydrated: _hasHydrated,
      });
      router.push('/login');
      return;
    }
    console.log('Authenticated, loading dashboard data', { 
      token: token.substring(0, 20) + '...',
      hasHydrated: _hasHydrated,
    });
  }, [isAuthenticated, token, _hasHydrated, router]);

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading your data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (isError && !studentData) {
    return (
      <DashboardLayout>
        <Card className="border-red-500 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-800 mb-4">{(error as any)?.response?.data?.error || 'Failed to load data'}</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const interviewScheduled = !!interview?.interviewDate && !interview?.interviewCompleted;
  const interviewLink = interview?.interviewLink;

  return (
    <DashboardLayout
      interviewLink={interviewLink}
      interviewScheduled={interviewScheduled}
      interviewCompleted={interview?.interviewCompleted}
    >
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back!</h1>
          <p className="text-gray-600 mt-2">Hello, {student?.fullName || 'Student'}</p>
        </div>

        {/* Application Progress */}
        {interview?.progress && (
          <Card>
            <CardHeader>
              <CardTitle>Application Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-8 mb-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-purple-800 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-all duration-300"
                    style={{ width: `${interview.progress.overall.percentage}%` }}
                  >
                    {interview.progress.overall.percentage}%
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Application</p>
                  <Badge variant={interview.progress.application === 'completed' ? 'success' : 'warning'}>
                    {interview.progress.application}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Payment</p>
                  <Badge variant={interview.progress.payment === 'completed' ? 'success' : 'warning'}>
                    {interview.progress.payment}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Assessment</p>
                  <Badge variant={interview.progress.assessment === 'completed' ? 'success' : 'warning'}>
                    {interview.progress.assessment}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Interview</p>
                  <Badge variant={interview.progress.interview === 'completed' ? 'success' : 'warning'}>
                    {interview.progress.interview}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interview Alert */}
        {interviewScheduled && interviewLink && (
          <Card className="border-2 border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    🎤 Your Interview is Scheduled!
                  </h3>
                  <p className="text-green-700 mb-2">
                    Date: {formatDate(interview.interviewDate)}
                  </p>
                  <p className="text-sm text-green-600">
                    Click the button below to join your interview session
                  </p>
                </div>
                <a
                  href={interviewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
                >
                  Join Interview →
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Application ID</span>
                  <span className="text-base font-medium">{student?.applicationId}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Registration Number</span>
                  <span className="text-base font-medium">{student?.registrationNumber || 'Not assigned'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Full Name</span>
                  <span className="text-base font-medium">{student?.fullName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</span>
                  <span className="text-base font-medium">{student?.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</span>
                  <span className="text-base font-medium">{student?.phone}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date of Birth</span>
                  <span className="text-base font-medium">{formatDate(student?.dateOfBirth)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gender</span>
                  <span className="text-base font-medium">{student?.gender}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">State of Origin</span>
                  <span className="text-base font-medium">{student?.stateOfOrigin}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Residence</span>
                  <span className="text-base font-medium">{student?.currentResidence}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Educational Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Education Level</span>
                  <span className="text-base font-medium">{student?.education}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Institution</span>
                  <span className="text-base font-medium">{student?.institution}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Field of Study</span>
                  <span className="text-base font-medium">{student?.fieldOfStudy}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Graduation Year</span>
                  <span className="text-base font-medium">{student?.graduationYear}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">NYSC Status</span>
                  <span className="text-base font-medium">{student?.nyscStatus}</span>
                </div>
                {student?.nyscNumber && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">NYSC Number</span>
                    <span className="text-base font-medium">{student.nyscNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interview Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Interview Date</span>
                  <span className="text-base font-medium">{formatDate(interview?.interviewDate)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Interview Status</span>
                  <Badge variant={interview?.interviewCompleted ? 'success' : interview?.interviewDate ? 'info' : 'warning'}>
                    {interview?.interviewCompleted ? 'Completed' : interview?.interviewDate ? 'Scheduled' : 'Pending'}
                  </Badge>
                </div>
                {interview?.interviewScore !== null && interview?.interviewScore !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Interview Score</span>
                    <span className="text-base font-medium">{interview.interviewScore}%</span>
                  </div>
                )}
                {interview?.chosenTrack && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Selected Track</span>
                    <span className="text-base font-medium">{interview.chosenTrack}</span>
                  </div>
                )}
                {interview?.top3Tracks && interview.top3Tracks.length > 0 && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Top 3 Tracks</span>
                    <span className="text-base font-medium">{interview.top3Tracks.join(', ')}</span>
                  </div>
                )}
                {interview?.interviewNotes && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Interview Notes</span>
                    <span className="text-base font-medium">{interview.interviewNotes}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessment & Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Assessment Status</span>
                  <Badge variant={interview?.assessmentStatus === 'completed' ? 'success' : 'warning'}>
                    {interview?.assessmentStatus || 'Pending'}
                  </Badge>
                </div>
                {interview?.assessmentScore !== null && interview?.assessmentScore !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Assessment Score</span>
                    <span className="text-base font-medium">{interview.assessmentScore}%</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment Status</span>
                  <Badge variant={interview?.paymentCompleted && interview?.paymentVerified ? 'success' : 'warning'}>
                    {interview?.paymentCompleted && interview?.paymentVerified ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
                {interview?.paymentDate && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment Date</span>
                    <span className="text-base font-medium">{formatDate(interview.paymentDate)}</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Application Status</span>
                  <Badge variant={interview?.status === 'approved' ? 'success' : 'warning'}>
                    {interview?.status || 'Pending'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isError && (
          <Card className="border-yellow-500 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-yellow-800">{(error as any)?.response?.data?.error || 'Failed to load some data'}</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

