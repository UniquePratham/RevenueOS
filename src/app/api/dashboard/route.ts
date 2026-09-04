import { NextResponse } from "next/server";
import { revenueGraph } from "@/lib/graph/revenue-graph";
import { financeController } from "@/lib/agents/finance-controller";
import { fraudSpikeDetector } from "@/lib/agents/fraud-spike-detector";
import { policyEngine } from "@/lib/policies/policy-engine";
import { approvalManager } from "@/lib/policies/approval-manager";
import { INITIAL_CATALOG } from "@/lib/data/catalog";
import { evaluationEngine } from "@/lib/evaluation/eval-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const summary = revenueGraph.getSummary();
  const anomalies = fraudSpikeDetector.detectAnomalies();
  const forecast = financeController.getCashForecast();
  const recon = financeController.runReconciliation();
  const policies = policyEngine.getPolicy();
  const approvals = approvalManager.getAllRequests();
  const auditTrail = revenueGraph.getRecentAudits(50);
  const opportunities = Array.from(revenueGraph.opportunities.values());
  const recoveries = Array.from(revenueGraph.recoveries.values());
  const riskEvents = Array.from(revenueGraph.riskEvents.values());
  const products = INITIAL_CATALOG;
  const evaluation = evaluationEngine.evaluateSystem();
  const executiveBrief = financeController.generateExecutiveBrief();

  return NextResponse.json({
    summary,
    anomalies,
    forecast,
    recon,
    policies,
    approvals,
    auditTrail,
    opportunities,
    recoveries,
    riskEvents,
    products,
    evaluation,
    executiveBrief,
  });
}
