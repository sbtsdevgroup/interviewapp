import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class StudentsService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

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
    const result = await this.pool.query(
      `SELECT 
        "applicationId",
        "fullName",
        "email",
        "status",
        "assessmentStatus",
        "assessmentScore",
        "interviewDate",
        "interviewScore",
        "interviewCompleted",
        "interviewNotes",
        "interviewLink",
        "paymentCompleted",
        "paymentVerified",
        "selectedProgram",
        "chosenTrack",
        "top3Tracks",
        "createdAt",
        "updatedAt"
      FROM students 
      WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Student not found');
    }

    const student = result.rows[0];

    const progress = {
      application: student.status || 'pending',
      payment: student.paymentCompleted && student.paymentVerified ? 'completed' : 'pending',
      assessment: student.assessmentStatus || 'pending',
      interview: student.interviewCompleted
        ? 'completed'
        : student.interviewDate
        ? 'scheduled'
        : 'pending',
      overall: this.calculateOverallProgress(student),
    };

    return {
      ...student,
      progress,
    };
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

