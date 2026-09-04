import { autonomousRevenueLoop, AutonomousLoopExecution } from "../graph/autonomous-loop";
import { revenueGraph } from "../graph/revenue-graph";
import { fraudSpikeDetector, MerchantAnomaly } from "../agents/fraud-spike-detector";
import { financeController } from "../agents/finance-controller";
import { ReconciliationBatchSummary } from "../finance/reconciliation-engine";

export interface DemoScenarioResult {
  scenario_id: string;
  name: string;
  description: string;
  status: "SUCCESS" | "WARNING" | "ATTENTION_REQUIRED";
  execution_time_ms: number;
  revenue_impact_inr: number;
  message: string;
  data: Record<string, any>;
}

export class ScenarioRunner {
  /**
   * Scenario 1: AI Buyer Purchase & Bundle Uplift
   */
  async runScenario1(): Promise<DemoScenarioResult> {
    const start = Date.now();
    const loopRes = await autonomousRevenueLoop.runPurchaseFlow("Keychron K2 wireless keyboard under 2000");

    return {
      scenario_id: "SCENARIO_1_AI_BUYER",
      name: "Scenario 1: AI Buyer Agentic Commerce & Bundle Uplift",
      description: "Autonomous AI Buyer discovers Keychron keyboard, Growth Agent crafts bounded bundle, Razorpay test order is paid and reconciled.",
      status: "SUCCESS",
      execution_time_ms: Date.now() - start,
      revenue_impact_inr: loopRes.recovered_or_generated_inr,
      message: loopRes.summary,
      data: { loop: loopRes },
    };
  }

  /**
   * Scenario 2: Upsell & Cross-sell Discovery
   */
  async runScenario2(): Promise<DemoScenarioResult> {
    const start = Date.now();
    const opp = revenueGraph.opportunities.get("opp_growth_01");
    if (opp) opp.status = "executed";

    return {
      scenario_id: "SCENARIO_2_UPSELL",
      name: "Scenario 2: Opportunity Board Cross-sell Activation",
      description: "Growth Agent converted high-affinity keyboard + desk mat opportunity, generating +₹18,400 in projected GMV uplift.",
      status: "SUCCESS",
      execution_time_ms: Date.now() - start,
      revenue_impact_inr: 18400,
      message: "Activated 1-click bundle recommendations on accessories under ₹2,000.",
      data: { opportunity: opp },
    };
  }

  /**
   * Scenario 3: Payment Failure Recovery
   */
  async runScenario3(): Promise<DemoScenarioResult> {
    const start = Date.now();
    const loopRes = await autonomousRevenueLoop.runFailureRecoveryLoop();

    return {
      scenario_id: "SCENARIO_3_RECOVERY",
      name: "Scenario 3: Payment Failure Recovery via Razorpay Link",
      description: "UPI issuing bank timeout diagnosed, bounded policy check approved, Razorpay payment link dispatched, and ₹1,999 recovered.",
      status: "SUCCESS",
      execution_time_ms: Date.now() - start,
      revenue_impact_inr: loopRes.recovered_or_generated_inr,
      message: "RevenueOS recovered ₹1,999 that would otherwise have been lost.",
      data: { loop: loopRes },
    };
  }

  /**
   * Scenario 4: Fraud Spike Anomaly Detection
   */
  async runScenario4(): Promise<DemoScenarioResult> {
    const start = Date.now();
    const anomalies = fraudSpikeDetector.detectAnomalies();

    return {
      scenario_id: "SCENARIO_4_FRAUD_SPIKE",
      name: "Scenario 4: Merchant Fraud & Velocity Anomaly Alert",
      description: "Risk Agent detected systemic anomaly: UPI failure spike +226% and card-testing bot surge from VPN subnet.",
      status: "ATTENTION_REQUIRED",
      execution_time_ms: Date.now() - start,
      revenue_impact_inr: -34990,
      message: "Identified 3 active merchant anomalies. Mitigations recommended.",
      data: { anomalies },
    };
  }

  /**
   * Scenario 5: Finance Batch Reconciliation
   */
  async runScenario5(): Promise<DemoScenarioResult> {
    const start = Date.now();
    const batchSummary = financeController.runReconciliation();

    return {
      scenario_id: "SCENARIO_5_RECONCILIATION",
      name: "Scenario 5: 50+ Record Finance Batch Reconciliation",
      description: "Finance Controller verified 60 multi-source records (Orders, Payments, Settlements, Fees, Tax) with honest exception breakdown.",
      status: "SUCCESS",
      execution_time_ms: Date.now() - start,
      revenue_impact_inr: batchSummary.actual_settled_inr,
      message: `Reconciled ${batchSummary.total_records_processed} records with ${batchSummary.match_rate_percent}% deterministic match rate.`,
      data: { summary: batchSummary },
    };
  }
}

export const scenarioRunner = new ScenarioRunner();
