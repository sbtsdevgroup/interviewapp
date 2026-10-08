import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Database } from 'better-sqlite3';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';
import { scoreInterview, scoreKind, ScoreBreakdown } from './interview-score';
import { parseQuestionOptions } from './objective-scoring';
import { gradeWithoutModel } from './response-grading';
import { gradeReadingAccuracy } from './reading-score';
import { gradeWrittenAnswer } from './written-scoring';

export interface Interview {
  id: string;
  student_id: string;
  schedule_date: string;
  instructions: string;
  status: string;
  started_at: string;
  created_at: string;
}

export interface Question {
  id: string;
  text: string;
  type: string;
  category?: string;
  options?: string; // JSON string
  criteria: string;
  is_published: number;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class AiInterviewService {
  private openai: OpenAI;

  constructor(@Inject('AI_DATABASE') private readonly db: Database) {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY is not set. AI evaluation will fail.');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
    });
  }

  async scheduleInterview(
    studentId: string, 
    scheduleDate: string, 
    instructions: string,
    studentInfo?: { name?: string; email?: string; phone?: string; track?: string }
  ) {
    // Delete any existing interview and its responses for this student to ensure a fresh clean session
    const existing = this.db.prepare('SELECT id FROM ai_interviews WHERE student_id = ?').all(studentId) as { id: string }[];
    for (const ext of existing) {
      this.db.prepare('DELETE FROM ai_responses WHERE interview_id = ?').run(ext.id);
      this.db.prepare('DELETE FROM ai_interviews WHERE id = ?').run(ext.id);
    }

    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO ai_interviews (
        id, student_id, schedule_date, instructions, 
        student_name, student_email, student_phone, student_track
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id, 
      studentId, 
      scheduleDate, 
      instructions, 
      studentInfo?.name || null, 
      studentInfo?.email || null, 
      studentInfo?.phone || null, 
      studentInfo?.track || null
    );
    return { 
      id, 
      studentId, 
      scheduleDate, 
      instructions, 
      status: 'PENDING',
      ...studentInfo 
    };
  }

  async getAllInterviews(options: { search?: string; track?: string; page?: number; limit?: number }) {
    const { search, track, page = 1, limit = 10 } = options;
    const p = Number(page) || 1;
    const l = Number(limit) || 10;
    const offset = (p - 1) * l;

    let baseQuery = `FROM ai_interviews i WHERE 1=1`;
    const params: any[] = [];

    if (search) {
      baseQuery += ` AND (i.student_name LIKE ? OR i.student_email LIKE ? OR i.student_id LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (track && track !== 'ALL') {
      baseQuery += ` AND i.student_track = ?`;
      params.push(track);
    }

    const countRes = this.db.prepare(`SELECT COUNT(*) as count ${baseQuery}`).get(...params) as any;
    const count = countRes ? countRes.count : 0;
    const query = `
      SELECT i.*, 
             (SELECT COUNT(*) FROM ai_responses WHERE interview_id = i.id) as response_count
      ${baseQuery}
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const data = this.db.prepare(query).all(...params, l, offset) as Array<{ id: string; avg_score?: number | null }>;
    const breakdowns = this.getScoreBreakdowns(data.map((row) => row.id));
    for (const row of data) {
      row.avg_score = breakdowns.get(row.id)?.overall ?? null;
    }

    return {
      data,
      total: count,
      page: p,
      limit: l,
      totalPages: Math.ceil(count / l)
    };
  }

  async getInterviewForStudent(studentId: string) {
    const stmt = this.db.prepare(`
      SELECT * FROM ai_interviews 
      WHERE student_id = ?
      ORDER BY created_at DESC LIMIT 1
    `);
    const interview = stmt.get(studentId) as Interview | undefined;
    if (!interview) {
      throw new NotFoundException(`No AI interview found for student ${studentId}`);
    }
    return interview;
  }

  async startInterview(interviewId: string) {
    const interview = this.db.prepare('SELECT * FROM ai_interviews WHERE id = ?').get(interviewId) as Interview | undefined;
    if (!interview) throw new NotFoundException('Interview not found');
    
    if (!interview.started_at) {
      const startedAt = new Date().toISOString();
      this.db.prepare('UPDATE ai_interviews SET started_at = ?, status = ? WHERE id = ?').run(startedAt, 'STARTED', interviewId);
      return { ...interview, started_at: startedAt, status: 'STARTED' };
    }
    return interview;
  }

  async submitResponse(interviewId: string, questionId: string, answer: string, criteria: string) {
    // 0. Check session time
    const interview = this.db.prepare('SELECT * FROM ai_interviews WHERE id = ?').get(interviewId) as Interview | undefined;
    if (!interview) throw new NotFoundException('Interview not found');
    
    if (interview.started_at) {
      const startTime = new Date(interview.started_at).getTime();
      const now = new Date().getTime();
      const limitMs = 45 * 60 * 1000;
      
      if (now - startTime > limitMs) {
        this.closeInterview(interviewId);
        throw new BadRequestException({
          message: 'Interview session has expired (45 minute limit reached)',
          code: 'SESSION_EXPIRED'
        });
      }
    }

    const question = this.db.prepare(
      'SELECT text, type, criteria, options FROM ai_questions WHERE id = ?',
    ).get(questionId) as { text: string; type: string; criteria: string; options: string | null } | undefined;
    const qType = question?.type || 'long-text';
    const gradingCriteria = question?.criteria?.trim() ? question.criteria : criteria;
    const options = parseQuestionOptions(question?.options);
    const questionText = question?.text || '';

    const localGrade = gradeWithoutModel({
      qType,
      answer,
      criteria: gradingCriteria,
      options,
      questionText,
    });
    const evaluation = localGrade ?? await gradeWrittenAnswer(this.openai, {
      questionText,
      criteria: gradingCriteria,
      answer,
    });

    // Clean up any existing response for this question in this interview session to prevent duplicates
    this.db.prepare('DELETE FROM ai_responses WHERE interview_id = ? AND question_id = ?').run(interviewId, questionId);

    // 2. Save to SQLite with UUID
    const responseId = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO ai_responses (id, interview_id, question_id, student_answer, ai_score, ai_feedback)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(responseId, interviewId, questionId, answer, evaluation.score, evaluation.feedback);

    return { id: responseId, interviewId, questionId, score: evaluation.score, feedback: evaluation.feedback };
  }

  async getStats() {
    const rows = this.db.prepare('SELECT id, status FROM ai_interviews').all() as Array<{ id: string; status: string }>;
    const breakdowns = this.getScoreBreakdowns(rows.map((row) => row.id));
    
    const completed = rows.filter(r => r.status === 'COMPLETED').length;
    const scheduled = rows.filter(r => r.status !== 'COMPLETED').length;
    
    const scores = rows
      .map((row) => breakdowns.get(row.id)?.overall)
      .filter((score): score is number => score !== null && score !== undefined);
    const avgScore = scores.length > 0 
      ? scores.reduce((acc: number, s: number) => acc + s, 0) / scores.length 
      : 0;

    return {
      completedInterviews: completed,
      scheduledInterviews: scheduled,
      averageScore: avgScore
    };
  }

  async closeInterview(interviewId: string) {
    this.db.prepare('UPDATE ai_interviews SET status = ? WHERE id = ?').run('COMPLETED', interviewId);
    return { id: interviewId, status: 'COMPLETED' };
  }

  async resetInterview(interviewIdOrStudentId: string, options?: { clearResponses?: boolean }) {
    // Find interview by interview ID or student_id
    let interview = this.db.prepare('SELECT * FROM ai_interviews WHERE id = ? OR student_id = ? ORDER BY created_at DESC LIMIT 1').get(interviewIdOrStudentId, interviewIdOrStudentId) as Interview | undefined;
    if (!interview) {
      // Try searching by student applicationId or name
      interview = this.db.prepare('SELECT * FROM ai_interviews WHERE student_id LIKE ? OR student_name LIKE ? ORDER BY created_at DESC LIMIT 1').get(`%${interviewIdOrStudentId}%`, `%${interviewIdOrStudentId}%`) as Interview | undefined;
    }
    if (!interview) throw new NotFoundException('Interview not found');

    if (options?.clearResponses) {
      this.db.prepare('DELETE FROM ai_responses WHERE interview_id = ?').run(interview.id);
    }
    this.db.prepare('DELETE FROM ai_suspicious_logs WHERE interview_id = ?').run(interview.id);

    const nowIso = new Date().toISOString();
    this.db.prepare('UPDATE ai_interviews SET status = ?, started_at = ? WHERE id = ?').run('STARTED', nowIso, interview.id);

    return { id: interview.id, student_id: interview.student_id, status: 'STARTED', started_at: nowIso, message: 'Interview successfully reset and reopened.' };
  }

  async deleteInterview(id: string) {
    this.db.prepare('DELETE FROM ai_responses WHERE interview_id = ?').run(id);
    this.db.prepare('DELETE FROM ai_interviews WHERE id = ?').run(id);
    return { id, deleted: true };
  }

  async getInterviewResults(interviewId: string) {
    const stmt = this.db.prepare('SELECT * FROM ai_responses WHERE interview_id = ?');
    return stmt.all(interviewId);
  }

  async getInterviewSummary(interviewId: string) {
    const interview = this.db.prepare('SELECT * FROM ai_interviews WHERE id = ?').get(interviewId) as Interview | undefined;
    if (!interview) throw new NotFoundException('Interview not found');

    const responses = this.db.prepare(`
      SELECT r.*, q.text as question_text, q.type as question_type, q.criteria as question_criteria
      FROM ai_responses r
      JOIN ai_questions q ON r.question_id = q.id
      WHERE r.interview_id = ?
      ORDER BY r.created_at ASC
    `).all(interviewId) as Array<Record<string, any>>;

    const suspiciousLogs = this.db.prepare('SELECT * FROM ai_suspicious_logs WHERE interview_id = ? ORDER BY created_at ASC').all(interviewId);

    const scoreBreakdown = scoreInterview(responses.map((row) => ({
      type: row.question_type,
      criteria: row.question_criteria,
      ai_score: row.ai_score,
    })));

    return {
      ...interview,
      responses: responses.map(({ question_criteria, ...row }) => ({
        ...row,
        score_kind: scoreKind(row.question_type, question_criteria || ''),
      })),
      scoreBreakdown,
      suspiciousLogs
    };
  }

  getScoreBreakdown(interviewId: string): ScoreBreakdown {
    return this.getScoreBreakdowns([interviewId]).get(interviewId) ?? scoreInterview([]);
  }

  getScoreBreakdowns(interviewIds: string[]): Map<string, ScoreBreakdown> {
    const grouped = new Map<string, Array<{ type: string; criteria: string | null; ai_score: number | null }>>();
    for (const id of interviewIds) grouped.set(id, []);
    if (interviewIds.length === 0) return new Map();

    const rows: Array<{
      interview_id: string;
      ai_score: number | null;
      question_type: string;
      question_criteria: string | null;
    }> = [];
    const chunkSize = 400;
    for (let offset = 0; offset < interviewIds.length; offset += chunkSize) {
      const chunk = interviewIds.slice(offset, offset + chunkSize);
      const placeholders = chunk.map(() => '?').join(',');
      const chunkRows = this.db.prepare(`
        SELECT r.interview_id as interview_id, r.ai_score as ai_score, q.type as question_type, q.criteria as question_criteria
        FROM ai_responses r
        JOIN ai_questions q ON q.id = r.question_id
        WHERE r.interview_id IN (${placeholders})
      `).all(...chunk) as typeof rows;
      rows.push(...chunkRows);
    }

    for (const row of rows) {
      const bucket = grouped.get(row.interview_id);
      if (!bucket) continue;
      bucket.push({
        type: row.question_type,
        criteria: row.question_criteria,
        ai_score: row.ai_score,
      });
    }

    const breakdowns = new Map<string, ScoreBreakdown>();
    for (const [id, scored] of grouped) {
      breakdowns.set(id, scoreInterview(scored));
    }
    return breakdowns;
  }

  async getLatestInterviewSummaryForStudent(studentId: string) {
    const interview = this.db.prepare(`
      SELECT * FROM ai_interviews 
      WHERE student_id = ?
      ORDER BY created_at DESC LIMIT 1
    `).get(studentId) as Interview | undefined;
    
    if (!interview) {
      return null;
    }

    return this.getInterviewSummary(interview.id);
  }

  // --- Question Management ---

  async createQuestion(text: string, type: string, criteria: string, category?: string, options?: string[], durationSeconds?: number) {
    const id = uuidv4();
    const optionsJson = options ? JSON.stringify(options) : null;
    const stmt = this.db.prepare(`
      INSERT INTO ai_questions (id, text, type, criteria, category, options, duration_seconds)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, text, type, criteria, category, optionsJson, durationSeconds !== undefined ? durationSeconds : null);
    return { id, text, type, criteria, category, options, duration_seconds: durationSeconds, is_published: 0 };
  }

  async getQuestions(publishedOnly: boolean = false) {
    let query = 'SELECT * FROM ai_questions';
    if (publishedOnly) {
      query += ' WHERE is_published = 1';
    }
    // Sort scenario/role-play questions last; all others ordered by section category then creation order
    query += ` ORDER BY
      CASE WHEN category LIKE '%Role-Play%' OR text LIKE 'SCENARIO%' THEN 1 ELSE 0 END ASC,
      category ASC,
      created_at ASC`;
    const rows = this.db.prepare(query).all() as any[];
    return rows.map(row => ({
      ...row,
      options: row.options ? JSON.parse(row.options) : null
    }));
  }

  async updateQuestion(id: string, updates: { text?: string; type?: string; criteria?: string; category?: string; options?: string[]; duration_seconds?: number | null }) {
    const updateClauses: string[] = [];
    const params: any[] = [];
    
    if (updates.text) {
      updateClauses.push('text = ?');
      params.push(updates.text);
    }
    if (updates.type) {
      updateClauses.push('type = ?');
      params.push(updates.type);
    }
    if (updates.criteria) {
      updateClauses.push('criteria = ?');
      params.push(updates.criteria);
    }
    if (updates.category) {
      updateClauses.push('category = ?');
      params.push(updates.category);
    }
    if (updates.options) {
      updateClauses.push('options = ?');
      params.push(JSON.stringify(updates.options));
    }
    if (updates.duration_seconds !== undefined) {
      updateClauses.push('duration_seconds = ?');
      params.push(updates.duration_seconds);
    }
    
    if (updateClauses.length === 0) return { id };
 
    updateClauses.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
 
    const stmt = this.db.prepare(`
      UPDATE ai_questions SET ${updateClauses.join(', ')} WHERE id = ?
    `);
    stmt.run(...params);
    return { id, ...updates };
  }

  async togglePublishQuestion(id: string, publish: boolean) {
    if (publish) {
      const publishedCount = (this.db.prepare('SELECT COUNT(*) as count FROM ai_questions WHERE is_published = 1').get() as { count: number }).count;
      if (publishedCount >= 60) {
        throw new Error('Maximum of 60 published questions reached. Please unpublish some first.');
      }
    }

    const stmt = this.db.prepare('UPDATE ai_questions SET is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(publish ? 1 : 0, id);
    return { id, is_published: publish ? 1 : 0 };
  }

  async deleteQuestion(id: string) {
    const stmt = this.db.prepare('DELETE FROM ai_questions WHERE id = ?');
    stmt.run(id);
    return { id, deleted: true };
  }

  async submitVoiceResponse(interviewId: string, questionId: string, file: any, criteria: string) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No audio file provided');
    }

    // 0. Check session time
    const interview = this.db.prepare('SELECT * FROM ai_interviews WHERE id = ?').get(interviewId) as Interview | undefined;
    if (!interview) throw new NotFoundException('Interview not found');
    
    if (interview.started_at) {
      const startTime = new Date(interview.started_at).getTime();
      const now = new Date().getTime();
      const limitMs = 45 * 60 * 1000;
      
      if (now - startTime > limitMs) {
        this.closeInterview(interviewId);
        throw new BadRequestException({
          message: 'Interview session has expired (45 minute limit reached)',
          code: 'SESSION_EXPIRED'
        });
      }
    }

    // Create uploads directory inside persistent data directory
    const dataDir = path.join(process.cwd(), 'data');
    const uploadsDir = path.join(dataDir, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const ext = path.extname(file.originalname) || '.webm';
    const filename = `voice-${uuidv4()}${ext}`;
    const permanentFilePath = path.join(uploadsDir, filename);
    const audioUrl = `/api/uploads/${filename}`;
    
    let transcriptionText = '';
    try {
      // Write buffer to uploads file
      fs.writeFileSync(permanentFilePath, file.buffer);

      // Transcribe via Whisper
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(permanentFilePath),
        model: 'whisper-1',
      });
      transcriptionText = transcription.text;
    } catch (error) {
      console.error('Whisper transcription error:', error);
      // Clean up permanent file if transcription fails
      if (fs.existsSync(permanentFilePath)) {
        try {
          fs.unlinkSync(permanentFilePath);
        } catch (e) {
          console.error('Failed to delete failed voice file:', e);
        }
      }
      throw new BadRequestException(`Transcription failed: ${error.message}`);
    }

    // Score reading accuracy against the quoted script. Accent is not inferred from text.
    const question = this.db.prepare('SELECT text FROM ai_questions WHERE id = ?').get(questionId) as { text: string } | undefined;
    const evaluation = gradeReadingAccuracy(transcriptionText, question?.text || '');
    void criteria;

    // Clean up any existing response for this question in this interview session to prevent duplicates
    this.db.prepare('DELETE FROM ai_responses WHERE interview_id = ? AND question_id = ?').run(interviewId, questionId);

    // Save to responses database
    const responseId = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO ai_responses (id, interview_id, question_id, student_answer, ai_score, ai_feedback, audio_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(responseId, interviewId, questionId, transcriptionText, evaluation.score, evaluation.feedback, audioUrl);

    return { 
      id: responseId, 
      interviewId, 
      questionId, 
      transcription: transcriptionText, 
      score: evaluation.score, 
      feedback: evaluation.feedback,
      audioUrl
    };
  }

  async unscheduleInterview(studentId: string): Promise<{ deleted: boolean; studentId: string }> {
    // Delete the interview record by student_id; cascades to ai_responses
    this.db.prepare('DELETE FROM ai_interviews WHERE student_id = ?').run(studentId);
    return { deleted: true, studentId };
  }

  // --- Admin Account Management (Super Admin only) ---

  async createAdmin(email: string, passwordPlain: string, role: string) {
    const existing = this.db.prepare('SELECT id FROM ai_admins WHERE email = ?').get(email);
    if (existing) {
      throw new BadRequestException('Admin with this email already exists');
    }
    const id = uuidv4();
    const hashedPassword = bcrypt.hashSync(passwordPlain, 10);
    this.db.prepare('INSERT INTO ai_admins (id, email, password, role) VALUES (?, ?, ?, ?)').run(id, email, hashedPassword, role);
    return { id, email, role };
  }

  async getAdmins() {
    const rows = this.db.prepare('SELECT id, email, role, created_at FROM ai_admins ORDER BY created_at ASC').all() as any[];
    return rows;
  }

  async updateAdmin(id: string, updates: { role?: string; password?: string }) {
    const clauses: string[] = [];
    const params: any[] = [];
    if (updates.role) {
      clauses.push('role = ?');
      params.push(updates.role);
    }
    if (updates.password) {
      clauses.push('password = ?');
      params.push(bcrypt.hashSync(updates.password, 10));
    }
    if (clauses.length === 0) return { id };
    params.push(id);
    this.db.prepare(`UPDATE ai_admins SET ${clauses.join(', ')} WHERE id = ?`).run(...params);
    const updated = this.db.prepare('SELECT id, email, role, created_at FROM ai_admins WHERE id = ?').get(id) as any;
    return updated;
  }

  async deleteAdmin(id: string) {
    this.db.prepare('DELETE FROM ai_admins WHERE id = ?').run(id);
    return { success: true };
  }

  async logSuspiciousEvent(interviewId: string, eventType: string, description: string) {
    const id = uuidv4();
    this.db.prepare(`
      INSERT INTO ai_suspicious_logs (id, interview_id, event_type, description)
      VALUES (?, ?, ?, ?)
    `).run(id, interviewId, eventType, description);
    return { id, interviewId, eventType, description };
  }

  async getSuspiciousEvents(interviewId: string) {
    const rows = this.db.prepare(`
      SELECT * FROM ai_suspicious_logs 
      WHERE interview_id = ? 
      ORDER BY created_at ASC
    `).all(interviewId) as any[];
    return rows;
  }
}

