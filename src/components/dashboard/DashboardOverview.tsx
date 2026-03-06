import { Server, Router, Cable, Activity, Clock } from "lucide-react";
import StatsCard from "./StatsCard";
import DataTable from "./DataTable";
import QueryWrapper from "../ui/query-wrapper";
import { useGlobalStats } from "@/hooks/api";

export default function DashboardOverview() {
  const { data: stats, isLoading, isError, error } = useGlobalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Vue d'ensemble
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitoring temps réel de l'infrastructure
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
          <Clock className="h-3.5 w-3.5" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--status-up))] animate-pulse" />
            <span>Dernière synchro: il y a 5 min</span>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Sites" value={String(stats?.sites?.total ?? 0)} icon={Server} />
          <StatsCard title="Équipements" value={String(stats?.equipements?.total ?? 0)} icon={Router} />
          <StatsCard title="Ports" value={String(stats?.ports?.total ?? 0)} icon={Cable} />
          <StatsCard title="Liaisons actives" value={String(stats?.liaisons?.total ?? 0)} icon={Activity} />
        </div>
      </QueryWrapper>
    </div>
  );
}
