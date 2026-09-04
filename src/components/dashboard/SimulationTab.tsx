import React, { useState } from "react";
import { Zap, Play, AlertOctagon, CheckCircle2, ShieldAlert, RotateCcw, Scale, ShoppingCart } from "lucide-react";
import { Card, Badge, MetricCard } from "@/components/ui/Primitives";

interface SimulationTabProps {
  onRefresh: () => void;
}

export function SimulationTab({ onRefresh }: SimulationTabProps) {
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [scenarioResult, setScenarioResult] = useState<any>(null);

  const [injectingFailure, setInjectingFailure] = useState<string | null>(null);
  const [failureResult, setFailureResult] = useState<any>(null);

  const scenarios = [
    {
      id: "SCENARIO_1_AI_BUYER",
      title: "Scenario 1: AI Buyer Autonomous Purchase",
      description: "External AI agent discovers Keychron K2, checks bounded discount (5%), calls Razorpay Payment Intent, captures order into graph.",
      icon: ShoppingCart,
      badge: "Commerce Loop",
    },
    {
      id: "SCENARIO_2_UPSELL",
      title: "Scenario 2: Intelligent Upsell & Bundle Offer",
      description: "Customer purchasing Keychron K2 receives autonomous bundle suggestion for Desk Mat + Wrist Rest at 10% policy-gated discount.",
      icon: Zap,
      badge: "Growth Uplift",
    },
    {
      id: "SCENARIO_3_RECOVERY",
      title: "Scenario 3: Failed Payment Recovery Ladder",
      description: "Simulates UPI transaction failure, diagnoses decline reason, and executes Step 4 of the autonomous recovery ladder.",
      icon: RotateCcw,
      badge: "Revenue Recovery",
    },
    {
      id: "SCENARIO_4_FRAUD_SPIKE",
      title: "Scenario 4: Defensive Fraud Spike & Velocity Gating",
      description: "Rapid-fire botnet attempts card-testing swipes; Defensive Risk Agent scores 88/100 and blocks transactions before Razorpay capture.",
      icon: ShieldAlert,
      badge: "Defensive Risk",
    },
    {
      id: "SCENARIO_5_RECONCILIATION",
      title: "Scenario 5: 3-Way Reconciliation & Discrepancy Gate",
      description: "Finance Controller runs 3-way match across internal ledger, Razorpay settlement batch, and nodal bank ledger statement.",
      icon: Scale,
      badge: "Finance Controller",
    },
  ];

  const failures = [
    {
      id: "DUPLICATE_WEBHOOK",
      title: "Duplicate Webhook Replay",
      description: "Delivers the identical Razorpay payment.captured webhook twice to prove idempotent deduplication.",
      badge: "Idempotency",
    },
    {
      id: "HIGH_RISK_TRANSACTION",
      title: "High-Risk Fraud Anomaly (₹48,999)",
      description: "Injects an anomalous 22x order basket from fresh IP. Verifies automatic block / human review gating.",
      badge: "Fraud Trap",
    },
    {
      id: "POLICY_VIOLATION",
      title: "Policy Autonomy Violation (₹7,500 Refund)",
      description: "Agent attempts ₹7,500 automatic refund against ₹2,000 policy limit. Proves hard stop & routing to Approvals.",
      badge: "Boundary Enforcement",
    },
    {
      id: "GATEWAY_TIMEOUT",
      title: "Upstream Gateway 504 Timeout",
      description: "Simulates Razorpay upstream failure; verifies graceful circuit breaker fallback to deterministic event simulation.",
      badge: "Circuit Breaker",
    },
  ];

  const handleRunScenario = async (scenarioId: string) => {
    setRunningScenario(scenarioId);
    setScenarioResult(null);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run_scenario", scenario_id: scenarioId }),
      });
      const data = await res.json();
      setScenarioResult(data);
      onRefresh();
    } catch (e: any) {
      setScenarioResult({ error: e.message });
    } finally {
      setRunningScenario(null);
    }
  };

  const handleInjectFailure = async (failureType: string) => {
    setInjectingFailure(failureType);
    setFailureResult(null);
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "inject_failure", failure_type: failureType }),
      });
      const data = await res.json();
      setFailureResult(data);
      onRefresh();
    } catch (e: any) {
      setFailureResult({ error: e.message });
    } finally {
      setInjectingFailure(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DDD2] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#141413] tracking-tight flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#EB001B]" />
              Demo Scenarios & Failure Injection Sandbox
            </h2>
            <Badge variant="warning">Interactive Testing Suite</Badge>
          </div>
          <p className="text-xs text-[#6B6862] mt-1">
            Execute 5 full-lifecycle business scenarios and 4 adversarial failure injections to stress-test idempotency, policy boundaries, and resilience.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral">Deterministic Seed 421337</Badge>
        </div>
      </div>

      {/* 5 Canonical Business Scenarios */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#141413] flex items-center gap-2">
          <Play className="h-4 w-4 text-[#141413] fill-[#141413]" />
          5 Canonical Autonomous Revenue Scenarios
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scen) => {
            const Icon = scen.icon;
            const isRunning = runningScenario === scen.id;

            return (
              <Card key={scen.id} hover className="flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-xl bg-[#F5EFE2] text-[#141413] border border-[#E3DDD2]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="purple">{scen.badge}</Badge>
                  </div>

                  <h4 className="font-bold text-sm text-[#141413]">{scen.title}</h4>
                  <p className="text-xs text-[#6B6862] leading-relaxed">{scen.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E3DDD2]">
                  <button
                    onClick={() => handleRunScenario(scen.id)}
                    disabled={isRunning}
                    className="w-full py-2.5 rounded-full bg-[#141413] hover:bg-[#2C2A29] text-[#FFF9EC] font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:translate-y-0.5"
                  >
                    <Play className="h-3 w-3 fill-[#FFF9EC]" />
                    <span>{isRunning ? "Executing Loop..." : "Run Scenario"}</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Scenario Execution Result Terminal */}
      {scenarioResult && (
        <Card highlight className="space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3DDD2]">
            <h4 className="font-bold text-xs text-[#1E824C] flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Scenario Execution Telemetry
            </h4>
            <span className="text-[10px] font-mono text-[#6B6862]">Autonomous Trace</span>
          </div>
          <pre className="rounded-2xl bg-[#141413] p-4 text-[11px] font-mono text-[#FFF9EC] overflow-x-auto border border-[#141413] max-h-60">
            {JSON.stringify(scenarioResult, null, 2)}
          </pre>
        </Card>
      )}

      {/* 4 Adversarial Failure Injections */}
      <div className="space-y-3 pt-4 border-t border-[#E3DDD2]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#141413] flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-[#EB001B]" />
            Adversarial Failure Injection & Chaos Testing
          </h3>
          <span className="text-xs text-[#6B6862]">Verify system doesn't crash or leak funds</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {failures.map((fail) => {
            const isInjecting = injectingFailure === fail.id;

            return (
              <Card key={fail.id} hover className="flex flex-col justify-between border-[#EB001B]/30 bg-[#FFF9EC]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#EB001B] uppercase font-bold">
                      {fail.badge}
                    </span>
                    <Badge variant="danger">Adversarial</Badge>
                  </div>

                  <h4 className="font-bold text-xs text-[#141413]">{fail.title}</h4>
                  <p className="text-[11px] text-[#6B6862] leading-relaxed">{fail.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E3DDD2]">
                  <button
                    onClick={() => handleInjectFailure(fail.id)}
                    disabled={isInjecting}
                    className="w-full py-2.5 rounded-full bg-[#EB001B] hover:bg-[#D40018] text-[#FFF9EC] font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:translate-y-0.5"
                  >
                    <AlertOctagon className="h-3 w-3" />
                    <span>{isInjecting ? "Injecting Fault..." : "Inject Failure"}</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Failure Injection Result Terminal */}
      {failureResult && (
        <Card highlight className="space-y-2 border-[#EB001B]/40 bg-[#FFF9EC]">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3DDD2]">
            <h4 className="font-bold text-xs text-[#EB001B] flex items-center gap-1.5">
              <AlertOctagon className="h-4 w-4" />
              Fault Injection Defense Trace
            </h4>
            <Badge
              variant={
                failureResult.ui_badge === "HANDLED_SAFELY"
                  ? "success"
                  : failureResult.ui_badge === "BLOCKED_BY_POLICY"
                  ? "purple"
                  : "warning"
              }
            >
              {failureResult.ui_badge || "VERIFIED"}
            </Badge>
          </div>
          <div className="p-4 bg-[#F5EFE2] rounded-2xl border border-[#E3DDD2] text-xs space-y-2">
            <div className="text-[#141413]">
              <span className="font-bold text-[#6B6862]">Simulated Fault:</span>{" "}
              {failureResult.simulated_event}
            </div>
            <div className="text-[#1E824C]">
              <span className="font-bold text-[#6B6862]">System Defense Response:</span>{" "}
              {failureResult.system_response}
            </div>
            <div className="text-[11px] font-mono text-[#6B6862] pt-2 border-t border-[#E3DDD2]">
              Gracefully Handled:{" "}
              <span className="text-[#1E824C] font-bold">
                {failureResult.is_handled_gracefully ? "YES (Pass)" : "NO"}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
