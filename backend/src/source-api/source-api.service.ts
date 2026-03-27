import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class SourceApiService {
  private readonly logger = new Logger(SourceApiService.name);
  private readonly axiosInstance: AxiosInstance;

  constructor(private configService: ConfigService) {
    const baseURL = this.configService.get<string>('SOURCE_API_URL') || 'http://localhost:3002/api';
    const apiKey = this.configService.get<string>('INTERNAL_API_KEY') || 'student-portal-internal-key-2024';

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': apiKey,
      },
    });
  }

  async verifyStudent(applicationId: string, password?: string) {
    try {
      const response = await this.axiosInstance.post('/internal-portal/verify-student', {
        applicationId,
        password,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to verify student: ${error.message}`, error.response?.data);
      throw error;
    }
  }

  async getStudentMetadata(applicationId: string) {
    try {
      const response = await this.axiosInstance.get(`/internal-portal/student-metadata/${applicationId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch student metadata: ${error.message}`, error.response?.data);
      throw error;
    }
  }

  async updateApplication(id: string, data: any) {
    try {
      const response = await this.axiosInstance.patch(`/internal-portal/update-application/${id}`, data);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update application ${id}: ${error.message}`, error.response?.data);
      throw error;
    }
  }

  async getUserNotifications(userId: string, role?: string) {
    try {
      const response = await this.axiosInstance.get(`/internal-portal/notifications/${userId}`, {
        params: { role },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch notifications for user ${userId}: ${error.message}`, error.response?.data);
      throw error;
    }
  }

  async markNotificationAsRead(id: string, userId: string, role?: string) {
    try {
      const response = await this.axiosInstance.patch(`/internal-portal/notifications/${id}/read`, {
        userId,
        role,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to mark notification ${id} as read: ${error.message}`, error.response?.data);
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: string, role?: string) {
    try {
      const response = await this.axiosInstance.patch('/internal-portal/notifications/read-all', {
        userId,
        role,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to mark all notifications as read for user ${userId}: ${error.message}`, error.response?.data);
      throw error;
    }
  }

  async deleteNotification(id: string, userId: string, role?: string) {
    try {
      const response = await this.axiosInstance.delete(`/internal-portal/notifications/${id}`, {
        data: { userId, role },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to delete notification ${id}: ${error.message}`, error.response?.data);
      throw error;
    }
  }


  async createNotification(data: { userId: string; title: string; message: string; type?: string; userType?: string; role?: string; relatedEntityType?: string; relatedEntityId?: string }) {
    try {
      // The external service expects uppercase 'role' (STUDENT, ADMIN)
      // and valid 'NotificationType' enum values.
      const validTypes = ['COURSE_UPDATE', 'ASSIGNMENT_DUE', 'GRADE_POSTED', 'SYSTEM_ALERT', 'COURSE_EVALUATION', 'OTHER'];
      const type = data.type?.toUpperCase();
      
      const payload = {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: validTypes.includes(type) ? type : 'SYSTEM_ALERT',
        userType: (data.role || data.userType || 'STUDENT').toUpperCase(),
      };

      const response = await this.axiosInstance.post('/internal-portal/notifications', payload);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create notification for user ${data.userId}: ${error.message}`, error.response?.data);
      throw error;
    }
  }

  async findAllApplications(options: any) {
    try {
      const response = await this.axiosInstance.get('/internal-portal/applications', { params: options });
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to find all applications: ${error.message}`, error.response?.data);
      throw error;
    }
  }

  async getDashboardStats() {
    try {
      const response = await this.axiosInstance.get('/internal-portal/stats');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch dashboard stats: ${error.message}`, error.response?.data);
      throw error;
    }
  }

  async getAnalytics() {
    try {
      const response = await this.axiosInstance.get('/internal-portal/analytics');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch analytics: ${error.message}`, error.response?.data);
      throw error;
    }
  }
}
