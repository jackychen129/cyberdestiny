import { Module } from '@nestjs/common';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { WorldContextService } from './world-context.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [KnowledgeController],
  providers: [KnowledgeService, WorldContextService],
  exports: [KnowledgeService, WorldContextService],
})
export class KnowledgeModule {}
