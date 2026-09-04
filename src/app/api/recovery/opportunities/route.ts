import { NextResponse } from "next/server";
import { recoveryAgent } from "@/lib/agents/recovery-agent";

export async function GET() {
  const opportunities = recoveryAgent.getActiveOpportunities();
  return NextResponse.json({
    total_active_candidates: opportunities.length,
    opportunities,
  });
}
