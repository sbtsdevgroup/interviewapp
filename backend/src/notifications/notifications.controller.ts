import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Get notifications for the logged-in user' })
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

  @ApiOperation({ summary: 'Get unread notification count' })
  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const userId = req.user.id;
    const userType = req.user.userType || 'student';
    return { count: await this.notificationsService.getUnreadCount(userId, userType) };
  }

  @ApiOperation({ summary: 'Mark a notification as read' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const userType = req.user.userType || 'student';
    return this.notificationsService.markAsRead(id, userId, userType);
  }

  @ApiOperation({ summary: 'Mark all notifications as read' })
  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    const userId = req.user.id;
    const userType = req.user.userType || 'student';
    return this.notificationsService.markAllAsRead(userId, userType);
  }

  @ApiOperation({ summary: 'Delete a notification' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const userType = req.user.userType || 'student';
    return this.notificationsService.delete(id, userId, userType);
  }

  // Admin endpoint to create notifications (no auth for now, can add admin guard later)
  @ApiOperation({ summary: 'Create a notification (Admin)' })
  @Post()
  async create(@Body() createDto: CreateNotificationDto) {
    return this.notificationsService.create(createDto);
  }
}
