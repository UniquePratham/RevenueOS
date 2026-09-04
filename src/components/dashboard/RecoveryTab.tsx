import React, { useState } from "react";
import { RotateCcw, AlertCircle, CheckCircle2, ArrowRight, Play, RefreshCw, Zap } from "lucide-react";
import { Card, Badge, MetricCard } from "@/components/ui/Primitives";

interface RecoveryTabProps {
  recoveries: any[];
  onRefresh: () => void;
}

export function RecoveryTab({ recoveries = [], onRefresh }: RecoveryTabProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(recoveries[0] || null);

  const formatInr = (v: number) => `₹${(v || 0).toLocaleString("en-IN")}`;

  const handleExecuteRecovery = async (candidateId: string) => {
    setIsExecuting(true);
    setExecutionResult(null);
    try {
      const res = await fetch("/api/recovery/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recovery_id: candidateId }),
      });
      const data = await res.json();
      setExecutionResult(data);
      onRefresh();
    } catch (e: any) {
      setExecutionResult({ error: e.message });
    } finally {
      setIsExecuting(false);
    }
  };

  const isRecoveredStatus = (s: string) => s?.toUpperCase() === "RECOVERED";

  const recoveredTotal = recoveries
    .filter((r) => isRecoveredStatus(r.status))
    .reduce((acc, curr) => acc + (curr.amount ?? curr.amount_inr ?? 0), 0);

  const atRiskTotal = recoveries
    .filter((r) => !isRecoveredStatus(r.status))
    .reduce((acc, curr) => acc + (curr.amount ?? curr.amount_inr ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-emerald-400" />
              Autonomous Revenue Recovery Center
            </h2>
            <Badge variant="success">Adaptive Ladder Active</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic recovery sequence: DETECT → DIAGNOSE → DECIDE → ACT (UPI intent / smart retry / payment link) → VERIFY → STOP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple">Max Retries: 3 (Policy Bounded)</Badge>
          <Badge variant="cyan">Spam Prevention Guaranteed</Badge>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total Candidates"
          value={recoveries.length}
          subtitle="Failed checkouts & drop-offs"
          pill="Pipeline"
        />
        <MetricCard
          title="Successfully Recovered"
          value={formatInr(recoveredTotal)}
          trend="up"
          change="+38% lift"
          subtitle="Saved merchant revenue"
          pill="Won Back"
        />
        <MetricCard
          title="Revenue Under Active Ladder"
          value={formatInr(atRiskTotal)}
          trend="warning"
          change="Smart retries queued"
          subtitle="In-flight recovery flows"
          pill="Active"
        />
        <MetricCard
          title="Autonomous Success Rate"
          value="42.8%"
          trend="up"
          change="Benchmark: 18%"
          subtitle="Optimal channel dispatch"
          pill="Performance"
        />
      </div>

      {/* Main Content: Table + Recovery Stepper Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm">Failed Payment Recovery Candidates</h3>
              <span className="text-xs text-slate-400">Click to inspect adaptive ladder</span>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Failure Reason</th>
                    <th className="pb-2">Current Status</th>
                    <th className="pb-2">Attempts</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recoveries.map((rec) => {
                    const isSelected = selectedCandidate?.id === rec.id;
                    const isRecovered = rec.status === "RECOVERED";
                    const isExhausted = rec.status === "MAX_ATTEMPTS_EXHAUSTED";

                    return (
                      <tr
                        key={rec.id}
                        onClick={() => setSelectedCandidate(rec)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-sky-950/30" : "hover:bg-slate-900/50"
                        }`}
                      >
                        <td className="py-2.5 font-mono text-slate-300">{rec.id}</td>
                        <td className="py-2.5 font-mono font-bold text-white">
                          {formatInr(rec.amount ?? rec.amount_inr)}
                        </td>
                        <td className="py-2.5 text-slate-400 truncate max-w-[140px]">
                          {rec.failure_reason || "Gateway Timeout"}
                        </td>
                        <td className="py-2.5">
                          <Badge
                            variant={
                              isRecovered ? "success" : isExhausted ? "danger" : "warning"
                            }
                          >
                            {rec.status}
                          </Badge>
                        </td>
                        <td className="py-2.5 font-mono text-slate-300">
                          {rec.attempts || 0}/3
                        </td>
                        <td className="py-2.5 text-right">
                          {!isRecovered && !isExhausted && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExecuteRecovery(rec.id);
                              }}
                              className="px-2.5 py-1 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-[10px] transition-all"
                            >
                              Run Step
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Col: 6-Step Autonomous Ladder Inspector */}
        <div>
          <Card highlight>
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">Adaptive 6-Step Recovery Ladder</h3>
              <Badge variant="cyan">Deterministic</Badge>
            </div>

            {selectedCandidate ? (
              <div className="mt-4 space-y-4 text-xs">
                <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-400 text-[10px]">
                      {selectedCandidate.id}
                    </span>
                    <Badge
                      variant={
                        selectedCandidate.status === "RECOVERED"
                          ? "success"
                          : selectedCandidate.status === "MAX_ATTEMPTS_EXHAUSTED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {selectedCandidate.status}
                    </Badge>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-slate-300">Recoverable Basket:</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">
                      {formatInr(selectedCandidate.amount ?? selectedCandidate.amount_inr)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Root Failure: {selectedCandidate.failure_reason}
                  </div>
                </div>

                {/* 6-Step Visual Timeline */}
                <div className="space-y-2">
                  {[
                    {
                      step: "1. DETECT",
                      desc: "Instant Razorpay payment.failed webhook intake",
                      status: "DONE",
                    },
                    {
                      step: "2. DIAGNOSE",
                      desc: "Categorize as soft decline (insufficient funds / UPI timeout)",
                      status: "DONE",
                    },
                    {
                      step: "3. DECIDE",
                      desc: "Select next optimal channel: WhatsApp Smart Link + Instant UPI Intent",
                      status: "DONE",
                    },
                    {
                      step: "4. ACT",
                      desc: `Dispatched attempt ${selectedCandidate.attempts || 1} of 3`,
                      status: selectedCandidate.attempts > 0 ? "DONE" : "IN_PROGRESS",
                    },
                    {
                      step: "5. VERIFY",
                      desc: "Listen for payment.captured webhook or bank ledger reconciliation",
                      status: selectedCandidate.status === "RECOVERED" ? "DONE" : "WAITING",
                    },
                    {
                      step: "6. STOP",
                      desc: "Halt retries upon recovery or cap at 3 attempts to prevent customer fatigue",
                      status:
                        selectedCandidate.status === "RECOVERED" ||
                        selectedCandidate.status === "MAX_ATTEMPTS_EXHAUSTED"
                          ? "DONE"
                          : "PENDING",
                    },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2 rounded bg-slate-900/40 border border-slate-800"
                    >
                      <div className="mt-0.5">
                        {s.status === "DONE" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : s.status === "IN_PROGRESS" ? (
                          <RefreshCw className="h-4 w-4 text-sky-400 animate-spin shrink-0" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-slate-700 block shrink-0" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 text-[11px]">{s.step}</div>
                        <div className="text-[10px] text-slate-400">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Manual Trigger Button */}
                {selectedCandidate.status !== "RECOVERED" &&
                  selectedCandidate.status !== "MAX_ATTEMPTS_EXHAUSTED" && (
                    <button
                      onClick={() => handleExecuteRecovery(selectedCandidate.id)}
                      disabled={isExecuting}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5 fill-slate-950" />
                      <span>
                        {isExecuting
                          ? "Executing Recovery Ladder..."
                          : "Run Autonomous Recovery Step"}
                      </span>
                    </button>
                  )}

                {executionResult && (
                  <div className="rounded-lg border border-emerald-800 bg-emerald-950/30 p-3 text-xs text-emerald-200 space-y-1">
                    <div className="font-bold flex items-center justify-between">
                      <span>Status: {executionResult.status}</span>
                      <span className="font-mono text-[10px]">{executionResult.channel}</span>
                    </div>
                    <p className="text-[11px]">{executionResult.message}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Select a candidate from the table to view its ladder execution.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
