import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Database } from 'better-sqlite3';
import OpenAI from 'openai';

export interface Interview {
  id: number;
  student_id: string;
  schedule_date: string;
  instructions: string;
  status: string;
  started_at?: string;
  created_at: string;
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
    const stmt = this.db.prepare(`
      INSERT INTO ai_interviews (student_id, schedule_date, instructions)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(studentId, scheduleDate, instructions);
    return { id: result.lastInsertRowid, studentId, scheduleDate, instructions };
  }

  async getInterviewForStudent(studentId: string) {
    const stmt = this.db.prepare(`
      SELECT * FROM ai_interviews 
      WHERE student_id = ? AND status = 'PENDING'
      ORDER BY created_at DESC LIMIT 1
    `);
    const interview = stmt.get(studentId) as Interview | undefined;
    if (!interview) {
      throw new NotFoundException(`No pending AI interview found for student ${studentId}`);
    }
    return interview;
  }

  async startInterview(interviewId: number) {
    const interview = this.db.prepare('SELECT * FROM ai_interviews WHERE id = ?').get(interviewId) as Interview | undefined;
    if (!interview) throw new NotFoundException('Interview not found');
    
    if (!interview.started_at) {
      this.db.prepare('UPDATE ai_interviews SET started_at = CURRENT_TIMESTAMP WHERE id = ?').run(interviewId);
    }
    return { ...interview, started_at: interview.started_at || new Date().toISOString() };
  }

  async submitResponse(interviewId: number, questionId: string, answer: string, criteria: string) {
    // 0. Check session time
    const interview = this.db.prepare('SELECT * FROM ai_interviews WHERE id = ?').get(interviewId) as Interview | undefined;
    if (!interview) throw new NotFoundException('Interview not found');
    
    if (interview.started_at) {
      const startTime = new Date(interview.started_at).getTime();
      const now = new Date().getTime();
      const oneHour = 60 * 60 * 1000;
      
      if (now - startTime > oneHour) {
        this.db.prepare("UPDATE ai_interviews SET status = 'EXPIRED' WHERE id = ?").run(interviewId);
        throw new Error('Interview session has expired (1 hour limit reached)');
      }
    }

    // 1. Evaluate with OpenAI
    const evaluation = await this.evaluateWithAI(answer, criteria);

    // 2. Save to SQLite
    const stmt = this.db.prepare(`
      INSERT INTO ai_responses (interview_id, question_id, student_answer, ai_score, ai_feedback)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(interviewId, questionId, answer, evaluation.score, evaluation.feedback);

    return { interviewId, questionId, score: evaluation.score, feedback: evaluation.feedback };
  }

  private async evaluateWithAI(answer: string, criteria: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
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

  async closeInterview(interviewId: number) {
    const stmt = this.db.prepare(`
      UPDATE ai_interviews SET status = 'COMPLETED' WHERE id = ?
    `);
    stmt.run(interviewId);
    return { message: 'Interview closed successfully' };
  }

  async getInterviewResults(interviewId: number) {
    const stmt = this.db.prepare(`
      SELECT * FROM ai_responses WHERE interview_id = ?
    `);
    return stmt.all(interviewId);
  }
}
