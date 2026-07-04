import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class HealthController {
  @Get()
  root(@Res() res: Response) {
    const webUrl = process.env.WEB_URL ?? 'http://localhost:3000';
    res.redirect(302, webUrl);
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'cyberdestiny-api', version: '0.1.0' };
  }
}
