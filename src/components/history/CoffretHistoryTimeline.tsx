import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoffretHistory, useZones, useSites, useSalles, useBatiments } from "@/hooks/api";
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

const fieldLabels: Record<string, string> = {
  code: "Code",
  name: "Nom",
  piece: "Pièce",
  type: "Type",
  status: "Statut",
  description: "Description",
  zone_id: "Zone",
  site_id: "Site",
  coffret_id: "Armoire",
  salle_id: "Salle",
  batiment_id: "Bâtiment",
  equipement_id: "Équipement",
  connected_equipment_id: "Équipement connecté",
  long: "Longitude",
  lat: "Latitude",
  ip_address: "Adresse IP",
  vlan: "VLAN",
  speed: "Vitesse",
  port_label: "Label port",
  port_type: "Type port",
  device_name: "Appareil hôte",
  poe_enabled: "PoE",
  direction_in_out: "Direction",
  equipement_code: "Code équipement",
  classification: "Classification",
  fabricant: "Fabricant",
  modele: "Modèle",
  serial_number: "N° série",
  firmware_version: "Version firmware",
  floor: "Étage",
  building: "Bâtiment",
  label: "Label",
  media: "Média",
  length: "Longueur",
  from: "Origine",
  to: "Destination",
  title: "Titre",
  scheduled_date: "Date prévue",
  is_active: "Actif",
  role: "Rôle",
  email: "Email",
  username: "Nom d'utilisateur",
  phone: "Téléphone",
  address: "Adresse",
  monitored_scope: "Périmètre",
  vendor: "Fournisseur",
  endpoint: "Endpoint",
};

const statusLabels: Record<string, string> = {
  active: "Actif",
  inactive: "Inactif",
  maintenance: "Maintenance",
  reserved: "Réservé",
  planifiee: "Planifiée",
  en_cours: "En cours",
  terminee: "Terminée",
  annulee: "Annulée",
};

type ResolveMap = Record<string, Record<number, string>>;

function formatValue(key: string, value: any, resolveMap?: ResolveMap): string {
  if (value === null || value === undefined) return "—";
  if (key === "status" && typeof value === "string" && statusLabels[value]) return statusLabels[value];
  if (key === "poe_enabled") return value ? "Oui" : "Non";
  if (key === "is_active") return value ? "Oui" : "Non";
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (resolveMap?.[key] && typeof value === "number") {
    return resolveMap[key][value] || String(value);
  }
  return String(value);
}

function DiffPanel({ oldValues, newValues, resolveMap }: { oldValues: Record<string, any> | null; newValues: Record<string, any> | null; resolveMap?: ResolveMap }) {
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
        const label = fieldLabels[key] || key;
        return (
          <div key={key} className="flex items-center gap-2 py-0.5">
            <span className="text-muted-foreground font-mono w-36 truncate" title={key}>{label}</span>
            {oldVal !== undefined && (
              <span className="line-through text-red-500">{formatValue(key, oldVal, resolveMap)}</span>
            )}
            {oldVal !== undefined && newVal !== undefined && <span className="text-muted-foreground">→</span>}
            {newVal !== undefined && (
              <span className="text-green-600 dark:text-green-400">{formatValue(key, newVal, resolveMap)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TimelineEntry({ log, resolveMap }: { log: ActivityLog; resolveMap?: ResolveMap }) {
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
          <DiffPanel oldValues={log.old_values} newValues={log.new_values} resolveMap={resolveMap} />
        )}
      </div>
    </div>
  );
}

export default function CoffretHistoryTimeline({ coffretId }: { coffretId: number }) {
  const { data, isLoading, isError } = useCoffretHistory(coffretId);
  const logs = data?.data || [];

  const { data: zonesData } = useZones({ per_page: 200 });
  const { data: sitesData } = useSites({ per_page: 200 });
  const { data: sallesData } = useSalles({ per_page: 200 });
  const { data: batimentsData } = useBatiments({ per_page: 200 });

  const resolveMap = useMemo<ResolveMap>(() => {
    const zones = zonesData?.data || [];
    const sites = sitesData?.data || [];
    const salles = sallesData?.data || [];
    const batiments = batimentsData?.data || [];
    return {
      zone_id: Object.fromEntries(zones.map((z: any) => [z.id, z.name])),
      site_id: Object.fromEntries(sites.map((s: any) => [s.id, s.name])),
      salle_id: Object.fromEntries(salles.map((s: any) => [s.id, s.name])),
      batiment_id: Object.fromEntries(batiments.map((b: any) => [b.id, b.name])),
    };
  }, [zonesData, sitesData, sallesData, batimentsData]);

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
        <TimelineEntry key={log.id} log={log} resolveMap={resolveMap} />
      ))}
    </div>
  );
}
