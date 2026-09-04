import { Product } from "../types/index";
import { revenueGraph } from "../graph/revenue-graph";
import { policyEngine } from "../policies/policy-engine";

export interface AIProductDiscoveryQuery {
  query: string;
  max_price_inr?: number;
  category?: string;
  features?: string[];
}

export interface RecommendationResult {
  primary_product: Product;
  bundle_recommendation?: {
    bundle_id: string;
    target_product: Product;
    bundle_name: string;
    original_total: number;
    bundle_price: number;
    discount_percent: number;
    savings_inr: number;
    expected_revenue_uplift_inr: number;
    explanation: string;
    within_policy: boolean;
  };
  alternative_products: Product[];
  explanation: string;
}

export class GrowthAgent {
  /**
   * AI-Readable Catalog: returns structured, machine-interpretable product catalog
   */
  getCatalog(category?: string): Product[] {
    const products = Array.from(revenueGraph.products.values());
    if (category) {
      return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    return products;
  }

  /**
   * Natural-language or structured product search for external AI buyers
   */
  searchAndRecommend(searchParams: AIProductDiscoveryQuery): RecommendationResult | null {
    const query = searchParams.query.toLowerCase();
    const maxPrice = searchParams.max_price_inr ?? 25000;
    const products = Array.from(revenueGraph.products.values());

    // Match candidate products
    const candidates = products.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(query) || query.includes(p.name.toLowerCase());
      const catMatch = p.category.toLowerCase().includes(query) || query.includes(p.category.toLowerCase());
      const descMatch = p.description.toLowerCase().includes(query);
      const tagMatch = p.eligible_offers.some(o => o.toLowerCase().includes(query));
      return (nameMatch || catMatch || descMatch || tagMatch) && p.price <= maxPrice;
    });

    if (candidates.length === 0) {
      // Fallback to closest matching by budget
      const underBudget = products.filter(p => p.price <= maxPrice);
      if (underBudget.length === 0) return null;
      candidates.push(underBudget[0]);
    }

    // Sort by popularity / margin
    candidates.sort((a, b) => b.margin_percent - a.margin_percent);
    const primary = candidates[0];

    // Check for bundle recommendation
    let bundleRec = undefined;
    if (primary.bundles && primary.bundles.length > 0) {
      for (const b of primary.bundles) {
        const targetProd = revenueGraph.products.get(b.target_product_id);
        if (targetProd && b.bundle_price <= maxPrice) {
          const originalTotal = primary.price + targetProd.price;
          const discountPercent = Math.round(((originalTotal - b.bundle_price) / originalTotal) * 100);
          const policyCheck = policyEngine.checkDiscount(discountPercent);

          if (policyCheck.allowed) {
            bundleRec = {
              bundle_id: b.bundle_id,
              target_product: targetProd,
              bundle_name: b.bundle_name,
              original_total: originalTotal,
              bundle_price: b.bundle_price,
              discount_percent: discountPercent,
              savings_inr: b.savings_inr,
              expected_revenue_uplift_inr: b.bundle_price - primary.price,
              explanation: `${b.explanation} Discount is ${discountPercent}%, bounded within merchant policy (max 10%).`,
              within_policy: true,
            };
            break;
          }
        }
      }
    }

    const alternatives = candidates.filter(p => p.id !== primary.id).slice(0, 3);

    const explanation = bundleRec 
      ? `Identified "${primary.name}" (₹${primary.price.toLocaleString('en-IN')}) and crafted bundle "${bundleRec.bundle_name}" for ₹${bundleRec.bundle_price.toLocaleString('en-IN')} providing ₹${bundleRec.savings_inr} customer savings while unlocking +₹${bundleRec.expected_revenue_uplift_inr} revenue uplift for the merchant.`
      : `Recommended "${primary.name}" at ₹${primary.price.toLocaleString('en-IN')} as the optimal price-to-performance match within your ₹${maxPrice.toLocaleString('en-IN')} budget cap.`;

    return {
      primary_product: primary,
      bundle_recommendation: bundleRec,
      alternative_products: alternatives,
      explanation,
    };
  }
}

export const growthAgent = new GrowthAgent();
