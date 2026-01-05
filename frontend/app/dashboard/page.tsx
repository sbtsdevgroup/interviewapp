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
  quizScore?: number;
  quizStatus?: string;
  paymentCompleted: boolean;
  paymentVerified: boolean;
  paymentDate?: string;
  status?: string;
  updatedAt?: string;
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
        <div className="bg-gradient-to-r from-[#155dfc] to-[#0d4bc4] rounded-lg shadow-lg p-6 text-white">
          <h1 className="text-3xl font-bold">Welcome back, {student?.fullName || 'Student'}!</h1>
          <p className="text-blue-100 mt-2">Your ICBM Interview Portal</p>
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
                    className="bg-gradient-to-r from-[#155dfc] to-[#0d4bc4] h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-all duration-300"
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

        {/* Interview Alert - Prominent */}
        {interviewScheduled && interviewLink && (
          <Card className="border-4 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-4xl">🎤</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">
                      Your Interview is Scheduled!
                    </h3>
                    <p className="text-green-700 mb-1 text-lg">
                      <strong>Date & Time:</strong> {formatDate(interview.interviewDate)}
                    </p>
                    <p className="text-sm text-green-600">
                      Click the button to join your interview session via Google Meet or Zoom
                    </p>
                  </div>
                </div>
                <a
                  href={interviewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                >
                  🚀 Join Interview Now
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interview Pending Alert */}
        {!interviewScheduled && !interview?.interviewCompleted && (
          <Card className="border-2 border-blue-300 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-[#155dfc] rounded-full flex items-center justify-center">
                    <span className="text-3xl">⏳</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0d4bc4] mb-1">
                    Interview Not Yet Scheduled
                  </h3>
                  <p className="text-blue-700">
                    Your interview will be scheduled soon. Please check back regularly or contact support if you have questions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#155dfc]">{student?.applicationId || 'N/A'}</div>
                <div className="text-sm text-blue-600 mt-2">Application ID</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700">
                  {interview?.interviewCompleted ? '✓' : interview?.interviewDate ? '📅' : '⏳'}
                </div>
                <div className="text-sm text-blue-600 mt-2">
                  {interview?.interviewCompleted ? 'Completed' : interview?.interviewDate ? 'Scheduled' : 'Pending'}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700">
                  {interview?.paymentCompleted && interview?.paymentVerified ? '✓' : '⏳'}
                </div>
                <div className="text-sm text-green-600 mt-2">Payment Status</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-700">
                  {interview?.assessmentStatus === 'completed' ? '✓' : '⏳'}
                </div>
                <div className="text-sm text-orange-600 mt-2">Assessment</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-[#0d4bc4]">Personal Information</CardTitle>
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
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-blue-800">Educational Information</CardTitle>
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

          <Card className="border-2 border-purple-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <span>🎯</span> Interview Information
              </CardTitle>
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
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="text-green-800">Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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

        {/* Quizzes & Assessment Results Section */}
        <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100">
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <span>📝</span> Quizzes & Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Assessment Status Card */}
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">Assessment Status</h4>
                    <p className="text-sm text-gray-600">Your overall assessment completion status</p>
                  </div>
                  <Badge 
                    variant={interview?.assessmentStatus === 'completed' ? 'success' : interview?.assessmentStatus === 'in-progress' ? 'info' : 'warning'}
                    className="text-lg px-4 py-2"
                  >
                    {interview?.assessmentStatus === 'completed' ? '✓ Completed' : 
                     interview?.assessmentStatus === 'in-progress' ? '⏳ In Progress' : 
                     'Pending'}
                  </Badge>
                </div>
                {interview?.assessmentScore !== null && interview?.assessmentScore !== undefined && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Assessment Score</span>
                      <span className="text-2xl font-bold text-orange-600">{interview.assessmentScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${
                          interview.assessmentScore >= 70 ? 'bg-green-500' :
                          interview.assessmentScore >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${interview.assessmentScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>0%</span>
                      <span>50%</span>
                      <span>70%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quiz Results Section */}
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Quiz Results</h4>
                {(() => {
                  // Prioritize quiz scores over assessment scores
                  const displayScore = interview?.quizScore !== null && interview?.quizScore !== undefined 
                    ? interview.quizScore 
                    : interview?.assessmentScore;
                  const displayStatus = interview?.quizStatus || interview?.assessmentStatus;
                  const hasScore = displayScore !== null && displayScore !== undefined;
                  const isCompleted = displayStatus === 'completed' || (hasScore && displayStatus !== 'pending');
                  
                  return isCompleted && hasScore ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                          <div className="text-3xl font-bold text-blue-700">{displayScore}%</div>
                          <div className="text-sm text-blue-600 mt-1">Quiz Score</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                          <div className="text-3xl font-bold text-green-700">
                            {isCompleted ? '✓' : '⏳'}
                          </div>
                          <div className="text-sm text-green-600 mt-1">Status</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                          <div className="text-3xl font-bold text-[#155dfc]">
                            {displayScore >= 70 ? 'A' :
                             displayScore >= 60 ? 'B' :
                             displayScore >= 50 ? 'C' :
                             displayScore >= 40 ? 'D' : 'F'}
                          </div>
                          <div className="text-sm text-blue-600 mt-1">Grade</div>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Performance Level:</strong>{' '}
                          {displayScore >= 70 ? 'Excellent - You have demonstrated strong understanding of the material.' :
                           displayScore >= 60 ? 'Good - You have a solid grasp of the concepts.' :
                           displayScore >= 50 ? 'Average - Consider reviewing the material for improvement.' :
                           displayScore >= 40 ? 'Below Average - Additional study is recommended.' :
                           'Needs Improvement - Please review the course materials and consider retaking the quiz.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📋</div>
                      <p className="text-gray-600 mb-2">No quiz results available yet</p>
                      <p className="text-sm text-gray-500">
                        {displayStatus === 'pending' 
                          ? 'Your quiz will be available soon. Please check back later.'
                          : 'Complete your quiz to view your results here.'}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Additional Assessment Info */}
              {interview?.assessmentStatus === 'completed' && (
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Assessment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Completion Date:</span>
                      <span className="ml-2 font-medium text-gray-800">
                        {interview?.updatedAt ? formatDate(interview.updatedAt) : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2 font-medium text-gray-800 capitalize">
                        {interview?.assessmentStatus || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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

