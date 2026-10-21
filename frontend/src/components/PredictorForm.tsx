"use client";
import React from "react";
import { RefreshCw, SlidersHorizontal, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export interface ApplicantFormData {
  age: number;
  annual_income: number;
  monthly_expenses: number;
  total_debt: number;
  savings_balance: number;
  credit_history_years: number;
  open_credit_lines: number;
  credit_utilization_ratio: number;
  missed_payments_last_2yrs: number;
  num_derogatory_records: number;
  hard_inquiries_last_6m: number;
  loan_amount_requested: number;
  loan_term_months: number;
  employment_years: number;
  home_ownership: string;
  loan_purpose: string;
  model_type: string;
}

interface PredictorFormProps {
  formData: ApplicantFormData;
  onChange: (field: keyof ApplicantFormData, value: any) => void;
  onRunExample: (example: ApplicantFormData) => void;
  onSubmit: () => void;
  loading: boolean;
}

const exampleProfiles: Array<{
  label: string;
  description: string;
  data: ApplicantFormData;
}> = [
  {
    label: "Random Forest",
    description: "Established credit, low utilization",
    data: {
      age: 42,
      annual_income: 88000,
      monthly_expenses: 3600,
      total_debt: 21000,
      savings_balance: 18000,
      credit_history_years: 12,
      open_credit_lines: 7,
      credit_utilization_ratio: 0.18,
      missed_payments_last_2yrs: 0,
      num_derogatory_records: 0,
      hard_inquiries_last_6m: 1,
      loan_amount_requested: 24000,
      loan_term_months: 36,
      employment_years: 8,
      home_ownership: "MORTGAGE",
      loan_purpose: "HOME_IMPROVEMENT",
      model_type: "Random Forest",
    },
  },
  {
    label: "Gradient Boosting",
    description: "Moderate debt and utilization",
    data: {
      age: 34,
      annual_income: 56000,
      monthly_expenses: 2900,
      total_debt: 26500,
      savings_balance: 6500,
      credit_history_years: 6,
      open_credit_lines: 5,
      credit_utilization_ratio: 0.44,
      missed_payments_last_2yrs: 1,
      num_derogatory_records: 0,
      hard_inquiries_last_6m: 3,
      loan_amount_requested: 18000,
      loan_term_months: 48,
      employment_years: 3.5,
      home_ownership: "RENT",
      loan_purpose: "DEBT_CONSOLIDATION",
      model_type: "Gradient Boosting",
    },
  },
  {
    label: "Logistic Regression",
    description: "Shorter credit history, higher utilization",
    data: {
      age: 29,
      annual_income: 39000,
      monthly_expenses: 2500,
      total_debt: 19000,
      savings_balance: 2600,
      credit_history_years: 4,
      open_credit_lines: 3,
      credit_utilization_ratio: 0.67,
      missed_payments_last_2yrs: 2,
      num_derogatory_records: 0,
      hard_inquiries_last_6m: 4,
      loan_amount_requested: 9000,
      loan_term_months: 36,
      employment_years: 1.5,
      home_ownership: "RENT",
      loan_purpose: "MEDICAL",
      model_type: "Logistic Regression",
    },
  },
  {
    label: "Decision Tree",
    description: "High debt and recent payment issues",
    data: {
      age: 51,
      annual_income: 112000,
      monthly_expenses: 5100,
      total_debt: 78000,
      savings_balance: 24000,
      credit_history_years: 22,
      open_credit_lines: 10,
      credit_utilization_ratio: 0.82,
      missed_payments_last_2yrs: 3,
      num_derogatory_records: 1,
      hard_inquiries_last_6m: 2,
      loan_amount_requested: 42000,
      loan_term_months: 60,
      employment_years: 11,
      home_ownership: "OWN",
      loan_purpose: "BUSINESS",
      model_type: "Decision Tree",
    },
  },
];

export const PredictorForm: React.FC<PredictorFormProps> = ({
  formData,
  onChange,
  onRunExample,
  onSubmit,
  loading,
}) : React.JSX.Element => {
  return (
    <Card className="glass-panel rounded-2xl p-6 border-slate-800 shadow-xl space-y-6">
      {/* Header & Presets */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              Applicant Financial Parameters
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter the applicant's financial, credit, and loan details to request a model assessment.
            </p>
          </div>

          {/* Model Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">ML Model:</span>
            <Select
              value={formData.model_type}
              onValueChange={(value) => onChange("model_type", value)}
            >
              <SelectTrigger className="w-[230px] border-slate-700 bg-slate-900 text-xs text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Random Forest">Random Forest (Ensemble)</SelectItem>
                <SelectItem value="Gradient Boosting">Gradient Boosting</SelectItem>
                <SelectItem value="Logistic Regression">Logistic Regression</SelectItem>
                <SelectItem value="Decision Tree">Decision Tree</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>

      <section
        aria-labelledby="example-profiles-heading"
        className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
      >
        <div className="mb-3">
          <h4 id="example-profiles-heading" className="text-sm font-semibold text-slate-200">
            Try an example
          </h4>
          <p className="mt-1 text-xs text-slate-400">
            Synthetic test inputs only. Each runs a prediction with its selected model and is not saved to the portfolio.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {exampleProfiles.map((example) => (
            <Button
              key={example.label}
              type="button"
              variant="outline"
              size="lg"
              disabled={loading}
              onClick={() => onRunExample(example.data)}
              className="h-auto justify-between gap-3 rounded-lg border-slate-800 bg-slate-900/80 px-3 py-2.5 text-left hover:border-indigo-400/40 hover:bg-slate-800/80"
            >
              <span>
                <span className="block text-xs font-semibold text-slate-200">{example.label}</span>
                <span className="mt-0.5 block text-[11px] text-slate-400">{example.description}</span>
              </span>
              <span className="shrink-0 text-[11px] font-medium text-indigo-300">Run example</span>
            </Button>
          ))}
        </div>
      </section>

      <div className="h-[1px] bg-slate-800/60" />
      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Section 1: Financial Capacity */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            1. Income & Liquidity
          </h4>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Annual Income</span>
              <span className="font-semibold text-emerald-400">${formData.annual_income.toLocaleString()}</span>
            </div>
            <Slider
              min={1000}
              max={250000}
              step={1000}
              value={[formData.annual_income]}
              onValueChange={([value]) => onChange("annual_income", value)}
              className="[&_[data-slot=slider-track]]:bg-slate-800 [&_[data-slot=slider-range]]:bg-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Monthly Expenses</span>
              <span className="font-semibold text-slate-300">${formData.monthly_expenses.toLocaleString()}</span>
            </div>
            <Slider
              min={100}
              max={15000}
              step={100}
              value={[formData.monthly_expenses]}
              onValueChange={([value]) => onChange("monthly_expenses", value)}
              className="[&_[data-slot=slider-track]]:bg-slate-800 [&_[data-slot=slider-range]]:bg-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Total Existing Debt</span>
              <span className="font-semibold text-rose-400">${formData.total_debt.toLocaleString()}</span>
            </div>
            <Slider
              min={0}
              max={200000}
              step={1000}
              value={[formData.total_debt]}
              onValueChange={([value]) => onChange("total_debt", value)}
              className="[&_[data-slot=slider-track]]:bg-slate-800 [&_[data-slot=slider-range]]:bg-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Liquid Savings Balance</span>
              <span className="font-semibold text-emerald-400">${formData.savings_balance.toLocaleString()}</span>
            </div>
            <Slider
              min={0}
              max={150000}
              step={500}
              value={[formData.savings_balance]}
              onValueChange={([value]) => onChange("savings_balance", value)}
              className="[&_[data-slot=slider-track]]:bg-slate-800 [&_[data-slot=slider-range]]:bg-indigo-500"
            />
          </div>
        </div>

        {/* Section 2: Credit Bureau Track Record */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
            2. Credit Bureau Profile
          </h4>
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Credit Utilization Ratio</span>
              <span className={`font-semibold ${formData.credit_utilization_ratio > 0.5 ? "text-rose-400" : "text-emerald-400"}`}>
                {(formData.credit_utilization_ratio * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              min={0.01}
              max={1.0}
              step={0.01}
              value={[formData.credit_utilization_ratio]}
              onValueChange={([value]) => onChange("credit_utilization_ratio", value)}
              className="[&_[data-slot=slider-track]]:bg-slate-800 [&_[data-slot=slider-range]]:bg-sky-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Credit History (Yrs)</label>
              <Input
                type="number"
                min="0.5"
                max="50"
                step="0.5"
                value={formData.credit_history_years}
                onChange={(e) => onChange("credit_history_years", Number(e.target.value))}
                className="h-8 border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Open Lines</label>
              <Input
                type="number"
                min="1"
                max="30"
                value={formData.open_credit_lines}
                onChange={(e) => onChange("open_credit_lines", Number(e.target.value))}
                className="h-8 border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Missed Payments (2y)</label>
              <Input
                type="number"
                min="0"
                max="15"
                value={formData.missed_payments_last_2yrs}
                onChange={(e) => onChange("missed_payments_last_2yrs", Number(e.target.value))}
                className="h-8 border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Hard Inquiries (6m)</label>
              <Input
                type="number"
                min="0"
                max="10"
                value={formData.hard_inquiries_last_6m}
                onChange={(e) => onChange("hard_inquiries_last_6m", Number(e.target.value))}
                className="h-8 border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Derogatory Public Records</label>
            <Input
              type="number"
              min="0"
              max="5"
              value={formData.num_derogatory_records}
              onChange={(e) => onChange("num_derogatory_records", Number(e.target.value))}
              className="h-8 border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
            />
          </div>
        </div>

        {/* Section 3: Loan Request & Demographics */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            3. Loan Terms & Employment
          </h4>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Loan Amount Requested</span>
              <span className="font-semibold text-indigo-400">${formData.loan_amount_requested.toLocaleString()}</span>
            </div>
            <Slider
              min={1000}
              max={75000}
              step={1000}
              value={[formData.loan_amount_requested]}
              onValueChange={([value]) => onChange("loan_amount_requested", value)}
              className="[&_[data-slot=slider-track]]:bg-slate-800 [&_[data-slot=slider-range]]:bg-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Loan Term</label>
              <Select
                value={String(formData.loan_term_months)}
                onValueChange={(value) => onChange("loan_term_months", Number(value))}
              >
                <SelectTrigger className="h-8 border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 Months (1 yr)</SelectItem>
                  <SelectItem value="24">24 Months (2 yrs)</SelectItem>
                  <SelectItem value="36">36 Months (3 yrs)</SelectItem>
                  <SelectItem value="48">48 Months (4 yrs)</SelectItem>
                  <SelectItem value="60">60 Months (5 yrs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Home Ownership</label>
              <Select
                value={formData.home_ownership}
                onValueChange={(value) => onChange("home_ownership", value)}
              >
                <SelectTrigger className="h-8 border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white">
                  <SelectValue placeholder="Select ownership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MORTGAGE">Mortgage</SelectItem>
                  <SelectItem value="RENT">Rent</SelectItem>
                  <SelectItem value="OWN">Own (Free & Clear)</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Applicant Age</label>
              <Input
                type="number"
                min="18"
                max="90"
                value={formData.age}
                onChange={(e) => onChange("age", Number(e.target.value))}
                className="h-8 border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Employment (Yrs)</label>
              <Input
                type="number"
                min="0"
                max="40"
                step="0.5"
                value={formData.employment_years}
                onChange={(e) => onChange("employment_years", Number(e.target.value))}
                className="h-8 border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Loan Purpose</label>
            <Select
              value={formData.loan_purpose}
              onValueChange={(value) => onChange("loan_purpose", value)}
            >
              <SelectTrigger className="h-8 border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white">
                <SelectValue placeholder="Select loan purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEBT_CONSOLIDATION">Debt Consolidation</SelectItem>
                <SelectItem value="HOME_IMPROVEMENT">Home Improvement</SelectItem>
                <SelectItem value="BUSINESS">Business Expansion</SelectItem>
                <SelectItem value="MAJOR_PURCHASE">Major Purchase</SelectItem>
                <SelectItem value="MEDICAL">Medical Emergency</SelectItem>
                <SelectItem value="EDUCATION">Education / Tuition</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Submit Trigger */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          size="lg"
          onClick={onSubmit}
          disabled={loading}
          className="h-auto rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Scoring Applicant...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              Run ML Scoring & Underwriting
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
