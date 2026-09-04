import { NextResponse } from "next/server";
import { processRazorpayWebhook } from "@/lib/razorpay/webhooks";
import { razorpayClient } from "@/lib/razorpay/client";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "sim_wh_sig_valid";

    // Validate webhook authenticity
    const isValid = razorpayClient.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Razorpay webhook signature." },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const result = await processRazorpayWebhook(payload);

    return NextResponse.json(result, {
      status: 200,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Webhook processing error" }, { status: 500 });
  }
}
