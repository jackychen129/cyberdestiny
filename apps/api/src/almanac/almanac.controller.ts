import { Controller, Get, Query } from '@nestjs/common';
import { computeAlmanac } from '@cyberdestiny/chart-engine';

@Controller('almanac')
export class AlmanacController {
  @Get('daily')
  daily(@Query('date') date?: string) {
    const d = date ? new Date(date) : new Date();
    if (Number.isNaN(d.getTime())) {
      return { error: '无效日期' };
    }
    return computeAlmanac(d);
  }
}
