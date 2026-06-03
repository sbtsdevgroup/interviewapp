'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent } from '@/lib/hooks/use-student';
import { useAuthStore } from '@/lib/store/auth-store';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Hourglass,
  ShieldCheck,
  Trophy,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Compass,
  GraduationCap,
  IdCard
} from 'lucide-react';

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

  const pillClass = (value?: string) => {
    const v = (value || '').toLowerCase();
    if (v.includes('approve') || v.includes('complete') || v === 'paid' || v === 'enrolled') {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
    }
    if (v.includes('schedule') || v === 'scheduled') {
      return 'bg-blue-50 text-blue-700 border border-blue-200/50';
    }
    return 'bg-slate-100 text-slate-600 border border-slate-200/50';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-600 font-medium animate-pulse">Loading status records...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!interview) {
    return (
      <DashboardLayout>
        <Card className="border border-slate-200 shadow-sm rounded-2xl max-w-2xl mx-auto my-8">
          <CardContent className="pt-8 pb-6 px-6 text-center">
            <p className="text-slate-600 font-medium">No application status records found.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const progressPct = interview.progress?.overall?.percentage ?? 0;
  const applicationProgress = interview.progress?.application ?? 'pending';
  const paymentProgress = interview.progress?.payment ?? (interview.paymentCompleted && interview.paymentVerified ? 'completed' : 'pending');
  const assessmentProgress = interview.progress?.assessment ?? (interview.assessmentStatus ?? 'pending');
  const interviewProgress = interview.progress?.interview ?? (interview.interviewCompleted ? 'completed' : interview.interviewDate ? 'scheduled' : 'pending');

  // Helper to resolve stepper progress
  const getStepStatus = (index: number) => {
    if (index === 0) return 'completed';
    if (index === 1) {
      if (paymentProgress.toLowerCase() === 'completed' || paymentProgress.toLowerCase() === 'paid') return 'completed';
      return 'active';
    }
    if (index === 2) {
      const isPayDone = paymentProgress.toLowerCase() === 'completed' || paymentProgress.toLowerCase() === 'paid';
      if (assessmentProgress.toLowerCase() === 'completed') return 'completed';
      return isPayDone ? 'active' : 'pending';
    }
    if (index === 3) {
      const isAssessDone = assessmentProgress.toLowerCase() === 'completed';
      if (interviewProgress.toLowerCase() === 'completed') return 'completed';
      if (interviewProgress.toLowerCase() === 'scheduled' || !!interview.interviewDate) return 'active';
      return isAssessDone ? 'active' : 'pending';
    }
    return 'pending';
  };

  const steps = [
    {
      name: 'Application',
      status: applicationProgress,
      description: 'Submitted & Enrolled',
      icon: IdCard
    },
    {
      name: 'Payment',
      status: paymentProgress,
      description: 'Fee Verification',
      icon: CreditCard
    },
    {
      name: 'Assessment',
      status: assessmentProgress,
      description: 'Technical Quiz',
      icon: Trophy
    },
    {
      name: 'Interview',
      status: interviewProgress,
      description: 'AI & Panel Meeting',
      icon: Hourglass
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Application Status</h1>
            <p className="text-sm text-slate-500 mt-1">Track and monitor your interview registration pipeline milestones</p>
          </div>
          {interview?.chosenTrack && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50 w-fit shrink-0">
              Program Track: {interview.chosenTrack}
            </span>
          )}
        </div>

        {/* Stepper Timeline & Progress Widget */}
        {interview.progress && (
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-slate-800 text-base font-bold flex items-center gap-2">
                <Compass className="h-5 w-5 text-indigo-500" />
                Overall Registration Milestones
              </CardTitle>
              <div className="text-xs font-bold text-slate-500">
                {interview.progress.overall.completed} of {interview.progress.overall.total} steps completed
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              {/* Stepper Grid */}
              <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 mb-8">
                {steps.map((step, idx) => {
                  const stepStatus = getStepStatus(idx);
                  const StepIcon = step.icon;

                  return (
                    <div key={step.name} className="relative flex flex-row md:flex-col items-center md:items-start text-left gap-4 md:gap-3 group">
                      {/* Connector Line */}
                      {idx < steps.length - 1 && (
                        <div className="hidden md:block absolute top-[22px] left-12 right-0 h-0.5 bg-slate-100 z-0">
                          <div
                            className={`h-full transition-all duration-700 ease-in-out ${
                              getStepStatus(idx + 1) === 'completed' || getStepStatus(idx + 1) === 'active'
                                ? 'bg-indigo-600 w-full'
                                : 'bg-slate-100 w-0'
                            }`}
                          />
                        </div>
                      )}

                      {/* Step Circle */}
                      <div className="relative z-10">
                        <div className={`
                          h-12 w-12 rounded-xl flex items-center justify-center border-2 transition-all duration-500
                          ${stepStatus === 'completed'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-100'
                            : stepStatus === 'active'
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-600 shadow-lg shadow-indigo-100 animate-pulse'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                          }
                        `}>
                          {stepStatus === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <StepIcon className="h-5 w-5" />
                          )}
                        </div>
                        {stepStatus === 'active' && (
                          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500"></span>
                          </span>
                        )}
                      </div>

                      {/* Step Text Info */}
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                          Step 0{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 mt-0.5 group-hover:text-indigo-600 transition-colors">
                          {step.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar container */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between text-sm font-bold text-slate-700 mb-2">
                  <span>Progress Bar</span>
                  <span>{progressPct}% Completed</span>
                </div>
                <div className="w-full rounded-full bg-slate-100 h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4 Cards Grid Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Application Status */}
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-indigo-500" />
                Application Stage Status
              </CardTitle>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Milestone 1</span>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-xs text-slate-500 leading-relaxed">
                Registration submission review, database record activation, and profile verification status details.
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-4">
                <span className="text-xs font-semibold text-slate-500">Pipeline Status</span>
                <Badge className={`text-[10px] px-3 py-1 font-bold ${pillClass(interview.status || "pending")}`}>
                  {interview.status || "Pending"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-indigo-500" />
                Tuition Fee Billing Info
              </CardTitle>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Milestone 2</span>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-xs text-slate-500 leading-relaxed">
                Billing records confirmation, verification status, and transaction clearing parameters for active courses.
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-4">
                <span className="text-xs font-semibold text-slate-500">Transaction Status</span>
                <Badge className={`text-[10px] px-3 py-1 font-bold ${pillClass(
                  interview.paymentCompleted && interview.paymentVerified ? "completed" : "pending"
                )}`}>
                  {interview.paymentCompleted && interview.paymentVerified ? "Completed" : "Pending"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Status */}
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
                <Trophy className="h-4.5 w-4.5 text-indigo-500" />
                Technical Assessment Quiz
              </CardTitle>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Milestone 3</span>
            </CardHeader>
            <CardContent className="p-6">
              {(() => {
                const displayScore =
                  interview?.quizScore !== null && interview?.quizScore !== undefined
                    ? interview.quizScore
                    : interview?.assessmentScore;
                const displayStatus = interview?.quizStatus || interview?.assessmentStatus;
                const hasScore = displayScore !== null && displayScore !== undefined;
                const isCompleted = displayStatus === "completed" || (hasScore && displayStatus !== "pending");

                return (
                  <div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Sync details of your preliminary technical quiz marks, overall test scoring, and completeness indicators.
                    </p>
                    
                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 text-xs font-semibold">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quiz Score</div>
                        <div className="text-base font-extrabold text-slate-800 mt-1">
                          {hasScore ? `${displayScore}%` : "—"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</div>
                        <Badge className={`text-[10px] px-3 py-1 font-bold mt-1 inline-block capitalize ${pillClass(
                          isCompleted ? "completed" : "pending"
                        )}`}>
                          {displayStatus || "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Interview Status */}
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
                <Hourglass className="h-4.5 w-4.5 text-indigo-500" />
                AI Technical & Professional Interview Meeting
              </CardTitle>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Milestone 4</span>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-xs text-slate-500 leading-relaxed">
                Scheduled date and time, links to attend the panel meeting, and status updates regarding live assessment.
              </p>
              
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 text-xs font-semibold">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Meeting Time</div>
                  <div className="text-slate-700 mt-1.5 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-bold leading-tight truncate max-w-[130px] sm:max-w-none">
                      {interview.interviewDate ? formatDate(interview.interviewDate) : "Not Scheduled"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</div>
                  <Badge className={`text-[10px] px-3 py-1 font-bold mt-1 inline-block capitalize ${pillClass(
                    interview.interviewCompleted
                      ? "completed"
                      : interview.interviewDate
                      ? "scheduled"
                      : "pending"
                  )}`}>
                    {interview.interviewCompleted
                      ? "Completed"
                      : interview.interviewDate
                      ? "Scheduled"
                      : "Pending"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
