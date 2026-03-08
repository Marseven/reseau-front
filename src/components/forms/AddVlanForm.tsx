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
import { useCreateVlan, useUpdateVlan, useSites } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const vlanSchema = z.object({
  vlan_id: z.string().min(1, "L'ID VLAN est requis"),
  name: z.string().min(1, "Le nom est requis"),
  site_id: z.string().optional(),
  network: z.string().optional(),
  gateway: z.string().optional(),
  status: z.string().min(1, "Le statut est requis"),
  description: z.string().optional(),
});

type VlanFormData = z.infer<typeof vlanSchema>;

interface AddVlanFormProps {
  initialData?: any;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

const AddVlanForm = ({ initialData, open: controlledOpen, onOpenChange }: AddVlanFormProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEdit = !!initialData;
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const createVlan = useCreateVlan();
  const updateVlan = useUpdateVlan();
  const mutation = isEdit ? updateVlan : createVlan;
  const { data: paginatedSites } = useSites({ per_page: 100 });
  const sites = paginatedSites?.data || [];

  const form = useForm<VlanFormData>({
    resolver: zodResolver(vlanSchema),
    defaultValues: {
      vlan_id: "", name: "", site_id: "", network: "",
      gateway: "", status: "active", description: "",
    }
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        vlan_id: initialData.vlan_id != null ? String(initialData.vlan_id) : "",
        name: initialData.name || "",
        site_id: initialData.site_id ? String(initialData.site_id) : "",
        network: initialData.network || "",
        gateway: initialData.gateway || "",
        status: initialData.status || "active",
        description: initialData.description || "",
      });
    }
  }, [initialData, open]);

  const onSubmit = (data: VlanFormData) => {
    const payload: any = { ...data };
    payload.vlan_id = Number(payload.vlan_id);
    if (payload.site_id) payload.site_id = Number(payload.site_id);
    else delete payload.site_id;

    if (isEdit) {
      updateVlan.mutate({ id: initialData.id, ...payload }, {
        onSuccess: () => {
          toast({ title: "VLAN mis à jour", description: `Le VLAN ${data.name} a été mis à jour avec succès` });
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" }),
      });
    } else {
      createVlan.mutate(payload, {
        onSuccess: () => {
          toast({ title: "VLAN ajouté", description: `Le VLAN ${data.name} a été ajouté avec succès` });
          form.reset();
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de l'ajout du VLAN", variant: "destructive" }),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button><Plus className="mr-2 h-4 w-4" />Ajouter un VLAN</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le VLAN" : "Ajouter un nouveau VLAN"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifiez les informations du VLAN." : "Remplissez les informations du nouveau VLAN."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="vlan_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>ID VLAN</FormLabel>
                  <FormControl><Input type="number" placeholder="100" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input placeholder="VLAN-DATA" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="site_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Site (optionnel)</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="network" render={({ field }) => (
                <FormItem>
                  <FormLabel>Réseau</FormLabel>
                  <FormControl><Input placeholder="192.168.10.0/24" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="gateway" render={({ field }) => (
                <FormItem>
                  <FormLabel>Passerelle</FormLabel>
                  <FormControl><Input placeholder="192.168.10.1" {...field} /></FormControl>
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
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Description du VLAN..." {...field} /></FormControl>
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
};

export default AddVlanForm;
