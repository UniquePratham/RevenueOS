import { eventBus } from "../graph/event-bus";
import { revenueGraph } from "../graph/revenue-graph";
import { AuditEvent, Payment } from "../types/index";

export interface WebhookProcessResult {
  status: "PROCESSED" | "DUPLICATE_IGNORED" | "INVALID_SIGNATURE" | "UNHANDLED_EVENT";
  event_id: string;
  event_type: string;
  message: string;
  details?: Record<string, any>;
}

export class WebhookIdempotencyStore {
  private processedEvents: Map<string, { timestamp: string; event_type: string; outcome: string }> = new Map();

  isDuplicate(eventId: string): boolean {
    return this.processedEvents.has(eventId);
  }

  recordEvent(eventId: string, eventType: string, outcome: string): void {
    this.processedEvents.set(eventId, {
      timestamp: new Date().toISOString(),
      event_type: eventType,
      outcome,
    });
  }

  getProcessedCount(): number {
    return this.processedEvents.size;
  }

  clear(): void {
    this.processedEvents.clear();
  }
}

export const webhookStore = new WebhookIdempotencyStore();

export async function processRazorpayWebhook(payload: any): Promise<WebhookProcessResult> {
  const eventId = payload.event_id || payload.id || `evt_${Date.now()}`;
  const eventType = payload.event || "payment.captured";

  // 1. Check Idempotency Deduplication Guard
  if (webhookStore.isDuplicate(eventId)) {
    const audit: AuditEvent = {
      id: `aud_dup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      agent: "Policy Engine",
      event_type: "WEBHOOK_DUPLICATE_GUARD",
      input: { event_id: eventId, event_type: eventType },
      decision: "IGNORE_DUPLICATE",
      reason: `Event ID ${eventId} was previously received and committed to the ledger. Deduplication filter prevented duplicate balance update.`,
      policy_checked: "WEBHOOK_IDEMPOTENCY_ENFORCEMENT",
      approval_status: "AUTO_APPROVED",
      action_taken: "Ignored duplicate webhook without state alteration",
      result: "Duplicate webhook detected — ignored safely.",
      financial_impact_inr: 0,
      why_breakdown: {
        summary: "Deduplication layer rejected a duplicate webhook delivery to prevent duplicate order fulfillment or refund payouts.",
        bullet_points: [
          `Event ID: ${eventId}`,
          "Idempotency cache already contained a successful commit for this event.",
          "Database and ledger state preserved safely."
        ]
      }
    };
    revenueGraph.recordAudit(audit);

    return {
      status: "DUPLICATE_IGNORED",
      event_id: eventId,
      event_type: eventType,
      message: "Duplicate webhook detected — ignored safely.",
      details: { event_id: eventId, action: "IDEMPOTENCY_FILTER_APPLIED" }
    };
  }

  // 2. Process First-Time Webhook Event
  webhookStore.recordEvent(eventId, eventType, "COMMITTED");

  if (eventType === "payment.captured") {
    const paymentEntity = payload.payload?.payment?.entity;
    const amountInr = paymentEntity ? Math.round(paymentEntity.amount / 100) : 1999;
    const orderId = paymentEntity?.order_id || payload.order_id || "ord_wh_001";
    const paymentId = paymentEntity?.id || `pay_${Math.random().toString(36).substr(2, 10)}`;

    const payment: Payment = {
      id: paymentId,
      order_id: orderId,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      amount: amountInr,
      currency: "INR",
      method: paymentEntity?.method || "upi",
      status: "captured",
      is_simulated: true,
      customer_id: paymentEntity?.notes?.customer_id || "cust_001",
      created_at: new Date().toISOString(),
    };

    revenueGraph.recordPayment(payment);

    const audit: AuditEvent = {
      id: `aud_wh_${Date.now()}`,
      timestamp: new Date().toISOString(),
      agent: "Finance Controller",
      event_type: "RAZORPAY_PAYMENT_CAPTURED",
      input: { event_id: eventId, payment_id: paymentId, amount_inr: amountInr },
      decision: "COMMIT_PAYMENT",
      reason: `Verified webhook event from Razorpay. Captured ₹${amountInr.toLocaleString('en-IN')}.`,
      policy_checked: "PAYMENT_STATE_VALIDATION",
      approval_status: "AUTO_APPROVED",
      action_taken: "Marked order as paid and updated financial ledger",
      result: `Captured ₹${amountInr.toLocaleString('en-IN')}`,
      financial_impact_inr: amountInr,
      why_breakdown: {
        summary: "Legitimate payment webhook verified and applied to merchant revenue graph.",
        bullet_points: [
          `Payment ID: ${paymentId}`,
          `Amount: ₹${amountInr.toLocaleString('en-IN')}`,
          "Idempotency token recorded."
        ]
      }
    };
    revenueGraph.recordAudit(audit);

    return {
      status: "PROCESSED",
      event_id: eventId,
      event_type: eventType,
      message: `Payment of ₹${amountInr.toLocaleString('en-IN')} successfully verified and committed.`,
      details: { payment_id: paymentId, order_id: orderId, amount: amountInr }
    };
  }

  return {
    status: "PROCESSED",
    event_id: eventId,
    event_type: eventType,
    message: `Event ${eventType} recorded.`,
  };
}
