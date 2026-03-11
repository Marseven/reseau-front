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
import { useCreateMetric, useUpdateMetric } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const metricSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  type: z.string().min(1, "Le type est requis"),
  description: z.string().optional(),
  last_value: z.string().optional(),
  status: z.string().min(1, "Le statut est requis"),
});

type MetricFormData = z.infer<typeof metricSchema>;

interface AddMetricFormProps {
  initialData?: any;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  coffretId: number;
}

export default function AddMetricForm({ initialData, open: controlledOpen, onOpenChange, coffretId }: AddMetricFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEdit = !!initialData;
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const createMetric = useCreateMetric();
  const updateMetric = useUpdateMetric();
  const mutation = isEdit ? updateMetric : createMetric;

  const form = useForm<MetricFormData>({
    resolver: zodResolver(metricSchema),
    defaultValues: {
      name: "", type: "", description: "",
      last_value: "", status: "active",
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        name: initialData.name || "",
        type: initialData.type || "",
        description: initialData.description || "",
        last_value: initialData.last_value || "",
        status: initialData.status || "active",
      });
    }
  }, [initialData, open]);

  const onSubmit = (data: MetricFormData) => {
    const payload: any = { ...data, coffret_id: coffretId };
    if (!payload.description) delete payload.description;
    if (!payload.last_value) delete payload.last_value;

    if (isEdit) {
      updateMetric.mutate({ id: initialData.id, ...payload }, {
        onSuccess: () => {
          toast({ title: "Métrique mise à jour", description: `La métrique ${data.name} a été mise à jour` });
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" }),
      });
    } else {
      createMetric.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Métrique ajoutée", description: `La métrique ${data.name} a été ajoutée` });
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
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une métrique
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la métrique" : "Ajouter une métrique"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifiez les informations de la métrique." : "Ajoutez une métrique de surveillance à cette baie."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input placeholder="Température" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="temperature">Température</SelectItem>
                      <SelectItem value="humidity">Humidité</SelectItem>
                      <SelectItem value="power">Alimentation</SelectItem>
                      <SelectItem value="bandwidth">Bande passante</SelectItem>
                      <SelectItem value="latency">Latence</SelectItem>
                      <SelectItem value="uptime">Disponibilité</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="last_value" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dernière valeur</FormLabel>
                  <FormControl><Input placeholder="23.5°C" {...field} /></FormControl>
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
                <FormControl><Textarea placeholder="Description de la métrique..." {...field} /></FormControl>
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
