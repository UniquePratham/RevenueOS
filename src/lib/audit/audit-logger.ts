import { AuditEvent } from "../types/index";
import { revenueGraph } from "../graph/revenue-graph";

class AuditLogger {
  log(params: Omit<AuditEvent, "id" | "timestamp">): AuditEvent {
    const event: AuditEvent = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...params,
    };
    revenueGraph.recordAudit(event);
    return event;
  }

  getTrail(limit = 50): AuditEvent[] {
    return revenueGraph.getRecentAudits(limit);
  }

  getById(id: string): AuditEvent | undefined {
    return revenueGraph.auditTrail.find(a => a.id === id);
  }
}

export const auditLogger = new AuditLogger();
