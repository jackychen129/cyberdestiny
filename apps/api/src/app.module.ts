import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ProfileModule } from './profile/profile.module';
import { InferenceModule } from './inference/inference.module';
import { CasesModule } from './cases/cases.module';
import { PushModule } from './push/push.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { PracticeModule } from './practice/practice.module';
import { BillingModule } from './billing/billing.module';
import { AlmanacModule } from './almanac/almanac.module';
import { ExportModule } from './export/export.module';
import { AuthModule } from './auth/auth.module';
import { OptionalAuthMiddleware } from './auth/optional-auth.middleware';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    ProfileModule,
    InferenceModule,
    KnowledgeModule,
    PracticeModule,
    BillingModule,
    AlmanacModule,
    ExportModule,
    CasesModule,
    PushModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OptionalAuthMiddleware).forRoutes('*');
  }
}
