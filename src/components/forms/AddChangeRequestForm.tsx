import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCreateChangeRequest, useCoffrets } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import { ClipboardEdit, Plus } from "lucide-react";

const changeRequestSchema = z.object({
  coffret_id: z.string().min(1, "La baie est requise"),
  type: z.string().min(1, "Le type est requis"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  justification: z.string().min(10, "La justification doit contenir au moins 10 caractères"),
  intervention_date: z.string().min(1, "La date d'intervention est requise"),
});

type ChangeRequestFormData = z.infer<typeof changeRequestSchema>;

interface AddChangeRequestFormProps {
  coffretId?: number;
  coffretName?: string;
}

export default function AddChangeRequestForm({ coffretId, coffretName }: AddChangeRequestFormProps) {
  const [open, setOpen] = useState(false);
  const createChangeRequest = useCreateChangeRequest();
  const photoBeforeRef = useRef<HTMLInputElement>(null);
  const photoAfterRef = useRef<HTMLInputElement>(null);
  const coffretsQuery = useCoffrets({ per_page: 200 });
  const coffrets = coffretsQuery.data?.data || [];
  const isStandalone = !coffretId;

  const form = useForm<ChangeRequestFormData>({
    resolver: zodResolver(changeRequestSchema),
    defaultValues: {
      coffret_id: coffretId ? String(coffretId) : "",
      type: "",
      description: "",
      justification: "",
      intervention_date: "",
    },
  });

  const onSubmit = (data: ChangeRequestFormData) => {
    const formData = new FormData();
    formData.append('coffret_id', data.coffret_id);
    formData.append('type', data.type);
    formData.append('description', data.description);
    formData.append('justification', data.justification);
    formData.append('intervention_date', data.intervention_date);

    if (photoBeforeRef.current?.files?.[0]) {
      formData.append('photo_before', photoBeforeRef.current.files[0]);
    }
    if (photoAfterRef.current?.files?.[0]) {
      formData.append('photo_after', photoAfterRef.current.files[0]);
    }

    createChangeRequest.mutate(formData, {
      onSuccess: () => {
        const label = coffretName || coffrets.find((c: any) => String(c.id) === data.coffret_id)?.name || '';
        toast({ title: "Demande soumise", description: `Demande de modification${label ? ` pour "${label}"` : ''} envoyée avec succès` });
        form.reset({ coffret_id: coffretId ? String(coffretId) : "", type: "", description: "", justification: "", intervention_date: "" });
        if (photoBeforeRef.current) photoBeforeRef.current.value = '';
        if (photoAfterRef.current) photoAfterRef.current.value = '';
        setOpen(false);
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || error?.response?.data?.errors?.coffret_id?.[0] || "Erreur lors de la soumission";
        toast({ title: "Erreur", description: message, variant: "destructive" });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isStandalone ? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle demande
          </Button>
        ) : (
          <Button variant="outline" className="gap-2">
            <ClipboardEdit className="h-4 w-4" />
            Proposer une modification
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Proposer une modification</DialogTitle>
          <DialogDescription>
            {coffretName
              ? `Demande de modification pour la baie "${coffretName}".`
              : "Créer une nouvelle demande de modification sur une baie."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isStandalone && (
              <FormField control={form.control} name="coffret_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Baie</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une baie" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {coffrets.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de modification</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="ajout_port">Ajout de port</SelectItem>
                      <SelectItem value="modification_connexion">Modification connexion</SelectItem>
                      <SelectItem value="suppression_port">Suppression de port</SelectItem>
                      <SelectItem value="changement_statut">Changement de statut</SelectItem>
                      <SelectItem value="ajout_equipement">Ajout d'équipement</SelectItem>
                      <SelectItem value="suppression_equipement">Suppression d'équipement</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="intervention_date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d'intervention</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Décrivez la modification souhaitée..." rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="justification" render={({ field }) => (
              <FormItem>
                <FormLabel>Justification</FormLabel>
                <FormControl><Textarea placeholder="Justifiez le besoin de cette modification..." rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Photo avant (optionnel)</label>
                <Input type="file" accept="image/*" ref={photoBeforeRef} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Photo après (optionnel)</label>
                <Input type="file" accept="image/*" ref={photoAfterRef} />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={createChangeRequest.isPending}>Soumettre</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
