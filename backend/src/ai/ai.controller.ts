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
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { EvaluateAnswerDto } from './dto/evaluate-answer.dto';
import { TogglePublishDto } from './dto/toggle-publish.dto';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiInterviewService: AiInterviewService,
  ) {}

  @ApiOperation({ summary: 'Schedule an AI interview for a student' })
  @Roles(Role.ADMIN)
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
  @Roles(Role.STUDENT)
  @Get('interview/pending')
  async getPendingInterview(@Request() req) {
    return this.aiInterviewService.getInterviewForStudent(req.user.applicationId || req.user.id);
  }

  @ApiOperation({ summary: 'Start an AI interview session' })
  @Roles(Role.STUDENT)
  @Post('interview/:id/start')
  async startInterview(@Param('id') id: string) {
    return this.aiInterviewService.startInterview(id);
  }

  @ApiOperation({ summary: 'Evaluate a student response using OpenAI' })
  @Roles(Role.STUDENT)
  @Post('interview/evaluate')
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
  @Roles(Role.STUDENT)
  @Post('interview/:id/close')
  async closeInterview(@Param('id') id: string) {
    return this.aiInterviewService.closeInterview(id);
  }
// ... (rest of the file remains admin or both)

  @ApiOperation({ summary: 'Get results and feedback for an AI interview' })
  @Roles(Role.ADMIN, Role.STUDENT)
  @Get('interview/:id/results')
  async getResults(@Param('id') id: string) {
    return this.aiInterviewService.getInterviewResults(id);
  }

  // --- Question Management ---

  @ApiOperation({ summary: 'Create a new interview question (Admin)' })
  @Roles(Role.ADMIN)
  @Post('questions')
  async createQuestion(
    @Body() body: CreateQuestionDto,
  ) {
    return this.aiInterviewService.createQuestion(body.text, body.type, body.criteria, body.category, body.options);
  }

  @ApiOperation({ summary: 'List all interview questions (Admin)' })
  @Roles(Role.ADMIN)
  @Get('questions')
  async getQuestions() {
    return this.aiInterviewService.getQuestions();
  }

  @ApiOperation({ summary: 'List published interview questions' })
  @Roles(Role.ADMIN, Role.STUDENT)
  @Get('questions/published')
  async getPublishedQuestions() {
    return this.aiInterviewService.getQuestions(true);
  }

  @ApiOperation({ summary: 'Update an existing question' })
  @Roles(Role.ADMIN)
  @Patch('questions/:id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() body: UpdateQuestionDto,
  ) {
    return this.aiInterviewService.updateQuestion(id, {
      text: body.text,
      type: body.type,
      criteria: body.criteria,
    });
  }

  @ApiOperation({ summary: 'Toggle publish status of a question (max 15)' })
  @Roles(Role.ADMIN)
  @Patch('questions/:id/publish')
  async togglePublish(
    @Param('id') id: string,
    @Body() body: TogglePublishDto,
  ) {
    return this.aiInterviewService.togglePublishQuestion(id, body.publish);
  }

  @ApiOperation({ summary: 'Delete a question' })
  @Roles(Role.ADMIN)
  @Delete('questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return this.aiInterviewService.deleteQuestion(id);
  }
}

