import { Controller, Get, Post, Body, Patch, Param, Query, Request } from '@nestjs/common';
import { StudentsService } from './students.service';
import { AuthService } from '../auth/auth.service';
import { Public } from '../common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto.applicationId, loginDto.password);
    return {
      message: 'Login successful',
      data: result,
    };
  }

  @Get('me')
  async getProfile(@Request() req) {
    return this.studentsService.findById(req.user.id);
  }

  @Get('interview-status')
  async getInterviewStatus(@Request() req) {
    return this.studentsService.getInterviewStatus(req.user.id);
  }

  // Admin endpoints (protected by default now)
  @Get('all')
  async getAllStudents(
    @Query() paginationDto: PaginationDto,
    @Query('search') search?: string,
    @Query('status') status?: string
  ) {
    return this.studentsService.findAll(paginationDto, search, status);
  }

  @Patch(':id/interview')
  async updateInterviewDetails(
    @Param('id') id: string,
    @Body() body: { interviewDate: string; interviewLink?: string; interviewInstructions?: string }
  ) {
    return this.studentsService.updateInterviewDetails(id, body.interviewDate, body.interviewLink, body.interviewInstructions);
  }
}

