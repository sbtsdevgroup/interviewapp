import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  status: string;
  message: string;
  data?: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse();
    const status = response.statusCode >= 400 ? 'error' : 'success';

    return next.handle().pipe(
      map((data) => {
        const isPaginated = data && data.meta && data.data;
        return {
          status,
          message: data?.message || 'Request successful',
          data: isPaginated ? data.data : (data?.data || (data?.message ? (Object.keys(data).length > 1 ? data : undefined) : data)),
          meta: isPaginated ? data.meta : undefined,
        };
      }),
    );
  }
}
