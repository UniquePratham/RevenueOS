import { NextResponse } from "next/server";
import { riskAgent } from "@/lib/agents/risk-agent";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = riskAgent.evaluateTransaction({
      order_id: body.order_id || `ord_${Date.now()}`,
      customer_id: body.customer_id || "cust_0001",
      amount_inr: Number(body.amount_inr || 1999),
      payment_method: body.payment_method || "upi",
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
