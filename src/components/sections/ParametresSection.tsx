import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Bell, Shield, Database, Palette, Globe, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings, useUpdateSettings } from "@/hooks/api";
import { toast } from "@/hooks/use-toast";
import TwoFactorSetupDialog from "@/components/two-factor/TwoFactorSetupDialog";
import TwoFactorDisableDialog from "@/components/two-factor/TwoFactorDisableDialog";

const settingsSchema = z.object({
  // General
  company_name: z.string().max(255),
  timezone: z.string(),
  language: z.string(),
  refresh_interval: z.coerce.number().min(5).max(300),
  // Network
  snmp_community: z.string().max(255),
  snmp_timeout: z.coerce.number().min(1000).max(30000),
  snmp_retries: z.coerce.number().min(1).max(10),
  auto_discovery: z.boolean(),
  // Notifications
  notify_equipment_alerts: z.boolean(),
  notify_maintenance: z.boolean(),
  notify_performance: z.boolean(),
  notification_email: z.string().email().or(z.literal("")),
  notification_webhook: z.string().url().or(z.literal("")),
  // Security
  session_timeout: z.coerce.number().min(5).max(480),
  password_policy: z.string(),
  // Logging
  audit_logs_enabled: z.boolean(),
  log_retention_days: z.coerce.number().min(7).max(365),
  log_level: z.string(),
  // Database
  backup_frequency: z.string(),
  data_retention_months: z.coerce.number().min(1).max(120),
  compress_old_data: z.boolean(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

const BOOLEAN_KEYS = [
  "auto_discovery",
  "notify_equipment_alerts",
  "notify_maintenance",
  "notify_performance",
  "audit_logs_enabled",
  "compress_old_data",
] as const;

function toBool(val: string | undefined): boolean {
  return val === "true";
}

export default function ParametresSection() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      company_name: "",
      timezone: "europe-paris",
      language: "fr",
      refresh_interval: 30,
      snmp_community: "",
      snmp_timeout: 5000,
      snmp_retries: 3,
      auto_discovery: true,
      notify_equipment_alerts: true,
      notify_maintenance: true,
      notify_performance: false,
      notification_email: "",
      notification_webhook: "",
      session_timeout: 60,
      password_policy: "medium",
      audit_logs_enabled: true,
      log_retention_days: 90,
      log_level: "info",
      backup_frequency: "daily",
      data_retention_months: 12,
      compress_old_data: true,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        company_name: settings.company_name ?? "",
        timezone: settings.timezone ?? "europe-paris",
        language: settings.language ?? "fr",
        refresh_interval: Number(settings.refresh_interval) || 30,
        snmp_community: settings.snmp_community ?? "",
        snmp_timeout: Number(settings.snmp_timeout) || 5000,
        snmp_retries: Number(settings.snmp_retries) || 3,
        auto_discovery: toBool(settings.auto_discovery),
        notify_equipment_alerts: toBool(settings.notify_equipment_alerts),
        notify_maintenance: toBool(settings.notify_maintenance),
        notify_performance: toBool(settings.notify_performance),
        notification_email: settings.notification_email ?? "",
        notification_webhook: settings.notification_webhook ?? "",
        session_timeout: Number(settings.session_timeout) || 60,
        password_policy: settings.password_policy ?? "medium",
        audit_logs_enabled: toBool(settings.audit_logs_enabled),
        log_retention_days: Number(settings.log_retention_days) || 90,
        log_level: settings.log_level ?? "info",
        backup_frequency: settings.backup_frequency ?? "daily",
        data_retention_months: Number(settings.data_retention_months) || 12,
        compress_old_data: toBool(settings.compress_old_data),
      });
    }
  }, [settings, form]);

  const onSubmit = (data: SettingsForm) => {
    const payload: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      if (BOOLEAN_KEYS.includes(key as (typeof BOOLEAN_KEYS)[number])) {
        payload[key] = value ? "true" : "false";
      } else {
        payload[key] = String(value);
      }
    }

    updateSettings.mutate(payload, {
      onSuccess: () => {
        toast({ title: "Paramètres sauvegardés", description: "Les modifications ont été enregistrées." });
      },
      onError: () => {
        toast({ title: "Erreur", description: "Impossible de sauvegarder les paramètres.", variant: "destructive" });
      },
    });
  };

  const handleTwoFactorToggle = () => {
    if (user?.two_factor_enabled) {
      setShowDisableDialog(true);
    } else {
      setShowSetupDialog(true);
    }
  };

  const handleTwoFactorComplete = () => {
    refreshUser();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paramètres Système</h1>
          <p className="text-muted-foreground">Configurez votre environnement et préférences</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={form.handleSubmit(onSubmit)}
          disabled={updateSettings.isPending}
        >
          {updateSettings.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {updateSettings.isPending ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="database">Base de données</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configuration Générale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nom de l'organisation</Label>
                  <Input id="company_name" placeholder="Votre entreprise" {...form.register("company_name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Controller
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="europe-paris">Europe/Paris (UTC+1)</SelectItem>
                          <SelectItem value="europe-london">Europe/London (UTC+0)</SelectItem>
                          <SelectItem value="america-newyork">America/New_York (UTC-5)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Langue par défaut</Label>
                  <Controller
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refresh_interval">Intervalle de rafraîchissement (secondes)</Label>
                  <Input id="refresh_interval" type="number" {...form.register("refresh_interval")} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres Réseau</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="snmp_community">Communauté SNMP par défaut</Label>
                  <Input id="snmp_community" placeholder="public" {...form.register("snmp_community")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="snmp_timeout">Timeout SNMP (ms)</Label>
                  <Input id="snmp_timeout" type="number" {...form.register("snmp_timeout")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="snmp_retries">Nombre de tentatives</Label>
                  <Input id="snmp_retries" type="number" {...form.register("snmp_retries")} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto_discovery">Découverte automatique</Label>
                  <Controller
                    control={form.control}
                    name="auto_discovery"
                    render={({ field }) => (
                      <Switch
                        id="auto_discovery"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Paramètres de Notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Alertes d'équipements</div>
                    <div className="text-sm text-muted-foreground">Notifications en cas de panne ou problème</div>
                  </div>
                  <Controller
                    control={form.control}
                    name="notify_equipment_alerts"
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Maintenance programmée</div>
                    <div className="text-sm text-muted-foreground">Rappels des maintenances planifiées</div>
                  </div>
                  <Controller
                    control={form.control}
                    name="notify_maintenance"
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Seuils de performance</div>
                    <div className="text-sm text-muted-foreground">Alertes basées sur les métriques</div>
                  </div>
                  <Controller
                    control={form.control}
                    name="notify_performance"
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-foreground">Canaux de notification</h4>
                <div className="space-y-2">
                  <Label htmlFor="notification_email">Adresse email principal</Label>
                  <Input id="notification_email" type="email" placeholder="admin@company.com" {...form.register("notification_email")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification_webhook">URL Webhook (optionnel)</Label>
                  <Input id="notification_webhook" placeholder="https://hooks.company.com/alerts" {...form.register("notification_webhook")} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Sécurité d'Accès
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Authentification à deux facteurs</div>
                    <div className="text-sm text-muted-foreground">
                      {user?.two_factor_enabled ? "Activée — Google Authenticator" : "Sécurité renforcée"}
                    </div>
                  </div>
                  <Switch
                    checked={user?.two_factor_enabled ?? false}
                    onCheckedChange={handleTwoFactorToggle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Timeout de session (minutes)</Label>
                  <Input id="session_timeout" type="number" {...form.register("session_timeout")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_policy">Politique de mot de passe</Label>
                  <Controller
                    control={form.control}
                    name="password_policy"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Basique</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="high">Élevée</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Journalisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Logs d'audit</div>
                    <div className="text-sm text-muted-foreground">Traçabilité des actions</div>
                  </div>
                  <Controller
                    control={form.control}
                    name="audit_logs_enabled"
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log_retention_days">Rétention des logs (jours)</Label>
                  <Input id="log_retention_days" type="number" {...form.register("log_retention_days")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log_level">Niveau de log</Label>
                  <Controller
                    control={form.control}
                    name="log_level"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="error">Erreurs uniquement</SelectItem>
                          <SelectItem value="warn">Avertissements et erreurs</SelectItem>
                          <SelectItem value="info">Informations, avertissements et erreurs</SelectItem>
                          <SelectItem value="debug">Tout (debug inclus)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configuration Base de Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backup_frequency">Fréquence de sauvegarde</Label>
                <Controller
                  control={form.control}
                  name="backup_frequency"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Chaque heure</SelectItem>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_retention_months">Rétention des données (mois)</Label>
                <Input id="data_retention_months" type="number" {...form.register("data_retention_months")} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Compression des données anciennes</div>
                  <div className="text-sm text-muted-foreground">Optimise l'espace de stockage</div>
                </div>
                <Controller
                  control={form.control}
                  name="compress_old_data"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Personnalisation de l'Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Thème</Label>
                  <Select value={theme} onValueChange={(val) => setTheme(val as "light" | "dark" | "system")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="system">Automatique (système)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-foreground mb-3">Prévisualisation du thème</h4>
                <div className="p-4 border border-border rounded-lg bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-primary rounded"></div>
                    <span className="text-foreground font-medium">Exemple de titre</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Ceci est un aperçu de votre thème personnalisé avec les couleurs et paramètres choisis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TwoFactorSetupDialog
        open={showSetupDialog}
        onOpenChange={setShowSetupDialog}
        onComplete={handleTwoFactorComplete}
      />
      <TwoFactorDisableDialog
        open={showDisableDialog}
        onOpenChange={setShowDisableDialog}
        onComplete={handleTwoFactorComplete}
      />
    </div>
  );
}
