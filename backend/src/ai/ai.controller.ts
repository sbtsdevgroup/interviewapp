import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
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

  // --- Question Management ---

  @Post('questions')
  async createQuestion(
    @Body() body: { text: string; criteria: string },
  ) {
    return this.aiInterviewService.createQuestion(body.text, body.criteria);
  }

  @Get('questions')
  async getQuestions() {
    return this.aiInterviewService.getQuestions();
  }

  @Get('questions/published')
  async getPublishedQuestions() {
    return this.aiInterviewService.getQuestions(true);
  }

  @Patch('questions/:id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() body: { text?: string; criteria?: string },
  ) {
    return this.aiInterviewService.updateQuestion(parseInt(id, 10), body.text, body.criteria);
  }

  @Patch('questions/:id/publish')
  async togglePublish(
    @Param('id') id: string,
    @Body() body: { publish: boolean },
  ) {
    return this.aiInterviewService.togglePublishQuestion(parseInt(id, 10), body.publish);
  }

  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return this.aiInterviewService.deleteQuestion(parseInt(id, 10));
  }
}

