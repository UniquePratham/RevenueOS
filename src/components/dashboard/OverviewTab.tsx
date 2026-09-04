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
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const summary = data?.summary || {};
  const rawForecastDays = Array.isArray(data?.forecast)
    ? data.forecast
    : Array.isArray(data?.forecast?.forecast_days)
    ? data.forecast.forecast_days
    : [];

  const forecast = rawForecastDays.map((d: any) => ({
    ...d,
    date: d.date || `Day ${d.day_offset ?? 0}`,
    projected_cash_inr: d.projected_cash_inr ?? d.expected_net ?? 0,
    p90_cash_inr: d.p90_cash_inr ?? d.upper_bound ?? (d.expected_net ? Math.round(d.expected_net * 1.12) : 0),
    p10_cash_inr: d.p10_cash_inr ?? d.lower_bound ?? (d.expected_net ? Math.round(d.expected_net * 0.88) : 0),
  }));

  const recon = data?.recon || {};
  const rawAnomalies = data?.anomalies || [];
  const anomalies = rawAnomalies.map((ano: any) => ({
    ...ano,
    title: ano.metric_name || ano.type || "Telemetry Anomaly",
    description: ano.possible_cause || ano.description || "Unusual telemetry spike observed",
    mitigation: ano.recommended_merchant_action || ano.mitigation || "Review and enforce rate limits",
  }));
  const approvals = (data?.approvals || []).filter((a: any) => a.status === "PENDING");
  const executiveBrief = data?.executiveBrief || {};

  const formatInr = (val: number) => `₹${(val || 0).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      {/* Merchant Twin Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E3DDD2] bg-[#FFF9EC] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">DIGITAL REVENUE TWIN ACTIVE</Badge>
              <span className="text-xs text-[#6B6862] font-mono">ID: mch_electrogear_01</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#141413]">
              ElectroGear Pro — Autonomous Command Center
            </h1>
            <p className="mt-1 text-xs text-[#6B6862] max-w-2xl leading-relaxed">
              Unified control plane orchestrating Agentic Commerce, Defensive Risk, Failure Recovery,
              and Automated Reconciliation. Guardrailed by bounded merchant autonomy policies.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onRunDemo("SCENARIO_1_AI_BUYER")}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#EB001B] hover:bg-[#D40018] text-xs font-semibold text-[#FFF9EC] transition-all shadow-sm active:translate-y-0.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Simulate AI Buyer</span>
            </button>
            <button
              onClick={() => onNavigateTab("simulation")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E3DDD2] bg-[#F5EFE2] hover:bg-[#EFE8DA] text-xs font-semibold text-[#141413] transition-all"
            >
              <Zap className="h-3.5 w-3.5 text-[#D97706]" />
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
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3DDD2]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#141413] text-sm">30-Day Cash Flow Projection</h3>
                <Badge variant="default">Confidence: 90%</Badge>
              </div>
              <p className="text-xs text-[#6B6862] mt-0.5">
                Monte Carlo adjusted for Razorpay T+2 settlement cycles and projected UPI recovery rates.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("forecast")}
              className="text-xs text-[#141413] hover:text-[#EB001B] flex items-center gap-1 font-semibold"
            >
              <span>Full Model</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="h-64 w-full pt-4">
            {isMounted && forecast.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#141413" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#141413" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3DDD2" />
                  <XAxis
                    dataKey="date"
                    stroke="#6B6862"
                    fontSize={10}
                    tickFormatter={(str) => (typeof str === "string" && str.length >= 10 ? str.slice(5) : str)}
                  />
                  <YAxis
                    stroke="#6B6862"
                    fontSize={10}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFF9EC",
                      borderColor: "#E3DDD2",
                      borderRadius: "12px",
                      color: "#141413",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(20, 20, 19, 0.08)",
                    }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="p90_cash_inr"
                    stroke="#6B6862"
                    strokeDasharray="4 4"
                    fill="none"
                    name="Upper (P90)"
                  />
                  <Area
                    type="monotone"
                    dataKey="projected_cash_inr"
                    stroke="#141413"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorProjected)"
                    name="Projected"
                  />
                  <Area
                    type="monotone"
                    dataKey="p10_cash_inr"
                    stroke="#6B6862"
                    strokeDasharray="4 4"
                    fill="none"
                    name="Lower (P10)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#6B6862]">
                Hydrating Monte Carlo simulation bands...
              </div>
            )}
          </div>
        </Card>

        {/* Executive AI Brief */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DDD2]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#141413]" />
                <h3 className="font-semibold text-[#141413] text-sm">Finance Controller Brief</h3>
              </div>
              <Badge variant="purple">AI Generated</Badge>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-[#F5EFE2] p-3 border border-[#E3DDD2]">
                <div className="text-[11px] font-bold text-[#6B6862] uppercase tracking-wider">
                  Operational Health
                </div>
                <div className="text-sm font-bold text-[#1E824C] mt-0.5">
                  {executiveBrief.health_score || "EXCELLENT (94/100)"}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-[#141413] mb-2">Key Executive Insights</div>
                <ul className="space-y-2">
                  {(
                    executiveBrief.key_insights || [
                      "UPI recovery ladder yields +38% success over standard card retries.",
                      "Reconciliation detected ₹2,140 MDR discrepancy under active review.",
                      "Net expected settlement will bridge working capital for Q4 inventory expansion.",
                    ]
                  ).map((insight: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#6B6862]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#EB001B] mt-1.5 shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E3DDD2]">
            <button
              onClick={() => onNavigateTab("finance")}
              className="w-full py-2 rounded-full border border-[#E3DDD2] bg-[#F5EFE2] hover:bg-[#EFE8DA] text-xs font-semibold text-[#141413] flex items-center justify-center gap-1.5 transition-all"
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
          <div className="flex items-center justify-between pb-3 border-b border-[#E3DDD2]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#EB001B]" />
              <h3 className="font-semibold text-[#141413] text-sm">Defensive Anomaly Feed</h3>
            </div>
            <button
              onClick={() => onNavigateTab("risk")}
              className="text-xs text-[#141413] hover:text-[#EB001B] font-semibold"
            >
              View Risk Center →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {anomalies.length === 0 ? (
              <p className="text-xs text-[#6B6862] py-4 text-center">
                No active security anomalies detected. System operating within normal bounds.
              </p>
            ) : (
              anomalies.map((ano: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#F3C7C9] bg-[#FBEAEB] p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#EB001B]">{ano.title}</span>
                    <Badge variant={ano.severity === "HIGH" || ano.severity === "CRITICAL" ? "danger" : "warning"}>
                      {ano.severity} SEVERITY
                    </Badge>
                  </div>
                  <p className="text-xs text-[#141413]">{ano.description}</p>
                  <div className="text-[11px] text-[#6B6862] flex items-center justify-between border-t border-[#F3C7C9] pt-1.5">
                    <span>Action: {ano.mitigation}</span>
                    <span className="font-mono text-[#1E824C] font-semibold">Autonomous Gated</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-[#E3DDD2]">
            <div className="flex items-center gap-2">
              <StatusDot status={approvals.length > 0 ? "warning" : "idle"} />
              <h3 className="font-semibold text-[#141413] text-sm">
                Human-in-the-Loop Approvals ({approvals.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab("approvals")}
              className="text-xs text-[#141413] hover:text-[#EB001B] font-semibold"
            >
              Open Approvals Center →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {approvals.length === 0 ? (
              <p className="text-xs text-[#6B6862] py-4 text-center">
                All autonomous agent proposals have been reviewed or are within policy thresholds.
              </p>
            ) : (
              approvals.slice(0, 3).map((req: any) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-[#FDE68A] bg-[#FEF3C7] p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#B45309]">{req.title}</span>
                    <span className="font-mono text-xs font-bold text-[#141413]">
                      {formatInr(req.amount)}
                    </span>
                  </div>
                  <p className="text-xs text-[#141413] line-clamp-2">{req.details}</p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-[#FDE68A]">
                    <span className="text-[10px] text-[#6B6862] font-mono">
                      Trigger: {req.policy_triggered}
                    </span>
                    <span className="text-[11px] font-semibold text-[#B45309]">
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
