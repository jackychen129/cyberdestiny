import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      product: 'cyberdestiny-skill',
      api: process.env.API_PUBLIC_URL ?? 'http://localhost:3001',
      skill: 'SKILL.md',
    };
  }
}
