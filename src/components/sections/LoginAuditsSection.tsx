import { useState } from "react";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import QueryWrapper from "@/components/ui/query-wrapper";
import DetailsModal from "@/components/ui/details-modal";
import { useLoginAudits } from "@/hooks/api";

const actionLabels: Record<string, string> = {
  login: "Connexion",
  logout: "Déconnexion",
  failed: "Échec",
};

export default function LoginAuditsSection() {
  const [params] = useState({ per_page: 50 });
  const { data: paginatedAudits, isLoading, isError, error } = useLoginAudits(params);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const audits = paginatedAudits?.data || [];

  const tableData = audits.map((audit: any) => ({
    ...audit,
    user_name: audit.user ? `${audit.user.name} ${audit.user.surname || ""}`.trim() : "—",
    action_label: actionLabels[audit.action] || audit.action,
    date: new Date(audit.created_at).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Audit des connexions</h2>
        <div className="text-sm text-muted-foreground mt-1">
          Historique des connexions, déconnexions et tentatives échouées
        </div>
      </div>

      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        <DataTableEnhanced
          title={`${audits.length} entrées`}
          columns={["date", "user_name", "action_label", "ip_address", "method"]}
          columnLabels={{
            date: "Date",
            user_name: "Utilisateur",
            action_label: "Action",
            ip_address: "Adresse IP",
            method: "Méthode",
          }}
          data={tableData}
          onRowClick={handleRowClick}
        />
      </QueryWrapper>

      <DetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        title="Détails de l'audit"
        data={selectedItem ? {
          Date: selectedItem.date,
          Utilisateur: selectedItem.user_name,
          Action: selectedItem.action_label,
          "Adresse IP": selectedItem.ip_address || "—",
          "Méthode": selectedItem.method || "—",
          "User Agent": selectedItem.user_agent || "—",
        } : null}
      />
    </div>
  );
}
