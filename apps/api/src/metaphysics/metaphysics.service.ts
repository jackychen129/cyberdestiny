import { Injectable, BadRequestException } from '@nestjs/common';
import {
  computeBaziChart,
  computeShenSha,
  computeEnhancedAlmanac,
  computeZeri,
  meihuaByNumbers,
  meihuaByTime,
  computeQimen,
  computeLiuren,
  computeXiaoLiuren,
  computeZiweiChart,
  crossValidateBaziZiwei,
  resolveLongitude,
} from '@cyberdestiny/chart-engine';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class MetaphysicsService {
  constructor(private readonly profileService: ProfileService) {}

  async resolveChartInput(profileId?: string, body?: Record<string, unknown>) {
    if (profileId) {
      const profile = await this.profileService.findOne(profileId);
      const row = await this.profileService.findRow(profileId);
      return {
        datetime: profile.birth_datetime,
        longitude: resolveLongitude(profile.birth_place, row.longitude),
        birth_place: profile.birth_place,
        hour_known: profile.birth_hour_known,
        gender: profile.gender as 'male' | 'female' | 'unknown',
      };
    }
    if (!body?.birth_datetime || typeof body.birth_datetime !== 'string') {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: '需要 profile_id 或 birth_datetime' });
    }
    return {
      datetime: body.birth_datetime,
      longitude: typeof body.longitude === 'number' ? body.longitude : undefined,
      birth_place: typeof body.birth_place === 'string' ? body.birth_place : undefined,
      hour_known: body.hour_known !== false,
      gender: (body.gender as 'male' | 'female' | 'unknown') ?? 'unknown',
    };
  }

  async shensha(profileId?: string, body?: Record<string, unknown>) {
    const input = await this.resolveChartInput(profileId, body);
    const chart = computeBaziChart(input);
    return { chart: { day: chart.day, year: chart.year, month: chart.month, hour: chart.hour }, shensha: computeShenSha(chart) };
  }

  enhancedAlmanac(date?: string) {
    const d = date ? new Date(date) : new Date();
    if (Number.isNaN(d.getTime())) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: '无效日期' });
    return computeEnhancedAlmanac(d);
  }

  zeri(body: { start_date: string; end_date: string; activity: 'marriage' | 'travel' | 'business' | 'moving' | 'general' }) {
    return computeZeri(body);
  }

  meihua(body: { method?: 'number' | 'time'; numbers?: number[]; as_of?: string }) {
    if (body.method === 'number' || body.numbers?.length) {
      const nums = body.numbers ?? [1, 1, 1];
      return meihuaByNumbers(nums[0]!, nums[1]!, nums[2]);
    }
    const asOf = body.as_of ? new Date(body.as_of) : new Date();
    return meihuaByTime(asOf);
  }

  qimen(datetime?: string) {
    return computeQimen(datetime ?? new Date().toISOString());
  }

  liuren(datetime?: string) {
    return computeLiuren(datetime ?? new Date().toISOString());
  }

  xiaoliuren(body: { month?: number; day?: number; hour?: number; question?: string }) {
    const now = new Date();
    return computeXiaoLiuren(
      body.month ?? now.getMonth() + 1,
      body.day ?? now.getDate(),
      body.hour ?? now.getHours(),
      body.question,
    );
  }

  async ziwei(profileId?: string, body?: Record<string, unknown>) {
    const input = await this.resolveChartInput(profileId, body);
    return computeZiweiChart(input);
  }

  async baziZiweiCross(profileId?: string, body?: Record<string, unknown>) {
    const input = await this.resolveChartInput(profileId, body);
    return crossValidateBaziZiwei(input);
  }
}
