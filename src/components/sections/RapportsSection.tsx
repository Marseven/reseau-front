import { useState, useMemo } from "react";
import { Download, FileBarChart, Network, BarChart3, Wrench, MapPin, Loader2, FileText, History, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  useSites,
  useUsers,
  useReportSummary,
  useExportEquipementsCsv,
  useExportCoffretsCsv,
  useExportPortsCsv,
  useExportLiaisonsCsv,
  useExportActivityLogsCsv,
  useExportArchitecturePdf,
  useReportSummaryPdf,
  useReportNetworkStatusPdf,
  useReportModificationsPdf,
  useReportInterventionsPdf,
  useReportSiteArchitecturePdf,
} from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import CsvImportDialog from "@/components/import/CsvImportDialog";

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function ExportButton({
  label,
  icon: Icon,
  isPending,
  onClick,
}: {
  label: string;
  icon: any;
  isPending: boolean;
  onClick: () => void;
}) {
  return (
    <Button variant="outline" size="sm" disabled={isPending} onClick={onClick}>
      {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Icon className="h-4 w-4 mr-2" />}
      {label}
    </Button>
  );
}

export default function RapportsSection() {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const [from, setFrom] = useState(formatDate(lastMonth));
  const [to, setTo] = useState(formatDate(now));
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [selectedTechId, setSelectedTechId] = useState<string>("");
  const [importResource, setImportResource] = useState<"coffrets" | "equipements" | "ports" | "liaisons" | null>(null);

  const { data: sitesData } = useSites({ per_page: 100 });
  const { data: usersData } = useUsers({ per_page: 100 });
  const { data: summary, isLoading: summaryLoading } = useReportSummary({ from, to });

  const sites = sitesData?.data || [];
  const techniciens = useMemo(
    () => (usersData?.data || []).filter((u: any) => u.role === 'technicien'),
    [usersData]
  );

  // Export mutations
  const exportEquipements = useExportEquipementsCsv();
  const exportCoffrets = useExportCoffretsCsv();
  const exportPorts = useExportPortsCsv();
  const exportLiaisons = useExportLiaisonsCsv();
  const exportActivityLogs = useExportActivityLogsCsv();
  const exportArchitecture = useExportArchitecturePdf();

  // Summary PDF
  const reportSummary = useReportSummaryPdf();

  // Report mutations
  const reportNetworkStatus = useReportNetworkStatusPdf();
  const reportModifications = useReportModificationsPdf();
  const reportInterventions = useReportInterventionsPdf();
  const reportSiteArchitecture = useReportSiteArchitecturePdf();

  const handleExport = (mutation: any, params?: any) => {
    mutation.mutate(params, {
      onSuccess: () => toast({ title: "Export terminé", description: "Le fichier a été téléchargé" }),
      onError: () => toast({ title: "Erreur", description: "Erreur lors de l'export", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Rapports & Exports</h2>
        <div className="text-sm text-muted-foreground mt-1">
          Générez des rapports PDF et exportez les données au format CSV
        </div>
      </div>

      {/* Period selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Période d'analyse</CardTitle>
          <CardDescription>Sélectionnez la période pour les rapports et le résumé</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="from">Du</Label>
              <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full sm:w-44" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to">Au</Label>
              <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full sm:w-44" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Rapport de synthèse</h3>
        <ExportButton
          label="Télécharger PDF"
          icon={Download}
          isPending={reportSummary.isPending}
          onClick={() => handleExport(reportSummary, { from, to })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summaryLoading ? '...' : summary?.sites_count ?? 0}</p>
                <p className="text-xs text-muted-foreground">Sites</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <BarChart3 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summaryLoading ? '...' : summary?.modifications?.total ?? 0}</p>
                <p className="text-xs text-muted-foreground">Modifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                <Wrench className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summaryLoading ? '...' : summary?.interventions?.total ?? 0}</p>
                <p className="text-xs text-muted-foreground">Interventions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                <FileBarChart className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {summaryLoading ? '...' : summary?.interventions?.by_status?.terminee ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Terminées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* PDF Reports */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Rapports PDF</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Network status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Network className="h-4 w-4" /> Statut réseau
              </CardTitle>
              <CardDescription className="text-xs">État global par site</CardDescription>
            </CardHeader>
            <CardContent>
              <ExportButton
                label="Générer PDF"
                icon={Download}
                isPending={reportNetworkStatus.isPending}
                onClick={() => handleExport(reportNetworkStatus)}
              />
            </CardContent>
          </Card>

          {/* Modifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Modifications
              </CardTitle>
              <CardDescription className="text-xs">Historique des changements sur la période</CardDescription>
            </CardHeader>
            <CardContent>
              <ExportButton
                label="Générer PDF"
                icon={Download}
                isPending={reportModifications.isPending}
                onClick={() => handleExport(reportModifications, { from, to })}
              />
            </CardContent>
          </Card>

          {/* Interventions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wrench className="h-4 w-4" /> Interventions
              </CardTitle>
              <CardDescription className="text-xs">Rapport par technicien</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedTechId} onValueChange={setSelectedTechId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tous les techniciens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les techniciens</SelectItem>
                  {techniciens.map((t: any) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ExportButton
                label="Générer PDF"
                icon={Download}
                isPending={reportInterventions.isPending}
                onClick={() => handleExport(reportInterventions, {
                  from,
                  to,
                  ...(selectedTechId && selectedTechId !== 'all' ? { technicien_id: Number(selectedTechId) } : {}),
                })}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Site architecture */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Architecture par site
          </CardTitle>
          <CardDescription className="text-xs">PDF détaillé d'un site spécifique</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="space-y-1.5 flex-1 max-w-xs">
              <Label>Site</Label>
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((s: any) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ExportButton
              label="Générer PDF"
              icon={Download}
              isPending={reportSiteArchitecture.isPending}
              onClick={() => {
                if (!selectedSiteId) {
                  toast({ title: "Erreur", description: "Veuillez sélectionner un site", variant: "destructive" });
                  return;
                }
                handleExport(reportSiteArchitecture, { siteId: Number(selectedSiteId) });
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* CSV Exports */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Exports CSV</h3>
        <div className="flex flex-wrap gap-3">
          <ExportButton
            label="Équipements"
            icon={FileText}
            isPending={exportEquipements.isPending}
            onClick={() => handleExport(exportEquipements)}
          />
          <ExportButton
            label="Armoires"
            icon={FileText}
            isPending={exportCoffrets.isPending}
            onClick={() => handleExport(exportCoffrets)}
          />
          <ExportButton
            label="Ports"
            icon={FileText}
            isPending={exportPorts.isPending}
            onClick={() => handleExport(exportPorts)}
          />
          <ExportButton
            label="Liaisons"
            icon={FileText}
            isPending={exportLiaisons.isPending}
            onClick={() => handleExport(exportLiaisons)}
          />
          <ExportButton
            label="Historique"
            icon={History}
            isPending={exportActivityLogs.isPending}
            onClick={() => handleExport(exportActivityLogs, { from, to })}
          />
        </div>
      </div>

      {/* Full architecture PDF */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileBarChart className="h-4 w-4" /> Architecture complète
          </CardTitle>
          <CardDescription className="text-xs">PDF de l'architecture réseau tous sites confondus</CardDescription>
        </CardHeader>
        <CardContent>
          <ExportButton
            label="Exporter PDF"
            icon={Download}
            isPending={exportArchitecture.isPending}
            onClick={() => handleExport(exportArchitecture)}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* CSV Import */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Import CSV</h3>
        <div className="text-sm text-muted-foreground mb-3">
          Importez des données en masse depuis un fichier CSV
        </div>
        <div className="flex flex-wrap gap-3">
          {(["coffrets", "equipements", "ports", "liaisons"] as const).map((res) => (
            <Button
              key={res}
              variant="outline"
              size="sm"
              onClick={() => setImportResource(res)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {res === "coffrets" ? "Armoires" : res === "equipements" ? "Équipements" : res === "ports" ? "Ports" : "Liaisons"}
            </Button>
          ))}
        </div>
      </div>

      {importResource && (
        <CsvImportDialog
          resource={importResource}
          open={!!importResource}
          onOpenChange={(open) => { if (!open) setImportResource(null); }}
        />
      )}
    </div>
  );
}
