import { Controller, Post, Get, Body } from '@nestjs/common';
import { CreditScoringService } from './credit-scoring.service';
import { ScoreApplicantDto, WhatIfDto } from './dto/score-applicant.dto';

@Controller('api/credit')
export class CreditScoringController {
  constructor(private readonly creditScoringService: CreditScoringService) {}

  @Post('score')
  async scoreApplicant(@Body() dto: ScoreApplicantDto) {
    return this.creditScoringService.predict(dto);
  }

  @Post('what-if')
  async whatIfSimulation(@Body() dto: WhatIfDto) {
    return this.creditScoringService.whatIf(dto);
  }

  @Get('metrics')
  async getModelMetrics() {
    return this.creditScoringService.getMetrics();
  }
}
