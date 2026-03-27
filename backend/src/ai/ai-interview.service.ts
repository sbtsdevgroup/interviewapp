import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Database } from 'better-sqlite3';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

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

  async scheduleInterview(studentId: string, scheduleDate: string, instructions: string) {
    const id = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO ai_interviews (id, student_id, schedule_date, instructions)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, studentId, scheduleDate, instructions);
    return { id, studentId, scheduleDate, instructions, status: 'PENDING' };
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
      const twoHours = 2 * 60 * 60 * 1000;
      
      if (now - startTime > twoHours) {
        this.closeInterview(interviewId);
        throw new BadRequestException({
          message: 'Interview session has expired (2 hour limit reached)',
          code: 'SESSION_EXPIRED'
        });
      }
    }

    // 1. Evaluate with OpenAI
    const evaluation = await this.evaluateWithAI(answer, criteria);

    // 2. Save to SQLite with UUID
    const responseId = uuidv4();
    const stmt = this.db.prepare(`
      INSERT INTO ai_responses (id, interview_id, question_id, student_answer, ai_score, ai_feedback)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(responseId, interviewId, questionId, answer, evaluation.score, evaluation.feedback);

    return { id: responseId, interviewId, questionId, score: evaluation.score, feedback: evaluation.feedback };
  }

  private async evaluateWithAI(answer: string, criteria: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert interviewer. Evaluate the student's answer based on the provided criteria. Provide a score from 0 to 100 and brief constructive feedback. Return only JSON format: { \"score\": number, \"feedback\": \"string\" }"
          },
          {
            role: "user",
            content: `Criteria: ${criteria}\n\nStudent Answer: ${answer}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI Evaluation Error:', error);
      return { score: 0, feedback: "Evaluation failed due to an AI error." };
    }
  }

  async closeInterview(id: string) {
    const stmt = this.db.prepare('UPDATE ai_interviews SET status = ? WHERE id = ?');
    stmt.run('COMPLETED', id);
    return { id, status: 'COMPLETED' };
  }

  async getInterviewResults(interviewId: string) {
    const stmt = this.db.prepare('SELECT * FROM ai_responses WHERE interview_id = ?');
    return stmt.all(interviewId);
  }

  // --- Question Management ---

  async createQuestion(text: string, type: string, criteria: string, category?: string, options?: string[]) {
    const id = uuidv4();
    const optionsJson = options ? JSON.stringify(options) : null;
    const stmt = this.db.prepare(`
      INSERT INTO ai_questions (id, text, type, criteria, category, options)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, text, type, criteria, category, optionsJson);
    return { id, text, type, criteria, category, options, is_published: 0 };
  }

  async getQuestions(publishedOnly: boolean = false) {
    let query = 'SELECT * FROM ai_questions';
    if (publishedOnly) {
      query += ' WHERE is_published = 1';
    }
    query += ' ORDER BY created_at DESC';
    const rows = this.db.prepare(query).all() as any[];
    return rows.map(row => ({
      ...row,
      options: row.options ? JSON.parse(row.options) : null
    }));
  }

  async updateQuestion(id: string, updates: { text?: string; type?: string; criteria?: string; category?: string; options?: string[] }) {
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
      if (publishedCount >= 15) {
        throw new Error('Maximum of 15 published questions reached. Please unpublish some first.');
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
}
