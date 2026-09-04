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
      className={`rounded-2xl border bg-[#FFF9EC] p-6 text-[#141413] ${
        highlight
          ? "border-[#EB001B] shadow-sm ring-1 ring-[#EB001B]/20"
          : "border-[#E3DDD2]"
      } ${hover ? "transition-all duration-200 hover:border-[#D4CCC0] hover:shadow-sm" : ""} ${className}`}
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
    up: "text-[#1E824C] bg-[#EBF5EF] border-[#C3E6D0]",
    down: "text-[#EB001B] bg-[#FBEAEB] border-[#F3C7C9]",
    warning: "text-[#B45309] bg-[#FEF3C7] border-[#FDE68A]",
    neutral: "text-[#6B6862] bg-[#F0EAE0] border-[#E3DDD2]",
  };

  return (
    <Card
      className={`flex flex-col justify-between transition-all ${onClick ? "cursor-pointer hover:border-[#141413]" : ""}`}
      hover={!!onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6862]">
            {title}
          </p>
          <div className="flex items-baseline space-x-2.5">
            <span className="text-2xl font-bold tracking-tight text-[#141413] font-mono">
              {value}
            </span>
            {change && (
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${trendColors[trend]}`}
              >
                {change}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className="rounded-full bg-[#F0EAE0] p-2.5 text-[#141413] border border-[#E3DDD2]">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-[#6B6862] border-t border-[#E3DDD2] pt-3">
        <span>{subtitle || "Real-time sync"}</span>
        {pill && (
          <span className="rounded-full bg-[#F0EAE0] px-2 py-0.5 text-[10px] font-medium text-[#6B6862] border border-[#E3DDD2]">
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
    default: "bg-[#F0EAE0] text-[#141413] border-[#E3DDD2]",
    success: "bg-[#EBF5EF] text-[#1E824C] border-[#C3E6D0]",
    warning: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
    danger: "bg-[#FBEAEB] text-[#EB001B] border-[#F3C7C9]",
    purple: "bg-[#F3EEF6] text-[#5B4466] border-[#DDD3E3]",
    neutral: "bg-[#F0EAE0] text-[#6B6862] border-[#E3DDD2]",
    cyan: "bg-[#F0EAE0] text-[#141413] border-[#E3DDD2]",
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
    active: "bg-[#1E824C]",
    idle: "bg-[#6B6862]",
    warning: "bg-[#D97706]",
    error: "bg-[#EB001B]",
  };

  return (
    <span className="inline-flex items-center justify-center">
      <span className={`inline-block rounded-full ${sizeClasses} ${colors[status]}`} />
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
        <div className="mb-3 rounded-full bg-[#F0EAE0] p-3 text-[#6B6862] border border-[#E3DDD2]">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-[#141413]">{title}</h4>
      <p className="mt-1 text-xs text-[#6B6862] max-w-sm">{description}</p>
    </div>
  );
}
