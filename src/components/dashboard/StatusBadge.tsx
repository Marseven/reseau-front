import { cn } from "@/lib/utils";

type StatusType = "up" | "down" | "warn" | "maintenance" | "ok" | "actif" | "fermee";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  up: {
    bg: "bg-[hsl(var(--status-up))]/10",
    text: "text-[hsl(var(--status-up))]",
    dot: "bg-[hsl(var(--status-up))]",
    label: "En ligne"
  },
  down: {
    bg: "bg-[hsl(var(--status-down))]/10",
    text: "text-[hsl(var(--status-down))]",
    dot: "bg-[hsl(var(--status-down))]",
    label: "Hors ligne"
  },
  warn: {
    bg: "bg-[hsl(var(--status-warn))]/10",
    text: "text-[hsl(var(--status-warn))]",
    dot: "bg-[hsl(var(--status-warn))]",
    label: "Alerte"
  },
  maintenance: {
    bg: "bg-[hsl(var(--status-warn))]/10",
    text: "text-[hsl(var(--status-warn))]",
    dot: "bg-[hsl(var(--status-warn))]",
    label: "Maintenance"
  },
  ok: {
    bg: "bg-[hsl(var(--status-ok))]/10",
    text: "text-[hsl(var(--status-ok))]",
    dot: "bg-[hsl(var(--status-ok))]",
    label: "OK"
  },
  actif: {
    bg: "bg-[hsl(var(--status-up))]/10",
    text: "text-[hsl(var(--status-up))]",
    dot: "bg-[hsl(var(--status-up))]",
    label: "Actif"
  },
  fermee: {
    bg: "bg-[hsl(var(--status-down))]/10",
    text: "text-[hsl(var(--status-down))]",
    dot: "bg-[hsl(var(--status-down))]",
    label: "Fermée"
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.ok;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider",
      config.bg,
      config.text,
      className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
