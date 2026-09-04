import {
  Customer,
  Order,
  Payment,
  Product,
  RecoveryCandidate,
  ReconciliationRecord,
  SettlementRecord,
  RiskEvent,
  RevenueOpportunity,
  AuditEvent,
  MerchantPolicy
} from "../types/index";
import { INITIAL_CATALOG } from "../data/catalog";
import { SYNTHETIC_DATA } from "../data/synthetic-seed";
import { eventBus } from "./event-bus";
import { policyEngine } from "../policies/policy-engine";

export interface RevenueGraphSummary {
  realized_revenue_inr: number;
  revenue_at_risk_inr: number;
  recovered_revenue_inr: number;
  fraud_prevented_inr: number;
  recovery_rate_percent: number;
  reconciliation_match_rate_percent: number;
  expected_settlement_inr: number;
  ai_revenue_uplift_inr: number;
  active_customers_count: number;
  total_orders_count: number;
  total_payments_count: number;
  pending_approvals_count: number;
}

export class MerchantRevenueGraph {
  public products: Map<string, Product> = new Map();
  public customers: Map<string, Customer> = new Map();
  public orders: Map<string, Order> = new Map();
  public payments: Map<string, Payment> = new Map();
  public riskEvents: Map<string, RiskEvent> = new Map();
  public recoveries: Map<string, RecoveryCandidate> = new Map();
  public settlements: Map<string, SettlementRecord> = new Map();
  public reconciliations: Map<string, ReconciliationRecord> = new Map();
  public opportunities: Map<string, RevenueOpportunity> = new Map();
  public auditTrail: AuditEvent[] = [];

  constructor() {
    this.hydrateFromSeed();
    this.initializeOpportunities();
  }

  private hydrateFromSeed() {
    // Load catalog
    for (const p of INITIAL_CATALOG) {
      this.products.set(p.id, { ...p });
    }

    // Load synthetic seed
    for (const c of SYNTHETIC_DATA.customers) {
      this.customers.set(c.id, { ...c });
    }
    for (const o of SYNTHETIC_DATA.orders) {
      this.orders.set(o.id, { ...o });
    }
    for (const p of SYNTHETIC_DATA.payments) {
      this.payments.set(p.id, { ...p });
    }
    for (const r of SYNTHETIC_DATA.recovery_candidates) {
      this.recoveries.set(r.id, { ...r });
    }
    for (const s of SYNTHETIC_DATA.settlements) {
      this.settlements.set(s.id, { ...s });
    }
    for (const rec of SYNTHETIC_DATA.reconciliation_records) {
      this.reconciliations.set(rec.id, { ...rec });
    }
  }

  private initializeOpportunities() {
    const opps: RevenueOpportunity[] = [
      {
        id: "opp_growth_01",
        title: "₹18,400 potential revenue from bundle cross-sell",
        description: "Growth Agent identified high affinity between Wireless Keyboards and Felt Desk Mats with 38% conversion potential.",
        impact_inr: 18400,
        confidence: 0.88,
        agent: "growth",
        recommended_action: "Activate automated 1-click bundle recommendation on cart value < ₹2,000",
        status: "discovered",
        created_at: new Date().toISOString(),
      },
      {
        id: "opp_recovery_01",
        title: "₹7,200 at risk from failed UPI bank timeouts",
        description: "Recovery Agent flagged 6 high-AOV orders where customer bank PSP timed out; retryable with 82% expected conversion.",
        impact_inr: 7200,
        confidence: 0.82,
        agent: "recovery",
        recommended_action: "Dispatch instant Razorpay payment links via WhatsApp notification ladder",
        status: "in_progress",
        created_at: new Date().toISOString(),
      },
      {
        id: "opp_recovery_02",
        title: "₹4,300 recoverable from abandoned AI checkouts",
        description: "AI buyer sessions that selected products but paused before authorization.",
        impact_inr: 4300,
        confidence: 0.74,
        agent: "recovery",
        recommended_action: "Issue bounded 5% limited-time incentive checkout token",
        status: "discovered",
        created_at: new Date().toISOString(),
      },
      {
        id: "opp_risk_01",
        title: "₹2,800 unusual refund exposure mitigated",
        description: "Risk Agent blocked 2 suspicious transactions with synthetic card velocity patterns.",
        impact_inr: 2800,
        confidence: 0.94,
        agent: "risk",
        recommended_action: "Maintain temporary device fingerprint quarantine",
        status: "executed",
        created_at: new Date().toISOString(),
      },
      {
        id: "opp_finance_01",
        title: "₹11,200 settlement discrepancy under review",
        description: "Finance Controller flagged uncredited bank batch batch_setl_882 pending reconciliation.",
        impact_inr: 11200,
        confidence: 0.91,
        agent: "finance",
        recommended_action: "Generate automated dispute report for acquiring bank partner",
        status: "in_progress",
        created_at: new Date().toISOString(),
      },
    ];

    for (const opp of opps) {
      this.opportunities.set(opp.id, opp);
    }
  }

  // Get live high-level dashboard metrics
  getSummary(): RevenueGraphSummary {
    let realized = 0;
    for (const p of Array.from(this.payments.values())) {
      if (p.status === "captured") {
        realized += p.amount;
      }
    }

    let atRisk = 0;
    let recovered = 0;
    for (const r of Array.from(this.recoveries.values())) {
      if (r.status === "recovered") {
        recovered += r.amount;
      } else if (r.status !== "exhausted" && r.status !== "blocked_by_policy") {
        atRisk += r.amount;
      }
    }

    const totalRecoveryCandidates = this.recoveries.size;
    const recoveredCount = Array.from(this.recoveries.values()).filter(r => r.status === "recovered").length;
    const recoveryRate = totalRecoveryCandidates > 0 
      ? Math.round((recoveredCount / totalRecoveryCandidates) * 100) 
      : 0;

    const totalRecons = this.reconciliations.size;
    const matchedCount = Array.from(this.reconciliations.values()).filter(r => r.match_status === "MATCHED").length;
    const reconRate = totalRecons > 0 
      ? Math.round((matchedCount / totalRecons) * 100) 
      : 0;

    let expectedSettlement = 0;
    for (const s of Array.from(this.settlements.values())) {
      expectedSettlement += s.amount;
    }

    return {
      realized_revenue_inr: realized,
      revenue_at_risk_inr: atRisk,
      recovered_revenue_inr: recovered,
      fraud_prevented_inr: 34990 + 2800,
      recovery_rate_percent: recoveryRate,
      reconciliation_match_rate_percent: reconRate,
      expected_settlement_inr: expectedSettlement,
      ai_revenue_uplift_inr: Math.floor(realized * 0.14), // 14% uplift from autonomous bundling & recoveries
      active_customers_count: this.customers.size,
      total_orders_count: this.orders.size,
      total_payments_count: this.payments.size,
      pending_approvals_count: 4, // seeded approvals
    };
  }

  // Add order to graph
  addOrder(order: Order): void {
    this.orders.set(order.id, order);
    eventBus.publish("ORDER_CREATED", order);
  }

  // Add or update payment in graph
  recordPayment(payment: Payment): void {
    this.payments.set(payment.id, payment);
    
    // Update order status
    const order = this.orders.get(payment.order_id);
    if (order) {
      if (payment.status === "captured") {
        order.status = "paid";
      } else if (payment.status === "failed") {
        order.status = "failed";
      }
      this.orders.set(order.id, order);
    }

    eventBus.publish("PAYMENT_RECORDED", payment);
  }

  // Record audit event
  recordAudit(audit: AuditEvent): void {
    this.auditTrail.unshift(audit);
    eventBus.publish("AUDIT_LOGGED", audit);
  }

  // Query recent audit trail
  getRecentAudits(limit = 25): AuditEvent[] {
    return this.auditTrail.slice(0, limit);
  }

  // Reset graph to seed state
  reset(): void {
    this.products.clear();
    this.customers.clear();
    this.orders.clear();
    this.payments.clear();
    this.riskEvents.clear();
    this.recoveries.clear();
    this.settlements.clear();
    this.reconciliations.clear();
    this.opportunities.clear();
    this.auditTrail = [];
    this.hydrateFromSeed();
    this.initializeOpportunities();
  }
}

export const revenueGraph = new MerchantRevenueGraph();
