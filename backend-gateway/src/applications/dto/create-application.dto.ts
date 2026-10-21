import { IsString, IsEmail, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ScoreApplicantDto } from '../../credit-scoring/dto/score-applicant.dto';

export enum Status {
  Approved = 'Approved',
  Declined = 'Declined',
  UnderReview = 'Under Review',
  ConditionalApproval = 'Conditional Approval'
}

export class CreateApplicationDto {
  @IsString()
  applicant_name: string;

  @IsEmail()
  email: string;

  @IsString()
  employment_title: string;

  @ValidateNested()
  @Type(() => ScoreApplicantDto)
  applicant_data: ScoreApplicantDto;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateStatusDto {
  @IsString()
  status: Status;

  @IsOptional()
  @IsString()
  reviewer_notes?: string;
}

