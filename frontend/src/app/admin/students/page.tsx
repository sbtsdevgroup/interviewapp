'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { adminAPI } from '@/services/admin-service';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  UserRound,
  Users,
  CircleDot,
  ClipboardList,
  Medal,
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

export default function StudentsPage() {
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

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState<string>('ALL');

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [search, page, pageSize, department]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsResponse, statsData] = await Promise.all([
        adminAPI.getAllStudents(search || undefined, 'ALL', page, pageSize),
        adminAPI.getStats(),
      ]);
      
      // Handle the case where the API returns { data, meta }
      if (studentsResponse && studentsResponse.data) {
        setStudents(studentsResponse.data);
        setMeta(studentsResponse.meta);
      } else {
        setStudents(Array.isArray(studentsResponse) ? studentsResponse : []);
      }
      
      setStats({
        totalStudents: statsData.totalStudents || 0,
        activeStudents: statsData.paidStudents || 0, // Mapping paid to active as per current UI logic
        totalInterviews: (statsData.completedInterviews || 0) + (statsData.scheduledInterviews || 0),
        averageScore: statsData.averageScore || 0,
      });
    } catch (err: any) {
      console.error('Failed to load students data:', err);
      setError(err?.response?.data?.message || 'Failed to load students data');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const departments = useMemo(() => {
    // This is still local since we don't have a departments API, 
    // but it will only show tracks from the CURRENT page.
    // Ideally, this should be a fixed list or a separate API.
    const unique = new Set<string>();
    students.forEach((s) => {
      if (s.chosenTrack) unique.add(s.chosenTrack);
    });
    return ['ALL', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [students]);

  // Combined filtering: Backend handles search, frontend handles department (for now)
  const filtered = useMemo(() => {
    if (department === 'ALL') return students;
    return students.filter((s) => (s.chosenTrack || '').toLowerCase() === department.toLowerCase());
  }, [students, department]);

  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [search, pageSize]);

  const { total, totalPages } = meta;
  const currentPage = page;
  const startIdx = (currentPage - 1) * pageSize;
  const currentRows = filtered; // Data is already paginated from backend

  const { totalStudents, activeStudents, totalInterviews, averageScore: avgScore } = stats;

  const initialsFor = (name: string) => {
    if (!name) return 'ST';
    const parts = name.split(' ').filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'ST';
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  const statusLabel = (s: Student) => {
    const raw = (s.status || '').toLowerCase();
    if (raw) return raw === 'active' || raw === 'approved' ? 'Active' : raw === 'pending' ? 'Pending' : raw[0]?.toUpperCase() + raw.slice(1);
    if (s.paymentCompleted || s.paymentVerified) return 'Active';
    return 'Pending';
  };

  const statusVariant = (label: string) => {
    const v = label.toLowerCase();
    if (v.includes('active') || v.includes('approved')) return 'success';
    if (v.includes('pending') || v.includes('await')) return 'warning';
    return 'info';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Students Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage all registered students
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
                        {d === "ALL" ? "All Department" : d}
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
            <CardTitle className="text-slate-900">Students ({total})</CardTitle>
            <CardDescription className="text-slate-500">
              Students has taken the interview
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-100/60">
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Attempt</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead className="pr-6 text-right"> </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="py-10 text-center text-slate-600"
                      >
                        <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-[#155dfc] mb-3" />
                        <div>Loading students...</div>
                      </TableCell>
                    </TableRow>
                  ) : currentRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="py-12 text-center text-slate-600"
                      >
                        <UserRound className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                        <div>No students found</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentRows.map((s) => {
                      const label = statusLabel(s);
                      const variant = statusVariant(label) as any;
                      return (
                        <TableRow key={s.id} className="hover:bg-slate-50">
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-none text-slate-700 flex items-center justify-center text-xs font-semibold">
                                {initialsFor(s.fullName)}
                              </div>
                              <div className="font-medium text-slate-900">
                                {s.fullName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-700">
                            {s.email}
                          </TableCell>
                          <TableCell className="text-slate-700">
                            {formatDate(s.createdAt)}
                          </TableCell>
                          <TableCell className="text-slate-700">
                            {s.phone || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={variant}
                              className="rounded-full px-3"
                            >
                              {label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-700">
                            {s.chosenTrack || "—"}
                          </TableCell>
                          <TableCell className="text-slate-700">1</TableCell>
                          <TableCell className="text-slate-700">
                            {s.assessmentScore !== null &&
                            s.assessmentScore !== undefined
                              ? `${s.assessmentScore}%`
                              : "—"}
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                            >
                              <MoreHorizontal className="h-4 w-4 text-slate-500" />
                            </Button>
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
                Showing {total === 0 ? 0 : startIdx + 1} to{" "}
                {Math.min(startIdx + pageSize, total)} of {total} students
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  Students per page:
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => setPageSize(Number(v))}
                  >
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
                      const pages = [];
                      const startPage = Math.max(1, currentPage - 2);
                      const endPage = Math.min(totalPages, startPage + 4);
                      const adjustedStart = Math.max(1, endPage - 4);
                      
                      for (let i = adjustedStart; i <= endPage; i++) {
                        pages.push(i);
                      }
                      
                      return pages.map((pageNum) => {
                        const active = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setPage(pageNum)}
                            className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                              active
                                ? "bg-[#155dfc] text-white"
                                : "bg-slate-100 text-slate-700 hover:bg-none"
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
    </AdminLayout>
  );
}

