import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject('DATABASE_POOL') private pool: Pool,
  ) {}

  async login(applicationId: string, password?: string) {
    const result = await this.pool.query(
      `SELECT 
        a.id, 
        a."applicationId", 
        u.email, 
        u."fullName", 
        u."registrationNumber", 
        u.password 
      FROM applications a 
      JOIN "user" u ON a."UserId" = u.id 
      WHERE a."applicationId" = $1`,
      [applicationId],
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedException('Student not found with this Application ID');
    }

    const student = result.rows[0];

    // Verify password if provided (some students might not have passwords set)
    if (password && student.password) {
      const isValidPassword = await bcrypt.compare(password, student.password);
      if (!isValidPassword) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    const payload = {
      id: student.id,
      applicationId: student.applicationId,
      email: student.email,
      userType: 'student',
    };

    const token = this.jwtService.sign(payload);

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
  }
}

