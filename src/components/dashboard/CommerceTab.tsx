import React, { useState } from "react";
import { Bot, ShoppingCart, Sparkles, CheckCircle, Package, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, Badge, MetricCard } from "@/components/ui/Primitives";

interface CommerceTabProps {
  products: any[];
  onRefresh: () => void;
}

export function CommerceTab({ products, onRefresh }: CommerceTabProps) {
  const [selectedProduct, setSelectedProduct] = useState<any>(products[0] || null);
  const [searchQuery, setSearchQuery] = useState("gaming keyboard");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [checkoutStatus, setCheckoutStatus] = useState<any>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(5);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/ai/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAutonomousCheckout = async (prod: any) => {
    setIsCheckingOut(true);
    setCheckoutStatus(null);
    try {
      const res = await fetch("/api/ai/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: prod.id,
          requested_discount: appliedDiscount,
          customer_id: "cust_demo_agent_01",
        }),
      });
      const data = await res.json();
      setCheckoutStatus(data);
      onRefresh();
    } catch (e: any) {
      setCheckoutStatus({ error: e.message });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3DDD2] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#141413] flex items-center gap-2">
              <Bot className="h-5 w-5 text-[#141413]" />
              Agentic Commerce & AI Growth Engine
            </h2>
            <Badge variant="default">Agent-to-Agent Ready</Badge>
          </div>
          <p className="text-xs text-[#6B6862] mt-1">
            Autonomous product discovery, machine-negotiated bundle incentives, and bounded discount policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="warning">Discount Ceiling: 10%</Badge>
          <Badge variant="success">Razorpay Payment Intent</Badge>
        </div>
      </div>

      {/* Top Engine Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Catalog SKUs"
          value={products.length}
          subtitle="Electronics & Peripherals"
          pill="Active"
        />
        <MetricCard
          title="AI AOV Expansion"
          value="+14.2%"
          trend="up"
          change="₹3,450 uplift"
          subtitle="Bundle cross-sells"
          pill="Smart Bundles"
        />
        <MetricCard
          title="Agent Negotiation Rate"
          value="98.5%"
          trend="up"
          change="Zero policy breaches"
          subtitle="Strict policy checks"
          pill="Safe"
        />
      </div>

      {/* Main Grid: Interactive AI Buyer Simulation + Product Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Catalog & Bundle Exploration */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DDD2]">
              <h3 className="font-semibold text-[#141413] text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-[#141413]" />
                Merchant Product Catalog (ElectroGear Pro)
              </h3>
              <span className="text-xs text-[#6B6862]">Click SKU to test AI Purchase Flow</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {products.map((prod) => {
                const isSelected = selectedProduct?.id === prod.id;
                return (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "border-[#141413] bg-[#FFF9EC] shadow-sm ring-1 ring-[#141413]"
                        : "border-[#E3DDD2] bg-[#F5EFE2] hover:border-[#6B6862] hover:bg-[#EFE8DA]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-xs text-[#141413]">{prod.name || prod.title}</div>
                        <div className="text-[11px] text-[#6B6862]">{prod.category}</div>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#141413]">
                        ₹{(prod.price ?? prod.price_inr ?? 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#6B6862] mt-2 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>

                    {prod.bundles && prod.bundles.length > 0 && (
                      <div className="mt-3 rounded-full bg-[#F0EAE0] border border-[#E3DDD2] px-3 py-1 text-[10px] text-[#141413] flex items-center justify-between">
                        <span>Bundle: {prod.bundles[0].bundle_name}</span>
                        <span className="font-mono text-[#1E824C] font-semibold">
                          Save ₹{prod.bundles[0].savings_inr}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Col: AI Buyer & Checkout Sandbox */}
        <div className="space-y-4">
          <Card>
            <div className="pb-3 border-b border-[#E3DDD2] flex items-center justify-between">
              <h3 className="font-semibold text-[#141413] text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#141413]" />
                Autonomous AI Buyer Sandbox
              </h3>
              <Badge variant="default">Agent Sandbox</Badge>
            </div>

            {selectedProduct ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-[#F5EFE2] p-3.5 border border-[#E3DDD2]">
                  <div className="text-[10px] uppercase font-bold text-[#6B6862] tracking-wider">
                    Target Purchase SKU
                  </div>
                  <div className="font-bold text-sm text-[#141413] mt-1">
                    {selectedProduct.name || selectedProduct.title}
                  </div>
                  <div className="text-xs text-[#6B6862] font-mono mt-0.5">
                    Base: ₹{(selectedProduct.price ?? selectedProduct.price_inr ?? 0).toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Discount Policy Slider / Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B6862]">AI Requested Discount:</span>
                    <span className="font-mono font-bold text-[#141413]">{appliedDiscount}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={appliedDiscount}
                    onChange={(e) => setAppliedDiscount(Number(e.target.value))}
                    className="w-full accent-[#EB001B] cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-[#6B6862]">
                    <span>0% (Full Price)</span>
                    <span className="text-[#D97706] font-medium">10% Policy Limit</span>
                    <span>20% (Requires Approval)</span>
                  </div>
                </div>

                {appliedDiscount > 10 && (
                  <div className="rounded-xl bg-[#FEF3C7] border border-[#FDE68A] p-3 text-xs text-[#B45309] flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#D97706] mt-0.5" />
                    <span>
                      Notice: Discount &gt; 10% violates autonomous policy. Execution will halt and
                      be sent to Approvals Center!
                    </span>
                  </div>
                )}

                <button
                  onClick={() => handleAutonomousCheckout(selectedProduct)}
                  disabled={isCheckingOut}
                  className="w-full py-2.5 rounded-full bg-[#EB001B] hover:bg-[#D40018] text-xs font-semibold text-[#FFF9EC] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:translate-y-0.5"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>
                    {isCheckingOut ? "Executing Autonomous Loop..." : "Execute Agentic Checkout"}
                  </span>
                </button>

                {/* Checkout Result Display */}
                {checkoutStatus && (
                  <div
                    className={`rounded-xl border p-3.5 space-y-2 text-xs transition-all ${
                      checkoutStatus.status === "POLICY_VIOLATION" || checkoutStatus.error
                        ? "border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]"
                        : "border-[#C3E6D0] bg-[#EBF5EF] text-[#1E824C]"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>Result: {checkoutStatus.status || "COMPLETED"}</span>
                      {checkoutStatus.order_id && (
                        <span className="font-mono text-[10px] text-[#6B6862]">
                          {checkoutStatus.order_id}
                        </span>
                      )}
                    </div>
                    <p className="text-xs">{checkoutStatus.message || checkoutStatus.reason || "Autonomous checkout processed successfully."}</p>

                    {checkoutStatus.final_amount_inr && (
                      <div className="pt-2 border-t border-[#C3E6D0] flex items-center justify-between font-mono">
                        <span>Net Paid:</span>
                        <span className="font-bold text-[#141413]">
                          ₹{checkoutStatus.final_amount_inr.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#6B6862]">
                Select a product from the left catalog to test AI checkout.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
