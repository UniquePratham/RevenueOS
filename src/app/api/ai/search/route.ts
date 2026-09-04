import { NextResponse } from "next/server";
import { growthAgent } from "@/lib/agents/growth-agent";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = body.query || "";
    const maxPrice = body.max_price_inr ? Number(body.max_price_inr) : 25000;

    const result = growthAgent.searchAndRecommend({
      query,
      max_price_inr: maxPrice,
    });

    if (!result) {
      return NextResponse.json(
        { error: "No matching products found within requested parameters." },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid search request" }, { status: 400 });
  }
}
