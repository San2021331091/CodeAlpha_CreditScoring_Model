import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScoreApplicantDto, WhatIfDto } from './dto/score-applicant.dto';

@Injectable()
export class CreditScoringService {
  private readonly logger = new Logger(CreditScoringService.name);
  private readonly mlServiceUrl: string;

  constructor(configService: ConfigService) {
    this.mlServiceUrl = configService.get<string>(
      'ML_SERVICE_URL'
    );
  }

  predict(dto: ScoreApplicantDto): Promise<any> {
    return this.requestMlService('/api/ml/predict', dto);
  }

  whatIf(dto: WhatIfDto): Promise<any> {
    return this.requestMlService('/api/ml/what-if', dto);
  }

  getMetrics(): Promise<any> {
    return this.requestMlService('/api/ml/metrics');
  }

  private async requestMlService(path: string, body?: unknown): Promise<any> {
    try {
      const response = await fetch(`${this.mlServiceUrl}${path}`, {
        method: body === undefined ? 'GET' : 'POST',
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

      if (!response.ok) {
        const details = await response.text();
        this.logger.error(
          `ML service request ${path} failed (${response.status}): ${details}`,
        );
        throw new ServiceUnavailableException(
          `ML service request failed (${response.status}).`,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      this.logger.error(
        `Could not reach ML service at ${this.mlServiceUrl}${path}.`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new ServiceUnavailableException(
        'The ML service is unavailable. Start the service and try again.',
      );
    }
  }
}
