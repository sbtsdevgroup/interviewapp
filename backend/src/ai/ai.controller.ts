import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @ApiOperation({ summary: 'Get current AI interview status for the logged-in student' })
  @Roles(Role.STUDENT)
  @Get('interview/status')
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

  @ApiOperation({ summary: 'Evaluate a student voice response using Whisper and OpenAI' })
  @Roles(Role.STUDENT)
  @Post('interview/evaluate-voice')
  @UseInterceptors(FileInterceptor('file'))
  async evaluateVoiceAnswer(
    @Body() body: { interviewId: string; questionId: string; criteria: string },
    @UploadedFile() file: any,
  ) {
    return this.aiInterviewService.submitVoiceResponse(
      body.interviewId,
      body.questionId,
      file,
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

  @ApiOperation({ summary: 'Get all AI interviews from local database (Admin)' })
  @Roles(Role.ADMIN)
  @Get('interviews/all')
  async getAll(
    @Query('search') search?: string,
    @Query('track') track?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.aiInterviewService.getAllInterviews({ search, track, page, limit });
    return {
      status: 'success',
      message: 'Request successful',
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    };
  }

  @ApiOperation({ summary: 'Get local AI interview statistics (Admin)' })
  @Roles(Role.ADMIN)
  @Get('stats')
  async getStats() {
    return this.aiInterviewService.getStats();
  }

  @ApiOperation({ summary: 'Get results and feedback for an AI interview' })
  @Roles(Role.ADMIN, Role.STUDENT)
  @Get('interview/:id/results')
  async getResults(@Param('id') id: string) {
    return this.aiInterviewService.getInterviewResults(id);
  }

  @ApiOperation({ summary: 'Get full summary for an AI interview (Admin)' })
  @Roles(Role.ADMIN)
  @Get('interview/:id/summary')
  async getSummary(@Param('id') id: string) {
    return this.aiInterviewService.getInterviewSummary(id);
  }

  @ApiOperation({ summary: 'Get latest interview summary for a student (Admin)' })
  @Roles(Role.ADMIN)
  @Get('student/:studentId/summary')
  async getStudentSummary(@Param('studentId') studentId: string) {
    return this.aiInterviewService.getLatestInterviewSummaryForStudent(studentId);
  }

  // --- Question Management ---

  @ApiOperation({ summary: 'Create a new interview question (Admin)' })
  @Roles(Role.ADMIN)
  @Post('questions')
  async createQuestion(
    @Request() req,
    @Body() body: CreateQuestionDto,
  ) {
    if (req.user?.role === 'viewer') {
      throw new ForbiddenException('Viewer role is read-only');
    }
    return this.aiInterviewService.createQuestion(
      body.text,
      body.type,
      body.criteria,
      body.category,
      body.options,
    );
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
    @Request() req,
    @Param('id') id: string,
    @Body() body: UpdateQuestionDto,
  ) {
    if (req.user?.role === 'viewer') {
      throw new ForbiddenException('Viewer role is read-only');
    }
    const b = body as any;
    return this.aiInterviewService.updateQuestion(id, {
      text: b.text,
      type: b.type,
      criteria: b.criteria,
      category: b.category,
      options: b.options,
    });
  }

  @ApiOperation({ summary: 'Toggle publish status of a question (max 60)' })
  @Roles(Role.ADMIN)
  @Patch('questions/:id/publish')
  async togglePublish(
    @Request() req,
    @Param('id') id: string,
    @Body() body: TogglePublishDto,
  ) {
    if (req.user?.role === 'viewer') {
      throw new ForbiddenException('Viewer role is read-only');
    }
    return this.aiInterviewService.togglePublishQuestion(id, body.publish);
  }

  @ApiOperation({ summary: 'Delete an interview question (Admin)' })
  @Roles(Role.ADMIN)
  @Delete('questions/:id')
  async deleteQuestion(@Request() req, @Param('id') id: string) {
    if (req.user?.role === 'viewer') {
      throw new ForbiddenException('Viewer role is read-only');
    }
    return this.aiInterviewService.deleteQuestion(id);
  }

  @ApiOperation({ summary: 'Delete an interview (Admin)' })
  @Roles(Role.ADMIN)
  @Delete('interview/:id')
  async deleteInterview(@Request() req, @Param('id') id: string) {
    if (req.user?.role === 'viewer') {
      throw new ForbiddenException('Viewer role is read-only');
    }
    return this.aiInterviewService.deleteInterview(id);
  }

  // --- Admin Account Management (Super Admin only) ---

  @ApiOperation({ summary: 'List all admin accounts (Super Admin only)' })
  @Roles(Role.ADMIN)
  @Get('admins')
  async getAdmins(@Request() req) {
    if (req.user?.role !== 'super-admin') {
      throw new ForbiddenException('Only Super Admin can manage admin accounts');
    }
    return this.aiInterviewService.getAdmins();
  }

  @ApiOperation({ summary: 'Create a new admin account (Super Admin only)' })
  @Roles(Role.ADMIN)
  @Post('admins')
  async createAdmin(
    @Request() req,
    @Body() body: { email: string; passwordPlain: string; role: string }
  ) {
    if (req.user?.role !== 'super-admin') {
      throw new ForbiddenException('Only Super Admin can manage admin accounts');
    }
    return this.aiInterviewService.createAdmin(body.email, body.passwordPlain, body.role);
  }

  @ApiOperation({ summary: 'Update admin account details (Super Admin only)' })
  @Roles(Role.ADMIN)
  @Patch('admins/:id')
  async updateAdmin(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { role?: string; password?: string }
  ) {
    if (req.user?.role !== 'super-admin') {
      throw new ForbiddenException('Only Super Admin can manage admin accounts');
    }
    return this.aiInterviewService.updateAdmin(id, body);
  }

  @ApiOperation({ summary: 'Delete an admin account (Super Admin only)' })
  @Roles(Role.ADMIN)
  @Delete('admins/:id')
  async deleteAdmin(@Request() req, @Param('id') id: string) {
    if (req.user?.role !== 'super-admin') {
      throw new ForbiddenException('Only Super Admin can manage admin accounts');
    }
    if (req.user?.id === id) {
      throw new BadRequestException('Cannot delete your own admin account');
    }
    return this.aiInterviewService.deleteAdmin(id);
  }
}

