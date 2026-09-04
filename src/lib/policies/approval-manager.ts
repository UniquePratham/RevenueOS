import { ApprovalRequest, ApprovalType } from "../types/index";
import { eventBus } from "../graph/event-bus";

class ApprovalManager {
  private requests: Map<string, ApprovalRequest> = new Map();

  constructor() {
    this.seedInitialRequests();
  }

  private seedInitialRequests() {
    this.createRequest({
      type: "REFUND",
      title: "High-Value Refund Request: ₹12,000",
      amount: 12000,
      details: "Customer requested full refund on Sony WH-1000XM5 headphones citing package damage during courier transit.",
      reason: "Action exceeds merchant autonomy boundary (₹12,000 > ₹2,000 automatic limit).",
      policy_triggered: "MAX_AUTOMATIC_REFUND",
      action_payload: { order_id: "ord_demo_981", refund_amount: 12000, customer_id: "cust_82" }
    });

    this.createRequest({
      type: "HIGH_RISK_TRANSACTION",
      title: "Flagged High-Risk Transaction: ₹34,990",
      amount: 34990,
      details: "Multiple high-velocity card swipes from fresh IP with shipping address mismatch.",
      reason: "Risk score 84/100 exceeds threshold; transaction amount is 4.8x customer baseline.",
      policy_triggered: "HIGH_VALUE_REVIEW_THRESHOLD",
      action_payload: { payment_id: "pay_risk_flag_01", order_id: "ord_demo_982", customer_id: "cust_191" }
    });

    this.createRequest({
      type: "BUDGET_INCREASE",
      title: "Campaign Budget Expansion: ₹8,500/day",
      amount: 8500,
      details: "Growth Agent proposes increasing festival flash deal bundle budget to capture 2.8x expected uplift.",
      reason: "Requested budget ₹8,500/day exceeds configured daily campaign limit (₹5,000/day).",
      policy_triggered: "MAX_DAILY_CAMPAIGN_BUDGET",
      action_payload: { campaign_name: "Diwali Early Tech Bundles", proposed_budget: 8500 }
    });

    this.createRequest({
      type: "SETTLEMENT_DISCREPANCY",
      title: "Settlement Fee Anomaly Discrepancy: ₹2,140",
      amount: 2140,
      details: "Finance Controller identified mismatched MDR fee deductions across 12 UPI settlement transactions.",
      reason: "Settled net payout is ₹2,140 below expected ledger reconciliation amount.",
      policy_triggered: "SETTLEMENT_RECONCILIATION_TOLERANCE",
      action_payload: { settlement_id: "setl_disc_091", discrepancy: 2140 }
    });
  }

  createRequest(params: {
    type: ApprovalType;
    title: string;
    amount: number;
    details: string;
    reason: string;
    policy_triggered: string;
    action_payload: Record<string, any>;
  }): ApprovalRequest {
    const id = `appr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const request: ApprovalRequest = {
      id,
      ...params,
      status: "PENDING",
      created_at: new Date().toISOString(),
    };
    this.requests.set(id, request);
    eventBus.publish("APPROVAL_CREATED", request);
    return request;
  }

  getAllRequests(): ApprovalRequest[] {
    return Array.from(this.requests.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  getPendingRequests(): ApprovalRequest[] {
    return this.getAllRequests().filter(r => r.status === "PENDING");
  }

  approve(id: string): ApprovalRequest {
    const req = this.requests.get(id);
    if (!req) throw new Error(`Approval request ${id} not found`);

    req.status = "APPROVED";
    req.resolved_at = new Date().toISOString();
    eventBus.publish("APPROVAL_RESOLVED", { request: req, decision: "APPROVED" });
    return req;
  }

  reject(id: string, reason?: string): ApprovalRequest {
    const req = this.requests.get(id);
    if (!req) throw new Error(`Approval request ${id} not found`);

    req.status = "REJECTED";
    req.resolved_at = new Date().toISOString();
    if (reason) req.reason = `${req.reason} | Rejection rationale: ${reason}`;
    eventBus.publish("APPROVAL_RESOLVED", { request: req, decision: "REJECTED" });
    return req;
  }

  edit(id: string, editedValue: any): ApprovalRequest {
    const req = this.requests.get(id);
    if (!req) throw new Error(`Approval request ${id} not found`);

    req.status = "EDITED";
    req.edited_value = editedValue;
    req.resolved_at = new Date().toISOString();
    eventBus.publish("APPROVAL_RESOLVED", { request: req, decision: "EDITED", editedValue });
    return req;
  }
}

export const approvalManager = new ApprovalManager();
