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

  React.useEffect(() => {
    if (!selectedCandidate && recoveries.length > 0) {
      setSelectedCandidate(recoveries[0]);
    } else if (selectedCandidate && recoveries.length > 0) {
      const updated = recoveries.find((r: any) => r.id === selectedCandidate.id);
      if (updated) setSelectedCandidate(updated);
    }
  }, [recoveries]);

  const formatInr = (v: number) => `₹${(v || 0).toLocaleString("en-IN")}`;

  const handleExecuteRecovery = async (candidateId: string) => {
    setIsExecuting(true);
    setExecutionResult(null);
    try {
      const res = await fetch("/api/recovery/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: candidateId, recovery_id: candidateId }),
      });
      const data = await res.json();
      setExecutionResult(data);
      if (data.current_status && selectedCandidate?.id === candidateId) {
        setSelectedCandidate((prev: any) =>
          prev ? { ...prev, status: data.current_status, attempts: (prev.attempts || 0) + 1 } : prev
        );
      }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DDD2] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#141413] flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-[#1E824C]" />
              Autonomous Revenue Recovery Center
            </h2>
            <Badge variant="success">Adaptive Ladder Active</Badge>
          </div>
          <p className="text-xs text-[#6B6862] mt-1">
            Deterministic recovery sequence: DETECT → DIAGNOSE → DECIDE → ACT (UPI intent / smart retry / payment link) → VERIFY → STOP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple">Max Retries: 3 (Bounded)</Badge>
          <Badge variant="default">Spam Prevention Active</Badge>
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
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DDD2]">
              <h3 className="font-semibold text-[#141413] text-sm">Failed Payment Recovery Candidates</h3>
              <span className="text-xs text-[#6B6862]">Click to inspect adaptive ladder</span>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E3DDD2] text-[#6B6862] font-mono text-[10px] uppercase">
                    <th className="pb-2.5">ID</th>
                    <th className="pb-2.5">Amount</th>
                    <th className="pb-2.5">Failure Reason</th>
                    <th className="pb-2.5">Current Status</th>
                    <th className="pb-2.5">Attempts</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DDD2]">
                  {recoveries.map((rec) => {
                    const isSelected = selectedCandidate?.id === rec.id;
                    const isRecovered = rec.status === "RECOVERED";
                    const isExhausted = rec.status === "MAX_ATTEMPTS_EXHAUSTED";

                    return (
                      <tr
                        key={rec.id}
                        onClick={() => setSelectedCandidate(rec)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-[#F0EAE0]" : "hover:bg-[#F5EFE2]"
                        }`}
                      >
                        <td className="py-3 font-mono text-[#141413]">{rec.id}</td>
                        <td className="py-3 font-mono font-bold text-[#141413]">
                          {formatInr(rec.amount ?? rec.amount_inr)}
                        </td>
                        <td className="py-3 text-[#6B6862] truncate max-w-[140px]">
                          {rec.failure_reason || "Gateway Timeout"}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={
                              isRecovered ? "success" : isExhausted ? "danger" : "warning"
                            }
                          >
                            {rec.status}
                          </Badge>
                        </td>
                        <td className="py-3 font-mono text-[#6B6862]">
                          {rec.attempts || 0}/3
                        </td>
                        <td className="py-3 text-right">
                          {!isRecovered && !isExhausted && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExecuteRecovery(rec.id);
                              }}
                              className="px-3 py-1 rounded-full bg-[#EB001B] hover:bg-[#D40018] text-[#FFF9EC] font-semibold text-[10px] transition-all active:translate-y-0.5"
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
          <Card>
            <div className="pb-3 border-b border-[#E3DDD2] flex items-center justify-between">
              <h3 className="font-semibold text-[#141413] text-sm">Adaptive 6-Step Ladder</h3>
              <Badge variant="default">Deterministic</Badge>
            </div>

            {selectedCandidate ? (
              <div className="mt-4 space-y-4 text-xs">
                <div className="rounded-xl bg-[#F5EFE2] p-3.5 border border-[#E3DDD2] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[#6B6862] text-[10px]">
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
                    <span className="text-[#6B6862]">Recoverable Basket:</span>
                    <span className="font-mono font-bold text-[#1E824C] text-base">
                      {formatInr(selectedCandidate.amount ?? selectedCandidate.amount_inr)}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6B6862]">
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
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F5EFE2] border border-[#E3DDD2]"
                    >
                      <div className="mt-0.5">
                        {s.status === "DONE" ? (
                          <CheckCircle2 className="h-4 w-4 text-[#1E824C] shrink-0" />
                        ) : s.status === "IN_PROGRESS" ? (
                          <RefreshCw className="h-4 w-4 text-[#EB001B] animate-spin shrink-0" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-[#E3DDD2] block shrink-0" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-[#141413] text-[11px]">{s.step}</div>
                        <div className="text-[10px] text-[#6B6862]">{s.desc}</div>
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
                      className="w-full py-2.5 rounded-full bg-[#EB001B] hover:bg-[#D40018] text-[#FFF9EC] font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:translate-y-0.5"
                    >
                      <Play className="h-3.5 w-3.5 fill-[#FFF9EC]" />
                      <span>
                        {isExecuting
                          ? "Executing Recovery Ladder..."
                          : "Run Autonomous Recovery Step"}
                      </span>
                    </button>
                  )}

                {executionResult && (
                  <div
                    className={`rounded-xl border p-3 text-xs space-y-1.5 ${
                      executionResult.error
                        ? "border-[#F3C7C9] bg-[#FBEAEB] text-[#EB001B]"
                        : "border-[#C3E6D0] bg-[#EBF5EF] text-[#1E824C]"
                    }`}
                  >
                    {executionResult.error ? (
                      <div>
                        <span className="font-bold">Error: </span>
                        <span>{executionResult.error}</span>
                      </div>
                    ) : (
                      <>
                        <div className="font-bold flex items-center justify-between">
                          <span>
                            Status: {executionResult.current_status || executionResult.status || "EXECUTED"}
                          </span>
                          <span className="font-mono text-[10px]">
                            {executionResult.action_executed || executionResult.channel || "LADDER STEP"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#141413]">{executionResult.message}</p>
                        {executionResult.payment_link_url && (
                          <a
                            href={executionResult.payment_link_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] underline font-semibold text-[#1E824C] hover:text-[#141413] block pt-1"
                          >
                            Open Generated Razorpay Link →
                          </a>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#6B6862]">
                Select a candidate from the table to view its ladder execution.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
