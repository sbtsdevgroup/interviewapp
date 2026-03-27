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
  UserRound,
  Users,
  CircleDot,
  ClipboardList,
  Medal,
  Radio,
  Trash2,
} from 'lucide-react';

interface Student {
  id: string;
  applicationId?: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt?: string;
  status?: string;
  chosenTrack?: string;
  assessmentScore?: number;
  assessmentStatus?: string;
  interviewCompleted?: boolean;
  interviewDate?: string;
  paymentCompleted?: boolean;
  paymentVerified?: boolean;
}

export default function InterviewPage() {
  const [students, setStudents] = useState<Student[]>([]);
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

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState<string>('ALL');

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
      const [studentsResponse, statsData] = await Promise.all([
        adminAPI.getAllStudents(search || undefined, 'ALL', page, pageSize),
        adminAPI.getStats(),
      ]);

      if (studentsResponse && (studentsResponse as any).data) {
        setStudents((studentsResponse as any).data);
        setMeta((studentsResponse as any).meta);
      } else {
        setStudents(Array.isArray(studentsResponse) ? studentsResponse : []);
      }

      setStats({
        totalStudents: statsData.totalStudents || 0,
        activeStudents: statsData.paidStudents || 0,
        totalInterviews:
          (statsData.completedInterviews || 0) + (statsData.scheduledInterviews || 0),
        averageScore: statsData.averageScore || 0,
      });
    } catch (err: any) {
      console.error('Failed to load interview data:', err);
      setError(err?.response?.data?.message || 'Failed to load interview data');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const departments = useMemo(() => {
    const unique = new Set<string>();
    students.forEach((s) => {
      if (s.chosenTrack) unique.add(s.chosenTrack);
    });
    return ['ALL', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [students]);

  const filtered = useMemo(() => {
    if (department === 'ALL') return students;
    return students.filter(
      (s) => (s.chosenTrack || '').toLowerCase() === department.toLowerCase()
    );
  }, [students, department]);

  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [search, pageSize]);

  const { total, totalPages } = meta;
  const currentPage = page;
  const startIdx = (currentPage - 1) * pageSize;
  const currentRows = filtered;

  const { totalStudents, activeStudents, totalInterviews, averageScore: avgScore } = stats;

  const initialsFor = (name: string) => {
    if (!name) return 'ST';
    const parts = name.split(' ').filter(Boolean);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'ST';
  };

  const interviewState = (s: Student) => {
    if (s.interviewCompleted) return { label: 'Completed', live: false };
    if (s.interviewDate) return { label: 'Live Interview', live: true };
    return { label: 'Pending', live: false };
  };

  const openDetailsModal = (student: Student) => {
    setSelectedStudent(student);
    setDetailsOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Interview Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor interview status and view results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="border-none bg-[#F6F7F9]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-slate-600" />
                  </span>
                  <CardTitle className="text-sm font-medium text-slate-700">
                    Total Students
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-900">
                  {totalStudents}
                </div>
                <p className="text-xs text-slate-500">Registered students</p>
              </CardContent>
            </Card>

            <Card className="border-none bg-[#F6F7F9]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-full bg-green-50 flex items-center justify-center">
                    <CircleDot className="h-4 w-4 text-green-600" />
                  </span>
                  <CardTitle className="text-sm font-medium text-slate-700">
                    Active Students
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-900">
                  {activeStudents}
                </div>
                <p className="text-xs text-slate-500">0% completion rate</p>
              </CardContent>
            </Card>

            <Card className="border-none bg-[#F6F7F9]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-full bg-purple-50 flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-purple-600" />
                  </span>
                  <CardTitle className="text-sm font-medium text-slate-700">
                    Total Interviews
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-900">
                  {totalInterviews}
                </div>
                <p className="text-xs text-slate-500">Interviews scheduled</p>
              </CardContent>
            </Card>

            <Card className="border-none bg-[#F6F7F9]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-full bg-amber-50 flex items-center justify-center">
                    <Medal className="h-4 w-4 text-amber-600" />
                  </span>
                  <CardTitle className="text-sm font-medium text-slate-700">
                    Average Score
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-900">
                  {avgScore.toFixed(2)}%
                </div>
                <p className="text-xs text-slate-500">Assessment average</p>
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students by name, email or ID..."
                  className="pl-9 rounded-xl bg-[#F7F7F7] border-none"
                />
              </div>
              <div className="md:col-span-3">
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="rounded-xl border-none bg-[#F7F7F7]">
                    <SelectValue placeholder="All Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d === 'ALL' ? 'All Department' : d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            <CardTitle className="text-slate-900">
              Interviews ({total})
            </CardTitle>
            <CardDescription className="text-slate-500">
              Students and their interview status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-100/60">
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Interview Status</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead className="pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-slate-600">
                        <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-[#155dfc] mb-3" />
                        <div>Loading interviews...</div>
                      </TableCell>
                    </TableRow>
                  ) : currentRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-slate-600">
                        <UserRound className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                        <div>No interviews found</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentRows.map((s) => {
                      const state = interviewState(s);
                      return (
                        <TableRow key={s.id} className="hover:bg-slate-50">
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-none text-slate-700 flex items-center justify-center text-xs font-semibold">
                                {initialsFor(s.fullName)}
                              </div>
                              <div className="font-medium text-slate-900">{s.fullName}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-700">{s.email}</TableCell>
                          <TableCell className="text-slate-700">{s.phone || '—'}</TableCell>
                          <TableCell>{s.chosenTrack || '—'}</TableCell>
                          <TableCell>
                            {state.live ? (
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EC80021A] text-[#EC8002] px-2.5 py-1 text-xs font-medium whitespace-nowrap">
                                <Radio className="h-3 w-3" />
                                Live Interview
                              </span>
                            ) : s.interviewCompleted ? (
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#05A21A1A] text-green-700 px-2.5 py-1 text-xs font-medium whitespace-nowrap">
                                <span className="text-[11px]">✓</span>
                                Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 text-slate-600 px-2.5 py-1 text-xs font-medium whitespace-nowrap">
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-700">
                            {s.assessmentScore !== null && s.assessmentScore !== undefined
                              ? `${s.assessmentScore}%`
                              : '—'}
                          </TableCell>
                          <TableCell className="pr-6">
                            <div className="flex items-center gap-2">
                              {state.live ? (
                                <Button size="sm" className="h-8 rounded-lg bg-amber-500 hover:bg-amber-600 text-white">
                                  <span className="text-xs mr-1">⦿</span>
                                  Monitor Live
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="h-8 rounded-lg bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => openDetailsModal(s)}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  View Details
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-6 py-4 border-t border-none">
              <div className="text-xs text-slate-500">
                Showing {total === 0 ? 0 : startIdx + 1} to {Math.min(startIdx + pageSize, total)} of {total} entries
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  Students per page:
                  <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                    <SelectTrigger className="h-8 w-[76px] rounded-lg border-none">
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
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
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
                              active ? 'bg-[#155dfc] text-white' : 'bg-slate-100 text-slate-700 hover:bg-none'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      });
                    })()}
                    {totalPages > currentPage + 2 && <span className="text-slate-400 text-xs px-1">…</span>}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg"
                    disabled={currentPage >= totalPages}
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
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 border-none overflow-hidden">
          {selectedStudent && (
            <div className="bg-white p-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold">
                  {initialsFor(selectedStudent.fullName)}
                </div>
                <div>
                  <p className="text-3xl font-semibold text-slate-900">{selectedStudent.fullName}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedStudent.email} | {selectedStudent.phone || 'No phone'} | {selectedStudent.chosenTrack || 'No program'}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-xs px-3 py-2">
                <span className="font-semibold">Note:</span> The result and time is generated automatically after the student submits the interview.
              </div>

              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ClipboardList className="h-4 w-4" />
                </span>
                <p className="text-xl font-semibold text-slate-900">Interview Result Details</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700">Score:</p>
                  <div className="rounded-xl bg-slate-100 px-4 py-4 text-3xl font-medium text-slate-900">
                    {selectedStudent.assessmentScore !== null && selectedStudent.assessmentScore !== undefined
                      ? `${selectedStudent.assessmentScore}%`
                      : '—'}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700">Time Frame:</p>
                  <div className="rounded-xl bg-slate-100 px-4 py-4 text-3xl font-medium text-slate-900">40mins</div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700">Total Questions:</p>
                  <div className="rounded-xl bg-slate-100 px-4 py-4 text-3xl font-medium text-slate-900">15</div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700">Correct Answers:</p>
                  <div className="rounded-xl bg-slate-100 px-4 py-4 text-3xl font-medium text-slate-900">12</div>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <Button onClick={() => setDetailsOpen(false)} className="rounded-xl bg-[#155dfc] hover:bg-[#0d4bc4]">
                  <ArrowLeft className="h-4 w-4 mr-2" />
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

