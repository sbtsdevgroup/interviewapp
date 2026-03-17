import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Pool } from 'pg';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly whisperUrl = process.env.WHISPER_URL || 'http://whisper-service:8001';
  private readonly analysisUrl = process.env.ANALYSIS_URL || 'http://analysis-service:8002';

  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async transcribeAudio(audioBuffer: Buffer, filename: string): Promise<any> {
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('audio', audioBuffer, {
        filename: filename,
        contentType: 'audio/webm',
      });

      const response = await axios.post(`${this.whisperUrl}/transcribe`, formData, {
        headers: formData.getHeaders(),
        timeout: 300000, // 5 minutes timeout for transcription
      });

      return response.data;
    } catch (error: any) {
      console.error('Transcription error:', error);
      throw new HttpException(
        `Transcription failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async analyzeInterview(transcript: string, studentName: string, duration: number): Promise<any> {
    try {
      const response = await axios.post(
        `${this.analysisUrl}/analyze`,
        {
          transcript,
          student_name: studentName,
          interview_duration: duration,
        },
        {
          timeout: 180000, // 3 minutes timeout for analysis
        },
      );

      return response.data;
    } catch (error: any) {
      console.error('Analysis error:', error);
      throw new HttpException(
        `Analysis failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async saveRecording(
    studentId: string,
    interviewDate: string,
    recordingUrl: string,
    duration: number,
    transcript?: string,
    transcriptSegments?: any,
  ) {
    const result = await this.pool.query(
      `INSERT INTO interview_recordings 
       (student_id, interview_date, recording_url, recording_duration, transcript, transcript_segments, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [
        studentId,
        interviewDate,
        recordingUrl,
        duration,
        transcript || null,
        transcriptSegments ? JSON.stringify(transcriptSegments) : null,
      ],
    );

    return result.rows[0];
  }

  async saveAnalysis(recordingId: string, analysisData: any) {
    const result = await this.pool.query(
      `INSERT INTO interview_ai_analysis 
       (recording_id, overall_score, communication_score, technical_knowledge_score, 
        confidence_score, clarity_score, strengths, weaknesses, recommendations, 
        summary, sentiment, analysis_data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       RETURNING *`,
      [
        recordingId,
        analysisData.overall_score || null,
        analysisData.communication_score || null,
        analysisData.technical_knowledge_score || null,
        analysisData.confidence_score || null,
        analysisData.clarity_score || null,
        JSON.stringify(analysisData.strengths || []),
        JSON.stringify(analysisData.weaknesses || []),
        JSON.stringify(analysisData.recommendations || []),
        analysisData.summary || null,
        analysisData.sentiment || null,
        JSON.stringify(analysisData),
      ],
    );

    return result.rows[0];
  }

  async getRecordingById(recordingId: string) {
    const result = await this.pool.query(
      `SELECT r.*, 
              a.overall_score, a.communication_score, a.technical_knowledge_score,
              a.confidence_score, a.clarity_score, a.strengths, a.weaknesses,
              a.recommendations, a.summary, a.sentiment, a.analysis_data
       FROM interview_recordings r
       LEFT JOIN interview_ai_analysis a ON r.id = a.recording_id
       WHERE r.id = $1`,
      [recordingId],
    );

    return result.rows[0];
  }

  async getRecordingsByStudent(studentId: string) {
    const result = await this.pool.query(
      `SELECT r.*, 
              a.overall_score, a.communication_score, a.technical_knowledge_score,
              a.confidence_score, a.clarity_score, a.strengths, a.weaknesses,
              a.recommendations, a.summary, a.sentiment
       FROM interview_recordings r
       LEFT JOIN interview_ai_analysis a ON r.id = a.recording_id
       WHERE r.student_id = $1
       ORDER BY r.created_at DESC`,
      [studentId],
    );

    return result.rows;
  }

  async getAllRecordings() {
    const result = await this.pool.query(
      `SELECT r.*, 
              u."fullName", a."applicationId", u.email,
              a_ai.overall_score, a_ai.communication_score, a_ai.technical_knowledge_score,
              a_ai.confidence_score, a_ai.clarity_score, a_ai.strengths, a_ai.weaknesses,
              a_ai.recommendations, a_ai.summary, a_ai.sentiment
       FROM interview_recordings r
       JOIN applications a ON r.student_id = a.id
       JOIN "user" u ON a."UserId" = u.id
       LEFT JOIN interview_ai_analysis a_ai ON r.id = a_ai.recording_id
       ORDER BY r.created_at DESC`,
    );

    return result.rows;
  }
}

