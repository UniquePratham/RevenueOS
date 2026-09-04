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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DDD2] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#141413] flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-[#141413]" />
              Human-in-the-Loop Approvals Center
            </h2>
            <Badge variant="warning">{pendingCount} Action Required</Badge>
          </div>
          <p className="text-xs text-[#6B6862] mt-1">
            Bounded merchant autonomy gate. When AI proposals cross configured thresholds, actions are safely paused for human sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple">Policy Engine</Badge>
          <Badge variant="default">Audited to Immutable Log</Badge>
        </div>
      </div>

      {actionFeedback && (
        <div className="rounded-xl border border-[#E3DDD2] bg-[#F5EFE2] p-3.5 text-xs text-[#141413] font-medium">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3DDD2]">
          <div>
            <h3 className="font-semibold text-[#141413] text-sm">Policy-Gated Decision Queue</h3>
            <p className="text-xs text-[#6B6862]">
              Review rationale, trigger policy, and proposed action payload
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#F5EFE2] p-1 rounded-full border border-[#E3DDD2] text-xs">
            {["PENDING", "APPROVED", "REJECTED", "ALL"].map((st) => (
              <button
                key={st}
                onClick={() => setActiveFilter(st)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  activeFilter === st
                    ? "bg-[#141413] text-[#FFF9EC]"
                    : "text-[#6B6862] hover:text-[#141413]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {filteredApprovals.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6B6862]">
              No approval requests match the current filter.
            </div>
          ) : (
            filteredApprovals.map((req: any) => {
              const isPending = req.status === "PENDING";
              const isLoading = actionLoadingId === req.id;

              return (
                <div
                  key={req.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    isPending
                      ? "border-[#FDE68A] bg-[#FEF3C7] shadow-sm"
                      : "border-[#E3DDD2] bg-[#F5EFE2]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-[#6B6862]">{req.id}</span>
                      <h4 className="font-bold text-sm text-[#141413]">{req.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#141413]">
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

                  <p className="text-xs text-[#141413] mt-2 leading-relaxed">{req.details}</p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-[#FFF9EC] p-3 border border-[#E3DDD2] text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6B6862]">
                        Triggering Policy:
                      </span>
                      <div className="font-mono text-[#B45309] font-medium">
                        {req.policy_triggered}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6B6862]">
                        Autonomy Boundary Reason:
                      </span>
                      <div className="text-[#141413]">{req.reason}</div>
                    </div>
                  </div>

                  {/* Actions Bar (Only if PENDING) */}
                  {isPending && (
                    <div className="mt-4 pt-3 border-t border-[#FDE68A] flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleAction(req.id, "REJECT")}
                        disabled={isLoading}
                        className="px-3.5 py-1.5 rounded-full border border-[#F3C7C9] bg-[#FBEAEB] hover:bg-[#F8D4D6] text-xs font-semibold text-[#EB001B] flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleAction(req.id, "EDIT", { revised_budget: 6000 })}
                        disabled={isLoading}
                        className="px-3.5 py-1.5 rounded-full border border-[#E3DDD2] bg-[#F0EAE0] hover:bg-[#EAE4D8] text-xs font-semibold text-[#141413] flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Modify & Approve</span>
                      </button>

                      <button
                        onClick={() => handleAction(req.id, "APPROVE")}
                        disabled={isLoading}
                        className="px-4 py-1.5 rounded-full bg-[#EB001B] hover:bg-[#D40018] text-[#FFF9EC] font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 active:translate-y-0.5"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
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
