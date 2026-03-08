import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCreateLiaison, useUpdateLiaison } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const liaisonSchema = z.object({
  label: z.string().min(1, "Le label est requis"),
  media: z.string().min(1, "Le média est requis"),
  from: z.string().min(1, "L'origine est requise"),
  to: z.string().min(1, "La destination est requise"),
  length: z.string().optional(),
  status: z.boolean().default(true),
  status_label: z.string().default("active"),
});

type LiaisonFormData = z.infer<typeof liaisonSchema>;

interface AddLiaisonFormProps {
  initialData?: any;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

const AddLiaisonForm = ({ initialData, open: controlledOpen, onOpenChange }: AddLiaisonFormProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEdit = !!initialData;
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const createLiaison = useCreateLiaison();
  const updateLiaison = useUpdateLiaison();
  const mutation = isEdit ? updateLiaison : createLiaison;

  const form = useForm<LiaisonFormData>({
    resolver: zodResolver(liaisonSchema),
    defaultValues: {
      label: "", media: "", from: "", to: "",
      length: "", status: true, status_label: "active",
    }
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        label: initialData.label || "",
        media: initialData.media || "",
        from: initialData.from || "",
        to: initialData.to || "",
        length: initialData.length != null ? String(initialData.length) : "",
        status: initialData.status ?? true,
        status_label: initialData.status_label || "active",
      });
    }
  }, [initialData, open]);

  const onSubmit = (data: LiaisonFormData) => {
    const payload: any = { ...data };
    if (payload.length) payload.length = Number(payload.length);

    if (isEdit) {
      updateLiaison.mutate({ id: initialData.id, ...payload }, {
        onSuccess: () => {
          toast({ title: "Liaison mise à jour", description: `La liaison ${data.label} a été mise à jour avec succès` });
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" }),
      });
    } else {
      createLiaison.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Liaison ajoutée", description: `La liaison ${data.label} a été ajoutée avec succès` });
          form.reset();
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de l'ajout", variant: "destructive" }),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une liaison
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la liaison" : "Ajouter une nouvelle liaison"}</DialogTitle>
          <DialogDescription>{isEdit ? "Modifiez les informations de la liaison." : "Remplissez les informations de la nouvelle liaison réseau."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="label" render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl><Input placeholder="LNK-003" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="media" render={({ field }) => (
              <FormItem>
                <FormLabel>Média</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Cuivre">Cuivre</SelectItem>
                    <SelectItem value="Fibre">Fibre optique</SelectItem>
                    <SelectItem value="Sans-fil">Sans-fil</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="from" render={({ field }) => (
                <FormItem>
                  <FormLabel>Origine</FormLabel>
                  <FormControl><Input placeholder="Switch Core" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="to" render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <FormControl><Input placeholder="Switch Edge" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="length" render={({ field }) => (
                <FormItem>
                  <FormLabel>Longueur (m)</FormLabel>
                  <FormControl><Input type="number" placeholder="12" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="status_label" render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={mutation.isPending}>{isEdit ? "Enregistrer" : "Ajouter"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLiaisonForm;
