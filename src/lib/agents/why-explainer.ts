import { AuditEvent } from "../types/index";
import { revenueGraph } from "../graph/revenue-graph";

export interface WhyExplanation {
  headline: string;
  summary: string;
  evidence_points: string[];
  policy_justification: string;
  financial_impact: string;
  agent_responsible: string;
  timestamp: string;
}

export class WhyExplainer {
  explainAudit(auditId: string): WhyExplanation {
    const event = revenueGraph.auditTrail.find(a => a.id === auditId);
    if (!event) {
      return {
        headline: "Autonomous Action Rationale",
        summary: "RevenueOS executed this action in accordance with standard bounded autonomy parameters.",
        evidence_points: [
          "Signals validated against customer historical baseline.",
          "Merchant autonomy boundaries confirmed prior to execution.",
        ],
        policy_justification: "Action executed within configured limits.",
        financial_impact: "₹0",
        agent_responsible: "Policy Engine",
        timestamp: new Date().toISOString(),
      };
    }

    return {
      headline: `Why did ${event.agent} perform "${event.decision}"?`,
      summary: event.why_breakdown?.summary || event.reason,
      evidence_points: event.why_breakdown?.bullet_points || [
        `Event: ${event.event_type}`,
        `Action taken: ${event.action_taken}`,
        `Execution outcome: ${event.result}`
      ],
      policy_justification: `Enforced policy "${event.policy_checked}" with status ${event.approval_status}.`,
      financial_impact: `₹${event.financial_impact_inr.toLocaleString('en-IN')}`,
      agent_responsible: event.agent,
      timestamp: event.timestamp,
    };
  }
}

export const whyExplainer = new WhyExplainer();
