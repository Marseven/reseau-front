import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, Mail, Phone, Shield, MapPin, Calendar, Globe, Monitor, Pencil, Lock, ShieldCheck, ShieldOff } from "lucide-react";
import { useMyLoginHistory, useUpdateProfile, useChangePassword } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import TwoFactorSetupDialog from "@/components/two-factor/TwoFactorSetupDialog";
import TwoFactorDisableDialog from "@/components/two-factor/TwoFactorDisableDialog";

const profileSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  surname: z.string().optional(),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  current_password: z.string().min(1, "Le mot de passe actuel est requis"),
  password: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
  password_confirmation: z.string().min(1, "La confirmation est requise"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfileSection() {
  const { user, refreshUser } = useAuth();
  const [historyParams] = useState({ per_page: 20 });
  const { data: paginatedHistory } = useMyLoginHistory(historyParams);
  const history = paginatedHistory?.data || [];
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [is2faSetupOpen, setIs2faSetupOpen] = useState(false);
  const [is2faDisableOpen, setIs2faDisableOpen] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", surname: "", email: "", phone: "" },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: "", password: "", password_confirmation: "" },
  });

  if (!user) return null;

  const roleLabels: Record<string, string> = {
    administrator: "Administrateur",
    directeur: "Directeur",
    technicien: "Technicien",
    user: "Utilisateur",
    prestataire: "Prestataire",
  };

  const actionLabels: Record<string, { label: string; color: string }> = {
    login: { label: "Connexion", color: "bg-green-100 text-green-800" },
    logout: { label: "Déconnexion", color: "bg-gray-100 text-gray-800" },
    login_failed: { label: "Échec connexion", color: "bg-red-100 text-red-800" },
    "2fa_verified": { label: "2FA vérifié", color: "bg-blue-100 text-blue-800" },
  };

  const fields = [
    { icon: User, label: "Nom complet", value: `${user.name} ${user.surname || ''}`.trim() },
    { icon: User, label: "Nom d'utilisateur", value: user.username },
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Téléphone", value: user.phone || "Non renseigné" },
    { icon: Shield, label: "Rôle", value: roleLabels[user.role] || user.role },
    { icon: MapPin, label: "Site", value: (user as any).site?.name || "Non affecté" },
    { icon: Calendar, label: "Membre depuis", value: new Date(user.created_at).toLocaleDateString('fr-FR') },
  ];

  const handleOpenProfileEdit = () => {
    profileForm.reset({
      name: user.name || "",
      surname: (user as any).surname || "",
      email: user.email || "",
      phone: (user as any).phone || "",
    });
    setIsProfileEditOpen(true);
  };

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        toast({ title: "Profil mis à jour", description: "Vos informations ont été mises à jour avec succès" });
        setIsProfileEditOpen(false);
        refreshUser();
      },
      onError: () => toast({ title: "Erreur", description: "Erreur lors de la mise à jour du profil", variant: "destructive" }),
    });
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePassword.mutate(data, {
      onSuccess: () => {
        toast({ title: "Mot de passe modifié", description: "Votre mot de passe a été modifié avec succès" });
        passwordForm.reset();
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || "Erreur lors du changement de mot de passe";
        toast({ title: "Erreur", description: message, variant: "destructive" });
      },
    });
  };

  const handle2faComplete = () => {
    refreshUser();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mon Profil</h2>
        <div className="text-sm text-muted-foreground mt-1">
          Informations de votre compte
        </div>
      </div>

      <Tabs defaultValue="profil">
        <TabsList>
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="securite">Sécurité</TabsTrigger>
          <TabsTrigger value="historique">Historique connexions</TabsTrigger>
        </TabsList>

        {/* Tab Profil */}
        <TabsContent value="profil" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {user.name?.charAt(0)?.toUpperCase()}{(user as any).surname?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <CardTitle>{user.name} {(user as any).surname}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant={(user as any).is_active ? "default" : "secondary"}>
                        {(user as any).is_active ? "Actif" : "Inactif"}
                      </Badge>
                      <Badge variant="outline">{roleLabels[user.role] || user.role}</Badge>
                      {user.two_factor_enabled && (
                        <Badge variant="outline" className="text-green-600 border-green-600">2FA</Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleOpenProfileEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {fields.map((field) => (
                  <div key={field.label} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <field.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium w-40">{field.label}</span>
                    <span className="text-sm text-muted-foreground">{field.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Sécurité */}
        <TabsContent value="securite" className="mt-4 space-y-4">
          {/* Mot de passe */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Changer le mot de passe
              </CardTitle>
              <CardDescription>Mettez à jour votre mot de passe de connexion</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                  <FormField control={passwordForm.control} name="current_password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe actuel</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={passwordForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nouveau mot de passe</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={passwordForm.control} name="password_confirmation" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={changePassword.isPending}>
                    {changePassword.isPending ? "Modification..." : "Changer le mot de passe"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* 2FA */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Authentification à deux facteurs (2FA)
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Ajoutez une couche de sécurité supplémentaire à votre compte
                  </CardDescription>
                </div>
                <Badge variant={user.two_factor_enabled ? "default" : "secondary"} className={user.two_factor_enabled ? "bg-green-100 text-green-800" : ""}>
                  {user.two_factor_enabled ? "Activée" : "Désactivée"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {user.two_factor_enabled ? (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      La 2FA est activée sur votre compte
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Votre compte est protégé par une authentification à deux facteurs
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIs2faDisableOpen(true)} className="text-destructive border-destructive hover:bg-destructive/10">
                    <ShieldOff className="h-4 w-4 mr-2" />
                    Désactiver
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">
                      La 2FA n'est pas activée
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Activez la 2FA pour renforcer la sécurité de votre compte
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setIs2faSetupOpen(true)}>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Activer la 2FA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Historique */}
        <TabsContent value="historique" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historique des connexions</CardTitle>
              <CardDescription>Vos dernières activités de connexion</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">Aucun historique de connexion</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">Date</th>
                        <th className="pb-2 pr-4">Action</th>
                        <th className="pb-2 pr-4">Méthode</th>
                        <th className="pb-2 pr-4">Adresse IP</th>
                        <th className="pb-2">Navigateur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((audit: any) => {
                        const actionInfo = actionLabels[audit.action] || { label: audit.action, color: "bg-gray-100 text-gray-800" };
                        return (
                          <tr key={audit.id} className="border-b last:border-0">
                            <td className="py-2 pr-4">
                              {new Date(audit.created_at).toLocaleString('fr-FR')}
                            </td>
                            <td className="py-2 pr-4">
                              <Badge className={actionInfo.color}>{actionInfo.label}</Badge>
                            </td>
                            <td className="py-2 pr-4 text-muted-foreground">
                              {audit.method || '-'}
                            </td>
                            <td className="py-2 pr-4 font-mono text-xs flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {audit.ip_address || '-'}
                            </td>
                            <td className="py-2 text-xs text-muted-foreground max-w-[200px] truncate flex items-center gap-1">
                              <Monitor className="h-3 w-3 shrink-0" />
                              {audit.user_agent ? audit.user_agent.substring(0, 60) + '...' : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileEditOpen} onOpenChange={setIsProfileEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
            <DialogDescription>Mettez à jour vos informations personnelles.</DialogDescription>
          </DialogHeader>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField control={profileForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={profileForm.control} name="surname" render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={profileForm.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={profileForm.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsProfileEditOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 2FA Dialogs */}
      <TwoFactorSetupDialog
        open={is2faSetupOpen}
        onOpenChange={setIs2faSetupOpen}
        onComplete={handle2faComplete}
      />
      <TwoFactorDisableDialog
        open={is2faDisableOpen}
        onOpenChange={setIs2faDisableOpen}
        onComplete={handle2faComplete}
      />
    </div>
  );
}
