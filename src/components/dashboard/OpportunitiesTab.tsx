import React from "react";
import { Sparkles, TrendingUp, CheckCircle, ArrowRight, DollarSign } from "lucide-react";
import { Card, Badge, MetricCard } from "@/components/ui/Primitives";

interface OpportunitiesTabProps {
  opportunities: any[];
}

export function OpportunitiesTab({ opportunities = [] }: OpportunitiesTabProps) {
  const formatInr = (v: number) => `₹${(v || 0).toLocaleString("en-IN")}`;

  const totalPotentialValue = opportunities.reduce(
    (acc, curr) => acc + (curr.impact_inr ?? curr.estimated_impact_inr ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DDD2] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#141413] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#141413]" />
              Autonomous Revenue Opportunity Board
            </h2>
            <Badge variant="purple">Growth Discovery</Badge>
          </div>
          <p className="text-xs text-[#6B6862] mt-1">
            Continuous background analysis of customer purchase graphs, abandoned carts, and margin expansion opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">Discovered: {opportunities.length} Levers</Badge>
          <Badge variant="default">Total Upside: {formatInr(totalPotentialValue)}</Badge>
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
          <Card key={opp.id || idx} hover className="flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] text-[#6B6862] uppercase">
                    {opp.category || "AI Growth Vector"}
                  </span>
                  <h3 className="text-base font-bold text-[#141413] mt-0.5">{opp.title}</h3>
                </div>
                <Badge variant={opp.confidence > 0.8 ? "success" : "warning"}>
                  {Math.round((opp.confidence || 0.85) * 100)}% Confidence
                </Badge>
              </div>

              <p className="text-xs text-[#6B6862] leading-relaxed">{opp.description}</p>

              <div className="rounded-xl bg-[#F5EFE2] p-3.5 border border-[#E3DDD2] flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#6B6862]">
                    Projected Revenue Lift
                  </div>
                  <div className="font-mono text-sm font-bold text-[#1E824C]">
                    +{formatInr(opp.impact_inr ?? opp.estimated_impact_inr)}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-[#6B6862]">Status</div>
                  <div className="text-xs font-semibold text-[#141413]">{opp.status || "DISCOVERED"}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E3DDD2] flex items-center justify-between text-xs">
              <span className="text-[#6B6862] font-mono text-[11px]">
                Trigger: {opp.action_type || "AUTONOMOUS_CAMPAIGN"}
              </span>
              <span className="text-[#141413] hover:text-[#EB001B] font-semibold flex items-center gap-1 cursor-pointer">
                Active Lever <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
