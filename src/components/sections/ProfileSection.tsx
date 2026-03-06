import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Shield, MapPin, Calendar } from "lucide-react";

export default function ProfileSection() {
  const { user } = useAuth();

  if (!user) return null;

  const roleLabels: Record<string, string> = {
    administrator: "Administrateur",
    directeur: "Directeur",
    technicien: "Technicien",
    user: "Utilisateur",
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
    </div>
  );
}
