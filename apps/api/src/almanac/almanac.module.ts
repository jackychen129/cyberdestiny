import { Module } from '@nestjs/common';
import { AlmanacController } from './almanac.controller';

@Module({
  controllers: [AlmanacController],
})
export class AlmanacModule {}
