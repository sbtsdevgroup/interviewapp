import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';
import { CreateNotificationDto } from './dto/notification.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get notifications for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
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
  @ApiOperation({ summary: 'Get count of unread notifications for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Unread notifications count retrieved successfully' })
  async getUnreadCount(@Request() req) {
    const userId = req.user.id;
    const userType = req.user.userType || 'student';
    return { count: await this.notificationsService.getUnreadCount(userId, userType) };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read successfully' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const userType = req.user.userType || 'student';
    return this.notificationsService.markAsRead(id, userId, userType);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for the authenticated user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read successfully' })
  async markAllAsRead(@Request() req) {
    const userId = req.user.id;
    const userType = req.user.userType || 'student';
    return this.notificationsService.markAllAsRead(userId, userType);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  async delete(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const userType = req.user.userType || 'student';
    return this.notificationsService.delete(id, userId, userType);
  }

  // Admin endpoint to create notifications (no auth for now, can add admin guard later)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new notification (admin only)' })
  @ApiBody({ type: CreateNotificationDto, description: 'Notification data to be created' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  async create(@Body() createDto: any) {
    return this.notificationsService.create(createDto);
  }
}

