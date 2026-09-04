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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Bot className="h-5 w-5 text-sky-400" />
              Agentic Commerce & AI Growth Engine
            </h2>
            <Badge variant="cyan">Agent-to-Agent Ready</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous product discovery, machine-negotiated bundle incentives, and bounded discount policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple">Autonomous Discount Ceiling: 10%</Badge>
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-sky-400" />
                Merchant Product Catalog (ElectroGear Pro)
              </h3>
              <span className="text-xs text-slate-400">Click SKU to test AI Purchase Flow</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {products.map((prod) => {
                const isSelected = selectedProduct?.id === prod.id;
                return (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                      isSelected
                        ? "border-sky-500 bg-sky-950/30 shadow-md shadow-sky-500/10"
                        : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-xs text-white">{prod.title}</div>
                        <div className="text-[11px] text-slate-400">{prod.category}</div>
                      </div>
                      <span className="font-mono text-xs font-bold text-sky-400">
                        ₹{prod.price_inr.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 mt-2 line-clamp-2">
                      {prod.description}
                    </p>

                    {prod.recommended_bundle && (
                      <div className="mt-2.5 rounded bg-indigo-950/40 border border-indigo-800/40 p-1.5 text-[10px] text-indigo-300 flex items-center justify-between">
                        <span>Bundle Suggestion: {prod.recommended_bundle.name}</span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          +{prod.recommended_bundle.discount_percent}% OFF
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
          <Card highlight>
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-400" />
                Autonomous AI Buyer Sandbox
              </h3>
              <Badge variant="cyan">Agent Sandbox</Badge>
            </div>

            {selectedProduct ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Target Purchase SKU
                  </div>
                  <div className="font-bold text-sm text-white mt-1">
                    {selectedProduct.title}
                  </div>
                  <div className="text-xs text-sky-400 font-mono mt-0.5">
                    Base: ₹{selectedProduct.price_inr.toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Discount Policy Slider / Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">AI Requested Discount:</span>
                    <span className="font-mono font-bold text-sky-400">{appliedDiscount}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={appliedDiscount}
                    onChange={(e) => setAppliedDiscount(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>0% (Full Price)</span>
                    <span className="text-amber-400">10% Policy Limit</span>
                    <span>20% (Requires Approval)</span>
                  </div>
                </div>

                {appliedDiscount > 10 && (
                  <div className="rounded bg-amber-950/40 border border-amber-800/50 p-2 text-xs text-amber-300 flex items-start gap-1.5">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                    <span>
                      Notice: Discount &gt; 10% violates autonomous policy. Execution will halt and
                      be sent to Approvals Center!
                    </span>
                  </div>
                )}

                <button
                  onClick={() => handleAutonomousCheckout(selectedProduct)}
                  disabled={isCheckingOut}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>
                    {isCheckingOut ? "Executing Autonomous Loop..." : "Execute Agentic Checkout"}
                  </span>
                </button>

                {/* Checkout Result Display */}
                {checkoutStatus && (
                  <div
                    className={`rounded-lg border p-3.5 space-y-2 text-xs transition-all ${
                      checkoutStatus.status === "POLICY_VIOLATION" || checkoutStatus.error
                        ? "border-amber-800 bg-amber-950/30 text-amber-200"
                        : "border-emerald-800 bg-emerald-950/30 text-emerald-200"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>Result: {checkoutStatus.status || "COMPLETED"}</span>
                      {checkoutStatus.order_id && (
                        <span className="font-mono text-[10px] text-slate-400">
                          {checkoutStatus.order_id}
                        </span>
                      )}
                    </div>
                    <p className="text-xs">{checkoutStatus.message || checkoutStatus.reason || "Autonomous checkout processed successfully."}</p>

                    {checkoutStatus.final_amount_inr && (
                      <div className="pt-2 border-t border-emerald-800/40 flex items-center justify-between font-mono">
                        <span>Net Paid:</span>
                        <span className="font-bold text-white">
                          ₹{checkoutStatus.final_amount_inr.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Select a product from the left catalog to test AI checkout.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
