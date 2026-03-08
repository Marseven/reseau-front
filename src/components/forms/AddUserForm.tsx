import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCreateUser, useUpdateUser, useSites } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const createSchema = z.object({
  name: z.string().min(1, "Le prénom est requis"),
  surname: z.string().min(1, "Le nom est requis"),
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  role: z.string().min(1, "Le rôle est requis"),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
  password_confirmation: z.string().min(1, "La confirmation est requise"),
  site_id: z.string().optional(),
}).refine(data => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

const editSchema = z.object({
  name: z.string().min(1, "Le prénom est requis"),
  surname: z.string().min(1, "Le nom est requis"),
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  role: z.string().min(1, "Le rôle est requis"),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
  site_id: z.string().optional(),
}).refine(data => {
  if (data.password && data.password.length > 0) {
    return data.password === data.password_confirmation;
  }
  return true;
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

type UserFormData = z.infer<typeof createSchema>;

interface AddUserFormProps {
  initialData?: any;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

export default function AddUserForm({ initialData, open: controlledOpen, onOpenChange }: AddUserFormProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEdit = !!initialData;
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const mutation = isEdit ? updateUser : createUser;
  const { data: paginatedSites } = useSites({ per_page: 100 });
  const sites = paginatedSites?.data || [];

  const form = useForm<UserFormData>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: {
      name: "",
      surname: "",
      username: "",
      email: "",
      phone: "",
      role: "user",
      password: "",
      password_confirmation: "",
      site_id: "",
    }
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        name: initialData.name || "",
        surname: initialData.surname || "",
        username: initialData.username || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        role: initialData.role || "user",
        password: "",
        password_confirmation: "",
        site_id: initialData.site_id ? String(initialData.site_id) : "",
      });
    }
  }, [initialData, open]);

  const onSubmit = (data: UserFormData) => {
    const payload: any = { ...data };
    if (payload.site_id) payload.site_id = Number(payload.site_id);
    else delete payload.site_id;

    if (isEdit) {
      if (!payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }
      updateUser.mutate({ id: initialData.id, ...payload }, {
        onSuccess: () => {
          toast({ title: "Utilisateur mis à jour", description: `L'utilisateur ${data.name} ${data.surname} a été mis à jour` });
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" }),
      });
    } else {
      createUser.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Utilisateur ajouté", description: `L'utilisateur ${data.name} ${data.surname} a été créé` });
          form.reset();
          setOpen(false);
        },
        onError: () => toast({ title: "Erreur", description: "Erreur lors de la création", variant: "destructive" }),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel utilisateur
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifiez les informations de l'utilisateur." : "Créer un nouveau compte utilisateur."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl><Input placeholder="Jean" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="surname" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input placeholder="Dupont" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom d'utilisateur</FormLabel>
                  <FormControl><Input placeholder="jdupont" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="jean.dupont@telecom.ga" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl><Input placeholder="+241 01 23 45 67" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Rôle" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="user">Utilisateur</SelectItem>
                      <SelectItem value="prestataire">Prestataire</SelectItem>
                      <SelectItem value="technicien">Technicien</SelectItem>
                      <SelectItem value="directeur">Directeur</SelectItem>
                      <SelectItem value="administrator">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEdit ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}</FormLabel>
                  <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password_confirmation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer</FormLabel>
                  <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="site_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Site (optionnel)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un site" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {sites.map((site: any) => (
                      <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={mutation.isPending}>{isEdit ? "Enregistrer" : "Créer"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
