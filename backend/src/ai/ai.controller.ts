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

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio'))
  async transcribe(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('No audio file provided');
    }

    const result = await this.aiService.transcribeAudio(file.buffer, file.originalname);
    return result;
  }

  @Post('analyze')
  async analyze(@Body() body: { transcript: string; studentName: string; duration: number }) {
    const result = await this.aiService.analyzeInterview(
      body.transcript,
      body.studentName,
      body.duration,
    );
    return result;
  }

  @Post('recording')
  @UseGuards(JwtAuthGuard)
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

  @Post('recording/:recordingId/analysis')
  async saveAnalysis(
    @Param('recordingId') recordingId: string,
    @Body() analysisData: any,
  ) {
    const analysis = await this.aiService.saveAnalysis(recordingId, analysisData);
    return analysis;
  }

  @Get('recording/:recordingId')
  @UseGuards(JwtAuthGuard)
  async getRecording(@Param('recordingId') recordingId: string) {
    const recording = await this.aiService.getRecordingById(recordingId);
    return recording;
  }

  @Get('recordings/student')
  @UseGuards(JwtAuthGuard)
  async getStudentRecordings(@Request() req) {
    const recordings = await this.aiService.getRecordingsByStudent(req.user.id);
    return recordings;
  }

  @Get('recordings/all')
  async getAllRecordings() {
    const recordings = await this.aiService.getAllRecordings();
    return recordings;
  }
}

