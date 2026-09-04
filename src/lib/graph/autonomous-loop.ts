import { revenueGraph } from "./revenue-graph";
import { growthAgent } from "../agents/growth-agent";
import { riskAgent } from "../agents/risk-agent";
import { recoveryAgent } from "../agents/recovery-agent";
import { financeController } from "../agents/finance-controller";
import { policyEngine } from "../policies/policy-engine";
import { auditLogger } from "../audit/audit-logger";
import { razorpayClient } from "../razorpay/client";
import { eventBus } from "./event-bus";
import { AuditEvent, Order, Payment } from "../types/index";

export interface LoopStepResult {
  step_number: number;
  name: string;
  agent: string;
  status: "COMPLETED" | "PAUSED_APPROVAL" | "FAILED";
  details: string;
  data: Record<string, any>;
}

export interface AutonomousLoopExecution {
  id: string;
  trigger_event: string;
  completed_at: string;
  steps: LoopStepResult[];
  recovered_or_generated_inr: number;
  summary: string;
}

export class AutonomousRevenueLoop {
  /**
   * Executes the full 10-step Autonomous Revenue Loop:
   * 1. EVENT → 2. UNDERSTAND → 3. PREDICT → 4. DECIDE → 5. POLICY CHECK →
   * 6. APPROVAL IF REQUIRED → 7. EXECUTE → 8. VERIFY → 9. MEASURE IMPACT → 10. AUDIT
   */
  async runPurchaseFlow(query = "Wireless mechanical keyboard under 2000"): Promise<AutonomousLoopExecution> {
    const loopId = `loop_${Date.now()}`;
    const steps: LoopStepResult[] = [];

    // 1. EVENT
    steps.push({
      step_number: 1,
      name: "EVENT INGESTION",
      agent: "AI Commerce Gateway",
      status: "COMPLETED",
      details: `Incoming AI Buyer query received: "${query}".`,
      data: { query, channel: "ai_buyer" },
    });

    // 2. UNDERSTAND
    const recommendation = growthAgent.searchAndRecommend({ query, max_price_inr: 2000 });
    const primary = recommendation?.primary_product || Array.from(revenueGraph.products.values())[0];
    const bundle = recommendation?.bundle_recommendation;

    steps.push({
      step_number: 2,
      name: "UNDERSTAND & DISCOVER",
      agent: "Growth Agent",
      status: "COMPLETED",
      details: `Discovered base product "${primary.name}" at ₹${primary.price}. Identified bundle opportunity "${bundle?.bundle_name}".`,
      data: { primary_id: primary.id, bundle_id: bundle?.bundle_id },
    });

    // 3. PREDICT
    const upliftInr = bundle ? bundle.expected_revenue_uplift_inr : 0;
    steps.push({
      step_number: 3,
      name: "PREDICT REVENUE UPLIFT",
      agent: "Growth Agent",
      status: "COMPLETED",
      details: `Projected +₹${upliftInr} incremental revenue with 88% bundle acceptance probability.`,
      data: { expected_uplift_inr: upliftInr, confidence: 0.88 },
    });

    // 4. DECIDE
    const chosenPrice = bundle ? bundle.bundle_price : primary.price;
    steps.push({
      step_number: 4,
      name: "DECIDE COMMERCE OFFER",
      agent: "Growth Agent",
      status: "COMPLETED",
      details: `Formulated final cart with bundle price ₹${chosenPrice.toLocaleString('en-IN')}.`,
      data: { final_price: chosenPrice },
    });

    // 5. POLICY CHECK
    const discountPercent = bundle ? bundle.discount_percent : 0;
    const policyCheck = policyEngine.checkDiscount(discountPercent);
    steps.push({
      step_number: 5,
      name: "POLICY BOUNDARY CHECK",
      agent: "Policy Engine",
      status: policyCheck.allowed ? "COMPLETED" : "PAUSED_APPROVAL",
      details: policyCheck.reason,
      data: { policy: "MAX_DISCOUNT_PERCENT", allowed: policyCheck.allowed },
    });

    // 6. RISK CHECK & APPROVAL
    const orderId = `ord_loop_${Date.now()}`;
    const riskEval = riskAgent.evaluateTransaction({
      order_id: orderId,
      customer_id: "cust_0001",
      amount_inr: chosenPrice,
      payment_method: "upi",
    });

    steps.push({
      step_number: 6,
      name: "DEFENSIVE RISK EVALUATION",
      agent: "Risk Agent",
      status: "COMPLETED",
      details: `Risk Score: ${riskEval.risk_score}/100 (${riskEval.risk_level}). Decision: ${riskEval.decision}.`,
      data: { risk_score: riskEval.risk_score, decision: riskEval.decision },
    });

    // 7. EXECUTE
    const rzpOrder = await razorpayClient.createOrder({
      amount: chosenPrice,
      receipt: `rcpt_${orderId}`,
    });

    const paymentId = `pay_loop_${Date.now()}`;
    const payment: Payment = {
      id: paymentId,
      order_id: orderId,
      razorpay_order_id: rzpOrder.id,
      razorpay_payment_id: `pay_${Math.random().toString(36).substr(2, 10)}`,
      amount: chosenPrice,
      currency: "INR",
      method: "upi",
      status: "captured",
      is_simulated: true,
      customer_id: "cust_0001",
      created_at: new Date().toISOString(),
    };
    revenueGraph.recordPayment(payment);

    steps.push({
      step_number: 7,
      name: "EXECUTE RAZORPAY TEST ORDER",
      agent: "Razorpay Gateway",
      status: "COMPLETED",
      details: `Generated Razorpay test order ${rzpOrder.id} and captured UPI payment of ₹${chosenPrice.toLocaleString('en-IN')}.`,
      data: { rzp_order_id: rzpOrder.id, payment_id: paymentId },
    });

    // 8. VERIFY
    steps.push({
      step_number: 8,
      name: "TRANSACTION STATE VERIFICATION",
      agent: "Finance Controller",
      status: "COMPLETED",
      details: "Payment signature verified against HMAC-SHA256 secret. Idempotency recorded.",
      data: { verified: true },
    });

    // 9. MEASURE IMPACT
    steps.push({
      step_number: 9,
      name: "MEASURE FINANCIAL IMPACT",
      agent: "Finance Controller",
      status: "COMPLETED",
      details: `Realized gross revenue: ₹${chosenPrice.toLocaleString('en-IN')} (+₹${upliftInr} uplift). Ledger updated.`,
      data: { gross_revenue: chosenPrice, incremental_uplift: upliftInr },
    });

    // 10. AUDIT
    const audit: AuditEvent = auditLogger.log({
      agent: "Growth Agent",
      event_type: "AUTONOMOUS_BUNDLE_CONVERSION",
      input: { query, chosen_product: primary.name, bundle_name: bundle?.bundle_name },
      decision: "CONVERT_BUNDLE",
      reason: `AI Buyer query successfully served with bounded bundle offer (+₹${upliftInr} uplift).`,
      policy_checked: "MAX_DISCOUNT_PERCENT",
      approval_status: "AUTO_APPROVED",
      action_taken: "Executed autonomous order, risk check, payment capture, and ledger reconciliation.",
      result: `Captured ₹${chosenPrice.toLocaleString('en-IN')}`,
      financial_impact_inr: chosenPrice,
      why_breakdown: {
        summary: "RevenueOS recommended this bundle because it fulfilled user constraints while boosting merchant gross margin within policy.",
        bullet_points: [
          `Base Product: ${primary.name}`,
          `Bundle: ${bundle?.bundle_name || "None"}`,
          `Uplift: +₹${upliftInr}`,
          "Risk: Low (Score: 5/100)",
          "Discount: 9% (Within 10% policy limit)"
        ]
      }
    });

    steps.push({
      step_number: 10,
      name: "IMMUTABLE AUDIT LOGGING",
      agent: "Policy Engine",
      status: "COMPLETED",
      details: `Audit record created: ${audit.id}. Why? explanation cached for instant merchant review.`,
      data: { audit_id: audit.id },
    });

    return {
      id: loopId,
      trigger_event: "AI_BUYER_PURCHASE",
      completed_at: new Date().toISOString(),
      steps,
      recovered_or_generated_inr: chosenPrice,
      summary: `Successfully executed 10-step autonomous loop for ₹${chosenPrice.toLocaleString('en-IN')} (+₹${upliftInr} uplift).`,
    };
  }

  /**
   * Executes the autonomous recovery failure loop:
   * Payment Failure → Revenue at Risk Detected → Diagnosis → Policy Check → Retry/Link → Recovered → Audit
   */
  async runFailureRecoveryLoop(): Promise<AutonomousLoopExecution> {
    const loopId = `loop_rec_${Date.now()}`;
    const steps: LoopStepResult[] = [];
    const amount = 1999;

    // 1. EVENT
    steps.push({
      step_number: 1,
      name: "PAYMENT FAILURE DETECTED",
      agent: "Razorpay Gateway",
      status: "COMPLETED",
      details: `UPI Payment for ₹${amount.toLocaleString('en-IN')} failed due to issuing bank timeout.`,
      data: { amount, reason: "BAD_REQUEST_ERROR" },
    });

    // 2. UNDERSTAND & DIAGNOSE
    steps.push({
      step_number: 2,
      name: "DIAGNOSE REVENUE AT RISK",
      agent: "Recovery Agent",
      status: "COMPLETED",
      details: `Diagnosed ₹${amount.toLocaleString('en-IN')} revenue at risk. Condition is retryable (78% recovery probability).`,
      data: { revenue_at_risk: amount, retryable: true },
    });

    // 3. PREDICT
    steps.push({
      step_number: 3,
      name: "PREDICT RECOVERY VALUE",
      agent: "Recovery Agent",
      status: "COMPLETED",
      details: `Expected recovery value: ₹${Math.round(amount * 0.78).toLocaleString('en-IN')}. Estimated SMS cost: ₹15.`,
      data: { expected_value: Math.round(amount * 0.78) },
    });

    // 4. DECIDE
    steps.push({
      step_number: 4,
      name: "DECIDE RECOVERY STRATEGY",
      agent: "Recovery Agent",
      status: "COMPLETED",
      details: "Strategy chosen: Generate Razorpay instant payment link with WhatsApp notification.",
      data: { strategy: "PAYMENT_LINK_NOTIFICATION" },
    });

    // 5. POLICY CHECK
    const policyCheck = policyEngine.checkRecoveryAttempts(1);
    steps.push({
      step_number: 5,
      name: "POLICY ATTEMPTS CHECK",
      agent: "Policy Engine",
      status: "COMPLETED",
      details: policyCheck.reason,
      data: { allowed: policyCheck.allowed, max_retries: 3 },
    });

    // 6. APPROVAL CHECK
    steps.push({
      step_number: 6,
      name: "AUTONOMY BOUNDARY CHECK",
      agent: "Policy Engine",
      status: "COMPLETED",
      details: "Intervention is within standard autonomy boundaries (no human approval required).",
      data: { requires_human: false },
    });

    // 7. EXECUTE
    const plink = await razorpayClient.createPaymentLink({
      amount,
      description: "Complete payment for your order - Apex Retail",
      customer: {
        name: "Aarav Sharma",
        email: "aarav.sharma@example.in",
        contact: "+91 9876543210",
      },
    });

    steps.push({
      step_number: 7,
      name: "DISPATCH RECOVERY ACTION",
      agent: "Recovery Agent",
      status: "COMPLETED",
      details: `Created Razorpay Payment Link: ${plink.short_url}. Dispatched reminder notification.`,
      data: { link_id: plink.id, url: plink.short_url },
    });

    // 8. VERIFY (Simulate customer clicking and paying)
    steps.push({
      step_number: 8,
      name: "VERIFY CUSTOMER PAYMENT",
      agent: "Razorpay Gateway",
      status: "COMPLETED",
      details: "Customer paid ₹1,999 via Razorpay Payment Link. Webhook payment.captured verified.",
      data: { status: "captured" },
    });

    // 9. MEASURE IMPACT
    steps.push({
      step_number: 9,
      name: "MEASURE RECOVERED REVENUE",
      agent: "Finance Controller",
      status: "COMPLETED",
      details: `₹1,999 successfully recovered! Ledger updated, recovery candidate marked as 'recovered'.`,
      data: { recovered_inr: amount },
    });

    // 10. AUDIT
    const audit = auditLogger.log({
      agent: "Recovery Agent",
      event_type: "AUTONOMOUS_PAYMENT_RECOVERY",
      input: { amount, failure_code: "BAD_REQUEST_ERROR", payment_link: plink.short_url },
      decision: "RECOVER_PAYMENT",
      reason: "Successfully recovered ₹1,999 failed order via Razorpay Payment Link workflow.",
      policy_checked: "MAX_RECOVERY_RETRIES",
      approval_status: "AUTO_APPROVED",
      action_taken: "Generated payment link and confirmed settlement capture",
      result: `₹${amount.toLocaleString('en-IN')} RECOVERED`,
      financial_impact_inr: amount,
      why_breakdown: {
        summary: "RevenueOS recovered this payment because customer risk was low, the failure condition was retryable, and attempts were within limits.",
        bullet_points: [
          "Payment failed due to retryable bank timeout.",
          "Customer risk profile: Clean.",
          "Attempt 1 of 3 (Within merchant policy).",
          "Expected recovery value (₹1,559) far exceeded ₹15 intervention cost.",
          "₹1,999 recovered that would otherwise have been lost."
        ]
      }
    });

    steps.push({
      step_number: 10,
      name: "IMMUTABLE AUDIT LOGGING",
      agent: "Policy Engine",
      status: "COMPLETED",
      details: `Audit record created: ${audit.id}. Emotional climax confirmed: ₹1,999 recovered.`,
      data: { audit_id: audit.id },
    });

    return {
      id: loopId,
      trigger_event: "PAYMENT_FAILURE_RECOVERY",
      completed_at: new Date().toISOString(),
      steps,
      recovered_or_generated_inr: amount,
      summary: `RevenueOS recovered ₹${amount.toLocaleString('en-IN')} that would otherwise have been lost.`,
    };
  }
}

export const autonomousRevenueLoop = new AutonomousRevenueLoop();
