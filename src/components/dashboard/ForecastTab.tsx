import React, { useState } from "react";
import { TrendingUp, Calendar, AlertCircle, ArrowUpRight, DollarSign } from "lucide-react";
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
  forecast: any[];
}

export function ForecastTab({ forecast = [] }: ForecastTabProps) {
  const [horizon, setHorizon] = useState<number>(30);

  const displayData = forecast.slice(0, horizon);
  const formatInr = (v: number) => `₹${(v || 0).toLocaleString("en-IN")}`;

  const currentProjected = displayData[displayData.length - 1]?.projected_cash_inr || 0;
  const currentP90 = displayData[displayData.length - 1]?.p90_cash_inr || 0;
  const currentP10 = displayData[displayData.length - 1]?.p10_cash_inr || 0;

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title={`Day ${horizon} Projected Cash`}
          value={formatInr(currentProjected)}
          trend="up"
          change="Expected Base"
          subtitle="Net after gateway deductions"
          pill="Projected"
        />
        <MetricCard
          title={`Optimistic P90 Horizon`}
          value={formatInr(currentP90)}
          trend="up"
          change="+12% Upside"
          subtitle="Higher recovery & conversion"
          pill="P90 High"
        />
        <MetricCard
          title={`Conservative P10 Floor`}
          value={formatInr(currentP10)}
          trend="neutral"
          change="Worst-case buffer"
          subtitle="Elevated UPI timeouts & returns"
          pill="P10 Floor"
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
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1 text-sky-400">
              <span className="h-2 w-2 rounded-full bg-sky-400" /> Projected
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="h-2 w-2 rounded-full border border-sky-600 border-dashed" /> Confidence Bounds
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(s) => s.slice(5)} />
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
                formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
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
        </div>
      </Card>
    </div>
  );
}
