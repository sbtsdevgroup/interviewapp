import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getNotifications(
    @Request() req,
    @Query('unreadOnly') unreadOnly?: string
  ) {
    const userId = req.user.id;
    const userType = req.user.userType || 'student'; // Default to student if not specified
    const unread = unreadOnly === 'true';
    return this.notificationsService.findAll(userId, userType, unread);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const userId = req.user.id;
    const userType = req.user.userType || 'student';
    return { count: await this.notificationsService.getUnreadCount(userId, userType) };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const userType = req.user.userType || 'student';
    return this.notificationsService.markAsRead(id, userId, userType);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    const userId = req.user.id;
    const userType = req.user.userType || 'student';
    return this.notificationsService.markAllAsRead(userId, userType);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const userType = req.user.userType || 'student';
    return this.notificationsService.delete(id, userId, userType);
  }

  // Admin endpoint to create notifications (no auth for now, can add admin guard later)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() createDto: any) {
    return this.notificationsService.create(createDto);
  }
}

