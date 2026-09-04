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
    <aside className="w-64 border-r border-[#E3DDD2] bg-[#FFF9EC] flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E3DDD2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#141413] flex items-center justify-center text-[#FFF9EC]">
              <Sparkles className="h-4 w-4 text-[#FFF9EC]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-[#141413] font-mono">
                  RevenueOS
                </span>
              </div>
              <p className="text-[10px] text-[#6B6862]">Autonomous Merchant Engine</p>
            </div>
          </div>
        </div>

        {/* Live System Status Pill */}
        <div className="mx-4 my-3 rounded-full border border-[#E3DDD2] bg-[#F5EFE2] px-3.5 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#1E824C]"></span>
            <span className="font-medium text-[#6B6862]">Loop Status</span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-[#141413]">AUTONOMOUS</span>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-4">
          {navItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#6B6862]">
                {group.group}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#141413] text-[#FFF9EC] shadow-sm"
                        : "text-[#6B6862] hover:text-[#141413] hover:bg-[#F0EAE0]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? "text-[#FFF9EC]" : "text-[#6B6862]"}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#F0EAE0] text-[#6B6862] border border-[#E3DDD2]"
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {item.badgeCount !== undefined && (
                      <span className="rounded-full bg-[#D97706] px-2 py-0.5 text-[10px] font-bold text-white">
                        {item.badgeCount}
                      </span>
                    )}

                    {item.alertCount !== undefined && (
                      <span className="rounded-full bg-[#EB001B] px-2 py-0.5 text-[10px] font-bold text-white">
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
      <div className="p-4 border-t border-[#E3DDD2] bg-[#F5EFE2]">
        <div className="flex items-center justify-between text-[11px] text-[#6B6862] mb-1.5">
          <span>Gateway Mode:</span>
          <span className="font-mono text-xs font-semibold text-[#141413] flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E824C]"></span> Razorpay Test
          </span>
        </div>
        <div className="text-[10px] text-[#6B6862] truncate font-mono">
          Merchant: ElectroGear Pro (INR)
        </div>
      </div>
    </aside>
  );
}
