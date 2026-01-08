import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject('DATABASE_POOL') private pool: Pool,
  ) {}

  async login(applicationId: string) {
    const result = await this.pool.query(
      'SELECT * FROM students WHERE "applicationId" = $1',
      [applicationId],
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedException('Student not found with this Application ID');
    }

    const student = result.rows[0];

    const payload = {
      id: student.id,
      applicationId: student.applicationId,
      email: student.email,
      // userType: 'student',
      userType: student.userType,
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

