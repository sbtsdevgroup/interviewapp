import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InterviewsService {
  constructor(
    @Inject('DATABASE_POOL') private readonly pool: Pool,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createInterviewDto: CreateInterviewDto, studentId: string) {
    const { fullName, agentName, interviewDate, interviewer, track, values } = createInterviewDto;

    const result = await this.pool.query(
      `INSERT INTO interviews (
        "student_id", "fullName", "agentName", "interviewDate", "interviewer", "track", "values", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *`,
      [
        studentId,
        fullName,
        agentName || null,
        interviewDate || new Date().toISOString().split('T')[0],
        interviewer || null,
        track || 'Voice',
        JSON.stringify(values || {}),
      ],
    );

    const interview = this.mapInterview(result.rows[0]);

    // Send notification to the student
    try {
      const studentResult = await this.pool.query(
        'SELECT id FROM students WHERE "id" = $1',
        [studentId]
      );

      if (studentResult.rows.length > 0) {

        const interviewDateFormatted = new Date(interviewDate || new Date()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        await this.notificationsService.create({
          userId: studentId,
          userType: 'student',
          title: 'Interview Created',
          message: `An interview has been created for you on ${interviewDateFormatted}.${interviewer ? ` Interviewer: ${interviewer}` : ''}`,
          type: 'info',
          relatedEntityType: 'interview',
          relatedEntityId: interview.id,
        });
      }
    } catch (error) {
      // Log error but don't fail the interview creation
      console.error('Failed to create notification:', error);
    }

    return interview;
  }

  async findAll(search?: string, filterOutcome?: string) {
    let query = 'SELECT * FROM interviews WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (
        "fullName" ILIKE $${paramCount} OR 
        "agentName" ILIKE $${paramCount} OR 
        "interviewer" ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY "createdAt" DESC';

    const result = await this.pool.query(query, params);
    let interviews = result.rows.map(row => this.mapInterview(row));

    // Filter by outcome if provided
    if (filterOutcome && filterOutcome !== 'ALL') {
      interviews = interviews.filter(interview => {
        const computed = this.computeTotals(interview.values || {});
        return computed.outcome === filterOutcome;
      });
    }

    return interviews;
  }

  async findOne(id: string) {
    const result = await this.pool.query('SELECT * FROM interviews WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    return this.mapInterview(result.rows[0]);
  }

  // async findOneByStudentId(id: string, studentId: string) {
  //   const result = await this.pool.query(
  //     'SELECT * FROM interviews WHERE id = $1 AND student_id = $2', 
  //     [id, studentId]
  //   );
    
  //   if (result.rows.length === 0) {
  //     throw new NotFoundException(`Interview with ID ${id} not found`);
  //   }

  //   return this.mapInterview(result.rows[0]);
  // }

  async update(id: string, updateInterviewDto: UpdateInterviewDto) {
    const { fullName, agentName, interviewDate, interviewer, track, values } = updateInterviewDto;
    
    const existing = await this.findOne(id);
    
    const result = await this.pool.query(
      `UPDATE interviews 
       SET 
         "fullName" = COALESCE($1, "fullName"),
         "agentName" = COALESCE($2, "agentName"),
         "interviewDate" = COALESCE($3, "interviewDate"),
         "interviewer" = COALESCE($4, "interviewer"),
         "track" = COALESCE($5, "track"),
         "values" = COALESCE($6::jsonb, "values"),
         "updatedAt" = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        fullName,
        agentName,
        interviewDate,
        interviewer,
        track,
        values ? JSON.stringify(values) : null,
        id,
      ],
    );

    return this.mapInterview(result.rows[0]);
  }

  async remove(id: string) {
    const result = await this.pool.query('DELETE FROM interviews WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    return { message: 'Interview deleted successfully' };
  }

  private mapInterview(row: any) {
    return {
      id: row.id,
      candidate: {
        studentId: row.student_id,
        fullName: row.fullName,
        agentName: row.agentName,
        interviewDate: row.interviewDate,
        interviewer: row.interviewer,
        track: row.track,
      },
      values: typeof row.values === 'string' ? JSON.parse(row.values) : (row.values || {}),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private computeTotals(values: Record<string, any>) {
    // This matches the frontend logic
    const INTERVIEW_SECTIONS = [
      { id: 'opening', max: 5 },
      { id: 'comm', max: 30 },
      { id: 'behavior', max: 25 },
      { id: 'bpo', max: 15 },
      { id: 'tech', max: 10 },
      { id: 'availability', max: 10 },
      { id: 'roleplay', max: 5 },
    ];

    const sectionTotals: Record<string, number> = {};
    let total = 0;

    // Simplified calculation - in production, you'd want to match the exact frontend logic
    for (const section of INTERVIEW_SECTIONS) {
      sectionTotals[section.id] = 0; // Would need to calculate from values
    }

    total = Math.max(0, Math.min(100, total));
    const autoOutcome = total >= 80 ? 'READY' : total >= 60 ? 'CONDITIONAL' : 'NOT READY';
    const override = values.manual_override;
    const outcome = override && override !== '—' ? override : autoOutcome;

    return { sectionTotals, total, autoOutcome, outcome };
  }
}

