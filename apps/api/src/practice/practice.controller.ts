import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import type { PracticeRecommendRequest, PracticeCheckIn, PracticeStart21Day } from '@cyberdestiny/shared';
import { PracticeService } from './practice.service';

@Controller('practice')
export class PracticeController {
  constructor(private readonly practice: PracticeService) {}

  @Post('recommend')
  recommend(@Body() body: PracticeRecommendRequest) {
    return this.practice.recommend(body);
  }

  @Get('plans/:id')
  getPlan(@Param('id') id: string) {
    return this.practice.getPlan(id);
  }

  @Post('check-in')
  checkIn(@Body() body: PracticeCheckIn) {
    return this.practice.checkIn(body);
  }

  @Post('start-21day')
  start21Day(@Body() body: PracticeStart21Day) {
    return this.practice.start21Day(body);
  }

  @Get('monthly-report/:profileId')
  monthlyReport(@Param('profileId') profileId: string) {
    return this.practice.monthlyReport(profileId);
  }
}
