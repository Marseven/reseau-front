import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCreateCoffret, useUpdateCoffret, useZones, useSalles } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import { Plus, ImagePlus } from "lucide-react";

const armoireSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  name: z.string().min(1, "Le nom est requis"),
  piece: z.string().optional(),
  type: z.string().optional(),
  zone_id: z.string().optional(),
  salle_id: z.string().optional(),
  status: z.string().min(1, "Le statut est requis"),
  long: z.string().optional(),
  lat: z.string().optional(),
});

type ArmoireFormData = z.infer<typeof armoireSchema>;

interface AddArmoireFormProps {
  initialData?: any;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

const AddArmoireForm = ({ initialData, open: controlledOpen, onOpenChange }: AddArmoireFormProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEdit = !!initialData;
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createCoffret = useCreateCoffret();
  const updateCoffret = useUpdateCoffret();
  const mutation = isEdit ? updateCoffret : createCoffret;
  const { data: paginatedZones } = useZones({ per_page: 100 });
  const zones = paginatedZones?.data || [];
  const { data: paginatedSalles } = useSalles({ per_page: 100 });
  const salles = paginatedSalles?.data || [];

  const form = useForm<ArmoireFormData>({
    resolver: zodResolver(armoireSchema),
    defaultValues: {
      code: "", name: "", piece: "", type: "",
      zone_id: "", salle_id: "", status: "active",
      long: "", lat: "",
    }
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        code: initialData.code || "",
        name: initialData.name || "",
        piece: initialData.piece || "",
        type: initialData.type || "",
        zone_id: initialData.zone_id ? String(initialData.zone_id) : "",
        salle_id: initialData.salle_id ? String(initialData.salle_id) : "",
        status: initialData.status || "active",
        long: initialData.long != null ? String(initialData.long) : "",
        lat: initialData.lat != null ? String(initialData.lat) : "",
      });
    }
  }, [initialData, open]);

  const onSubmit = (data: ArmoireFormData) => {
    if (isEdit) {
      const payload: any = { ...data };
      if (payload.zone_id) payload.zone_id = Number(payload.zone_id);
      else delete payload.zone_id;
      if (payload.salle_id) payload.salle_id = Number(payload.salle_id);
      else delete payload.salle_id;
      if (payload.long) payload.long = Number(payload.long);
      if (payload.lat) payload.lat = Number(payload.lat);

      updateCoffret.mutate({ id: initialData.id, ...payload }, {
        onSuccess: () => {
          toast({ title: "Baie mise à jour", description: `La baie ${data.name} a été mise à jour avec succès` });
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" }),
      });
    } else {
      const formData = new FormData();
      formData.append('code', data.code);
      formData.append('name', data.name);
      if (data.piece) formData.append('piece', data.piece);
      if (data.type) formData.append('type', data.type);
      if (data.zone_id) formData.append('zone_id', data.zone_id);
      if (data.salle_id) formData.append('salle_id', data.salle_id);
      formData.append('status', data.status);
      if (data.long) formData.append('long', data.long);
      if (data.lat) formData.append('lat', data.lat);
      if (photoFile) formData.append('photo', photoFile);

      createCoffret.mutate(formData, {
        onSuccess: () => {
          toast({ title: "Baie ajoutée", description: `La baie ${data.name} a été ajoutée avec succès` });
          form.reset();
          setPhotoFile(null);
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
            Ajouter une baie
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la baie" : "Ajouter une nouvelle baie"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifiez les informations de la baie." : "Remplissez les informations de la nouvelle baie réseau."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl><Input placeholder="CAB-003" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input placeholder="Baie Serveur C" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="piece" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pièce</FormLabel>
                  <FormControl><Input placeholder="R-201" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="42U">42U</SelectItem>
                      <SelectItem value="24U">24U</SelectItem>
                      <SelectItem value="12U">12U</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="zone_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Zone</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Sélectionner la zone" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {zones.map((zone: any) => (
                        <SelectItem key={zone.id} value={String(zone.id)}>
                          {zone.name} ({zone.site?.name || '-'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="salle_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Salle (optionnel)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Sélectionner la salle" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {salles.map((salle: any) => (
                        <SelectItem key={salle.id} value={String(salle.id)}>
                          {salle.name} ({salle.batiment?.name || '-'})
                        </SelectItem>
                      ))}
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
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {!isEdit && (
              <div>
                <label className="text-sm font-medium">Photo (optionnel)</label>
                <div className="mt-1 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-4 w-4 mr-1" />
                    {photoFile ? photoFile.name : "Choisir une photo"}
                  </Button>
                  {photoFile && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPhotoFile(null)}>
                      Retirer
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            )}

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

export default AddArmoireForm;
