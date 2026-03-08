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
import { useCreateMaintenance, useUpdateMaintenance, useUsers, useSites } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const maintenanceSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  type: z.string().min(1, "Le type est requis"),
  priority: z.string().min(1, "La priorité est requise"),
  technicien_id: z.string().min(1, "Le technicien est requis"),
  site_id: z.string().optional(),
  scheduled_date: z.string().min(1, "La date est requise"),
  scheduled_time: z.string().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface AddMaintenanceFormProps {
  initialData?: any;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

const AddMaintenanceForm = ({ initialData, open: controlledOpen, onOpenChange }: AddMaintenanceFormProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEdit = !!initialData;
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const createMaintenance = useCreateMaintenance();
  const updateMaintenance = useUpdateMaintenance();
  const mutation = isEdit ? updateMaintenance : createMaintenance;
  const { data: paginatedUsers } = useUsers({ per_page: 100 });
  const { data: paginatedSites } = useSites({ per_page: 100 });
  const users = paginatedUsers?.data || [];
  const sites = paginatedSites?.data || [];
  const technicians = users.filter((u: any) => u.role === 'technicien' || u.role === 'administrator');

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      code: "", title: "", description: "", type: "",
      priority: "moyenne", technicien_id: "", site_id: "",
      scheduled_date: "", scheduled_time: "",
    }
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        code: initialData.code || "",
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || "",
        priority: initialData.priority || "moyenne",
        technicien_id: initialData.technicien_id ? String(initialData.technicien_id) : "",
        site_id: initialData.site_id ? String(initialData.site_id) : "",
        scheduled_date: initialData.scheduled_date || "",
        scheduled_time: initialData.scheduled_time || "",
      });
    }
  }, [initialData, open]);

  const onSubmit = (data: MaintenanceFormData) => {
    const payload: any = { ...data };
    payload.technicien_id = Number(payload.technicien_id);
    if (payload.site_id) payload.site_id = Number(payload.site_id);
    else delete payload.site_id;
    if (!payload.scheduled_time) delete payload.scheduled_time;

    if (isEdit) {
      updateMaintenance.mutate({ id: initialData.id, ...payload }, {
        onSuccess: () => {
          toast({ title: "Maintenance mise à jour", description: `La maintenance ${data.title} a été mise à jour avec succès` });
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" }),
      });
    } else {
      createMaintenance.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Maintenance planifiée", description: `La maintenance ${data.title} a été planifiée avec succès` });
          form.reset();
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de la planification", variant: "destructive" }),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button><Plus className="mr-2 h-4 w-4" />Planifier maintenance</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la maintenance" : "Planifier une maintenance"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifiez les informations de la maintenance." : "Remplissez les informations de la nouvelle intervention."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl><Input placeholder="MAINT-001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl><Input placeholder="Vérification câblage" {...field} /></FormControl>
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
                      <SelectItem value="preventive">Préventive</SelectItem>
                      <SelectItem value="corrective">Corrective</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="evolutive">Évolutive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorité</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Priorité" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="basse">Basse</SelectItem>
                      <SelectItem value="moyenne">Moyenne</SelectItem>
                      <SelectItem value="haute">Haute</SelectItem>
                      <SelectItem value="critique">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="scheduled_date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date prévue</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="scheduled_time" render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure (optionnel)</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="technicien_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Technicien</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {technicians.map((u: any) => (
                        <SelectItem key={u.id} value={String(u.id)}>{u.name} {u.surname || ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="site_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Site (optionnel)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {sites.map((s: any) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Décrivez les tâches à effectuer..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={mutation.isPending}>{isEdit ? "Enregistrer" : "Planifier"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaintenanceForm;
