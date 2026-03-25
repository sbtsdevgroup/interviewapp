'use client';

import { useMemo, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardList,
  CircleDot,
  FileText,
  HelpCircle,
  Calendar as CalendarIcon,
  Medal,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';

type QuestionType = 'multiple-choice' | 'short-answer';

type AssessmentOption = {
  id: string;
  text: string;
};

type AssessmentQuestion = {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  options: AssessmentOption[];
  correctOptionId?: string;
  explanation?: string;
};

export default function AssessmentsPage() {
  const hasAssessments = false;
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxPoints, setMaxPoints] = useState(100);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [passingScore, setPassingScore] = useState(60);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTill, setAvailableTill] = useState('');

  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [showResultsImmediately, setShowResultsImmediately] = useState(true);
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);

  const questionCount = questions.length;

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    if (!description.trim()) return false;
    if (maxPoints <= 0) return false;
    if (timeLimitMinutes <= 0) return false;
    if (maxAttempts <= 0) return false;
    if (passingScore < 0 || passingScore > 100) return false;
    return true;
  }, [title, description, maxPoints, timeLimitMinutes, maxAttempts, passingScore]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMaxPoints(100);
    setTimeLimitMinutes(30);
    setMaxAttempts(1);
    setPassingScore(60);
    setAvailableFrom('');
    setAvailableTill('');
    setShowCorrectAnswers(false);
    setShowResultsImmediately(true);
    setRandomizeQuestions(false);
    setRandomizeOptions(false);
    setQuestions([]);
  };

  const openModal = () => {
    resetForm();
    setOpen(true);
  };

  const addQuestion = () => {
    const id = crypto.randomUUID();
    const optionAId = crypto.randomUUID();
    const optionBId = crypto.randomUUID();
    setQuestions((prev) => [
      ...prev,
      {
        id,
        type: 'multiple-choice',
        text: '',
        points: 1,
        options: [
          { id: optionAId, text: '' },
          { id: optionBId, text: '' },
        ],
        correctOptionId: optionAId,
        explanation: '',
      },
    ]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, patch: Partial<AssessmentQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...patch } : q))
    );
  };

  const addOption = (questionId: string) => {
    const id = crypto.randomUUID();
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: [...q.options, { id, text: '' }] }
          : q
      )
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const nextOptions = q.options.filter((o) => o.id !== optionId);
        const nextCorrect =
          q.correctOptionId === optionId ? nextOptions[0]?.id : q.correctOptionId;
        return { ...q, options: nextOptions, correctOptionId: nextCorrect };
      })
    );
  };

  const updateOptionText = (questionId: string, optionId: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: q.options.map((o) => (o.id === optionId ? { ...o, text } : o)),
        };
      })
    );
  };

  const handleCreate = () => {
    // UI-only for now: close modal after "create"
    setOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className='bg-white p-6 rounded-xl space-y-6'>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Assessment Management</h1>
              <p className="text-sm text-slate-500 mt-1">
                Create and manage AI-powered interview assessments.
              </p>
            </div>
            <Button
              onClick={openModal}
              className="rounded-xl bg-[#155dfc] hover:bg-[#0d4bc4] w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Assessment
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="border-none bg-[#F6F7F9]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-slate-600" />
                  </span>
                  <CardTitle className="text-sm font-medium text-slate-700">Total Students</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-900">0</div>
                <p className="text-xs text-slate-500">Registered students</p>
              </CardContent>
            </Card>
            <Card className="border-none bg-[#F6F7F9]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-full bg-green-50 flex items-center justify-center">
                    <CircleDot className="h-4 w-4 text-green-600" />
                  </span>
                  <CardTitle className="text-sm font-medium text-slate-700">Active Assessments</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-900">0</div>
                <p className="text-xs text-slate-500">On-going Assessments</p>
              </CardContent>
            </Card>
            <Card className="border-none bg-[#F6F7F9]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-full bg-purple-50 flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-purple-600" />
                  </span>
                  <CardTitle className="text-sm font-medium text-slate-700">Total Assessments</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-900">0</div>
                <p className="text-xs text-slate-500">All Assessments</p>
              </CardContent>
            </Card>
            <Card className="border-none bg-[#F6F7F9]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-full bg-amber-50 flex items-center justify-center">
                    <Medal className="h-4 w-4 text-amber-600" />
                  </span>
                  <CardTitle className="text-sm font-medium text-slate-700">Avg Completion Rate</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-900">0.00%</div>
                <p className="text-xs text-slate-500">Completion Rate</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-none bg-white">
          <CardContent className="pt-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="relative md:col-span-9">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search Assessment"
                  className="pl-9 rounded-xl bg-[#F6F7F9] border-none"
                />
              </div>
              <div className="md:col-span-3">
                <Select defaultValue="ALL">
                  <SelectTrigger className="rounded-xl border-none bg-[#F6F7F9]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="cyber">Cybersecurity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-900">Assessment</CardTitle>
            <CardDescription className="text-slate-500">Track And Manage Assessment</CardDescription>
          </CardHeader>
          <CardContent>
            {!hasAssessments ? (
              <div className="min-h-[380px] flex items-center justify-center">
                <div className="text-center max-w-sm">
                  <img
                    src="/empty.svg"
                    alt="No assessment"
                    className="h-44 w-44 mx-auto"
                  />
                  <div className="mt-4 text-xl font-semibold text-slate-900">
                    No Assessment
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    You Don't Have Assessment Yet.
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-600">
                <Badge variant="info">Coming soon</Badge>
                <div className="mt-3">
                  Assessment list/table goes here.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border-slate-200 p-0">
            <div className="px-7 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-semibold text-slate-900">
                      Add Assessment
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">
                      Fill in the details for a new assessment
                    </DialogDescription>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 rounded-full hover:bg-slate-100 flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="px-7 py-5 space-y-5">
              <div className="grid gap-2">
                <Label className="text-slate-700">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g Introduction to React"
                  className="rounded-xl bg-slate-100 border-slate-200"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-slate-700">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the class"
                  className="min-h-[88px] rounded-xl bg-slate-100 border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-slate-700">Max Points</Label>
                  <Input
                    type="number"
                    value={maxPoints}
                    onChange={(e) => setMaxPoints(Number(e.target.value))}
                    className="rounded-xl bg-slate-100 border-slate-200"
                    min={1}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-700">Time Limit (Minutes)</Label>
                  <Input
                    type="number"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="rounded-xl bg-slate-100 border-slate-200"
                    min={1}
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-slate-700">Max Attempts</Label>
                  <Input
                    type="number"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value))}
                    className="rounded-xl bg-slate-100 border-slate-200"
                    min={1}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-700">Passing Score (%)</Label>
                  <Input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="rounded-xl bg-slate-100 border-slate-200"
                    min={0}
                    max={100}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-slate-700">Available From</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={availableFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                      className="rounded-xl bg-slate-100 border-slate-200 pr-10"
                    />
                    <CalendarIcon className="h-4 w-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-700">Available Till</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={availableTill}
                      onChange={(e) => setAvailableTill(e.target.value)}
                      className="rounded-xl bg-slate-100 border-slate-200 pr-10"
                    />
                    <CalendarIcon className="h-4 w-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <Checkbox checked={showCorrectAnswers} onCheckedChange={(v) => setShowCorrectAnswers(Boolean(v))} />
                  Show Correct Answers
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <Checkbox checked={showResultsImmediately} onCheckedChange={(v) => setShowResultsImmediately(Boolean(v))} />
                  Show Results Immediately
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <Checkbox checked={randomizeQuestions} onCheckedChange={(v) => setRandomizeQuestions(Boolean(v))} />
                  Randomize Questions
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <Checkbox checked={randomizeOptions} onCheckedChange={(v) => setRandomizeOptions(Boolean(v))} />
                  Randomize Options
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900">
                  Question({questionCount})
                </div>
                <Button
                  type="button"
                  onClick={addQuestion}
                  className="h-8 rounded-full bg-[#155dfc] hover:bg-[#0d4bc4] px-3"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Questions
                </Button>
              </div>

              {questions.length === 0 ? (
                <div className="rounded-xl bg-slate-100 border border-slate-200 p-10 text-center text-slate-500">
                  <div className="mx-auto h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-3">
                    <HelpCircle className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="text-xs">
                    No questions added yet. Click "Add Question" to get started.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="rounded-2xl bg-slate-100 border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-900">
                          Question {idx + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="rounded-lg bg-white text-slate-700 border border-slate-200">
                            {q.type === 'multiple-choice' ? 'Multiple Choice' : 'Short Answer'}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-white"
                            onClick={() => removeQuestion(q.id)}
                            aria-label="Remove question"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2">
                        <Label className="text-slate-700">Question Text</Label>
                        <Textarea
                          value={q.text}
                          onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                          placeholder="Enter your question here"
                          className="min-h-[70px] rounded-xl bg-white border-slate-200"
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="text-slate-700">Question Type</Label>
                          <Select
                            value={q.type}
                            onValueChange={(v) => {
                              const next = v as QuestionType;
                              if (next === 'short-answer') {
                                updateQuestion(q.id, { type: next, options: [], correctOptionId: undefined });
                                return;
                              }
                              // multiple-choice
                              if (q.options.length === 0) {
                                const a = crypto.randomUUID();
                                const b = crypto.randomUUID();
                                updateQuestion(q.id, {
                                  type: next,
                                  options: [{ id: a, text: '' }, { id: b, text: '' }],
                                  correctOptionId: a,
                                });
                              } else {
                                updateQuestion(q.id, { type: next });
                              }
                            }}
                          >
                            <SelectTrigger className="rounded-xl bg-white border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              <SelectItem value="short-answer">Short Answer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-slate-700">Point</Label>
                          <Input
                            type="number"
                            min={1}
                            value={q.points}
                            onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) })}
                            className="rounded-xl bg-white border-slate-200"
                          />
                        </div>
                      </div>

                      {q.type === 'multiple-choice' && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-slate-700">Options</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-full border-slate-200 bg-white"
                              onClick={() => addOption(q.id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Options
                            </Button>
                          </div>

                          <div className="mt-3 space-y-3">
                            {q.options.map((opt) => (
                              <div key={opt.id} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateQuestion(q.id, { correctOptionId: opt.id })}
                                  className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                    q.correctOptionId === opt.id
                                      ? 'border-[#155dfc] bg-[#155dfc]/10'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                  aria-label="Mark as correct"
                                >
                                  {q.correctOptionId === opt.id && (
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#155dfc]" />
                                  )}
                                </button>
                                <Input
                                  value={opt.text}
                                  onChange={(e) => updateOptionText(q.id, opt.id, e.target.value)}
                                  placeholder="Option text"
                                  className="rounded-xl bg-white border-slate-200"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-lg hover:bg-white"
                                  onClick={() => removeOption(q.id, opt.id)}
                                  aria-label="Remove option"
                                  disabled={q.options.length <= 2}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 grid gap-2">
                        <Label className="text-slate-700">Explanation (Optional)</Label>
                        <Input
                          value={q.explanation || ''}
                          onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
                          placeholder="Explain why this is the correct answer"
                          className="rounded-xl bg-white border-slate-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="px-7 pb-6 sm:justify-center">
              <Button
                type="button"
                onClick={handleCreate}
                disabled={!canSubmit}
                className="min-w-[200px] rounded-xl bg-[#155dfc] hover:bg-[#0d4bc4]"
              >
                Add Assessment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

