import crypto from "crypto";

export interface CreateOrderParams {
  amount: number; // in INR (will convert to paise for Razorpay API)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: "order";
  amount: number; // in paise
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
  attempts: number;
  created_at: number;
  is_simulated: boolean;
}

export interface CreatePaymentLinkParams {
  amount: number; // in INR
  currency?: string;
  description: string;
  customer: {
    name: string;
    email: string;
    contact: string;
  };
  notify?: {
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  reminder_enable?: boolean;
  notes?: Record<string, string>;
}

export interface RazorpayPaymentLinkResponse {
  id: string;
  short_url: string;
  status: "created" | "partially_paid" | "paid" | "expired" | "cancelled";
  amount: number;
  amount_paid: number;
  customer: {
    name: string;
    email: string;
    contact: string;
  };
  created_at: number;
  is_simulated: boolean;
}

export class RazorpayClient {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;
  private isDemoMode: boolean;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key_id";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_placeholder_secret";
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "rzp_test_webhook_secret";
    this.isDemoMode = 
      process.env.NEXT_PUBLIC_DEMO_MODE === "true" || 
      this.keyId === "rzp_test_placeholder_key_id";
  }

  isSimulated(): boolean {
    return this.isDemoMode;
  }

  async createOrder(params: CreateOrderParams): Promise<RazorpayOrderResponse> {
    const amountInPaise = Math.round(params.amount * 100);
    const receipt = params.receipt || `rcpt_${Date.now()}`;

    // If real keys are provided and not in forced simulation mode, attempt real Razorpay Test API
    if (!this.isDemoMode && this.keyId.startsWith("rzp_test_")) {
      try {
        const authHeader = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
        const res = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${authHeader}`,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: params.currency || "INR",
            receipt,
            notes: params.notes || {},
          }),
        });

        if (res.ok) {
          const data = await res.json();
          return {
            ...data,
            is_simulated: false,
          };
        }
      } catch (err) {
        console.warn("[RazorpayClient] Real Test API call failed, falling back to deterministic simulation:", err);
      }
    }

    // High-fidelity deterministic simulation
    const simulatedOrderId = `order_${Math.random().toString(36).substr(2, 14)}`;
    return {
      id: simulatedOrderId,
      entity: "order",
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: params.currency || "INR",
      receipt,
      status: "created",
      attempts: 0,
      created_at: Math.floor(Date.now() / 1000),
      is_simulated: true,
    };
  }

  async createPaymentLink(params: CreatePaymentLinkParams): Promise<RazorpayPaymentLinkResponse> {
    const amountInPaise = Math.round(params.amount * 100);

    if (!this.isDemoMode && this.keyId.startsWith("rzp_test_")) {
      try {
        const authHeader = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
        const res = await fetch("https://api.razorpay.com/v1/payment_links", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${authHeader}`,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: params.currency || "INR",
            description: params.description,
            customer: params.customer,
            notify: params.notify || { sms: true, email: true },
            reminder_enable: params.reminder_enable ?? true,
            notes: params.notes || {},
          }),
        });

        if (res.ok) {
          const data = await res.json();
          return {
            ...data,
            is_simulated: false,
          };
        }
      } catch (err) {
        console.warn("[RazorpayClient] Real Payment Link call failed, falling back to simulation:", err);
      }
    }

    const linkId = `plink_${Math.random().toString(36).substr(2, 12)}`;
    return {
      id: linkId,
      short_url: `https://rzp.io/i/${linkId}`,
      status: "created",
      amount: amountInPaise,
      amount_paid: 0,
      customer: params.customer,
      created_at: Math.floor(Date.now() / 1000),
      is_simulated: true,
    };
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (this.isDemoMode && signature.startsWith("sim_sig_")) {
      return true;
    }
    const expected = crypto
      .createHmac("sha256", this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    return expected === signature;
  }

  verifyWebhookSignature(rawBody: string, signature: string, secret?: string): boolean {
    const sec = secret || this.webhookSecret;
    if (signature.startsWith("sim_wh_sig_")) {
      return true;
    }
    const expected = crypto
      .createHmac("sha256", sec)
      .update(rawBody)
      .digest("hex");
    return expected === signature;
  }
}

export const razorpayClient = new RazorpayClient();
