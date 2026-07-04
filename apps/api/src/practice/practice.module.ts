import { Module } from '@nestjs/common';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { ProfileModule } from '../profile/profile.module';
import { RuleEngineService } from '../inference/rule-engine.service';

@Module({
  imports: [ProfileModule],
  controllers: [PracticeController],
  providers: [PracticeService, RuleEngineService],
  exports: [PracticeService],
})
export class PracticeModule {}
