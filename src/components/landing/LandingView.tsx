import React from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Scale,
  Bot,
  Layers,
  Zap,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/Primitives";

interface LandingViewProps {
  onEnterApp: () => void;
  onRunDemo: () => void;
}

export function LandingView({ onEnterApp, onRunDemo }: LandingViewProps) {
  return (
    <div className="min-h-screen bg-[#F5EFE2] text-[#141413] flex flex-col justify-between selection:bg-[#EB001B] selection:text-[#FFF9EC]">
      {/* Top Navbar */}
      <nav className="h-16 border-b border-[#E3DDD2] bg-[#FFF9EC] px-6 md:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#141413] flex items-center justify-center text-[#FFF9EC]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-[#141413]">
                RevenueOS
              </span>
            </div>
            <p className="text-[10px] text-[#6B6862] font-medium">Autonomous Merchant Revenue Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRunDemo}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E3DDD2] bg-[#F5EFE2] hover:bg-[#EAE4D7] text-xs font-semibold text-[#141413] transition-all"
          >
            <Zap className="h-3.5 w-3.5 text-[#EB001B]" />
            <span>Instant Demo</span>
          </button>

          <button
            onClick={onEnterApp}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#EB001B] hover:bg-[#D40018] text-xs font-semibold text-[#FFF9EC] shadow-sm transition-all active:translate-y-0.5"
          >
            <span>Launch Merchant OS</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-5xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E3DDD2] bg-[#FFF9EC] text-[#141413] text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-[#1E824C]" />
          <span>The Next Frontier of Merchant Fintech: Bounded Autonomous Agents</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#141413] leading-tight max-w-4xl">
          The Autonomous Revenue Engine for Modern Merchants
        </h1>

        <p className="text-sm sm:text-base text-[#6B6862] max-w-2xl leading-relaxed">
          Unifies <strong className="text-[#141413] font-semibold">Agentic Commerce</strong>,{" "}
          <strong className="text-[#141413] font-semibold">Defensive Fraud Risk</strong>,{" "}
          <strong className="text-[#141413] font-semibold">Revenue Recovery</strong>, and{" "}
          <strong className="text-[#141413] font-semibold">3-Way Ledger Reconciliation</strong> into an always-on digital
          revenue twin, bounded by strict merchant safety policies.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#EB001B] hover:bg-[#D40018] text-sm font-semibold text-[#FFF9EC] shadow-sm transition-all flex items-center justify-center gap-2 active:translate-y-0.5"
          >
            <span>Launch Merchant OS Terminal</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onRunDemo}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[#E3DDD2] bg-[#FFF9EC] hover:bg-[#F5EFE2] text-sm font-semibold text-[#141413] transition-all flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4 text-[#EB001B]" />
            <span>Run Autonomous Demo Loop</span>
          </button>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full pt-12 text-left">
          {/* Pillar 1 */}
          <div className="rounded-2xl border border-[#E3DDD2] bg-[#FFF9EC] p-5 space-y-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#F5EFE2] border border-[#E3DDD2] flex items-center justify-center text-[#141413]">
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[#141413]">Agentic Commerce</h3>
            <p className="text-xs text-[#6B6862] leading-relaxed">
              Autonomous catalog discovery, bundle incentives, and bounded discount negotiations (ceiling: 10%).
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-2xl border border-[#E3DDD2] bg-[#FFF9EC] p-5 space-y-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#F5EFE2] border border-[#E3DDD2] flex items-center justify-center text-[#EB001B]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[#141413]">Defensive Risk</h3>
            <p className="text-xs text-[#6B6862] leading-relaxed">
              Real-time 0–100 risk scoring with signal explainability. Blocks card-testing botnets before payment capture.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-2xl border border-[#E3DDD2] bg-[#FFF9EC] p-5 space-y-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#F5EFE2] border border-[#E3DDD2] flex items-center justify-center text-[#1E824C]">
              <RotateCcw className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[#141413]">Revenue Recovery</h3>
            <p className="text-xs text-[#6B6862] leading-relaxed">
              Adaptive 6-step recovery ladder (DETECT → DIAGNOSE → ACT → VERIFY → STOP) yielding +38% recovery lift.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="rounded-2xl border border-[#E3DDD2] bg-[#FFF9EC] p-5 space-y-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#F5EFE2] border border-[#E3DDD2] flex items-center justify-center text-[#141413]">
              <Scale className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[#141413]">Finance Controller</h3>
            <p className="text-xs text-[#6B6862] leading-relaxed">
              3-way automated reconciliation across Order Book, Razorpay settlement batches, and nodal bank ledger.
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-xs text-[#6B6862] border-t border-[#E3DDD2] w-full">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#1E824C]" />
            <span>Deterministic PRNG Simulation (Seed: 421337)</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#141413]" />
            <span>Razorpay Test Mode Integration Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#141413]" />
            <span>Human-in-the-Loop Bounded Autonomy</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E3DDD2] py-6 text-center text-xs text-[#6B6862]">
        RevenueOS © 2026. Production-Ready Fintech Hackathon Architecture.
      </footer>
    </div>
  );
}
