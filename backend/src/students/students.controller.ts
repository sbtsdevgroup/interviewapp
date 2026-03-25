import { Controller, Get, Post, Body, Patch, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { AuthService } from '../auth/auth.service';
import { Public } from '../common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { GetStudentsFilterDto } from './dto/get-students-filter.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
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
  @Roles(Role.STUDENT)
  @Get('me')
  async getProfile(@Request() req) {
    return this.studentsService.findById(req.user.id);
  }

  @ApiOperation({ summary: 'Get student interview status' })
  @Roles(Role.STUDENT)
  @Get('interview-status')
  async getInterviewStatus(@Request() req) {
    return this.studentsService.getInterviewStatus(req.user.id);
  }

  // Admin endpoints
  @ApiOperation({ summary: 'List all students (Admin)' })
  @Roles(Role.ADMIN)
  @Get('all')
  async getAllStudents(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: GetStudentsFilterDto
  ) {
    return this.studentsService.findAll(paginationDto, filterDto.search, filterDto.status);
  }

  @ApiOperation({ summary: 'Update student interview details (Admin)' })
  @Roles(Role.ADMIN)
  @Patch(':id/interview')
  async updateInterviewDetails(
    @Param('id') id: string,
    @Body() body: { interviewDate: string; interviewLink?: string; interviewInstructions?: string }
  ) {
    return this.studentsService.updateInterviewDetails(id, body.interviewDate, body.interviewLink, body.interviewInstructions);
  }

  @ApiOperation({ summary: 'List all raw applications (Admin/Internal)' })
  @Roles(Role.ADMIN)
  @Get('internal/applications')
  async getInternalApplications(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: GetStudentsFilterDto
  ) {
    return this.studentsService.findAllRawApplications(paginationDto, filterDto.search, filterDto.status);
  }

  @ApiOperation({ summary: 'Get dashboard statistics (Admin)' })
  @Roles(Role.ADMIN)
  @Get('stats')
  async getDashboardStats() {
    return this.studentsService.getDashboardStats();
  }

  @ApiOperation({ summary: 'Get detailed analytics (Admin)' })
  @Roles(Role.ADMIN)
  @Get('stats/analytics')
  async getAnalytics() {
    return this.studentsService.getAnalytics();
  }
}

