import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('admin/login')
  async adminLogin(@Body() body: { email: string; password?: string }) {
    if (!body.email || !body.password) {
      throw new UnauthorizedException('Email and password are required');
    }
    const result = await this.authService.adminLogin(body.email, body.password);
    return {
      message: 'Admin login successful',
      data: result,
    };
  }
}
