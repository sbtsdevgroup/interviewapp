import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';
import { ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';

@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':studentId')
  @ApiOperation({ summary: 'Create a new interview for a student' })
  @ApiBody({ type: CreateInterviewDto })
  @ApiResponse({ status: 201, description: 'The interview has been successfully created.' })
  create(@Param('studentId') studentId: string, @Body() createInterviewDto: CreateInterviewDto) {
    return this.interviewsService.create(createInterviewDto, studentId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  @ApiOperation({ summary: 'Get all interviews' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by student name or email' })
  @ApiQuery({ name: 'outcome', required: false, description: 'Filter by interview outcome' })
  findAll(@Query('search') search?: string, @Query('outcome') outcome?: string) {
    return this.interviewsService.findAll(search, outcome);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get an interview by ID' })
  @ApiResponse({ status: 200 })
  findOne(@Param('id') id: string) {
    return this.interviewsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an interview by ID' })
  @ApiBody({ type: UpdateInterviewDto })
  @ApiResponse({ status: 200, description: 'The interview has been successfully updated.' })
  update(@Param('id') id: string, @Body() updateInterviewDto: UpdateInterviewDto) {
    return this.interviewsService.update(id, updateInterviewDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an interview by ID' })
  @ApiResponse({ status: 200, description: 'The interview has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.interviewsService.remove(id);
  }
}

