import { NextResponse } from "next/server";
import { fraudSpikeDetector } from "@/lib/agents/fraud-spike-detector";

export async function GET() {
  const anomalies = fraudSpikeDetector.detectAnomalies();
  return NextResponse.json({
    anomalies_detected: anomalies.length,
    anomalies,
  });
}
