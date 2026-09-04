"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, NavTab } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { LandingView } from "@/components/landing/LandingView";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { CommerceTab } from "@/components/dashboard/CommerceTab";
import { RiskTab } from "@/components/dashboard/RiskTab";
import { RecoveryTab } from "@/components/dashboard/RecoveryTab";
import { FinanceTab } from "@/components/dashboard/FinanceTab";
import { ForecastTab } from "@/components/dashboard/ForecastTab";
import { OpportunitiesTab } from "@/components/dashboard/OpportunitiesTab";
import { ApprovalsTab } from "@/components/dashboard/ApprovalsTab";
import { AuditTab } from "@/components/dashboard/AuditTab";
import { PoliciesTab } from "@/components/dashboard/PoliciesTab";
import { EvaluationTab } from "@/components/dashboard/EvaluationTab";
import { SimulationTab } from "@/components/dashboard/SimulationTab";

export default function Home() {
  const [view, setView] = useState<"landing" | "app">("app");
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Failed to fetch dashboard state:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunDemoScenario = (scenarioId: string = "SCENARIO_1_AI_BUYER") => {
    setView("app");
    setActiveTab("simulation");
  };

  if (view === "landing") {
    return (
      <LandingView
        onEnterApp={() => setView("app")}
        onRunDemo={() => {
          setView("app");
          setActiveTab("simulation");
        }}
      />
    );
  }

  const pendingApprovals = (data?.approvals || []).filter(
    (a: any) => a.status === "PENDING"
  ).length;
  const anomalyCount = (data?.anomalies || []).length;

  return (
    <div className="flex min-h-screen bg-fintech-navy text-slate-100 selection:bg-sky-500 selection:text-slate-950 font-sans">
      {/* Bloomberg-style Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApprovalsCount={pendingApprovals}
        anomalyCount={anomalyCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-fintech-dark/40 bg-grid-pattern">
        {/* Real-time Topbar */}
        <Topbar
          onRefresh={fetchData}
          isRefreshing={isRefreshing}
          onQuickDemo={() => handleRunDemoScenario("SCENARIO_1_AI_BUYER")}
          lastSyncTime={lastSyncTime}
          hasAnomalies={anomalyCount > 0}
          pendingApprovals={pendingApprovals}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {isLoading && !data ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-3">
              <div className="h-8 w-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
              <p className="text-xs font-mono text-slate-400">
                Hydrating Digital Revenue Twin from deterministic seed...
              </p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <OverviewTab
                  data={data}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onRunDemo={handleRunDemoScenario}
                />
              )}

              {activeTab === "commerce" && (
                <CommerceTab products={data?.products || []} onRefresh={fetchData} />
              )}

              {activeTab === "risk" && (
                <RiskTab
                  riskEvents={data?.riskEvents || []}
                  anomalies={data?.anomalies || []}
                  onRefresh={fetchData}
                />
              )}

              {activeTab === "recovery" && (
                <RecoveryTab recoveries={data?.recoveries || []} onRefresh={fetchData} />
              )}

              {activeTab === "finance" && (
                <FinanceTab recon={data?.recon || {}} onRefresh={fetchData} />
              )}

              {activeTab === "forecast" && (
                <ForecastTab forecast={data?.forecast || []} />
              )}

              {activeTab === "opportunities" && (
                <OpportunitiesTab opportunities={data?.opportunities || []} />
              )}

              {activeTab === "approvals" && (
                <ApprovalsTab approvals={data?.approvals || []} onRefresh={fetchData} />
              )}

              {activeTab === "audit" && (
                <AuditTab auditTrail={data?.auditTrail || []} />
              )}

              {activeTab === "policies" && (
                <PoliciesTab policies={data?.policies || {}} onRefresh={fetchData} />
              )}

              {activeTab === "evaluation" && (
                <EvaluationTab evaluation={data?.evaluation || {}} />
              )}

              {activeTab === "simulation" && (
                <SimulationTab onRefresh={fetchData} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
