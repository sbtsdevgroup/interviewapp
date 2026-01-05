'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent } from '@/lib/hooks/use-student';
import { useAuthStore } from '@/lib/store/auth-store';
import { DashboardLayout } from '@/lib/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Badge } from '@/lib/components/ui/badge';

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

  return (
    <DashboardLayout
      interviewLink={interviewLink}
      interviewScheduled={interviewScheduled}
      interviewCompleted={interview?.interviewCompleted}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg shadow-lg p-6 text-white">
          <h1 className="text-3xl font-bold">Quizzes & Assessments</h1>
          <p className="text-orange-100 mt-2">View your quiz results and assessment performance</p>
        </div>

        {/* Assessment Overview */}
        <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100">
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <span>📊</span> Assessment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-lg p-6 border border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Current Status</h3>
                    <p className="text-sm text-gray-600 mt-1">Your assessment completion status</p>
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
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-gray-700">Overall Assessment Score</span>
                      <span className="text-4xl font-bold text-orange-600">{interview.assessmentScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 mb-2">
                      <div
                        className={`h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2 ${
                          interview.assessmentScore >= 70 ? 'bg-green-500' :
                          interview.assessmentScore >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${interview.assessmentScore}%` }}
                      >
                        <span className="text-white text-xs font-semibold">{interview.assessmentScore}%</span>
                      </div>
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

              {/* Score Breakdown - Prioritize Quiz Scores */}
              {(() => {
                // Prioritize quiz scores over assessment scores
                const displayScore = interview?.quizScore !== null && interview?.quizScore !== undefined 
                  ? interview.quizScore 
                  : interview?.assessmentScore;
                const displayStatus = interview?.quizStatus || interview?.assessmentStatus;
                const hasScore = displayScore !== null && displayScore !== undefined;
                const isCompleted = displayStatus === 'completed' || (hasScore && displayStatus !== 'pending');
                
                return isCompleted && hasScore ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="text-5xl font-bold text-[#155dfc] mb-2">{displayScore}%</div>
                      <div className="text-sm font-medium text-blue-600">Quiz Score</div>
                      <div className="text-xs text-blue-500 mt-2">Your quiz performance</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="text-5xl font-bold text-green-700 mb-2">
                        {isCompleted ? '✓' : '⏳'}
                      </div>
                      <div className="text-sm font-medium text-green-600">Status</div>
                      <div className="text-xs text-green-500 mt-2">Quiz completion</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="text-5xl font-bold text-[#155dfc] mb-2">
                        {displayScore >= 70 ? 'A' :
                         displayScore >= 60 ? 'B' :
                         displayScore >= 50 ? 'C' :
                         displayScore >= 40 ? 'D' : 'F'}
                      </div>
                      <div className="text-sm font-medium text-blue-600">Grade</div>
                      <div className="text-xs text-blue-500 mt-2">Letter grade equivalent</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border border-orange-200">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Quiz Results Yet</h3>
                    <p className="text-gray-600 mb-4">
                      {displayStatus === 'pending' 
                        ? 'Your quiz will be available soon. Please check back later or contact support if you have questions.'
                        : 'Complete your quiz to view your results here.'}
                    </p>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Performance Analysis */}
        {(() => {
          const displayScore = interview?.quizScore !== null && interview?.quizScore !== undefined 
            ? interview.quizScore 
            : interview?.assessmentScore;
          const displayStatus = interview?.quizStatus || interview?.assessmentStatus;
          const hasScore = displayScore !== null && displayScore !== undefined;
          const isCompleted = displayStatus === 'completed' || (hasScore && displayStatus !== 'pending');
          
          return isCompleted && hasScore ? (
            <Card>
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Performance Level</h4>
                    <p className="text-gray-700">
                      {displayScore >= 70 ? (
                        <span className="text-green-700">
                          <strong>Excellent</strong> - You have demonstrated strong understanding of the material. 
                          Your performance indicates a comprehensive grasp of the concepts and excellent preparation.
                        </span>
                      ) : displayScore >= 60 ? (
                        <span className="text-blue-700">
                          <strong>Good</strong> - You have a solid grasp of the concepts. 
                          Your performance shows good understanding with room for continued improvement.
                        </span>
                      ) : displayScore >= 50 ? (
                        <span className="text-yellow-700">
                          <strong>Average</strong> - Consider reviewing the material for improvement. 
                          Your performance indicates a basic understanding that can be strengthened with additional study.
                        </span>
                      ) : displayScore >= 40 ? (
                        <span className="text-orange-700">
                          <strong>Below Average</strong> - Additional study is recommended. 
                          Review the course materials and consider seeking additional support.
                        </span>
                      ) : (
                        <span className="text-red-700">
                          <strong>Needs Improvement</strong> - Please review the course materials thoroughly 
                          and consider retaking the quiz after additional preparation.
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Quiz Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium text-gray-800 capitalize">
                            {displayStatus || 'N/A'}
                          </span>
                        </div>
                        {interview?.updatedAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Completion Date:</span>
                            <span className="font-medium text-gray-800">
                              {formatDate(interview.updatedAt)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Score:</span>
                          <span className="font-medium text-gray-800">
                            {displayScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Next Steps</h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        {displayScore >= 70 ? (
                          <>
                            <p>✓ You've successfully completed the quiz</p>
                            <p>✓ Continue to the interview stage</p>
                            <p>✓ Prepare for your scheduled interview</p>
                          </>
                        ) : (
                          <>
                            <p>• Review the quiz materials</p>
                            <p>• Consider additional study resources</p>
                            <p>• Contact support if you need assistance</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null;
        })()}

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

