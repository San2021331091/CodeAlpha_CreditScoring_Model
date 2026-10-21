"use client";
import React, { useState } from "react";
import { CheckCircle, AlertCircle, Lightbulb, FileText, Send, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


interface ExplainabilityProps {
  explainability: {
    positive_factors: Array<{ factor: string; impact: string; detail: string }>;
    risk_drivers: Array<{ factor: string; impact: string; detail: string }>;
    actionable_recommendations: string[];
  };
  onSaveApplication: (applicantDetails: { name: string; email: string; title: string; notes: string }) => Promise<void>;
}

export const ExplainabilityView: React.FC<ExplainabilityProps> = ({
  explainability,
  onSaveApplication,
}): React.JSX.Element => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await onSaveApplication({ name, email, title, notes });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setShowModal(false);
      }, 1500);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save application.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="glass-panel rounded-2xl p-6 border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            AI Decision Explainability & Risk Attribution
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Key factors influencing the machine learning model's creditworthiness prediction.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowModal(true)}
          className="rounded-xl border-indigo-500/40 bg-indigo-600/20 text-xs font-semibold text-indigo-300 shadow-sm hover:bg-indigo-600/30"
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          Save Application to Portfolio
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Factors */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Positive Score Drivers ({explainability.positive_factors?.length || 0})
          </h4>
          <div className="space-y-2">
            {explainability.positive_factors?.length > 0 ? (
              explainability.positive_factors.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-300">{item.factor}</span>
                    <Badge variant="outline" className="rounded-full border-transparent bg-emerald-500/20 text-[10px] font-medium text-emerald-300">
                      {item.impact}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{item.detail}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No significant positive attributes detected.</p>
            )}
          </div>
        </div>

        {/* Risk Drivers */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            Risk Drivers & Vulnerabilities ({explainability.risk_drivers?.length || 0})
          </h4>
          <div className="space-y-2">
            {explainability.risk_drivers?.length > 0 ? (
              explainability.risk_drivers.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-rose-300">{item.factor}</span>
                    <Badge variant="outline" className="rounded-full border-transparent bg-rose-500/20 text-[10px] font-medium text-rose-300">
                      {item.impact}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{item.detail}</p>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                Pristine record: No adverse derogatory marks or high credit exposure detected.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actionable Recommendations */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Actionable Recommendations to Elevate Score
        </h4>
        <ul className="space-y-2">
          {explainability.actionable_recommendations?.map((rec, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Save Application Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="glass-panel max-h-[90vh] overflow-y-auto border-slate-700 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
              <FileText className="w-5 h-5 text-indigo-400" />
              Save to Applications Portfolio
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Save this applicant's profile and assessment to the applications portfolio.
            </DialogDescription>
          </DialogHeader>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <Label htmlFor="applicant-name" className="mb-1 block text-xs text-slate-300">Applicant Full Name</Label>
                <Input
                  id="applicant-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-slate-700 bg-slate-900 text-xs text-white"
                />
              </div>

              <div>
                <Label htmlFor="applicant-email" className="mb-1 block text-xs text-slate-300">Email Address</Label>
                <Input
                  id="applicant-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-slate-700 bg-slate-900 text-xs text-white"
                />
              </div>

              <div>
                <Label htmlFor="applicant-title" className="mb-1 block text-xs text-slate-300">Employment Title</Label>
                <Input
                  id="applicant-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-slate-700 bg-slate-900 text-xs text-white"
                />
              </div>

              <div>
                <Label htmlFor="applicant-notes" className="mb-1 block text-xs text-slate-300">Underwriter Notes</Label>
                <Textarea
                  id="applicant-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-slate-700 bg-slate-900 text-xs text-white"
                />
              </div>

              {saveError && <p role="alert" className="text-xs text-rose-300">{saveError}</p>}

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving || savedSuccess}
                  className="bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" /> Saved!
                    </>
                  ) : saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
