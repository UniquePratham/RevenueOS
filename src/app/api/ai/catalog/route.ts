import { NextResponse } from "next/server";
import { growthAgent } from "@/lib/agents/growth-agent";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const catalog = growthAgent.getCatalog(category);
  return NextResponse.json({
    merchant_id: "merch_apex_001",
    total_items: catalog.length,
    currency: "INR",
    catalog,
  });
}
