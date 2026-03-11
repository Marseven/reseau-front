import { useState, useMemo } from "react";
import { Printer, Loader2, CheckSquare, Square } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGenerateCoffretLabels, useGenerateEquipementLabels } from "@/hooks/api";
import type { LabelFormat } from "@/hooks/api/useLabels";

export interface LabelItem {
  id: number;
  name: string;
  code: string;
}

interface LabelGeneratorDialogProps {
  type: "coffrets" | "equipements";
  items: LabelItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatOptions: Array<{ value: LabelFormat; label: string; description: string }> = [
  { value: "small", label: "Petit (35×15mm)", description: "QR code + code uniquement" },
  { value: "medium", label: "Moyen (62×29mm)", description: "QR code + code + nom + zone" },
  { value: "large", label: "Grand (100×50mm)", description: "QR code + toutes les infos" },
];

const typeLabels = {
  coffrets: "armoires",
  equipements: "équipements",
};

export default function LabelGeneratorDialog({
  type,
  items,
  open,
  onOpenChange,
}: LabelGeneratorDialogProps) {
  const [format, setFormat] = useState<LabelFormat>("medium");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");

  const coffretsLabel = useGenerateCoffretLabels();
  const equipementsLabel = useGenerateEquipementLabels();
  const mutation = type === "coffrets" ? coffretsLabel : equipementsLabel;

  // Reset selection when dialog opens with new items
  const itemIds = items.map((i) => i.id).join(",");
  useMemo(() => {
    setSelectedIds(new Set(items.map((i) => i.id)));
    setSearch("");
  }, [itemIds]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) => i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)
    );
  }, [items, search]);

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const noneSelected = selectedIds.size === 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const toggleItem = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleGenerate = () => {
    mutation.mutate(
      { ids: Array.from(selectedIds), format },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Générer des étiquettes
          </DialogTitle>
          <DialogDescription>
            Générez des étiquettes PDF avec QR code à coller sur vos {typeLabels[type]}.
            Sélectionnez les éléments et le format souhaité.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Éléments ({selectedIds.size}/{items.length})
              </Label>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={toggleAll}>
                {allSelected ? (
                  <>
                    <Square className="h-3 w-3 mr-1" />
                    Tout désélectionner
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Tout sélectionner
                  </>
                )}
              </Button>
            </div>

            {items.length > 10 && (
              <Input
                placeholder="Rechercher par nom ou code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-sm"
              />
            )}

            <ScrollArea className="h-40 rounded-md border">
              <div className="p-2 space-y-0.5">
                {filteredItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <span className="font-medium truncate">{item.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto shrink-0">{item.code}</span>
                  </label>
                ))}
                {filteredItems.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Aucun résultat</p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Format selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Format d'étiquette</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as LabelFormat)}>
              {formatOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`flex items-start space-x-3 rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                    format === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                  onClick={() => setFormat(opt.value)}
                >
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
            disabled={mutation.isPending || noneSelected}
            onClick={handleGenerate}
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            {noneSelected
              ? "Sélectionnez au moins un élément"
              : `Générer ${selectedIds.size} étiquette${selectedIds.size > 1 ? "s" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
