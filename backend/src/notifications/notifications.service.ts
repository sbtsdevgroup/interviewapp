import { Injectable, Inject, NotFoundException } from '@nestjs/common';
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
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async create(createDto: CreateNotificationDto) {
    const {
      userId,
      title,
      message,
      type = 'OTHER',
    } = createDto;

    // Map common types to enum values if possible
    let notificationType = type.toUpperCase();
    const validTypes = ['ASSIGNMENT_DUE', 'COURSE_EVALUATION', 'COURSE_UPDATE', 'GRADE_POSTED', 'OTHER', 'SYSTEM_ALERT'];
    if (!validTypes.includes(notificationType)) {
      notificationType = 'OTHER';
    }

    const id = randomUUID();

    const result = await this.pool.query(
      `INSERT INTO "Notification" (id, "userId", title, message, type, "isRead", "createdAt")
       VALUES ($1, $2, $3, $4, $5, false, NOW())
       RETURNING *`,
      [id, userId, title, message, notificationType]
    );

    return result.rows[0];
  }

  async findAll(userId: string, userType: string, unreadOnly: boolean = false) {
    let query = `SELECT * FROM "Notification" 
                 WHERE "userId" = $1`;
    const params: any[] = [userId];

    if (unreadOnly) {
      query += ` AND "isRead" = false`;
    }

    query += ` ORDER BY "createdAt" DESC`;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getUnreadCount(userId: string, userType: string) {
    const result = await this.pool.query(
      `SELECT COUNT(*) as count FROM "Notification" 
       WHERE "userId" = $1 AND "isRead" = false`,
      [userId]
    );

    return parseInt(result.rows[0].count, 10);
  }

  async markAsRead(id: string, userId: string, userType: string) {
    const result = await this.pool.query(
      `UPDATE "Notification" 
       SET "isRead" = true, "readAt" = NOW()
       WHERE id = $1 AND "userId" = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Notification not found');
    }

    return result.rows[0];
  }

  async markAllAsRead(userId: string, userType: string) {
    const result = await this.pool.query(
      `UPDATE "Notification" 
       SET "isRead" = true, "readAt" = NOW()
       WHERE "userId" = $1 AND "isRead" = false
       RETURNING *`,
      [userId]
    );

    return result.rows;
  }

  async delete(id: string, userId: string, userType: string) {
    const result = await this.pool.query(
      `DELETE FROM "Notification" 
       WHERE id = $1 AND "userId" = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Notification not found');
    }

    return result.rows[0];
  }
}

