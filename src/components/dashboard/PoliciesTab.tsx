import React, { useState } from "react";
import { Sliders, Save, ShieldCheck, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, Badge, MetricCard } from "@/components/ui/Primitives";

interface PoliciesTabProps {
  policies: any;
  onRefresh: () => void;
}

export function PoliciesTab({ policies: initialPolicies = {}, onRefresh }: PoliciesTabProps) {
  const [policies, setPolicies] = useState({
    max_automatic_refund_inr: initialPolicies.max_automatic_refund_inr || 2000,
    max_discount_percent: initialPolicies.max_discount_percent || 10,
    max_recovery_retries: initialPolicies.max_recovery_retries || 3,
    max_daily_campaign_budget_inr: initialPolicies.max_daily_campaign_budget_inr || 5000,
    high_value_review_threshold_inr: initialPolicies.high_value_review_threshold_inr || 10000,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_POLICY",
          policy_updates: policies,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage("Merchant policies updated and enforced across all autonomous agents.");
        onRefresh();
      } else {
        setSaveMessage(`Failed to update: ${data.error}`);
      }
    } catch (e: any) {
      setSaveMessage(`Error: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Sliders className="h-5 w-5 text-sky-400" />
              Merchant Autonomy Policy Boundaries
            </h2>
            <Badge variant="cyan">Hard Guardrails</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure financial thresholds and operational guardrails. Any autonomous action exceeding these parameters triggers an approval request.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">Strict Enforcer Active</Badge>
          <Badge variant="purple">Zero Runaway Guarantee</Badge>
        </div>
      </div>

      {saveMessage && (
        <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-3 text-xs text-emerald-200">
          {saveMessage}
        </div>
      )}

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Autonomous Refund Ceiling"
          value={`₹${Number(policies.max_automatic_refund_inr).toLocaleString("en-IN")}`}
          subtitle="Higher refunds require merchant sign-off"
          pill="Refunds"
        />
        <MetricCard
          title="Max Autonomous Discount"
          value={`${policies.max_discount_percent}%`}
          subtitle="Dynamic pricing guardrail"
          pill="Commerce"
        />
        <MetricCard
          title="Max Recovery Retries"
          value={`${policies.max_recovery_retries} Attempts`}
          subtitle="Prevents customer notification spam"
          pill="Recovery"
        />
      </div>

      {/* Policy Configuration Form */}
      <Card highlight>
        <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Bounded Autonomy Parameters (Live Enforced)
          </h3>
          <span className="text-xs text-slate-400">Updates take effect immediately</span>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Max Automatic Refund */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Maximum Automatic Refund (INR)</span>
                <span className="font-mono text-sky-400 font-bold">
                  ₹{Number(policies.max_automatic_refund_inr).toLocaleString("en-IN")}
                </span>
              </label>
              <input
                type="number"
                value={policies.max_automatic_refund_inr}
                onChange={(e) =>
                  setPolicies({ ...policies, max_automatic_refund_inr: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Any refund request exceeding this amount is automatically gated in the Approvals Center.
              </p>
            </div>

            {/* Max Discount Percent */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Maximum AI Negotiation Discount (%)</span>
                <span className="font-mono text-sky-400 font-bold">
                  {policies.max_discount_percent}%
                </span>
              </label>
              <input
                type="number"
                max={30}
                min={0}
                value={policies.max_discount_percent}
                onChange={(e) =>
                  setPolicies({ ...policies, max_discount_percent: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Growth Agent can autonomously negotiate bundle discounts up to this ceiling.
              </p>
            </div>

            {/* High-Value Transaction Review Threshold */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>High-Value Review Threshold (INR)</span>
                <span className="font-mono text-sky-400 font-bold">
                  ₹{Number(policies.high_value_review_threshold_inr).toLocaleString("en-IN")}
                </span>
              </label>
              <input
                type="number"
                value={policies.high_value_review_threshold_inr}
                onChange={(e) =>
                  setPolicies({
                    ...policies,
                    high_value_review_threshold_inr: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Transactions above this amount with risk score &gt; 35 require manual sign-off.
              </p>
            </div>

            {/* Max Recovery Retries */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Maximum Recovery Ladder Attempts</span>
                <span className="font-mono text-sky-400 font-bold">
                  {policies.max_recovery_retries} Retries
                </span>
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={policies.max_recovery_retries}
                onChange={(e) =>
                  setPolicies({ ...policies, max_recovery_retries: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Guarantees customer protection against excessive WhatsApp or SMS payment retries.
              </p>
            </div>

            {/* Daily Campaign Budget */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Autonomous Daily Campaign Ad Budget (INR)</span>
                <span className="font-mono text-sky-400 font-bold">
                  ₹{Number(policies.max_daily_campaign_budget_inr).toLocaleString("en-IN")}/day
                </span>
              </label>
              <input
                type="number"
                value={policies.max_daily_campaign_budget_inr}
                onChange={(e) =>
                  setPolicies({
                    ...policies,
                    max_daily_campaign_budget_inr: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Maximum daily budget growth agents can deploy into promotional offers without human sign-off.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Enforcing Policies..." : "Save & Enforce Policies"}</span>
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
