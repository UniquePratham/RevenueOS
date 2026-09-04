import { NextRequest, NextResponse } from "next/server";
import { scenarioRunner } from "@/lib/simulation/scenario-runner";
import { FailureInjector } from "@/lib/simulation/failure-injector";

const failureInjector = new FailureInjector();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, scenario_id, failure_type } = body;

  if (action === "run_scenario") {
    const runners: Record<string, () => Promise<any>> = {
      SCENARIO_1_AI_BUYER: () => scenarioRunner.runScenario1(),
      SCENARIO_2_UPSELL: () => scenarioRunner.runScenario2(),
      SCENARIO_3_RECOVERY: () => scenarioRunner.runScenario3(),
      SCENARIO_4_FRAUD_SPIKE: () => scenarioRunner.runScenario4(),
      SCENARIO_5_RECONCILIATION: () => scenarioRunner.runScenario5(),
    };

    const runner = runners[scenario_id];
    if (!runner) {
      return NextResponse.json({ error: `Unknown scenario: ${scenario_id}` }, { status: 400 });
    }

    const result = await runner();
    return NextResponse.json(result);
  }

  if (action === "inject_failure") {
    const injectors: Record<string, () => Promise<any> | any> = {
      DUPLICATE_WEBHOOK: () => failureInjector.injectDuplicateWebhook(),
      HIGH_RISK_TRANSACTION: () => failureInjector.injectHighRiskAnomaly(),
      POLICY_VIOLATION: () => failureInjector.injectPolicyViolation(),
      GATEWAY_TIMEOUT: () => failureInjector.injectGatewayTimeout(),
    };

    const injector = injectors[failure_type];
    if (!injector) {
      return NextResponse.json({ error: `Unknown failure type: ${failure_type}` }, { status: 400 });
    }

    const result = await injector();
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
