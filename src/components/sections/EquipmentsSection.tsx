import { useState } from "react";
import { Trash2, QrCode, Download, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import QueryWrapper from "@/components/ui/query-wrapper";
import DetailsModal from "@/components/ui/details-modal";
import EditModal from "@/components/ui/edit-modal";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import AddEquipmentForm from "@/components/forms/AddEquipmentForm";
import QrCodeDialog from "@/components/qrcode/QrCodeDialog";
import LabelGeneratorDialog from "@/components/labels/LabelGeneratorDialog";
import { useEquipements, useUpdateEquipement, useDeleteEquipement, useExportEquipementsCsv } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { toast } from "@/hooks/use-toast";

export default function EquipmentsSection() {
  const [params] = useState({ per_page: 50 });
  const { data: paginatedEquipements, isLoading, isError, error } = useEquipements(params);
  const updateEquipement = useUpdateEquipement();
  const deleteEquipement = useDeleteEquipement();
  const { canWrite } = useRole();
  const exportCsv = useExportEquipementsCsv();
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [qrItem, setQrItem] = useState<any>(null);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);

  const equipements = paginatedEquipements?.data || [];

  const handleRowClick = (equipment: any) => {
    setSelectedEquipment(equipment);
    setIsDetailsOpen(true);
  };

  const handleEdit = (equipment: any) => {
    setSelectedEquipment(equipment);
    setIsEditOpen(true);
  };

  const handleSave = (updatedEquipment: any) => {
    updateEquipement.mutate(updatedEquipment, {
      onSuccess: () => {
        toast({ title: "Équipement mis à jour", description: "L'équipement a été mis à jour avec succès" });
        setIsEditOpen(false);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" }),
    });
  };

  const handleDeleteClick = (item: any) => {
    setSelectedEquipment(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedEquipment) return;
    deleteEquipement.mutate(selectedEquipment.id, {
      onSuccess: () => {
        toast({ title: "Équipement supprimé", description: "L'équipement a été supprimé avec succès" });
        setIsDeleteOpen(false);
        setSelectedEquipment(null);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" }),
    });
  };

  const tableData = equipements.map((e: any) => ({
    ...e,
    coffret_name: e.coffret?.name || '-',
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Équipements</h2>
          <div className="text-sm text-muted-foreground mt-1">
            Gestion des équipements réseau et de leurs connexions
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canWrite && (
            <Button variant="outline" size="sm" onClick={() => setLabelDialogOpen(true)}>
              <Printer className="h-4 w-4 mr-1" />
              Étiquettes
            </Button>
          )}
          {canWrite && (
            <Button variant="outline" size="sm" disabled={exportCsv.isPending} onClick={() => exportCsv.mutate(undefined, {
              onSuccess: () => toast({ title: "Export terminé", description: "Le fichier CSV a été téléchargé" }),
              onError: () => toast({ title: "Erreur", description: "Erreur lors de l'export", variant: "destructive" }),
            })}>
              {exportCsv.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
              CSV
            </Button>
          )}
          {canWrite && <AddEquipmentForm />}
        </div>
      </div>

      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        <DataTableEnhanced
          title={`${equipements.length} équipements`}
          columns={["name", "type", "classification", "modele", "coffret_name", "status", "ip_address"]}
          data={tableData}
          onRowClick={handleRowClick}
          onEdit={canWrite ? handleEdit : undefined}
          filterPresets={{
            classification: [
              { label: "IT", value: "IT" },
              { label: "OT", value: "OT" },
            ],
            status: [
              { label: "Actif", value: "active" },
              { label: "Inactif", value: "inactive" },
              { label: "Maintenance", value: "maintenance" },
            ],
          }}
          renderRowActions={(row: any) => (
            <div className="flex items-center gap-1">
              {row.qr_token && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setQrItem(row); }}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              )}
              {canWrite && (
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
        title="Détails de l'équipement"
        data={selectedEquipment}
        onEdit={() => {
          setIsDetailsOpen(false);
          setIsEditOpen(true);
        }}
      />

      <EditModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Modifier l'équipement"
        data={selectedEquipment}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Supprimer l'équipement"
        description={`Êtes-vous sûr de vouloir supprimer l'équipement "${selectedEquipment?.name}" ? Cette action est irréversible.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteEquipement.isPending}
      />

      <QrCodeDialog
        open={!!qrItem}
        onOpenChange={(open) => { if (!open) setQrItem(null); }}
        value={qrItem ? `${window.location.origin}/equipement/${qrItem.qr_token}` : ''}
        title={qrItem?.name || ''}
        subtitle={qrItem?.equipement_code || ''}
      />

      <LabelGeneratorDialog
        type="equipements"
        selectedIds={equipements.map((e: any) => e.id)}
        open={labelDialogOpen}
        onOpenChange={setLabelDialogOpen}
      />
    </div>
  );
}
