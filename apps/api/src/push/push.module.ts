import { Module } from '@nestjs/common';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { ProfileModule } from '../profile/profile.module';
import { InferenceModule } from '../inference/inference.module';

@Module({
  imports: [ProfileModule, InferenceModule],
  controllers: [PushController],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
