import { CashForecastDay } from "../types/index";
import { revenueGraph } from "../graph/revenue-graph";

export interface CashForecastSummary {
  today_inflow_inr: number;
  next_7d_net_inr: number;
  next_30d_net_inr: number;
  estimated_recoveries_30d_inr: number;
  estimated_refunds_30d_inr: number;
  forecast_days: CashForecastDay[];
}

export function generateCashForecast(): CashForecastSummary {
  const summary = revenueGraph.getSummary();
  const baseDailyVolume = Math.max(15000, Math.floor(summary.realized_revenue_inr / 45));

  const forecastDays: CashForecastDay[] = [];
  let next7dNet = 0;
  let next30dNet = 0;
  let totalRecoveries30d = 0;
  let totalRefunds30d = 0;

  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];

    // Day of week seasonality: weekends +15%, Mondays peak
    const dayOfWeek = d.getDay();
    const dayMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.18 : (dayOfWeek === 1 ? 1.25 : 1.0);

    const projectedInflow = Math.round(baseDailyVolume * dayMultiplier * (1 + (Math.sin(i / 4) * 0.1)));
    const projectedRecoveries = Math.round(projectedInflow * 0.08); // 8% recovered from failed payments
    const projectedRefunds = Math.round(projectedInflow * 0.02); // 2% refunds
    const projectedSettlementFees = Math.round(projectedInflow * 0.0236); // MDR + GST
    const projectedOutflow = projectedRefunds + projectedSettlementFees;

    const net = projectedInflow + projectedRecoveries - projectedOutflow;
    const uncertaintyBand = Math.round(net * (0.05 + (i * 0.008))); // confidence interval widens further out

    const dayDrivers: string[] = [];
    if (i === 0) dayDrivers.push("Pending T+1 bank settlement clearance");
    if (dayOfWeek === 1) dayDrivers.push("Weekend accumulated UPI clearing surge");
    if (i % 7 === 0) dayDrivers.push("Weekly scheduled merchant auto-sweep");
    if (dayDrivers.length === 0) dayDrivers.push("Baseline run-rate order transactions");

    forecastDays.push({
      date: dateStr,
      day_offset: i,
      expected_inflow: projectedInflow + projectedRecoveries,
      expected_outflow: projectedOutflow,
      expected_net: net,
      lower_bound: net - uncertaintyBand,
      upper_bound: net + uncertaintyBand,
      confidence_score: Math.max(0.65, 0.96 - (i * 0.01)),
      drivers: dayDrivers,
    });

    if (i < 7) next7dNet += net;
    next30dNet += net;
    totalRecoveries30d += projectedRecoveries;
    totalRefunds30d += projectedRefunds;
  }

  return {
    today_inflow_inr: forecastDays[0].expected_inflow,
    next_7d_net_inr: next7dNet,
    next_30d_net_inr: next30dNet,
    estimated_recoveries_30d_inr: totalRecoveries30d,
    estimated_refunds_30d_inr: totalRefunds30d,
    forecast_days: forecastDays,
  };
}
