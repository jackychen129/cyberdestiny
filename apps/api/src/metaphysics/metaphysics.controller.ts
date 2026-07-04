import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MetaphysicsService } from './metaphysics.service';

@Controller('metaphysics')
export class MetaphysicsController {
  constructor(private readonly metaphysics: MetaphysicsService) {}

  @Get('shensha')
  shensha(@Query('profile_id') profileId?: string) {
    return this.metaphysics.shensha(profileId);
  }

  @Post('shensha')
  shenshaPost(@Body() body: Record<string, unknown>) {
    return this.metaphysics.shensha(undefined, body);
  }

  @Get('almanac/enhanced')
  enhancedAlmanac(@Query('date') date?: string) {
    return this.metaphysics.enhancedAlmanac(date);
  }

  @Post('zeri')
  zeri(@Body() body: { start_date: string; end_date: string; activity: 'marriage' | 'travel' | 'business' | 'moving' | 'general' }) {
    return this.metaphysics.zeri(body);
  }

  @Post('meihua')
  meihua(@Body() body: { method?: 'number' | 'time'; numbers?: number[]; as_of?: string }) {
    return this.metaphysics.meihua(body);
  }

  @Get('qimen')
  qimen(@Query('datetime') datetime?: string) {
    return this.metaphysics.qimen(datetime);
  }

  @Get('liuren')
  liuren(@Query('datetime') datetime?: string) {
    return this.metaphysics.liuren(datetime);
  }

  @Post('xiaoliuren')
  xiaoliuren(@Body() body: { month?: number; day?: number; hour?: number; question?: string }) {
    return this.metaphysics.xiaoliuren(body);
  }

  @Get('ziwei')
  ziwei(@Query('profile_id') profileId?: string) {
    return this.metaphysics.ziwei(profileId);
  }

  @Post('ziwei')
  ziweiPost(@Body() body: Record<string, unknown>) {
    return this.metaphysics.ziwei(undefined, body);
  }

  @Get('bazi-ziwei-cross')
  baziZiweiCross(@Query('profile_id') profileId?: string) {
    return this.metaphysics.baziZiweiCross(profileId);
  }

  @Post('bazi-ziwei-cross')
  baziZiweiCrossPost(@Body() body: Record<string, unknown>) {
    return this.metaphysics.baziZiweiCross(undefined, body);
  }
}
