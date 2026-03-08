import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCreateSalle, useUpdateSalle, useBatiments } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const salleSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  name: z.string().min(1, "Le nom est requis"),
  batiment_id: z.string().min(1, "Le bâtiment est requis"),
  floor: z.string().optional(),
  type: z.string().optional(),
  status: z.string().min(1, "Le statut est requis"),
  description: z.string().optional(),
});

type SalleFormData = z.infer<typeof salleSchema>;

interface AddSalleFormProps {
  initialData?: any;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

export default function AddSalleForm({ initialData, open: controlledOpen, onOpenChange }: AddSalleFormProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEdit = !!initialData;
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const createSalle = useCreateSalle();
  const updateSalle = useUpdateSalle();
  const mutation = isEdit ? updateSalle : createSalle;
  const { data: paginatedBatiments } = useBatiments({ per_page: 100 });
  const batiments = paginatedBatiments?.data || [];

  const form = useForm<SalleFormData>({
    resolver: zodResolver(salleSchema),
    defaultValues: {
      code: "", name: "", batiment_id: "", floor: "",
      type: "", status: "active", description: "",
    }
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        code: initialData.code || "",
        name: initialData.name || "",
        batiment_id: initialData.batiment_id ? String(initialData.batiment_id) : "",
        floor: initialData.floor || "",
        type: initialData.type || "",
        status: initialData.status || "active",
        description: initialData.description || "",
      });
    }
  }, [initialData, open]);

  const onSubmit = (data: SalleFormData) => {
    const payload: any = { ...data };
    payload.batiment_id = Number(payload.batiment_id);
    if (!payload.type) delete payload.type;

    if (isEdit) {
      updateSalle.mutate({ id: initialData.id, ...payload }, {
        onSuccess: () => {
          toast({ title: "Salle mise à jour", description: `La salle ${data.name} a été mise à jour avec succès` });
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" }),
      });
    } else {
      createSalle.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Salle ajoutée", description: `La salle ${data.name} a été ajoutée avec succès` });
          form.reset();
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de l'ajout de la salle", variant: "destructive" }),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button><Plus className="mr-2 h-4 w-4" />Ajouter une salle</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la salle" : "Ajouter une nouvelle salle"}</DialogTitle>
          <DialogDescription>{isEdit ? "Modifiez les informations de la salle." : "Remplissez les informations de la nouvelle salle."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl><Input placeholder="SAL-001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input placeholder="Salle Serveur" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="batiment_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Bâtiment</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner le bâtiment" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {batiments.map((b: any) => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name} ({b.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="floor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Étage</FormLabel>
                  <FormControl><Input placeholder="RDC" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Type de salle" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="salle_serveur">Salle Serveur</SelectItem>
                      <SelectItem value="bureau">Bureau</SelectItem>
                      <SelectItem value="technique">Technique</SelectItem>
                      <SelectItem value="stockage">Stockage</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="status" render={({ field }) => (
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

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Description de la salle..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={mutation.isPending}>{isEdit ? "Enregistrer" : "Ajouter"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
