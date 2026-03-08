import { useState } from "react";
import { Check, X, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import QueryWrapper from "@/components/ui/query-wrapper";
import DetailsModal from "@/components/ui/details-modal";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import { useChangeRequests, useReviewChangeRequest, useDeleteChangeRequest } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { toast } from "@/hooks/use-toast";

const typeLabels: Record<string, string> = {
  ajout_port: "Ajout de port",
  modification_connexion: "Modification connexion",
  suppression_port: "Suppression de port",
  changement_statut: "Changement de statut",
  ajout_equipement: "Ajout d'équipement",
  suppression_equipement: "Suppression d'équipement",
};

const statusLabels: Record<string, string> = {
  en_attente: "En attente",
  approuvee: "Approuvée",
  rejetee: "Rejetée",
  en_revision: "En révision",
};

export default function ChangeRequestsSection() {
  const [params, setParams] = useState({ per_page: 50 });
  const { data: paginatedData, isLoading, isError, error } = useChangeRequests(params);
  const reviewChangeRequest = useReviewChangeRequest();
  const deleteChangeRequest = useDeleteChangeRequest();
  const { isAdmin } = useRole();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'rejetee' | 'en_revision' | null>(null);
  const [reviewComment, setReviewComment] = useState("");

  const changeRequests = paginatedData?.data || [];

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleApprove = (item: any) => {
    reviewChangeRequest.mutate({ id: item.id, status: 'approuvee' }, {
      onSuccess: () => {
        toast({ title: "Demande approuvée", description: `La demande ${item.code} a été approuvée` });
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de l'approbation", variant: "destructive" }),
    });
  };

  const handleReviewSubmit = () => {
    if (!selectedItem || !reviewAction) return;
    reviewChangeRequest.mutate({
      id: selectedItem.id,
      status: reviewAction,
      review_comment: reviewComment,
    }, {
      onSuccess: () => {
        const label = reviewAction === 'rejetee' ? 'rejetée' : 'mise en révision';
        toast({ title: "Demande mise à jour", description: `La demande ${selectedItem.code} a été ${label}` });
        setReviewAction(null);
        setReviewComment("");
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
    deleteChangeRequest.mutate(selectedItem.id, {
      onSuccess: () => {
        toast({ title: "Demande supprimée", description: "La demande a été supprimée avec succès" });
        setIsDeleteOpen(false);
        setSelectedItem(null);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" }),
    });
  };

  const tableData = changeRequests.map((cr: any) => ({
    ...cr,
    type_label: typeLabels[cr.type] || cr.type,
    status_label: statusLabels[cr.status] || cr.status,
    coffret_name: cr.coffret?.name || '-',
    requester_name: cr.requester ? `${cr.requester.name} ${cr.requester.surname || ''}`.trim() : '-',
    intervention_date_label: cr.intervention_date ? new Date(cr.intervention_date).toLocaleDateString('fr-FR') : '-',
  }));

  const canReview = (row: any) => isAdmin && ['en_attente', 'en_revision'].includes(row.status);
  const canDelete = (row: any) => row.status === 'en_attente';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Demandes de modification</h2>
        <div className="text-sm text-muted-foreground mt-1">
          Validation des demandes de modification sur les baies
        </div>
      </div>

      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        <DataTableEnhanced
          title={`${changeRequests.length} demande(s)`}
          columns={["code", "type_label", "coffret_name", "requester_name", "intervention_date_label", "status_label"]}
          data={tableData}
          onRowClick={handleRowClick}
          filterPresets={{
            status_label: [
              { label: "En attente", value: "En attente" },
              { label: "Approuvée", value: "Approuvée" },
              { label: "Rejetée", value: "Rejetée" },
              { label: "En révision", value: "En révision" },
            ],
          }}
          renderRowActions={(row: any) => (
            <div className="flex gap-1">
              {canReview(row) && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleApprove(row); }}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    title="Approuver"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setSelectedItem(row); setReviewAction('rejetee'); }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Rejeter"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setSelectedItem(row); setReviewAction('en_revision'); }}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    title="Demander révision"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </>
              )}
              {canDelete(row) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        />
      </QueryWrapper>

      <DetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        title="Détails de la demande"
        data={selectedItem ? {
          Code: selectedItem?.code,
          Type: typeLabels[selectedItem?.type] || selectedItem?.type,
          Statut: statusLabels[selectedItem?.status] || selectedItem?.status,
          Baie: selectedItem?.coffret_name,
          Demandeur: selectedItem?.requester_name,
          "Date d'intervention": selectedItem?.intervention_date_label,
          Description: selectedItem?.description,
          Justification: selectedItem?.justification,
          ...(selectedItem?.review_comment ? { "Commentaire review": selectedItem.review_comment } : {}),
          ...(selectedItem?.reviewer ? { Valideur: `${selectedItem.reviewer.name} ${selectedItem.reviewer.surname || ''}`.trim() } : {}),
          ...(selectedItem?.reviewed_at ? { "Date de review": new Date(selectedItem.reviewed_at).toLocaleDateString('fr-FR') } : {}),
        } : null}
      />

      {/* Review dialog (reject / revision) */}
      <Dialog open={!!reviewAction} onOpenChange={(open) => { if (!open) { setReviewAction(null); setReviewComment(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'rejetee' ? 'Rejeter la demande' : 'Demander une révision'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'rejetee'
                ? 'Indiquez la raison du rejet de cette demande.'
                : 'Indiquez les éléments à préciser ou corriger.'}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Votre commentaire..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReviewAction(null); setReviewComment(""); }}>
              Annuler
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={reviewComment.length < 5 || reviewChangeRequest.isPending}
              variant={reviewAction === 'rejetee' ? 'destructive' : 'default'}
            >
              {reviewAction === 'rejetee' ? 'Rejeter' : 'Demander révision'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Supprimer la demande"
        description={`Êtes-vous sûr de vouloir supprimer la demande "${selectedItem?.code}" ? Cette action est irréversible.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteChangeRequest.isPending}
      />
    </div>
  );
}
