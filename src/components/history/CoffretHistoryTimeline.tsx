import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoffretHistory } from "@/hooks/api";
import type { ActivityLog } from "@/types/api";

const actionConfig: Record<string, { label: string; color: string }> = {
  created: { label: "Créé", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  updated: { label: "Modifié", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  deleted: { label: "Supprimé", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

function getEntityShortName(entityType: string): string {
  const parts = entityType.split("\\");
  const name = parts[parts.length - 1];
  const nameMap: Record<string, string> = {
    Coffret: "Coffret",
    Equipement: "Équipement",
    ChangeRequest: "Demande",
    Maintenance: "Maintenance",
  };
  return nameMap[name] || name;
}

function DiffPanel({ oldValues, newValues }: { oldValues: Record<string, any> | null; newValues: Record<string, any> | null }) {
  const keys = new Set([
    ...Object.keys(oldValues || {}),
    ...Object.keys(newValues || {}),
  ]);

  const skipKeys = ["id", "created_at", "updated_at", "deleted_at", "qr_token", "password", "remember_token"];
  const filteredKeys = Array.from(keys).filter((k) => !skipKeys.includes(k));

  if (filteredKeys.length === 0) return null;

  return (
    <div className="mt-2 space-y-1 text-xs">
      {filteredKeys.map((key) => {
        const oldVal = oldValues?.[key];
        const newVal = newValues?.[key];
        if (typeof oldVal === "object" || typeof newVal === "object") return null;
        return (
          <div key={key} className="flex items-center gap-2 py-0.5">
            <span className="text-muted-foreground font-mono w-32 truncate">{key}</span>
            {oldVal !== undefined && (
              <span className="line-through text-red-500">{String(oldVal ?? "—")}</span>
            )}
            {oldVal !== undefined && newVal !== undefined && <span className="text-muted-foreground">→</span>}
            {newVal !== undefined && (
              <span className="text-green-600 dark:text-green-400">{String(newVal ?? "—")}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TimelineEntry({ log }: { log: ActivityLog }) {
  const [expanded, setExpanded] = useState(false);
  const config = actionConfig[log.action] || { label: log.action, color: "bg-gray-100 text-gray-800" };
  const hasDetails = (log.old_values && Object.keys(log.old_values).length > 0) ||
    (log.new_values && Object.keys(log.new_values).length > 0);

  return (
    <div className="relative pl-6 pb-6 last:pb-0">
      {/* Timeline dot and line */}
      <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-border border-2 border-background" />
      <div className="absolute left-[5px] top-4 bottom-0 w-px bg-border last:hidden" />

      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {new Date(log.created_at).toLocaleString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {log.user && (
            <span className="text-xs font-medium">{log.user.name} {log.user.surname}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
          <Badge variant="secondary">
            {getEntityShortName(log.entity_type)}
          </Badge>
          {hasDetails && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
            >
              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              Détails
            </button>
          )}
        </div>
        {expanded && hasDetails && (
          <DiffPanel oldValues={log.old_values} newValues={log.new_values} />
        )}
      </div>
    </div>
  );
}

export default function CoffretHistoryTimeline({ coffretId }: { coffretId: number }) {
  const { data, isLoading, isError } = useCoffretHistory(coffretId);
  const logs = data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-destructive">Erreur lors du chargement de l'historique.</p>;
  }

  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun historique pour cette baie.</p>;
  }

  return (
    <div className="relative">
      {logs.map((log) => (
        <TimelineEntry key={log.id} log={log} />
      ))}
    </div>
  );
}
