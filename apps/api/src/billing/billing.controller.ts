import { Controller, Get, Headers } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('balance')
  async balance(@Headers('x-api-key') apiKey?: string) {
    if (!apiKey) {
      return { credits_balance: this.billing.getDefaultBalance(), anonymous: true };
    }
    const result = await this.billing.getBalance(apiKey);
    return { ...result, anonymous: false };
  }
}
