import { describe, it, expect } from "vitest";
import { revenueGraph } from "../src/lib/graph/revenue-graph";
import { policyEngine } from "../src/lib/policies/policy-engine";
import { approvalManager } from "../src/lib/policies/approval-manager";
import { SYNTHETIC_DATA } from "../src/lib/data/synthetic-seed";

describe("Batch 2: Domain Models, Seed Data, and Policy Engine", () => {
  it("should have seeded over 500 customers and 1000 orders", () => {
    expect(SYNTHETIC_DATA.customers.length).toBeGreaterThanOrEqual(500);
    expect(SYNTHETIC_DATA.orders.length).toBeGreaterThanOrEqual(1000);
    expect(SYNTHETIC_DATA.payments.length).toBeGreaterThanOrEqual(1500);
    expect(SYNTHETIC_DATA.failed_payments.length).toBeGreaterThanOrEqual(100);
  });

  it("should calculate correct summary on MerchantRevenueGraph", () => {
    const summary = revenueGraph.getSummary();
    expect(summary.realized_revenue_inr).toBeGreaterThan(0);
    expect(summary.revenue_at_risk_inr).toBeGreaterThan(0);
    expect(summary.recovered_revenue_inr).toBeGreaterThan(0);
    expect(summary.recovery_rate_percent).toBeGreaterThan(50);
    expect(summary.reconciliation_match_rate_percent).toBeGreaterThan(70);
  });

  it("should enforce bounded autonomy policies", () => {
    // Automatic refund limit is ₹2,000
    const refundSmall = policyEngine.checkRefund(1500);
    expect(refundSmall.allowed).toBe(true);
    expect(refundSmall.requires_approval).toBe(false);

    const refundBig = policyEngine.checkRefund(4500);
    expect(refundBig.allowed).toBe(false);
    expect(refundBig.requires_approval).toBe(true);
    expect(refundBig.reason).toContain("Requires Merchant Approval");

    // Discount limit is 10%
    const discountSmall = policyEngine.checkDiscount(8);
    expect(discountSmall.allowed).toBe(true);

    const discountBig = policyEngine.checkDiscount(15);
    expect(discountBig.allowed).toBe(false);
    expect(discountBig.requires_approval).toBe(true);

    // Max 3 recovery retries
    expect(policyEngine.checkRecoveryAttempts(1).allowed).toBe(true);
    expect(policyEngine.checkRecoveryAttempts(3).allowed).toBe(false);
  });

  it("should handle approval workflows", () => {
    const pending = approvalManager.getPendingRequests();
    expect(pending.length).toBeGreaterThan(0);

    const first = pending[0];
    const approved = approvalManager.approve(first.id);
    expect(approved.status).toBe("APPROVED");
    expect(approved.resolved_at).toBeDefined();
  });
});
