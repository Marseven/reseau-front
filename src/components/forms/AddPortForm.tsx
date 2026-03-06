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
import { useCreatePort, useEquipements } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const portSchema = z.object({
  port_label: z.string().min(1, "Le label est requis"),
  device_name: z.string().optional(),
  port_type: z.string().optional(),
  speed: z.string().optional(),
  status: z.string().min(1, "Le statut est requis"),
  vlan: z.string().optional(),
  equipement_id: z.string().optional(),
  poe_enabled: z.boolean().default(false),
  description: z.string().optional(),
});

type PortFormData = z.infer<typeof portSchema>;

const AddPortForm = () => {
  const [open, setOpen] = useState(false);
  const createPort = useCreatePort();
  const { data: paginatedEquipements } = useEquipements({ per_page: 100 });
  const equipements = paginatedEquipements?.data || [];

  const form = useForm<PortFormData>({
    resolver: zodResolver(portSchema),
    defaultValues: {
      port_label: "",
      device_name: "",
      port_type: "",
      speed: "",
      status: "active",
      vlan: "",
      equipement_id: "",
      poe_enabled: false,
      description: "",
    }
  });

  const onSubmit = (data: PortFormData) => {
    const payload: any = { ...data };
    if (payload.equipement_id) payload.equipement_id = Number(payload.equipement_id);
    else delete payload.equipement_id;

    createPort.mutate(payload, {
      onSuccess: () => {
        toast({ title: "Port ajouté", description: `Le port ${data.port_label} a été ajouté avec succès` });
        form.reset();
        setOpen(false);
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de l'ajout", variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un port
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau port</DialogTitle>
          <DialogDescription>Remplissez les informations du nouveau port réseau.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="port_label" render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl><Input placeholder="P1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="device_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom appareil</FormLabel>
                  <FormControl><Input placeholder="Switch Core" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="port_type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="RJ45">RJ45</SelectItem>
                      <SelectItem value="SFP">SFP</SelectItem>
                      <SelectItem value="SFP+">SFP+</SelectItem>
                      <SelectItem value="Fibre">Fibre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="speed" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vitesse</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Vitesse" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="100M">100 Mbps</SelectItem>
                      <SelectItem value="1G">1 Gbps</SelectItem>
                      <SelectItem value="10G">10 Gbps</SelectItem>
                      <SelectItem value="25G">25 Gbps</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="vlan" render={({ field }) => (
                <FormItem>
                  <FormLabel>VLAN</FormLabel>
                  <FormControl><Input placeholder="10" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="reserved">Réservé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="equipement_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Équipement parent</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner l'équipement" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {equipements.map((eq: any) => (
                      <SelectItem key={eq.id} value={String(eq.id)}>{eq.name} ({eq.equipement_code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Description du port..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={createPort.isPending}>Ajouter</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPortForm;
