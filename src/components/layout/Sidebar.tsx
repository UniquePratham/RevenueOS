import React from "react";
import {
  LayoutDashboard,
  Bot,
  ShieldAlert,
  RotateCcw,
  Scale,
  TrendingUp,
  Sliders,
  CheckSquare,
  FileText,
  Activity,
  Sparkles,
  Zap,
} from "lucide-react";

export type NavTab =
  | "overview"
  | "commerce"
  | "risk"
  | "recovery"
  | "finance"
  | "forecast"
  | "opportunities"
  | "approvals"
  | "audit"
  | "policies"
  | "evaluation"
  | "simulation";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  pendingApprovalsCount: number;
  anomalyCount: number;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: any;
  badge?: string;
  badgeCount?: number;
  alertCount?: number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export function Sidebar({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  anomalyCount,
}: SidebarProps) {
  const navItems: NavGroup[] = [
    {
      group: "COMMAND CENTER",
      items: [
        { id: "overview" as NavTab, label: "Overview", icon: LayoutDashboard },
        { id: "simulation" as NavTab, label: "Demo & Failures", icon: Zap, badge: "Interactive" },
      ],
    },
    {
      group: "AUTONOMOUS ENGINES",
      items: [
        { id: "commerce" as NavTab, label: "AI Commerce", icon: Bot },
        {
          id: "risk" as NavTab,
          label: "Defensive Risk",
          icon: ShieldAlert,
          alertCount: anomalyCount > 0 ? anomalyCount : undefined,
        },
        { id: "recovery" as NavTab, label: "Revenue Recovery", icon: RotateCcw },
        { id: "finance" as NavTab, label: "Finance Controller", icon: Scale },
      ],
    },
    {
      group: "INSIGHTS & FORECASTS",
      items: [
        { id: "forecast" as NavTab, label: "Cash Flow Forecast", icon: TrendingUp },
        { id: "opportunities" as NavTab, label: "Revenue Opportunities", icon: Sparkles },
      ],
    },
    {
      group: "GOVERNANCE & AUDIT",
      items: [
        {
          id: "approvals" as NavTab,
          label: "Approvals Center",
          icon: CheckSquare,
          badgeCount: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
        },
        { id: "audit" as NavTab, label: "Audit Trail", icon: FileText },
        { id: "policies" as NavTab, label: "Merchant Policies", icon: Sliders },
        { id: "evaluation" as NavTab, label: "ML Evaluation", icon: Activity },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-fintech-navy/95 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-sky-600 via-cyan-500 to-indigo-500 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white font-mono">
                  RevenueOS
                </span>
                <span className="rounded bg-sky-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-sky-400 border border-sky-500/30">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Autonomous Merchant Engine</p>
            </div>
          </div>
        </div>

        {/* Live System Status Pill */}
        <div className="mx-4 my-3 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-300">Loop Status:</span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-emerald-400">AUTONOMOUS</span>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-4">
          {navItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {group.group}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-300 border border-indigo-500/40">
                        {item.badge}
                      </span>
                    )}

                    {item.badgeCount !== undefined && (
                      <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-slate-950 animate-pulse">
                        {item.badgeCount}
                      </span>
                    )}

                    {item.alertCount !== undefined && (
                      <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                        {item.alertCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Razorpay Test Mode Indicator */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span>Gateway Mode:</span>
          <span className="font-mono text-xs font-bold text-sky-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span> Razorpay Test
          </span>
        </div>
        <div className="text-[10px] text-slate-500 truncate font-mono">
          Merchant: ElectroGear Pro (INR)
        </div>
      </div>
    </aside>
  );
}
