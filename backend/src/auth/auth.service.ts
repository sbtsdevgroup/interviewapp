import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { WinstonLoggerService } from 'src/common/logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject('DATABASE_POOL') private pool: Pool,
    private logger: WinstonLoggerService,
  ) {}

  async login(applicationId: string) {
    const startTime = Date.now();
    try {
      this.logger.logAuth('student_login_attempt', true, undefined, applicationId);

      const result = await this.pool.query(
        'SELECT * FROM students WHERE "applicationId" = $1',
        [applicationId],
      );
      const duration = Date.now() - startTime;

      if (result.rows.length === 0) {
        this.logger.logAuth('student_login_failed', false, undefined, applicationId);
        this.logger.logDatabase('SELECT', 'students', duration, false, 'Student not found');
        throw new UnauthorizedException('Student not found with this Application ID');
      }

      this.logger.logDatabase('SELECT', 'students', duration, true);

      const student = result.rows[0];

      const payload = {
        id: student.id,
        applicationId: student.applicationId,
        email: student.email,
        userType: 'student',
      };

      const token = this.jwtService.sign(payload);

      this.logger.logAuth('student_login_success', true, student.id, applicationId);
      this.logger.logBusinessEvent('student_authenticated', {
        userId: student.id,
        userType: 'student',
      }, student.id);

      return {
        token,
        student: {
          id: student.id,
          applicationId: student.applicationId,
          email: student.email,
          fullName: student.fullName,
          registrationNumber: student.registrationNumber,
        },
      };
    } catch (error) {
      if (!(error instanceof UnauthorizedException)) {
        this.logger.error(`Error during student login: ${applicationId}`, error.stack, 'AuthService');
      }
      throw error;
    }
  }

  async adminLogin(email: string) {
    const startTime = Date.now();
    try {
      this.logger.logAuth('admin_login_attempt', true, undefined, email);

      const result = await this.pool.query(
        'SELECT * FROM admins WHERE "email" = $1',
        [email],
      );
      const duration = Date.now() - startTime;

      if (result.rows.length === 0) {
        this.logger.logAuth('admin_login_failed', false, undefined, email);
        this.logger.logDatabase('SELECT', 'admins', duration, false, 'Admin not found');
        throw new UnauthorizedException('Admin not found with this email');
      }

      this.logger.logDatabase('SELECT', 'admins', duration, true);

      const admin = result.rows[0];

      const payload = {
        id: admin.id,
        email: admin.email,
        userType: 'admin',
      };

      const token = this.jwtService.sign(payload);

      this.logger.logAuth('admin_login_success', true, admin.id, email);
      this.logger.logBusinessEvent('admin_authenticated', {
        userId: admin.id,
        userType: 'admin',
      }, admin.id);

      return {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          userType: admin.userType,
        },
      };
    } catch (error) {
      if (!(error instanceof UnauthorizedException)) {
        this.logger.error(`Error during admin login: ${email}`, error.stack, 'AuthService');
      }
      throw error;
    }
  }
}

