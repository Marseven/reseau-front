import { cn } from "@/lib/utils";

interface ClassificationBadgeProps {
  classification: string;
  className?: string;
}

export default function ClassificationBadge({ classification, className }: ClassificationBadgeProps) {
  const isIT = classification?.toUpperCase() === "IT";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider",
        isIT
          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
          : "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        className
      )}
    >
      {classification?.toUpperCase() || "—"}
    </span>
  );
}
