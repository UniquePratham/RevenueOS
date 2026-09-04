import { RecoveryCandidate, RecoveryStatus } from "../types/index";
import { revenueGraph } from "../graph/revenue-graph";
import { policyEngine } from "../policies/policy-engine";
import { razorpayClient } from "../razorpay/client";

export interface RecoveryExecutionResult {
  candidate_id: string;
  previous_status: RecoveryStatus;
  current_status: RecoveryStatus;
  action_executed: string;
  payment_link_url?: string;
  is_recovered: boolean;
  message: string;
  audit_details: Record<string, any>;
}

export class RevenueRecoveryAgent {
  /**
   * Evaluates all active recovery candidates in the revenue graph
   */
  getActiveOpportunities(): RecoveryCandidate[] {
    return Array.from(revenueGraph.recoveries.values()).filter(
      r => r.status !== "recovered" && r.status !== "exhausted" && r.status !== "blocked_by_policy"
    );
  }

  /**
   * Executes the autonomous recovery ladder for a specific candidate
   * DETECT → DIAGNOSE → DECIDE → ACT → VERIFY → STOP
   */
  async executeRecoveryStep(candidateId: string): Promise<RecoveryExecutionResult> {
    const candidate = revenueGraph.recoveries.get(candidateId);
    if (!candidate) {
      throw new Error(`Recovery candidate ${candidateId} not found`);
    }

    const previousStatus = candidate.status;

    // 1. POLICY CHECK: Check max retry limits
    const policyCheck = policyEngine.checkRecoveryAttempts(candidate.attempts);
    if (!policyCheck.allowed) {
      candidate.status = "exhausted";
      candidate.updated_at = new Date().toISOString();
      candidate.recovery_history.push({
        step: "STOP_ENFORCED",
        timestamp: new Date().toISOString(),
        status: "halted",
        details: policyCheck.reason,
      });

      return {
        candidate_id: candidate.id,
        previous_status: previousStatus,
        current_status: "exhausted",
        action_executed: "HALT_ATTEMPTS",
        is_recovered: false,
        message: policyCheck.reason,
        audit_details: { reason: "MAX_RETRY_CEILING_REACHED" },
      };
    }

    // 2. DIAGNOSE & DECIDE
    candidate.attempts += 1;
    candidate.updated_at = new Date().toISOString();

    if (candidate.attempts === 1 && candidate.failure_code === "BAD_REQUEST_ERROR") {
      // Step 1: Background retry with smart routing
      const simulatedRecoverySuccess = Math.random() < candidate.recovery_probability;
      if (simulatedRecoverySuccess) {
        candidate.status = "recovered";
        candidate.recovery_history.push({
          step: "AUTO_RETRY_EXECUTED",
          timestamp: new Date().toISOString(),
          status: "success",
          details: `Smart routing retry succeeded. Recovered ₹${candidate.amount.toLocaleString('en-IN')}.`,
        });

        // Update payment and order in graph
        const payment = revenueGraph.payments.get(candidate.payment_id);
        if (payment) payment.status = "captured";
        const order = revenueGraph.orders.get(candidate.order_id);
        if (order) order.status = "paid";

        return {
          candidate_id: candidate.id,
          previous_status: previousStatus,
          current_status: "recovered",
          action_executed: "SMART_RETRY",
          is_recovered: true,
          message: `Successfully recovered ₹${candidate.amount.toLocaleString('en-IN')} via Razorpay Smart Routing.`,
          audit_details: { recovered_amount: candidate.amount, strategy: "background_retry" },
        };
      } else {
        candidate.status = "retry_scheduled";
        candidate.recovery_history.push({
          step: "AUTO_RETRY_ATTEMPTED",
          timestamp: new Date().toISOString(),
          status: "failed",
          details: "First automated network retry failed. Escalating to Instant Payment Link.",
        });
      }
    }

    // Step 2: Generate Razorpay Payment Link & dispatch via SMS/WhatsApp
    const paymentLink = await razorpayClient.createPaymentLink({
      amount: candidate.amount,
      description: `Recover order ${candidate.order_id} - Apex Retail`,
      customer: {
        name: candidate.customer_name,
        email: candidate.customer_email,
        contact: candidate.customer_phone,
      },
      notify: { sms: true, email: true, whatsapp: true },
      reminder_enable: true,
    });

    candidate.payment_link_id = paymentLink.id;
    candidate.payment_link_url = paymentLink.short_url;
    candidate.status = "payment_link_sent";
    candidate.recovery_history.push({
      step: "PAYMENT_LINK_DISPATCHED",
      timestamp: new Date().toISOString(),
      status: "pending_customer_action",
      details: `Generated Razorpay payment link ${paymentLink.short_url} and sent multichannel notifications.`,
    });

    return {
      candidate_id: candidate.id,
      previous_status: previousStatus,
      current_status: "payment_link_sent",
      action_executed: "GENERATE_PAYMENT_LINK",
      payment_link_url: paymentLink.short_url,
      is_recovered: false,
      message: `Razorpay payment link ${paymentLink.short_url} generated and dispatched to ${candidate.customer_name}.`,
      audit_details: { payment_link_id: paymentLink.id, attempts: candidate.attempts },
    };
  }

  /**
   * Marks a payment link as paid by the customer (simulated or real webhook)
   */
  completeRecovery(candidateId: string): RecoveryCandidate {
    const candidate = revenueGraph.recoveries.get(candidateId);
    if (!candidate) throw new Error(`Candidate ${candidateId} not found`);

    candidate.status = "recovered";
    candidate.updated_at = new Date().toISOString();
    candidate.recovery_history.push({
      step: "PAYMENT_LINK_COMPLETED",
      timestamp: new Date().toISOString(),
      status: "success",
      details: `Customer completed payment via link. Recovered ₹${candidate.amount.toLocaleString('en-IN')}.`,
    });

    // Update graph
    const payment = revenueGraph.payments.get(candidate.payment_id);
    if (payment) payment.status = "captured";
    const order = revenueGraph.orders.get(candidate.order_id);
    if (order) order.status = "paid";

    return candidate;
  }
}

export const recoveryAgent = new RevenueRecoveryAgent();
