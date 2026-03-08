import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, QrCode, Download, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTableEnhanced from "../ui/data-table-enhanced";
import QueryWrapper from "../ui/query-wrapper";
import DetailsModal from "../ui/details-modal";
import DeleteConfirmDialog from "../ui/delete-confirm-dialog";
import AddEquipmentForm from "../forms/AddEquipmentForm";
import AddPortForm from "../forms/AddPortForm";
import AddLiaisonForm from "../forms/AddLiaisonForm";
import AddSystemeForm from "../forms/AddSystemeForm";
import AddArmoireForm from "../forms/AddArmoireForm";
import QrCodeDialog from "../qrcode/QrCodeDialog";
import LabelGeneratorDialog from "../labels/LabelGeneratorDialog";
import {
  useCoffrets, useDeleteCoffret,
  useEquipements, useDeleteEquipement,
  usePorts, useDeletePort,
  useLiaisons, useDeleteLiaison,
  useSystems, useDeleteSystem,
  useMetrics,
  useExportCoffretsCsv,
} from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { toast } from "@/hooks/use-toast";

export default function ArmoiresSection() {
  const [params] = useState({ per_page: 50 });
  const coffretsQuery = useCoffrets(params);
  const equipementsQuery = useEquipements(params);
  const portsQuery = usePorts(params);
  const liaisonsQuery = useLiaisons(params);
  const systemsQuery = useSystems(params);
  const metricsQuery = useMetrics(params);

  const { canWrite } = useRole();
  const exportCoffretsCsv = useExportCoffretsCsv();
  const navigate = useNavigate();

  const deleteCoffret = useDeleteCoffret();
  const deleteEquipement = useDeleteEquipement();
  const deletePort = useDeletePort();
  const deleteLiaison = useDeleteLiaison();
  const deleteSystem = useDeleteSystem();

  const coffrets = coffretsQuery.data?.data || [];
  const equipements = equipementsQuery.data?.data || [];
  const ports = portsQuery.data?.data || [];
  const liaisons = liaisonsQuery.data?.data || [];
  const systems = systemsQuery.data?.data || [];

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("coffrets");
  const [qrItem, setQrItem] = useState<any>(null);
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [labelType, setLabelType] = useState<"coffrets" | "equipements">("coffrets");

  const handleCoffretRowClick = (item: any) => {
    if (item.qr_token) {
      navigate(`/baie/${item.qr_token}`);
    }
  };

  const handleEquipementRowClick = (item: any) => {
    if (item.qr_token) {
      navigate(`/equipement/${item.qr_token}`);
    }
  };

  const handleDetailsRowClick = (item: any) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleEditCoffret = (item: any) => {
    setEditItem({ ...item, _editType: 'coffret' });
    setIsEditOpen(true);
  };

  const handleEditEquipement = (item: any) => {
    setEditItem({ ...item, _editType: 'equipement' });
    setIsEditOpen(true);
  };

  const handleEditPort = (item: any) => {
    setEditItem({ ...item, _editType: 'port' });
    setIsEditOpen(true);
  };

  const handleEditLiaison = (item: any) => {
    setEditItem({ ...item, _editType: 'liaison' });
    setIsEditOpen(true);
  };

  const handleEditSystem = (item: any) => {
    setEditItem({ ...item, _editType: 'systeme' });
    setIsDetailsOpen(false);
    setIsEditOpen(true);
  };

  const getDeleteMutationForTab = () => {
    switch (activeTab) {
      case "coffrets": return deleteCoffret;
      case "equipements": return deleteEquipement;
      case "ports": return deletePort;
      case "liaisons": return deleteLiaison;
      case "systemes": return deleteSystem;
      default: return deleteCoffret;
    }
  };

  const handleDeleteClick = (item: any) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedItem) return;
    const mutation = getDeleteMutationForTab();
    mutation.mutate(selectedItem.id, {
      onSuccess: () => {
        toast({ title: "Supprimé", description: "L'élément a été supprimé avec succès" });
        setIsDeleteOpen(false);
        setSelectedItem(null);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" }),
    });
  };

  const coffretActions = (row: any) => (
    <div className="flex items-center gap-1">
      {row.qr_token && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); setQrItem({ ...row, _type: 'coffret' }); }}
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
  );

  const equipementActions = (row: any) => (
    <div className="flex items-center gap-1">
      {row.qr_token && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); setQrItem({ ...row, _type: 'equipement' }); }}
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
  );

  const deleteAction = canWrite ? (row: any) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  ) : undefined;

  const coffretTableData = coffrets.map((c: any) => ({
    ...c,
    zone_name: c.zone?.name || '-',
  }));

  const equipementTableData = equipements.map((e: any) => ({
    ...e,
    coffret_name: e.coffret?.name || '-',
  }));

  const portTableData = ports.map((p: any) => ({
    ...p,
    equipement_name: p.equipement?.name || '-',
  }));

  const liaisonTableData = liaisons.map((l: any) => ({
    ...l,
  }));

  const isLoading = coffretsQuery.isLoading || equipementsQuery.isLoading || portsQuery.isLoading || liaisonsQuery.isLoading || systemsQuery.isLoading;
  const isError = coffretsQuery.isError || equipementsQuery.isError || portsQuery.isError || liaisonsQuery.isError || systemsQuery.isError;
  const error = coffretsQuery.error || equipementsQuery.error || portsQuery.error || liaisonsQuery.error || systemsQuery.error;

  const currentDeleteMutation = getDeleteMutationForTab();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Baies</h2>
          <div className="text-sm text-muted-foreground mt-1">
            Coffrets, équipements, ports, liaisons et systèmes
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canWrite && (
            <Button variant="outline" size="sm" onClick={() => {
              const type = activeTab === "equipements" ? "equipements" : "coffrets";
              setLabelType(type);
              setLabelDialogOpen(true);
            }}>
              <Printer className="h-4 w-4 mr-1" />
              Étiquettes
            </Button>
          )}
          {canWrite && (
            <Button variant="outline" size="sm" disabled={exportCoffretsCsv.isPending} onClick={() => exportCoffretsCsv.mutate(undefined, {
              onSuccess: () => toast({ title: "Export terminé", description: "Le fichier CSV a été téléchargé" }),
              onError: () => toast({ title: "Erreur", description: "Erreur lors de l'export", variant: "destructive" }),
            })}>
              {exportCoffretsCsv.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
              CSV
            </Button>
          )}
          {canWrite && <AddArmoireForm />}
        </div>
      </div>

      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        <Tabs defaultValue="coffrets" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 bg-secondary">
            <TabsTrigger value="coffrets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Baies
            </TabsTrigger>
            <TabsTrigger value="equipements" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Équipements
            </TabsTrigger>
            <TabsTrigger value="ports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Ports
            </TabsTrigger>
            <TabsTrigger value="liaisons" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Liaisons
            </TabsTrigger>
            <TabsTrigger value="systemes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Systèmes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coffrets" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Baies / Coffrets</h3>
            </div>
            <DataTableEnhanced
              title={`${coffrets.length} baies`}
              columns={["code", "name", "piece", "type", "zone_name", "equipments_count", "status"]}
              data={coffretTableData}
              onRowClick={handleCoffretRowClick}
              onEdit={canWrite ? handleEditCoffret : undefined}
              columnRenderers={{
                equipments_count: (value: any) => (
                  <Badge variant="secondary">{value || 0}</Badge>
                ),
              }}
              renderRowActions={coffretActions}
            />
          </TabsContent>

          <TabsContent value="equipements" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Équipements dans les baies</h3>
              {canWrite && <AddEquipmentForm />}
            </div>
            <DataTableEnhanced
              title={`${equipements.length} équipements`}
              columns={["name", "type", "classification", "modele", "coffret_name", "ports_count", "status", "ip_address"]}
              data={equipementTableData}
              onRowClick={handleEquipementRowClick}
              onEdit={canWrite ? handleEditEquipement : undefined}
              columnRenderers={{
                ports_count: (value: any) => (
                  <Badge variant="secondary">{value || 0}</Badge>
                ),
              }}
              renderRowActions={equipementActions}
            />
          </TabsContent>

          <TabsContent value="ports" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ports configurés</h3>
              {canWrite && <AddPortForm />}
            </div>
            <DataTableEnhanced
              title={`${ports.length} ports`}
              columns={["port_label", "port_type", "speed", "status", "vlan", "equipement_name"]}
              data={portTableData}
              onRowClick={handleDetailsRowClick}
              onEdit={canWrite ? handleEditPort : undefined}
              renderRowActions={deleteAction}
            />
          </TabsContent>

          <TabsContent value="liaisons" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Liaisons configurées</h3>
              {canWrite && <AddLiaisonForm />}
            </div>
            <DataTableEnhanced
              title={`${liaisons.length} liaisons`}
              columns={["label", "media", "from", "to", "status_label", "length"]}
              data={liaisonTableData}
              onRowClick={handleDetailsRowClick}
              onEdit={canWrite ? handleEditLiaison : undefined}
              renderRowActions={deleteAction}
            />
          </TabsContent>

          <TabsContent value="systemes" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Systèmes de surveillance</h3>
              {canWrite && <AddSystemeForm />}
            </div>
            <DataTableEnhanced
              title={`${systems.length} systèmes`}
              columns={["name", "type", "vendor", "endpoint", "monitored_scope", "status"]}
              data={systems}
              onRowClick={handleDetailsRowClick}
              onEdit={canWrite ? handleEditSystem : undefined}
              renderRowActions={deleteAction}
            />
          </TabsContent>
        </Tabs>
      </QueryWrapper>

      {/* DetailsModal kept for ports/liaisons/systems */}
      <DetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        title="Détails"
        data={selectedItem}
        onEdit={() => {
          setIsDetailsOpen(false);
          if (selectedItem) {
            setEditItem(selectedItem);
            setIsEditOpen(true);
          }
        }}
      />

      {/* Edit forms by type */}
      {editItem?._editType === 'coffret' && (
        <AddArmoireForm
          initialData={editItem}
          open={isEditOpen}
          onOpenChange={(v) => { setIsEditOpen(v); if (!v) setEditItem(null); }}
        />
      )}
      {editItem?._editType === 'equipement' && (
        <AddEquipmentForm
          initialData={editItem}
          open={isEditOpen}
          onOpenChange={(v) => { setIsEditOpen(v); if (!v) setEditItem(null); }}
        />
      )}
      {editItem?._editType === 'port' && (
        <AddPortForm
          initialData={editItem}
          open={isEditOpen}
          onOpenChange={(v) => { setIsEditOpen(v); if (!v) setEditItem(null); }}
        />
      )}
      {editItem?._editType === 'liaison' && (
        <AddLiaisonForm
          initialData={editItem}
          open={isEditOpen}
          onOpenChange={(v) => { setIsEditOpen(v); if (!v) setEditItem(null); }}
        />
      )}
      {editItem?._editType === 'systeme' && (
        <AddSystemeForm
          initialData={editItem}
          open={isEditOpen}
          onOpenChange={(v) => { setIsEditOpen(v); if (!v) setEditItem(null); }}
        />
      )}

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Confirmer la suppression"
        description={`Êtes-vous sûr de vouloir supprimer "${selectedItem?.name || selectedItem?.label || selectedItem?.code}" ? Cette action est irréversible.`}
        onConfirm={handleDeleteConfirm}
        isLoading={currentDeleteMutation.isPending}
      />

      <QrCodeDialog
        open={!!qrItem}
        onOpenChange={(open) => { if (!open) setQrItem(null); }}
        value={qrItem ? `${window.location.origin}/${qrItem._type === 'coffret' ? 'baie' : 'equipement'}/${qrItem.qr_token}` : ''}
        title={qrItem?.name || ''}
        subtitle={qrItem?.code || qrItem?.equipement_code || ''}
      />

      <LabelGeneratorDialog
        type={labelType}
        selectedIds={
          labelType === "coffrets"
            ? coffrets.map((c: any) => c.id)
            : equipements.map((e: any) => e.id)
        }
        open={labelDialogOpen}
        onOpenChange={setLabelDialogOpen}
      />
    </div>
  );
}
