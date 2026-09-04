import React from "react";
import {
  DollarSign,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import { MetricCard, Card, Badge, StatusDot } from "@/components/ui/Primitives";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface OverviewTabProps {
  data: any;
  onNavigateTab: (tab: any) => void;
  onRunDemo: (scenarioId: string) => void;
}

export function OverviewTab({ data, onNavigateTab, onRunDemo }: OverviewTabProps) {
  const summary = data?.summary || {};
  const forecast = data?.forecast || [];
  const recon = data?.recon || {};
  const anomalies = data?.anomalies || [];
  const approvals = (data?.approvals || []).filter((a: any) => a.status === "PENDING");
  const executiveBrief = data?.executiveBrief || {};

  const formatInr = (val: number) => `₹${(val || 0).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      {/* Merchant Twin Banner */}
      <div className="relative overflow-hidden rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-fintech-card to-indigo-950/30 p-6 backdrop-blur-md">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="cyan">DIGITAL REVENUE TWIN ACTIVE</Badge>
              <span className="text-xs text-slate-400 font-mono">ID: mch_electrogear_01</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
              ElectroGear Pro — Autonomous Command Center
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
              Unified control plane orchestrating Agentic Commerce, Defensive Risk, Failure Recovery,
              and Automated Reconciliation. Guardrailed by bounded merchant autonomy policies.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onRunDemo("SCENARIO_1_AI_BUYER")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-semibold text-slate-950 transition-all shadow-md shadow-sky-500/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Simulate AI Buyer</span>
            </button>
            <button
              onClick={() => onNavigateTab("simulation")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-all"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Interactive Scenarios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (8 metrics specified in PRD) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Processed Volume"
          value={formatInr(summary.total_revenue_inr)}
          change="+18.4%"
          trend="up"
          icon={DollarSign}
          subtitle="1,050+ orders synced"
          pill="INR"
        />

        <MetricCard
          title="Revenue at Risk"
          value={formatInr(summary.revenue_at_risk_inr)}
          change="₹1.4L flagged"
          trend="warning"
          icon={AlertTriangle}
          subtitle={`${summary.failed_payment_count || 0} failed transactions`}
          pill="Active"
          onClick={() => onNavigateTab("risk")}
        />

        <MetricCard
          title="Autonomous Recovered"
          value={formatInr(summary.recovered_revenue_inr)}
          change={`+${summary.recovery_success_rate || 0}%`}
          trend="up"
          icon={RotateCcw}
          subtitle="Retries, links & UPI intent"
          pill="Saved"
          onClick={() => onNavigateTab("recovery")}
        />

        <MetricCard
          title="Fraud Prevented"
          value={formatInr(summary.fraud_prevented_inr)}
          change="0.0% chargebacks"
          trend="up"
          icon={ShieldCheck}
          subtitle="Real-time defensive gating"
          pill="Shield"
          onClick={() => onNavigateTab("risk")}
        />

        <MetricCard
          title="Recovery Success Rate"
          value={`${summary.recovery_success_rate || 0}%`}
          change="Industry: 18%"
          trend="up"
          icon={Percent}
          subtitle="AI fallback optimization"
          pill="Rate"
        />

        <MetricCard
          title="Reconciliation Match"
          value={`${recon.reconciliation_rate || 96.8}%`}
          change="₹18.4L verified"
          trend="up"
          icon={Layers}
          subtitle="Bank vs Gateway vs Ledger"
          pill="Settled"
          onClick={() => onNavigateTab("finance")}
        />

        <MetricCard
          title="Expected Net Settlement"
          value={formatInr(summary.settlement_expected_inr)}
          change="T+2 payout ready"
          trend="neutral"
          icon={TrendingUp}
          subtitle="Net after gateway MDR"
          pill="Razorpay"
          onClick={() => onNavigateTab("forecast")}
        />

        <MetricCard
          title="AI Incremental Uplift"
          value={formatInr(summary.ai_assisted_revenue_inr)}
          change="+14.2% AOV"
          trend="up"
          icon={Sparkles}
          subtitle="Agentic checkout & bundles"
          pill="Growth"
          onClick={() => onNavigateTab("commerce")}
        />
      </div>

      {/* Mid-Row: Cash Forecast Preview + Executive Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Forecast (2 Cols) */}
        <Card className="lg:col-span-2 flex flex-col justify-between" highlight>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-sm">30-Day Cash Flow Projection</h3>
                <Badge variant="cyan">Confidence Interval: 90%</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monte Carlo adjusted for Razorpay T+2 settlement cycles and projected UPI recovery rates.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("forecast")}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
            >
              <span>Full Model</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(str) => str.slice(5)}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="p90_cash_inr"
                  stroke="#0284c7"
                  strokeDasharray="4 4"
                  fill="none"
                  name="Upper (P90)"
                />
                <Area
                  type="monotone"
                  dataKey="projected_cash_inr"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProjected)"
                  name="Projected"
                />
                <Area
                  type="monotone"
                  dataKey="p10_cash_inr"
                  stroke="#0284c7"
                  strokeDasharray="4 4"
                  fill="none"
                  name="Lower (P10)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Executive AI Brief */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-400" />
                <h3 className="font-semibold text-white text-sm">Finance Controller Brief</h3>
              </div>
              <Badge variant="purple">AI Generated</Badge>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Operational Health
                </div>
                <div className="text-sm font-semibold text-emerald-400 mt-0.5">
                  {executiveBrief.health_score || "EXCELLENT (94/100)"}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-300 mb-2">Key Executive Insights</div>
                <ul className="space-y-2">
                  {(
                    executiveBrief.key_insights || [
                      "UPI recovery ladder yields +38% success over standard card retries.",
                      "Reconciliation detected ₹2,140 MDR discrepancy under active review.",
                      "Net expected settlement will bridge working capital for Q4 inventory expansion.",
                    ]
                  ).map((insight: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab("finance")}
              className="w-full py-2 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/80 text-xs font-semibold text-sky-400 flex items-center justify-center gap-1.5"
            >
              <span>Inspect Controller Engine</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </Card>
      </div>

      {/* Lower Row: Active Anomalies + Approvals Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Anomalies & Risks */}
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <h3 className="font-semibold text-white text-sm">Defensive Anomaly Feed</h3>
            </div>
            <button
              onClick={() => onNavigateTab("risk")}
              className="text-xs text-sky-400 hover:text-sky-300"
            >
              View Risk Center →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {anomalies.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No active security anomalies detected. System operating within normal bounds.
              </p>
            ) : (
              anomalies.map((ano: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-300">{ano.type}</span>
                    <Badge variant={ano.severity === "HIGH" ? "danger" : "warning"}>
                      {ano.severity} SEVERITY
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300">{ano.description}</p>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-rose-900/30 pt-1">
                    <span>Action: {ano.mitigation}</span>
                    <span className="font-mono text-emerald-400">Autonomous Gated</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <StatusDot status={approvals.length > 0 ? "warning" : "idle"} />
              <h3 className="font-semibold text-white text-sm">
                Human-in-the-Loop Approvals ({approvals.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab("approvals")}
              className="text-xs text-sky-400 hover:text-sky-300"
            >
              Open Approvals Center →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {approvals.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                All autonomous agent proposals have been reviewed or are within policy thresholds.
              </p>
            ) : (
              approvals.slice(0, 3).map((req: any) => (
                <div
                  key={req.id}
                  className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300">{req.title}</span>
                    <span className="font-mono text-xs font-bold text-white">
                      {formatInr(req.amount)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{req.details}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-amber-900/30">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Trigger: {req.policy_triggered}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-400">
                      Pending Merchant Action
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
