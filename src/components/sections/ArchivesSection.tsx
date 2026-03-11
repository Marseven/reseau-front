import { useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTableEnhanced from "@/components/ui/data-table-enhanced";
import QueryWrapper from "@/components/ui/query-wrapper";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import { useTrash, useRestoreItem, useForceDeleteItem, type TrashResource } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";

interface ResourceTab {
  key: TrashResource;
  label: string;
  columns: string[];
  columnLabels?: Record<string, string>;
}

const tabs: ResourceTab[] = [
  {
    key: "coffrets",
    label: "Armoires",
    columns: ["id", "code", "name", "status", "deleted_at_formatted"],
    columnLabels: { deleted_at_formatted: "Supprimé le" },
  },
  {
    key: "equipements",
    label: "Équipements",
    columns: ["id", "equipement_code", "name", "type", "status", "deleted_at_formatted"],
    columnLabels: { equipement_code: "Code", deleted_at_formatted: "Supprimé le" },
  },
  {
    key: "ports",
    label: "Ports",
    columns: ["id", "port_label", "device_name", "vlan", "deleted_at_formatted"],
    columnLabels: { port_label: "Label", device_name: "Appareil", deleted_at_formatted: "Supprimé le" },
  },
  {
    key: "liaisons",
    label: "Liaisons",
    columns: ["id", "label", "media", "status", "deleted_at_formatted"],
    columnLabels: { deleted_at_formatted: "Supprimé le" },
  },
  {
    key: "systems",
    label: "Systèmes",
    columns: ["id", "name", "type", "vendor", "deleted_at_formatted"],
    columnLabels: { deleted_at_formatted: "Supprimé le" },
  },
  {
    key: "maintenances",
    label: "Maintenances",
    columns: ["id", "title", "status", "deleted_at_formatted"],
    columnLabels: { deleted_at_formatted: "Supprimé le" },
  },
  {
    key: "sites",
    label: "Sites",
    columns: ["id", "code", "name", "status", "deleted_at_formatted"],
    columnLabels: { deleted_at_formatted: "Supprimé le" },
  },
  {
    key: "zones",
    label: "Zones",
    columns: ["id", "code", "name", "status", "deleted_at_formatted"],
    columnLabels: { deleted_at_formatted: "Supprimé le" },
  },
  {
    key: "vlans",
    label: "VLANs",
    columns: ["id", "vlan_id", "name", "deleted_at_formatted"],
    columnLabels: { vlan_id: "VLAN ID", deleted_at_formatted: "Supprimé le" },
  },
];

function TrashTab({ tab }: { tab: ResourceTab }) {
  const [params] = useState({ per_page: 50 });
  const { data: paginatedData, isLoading, isError, error } = useTrash(tab.key, params);
  const restoreMutation = useRestoreItem(tab.key);
  const forceDeleteMutation = useForceDeleteItem(tab.key);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const items = paginatedData?.data || [];

  const tableData = items.map((item: any) => ({
    ...item,
    deleted_at_formatted: item.deleted_at
      ? new Date(item.deleted_at).toLocaleString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—",
  }));

  const handleRestore = (item: any) => {
    restoreMutation.mutate(item.id, {
      onSuccess: () => toast({ title: "Restauré", description: `L'élément "${item.name || item.label || item.port_label || item.title || '#' + item.id}" a été restauré` }),
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la restauration", variant: "destructive" }),
    });
  };

  const handleForceDelete = () => {
    if (!deleteItem) return;
    forceDeleteMutation.mutate(deleteItem.id, {
      onSuccess: () => {
        toast({ title: "Supprimé", description: "L'élément a été supprimé définitivement" });
        setDeleteItem(null);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" }),
    });
  };

  return (
    <>
      <QueryWrapper isLoading={isLoading} isError={isError} error={error as Error}>
        {items.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            Aucun élément archivé dans cette catégorie
          </div>
        ) : (
          <DataTableEnhanced
            title={`${items.length} élément${items.length > 1 ? "s" : ""} archivé${items.length > 1 ? "s" : ""}`}
            columns={tab.columns}
            columnLabels={tab.columnLabels}
            data={tableData}
            renderRowActions={(row: any) => (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={restoreMutation.isPending}
                  onClick={(e) => { e.stopPropagation(); handleRestore(row); }}
                  className="text-green-600 hover:text-green-700"
                  title="Restaurer"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setDeleteItem(row); }}
                  className="text-destructive hover:text-destructive"
                  title="Supprimer définitivement"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        )}
      </QueryWrapper>

      <DeleteConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => { if (!open) setDeleteItem(null); }}
        title="Suppression définitive"
        description={`Êtes-vous sûr de vouloir supprimer définitivement cet élément ? Cette action est irréversible.`}
        onConfirm={handleForceDelete}
        isLoading={forceDeleteMutation.isPending}
      />
    </>
  );
}

export default function ArchivesSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Archives</h2>
        <div className="text-sm text-muted-foreground mt-1">
          Éléments supprimés récupérables. Restaurez ou supprimez définitivement.
        </div>
      </div>

      <Tabs defaultValue="coffrets">
        <TabsList className="flex-wrap h-auto gap-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-4">
            <TrashTab tab={tab} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
