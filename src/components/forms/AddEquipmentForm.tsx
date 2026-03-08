import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEquipement, useUpdateEquipement, useCoffrets } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const equipmentSchema = z.object({
  equipement_code: z.string().min(1, "Le code est requis"),
  name: z.string().min(1, "Le nom est requis"),
  type: z.string().min(1, "Le type est requis"),
  classification: z.string().min(1, "La classification est requise"),
  modele: z.string().optional(),
  fabricant: z.string().optional(),
  serial_number: z.string().optional(),
  coffret_id: z.string().optional(),
  ip_address: z.string().optional(),
  connection_type: z.string().optional(),
  status: z.string().min(1, "Le statut est requis"),
  description: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface AddEquipmentFormProps {
  initialData?: any;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

export default function AddEquipmentForm({ initialData, open: controlledOpen, onOpenChange }: AddEquipmentFormProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEdit = !!initialData;
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const createEquipement = useCreateEquipement();
  const updateEquipement = useUpdateEquipement();
  const mutation = isEdit ? updateEquipement : createEquipement;
  const { data: paginatedCoffrets } = useCoffrets({ per_page: 100 });
  const coffrets = paginatedCoffrets?.data || [];

  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      equipement_code: "", name: "", type: "", classification: "IT",
      modele: "", fabricant: "", serial_number: "", coffret_id: "",
      ip_address: "", connection_type: "", status: "active", description: "",
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        equipement_code: initialData.equipement_code || "",
        name: initialData.name || "",
        type: initialData.type || "",
        classification: initialData.classification || "IT",
        modele: initialData.modele || "",
        fabricant: initialData.fabricant || "",
        serial_number: initialData.serial_number || "",
        coffret_id: initialData.coffret_id ? String(initialData.coffret_id) : "",
        ip_address: initialData.ip_address || "",
        connection_type: initialData.connection_type || "",
        status: initialData.status || "active",
        description: initialData.description || "",
      });
    }
  }, [initialData, open]);

  const onSubmit = (data: EquipmentFormData) => {
    const payload: any = { ...data };
    if (payload.coffret_id) payload.coffret_id = Number(payload.coffret_id);
    else delete payload.coffret_id;

    if (isEdit) {
      updateEquipement.mutate({ id: initialData.id, ...payload }, {
        onSuccess: () => {
          toast({ title: "Équipement mis à jour", description: "L'équipement a été mis à jour avec succès" });
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" }),
      });
    } else {
      createEquipement.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Équipement ajouté", description: "L'équipement a été ajouté avec succès" });
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
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter équipement
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier l'équipement" : "Ajouter un nouvel équipement"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="equipement_code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl><Input placeholder="EQ-001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input placeholder="Switch Core" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="switch">Switch</SelectItem>
                      <SelectItem value="router">Routeur</SelectItem>
                      <SelectItem value="firewall">Firewall</SelectItem>
                      <SelectItem value="ap">Point d'accès</SelectItem>
                      <SelectItem value="server">Serveur</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="classification" render={({ field }) => (
                <FormItem>
                  <FormLabel>Classification</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Classification" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="OT">OT</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="modele" render={({ field }) => (
                <FormItem>
                  <FormLabel>Modèle</FormLabel>
                  <FormControl><Input placeholder="Cisco C9300" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="fabricant" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabricant</FormLabel>
                  <FormControl><Input placeholder="Cisco" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="serial_number" render={({ field }) => (
                <FormItem>
                  <FormLabel>N° Série</FormLabel>
                  <FormControl><Input placeholder="SN123456" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="coffret_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Baie</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {coffrets.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="ip_address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse IP</FormLabel>
                  <FormControl><Input placeholder="192.168.1.10" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="connection_type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type connexion</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="RJ45">RJ45</SelectItem>
                      <SelectItem value="Fibre">Fibre</SelectItem>
                      <SelectItem value="SFP">SFP</SelectItem>
                      <SelectItem value="SFP+">SFP+</SelectItem>
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
                <FormControl><Textarea placeholder="Description..." {...field} /></FormControl>
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
