import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CreditScoringModule } from './credit-scoring/credit-scoring.module';
import { ApplicationsModule } from './applications/applications.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CreditScoringModule,
    ApplicationsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}

