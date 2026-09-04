import React, { useState } from "react";
import { CheckSquare, AlertCircle, CheckCircle, XCircle, Edit3, ShieldAlert } from "lucide-react";
import { Card, Badge, MetricCard } from "@/components/ui/Primitives";

interface ApprovalsTabProps {
  approvals: any[];
  onRefresh: () => void;
}

export function ApprovalsTab({ approvals = [], onRefresh }: ApprovalsTabProps) {
  const [activeFilter, setActiveFilter] = useState<string>("PENDING");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const formatInr = (v: number) => `₹${(v || 0).toLocaleString("en-IN")}`;

  const filteredApprovals = approvals.filter((app: any) => {
    if (activeFilter === "ALL") return true;
    return app.status === activeFilter;
  });

  const pendingCount = approvals.filter((a: any) => a.status === "PENDING").length;

  const handleAction = async (id: string, action: "APPROVE" | "REJECT" | "EDIT", editedValue?: any) => {
    setActionLoadingId(id);
    setActionFeedback(null);
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          id,
          reason: action === "REJECT" ? "Rejected via Merchant Dashboard" : undefined,
          edited_value: editedValue,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback(`Request ${action.toLowerCase()}d successfully.`);
        onRefresh();
      } else {
        setActionFeedback(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setActionFeedback(`Error: ${e.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-amber-400" />
              Human-in-the-Loop Approvals Center
            </h2>
            <Badge variant="warning">{pendingCount} Action Required</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bounded merchant autonomy gate. When AI proposals cross configured thresholds, actions are safely paused for human sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple">Enforced by Policy Engine</Badge>
          <Badge variant="cyan">Audited to Immutable Log</Badge>
        </div>
      </div>

      {actionFeedback && (
        <div className="rounded-lg border border-sky-800 bg-sky-950/40 p-3 text-xs text-sky-200">
          {actionFeedback}
        </div>
      )}

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Pending Approvals"
          value={pendingCount}
          trend={pendingCount > 0 ? "warning" : "up"}
          change={pendingCount > 0 ? "Gated execution" : "Queue clear"}
          subtitle="Awaiting merchant decision"
          pill="Action Required"
        />
        <MetricCard
          title="Resolved This Session"
          value={approvals.filter((a: any) => a.status !== "PENDING").length}
          subtitle="Approved, edited or rejected"
          pill="Audited"
        />
        <MetricCard
          title="Autonomy Compliance"
          value="100%"
          trend="up"
          change="Zero runaway actions"
          subtitle="Strict boundary enforcement"
          pill="Bounded"
        />
      </div>

      {/* Approvals List */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-white text-sm">Policy-Gated Decision Queue</h3>
            <p className="text-xs text-slate-400">
              Review rationale, trigger policy, and proposed action payload
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
            {["PENDING", "APPROVED", "REJECTED", "ALL"].map((st) => (
              <button
                key={st}
                onClick={() => setActiveFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  activeFilter === st
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {filteredApprovals.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No approval requests match the current filter.
            </div>
          ) : (
            filteredApprovals.map((req: any) => {
              const isPending = req.status === "PENDING";
              const isLoading = actionLoadingId === req.id;

              return (
                <div
                  key={req.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isPending
                      ? "border-amber-900/50 bg-amber-950/20 shadow-md shadow-amber-950/10"
                      : "border-slate-800 bg-slate-900/40 opacity-80"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-slate-400">{req.id}</span>
                      <h4 className="font-bold text-sm text-white">{req.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white">
                        {formatInr(req.amount)}
                      </span>
                      <Badge
                        variant={
                          req.status === "APPROVED"
                            ? "success"
                            : req.status === "REJECTED"
                            ? "danger"
                            : req.status === "EDITED"
                            ? "purple"
                            : "warning"
                        }
                      >
                        {req.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{req.details}</p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg bg-slate-900/80 p-2.5 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        Triggering Policy:
                      </span>
                      <div className="font-mono text-amber-400 font-medium">
                        {req.policy_triggered}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        Autonomy Boundary Reason:
                      </span>
                      <div className="text-slate-300">{req.reason}</div>
                    </div>
                  </div>

                  {/* Actions Bar (Only if PENDING) */}
                  {isPending && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleAction(req.id, "REJECT")}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-lg border border-rose-800/60 bg-rose-950/40 hover:bg-rose-900/60 text-xs font-semibold text-rose-300 flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleAction(req.id, "EDIT", { revised_budget: 6000 })}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-lg border border-indigo-800/60 bg-indigo-950/40 hover:bg-indigo-900/60 text-xs font-semibold text-indigo-300 flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Modify & Approve</span>
                      </button>

                      <button
                        onClick={() => handleAction(req.id, "APPROVE")}
                        disabled={isLoading}
                        className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        <CheckCircle className="h-3.5 w-3.5 fill-slate-950 text-white" />
                        <span>{isLoading ? "Executing..." : "Approve & Execute"}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
