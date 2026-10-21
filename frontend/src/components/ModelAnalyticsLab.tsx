"use client";

import React, { useState } from "react";
import { BrainCircuit, Trophy, Target, BarChart3, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ModelAnalyticsLabProps {
  metricsData: any;
}

export const ModelAnalyticsLab: React.FC<ModelAnalyticsLabProps> = ({ metricsData }): React.JSX.Element => {
  const models = metricsData?.models || {};
  const [selectedModel, setSelectedModel] = useState<string>("");
  const initialModel = models[selectedModel]
    ? selectedModel
    : models[metricsData?.best_model]
      ? metricsData.best_model
      : Object.keys(models)[0];
  const activeMetrics = models[initialModel];
  const cm = activeMetrics?.confusion_matrix;
  const topFeatures = activeMetrics?.top_features || {};

  if (!activeMetrics) {
    return (
      <Card className="glass-panel rounded-2xl border-slate-800 p-8 text-center">
        <Database className="mx-auto mb-3 h-7 w-7 text-slate-500" />
        <h3 className="text-base font-semibold text-slate-200">Model metrics unavailable</h3>
        <p className="mt-2 text-sm text-slate-400">
          Start the ML service and train the models to view benchmark results.
        </p>
      </Card>
    );
  }

  return (
    <Card className="glass-panel rounded-2xl p-6 border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              Model Performance & Benchmark Evaluation Lab
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Rigorous cross-model validation tracking Accuracy, Precision, Recall, F1-Score, and ROC-AUC.
          </p>
        </div>

        {/* Dataset Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Training Dataset</span>
            <span className="text-xs font-bold text-slate-200">
              {(metricsData.dataset_summary?.total_records ?? [
                metricsData.training_samples,
                metricsData.validation_samples,
                metricsData.test_samples,
              ].reduce((total: number, count: number) => total + (count || 0), 0)).toLocaleString()} Records
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Default Rate</span>
            <span className="text-xs font-bold text-amber-400">
              {metricsData.dataset_summary?.default_rate != null
                ? `${(metricsData.dataset_summary.default_rate * 100).toFixed(1)}%`
                : "Unavailable"}
            </span>
          </div>
        </div>
      </div>

      {/* Model Benchmark Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(models).map(([name, m]: [string, any]) => {
          const isSelected = initialModel === name;
          return (
            <Button
              key={name}
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setSelectedModel(name)}
              className={`h-auto min-h-full w-full flex-col items-stretch justify-start rounded-xl p-4 text-left transition-all ${
                isSelected
                  ? "bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-500/15"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-white">{name}</span>
                {name === metricsData.best_model && (
                  <Badge variant="outline" className="gap-1 border-emerald-500/40 bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                    <Trophy className="w-2.5 h-2.5" /> Best ROC
                  </Badge>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">ROC-AUC:</span>
                  <span className="font-bold text-indigo-400">{((m.roc_auc || 0) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Accuracy:</span>
                  <span className="font-semibold text-slate-200">{((m.accuracy || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Recall:</span>
                  <span className="font-semibold text-emerald-400">{((m.recall || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">F1-Score:</span>
                  <span className="font-semibold text-sky-400">{(m.f1_score || 0).toFixed(3)}</span>
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Deep-Dive Analysis for Selected Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Confusion Matrix */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-400" />
              Confusion Matrix: {initialModel}
            </h4>
            <span className="text-[11px] text-slate-400">
              Test Split: {(metricsData.test_samples || 0).toLocaleString()} Cases
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-center">
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                True Negatives (TN)
              </span>
              <span className="text-2xl font-black text-white">{cm.true_negative}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Correct Non-Default</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-center">
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
                False Positives (FP)
              </span>
              <span className="text-2xl font-black text-amber-300">{cm.false_positive}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Type I Error</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30 text-center">
              <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block">
                False Negatives (FN)
              </span>
              <span className="text-2xl font-black text-rose-400">{cm.false_negative}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Type II (Credit Risk)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-center">
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
                True Positives (TP)
              </span>
              <span className="text-2xl font-black text-indigo-300">{cm.true_positive}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Correct Default Detected</p>
            </div>
          </div>
        </div>

        {/* Top Feature Importance Horizontal Bars */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Feature Importance Ranking
            </h4>
            <span className="text-[11px] text-slate-400">Gini / Relative Weight</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(topFeatures).slice(0, 6).map(([feat, score]: [string, any]) => {
              const pct = Math.min(100, Math.round(Number(score) * 250));
              const prettyName = feat
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());

              return (
                <div key={feat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 truncate max-w-[220px]">{prettyName}</span>
                    <span className="text-indigo-400 font-mono font-medium">{(Number(score)).toFixed(3)}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
