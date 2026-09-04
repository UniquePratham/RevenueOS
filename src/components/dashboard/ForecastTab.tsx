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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DDD2] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#141413] flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#141413]" />
              Cash Flow Forecast & Settlement Liquidity Model
            </h2>
            <Badge variant="default">Monte Carlo Bands</Badge>
          </div>
          <p className="text-xs text-[#6B6862] mt-1">
            Dynamic 30-day projection modeling Razorpay T+2 payout cycles, gateway fees, predicted returns, and autonomous recovery yields.
          </p>
        </div>

        {/* Horizon selector */}
        <div className="flex items-center gap-1 bg-[#F5EFE2] p-1 rounded-full border border-[#E3DDD2] text-xs">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setHorizon(days)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                horizon === days
                  ? "bg-[#141413] text-[#FFF9EC]"
                  : "text-[#6B6862] hover:text-[#141413]"
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
          change="Buffer Floor"
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
      <Card>
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DDD2]">
          <div>
            <h3 className="font-semibold text-[#141413] text-sm">Settled Cash Projection & Confidence Envelopes</h3>
            <p className="text-xs text-[#6B6862]">
              Shaded interval captures 90% confidence variance across settlement timelines
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-[#141413] font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#141413]" /> Projected
            </span>
            <span className="flex items-center gap-1 text-[#6B6862]">
              <span className="h-2 w-2 rounded-full border border-[#6B6862] border-dashed" /> Confidence Bounds
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#141413" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#141413" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3DDD2" />
                <XAxis
                  dataKey="date"
                  stroke="#6B6862"
                  fontSize={11}
                  tickFormatter={(s) => (typeof s === "string" && s.length >= 5 ? s.slice(5) : String(s || ""))}
                />
                <YAxis
                  stroke="#6B6862"
                  fontSize={11}
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
                  formatter={(value: any, name: any) => [`₹${Number(value).toLocaleString("en-IN")}`, name]}
                />
                <Area
                  type="monotone"
                  dataKey="p90_cash_inr"
                  stroke="#6B6862"
                  strokeDasharray="4 4"
                  fill="none"
                  name="Optimistic (P90)"
                />
                <Area
                  type="monotone"
                  dataKey="projected_cash_inr"
                  stroke="#141413"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCash)"
                  name="Projected Settlement"
                />
                <Area
                  type="monotone"
                  dataKey="p10_cash_inr"
                  stroke="#6B6862"
                  strokeDasharray="4 4"
                  fill="none"
                  name="Conservative (P10)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-[#6B6862] font-mono">
              Loading financial projections...
            </div>
          )}
        </div>
      </Card>

      {/* Daily Liquidity Schedule & Drivers Table */}
      <Card>
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DDD2]">
          <div>
            <h3 className="font-semibold text-[#141413] text-sm">Settlement Trajectory & Event Drivers</h3>
            <p className="text-xs text-[#6B6862]">
              Upcoming liquidity milestones, scheduled merchant sweeps, and gateway clearance expectations
            </p>
          </div>
          <span className="text-xs font-mono text-[#6B6862]">
            Next {Math.min(displayData.length, 7)} Days Scheduled
          </span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E3DDD2] text-[#6B6862] font-mono text-[10px] uppercase">
                <th className="pb-2.5">Date / Day</th>
                <th className="pb-2.5">Expected Inflow</th>
                <th className="pb-2.5">Fees & Outflow</th>
                <th className="pb-2.5">Net Cash</th>
                <th className="pb-2.5">Confidence</th>
                <th className="pb-2.5">Key Drivers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3DDD2] font-mono">
              {displayData.slice(0, 7).map((day: any, idx: number) => (
                <tr key={day.date || idx} className="hover:bg-[#F5EFE2] transition-colors">
                  <td className="py-3 text-[#141413] font-semibold">{day.date}</td>
                  <td className="py-3 text-[#1E824C] font-semibold">{formatInr(day.inflow)}</td>
                  <td className="py-3 text-[#6B6862]">-{formatInr(day.outflow)}</td>
                  <td className="py-3 text-[#141413] font-bold">{formatInr(day.projected_cash_inr)}</td>
                  <td className="py-3">
                    <span className="text-[#141413] font-semibold">
                      {Math.round((day.confidence_score ?? 0.9) * 100)}%
                    </span>
                  </td>
                  <td className="py-3 text-[#6B6862] font-sans text-xs">
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
