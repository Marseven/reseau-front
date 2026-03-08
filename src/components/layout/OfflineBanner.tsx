import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
        isOnline
          ? "bg-green-500/15 text-green-700 dark:text-green-400"
          : "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400"
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          Connexion rétablie
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          Vous êtes hors ligne — données en cache
        </>
      )}
    </div>
  );
}
