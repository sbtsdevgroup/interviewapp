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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiInterviewService } from './ai-interview.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { EvaluateAnswerDto } from './dto/evaluate-answer.dto';
import { TogglePublishDto } from './dto/toggle-publish.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiInterviewService: AiInterviewService,
  ) {}

  @ApiOperation({ summary: 'Schedule an AI interview for a student' })
  @Post('schedule')
  async scheduleInterview(
    @Body() body: ScheduleInterviewDto,
  ) {
    return this.aiInterviewService.scheduleInterview(
      body.studentId,
      body.date,
      body.instructions,
    );
  }

  @ApiOperation({ summary: 'Get pending AI interview for the logged-in student' })
  @ApiBearerAuth()
  @Get('interview/pending')
  @UseGuards(JwtAuthGuard)
  async getPendingInterview(@Request() req) {
    return this.aiInterviewService.getInterviewForStudent(req.user.applicationId || req.user.id);
  }

  @ApiOperation({ summary: 'Start an AI interview session' })
  @ApiBearerAuth()
  @Post('interview/:id/start')
  @UseGuards(JwtAuthGuard)
  async startInterview(@Param('id') id: string) {
    return this.aiInterviewService.startInterview(parseInt(id, 10));
  }

  @ApiOperation({ summary: 'Evaluate a student response using OpenAI' })
  @ApiBearerAuth()
  @Post('interview/evaluate')
  @UseGuards(JwtAuthGuard)
  async evaluateAnswer(
    @Body() body: EvaluateAnswerDto,
  ) {
    return this.aiInterviewService.submitResponse(
      body.interviewId,
      body.questionId,
      body.answer,
      body.criteria,
    );
  }

  @ApiOperation({ summary: 'Close an AI interview session' })
  @ApiBearerAuth()
  @Post('interview/:id/close')
  @UseGuards(JwtAuthGuard)
  async closeInterview(@Param('id') id: string) {
    return this.aiInterviewService.closeInterview(parseInt(id, 10));
  }

  @ApiOperation({ summary: 'Get results and feedback for an AI interview' })
  @Get('interview/:id/results')
  async getResults(@Param('id') id: string) {
    return this.aiInterviewService.getInterviewResults(parseInt(id, 10));
  }

  // --- Question Management ---

  @ApiOperation({ summary: 'Create a new interview question (Admin)' })
  @Post('questions')
  async createQuestion(
    @Body() body: CreateQuestionDto,
  ) {
    return this.aiInterviewService.createQuestion(body.text, body.criteria);
  }

  @ApiOperation({ summary: 'List all interview questions (Admin)' })
  @Get('questions')
  async getQuestions() {
    return this.aiInterviewService.getQuestions();
  }

  @ApiOperation({ summary: 'List published interview questions' })
  @Get('questions/published')
  async getPublishedQuestions() {
    return this.aiInterviewService.getQuestions(true);
  }

  @ApiOperation({ summary: 'Update an existing question' })
  @Patch('questions/:id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() body: UpdateQuestionDto,
  ) {
    return this.aiInterviewService.updateQuestion(parseInt(id, 10), body.text, body.criteria);
  }

  @ApiOperation({ summary: 'Toggle publish status of a question (max 15)' })
  @Patch('questions/:id/publish')
  async togglePublish(
    @Param('id') id: string,
    @Body() body: TogglePublishDto,
  ) {
    return this.aiInterviewService.togglePublishQuestion(parseInt(id, 10), body.publish);
  }

  @ApiOperation({ summary: 'Delete a question' })
  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return this.aiInterviewService.deleteQuestion(parseInt(id, 10));
  }
}

