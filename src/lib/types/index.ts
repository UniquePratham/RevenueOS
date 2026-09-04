export type Currency = 'INR';

export interface MerchantPolicy {
  max_automatic_refund_inr: number;       // default: 2000
  max_discount_percent: number;           // default: 10
  max_recovery_retries: number;           // default: 3
  max_daily_campaign_budget_inr: number;  // default: 5000
  high_value_review_threshold_inr: number;// default: 10000
}

export interface Merchant {
  id: string;
  name: string;
  currency: Currency;
  gstin: string;
  policies: MerchantPolicy;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: Currency;
  inventory: number;
  category: string;
  margin_percent: number;
  attributes: Record<string, string>;
  eligible_offers: string[];
  bundles: Array<{
    bundle_id: string;
    target_product_id: string;
    bundle_name: string;
    bundle_price: number;
    savings_inr: number;
    explanation: string;
  }>;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  total_spend: number;
  order_count: number;
  baseline_aov: number;
  refund_count: number;
  is_high_risk: boolean;
  registered_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  merchant_id: string;
  customer_id: string;
  customer_name: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  currency: Currency;
  status: 'created' | 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  channel: 'ai_buyer' | 'web_store' | 'recovery_link';
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

export interface Payment {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  status: 'initiated' | 'authorized' | 'captured' | 'failed' | 'refunded';
  failure_reason?: string;
  failure_code?: string;
  error_description?: string;
  is_simulated: boolean;
  customer_id: string;
  created_at: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskDecision = 'APPROVE' | 'REVIEW' | 'BLOCK';

export interface RiskSignal {
  name: string;
  value: string | number;
  threshold?: string | number;
  status: 'SAFE' | 'WARNING' | 'ANOMALOUS';
  contribution_percent: number;
  description: string;
}

export interface RiskEvent {
  id: string;
  payment_id: string;
  order_id: string;
  customer_id: string;
  risk_score: number; // 0 to 100
  risk_level: RiskLevel;
  decision: RiskDecision;
  reasons: string[];
  signals: RiskSignal[];
  evaluated_at: string;
}

export type RecoveryStatus = 
  | 'detected' 
  | 'diagnosed' 
  | 'retry_scheduled' 
  | 'payment_link_sent' 
  | 'recovered' 
  | 'exhausted' 
  | 'blocked_by_policy';

export interface RecoveryCandidate {
  id: string;
  payment_id: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  failure_reason: string;
  failure_code: string;
  revenue_at_risk: number;
  recovery_probability: number; // 0.0 to 1.0
  expected_recovery_value: number;
  intervention_cost: number;
  recommended_action: string;
  status: RecoveryStatus;
  attempts: number;
  max_attempts: number;
  payment_link_id?: string;
  payment_link_url?: string;
  created_at: string;
  updated_at: string;
  recovery_history: Array<{
    step: string;
    timestamp: string;
    status: string;
    details: string;
  }>;
}

export type ReconciliationMatchStatus = 'MATCHED' | 'PARTIAL MATCH' | 'UNMATCHED' | 'CONFLICT';

export interface ReconciliationRecord {
  id: string;
  order_id: string;
  payment_id: string;
  settlement_id: string;
  order_amount: number;
  payment_amount: number;
  settled_amount: number;
  fee_amount: number;
  tax_amount: number;
  match_status: ReconciliationMatchStatus;
  match_confidence: number;
  evidence: string[];
  discrepancy_amount: number;
  reason: string;
  ai_assistance?: {
    used: boolean;
    confidence: number;
    explanation: string;
  };
  reconciled_at: string;
}

export interface SettlementRecord {
  id: string;
  razorpay_settlement_id: string;
  amount: number;
  fee: number;
  tax: number;
  status: 'processed' | 'pending';
  utr: string;
  settled_at: string;
}

export interface RevenueOpportunity {
  id: string;
  title: string;
  description: string;
  impact_inr: number;
  confidence: number;
  agent: 'growth' | 'risk' | 'recovery' | 'finance';
  recommended_action: string;
  status: 'discovered' | 'in_progress' | 'executed' | 'dismissed';
  created_at: string;
}

export type ApprovalType = 
  | 'REFUND' 
  | 'HIGH_RISK_TRANSACTION' 
  | 'BUDGET_INCREASE' 
  | 'RECOVERY_OFFER' 
  | 'SETTLEMENT_DISCREPANCY';

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  title: string;
  amount: number;
  details: string;
  reason: string;
  policy_triggered: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EDITED';
  edited_value?: any;
  created_at: string;
  resolved_at?: string;
  action_payload: Record<string, any>;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  agent: 'Growth Agent' | 'Risk Agent' | 'Recovery Agent' | 'Finance Controller' | 'Merchant Human' | 'Policy Engine';
  event_type: string;
  input: Record<string, any>;
  decision: string;
  reason: string;
  policy_checked: string;
  approval_status: 'AUTO_APPROVED' | 'HUMAN_APPROVED' | 'REJECTED' | 'BLOCKED' | 'NOT_REQUIRED';
  action_taken: string;
  result: string;
  financial_impact_inr: number;
  why_breakdown: {
    summary: string;
    bullet_points: string[];
  };
}

export interface CashForecastDay {
  date: string;
  day_offset: number;
  expected_inflow: number;
  expected_outflow: number;
  expected_net: number;
  lower_bound: number;
  upper_bound: number;
  confidence_score: number;
  drivers: string[];
}
