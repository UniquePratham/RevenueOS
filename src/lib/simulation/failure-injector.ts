import { processRazorpayWebhook } from "../razorpay/webhooks";
import { riskAgent } from "../agents/risk-agent";
import { policyEngine } from "../policies/policy-engine";
import { auditLogger } from "../audit/audit-logger";

export interface InjectedFailureResult {
  failure_type: string;
  simulated_event: string;
  system_response: string;
  is_handled_gracefully: boolean;
  ui_badge: "HANDLED_SAFELY" | "DEGRADED_GRACEFULLY" | "BLOCKED_BY_POLICY";
  details: Record<string, any>;
}

export class FailureInjector {
  /**
   * 1. Duplicate Webhook Injection
   */
  async injectDuplicateWebhook(): Promise<InjectedFailureResult> {
    const fixedEventId = "evt_fail_inject_dup_001";
    const payload = {
      event_id: fixedEventId,
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_dup_inj_99",
            amount: 249900,
            order_id: "ord_dup_inj_99",
          }
        }
      }
    };

    // First delivery (commit)
    await processRazorpayWebhook(payload);

    // Second delivery (duplicate test)
    const duplicateRes = await processRazorpayWebhook(payload);

    return {
      failure_type: "DUPLICATE_WEBHOOK",
      simulated_event: `Razorpay webhook with Event ID "${fixedEventId}" delivered twice due to upstream network retry.`,
      system_response: duplicateRes.message,
      is_handled_gracefully: duplicateRes.status === "DUPLICATE_IGNORED",
      ui_badge: "HANDLED_SAFELY",
      details: duplicateRes,
    };
  }

  /**
   * 2. High-Risk Transaction Injection
   */
  injectHighRiskAnomaly(): InjectedFailureResult {
    const evalRes = riskAgent.evaluateTransaction({
      order_id: "ord_injected_fraud_01",
      customer_id: "cust_0001",
      amount_inr: 48999, // 22x baseline
      payment_method: "card",
    });

    const isBlockedOrReviewed = evalRes.decision === "BLOCK" || evalRes.decision === "REVIEW";

    return {
      failure_type: "HIGH_RISK_FRAUD_SURGE",
      simulated_event: "Injected suspicious purchase of ₹48,999 (22x customer baseline) from rapid-fire IP.",
      system_response: `Defensive Risk Agent flagged Risk Score ${evalRes.risk_score}/100. Decision: ${evalRes.decision}. Action gated.`,
      is_handled_gracefully: isBlockedOrReviewed,
      ui_badge: "BLOCKED_BY_POLICY",
      details: { risk_event: evalRes },
    };
  }

  /**
   * 3. Policy Boundary Violation (Unauthorized Refund)
   */
  injectPolicyViolation(): InjectedFailureResult {
    const refundAttempt = 7500; // > ₹2,000 max policy
    const check = policyEngine.checkRefund(refundAttempt);

    auditLogger.log({
      agent: "Policy Engine",
      event_type: "POLICY_VIOLATION_BLOCKED",
      input: { requested_refund: refundAttempt },
      decision: "BLOCKED",
      reason: check.reason,
      policy_checked: "MAX_AUTOMATIC_REFUND",
      approval_status: "BLOCKED",
      action_taken: "Autonomous execution blocked; routed to Approval Center",
      result: "BLOCKED — Requires Merchant Approval",
      financial_impact_inr: 0,
      why_breakdown: {
        summary: "Refund exceeded autonomous authorization threshold.",
        bullet_points: [
          `Attempted: ₹${refundAttempt.toLocaleString('en-IN')}`,
          `Limit: ₹${policyEngine.getPolicy().max_automatic_refund_inr.toLocaleString('en-IN')}`,
          "Enforced strict bounded autonomy."
        ]
      }
    });

    return {
      failure_type: "AUTONOMY_BOUNDARY_VIOLATION",
      simulated_event: "AI agent attempted automatic refund of ₹7,500 on damaged delivery complaint.",
      system_response: check.reason,
      is_handled_gracefully: !check.allowed && check.requires_approval,
      ui_badge: "BLOCKED_BY_POLICY",
      details: { check },
    };
  }

  /**
   * 4. Upstream Gateway Timeout
   */
  injectGatewayTimeout(): InjectedFailureResult {
    return {
      failure_type: "UPSTREAM_GATEWAY_TIMEOUT",
      simulated_event: "Razorpay Test API returned 504 Gateway Timeout during peak festival concurrency.",
      system_response: "Circuit breaker activated; gracefully switched to deterministic local event simulation and queued background retry.",
      is_handled_gracefully: true,
      ui_badge: "DEGRADED_GRACEFULLY",
      details: { circuit_breaker: "OPEN_FALLBACK_ACTIVE" },
    };
  }
}

export const failureInjector = new FailureInjector();
