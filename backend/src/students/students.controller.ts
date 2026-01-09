import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { AdminGuard } from 'src/auth/admin.guard';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Student login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.applicationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get profile of the authenticated student' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Request() req) {
    return this.studentsService.findById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('interview-status')
  @ApiOperation({ summary: 'Get interview status of the authenticated student' })
  @ApiResponse({ status: 200, description: 'Interview status retrieved successfully' })
  async getInterviewStatus(@Request() req) {
    return this.studentsService.getInterviewStatus(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('interview-details')
  @ApiOperation({ summary: 'Get interview details of the authenticated student' })
  @ApiResponse({ status: 200, description: 'Interview details retrieved successfully' })
  async getInterviewDetails(@Request() req) {
    return this.studentsService.getInterviewDetails(req.user.id);
  }

  // Admin endpoints (no auth required for now)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('all')
  @ApiOperation({ summary: 'Get all students (admin only)' })
  @ApiResponse({ status: 200, description: 'Students retrieved successfully' })
  async getAllStudents(@Query('search') search?: string, @Query('status') status?: string) {
    return this.studentsService.findAll(search, status);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/interview')
  @ApiOperation({ summary: 'Update interview details for a student (admin only)' })
  @ApiBody({
    description: 'Interview details to update',
    schema: {
      type: 'object',
      properties: {
        interviewDate: { type: 'string', format: 'date-time' },
        interviewLink: { type: 'string' },
        interviewInstructions: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Interview details updated successfully' })
  async updateInterviewDetails(
    @Param('id') id: string,
    @Body() body: { interviewDate: string; interviewLink?: string; interviewInstructions?: string }
  ) {
    return this.studentsService.updateInterviewDetails(id, body.interviewDate, body.interviewLink, body.interviewInstructions);
  }
}

