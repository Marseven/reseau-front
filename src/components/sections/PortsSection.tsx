import { useState } from "react";
import { Trash2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import QueryWrapper from "@/components/ui/query-wrapper";
import DetailsModal from "@/components/ui/details-modal";
import EditModal from "@/components/ui/edit-modal";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import AddPortForm from "@/components/forms/AddPortForm";
import { usePorts, useUpdatePort, useDeletePort, useExportPortsCsv } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { toast } from "@/hooks/use-toast";

export default function PortsSection() {
  const [params] = useState({ per_page: 50 });
  const { data: paginatedPorts, isLoading, isError, error } = usePorts(params);
  const updatePort = useUpdatePort();
  const deletePort = useDeletePort();
  const { canWrite } = useRole();
  const exportCsv = useExportPortsCsv();
  const [selectedPort, setSelectedPort] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const ports = paginatedPorts?.data || [];

  const handleRowClick = (port: any) => {
    setSelectedPort(port);
    setIsDetailsOpen(true);
  };

  const handleEdit = (port: any) => {
    setSelectedPort(port);
    setIsEditOpen(true);
  };

  const handleSave = (updatedPort: any) => {
    updatePort.mutate(updatedPort, {
      onSuccess: () => {
        toast({ title: "Port mis à jour", description: "Le port a été mis à jour avec succès" });
        setIsEditOpen(false);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" }),
    });
  };

  const handleDeleteClick = (item: any) => {
    setSelectedPort(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedPort) return;
    deletePort.mutate(selectedPort.id, {
      onSuccess: () => {
        toast({ title: "Port supprimé", description: "Le port a été supprimé avec succès" });
        setIsDeleteOpen(false);
        setSelectedPort(null);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" }),
    });
  };

  const tableData = ports.map((p: any) => ({
    ...p,
    equipement_name: p.equipement?.name || '-',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-foreground">Gestion des Ports</h2>
            {canWrite && <AddPortForm />}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Configuration et surveillance des ports réseau
          </div>
        </div>
        {canWrite && (
          <Button variant="outline" size="sm" disabled={exportCsv.isPending} onClick={() => exportCsv.mutate(undefined, {
            onSuccess: () => toast({ title: "Export terminé", description: "Le fichier CSV a été téléchargé" }),
            onError: () => toast({ title: "Erreur", description: "Erreur lors de l'export", variant: "destructive" }),
          })}>
            {exportCsv.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
            CSV
          </Button>
        )}
      </div>

      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        <DataTableEnhanced
          title={`${ports.length} ports configurés`}
          columns={["port_label", "port_type", "speed", "status", "vlan", "equipement_name"]}
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
        title="Détails du port"
        data={selectedPort}
        onEdit={() => {
          setIsDetailsOpen(false);
          setIsEditOpen(true);
        }}
      />

      <EditModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Modifier le port"
        data={selectedPort}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Supprimer le port"
        description={`Êtes-vous sûr de vouloir supprimer le port "${selectedPort?.port_label}" ? Cette action est irréversible.`}
        onConfirm={handleDeleteConfirm}
        isLoading={deletePort.isPending}
      />
    </div>
  );
}
