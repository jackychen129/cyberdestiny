import { Module } from '@nestjs/common';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { ProfileModule } from '../profile/profile.module';
import { InferenceModule } from '../inference/inference.module';

@Module({
  imports: [ProfileModule, InferenceModule],
  controllers: [CasesController],
  providers: [CasesService],
})
export class CasesModule {}
