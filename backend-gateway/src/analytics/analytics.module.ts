import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ApplicationsModule } from '../applications/applications.module';
import { CreditScoringModule } from '../credit-scoring/credit-scoring.module';

@Module({
  imports: [ApplicationsModule, CreditScoringModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

