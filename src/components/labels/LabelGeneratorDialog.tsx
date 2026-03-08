import { useState } from "react";
import { Printer, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useGenerateCoffretLabels, useGenerateEquipementLabels } from "@/hooks/api";
import type { LabelFormat } from "@/hooks/api/useLabels";

interface LabelGeneratorDialogProps {
  type: "coffrets" | "equipements";
  selectedIds: number[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatOptions: Array<{ value: LabelFormat; label: string; description: string }> = [
  { value: "small", label: "Petit (35x15mm)", description: "QR code + code uniquement" },
  { value: "medium", label: "Moyen (62x29mm)", description: "QR code + code + nom + zone" },
  { value: "large", label: "Grand (100x50mm)", description: "QR code + toutes les infos" },
];

export default function LabelGeneratorDialog({
  type,
  selectedIds,
  open,
  onOpenChange,
}: LabelGeneratorDialogProps) {
  const [format, setFormat] = useState<LabelFormat>("medium");

  const coffretsLabel = useGenerateCoffretLabels();
  const equipementsLabel = useGenerateEquipementLabels();
  const mutation = type === "coffrets" ? coffretsLabel : equipementsLabel;

  const handleGenerate = () => {
    mutation.mutate(
      { ids: selectedIds, format },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Étiquettes imprimables
          </DialogTitle>
          <DialogDescription>
            {selectedIds.length} élément{selectedIds.length > 1 ? "s" : ""} sélectionné{selectedIds.length > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Format d'étiquette</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as LabelFormat)}>
              {formatOptions.map((opt) => (
                <div key={opt.value} className="flex items-start space-x-3 rounded-lg border p-3">
                  <RadioGroupItem value={opt.value} id={opt.value} className="mt-0.5" />
                  <label htmlFor={opt.value} className="flex-1 cursor-pointer">
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.description}</div>
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Button
            className="w-full"
            disabled={mutation.isPending || selectedIds.length === 0}
            onClick={handleGenerate}
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            Générer les étiquettes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
