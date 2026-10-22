"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { PredictorForm, ApplicantFormData } from "@/components/PredictorForm";
import { ScoreResultCard } from "@/components/ScoreResultCard";
import { ExplainabilityView } from "@/components/ExplainabilityView";
import { WhatIfSandbox } from "@/components/WhatIfSandbox";
import { ModelAnalyticsLab } from "@/components/ModelAnalyticsLab";
import { ApplicationsManager } from "@/components/ApplicationsManager";
import { AlertCircle } from "lucide-react";

const NEST_API_BASE = process.env.NEXT_PUBLIC_API_URL;

const Home:React.FC =():React.JSX.Element=> {
  const [activeTab, setActiveTab] = useState<string>("calculator");
  const [loading, setLoading] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ApplicantFormData>({
    age: 0,
    annual_income: 0,
    monthly_expenses: 0,
    total_debt: 0,
    savings_balance: 0,
    credit_history_years: 0,
    open_credit_lines: 0,
    credit_utilization_ratio: 0,
    missed_payments_last_2yrs: 0,
    num_derogatory_records: 0,
    hard_inquiries_last_6m: 0,
    loan_amount_requested: 0,
    loan_term_months: 12,
    employment_years: 0,
    home_ownership: "",
    loan_purpose: "",
    model_type: "Random Forest",
  });

  const [scoringResult, setScoringResult] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);

  // Load live data on mount
  useEffect(() => {
    fetchMetrics();
    fetchApplications();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${NEST_API_BASE}/api/credit/metrics`);
      if (!res.ok) {
        throw new Error(`Metrics request failed (${res.status}).`);
      }
      setMetricsData(await res.json());
    } catch (error) {
      console.error("Unable to load model metrics.", error);
      setMetricsError("Model metrics are unavailable. Check that the ML service is running.");
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${NEST_API_BASE}/api/applications`);
      if (!res.ok) {
        throw new Error(`Applications request failed (${res.status}).`);
      }
      setApplications(await res.json());
    } catch (error) {
      console.error("Unable to load applications.", error);
      setRequestError("Applications could not be loaded. Check that the API service is running.");
    }
  };

  const handleFieldChange = (field: keyof ApplicantFormData, value: any) => {
    setScoringResult(null);
    setRequestError(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const runScoreEvaluation = async (dataToScore: ApplicantFormData = formData) => {
    setLoading(true);
    setRequestError(null);
    setScoringResult(null);
    if (
      dataToScore.age < 18 ||
      dataToScore.annual_income < 1000 ||
      dataToScore.monthly_expenses < 100 ||
      dataToScore.credit_history_years < 0.1 ||
      dataToScore.loan_amount_requested < 500 ||
      !dataToScore.home_ownership ||
      !dataToScore.loan_purpose
    ) {
      setRequestError("Enter valid applicant, income, credit history, and loan details before running an assessment.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${NEST_API_BASE}/api/credit/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToScore),
      });
      if (!res.ok) {
        const response = await res.json().catch(() => null);
        throw new Error(response?.message || response?.detail || `Assessment failed (${res.status}).`);
      }
      setScoringResult(await res.json());
    } catch (error) {
      console.error("Credit assessment failed.", error);
      setRequestError(error instanceof Error ? error.message : "We couldn't connect to the credit assessment service.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatIfSimulate = async (scenario: any) => {
    try {
      const res = await fetch(`${NEST_API_BASE}/api/credit/what-if`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicant: formData,
          scenario,
        }),
      });
      if (!res.ok) {
        const response = await res.json().catch(() => null);
        throw new Error(response?.message || response?.detail || `Scenario request failed (${res.status}).`);
      }
      return await res.json();
    } catch {
      throw new Error("Scenario simulation failed. Check that the scoring service is running.");
    }
  };

  const handleSaveApplication = async (details: { name: string; email: string; title: string; notes: string }) => {
    try {
      const res = await fetch(`${NEST_API_BASE}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicant_name: details.name,
          email: details.email,
          employment_title: details.title,
          applicant_data: formData,
          notes: details.notes,
        }),
      });
      if (!res.ok) {
        const response = await res.json().catch(() => null);
        throw new Error(response?.message || response?.detail || `Application save failed (${res.status}).`);
      }
      const newApp = await res.json();
      setApplications((prev) => [newApp, ...prev]);
    } catch (error) {
      console.error("Unable to save application.", error);
      setRequestError(error instanceof Error ? error.message : "Unable to save application.");
      throw error;
    }
  };

  const handleUpdateStatus = async (id: string, status: string, notes?: string) => {
    try {
      const res = await fetch(`${NEST_API_BASE}/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewer_notes: notes }),
      });
      if (!res.ok) {
        const response = await res.json().catch(() => null);
        throw new Error(response?.message || `Status update failed (${res.status}).`);
      }
      const updatedApp = await res.json();
      setApplications((prev) => prev.map((app) => app.id === id ? updatedApp : app));
    } catch (error) {
      console.error("Unable to update application status.", error);
      setRequestError(error instanceof Error ? error.message : "Unable to update application status.");
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1020] text-slate-100">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/55 p-6 shadow-2xl shadow-black/10 sm:p-8 md:flex-row md:items-center">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-indigo-500/[0.08] blur-3xl" />
          <div className="z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-300">
                Credit risk intelligence
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Make confident credit decisions
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              Assess applicants with explainable scoring, clear risk signals, and practical scenario analysis.
            </p>
          </div>

          <div className="z-10 flex shrink-0 gap-3">
            <div className="min-w-32 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-500">Model ROC-AUC</span>
              <span className="mt-1 block text-lg font-semibold text-emerald-300">
                {metricsData?.models?.[metricsData?.best_model]?.roc_auc != null
                  ? `${(metricsData.models[metricsData.best_model].roc_auc * 100).toFixed(1)}%`
                  : "Unavailable"}
              </span>
            </div>
            <div className="min-w-32 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-500">Score range</span>
              <span className="mt-1 block text-lg font-semibold text-indigo-300">300–850</span>
            </div>
          </div>
        </div>

        {requestError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
            <p>{requestError}</p>
          </div>
        )}

        {/* Tab 1: Underwriting Calculator */}
        {activeTab === "calculator" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form & Inputs */}
              <div className="lg:col-span-7">
                <PredictorForm
                  formData={formData}
                  onChange={handleFieldChange}
                  onRunExample={(example) => {
                    setFormData(example);
                    void runScoreEvaluation(example);
                  }}
                  onSubmit={() => runScoreEvaluation()}
                  loading={loading}
                />
              </div>

              {/* Right Column: Score Result Card */}
              <div className="lg:col-span-5">
                <ScoreResultCard result={scoringResult} />
              </div>
            </div>

            {/* Explainability Section */}
            {scoringResult && (
              <ExplainabilityView
                explainability={scoringResult.explainability}
                onSaveApplication={handleSaveApplication}
              />
            )}
          </div>
        )}

        {/* Tab 2: What-If Sandbox */}
        {activeTab === "what-if" && (
          <WhatIfSandbox
            currentApplicant={formData}
            currentResult={scoringResult}
            onSimulate={handleWhatIfSimulate}
          />
        )}

        {/* Tab 3: Model Analytics Lab */}
        {activeTab === "analytics" && (
          <>
            {metricsError && <p role="alert" className="text-sm text-rose-300">{metricsError}</p>}
            <ModelAnalyticsLab metricsData={metricsData} />
          </>
        )}

        {/* Tab 4: Applications Portfolio */}
        {activeTab === "applications" && (
          <ApplicationsManager
            applications={applications}
            onUpdateStatus={handleUpdateStatus}
            onRefresh={fetchApplications}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-slate-800/70 bg-slate-950/50 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p className="font-medium text-slate-400">CreditAlpha <span className="text-slate-600">·</span> Developed by <span className="text-indigo-400 font-semibold">Santosh Saha</span></p>
          <div className="flex items-center gap-2 text-slate-500">
            <span>Supervised ML Model</span>
            <span aria-hidden="true">·</span>
            <span>Credit Scoring Model</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
