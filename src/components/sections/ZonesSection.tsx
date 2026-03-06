import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import QueryWrapper from "@/components/ui/query-wrapper";
import DetailsModal from "@/components/ui/details-modal";
import EditModal from "@/components/ui/edit-modal";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import AddZoneForm from "@/components/forms/AddZoneForm";
import { useZones, useUpdateZone, useDeleteZone } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { toast } from "@/hooks/use-toast";

export default function ZonesSection() {
  const [params, setParams] = useState({ per_page: 50 });
  const { data: paginatedZones, isLoading, isError, error } = useZones(params);
  const updateZone = useUpdateZone();
  const deleteZone = useDeleteZone();
  const { canWrite } = useRole();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const zones = paginatedZones?.data || [];

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleSave = (updatedItem: any) => {
    updateZone.mutate(updatedItem, {
      onSuccess: () => {
        toast({ title: "Zone mise à jour", description: "La zone a été mise à jour avec succès" });
        setIsEditOpen(false);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" }),
    });
  };

  const handleDeleteClick = (item: any) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedItem) return;
    deleteZone.mutate(selectedItem.id, {
      onSuccess: () => {
        toast({ title: "Zone supprimée", description: "La zone a été supprimée avec succès" });
        setIsDeleteOpen(false);
        setSelectedItem(null);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" }),
    });
  };

  const tableData = zones.map((z: any) => ({
    ...z,
    site_name: z.site?.name || '-',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Zones</h2>
          <div className="text-sm text-muted-foreground mt-1">
            Zones et bâtiments au sein des sites
          </div>
        </div>
        {canWrite && <AddZoneForm />}
      </div>

      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        <DataTableEnhanced
          title={`${zones.length} zones`}
          columns={["code", "name", "floor", "building", "site_name", "status"]}
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
        title="Détails de la zone"
        data={selectedItem}
        onEdit={() => { setIsDetailsOpen(false); setIsEditOpen(true); }}
      />

      <EditModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Modifier la zone"
        data={selectedItem}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Supprimer la zone"
        description={`Êtes-vous sûr de vouloir supprimer la zone "${selectedItem?.name}" ? Cette action est irréversible.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteZone.isPending}
      />
    </div>
  );
}
