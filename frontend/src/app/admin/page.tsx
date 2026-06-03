'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
import {
  Search,
  UserRound,
  Calendar,
  CalendarX,
  Info,
  Mail,
  Phone,
  FileText,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  CheckSquare,
  Square,
  ChevronRight,
  Sparkles,
  PieChart as LucidePieChart,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from 'recharts';
import { adminAPI } from '@/services/admin-service';
import { AdminLayout } from '@/components/admin-layout';
import { Checkbox } from '@/components/ui/checkbox';

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

export default function AdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    completedInterviews: 0,
    scheduledInterviews: 0,
    pendingInterviews: 0,
    paidStudents: 0,
    averageScore: 0,
  });
  const [analytics, setAnalytics] = useState<{
    growthByMonth: Array<{ label: string; value: number }>;
    programPerformance: Array<{ name: string; students: number; averageScore: number }>;
    departmentDistribution: Array<{ name: string; value: number }>;
    statusDistribution: Array<{ status: string; count: number }>;
  }>({
    growthByMonth: [],
    programPerformance: [],
    departmentDistribution: [],
    statusDistribution: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewInstructions, setInterviewInstructions] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResults, setBatchResults] = useState<Array<{ studentId: string; success: boolean; error?: string }>>([]);

  const [unscheduleModalOpen, setUnscheduleModalOpen] = useState(false);
  const [unscheduleLoading, setUnscheduleLoading] = useState(false);
  const [studentToUnschedule, setStudentToUnschedule] = useState<Student | null>(null);

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsData, statsData, analyticsData] = await Promise.all([
        adminAPI.getAllStudents(search || undefined, statusFilter !== 'ALL' ? statusFilter : undefined),
        adminAPI.getStats(),
        adminAPI.getAnalytics(),
      ]);
      const normalizedStudents = Array.isArray(studentsData)
        ? studentsData
        : Array.isArray((studentsData as any)?.data)
          ? (studentsData as any).data
          : [];
      setStudents(normalizedStudents);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    await loadData();
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
      await loadData();
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
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(s => s.id)));
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

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      if (failureCount === 0) {
        await loadData();
        setBatchModalOpen(false);
        setSelectedStudents(new Set());
        setInterviewDate('');
        setInterviewTime('');
        setInterviewInstructions('');
      } else {
        setError(`${successCount} scheduled successfully, ${failureCount} failed. See details below.`);
      }
    } catch (err: any) {
      console.error('Failed to schedule batch interviews:', err);
      setError(err.response?.data?.message || 'Failed to schedule batch interviews');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleUnscheduleConfirm = (student: Student) => {
    setStudentToUnschedule(student);
    setUnscheduleModalOpen(true);
  };

  const handleUnschedule = async () => {
    if (!studentToUnschedule) return;
    setUnscheduleLoading(true);
    setError(null);
    try {
      await adminAPI.unscheduleInterview(studentToUnschedule.id);
      await loadData();
      setUnscheduleModalOpen(false);
      setStudentToUnschedule(null);
    } catch (err: any) {
      console.error('Failed to unschedule interview:', err);
      setError(err.response?.data?.message || 'Failed to unschedule interview');
    } finally {
      setUnscheduleLoading(false);
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
    if (student.interviewCompleted) {
      return <Badge variant="success">Completed</Badge>;
    }
    if (student.interviewDate) {
      return <Badge variant="info">Scheduled</Badge>;
    }
    return <Badge variant="warning">Pending</Badge>;
  };

  const getPaymentBadge = (student: Student) => {
    if (student.paymentCompleted && student.paymentVerified) {
      return <Badge variant="success">Paid</Badge>;
    }
    return <Badge variant="warning">Pending</Badge>;
  };

  const {
    totalStudents,
    completedInterviews,
    scheduledInterviews,
    pendingInterviews,
    paidStudents,
    averageScore,
  } = stats;

  const displayedStudents = students.slice(0, 5);

  const statusChartData = analytics.statusDistribution.map(sd => ({
    name: sd.status.replace('_', ' '),
    value: sd.count,
  }));

  const STATUS_COLORS = ['#F59E0B', '#8B5CF6', '#3B82F6', '#10B981'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Visual analytics and management overview of enrolled students
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setSelectedStudent(null);
                setInterviewModalOpen(true);
              }}
              className="gap-2 rounded-xl text-white font-medium shadow-md transition-all hover:scale-[1.02]"
              style={{
                background:
                  "linear-gradient(135deg, #155dfc 0%, #0d4bc4 100%)",
              }}
            >
              <Plus className="h-4 w-4" />
              Schedule Interview
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Enrolled</span>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalStudents}</div>
              <p className="text-xs text-slate-500 mt-1">Active enrolled students</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Scheduled Interviews</span>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                <Calendar className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{scheduledInterviews}</div>
              <p className="text-xs text-slate-500 mt-1">Interviews scheduled</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed Sessions</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{completedInterviews}</div>
              <p className="text-xs text-slate-500 mt-1">AI evaluations completed</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-white hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average AI Score</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {isNaN(averageScore) || averageScore === 0 ? "N/A" : `${averageScore.toFixed(1)}%`}
              </div>
              <p className="text-xs text-slate-500 mt-1">Score average overall</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm bg-white p-4">
            <CardHeader className="px-2 pb-6">
              <CardTitle className="text-lg font-semibold text-slate-900">Registrations Trend</CardTitle>
              <CardDescription className="text-xs text-slate-500">Monthly candidate registration growth over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-80 pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.growthByMonth.length > 0 ? analytics.growthByMonth : [{ label: 'Empty', value: 0 }]}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#155dfc" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#155dfc" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    labelClassName="font-semibold text-slate-800"
                  />
                  <Area type="monotone" dataKey="value" stroke="#155dfc" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white p-4 flex flex-col justify-between">
            <div>
              <CardHeader className="px-2 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Candidate Pipeline</CardTitle>
                <CardDescription className="text-xs text-slate-500">Overall status funnel of registrations</CardDescription>
              </CardHeader>
              <CardContent className="h-56 relative flex items-center justify-center">
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-400 text-sm">No status data available</div>
                )}
              </CardContent>
            </div>
            <div className="px-2 grid grid-cols-2 gap-2 text-xs">
              {statusChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }} />
                  <span className="truncate">{entry.name}: <strong>{entry.value}</strong></span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-sm bg-white p-4">
            <CardHeader className="px-2 pb-6">
              <CardTitle className="text-lg font-semibold text-slate-900">Enrollment by Track</CardTitle>
              <CardDescription className="text-xs text-slate-500">Distribution of enrolled candidates per track</CardDescription>
            </CardHeader>
            <CardContent className="h-64 pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.programPerformance.length > 0 ? analytics.programPerformance : [{ name: 'None', students: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                  />
                  <Bar dataKey="students" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white p-4 flex flex-col justify-between">
            <CardHeader className="px-2 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
              <CardDescription className="text-xs text-slate-500">Fast tracking utility options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col justify-center">
              <Link href="/admin/students" className="w-full">
                <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Manage Students</p>
                    <p className="text-[10px] text-slate-500">Schedule, filter & view profiles</p>
                  </div>
                </Button>
              </Link>

              <Link href="/admin/question-bank" className="w-full">
                <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Question Bank</p>
                    <p className="text-[10px] text-slate-500">Configure AI evaluation metrics</p>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none bg-white shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 py-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Recently Enrolled Students
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Overview of the most recently registered and enrolled student applications
                </CardDescription>
              </div>
              <Link href="/admin/students">
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
                  View All Students
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#155dfc] mb-4"></div>
                  <p className="text-gray-600">Loading recent students...</p>
                </div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <UserRound className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">No enrolled students found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Interview Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedStudents.map((student) => (
                      <TableRow key={student.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-semibold text-slate-800">
                          {student.applicationId}
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">{student.fullName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {student.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {student.phone ? (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              {student.phone}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>{getPaymentBadge(student)}</TableCell>
                        <TableCell>
                          {student.assessmentStatus === "completed" &&
                          student.assessmentScore !== null ? (
                            <Badge variant="success">
                              {student.assessmentScore}%
                            </Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(student)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNewInterview(student)}
                              className="gap-2 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              {student.interviewDate && !student.interviewCompleted ? 'Reschedule' : 'Schedule'}
                            </Button>
                            {student.interviewDate && !student.interviewCompleted && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnscheduleConfirm(student)}
                                className="gap-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
                              >
                                <CalendarX className="h-3.5 w-3.5" />
                                Unschedule
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

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
                  : "Select a student and schedule their interview"}
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
                        <p className="font-semibold text-gray-900">
                          {selectedStudent.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedStudent.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {selectedStudent.applicationId}
                        </p>
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
                  <strong>Note:</strong> A unique interview room will be
                  automatically generated for this student. They will be able to
                  join the interview and start their interview with a
                  user-friendly interface.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="interview-instructions">
                  Interview Instructions
                </Label>
                <Textarea
                  id="interview-instructions"
                  value={interviewInstructions}
                  onChange={(e) => setInterviewInstructions(e.target.value)}
                  placeholder="Enter interview instructions, preparation tips, or any important information for the student..."
                  className="min-h-[110px] rounded-xl border-slate-200 bg-slate-50"
                />
                <p className="text-xs text-slate-500">
                  These instructions will be sent to the student along with
                  their interview details
                </p>
              </div>
            </div>

            <DialogFooter className="sm:justify-center pt-2">
              <Button
                onClick={handleScheduleInterview}
                disabled={
                  !selectedStudent ||
                  !interviewDate ||
                  !interviewTime ||
                  loading
                }
                style={{
                  background:
                    "linear-gradient(135deg, rgba(21,93,252,0.95), rgba(13,75,196,0.92))",
                }}
                className="min-w-[180px] rounded-xl"
              >
                {loading ? "Scheduling..." : "Schedule Interview"}
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
                Schedule interviews for {selectedStudents.size} selected student
                {selectedStudents.size !== 1 ? "s" : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Selected Students List */}
              <div className="grid gap-2">
                <Label>Selected Students ({selectedStudents.size})</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                  {students
                    .filter((s) => selectedStudents.has(s.id))
                    .map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-2 bg-blue-50 rounded"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {student.applicationId} • {student.email}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStudent(student.id)}
                        >
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
                  <strong>💡 Note:</strong> A unique interview room will be
                  automatically generated for each selected student. They will
                  be able to join their interviews using our built-in video
                  calling system.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="batch-interview-instructions">
                  Interview Instructions
                </Label>
                <Textarea
                  id="batch-interview-instructions"
                  value={interviewInstructions}
                  onChange={(e) => setInterviewInstructions(e.target.value)}
                  placeholder="Enter interview instructions, preparation tips, or any important information for the students..."
                  className="min-h-[120px]"
                />
                <p className="text-xs text-gray-500">
                  These instructions will be sent to all selected students along
                  with their interview details
                </p>
              </div>

              {/* Batch Results */}
              {batchResults.length > 0 && (
                <div className="grid gap-2">
                  <Label>Schedule Results</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                    {batchResults.map((result, index) => {
                      const student = students.find(
                        (s) => s.id === result.studentId
                      );
                      return (
                        <div
                          key={result.studentId}
                          className={`flex items-center justify-between p-2 rounded ${
                            result.success ? "bg-green-50" : "bg-red-50"
                          }`}
                        >
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                result.success
                                  ? "text-green-800"
                                  : "text-red-800"
                              }`}
                            >
                              {student?.fullName || result.studentId}
                            </p>
                            {result.error && (
                              <p className="text-xs text-red-600">
                                {result.error}
                              </p>
                            )}
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
                  if (
                    batchResults.length > 0 &&
                    batchResults.every((r) => r.success)
                  ) {
                    setSelectedStudents(new Set());
                    setInterviewDate("");
                    setInterviewTime("");
                    setInterviewInstructions("");
                  }
                }}
                disabled={batchLoading}
              >
                {batchResults.length > 0 && batchResults.every((r) => r.success)
                  ? "Close"
                  : "Cancel"}
              </Button>
              <Button
                onClick={handleBatchSchedule}
                disabled={
                  selectedStudents.size === 0 ||
                  !interviewDate ||
                  !interviewTime ||
                  batchLoading
                }
                style={{
                  background:
                    "linear-gradient(135deg, rgba(34,197,94,0.95), rgba(22,163,74,0.92))",
                }}
              >
                {batchLoading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Scheduling...
                  </>
                ) : (
                  `Schedule ${selectedStudents.size} Interview${
                    selectedStudents.size !== 1 ? "s" : ""
                  }`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Unschedule Interview Confirmation Modal */}
      <Dialog open={unscheduleModalOpen} onOpenChange={setUnscheduleModalOpen}>
        <DialogContent className="max-w-md rounded-3xl border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <CalendarX className="h-5 w-5" />
              Unschedule Interview
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to unschedule the interview for{' '}
              <strong>{studentToUnschedule?.fullName}</strong>? This will remove
              the interview date and notify the student.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-2">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Warning:</strong> The student&apos;s scheduled interview will be cancelled
              and any associated AI interview session will be deleted. The student will receive a
              notification about this change.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUnscheduleModalOpen(false);
                setStudentToUnschedule(null);
              }}
              disabled={unscheduleLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnschedule}
              disabled={unscheduleLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {unscheduleLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Unscheduling...
                </>
              ) : (
                'Yes, Unschedule'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
