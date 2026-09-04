import { NextResponse } from "next/server";
import { razorpayClient } from "@/lib/razorpay/client";
import { riskAgent } from "@/lib/agents/risk-agent";
import { revenueGraph } from "@/lib/graph/revenue-graph";
import { auditLogger } from "@/lib/audit/audit-logger";
import { Order, Payment } from "@/lib/types/index";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      product_id, 
      bundle_id, 
      quantity = 1, 
      requested_discount = 0,
      customer_id = "cust_0001", 
      customer_name = "Aarav Sharma" 
    } = body;

    const product = revenueGraph.products.get(product_id);
    if (!product) {
      return NextResponse.json({ error: `Product ${product_id} not found` }, { status: 404 });
    }

    // Check discount policy
    if (requested_discount > 0) {
      const { policyEngine } = await import("@/lib/policies/policy-engine");
      const { approvalManager } = await import("@/lib/policies/approval-manager");
      const discountCheck = policyEngine.checkDiscount(requested_discount);

      if (!discountCheck.allowed && discountCheck.requires_approval) {
        const approvalReq = approvalManager.createRequest({
          type: "DISCOUNT",
          title: `Autonomous Discount Gate: ${requested_discount}% on ${product.name}`,
          amount: Math.round(product.price * (requested_discount / 100)),
          details: `AI Buyer requested ${requested_discount}% discount on ${product.name} (₹${product.price}). Exceeds 10% ceiling.`,
          reason: discountCheck.reason,
          policy_triggered: "MAX_DISCOUNT_PERCENT",
          action_payload: { product_id, requested_discount, customer_id }
        });

        return NextResponse.json({
          status: "POLICY_VIOLATION",
          requires_approval: true,
          approval_id: approvalReq.id,
          reason: discountCheck.reason,
          message: `Autonomous discount of ${requested_discount}% exceeds maximum ceiling (10%). Execution halted and routed to Approvals Center.`,
        });
      }
    }

    let rawTotal = product.price * quantity;
    const discountMultiplier = (100 - Math.min(requested_discount, 10)) / 100;
    let totalAmount = Math.round(rawTotal * discountMultiplier);

    let items = [
      {
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: Math.round(product.price * discountMultiplier),
        total_price: totalAmount,
      }
    ];

    if (bundle_id) {
      const bundle = product.bundles.find(b => b.bundle_id === bundle_id);
      if (bundle) {
        totalAmount = bundle.bundle_price;
        const targetProd = revenueGraph.products.get(bundle.target_product_id);
        if (targetProd) {
          items.push({
            product_id: targetProd.id,
            product_name: targetProd.name,
            quantity: 1,
            unit_price: targetProd.price,
            total_price: targetProd.price,
          });
        }
      }
    }

    const orderId = `ord_ai_${Date.now()}`;
    const order: Order = {
      id: orderId,
      merchant_id: "merch_apex_001",
      customer_id,
      customer_name,
      items,
      subtotal: rawTotal,
      discount_amount: rawTotal - totalAmount,
      total_amount: totalAmount,
      currency: "INR",
      status: "created",
      channel: "ai_buyer",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    revenueGraph.addOrder(order);

    // 1. Risk Evaluation
    const riskEval = riskAgent.evaluateTransaction({
      order_id: orderId,
      customer_id,
      amount_inr: totalAmount,
      payment_method: "upi",
    });

    if (riskEval.decision === "BLOCK") {
      order.status = "cancelled";
      return NextResponse.json({
        status: "BLOCKED",
        reason: "Transaction blocked by Defensive Risk Agent.",
        risk_event: riskEval,
      }, { status: 403 });
    }

    // 2. Razorpay Order Creation
    const rzpOrder = await razorpayClient.createOrder({
      amount: totalAmount,
      receipt: `rcpt_${orderId}`,
      notes: { channel: "ai_buyer", customer_id },
    });

    // 3. Simulated/Live Capture
    const paymentId = `pay_ai_${Date.now()}`;
    const payment: Payment = {
      id: paymentId,
      order_id: orderId,
      razorpay_order_id: rzpOrder.id,
      razorpay_payment_id: `pay_${Math.random().toString(36).substr(2, 10)}`,
      amount: totalAmount,
      currency: "INR",
      method: "upi",
      status: "captured",
      is_simulated: rzpOrder.is_simulated,
      customer_id,
      created_at: new Date().toISOString(),
    };
    revenueGraph.recordPayment(payment);

    auditLogger.log({
      agent: "Growth Agent",
      event_type: "AI_BUYER_ORDER_COMPLETED",
      input: { product_id, bundle_id, total_amount: totalAmount },
      decision: "APPROVE_AND_CAPTURE",
      reason: `Autonomous AI Buyer completed purchase of ₹${totalAmount.toLocaleString('en-IN')}.`,
      policy_checked: "BOUNDED_AUTONOMY_ALL_PASS",
      approval_status: "AUTO_APPROVED",
      action_taken: "Created Razorpay test order, verified risk, captured funds.",
      result: "Order successfully completed",
      financial_impact_inr: totalAmount,
      why_breakdown: {
        summary: "AI Buyer completed checkout via machine-readable commerce API.",
        bullet_points: [
          `Order ID: ${orderId}`,
          `Razorpay Order: ${rzpOrder.id}`,
          `Captured Amount: ₹${totalAmount.toLocaleString('en-IN')}`,
          `Risk Level: ${riskEval.risk_level} (Score: ${riskEval.risk_score}/100)`
        ]
      }
    });

    return NextResponse.json({
      status: "SUCCESS",
      order,
      payment,
      razorpay_order: rzpOrder,
      risk_evaluation: riskEval,
      message: `Transaction of ₹${totalAmount.toLocaleString('en-IN')} approved and completed.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process AI checkout" }, { status: 500 });
  }
}
