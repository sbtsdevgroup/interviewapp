'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent } from '@/lib/hooks/use-student';
import { useAuthStore } from '@/lib/store/auth-store';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock3, Headset, HelpCircle, Hourglass, Play, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';

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

type QuestionType = 'long-text' | 'single-choice' | 'yes-no';

interface DummyQuestion {
  id: string;
  type: QuestionType;
  category: string;
  prompt: string;
  options?: string[];
}

const DUMMY_QUESTIONS: DummyQuestion[] = [
  {
    id: 'q1',
    type: 'long-text',
    category: 'Introduction',
    prompt: 'Tell us About Yourself and your Experience with ICBM Training',
  },
  {
    id: 'q2',
    type: 'single-choice',
    category: 'Background',
    prompt: 'Which track are you most interested in?',
    options: ['Frontend Engineering', 'Backend Engineering', 'Product Design', 'Data Analysis'],
  },
  {
    id: 'q3',
    type: 'yes-no',
    category: 'Availability',
    prompt: 'Are you currently available to commit at least 20 hours weekly?',
    options: ['Yes', 'No'],
  },
  {
    id: 'q4',
    type: 'long-text',
    category: 'Problem Solving',
    prompt: 'Describe a challenging problem you solved recently and your approach.',
  },
  {
    id: 'q5',
    type: 'single-choice',
    category: 'Tools',
    prompt: 'What is your strongest tooling area?',
    options: ['React/Next.js', 'Node.js/NestJS', 'SQL/Databases', 'UI/UX Design Systems'],
  },
  {
    id: 'q6',
    type: 'long-text',
    category: 'Goals',
    prompt: 'What outcome do you want from this interview process?',
  },
];

export default function InterviewPage() {
  const router = useRouter();
  const { token, isAuthenticated, _hasHydrated, student } = useAuthStore();
  const { interviewStatus, isLoading } = useStudent();
  const [showQuestionSession, setShowQuestionSession] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeftSec, setTimeLeftSec] = useState(41);
  const [answers, setAnswers] = useState<Record<string, string>>({});

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

  const activeQuestion = DUMMY_QUESTIONS[currentQuestion];
  const progressPercent = Math.round(((currentQuestion + 1) / DUMMY_QUESTIONS.length) * 100);

  const formattedTimer = useMemo(() => {
    const mm = Math.floor(timeLeftSec / 60);
    const ss = timeLeftSec % 60;
    return `${mm}:${ss.toString().padStart(2, '0')}`;
  }, [timeLeftSec]);

  useEffect(() => {
    if (!showQuestionSession) return;
    const timer = setInterval(() => {
      setTimeLeftSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showQuestionSession]);

  const updateAnswer = (value: string) => {
    const id = activeQuestion.id;
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <DashboardLayout
      interviewLink={interview.interviewLink}
      interviewScheduled={interviewScheduled}
      interviewCompleted={interview.interviewCompleted}
    >
      <div className="space-y-6">
        {(!interviewScheduled || showQuestionSession) && (
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Interview Information
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View your interview details and join when scheduled
            </p>
          </div>
        )}

        {/* Interview Status Card */}
        {!interviewScheduled && (
          <Card className="overflow-hidden bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="inline-flex items-center gap-2 bg-black text-white rounded-full px-4 py-2 text-sm font-semibold">
                <Hourglass className="h-4 w-4" aria-hidden="true" />
                Interview Status
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Information about your interview which consist of the date and
                time
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 text-sm">
                <div>
                  <div className="text-xs text-slate-500">Interview Date:</div>
                  <div className="mt-2 font-medium text-slate-900">
                    {formatDate(interview.interviewDate)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">
                    Interview Status:
                  </div>
                  <div className="mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${pillClass(
                        interviewStatusLabel
                      )}`}
                    >
                      {interviewStatusLabel}
                    </span>
                  </div>
                </div>
              </div>

              {!interview.interviewDate && (
                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
                  Your interview will be scheduled soon. Please check back
                  regularly or contact support if you have questions.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Scheduled Interview Overview */}
        {interviewScheduled && hasInterviewLink && !showQuestionSession && (
          <Card className="overflow-hidden border-slate-200 bg-white">
            <CardContent className="pt-6 space-y-4">
              <div className="bg-white p-6 rounded-xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <svg
                    width="55"
                    height="55"
                    viewBox="0 0 55 55"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="27.5"
                      cy="27.5"
                      r="27.5"
                      fill="#0D62D1"
                      fill-opacity="0.1"
                    />
                    <path
                      d="M29.8735 39.1277C28.7356 37.9898 28.1667 36.6139 28.1667 35C28.1667 33.3861 28.7356 32.0106 29.8735 30.8735C31.0114 29.7364 32.3869 29.1674 34 29.1667C35.6131 29.1659 36.989 29.7348 38.1277 30.8735C39.2663 32.0122 39.8349 33.3877 39.8333 35C39.8318 36.6123 39.2628 37.9882 38.1265 39.1277C36.9902 40.2671 35.6147 40.8357 34 40.8333C32.3853 40.831 31.0098 40.2632 29.8735 39.1277ZM34.525 38.2958C34.6611 38.1597 34.7292 37.9847 34.7292 37.7708C34.7292 37.5569 34.6611 37.3819 34.525 37.2458C34.3889 37.1097 34.2139 37.0417 34 37.0417C33.7861 37.0417 33.6111 37.1097 33.475 37.2458C33.3389 37.3819 33.2708 37.5569 33.2708 37.7708C33.2708 37.9847 33.3389 38.1597 33.475 38.2958C33.6111 38.4319 33.7861 38.5 34 38.5C34.2139 38.5 34.3889 38.4319 34.525 38.2958ZM33.475 36.2833H34.5542V35.9917C34.5542 35.7778 34.6078 35.588 34.7152 35.4223C34.8225 35.2567 34.9536 35.0964 35.1083 34.9417C35.3806 34.7083 35.5944 34.4847 35.75 34.2708C35.9056 34.0569 35.9833 33.7556 35.9833 33.3667C35.9833 32.8028 35.7986 32.3509 35.4292 32.011C35.0597 31.6711 34.5833 31.5008 34 31.5C33.5528 31.5 33.1495 31.6314 32.7902 31.8943C32.4308 32.1572 32.173 32.5119 32.0167 32.9583L32.95 33.3667C33.0083 33.1333 33.1301 32.9292 33.3152 32.7542C33.5003 32.5792 33.7285 32.4917 34 32.4917C34.2917 32.4917 34.5203 32.5648 34.686 32.711C34.8517 32.8572 34.9341 33.0758 34.9333 33.3667C34.9333 33.5806 34.875 33.7606 34.7583 33.9068C34.6417 34.0531 34.5055 34.2036 34.35 34.3583C34.2333 34.475 34.112 34.5917 33.986 34.7083C33.86 34.825 33.748 34.9611 33.65 35.1167C33.5917 35.2333 33.5481 35.35 33.5193 35.4667C33.4905 35.5833 33.4758 35.7194 33.475 35.875V36.2833ZM17.6667 38.5C17.025 38.5 16.4759 38.2717 16.0193 37.8152C15.5628 37.3586 15.3341 36.8091 15.3333 36.1667V33.8333C15.3333 33.1917 15.562 32.6426 16.0193 32.186C16.4767 31.7294 17.0258 31.5008 17.6667 31.5H18.8333V25.6667C18.8333 23.3917 19.6259 21.462 21.211 19.8777C22.7961 18.2933 24.7258 17.5008 27 17.5C29.2742 17.4992 31.2043 18.2918 32.7902 19.8777C34.376 21.4636 35.1682 23.3932 35.1667 25.6667V26.9208C34.9722 26.8819 34.7824 26.8578 34.5973 26.8485C34.4122 26.8392 34.2131 26.8341 34 26.8333C31.7444 26.8333 29.8194 27.6259 28.225 29.211C26.6306 30.7961 25.8333 32.7258 25.8333 35C25.8333 35.6028 25.8967 36.2009 26.0235 36.7943C26.1503 37.3878 26.3494 37.9563 26.6208 38.5H17.6667ZM22.3333 29.1667H24.6667V25.6667C24.6667 25.025 24.8953 24.4759 25.3527 24.0193C25.81 23.5628 26.3591 23.3341 27 23.3333V21C25.7167 21 24.6181 21.4569 23.7042 22.3708C22.7903 23.2847 22.3333 24.3833 22.3333 25.6667V29.1667Z"
                      fill="#0D62D1"
                    />
                  </svg>

                  <div className="min-w-0">
                    <div className="text-base font-semibold text-slate-900 truncate">
                      AI-Powered Interview Assessment
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      ICBM Training Interview Assessment
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="text-sm font-semibold text-slate-900">
                    Interview Overview
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50  rounded-lg p-5 min-h-[106px] flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-full bg-[#D9D9D9]  flex items-center justify-center">
                        <HelpCircle
                          className="h-4 w-4 text-slate-600"
                          aria-hidden="true"
                        />
                      </span>
                      <div className="text-sm font-semibold text-slate-900 flex justify-center items-center gap-2">
                        <p>Questions</p>
                      </div>
                    </div>
                    <div className="mt-3 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold flex justify-center items-center gap-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_2636_8929)">
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M10.0058 0.416504C4.70959 0.416504 0.416252 4.70984 0.416252 10.0061C0.416252 14.6873 3.77042 18.5844 8.20667 19.4269C8.72625 19.5257 9.17209 19.1153 9.17209 18.6169V16.7828C9.17209 16.3786 8.88667 16.0515 8.52 15.9603C5.84917 15.2961 3.87 12.8815 3.87 10.0061C3.87 6.61734 6.61709 3.87067 10.0058 3.87067C12.9158 3.87067 15.3533 5.89692 15.9829 8.6165C16.0692 8.98859 16.3988 9.28192 16.8088 9.28192H18.6367C19.1313 9.28192 19.5396 8.84275 19.4483 8.32609C18.6542 3.83109 14.7292 0.416504 10.0058 0.416504ZM14.1392 15.4273C13.8567 15.1444 13.4283 15.1123 13.1058 15.3019C12.6019 15.5978 12.058 15.8195 11.4908 15.9603C11.1242 16.0515 10.8392 16.3786 10.8392 16.7828V18.6169C10.8392 19.1153 11.285 19.5253 11.8046 19.4269C13.0624 19.1879 14.2592 18.6982 15.3238 17.9869C15.7663 17.6915 15.7942 17.0819 15.4396 16.7273L14.1392 15.4273ZM15.9379 11.5778C16.0367 11.2219 16.3592 10.9486 16.7546 10.9486H18.5954C19.0975 10.9486 19.5096 11.4011 19.4033 11.9236C19.1456 13.1949 18.6307 14.4001 17.8904 15.4653C17.5904 15.8978 16.9892 15.9203 16.6388 15.5698L15.345 14.2761C15.0588 13.9898 15.0296 13.5565 15.225 13.2332L15.235 13.2153C15.2872 13.1223 15.3385 13.029 15.3892 12.9353C15.4833 12.7611 15.585 12.5653 15.64 12.4382C15.6954 12.3107 15.7692 12.0994 15.8321 11.9082C15.8663 11.8049 15.8997 11.7012 15.9321 11.5973L15.9379 11.5778Z"
                            fill="#0D62D1"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_2636_8929">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      15
                    </div>
                  </div>
                  <div className="bg-slate-50  rounded-lg p-5 min-h-[106px] flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-full bg-[#D9D9D9]  flex items-center justify-center">
                        <Clock3
                          className="h-4 w-4 text-slate-600"
                          aria-hidden="true"
                        />
                      </span>
                      <div className="text-sm font-semibold text-slate-900">
                        Minutes
                      </div>
                    </div>
                    <div className="mt-3 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold flex justify-center items-center gap-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_2636_8904)">
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M10.0058 0.416504C4.70958 0.416504 0.416245 4.70984 0.416245 10.0061C0.416245 14.6873 3.77041 18.5844 8.20666 19.4269C8.72624 19.5257 9.17208 19.1153 9.17208 18.6169V16.7828C9.17208 16.3786 8.88666 16.0515 8.51999 15.9603C5.84916 15.2961 3.86999 12.8815 3.86999 10.0061C3.86999 6.61734 6.61708 3.87067 10.0058 3.87067C12.9158 3.87067 15.3533 5.89692 15.9829 8.6165C16.0692 8.98859 16.3987 9.28192 16.8087 9.28192H18.6367C19.1312 9.28192 19.5396 8.84275 19.4483 8.32609C18.6542 3.83109 14.7292 0.416504 10.0058 0.416504ZM14.1392 15.4273C13.8567 15.1444 13.4283 15.1123 13.1058 15.3019C12.6019 15.5978 12.058 15.8195 11.4908 15.9603C11.1242 16.0515 10.8392 16.3786 10.8392 16.7828V18.6169C10.8392 19.1153 11.285 19.5253 11.8046 19.4269C13.0624 19.1879 14.2592 18.6982 15.3237 17.9869C15.7662 17.6915 15.7942 17.0819 15.4396 16.7273L14.1392 15.4273ZM15.9379 11.5778C16.0367 11.2219 16.3592 10.9486 16.7546 10.9486H18.5954C19.0975 10.9486 19.5096 11.4011 19.4033 11.9236C19.1456 13.1949 18.6307 14.4001 17.8904 15.4653C17.5904 15.8978 16.9892 15.9203 16.6387 15.5698L15.345 14.2761C15.0587 13.9898 15.0296 13.5565 15.225 13.2332L15.235 13.2153C15.2871 13.1223 15.3385 13.029 15.3892 12.9353C15.4833 12.7611 15.585 12.5653 15.64 12.4382C15.6954 12.3107 15.7692 12.0994 15.8321 11.9082C15.8663 11.8049 15.8997 11.7012 15.9321 11.5973L15.9379 11.5778Z"
                            fill="#B76505"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_2636_8904">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      15
                    </div>
                  </div>
                  <div className="bg-slate-50  rounded-lg p-5 min-h-[106px] flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-full bg-[#D9D9D9]  flex items-center justify-center">
                        <Sparkles
                          className="h-4 w-4 text-slate-600"
                          aria-hidden="true"
                        />
                      </span>
                      <div className="text-sm font-semibold text-slate-900">
                        AI
                      </div>
                    </div>
                    <div className="mt-3 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold flex justify-center items-center gap-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <mask
                          id="mask0_2636_8908"
                          maskUnits="userSpaceOnUse"
                          x="1"
                          y="0"
                          width="18"
                          height="20"
                        >
                          <path
                            d="M10 1.6665L12.1888 3.26317L14.8983 3.25817L15.7304 5.8365L17.9254 7.42484L17.0833 9.99984L17.9254 12.5748L15.7304 14.1632L14.8983 16.7415L12.1888 16.7365L10 18.3332L7.81125 16.7365L5.10167 16.7415L4.26958 14.1632L2.07458 12.5748L2.91667 9.99984L2.07458 7.42484L4.26958 5.8365L5.10167 3.25817L7.81125 3.26317L10 1.6665Z"
                            fill="white"
                            stroke="white"
                            stroke-width="1.66667"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M7.08331 9.99984L9.16665 12.0832L13.3333 7.9165"
                            stroke="black"
                            stroke-width="1.66667"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </mask>
                        <g mask="url(#mask0_2636_8908)">
                          <path d="M0 0H20V20H0V0Z" fill="#018A13" />
                        </g>
                      </svg>
                      Evaluated
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-white border border-slate-100">
                <div className="">
                  <div className="flex justify-start items-center gap-2">
                    <svg
                      width="55"
                      height="55"
                      viewBox="0 0 55 55"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="27.5"
                        cy="27.5"
                        r="27.5"
                        fill="#0D62D1"
                        fill-opacity="0.1"
                      />
                      <path
                        d="M23.6248 20.3562C24.3225 18.3145 27.1435 18.2527 27.9707 20.1707L28.0407 20.3573L28.9822 23.1107C29.1979 23.7421 29.5466 24.3199 30.0047 24.8052C30.4627 25.2904 31.0195 25.6717 31.6375 25.9235L31.8907 26.018L34.644 26.9583C36.6857 27.656 36.7475 30.477 34.8307 31.3042L34.644 31.3742L31.8907 32.3157C31.259 32.5313 30.681 32.8799 30.1955 33.338C29.7101 33.796 29.3285 34.3529 29.0767 34.971L28.9822 35.223L28.0418 37.9775C27.3442 40.0192 24.5232 40.081 23.6972 38.1642L23.6248 37.9775L22.6845 35.2242C22.4689 34.5925 22.1203 34.0145 21.6622 33.529C21.2041 33.0436 20.6473 32.662 20.0292 32.4102L19.7772 32.3157L17.0238 31.3753C14.981 30.6777 14.9192 27.8567 16.8372 27.0307L17.0238 26.9583L19.7772 26.018C20.4086 25.8022 20.9864 25.4536 21.4717 24.9955C21.9569 24.5374 22.3382 23.9806 22.59 23.3627L22.6845 23.1107L23.6248 20.3562ZM25.8333 21.1098L24.893 23.8632C24.5645 24.826 24.03 25.7057 23.3268 26.4409C22.6236 27.1761 21.7686 27.7492 20.8213 28.1203L20.5297 28.2265L17.7763 29.1668L20.5297 30.1072C21.4925 30.4357 22.3722 30.9702 23.1074 31.6734C23.8426 32.3766 24.4157 33.2316 24.7868 34.1788L24.893 34.4705L25.8333 37.2238L26.7737 34.4705C27.1022 33.5076 27.6367 32.628 28.3399 31.8927C29.0431 31.1575 29.8981 30.5844 30.8453 30.2133L31.137 30.1083L33.8903 29.1668L31.137 28.2265C30.1741 27.898 29.2945 27.3635 28.5593 26.6603C27.824 25.9571 27.2509 25.1021 26.8798 24.1548L26.7748 23.8632L25.8333 21.1098ZM35.1667 16.3335C35.3849 16.3335 35.5988 16.3947 35.784 16.5102C35.9692 16.6257 36.1183 16.7908 36.2143 16.9868L36.2703 17.1233L36.6787 18.3203L37.8768 18.7287C38.0956 18.803 38.2873 18.9405 38.4278 19.1239C38.5682 19.3073 38.6511 19.5283 38.6658 19.7589C38.6806 19.9894 38.6265 20.2191 38.5106 20.4189C38.3946 20.6187 38.222 20.7796 38.0145 20.8812L37.8768 20.9372L36.6798 21.3455L36.2715 22.5437C36.1971 22.7623 36.0594 22.954 35.8759 23.0943C35.6924 23.2347 35.4714 23.3174 35.2409 23.332C35.0104 23.3466 34.7807 23.2925 34.581 23.1764C34.3813 23.0604 34.2205 22.8877 34.119 22.6802L34.063 22.5437L33.6547 21.3467L32.4565 20.9383C32.2378 20.864 32.046 20.7264 31.9056 20.543C31.7651 20.3596 31.6823 20.1387 31.6675 19.9081C31.6528 19.6776 31.7068 19.4479 31.8227 19.2481C31.9387 19.0483 32.1114 18.8874 32.3188 18.7858L32.4565 18.7298L33.6535 18.3215L34.0618 17.1233C34.1405 16.8928 34.2893 16.6927 34.4875 16.5511C34.6856 16.4094 34.9231 16.3333 35.1667 16.3335Z"
                        fill="#0D62D1"
                      />
                    </svg>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        What to Expect:
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        What you should expect from the interview
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      "Mix of multiple-choice and open-ended questions",
                      "Each question has a time limit to complete",
                      "You can navigate back to previous questions",
                      "AI will analyze your responses for relevant insights",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="12" cy="12" r="12" fill="#0D62D1" />
                          <g clip-path="url(#clip0_2636_8959)">
                            <path
                              d="M6.40945 11.8805C8.08172 13.6899 9.70313 15.3188 11.2617 17.379C12.9563 14.0087 14.6906 10.6266 17.5523 6.96404L16.7813 6.61084C14.3648 9.1735 12.4875 11.5993 10.8563 14.4821C9.72188 13.4602 7.8886 12.0141 6.76922 11.2712L6.40945 11.8805Z"
                              fill="white"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_2636_8959">
                              <rect
                                width="12"
                                height="12"
                                fill="white"
                                transform="translate(6 6)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                        <div className="text-sm text-slate-700 font-medium">
                          {item}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
                  <span className="text-sm font-semibold text-amber-900">
                    Tips:
                  </span>
                  <span className="text-sm text-amber-800 ml-2">
                    Take your time to provide thoughtful answers. Quality
                    matters more than speed.
                  </span>
                </div>
                <Button
                  onClick={() => {
                    setShowQuestionSession(true);
                    setCurrentQuestion(0);
                    setTimeLeftSec(15 * 60);
                  }}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 text-base"
                  size="lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Play className="h-4 w-4" aria-hidden="true" />
                    Start Interview
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question-based Interview Session (dummy UI) */}
        {interviewScheduled && hasInterviewLink && showQuestionSession && (
          <Card className="overflow-hidden border-slate-200 bg-white">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Headset className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-3xl font-semibold text-slate-900 leading-tight">
                      AI-Powered Interview Assessment
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      ICBM Training Interview Assessment
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-100 px-5 py-3 flex items-center gap-2 text-slate-900 font-semibold">
                  <Clock3 className="h-5 w-5" aria-hidden="true" />
                  {formattedTimer}
                </div>
              </div>

              <div className="mt-7">
                <div className="text-sm text-slate-800 font-medium">
                  Question {currentQuestion + 1} of {DUMMY_QUESTIONS.length}
                </div>
                <div className="mt-2 h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-slate-700 font-semibold">{progressPercent}%</span>
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-slate-50 p-7">
                <div className="inline-flex px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 text-sm font-medium">
                  {activeQuestion.category}
                </div>

                <h2 className="mt-5 text-2xl leading-tight font-semibold text-slate-900">
                  {activeQuestion.prompt}
                </h2>

                <div className="mt-7">
                  {activeQuestion.type === 'long-text' && (
                    <textarea
                      value={answers[activeQuestion.id] || ''}
                      onChange={(e) => updateAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full min-h-[180px] rounded-xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {activeQuestion.type === 'single-choice' && (
                    <div className="space-y-3">
                      {activeQuestion.options?.map((option) => {
                        const selected = answers[activeQuestion.id] === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateAnswer(option)}
                            className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                              selected
                                ? 'border-blue-500 bg-blue-50 text-blue-800'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {activeQuestion.type === 'yes-no' && (
                    <div className="grid grid-cols-2 gap-3">
                      {activeQuestion.options?.map((option) => {
                        const selected = answers[activeQuestion.id] === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => updateAnswer(option)}
                            className={`rounded-xl border px-4 py-3 text-center font-medium transition-colors ${
                              selected
                                ? 'border-blue-500 bg-blue-50 text-blue-800'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-slate-200 bg-white hover:bg-slate-50"
                  >
                    Voice Input
                  </Button>
                  <div className="rounded-full bg-white border border-slate-200 px-4 py-2 text-sm text-slate-600">
                    {(answers[activeQuestion.id] || '').length} characters
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200"
                  onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-3">
                  {DUMMY_QUESTIONS.map((q, idx) => (
                    <button
                      key={q.id}
                      type="button"
                      className={`h-2.5 w-2.5 rounded-full ${
                        idx === currentQuestion ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      onClick={() => setCurrentQuestion(idx)}
                      aria-label={`Go to question ${idx + 1}`}
                    />
                  ))}
                </div>

                <Button
                  type="button"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    if (currentQuestion < DUMMY_QUESTIONS.length - 1) {
                      setCurrentQuestion((prev) => prev + 1);
                      return;
                    }
                    setShowQuestionSession(false);
                  }}
                >
                  {currentQuestion < DUMMY_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Interview'}
                </Button>
              </div>
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
              <div className="text-xs text-slate-500 mt-2">
                Your interview outcome and selected track details
              </div>

              <div className="space-y-4">
                {interview.interviewScore !== null &&
                  interview.interviewScore !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        Interview Score
                      </span>
                      <span className="text-2xl font-bold text-slate-900">
                        {interview.interviewScore}%
                      </span>
                    </div>
                  )}

                {interview.chosenTrack && (
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 mb-1">
                      Selected Track
                    </span>
                    <span className="text-lg font-semibold text-slate-900">
                      {interview.chosenTrack}
                    </span>
                  </div>
                )}

                {interview.top3Tracks && interview.top3Tracks.length > 0 && (
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 mb-1">
                      Top 3 Track Preferences
                    </span>
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
                    <span className="text-xs text-slate-500 mb-2">
                      Interview Notes
                    </span>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <p className="text-slate-700 whitespace-pre-wrap">
                        {interview.interviewNotes}
                      </p>
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
                  Your interview is scheduled for{" "}
                  {formatDate(interview.interviewDate)}, but the meeting link is
                  not yet available.
                </p>
                <p className="text-sm text-yellow-700">
                  Please check back closer to your interview time or contact
                  support for assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

