"use client";

import React, { useState } from "react";
import { Search, Eye, Check, X, Clock, Download, UserCheck } from "lucide-react";
import { formatCurrency, getScoreTierColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ApplicationItem {
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
  status: "Approved" | "Declined" | "Under Review" | "Conditional Approval";
  decision_type: "AUTOMATED" | "MANUAL_OVERRIDE";
  reviewer_notes?: string;
  created_at: string;
  applicant_data?: any;
}

interface ApplicationsManagerProps {
  applications: ApplicationItem[];
  onUpdateStatus: (id: string, status: string, notes?: string) => Promise<void>;
  onRefresh: () => void;
}

export const ApplicationsManager: React.FC<ApplicationsManagerProps> = ({
  applications,
  onUpdateStatus,
  onRefresh,
}): React.JSX.Element => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [activeModalApp, setActiveModalApp] = useState<ApplicationItem | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.reference_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = selectedTier === "ALL" || app.risk_tier.toLowerCase() === selectedTier.toLowerCase();
    const matchesStatus = selectedStatus === "ALL" || app.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesTier && matchesStatus;
  });

  const handleStatusChange = async (newStatus: string) => {
    if (!activeModalApp) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      await onUpdateStatus(activeModalApp.id, newStatus, reviewerNotes);
      setActiveModalApp((prev) => (prev ? { ...prev, status: newStatus as any, reviewer_notes: reviewerNotes } : null));
      onRefresh();
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : "Unable to update application status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Reference", "Name", "Email", "Score", "Tier", "Loan Amount", "Status", "Date"];
    const rows = filtered.map((a) => [
      a.reference_no,
      `"${a.applicant_name}"`,
      a.email,
      a.credit_score,
      a.risk_tier,
      a.loan_amount_requested,
      a.status,
      a.created_at,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `credit_applications_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="glass-panel rounded-2xl p-6 border-slate-800 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            Credit Applications Portfolio ({filtered.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active underwritten portfolio with automated scoring and underwriter manual override.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="self-start rounded-xl border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-800 hover:text-white sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <Input
            type="text"
            placeholder="Search by name, ref, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-slate-700 bg-slate-900 pl-9 text-xs text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
          />
        </div>

        <div>
          <Select
            value={selectedTier}
            onValueChange={setSelectedTier}
          >
            <SelectTrigger className="border-slate-700 bg-slate-900 text-xs text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Risk Tiers</SelectItem>
              <SelectItem value="Excellent">Excellent</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
              <SelectItem value="Poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger className="border-slate-700 bg-slate-900 text-xs text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
              <SelectItem value="Declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <Table className="w-full text-left text-xs">
          <TableHeader className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-semibold uppercase text-slate-400">
            <TableRow>
              <TableHead className="px-4 py-3">Applicant / Ref</TableHead>
              <TableHead className="px-4 py-3">Score & Tier</TableHead>
              <TableHead className="px-4 py-3">Requested Line</TableHead>
              <TableHead className="px-4 py-3">Purpose</TableHead>
              <TableHead className="px-4 py-3">Status</TableHead>
              <TableHead className="px-4 py-3 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {filtered.length > 0 ? (
              filtered.map((app) => {
                const tierStyle = getScoreTierColor(app.credit_score);
                return (
                  <TableRow key={app.id} className="hover:bg-slate-900/50">
                    <TableCell className="px-4 py-3">
                      <div className="font-semibold text-white">{app.applicant_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{app.reference_no}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{app.credit_score}</span>
                        <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] ${tierStyle.badge}`}>
                          {app.risk_tier}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-semibold text-slate-200">
                      {formatCurrency(app.loan_amount_requested)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-slate-400 capitalize">
                      {app.loan_purpose.replace(/_/g, " ").toLowerCase()}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          app.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : app.status === "Declined"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveModalApp(app);
                          setReviewerNotes(app.reviewer_notes || "");
                        }}
                        className="h-7 border-slate-700 bg-slate-800 px-2.5 text-xs font-medium text-indigo-300 hover:bg-slate-700"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center italic text-slate-500">
                  {applications.length === 0
                    ? "No applications yet. Run an assessment and save an applicant to get started."
                    : "No applications found matching the selected filters."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail / Override Modal */}
      <Dialog
        open={Boolean(activeModalApp)}
        onOpenChange={(open) => {
          if (!open) setActiveModalApp(null);
        }}
      >
        {activeModalApp && (
          <DialogContent className="glass-panel max-h-[90vh] overflow-y-auto border-slate-700 text-slate-100 sm:max-w-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] text-slate-400 font-mono block">
                  {activeModalApp.reference_no}
                </span>
                <DialogHeader>
                <DialogTitle className="text-base font-bold text-white">
                  {activeModalApp.applicant_name}
                </DialogTitle>
                </DialogHeader>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Credit Score</span>
                <span className="text-xl font-black text-indigo-400">
                  {activeModalApp.credit_score}
                </span>
                <span className="text-slate-400 block text-[10px]">Tier: {activeModalApp.risk_tier}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Requested Line</span>
                <span className="text-xl font-bold text-white">
                  {formatCurrency(activeModalApp.loan_amount_requested)}
                </span>
                <span className="text-slate-400 block text-[10px]">Purpose: {activeModalApp.loan_purpose}</span>
              </div>
            </div>

            {/* Manual Status Override Controls */}
            <div className="space-y-3 pt-2">
              <Label htmlFor="reviewer-notes" className="block text-xs font-semibold text-slate-200">
                Underwriter Status Override & Notes
              </Label>
              <Textarea
                id="reviewer-notes"
                rows={2}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Add underwriter rationale or conditions..."
                className="border-slate-700 bg-slate-900 p-2.5 text-xs text-white"
              />

              {updateError && <p role="alert" className="text-xs text-rose-300">{updateError}</p>}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={updating}
                  onClick={() => handleStatusChange("Approved")}
                  className="h-auto flex-1 rounded-xl border-emerald-500/40 bg-emerald-600/20 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={updating}
                  onClick={() => handleStatusChange("Under Review")}
                  className="h-auto flex-1 rounded-xl border-amber-500/40 bg-amber-600/20 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-600/30"
                >
                  <Clock className="w-3.5 h-3.5" /> In Review
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={updating}
                  onClick={() => handleStatusChange("Declined")}
                  className="h-auto flex-1 rounded-xl border-rose-500/40 bg-rose-600/20 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-600/30"
                >
                  <X className="w-3.5 h-3.5" /> Decline
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Card>
  );
};
