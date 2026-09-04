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
    <header className="h-14 border-b border-[#E3DDD2] bg-[#FFF9EC] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Ticker / Real-time indicators */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#1E824C]"></span>
          <span className="font-mono text-[#141413] font-medium tracking-tight">REVENUE ENGINE ACTIVE</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-[#6B6862] font-mono text-[11px] border-l border-[#E3DDD2] pl-4">
          <span>SYNCED:</span>
          <span className="text-[#141413]">{lastSyncTime || "Just now"}</span>
        </div>

        {hasAnomalies && (
          <div className="hidden lg:flex items-center gap-1.5 text-[#EB001B] bg-[#FBEAEB] border border-[#F3C7C9] px-2.5 py-0.5 rounded-full text-[11px] font-medium">
            <ShieldAlert className="h-3 w-3" />
            <span>Fraud/UPI Spike Detected</span>
          </div>
        )}

        {pendingApprovals > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] px-2.5 py-0.5 rounded-full text-[11px] font-medium">
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
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E3DDD2] bg-[#F5EFE2] text-xs text-[#141413] hover:bg-[#EFE8DA] transition-all disabled:opacity-50 font-medium"
          title="Refresh dashboard state"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#EB001B]" : "text-[#6B6862]"}`} />
          <span>Sync Graph</span>
        </button>

        <button
          onClick={onQuickDemo}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EB001B] hover:bg-[#D40018] text-xs font-semibold text-[#FFF9EC] transition-all shadow-sm active:translate-y-0.5"
        >
          <Play className="h-3 w-3 fill-[#FFF9EC]" />
          <span>Run Autonomous Demo</span>
        </button>
      </div>
    </header>
  );
}
