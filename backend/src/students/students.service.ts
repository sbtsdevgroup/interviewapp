import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { Database } from 'better-sqlite3';
import { SourceApiService } from '../source-api/source-api.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AiInterviewService } from '../ai/ai-interview.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { calculatePaginationMeta } from '../common/utils/pagination.util';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { StudentStatus } from './enums/student-status.enum';

export const PROGRAM_NAME_MAP: Record<number, string> = {
  1: 'Cybersecurity Fundamentals (CS Series)',
  2: 'Advanced Cybersecurity (AC Series)',
  3: 'Regulatory Technology (RT Series)',
  4: 'Business Process & Operations (BP Series)',
  5: 'Project & Program Management (PM Series)',
  6: 'Technical Infrastructure (TI Series)',
  7: 'Training & Capacity Building (TC Series)',
  8: 'Emerging Technologies (ET Series)',
  9: 'Professional Certification Prep (PC Series)',
  10: 'Software Development (SD Series)',
  11: 'Cybersecurity',
  12: 'Business Process & Operations (BPO)',
  13: 'Project & Program Management',
  14: 'Software Development',
};

export function resolveProgramName(programNameOrId: string | number): string {
  if (!programNameOrId) return 'Unassigned';
  
  if (typeof programNameOrId === 'number') {
    return PROGRAM_NAME_MAP[programNameOrId] || `Program ${programNameOrId}`;
  }
  
  const num = parseInt(programNameOrId, 10);
  if (!isNaN(num) && String(num) === String(programNameOrId).trim()) {
    return PROGRAM_NAME_MAP[num] || `Program ${num}`;
  }
  
  const match = String(programNameOrId).match(/^Program\s+(\d+)$/i);
  if (match) {
    const id = parseInt(match[1], 10);
    return PROGRAM_NAME_MAP[id] || String(programNameOrId);
  }
  
  const nameLower = String(programNameOrId).trim().toLowerCase();
  if (nameLower === 'cybersecurity' || nameLower === 'cyber security') {
    return 'Cybersecurity Fundamentals (CS Series)';
  }
  if (nameLower === 'software development') {
    return 'Software Development (SD Series)';
  }
  if (nameLower === 'business process operations (bpo)' || nameLower === 'business process & operations' || nameLower === 'business process operations') {
    return 'Business Process & Operations (BP Series)';
  }
  if (nameLower === 'project management' || nameLower === 'project & program management') {
    return 'Project & Program Management (PM Series)';
  }
  
  return String(programNameOrId).trim();
}

@Injectable()
export class StudentsService {
  constructor(
    private readonly sourceApiService: SourceApiService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private readonly aiInterviewService: AiInterviewService,
    @Inject('AI_DATABASE') private readonly db: Database,
  ) {}

  async findById(id: string) {
    // Note: 'id' here is usually the application UUID or applicationId string
    const result = await this.sourceApiService.getStudentMetadata(id);
    if (result.status !== 'success' || !result.data) {
      throw new NotFoundException('Student not found');
    }

    const app = result.data;
    const { User, ...appData } = app;

    return {
      ...appData,
      fullName: User?.fullName,
      email: User?.email,
      phone: User?.phone,
      dateOfBirth: User?.dateOfBirth,
      gender: User?.gender,
      stateOfOrigin: User?.stateOfOrigin,
      currentResidence: User?.currentResidence,
    };
  }

  async getInterviewStatus(id: string) {
    const result = await this.sourceApiService.getStudentMetadata(id);
    if (result.status !== 'success' || !result.data) {
      throw new NotFoundException('Student not found');
    }

    const app = result.data;
    const user = app.User;
    const applicationId = app.applicationId;
    
    // Fetch local AI interview data using applicationId
    let localAiInterview: any = null;
    let localAiResponses: any[] = [];
    try {
      localAiInterview = await this.aiInterviewService.getInterviewForStudent(applicationId);
      if (localAiInterview) {
        localAiResponses = await this.aiInterviewService.getInterviewResults(localAiInterview.id);
      }
    } catch (err) {
      // Not found is fine, we just won't have local interview data
      console.log(`No local AI interview found for student ${id}`);
    }

    // Calculate local AI score if responses exist
    const interviewScore = localAiResponses.length > 0
      ? Math.round(localAiResponses.reduce((acc, r) => acc + (r.ai_score || 0), 0) / localAiResponses.length)
      : null;

    const mappedData = {
      applicationId: app.applicationId,
      fullName: user?.fullName,
      email: user?.email,
      status: app.status,
      assessmentStatus: app.assessment?.status?.toLowerCase() === 'completed' ? 'completed' : 'pending',
      assessmentScore: app.assessment?.score || app.assessment?.categories?.overall?.score || 0,
      quizScore: app.assessment?.score || app.assessment?.categories?.overall?.score || 0,
      quizStatus: app.assessment?.status?.toLowerCase() === 'completed' ? 'completed' : 'pending',
      
      // Use local AI interview data ONLY, no fallback to sourceApiService
      interviewDate: localAiInterview?.schedule_date || null,
      interviewScore: interviewScore,
      interviewCompleted: localAiInterview?.status === 'COMPLETED',
      interviewNotes: localAiInterview?.status === 'COMPLETED' ? 'AI Assessment completed' : null,
      interviewLink: localAiInterview ? `/dashboard/interview` : null,
      interviewInstructions: localAiInterview?.instructions || null,
      
      paymentCompleted: app.paymentCompleted,
      paymentVerified: app.paymentCompleted,
      selectedProgram: app.selectedProgram,
      chosenTrack: resolveProgramName(app.programName || app.selectedProgram),
      top3Tracks: [],
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };

    const progress = {
      application: mappedData.status || 'pending',
      payment: mappedData.paymentCompleted ? 'completed' : 'pending',
      assessment: mappedData.quizStatus || 'pending',
      interview: mappedData.interviewCompleted
        ? 'completed'
        : mappedData.interviewDate
        ? 'scheduled'
        : 'pending',
      overall: this.calculateOverallProgress(mappedData),
    };

    return {
      ...mappedData,
      progress,
    };
  }

  async findAll(
    paginationDto: PaginationDto,
    search?: string,
    status?: string,
    paymentStatus?: string,
    assessmentStatus?: string,
    track?: string,
  ): Promise<PaginatedResponse<any>> {
    const { page, limit } = paginationDto;

    const result = await this.sourceApiService.findAllApplications({
      status: 'ENROLLED',
      limit: 2000,
    });

    if (result.status !== 'success') {
      return {
        data: [],
        meta: calculatePaginationMeta(0, page, limit),
      };
    }

    const sourceData = result.data.data || [];

    // Fetch local AI interviews and responses to optimize database query performance
    const localInterviews = this.db.prepare('SELECT * FROM ai_interviews').all() as any[];
    const localResponses = this.db.prepare('SELECT * FROM ai_responses').all() as any[];

    const interviewMap = new Map(localInterviews.map(i => [i.student_id, i]));
    const responsesMap = new Map<string, any[]>();
    for (const r of localResponses) {
      if (!responsesMap.has(r.interview_id)) {
        responsesMap.set(r.interview_id, []);
      }
      responsesMap.get(r.interview_id).push(r);
    }

    let students = sourceData.map((app: any) => {
      const studentId = app.applicationId;
      const localAiInterview = interviewMap.get(studentId);
      const localAiResponses = localAiInterview ? (responsesMap.get(localAiInterview.id) || []) : [];

      const interviewScore = localAiResponses.length > 0
        ? Math.round(localAiResponses.reduce((acc, r) => acc + (r.ai_score || 0), 0) / localAiResponses.length)
        : 0;

      return {
        id: app.id,
        applicationId: app.applicationId,
        fullName: app.User?.fullName || app.studentName || '',
        email: app.User?.email || app.studentEmail || '',
        phone: app.User?.phone || app.studentPhone || '',
        status: app.status,
        assessmentStatus: app.assessment?.status?.toLowerCase() === 'completed' ? 'completed' : 'pending',
        assessmentScore: app.assessment?.score || app.assessment?.categories?.overall?.score || 0,
        
        // Local AI data
        interviewDate: localAiInterview?.schedule_date || null,
        interviewCompleted: localAiInterview?.status === 'COMPLETED',
        interviewStatus: localAiInterview?.status || 'PENDING',
        interviewScore,
        
        paymentCompleted: app.paymentCompleted,
        paymentVerified: app.paymentCompleted,
        chosenTrack: resolveProgramName(app.programName || app.selectedProgram),
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      };
    });

    // In-memory filters
    if (search) {
      const lowerSearch = search.toLowerCase();
      students = students.filter(s =>
        s.fullName.toLowerCase().includes(lowerSearch) ||
        s.email.toLowerCase().includes(lowerSearch) ||
        s.applicationId.toLowerCase().includes(lowerSearch)
      );
    }

    if (status && status !== 'ALL') {
      const lowerStatus = status.toLowerCase();
      if (lowerStatus === 'completed') {
        students = students.filter(s => s.interviewCompleted);
      } else if (lowerStatus === 'scheduled') {
        students = students.filter(s => s.interviewDate && !s.interviewCompleted);
      } else if (lowerStatus === 'pending') {
        students = students.filter(s => !s.interviewDate && !s.interviewCompleted);
      }
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      const lowerPayment = paymentStatus.toLowerCase();
      if (lowerPayment === 'paid') {
        students = students.filter(s => s.paymentCompleted);
      } else if (lowerPayment === 'pending') {
        students = students.filter(s => !s.paymentCompleted);
      }
    }

    if (assessmentStatus && assessmentStatus !== 'ALL') {
      const lowerAssessment = assessmentStatus.toLowerCase();
      if (lowerAssessment === 'completed') {
        students = students.filter(s => s.assessmentStatus === 'completed');
      } else if (lowerAssessment === 'pending') {
        students = students.filter(s => s.assessmentStatus === 'pending');
      }
    }

    if (track && track !== 'ALL') {
      const lowerTrack = track.toLowerCase();
      students = students.filter(s =>
        s.chosenTrack && s.chosenTrack.toLowerCase().includes(lowerTrack)
      );
    }

    // Pagination
    const total = students.length;
    const paginatedData = students.slice((page - 1) * limit, page * limit);

    return {
      data: paginatedData,
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  async updateInterviewDetails(id: string, interviewDate: string, interviewLink?: string, interviewInstructions?: string) {
    const updateData: any = {
      interviewDate,
    };
    if (interviewLink) updateData.interviewLink = interviewLink;
    if (interviewInstructions) updateData.interviewInstructions = interviewInstructions;

    let updatedStudent: any = { id };
    try {
      const result = await this.sourceApiService.updateApplication(id, updateData);
      if (result.status === 'success') {
        updatedStudent = result.data;
      } else {
        console.warn('External API update failed (status not success), continuing with local AI scheduling...');
      }
    } catch (error) {
      console.error('External Source API update failed, continuing with local AI scheduling:', error.message);
      // We continue here so the AI interview can still be scheduled locally
    }

    // Create notification locally or via API? 
    // The plan said NotificationsService also gets refactored to use API.
    try {
      const interviewDateFormatted = new Date(interviewDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      await this.notificationsService.create({
        userId: updatedStudent.UserId,
        userType: 'student',
        title: 'Interview Scheduled',
        message: `Your interview has been scheduled for ${interviewDateFormatted}.${interviewInstructions ? ` Instructions: ${interviewInstructions}` : ''}`,
        type: 'info',
        relatedEntityType: 'interview',
        relatedEntityId: id,
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }

    // Fetch student metadata for local caching
    let studentMeta: any = {};
    try {
      const metadataRes = await this.sourceApiService.getStudentMetadata(id);
      if (metadataRes && metadataRes.status === 'success') {
        const app = metadataRes.data || {};
        const user = app.User;
        studentMeta = {
          fullName: user?.fullName || app.studentName,
          email: user?.email || app.studentEmail,
          phone: user?.phone || app.studentPhone,
          chosenTrack: resolveProgramName(app.programName || app.chosenTrack || app.selectedProgram)
        };
      }
    } catch (error) {
      console.warn('Failed to fetch student metadata for caching:', error.message);
    }

    // Automatically schedule AI interview session using applicationId
    try {
      const aiStudentId = updatedStudent.applicationId || id;
      await this.aiInterviewService.scheduleInterview(
        aiStudentId, 
        interviewDate, 
        interviewInstructions || 'Welcome to your AI-powered interview assessment.',
        {
          name: studentMeta.fullName || updatedStudent.fullName,
          email: studentMeta.email || updatedStudent.email,
          phone: studentMeta.phone || updatedStudent.phone,
          track: studentMeta.chosenTrack || updatedStudent.chosenTrack
        }
      );
    } catch (error) {
      console.error('Failed to schedule AI interview session:', error);
      // We don't throw here to avoid failing the main interview update
    }

    return updatedStudent;
  }

  async findAllRawApplications(paginationDto: PaginationDto, search?: string, status?: string): Promise<PaginatedResponse<any>> {
    const { page, limit } = paginationDto;
    const options = { page, limit, search, status: 'ENROLLED' };
    const result = await this.sourceApiService.findAllApplications(options);
    
    if (result.status !== 'success') {
      return {
        data: [],
        meta: calculatePaginationMeta(0, page, limit),
      };
    }

    return {
      data: result.data.data,
      meta: calculatePaginationMeta(result.data.total, page, limit),
    };
  }

  private calculateOverallProgress(student: any) {
    let completed = 0;
    const total = 4;

    if (student.status && student.status !== 'pending') completed++;
    if (student.paymentCompleted) completed++;
    if (student.assessmentStatus && student.assessmentStatus !== 'pending') completed++;
    if (student.interviewCompleted) completed++;

    return {
      percentage: Math.round((completed / total) * 100),
      completed,
      total,
    };
  }

  async getDashboardStats() {
    const result = await this.sourceApiService.findAllApplications({ status: 'ENROLLED', limit: 2000 });
    if (result.status !== 'success') {
      return {
        totalStudents: 0,
        completedInterviews: 0,
        scheduledInterviews: 0,
        pendingInterviews: 0,
        paidStudents: 0,
        averageScore: 0,
      };
    }

    const enrolledApps = result.data.data || [];
    const totalStudents = enrolledApps.length;

    // Fetch local AI interviews and responses
    const localInterviews = this.db.prepare('SELECT * FROM ai_interviews').all() as any[];
    const localResponses = this.db.prepare('SELECT * FROM ai_responses').all() as any[];

    // Map local interviews by student_id (applicationId)
    const interviewMap = new Map(localInterviews.map(i => [i.student_id, i]));

    let completedInterviews = 0;
    let scheduledInterviews = 0;
    let pendingInterviews = 0;
    let paidStudents = 0;
    let totalScore = 0;
    let scoreCount = 0;

    for (const app of enrolledApps) {
      const localInterview = interviewMap.get(app.applicationId);
      const isCompleted = localInterview?.status === 'COMPLETED';
      const hasScheduleDate = !!localInterview?.schedule_date;

      if (isCompleted) {
        completedInterviews++;
      } else if (hasScheduleDate) {
        scheduledInterviews++;
      } else {
        pendingInterviews++;
      }

      if (app.paymentCompleted) {
        paidStudents++;
      }

      if (isCompleted && localInterview) {
        const studentResponses = localResponses.filter(r => r.interview_id === localInterview.id);
        if (studentResponses.length > 0) {
          const avgScore = studentResponses.reduce((acc, r) => acc + (r.ai_score || 0), 0) / studentResponses.length;
          totalScore += avgScore;
          scoreCount++;
        }
      }
    }

    const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;

    return {
      totalStudents,
      completedInterviews,
      scheduledInterviews,
      pendingInterviews,
      paidStudents,
      averageScore,
    };
  }

  async getAnalytics() {
    const result = await this.sourceApiService.getAnalytics();
    if (result.status !== 'success') {
      return {
        growthByMonth: [],
        programPerformance: [],
        departmentDistribution: [],
        statusDistribution: []
      };
    }

    const analyticsData = result.data || {};

    try {
      // Fetch all enrolled applications
      const appsResult = await this.sourceApiService.findAllApplications({ status: 'ENROLLED', limit: 2000 });
      if (appsResult.status === 'success') {
        const enrolledApps = appsResult.data?.data || [];
        
        // Fetch local AI interviews and responses
        const localInterviews = this.db.prepare('SELECT * FROM ai_interviews').all() as any[];
        const localResponses = this.db.prepare('SELECT * FROM ai_responses').all() as any[];
        
        // Map local interviews by student_id (applicationId)
        const interviewMap = new Map(localInterviews.map(i => [i.student_id, i]));
        
        // Map responses by interview_id
        const responsesMap = new Map<string, any[]>();
        for (const r of localResponses) {
          if (!responsesMap.has(r.interview_id)) {
            responsesMap.set(r.interview_id, []);
          }
          responsesMap.get(r.interview_id).push(r);
        }
        
        // Calculate average score for each student
        const studentScores = new Map<string, number>(); // applicationId -> score
        for (const app of enrolledApps) {
          const localInterview = interviewMap.get(app.applicationId);
          if (localInterview?.status === 'COMPLETED') {
            const studentResponses = responsesMap.get(localInterview.id) || [];
            if (studentResponses.length > 0) {
              const avgScore = studentResponses.reduce((acc, r) => acc + (r.ai_score || 0), 0) / studentResponses.length;
              studentScores.set(app.applicationId, avgScore);
            }
          }
        }
        
        // Calculate track-level statistics
        const trackScores = new Map<string, { totalScore: number; count: number }>();
        for (const app of enrolledApps) {
          const trackName = resolveProgramName(app.programName || app.selectedProgram);
          const score = studentScores.get(app.applicationId);
          if (score !== undefined) {
            if (!trackScores.has(trackName)) {
              trackScores.set(trackName, { totalScore: 0, count: 0 });
            }
            const current = trackScores.get(trackName);
            current.totalScore += score;
            current.count += 1;
          }
        }
        
        // Map track-level statistics back to programPerformance and merge duplicate names
        if (analyticsData.programPerformance) {
          const mergedMap = new Map<string, { name: string; students: number; averageScore: number }>();
          
          for (const p of analyticsData.programPerformance) {
            const mappedName = resolveProgramName(p.name);
            const trackStat = trackScores.get(mappedName);
            const averageScore = trackStat && trackStat.count > 0 ? trackStat.totalScore / trackStat.count : 0;
            
            if (mergedMap.has(mappedName)) {
              const existing = mergedMap.get(mappedName);
              existing.students += p.students || 0;
              existing.averageScore = averageScore > 0 ? Number(averageScore.toFixed(1)) : existing.averageScore;
            } else {
              mergedMap.set(mappedName, {
                name: mappedName,
                students: p.students || 0,
                averageScore: Number(averageScore.toFixed(1)),
              });
            }
          }
          
          analyticsData.programPerformance = Array.from(mergedMap.values());
        }

        // Map and merge departmentDistribution as well
        if (analyticsData.departmentDistribution) {
          const mergedMap = new Map<string, { name: string; value: number }>();
          for (const d of analyticsData.departmentDistribution) {
            const mappedName = resolveProgramName(d.name);
            if (mergedMap.has(mappedName)) {
              mergedMap.get(mappedName).value += d.value || 0;
            } else {
              mergedMap.set(mappedName, {
                name: mappedName,
                value: d.value || 0,
              });
            }
          }
          analyticsData.departmentDistribution = Array.from(mergedMap.values());
        }
      }
    } catch (err) {
      console.error('Failed to merge local interview scores into analytics:', err);
    }

    return analyticsData;
  }

  async unscheduleInterview(id: string): Promise<any> {
    // Fetch student metadata to get the friendly applicationId
    let applicationId = id;
    try {
      const metadataRes = await this.sourceApiService.getStudentMetadata(id);
      if (metadataRes && metadataRes.status === 'success' && metadataRes.data) {
        applicationId = metadataRes.data.applicationId || id;
      }
    } catch (err) {
      console.warn('Failed to fetch student metadata for unscheduling:', err.message);
    }

    // 1. Remove the local AI interview record (clears questions & responses) using applicationId
    try {
      await this.aiInterviewService.unscheduleInterview(applicationId);
    } catch (err) {
      console.error('Failed to remove local AI interview record:', err);
    }

    // 2. Clear the interviewDate on the external Source API
    let updatedStudent: any = { id };
    try {
      const result = await this.sourceApiService.updateApplication(id, {
        interviewDate: null,
        interviewInstructions: null,
        status: 'ENROLLED', // revert back to enrolled / pending
      });
      if (result.status === 'success') {
        updatedStudent = result.data;
      } else {
        console.warn('External API unschedule update returned non-success status');
      }
    } catch (error) {
      console.error('External Source API unschedule failed:', error.message);
    }

    // 3. Notify the student
    try {
      await this.notificationsService.create({
        userId: updatedStudent.UserId ?? id,
        userType: 'student',
        title: 'Interview Unscheduled',
        message: 'Your previously scheduled interview has been cancelled. The admin will contact you with a new date.',
        type: 'warning',
        relatedEntityType: 'interview',
        relatedEntityId: id,
      });
    } catch (error) {
      console.error('Failed to create unschedule notification:', error);
    }

    return { success: true, studentId: id };
  }
}

