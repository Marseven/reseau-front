import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, QrCode, MapPin, Calendar, Server, History, ImagePlus, Trash2, Image } from "lucide-react";
import { useCoffretByQrToken, useUploadCoffretPhoto, useDeleteCoffretPhoto } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ClassificationBadge from "@/components/ui/classification-badge";
import QrCodeDialog from "@/components/qrcode/QrCodeDialog";
import AddChangeRequestForm from "@/components/forms/AddChangeRequestForm";
import CoffretHistoryTimeline from "@/components/history/CoffretHistoryTimeline";
import { toast } from "@/hooks/use-toast";

export default function CoffretDetailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { data: coffret, isLoading, isError } = useCoffretByQrToken(token);
  const { canPropose, canWrite } = useRole();
  const [qrOpen, setQrOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const uploadPhoto = useUploadCoffretPhoto();
  const deletePhoto = useDeleteCoffretPhoto();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !coffret) return;
    uploadPhoto.mutate({ id: coffret.id, photo: file }, {
      onSuccess: () => toast({ title: "Photo mise à jour", description: "La photo a été ajoutée" }),
      onError: () => toast({ title: "Erreur", description: "Erreur lors de l'upload", variant: "destructive" }),
    });
  };

  const handleDeletePhoto = () => {
    if (!coffret) return;
    deletePhoto.mutate(coffret.id, {
      onSuccess: () => toast({ title: "Photo supprimée", description: "La photo a été retirée" }),
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" }),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !coffret) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Server className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Baie introuvable</h1>
        <p className="text-muted-foreground">Le QR code scanné ne correspond à aucune baie.</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  const qrUrl = `${window.location.origin}/baie/${coffret.qr_token}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{coffret.name}</h1>
              <StatusBadge status={coffret.status as any} />
            </div>
            <p className="text-sm text-muted-foreground font-mono">{coffret.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canPropose && (
            <AddChangeRequestForm coffretId={coffret.id} coffretName={coffret.name} />
          )}
          <Button variant="outline" onClick={() => setQrOpen(true)} className="gap-2">
            <QrCode className="h-4 w-4" />
            QR Code
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Localisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {coffret.zone?.site && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Site</span>
                <span className="font-medium">{coffret.zone.site.name}</span>
              </div>
            )}
            {coffret.zone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zone</span>
                <span className="font-medium">{coffret.zone.name}</span>
              </div>
            )}
            {coffret.salle?.batiment && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bâtiment</span>
                <span className="font-medium">{coffret.salle.batiment.name}</span>
              </div>
            )}
            {coffret.salle && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salle</span>
                <span className="font-medium">{coffret.salle.name}</span>
              </div>
            )}
            {coffret.piece && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pièce</span>
                <span className="font-medium">{coffret.piece}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {coffret.type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{coffret.type}</span>
              </div>
            )}
            {(coffret.lat != null && coffret.long != null) && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coordonnées</span>
                <span className="font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {coffret.lat}, {coffret.long}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Créé le</span>
              <span className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(coffret.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modifié le</span>
              <span className="font-medium">
                {new Date(coffret.updated_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Photo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Image className="h-4 w-4" /> Photo
            </span>
            {canWrite && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => photoInputRef.current?.click()}>
                  <ImagePlus className="h-4 w-4 mr-1" />
                  {coffret.photo ? "Remplacer" : "Ajouter"}
                </Button>
                {coffret.photo && (
                  <Button variant="outline" size="sm" onClick={handleDeletePhoto} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coffret.photo ? (
            <img
              src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api/v1', '')}/storage/${coffret.photo}`}
              alt={coffret.name}
              className="rounded-lg max-h-64 object-contain cursor-pointer hover:opacity-90 transition"
              onClick={() => setPhotoDialogOpen(true)}
            />
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">Aucune photo</p>
          )}
        </CardContent>
      </Card>

      {coffret.photo && (
        <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{coffret.name}</DialogTitle>
            </DialogHeader>
            <img
              src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace('/api/v1', '')}/storage/${coffret.photo}`}
              alt={coffret.name}
              className="w-full rounded-lg"
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Equipements table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Équipements ({coffret.equipments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coffret.equipments && coffret.equipments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Nom</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Classification</th>
                    <th className="pb-2 pr-4">IP</th>
                    <th className="pb-2 pr-4">Statut</th>
                    <th className="pb-2">Ports</th>
                  </tr>
                </thead>
                <tbody>
                  {coffret.equipments.map((eq) => (
                    <tr
                      key={eq.id}
                      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                      onClick={() => eq.qr_token && navigate(`/equipement/${eq.qr_token}`)}
                    >
                      <td className="py-2 pr-4 font-medium">{eq.name}</td>
                      <td className="py-2 pr-4">{eq.type}</td>
                      <td className="py-2 pr-4">
                        <ClassificationBadge classification={eq.classification} />
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs">{eq.ip_address || "—"}</td>
                      <td className="py-2 pr-4">
                        <StatusBadge status={eq.status as any} />
                      </td>
                      <td className="py-2">{eq.ports?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Aucun équipement dans cette baie.</p>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des modifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CoffretHistoryTimeline coffretId={coffret.id} />
        </CardContent>
      </Card>

      <QrCodeDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        value={qrUrl}
        title={coffret.name}
        subtitle={coffret.code}
      />
    </div>
  );
}
