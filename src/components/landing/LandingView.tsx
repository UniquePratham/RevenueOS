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
    <div className="min-h-screen bg-fintech-navy text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-slate-950">
      {/* Top Navbar */}
      <nav className="h-16 border-b border-slate-800/80 bg-fintech-navy/80 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white font-mono">
                RevenueOS
              </span>
              <span className="rounded bg-sky-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-sky-400 border border-sky-500/30">
                v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Autonomous Merchant Revenue Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onRunDemo}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-700/60 text-xs font-semibold text-slate-200 transition-all"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Instant Demo</span>
          </button>

          <button
            onClick={onEnterApp}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-xs font-bold text-white shadow-md shadow-sky-500/25 transition-all"
          >
            <span>Launch Merchant OS</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-5xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300 text-xs font-semibold backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>The Next Frontier of Merchant Fintech: Bounded Autonomous Agents</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-mono leading-tight max-w-4xl">
          The Autonomous Revenue Engine for Modern Merchants
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          Unifies <strong className="text-white">Agentic Commerce</strong>,{" "}
          <strong className="text-white">Defensive Fraud Risk</strong>,{" "}
          <strong className="text-white">Revenue Recovery</strong>, and{" "}
          <strong className="text-white">3-Way Ledger Reconciliation</strong> into an always-on digital
          revenue twin, bounded by strict merchant safety policies.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-sm font-bold text-white shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Launch Merchant OS Terminal</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onRunDemo}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-sm font-semibold text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Run Autonomous Demo Loop</span>
          </button>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full pt-12 text-left">
          {/* Pillar 1 */}
          <div className="rounded-xl border border-slate-800/80 bg-fintech-card/60 p-5 space-y-2.5 backdrop-blur-md">
            <div className="h-9 w-9 rounded-lg bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400">
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Agentic Commerce</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous catalog discovery, bundle incentives, and bounded discount negotiations (ceiling: 10%).
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-xl border border-slate-800/80 bg-fintech-card/60 p-5 space-y-2.5 backdrop-blur-md">
            <div className="h-9 w-9 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Defensive Risk</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time 0–100 risk scoring with signal explainability. Blocks card-testing botnets before payment capture.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-xl border border-slate-800/80 bg-fintech-card/60 p-5 space-y-2.5 backdrop-blur-md">
            <div className="h-9 w-9 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <RotateCcw className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Revenue Recovery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adaptive 6-step recovery ladder (DETECT → DIAGNOSE → ACT → VERIFY → STOP) yielding +38% recovery lift.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="rounded-xl border border-slate-800/80 bg-fintech-card/60 p-5 space-y-2.5 backdrop-blur-md">
            <div className="h-9 w-9 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <Scale className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Finance Controller</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              3-way automated reconciliation across Order Book, Razorpay settlement batches, and nodal bank ledger.
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-xs text-slate-400 border-t border-slate-800/60 w-full">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Deterministic PRNG Simulation (Seed: 421337)</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-sky-400" />
            <span>Razorpay Test Mode Integration Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            <span>Human-in-the-Loop Bounded Autonomy</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 font-mono">
        RevenueOS © 2026. Production-Ready Fintech Hackathon Architecture.
      </footer>
    </div>
  );
}
