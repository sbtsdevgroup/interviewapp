'use client';

import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
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
      <div className="space-y-6">
        <div className="border-none rounded-xl bg-white p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Dashboard
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Overview of student management and statistics
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedStudents.size > 0 && (
                <Button
                  onClick={() => {
                    setBatchModalOpen(true);
                  }}
                  className="gap-2 rounded-xl"
                  variant="default"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(34,197,94,0.95), rgba(22,163,74,0.92))",
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
                className="gap-2 rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(21,93,252,0.95), rgba(13,75,196,0.92))",
                }}
              >
                <Plus className="h-4 w-4" />
                Schedule Interview
              </Button>
            </div>
          </div>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-none bg-[#F6F7F9]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Total Students
                </CardTitle>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="16"
                    fill="#0D62D1"
                    fill-opacity="0.1"
                  />
                  <path
                    d="M9.3335 20C9.3335 19.116 9.68469 18.2681 10.3098 17.643C10.9349 17.0179 11.7828 16.6667 12.6668 16.6667H19.3335C20.2176 16.6667 21.0654 17.0179 21.6905 17.643C22.3156 18.2681 22.6668 19.116 22.6668 20C22.6668 20.442 22.4912 20.866 22.1787 21.1785C21.8661 21.4911 21.4422 21.6667 21.0002 21.6667H11.0002C10.5581 21.6667 10.1342 21.4911 9.82165 21.1785C9.50909 20.866 9.3335 20.442 9.3335 20Z"
                    stroke="#0D62D1"
                    stroke-width="1.25"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M16 13.3333C17.3807 13.3333 18.5 12.2141 18.5 10.8333C18.5 9.45263 17.3807 8.33334 16 8.33334C14.6193 8.33334 13.5 9.45263 13.5 10.8333C13.5 12.2141 14.6193 13.3333 16 13.3333Z"
                    stroke="#0D62D1"
                    stroke-width="1.25"
                  />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-900">
                  {totalStudents}
                </div>
                <p className="text-xs text-slate-500">Registered students</p>
              </CardContent>
            </Card>
            <Card className="border-none bg-[#F6F7F9]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Completed Interviews
                </CardTitle>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="16"
                    fill="#018A13"
                    fill-opacity="0.1"
                  />
                  <g clip-path="url(#clip0_2663_754)">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M16.0002 7.50001C15.0152 7.50001 14.04 7.694 13.13 8.07091C12.2201 8.44782 11.3933 9.00027 10.6969 9.69671C10.0004 10.3931 9.44798 11.2199 9.07107 12.1299C8.69416 13.0398 8.50016 14.0151 8.50016 15C8.50016 15.9849 8.69416 16.9602 9.07107 17.8701C9.44798 18.7801 10.0004 19.6069 10.6969 20.3033C11.3933 20.9997 12.2201 21.5522 13.13 21.9291C14.04 22.306 15.0152 22.5 16.0002 22.5C17.9893 22.5 19.8969 21.7098 21.3035 20.3033C22.71 18.8968 23.5002 16.9891 23.5002 15C23.5002 13.0109 22.71 11.1032 21.3035 9.69671C19.8969 8.29019 17.9893 7.50001 16.0002 7.50001ZM6.8335 15C6.8335 9.93751 10.9377 5.83334 16.0002 5.83334C21.0627 5.83334 25.1668 9.93751 25.1668 15C25.1668 20.0625 21.0627 24.1667 16.0002 24.1667C10.9377 24.1667 6.8335 20.0625 6.8335 15Z"
                      fill="#018A13"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M20.6733 12.5L14.235 18.9384L11 15.0775L12.2592 13.9859L14.3225 16.4942L19.495 11.3217L20.6733 12.5Z"
                      fill="#018A13"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_2663_754">
                      <rect
                        width="20"
                        height="20"
                        fill="white"
                        transform="translate(6 5)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-900">
                  {completedInterviews}
                </div>
                <p className="text-xs text-slate-500">
                  {totalStudents > 0
                    ? Math.round((completedInterviews / totalStudents) * 100)
                    : 0}
                  % completion rate
                </p>
              </CardContent>
            </Card>
            <Card className="border-none bg-[#F6F7F9]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Scheduled
                </CardTitle>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="16"
                    fill="#8C068A"
                    fill-opacity="0.1"
                  />
                  <path
                    d="M16 7.5C11.8594 7.5 8.5 10.8594 8.5 15C8.5 19.1406 11.8594 22.5 16 22.5C20.1406 22.5 23.5 19.1406 23.5 15C23.5 10.8594 20.1406 7.5 16 7.5Z"
                    stroke="#8C068A"
                    stroke-width="1.25"
                    stroke-miterlimit="10"
                  />
                  <path
                    d="M16 10V15.625H19.75"
                    stroke="#8C068A"
                    stroke-width="1.25"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-900">
                  {scheduledInterviews}
                </div>
                <p className="text-xs text-slate-500">Interviews scheduled</p>
              </CardContent>
            </Card>
            <Card className="border-none bg-[#F6F7F9]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Average Score
                </CardTitle>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="16"
                    fill="#BE7A06"
                    fill-opacity="0.1"
                  />
                  <path
                    d="M11.8332 8.33334L9.5415 10M20.1665 8.33334L22.4582 10M10.1665 15.8333C10.1665 16.5994 10.3174 17.3579 10.6105 18.0657C10.9037 18.7734 11.3334 19.4165 11.875 19.9581C12.4167 20.4998 13.0598 20.9295 13.7675 21.2226C14.4752 21.5158 15.2338 21.6667 15.9998 21.6667C16.7659 21.6667 17.5244 21.5158 18.2322 21.2226C18.9399 20.9295 19.583 20.4998 20.1246 19.9581C20.6663 19.4165 21.096 18.7734 21.3891 18.0657C21.6823 17.3579 21.8332 16.5994 21.8332 15.8333C21.8332 14.2862 21.2186 12.8025 20.1246 11.7086C19.0307 10.6146 17.5469 10 15.9998 10C14.4527 10 12.969 10.6146 11.875 11.7086C10.7811 12.8025 10.1665 14.2862 10.1665 15.8333Z"
                    stroke="#BE7A06"
                    stroke-width="1.66667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12.6665 15.8333H13.4998L15.1665 18.3333L16.8332 13.3333L18.4998 15.8333H19.3332"
                    stroke="#BE7A06"
                    stroke-width="1.66667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-900">
                  {isNaN(averageScore) ? "N/A" : `${averageScore.toFixed(2)}%`}
                </div>
                <p className="text-xs text-slate-500">Assessment average</p>
              </CardContent>
            </Card>
          </div>
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none bg-[#F6F7F9]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-semibold text-slate-900">
                      {paidStudents}
                    </div>
                    <p className="text-xs text-slate-500">Paid students</p>
                  </div>
                  <svg
                    width="38"
                    height="38"
                    viewBox="0 0 38 38"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="19"
                      cy="19"
                      r="19"
                      fill="#03316D"
                      fill-opacity="0.1"
                    />
                    <path
                      d="M22.7108 20.2865C22.5139 20.2865 22.3252 20.3647 22.186 20.5039C22.0468 20.643 21.9686 20.8318 21.9686 21.0287C21.9686 21.2255 22.0468 21.4143 22.186 21.5535C22.3252 21.6927 22.5139 21.7709 22.7108 21.7709H25.1847C25.3816 21.7709 25.5704 21.6927 25.7095 21.5535C25.8487 21.4143 25.9269 21.2255 25.9269 21.0287C25.9269 20.8318 25.8487 20.643 25.7095 20.5039C25.5704 20.3647 25.3816 20.2865 25.1847 20.2865H22.7108ZM9.104 14.1016C9.104 13.2486 9.44285 12.4306 10.046 11.8274C10.6491 11.2243 11.4672 10.8854 12.3201 10.8854H25.6795C26.1019 10.8854 26.5201 10.9686 26.9103 11.1303C27.3005 11.2919 27.655 11.5288 27.9537 11.8274C28.2523 12.1261 28.4892 12.4806 28.6509 12.8708C28.8125 13.261 28.8957 13.6792 28.8957 14.1016V21.5235C28.8957 21.9458 28.8125 22.364 28.6509 22.7542C28.4892 23.1444 28.2523 23.499 27.9537 23.7976C27.655 24.0963 27.3005 24.3332 26.9103 24.4948C26.5201 24.6564 26.1019 24.7396 25.6795 24.7396H12.3201C11.4672 24.7396 10.6491 24.4008 10.046 23.7976C9.44285 23.1945 9.104 22.3764 9.104 21.5235V14.1016ZM27.4113 15.3386V14.1016C27.4113 13.6423 27.2288 13.2018 26.9041 12.877C26.5793 12.5523 26.1388 12.3698 25.6795 12.3698H12.3201C11.8609 12.3698 11.4204 12.5523 11.0956 12.877C10.7708 13.2018 10.5884 13.6423 10.5884 14.1016V15.3386H27.4113ZM10.5884 16.8229V21.5235C10.5884 22.4794 11.3642 23.2552 12.3201 23.2552H25.6795C26.1388 23.2552 26.5793 23.0728 26.9041 22.748C27.2288 22.4232 27.4113 21.9828 27.4113 21.5235V16.8229H10.5884Z"
                      fill="#03316D"
                    />
                  </svg>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none bg-[#F6F7F9]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Pending Interviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-semibold text-slate-900">
                      {pendingInterviews}
                    </div>
                    <p className="text-xs text-slate-500">Awaiting schedule</p>
                  </div>
                  <svg
                    width="38"
                    height="38"
                    viewBox="0 0 38 38"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="19"
                      cy="19"
                      r="19"
                      fill="#067EA0"
                      fill-opacity="0.1"
                    />
                    <path
                      d="M15.042 18.8021H17.0212V15.8333C17.0212 15.2891 17.2151 14.8233 17.603 14.436C17.991 14.0488 18.4567 13.8548 19.0003 13.8542V11.875C17.9118 11.875 16.9799 12.2626 16.2048 13.0378C15.4296 13.8129 15.042 14.7448 15.042 15.8333V18.8021ZM11.0837 26.7188C10.5394 26.7188 10.0736 26.5251 9.68637 26.1379C9.29911 25.7506 9.10515 25.2845 9.10449 24.7396V22.7604C9.10449 22.2161 9.29845 21.7504 9.68637 21.3631C10.0743 20.9759 10.54 20.7819 11.0837 20.7813H12.0732V15.8333C12.0732 13.9036 12.7455 12.2669 14.09 10.923C15.4345 9.57917 17.0713 8.90691 19.0003 8.90625C20.9294 8.90559 22.5665 9.57785 23.9116 10.923C25.2568 12.2682 25.9287 13.905 25.9274 15.8333V16.8971C25.7625 16.8642 25.6015 16.8437 25.4445 16.8358C25.2875 16.8279 25.1186 16.8236 24.9378 16.8229C24.7571 16.8223 24.5878 16.8265 24.4302 16.8358C24.2725 16.845 24.1119 16.8655 23.9482 16.8971V15.8333C23.9482 14.4644 23.4657 13.2977 22.5005 12.3332C21.5353 11.3687 20.3686 10.8861 19.0003 10.8854C17.6321 10.8848 16.4653 11.3673 15.5002 12.3332C14.535 13.299 14.0524 14.4657 14.0524 15.8333V20.7813H18.6787C18.5303 21.0946 18.4066 21.4162 18.3076 21.7461C18.2087 22.076 18.1344 22.4141 18.085 22.7604H11.0837V24.7396H18.085C18.1344 25.0859 18.2087 25.424 18.3076 25.7539C18.4066 26.0838 18.5303 26.4054 18.6787 26.7188H11.0837ZM21.4377 27.2511C20.4725 26.286 19.9899 25.1189 19.9899 23.75C19.9899 22.3811 20.4725 21.2144 21.4377 20.2498C22.4028 19.2853 23.5696 18.8027 24.9378 18.8021C26.3061 18.8014 27.4731 19.284 28.439 20.2498C29.4048 21.2157 29.8871 22.3824 29.8857 23.75C29.8844 25.1176 29.4018 26.2847 28.438 27.2511C27.4741 28.2176 26.3074 28.6999 24.9378 28.6979C23.5682 28.6959 22.4015 28.2143 21.4377 27.2511ZM25.3831 26.5456C25.4986 26.4301 25.5563 26.2817 25.5563 26.1003C25.5563 25.9188 25.4986 25.7704 25.3831 25.6549C25.2677 25.5395 25.1192 25.4818 24.9378 25.4818C24.7564 25.4818 24.608 25.5395 24.4925 25.6549C24.3771 25.7704 24.3193 25.9188 24.3193 26.1003C24.3193 26.2817 24.3771 26.4301 24.4925 26.5456C24.608 26.661 24.7564 26.7188 24.9378 26.7188C25.1192 26.7188 25.2677 26.661 25.3831 26.5456ZM24.4925 24.8385H25.4079V24.5911C25.4079 24.4097 25.4534 24.2488 25.5444 24.1082C25.6355 23.9677 25.7466 23.8318 25.8779 23.7005C26.1088 23.5026 26.2903 23.3129 26.4222 23.1315C26.5541 22.9501 26.6201 22.6944 26.6201 22.3646C26.6201 21.8863 26.4634 21.503 26.1501 21.2147C25.8367 20.9264 25.4326 20.7819 24.9378 20.7813C24.5585 20.7813 24.2164 20.8927 23.9116 21.1157C23.6068 21.3387 23.3881 21.6396 23.2555 22.0182L24.0472 22.3646C24.0967 22.1667 24.1999 21.9935 24.3569 21.8451C24.514 21.6966 24.7076 21.6224 24.9378 21.6224C25.1852 21.6224 25.3792 21.6844 25.5197 21.8084C25.6602 21.9325 25.7302 22.1178 25.7295 22.3646C25.7295 22.546 25.68 22.6987 25.5811 22.8228C25.4821 22.9468 25.3666 23.0744 25.2347 23.2057C25.1357 23.3047 25.0328 23.4036 24.926 23.5026C24.8191 23.6016 24.7241 23.717 24.641 23.849C24.5915 23.9479 24.5545 24.0469 24.5301 24.1458C24.5057 24.2448 24.4932 24.3602 24.4925 24.4922V24.8385Z"
                      fill="#067EA0"
                    />
                  </svg>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none bg-[#F6F7F9]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-semibold text-slate-900">
                      {
                        students.filter(
                          (s) => s.assessmentStatus === "completed"
                        ).length
                      }
                    </div>
                    <p className="text-xs text-slate-500">Completed</p>
                  </div>
                  <svg
                    width="38"
                    height="38"
                    viewBox="0 0 38 38"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="19"
                      cy="19"
                      r="19"
                      fill="#AD0513"
                      fill-opacity="0.1"
                    />
                    <g clip-path="url(#clip0_2659_496)">
                      <path
                        d="M26.9165 13.8542H11.0832V11.875H26.9165M26.9165 23.75H11.0832V17.8125H26.9165M26.9165 9.89584H11.0832C9.98473 9.89584 9.104 10.7766 9.104 11.875V23.75C9.104 24.2749 9.31252 24.7783 9.68369 25.1495C10.0549 25.5207 10.5583 25.7292 11.0832 25.7292H26.9165C27.4414 25.7292 27.9448 25.5207 28.316 25.1495C28.6872 24.7783 28.8957 24.2749 28.8957 23.75V11.875C28.8957 11.3501 28.6872 10.8467 28.316 10.4755C27.9448 10.1044 27.4414 9.89584 26.9165 9.89584ZM14.0519 27.7083H16.0311V29.6875H14.0519V27.7083ZM18.0103 27.7083H19.9894V29.6875H18.0103V27.7083ZM21.9686 27.7083H23.9478V29.6875H21.9686V27.7083Z"
                        fill="#AD0513"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_2659_496">
                        <rect
                          width="23.75"
                          height="23.75"
                          fill="white"
                          transform="translate(7.125 5.9375)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>
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
                  Students ({students.length})
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
                            selectedStudents.size === students.length &&
                            students.length > 0
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
                          selectedStudents.has(student.id) ? "bg-blue-50" : ""
                        }
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.has(student.id)}
                            onCheckedChange={() =>
                              handleToggleStudent(student.id)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.applicationId}
                        </TableCell>
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
    </AdminLayout>
  );
}
