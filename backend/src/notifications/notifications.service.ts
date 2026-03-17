import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SourceApiService } from '../source-api/source-api.service';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

export interface CreateNotificationDto {
  userId: string;
  userType?: 'student' | 'admin';
  title: string;
  message: string;
  type?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private sourceApiService: SourceApiService) {}

  async create(createDto: CreateNotificationDto) {
    const result = await this.sourceApiService.createNotification({
      userId: createDto.userId,
      title: createDto.title,
      message: createDto.message,
      type: createDto.type,
      userType: createDto.userType?.toUpperCase() || 'STUDENT',
    });
    return result.data;
  }

  async findAll(userId: string, userType: string, unreadOnly: boolean = false) {
    const result = await this.sourceApiService.getUserNotifications(userId, userType?.toUpperCase() || 'STUDENT');
    if (result.status !== 'success') return [];

    let notifications = result.data;
    if (unreadOnly) {
      notifications = notifications.filter((n: any) => !n.isRead);
    }
    return notifications;
  }

  async getUnreadCount(userId: string, userType: string) {
    const notifications = await this.findAll(userId, userType, true);
    return notifications.length;
  }

  async markAsRead(id: string, userId: string, userType: string) {
    const result = await this.sourceApiService.markNotificationAsRead(id, userId, userType?.toUpperCase() || 'STUDENT');
    return result;
  }

  async markAllAsRead(userId: string, userType: string) {
    // Note: Source service might need a markAllAsRead endpoint for efficiency.
    // For now we'll mark individual ones or leave as is if not critical.
    const notifications = await this.findAll(userId, userType, true);
    const promises = notifications.map((n: any) => this.markAsRead(n.id, userId, userType));
    return Promise.all(promises);
  }

  async delete(id: string, userId: string, userType: string) {
    const result = await this.sourceApiService.deleteNotification(id, userId, userType?.toUpperCase() || 'STUDENT');
    return result;
  }
}

