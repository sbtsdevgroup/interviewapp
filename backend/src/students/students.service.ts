import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { Pool } from 'pg';
import { NotificationsService } from '../notifications/notifications.service';
import { WinstonLoggerService } from '../common/logger/logger.service';

@Injectable()
export class StudentsService {
  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async findById(id: string) {
    const startTime = Date.now();
    try {
      const result = await this.pool.query('SELECT * FROM students WHERE id = $1', [id]);
      const duration = Date.now() - startTime;

      if (result.rows.length === 0) {
        this.logger.logDatabase('SELECT', 'students', duration, false, 'Student not found');
        throw new NotFoundException('Student not found');
      }

      this.logger.logDatabase('SELECT', 'students', duration, true);

      const student = result.rows[0];
      const { password, resetToken, resetTokenExpiry, ...studentData } = student;

      return studentData;
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(`Error finding student by ID: ${id}`, error.stack, 'StudentsService');
      }
      throw error;
    }
  }
  async getInterviewStatus(id: string) {
    const startTime = Date.now();
    try {
      // First check which columns exist
      const columnCheck = await this.pool.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'students' 
         AND column_name IN ('quizScore', 'quizStatus', 'interviewLink', 'interviewInstructions')`
      );
      const existingColumns = columnCheck.rows.map((r: any) => r.column_name);
      const hasQuizScore = existingColumns.includes('quizScore');
      const hasQuizStatus = existingColumns.includes('quizStatus');
      const hasInterviewLink = existingColumns.includes('interviewLink');
      const hasInterviewInstructions = existingColumns.includes('interviewInstructions');

      // Build query dynamically based on existing columns
      let selectFields = [
        '"applicationId"',
        '"fullName"',
        '"email"',
        '"status"',
        '"assessmentStatus"',
        '"assessmentScore"',
      ];

      // Add quiz columns if they exist, otherwise use assessment columns as aliases
      if (hasQuizScore) {
        selectFields.push('COALESCE("quizScore", "assessmentScore") as "quizScore"');
      } else {
        selectFields.push('"assessmentScore" as "quizScore"');
      }

      if (hasQuizStatus) {
        selectFields.push('COALESCE("quizStatus", "assessmentStatus") as "quizStatus"');
      } else {
        selectFields.push('"assessmentStatus" as "quizStatus"');
      }

      selectFields.push(
        '"interviewDate"',
        '"interviewScore"',
        '"interviewCompleted"',
        '"interviewNotes"',
      );

      if (hasInterviewLink) {
        selectFields.push('"interviewLink"');
      }

      if (hasInterviewInstructions) {
        selectFields.push('"interviewInstructions"');
      }

      selectFields.push(
        '"paymentCompleted"',
        '"paymentVerified"',
        '"selectedProgram"',
        '"chosenTrack"',
        '"top3Tracks"',
        '"createdAt"',
        '"updatedAt"',
      );

      const query = `SELECT ${selectFields.join(', ')} FROM students WHERE id = $1`;
      const result = await this.pool.query(query, [id]);
      const duration = Date.now() - startTime;

      if (result.rows.length === 0) {
        this.logger.logDatabase('SELECT', 'students', duration, false, 'Student not found');
        throw new NotFoundException('Student not found');
      }

      this.logger.logDatabase('SELECT', 'students', duration, true);

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
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Error getting interview status for student ${id}`,
          error.stack,
          'StudentsService',
        );
      }
      throw error;
    }
  }

  async findAll(search?: string, status?: string) {
    const startTime = Date.now();
    try {
      // First check which columns exist
      const columnCheck = await this.pool.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'students' 
         AND column_name IN ('quizScore', 'quizStatus', 'interviewLink', 'interviewInstructions')`
      );
      const existingColumns = columnCheck.rows.map((r: any) => r.column_name);
      const hasQuizScore = existingColumns.includes('quizScore');
      const hasQuizStatus = existingColumns.includes('quizStatus');
      const hasInterviewLink = existingColumns.includes('interviewLink');
      const hasInterviewInstructions = existingColumns.includes('interviewInstructions');

      // Build select fields dynamically
      let selectFields = [
        'id',
        '"applicationId"',
        '"fullName"',
        'email',
        'phone',
        '"status"',
        '"assessmentStatus"',
        '"assessmentScore"',
      ];

      // Add quiz columns if they exist, otherwise use assessment columns as aliases
      if (hasQuizScore) {
        selectFields.push('COALESCE("quizScore", "assessmentScore") as "quizScore"');
      } else {
        selectFields.push('"assessmentScore" as "quizScore"');
      }

      if (hasQuizStatus) {
        selectFields.push('COALESCE("quizStatus", "assessmentStatus") as "quizStatus"');
      } else {
        selectFields.push('"assessmentStatus" as "quizStatus"');
      }

      selectFields.push('"interviewDate"', '"interviewCompleted"');

      if (hasInterviewLink) {
        selectFields.push('"interviewLink"');
      }

      if (hasInterviewInstructions) {
        selectFields.push('"interviewInstructions"');
      }

      selectFields.push('"paymentCompleted"', '"paymentVerified"', '"createdAt"', '"updatedAt"');

      let query = `SELECT ${selectFields.join(', ')} FROM students`;
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

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY "createdAt" DESC';

      const result = await this.pool.query(query, params);
      const duration = Date.now() - startTime;

      this.logger.logDatabase('SELECT', 'students', duration, true);

      return result.rows;
    } catch (error) {
      this.logger.error('Error finding students', error.stack, 'StudentsService');
      throw error;
    }
  }

  async updateInterviewDetails(id: string, interviewDate: string, interviewLink?: string, interviewInstructions?: string) {
    const startTime = Date.now();
    try {
      // Check which columns exist
      const columnCheck = await this.pool.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'students' 
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

      const updateQuery = `UPDATE students 
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex}`;

      // Build RETURNING clause
      const returnFields = ['id', '"applicationId"', '"fullName"', 'email', '"interviewDate"'];
      if (hasInterviewLink) returnFields.push('"interviewLink"');
      if (hasInterviewInstructions) returnFields.push('"interviewInstructions"');

      const query = `${updateQuery} RETURNING ${returnFields.join(', ')}`;
      const result = await this.pool.query(query, params);
      const duration = Date.now() - startTime;

      if (result.rows.length === 0) {
        this.logger.logDatabase('UPDATE', 'students', duration, false, 'Student not found');
        throw new NotFoundException('Student not found');
      }

      this.logger.logDatabase('UPDATE', 'students', duration, true);

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
          userId: id,
          userType: 'student',
          title: 'Interview Scheduled',
          message: `Your interview has been scheduled for ${interviewDateFormatted}.${interviewInstructions ? ` Instructions: ${interviewInstructions}` : ''}`,
          type: 'info',
          relatedEntityType: 'interview',
          relatedEntityId: id,
        });
      } catch (error) {
        // Log error but don't fail the interview scheduling
        this.logger.error(
          `Failed to create interview notification for student ${id}`,
          error.stack,
          'StudentsService',
        );
      }

      return updatedStudent;
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Error updating interview details for student ${id}`,
          error.stack,
          'StudentsService',
        );
      }
      throw error;
    }
  }

  async getInterviewDetails(id: string) {
    const startTime = Date.now();
    try {
      const result = await this.pool.query(
        `SELECT * FROM interviews WHERE student_id = $1`,
        [id],
      );
      const duration = Date.now() - startTime;

      if (result.rows.length === 0) {
        this.logger.logDatabase('SELECT', 'interviews', duration, false, 'Interview not found');
        throw new NotFoundException('Interview not found');
      }

      this.logger.logDatabase('SELECT', 'interviews', duration, true);

      return result.rows[0];
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        this.logger.error(
          `Error getting interview details for student ${id}`,
          error.stack,
          'StudentsService',
        );
      }
      throw error;
    }
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

