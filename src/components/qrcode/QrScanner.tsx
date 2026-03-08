import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SwitchCamera, X, AlertCircle } from "lucide-react";

interface QrScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (decodedText: string) => void;
}

export default function QrScanner({ open, onOpenChange, onScan }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const containerId = "qr-scanner-container";

  const stopScanner = useCallback(async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore stop errors
      }
    }
  }, []);

  const startScanner = useCallback(async () => {
    setError(null);

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(containerId);
    }

    await stopScanner();

    try {
      await scannerRef.current.start(
        { facingMode },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          onOpenChange(false);
        },
        () => {
          // ignore scan failures (no QR found in frame)
        }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("NotAllowedError") || message.includes("Permission")) {
        setError("Permission caméra refusée. Autorisez l'accès à la caméra dans les paramètres.");
      } else if (message.includes("NotFoundError") || message.includes("Requested device not found")) {
        setError("Aucune caméra détectée sur cet appareil.");
      } else {
        setError(`Impossible d'accéder à la caméra : ${message}`);
      }
    }
  }, [facingMode, onScan, onOpenChange, stopScanner]);

  useEffect(() => {
    if (open) {
      // Small delay to ensure the DOM container is mounted
      const timer = setTimeout(() => startScanner(), 300);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
  }, [open, startScanner, stopScanner]);

  // Restart when facingMode changes while open
  useEffect(() => {
    if (open && scannerRef.current) {
      startScanner();
    }
  }, [facingMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    stopScanner();
    onOpenChange(false);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center justify-between">
            Scanner QR Code
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={toggleCamera}>
                <SwitchCamera className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4">
          {error ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={startScanner}>
                Réessayer
              </Button>
            </div>
          ) : (
            <div
              id={containerId}
              className="w-full rounded-lg overflow-hidden bg-black aspect-square"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
