import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiInterviewService } from './ai-interview.service';
import { AiDatabaseModule } from '../database/ai-database.module';

@Module({
  imports: [AiDatabaseModule],
  controllers: [AiController],
  providers: [AiInterviewService],
  exports: [AiInterviewService],
})
export class AiModule {}

