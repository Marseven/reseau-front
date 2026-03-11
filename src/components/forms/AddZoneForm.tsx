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
import { useCreateZone, useUpdateZone, useSites } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const zoneSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  name: z.string().min(1, "Le nom est requis"),
  floor: z.string().optional(),
  building: z.string().optional(),
  site_id: z.string().min(1, "Le site est requis"),
  status: z.string().min(1, "Le statut est requis"),
  description: z.string().optional(),
});

type ZoneFormData = z.infer<typeof zoneSchema>;

interface AddZoneFormProps {
  initialData?: any;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

export default function AddZoneForm({ initialData, open: controlledOpen, onOpenChange }: AddZoneFormProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEdit = !!initialData;
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const createZone = useCreateZone();
  const updateZone = useUpdateZone();
  const mutation = isEdit ? updateZone : createZone;
  const { data: paginatedSites } = useSites({ per_page: 100 });
  const sites = paginatedSites?.data || [];

  const form = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      code: "", name: "", floor: "", building: "",
      site_id: "", status: "active", description: "",
    }
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        code: initialData.code || "",
        name: initialData.name || "",
        floor: initialData.floor || "",
        building: initialData.building || "",
        site_id: initialData.site_id ? String(initialData.site_id) : "",
        status: initialData.status || "active",
        description: initialData.description || "",
      });
    }
  }, [initialData, open]);

  const onSubmit = (data: ZoneFormData) => {
    const payload: any = { ...data };
    payload.site_id = Number(payload.site_id);

    if (isEdit) {
      updateZone.mutate({ id: initialData.id, ...payload }, {
        onSuccess: () => {
          toast({ title: "Zone mise à jour", description: `La zone ${data.name} a été mise à jour avec succès` });
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" }),
      });
    } else {
      createZone.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Zone ajoutée", description: `La zone ${data.name} a été ajoutée avec succès` });
          form.reset();
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de l'ajout de la zone", variant: "destructive" }),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une zone
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la zone" : "Ajouter une nouvelle zone"}</DialogTitle>
          <DialogDescription>{isEdit ? "Modifiez les informations de la zone." : "Remplissez les informations de la nouvelle zone."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl><Input placeholder="ZONE-001" {...field} /></FormControl>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="floor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Étage (indication)</FormLabel>
                  <FormControl><Input placeholder="Ex : RDC, 1er étage..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="building" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bâtiment (indication)</FormLabel>
                  <FormControl><Input placeholder="Ex : Bâtiment principal..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="site_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Site</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner le site" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {sites.map((site: any) => (
                      <SelectItem key={site.id} value={String(site.id)}>{site.name} ({site.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

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
                <FormControl><Textarea placeholder="Description de la zone..." {...field} /></FormControl>
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
