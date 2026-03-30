'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { aiInterviewAPI, type AIQuestion } from '@/services/ai-interview-service';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  MoreVertical,
} from 'lucide-react';

type FormState = {
  id?: string;
  text: string;
  criteria: string;
  category: string;
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    text: '',
    criteria: '',
    category: '',
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<AIQuestion | null>(null);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiInterviewAPI.getAllQuestions();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load questions:', err);
      setError(err?.response?.data?.message || 'Failed to load questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return questions;
    return questions.filter((item) => {
      return (
        normalize(item.text).includes(q) ||
        normalize(item.criteria).includes(q) ||
        normalize(item.category || '').includes(q)
      );
    });
  }, [questions, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [query, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const openCreate = () => {
    setForm({ text: '', criteria: '', category: '' });
    setOpen(true);
  };

  const openEdit = (q: AIQuestion) => {
    setForm({
      id: q.id,
      text: q.text || '',
      criteria: q.criteria || '',
      category: q.category || '',
    });
    setOpen(true);
  };

  const canSave = form.text.trim().length > 0 && form.criteria.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      if (form.id) {
        await aiInterviewAPI.updateQuestion(form.id, {
          text: form.text.trim(),
          criteria: form.criteria.trim(),
          category: form.category.trim() || undefined,
        });
      } else {
        await aiInterviewAPI.createQuestion({
          text: form.text.trim(),
          criteria: form.criteria.trim(),
          category: form.category.trim() || undefined,
          // Backend requires `type`; keep it consistent and hidden in UI.
          type: 'long-text',
        });
      }
      setOpen(false);
      await loadQuestions();
    } catch (err: any) {
      console.error('Failed to save question:', err);
      setError(err?.response?.data?.message || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (q: AIQuestion) => {
    setQuestionToDelete(q);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await aiInterviewAPI.deleteQuestion(questionToDelete.id);
      setDeleteOpen(false);
      setQuestionToDelete(null);
      await loadQuestions();
    } catch (err: any) {
      console.error('Failed to delete question:', err);
      setError(err?.response?.data?.message || 'Failed to delete question');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (q: AIQuestion) => {
    setLoading(true);
    setError(null);
    try {
      await aiInterviewAPI.togglePublish(q.id, q.is_published === 0);
      await loadQuestions();
    } catch (err: any) {
      console.error('Failed to toggle publish:', err);
      setError(err?.response?.data?.message || 'Failed to toggle publish');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Question Bank</h1>
            <p className="text-sm text-slate-500 mt-1">
              Add, update, and delete interview questions.
            </p>
          </div>

          <Button
            onClick={openCreate}
            className="rounded-xl bg-[#155dfc] hover:bg-[#0d4bc4] w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        <Card className="border-none bg-white">
          <CardContent className="pt-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by text, criteria, or category..."
                className="pl-9 rounded-xl bg-[#F7F7F7] border-none"
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-none bg-white overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-900">Questions ({filtered.length})</CardTitle>
            <CardDescription className="text-slate-500">
              Managed questions available for AI interviews
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-100/60">
                    <TableHead className="pl-6">Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Criteria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-slate-600">
                        <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-[#155dfc] mb-3" />
                        <div>Loading questions...</div>
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12 text-center text-slate-600">
                        No questions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paged.map((q) => (
                      <TableRow key={q.id} className="hover:bg-slate-50">
                        <TableCell className="pl-6">
                          <div className="max-w-[520px]">
                            <div className="font-medium text-slate-900 line-clamp-2">
                              {q.text}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {q.category ? (
                            <span className="inline-flex rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium">
                              {q.category}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          <div className="max-w-[420px] line-clamp-2">{q.criteria}</div>
                        </TableCell>
                        <TableCell>
                          {q.is_published === 1 ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                              Draft
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="pr-6">
                          <div className="flex items-center justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Open actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px] rounded-xl border-slate-200">
                                <DropdownMenuItem
                                  onClick={() => openEdit(q)}
                                  className="flex items-center gap-2 cursor-pointer py-2.5"
                                >
                                  <Pencil className="h-4 w-4 text-slate-500" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleTogglePublish(q)}
                                  className="flex items-center gap-2 cursor-pointer py-2.5"
                                  disabled={loading}
                                >
                                  {q.is_published === 1 ? (
                                    <>
                                      <EyeOff className="h-4 w-4 text-slate-500" />
                                      <span>Unpublish</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 text-[#155dfc]" />
                                      <span className="text-[#155dfc]">Publish</span>
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => requestDelete(q)}
                                  className="flex items-center gap-2 cursor-pointer py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination (client-side) */}
        <Card className="border-none bg-white">
          <CardContent className="py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-xs text-slate-500">
                Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, filtered.length)} of {filtered.length} questions
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  Questions per page:
                  <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                    <SelectTrigger className="h-8 w-[76px] rounded-lg border-none bg-[#F6F7F9]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1 px-1">
                    {(() => {
                      const start = Math.max(1, page - 2);
                      const end = Math.min(totalPages, start + 4);
                      const adjustedStart = Math.max(1, end - 4);
                      const pages: number[] = [];
                      for (let i = adjustedStart; i <= end; i++) pages.push(i);
                      return pages.map((n) => {
                        const active = n === page;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setPage(n)}
                            className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                              active
                                ? 'bg-[#155dfc] text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {n}
                          </button>
                        );
                      });
                    })()}
                    {totalPages > page + 2 && (
                      <span className="text-slate-400 text-xs px-1">…</span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add / Edit modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-slate-200 px-8 py-7">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl text-slate-900">
                {form.id ? 'Edit Question' : 'Add Question'}
              </DialogTitle>
              <DialogDescription>
                Create or update a question. Published questions are visible to students. (Max 15 published).
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label className="text-slate-700" htmlFor="q-text">
                  Text *
                </Label>
                <Textarea
                  id="q-text"
                  value={form.text}
                  onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
                  placeholder="Enter the question text..."
                  className="min-h-[110px] rounded-xl border-slate-200 bg-slate-50"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-slate-700" htmlFor="q-criteria">
                  Criteria *
                </Label>
                <Textarea
                  id="q-criteria"
                  value={form.criteria}
                  onChange={(e) => setForm((p) => ({ ...p, criteria: e.target.value }))}
                  placeholder="Enter scoring/evaluation criteria..."
                  className="min-h-[110px] rounded-xl border-slate-200 bg-slate-50"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-slate-700" htmlFor="q-category">
                  Category
                </Label>
                <Input
                  id="q-category"
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  placeholder="E.g. Introduction, Tools, Background"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50"
                />
              </div>
            </div>

            <DialogFooter className="sm:justify-center pt-2">
              <Button
                onClick={handleSave}
                disabled={!canSave || saving}
                className="min-w-[180px] rounded-xl bg-[#155dfc] hover:bg-[#0d4bc4]"
              >
                {saving ? 'Saving...' : form.id ? 'Update Question' : 'Add Question'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirm */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="max-w-md rounded-3xl border-slate-200 px-8 py-7">
            <DialogHeader>
              <DialogTitle className="text-slate-900">Delete Question</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="text-sm text-slate-700">
              Are you sure you want to delete this question?
            </div>
            <DialogFooter className="sm:justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

