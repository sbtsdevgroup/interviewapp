import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'student-portal-secret-key-change-in-production-2024',
    });
  }

  async validate(payload: any) {
    return { 
      id: payload.id, 
      applicationId: payload.applicationId, 
      email: payload.email,
      userType: payload.userType || 'student' // Default to student if not specified
    };
  }
}

