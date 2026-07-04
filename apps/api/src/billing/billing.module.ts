import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreditsMiddleware } from './credits.middleware';
import { BillingController } from './billing.controller';

@Module({
  controllers: [BillingController],
  providers: [BillingService, CreditsMiddleware],
  exports: [BillingService],
})
export class BillingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CreditsMiddleware)
      .forRoutes('destiny_infer', 'hexagram_cast', 'billing/balance');
  }
}
