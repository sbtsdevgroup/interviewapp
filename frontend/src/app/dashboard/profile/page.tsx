'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent } from '@/lib/hooks/use-student';
import { useAuthStore } from '@/lib/store/auth-store';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  User,
  Mail,
  Phone,
  Calendar,
  Compass,
  Globe,
  MapPin,
  IdCard,
  Award,
  School,
  FileCheck
} from 'lucide-react';

interface StudentData {
  id: string;
  applicationId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  stateOfOrigin: string;
  currentResidence: string;
  registrationNumber?: string;
  education: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: string;
  nyscStatus: string;
  nyscNumber?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { token, isAuthenticated, _hasHydrated } = useAuthStore();
  const { studentData, interviewStatus, isLoading } = useStudent();

  const student = studentData as StudentData | null;
  const interview = interviewStatus as any | null;

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || !token) {
      router.push('/login');
    }
  }, [isAuthenticated, token, _hasHydrated, router]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-600 font-medium animate-pulse">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <Card className="border border-slate-200 shadow-sm rounded-2xl max-w-2xl mx-auto my-8">
          <CardContent className="pt-8 pb-6 px-6 text-center">
            <p className="text-slate-600 font-medium">No profile data available.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Profile Details</h1>
            <p className="text-sm text-slate-500 mt-1">View and verify your registered personal and academic records</p>
          </div>
          {interview?.chosenTrack && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50 w-fit shrink-0">
              Program Track: {interview.chosenTrack}
            </span>
          )}
        </div>

        {/* Personal Information Panel */}
        <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-indigo-500" />
              Personal Information
            </CardTitle>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contact & Bio</span>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">Full Name</div>
                  <div className="font-bold text-slate-800 mt-0.5">{student.fullName || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-400 font-semibold">Email Address</div>
                  <div className="font-bold text-slate-800 mt-0.5 break-all select-all">{student.email || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">Phone Number</div>
                  <div className="font-bold text-slate-800 mt-0.5 select-all">{student.phone || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">Date of Birth</div>
                  <div className="font-bold text-slate-800 mt-0.5">{formatDate(student.dateOfBirth)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">Gender</div>
                  <div className="font-bold text-slate-800 mt-0.5 capitalize">{student.gender || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">State of Origin</div>
                  <div className="font-bold text-slate-800 mt-0.5">{student.stateOfOrigin || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 md:col-span-2 border-t border-slate-50 pt-4">
                <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">Current Residence Location</div>
                  <div className="font-bold text-slate-800 mt-0.5 leading-relaxed">{student.currentResidence || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 md:col-span-2 border-t border-slate-50 pt-4">
                <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                  <IdCard className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">Verification Number</div>
                  <div className="font-bold text-indigo-600 mt-0.5 font-mono select-all">
                    {student.registrationNumber || 'Not Provided'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Educational Background Panel */}
        <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-slate-800 text-sm font-bold flex items-center gap-2">
              <GraduationCap className="h-4.5 w-4.5 text-indigo-500" />
              Education Background
            </CardTitle>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic Record</span>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">Educational Level</div>
                  <div className="font-bold text-slate-800 mt-0.5 capitalize">{student.education || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                  <School className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">Institution</div>
                  <div className="font-bold text-slate-800 mt-0.5">{student.institution || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">Graduation Year</div>
                  <div className="font-bold text-slate-800 mt-0.5">{student.graduationYear || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">Field of Study</div>
                  <div className="font-bold text-slate-800 mt-0.5 capitalize">{student.fieldOfStudy || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 md:col-span-2 border-t border-slate-50 pt-4">
                <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">NYSC Status</div>
                  <div className="font-bold text-slate-800 mt-0.5 capitalize">{student.nyscStatus || '—'}</div>
                </div>
              </div>

              {student.nyscNumber && (
                <div className="flex items-start gap-3 md:col-span-2 border-t border-slate-50 pt-4">
                  <div className="mt-0.5 p-1.5 bg-slate-100 text-slate-500 rounded-lg">
                    <IdCard className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">NYSC Certificate Number</div>
                    <div className="font-bold text-slate-800 mt-0.5 select-all">{student.nyscNumber}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
