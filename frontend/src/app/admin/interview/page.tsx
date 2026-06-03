'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { adminAPI } from '@/services/admin-service';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Users,
  CircleDot,
  ClipboardList,
  Medal,
  Radio,
  Trash2,
  Calendar,
  X,
} from 'lucide-react';

interface Student {
  id: string;
  applicationId?: string;
  fullName: string;
  email: string;
  phone?: string;
  chosenTrack?: string;
  assessmentScore?: number;
  interviewCompleted?: boolean;
  interviewStatus?: string;
  interviewDate?: string;
}

interface InterviewRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  student_track?: string;
  schedule_date: string;
  status: string;
  response_count: number;
  avg_score: number | null;
  started_at?: string;
  created_at: string;
}

interface InterviewResponse {
  id: string;
  question_id: string;
  question_text: string;
  question_type: string;
  student_answer: string;
  ai_score: number;
  ai_feedback: string;
  created_at: string;
}

interface InterviewSummary {
  id: string;
  student_id: string;
  schedule_date: string;
  instructions: string;
  status: string;
  started_at: string;
  created_at: string;
  responses: InterviewResponse[];
}

export default function InterviewPage() {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalInterviews: 0,
    averageScore: 0,
  });
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [interviewSummary, setInterviewSummary] = useState<InterviewSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, pageSize, department]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [interviewsResponse, localStats] = await Promise.all([
        adminAPI.getLocalInterviews(search || undefined, department, page, pageSize),
        adminAPI.getLocalInterviewStats(),
      ]);

      if (interviewsResponse && interviewsResponse.data) {
        setInterviews(interviewsResponse.data);
        if (interviewsResponse.meta) {
          setMeta({
            total: interviewsResponse.meta.total,
            page: interviewsResponse.meta.page,
            limit: interviewsResponse.meta.limit,
            totalPages: interviewsResponse.meta.totalPages,
          });
        }
      }

      setStats({
        totalStudents: (localStats.scheduledInterviews || 0) + (localStats.completedInterviews || 0),
        activeStudents: localStats.completedInterviews || 0,
        totalInterviews: (localStats.scheduledInterviews || 0) + (localStats.completedInterviews || 0),
        averageScore: localStats.averageScore || 0,
      });
    } catch (err: any) {
      console.error('Failed to load interview data:', err);
      setError(err?.response?.data?.message || 'Failed to load interview data');
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const departments = useMemo(() => {
    const unique = new Set<string>();
    interviews.forEach((i) => {
      if (i.student_track) unique.add(i.student_track);
    });
    const defaultDepts = ['Cybersecurity', 'Software Engineering', 'Data Science'];
    defaultDepts.forEach(d => unique.add(d));
    return ['ALL', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [interviews]);

  // Apply status filter client-side (since backend doesn't support it yet)
  const filteredInterviews = useMemo(() => {
    if (statusFilter === 'ALL') return interviews;
    return interviews.filter(i => {
      if (statusFilter === 'COMPLETED') return i.status === 'COMPLETED';
      if (statusFilter === 'LIVE') return i.status === 'STARTED';
      if (statusFilter === 'SCHEDULED') return i.status === 'PENDING';
      return true;
    });
  }, [interviews, statusFilter]);

  const hasActiveFilters = search || department !== 'ALL' || statusFilter !== 'ALL';

  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [search, pageSize, department]);

  const { total, totalPages } = meta;
  const currentPage = page;
  const startIdx = (currentPage - 1) * pageSize;

  const { totalStudents, activeStudents, averageScore: avgScore } = stats;

  const initialsFor = (name: string) => {
    if (!name) return 'ST';
    const parts = name.split(' ').filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'ST';
  };

  const interviewState = (i: InterviewRecord) => {
    if (i.status === 'COMPLETED') return { label: 'Completed', variant: 'completed' as const };
    if (i.status === 'STARTED') return { label: 'Live', variant: 'live' as const };
    return { label: 'Scheduled', variant: 'scheduled' as const };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const openDetailsModal = async (interview: InterviewRecord) => {
    setSelectedStudent({
      id: interview.id,
      fullName: interview.student_name,
      email: interview.student_email,
      phone: interview.student_phone,
      chosenTrack: interview.student_track,
      applicationId: interview.student_id,
      assessmentScore: interview.avg_score || 0,
    } as any);
    setDetailsOpen(true);
    fetchSummary(interview.student_id);
  };

  const fetchSummary = async (studentId: string) => {
    setLoadingSummary(true);
    try {
      const summary = await adminAPI.getStudentInterviewSummary(studentId);
      setInterviewSummary(summary);
    } catch (err) {
      console.error('Failed to fetch interview summary:', err);
      setInterviewSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the interview for ${name || 'this student'}?`)) return;
    try {
      await adminAPI.deleteLocalInterview(id);
      loadData();
    } catch (err: any) {
      window.alert(err?.response?.data?.message || 'Failed to delete interview');
    }
  };

  useEffect(() => {
    let interval: any;
    if (detailsOpen && selectedStudent && interviewSummary?.status === 'STARTED') {
      interval = setInterval(() => {
        fetchSummary(selectedStudent.applicationId || selectedStudent.id);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [detailsOpen, selectedStudent, interviewSummary?.status]);

  const clearFilters = () => {
    setSearch('');
    setDepartment('ALL');
    setStatusFilter('ALL');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Interview Management</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor AI interview sessions and view student results</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Sessions
                </CardTitle>
                <span className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ClipboardList className="h-4 w-4 text-blue-600" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalStudents}</div>
              <p className="text-xs text-slate-500 mt-1">AI interview sessions total</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Completed
                </CardTitle>
                <span className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CircleDot className="h-4 w-4 text-emerald-600" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{activeStudents}</div>
              <p className="text-xs text-slate-500 mt-1">Assessments finished</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Scheduled
                </CardTitle>
                <span className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-600" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{Math.max(0, totalStudents - activeStudents)}</div>
              <p className="text-xs text-slate-500 mt-1">Pending / upcoming</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-white hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Average AI Score
                </CardTitle>
                <span className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Medal className="h-4 w-4 text-amber-600" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {avgScore > 0 ? `${avgScore.toFixed(1)}%` : 'N/A'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Overall AI average</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-none bg-white shadow-sm">
          <CardContent className="pt-5">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students by name, email or ID..."
                  className="pl-9 rounded-xl bg-[#F7F7F9] border-none"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:w-[55%]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="rounded-xl border-none bg-[#F7F7F9]">
                    <SelectValue placeholder="Interview Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="LIVE">Live</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="rounded-xl border-none bg-[#F7F7F9]">
                    <SelectValue placeholder="All Programs" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d === 'ALL' ? 'All Programs' : d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Active filter badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-3">
                {search && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                    Search: "{search}"
                    <button onClick={() => setSearch('')}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {statusFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter('ALL')}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {department !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                    Program: {department}
                    <button onClick={() => setDepartment('ALL')}><X className="h-3 w-3" /></button>
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Table Card */}
        <Card className="border-none bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-50 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900">
                  Interviews ({filteredInterviews.length > 0 ? total : 0})
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Students and their AI interview status
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#155dfc] mb-4" />
                  <p className="text-sm text-slate-500">Loading interviews...</p>
                </div>
              </div>
            ) : filteredInterviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-5">
                  <Calendar className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {hasActiveFilters ? 'No interviews match your filters' : 'No interviews scheduled yet'}
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mb-6">
                  {hasActiveFilters
                    ? 'Try adjusting or clearing the filters to see more results.'
                    : 'Interviews appear here once they are scheduled from the Student Management page. Go to Students to schedule AI interview sessions for enrolled candidates.'}
                </p>
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters} className="gap-2 rounded-xl border-slate-200">
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                ) : (
                  <Link href="/admin/students">
                    <Button
                      className="gap-2 rounded-xl text-white font-medium"
                      style={{ background: 'linear-gradient(135deg, #155dfc 0%, #0d4bc4 100%)' }}
                    >
                      <Users className="h-4 w-4" />
                      Go to Student Management
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                      <TableHead className="pl-6 font-semibold text-slate-600">Name</TableHead>
                      <TableHead className="font-semibold text-slate-600">Email</TableHead>
                      <TableHead className="font-semibold text-slate-600">Phone</TableHead>
                      <TableHead className="font-semibold text-slate-600">Program</TableHead>
                      <TableHead className="font-semibold text-slate-600">Scheduled</TableHead>
                      <TableHead className="font-semibold text-slate-600">Status</TableHead>
                      <TableHead className="font-semibold text-slate-600">Avg Score</TableHead>
                      <TableHead className="pr-6 font-semibold text-slate-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInterviews.map((i) => {
                      const state = interviewState(i);
                      return (
                        <TableRow key={i.id} className="hover:bg-slate-50/50 transition-colors">
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                {initialsFor(i.student_name)}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 text-sm">{i.student_name}</p>
                                <p className="text-xs text-slate-400">{i.student_id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">{i.student_email}</TableCell>
                          <TableCell className="text-slate-600 text-sm">{i.student_phone || '—'}</TableCell>
                          <TableCell>
                            {i.student_track ? (
                              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">
                                {i.student_track}
                              </span>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm">{formatDate(i.schedule_date)}</TableCell>
                          <TableCell>
                            {state.variant === 'live' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 text-xs font-medium whitespace-nowrap">
                                <Radio className="h-3 w-3 animate-pulse" />
                                Live
                              </span>
                            ) : state.variant === 'completed' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-xs font-medium whitespace-nowrap">
                                <span className="text-[10px]">✓</span>
                                Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 text-xs font-medium whitespace-nowrap">
                                <CircleDot className="h-3 w-3" />
                                Scheduled
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {i.avg_score !== null && i.avg_score !== undefined ? (
                              <span className={`font-semibold text-sm ${i.avg_score >= 70 ? 'text-emerald-600' : i.avg_score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                {Math.round(i.avg_score)}%
                              </span>
                            ) : (
                              <span className="text-slate-400 text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="pr-6">
                            <div className="flex items-center gap-2">
                              {state.variant === 'live' ? (
                                <Button
                                  size="sm"
                                  className="h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs gap-1.5"
                                  onClick={() => openDetailsModal(i)}
                                >
                                  <Radio className="h-3 w-3" />
                                  Monitor
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="h-8 rounded-lg bg-[#155dfc] hover:bg-[#0d4bc4] text-white text-xs gap-1.5"
                                  onClick={() => openDetailsModal(i)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(i.id, i.student_name || 'Student')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {filteredInterviews.length > 0 && (
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-6 py-4 border-t border-slate-50">
                <div className="text-xs text-slate-500">
                  Showing {total === 0 ? 0 : startIdx + 1} to {Math.min(startIdx + pageSize, total)} of {total} interviews
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    Per page:
                    <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                      <SelectTrigger className="h-8 w-[70px] rounded-lg border-none bg-slate-100 text-xs">
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
                      className="h-8 rounded-lg border-slate-200"
                      disabled={currentPage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Prev
                    </Button>
                    <div className="flex items-center gap-1 px-1">
                      {(() => {
                        const pages: number[] = [];
                        const startPage = Math.max(1, currentPage - 2);
                        const endPage = Math.min(totalPages, startPage + 4);
                        const adjustedStart = Math.max(1, endPage - 4);
                        for (let i = adjustedStart; i <= endPage; i++) pages.push(i);
                        return pages.map((pageNum) => {
                          const active = pageNum === currentPage;
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setPage(pageNum)}
                              className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                                active ? 'bg-[#155dfc] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        });
                      })()}
                      {totalPages > currentPage + 2 && (
                        <span className="text-slate-400 text-xs px-1">…</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg border-slate-200"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interview Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 border-none overflow-hidden shadow-2xl">
          {selectedStudent && (
            <div className="bg-white p-7 space-y-5 max-h-[90vh] overflow-y-auto">
              {/* Student Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold text-lg">
                    {initialsFor(selectedStudent.fullName)}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{selectedStudent.fullName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedStudent.email}
                      {selectedStudent.phone && ` · ${selectedStudent.phone}`}
                    </p>
                    {selectedStudent.chosenTrack && (
                      <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md font-medium">
                        {selectedStudent.chosenTrack}
                      </span>
                    )}
                  </div>
                </div>
                {interviewSummary?.status === 'STARTED' && (
                  <Badge className="bg-orange-500 hover:bg-orange-500 animate-pulse gap-1.5">
                    <Radio className="h-3 w-3" />
                    LIVE
                  </Badge>
                )}
              </div>

              {interviewSummary?.status === 'STARTED' && (
                <div className="rounded-xl bg-orange-50 border border-orange-100 text-orange-700 text-xs px-4 py-3 flex items-center gap-2">
                  <Radio className="h-3.5 w-3.5 animate-pulse flex-shrink-0" />
                  Student is currently answering questions. Refreshing every 5 seconds.
                </div>
              )}

              {/* Score Summary */}
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ClipboardList className="h-4 w-4" />
                </span>
                <p className="text-lg font-bold text-slate-900">AI Interview Report</p>
              </div>

              {loadingSummary && !interviewSummary ? (
                <div className="py-10 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#155dfc] mb-3" />
                  <p className="text-sm text-slate-500">Loading interview details...</p>
                </div>
              ) : !interviewSummary ? (
                <div className="py-10 text-center text-slate-500 bg-slate-50 rounded-xl">
                  <ClipboardList className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                  <p className="font-medium">No AI interview session found</p>
                  <p className="text-xs mt-1">This student hasn't started their interview yet.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      {
                        label: 'Avg AI Score',
                        value: interviewSummary.responses.length > 0
                          ? `${Math.round(interviewSummary.responses.reduce((acc, r) => acc + r.ai_score, 0) / interviewSummary.responses.length)}%`
                          : '—',
                      },
                      { label: 'Status', value: interviewSummary.status },
                      { label: 'Questions', value: `${interviewSummary.responses.length}` },
                      {
                        label: 'Started At',
                        value: interviewSummary.started_at
                          ? new Date(interviewSummary.started_at).toLocaleTimeString()
                          : 'Not started',
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className="space-y-1">
                        <p className="text-xs font-medium text-slate-500">{label}</p>
                        <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 min-h-[48px] flex items-center capitalize">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 mt-2">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                      Questions & Responses
                    </h3>
                    {interviewSummary.responses.length === 0 ? (
                      <p className="text-sm text-slate-500 italic py-4">No responses submitted yet.</p>
                    ) : (
                      <div className="space-y-6">
                        {interviewSummary.responses.map((res, index) => (
                          <div key={res.id} className="space-y-2 border-l-2 border-blue-100 pl-4">
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-sm font-semibold text-slate-800">
                                Q{index + 1}: {res.question_text}
                              </p>
                              <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                res.ai_score >= 70
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : res.ai_score >= 50
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {res.ai_score}/100
                              </span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl text-sm text-slate-700 border border-slate-100">
                              <p className="font-semibold text-[10px] uppercase text-slate-400 mb-1 tracking-wider">Student Answer</p>
                              {res.student_answer}
                            </div>
                            <div className="bg-blue-50/60 p-3 rounded-xl text-xs text-slate-600 border border-blue-100">
                              <p className="font-semibold text-[10px] uppercase text-blue-400 mb-1 tracking-wider not-italic">AI Feedback</p>
                              "{res.ai_feedback}"
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-center pt-2 sticky bottom-0 bg-white pb-1">
                <Button
                  onClick={() => setDetailsOpen(false)}
                  className="rounded-xl bg-[#155dfc] hover:bg-[#0d4bc4] gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Interview Management
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
