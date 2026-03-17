import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { Pool } from 'pg';
import { NotificationsService } from '../notifications/notifications.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { calculatePaginationMeta, getPaginationOptions } from '../common/utils/pagination.util';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class StudentsService {
  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async findById(id: string) {
    const result = await this.pool.query(
      `SELECT a.*, u."fullName", u.email, u.phone, u.password 
       FROM applications a 
       JOIN "user" u ON a."UserId" = u.id 
       WHERE a.id = $1`, 
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Student not found');
    }

    const student = result.rows[0];
    const { password, ...studentData } = student;

    return studentData;
  }

  async getInterviewStatus(id: string) {
    // First check which columns exist
    const columnCheck = await this.pool.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'applications' 
       AND column_name IN ('quizScore', 'quizStatus', 'interviewLink', 'interviewInstructions')`
    );
    const existingColumns = columnCheck.rows.map((r: any) => r.column_name);
    const hasQuizScore = existingColumns.includes('quizScore');
    const hasQuizStatus = existingColumns.includes('quizStatus');
    const hasInterviewLink = existingColumns.includes('interviewLink');
    const hasInterviewInstructions = existingColumns.includes('interviewInstructions');

    // Build query dynamically based on existing columns
    let selectFields = [
      'a."applicationId"',
      'u."fullName"',
      'u.email',
      'a.status',
      'ast.status as "assessmentStatus"',
      'ast.score as "assessmentScore"',
    ];

    // Add quiz columns if they exist, otherwise use assessment columns as aliases
    if (hasQuizScore) {
      selectFields.push('COALESCE("quizScore", ast.score) as "quizScore"');
    } else {
      selectFields.push('ast.score as "quizScore"');
    }

    if (hasQuizStatus) {
      selectFields.push('COALESCE("quizStatus", ast.status) as "quizStatus"');
    } else {
      selectFields.push('ast.status as "quizStatus"');
    }

    selectFields.push(
      'a."interviewDate"',
      'a."interviewScore"',
      '(a.status = \'APPROVED\') as "interviewCompleted"',
      'a."interviewNotes"',
    );

    if (hasInterviewLink) {
      selectFields.push('a."interviewLink"');
    }

    if (hasInterviewInstructions) {
      selectFields.push('a."interviewInstructions"');
    }

    selectFields.push(
      'a."paymentCompleted"',
      'FALSE as "paymentVerified"', // Default as verified is not in base schema
      'a."selectedProgram"',
      'NULL as "chosenTrack"',
      '\'[]\'::jsonb as "top3Tracks"',
      'a."createdAt"',
      'a."updatedAt"',
    );

    const query = `
      SELECT ${selectFields.join(', ')} 
      FROM applications a 
      JOIN "user" u ON a."UserId" = u.id 
      LEFT JOIN assessments ast ON a."applicationId" = ast."applicationId" 
      WHERE a.id = $1`;
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException('Student not found');
    }

    const student = result.rows[0];

    // Prioritize quiz scores over assessment scores
    // If quizScore exists and has a value, use it; otherwise fall back to assessmentScore
    const displayScore = student.quizScore !== null && student.quizScore !== undefined 
      ? student.quizScore 
      : student.assessmentScore;
    const displayStatus = student.quizStatus || student.assessmentStatus || 'pending';

    const progress = {
      application: student.status || 'pending',
      payment: student.paymentCompleted && student.paymentVerified ? 'completed' : 'pending',
      assessment: displayStatus || 'pending',
      interview: student.interviewCompleted
        ? 'completed'
        : student.interviewDate
        ? 'scheduled'
        : 'pending',
      overall: this.calculateOverallProgress(student),
    };

    return {
      ...student,
      quizScore: displayScore,
      quizStatus: displayStatus,
      assessmentScore: displayScore, // For backward compatibility
      assessmentStatus: displayStatus, // For backward compatibility
      progress,
    };
  }

  async findAll(paginationDto: PaginationDto, search?: string, status?: string): Promise<PaginatedResponse<any>> {
    // First check which columns exist
    const columnCheck = await this.pool.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'applications' 
       AND column_name IN ('quizScore', 'quizStatus', 'interviewLink', 'interviewInstructions')`
    );
    const existingColumns = columnCheck.rows.map((r: any) => r.column_name);
    const hasQuizScore = existingColumns.includes('quizScore');
    const hasQuizStatus = existingColumns.includes('quizStatus');
    const hasInterviewLink = existingColumns.includes('interviewLink');
    const hasInterviewInstructions = existingColumns.includes('interviewInstructions');

    // Build select fields dynamically
    let selectFields = [
      'a.id',
      'a."applicationId"',
      'u."fullName"',
      'u.email',
      'u.phone',
      'a."status"',
      'ast.status as "assessmentStatus"',
      'ast.score as "assessmentScore"',
    ];

    // Add quiz columns if they exist, otherwise use assessment columns as aliases
    if (hasQuizScore) {
      selectFields.push('COALESCE("quizScore", ast.score) as "quizScore"');
    } else {
      selectFields.push('ast.score as "quizScore"');
    }

    if (hasQuizStatus) {
      selectFields.push('COALESCE("quizStatus", ast.status) as "quizStatus"');
    } else {
      selectFields.push('ast.status as "quizStatus"');
    }

    selectFields.push('a."interviewDate"', '(a.status = \'APPROVED\') as "interviewCompleted"');

    if (hasInterviewLink) {
      selectFields.push('a."interviewLink"');
    }

    if (hasInterviewInstructions) {
      selectFields.push('a."interviewInstructions"');
    }

    selectFields.push('a."paymentCompleted"', 'FALSE as "paymentVerified"', 'a."createdAt"', 'a."updatedAt"');

    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
      conditions.push(`("fullName" ILIKE $${params.length + 1} OR "applicationId" ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (status && status !== 'ALL') {
      if (status === 'pending') {
        conditions.push('("interviewDate" IS NULL OR "interviewDate" = \'\')');
      } else if (status === 'scheduled') {
        conditions.push('("interviewDate" IS NOT NULL AND "interviewDate" != \'\' AND "interviewCompleted" = false)');
      } else if (status === 'completed') {
        conditions.push('"interviewCompleted" = true');
      }
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) 
      FROM applications a 
      JOIN "user" u ON a."UserId" = u.id 
      LEFT JOIN assessments ast ON a."applicationId" = ast."applicationId"
      ${whereClause}`;
    const countResult = await this.pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated data
    const { page, limit } = paginationDto;
    const { limit: sqlLimit, offset } = getPaginationOptions(page, limit);
    
    let query = `
      SELECT ${selectFields.join(', ')} 
      FROM applications a 
      JOIN "user" u ON a."UserId" = u.id 
      LEFT JOIN assessments ast ON a."applicationId" = ast."applicationId"
      ${whereClause}`;
    query += ' ORDER BY a."createdAt" DESC';
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    
    const finalParams = [...params, sqlLimit, offset];
    const result = await this.pool.query(query, finalParams);

    return {
      data: result.rows,
      meta: calculatePaginationMeta(total, page, limit),
    };
  }

  async updateInterviewDetails(id: string, interviewDate: string, interviewLink?: string, interviewInstructions?: string) {
    // Check which columns exist
    const columnCheck = await this.pool.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'applications' 
       AND column_name IN ('interviewLink', 'interviewInstructions')`
    );
    const existingColumns = columnCheck.rows.map((r: any) => r.column_name);
    const hasInterviewLink = existingColumns.includes('interviewLink');
    const hasInterviewInstructions = existingColumns.includes('interviewInstructions');

    // Auto-generate room ID if not provided (format: interview-{studentId}-{timestamp})
    let roomId = interviewLink;
    if (!roomId && hasInterviewLink) {
      const timestamp = Date.now();
      roomId = `interview-${id}-${timestamp}`;
    }

    // Build update query dynamically
    const updateFields: string[] = ['"interviewDate" = $1', '"updatedAt" = NOW()'];
    const params: any[] = [interviewDate];
    let paramIndex = 2;

    if (hasInterviewLink) {
      updateFields.push(`"interviewLink" = $${paramIndex}`);
      params.push(roomId);
      paramIndex++;
    }

    if (hasInterviewInstructions) {
      updateFields.push(`"interviewInstructions" = $${paramIndex}`);
      params.push(interviewInstructions || null);
      paramIndex++;
    }

    params.push(id); // For WHERE clause

    const updateQuery = `UPDATE applications 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex}`;

    // Build RETURNING clause
    const returningFields: string[] = ['id', '"UserId"', '"applicationId"', '"interviewDate"', 'status'];
    if (hasInterviewLink) returningFields.push('"interviewLink"');
    if (hasInterviewInstructions) returningFields.push('"interviewInstructions"');
    
    const query = `${updateQuery} RETURNING ${returningFields.join(', ')}`;
    const result = await this.pool.query(query, params);

    if (result.rows.length === 0) {
      throw new NotFoundException('Student not found');
    }

    const updatedStudent = result.rows[0];

    // Create notification for the student
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
      // Log error but don't fail the interview scheduling
      console.error('Failed to create notification:', error);
    }

    return updatedStudent;
  }

  private calculateOverallProgress(student: any) {
    let completed = 0;
    const total = 4;

    if (student.status && student.status !== 'pending') completed++;
    if (student.paymentCompleted && student.paymentVerified) completed++;
    if (student.assessmentStatus && student.assessmentStatus !== 'pending') completed++;
    if (student.interviewCompleted) completed++;

    return {
      percentage: Math.round((completed / total) * 100),
      completed,
      total,
    };
  }
}

