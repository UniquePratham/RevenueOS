import React, { useState } from "react";
import { FileText, HelpCircle, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { Card, Badge } from "@/components/ui/Primitives";

interface AuditTabProps {
  auditTrail: any[];
}

export function AuditTab({ auditTrail = [] }: AuditTabProps) {
  const [selectedAudit, setSelectedAudit] = useState<any>(auditTrail[0] || null);
  const [whyLoading, setWhyLoading] = useState(false);
  const [whyExplanation, setWhyExplanation] = useState<any>(null);

  const handleInspectWhy = async (audit: any) => {
    setSelectedAudit(audit);
    setWhyLoading(true);
    setWhyExplanation(null);
    try {
      const res = await fetch(`/api/audit/why?id=${audit.id}`);
      if (res.ok) {
        const data = await res.json();
        setWhyExplanation(data);
      } else {
        setWhyExplanation(
          audit.why_breakdown || {
            summary: audit.reason || "Executed autonomously under merchant policy.",
            bullet_points: [
              `Agent: ${audit.agent}`,
              `Policy checked: ${audit.policy_checked || "Standard boundaries"}`,
              `Financial impact: ₹${(audit.financial_impact_inr || 0).toLocaleString("en-IN")}`,
            ],
          }
        );
      }
    } catch {
      setWhyExplanation(
        audit.why_breakdown || {
          summary: audit.reason || "Autonomous decision executed within safety bounds.",
          bullet_points: [
            `Agent: ${audit.agent}`,
            `Approval status: ${audit.approval_status || "AUTOMATIC"}`,
          ],
        }
      );
    } finally {
      setWhyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <FileText className="h-5 w-5 text-sky-400" />
              Autonomous Audit Trail & "Why?" Engine
            </h2>
            <Badge variant="cyan">Append-Only Ledger</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Every autonomous event, policy evaluation, risk decision, and financial movement is immutably logged with 1-click explainability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">Total Records: {auditTrail.length}</Badge>
          <Badge variant="purple">100% Traceability</Badge>
        </div>
      </div>

      {/* Main Grid: Audit Log Table + Explainability Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm">Real-Time Autonomous Event Stream</h3>
              <span className="text-xs text-slate-400">Click any row for "Why?" explanation</span>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Agent</th>
                    <th className="pb-2">Event Type</th>
                    <th className="pb-2">Decision</th>
                    <th className="pb-2">Impact</th>
                    <th className="pb-2 text-right">Explain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditTrail.map((item, idx) => {
                    const isSelected = selectedAudit?.id === item.id;
                    const isBlocked = item.decision === "BLOCKED" || item.decision === "BLOCK";
                    const isApproved = item.decision === "ALLOWED" || item.decision === "ALLOW" || item.decision === "APPROVED";

                    return (
                      <tr
                        key={item.id || idx}
                        onClick={() => handleInspectWhy(item)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-sky-950/30" : "hover:bg-slate-900/50"
                        }`}
                      >
                        <td className="py-2.5 font-mono text-slate-400 text-[11px]">
                          {(item.timestamp || "21:14:00").slice(11, 19)}
                        </td>
                        <td className="py-2.5 font-medium text-slate-200">
                          {item.agent || "Policy Engine"}
                        </td>
                        <td className="py-2.5 font-mono text-slate-300 text-[11px] truncate max-w-[140px]">
                          {item.event_type}
                        </td>
                        <td className="py-2.5">
                          <Badge variant={isBlocked ? "danger" : isApproved ? "success" : "warning"}>
                            {item.decision}
                          </Badge>
                        </td>
                        <td className="py-2.5 font-mono text-slate-300">
                          {item.financial_impact_inr
                            ? `₹${item.financial_impact_inr.toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                        <td className="py-2.5 text-right">
                          <button className="text-sky-400 hover:text-sky-300 font-medium text-[11px] flex items-center gap-1 ml-auto">
                            <span>Why?</span>
                            <ArrowRight className="h-3 w-3" />
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

        {/* Right Col: "Why?" Explainer Inspector */}
        <div>
          <Card highlight>
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-sky-400" />
                "Why?" Explanation Inspector
              </h3>
              <Badge variant="cyan">Explainable AI</Badge>
            </div>

            {selectedAudit ? (
              <div className="mt-4 space-y-4 text-xs">
                <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-400 text-[10px]">
                      {selectedAudit.id || "audit_evt_01"}
                    </span>
                    <Badge variant={selectedAudit.decision === "BLOCKED" ? "danger" : "success"}>
                      {selectedAudit.decision}
                    </Badge>
                  </div>
                  <div className="font-bold text-sm text-white">{selectedAudit.event_type}</div>
                  <div className="text-[11px] text-slate-400">
                    Executing Agent: <span className="text-sky-300">{selectedAudit.agent}</span>
                  </div>
                </div>

                {/* Why Breakdown */}
                <div className="rounded-lg bg-sky-950/20 border border-sky-800/40 p-3.5 space-y-2">
                  <h4 className="font-bold text-sky-300 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-sky-400" />
                    Autonomous Decision Rationale
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedAudit.why_breakdown?.summary ||
                      selectedAudit.reason ||
                      "Decision was made autonomously following verified merchant configuration and risk scoring model."}
                  </p>

                  <div className="pt-2 border-t border-sky-800/30 space-y-1.5">
                    {(
                      selectedAudit.why_breakdown?.bullet_points || [
                        `Policy evaluated: ${selectedAudit.policy_checked || "Bounded Autonomy Threshold"}`,
                        `Result: ${selectedAudit.result || selectedAudit.decision}`,
                        `Approval route: ${selectedAudit.approval_status || "AUTOMATIC"}`,
                      ]
                    ).map((pt: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400 mt-1 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input Payload Preview */}
                {selectedAudit.input && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Event Input Telemetry
                    </h4>
                    <pre className="rounded bg-slate-900/90 p-2.5 text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
                      {JSON.stringify(selectedAudit.input, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Select an audit entry from the table to inspect its rationale.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
