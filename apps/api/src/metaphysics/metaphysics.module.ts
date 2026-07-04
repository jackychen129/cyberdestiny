import { Module } from '@nestjs/common';
import { ProfileModule } from '../profile/profile.module';
import { MetaphysicsController } from './metaphysics.controller';
import { MetaphysicsService } from './metaphysics.service';

@Module({
  imports: [ProfileModule],
  controllers: [MetaphysicsController],
  providers: [MetaphysicsService],
  exports: [MetaphysicsService],
})
export class MetaphysicsModule {}
