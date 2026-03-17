import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SourceApiService } from './source-api.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SourceApiService],
  exports: [SourceApiService],
})
export class SourceApiModule {}
