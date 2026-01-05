import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { Pool } from 'pg';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class StudentsService {
  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async findById(id: string) {
    const result = await this.pool.query('SELECT * FROM students WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException('Student not found');
    }

    const student = result.rows[0];
    const { password, resetToken, resetTokenExpiry, ...studentData } = student;

    return studentData;
  }

  async getInterviewStatus(id: string) {
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

  async findAll(search?: string, status?: string) {
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
    return result.rows;
  }

  async updateInterviewDetails(id: string, interviewDate: string, interviewLink?: string, interviewInstructions?: string) {
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

