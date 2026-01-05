'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Textarea } from '@/lib/components/ui/textarea';
import { Badge } from '@/lib/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/lib/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/lib/components/ui/table';
import { 
  Search, 
  UserRound, 
  Calendar, 
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
} from 'lucide-react';
import { adminAPI } from '@/lib/services/api';
import { AdminLayout } from '@/lib/components/admin-layout';
import { Checkbox } from '@/lib/components/ui/checkbox';

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

  useEffect(() => {
    loadStudents();
  }, [search, statusFilter]);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getAllStudents(search || undefined, statusFilter !== 'ALL' ? statusFilter : undefined);
      setStudents(data || []);
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

    // Combine date and time into ISO format
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

    // Combine date and time into ISO format
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
        // All succeeded
        await loadStudents();
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

  // Calculate statistics
  const totalStudents = students.length;
  const completedInterviews = students.filter(s => s.interviewCompleted).length;
  const scheduledInterviews = students.filter(s => s.interviewDate && !s.interviewCompleted).length;
  const pendingInterviews = students.filter(s => !s.interviewDate && !s.interviewCompleted).length;
  const paidStudents = students.filter(s => s.paymentCompleted && s.paymentVerified).length;
  const averageScore = students
    .filter(s => s.assessmentScore !== null && s.assessmentScore !== undefined)
    .reduce((sum, s) => sum + (s.assessmentScore || 0), 0) / 
    students.filter(s => s.assessmentScore !== null && s.assessmentScore !== undefined).length || 0;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of student management and statistics</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedStudents.size > 0 && (
              <Button
                onClick={() => {
                  setBatchModalOpen(true);
                }}
                className="gap-2"
                variant="default"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.95), rgba(22,163,74,0.92))',
                }}
              >
                <Users className="h-4 w-4" />
                Batch Schedule ({selectedStudents.size})
              </Button>
            )}
            <Button
              onClick={() => {
                setSelectedStudent(null);
                setInterviewModalOpen(true);
              }}
              className="gap-2"
              style={{
                background: 'linear-gradient(135deg, rgba(21,93,252,0.95), rgba(13,75,196,0.92))',
              }}
            >
              <Plus className="h-4 w-4" />
              Schedule Interview
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Registered students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Interviews</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedInterviews}</div>
              <p className="text-xs text-muted-foreground">
                {totalStudents > 0 ? Math.round((completedInterviews / totalStudents) * 100) : 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledInterviews}</div>
              <p className="text-xs text-muted-foreground">Interviews scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isNaN(averageScore) ? 'N/A' : `${averageScore.toFixed(1)}%`}
              </div>
              <p className="text-xs text-muted-foreground">Assessment average</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{paidStudents}</div>
                  <p className="text-xs text-muted-foreground">Paid students</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{pendingInterviews}</div>
                  <p className="text-xs text-muted-foreground">Awaiting schedule</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {students.filter(s => s.assessmentStatus === 'completed').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Student Management</CardTitle>
            <CardDescription>Search and filter students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, application ID, or email..."
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Students ({students.length})</CardTitle>
                <CardDescription>View and manage all registered students</CardDescription>
              </div>
              {selectedStudents.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudents(new Set())}
                  className="gap-2"
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
                          checked={selectedStudents.size === students.length && students.length > 0}
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
                      <TableRow key={student.id} className={selectedStudents.has(student.id) ? 'bg-blue-50' : ''}>
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
                          {student.assessmentStatus === 'completed' && student.assessmentScore !== null ? (
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
                            className="gap-2"
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

        {/* Schedule Interview Modal */}
        <Dialog open={interviewModalOpen} onOpenChange={setInterviewModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>
                {selectedStudent
                  ? `Schedule an interview for ${selectedStudent.fullName} (${selectedStudent.applicationId})`
                  : 'Select a student and schedule their interview'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {!selectedStudent && (
                <div className="grid gap-2">
                  <Label>Select Student</Label>
                  <Select
                    onValueChange={(value) => {
                      const student = students.find((s) => s.id === value);
                      if (student) setSelectedStudent(student);
                    }}
                  >
                    <SelectTrigger>
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
                <Card className="bg-blue-50 border-blue-200">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="interview-date">Interview Date *</Label>
                  <Input
                    id="interview-date"
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="interview-time">Interview Time *</Label>
                  <Input
                    id="interview-time"
                    type="time"
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Note:</strong> A unique interview room will be automatically generated for this student. 
                  They will be able to join the interview using our built-in video calling system.
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
                  className="min-h-[120px]"
                />
                <p className="text-xs text-gray-500">
                  These instructions will be sent to the student along with their interview details
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setInterviewModalOpen(false);
                  setSelectedStudent(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleScheduleInterview}
                disabled={!selectedStudent || !interviewDate || !interviewTime || loading}
                style={{
                  background: 'linear-gradient(135deg, rgba(21,93,252,0.95), rgba(13,75,196,0.92))',
                }}
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
              {/* Selected Students List */}
              <div className="grid gap-2">
                <Label>Selected Students ({selectedStudents.size})</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                  {students
                    .filter(s => selectedStudents.has(s.id))
                    .map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{student.fullName}</p>
                          <p className="text-xs text-gray-600">{student.applicationId} • {student.email}</p>
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
                  <strong>💡 Note:</strong> A unique interview room will be automatically generated for each selected student. 
                  They will be able to join their interviews using our built-in video calling system.
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
                  These instructions will be sent to all selected students along with their interview details
                </p>
              </div>

              {/* Batch Results */}
              {batchResults.length > 0 && (
                <div className="grid gap-2">
                  <Label>Schedule Results</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                    {batchResults.map((result, index) => {
                      const student = students.find(s => s.id === result.studentId);
                      return (
                        <div
                          key={result.studentId}
                          className={`flex items-center justify-between p-2 rounded ${
                            result.success ? 'bg-green-50' : 'bg-red-50'
                          }`}
                        >
                          <div>
                            <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                              {student?.fullName || result.studentId}
                            </p>
                            {result.error && (
                              <p className="text-xs text-red-600">{result.error}</p>
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
                  if (batchResults.length > 0 && batchResults.every(r => r.success)) {
                    setSelectedStudents(new Set());
                    setInterviewDate('');
                    setInterviewTime('');
                    setInterviewInstructions('');
                  }
                }}
                disabled={batchLoading}
              >
                {batchResults.length > 0 && batchResults.every(r => r.success) ? 'Close' : 'Cancel'}
              </Button>
              <Button
                onClick={handleBatchSchedule}
                disabled={selectedStudents.size === 0 || !interviewDate || !interviewTime || batchLoading}
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.95), rgba(22,163,74,0.92))',
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
