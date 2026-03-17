'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent } from '@/lib/hooks/use-student';
import { useAuthStore } from '@/lib/store/auth-store';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VideoInterview } from '@/components/video-interview';

interface InterviewStatus {
  interviewDate?: string;
  interviewCompleted: boolean;
  interviewScore?: number;
  interviewNotes?: string;
  interviewLink?: string;
  interviewInstructions?: string;
  chosenTrack?: string;
  top3Tracks?: string[];
  assessmentStatus?: string;
  assessmentScore?: number;
  paymentCompleted: boolean;
  paymentVerified: boolean;
  paymentDate?: string;
  status?: string;
}

export default function InterviewPage() {
  const router = useRouter();
  const { token, isAuthenticated, _hasHydrated, student } = useAuthStore();
  const { interviewStatus, isLoading } = useStudent();
  const [showVideoInterview, setShowVideoInterview] = useState(false);

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
      <DashboardLayout
        interviewLink={interview?.interviewLink}
        interviewScheduled={!!interview?.interviewDate && !interview?.interviewCompleted}
        interviewCompleted={interview?.interviewCompleted}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#155dfc] mb-4"></div>
            <p className="text-gray-600">Loading interview information...</p>
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
            <p className="text-center text-gray-600">No interview information available.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const interviewScheduled = !!interview.interviewDate && !interview.interviewCompleted;
  const hasInterviewLink = !!interview.interviewLink;

  return (
    <DashboardLayout
      interviewLink={interview.interviewLink}
      interviewScheduled={interviewScheduled}
      interviewCompleted={interview.interviewCompleted}
    >
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#155dfc] to-[#0d4bc4] rounded-lg shadow-lg p-6 text-white">
          <h1 className="text-3xl font-bold">Interview Information</h1>
          <p className="text-blue-100 mt-2">View your interview details and join when scheduled</p>
        </div>

        {/* Interview Status Card */}
        <Card className="border-2 border-blue-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="text-[#0d4bc4] flex items-center gap-2">
              <span>🎯</span> Interview Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant={interview.interviewCompleted ? 'success' : interview.interviewDate ? 'info' : 'warning'}>
                  {interview.interviewCompleted ? 'Completed' : interview.interviewDate ? 'Scheduled' : 'Not Scheduled'}
                </Badge>
              </div>

              {interview.interviewDate && (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Interview Date & Time</span>
                  <span className="text-lg font-semibold text-gray-800">{formatDate(interview.interviewDate)}</span>
                </div>
              )}

              {!interview.interviewDate && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    Your interview has not been scheduled yet. Please check back later or contact support if you have any questions.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Join Interview Card */}
        {interviewScheduled && hasInterviewLink && !showVideoInterview && (
          <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-green-800">Ready to Join Your Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-3xl">🎤</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800">Your Interview is Scheduled</h3>
                    <p className="text-green-700">Click the button below to join your interview session</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 mb-4 space-y-3">
                  <p className="text-sm text-gray-600">
                    <strong>Interview Date:</strong> {formatDate(interview.interviewDate)}
                  </p>
                  {interview.interviewInstructions && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">📋 Interview Instructions:</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{interview.interviewInstructions}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => {
                    setShowVideoInterview(true);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 font-semibold"
                  size="lg"
                >
                  🚀 Join Interview Session
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Make sure you have a stable internet connection and are in a quiet environment.
                    Test your microphone and camera before joining.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Interview Component */}
        {interviewScheduled && hasInterviewLink && showVideoInterview && interview.interviewLink && student && (
          <Card>
            <CardHeader>
              <CardTitle>Video Interview Session</CardTitle>
            </CardHeader>
            <CardContent>
              <VideoInterview
                roomId={interview.interviewLink}
                userId={student.id}
                userType="student"
                onEndInterview={() => {
                  setShowVideoInterview(false);
                }}
                onRecordingComplete={async (blob, duration) => {
                  // Handle recording upload and AI analysis
                  console.log('Recording completed:', { duration, size: blob.size });
                  // TODO: Upload recording and trigger AI analysis
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Interview Results */}
        {interview.interviewCompleted && (
          <Card>
            <CardHeader>
              <CardTitle>Interview Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interview.interviewScore !== null && interview.interviewScore !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Interview Score</span>
                    <span className="text-2xl font-bold text-[#155dfc]">{interview.interviewScore}%</span>
                  </div>
                )}

                {interview.chosenTrack && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Selected Track</span>
                    <span className="text-lg font-semibold text-gray-800">{interview.chosenTrack}</span>
                  </div>
                )}

                {interview.top3Tracks && interview.top3Tracks.length > 0 && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Top 3 Track Preferences</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {interview.top3Tracks.map((track, index) => (
                        <Badge key={index} variant="info" className="text-sm">
                          {track}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {interview.interviewNotes && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-2">Interview Notes</span>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{interview.interviewNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Interview Link Available */}
        {interviewScheduled && !hasInterviewLink && (
          <Card className="border-yellow-500 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-yellow-800 mb-2">
                  Your interview is scheduled for {formatDate(interview.interviewDate)}, but the meeting link is not yet available.
                </p>
                <p className="text-sm text-yellow-700">
                  Please check back closer to your interview time or contact support for assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

