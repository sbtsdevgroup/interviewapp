import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request['user'];
    console.log(user);

    if (!user) {
      throw new ForbiddenException('Access denied: not authenticated');
    }

    if (user.userType !== 'admin') {
      throw new ForbiddenException('Access denied: admin only');
    }

    return true;
  }
}
