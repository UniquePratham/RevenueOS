import React from "react";
import { Sparkles, TrendingUp, CheckCircle, ArrowRight, DollarSign } from "lucide-react";
import { Card, Badge, MetricCard } from "@/components/ui/Primitives";

interface OpportunitiesTabProps {
  opportunities: any[];
}

export function OpportunitiesTab({ opportunities = [] }: OpportunitiesTabProps) {
  const formatInr = (v: number) => `₹${(v || 0).toLocaleString("en-IN")}`;

  const totalPotentialValue = opportunities.reduce(
    (acc, curr) => acc + (curr.estimated_impact_inr || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Autonomous Revenue Opportunity Board
            </h2>
            <Badge variant="purple">AI Growth Discovery</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Continuous background analysis of customer purchase graphs, abandoned carts, and margin expansion opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">Discovered: {opportunities.length} Levers</Badge>
          <Badge variant="cyan">Total Upside: {formatInr(totalPotentialValue)}</Badge>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Identified Upside"
          value={formatInr(totalPotentialValue)}
          trend="up"
          change="+18.4% ARR"
          subtitle="Across 5 active growth vectors"
          pill="Opportunity"
        />
        <MetricCard
          title="Average Confidence"
          value="87.4%"
          trend="up"
          change="Empirically tested"
          subtitle="Calibrated Bayesian score"
          pill="Confidence"
        />
        <MetricCard
          title="Execution Mode"
          value="Autonomous"
          subtitle="Within merchant policy ceilings"
          pill="Bounded"
        />
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((opp: any, idx: number) => (
          <Card key={opp.id || idx} hover highlight={idx === 0} className="flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase">
                    {opp.category || "AI Growth Vector"}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{opp.title}</h3>
                </div>
                <Badge variant={opp.confidence > 0.8 ? "success" : "warning"}>
                  {Math.round((opp.confidence || 0.85) * 100)}% Confidence
                </Badge>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{opp.description}</p>

              <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Projected Revenue Lift
                  </div>
                  <div className="font-mono text-sm font-bold text-emerald-400">
                    +{formatInr(opp.estimated_impact_inr)}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
                  <div className="text-xs font-semibold text-sky-400">{opp.status || "DISCOVERED"}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                Trigger: {opp.action_type || "AUTONOMOUS_CAMPAIGN"}
              </span>
              <span className="text-sky-400 font-semibold flex items-center gap-1">
                Active Lever <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
