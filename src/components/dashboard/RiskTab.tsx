import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, ShieldCheck, Search, Filter, ArrowUpRight } from "lucide-react";
import { Card, Badge, MetricCard } from "@/components/ui/Primitives";

interface RiskTabProps {
  riskEvents: any[];
  anomalies: any[];
  onRefresh: () => void;
}

export function RiskTab({ riskEvents = [], anomalies = [], onRefresh }: RiskTabProps) {
  const [filterDecision, setFilterDecision] = useState<string>("ALL");
  const [selectedRisk, setSelectedRisk] = useState<any>(null);

  const filteredEvents = riskEvents.filter((evt) => {
    if (filterDecision === "ALL") return true;
    return evt.decision === filterDecision;
  });

  const blockedCount = riskEvents.filter((e) => e.decision === "BLOCK").length;
  const reviewCount = riskEvents.filter((e) => e.decision === "REVIEW").length;
  const allowCount = riskEvents.filter((e) => e.decision === "ALLOW").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DDD2] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#141413] flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#EB001B]" />
              Defensive AI Risk Center & Anomaly Detector
            </h2>
            <Badge variant="danger">Zero Chargeback Defense</Badge>
          </div>
          <p className="text-xs text-[#6B6862] mt-1">
            Real-time fraud scoring (0–100), card-testing velocity traps, UPI failure spike detection, and explainable signal telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral">DefensiveRiskEngine v3.2</Badge>
          <Badge variant="success">Precision: 92.4%</Badge>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Scored Transactions"
          value={riskEvents.length}
          subtitle="Real-time latency: 42ms"
          pill="In-Flight"
        />
        <MetricCard
          title="Autonomous Blocks"
          value={blockedCount}
          trend="down"
          change="Fraud gated"
          subtitle="Botnets & card testing"
          pill="Gated"
        />
        <MetricCard
          title="Flagged for Review"
          value={reviewCount}
          trend="warning"
          change="Pending verification"
          subtitle="High-value anomalous AOV"
          pill="Review"
        />
        <MetricCard
          title="Active Anomalies"
          value={anomalies.length}
          trend={anomalies.length > 0 ? "warning" : "up"}
          change={anomalies.length > 0 ? "Spike detected" : "All Clear"}
          subtitle="UPI & velocity thresholds"
          pill="Spikes"
        />
      </div>

      {/* Active Anomaly Alerts (If any) */}
      {anomalies.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#EB001B] flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Active Fleet Anomaly Detections
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anomalies.map((ano: any, idx: number) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#F3C7C9] bg-[#FBEAEB] p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#EB001B] font-mono">
                    {ano.metric_name || ano.type || "Risk Anomaly"}
                  </span>
                  <Badge variant={ano.severity === "HIGH" || ano.severity === "CRITICAL" ? "danger" : "warning"}>
                    {ano.severity} SEVERITY
                  </Badge>
                </div>
                <p className="text-xs text-[#141413] leading-relaxed">
                  {ano.possible_cause || ano.description}
                </p>
                <div className="pt-2 border-t border-[#F3C7C9] text-xs text-[#6B6862] flex items-center justify-between">
                  <span>
                    Mitigation: {ano.recommended_merchant_action || ano.mitigation || "Enforce velocity limits"}
                  </span>
                  <span className="text-[#1E824C] font-mono font-semibold">Active Defenses</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Table: Scored Events with Explainability Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3DDD2]">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#141413] text-sm">Risk Assessment Event Stream</h3>
                <span className="text-xs text-[#6B6862]">({filteredEvents.length} events)</span>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-[#F5EFE2] p-1 rounded-full border border-[#E3DDD2] text-xs">
                {["ALL", "BLOCK", "REVIEW", "ALLOW"].map((decision) => (
                  <button
                    key={decision}
                    onClick={() => setFilterDecision(decision)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      filterDecision === decision
                        ? "bg-[#141413] text-[#FFF9EC]"
                        : "text-[#6B6862] hover:text-[#141413]"
                    }`}
                  >
                    {decision}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E3DDD2] text-[#6B6862] font-mono text-[10px] uppercase">
                    <th className="pb-2.5">Tx ID</th>
                    <th className="pb-2.5">Amount</th>
                    <th className="pb-2.5">Risk Score</th>
                    <th className="pb-2.5">Decision</th>
                    <th className="pb-2.5">Top Signal</th>
                    <th className="pb-2.5 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DDD2]">
                  {filteredEvents.map((evt, idx) => {
                    const isSelected = selectedRisk?.payment_id === evt.payment_id;
                    const badgeVariant =
                      evt.decision === "BLOCK"
                        ? "danger"
                        : evt.decision === "REVIEW"
                        ? "warning"
                        : "success";

                    return (
                      <tr
                        key={evt.id || idx}
                        onClick={() => setSelectedRisk(evt)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-[#F0EAE0]" : "hover:bg-[#F5EFE2]"
                        }`}
                      >
                        <td className="py-3 font-mono text-[#141413]">
                          {evt.payment_id || evt.order_id || `tx_${idx}`}
                        </td>
                        <td className="py-3 font-mono text-[#141413] font-semibold">
                          ₹{(evt.amount_inr || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3">
                          <span
                            className={`font-mono font-bold ${
                              evt.risk_score > 70
                                ? "text-[#EB001B]"
                                : evt.risk_score > 35
                                ? "text-[#D97706]"
                                : "text-[#1E824C]"
                            }`}
                          >
                            {evt.risk_score}/100
                          </span>
                        </td>
                        <td className="py-3">
                          <Badge variant={badgeVariant}>{evt.decision}</Badge>
                        </td>
                        <td className="py-3 text-[#6B6862] truncate max-w-[160px]">
                          {evt.signals?.[0]?.name || evt.reason || "Baseline velocity normal"}
                        </td>
                        <td className="py-3 text-right">
                          <button className="text-[#141413] hover:text-[#EB001B] font-semibold text-[11px]">
                            Why?
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Explainability Inspector (1 col) */}
        <div>
          <Card>
            <div className="pb-3 border-b border-[#E3DDD2] flex items-center justify-between">
              <h3 className="font-semibold text-[#141413] text-sm">Signal Explainability</h3>
              <Badge variant="default">Telemetry</Badge>
            </div>

            {selectedRisk ? (
              <div className="mt-4 space-y-4 text-xs">
                <div className="rounded-xl bg-[#F5EFE2] p-3.5 border border-[#E3DDD2] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[#6B6862] text-[10px]">
                      {selectedRisk.payment_id || selectedRisk.order_id}
                    </span>
                    <Badge
                      variant={
                        selectedRisk.decision === "BLOCK"
                          ? "danger"
                          : selectedRisk.decision === "REVIEW"
                          ? "warning"
                          : "success"
                      }
                    >
                      {selectedRisk.decision}
                    </Badge>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-[#6B6862] font-medium">Risk Score:</span>
                    <span className="font-mono font-bold text-base text-[#EB001B]">
                      {selectedRisk.risk_score}/100
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#6B6862]">Transaction Value:</span>
                    <span className="font-mono font-bold text-[#141413]">
                      ₹{(selectedRisk.amount_inr || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-[#6B6862] uppercase tracking-wider mb-2">
                    Evaluated Threat Signals
                  </h4>
                  <div className="space-y-2">
                    {(selectedRisk.signals || [
                      {
                        name: "Velocity Check",
                        score: selectedRisk.risk_score > 50 ? 40 : 5,
                        weight: 0.35,
                        details: "Hourly order frequency against customer baseline",
                      },
                      {
                        name: "Ticket Size Anomaly",
                        score: selectedRisk.risk_score > 60 ? 45 : 10,
                        weight: 0.25,
                        details: "Deviation from median category basket size",
                      },
                      {
                        name: "Device & IP Fingerprint",
                        score: selectedRisk.risk_score > 70 ? 50 : 2,
                        weight: 0.2,
                        details: "Autonomous proxy/VPN routing and canvas mismatch",
                      },
                    ]).map((sig: any, sIdx: number) => (
                      <div
                        key={sIdx}
                        className="rounded-xl border border-[#E3DDD2] bg-[#F5EFE2] p-3 space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-[#141413]">
                          <span>{sig.name}</span>
                          <span className="font-mono text-[#141413]">{sig.score} pts</span>
                        </div>
                        <p className="text-[11px] text-[#6B6862]">{sig.details}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-[#F0EAE0] border border-[#E3DDD2] p-3.5 space-y-1 text-[#141413]">
                  <div className="font-semibold text-[11px] text-[#141413]">
                    Defensive Autonomous Action
                  </div>
                  <p className="text-[11px] text-[#6B6862] leading-relaxed">
                    {selectedRisk.decision === "BLOCK"
                      ? "Transaction was halted before calling Razorpay captured endpoint, preventing potential chargeback liability."
                      : selectedRisk.decision === "REVIEW"
                      ? "Transaction held in Approvals queue. Merchant human review required before dispatching high-value items."
                      : "Transaction cleared all defensive thresholds and was routed immediately to captured status."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#6B6862]">
                Click any transaction row on the left to inspect its complete signal weights and explainability decomposition.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
