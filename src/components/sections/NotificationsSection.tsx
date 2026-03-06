import { Bell, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotificationsSection() {
  const notifications = [
    {
      id: 1,
      type: "info",
      title: "Bienvenue sur ReseauApp",
      message: "Le système de notifications sera bientôt disponible avec les alertes en temps réel.",
      date: new Date().toLocaleDateString('fr-FR'),
      read: false,
    },
  ];

  const iconMap = {
    info: <Info className="h-5 w-5 text-blue-500" />,
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
        <div className="text-sm text-muted-foreground mt-1">
          Centre de notifications et alertes
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <Card key={notif.id} className={notif.read ? "opacity-60" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                {iconMap[notif.type as keyof typeof iconMap]}
                <div className="flex-1">
                  <CardTitle className="text-base">{notif.title}</CardTitle>
                  <CardDescription>{notif.date}</CardDescription>
                </div>
                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{notif.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-center">
            Les notifications en temps réel seront disponibles dans une prochaine mise à jour.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
