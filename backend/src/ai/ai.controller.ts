import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AiInterviewService } from './ai-interview.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiInterviewService: AiInterviewService,
  ) {}

  @Post('schedule')
  async scheduleInterview(
    @Body() body: { studentId: string; date: string; instructions: string },
  ) {
    return this.aiInterviewService.scheduleInterview(
      body.studentId,
      body.date,
      body.instructions,
    );
  }

  @Get('interview/pending')
  @UseGuards(JwtAuthGuard)
  async getPendingInterview(@Request() req) {
    return this.aiInterviewService.getInterviewForStudent(req.user.applicationId || req.user.id);
  }

  @Post('interview/:id/start')
  @UseGuards(JwtAuthGuard)
  async startInterview(@Param('id') id: string) {
    return this.aiInterviewService.startInterview(parseInt(id, 10));
  }

  @Post('interview/evaluate')
  @UseGuards(JwtAuthGuard)
  async evaluateAnswer(
    @Body() body: { interviewId: number; questionId: string; answer: string; criteria: string },
  ) {
    return this.aiInterviewService.submitResponse(
      body.interviewId,
      body.questionId,
      body.answer,
      body.criteria,
    );
  }

  @Post('interview/:id/close')
  @UseGuards(JwtAuthGuard)
  async closeInterview(@Param('id') id: string) {
    return this.aiInterviewService.closeInterview(parseInt(id, 10));
  }

  @Get('interview/:id/results')
  async getResults(@Param('id') id: string) {
    return this.aiInterviewService.getInterviewResults(parseInt(id, 10));
  }
}

