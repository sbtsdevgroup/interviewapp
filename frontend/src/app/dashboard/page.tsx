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

  const progressPct = interview?.progress?.overall?.percentage ?? 0;
  const applicationProgress = interview?.progress?.application ?? 'pending';
  const paymentProgress = interview?.progress?.payment ?? (interview?.paymentCompleted && interview?.paymentVerified ? 'completed' : 'pending');
  const assessmentProgress = interview?.progress?.assessment ?? (interview?.assessmentStatus ?? 'pending');
  const interviewProgress = interview?.progress?.interview ?? (interview?.interviewCompleted ? 'completed' : interview?.interviewDate ? 'scheduled' : 'pending');

  const pillClass = (value?: string) => {
    const v = (value || '').toLowerCase();
    if (v.includes('approve') || v.includes('complete') || v === 'paid') return 'bg-green-100 text-green-800';
    if (v.includes('schedule')) return 'bg-orange-100 text-orange-800';
    return 'bg-slate-200 text-slate-700';
  };

  return (
    <DashboardLayout
      interviewLink={interviewLink}
      interviewScheduled={interviewScheduled}
      interviewCompleted={interview?.interviewCompleted}
    >
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Welcome back, {student?.fullName || "Student"}
          </h1>
        </div>

        <div className="bg-white rounded-[14px] p-4 space-y-4">
          {/* Application Progress */}
          <Card className="border-none bg-[#F6F7F9]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 1C13.3136 0.999969 15.5555 1.80213 17.344 3.26981C19.1324 4.73749 20.3566 6.77988 20.808 9.04897C21.2593 11.3181 20.91 13.6735 19.8194 15.7139C18.7288 17.7542 16.9645 19.3534 14.8271 20.2388C12.6896 21.1241 10.3113 21.241 8.0974 20.5694C5.88346 19.8979 3.97086 18.4794 2.6855 16.5558C1.40014 14.6322 0.821536 12.3223 1.04828 10.0199C1.27503 7.71751 2.29309 5.56495 3.929 3.929L6.757 6.757C5.77537 7.73847 5.16441 9.02994 5.02823 10.4114C4.89204 11.7928 5.23906 13.1787 6.01015 14.333C6.78125 15.4872 7.9287 16.3384 9.25701 16.7415C10.5853 17.1446 12.0123 17.0746 13.2948 16.5435C14.5773 16.0124 15.636 15.0531 16.2905 13.8289C16.945 12.6048 17.1548 11.1916 16.8841 9.83011C16.6135 8.46863 15.8791 7.24312 14.8062 6.36238C13.7332 5.48164 12.3881 5.00017 11 5V1Z"
                      fill="#596780"
                    />
                    <mask
                      id="mask0_2590_7082"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="22"
                      height="22"
                    >
                      <path d="M0 0H22V22H0V0Z" fill="white" />
                      <path
                        d="M11 1C13.3136 0.999969 15.5555 1.80213 17.344 3.26981C19.1324 4.73749 20.3566 6.77988 20.808 9.04897C21.2593 11.3181 20.91 13.6735 19.8194 15.7139C18.7288 17.7542 16.9645 19.3534 14.8271 20.2388C12.6896 21.1241 10.3113 21.241 8.0974 20.5694C5.88346 19.8979 3.97086 18.4794 2.6855 16.5558C1.40014 14.6322 0.821536 12.3223 1.04828 10.0199C1.27503 7.71751 2.29309 5.56495 3.929 3.929L6.757 6.757C5.77537 7.73847 5.16441 9.02994 5.02823 10.4114C4.89204 11.7928 5.23906 13.1787 6.01015 14.333C6.78125 15.4872 7.9287 16.3384 9.25701 16.7415C10.5853 17.1446 12.0123 17.0746 13.2948 16.5435C14.5773 16.0124 15.636 15.0531 16.2905 13.8289C16.945 12.6048 17.1548 11.1916 16.8841 9.83011C16.6135 8.46863 15.8791 7.24312 14.8062 6.36238C13.7332 5.48164 12.3881 5.00017 11 5V1Z"
                        fill="black"
                      />
                    </mask>
                    <g mask="url(#mask0_2590_7082)">
                      <path
                        d="M11 1V0H9.99998V1H11ZM3.92998 3.929L4.63698 3.222L3.92998 2.515L3.22298 3.222L3.92998 3.929ZM6.75798 6.757L7.46498 7.464L8.17298 6.757L7.46498 6.05L6.75798 6.757ZM11 5H9.99998V6H11V5ZM11 2C13.0823 1.99992 15.1003 2.72193 16.71 4.043L17.978 2.497C16.0108 0.882557 13.5448 0.000107865 11 0V2ZM16.71 4.043C18.3193 5.36394 19.4208 7.20199 19.827 9.244L21.789 8.854C21.2925 6.35808 19.9451 4.11149 17.978 2.497L16.71 4.043ZM19.827 9.244C20.2333 11.2864 19.9187 13.4065 18.937 15.243L20.701 16.185C21.9007 13.9408 22.2852 11.35 21.789 8.854L19.827 9.244ZM18.937 15.243C17.9554 17.0792 16.3676 18.5182 14.444 19.315L15.209 21.163C17.5604 20.189 19.5013 18.4297 20.701 16.185L18.937 15.243ZM14.444 19.315C12.5201 20.1117 10.3795 20.2167 8.38698 19.612L7.80698 21.526C10.242 22.2648 12.8579 22.1365 15.209 21.163L14.444 19.315ZM8.38698 19.612C6.39473 19.0075 4.67367 17.731 3.51698 16L1.85398 17.111C3.26785 19.227 5.37167 20.7873 7.80698 21.526L8.38698 19.612ZM3.51698 16C2.36004 14.2689 1.83912 12.1901 2.04298 10.118L0.0529751 9.922C-0.196851 12.4547 0.439282 14.9957 1.85298 17.112L3.51698 16ZM2.04298 10.118C2.2471 8.04572 3.16349 6.10834 4.63598 4.636L3.22298 3.222C1.4234 5.0215 0.302455 7.38932 0.0529751 9.922L2.04298 10.118ZM3.22198 4.636L6.04998 7.464L7.46397 6.05L4.63698 3.222L3.22198 4.636ZM6.04998 6.05C4.90495 7.19533 4.19348 8.70225 4.03498 10.314L6.02398 10.51C6.13713 9.35865 6.64604 8.28216 7.46397 7.464L6.04998 6.05ZM4.03498 10.314C3.87626 11.9257 4.28026 13.5425 5.17998 14.889L6.84298 13.778C6.20014 12.8162 5.9107 11.6613 6.02398 10.51L4.03498 10.314ZM5.17998 14.889C6.07957 16.2357 7.41927 17.2287 8.96898 17.699L9.54798 15.785C8.44133 15.449 7.48539 14.7397 6.84298 13.778L5.17998 14.889ZM8.96898 17.699C10.5186 18.1687 12.1821 18.0868 13.678 17.467L12.914 15.619C11.8456 16.0617 10.6548 16.1204 9.54798 15.785L8.96898 17.699ZM13.678 17.467C15.1746 16.8476 16.4102 15.7283 17.174 14.3L15.411 13.357C14.8654 14.3772 13.9829 15.1766 12.914 15.619L13.678 17.467ZM17.174 14.3C17.9375 12.8716 18.1821 11.2226 17.866 9.634L15.904 10.024C16.1299 11.1587 15.9563 12.3366 15.411 13.357L17.174 14.3ZM17.866 9.634C17.5494 8.04598 16.692 6.61683 15.44 5.59L14.171 7.136C15.0653 7.86995 15.6774 8.8913 15.903 10.026L17.866 9.634ZM15.44 5.59C14.1884 4.56239 12.6193 4.00048 11 4V6C12.1568 6.00001 13.2778 6.40112 14.172 7.135L15.44 5.59ZM12 5V1H9.99998V5H12Z"
                        fill="#596780"
                      />
                    </g>
                    <path
                      d="M11 11L4 4"
                      stroke="#596780"
                      strokeWidth="2.33333"
                      strokeLinecap="round"
                    />
                  </svg>
                  Application Progress
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {progressPct}%
                </div>
              </div>
              <div className="mt-3 w-full rounded-full bg-white h-3">
                <div
                  className="h-3 rounded-full bg-[#0D62D1] transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, progressPct))}%`,
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center justify-between md:justify-center md:gap-3">
                  <span className="text-slate-600">Application:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${pillClass(
                      applicationProgress
                    )}`}
                  >
                    {applicationProgress}
                  </span>
                </div>
                <div className="flex items-center justify-between md:justify-center md:gap-3">
                  <span className="text-slate-600">Payment:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${pillClass(
                      paymentProgress
                    )}`}
                  >
                    {paymentProgress}
                  </span>
                </div>
                <div className="flex items-center justify-between md:justify-center md:gap-3">
                  <span className="text-slate-600">Assessment:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${pillClass(
                      assessmentProgress
                    )}`}
                  >
                    {assessmentProgress}
                  </span>
                </div>
                <div className="flex items-center justify-between md:justify-center md:gap-3">
                  <span className="text-slate-600">Interview:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${pillClass(
                      interviewProgress
                    )}`}
                  >
                    {interviewProgress}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Interview status banner */}
          {!interviewScheduled && !interview?.interviewCompleted && (
            <Card className="border-none bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Hourglass className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">
                      Interview Not Yet Scheduled
                    </div>
                    <div className="text-sm text-slate-600">
                      Your interview will be scheduled soon. Please check back
                      regularly or contact support if you have questions.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* If scheduled, keep the join card (but toned down) */}
          {interviewScheduled && interviewLink && (
            <Card className="border-none bg-emerald-50">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">
                      Your Interview is Scheduled
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {formatDate(interview.interviewDate)}
                    </div>
                  </div>
                  <a
                    href={interviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors whitespace-nowrap text-center"
                  >
                    Join Interview
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
          {/* 4 small status cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#F6F7F9] border-none">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <IdCard
                      className="h-4 w-4 text-slate-600"
                      aria-hidden="true"
                    />
                  </span>
                  Application ID
                </div>
                <div className="mt-3 text-lg font-semibold text-slate-900 truncate">
                  {student?.applicationId || "N/A"}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Reg: {student?.registrationNumber || "Not assigned"}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#F6F7F9] border-none">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <Calendar
                      className="h-4 w-4 text-slate-600"
                      aria-hidden="true"
                    />
                  </span>
                  Schedule Status
                </div>
                <div className="mt-5">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold ${pillClass(
                      interviewProgress
                    )}`}
                  >
                    {interview?.interviewCompleted
                      ? "Completed"
                      : interview?.interviewDate
                      ? "Scheduled"
                      : "Pending"}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#F6F7F9] border-none">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <CreditCard
                      className="h-4 w-4 text-slate-600"
                      aria-hidden="true"
                    />
                  </span>
                  Payment Status
                </div>
                <div className="mt-5">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold ${pillClass(
                      paymentProgress
                    )}`}
                  >
                    {interview?.paymentCompleted && interview?.paymentVerified
                      ? "Paid"
                      : "Pending"}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#F6F7F9] border-none">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <ClipboardCheck
                      className="h-4 w-4 text-slate-600"
                      aria-hidden="true"
                    />
                  </span>
                  Assessment Status
                </div>
                <div className="mt-5">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold ${pillClass(
                      assessmentProgress
                    )}`}
                  >
                    {interview?.assessmentStatus === "completed"
                      ? "Completed"
                      : "Pending"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden bg-white border-none">
            <CardContent className="pt-6">
              <div className="inline-flex items-center gap-2 bg-black text-white rounded-full px-4 py-2 text-sm font-semibold">
                <User className="h-4 w-4" aria-hidden="true" />
                Personal Information
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Your complete personal and contact information
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 text-sm">
                <div>
                  <div className="text-xs text-slate-500">Full Name:</div>
                  <div className="font-medium text-slate-900">
                    {student?.fullName || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Email:</div>
                  <div className="font-medium text-slate-900 break-words">
                    {student?.email || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Phone Number:</div>
                  <div className="font-medium text-slate-900">
                    {student?.phone || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Date of Birth:</div>
                  <div className="font-medium text-slate-900">
                    {formatDate(student?.dateOfBirth)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Gender:</div>
                  <div className="font-medium text-slate-900">
                    {student?.gender || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">State of Origin:</div>
                  <div className="font-medium text-slate-900">
                    {student?.stateOfOrigin || "—"}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-slate-500">Location:</div>
                  <div className="font-medium text-slate-900">
                    {student?.currentResidence || "—"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-white border-none">
            <CardContent className="pt-6">
              <div className="inline-flex items-center gap-2 bg-black text-white rounded-full px-4 py-2 text-sm font-semibold">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
                Education Background
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Your academic qualifications and background
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 text-sm">
                <div>
                  <div className="text-xs text-slate-500">
                    Educational Level
                  </div>
                  <div className="font-medium text-slate-900">
                    {student?.education || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Institution</div>
                  <div className="font-medium text-slate-900">
                    {student?.institution || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Graduation Year</div>
                  <div className="font-medium text-slate-900">
                    {student?.graduationYear || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Field of Study</div>
                  <div className="font-medium text-slate-900">
                    {student?.fieldOfStudy || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">NYSC Status</div>
                  <div className="font-medium text-slate-900">
                    {student?.nyscStatus || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">NYSC Number</div>
                  <div className="font-medium text-slate-900">
                    {student?.nyscNumber || "—"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden bg-white border-none">
            <CardContent className="pt-6">
              <div className="inline-flex items-center gap-2 bg-black text-white rounded-full px-4 py-2 text-sm font-semibold">
                <Hourglass className="h-4 w-4" aria-hidden="true" />
                Interview Information
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Information about your interview which consist of the date and
                time
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-600">Interview Date</span>
                  <span className="font-medium text-slate-900">
                    {formatDate(interview?.interviewDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-600">Interview Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${pillClass(
                      interviewProgress
                    )}`}
                  >
                    {interview?.interviewCompleted
                      ? "Completed"
                      : interview?.interviewDate
                      ? "Scheduled"
                      : "Pending"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-white border-none">
            <CardContent className="pt-6">
              <div className="inline-flex items-center gap-2 bg-black text-white rounded-full px-4 py-2 text-sm font-semibold">
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                Payment Information
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Updated Information about your payment
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-600">Payment Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${pillClass(
                      paymentProgress
                    )}`}
                  >
                    {interview?.paymentCompleted && interview?.paymentVerified
                      ? "Completed"
                      : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-600">Application Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${pillClass(
                      interview?.status || "pending"
                    )}`}
                  >
                    {interview?.status || "Pending"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isError && (
          <Card className="border-yellow-500 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-yellow-800">
                  {(error as any)?.response?.data?.error ||
                    "Failed to load some data"}
                </p>
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

