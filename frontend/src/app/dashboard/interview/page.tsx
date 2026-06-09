'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent } from '@/lib/hooks/use-student';
import { useAuthStore } from '@/lib/store/auth-store';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock3,
  Headset,
  HelpCircle,
  Hourglass,
  Play,
  Sparkles,
  Loader2,
  CheckCircle2,
  PartyPopper,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Award,
  BookOpen,
  Volume2,
  MessageSquare,
  Calendar,
  CalendarDays
} from 'lucide-react';
import { aiInterviewAPI, AIInterview, AIQuestion, AIResponse } from '@/services/ai-interview-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

const renderQuestionText = (text?: string) => {
  if (!text) return null;

  // Find the first occurrence of "1. " or "1.  " (with word boundary or at start of list)
  const firstListIndex = text.search(/\b1\.\s+/);
  if (firstListIndex !== -1) {
    const header = text.substring(0, firstListIndex).trim();
    const listBody = text.substring(firstListIndex);
    
    // Split the body by digits followed by a period and space
    const items = listBody.split(/\b\d+\.\s+/).map(item => item.trim()).filter(Boolean);
    
    return (
      <div className="space-y-4">
        {header && (
          <h2 className="text-slate-800 text-base sm:text-lg font-bold leading-relaxed">
            {header}
          </h2>
        )}
        <ol className="space-y-3 pl-1">
          {items.map((item, idx) => (
            <li key={idx} className="text-slate-700 text-sm sm:text-base font-normal leading-relaxed pl-6 -indent-6">
              <span className="font-bold text-indigo-600 mr-2">{idx + 1}.</span>
              {item}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  // If there are newlines, split them
  if (text.includes('\n')) {
    return (
      <div className="space-y-3">
        {text.split('\n').map((line, idx) => (
          <p key={idx} className="text-slate-700 text-sm sm:text-base font-normal leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    );
  }

  // Default normal question
  return (
    <h2 className="text-slate-800 text-lg sm:text-xl font-bold leading-snug">
      {text}
    </h2>
  );
};

export default function InterviewPage() {
  const router = useRouter();
  const { token, isAuthenticated, _hasHydrated } = useAuthStore();
  const { interviewStatus, isLoading: studentLoading } = useStudent();
  const [showQuestionSession, setShowQuestionSession] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeftSec, setTimeLeftSec] = useState(90 * 60);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([]);
  const [aiInterview, setAiInterview] = useState<AIInterview | null>(null);
  const [aiResults, setAiResults] = useState<AIResponse[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [finished, setFinished] = useState(false);

  const interview = interviewStatus as InterviewStatus | null;

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    const fetchAiData = async () => {
      try {
        setIsAiLoading(true);
        const [pending, questions] = await Promise.all([
          aiInterviewAPI.getPendingInterview().catch(() => null),
          aiInterviewAPI.getPublishedQuestions()
        ]);
        
        setAiInterview(pending);
        setAiQuestions(questions || []);

        if (pending && pending.status === 'COMPLETED') {
          const results = await aiInterviewAPI.getResults(pending.id);
          setAiResults(results);
        }
      } catch (err) {
        console.error('Failed to fetch AI data:', err);
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchAiData();
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

  const activeQuestion = aiQuestions?.[currentQuestion];
  const progressPercent = aiQuestions.length > 0 ? Math.round(((currentQuestion + 1) / aiQuestions.length) * 100) : 0;

  const formattedTimer = useMemo(() => {
    const mm = Math.floor(timeLeftSec / 60);
    const ss = timeLeftSec % 60;
    return `${mm}:${ss.toString().padStart(2, '0')}`;
  }, [timeLeftSec]);

  useEffect(() => {
    if (!showQuestionSession) return;
    const timer = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Trigger automatic close if timer hits zero
          setShowQuestionSession(false);
          setShowExpiryModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showQuestionSession]);

  if (studentLoading || isAiLoading) {
    return (
      <DashboardLayout
        interviewLink={interview?.interviewLink}
        interviewScheduled={!!interview?.interviewDate && !interview?.interviewCompleted}
        interviewCompleted={interview?.interviewCompleted}
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-600 font-medium animate-pulse">Loading interview details...</p>
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
            <p className="text-slate-600 font-medium">No interview information available.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const interviewScheduled = !!interview.interviewDate && !interview.interviewCompleted;
  const hasInterviewLink = !!interview.interviewLink || !!aiInterview;

  const pillClass = (value?: string) => {
    const v = (value || '').toLowerCase();
    if (v.includes('complete') || v === 'approved' || v === 'paid') return 'bg-emerald-50 text-emerald-700 border border-emerald-200/50';
    if (v.includes('schedule') || v === 'scheduled') return 'bg-blue-50 text-blue-700 border border-blue-200/50';
    return 'bg-slate-100 text-slate-600 border border-slate-200/50';
  };

  const interviewStatusLabel = interview.interviewCompleted || aiInterview?.status === 'COMPLETED'
    ? 'Completed'
    : interview.interviewDate
      ? 'Scheduled'
      : 'Not Scheduled';

  const updateAnswer = (value: string) => {
    if (!activeQuestion) return;
    const id = activeQuestion.id;
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const getChecklistSelected = (option: string) => {
    if (!activeQuestion) return false;
    const currentAnswer = answers[activeQuestion.id] || '';
    const selectedItems = currentAnswer ? currentAnswer.split(', ') : [];
    return selectedItems.includes(option);
  };

  const handleChecklistClick = (option: string) => {
    if (!activeQuestion) return;
    const currentAnswer = answers[activeQuestion.id] || '';
    let selectedItems = currentAnswer ? currentAnswer.split(', ') : [];
    const idx = selectedItems.indexOf(option);
    if (idx !== -1) {
      selectedItems.splice(idx, 1);
    } else {
      selectedItems.push(option);
    }
    updateAnswer(selectedItems.join(', '));
  };

  const getRank = (option: string) => {
    if (!activeQuestion) return null;
    const currentAnswer = answers[activeQuestion.id] || '';
    const rankedItems = currentAnswer ? currentAnswer.split(', ').map(s => s.replace(/^\d+\.\s+/, '')) : [];
    const idx = rankedItems.indexOf(option);
    return idx !== -1 ? idx + 1 : null;
  };

  const handleRankClick = (option: string) => {
    if (!activeQuestion) return;
    const currentAnswer = answers[activeQuestion.id] || '';
    let rankedItems = currentAnswer ? currentAnswer.split(', ').map(s => s.replace(/^\d+\.\s+/, '')) : [];
    
    const existingIdx = rankedItems.indexOf(option);
    if (existingIdx !== -1) {
      // Remove from ranking
      rankedItems.splice(existingIdx, 1);
    } else {
      // Add to ranking
      rankedItems.push(option);
    }
    
    // Format as "1. Option A, 2. Option B..."
    const newAnswer = rankedItems.map((item, idx) => `${idx + 1}. ${item}`).join(', ');
    updateAnswer(newAnswer);
  };

  const isInterviewFinished = interview.interviewCompleted || aiInterview?.status === 'COMPLETED';

  return (
    <DashboardLayout
      interviewLink={interview.interviewLink}
      interviewScheduled={interviewScheduled}
      interviewCompleted={isInterviewFinished}
    >
      <div className="space-y-6 pb-12">
        {/* Welcome Section / Header (only visible when not in active session) */}
        {!showQuestionSession && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md mb-4 border border-white/10">
                <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
                AI Evaluation Panel
              </span>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
                AI-Powered Interview Assessment
              </h1>
              <p className="mt-2 text-blue-100 max-w-xl text-sm sm:text-base leading-relaxed">
                Interact with our custom AI panel evaluator to verify technical alignment and course path placement diagnostics.
              </p>
            </div>
            {/* Decorative background gradients */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
          </div>
        )}

        {/* Scheduled Interview Details (Overview Screen) */}
        {interviewScheduled && hasInterviewLink && !showQuestionSession && !isInterviewFinished && (
          <div className="space-y-6">
            {/* Interview Schedule Time Header */}
            <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
                  <Hourglass className="h-4.5 w-4.5 text-indigo-500" />
                  Interview Schedule Status
                </CardTitle>
                <Badge className={`text-[10px] px-3 py-1 font-bold ${pillClass(interviewStatusLabel)}`}>
                  {interviewStatusLabel}
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-semibold">Scheduled Date & Time</div>
                      <div className="font-bold text-slate-800 mt-1">{formatDate(interview.interviewDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                      <Clock3 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-semibold">Allocated Session Time</div>
                      <div className="font-bold text-slate-800 mt-1">90 Minutes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Setup Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Questions Count Card */}
              <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl hover:shadow-md transition-all duration-300 group">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Questions</span>
                    <span className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/30">
                      <HelpCircle className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-extrabold text-slate-800">
                      {aiQuestions.length || 15}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-semibold">
                      Curated Technical Questions
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Limits Card */}
              <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl hover:shadow-md transition-all duration-300 group">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Exam Duration</span>
                    <span className="h-9 w-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100/30">
                      <Clock3 className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-extrabold text-slate-800">
                      90 Min
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-semibold">
                      Automatic Expiry Timer Set
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Evaluation Status Card (improved to be fully dynamic) */}
              <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl hover:shadow-md transition-all duration-300 group">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Evaluation Status</span>
                    <span className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/30">
                      <Sparkles className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-1.5 mt-1">
                      {isInterviewFinished ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                          Evaluated
                        </Badge>
                      ) : (
                        <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs animate-pulse">
                          Ready to Start
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-2 font-semibold">
                      {isInterviewFinished ? "Assessment evaluation completed" : "Assessment is waiting to start"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Setup instructions & Rules */}
            <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
                <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
                  <BookOpen className="h-4.5 w-4.5 text-indigo-500" />
                  What to Expect from this Session
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Mix of technical multiple-choice & scenario-based open questions",
                    "A strict 90-minute total countdown limits response periods",
                    "Self-paced progression (ability to navigate back and review answers)",
                    "Automatic AI scoring model generates results instantly upon submit"
                  ].map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-slate-700 leading-normal">{rule}</span>
                    </div>
                  ))}
                </div>

                {/* Tips Box */}
                <div className="mt-6 flex items-start gap-3 p-4 border border-amber-200/50 bg-amber-50/30 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-bold text-amber-900 block">Pro Tip:</span>
                    <p className="text-xs text-amber-800 mt-0.5 font-medium leading-relaxed">
                      Take your time to structure clear, concise responses. Technical precision and articulation score higher than formatting speed.
                    </p>
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  onClick={async () => {
                    if (!aiInterview) {
                      alert('No pending AI interview session registered in SQLite DB. Please contact support.');
                      return;
                    }
                    try {
                      await aiInterviewAPI.startInterview(aiInterview.id);
                      setShowQuestionSession(true);
                      setCurrentQuestion(0);
                      setTimeLeftSec(90 * 60);
                    } catch (err) {
                      alert('Failed to initialize active interview session.');
                    }
                  }}
                  className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-6 text-base rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200/50 active:scale-[0.99] transition-all"
                  size="lg"
                  disabled={!aiInterview}
                >
                  <Play className="h-5 w-5 mr-2" />
                  {aiInterview ? 'Start AI Assessment Session' : 'Interview Session Not Scheduled'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Assessment Session Screen */}
        {interviewScheduled && hasInterviewLink && showQuestionSession && (
          <Card className="border border-slate-200/80 bg-white shadow-lg rounded-2xl overflow-hidden max-w-4xl mx-auto my-4">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-5 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Headset className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-slate-800 text-base font-extrabold">Active Assessment Session</CardTitle>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Keep tab open and stay connected</p>
                </div>
              </div>

              {/* Timer Badge */}
              <div className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold border transition-colors
                ${timeLeftSec < 120 
                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                  : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                }
              `}>
                <Clock3 className="h-4.5 w-4.5" />
                {formattedTimer}
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              {aiQuestions.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  No interview questions available. Please contact support.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Progress Indicators */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                      <span>Question {currentQuestion + 1} of {aiQuestions.length}</span>
                      <span>{progressPercent}% Complete</span>
                    </div>
                    <div className="w-full rounded-full bg-slate-100 h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Box */}
                  <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-6 sm:p-8 space-y-4">
                    <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-[10px] px-2.5 py-1">
                      {activeQuestion?.category}
                    </Badge>
                    {renderQuestionText(activeQuestion?.text)}

                    {/* Answer Inputs based on Question Type */}
                    <div className="pt-4">
                      {activeQuestion?.type === 'long-text' && (
                        <textarea
                          value={answers[activeQuestion?.id] || ''}
                          onChange={(e) => updateAnswer(e.target.value)}
                          placeholder="Type your detailed answer here..."
                          disabled={submitting}
                          className="w-full min-h-[180px] rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                        />
                      )}

                      {(activeQuestion?.type === 'single-choice' || activeQuestion?.type === 'multiple-choice') && (
                        <div className="grid grid-cols-1 gap-3">
                          {activeQuestion?.options?.map((option) => {
                            const selected = (activeQuestion?.id ? answers[activeQuestion.id] : undefined) === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => updateAnswer(option)}
                                className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all text-sm font-semibold ${
                                  selected
                                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm shadow-indigo-100/50'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {(activeQuestion?.type === 'yes-no' || activeQuestion?.type === 'true-false') && (
                        <div className="grid grid-cols-2 gap-4">
                          {activeQuestion?.options?.map((option) => {
                            const selected = (activeQuestion?.id ? answers[activeQuestion.id] : undefined) === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => updateAnswer(option)}
                                className={`rounded-xl border px-4 py-4 text-center font-semibold transition-all text-sm ${
                                  selected
                                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm shadow-indigo-100/50'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {activeQuestion?.type === 'checklist' && (
                        <div className="grid grid-cols-1 gap-3">
                          {activeQuestion?.options?.map((option) => {
                            const selected = getChecklistSelected(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => handleChecklistClick(option)}
                                className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all text-sm font-semibold flex items-center justify-between ${
                                  selected
                                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm shadow-indigo-100/50'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                              >
                                <span>{option}</span>
                                <span className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                                  selected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                                }`}>
                                  {selected && <CheckCircle2 className="h-3.5 w-3.5" />}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {activeQuestion?.type === 'ranking' && (
                        <div className="grid grid-cols-1 gap-3">
                          <p className="text-xs text-slate-500 font-semibold mb-1">Click options in order of your preference to rank them (1 = highest preference):</p>
                          {activeQuestion?.options?.map((option) => {
                            const rank = getRank(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => handleRankClick(option)}
                                className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all text-sm font-semibold flex items-center justify-between ${
                                  rank !== null
                                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-sm shadow-indigo-100/50'
                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                              >
                                <span>{option}</span>
                                {rank !== null ? (
                                  <Badge className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-2 py-0.5">
                                    #{rank}
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-slate-400 font-normal">Unranked</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Voice Input Placeholder / Info */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-slate-400" />
                        <span>{(answers[activeQuestion?.id] || '').length} characters written</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">Text Submission</Badge>
                    </div>
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold px-4"
                      onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuestion === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    {/* Slide dots indicator */}
                    <div className="hidden sm:flex items-center gap-2.5">
                      {aiQuestions.map((q, idx) => (
                        <button
                          key={q.id}
                          type="button"
                          disabled={submitting}
                          className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                            idx === currentQuestion ? 'bg-indigo-600 scale-125' : 'bg-slate-300'
                          } ${submitting ? 'cursor-not-allowed opacity-50' : ''}`}
                          onClick={() => setCurrentQuestion(idx)}
                          aria-label={`Go to question ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <Button
                      type="button"
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 min-w-[140px]"
                      disabled={submitting}
                      onClick={async () => {
                        if (!aiInterview || !activeQuestion) return;
                        
                        if (!answers[activeQuestion.id]) {
                          alert('Please select or type an answer before proceeding.');
                          return;
                        }
                        
                        try {
                          setSubmitting(true);
                          await aiInterviewAPI.evaluateAnswer({
                            interviewId: aiInterview.id,
                            questionId: activeQuestion.id,
                            answer: answers[activeQuestion.id],
                            criteria: activeQuestion.criteria
                          });

                          if (currentQuestion < aiQuestions.length - 1) {
                            setCurrentQuestion((prev) => prev + 1);
                          } else {
                            await aiInterviewAPI.closeInterview(aiInterview.id);
                            setShowQuestionSession(false);
                            setFinished(true);
                            setShowSuccessModal(true);
                          }
                        } catch (err: any) {
                          const errorData = err.response?.data;
                          if (errorData?.code === 'SESSION_EXPIRED' || errorData?.message?.includes('expired')) {
                            setShowQuestionSession(false);
                            setShowExpiryModal(true);
                          } else {
                            alert('Failed to submit answer. Please try again.');
                          }
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : currentQuestion < aiQuestions.length - 1 ? (
                        <span className="flex items-center gap-1">
                          Next Question
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      ) : (
                        'Finish Interview'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Completed Interview Results Screen */}
        {isInterviewFinished && (
          <div className="space-y-6">
            {/* Success Celebration Header */}
            <div className="flex flex-col items-center text-center p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl max-w-2xl mx-auto shadow-sm">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-md animate-bounce mb-4">
                <PartyPopper className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Evaluation Records Successfully Synced</h2>
              <p className="text-slate-500 text-sm mt-1 max-w-md">
                Your AI interview responses have been analyzed. The details and score are presented below.
              </p>
            </div>

            <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-indigo-500" />
                  Interview Result Scoring
                </CardTitle>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sync Records</span>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Score Display Card */}
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-5">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Assessed Score</span>
                      <span className="text-xs text-slate-400 font-medium">Weighted technical quiz ratio</span>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-extrabold shadow-lg shadow-indigo-100">
                      {interview.interviewScore !== null && interview.interviewScore !== undefined
                        ? `${interview.interviewScore}%`
                        : aiResults.length > 0
                          ? `${Math.round(aiResults.reduce((acc, r) => acc + (r.score || 0), 0) / aiResults.length)}%`
                          : '—'}
                    </div>
                  </div>

                  {/* Program Track Badge */}
                  {interview.chosenTrack && (
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <span className="text-sm font-semibold text-slate-600">Selected Track</span>
                      <span className="text-sm font-bold text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-lg border border-indigo-100/50">
                        {interview.chosenTrack}
                      </span>
                    </div>
                  )}

                  {/* Top 3 Tracks badge list */}
                  {interview.top3Tracks && interview.top3Tracks.length > 0 && (
                    <div className="space-y-2 border-b border-slate-100 pb-4">
                      <span className="text-xs text-slate-500 font-semibold block">Top 3 Track Preferences</span>
                      <div className="flex flex-wrap gap-2">
                        {interview.top3Tracks.map((track, index) => (
                          <Badge key={index} className="bg-indigo-50 text-indigo-700 border border-indigo-100/50 text-xs px-2.5 py-0.5">
                            {track}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assessor Notes */}
                  {interview.interviewNotes && (
                    <div className="space-y-2">
                      <span className="text-xs text-slate-500 font-semibold block">Interview Notes</span>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs">
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {interview.interviewNotes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Warning card for missing interview link */}
        {interviewScheduled && !hasInterviewLink && (
          <Card className="border border-yellow-200 bg-yellow-50/50 backdrop-blur-sm shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-yellow-900">Meeting Link Not Yet Available</h4>
                  <p className="text-xs text-yellow-800 mt-1 leading-relaxed">
                    Your interview is scheduled for {formatDate(interview.interviewDate)}, but the link has not been set by administrators yet. Please refresh closer to the scheduled time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* SUCCESS DIALOG MODAL */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl overflow-hidden p-0 rounded-2xl bg-white">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 opacity-40" />
            <div className="relative p-8 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-md animate-bounce mb-6">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-xl font-extrabold text-slate-800">
                  Congratulations!
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  You have successfully completed your AI Interview Assessment.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-8 w-full space-y-3">
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200/50 active:scale-[0.98] transition-all"
                  onClick={() => {
                    setShowSuccessModal(false);
                    window.location.reload();
                  }}
                >
                  <span className="flex items-center gap-1">
                    View My Results
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Button>
                <p className="text-[10px] text-slate-400 font-medium">
                  Your performance data has been securely saved and processed.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SESSION EXPIRED DIALOG MODAL */}
      <Dialog open={showExpiryModal} onOpenChange={setShowExpiryModal}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl overflow-hidden p-0 rounded-2xl bg-white">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 opacity-40" />
            <div className="relative p-8 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-md mb-6">
                <Hourglass className="h-8 w-8" />
              </div>
              
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-xl font-extrabold text-slate-800">
                  Session Time Limit Reached
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  Your interview session has reached the 90-minute time limit and has been automatically closed.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-8 w-full space-y-3">
                <Button 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-xl shadow-lg transition-all"
                  onClick={() => {
                    setShowExpiryModal(false);
                    window.location.reload();
                  }}
                >
                  <span className="flex items-center gap-1">
                    View Partial Results
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Button>
                <p className="text-[10px] text-slate-400 font-medium">
                  Please contact support if you require a retake.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
