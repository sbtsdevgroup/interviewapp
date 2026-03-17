import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SourceApiService } from '../source-api/source-api.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private sourceApiService: SourceApiService,
  ) {}

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

