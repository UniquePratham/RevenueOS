import { describe, it, expect } from "vitest";
import { razorpayClient } from "../src/lib/razorpay/client";
import { processRazorpayWebhook, webhookStore } from "../src/lib/razorpay/webhooks";
import { growthAgent } from "../src/lib/agents/growth-agent";
import { riskAgent } from "../src/lib/agents/risk-agent";
import { recoveryAgent } from "../src/lib/agents/recovery-agent";
import { revenueGraph } from "../src/lib/graph/revenue-graph";

describe("Batch 3: Agents & Integrations", () => {
  it("should create Razorpay order in test/simulation mode", async () => {
    const order = await razorpayClient.createOrder({
      amount: 1999,
      receipt: "test_rcpt_01",
    });
    expect(order.id).toBeDefined();
    expect(order.amount).toBe(199900); // in paise
    expect(order.currency).toBe("INR");
  });

  it("should handle webhook idempotency and ignore duplicate events", async () => {
    webhookStore.clear();
    const eventId = "evt_test_dedup_101";
    const payload = {
      event_id: eventId,
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_test_dedup_01",
            amount: 199900,
            order_id: "ord_test_01",
            method: "upi",
          },
        },
      },
    };

    // First time should process
    const res1 = await processRazorpayWebhook(payload);
    expect(res1.status).toBe("PROCESSED");

    // Second time with identical eventId must be ignored safely
    const res2 = await processRazorpayWebhook(payload);
    expect(res2.status).toBe("DUPLICATE_IGNORED");
    expect(res2.message).toBe("Duplicate webhook detected — ignored safely.");
  });

  it("should recommend product and bundles via Growth Agent", () => {
    const rec = growthAgent.searchAndRecommend({
      query: "wireless keyboard under 2000",
      max_price_inr: 2000,
    });
    expect(rec).not.toBeNull();
    expect(rec?.primary_product.name).toContain("Keyboard");
    expect(rec?.bundle_recommendation).toBeDefined();
    expect(rec?.bundle_recommendation?.bundle_price).toBeLessThanOrEqual(2000);
    expect(rec?.bundle_recommendation?.within_policy).toBe(true);
    expect(rec?.explanation).toBeDefined();
  });

  it("should calculate explainable risk scores via Defensive Risk Agent", () => {
    // Normal transaction
    const normal = riskAgent.evaluateTransaction({
      order_id: "ord_test_normal",
      customer_id: "cust_0001",
      amount_inr: 1499,
      payment_method: "upi",
    });
    expect(normal.risk_score).toBeLessThan(50);
    expect(normal.decision).toBe("APPROVE");
    expect(normal.signals.length).toBeGreaterThan(0);

    // Anomalous transaction: 15x customer baseline
    const anomaly = riskAgent.evaluateTransaction({
      order_id: "ord_test_anomaly",
      customer_id: "cust_0001",
      amount_inr: 45000,
      payment_method: "card",
    });
    expect(anomaly.risk_score).toBeGreaterThanOrEqual(60);
    expect(["REVIEW", "BLOCK"]).toContain(anomaly.decision);
    expect(anomaly.reasons.some(r => r.includes("baseline"))).toBe(true);
  });

  it("should execute recovery ladder and enforce max retry stops", async () => {
    const activeCandidates = recoveryAgent.getActiveOpportunities();
    expect(activeCandidates.length).toBeGreaterThan(0);

    const candidate = activeCandidates[0];
    candidate.attempts = 0;
    candidate.status = "detected";

    // Step 1: Execute step
    const step1 = await recoveryAgent.executeRecoveryStep(candidate.id);
    expect(step1.action_executed).toBeDefined();

    // Step 2: Force max attempts reached to test boundary stop
    candidate.attempts = 3;
    const stepStop = await recoveryAgent.executeRecoveryStep(candidate.id);
    expect(stepStop.current_status).toBe("exhausted");
    expect(stepStop.action_executed).toBe("HALT_ATTEMPTS");
  });
});
