import { useState } from "react";
import { Trash2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import QueryWrapper from "@/components/ui/query-wrapper";
import DetailsModal from "@/components/ui/details-modal";
import EditModal from "@/components/ui/edit-modal";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import AddLiaisonForm from "@/components/forms/AddLiaisonForm";
import { useLiaisons, useUpdateLiaison, useDeleteLiaison, useExportLiaisonsCsv } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { toast } from "@/hooks/use-toast";

export default function LiaisonsSection() {
  const [params] = useState({ per_page: 50 });
  const { data: paginatedLiaisons, isLoading, isError, error } = useLiaisons(params);
  const updateLiaison = useUpdateLiaison();
  const deleteLiaison = useDeleteLiaison();
  const { canWrite } = useRole();
  const exportCsv = useExportLiaisonsCsv();
  const [selectedLiaison, setSelectedLiaison] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const liaisons = paginatedLiaisons?.data || [];

  const handleRowClick = (liaison: any) => {
    setSelectedLiaison(liaison);
    setIsDetailsOpen(true);
  };

  const handleEdit = (liaison: any) => {
    setSelectedLiaison(liaison);
    setIsEditOpen(true);
  };

  const handleSave = (updatedLiaison: any) => {
    updateLiaison.mutate(updatedLiaison, {
      onSuccess: () => {
        toast({ title: "Liaison mise à jour", description: "La liaison a été mise à jour avec succès" });
        setIsEditOpen(false);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" }),
    });
  };

  const handleDeleteClick = (item: any) => {
    setSelectedLiaison(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedLiaison) return;
    deleteLiaison.mutate(selectedLiaison.id, {
      onSuccess: () => {
        toast({ title: "Liaison supprimée", description: "La liaison a été supprimée avec succès" });
        setIsDeleteOpen(false);
        setSelectedLiaison(null);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Liaisons</h2>
          <div className="text-sm text-muted-foreground mt-1">
            Configuration et monitoring des connexions réseau
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canWrite && (
            <Button variant="outline" size="sm" disabled={exportCsv.isPending} onClick={() => exportCsv.mutate(undefined, {
              onSuccess: () => toast({ title: "Export terminé", description: "Le fichier CSV a été téléchargé" }),
              onError: () => toast({ title: "Erreur", description: "Erreur lors de l'export", variant: "destructive" }),
            })}>
              {exportCsv.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
              CSV
            </Button>
          )}
          {canWrite && <AddLiaisonForm />}
        </div>
      </div>

      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        <DataTableEnhanced
          title={`${liaisons.length} liaisons configurées`}
          columns={["label", "media", "from", "to", "status_label", "length"]}
          data={liaisons}
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
        title="Détails de la liaison"
        data={selectedLiaison}
        onEdit={() => {
          setIsDetailsOpen(false);
          setIsEditOpen(true);
        }}
      />

      <EditModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Modifier la liaison"
        data={selectedLiaison}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Supprimer la liaison"
        description={`Êtes-vous sûr de vouloir supprimer la liaison "${selectedLiaison?.label}" ? Cette action est irréversible.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLiaison.isPending}
      />
    </div>
  );
}
