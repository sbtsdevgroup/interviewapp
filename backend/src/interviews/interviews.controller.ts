import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  create(@Body() createInterviewDto: CreateInterviewDto) {
    return this.interviewsService.create(createInterviewDto);
  }

  @Get()
  findAll(@Query('search') search?: string, @Query('outcome') outcome?: string) {
    return this.interviewsService.findAll(search, outcome);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interviewsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInterviewDto: UpdateInterviewDto) {
    return this.interviewsService.update(id, updateInterviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interviewsService.remove(id);
  }
}

