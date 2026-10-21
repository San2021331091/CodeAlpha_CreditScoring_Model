import { Injectable } from '@nestjs/common';
import { ApplicationsService } from '../applications/applications.service';
import { CreditScoringService } from '../credit-scoring/credit-scoring.service';

const RISK_TIERS = [
  { name: 'Excellent', range: '750-850', color: '#10b981' },
  { name: 'Good', range: '670-749', color: '#3b82f6' },
  { name: 'Fair', range: '580-669', color: '#f59e0b' },
  { name: 'Poor', range: '300-579', color: '#ef4444' },
];

const STATUSES = ['Approved', 'Under Review', 'Declined', 'Conditional Approval'];

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly creditScoringService: CreditScoringService,
  ) {}

  async getDashboardSummary() {
    const applications = this.applicationsService.findAll();
    const totalApplications = applications.length;
    const approved = applications.filter((app) => app.status === 'Approved');
    const tierDistribution = RISK_TIERS.map(({ name, range, color }) => {
      const count = applications.filter((app) => app.risk_tier === name).length;
      return {
        tier: `${name} (${range})`,
        count,
        percentage: totalApplications
          ? Number(((count / totalApplications) * 100).toFixed(1))
          : 0,
        color,
      };
    });

    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthApplications = applications.filter((app) =>
        app.created_at.startsWith(key),
      );
      const monthApproved = monthApplications.filter(
        (app) => app.status === 'Approved',
      );
      return {
        month: date.toLocaleString('en-US', { month: 'short' }),
        volume: monthApplications.reduce(
          (sum, app) => sum + app.loan_amount_requested,
          0,
        ),
        approved: monthApproved.length,
        avgScore: monthApplications.length
          ? Math.round(
              monthApplications.reduce((sum, app) => sum + app.credit_score, 0) /
                monthApplications.length,
            )
          : 0,
      };
    });

    const totalRequested = applications.reduce(
      (sum, app) => sum + app.loan_amount_requested,
      0,
    );
    const averageDefaultProbability = totalApplications
      ? applications.reduce((sum, app) => sum + app.default_probability, 0) /
        totalApplications
      : 0;

    return {
      kpis: {
        total_applications: totalApplications,
        approval_rate_pct: totalApplications
          ? Number(((approved.length / totalApplications) * 100).toFixed(1))
          : 0,
        average_credit_score: totalApplications
          ? Math.round(
              applications.reduce((sum, app) => sum + app.credit_score, 0) /
                totalApplications,
            )
          : 0,
        total_volume_requested_usd: totalRequested,
        total_volume_approved_usd: approved.reduce(
          (sum, app) => sum + app.loan_amount_requested,
          0,
        ),
        average_default_probability: Number(
          averageDefaultProbability.toFixed(4),
        ),
      },
      tier_distribution: tierDistribution,
      status_distribution: STATUSES.map((status) => ({
        status,
        count: applications.filter((app) => app.status === status).length,
      })),
      monthly_trends: months,
      model_benchmark: await this.creditScoringService.getMetrics(),
    };
  }
}
