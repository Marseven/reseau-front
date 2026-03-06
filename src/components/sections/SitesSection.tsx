import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import QueryWrapper from "@/components/ui/query-wrapper";
import DetailsModal from "@/components/ui/details-modal";
import EditModal from "@/components/ui/edit-modal";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import AddSiteForm from "@/components/forms/AddSiteForm";
import { useSites, useUpdateSite, useDeleteSite } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { toast } from "@/hooks/use-toast";

export default function SitesSection() {
  const [params, setParams] = useState({ per_page: 50 });
  const { data: paginatedSites, isLoading, isError, error } = useSites(params);
  const updateSite = useUpdateSite();
  const deleteSite = useDeleteSite();
  const { canWrite } = useRole();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const sites = paginatedSites?.data || [];

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleSave = (updatedItem: any) => {
    updateSite.mutate(updatedItem, {
      onSuccess: () => {
        toast({ title: "Site mis à jour", description: "Le site a été mis à jour avec succès" });
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
    deleteSite.mutate(selectedItem.id, {
      onSuccess: () => {
        toast({ title: "Site supprimé", description: "Le site a été supprimé avec succès" });
        setIsDeleteOpen(false);
        setSelectedItem(null);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Sites</h2>
          <div className="text-sm text-muted-foreground mt-1">
            Sites géographiques et emplacements
          </div>
        </div>
        {canWrite && <AddSiteForm />}
      </div>

      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        <DataTableEnhanced
          title={`${sites.length} sites`}
          columns={["code", "name", "city", "country", "status"]}
          data={sites}
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
        title="Détails du site"
        data={selectedItem}
        onEdit={() => { setIsDetailsOpen(false); setIsEditOpen(true); }}
      />

      <EditModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Modifier le site"
        data={selectedItem}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Supprimer le site"
        description={`Êtes-vous sûr de vouloir supprimer le site "${selectedItem?.name}" ? Cette action est irréversible.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteSite.isPending}
      />
    </div>
  );
}
