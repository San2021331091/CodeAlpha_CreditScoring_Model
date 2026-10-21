"use client";

import React from "react";
import { ScoreGauge } from "./ScoreGauge";
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, DollarSign, Percent, Shield } from "lucide-react";
import { formatCurrency, formatPercent, getScoreTierColor } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface ScoreResultCardProps {
  result: any;
}

export const ScoreResultCard: React.FC<ScoreResultCardProps> = ({ result }) => {
  if (!result) {
    return (
      <Card className="glass-panel flex min-h-80 flex-col items-center justify-center rounded-2xl border-slate-800 p-8 text-center">
        <Shield className="mb-3 h-8 w-8 text-slate-600" />
        <h2 className="text-base font-semibold text-slate-200">Assessment pending</h2>
        <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
          Enter applicant details and run an assessment to see the model's score and decision.
        </p>
      </Card>
    );
  }

  const score = result.credit_score;
  const tier = result.risk_tier;
  const defaultProb = result.default_probability;
  const approvalStatus = result.approval_status;
  const maxLoan = result.max_loan_approved;
  const rate = result.recommended_interest_rate_pct;
  const fin = result.financial_summary;

  const tierStyle = getScoreTierColor(score);

  return (
    <Card className={`glass-panel rounded-2xl p-6 border ${tierStyle.border} ${tierStyle.glow} space-y-6 transition-all duration-300`}>
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${tierStyle.bg} border ${tierStyle.border}`}>
            {score >= 670 ? (
              <CheckCircle2 className={`w-6 h-6 ${tierStyle.text}`} />
            ) : score >= 580 ? (
              <AlertTriangle className={`w-6 h-6 ${tierStyle.text}`} />
            ) : (
              <XCircle className={`w-6 h-6 ${tierStyle.text}`} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Model Decision
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {result.model_used}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              {approvalStatus}
            </h2>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Recommended Rate (APR)</span>
          <span className="text-xl font-black text-sky-400">{rate.toFixed(2)}%</span>
        </div>
      </div>

      {/* Central Radial Score Gauge */}
      <ScoreGauge score={score} riskTier={tier} defaultProbability={defaultProb} />

      {/* Credit Capacity Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
            Max Loan Line
          </div>
          <span className="text-base font-bold text-white">
            {formatCurrency(maxLoan)}
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Percent className="w-3.5 h-3.5 text-sky-400" />
            Debt-to-Income
          </div>
          <span className={`text-base font-bold ${fin.debt_to_income_ratio > 0.45 ? "text-amber-400" : "text-emerald-400"}`}>
            {formatPercent(fin.debt_to_income_ratio)}
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Net Free Cashflow
          </div>
          <span className="text-base font-bold text-white">
            {formatCurrency(fin.disposable_monthly_cashflow)}/mo
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Payment Reliability
          </div>
          <span className="text-base font-bold text-emerald-400">
            {formatPercent(fin.payment_reliability_score)}
          </span>
        </div>
      </div>
    </Card>
  );
};
