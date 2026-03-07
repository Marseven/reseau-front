import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  X,
  AlertTriangle,
  Wrench,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "@/hooks/api";
import type { AppNotification } from "@/types/api";

const iconMap: Record<string, React.ReactNode> = {
  modification_approved: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  modification_rejected: <X className="h-5 w-5 text-red-500" />,
  modification_request: <Bell className="h-5 w-5 text-blue-500" />,
  intervention_active: <Wrench className="h-5 w-5 text-orange-500" />,
  system_alert: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
};

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHour < 24) return `Il y a ${diffHour}h`;
  if (diffDay < 7) return `Il y a ${diffDay}j`;
  return date.toLocaleDateString("fr-FR");
}

function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: AppNotification;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const isUnread = !notification.read_at;

  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-muted/50 ${isUnread ? "" : "opacity-60"}`}
      onClick={() => isUnread && onMarkRead(notification.id)}
    >
      <CardContent className="flex items-start gap-3 py-4">
        <div className="mt-0.5 flex-shrink-0">
          {iconMap[notification.type] || <Bell className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{notification.title}</p>
            {isUnread && (
              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatRelativeDate(notification.created_at)}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function NotificationsSection() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const params = filter === "unread" ? { unread_only: "true" } : {};
  const { data, isLoading, isError } = useNotifications(params);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotif = useDeleteNotification();

  const notifications = data?.notifications?.data || [];
  const unreadCount = data?.unread_count || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          <div className="text-sm text-muted-foreground mt-1">
            Centre de notifications et alertes
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="h-4 w-4" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Toutes
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          Non lues {unreadCount > 0 && `(${unreadCount})`}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-12 w-12 text-destructive/30 mb-4" />
            <p className="text-muted-foreground text-center">
              Erreur lors du chargement des notifications.
            </p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-center">
              {filter === "unread"
                ? "Aucune notification non lue."
                : "Aucune notification pour le moment."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              onMarkRead={(id) => markRead.mutate(id)}
              onDelete={(id) => deleteNotif.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
