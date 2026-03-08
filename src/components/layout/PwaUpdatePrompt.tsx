import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Check for updates every hour
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border bg-card p-4 shadow-lg">
      <RefreshCw className="h-5 w-5 text-primary" />
      <div className="text-sm">
        <p className="font-medium">Mise à jour disponible</p>
        <p className="text-muted-foreground">Une nouvelle version est prête.</p>
      </div>
      <Button size="sm" onClick={() => updateServiceWorker(true)}>
        Recharger
      </Button>
    </div>
  );
}
