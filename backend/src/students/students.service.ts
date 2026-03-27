import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { SourceApiService } from '../source-api/source-api.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AiInterviewService } from '../ai/ai-interview.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { calculatePaginationMeta, getPaginationOptions } from '../common/utils/pagination.util';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { StudentStatus } from './enums/student-status.enum';

@Injectable()
export class StudentsService {
  constructor(
    private readonly sourceApiService: SourceApiService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private readonly aiInterviewService: AiInterviewService,
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
      assessmentStatus: app.tests?.[app.tests.length - 1]?.isCompleted ? 'completed' : 'pending',
      assessmentScore: app.tests?.[app.tests.length - 1]?.totalMarks || 0,
      quizScore: app.quizScore || app.tests?.[app.tests.length - 1]?.totalMarks || 0,
      quizStatus: app.quizStatus || (app.tests?.[app.tests.length - 1]?.isCompleted ? 'completed' : 'pending'),
      
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
      chosenTrack: null,
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

  async findAll(paginationDto: PaginationDto, search?: string, status?: StudentStatus): Promise<PaginatedResponse<any>> {
    const { page, limit } = paginationDto;
    
    const options: any = {
      page,
      limit,
      search,
    };

    if (status && status !== 'ALL') {
      options.status = status;
    }

    const result = await this.sourceApiService.findAllApplications(options);
    
    if (result.status !== 'success') {
      return {
        data: [],
        meta: calculatePaginationMeta(0, page, limit),
      };
    }

    // Source repo returns paginated structure: { data, total, page, limit, totalPages }
    const sourceData = result.data;

    const students = await Promise.all(sourceData.data.map(async (app: any) => {
      // Use applicationId (e.g. APP-2025-67987) to link with local AI interviews
      const studentId = app.applicationId;
      
      let localAiInterview: any = null;
      let localAiResponses: any[] = [];
      try {
        localAiInterview = await this.aiInterviewService.getInterviewForStudent(studentId);
        localAiResponses = await this.aiInterviewService.getInterviewResults(localAiInterview.id);
      } catch (err) {
        // Not found is fine
      }

      const interviewScore = localAiResponses.length > 0
        ? Math.round(localAiResponses.reduce((acc, r) => acc + (r.ai_score || 0), 0) / localAiResponses.length)
        : 0;

      return {
        id: app.id,
        applicationId: app.applicationId,
        fullName: app.User?.fullName,
        email: app.User?.email,
        phone: app.User?.phone,
        status: app.status,
        assessmentStatus: app.quizStatus || 'pending',
        assessmentScore: app.quizScore || 0,
        
        // Local AI data
        interviewDate: localAiInterview?.schedule_date || null,
        interviewCompleted: localAiInterview?.status === 'COMPLETED',
        interviewScore,
        
        paymentCompleted: app.paymentCompleted,
        chosenTrack: app.programName || (app.selectedProgram ? `Program ${app.selectedProgram}` : null),
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      };
    }));

    return {
      data: students,
      meta: calculatePaginationMeta(sourceData.total, page, limit),
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

    // Automatically schedule AI interview session using applicationId
    try {
      const aiStudentId = updatedStudent.applicationId || id;
      await this.aiInterviewService.scheduleInterview(
        aiStudentId, 
        interviewDate, 
        interviewInstructions || 'Welcome to your AI-powered interview assessment.'
      );
    } catch (error) {
      console.error('Failed to schedule AI interview session:', error);
      // We don't throw here to avoid failing the main interview update
    }

    return updatedStudent;
  }

  async findAllRawApplications(paginationDto: PaginationDto, search?: string, status?: StudentStatus): Promise<PaginatedResponse<any>> {
    const { page, limit } = paginationDto;
    const options = { page, limit, search, status: status === StudentStatus.ALL ? undefined : status };
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
    const result = await this.sourceApiService.getDashboardStats();
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
    return result.data;
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
    return result.data;
  }
}

