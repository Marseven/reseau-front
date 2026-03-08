import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import QueryWrapper from "@/components/ui/query-wrapper";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import AddSalleForm from "@/components/forms/AddSalleForm";
import { useSalles, useDeleteSalle } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { toast } from "@/hooks/use-toast";

export default function SallesSection() {
  const [params] = useState({ per_page: 50 });
  const { data: paginatedSalles, isLoading, isError, error } = useSalles(params);
  const deleteSalle = useDeleteSalle();
  const { canWrite } = useRole();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const salles = paginatedSalles?.data || [];

  const handleRowClick = (item: any) => {
    navigate(`/salles/${item.id}`);
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
    deleteSalle.mutate(selectedItem.id, {
      onSuccess: () => {
        toast({ title: "Salle supprimée", description: "La salle a été supprimée avec succès" });
        setIsDeleteOpen(false);
        setSelectedItem(null);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" }),
    });
  };

  const typeLabels: Record<string, string> = {
    salle_serveur: "Salle Serveur",
    bureau: "Bureau",
    technique: "Technique",
    stockage: "Stockage",
  };

  const tableData = salles.map((s: any) => ({
    ...s,
    batiment_name: s.batiment?.name || '-',
    type_label: s.type ? (typeLabels[s.type] || s.type) : '-',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Salles</h2>
          <div className="text-sm text-muted-foreground mt-1">
            Salles au sein des bâtiments
          </div>
        </div>
        {canWrite && <AddSalleForm />}
      </div>

      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        <DataTableEnhanced
          title={`${salles.length} salles`}
          columns={["code", "name", "batiment_name", "coffrets_count", "type_label", "status"]}
          data={tableData}
          onRowClick={handleRowClick}
          onEdit={canWrite ? handleEdit : undefined}
          columnRenderers={{
            coffrets_count: (value: any, row: any) => (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20"
                onClick={(e) => { e.stopPropagation(); navigate(`/salles/${row.id}`); }}
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

      {editItem && (
        <AddSalleForm
          initialData={editItem}
          open={isEditOpen}
          onOpenChange={(v) => { setIsEditOpen(v); if (!v) setEditItem(null); }}
        />
      )}

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Supprimer la salle"
        description={`Êtes-vous sûr de vouloir supprimer la salle "${selectedItem?.name}" ? Cette action est irréversible.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteSalle.isPending}
      />
    </div>
  );
}
