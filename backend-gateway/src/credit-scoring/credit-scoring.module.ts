import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CreditScoringController } from './credit-scoring.controller';
import { CreditScoringService } from './credit-scoring.service';

@Module({
  imports: [ConfigModule],
  controllers: [CreditScoringController],
  providers: [CreditScoringService],
  exports: [CreditScoringService],
})
export class CreditScoringModule {}

