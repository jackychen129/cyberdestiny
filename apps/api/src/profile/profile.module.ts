import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfilePairService } from './profile-pair.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ProfilePairService],
  exports: [ProfileService, ProfilePairService],
})
export class ProfileModule {}
