import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import QueryWrapper from "@/components/ui/query-wrapper";
import DetailsModal from "@/components/ui/details-modal";
import EditModal from "@/components/ui/edit-modal";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import AddBatimentForm from "@/components/forms/AddBatimentForm";
import { useBatiments, useUpdateBatiment, useDeleteBatiment } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { toast } from "@/hooks/use-toast";

export default function BatimentsSection() {
  const [params, setParams] = useState({ per_page: 50 });
  const { data: paginatedBatiments, isLoading, isError, error } = useBatiments(params);
  const updateBatiment = useUpdateBatiment();
  const deleteBatiment = useDeleteBatiment();
  const { canWrite } = useRole();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const batiments = paginatedBatiments?.data || [];

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleSave = (updatedItem: any) => {
    updateBatiment.mutate(updatedItem, {
      onSuccess: () => {
        toast({ title: "Bâtiment mis à jour", description: "Le bâtiment a été mis à jour avec succès" });
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
    deleteBatiment.mutate(selectedItem.id, {
      onSuccess: () => {
        toast({ title: "Bâtiment supprimé", description: "Le bâtiment a été supprimé avec succès" });
        setIsDeleteOpen(false);
        setSelectedItem(null);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" }),
    });
  };

  const tableData = batiments.map((b: any) => ({
    ...b,
    zone_name: b.zone?.name || '-',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Bâtiments</h2>
          <div className="text-sm text-muted-foreground mt-1">
            Bâtiments au sein des zones
          </div>
        </div>
        {canWrite && <AddBatimentForm />}
      </div>

      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        <DataTableEnhanced
          title={`${batiments.length} bâtiments`}
          columns={["code", "name", "zone_name", "address", "floors_count", "status"]}
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
        title="Détails du bâtiment"
        data={selectedItem}
        onEdit={() => { setIsDetailsOpen(false); setIsEditOpen(true); }}
      />

      <EditModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Modifier le bâtiment"
        data={selectedItem}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Supprimer le bâtiment"
        description={`Êtes-vous sûr de vouloir supprimer le bâtiment "${selectedItem?.name}" ? Cette action est irréversible.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteBatiment.isPending}
      />
    </div>
  );
}
