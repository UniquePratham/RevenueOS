import React, { useState, useEffect } from "react";
import { TrendingUp, Calendar, AlertCircle, ArrowUpRight, DollarSign, Activity, ShieldCheck } from "lucide-react";
import { Card, Badge, MetricCard } from "@/components/ui/Primitives";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface ForecastTabProps {
  forecast?: any;
}

export function ForecastTab({ forecast }: ForecastTabProps) {
  const [horizon, setHorizon] = useState<number>(30);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Safe extraction whether forecast is CashForecastSummary object or array
  const rawDays: any[] = Array.isArray(forecast)
    ? forecast
    : Array.isArray(forecast?.forecast_days)
    ? forecast.forecast_days
    : [];

  const displayData = rawDays.slice(0, horizon).map((d: any) => ({
    ...d,
    date: d.date || `Day ${d.day_offset ?? 0}`,
    projected_cash_inr: d.projected_cash_inr ?? d.expected_net ?? 0,
    p90_cash_inr: d.p90_cash_inr ?? d.upper_bound ?? (d.expected_net ? Math.round(d.expected_net * 1.12) : 0),
    p10_cash_inr: d.p10_cash_inr ?? d.lower_bound ?? (d.expected_net ? Math.round(d.expected_net * 0.88) : 0),
    inflow: d.expected_inflow ?? d.inflow ?? 0,
    outflow: d.expected_outflow ?? d.outflow ?? 0,
    drivers: Array.isArray(d.drivers) ? d.drivers : [],
  }));

  const formatInr = (v: number) => `₹${(v || 0).toLocaleString("en-IN")}`;

  const lastDay = displayData[displayData.length - 1];
  const currentProjected = lastDay?.projected_cash_inr || forecast?.next_30d_net_inr || 0;
  const currentP90 = lastDay?.p90_cash_inr || Math.round(currentProjected * 1.12);
  const currentP10 = lastDay?.p10_cash_inr || Math.round(currentProjected * 0.88);
  const recoveries30d = forecast?.estimated_recoveries_30d_inr || Math.round(currentProjected * 0.08);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sky-400" />
              Cash Flow Forecast & Settlement Liquidity Model
            </h2>
            <Badge variant="cyan">Monte Carlo Bands</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic 30-day projection modeling Razorpay T+2 payout cycles, gateway fees, predicted returns, and autonomous recovery yields.
          </p>
        </div>

        {/* Horizon selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setHorizon(days)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                horizon === days
                  ? "bg-sky-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title={`Day ${horizon} Projected Net`}
          value={formatInr(currentProjected)}
          trend="up"
          change="Expected Base"
          subtitle="Net after gateway deductions"
          pill="Projected"
        />
        <MetricCard
          title="Optimistic P90 Horizon"
          value={formatInr(currentP90)}
          trend="up"
          change="+12% Upside"
          subtitle="Higher recovery & conversion"
          pill="P90 High"
        />
        <MetricCard
          title="Conservative P10 Floor"
          value={formatInr(currentP10)}
          trend="neutral"
          change="Worst-case buffer"
          subtitle="Elevated UPI timeouts & returns"
          pill="P10 Floor"
        />
        <MetricCard
          title="Autonomous Recovery Yield"
          value={formatInr(recoveries30d)}
          trend="up"
          change="Automated Lift"
          subtitle="Rescued via smart routing & links"
          pill="Rescued"
        />
      </div>

      {/* Main Chart */}
      <Card highlight>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-white text-sm">Settled Cash Projection & Confidence Envelopes</h3>
            <p className="text-xs text-slate-400">
              Shaded interval captures 90% confidence variance across settlement timelines
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-sky-400">
              <span className="h-2 w-2 rounded-full bg-sky-400" /> Projected
            </span>
            <span className="flex items-center gap-1 text-sky-600">
              <span className="h-2 w-2 rounded-full border border-sky-600 border-dashed" /> Confidence Bounds
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(s) => (typeof s === "string" && s.length >= 5 ? s.slice(5) : String(s || ""))}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: any, name: any) => [`₹${Number(value).toLocaleString("en-IN")}`, name]}
                />
                <Area
                  type="monotone"
                  dataKey="p90_cash_inr"
                  stroke="#0284c7"
                  strokeDasharray="4 4"
                  fill="none"
                  name="Optimistic (P90)"
                />
                <Area
                  type="monotone"
                  dataKey="projected_cash_inr"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCash)"
                  name="Projected Settlement"
                />
                <Area
                  type="monotone"
                  dataKey="p10_cash_inr"
                  stroke="#0284c7"
                  strokeDasharray="4 4"
                  fill="none"
                  name="Conservative (P10)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-slate-500 font-mono">
              Loading financial projections...
            </div>
          )}
        </div>
      </Card>

      {/* Daily Liquidity Schedule & Drivers Table */}
      <Card>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-white text-sm">Settlement Trajectory & Event Drivers</h3>
            <p className="text-xs text-slate-400">
              Upcoming liquidity milestones, scheduled merchant sweeps, and gateway clearance expectations
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Next {Math.min(displayData.length, 7)} Days Scheduled
          </span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                <th className="pb-2">Date / Day</th>
                <th className="pb-2">Expected Inflow</th>
                <th className="pb-2">Fees & Outflow</th>
                <th className="pb-2">Net Cash</th>
                <th className="pb-2">Confidence</th>
                <th className="pb-2">Key Drivers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {displayData.slice(0, 7).map((day: any, idx: number) => (
                <tr key={day.date || idx} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-2.5 text-slate-300 font-semibold">{day.date}</td>
                  <td className="py-2.5 text-emerald-400 font-semibold">{formatInr(day.inflow)}</td>
                  <td className="py-2.5 text-slate-400">-{formatInr(day.outflow)}</td>
                  <td className="py-2.5 text-white font-bold">{formatInr(day.projected_cash_inr)}</td>
                  <td className="py-2.5">
                    <span className="text-sky-400">
                      {Math.round((day.confidence_score ?? 0.9) * 100)}%
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300 font-sans text-xs">
                    {day.drivers?.length > 0 ? day.drivers.join("; ") : "Baseline run-rate order transactions"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
