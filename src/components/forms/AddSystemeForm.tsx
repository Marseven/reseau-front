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
import { useCreateSystem, useUpdateSystem } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const systemeSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  type: z.string().min(1, "Le type est requis"),
  vendor: z.string().optional(),
  endpoint: z.string().optional(),
  monitored_scope: z.string().optional(),
  status: z.string().min(1, "Le statut est requis"),
  description: z.string().optional(),
});

type SystemeFormData = z.infer<typeof systemeSchema>;

interface AddSystemeFormProps {
  initialData?: any;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

const AddSystemeForm = ({ initialData, open: controlledOpen, onOpenChange }: AddSystemeFormProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEdit = !!initialData;
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const createSystem = useCreateSystem();
  const updateSystem = useUpdateSystem();
  const mutation = isEdit ? updateSystem : createSystem;

  const form = useForm<SystemeFormData>({
    resolver: zodResolver(systemeSchema),
    defaultValues: {
      name: "",
      type: "",
      vendor: "",
      endpoint: "",
      monitored_scope: "",
      status: "active",
      description: "",
    }
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        name: initialData.name || "",
        type: initialData.type || "",
        vendor: initialData.vendor || "",
        endpoint: initialData.endpoint || "",
        monitored_scope: initialData.monitored_scope || "",
        status: initialData.status || "active",
        description: initialData.description || "",
      });
    }
  }, [initialData, open]);

  const onSubmit = (data: SystemeFormData) => {
    if (isEdit) {
      updateSystem.mutate({ id: initialData.id, ...data }, {
        onSuccess: () => {
          toast({ title: "Système mis à jour", description: `Le système ${data.name} a été mis à jour avec succès` });
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" }),
      });
    } else {
      createSystem.mutate(data, {
        onSuccess: () => {
          toast({ title: "Système ajouté", description: `Le système ${data.name} a été ajouté avec succès` });
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
            Ajouter un système
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le système" : "Ajouter un nouveau système"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifiez les informations du système." : "Remplissez les informations du nouveau système."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input placeholder="LibreNMS" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="NMS">NMS</SelectItem>
                      <SelectItem value="Camera">Caméra</SelectItem>
                      <SelectItem value="IPAM">IPAM</SelectItem>
                      <SelectItem value="Syslog">Syslog</SelectItem>
                      <SelectItem value="Other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="vendor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fournisseur</FormLabel>
                  <FormControl><Input placeholder="Community" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="endpoint" render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint</FormLabel>
                  <FormControl><Input placeholder="nms.local/api" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="monitored_scope" render={({ field }) => (
                <FormItem>
                  <FormLabel>Périmètre</FormLabel>
                  <FormControl><Input placeholder="Cabinet" {...field} /></FormControl>
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
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Description du système..." {...field} /></FormControl>
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

export default AddSystemeForm;
