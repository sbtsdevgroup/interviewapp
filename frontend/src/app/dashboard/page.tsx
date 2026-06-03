'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent } from '@/lib/hooks/use-student';
import { useAuthStore } from '@/lib/store/auth-store';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  Hourglass,
  IdCard,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Award,
  School,
  FileCheck,
  CalendarDays,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Compass,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

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
  status?: string;
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
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-600 font-medium animate-pulse">Loading your portal records...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (isError && !studentData) {
    return (
      <DashboardLayout>
        <Card className="border-red-200 bg-red-50/50 backdrop-blur-sm shadow-lg max-w-2xl mx-auto my-8">
          <CardContent className="pt-8 pb-6 px-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-bold text-red-900 mb-2">Failed to Load Dashboard</h2>
              <p className="text-red-700 text-sm mb-6">{(error as any)?.response?.data?.error || 'Failed to sync with API database portal.'}</p>
              <button
                onClick={() => refetch()}
                className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition-all shadow-md hover:shadow-red-200"
              >
                Retry Request
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

  const formatDateOnly = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const interviewScheduled = !!interview?.interviewDate && !interview?.interviewCompleted;
  const interviewLink = interview?.interviewLink;

  const progressPct = interview?.progress?.overall?.percentage ?? 0;
  const applicationProgress = interview?.progress?.application ?? 'pending';
  const paymentProgress = interview?.progress?.payment ?? (interview?.paymentCompleted && interview?.paymentVerified ? 'completed' : 'pending');
  const assessmentProgress = interview?.progress?.assessment ?? (interview?.assessmentStatus ?? 'pending');
  const interviewProgress = interview?.progress?.interview ?? (interview?.interviewCompleted ? 'completed' : interview?.interviewDate ? 'scheduled' : 'pending');

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

  // Helper to resolve stepper progress
  const getStepStatus = (index: number) => {
    // Step 0: Application (always completed if they logged in)
    if (index === 0) return 'completed';
    
    // Step 1: Payment
    if (index === 1) {
      if (paymentProgress.toLowerCase() === 'completed' || paymentProgress.toLowerCase() === 'paid') return 'completed';
      return 'active';
    }
    
    // Step 2: Assessment
    if (index === 2) {
      const isPayDone = paymentProgress.toLowerCase() === 'completed' || paymentProgress.toLowerCase() === 'paid';
      if (assessmentProgress.toLowerCase() === 'completed') return 'completed';
      return isPayDone ? 'active' : 'pending';
    }
    
    // Step 3: Interview
    if (index === 3) {
      const isAssessDone = assessmentProgress.toLowerCase() === 'completed';
      if (interviewProgress.toLowerCase() === 'completed') return 'completed';
      if (interviewProgress.toLowerCase() === 'scheduled' || interviewScheduled) return 'active';
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
      icon: ClipboardCheck
    },
    {
      name: 'Interview',
      status: interviewProgress,
      description: 'AI & Panel Meeting',
      icon: Calendar
    }
  ];

  return (
    <DashboardLayout
      interviewLink={interviewLink}
      interviewScheduled={interviewScheduled}
      interviewCompleted={interview?.interviewCompleted}
    >
      <div className="space-y-6 pb-12">
        {/* Welcome Section with Premium Mesh Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md border border-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Portal Active
                </span>
                {interview?.chosenTrack && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md border border-white/10">
                    Program: {interview.chosenTrack}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Welcome back, {student?.fullName || "Student"}
              </h1>
              <p className="mt-2 text-blue-100 max-w-xl text-sm sm:text-base leading-relaxed">
                Track your portal application progress, attend scheduled interviews, and verify your personal and educational records dynamically.
              </p>
            </div>
            <div className="flex flex-row gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[125px] shadow-inner">
                <div className="text-3xl font-extrabold text-white">{progressPct}%</div>
                <div className="text-xs text-blue-200 mt-1 font-medium">Overall Progress</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[125px] shadow-inner">
                <div className="text-2xl font-bold text-white capitalize truncate max-w-[110px]">{student?.status || "Pending"}</div>
                <div className="text-xs text-blue-200 mt-2 font-medium">Track Status</div>
              </div>
            </div>
          </div>
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
        </div>

        {/* Stepper Card */}
        <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
            <CardTitle className="text-slate-800 text-base font-bold flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-500" />
              Application Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            {/* Timeline Row */}
            <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
              {steps.map((step, idx) => {
                const stepStatus = getStepStatus(idx);
                const StepIcon = step.icon;

                return (
                  <div key={step.name} className="relative flex flex-row md:flex-col items-center md:items-start text-left gap-4 md:gap-3 group">
                    {/* Line Connector (between circles) */}
                    {idx < steps.length - 1 && (
                      <div className="hidden md:block absolute top-[22px] left-12 right-0 h-0.5 bg-slate-100 z-0">
                        <div
                          className={`h-full transition-all duration-700 ease-in-out ${
                            getStepStatus(idx + 1) === 'completed' || getStepStatus(idx + 1) === 'active'
                              ? 'bg-indigo-600 w-full shadow-lg'
                              : 'bg-slate-100 w-0'
                          }`}
                        />
                      </div>
                    )}

                    {/* Step circle wrapper */}
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
                      
                      {/* Active pulsing dot */}
                      {stepStatus === 'active' && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500"></span>
                        </span>
                      )}
                    </div>

                    {/* Step texts */}
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
                      <div className="mt-1.5 md:hidden">
                        <Badge className={`text-[10px] px-2 py-0.5 capitalize ${pillClass(step.status)}`}>
                          {step.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Banners */}
        {/* If scheduled and has join link */}
        {interviewScheduled && interviewLink ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-emerald-100">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 border border-white/10 flex items-center justify-center text-white shrink-0 shadow-md">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Your AI Technical & Professional Interview is Live</h3>
                  <p className="text-emerald-100 text-sm mt-1 max-w-xl">
                    Your scheduled session is active. Please join promptly using the link below.
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs bg-black/15 px-3 py-1.5 rounded-lg w-fit text-white font-medium border border-white/5">
                    <Clock className="h-3.5 w-3.5 text-emerald-200" />
                    {formatDate(interview.interviewDate)}
                  </div>
                </div>
              </div>
              <a
                href={interviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-emerald-600 hover:bg-emerald-50 active:scale-95 text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-700/20 whitespace-nowrap"
              >
                Join Scheduled Interview
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 h-36 w-36 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
          </div>
        ) : !interview?.interviewCompleted ? (
          /* Not yet scheduled banner */
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white shadow-lg shadow-orange-100">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 border border-white/10 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Hourglass className="h-6 w-6 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Interview Not Yet Scheduled</h3>
                  <p className="text-orange-100 text-sm mt-1 max-w-2xl">
                    Your assessment scoring is complete. Our administrators will schedule your live panel presentation soon. Please monitor this page regularly.
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 h-36 w-36 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
          </div>
        ) : (
          /* Completed interview banner */
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 p-6 text-white shadow-lg shadow-indigo-100">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 border border-white/10 flex items-center justify-center text-white shrink-0 shadow-md">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Interview Process Completed</h3>
                  <p className="text-indigo-100 text-sm mt-1 max-w-2xl">
                    Congratulations! Your AI interview response records have been captured. Check back for final enrollment review results.
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 h-36 w-36 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
          </div>
        )}

        {/* 4 Status Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 rounded-2xl group">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Application ID</span>
                <span className="h-8 w-8 rounded-lg bg-slate-50 group-hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-100 transition-colors">
                  <IdCard className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-4">
                <div className="text-base font-extrabold text-slate-800 tracking-tight select-all">
                  {student?.applicationId || "—"}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-semibold flex items-center gap-1">
                  Reg Code: {student?.registrationNumber || "Unassigned"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 rounded-2xl group">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Schedule Status</span>
                <span className="h-8 w-8 rounded-lg bg-slate-50 group-hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-100 transition-colors">
                  <Calendar className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-4">
                <Badge className={`text-[10px] px-3 py-1 font-bold ${pillClass(
                  interview?.interviewCompleted ? "Completed" : interview?.interviewDate ? "Scheduled" : "Pending"
                )}`}>
                  {interview?.interviewCompleted ? "Completed" : interview?.interviewDate ? "Scheduled" : "Pending"}
                </Badge>
                <div className="text-[11px] text-slate-400 mt-2.5 font-semibold">
                  {interview?.interviewDate ? "Scheduled Live Assessment" : "Awaiting Scheduler Slot"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 rounded-2xl group">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Payment Status</span>
                <span className="h-8 w-8 rounded-lg bg-slate-50 group-hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-100 transition-colors">
                  <CreditCard className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-4">
                <Badge className={`text-[10px] px-3 py-1 font-bold ${pillClass(
                  interview?.paymentCompleted && interview?.paymentVerified ? "Paid" : "Pending"
                )}`}>
                  {interview?.paymentCompleted && interview?.paymentVerified ? "Paid" : "Pending"}
                </Badge>
                <div className="text-[11px] text-slate-400 mt-2.5 font-semibold">
                  {interview?.paymentCompleted && interview?.paymentVerified ? "Transaction Cleared" : "Awaiting Verification"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 rounded-2xl group">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Assessment Status</span>
                <span className="h-8 w-8 rounded-lg bg-slate-50 group-hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-100 transition-colors">
                  <ClipboardCheck className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-4">
                <Badge className={`text-[10px] px-3 py-1 font-bold ${pillClass(
                  interview?.assessmentStatus === "completed" ? "Completed" : "Pending"
                )}`}>
                  {interview?.assessmentStatus === "completed" ? "Completed" : "Pending"}
                </Badge>
                <div className="text-[11px] text-slate-400 mt-2.5 font-semibold">
                  {interview?.assessmentStatus === "completed" ? "Evaluation Records Set" : "Assessment Not Taken"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information Panel */}
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-indigo-500" />
                Personal Profile Details
              </CardTitle>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verification Set</span>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">Full Name</div>
                    <div className="font-bold text-slate-800 mt-0.5">{student?.fullName || "—"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400 font-semibold">Email Address</div>
                    <div className="font-bold text-slate-800 mt-0.5 break-all select-all">{student?.email || "—"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">Phone Number</div>
                    <div className="font-bold text-slate-800 mt-0.5 select-all">{student?.phone || "—"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">Date of Birth</div>
                    <div className="font-bold text-slate-800 mt-0.5">{formatDateOnly(student?.dateOfBirth)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                    <Compass className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">Gender</div>
                    <div className="font-bold text-slate-800 mt-0.5 capitalize">{student?.gender || "—"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">State of Origin</div>
                    <div className="font-bold text-slate-800 mt-0.5">{student?.stateOfOrigin || "—"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2 border-t border-slate-50 pt-4">
                  <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">Current Residence Location</div>
                    <div className="font-bold text-slate-800 mt-0.5 leading-relaxed">{student?.currentResidence || "—"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Background Panel */}
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
                <GraduationCap className="h-4.5 w-4.5 text-indigo-500" />
                Academic Background
              </CardTitle>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Degrees Listed</span>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                    <Award className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">Educational Level</div>
                    <div className="font-bold text-slate-800 mt-0.5 capitalize">{student?.education || "—"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                    <School className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">Institution</div>
                    <div className="font-bold text-slate-800 mt-0.5">{student?.institution || "—"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                    <CalendarDays className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">Graduation Year</div>
                    <div className="font-bold text-slate-800 mt-0.5">{student?.graduationYear || "—"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                    <GraduationCap className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">Field of Study</div>
                    <div className="font-bold text-slate-800 mt-0.5 capitalize">{student?.fieldOfStudy || "—"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-slate-50 pt-4 sm:col-span-2">
                  <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                    <FileCheck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">NYSC Status</div>
                    <div className="font-bold text-slate-800 mt-0.5 capitalize">{student?.nyscStatus || "—"}</div>
                  </div>
                </div>

                {student?.nyscNumber && (
                  <div className="flex items-start gap-3 border-t border-slate-50 pt-4 sm:col-span-2">
                    <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                      <IdCard className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-semibold">NYSC Certificate Number</div>
                      <div className="font-bold text-slate-800 mt-0.5 select-all">{student.nyscNumber}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Process Status Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interview Details Card */}
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
              <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-indigo-500" />
                Assessment Session Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-slate-500">Live Interview Date</span>
                  <span className="text-sm font-bold text-slate-800">
                    {interview?.interviewDate ? formatDate(interview.interviewDate) : "Awaiting Schedule Slot"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-slate-500">Interview Status</span>
                  <span className={`text-[10px] px-3 py-1 font-bold ${pillClass(interviewProgress)}`}>
                    {interview?.interviewCompleted ? "Completed" : interview?.interviewDate ? "Scheduled" : "Pending"}
                  </span>
                </div>
                {interview?.interviewNotes && (
                  <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 text-xs">
                    <span className="font-bold text-slate-500 block mb-1">Assessor Direct Notes:</span>
                    <p className="text-slate-700 font-medium leading-relaxed">{interview.interviewNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment & Application Details Card */}
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
              <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-indigo-500" />
                Billing & Verification Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-slate-500">Tuition Payment Status</span>
                  <span className={`text-[10px] px-3 py-1 font-bold ${pillClass(paymentProgress)}`}>
                    {interview?.paymentCompleted && interview?.paymentVerified ? "Completed" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Enrolled Program Track</span>
                  <span className="text-sm font-bold text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100/50">
                    {interview?.chosenTrack || "Assigned Stream Track"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Error Banner */}
        {isError && (
          <Card className="border-yellow-200 bg-yellow-50/50 backdrop-blur-sm shadow-md">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-yellow-800">
                <AlertCircle className="h-4.5 w-4.5 text-yellow-600 shrink-0" />
                <p>{(error as any)?.response?.data?.error || "Connection latency: Failed to sync latest assessors schedules."}</p>
              </div>
              <button
                onClick={() => refetch()}
                className="px-3.5 py-1.5 bg-yellow-600 text-white font-bold text-xs rounded-lg hover:bg-yellow-700 active:scale-95 transition-all shrink-0"
              >
                Refresh Data
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
