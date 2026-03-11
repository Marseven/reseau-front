import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, QrCode, Calendar, Cpu, Network, MapPin } from "lucide-react";
import { useEquipementByQrToken } from "@/hooks/api";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/dashboard/StatusBadge";
import ClassificationBadge from "@/components/ui/classification-badge";
import QrCodeDialog from "@/components/qrcode/QrCodeDialog";
import AddPortForm from "@/components/forms/AddPortForm";

export default function EquipementDetailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { data: equipement, isLoading, isError } = useEquipementByQrToken(token);
  const { canWrite } = useRole();
  const [qrOpen, setQrOpen] = useState(false);

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

  if (isError || !equipement) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Cpu className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Équipement introuvable</h1>
        <p className="text-muted-foreground">Le QR code scanné ne correspond à aucun équipement.</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  const qrUrl = `${window.location.origin}/equipement/${equipement.qr_token}`;

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
              <h1 className="text-2xl font-bold text-foreground">{equipement.name}</h1>
              <ClassificationBadge classification={equipement.classification} />
              <StatusBadge status={equipement.status as any} />
            </div>
            <p className="text-sm text-muted-foreground font-mono">{equipement.equipement_code}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setQrOpen(true)} className="gap-2">
          <QrCode className="h-4 w-4" />
          QR Code
        </Button>
      </div>

      {/* Localisation */}
      {equipement.coffret && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Localisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Baie :</span>
                <Link
                  to={`/baie/${equipement.coffret.qr_token}`}
                  className="font-medium text-primary hover:underline"
                >
                  {equipement.coffret.name} ({equipement.coffret.code})
                </Link>
              </div>
              {equipement.coffret.zone && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Zone :</span>
                  <span className="font-medium">{equipement.coffret.zone.name}</span>
                </div>
              )}
              {equipement.coffret.zone?.site && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Site :</span>
                  <span className="font-medium">{equipement.coffret.zone.site.name}</span>
                </div>
              )}
              {equipement.coffret.salle && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Salle :</span>
                  <span className="font-medium">{equipement.coffret.salle.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Caractéristiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{equipement.type}</span>
            </div>
            {equipement.fabricant && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fabricant</span>
                <span className="font-medium">{equipement.fabricant}</span>
              </div>
            )}
            {equipement.modele && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modèle</span>
                <span className="font-medium">{equipement.modele}</span>
              </div>
            )}
            {equipement.serial_number && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">N° série</span>
                <span className="font-medium font-mono text-xs">{equipement.serial_number}</span>
              </div>
            )}
            {equipement.connection_type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connexion</span>
                <span className="font-medium">{equipement.connection_type}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Réseau</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {equipement.ip_address && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Adresse IP</span>
                <span className="font-medium font-mono">{equipement.ip_address}</span>
              </div>
            )}
            {equipement.vlan && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">VLAN</span>
                <span className="font-medium">{equipement.vlan}</span>
              </div>
            )}
            {equipement.direction_in_out && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Direction</span>
                <span className="font-medium uppercase">{equipement.direction_in_out}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Créé le</span>
              <span className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(equipement.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Modifié le</span>
              <span className="font-medium">
                {new Date(equipement.updated_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ports table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Ports ({equipement.ports?.length || 0})
            </span>
            {canWrite && <AddPortForm defaultEquipementId={equipement.id} />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {equipement.ports && equipement.ports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Libellé</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Débit</th>
                    <th className="pb-2 pr-4">VLAN</th>
                    <th className="pb-2 pr-4">PoE</th>
                    <th className="pb-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {equipement.ports.map((port) => (
                    <tr key={port.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{port.port_label}</td>
                      <td className="py-2 pr-4">{port.port_type || "—"}</td>
                      <td className="py-2 pr-4">{port.speed || "—"}</td>
                      <td className="py-2 pr-4">{port.vlan || "—"}</td>
                      <td className="py-2 pr-4">
                        {port.poe_enabled ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">Oui</span>
                        ) : (
                          <span className="text-muted-foreground">Non</span>
                        )}
                      </td>
                      <td className="py-2">
                        <StatusBadge status={port.status as any} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Aucun port configuré.</p>
          )}
        </CardContent>
      </Card>

      <QrCodeDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        value={qrUrl}
        title={equipement.name}
        subtitle={equipement.equipement_code}
      />
    </div>
  );
}
