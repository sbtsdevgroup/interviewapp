import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { AdminLoginDto } from './dto/admin-login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Administrator login using SQLite credentials' })
  @Public()
  @Post('admin/login')
  async adminLogin(@Body() body: AdminLoginDto) {
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
