"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { ApplicantFormData } from "./PredictorForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface WhatIfSandboxProps {
  currentApplicant: ApplicantFormData;
  currentResult: any;
  onSimulate: (scenario: {
    debt_reduction: number;
    income_increase: number;
    utilization_target?: number;
    savings_increase: number;
  }) => Promise<any>;
}

export const WhatIfSandbox: React.FC<WhatIfSandboxProps> = ({
  currentApplicant,
  currentResult,
  onSimulate,
}): React.JSX.Element => {
  const [debtReduction, setDebtReduction] = useState<number>(0);
  const [incomeIncrease, setIncomeIncrease] = useState<number>(0);
  const [targetUtilization, setTargetUtilization] = useState<number>(
    Math.min(0.8, Math.max(0.05, currentApplicant.credit_utilization_ratio)),
  );
  const [savingsIncrease, setSavingsIncrease] = useState<number>(0);
  const [simulatedData, setSimulatedData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await onSimulate({
        debt_reduction: debtReduction,
        income_increase: incomeIncrease,
        utilization_target: targetUtilization,
        savings_increase: savingsIncrease,
      });
      setSimulatedData(res);
    } catch (simulationError) {
      setError(simulationError instanceof Error ? simulationError.message : "Scenario simulation failed.");
    } finally {
      setLoading(false);
    }
  };

  const origScore = currentResult?.credit_score;
  const simScore = simulatedData?.simulated?.credit_score;
  const scoreDelta = simScore - origScore;

  const origTier = currentResult?.risk_tier;
  const simTier = simulatedData?.simulated?.risk_tier;

  const origRate = currentResult?.recommended_interest_rate_pct;
  const simRate = simulatedData?.simulated?.recommended_interest_rate_pct;

  return (
    <Card className="glass-panel rounded-2xl p-6 border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            What-If Scenario Sandbox
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulate real-time debt payoffs, salary increases, or utilization targets to preview credit score trajectories.
          </p>
        </div>

        <Button
          onClick={handleRunSimulation}
          disabled={loading || !currentResult}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-sky-400"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Recalculating...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Simulate Scenario
            </>
          )}
        </Button>
      </div>
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}

      {/* Comparison View Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Baseline Profile */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Current Baseline
            </span>
            <Badge variant="outline" className="rounded-full border-slate-700 bg-slate-800 text-slate-300">
              {origTier || "No assessment"}
            </Badge>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-white">{origScore ?? "—"}</span>
            <span className="text-xs text-slate-400">Model score</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Existing Debt</span>
              <span className="font-semibold text-rose-400">${currentApplicant.total_debt.toLocaleString()}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Utilization</span>
              <span className="font-semibold text-slate-200">{(currentApplicant.credit_utilization_ratio * 100).toFixed(0)}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Annual Income</span>
              <span className="font-semibold text-emerald-400">${currentApplicant.annual_income.toLocaleString()}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Interest Rate APR</span>
              <span className="font-semibold text-sky-400">{origRate != null ? `${origRate.toFixed(2)}%` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Simulated Projected Profile */}
        {simulatedData ? (
        <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-950/30 via-slate-900/80 to-sky-950/30 border border-indigo-500/40 shadow-lg shadow-indigo-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Simulated Future State
            </span>
            <Badge variant="outline" className="rounded-full border-emerald-500/40 bg-emerald-500/20 text-emerald-300">
              {simTier}
            </Badge>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-emerald-400">{simScore}</span>
            <Badge variant="outline" className="rounded-full border-emerald-500/30 bg-emerald-500/20 font-bold text-emerald-300">
              {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} Points
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Projected Debt</span>
              <span className="font-semibold text-white">
                ${Math.max(0, currentApplicant.total_debt - debtReduction).toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Target Utilization</span>
              <span className="font-semibold text-emerald-400">{(targetUtilization * 100).toFixed(0)}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Projected Income</span>
              <span className="font-semibold text-emerald-400">
                ${(currentApplicant.annual_income + incomeIncrease).toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">New Interest APR</span>
              <span className="font-semibold text-emerald-400">{simRate != null ? `${simRate.toFixed(2)}%` : "—"}</span>
            </div>
          </div>
        </div>
          ) : (
            <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
              {currentResult ? "Run a scenario to see model-generated projections." : "Run a credit assessment before simulating scenarios."}
            </div>
            )}
        </div>

      {/* Scenario Adjustment Sliders */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Adjust Hypothetical Parameters
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Pay Off Outstanding Debt</span>
              <span className="font-semibold text-indigo-400">${debtReduction.toLocaleString()}</span>
            </div>
            <Slider
              min={0}
              max={Math.max(10000, currentApplicant.total_debt)}
              step={1000}
              value={[debtReduction]}
              onValueChange={([value]) => setDebtReduction(value)}
              className="[&_[data-slot=slider-track]]:bg-slate-800 [&_[data-slot=slider-range]]:bg-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Salary / Income Increase</span>
              <span className="font-semibold text-emerald-400">+${incomeIncrease.toLocaleString()} / yr</span>
            </div>
            <Slider
              min={0}
              max={50000}
              step={2000}
              value={[incomeIncrease]}
              onValueChange={([value]) => setIncomeIncrease(value)}
              className="[&_[data-slot=slider-track]]:bg-slate-800 [&_[data-slot=slider-range]]:bg-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Target Credit Card Utilization</span>
              <span className="font-semibold text-sky-400">{(targetUtilization * 100).toFixed(0)}%</span>
            </div>
            <Slider
              min={0.05}
              max={0.8}
              step={0.05}
              value={[targetUtilization]}
              onValueChange={([value]) => setTargetUtilization(value)}
              className="[&_[data-slot=slider-track]]:bg-slate-800 [&_[data-slot=slider-range]]:bg-sky-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Add to Liquid Emergency Reserve</span>
              <span className="font-semibold text-purple-400">+${savingsIncrease.toLocaleString()}</span>
            </div>
            <Slider
              min={0}
              max={30000}
              step={1000}
              value={[savingsIncrease]}
              onValueChange={([value]) => setSavingsIncrease(value)}
              className="[&_[data-slot=slider-track]]:bg-slate-800 [&_[data-slot=slider-range]]:bg-purple-500"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
