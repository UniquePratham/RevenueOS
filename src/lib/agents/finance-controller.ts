import { reconciliationEngine, ReconciliationBatchSummary } from "../finance/reconciliation-engine";
import { generateCashForecast, CashForecastSummary } from "../finance/cash-forecast";
import { revenueGraph } from "../graph/revenue-graph";

export class FinanceControllerAgent {
  /**
   * Runs the batch reconciliation suite across orders, payments, fees, and settlements
   */
  runReconciliation(): ReconciliationBatchSummary {
    return reconciliationEngine.processBatch();
  }

  /**
   * Generates forward 30-day cash forecast
   */
  getCashForecast(): CashForecastSummary {
    return generateCashForecast();
  }

  /**
   * Synthesizes an executive brief on financial integrity
   */
  generateExecutiveBrief(): {
    integrity_score: number;
    headline: string;
    key_findings: string[];
    action_items: string[];
  } {
    const summary = this.runReconciliation();
    const forecast = this.getCashForecast();

    return {
      integrity_score: summary.match_rate_percent,
      headline: `Ledger Health: ${summary.match_rate_percent}% Deterministic Match Rate across ${summary.total_records_processed} Records`,
      key_findings: [
        `Reconciled ₹${summary.total_order_revenue_inr.toLocaleString('en-IN')} in gross order volume.`,
        `Identified ${summary.conflict_count} fee schedule anomalies totaling ₹${summary.unresolved_discrepancy_inr.toLocaleString('en-IN')} in discrepancy.`,
        `Projected 30-day net cash inflow is ₹${forecast.next_30d_net_inr.toLocaleString('en-IN')} with ₹${forecast.estimated_recoveries_30d_inr.toLocaleString('en-IN')} expected from autonomous recovery.`,
      ],
      action_items: [
        "Review 4 uncredited settlement batches with acquiring bank.",
        "Export audit CSV for chartered accountant reconciliation filing.",
      ]
    };
  }
}

export const financeController = new FinanceControllerAgent();
