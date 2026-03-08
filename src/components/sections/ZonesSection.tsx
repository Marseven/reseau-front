import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import QueryWrapper from "@/components/ui/query-wrapper";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import AddZoneForm from "@/components/forms/AddZoneForm";
import { useZones, useDeleteZone } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { toast } from "@/hooks/use-toast";

export default function ZonesSection() {
  const [params, setParams] = useState({ per_page: 50 });
  const { data: paginatedZones, isLoading, isError, error } = useZones(params);
  const deleteZone = useDeleteZone();
  const { canWrite } = useRole();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const zones = paginatedZones?.data || [];

  const handleRowClick = (item: any) => {
    navigate(`/zones/${item.id}`);
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
          columns={["code", "name", "site_name", "batiments_count", "status"]}
          data={tableData}
          onRowClick={handleRowClick}
          onEdit={canWrite ? handleEdit : undefined}
          columnRenderers={{
            batiments_count: (value: any, row: any) => (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20"
                onClick={(e) => { e.stopPropagation(); navigate(`/zones/${row.id}`); }}
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

      <AddZoneForm
        initialData={editItem}
        open={isEditOpen}
        onOpenChange={(v) => { setIsEditOpen(v); if (!v) setEditItem(null); }}
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
