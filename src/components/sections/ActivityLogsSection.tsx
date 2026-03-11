import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import QueryWrapper from "@/components/ui/query-wrapper";
import DetailsModal from "@/components/ui/details-modal";
import { useActivityLogs } from "@/hooks/api";

const actionLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  created: { label: "Création", variant: "default" },
  updated: { label: "Modification", variant: "secondary" },
  deleted: { label: "Suppression", variant: "destructive" },
};

function getEntityShortName(entityType: string): string {
  const parts = entityType.split("\\");
  const name = parts[parts.length - 1];
  const nameMap: Record<string, string> = {
    Coffret: "Armoire",
    Equipement: "Équipement",
    Port: "Port",
    Liaison: "Liaison",
    Metric: "Métrique",
    System: "Système",
    Vlan: "VLAN",
    Site: "Site",
    Zone: "Zone",
    Batiment: "Bâtiment",
    Salle: "Salle",
    Maintenance: "Maintenance",
    ChangeRequest: "Demande",
    User: "Utilisateur",
  };
  return nameMap[name] || name;
}

export default function ActivityLogsSection() {
  const [params] = useState({ per_page: 50 });
  const { data: paginatedLogs, isLoading, isError, error } = useActivityLogs(params);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const logs = paginatedLogs?.data || [];

  const tableData = logs.map((log: any) => {
    const actionCfg = actionLabels[log.action];
    return {
      ...log,
      user_name: log.user ? `${log.user.name} ${log.user.surname || ""}`.trim() : "—",
      action_label: actionCfg?.label || log.action,
      entity_label: getEntityShortName(log.entity_type),
      date: new Date(log.created_at).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Journal d'activité</h2>
        <div className="text-sm text-muted-foreground mt-1">
          Historique de toutes les actions effectuées sur les ressources
        </div>
      </div>

      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        <DataTableEnhanced
          title={`${logs.length} entrées`}
          columns={["date", "user_name", "action_label", "entity_label", "entity_id", "ip_address"]}
          columnLabels={{
            date: "Date",
            user_name: "Utilisateur",
            action_label: "Action",
            entity_label: "Ressource",
            entity_id: "ID",
            ip_address: "Adresse IP",
          }}
          data={tableData}
          onRowClick={handleRowClick}
        />
      </QueryWrapper>

      <DetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        title="Détails de l'activité"
        data={selectedItem ? {
          Date: selectedItem.date,
          Utilisateur: selectedItem.user_name,
          Action: selectedItem.action_label,
          Ressource: selectedItem.entity_label,
          "ID Ressource": selectedItem.entity_id,
          "Adresse IP": selectedItem.ip_address || "—",
          "Anciennes valeurs": selectedItem.old_values ? JSON.stringify(selectedItem.old_values, null, 2) : "—",
          "Nouvelles valeurs": selectedItem.new_values ? JSON.stringify(selectedItem.new_values, null, 2) : "—",
        } : null}
      />
    </div>
  );
}
