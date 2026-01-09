import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/admin.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('transcribe')
  @ApiOperation({ summary: 'Transcribe an audio file' })
  @ApiResponse({ status: 200, description: 'Transcription successful' })
  @ApiBody({
    description: 'Audio file to be transcribed',
    schema: {
      type: 'object',
      properties: {
        audio: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('audio'))
  async transcribe(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('No audio file provided');
    }

    const result = await this.aiService.transcribeAudio(file.buffer, file.originalname);
    return result;
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze an interview transcript' })
  @ApiResponse({ status: 200, description: 'Analysis successful' })
  @ApiBody({
    description: 'Transcript data for analysis',
    schema: {
      type: 'object',
      properties: {
        transcript: { type: 'string' },
        studentName: { type: 'string' },
        duration: { type: 'number' },
      },
    },
  })
  async analyze(@Body() body: { transcript: string; studentName: string; duration: number }) {
    const result = await this.aiService.analyzeInterview(
      body.transcript,
      body.studentName,
      body.duration,
    );
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('recording')
  @ApiOperation({ summary: 'Save a new interview recording' })
  @ApiResponse({ status: 201, description: 'Recording saved successfully' })
  @ApiBody({
    description: 'Recording data to be saved',
    schema: {
      type: 'object',
      properties: {
        interviewDate: { type: 'string', format: 'date' },
        recordingUrl: { type: 'string' },
        duration: { type: 'number' },
        transcript: { type: 'string' },
        transcriptSegments: { type: 'object' },
      },
    },
  })
  async saveRecording(
    @Request() req,
    @Body()
    body: {
      interviewDate: string;
      recordingUrl: string;
      duration: number;
      transcript?: string;
      transcriptSegments?: any;
    },
  ) {
    const recording = await this.aiService.saveRecording(
      req.user.id,
      body.interviewDate,
      body.recordingUrl,
      body.duration,
      body.transcript,
      body.transcriptSegments,
    );
    return recording;
  }

  @UseGuards(JwtAuthGuard)
  @Post('recording/:recordingId/analysis')
  @ApiOperation({ summary: 'Save analysis for a specific recording' })
  @ApiResponse({ status: 201, description: 'Analysis saved successfully' })
  @ApiBody({
    description: 'Analysis data to be saved',
    schema: {
      type: 'object',
      properties: {
        overallScore: { type: 'number' },
        strengths: { type: 'array', items: { type: 'string' } },
        weaknesses: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async saveAnalysis(
    @Param('recordingId') recordingId: string,
    @Body() analysisData: any,
  ) {
    const analysis = await this.aiService.saveAnalysis(recordingId, analysisData);
    return analysis;
  }

  @UseGuards(JwtAuthGuard)
  @Get('recording/:recordingId')
  @ApiOperation({ summary: 'Get a specific recording by ID' })
  @ApiResponse({ status: 200, description: 'Recording retrieved successfully' })
  async getRecording(@Param('recordingId') recordingId: string) {
    const recording = await this.aiService.getRecordingById(recordingId);
    return recording;
  }

  @UseGuards(JwtAuthGuard)
  @Get('recordings/student')
  @ApiOperation({ summary: 'Get all recordings for the authenticated student' })
  @ApiResponse({ status: 200, description: 'Recordings retrieved successfully' })
  async getStudentRecordings(@Request() req) {
    const recordings = await this.aiService.getRecordingsByStudent(req.user.id);
    return recordings;
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('recordings/all')
  @ApiOperation({ summary: 'Get all recordings (admin only)' })
  @ApiResponse({ status: 200, description: 'All recordings retrieved successfully' })
  async getAllRecordings() {
    const recordings = await this.aiService.getAllRecordings();
    return recordings;
  }
}

