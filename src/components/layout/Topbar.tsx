import React from "react";
import { RefreshCw, Play, ShieldAlert, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

interface TopbarProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  onQuickDemo: () => void;
  lastSyncTime: string;
  hasAnomalies: boolean;
  pendingApprovals: number;
}

export function Topbar({
  onRefresh,
  isRefreshing,
  onQuickDemo,
  lastSyncTime,
  hasAnomalies,
  pendingApprovals,
}: TopbarProps) {
  return (
    <header className="h-14 border-b border-slate-800/80 bg-fintech-navy/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Ticker / Real-time indicators */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          <span className="font-mono text-slate-300 font-medium">REVENUE ENGINE ACTIVE</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-slate-500 font-mono text-[11px] border-l border-slate-800 pl-4">
          <span>SYNCED:</span>
          <span className="text-slate-400">{lastSyncTime || "Just now"}</span>
        </div>

        {hasAnomalies && (
          <div className="hidden lg:flex items-center gap-1.5 text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded-full text-[11px]">
            <ShieldAlert className="h-3 w-3" />
            <span>Fraud/UPI Spike Detected</span>
          </div>
        )}

        {pendingApprovals > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full text-[11px]">
            <AlertCircle className="h-3 w-3" />
            <span>{pendingApprovals} Approvals Required</span>
          </div>
        )}
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 text-xs text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all disabled:opacity-50"
          title="Refresh dashboard state"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-sky-400" : ""}`} />
          <span>Sync Graph</span>
        </button>

        <button
          onClick={onQuickDemo}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-xs font-semibold text-white shadow-md shadow-sky-500/20 transition-all"
        >
          <Play className="h-3 w-3 fill-white" />
          <span>Run Autonomous Demo</span>
        </button>
      </div>
    </header>
  );
}
