import { Controller, Get, Post, Body, Patch, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { AuthService } from '../auth/auth.service';
import { Public } from '../common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Student login' })
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto.applicationId, loginDto.password);
    return {
      message: 'Login successful',
      data: result,
    };
  }

  @ApiOperation({ summary: 'Get current student profile' })
  @ApiBearerAuth()
  @Get('me')
  async getProfile(@Request() req) {
    return this.studentsService.findById(req.user.id);
  }

  @ApiOperation({ summary: 'Get student interview status' })
  @ApiBearerAuth()
  @Get('interview-status')
  async getInterviewStatus(@Request() req) {
    return this.studentsService.getInterviewStatus(req.user.id);
  }

  // Admin endpoints (protected by default now)
  @ApiOperation({ summary: 'List all students (Admin)' })
  @ApiBearerAuth()
  @Get('all')
  async getAllStudents(
    @Query() paginationDto: PaginationDto,
    @Query('search') search?: string,
    @Query('status') status?: string
  ) {
    return this.studentsService.findAll(paginationDto, search, status);
  }

  @ApiOperation({ summary: 'Update student interview details (Admin)' })
  @ApiBearerAuth()
  @Patch(':id/interview')
  async updateInterviewDetails(
    @Param('id') id: string,
    @Body() body: { interviewDate: string; interviewLink?: string; interviewInstructions?: string }
  ) {
    return this.studentsService.updateInterviewDetails(id, body.interviewDate, body.interviewLink, body.interviewInstructions);
  }
}

