import { describe, it, expect } from "vitest";
import { reconciliationEngine } from "../src/lib/finance/reconciliation-engine";
import { generateCashForecast } from "../src/lib/finance/cash-forecast";
import { autonomousRevenueLoop } from "../src/lib/graph/autonomous-loop";
import { scenarioRunner } from "../src/lib/simulation/scenario-runner";
import { failureInjector } from "../src/lib/simulation/failure-injector";
import { evaluationEngine } from "../src/lib/evaluation/eval-engine";
import { whyExplainer } from "../src/lib/agents/why-explainer";

describe("Batch 4: Finance, Loop, Simulation & ML Evaluation", () => {
  it("should process 50+ batch records in reconciliation engine", () => {
    const res = reconciliationEngine.processBatch();
    expect(res.total_records_processed).toBeGreaterThanOrEqual(50);
    expect(res.match_rate_percent).toBeGreaterThan(60);
    expect(res.matched_count).toBeGreaterThan(0);
    expect(res.records.length).toBeGreaterThanOrEqual(50);
  });

  it("should generate 30-day cash forecast with upper and lower bounds", () => {
    const forecast = generateCashForecast();
    expect(forecast.forecast_days.length).toBe(30);
    expect(forecast.next_7d_net_inr).toBeGreaterThan(0);
    expect(forecast.next_30d_net_inr).toBeGreaterThan(forecast.next_7d_net_inr);
    for (const d of forecast.forecast_days) {
      expect(d.upper_bound).toBeGreaterThanOrEqual(d.expected_net);
      expect(d.lower_bound).toBeLessThanOrEqual(d.expected_net);
    }
  });

  it("should execute 10-step autonomous purchase loop and produce explainable audit", async () => {
    const res = await autonomousRevenueLoop.runPurchaseFlow();
    expect(res.steps.length).toBe(10);
    expect(res.recovered_or_generated_inr).toBeGreaterThan(0);
    expect(res.steps[9].data.audit_id).toBeDefined();

    // Verify "Why?" explanation
    const why = whyExplainer.explainAudit(res.steps[9].data.audit_id);
    expect(why.headline).toContain("Growth Agent");
    expect(why.evidence_points.length).toBeGreaterThan(0);
  });

  it("should execute preconfigured hackathon demo scenarios", async () => {
    const sc1 = await scenarioRunner.runScenario1();
    expect(sc1.status).toBe("SUCCESS");

    const sc3 = await scenarioRunner.runScenario3();
    expect(sc3.status).toBe("SUCCESS");
    expect(sc3.revenue_impact_inr).toBe(1999);

    const sc5 = await scenarioRunner.runScenario5();
    expect(sc5.status).toBe("SUCCESS");
  });

  it("should inject and safely handle failures", async () => {
    // Duplicate webhook
    const dupRes = await failureInjector.injectDuplicateWebhook();
    expect(dupRes.is_handled_gracefully).toBe(true);
    expect(dupRes.system_response).toBe("Duplicate webhook detected — ignored safely.");

    // Policy violation
    const polRes = failureInjector.injectPolicyViolation();
    expect(polRes.is_handled_gracefully).toBe(true);
    expect(polRes.ui_badge).toBe("BLOCKED_BY_POLICY");
  });

  it("should calculate real ML evaluation metrics and economic impact", () => {
    const report = evaluationEngine.evaluateSystem();
    expect(report.risk_model_evaluation.precision).toBeGreaterThan(0.5);
    expect(report.risk_model_evaluation.recall).toBeGreaterThan(0.5);
    expect(report.risk_model_evaluation.f1_score).toBeGreaterThan(0.5);
    expect(report.risk_model_evaluation.confusion_matrix.true_positive).toBeGreaterThan(0);
    expect(report.risk_model_evaluation.confusion_matrix.true_negative).toBeGreaterThan(0);
    expect(report.risk_model_evaluation.economic_impact.net_fraud_savings_inr).toBeGreaterThan(0);
  });
});
