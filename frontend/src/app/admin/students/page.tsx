'use client';

import { useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { adminAPI } from '@/services/admin-service';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Info,
  Mail,
  Phone,
  Search,
  UserRound,
} from 'lucide-react';

interface Student {
  id: string;
  applicationId: string;
  fullName: string;
  email: string;
  phone?: string;
  status?: string;
  assessmentStatus?: string;
  assessmentScore?: number;
  interviewDate?: string;
  interviewCompleted: boolean;
  interviewLink?: string;
  paymentCompleted: boolean;
  paymentVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewInstructions, setInterviewInstructions] = useState('');

  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResults, setBatchResults] = useState<
    Array<{ studentId: string; success: boolean; error?: string }>
  >([]);

  useEffect(() => {
    loadStudents();
  }, [search, statusFilter, page, pageSize]);

  useEffect(() => {
    setPage(1);
    setSelectedStudents(new Set());
  }, [search, statusFilter, pageSize]);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const studentsData = await adminAPI.getAllStudents(
        search || undefined,
        statusFilter !== 'ALL' ? statusFilter : undefined,
        page,
        pageSize
      );
      if (studentsData && (studentsData as any).data) {
        setStudents((studentsData as any).data || []);
        setMeta((studentsData as any).meta || meta);
      } else {
        const normalizedStudents = Array.isArray(studentsData) ? studentsData : [];
        setStudents(normalizedStudents);
        setMeta({
          total: normalizedStudents.length,
          page: 1,
          limit: pageSize,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      }
    } catch (err: any) {
      console.error('Failed to load students:', err);
      setError(err.response?.data?.message || 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewInterview = (student: Student) => {
    setSelectedStudent(student);
    setInterviewDate('');
    setInterviewTime('');
    setInterviewInstructions('');
    setInterviewModalOpen(true);
  };

  const handleScheduleInterview = async () => {
    if (!selectedStudent) return;
    if (!interviewDate || !interviewTime) {
      setError('Please fill in all required fields (Date and Time)');
      return;
    }

    const dateTime = new Date(`${interviewDate}T${interviewTime}`).toISOString();

    setLoading(true);
    setError(null);
    try {
      await adminAPI.scheduleInterview(
        selectedStudent.id,
        dateTime,
        interviewInstructions || undefined
      );
      await loadStudents();
      setInterviewModalOpen(false);
      setSelectedStudent(null);
    } catch (err: any) {
      console.error('Failed to schedule interview:', err);
      setError(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStudent = (studentId: string) => {
    const next = new Set(selectedStudents);
    if (next.has(studentId)) next.delete(studentId);
    else next.add(studentId);
    setSelectedStudents(next);
  };

  const handleSelectAll = () => {
    const idsOnPage = students.map((s) => s.id);
    const allSelected = idsOnPage.length > 0 && idsOnPage.every((id) => selectedStudents.has(id));
    if (allSelected) {
      const next = new Set(selectedStudents);
      idsOnPage.forEach((id) => next.delete(id));
      setSelectedStudents(next);
    } else {
      const next = new Set(selectedStudents);
      idsOnPage.forEach((id) => next.add(id));
      setSelectedStudents(next);
    }
  };

  const handleBatchSchedule = async () => {
    if (selectedStudents.size === 0) {
      setError('Please select at least one student');
      return;
    }

    if (!interviewDate || !interviewTime) {
      setError('Please fill in all required fields (Date and Time)');
      return;
    }

    const dateTime = new Date(`${interviewDate}T${interviewTime}`).toISOString();
    const studentIds = Array.from(selectedStudents);

    setBatchLoading(true);
    setError(null);
    setBatchResults([]);

    try {
      const results = await adminAPI.scheduleBatchInterviews(
        studentIds,
        dateTime,
        interviewInstructions || undefined
      );

      setBatchResults(results);

      const successCount = results.filter((r: any) => r.success).length;
      const failureCount = results.filter((r: any) => !r.success).length;

      if (failureCount === 0) {
        await loadStudents();
        setBatchModalOpen(false);
        setSelectedStudents(new Set());
        setInterviewDate('');
        setInterviewTime('');
        setInterviewInstructions('');
      } else {
        setError(
          `${successCount} scheduled successfully, ${failureCount} failed. See details below.`
        );
      }
    } catch (err: any) {
      console.error('Failed to schedule batch interviews:', err);
      setError(err.response?.data?.message || 'Failed to schedule batch interviews');
    } finally {
      setBatchLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (student: Student) => {
    if (student.interviewCompleted) return <Badge variant="success">Completed</Badge>;
    if (student.interviewDate) return <Badge variant="info">Scheduled</Badge>;
    return <Badge variant="warning">Pending</Badge>;
  };

  const getPaymentBadge = (student: Student) => {
    if (student.paymentCompleted && student.paymentVerified) {
      return <Badge variant="success">Paid</Badge>;
    }
    return <Badge variant="warning">Pending</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Student Management</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage all registered students</p>
        </div>

        {/* Search and Filters */}
        <Card className="border-none rounded-xl bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Student Management</CardTitle>
            <CardDescription className="text-slate-500">
              Search and filter students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, application ID, or email..."
                  className="pl-9 rounded-xl border-none bg-[#F6F7F9]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[220px] rounded-xl border-none bg-[#F6F7F9]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Students</SelectItem>
                  <SelectItem value="pending">Pending Interview</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-red-500 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Students Table */}
        <Card className="border-none bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900">
                  Students ({meta.total || students.length})
                </CardTitle>
                <CardDescription className="text-slate-500">
                  View and manage all registered students
                </CardDescription>
              </div>
              {selectedStudents.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudents(new Set())}
                  className="gap-2 rounded-xl border-slate-200"
                >
                  Clear Selection ({selectedStudents.size})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#155dfc] mb-4"></div>
                  <p className="text-gray-600">Loading students...</p>
                </div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <UserRound className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No students found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            students.length > 0 &&
                            students.every((s) => selectedStudents.has(s.id))
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Interview Status</TableHead>
                      <TableHead>Interview Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow
                        key={student.id}
                        className={
                          selectedStudents.has(student.id) ? 'bg-blue-50' : ''
                        }
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.has(student.id)}
                            onCheckedChange={() => handleToggleStudent(student.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{student.applicationId}</TableCell>
                        <TableCell>{student.fullName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {student.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {student.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              {student.phone}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>{getPaymentBadge(student)}</TableCell>
                        <TableCell>
                          {student.assessmentStatus === 'completed' &&
                          student.assessmentScore !== null ? (
                            <Badge variant="success">{student.assessmentScore}%</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(student)}</TableCell>
                        <TableCell>
                          {student.interviewDate ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {formatDate(student.interviewDate)}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNewInterview(student)}
                            className="gap-2 rounded-lg border-slate-200"
                          >
                            <Calendar className="h-4 w-4" />
                            Schedule
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        <Card className="border-none bg-white">
          <CardContent className="py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-xs text-slate-500">
                Showing {meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1} to{' '}
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} students
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  Students per page:
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
                    disabled={page <= 1 || meta.hasPreviousPage === false}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1 px-1">
                    {(() => {
                      const totalPages = meta.totalPages || 1;
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
                    {(meta.totalPages || 1) > page + 2 && (
                      <span className="text-slate-400 text-xs px-1">…</span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg"
                    disabled={page >= (meta.totalPages || 1) || meta.hasNextPage === false}
                    onClick={() => setPage((p) => Math.min(meta.totalPages || 1, p + 1))}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Interview Modal */}
        <Dialog open={interviewModalOpen} onOpenChange={setInterviewModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-slate-200 px-8 py-7">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-xl text-slate-900">
                <span className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </span>
                Schedule Interview
              </DialogTitle>
              <DialogDescription>
                {selectedStudent
                  ? `Schedule an interview for ${selectedStudent.fullName} (${selectedStudent.applicationId})`
                  : 'Select a student and schedule their interview'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-2">
              {!selectedStudent && (
                <div className="grid gap-2">
                  <Label className="text-slate-700">Select Student</Label>
                  <Select
                    onValueChange={(value) => {
                      const student = students.find((s) => s.id === value);
                      if (student) setSelectedStudent(student);
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50">
                      <SelectValue placeholder="Choose a student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.fullName} ({student.applicationId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedStudent && (
                <Card className="bg-blue-50 border-blue-200 rounded-xl">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#155dfc] rounded-full flex items-center justify-center text-white font-bold">
                        {selectedStudent.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedStudent.fullName}</p>
                        <p className="text-sm text-gray-600">{selectedStudent.email}</p>
                        <p className="text-xs text-gray-500">ID: {selectedStudent.applicationId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="interview-date" className="text-slate-700">
                    Interview Date
                  </Label>
                  <Input
                    id="interview-date"
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    required
                    className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="interview-time" className="text-slate-700">
                    Interview Time
                  </Label>
                  <Input
                    id="interview-time"
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    required
                    className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-700">Duration</Label>
                  <Input
                    value="90 Minutes"
                    readOnly
                    className="h-11 rounded-xl border-slate-200 bg-slate-100 text-slate-500"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-2.5">
                <Info className="h-4 w-4 mt-0.5 text-amber-600" />
                <p className="text-sm text-amber-800 leading-6">
                  <strong>Note:</strong> A unique interview room will be automatically generated for this student. They will be able to join the interview and start their interview with a user-friendly interface.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="interview-instructions">Interview Instructions</Label>
                <Textarea
                  id="interview-instructions"
                  value={interviewInstructions}
                  onChange={(e) => setInterviewInstructions(e.target.value)}
                  placeholder="Enter interview instructions, preparation tips, or any important information for the student..."
                  className="min-h-[110px] rounded-xl border-slate-200 bg-slate-50"
                />
                <p className="text-xs text-slate-500">
                  These instructions will be sent to the student along with their interview details
                </p>
              </div>
            </div>

            <DialogFooter className="sm:justify-center pt-2">
              <Button
                onClick={handleScheduleInterview}
                disabled={!selectedStudent || !interviewDate || !interviewTime || loading}
                style={{
                  background:
                    'linear-gradient(135deg, rgba(21,93,252,0.95), rgba(13,75,196,0.92))',
                }}
                className="min-w-[180px] rounded-xl"
              >
                {loading ? 'Scheduling...' : 'Schedule Interview'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Batch Schedule Interview Modal */}
        <Dialog open={batchModalOpen} onOpenChange={setBatchModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Batch Schedule Interviews</DialogTitle>
              <DialogDescription>
                Schedule interviews for {selectedStudents.size} selected student{selectedStudents.size !== 1 ? 's' : ''}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Selected Students ({selectedStudents.size})</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                  {students
                    .filter((s) => selectedStudents.has(s.id))
                    .map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{student.fullName}</p>
                          <p className="text-xs text-gray-600">{student.applicationId} • {student.email}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleStudent(student.id)}>
                          ×
                        </Button>
                      </div>
                    ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="batch-interview-date">Interview Date *</Label>
                  <Input
                    id="batch-interview-date"
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="batch-interview-time">Interview Time *</Label>
                  <Input
                    id="batch-interview-time"
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Note:</strong> A unique interview room will be automatically generated for each selected student. They will be able to join their interviews using our built-in video calling system.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="batch-interview-instructions">Interview Instructions</Label>
                <Textarea
                  id="batch-interview-instructions"
                  value={interviewInstructions}
                  onChange={(e) => setInterviewInstructions(e.target.value)}
                  placeholder="Enter interview instructions, preparation tips, or any important information for the students..."
                  className="min-h-[120px]"
                />
                <p className="text-xs text-gray-500">
                  These instructions will be sent to all selected students along with their interview details
                </p>
              </div>

              {batchResults.length > 0 && (
                <div className="grid gap-2">
                  <Label>Schedule Results</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                    {batchResults.map((result) => {
                      const student = students.find((s) => s.id === result.studentId);
                      return (
                        <div
                          key={result.studentId}
                          className={`flex items-center justify-between p-2 rounded ${result.success ? 'bg-green-50' : 'bg-red-50'}`}
                        >
                          <div>
                            <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                              {student?.fullName || result.studentId}
                            </p>
                            {result.error && <p className="text-xs text-red-600">{result.error}</p>}
                          </div>
                          {result.success ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <span className="text-red-600">✕</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setBatchModalOpen(false);
                  setBatchResults([]);
                  if (batchResults.length > 0 && batchResults.every((r) => r.success)) {
                    setSelectedStudents(new Set());
                    setInterviewDate('');
                    setInterviewTime('');
                    setInterviewInstructions('');
                  }
                }}
                disabled={batchLoading}
              >
                {batchResults.length > 0 && batchResults.every((r) => r.success) ? 'Close' : 'Cancel'}
              </Button>
              <Button
                onClick={handleBatchSchedule}
                disabled={selectedStudents.size === 0 || !interviewDate || !interviewTime || batchLoading}
                style={{
                  background:
                    'linear-gradient(135deg, rgba(34,197,94,0.95), rgba(22,163,74,0.92))',
                }}
              >
                {batchLoading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scheduling...
                  </>
                ) : (
                  `Schedule ${selectedStudents.size} Interview${selectedStudents.size !== 1 ? 's' : ''}`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

