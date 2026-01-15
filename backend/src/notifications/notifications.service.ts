import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateNotificationDto } from './dto/notification.dto';
import { WinstonLoggerService } from 'src/common/logger/logger.service';

// export class CreateNotificationDto {
//   userId: string;
//   userType: 'student' | 'admin';
//   title: string;
//   message: string;
//   type?: string;
//   relatedEntityType?: string;
//   relatedEntityId?: string;
// }

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    private readonly logger: WinstonLoggerService,
  ) {}

  async create(createDto: CreateNotificationDto) {
    const startTime = Date.now();
    try {
      const {
        userId,
        userType,
        title,
        message,
        type = 'info',
        relatedEntityType,
        relatedEntityId,
      } = createDto;

      this.logger.logBusinessEvent('notification_created', {
        userId,
        userType,
        type,
        title,
      }, userId);

      const result = await this.pool.query(
        `INSERT INTO notifications ("userId", "userType", title, message, type, "relatedEntityType", "relatedEntityId")
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [userId, userType, title, message, type, relatedEntityType || null, relatedEntityId || null]
      );
      const duration = Date.now() - startTime;

      this.logger.logDatabase('INSERT', 'notifications', duration, true);

      const notification = result.rows[0];
      this.logger.logBusinessEvent('notification_sent', {
        notificationId: notification.id,
        userId,
        userType,
        type,
      }, userId);

      return notification;
    } catch (error) {
      this.logger.error(`Error creating notification for user ${createDto.userId}`, error.stack, 'NotificationsService');
      throw error;
    }
  }

  async findAll(userId: string, userType: 'student' | 'admin', unreadOnly: boolean = false) {
    let query = `SELECT * FROM notifications 
                 WHERE "userId" = $1 AND "userType" = $2`;
    const params: any[] = [userId, userType];

    if (unreadOnly) {
      query += ` AND "isRead" = false`;
    }

    query += ` ORDER BY "createdAt" DESC`;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getUnreadCount(userId: string, userType: 'student' | 'admin') {
    const result = await this.pool.query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE "userId" = $1 AND "userType" = $2 AND "isRead" = false`,
      [userId, userType]
    );

    return parseInt(result.rows[0].count, 10);
  }

  async markAsRead(id: string, userId: string, userType: 'student' | 'admin') {
    const result = await this.pool.query(
      `UPDATE notifications 
       SET "isRead" = true, "updatedAt" = NOW()
       WHERE id = $1 AND "userId" = $2 AND "userType" = $3
       RETURNING *`,
      [id, userId, userType]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Notification not found');
    }

    return result.rows[0];
  }

  async markAllAsRead(userId: string, userType: 'student' | 'admin') {
    const result = await this.pool.query(
      `UPDATE notifications 
       SET "isRead" = true, "updatedAt" = NOW()
       WHERE "userId" = $1 AND "userType" = $2 AND "isRead" = false
       RETURNING *`,
      [userId, userType]
    );

    return result.rows;
  }

  async delete(id: string, userId: string, userType: 'student' | 'admin') {
    const result = await this.pool.query(
      `DELETE FROM notifications 
       WHERE id = $1 AND "userId" = $2 AND "userType" = $3
       RETURNING *`,
      [id, userId, userType]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Notification not found');
    }

    return result.rows[0];
  }
}

