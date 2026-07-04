import { Controller, Get, Post, Body, Query, Req, BadRequestException } from '@nestjs/common';
import { PushService } from './push.service';
import type { AuthedRequest } from '../auth/optional-auth.middleware';

@Controller('push')
export class PushController {
  constructor(private readonly push: PushService) {}

  @Post('subscribe')
  subscribe(
    @Body() body: { profile_id: string; push_hour?: number },
    @Req() req: AuthedRequest,
  ) {
    if (!body.profile_id) throw new BadRequestException('profile_id required');
    return this.push.subscribe(body.profile_id, req.user?.id, body.push_hour ?? 8);
  }

  @Post('unsubscribe')
  unsubscribe(@Body() body: { profile_id: string }) {
    return this.push.unsubscribe(body.profile_id);
  }

  @Get('subscriptions')
  list(@Req() req: AuthedRequest) {
    return this.push.listSubscriptions(req.user?.id);
  }

  @Get('daily')
  daily(@Query('profile_id') profileId: string, @Query('date') date?: string) {
    if (!profileId) throw new BadRequestException('profile_id required');
    return this.push.getDailyFortune(profileId, date);
  }

  @Get('inbox')
  inbox(@Query('profile_id') profileId: string, @Query('limit') limit?: string) {
    if (!profileId) throw new BadRequestException('profile_id required');
    return this.push.getInbox(profileId, limit ? parseInt(limit, 10) : 7);
  }

  @Post('run-daily')
  runDaily() {
    return this.push.runDailyPushAll();
  }
}
