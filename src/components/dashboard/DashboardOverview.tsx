import {
  Server, Router, Cable, Activity, Clock, Building2, DoorOpen, Box,
  Wrench, AlertTriangle, CheckCircle2, XCircle, Loader2, Network
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadialBarChart, RadialBar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "./StatsCard";
import QueryWrapper from "../ui/query-wrapper";
import { useGlobalStats } from "@/hooks/api";
import {
  useEquipementsByStatus,
  useEquipementsByType,
  usePortUtilization,
  useMaintenanceTrends,
} from "@/hooks/api";

const STATUS_COLORS: Record<string, string> = {
  active: "#059669",
  inactive: "#dc2626",
  maintenance: "#d97706",
};

const PIE_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626", "#0891b2", "#be185d", "#4f46e5"];

export default function DashboardOverview() {
  const { data: stats, isLoading, isError, error } = useGlobalStats();
  const { data: eqByStatus } = useEquipementsByStatus();
  const { data: eqByType } = useEquipementsByType();
  const { data: portUtil } = usePortUtilization();
  const { data: maintTrends } = useMaintenanceTrends();

  const portChartData = portUtil
    ? [
        { name: "Utilisés", value: portUtil.utilization_percent, fill: "#2563eb" },
        { name: "Libres", value: 100, fill: "#e2e8f0" },
      ]
    : [];

  const maintenanceActive = (stats?.maintenances?.planifiee ?? 0) + (stats?.maintenances?.en_cours ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Tableau de bord
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Vue d'ensemble de l'infrastructure reseau
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
          <Clock className="h-3.5 w-3.5" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--status-up))] animate-pulse" />
            <span>Synchro temps reel</span>
          </div>
        </div>
      </div>

      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        {/* Row 1 : 4 stats principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Sites" value={String(stats?.sites?.total ?? 0)} icon={Server} />
          <StatsCard title="Equipements" value={String(stats?.equipements?.total ?? 0)} icon={Router} />
          <StatsCard title="Ports" value={String(stats?.ports?.total ?? 0)} icon={Cable} />
          <StatsCard title="Liaisons" value={String(stats?.liaisons?.total ?? 0)} icon={Activity} />
        </div>

        {/* Row 2 : 4 stats secondaires */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <MiniStat icon={Building2} label="Batiments" value={stats?.batiments?.total ?? 0} />
          <MiniStat icon={DoorOpen} label="Salles" value={stats?.salles?.total ?? 0} />
          <MiniStat icon={Box} label="Coffrets" value={stats?.coffrets?.total ?? 0} />
          <MiniStat icon={Network} label="VLANs" value={stats?.vlans?.total ?? 0} />
        </div>

        {/* Row 3 : Statuts rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <StatusCard
            title="Equipements actifs"
            active={stats?.equipements?.active ?? 0}
            inactive={stats?.equipements?.inactive ?? 0}
            total={stats?.equipements?.total ?? 0}
          />
          <StatusCard
            title="Coffrets actifs"
            active={stats?.coffrets?.active ?? 0}
            inactive={stats?.coffrets?.inactive ?? 0}
            total={stats?.coffrets?.total ?? 0}
          />
          <MaintenanceCard
            planifiee={stats?.maintenances?.planifiee ?? 0}
            enCours={stats?.maintenances?.en_cours ?? 0}
            terminee={stats?.maintenances?.terminee ?? 0}
            total={stats?.maintenances?.total ?? 0}
          />
        </div>

        {/* Row 4 : Graphiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Equipements par type (Pie) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Equipements par type</CardTitle>
            </CardHeader>
            <CardContent>
              {eqByType && eqByType.length > 0 ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={180}>
                    <PieChart>
                      <Pie data={eqByType} dataKey="count" nameKey="type" cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3}>
                        {eqByType.map((_: any, i: number) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5 text-xs">
                    {eqByType.slice(0, 6).map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-muted-foreground truncate max-w-[100px]">{item.type}</span>
                        </div>
                        <span className="font-mono font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyChart />
              )}
            </CardContent>
          </Card>

          {/* Equipements par statut (Bar) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Equipements par statut</CardTitle>
            </CardHeader>
            <CardContent>
              {eqByStatus && eqByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={eqByStatus} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="status" width={85} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {(eqByStatus || []).map((entry: any, i: number) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </CardContent>
          </Card>

          {/* Utilisation ports (Radial) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Utilisation des ports</CardTitle>
            </CardHeader>
            <CardContent>
              {portUtil ? (
                <div>
                  <div className="relative" style={{ height: 130 }}>
                    <ResponsiveContainer width="100%" height={130}>
                      <RadialBarChart
                        innerRadius="55%"
                        outerRadius="85%"
                        data={portChartData}
                        startAngle={180}
                        endAngle={0}
                        cx="50%"
                        cy="95%"
                      >
                        <RadialBar dataKey="value" cornerRadius={5} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col items-center -mt-2">
                    <span className="text-2xl font-bold font-mono">{portUtil.utilization_percent}%</span>
                    <span className="text-[11px] text-muted-foreground">
                      {portUtil.connected} / {portUtil.total} ports connectes
                    </span>
                  </div>
                </div>
              ) : (
                <EmptyChart />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 5 : Tendance maintenances (full width) */}
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tendance maintenances (12 derniers mois)</CardTitle>
          </CardHeader>
          <CardContent>
            {maintTrends && maintTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={maintTrends} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Interventions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                Aucune donnee de maintenance
              </div>
            )}
          </CardContent>
        </Card>
      </QueryWrapper>
    </div>
  );
}

/* ── Mini composants internes ── */

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold font-mono">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function StatusCard({ title, active, inactive, total }: { title: string; active: number; inactive: number; total: number }) {
  const pct = total > 0 ? Math.round((active / total) * 100) : 0;
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{title}</p>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl font-bold font-mono">{pct}%</span>
        <span className="text-xs text-muted-foreground">disponibles</span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          {active} actifs
        </span>
        <span className="flex items-center gap-1">
          <XCircle className="h-3 w-3 text-destructive" />
          {inactive} inactifs
        </span>
      </div>
    </Card>
  );
}

function MaintenanceCard({ planifiee, enCours, terminee, total }: { planifiee: number; enCours: number; terminee: number; total: number }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Maintenances</p>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl font-bold font-mono">{total}</span>
        <span className="text-xs text-muted-foreground">total</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            <span className="text-muted-foreground">Planifiees</span>
          </span>
          <span className="font-mono font-semibold">{planifiee}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5">
            <Wrench className="h-3 w-3 text-blue-500" />
            <span className="text-muted-foreground">En cours</span>
          </span>
          <span className="font-mono font-semibold">{enCours}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span className="text-muted-foreground">Terminees</span>
          </span>
          <span className="font-mono font-semibold">{terminee}</span>
        </div>
      </div>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">
      Aucune donnee disponible
    </div>
  );
}
