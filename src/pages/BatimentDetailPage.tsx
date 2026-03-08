import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Building2, DoorOpen, Trash2 } from "lucide-react";
import { useBatiment, useDeleteBatiment } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/dashboard/StatusBadge";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import AddBatimentForm from "@/components/forms/AddBatimentForm";
import AddSalleForm from "@/components/forms/AddSalleForm";
import { toast } from "@/hooks/use-toast";

export default function BatimentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: batiment, isLoading, isError } = useBatiment(id ? Number(id) : undefined);
  const { canWrite } = useRole();
  const deleteBatiment = useDeleteBatiment();
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

  if (isError || !batiment) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Bâtiment introuvable</h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteBatiment.mutate(batiment.id, {
      onSuccess: () => {
        toast({ title: "Bâtiment supprimé", description: "Le bâtiment a été supprimé avec succès" });
        navigate(-1);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" }),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {batiment.zone?.site && (
            <>
              <Link to={`/sites/${batiment.zone.site.id}`} className="hover:text-foreground transition-colors">
                {batiment.zone.site.name}
              </Link>
              <span>/</span>
            </>
          )}
          {batiment.zone && (
            <>
              <Link to={`/zones/${batiment.zone.id}`} className="hover:text-foreground transition-colors">
                {batiment.zone.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{batiment.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{batiment.name}</h1>
                <StatusBadge status={batiment.status as any} />
              </div>
              <p className="text-sm text-muted-foreground font-mono">{batiment.code}</p>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {batiment.address && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Adresse</span>
                  <span className="font-medium">{batiment.address}</span>
                </div>
              )}
              {batiment.floors_count != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre d'étages</span>
                  <span className="font-medium">{batiment.floors_count}</span>
                </div>
              )}
              {batiment.description && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium">{batiment.description}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créé le</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(batiment.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modifié le</span>
                <span className="font-medium">
                  {new Date(batiment.updated_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Salles table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DoorOpen className="h-5 w-5" />
                Salles ({batiment.salles?.length || 0})
              </span>
              {canWrite && <AddSalleForm />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {batiment.salles && batiment.salles.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Code</th>
                      <th className="pb-2 pr-4">Nom</th>
                      <th className="pb-2 pr-4">Étage</th>
                      <th className="pb-2 pr-4">Type</th>
                      <th className="pb-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batiment.salles.map((salle: any) => (
                      <tr
                        key={salle.id}
                        className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/salles/${salle.id}`)}
                      >
                        <td className="py-2 pr-4 font-mono text-xs">{salle.code}</td>
                        <td className="py-2 pr-4 font-medium">{salle.name}</td>
                        <td className="py-2 pr-4">{salle.floor || "—"}</td>
                        <td className="py-2 pr-4">{salle.type || "—"}</td>
                        <td className="py-2">
                          <StatusBadge status={salle.status as any} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aucune salle dans ce bâtiment.</p>
            )}
          </CardContent>
        </Card>

        <AddBatimentForm
          initialData={batiment}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />

        <DeleteConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="Supprimer le bâtiment"
          description={`Êtes-vous sûr de vouloir supprimer le bâtiment "${batiment.name}" ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          isLoading={deleteBatiment.isPending}
        />
      </div>
    </div>
  );
}
