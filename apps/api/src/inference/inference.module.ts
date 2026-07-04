import { Module } from '@nestjs/common';
import { InferenceController } from './inference.controller';
import { InferenceService } from './inference.service';
import { RuleEngineService } from './rule-engine.service';
import { LlmInterpreterService } from './llm-interpreter.service';
import { ProfileModule } from '../profile/profile.module';
import { PracticeModule } from '../practice/practice.module';
import { BillingModule } from '../billing/billing.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [ProfileModule, PracticeModule, BillingModule, KnowledgeModule],
  controllers: [InferenceController],
  providers: [InferenceService, RuleEngineService, LlmInterpreterService],
  exports: [InferenceService],
})
export class InferenceModule {}
