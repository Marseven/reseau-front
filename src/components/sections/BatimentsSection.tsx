import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import QueryWrapper from "@/components/ui/query-wrapper";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import AddBatimentForm from "@/components/forms/AddBatimentForm";
import { useBatiments, useDeleteBatiment } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { toast } from "@/hooks/use-toast";

export default function BatimentsSection() {
  const [params, setParams] = useState({ per_page: 50 });
  const { data: paginatedBatiments, isLoading, isError, error } = useBatiments(params);
  const deleteBatiment = useDeleteBatiment();
  const { canWrite } = useRole();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const batiments = paginatedBatiments?.data || [];

  const handleRowClick = (item: any) => {
    navigate(`/batiments/${item.id}`);
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
          columns={["code", "name", "zone_name", "salles_count", "status"]}
          data={tableData}
          onRowClick={handleRowClick}
          onEdit={canWrite ? handleEdit : undefined}
          columnRenderers={{
            salles_count: (value: any, row: any) => (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20"
                onClick={(e) => { e.stopPropagation(); navigate(`/batiments/${row.id}`); }}
              >
                {value || 0}
              </Badge>
            ),
          }}
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

      <AddBatimentForm
        initialData={editItem}
        open={isEditOpen}
        onOpenChange={(v) => { setIsEditOpen(v); if (!v) setEditItem(null); }}
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
