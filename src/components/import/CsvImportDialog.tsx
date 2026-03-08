import { useState, useRef } from "react";
import { Upload, Download, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useImportCoffretsCsv,
  useImportEquipementsCsv,
  useImportPortsCsv,
  useImportLiaisonsCsv,
  useDownloadTemplate,
} from "@/hooks/api";
import type { ImportResult } from "@/hooks/api/useImports";

type ResourceType = "coffrets" | "equipements" | "ports" | "liaisons";

interface CsvImportDialogProps {
  resource: ResourceType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const resourceLabels: Record<ResourceType, string> = {
  coffrets: "Armoires / Coffrets",
  equipements: "Équipements",
  ports: "Ports",
  liaisons: "Liaisons",
};

export default function CsvImportDialog({ resource, open, onOpenChange }: CsvImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const importMutations = {
    coffrets: useImportCoffretsCsv(),
    equipements: useImportEquipementsCsv(),
    ports: useImportPortsCsv(),
    liaisons: useImportLiaisonsCsv(),
  };

  const importMutation = importMutations[resource];
  const downloadTemplate = useDownloadTemplate();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleImport = () => {
    if (!file) return;
    importMutation.mutate(file, {
      onSuccess: (data) => setResult(data),
      onError: () => setResult(null),
    });
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setFile(null);
      setResult(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import CSV — {resourceLabels[resource]}
          </DialogTitle>
          <DialogDescription>
            Importez des données depuis un fichier CSV (séparateur point-virgule).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template download */}
          <Button
            variant="outline"
            size="sm"
            disabled={downloadTemplate.isPending}
            onClick={() => downloadTemplate.mutate(resource)}
          >
            {downloadTemplate.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Télécharger le template
          </Button>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            {file ? (
              <p className="text-sm font-medium">{file.name}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Glissez-déposez un fichier CSV ou cliquez pour sélectionner
              </p>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />
          </div>

          {/* Import button */}
          <Button
            className="w-full"
            disabled={!file || importMutation.isPending}
            onClick={handleImport}
          >
            {importMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Importer
          </Button>

          {/* Results */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {result.imported} importé{result.imported > 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {result.updated} mis à jour
                </div>
                {result.errors.length > 0 && (
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {result.errors.length} erreur{result.errors.length > 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {result.errors.length > 0 && (
                <div className="max-h-48 overflow-auto rounded border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Ligne</TableHead>
                        <TableHead>Erreur</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.errors.map((err, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs">{err.line}</TableCell>
                          <TableCell className="text-xs text-destructive">{err.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {importMutation.isError && !result && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              Erreur lors de l'import. Vérifiez le format du fichier.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
