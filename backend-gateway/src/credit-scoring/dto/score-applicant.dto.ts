import {
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScoreApplicantDto {
  @IsNumber()
  @Min(18)
  @Max(95)
  age: number = 35;

  @IsNumber()
  @Min(1000)
  annual_income: number = 65000;

  @IsNumber()
  @Min(100)
  monthly_expenses: number = 2200;

  @IsNumber()
  @Min(0)
  total_debt: number = 15000;

  @IsNumber()
  @Min(0)
  savings_balance: number = 12000;

  @IsNumber()
  @Min(0.1)
  @Max(60)
  credit_history_years: number = 8.0;

  @IsNumber()
  @Min(0)
  @Max(50)
  open_credit_lines: number = 5;

  @IsNumber()
  @Min(0)
  @Max(1)
  credit_utilization_ratio: number = 0.28;

  @IsNumber()
  @Min(0)
  @Max(30)
  missed_payments_last_2yrs: number = 0;

  @IsNumber()
  @Min(0)
  @Max(10)
  num_derogatory_records: number = 0;

  @IsNumber()
  @Min(0)
  @Max(20)
  hard_inquiries_last_6m: number = 1;

  @IsNumber()
  @Min(500)
  loan_amount_requested: number = 20000;

  @IsNumber()
  @Min(6)
  @Max(120)
  loan_term_months: number = 36;

  @IsNumber()
  @Min(0)
  @Max(50)
  employment_years: number = 5.0;

  @IsString()
  home_ownership: string = 'MORTGAGE';

  @IsString()
  loan_purpose: string = 'DEBT_CONSOLIDATION';

  @IsOptional()
  @IsString()
  model_type?: string = 'Random Forest';
}

export class ScenarioDeltaDto {
  @IsOptional()
  @IsNumber()
  debt_reduction?: number;

  @IsOptional()
  @IsNumber()
  income_increase?: number;

  @IsOptional()
  @IsNumber()
  utilization_target?: number;

  @IsOptional()
  @IsNumber()
  savings_increase?: number;
}

export class WhatIfDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => ScoreApplicantDto)
  applicant: ScoreApplicantDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => ScenarioDeltaDto)
  scenario: ScenarioDeltaDto;
}
