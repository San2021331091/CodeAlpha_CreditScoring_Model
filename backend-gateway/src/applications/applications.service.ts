import { Injectable, NotFoundException } from '@nestjs/common';
import { CreditScoringService } from '../credit-scoring/credit-scoring.service';
import { CreateApplicationDto, UpdateStatusDto,Status } from './dto/create-application.dto';

export enum DecisionType{
  AUTOMATED = 'AUTOMATED',  MANUAL_OVERRIDE = 'MANUAL_OVERRIDE'
}
export interface CreditApplication {
  id: string;
  reference_no: string;
  applicant_name: string;
  email: string;
  employment_title: string;
  loan_amount_requested: number;
  loan_purpose: string;
  credit_score: number;
  risk_tier: string;
  default_probability: number;
  status: Status;
  decision_type: DecisionType ;
  scoring_result: any;
  applicant_data: any;
  reviewer_notes?: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class ApplicationsService {
  private applications: CreditApplication[] = [];

  constructor(private readonly creditScoringService: CreditScoringService) {
  }

  async create(dto: CreateApplicationDto): Promise<CreditApplication> {
    const scoringResult = await this.creditScoringService.predict(dto.applicant_data);
    
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const id = `app_${Date.now()}`;
    const referenceNo = `CRE-2026-${randomSeq}`;

    let initialStatus: Status;
    if (scoringResult.credit_score >= 750) {
      initialStatus = Status.Approved;
    } else if (scoringResult.credit_score >= 670) {
      initialStatus = Status.Approved;
    } else if (scoringResult.credit_score >= 580) {
      initialStatus = Status.UnderReview;
    } else {
      initialStatus = Status.Declined;
    }

    const application: CreditApplication = {
      id,
      reference_no: referenceNo,
      applicant_name: dto.applicant_name,
      email: dto.email,
      employment_title: dto.employment_title,
      loan_amount_requested: dto.applicant_data.loan_amount_requested,
      loan_purpose: dto.applicant_data.loan_purpose,
      credit_score: scoringResult.credit_score,
      risk_tier: scoringResult.risk_tier,
      default_probability: scoringResult.default_probability,
      status: initialStatus,
      decision_type: DecisionType.AUTOMATED,
      scoring_result: scoringResult,
      applicant_data: dto.applicant_data,
      reviewer_notes: dto.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.applications.unshift(application);
    return application;
  }

  findAll(query?: { search?: string; tier?: string; status?: string }): CreditApplication[] {
    let result = [...this.applications];

    if (query?.search) {
      const term = query.search.toLowerCase();
      result = result.filter(a => 
        a.applicant_name.toLowerCase().includes(term) ||
        a.reference_no.toLowerCase().includes(term) ||
        a.email.toLowerCase().includes(term)
      );
    }

    if (query?.tier && query.tier !== 'ALL') {
      result = result.filter(a => a.risk_tier.toLowerCase() === query.tier.toLowerCase());
    }

    if (query?.status && query.status !== 'ALL') {
      result = result.filter(a => a.status.toLowerCase() === query.status.toLowerCase());
    }

    return result;
  }

  findOne(id: string): CreditApplication {
    const app = this.applications.find(a => a.id === id);
    if (!app) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return app;
  }

  updateStatus(id: string, dto: UpdateStatusDto): CreditApplication {
    const app = this.findOne(id);
    app.status = dto.status;
    app.decision_type = DecisionType.MANUAL_OVERRIDE;
    if (dto.reviewer_notes) {
      app.reviewer_notes = dto.reviewer_notes;
    }
    app.updated_at = new Date().toISOString();
    return app;
  }

  delete(id: string): { success: boolean } {
    const initialLen = this.applications.length;
    this.applications = this.applications.filter(a => a.id !== id);
    if (this.applications.length === initialLen) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return { success: true };
  }
}
