import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import QueryWrapper from "@/components/ui/query-wrapper";
import DetailsModal from "@/components/ui/details-modal";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import AddMaintenanceForm from "@/components/forms/AddMaintenanceForm";
import { useMaintenances, useDeleteMaintenance } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { toast } from "@/hooks/use-toast";

export default function MaintenanceSection() {
  const [params] = useState({ per_page: 50 });
  const { data: paginatedMaintenances, isLoading, isError, error } = useMaintenances(params);
  const deleteMaintenance = useDeleteMaintenance();
  const { canWrite } = useRole();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const maintenances = paginatedMaintenances?.data || [];

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (item: any) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedItem) return;
    deleteMaintenance.mutate(selectedItem.id, {
      onSuccess: () => {
        toast({ title: "Maintenance supprimée", description: "La maintenance a été supprimée avec succès" });
        setIsDeleteOpen(false);
        setSelectedItem(null);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" }),
    });
  };

  const priorityLabels: Record<string, string> = {
    basse: "Basse",
    moyenne: "Moyenne",
    haute: "Haute",
    critique: "Critique",
  };

  const statusLabels: Record<string, string> = {
    planifiee: "Planifiée",
    en_cours: "En cours",
    terminee: "Terminée",
    annulee: "Annulée",
  };

  const tableData = maintenances.map((m: any) => ({
    ...m,
    technicien_name: m.technicien ? `${m.technicien.name} ${m.technicien.surname || ''}`.trim() : '-',
    site_name: m.site?.name || '-',
    priority_label: priorityLabels[m.priority] || m.priority,
    status_label: statusLabels[m.status] || m.status,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion de la Maintenance</h2>
          <div className="text-sm text-muted-foreground mt-1">
            Planification et suivi des interventions techniques
          </div>
        </div>
        {canWrite && <AddMaintenanceForm />}
      </div>

      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        <DataTableEnhanced
          title={`${maintenances.length} maintenances`}
          columns={["code", "title", "type", "priority_label", "scheduled_date", "technicien_name", "site_name", "status_label"]}
          data={tableData}
          onRowClick={handleRowClick}
          onEdit={canWrite ? handleEdit : undefined}
          renderRowActions={canWrite ? (row: any) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : undefined}
        />
      </QueryWrapper>

      <DetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        title="Détails de la maintenance"
        data={selectedItem}
        onEdit={() => { setIsDetailsOpen(false); handleEdit(selectedItem); }}
      />

      {editItem && (
        <AddMaintenanceForm
          initialData={editItem}
          open={isEditOpen}
          onOpenChange={(v) => { setIsEditOpen(v); if (!v) setEditItem(null); }}
        />
      )}

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Supprimer la maintenance"
        description={`Êtes-vous sûr de vouloir supprimer la maintenance "${selectedItem?.title}" ? Cette action est irréversible.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMaintenance.isPending}
      />
    </div>
  );
}
