import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, Shield, MapPin, Calendar, Globe, Monitor } from "lucide-react";
import { useMyLoginHistory } from "@/hooks/api";

export default function ProfileSection() {
  const { user } = useAuth();
  const [historyParams] = useState({ per_page: 20 });
  const { data: paginatedHistory } = useMyLoginHistory(historyParams);
  const history = paginatedHistory?.data || [];

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
    { icon: MapPin, label: "Site", value: user.site?.name || "Non affecté" },
    { icon: Calendar, label: "Membre depuis", value: new Date(user.created_at).toLocaleDateString('fr-FR') },
  ];

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
          <TabsTrigger value="historique">Historique connexions</TabsTrigger>
        </TabsList>

        <TabsContent value="profil" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {user.name?.charAt(0)?.toUpperCase()}{user.surname?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <CardTitle>{user.name} {user.surname}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Actif" : "Inactif"}
                    </Badge>
                    <Badge variant="outline">{roleLabels[user.role] || user.role}</Badge>
                    {user.two_factor_enabled && (
                      <Badge variant="outline" className="text-green-600 border-green-600">2FA</Badge>
                    )}
                  </CardDescription>
                </div>
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
    </div>
  );
}
