'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent } from '@/lib/hooks/use-student';
import { useAuthStore } from '@/lib/store/auth-store';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  quizScore?: number;
  quizStatus?: string;
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

export default function StatusPage() {
  const router = useRouter();
  const { token, isAuthenticated, _hasHydrated } = useAuthStore();
  const { interviewStatus, isLoading, refetch } = useStudent();

  const interview = interviewStatus as InterviewStatus | null;

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#155dfc] mb-4"></div>
            <p className="text-gray-600">Loading status...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!interview) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">No status data available.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-6 text-white">
          <h1 className="text-3xl font-bold">Application Status</h1>
          <p className="text-purple-100 mt-2">Track your interview application progress</p>
        </div>

        {/* Overall Progress */}
        {interview.progress && (
          <Card className="border-2 border-purple-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
              <CardTitle className="text-purple-800">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-10 mb-4">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-purple-800 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300"
                    style={{ width: `${interview.progress.overall.percentage}%` }}
                  >
                    {interview.progress.overall.percentage}% Complete
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {interview.progress.overall.completed} of {interview.progress.overall.total} steps completed
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Application Status */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-blue-800">Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={interview.status === 'approved' ? 'success' : 'warning'}>
                    {interview.status || 'Pending'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="text-green-800">Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={interview.paymentCompleted && interview.paymentVerified ? 'success' : 'warning'}>
                    {interview.paymentCompleted && interview.paymentVerified ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
                {interview.paymentDate && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment Date</span>
                    <span className="text-base font-medium">{formatDate(interview.paymentDate)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quiz Status */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
              <CardTitle className="text-orange-800">Quiz Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const displayScore = interview?.quizScore !== null && interview?.quizScore !== undefined
                    ? interview.quizScore
                    : interview?.assessmentScore;
                  const displayStatus = interview?.quizStatus || interview?.assessmentStatus;
                  const isCompleted = displayStatus === 'completed' || (displayScore !== null && displayScore !== undefined && displayStatus !== 'pending');

                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge variant={isCompleted ? 'success' : 'warning'}>
                          {displayStatus || 'Pending'}
                        </Badge>
                      </div>
                      {displayScore !== null && displayScore !== undefined && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Quiz Score</span>
                          <span className="text-base font-medium">{displayScore}%</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Interview Status */}
          <Card className="border-2 border-purple-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <span>🎯</span> Interview Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={interview.interviewCompleted ? 'success' : interview.interviewDate ? 'info' : 'warning'}>
                    {interview.interviewCompleted ? 'Completed' : interview.interviewDate ? 'Scheduled' : 'Pending'}
                  </Badge>
                </div>
                {interview.interviewDate && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Interview Date</span>
                    <span className="text-base font-medium">{formatDate(interview.interviewDate)}</span>
                  </div>
                )}
                {interview.interviewScore !== null && interview.interviewScore !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Score</span>
                    <span className="text-base font-medium">{interview.interviewScore}%</span>
                  </div>
                )}
                {interview.chosenTrack && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Selected Track</span>
                    <span className="text-base font-medium">{interview.chosenTrack}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

