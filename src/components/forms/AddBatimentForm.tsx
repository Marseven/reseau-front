import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCreateBatiment, useZones } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const batimentSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  name: z.string().min(1, "Le nom est requis"),
  zone_id: z.string().min(1, "La zone est requise"),
  address: z.string().optional(),
  floors_count: z.string().optional(),
  status: z.string().min(1, "Le statut est requis"),
  description: z.string().optional(),
});

type BatimentFormData = z.infer<typeof batimentSchema>;

export default function AddBatimentForm() {
  const [open, setOpen] = useState(false);
  const createBatiment = useCreateBatiment();
  const { data: paginatedZones } = useZones({ per_page: 100 });
  const zones = paginatedZones?.data || [];

  const form = useForm<BatimentFormData>({
    resolver: zodResolver(batimentSchema),
    defaultValues: {
      code: "", name: "", zone_id: "", address: "",
      floors_count: "", status: "active", description: "",
    }
  });

  const onSubmit = (data: BatimentFormData) => {
    const payload: any = { ...data };
    payload.zone_id = Number(payload.zone_id);
    if (payload.floors_count) payload.floors_count = Number(payload.floors_count);
    else delete payload.floors_count;

    createBatiment.mutate(payload, {
      onSuccess: () => {
        toast({ title: "Bâtiment ajouté", description: `Le bâtiment ${data.name} a été ajouté avec succès` });
        form.reset();
        setOpen(false);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de l'ajout du bâtiment", variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" />Ajouter un bâtiment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau bâtiment</DialogTitle>
          <DialogDescription>Remplissez les informations du nouveau bâtiment.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl><Input placeholder="BAT-001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input placeholder="Bâtiment Principal" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="zone_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Zone</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner la zone" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {zones.map((zone: any) => (
                      <SelectItem key={zone.id} value={String(zone.id)}>{zone.name} ({zone.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl><Input placeholder="Adresse" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="floors_count" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre d'étages</FormLabel>
                  <FormControl><Input type="number" placeholder="3" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <FormControl><Textarea placeholder="Description du bâtiment..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={createBatiment.isPending}>Ajouter</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
