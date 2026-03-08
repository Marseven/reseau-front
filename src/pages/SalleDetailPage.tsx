import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, DoorOpen, Server, Trash2 } from "lucide-react";
import { useSalle, useDeleteSalle } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/dashboard/StatusBadge";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import AddSalleForm from "@/components/forms/AddSalleForm";
import AddArmoireForm from "@/components/forms/AddArmoireForm";
import { toast } from "@/hooks/use-toast";

export default function SalleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: salle, isLoading, isError } = useSalle(id ? Number(id) : undefined);
  const { canWrite } = useRole();
  const deleteSalle = useDeleteSalle();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const typeLabels: Record<string, string> = {
    salle_serveur: "Salle Serveur",
    bureau: "Bureau",
    technique: "Technique",
    stockage: "Stockage",
  };

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

  if (isError || !salle) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <DoorOpen className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Salle introuvable</h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteSalle.mutate(salle.id, {
      onSuccess: () => {
        toast({ title: "Salle supprimée", description: "La salle a été supprimée avec succès" });
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
          {salle.batiment?.zone?.site && (
            <>
              <Link to={`/sites/${salle.batiment.zone.site.id}`} className="hover:text-foreground transition-colors">
                {salle.batiment.zone.site.name}
              </Link>
              <span>/</span>
            </>
          )}
          {salle.batiment?.zone && (
            <>
              <Link to={`/zones/${salle.batiment.zone.id}`} className="hover:text-foreground transition-colors">
                {salle.batiment.zone.name}
              </Link>
              <span>/</span>
            </>
          )}
          {salle.batiment && (
            <>
              <Link to={`/batiments/${salle.batiment.id}`} className="hover:text-foreground transition-colors">
                {salle.batiment.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{salle.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{salle.name}</h1>
                <StatusBadge status={salle.status as any} />
              </div>
              <p className="text-sm text-muted-foreground font-mono">{salle.code}</p>
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
              {salle.floor && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Étage</span>
                  <span className="font-medium">{salle.floor}</span>
                </div>
              )}
              {salle.type && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{typeLabels[salle.type] || salle.type}</span>
                </div>
              )}
              {salle.description && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium">{salle.description}</span>
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
                  {new Date(salle.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modifié le</span>
                <span className="font-medium">
                  {new Date(salle.updated_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coffrets table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Coffrets ({salle.coffrets?.length || 0})
              </span>
              {canWrite && <AddArmoireForm />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salle.coffrets && salle.coffrets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Code</th>
                      <th className="pb-2 pr-4">Nom</th>
                      <th className="pb-2 pr-4">Pièce</th>
                      <th className="pb-2 pr-4">Type</th>
                      <th className="pb-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salle.coffrets.map((coffret: any) => (
                      <tr
                        key={coffret.id}
                        className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                        onClick={() => coffret.qr_token && navigate(`/baie/${coffret.qr_token}`)}
                      >
                        <td className="py-2 pr-4 font-mono text-xs">{coffret.code}</td>
                        <td className="py-2 pr-4 font-medium">{coffret.name}</td>
                        <td className="py-2 pr-4">{coffret.piece || "—"}</td>
                        <td className="py-2 pr-4">{coffret.type || "—"}</td>
                        <td className="py-2">
                          <StatusBadge status={coffret.status as any} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aucun coffret dans cette salle.</p>
            )}
          </CardContent>
        </Card>

        <AddSalleForm
          initialData={salle}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />

        <DeleteConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="Supprimer la salle"
          description={`Êtes-vous sûr de vouloir supprimer la salle "${salle.name}" ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          isLoading={deleteSalle.isPending}
        />
      </div>
    </div>
  );
}
