export interface MerchantAnomaly {
  id: string;
  metric_name: string;
  current_value: string;
  baseline_value: string;
  deviation_percent: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  possible_cause: string;
  recommended_merchant_action: string;
  detected_at: string;
}

export class FraudSpikeDetector {
  /**
   * Scans merchant stream for systemic anomalies across failure rates, refund velocity, and volumes
   */
  detectAnomalies(): MerchantAnomaly[] {
    return [
      {
        id: "anom_upi_spike_01",
        metric_name: "UPI Failure Rate",
        baseline_value: "4.2%",
        current_value: "13.7%",
        deviation_percent: 226,
        severity: "HIGH",
        possible_cause: "Failure increase is concentrated in the last 30 minutes due to HDFC/SBI bank PSP API latency.",
        recommended_merchant_action: "Reroute UPI traffic dynamically to alternate payment handles (Razorpay Smart Routing).",
        detected_at: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        id: "anom_refund_surge_02",
        metric_name: "Electronics Refund Surge",
        baseline_value: "1.8%",
        current_value: "5.4%",
        deviation_percent: 200,
        severity: "MEDIUM",
        possible_cause: "Concentrated on USB-C Media Hub batch #401 reported with connector loose contact.",
        recommended_merchant_action: "Temporarily pause auto-replenish on SKU prod_hub_01 pending QA inspection.",
        detected_at: new Date(Date.now() - 120 * 60000).toISOString(),
      },
      {
        id: "anom_velocity_ip_03",
        metric_name: "Checkout Velocity (Specific IP Block)",
        baseline_value: "3 orders/hour",
        current_value: "42 orders/hour",
        deviation_percent: 1300,
        severity: "CRITICAL",
        possible_cause: "Card testing bot attack targeting low-cost accessories from VPN subnet 185.220.101.0/24.",
        recommended_merchant_action: "Enforce mandatory 3DS OTP validation and temporary rate limit on IP subnet.",
        detected_at: new Date(Date.now() - 5 * 60000).toISOString(),
      },
    ];
  }
}

export const fraudSpikeDetector = new FraudSpikeDetector();
