'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent } from '@/lib/hooks/use-student';
import { useAuthStore } from '@/lib/store/auth-store';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hourglass } from 'lucide-react';

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
  updatedAt?: string;
}

export default function AssessmentsPage() {
  const router = useRouter();
  const { token, isAuthenticated, _hasHydrated } = useAuthStore();
  const { interviewStatus, isLoading, isError, error, refetch } = useStudent();

  const interview = interviewStatus as InterviewStatus | null;

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, token, _hasHydrated, router]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading assessment data...</p>
          </div>
        </div>
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

  const displayScore = interview?.quizScore !== null && interview?.quizScore !== undefined
    ? interview.quizScore
    : interview?.assessmentScore;
  const displayStatus = interview?.quizStatus || interview?.assessmentStatus;
  const hasScore = displayScore !== null && displayScore !== undefined;
  const isCompleted = displayStatus === 'completed' || (hasScore && displayStatus !== 'pending');

  return (
    <DashboardLayout
      interviewLink={interviewLink}
      interviewScheduled={interviewScheduled}
      interviewCompleted={interview?.interviewCompleted}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Quizzes & Assessments</h1>
          <p className="text-sm text-slate-500 mt-1">View your quiz results and assessment performance</p>
        </div>

        {/* Overall Progress */}
        {interview?.assessmentStatus && (
          <Card className="border-slate-200 bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Hourglass className="h-4 w-4 text-slate-600" aria-hidden="true" />
                  Overall Progress
                </div>
                <div className="text-sm font-semibold text-slate-800">{interview?.progress?.overall?.percentage ?? 0}%</div>
              </div>

              <div className="mt-3 w-full rounded-full bg-slate-200 h-3">
                <div
                  className="h-3 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, interview?.progress?.overall?.percentage ?? 0))}%` }}
                />
              </div>

              <div className="mt-3 text-sm text-slate-600">
                {(interview as any)?.progress?.overall?.completed ?? 0} of {(interview as any)?.progress?.overall?.total ?? 4} steps completed
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!isCompleted && (
          <Card className="border-slate-200 bg-white">
            <CardContent className="pt-10 pb-10">
              <div className="max-w-xl mx-auto text-center">
                <div className="mx-auto h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-slate-700 text-xl" aria-hidden="true">📝</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No quiz results yet</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {displayStatus === 'pending'
                    ? 'Your quiz will be available soon. Please check back later.'
                    : 'Complete your quiz to view your results here.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results (when completed) */}
        {isCompleted && hasScore && (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center">
                  <div className="text-3xl font-bold text-slate-900">{displayScore}%</div>
                  <div className="text-xs text-slate-500 mt-1">Quiz Score</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center">
                  <div className="text-3xl font-bold text-slate-900">{displayStatus || 'Completed'}</div>
                  <div className="text-xs text-slate-500 mt-1">Status</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center">
                  <div className="text-3xl font-bold text-slate-900">
                    {displayScore >= 70 ? 'A' : displayScore >= 60 ? 'B' : displayScore >= 50 ? 'C' : displayScore >= 40 ? 'D' : 'F'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Grade</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {isError && (
          <Card className="border-red-500 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-800 mb-4">{(error as any)?.response?.data?.error || 'Failed to load assessment data'}</p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

