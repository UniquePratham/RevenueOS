import { RiskDecision, RiskEvent, RiskLevel, RiskSignal } from "../types/index";
import { revenueGraph } from "../graph/revenue-graph";

export interface RiskEvaluationRequest {
  order_id: string;
  customer_id: string;
  amount_inr: number;
  payment_method: string;
  ip_address?: string;
  timestamp?: string;
}

export class DefensiveRiskAgent {
  /**
   * Evaluates a transaction and returns an explainable 0-100 risk score and signal breakdown
   */
  evaluateTransaction(req: RiskEvaluationRequest): RiskEvent {
    const customer = revenueGraph.customers.get(req.customer_id);
    const signals: RiskSignal[] = [];
    const reasons: string[] = [];

    let rawScore = 5; // clean baseline

    // 1. Amount Deviation Signal
    const baselineAov = customer?.baseline_aov || 2200;
    const aovRatio = req.amount_inr / baselineAov;
    if (aovRatio > 8.0) {
      const pts = 48;
      rawScore += pts;
      signals.push({
        name: "AMOUNT_DEVIATION",
        value: `${aovRatio.toFixed(1)}x baseline`,
        threshold: "3.0x",
        status: "ANOMALOUS",
        contribution_percent: pts,
        description: `Extreme anomaly: Transaction amount (₹${req.amount_inr.toLocaleString('en-IN')}) is ${aovRatio.toFixed(1)}x higher than customer's historical average (₹${baselineAov.toLocaleString('en-IN')}).`,
      });
      reasons.push(`Transaction amount is ${aovRatio.toFixed(1)}× customer baseline`);
    } else if (aovRatio > 4.0) {
      const pts = 35;
      rawScore += pts;
      signals.push({
        name: "AMOUNT_DEVIATION",
        value: `${aovRatio.toFixed(1)}x baseline`,
        threshold: "3.0x",
        status: "ANOMALOUS",
        contribution_percent: pts,
        description: `Transaction amount (₹${req.amount_inr.toLocaleString('en-IN')}) is ${aovRatio.toFixed(1)}x higher than customer's historical average (₹${baselineAov.toLocaleString('en-IN')}).`,
      });
      reasons.push(`Transaction amount is ${aovRatio.toFixed(1)}× customer baseline`);
    } else if (aovRatio > 2.2) {
      const pts = 15;
      rawScore += pts;
      signals.push({
        name: "AMOUNT_DEVIATION",
        value: `${aovRatio.toFixed(1)}x baseline`,
        threshold: "2.0x",
        status: "WARNING",
        contribution_percent: pts,
        description: `Transaction is moderately elevated compared to baseline.`,
      });
    } else {
      signals.push({
        name: "AMOUNT_DEVIATION",
        value: `${aovRatio.toFixed(1)}x baseline`,
        status: "SAFE",
        contribution_percent: 0,
        description: "Amount is consistent with customer purchase profile.",
      });
    }

    // 2. Customer Refund History Signal
    const refundCount = customer?.refund_count || 0;
    if (refundCount >= 3) {
      const pts = 30;
      rawScore += pts;
      signals.push({
        name: "REFUND_FREQUENCY",
        value: `${refundCount} past refunds`,
        threshold: "2 refunds",
        status: "ANOMALOUS",
        contribution_percent: pts,
        description: `Customer account has accumulated ${refundCount} refunds in recent history.`,
      });
      reasons.push("Refund frequency is significantly above merchant baseline");
    } else {
      signals.push({
        name: "REFUND_FREQUENCY",
        value: `${refundCount} refunds`,
        status: "SAFE",
        contribution_percent: 0,
        description: "Normal refund history.",
      });
    }

    // 3. High-Risk Customer Profile Flag
    if (customer?.is_high_risk) {
      const pts = 25;
      rawScore += pts;
      signals.push({
        name: "CUSTOMER_RISK_PROFILE",
        value: "FLAGGED",
        threshold: "CLEAN",
        status: "ANOMALOUS",
        contribution_percent: pts,
        description: "Account previously flagged in regional merchant dispute exchange.",
      });
      reasons.push("Account tagged in merchant dispute registry");
    }

    // 4. Absolute Amount Threshold
    if (req.amount_inr >= 25000) {
      const pts = 12;
      rawScore += pts;
      signals.push({
        name: "HIGH_TICKET_VALUE",
        value: `₹${req.amount_inr.toLocaleString('en-IN')}`,
        threshold: "₹20,000",
        status: "WARNING",
        contribution_percent: pts,
        description: "High-ticket hardware transaction requires secondary verification.",
      });
    }

    // Normalize final score between 0 and 100
    const finalScore = Math.min(100, Math.max(0, rawScore));

    let riskLevel: RiskLevel = "LOW";
    let decision: RiskDecision = "APPROVE";

    if (finalScore >= 80) {
      riskLevel = "CRITICAL";
      decision = "BLOCK";
    } else if (finalScore >= 60) {
      riskLevel = "HIGH";
      decision = "REVIEW";
    } else if (finalScore >= 35) {
      riskLevel = "MEDIUM";
      decision = "REVIEW";
    } else {
      riskLevel = "LOW";
      decision = "APPROVE";
    }

    if (reasons.length === 0) {
      reasons.push("Transaction matches standard verified customer baseline patterns");
    }

    const riskEvent: RiskEvent = {
      id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      payment_id: `pay_eval_${req.order_id}`,
      order_id: req.order_id,
      customer_id: req.customer_id,
      risk_score: finalScore,
      risk_level: riskLevel,
      decision,
      reasons,
      signals,
      evaluated_at: req.timestamp || new Date().toISOString(),
    };

    revenueGraph.riskEvents.set(riskEvent.id, riskEvent);
    return riskEvent;
  }
}

export const riskAgent = new DefensiveRiskAgent();
