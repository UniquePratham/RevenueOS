import { MerchantPolicy } from "../types/index";

export interface PolicyCheckResult {
  allowed: boolean;
  requires_approval: boolean;
  policy_name: string;
  limit_value: number | string;
  actual_value: number | string;
  reason: string;
}

export class PolicyEngine {
  private policy: MerchantPolicy = {
    max_automatic_refund_inr: 2000,
    max_discount_percent: 10,
    max_recovery_retries: 3,
    max_daily_campaign_budget_inr: 5000,
    high_value_review_threshold_inr: 10000,
  };

  getPolicy(): MerchantPolicy {
    return { ...this.policy };
  }

  updatePolicy(updates: Partial<MerchantPolicy>): MerchantPolicy {
    this.policy = { ...this.policy, ...updates };
    return { ...this.policy };
  }

  checkRefund(amountInr: number): PolicyCheckResult {
    if (amountInr <= this.policy.max_automatic_refund_inr) {
      return {
        allowed: true,
        requires_approval: false,
        policy_name: "MAX_AUTOMATIC_REFUND",
        limit_value: this.policy.max_automatic_refund_inr,
        actual_value: amountInr,
        reason: `Refund amount of ₹${amountInr.toLocaleString('en-IN')} is within automatic threshold (₹${this.policy.max_automatic_refund_inr.toLocaleString('en-IN')}).`,
      };
    }
    return {
      allowed: false,
      requires_approval: true,
      policy_name: "MAX_AUTOMATIC_REFUND",
      limit_value: this.policy.max_automatic_refund_inr,
      actual_value: amountInr,
      reason: `Action exceeds merchant autonomy boundary: refund ₹${amountInr.toLocaleString('en-IN')} > ₹${this.policy.max_automatic_refund_inr.toLocaleString('en-IN')}. Requires Merchant Approval.`,
    };
  }

  checkDiscount(discountPercent: number): PolicyCheckResult {
    if (discountPercent <= this.policy.max_discount_percent) {
      return {
        allowed: true,
        requires_approval: false,
        policy_name: "MAX_DISCOUNT_PERCENT",
        limit_value: `${this.policy.max_discount_percent}%`,
        actual_value: `${discountPercent}%`,
        reason: `Discount of ${discountPercent}% is within allowed merchant boundary (${this.policy.max_discount_percent}%).`,
      };
    }
    return {
      allowed: false,
      requires_approval: true,
      policy_name: "MAX_DISCOUNT_PERCENT",
      limit_value: `${this.policy.max_discount_percent}%`,
      actual_value: `${discountPercent}%`,
      reason: `Discount of ${discountPercent}% exceeds maximum autonomy limit (${this.policy.max_discount_percent}%). Requires Merchant Approval.`,
    };
  }

  checkRecoveryAttempts(currentAttempts: number): PolicyCheckResult {
    if (currentAttempts < this.policy.max_recovery_retries) {
      return {
        allowed: true,
        requires_approval: false,
        policy_name: "MAX_RECOVERY_RETRIES",
        limit_value: this.policy.max_recovery_retries,
        actual_value: currentAttempts + 1,
        reason: `Recovery attempt ${currentAttempts + 1} of ${this.policy.max_recovery_retries} is permitted.`,
      };
    }
    return {
      allowed: false,
      requires_approval: false,
      policy_name: "MAX_RECOVERY_RETRIES",
      limit_value: this.policy.max_recovery_retries,
      actual_value: currentAttempts,
      reason: `Maximum configured recovery attempts (${this.policy.max_recovery_retries}) reached. Autonomous loop safely halted to prevent spam and customer friction.`,
    };
  }

  checkHighValueTransaction(amountInr: number, riskScore: number): PolicyCheckResult {
    if (amountInr >= this.policy.high_value_review_threshold_inr && riskScore > 35) {
      return {
        allowed: false,
        requires_approval: true,
        policy_name: "HIGH_VALUE_REVIEW_THRESHOLD",
        limit_value: this.policy.high_value_review_threshold_inr,
        actual_value: amountInr,
        reason: `Transaction ₹${amountInr.toLocaleString('en-IN')} exceeds high-value threshold (₹${this.policy.high_value_review_threshold_inr.toLocaleString('en-IN')}) with elevated risk score (${riskScore}/100).`,
      };
    }
    return {
      allowed: true,
      requires_approval: false,
      policy_name: "HIGH_VALUE_REVIEW_THRESHOLD",
      limit_value: this.policy.high_value_review_threshold_inr,
      actual_value: amountInr,
      reason: `Transaction amount ₹${amountInr.toLocaleString('en-IN')} approved within autonomy constraints.`,
    };
  }
}

export const policyEngine = new PolicyEngine();
