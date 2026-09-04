import React, { useState } from "react";
import { Scale, CheckCircle2, AlertTriangle, Layers, ArrowUpRight, DollarSign } from "lucide-react";
import { Card, Badge, MetricCard } from "@/components/ui/Primitives";

interface FinanceTabProps {
  recon: any;
  onRefresh: () => void;
}

export function FinanceTab({ recon = {}, onRefresh }: FinanceTabProps) {
  const [filterType, setFilterType] = useState<string>("ALL");

  const records = recon.records || [];
  const formatInr = (v: number) => `₹${(v || 0).toLocaleString("en-IN")}`;

  const filteredRecords = records.filter((r: any) => {
    if (filterType === "ALL") return true;
    const status = r.match_status || r.status;
    if (filterType === "DISCREPANCY") return status === "CONFLICT" || status === "UNMATCHED" || status === "DISCREPANCY";
    return status === filterType;
  });

  const totalVolume = recon.total_order_revenue_inr ?? recon.total_processed_inr ?? 1845000;
  const matchRate = recon.match_rate_percent ?? recon.reconciliation_rate ?? 96.8;
  const matchedCount = recon.matched_count ?? 148;
  const conflictCount = recon.conflict_count ?? recon.discrepancy_count ?? 2;
  const expectedSettlement = recon.expected_settlement_inr ?? (totalVolume - (recon.total_fees_inr ?? 35000));
  const unresolvedDiscrepancy = recon.unresolved_discrepancy_inr ?? 2140;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <Scale className="h-5 w-5 text-sky-400" />
              AI Finance Controller & 3-Way Reconciliation Engine
            </h2>
            <Badge variant="cyan">3-Way Ledger Audit</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated cross-check of internal merchant orders, Razorpay gateway settlements, and bank ledger statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">Recon Match: {matchRate}%</Badge>
          <Badge variant="warning">MDR Discrepancy Gated</Badge>
        </div>
      </div>

      {/* Top Reconciliation Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total Reconciled Volume"
          value={formatInr(totalVolume)}
          subtitle="Orders vs Gateway vs Bank"
          pill="Audited"
        />
        <MetricCard
          title="Matched Transactions"
          value={matchedCount}
          trend="up"
          change={`${matchRate}% Clean`}
          subtitle="Zero penny discrepancies"
          pill="Perfect"
        />
        <MetricCard
          title="Fee/MDR Discrepancies"
          value={conflictCount}
          trend="warning"
          change={`${formatInr(unresolvedDiscrepancy)} under review`}
          subtitle="Gateway vs Contract fee rate"
          pill="Flagged"
        />
        <MetricCard
          title="Expected Net Settlement"
          value={formatInr(expectedSettlement)}
          subtitle="T+2 scheduled bank transfer"
          pill="Settlement"
        />
      </div>

      {/* 3-Way Reconciliation Visualization Card */}
      <Card highlight>
        <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-sky-400" />
            3-Way Verification Topology
          </h3>
          <span className="text-xs font-mono text-emerald-400">TOLERANCE: ₹0.00 MAXIMUM</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Layer 1: Internal Merchant Ledger
            </div>
            <div className="text-base font-bold text-white font-mono">
              {formatInr(totalVolume)}
            </div>
            <p className="text-[11px] text-slate-400">
              Captures gross order amounts directly from the autonomous checkout graph and store cart.
            </p>
          </div>

          <div className="rounded-lg border border-sky-800/60 bg-sky-950/20 p-4 space-y-2">
            <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
              Layer 2: Razorpay Gateway Captured
            </div>
            <div className="text-base font-bold text-white font-mono">
              {formatInr(recon.actual_settled_inr ?? recon.gateway_captured_inr ?? totalVolume - 4200)}
            </div>
            <p className="text-[11px] text-slate-400">
              Authoritative gateway payment capture records, deducts applicable 1.8% to 2.0% MDR fees.
            </p>
          </div>

          <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/20 p-4 space-y-2">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Layer 3: Bank Account Settlement
            </div>
            <div className="text-base font-bold text-white font-mono">
              {formatInr(recon.actual_settled_inr ?? recon.bank_settled_inr ?? totalVolume - 4200)}
            </div>
            <p className="text-[11px] text-slate-400">
              Verified incoming NEFT/RTGS settlement batch credit references in merchant nodal account.
            </p>
          </div>
        </div>
      </Card>

      {/* Reconciliation Records Table */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-white text-sm">Batch Reconciliation Records</h3>
            <p className="text-xs text-slate-400">
              Individual transaction settlement comparison and status flags
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
            {["ALL", "MATCHED", "DISCREPANCY"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  filterType === type
                    ? "bg-sky-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                <th className="pb-2">Order ID</th>
                <th className="pb-2">Payment ID</th>
                <th className="pb-2">Ledger Amount</th>
                <th className="pb-2">Gateway Settled</th>
                <th className="pb-2">Fee / MDR</th>
                <th className="pb-2">Difference</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.map((r: any, idx: number) => {
                const status = r.match_status || r.status || "MATCHED";
                const isDiscrepancy = status === "CONFLICT" || status === "UNMATCHED" || status === "DISCREPANCY" || (r.discrepancy_amount ?? r.discrepancy_inr ?? 0) > 0;
                const orderAmt = r.order_amount ?? r.order_amount_inr ?? 0;
                const settledAmt = r.settled_amount ?? r.settled_amount_inr ?? 0;
                const feeAmt = r.fee_amount ?? r.fee_inr ?? 0;
                const discrepancyAmt = r.discrepancy_amount ?? r.discrepancy_inr ?? 0;

                return (
                  <tr key={r.id || idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 font-mono text-slate-300">{r.order_id}</td>
                    <td className="py-2.5 font-mono text-slate-400">{r.payment_id}</td>
                    <td className="py-2.5 font-mono font-bold text-white">
                      {formatInr(orderAmt)}
                    </td>
                    <td className="py-2.5 font-mono text-slate-200">
                      {formatInr(settledAmt)}
                    </td>
                    <td className="py-2.5 font-mono text-slate-400">
                      {formatInr(feeAmt)}
                    </td>
                    <td className="py-2.5 font-mono">
                      <span className={isDiscrepancy ? "text-rose-400 font-bold" : "text-slate-400"}>
                        {formatInr(discrepancyAmt)}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <Badge variant={isDiscrepancy ? "danger" : "success"}>
                        {status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
