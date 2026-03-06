import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

const maintenanceSchema = z.object({
  equipement: z.string().min(1, "L'équipement est requis"),
  type: z.string().min(1, "Le type est requis"),
  date: z.string().min(1, "La date est requise"),
  heure: z.string().min(1, "L'heure est requise"),
  duree: z.string().min(1, "La durée est requise"),
  technicien: z.string().min(1, "Le technicien est requis"),
  priorite: z.string().min(1, "La priorité est requise"),
  description: z.string().min(1, "La description est requise"),
  statut: z.string().default("planifiee"),
  dateCreation: z.string().default(() => new Date().toISOString().split('T')[0]),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface AddMaintenanceFormProps {
  onAdd?: (data: MaintenanceFormData) => void;
}

export default function AddMaintenanceForm({ onAdd }: AddMaintenanceFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      equipement: "",
      type: "",
      date: "",
      heure: "",
      duree: "",
      technicien: "",
      priorite: "moyenne",
      description: "",
      statut: "planifiee",
      dateCreation: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: MaintenanceFormData) => {
    onAdd?.(data);
    toast({
      title: "Maintenance planifiée",
      description: "La maintenance a été planifiée avec succès",
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Calendar className="h-4 w-4 mr-2" />
          Planifier maintenance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Planifier une maintenance</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="equipement" render={({ field }) => (
                <FormItem>
                  <FormLabel>Équipement</FormLabel>
                  <FormControl><Input placeholder="EQ-001 ou CAB-001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="heure" render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="duree" render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Durée" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="30min">30 minutes</SelectItem>
                      <SelectItem value="1h">1 heure</SelectItem>
                      <SelectItem value="2h">2 heures</SelectItem>
                      <SelectItem value="4h">4 heures</SelectItem>
                      <SelectItem value="8h">8 heures</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="technicien" render={({ field }) => (
                <FormItem>
                  <FormLabel>Technicien</FormLabel>
                  <FormControl><Input placeholder="Nom du technicien" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="priorite" render={({ field }) => (
              <FormItem>
                <FormLabel>Priorité</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Décrivez les tâches..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit">Planifier</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
