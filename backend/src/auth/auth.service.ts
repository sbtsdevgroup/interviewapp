import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { SourceApiService } from '../source-api/source-api.service';
import * as bcrypt from 'bcryptjs';
import { Database } from 'better-sqlite3';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private sourceApiService: SourceApiService,
    @Inject('AI_DATABASE') private db: Database,
  ) {}

  async adminLogin(email: string, password?: string) {
    const admin = this.db.prepare('SELECT * FROM ai_admins WHERE email = ?').get(email) as any;
    if (!admin) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const isPasswordValid = await bcrypt.compare(password || '', admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const payload = {
      id: admin.id,
      email: admin.email,
      userType: 'admin',
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: admin.id,
        email: admin.email,
        userType: 'admin',
      },
    };
  }

  async login(applicationId: string, password?: string) {
    const result = await this.sourceApiService.verifyStudent(applicationId, password);

    if (result.status !== 'success' || !result.data.user) {
      throw new UnauthorizedException('Student not found or invalid credentials');
    }

    const { user, application } = result.data;

    const payload = {
      id: user.id,
      applicationId: application?.applicationId || user.registrationNumber,
      email: user.email,
      userType: 'student',
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      student: {
        id: user.id,
        applicationId: application?.applicationId || user.registrationNumber,
        email: user.email,
        fullName: user.fullName,
        registrationNumber: user.registrationNumber,
      },
    };
  }
}

