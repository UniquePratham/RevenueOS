import { Customer, Order, Payment, RecoveryCandidate, SettlementRecord, ReconciliationRecord } from "../types/index";
import { INITIAL_CATALOG } from "./catalog";

// Simple deterministic Mulberry32 PRNG
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(421337);

const INDIAN_CITIES = [
  "Bengaluru, Karnataka",
  "Mumbai, Maharashtra",
  "Delhi NCR",
  "Hyderabad, Telangana",
  "Pune, Maharashtra",
  "Chennai, Tamil Nadu",
  "Gurgaon, Haryana",
  "Ahmedabad, Gujarat",
  "Kolkata, West Bengal",
  "Jaipur, Rajasthan",
  "Kochi, Kerala"
];

const FIRST_NAMES = [
  "Aarav", "Aditi", "Ananya", "Arjun", "Dev", "Diya", "Ishaan", "Kavya",
  "Manish", "Neha", "Pranav", "Pooja", "Rahul", "Riya", "Rohan", "Sanya",
  "Shreya", "Siddharth", "Tanvi", "Varun", "Vikram", "Zoya", "Kunal", "Sneha"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Reddy", "Mehta", "Nair", "Iyer", "Rao",
  "Deshmukh", "Chopra", "Malhotra", "Kapoor", "Bhatia", "Sen", "Joshi", "Gupta"
];

const FAILURE_REASONS = [
  { code: "BAD_REQUEST_ERROR", reason: "UPI payment timed out on customer PSP app", retryable: true, prob: 0.85 },
  { code: "GATEWAY_ERROR", reason: "Issuing bank server down or unreachable", retryable: true, prob: 0.78 },
  { code: "PAYMENT_CANCELLED", reason: "Customer cancelled checkout on payment screen", retryable: false, prob: 0.45 },
  { code: "INSUFFICIENT_FUNDS", reason: "Card or bank account reported insufficient balance", retryable: true, prob: 0.62 },
  { code: "OTP_EXPIRED", reason: "Customer failed to submit 3D Secure OTP in time", retryable: true, prob: 0.74 },
  { code: "RISK_DECLINE", reason: "Acquiring bank anti-fraud filter flagged high velocity", retryable: false, prob: 0.20 },
];

export interface SeedDataResult {
  customers: Customer[];
  orders: Order[];
  payments: Payment[];
  failed_payments: Payment[];
  recovery_candidates: RecoveryCandidate[];
  settlements: SettlementRecord[];
  reconciliation_records: ReconciliationRecord[];
  metrics: {
    total_customers: number;
    total_orders: number;
    total_payments: number;
    failed_payments_count: number;
    total_revenue_inr: number;
    revenue_at_risk_inr: number;
    recovered_revenue_inr: number;
  };
}

export function generateSyntheticMerchantData(): SeedDataResult {
  // 1. Generate 520 Customers
  const customers: Customer[] = [];
  for (let i = 1; i <= 520; i++) {
    const fn = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
    const name = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.in`;
    const phone = `+91 ${9800000000 + Math.floor(random() * 99999999)}`;
    const city = INDIAN_CITIES[Math.floor(random() * INDIAN_CITIES.length)];
    const is_high_risk = random() < 0.04; // 4% high risk

    customers.push({
      id: `cust_${String(i).padStart(4, "0")}`,
      name,
      email,
      phone,
      city,
      total_spend: 0,
      order_count: 0,
      baseline_aov: 0,
      refund_count: is_high_risk ? Math.floor(random() * 4) + 2 : 0,
      is_high_risk,
      registered_at: new Date(Date.now() - Math.floor(random() * 180) * 86400000).toISOString(),
    });
  }

  // 2. Generate 1,050 Orders & 1,520 Payments
  const orders: Order[] = [];
  const payments: Payment[] = [];
  const failed_payments: Payment[] = [];
  const recovery_candidates: RecoveryCandidate[] = [];

  let orderCounter = 1;
  let paymentCounter = 1;
  let totalRevenueInr = 0;
  let revenueAtRiskInr = 0;
  let recoveredRevenueInr = 0;

  for (let i = 1; i <= 1050; i++) {
    const customer = customers[Math.floor(random() * customers.length)];
    const orderId = `ord_in_${String(orderCounter++).padStart(6, "0")}`;
    const product = INITIAL_CATALOG[Math.floor(random() * INITIAL_CATALOG.length)];
    const quantity = random() < 0.85 ? 1 : 2;
    const subtotal = product.price * quantity;
    const hasDiscount = random() < 0.3;
    const discountAmount = hasDiscount ? Math.floor(subtotal * 0.08) : 0;
    const totalAmount = subtotal - discountAmount;
    const channel = random() < 0.25 ? "ai_buyer" : "web_store";

    const orderCreatedAt = new Date(Date.now() - Math.floor(random() * 60) * 86400000).toISOString();

    const order: Order = {
      id: orderId,
      merchant_id: "merch_apex_001",
      customer_id: customer.id,
      customer_name: customer.name,
      items: [
        {
          product_id: product.id,
          product_name: product.name,
          quantity,
          unit_price: product.price,
          total_price: subtotal,
        },
      ],
      subtotal,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      currency: "INR",
      status: "created",
      channel,
      created_at: orderCreatedAt,
      updated_at: orderCreatedAt,
    };

    // Payment generation (including multi-attempt payment retries)
    const hadInitialFailure = random() < 0.45; // ~45% of orders had an initial payment retry/failure
    const isFinallyFailed = random() < 0.11; // ~11% permanently failed

    if (hadInitialFailure) {
      // Simulate 1 or 2 initial failed attempts before recovery/retry
      const extraAttempts = random() < 0.3 ? 2 : 1;
      for (let a = 0; a < extraAttempts; a++) {
        const failInfo = FAILURE_REASONS[Math.floor(random() * FAILURE_REASONS.length)];
        const failedPayId = `pay_att_fail_${String(paymentCounter++).padStart(6, "0")}`;
        const failedPayment: Payment = {
          id: failedPayId,
          order_id: order.id,
          razorpay_order_id: `order_${Math.random().toString(36).substr(2, 12)}`,
          amount: totalAmount,
          currency: "INR",
          method: "upi",
          status: "failed",
          failure_code: failInfo.code,
          failure_reason: failInfo.reason,
          is_simulated: false,
          customer_id: customer.id,
          created_at: new Date(new Date(orderCreatedAt).getTime() - (a + 1) * 120000).toISOString(),
        };
        payments.push(failedPayment);
        failed_payments.push(failedPayment);
      }
    }

    if (!isFinallyFailed) {
      // Successful payment
      const paymentMethod = random() < 0.65 ? "upi" : random() < 0.85 ? "card" : "netbanking";
      const paymentId = `pay_rzp_${String(paymentCounter++).padStart(6, "0")}`;
      const razorpayOrderId = `order_${Math.random().toString(36).substr(2, 12)}`;
      const razorpayPaymentId = `pay_${Math.random().toString(36).substr(2, 12)}`;

      const payment: Payment = {
        id: paymentId,
        order_id: order.id,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        amount: totalAmount,
        currency: "INR",
        method: paymentMethod,
        status: "captured",
        is_simulated: false,
        customer_id: customer.id,
        created_at: orderCreatedAt,
      };

      order.status = "paid";
      customer.total_spend += totalAmount;
      customer.order_count += 1;
      totalRevenueInr += totalAmount;
      payments.push(payment);
    } else {
      // Final failed payment attempt
      const failInfo = FAILURE_REASONS[Math.floor(random() * FAILURE_REASONS.length)];
      const paymentId = `pay_fail_${String(paymentCounter++).padStart(6, "0")}`;
      const razorpayOrderId = `order_${Math.random().toString(36).substr(2, 12)}`;

      const payment: Payment = {
        id: paymentId,
        order_id: order.id,
        razorpay_order_id: razorpayOrderId,
        amount: totalAmount,
        currency: "INR",
        method: "upi",
        status: "failed",
        failure_code: failInfo.code,
        failure_reason: failInfo.reason,
        is_simulated: false,
        customer_id: customer.id,
        created_at: orderCreatedAt,
      };

      order.status = "failed";
      revenueAtRiskInr += totalAmount;
      payments.push(payment);
      failed_payments.push(payment);

      // Create a Recovery Candidate for failed payment
      const recoveryId = `rec_${String(failed_payments.length).padStart(5, "0")}`;
      const isRecovered = random() < failInfo.prob;
      const expectedRecovery = Math.floor(totalAmount * failInfo.prob);

      if (isRecovered) {
        recoveredRevenueInr += totalAmount;
      }

      recovery_candidates.push({
        id: recoveryId,
        payment_id: payment.id,
        order_id: order.id,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        amount: totalAmount,
        failure_reason: failInfo.reason,
        failure_code: failInfo.code,
        revenue_at_risk: totalAmount,
        recovery_probability: failInfo.prob,
        expected_recovery_value: expectedRecovery,
        intervention_cost: 15, // estimated SMS / webhook cost ₹15
        recommended_action: failInfo.retryable ? "Execute automated background retry with Razorpay Smart Routing" : "Generate Razorpay instant payment link via SMS/WhatsApp",
        status: isRecovered ? "recovered" : "payment_link_sent",
        attempts: isRecovered ? 1 : 2,
        max_attempts: 3,
        payment_link_id: `plink_${Math.random().toString(36).substr(2, 8)}`,
        payment_link_url: `https://rzp.io/i/rec_${order.id}`,
        created_at: orderCreatedAt,
        updated_at: new Date().toISOString(),
        recovery_history: [
          { step: "FAILURE_DETECTED", timestamp: orderCreatedAt, status: "diagnosed", details: failInfo.reason },
          { step: "POLICY_VALIDATION", timestamp: orderCreatedAt, status: "approved", details: "Within max 3 retry policy boundary" },
          { step: isRecovered ? "PAYMENT_RECOVERED" : "PAYMENT_LINK_SENT", timestamp: orderCreatedAt, status: isRecovered ? "success" : "pending_customer_action", details: isRecovered ? `Recovered ₹${totalAmount.toLocaleString('en-IN')}` : "Instant Razorpay Payment Link dispatched" }
        ],
      });
    }

    orders.push(order);
  }

  // Update customer AOV baselines
  for (const c of customers) {
    if (c.order_count > 0) {
      c.baseline_aov = Math.floor(c.total_spend / c.order_count);
    }
  }

  // 3. Generate 30 Settlement Records
  const settlements: SettlementRecord[] = [];
  for (let i = 1; i <= 30; i++) {
    const grossAmount = 45000 + Math.floor(random() * 85000);
    const fee = Math.floor(grossAmount * 0.02); // 2% MDR
    const tax = Math.floor(fee * 0.18); // 18% GST on fee

    settlements.push({
      id: `setl_${String(i).padStart(4, "0")}`,
      razorpay_settlement_id: `setl_rzp_${Math.random().toString(36).substr(2, 9)}`,
      amount: grossAmount,
      fee,
      tax,
      status: "processed",
      utr: `HDFC${Math.floor(random() * 90000000 + 10000000)}`,
      settled_at: new Date(Date.now() - (30 - i) * 86400000).toISOString(),
    });
  }

  // 4. Generate 60 Batch Reconciliation Records (Orders, Payments, Settlements, Fees)
  const reconciliation_records: ReconciliationRecord[] = [];
  const successfulPayments = payments.filter((p) => p.status === "captured");

  for (let i = 0; i < 60; i++) {
    const p = successfulPayments[i % successfulPayments.length];
    const ord = orders.find((o) => o.id === p.order_id) || orders[0];
    const fee = Math.floor(p.amount * 0.02);
    const tax = Math.floor(fee * 0.18);
    const settled = p.amount - (fee + tax);

    // Create realistic distribution: 82% MATCHED, 10% PARTIAL MATCH, 5% UNMATCHED, 3% CONFLICT
    let matchStatus: "MATCHED" | "PARTIAL MATCH" | "UNMATCHED" | "CONFLICT" = "MATCHED";
    let discrepancy = 0;
    let evidence = ["Exact Order ID match", "Payment amount matched", "Gateway UTR confirmed"];
    let reason = "All financial dimensions aligned within 0.00 tolerance.";

    const randVal = random();
    if (randVal > 0.95) {
      matchStatus = "CONFLICT";
      discrepancy = 120;
      evidence = ["Order ID match", "MDR fee mismatch in gateway ledger"];
      reason = "Fee deduction was ₹120 higher than merchant agreement schedule.";
    } else if (randVal > 0.88) {
      matchStatus = "PARTIAL MATCH";
      discrepancy = 50;
      evidence = ["Order amount matched", "Settlement batch timing delayed by 24h"];
      reason = "Settlement processed in next banking day cut-off window.";
    } else if (randVal > 0.82) {
      matchStatus = "UNMATCHED";
      discrepancy = p.amount;
      evidence = ["Missing settlement reference from bank partner"];
      reason = "Pending settlement batch clearance from acquiring bank.";
    }

    reconciliation_records.push({
      id: `recon_${String(i + 1).padStart(4, "0")}`,
      order_id: ord.id,
      payment_id: p.id,
      settlement_id: settlements[i % settlements.length].razorpay_settlement_id,
      order_amount: ord.total_amount,
      payment_amount: p.amount,
      settled_amount: settled,
      fee_amount: fee,
      tax_amount: tax,
      match_status: matchStatus,
      match_confidence: matchStatus === "MATCHED" ? 0.98 : matchStatus === "PARTIAL MATCH" ? 0.84 : 0.42,
      evidence,
      discrepancy_amount: discrepancy,
      reason,
      ai_assistance: {
        used: matchStatus !== "MATCHED",
        confidence: matchStatus === "MATCHED" ? 0.99 : 0.88,
        explanation: matchStatus === "MATCHED" 
          ? "Deterministic match confirmed across Order, Payment, and Settlement." 
          : `AI Finance Agent analyzed discrepancies: ${reason}`,
      },
      reconciled_at: new Date(Date.now() - (60 - i) * 3600000).toISOString(),
    });
  }

  return {
    customers,
    orders,
    payments,
    failed_payments,
    recovery_candidates,
    settlements,
    reconciliation_records,
    metrics: {
      total_customers: customers.length,
      total_orders: orders.length,
      total_payments: payments.length,
      failed_payments_count: failed_payments.length,
      total_revenue_inr: totalRevenueInr,
      revenue_at_risk_inr: revenueAtRiskInr,
      recovered_revenue_inr: recoveredRevenueInr,
    },
  };
}

// Pre-generated singleton dataset
export const SYNTHETIC_DATA = generateSyntheticMerchantData();
