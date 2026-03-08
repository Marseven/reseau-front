import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import QueryWrapper from "@/components/ui/query-wrapper";
import DetailsModal from "@/components/ui/details-modal";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import AddVlanForm from "@/components/forms/AddVlanForm";
import { useVlans, useDeleteVlan } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { toast } from "@/hooks/use-toast";

export default function VlansSection() {
  const [params, setParams] = useState({ per_page: 50 });
  const { data: paginatedVlans, isLoading, isError, error } = useVlans(params);
  const deleteVlan = useDeleteVlan();
  const { canWrite } = useRole();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const vlans = paginatedVlans?.data || [];

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
    deleteVlan.mutate(selectedItem.id, {
      onSuccess: () => {
        toast({ title: "VLAN supprimé", description: "Le VLAN a été supprimé avec succès" });
        setIsDeleteOpen(false);
        setSelectedItem(null);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" }),
    });
  };

  const tableData = vlans.map((v: any) => ({
    ...v,
    site_name: v.site?.name || '-',
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">Gestion des VLANs</h2>
          {canWrite && <AddVlanForm />}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          VLANs et segmentation réseau
        </div>
      </div>

      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        <DataTableEnhanced
          title={`${vlans.length} VLANs`}
          columns={["vlan_id", "name", "site_name", "network", "gateway", "status"]}
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
        title="Détails du VLAN"
        data={selectedItem}
        onEdit={() => { setIsDetailsOpen(false); handleEdit(selectedItem); }}
      />

      <AddVlanForm
        initialData={editItem}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Supprimer le VLAN"
        description={`Êtes-vous sûr de vouloir supprimer le VLAN "${selectedItem?.name}" ? Cette action est irréversible.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteVlan.isPending}
      />
    </div>
  );
}
