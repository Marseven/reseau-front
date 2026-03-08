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
import { useCreateSite, useUpdateSite } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const siteSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  name: z.string().min(1, "Le nom est requis"),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default("Gabon"),
  longitude: z.string().optional(),
  latitude: z.string().optional(),
  status: z.string().min(1, "Le statut est requis"),
  description: z.string().optional(),
});

type SiteFormData = z.infer<typeof siteSchema>;

interface AddSiteFormProps {
  initialData?: any;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

export default function AddSiteForm({ initialData, open: controlledOpen, onOpenChange }: AddSiteFormProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEdit = !!initialData;
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const createSite = useCreateSite();
  const updateSite = useUpdateSite();
  const mutation = isEdit ? updateSite : createSite;

  const form = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      code: "", name: "", address: "", city: "",
      country: "Gabon", longitude: "", latitude: "",
      status: "active", description: "",
    }
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        code: initialData.code || "",
        name: initialData.name || "",
        address: initialData.address || "",
        city: initialData.city || "",
        country: initialData.country || "Gabon",
        longitude: initialData.longitude != null ? String(initialData.longitude) : "",
        latitude: initialData.latitude != null ? String(initialData.latitude) : "",
        status: initialData.status || "active",
        description: initialData.description || "",
      });
    }
  }, [initialData, open]);

  const onSubmit = (data: SiteFormData) => {
    const payload: any = { ...data };
    if (payload.longitude) payload.longitude = Number(payload.longitude);
    if (payload.latitude) payload.latitude = Number(payload.latitude);

    if (isEdit) {
      updateSite.mutate({ id: initialData.id, ...payload }, {
        onSuccess: () => {
          toast({ title: "Site mis à jour", description: `Le site ${data.name} a été mis à jour avec succès` });
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" }),
      });
    } else {
      createSite.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Site ajouté", description: `Le site ${data.name} a été ajouté avec succès` });
          form.reset();
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de l'ajout du site", variant: "destructive" }),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un site
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le site" : "Ajouter un nouveau site"}</DialogTitle>
          <DialogDescription>{isEdit ? "Modifiez les informations du site." : "Remplissez les informations du nouveau site géographique."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl><Input placeholder="SITE-001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input placeholder="Site Libreville" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse</FormLabel>
                <FormControl><Input placeholder="123 Boulevard Triomphal" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville</FormLabel>
                  <FormControl><Input placeholder="Libreville" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="country" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pays</FormLabel>
                  <FormControl><Input placeholder="Gabon" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="longitude" render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl><Input type="number" step="any" placeholder="9.4544" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="latitude" render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl><Input type="number" step="any" placeholder="0.3924" {...field} /></FormControl>
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
                <FormControl><Textarea placeholder="Description du site..." {...field} /></FormControl>
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
