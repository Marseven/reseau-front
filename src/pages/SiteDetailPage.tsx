import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Building2, Trash2 } from "lucide-react";
import { useSite, useDeleteSite } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/dashboard/StatusBadge";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import AddSiteForm from "@/components/forms/AddSiteForm";
import AddZoneForm from "@/components/forms/AddZoneForm";
import { toast } from "@/hooks/use-toast";

export default function SiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: site, isLoading, isError } = useSite(id ? Number(id) : undefined);
  const { canWrite } = useRole();
  const deleteSite = useDeleteSite();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !site) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Site introuvable</h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteSite.mutate(site.id, {
      onSuccess: () => {
        toast({ title: "Site supprimé", description: "Le site a été supprimé avec succès" });
        navigate("/");
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" }),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{site.name}</h1>
                <StatusBadge status={site.status as any} />
              </div>
              <p className="text-sm text-muted-foreground font-mono">{site.code}</p>
            </div>
          </div>
          {canWrite && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(true)}>Modifier</Button>
              <Button variant="outline" className="text-destructive" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </div>
          )}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Localisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {site.address && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Adresse</span>
                  <span className="font-medium">{site.address}</span>
                </div>
              )}
              {site.city && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ville</span>
                  <span className="font-medium">{site.city}</span>
                </div>
              )}
              {site.country && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pays</span>
                  <span className="font-medium">{site.country}</span>
                </div>
              )}
              {(site.latitude != null && site.longitude != null) && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coordonnées</span>
                  <span className="font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {site.latitude}, {site.longitude}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {site.description && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium">{site.description}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créé le</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(site.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modifié le</span>
                <span className="font-medium">
                  {new Date(site.updated_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Zones table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Zones ({site.zones?.length || 0})
              </span>
              {canWrite && <AddZoneForm />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {site.zones && site.zones.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Code</th>
                      <th className="pb-2 pr-4">Nom</th>
                      <th className="pb-2 pr-4">Étage</th>
                      <th className="pb-2 pr-4">Bâtiment</th>
                      <th className="pb-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {site.zones.map((zone: any) => (
                      <tr
                        key={zone.id}
                        className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/zones/${zone.id}`)}
                      >
                        <td className="py-2 pr-4 font-mono text-xs">{zone.code}</td>
                        <td className="py-2 pr-4 font-medium">{zone.name}</td>
                        <td className="py-2 pr-4">{zone.floor || "—"}</td>
                        <td className="py-2 pr-4">{zone.building || "—"}</td>
                        <td className="py-2">
                          <StatusBadge status={zone.status as any} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aucune zone dans ce site.</p>
            )}
          </CardContent>
        </Card>

        {/* Edit form */}
        <AddSiteForm
          initialData={site}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />

        <DeleteConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="Supprimer le site"
          description={`Êtes-vous sûr de vouloir supprimer le site "${site.name}" ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          isLoading={deleteSite.isPending}
        />
      </div>
    </div>
  );
}
