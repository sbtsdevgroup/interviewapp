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
import { Hourglass, Video } from 'lucide-react';

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

  const pillClass = (value?: string) => {
    const v = (value || '').toLowerCase();
    if (v.includes('complete') || v === 'approved' || v === 'paid') return 'bg-green-100 text-green-800';
    if (v.includes('schedule')) return 'bg-orange-100 text-orange-800';
    return 'bg-slate-100 text-slate-700';
  };

  const interviewStatusLabel = interview.interviewCompleted
    ? 'Completed'
    : interview.interviewDate
      ? 'Scheduled'
      : 'Not Scheduled';

  return (
    <DashboardLayout
      interviewLink={interview.interviewLink}
      interviewScheduled={interviewScheduled}
      interviewCompleted={interview.interviewCompleted}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Interview Information</h1>
          <p className="text-sm text-slate-500 mt-1">View your interview details and join when scheduled</p>
        </div>

        {/* Interview Status Card */}
        <Card className="overflow-hidden bg-white border-slate-200">
          <CardContent className="pt-6">
            <div className="inline-flex items-center gap-2 bg-black text-white rounded-full px-4 py-2 text-sm font-semibold">
              <Hourglass className="h-4 w-4" aria-hidden="true" />
              Interview Status
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Information about your interview which consist of the date and time
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-sm">
              <div>
                <div className="text-xs text-slate-500">Interview Date:</div>
                <div className="mt-2 font-medium text-slate-900">
                  {formatDate(interview.interviewDate)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Interview Status:</div>
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pillClass(interviewStatusLabel)}`}>
                    {interviewStatusLabel}
                  </span>
                </div>
              </div>
            </div>

            {!interview.interviewDate && (
              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
                Your interview will be scheduled soon. Please check back regularly or contact support if you have questions.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Join Interview Card */}
        {interviewScheduled && hasInterviewLink && !showVideoInterview && (
          <Card className="overflow-hidden bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="inline-flex items-center gap-2 bg-black text-white rounded-full px-4 py-2 text-sm font-semibold">
                <Video className="h-4 w-4" aria-hidden="true" />
                Join Interview
              </div>
              <div className="text-xs text-slate-500 mt-2">Join your interview when the session is available</div>

              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-600">Interview Date</span>
                    <span className="font-medium text-slate-900">{formatDate(interview.interviewDate)}</span>
                  </div>
                  {interview.interviewInstructions && (
                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <div className="text-xs font-semibold text-slate-700 mb-2">Interview Instructions</div>
                      <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{interview.interviewInstructions}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setShowVideoInterview(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6"
                  size="lg"
                >
                  Join Interview Session
                </Button>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
                  Tip: Make sure you have a stable internet connection and are in a quiet environment. Test your microphone and camera before joining.
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
          <Card className="overflow-hidden bg-white border-slate-200">
            <CardContent>
              <div className="inline-flex items-center gap-2 bg-black text-white rounded-full px-4 py-2 text-sm font-semibold">
                <Hourglass className="h-4 w-4" aria-hidden="true" />
                Interview Results
              </div>
              <div className="text-xs text-slate-500 mt-2">Your interview outcome and selected track details</div>

              <div className="space-y-4">
                {interview.interviewScore !== null && interview.interviewScore !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Interview Score</span>
                    <span className="text-2xl font-bold text-slate-900">{interview.interviewScore}%</span>
                  </div>
                )}

                {interview.chosenTrack && (
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 mb-1">Selected Track</span>
                    <span className="text-lg font-semibold text-slate-900">{interview.chosenTrack}</span>
                  </div>
                )}

                {interview.top3Tracks && interview.top3Tracks.length > 0 && (
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 mb-1">Top 3 Track Preferences</span>
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
                    <span className="text-xs text-slate-500 mb-2">Interview Notes</span>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="text-slate-700 whitespace-pre-wrap">{interview.interviewNotes}</p>
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

