import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';

@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':studentId')
  create(@Param('studentId') studentId: string, @Body() createInterviewDto: CreateInterviewDto) {
    return this.interviewsService.create(createInterviewDto, studentId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll(@Query('search') search?: string, @Query('outcome') outcome?: string) {
    return this.interviewsService.findAll(search, outcome);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interviewsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInterviewDto: UpdateInterviewDto) {
    return this.interviewsService.update(id, updateInterviewDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interviewsService.remove(id);
  }
}

