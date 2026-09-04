import React from "react";

export function Card({
  children,
  className = "",
  hover = false,
  highlight = false,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-fintech-card/80 backdrop-blur-md p-5 text-slate-100 ${
        highlight
          ? "border-sky-500/40 shadow-lg shadow-sky-500/5 ring-1 ring-sky-500/20"
          : "border-slate-800/80"
      } ${hover ? "transition-all duration-200 hover:border-slate-700 hover:bg-fintech-card hover:shadow-md" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function MetricCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  subtitle,
  pill,
  onClick,
}: {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral" | "warning";
  icon?: any;
  subtitle?: string;
  pill?: string;
  onClick?: () => void;
}) {
  const trendColors = {
    up: "text-emerald-400 bg-emerald-950/40 border-emerald-800/40",
    down: "text-rose-400 bg-rose-950/40 border-rose-800/40",
    warning: "text-amber-400 bg-amber-950/40 border-amber-800/40",
    neutral: "text-slate-400 bg-slate-800/40 border-slate-700/40",
  };

  return (
    <Card
      className={`flex flex-col justify-between transition-all ${onClick ? "cursor-pointer hover:border-sky-500/40" : ""}`}
      hover={!!onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">
              {value}
            </span>
            {change && (
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${trendColors[trend]}`}
              >
                {change}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className="rounded-lg bg-slate-800/80 p-2.5 text-sky-400 border border-slate-700/50">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-2.5">
        <span>{subtitle || "Real-time sync"}</span>
        {pill && (
          <span className="rounded bg-sky-950/60 px-1.5 py-0.5 text-[10px] font-medium text-sky-300 border border-sky-800/40">
            {pill}
          </span>
        )}
      </div>
    </Card>
  );
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "purple" | "neutral" | "cyan";
  className?: string;
}) {
  const styles = {
    default: "bg-sky-950/60 text-sky-400 border-sky-800/50",
    success: "bg-emerald-950/60 text-emerald-400 border-emerald-800/50",
    warning: "bg-amber-950/60 text-amber-400 border-amber-800/50",
    danger: "bg-rose-950/60 text-rose-400 border-rose-800/50",
    purple: "bg-purple-950/60 text-purple-400 border-purple-800/50",
    neutral: "bg-slate-800/70 text-slate-300 border-slate-700/50",
    cyan: "bg-cyan-950/60 text-cyan-400 border-cyan-800/50",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusDot({
  status,
  size = "sm",
}: {
  status: "active" | "idle" | "warning" | "error";
  size?: "sm" | "md";
}) {
  const sizeClasses = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";
  const colors = {
    active: "bg-emerald-400 shadow-emerald-500/50",
    idle: "bg-slate-400 shadow-slate-500/50",
    warning: "bg-amber-400 shadow-amber-500/50",
    error: "bg-rose-500 shadow-rose-500/50",
  };

  return (
    <span className="relative flex h-2.5 w-2.5 items-center justify-center">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
          status === "active" ? "bg-emerald-400" : "hidden"
        }`}
      />
      <span className={`relative inline-flex rounded-full ${sizeClasses} ${colors[status]} shadow-sm`} />
    </span>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon?: any;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {Icon && (
        <div className="mb-3 rounded-full bg-slate-800/60 p-3 text-slate-400 border border-slate-700/50">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
      <p className="mt-1 text-xs text-slate-400 max-w-sm">{description}</p>
    </div>
  );
}
