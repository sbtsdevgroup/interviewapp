import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.applicationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.studentsService.findById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('interview-status')
  async getInterviewStatus(@Request() req) {
    return this.studentsService.getInterviewStatus(req.user.id);
  }

  // Admin endpoints (no auth required for now)
  @Get('all')
  async getAllStudents(@Query('search') search?: string, @Query('status') status?: string) {
    return this.studentsService.findAll(search, status);
  }

  @Patch(':id/interview')
  async updateInterviewDetails(
    @Param('id') id: string,
    @Body() body: { interviewDate: string; interviewLink?: string; interviewInstructions?: string }
  ) {
    return this.studentsService.updateInterviewDetails(id, body.interviewDate, body.interviewLink, body.interviewInstructions);
  }
}

