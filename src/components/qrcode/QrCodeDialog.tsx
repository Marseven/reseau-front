import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface QrCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  title: string;
  subtitle?: string;
}

export default function QrCodeDialog({
  open,
  onOpenChange,
  value,
  title,
  subtitle,
}: QrCodeDialogProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const svgHtml = qrRef.current?.innerHTML || "";
    const win = window.open("", "_blank", "width=400,height=500");
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>QR Code - ${title}</title>
  <style>
    body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
    .qr { margin-bottom: 16px; }
    .title { font-size: 18px; font-weight: 700; margin: 0; }
    .subtitle { font-size: 14px; color: #666; margin: 4px 0 0; }
  </style>
</head>
<body>
  <div class="qr">${svgHtml}</div>
  <p class="title">${title}</p>
  ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ""}
</body>
</html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div ref={qrRef} className="bg-white p-4 rounded-lg">
            <QRCodeSVG value={value} size={256} level="M" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">{title}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <Button onClick={handlePrint} variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
