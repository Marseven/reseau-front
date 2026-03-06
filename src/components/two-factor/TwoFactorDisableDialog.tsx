import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShieldOff } from "lucide-react";
import api from "@/axios";

interface TwoFactorDisableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function TwoFactorDisableDialog({
  open,
  onOpenChange,
  onComplete,
}: TwoFactorDisableDialogProps) {
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOtpCode("");
    }
    onOpenChange(isOpen);
  };

  const handleDisable = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/2fa/disable", { code: otpCode });
      if (response.data.status === 200) {
        toast({
          title: "2FA désactivée",
          description: "L'authentification à deux facteurs a été désactivée",
        });
        handleOpenChange(false);
        onComplete();
      } else {
        toast({
          title: "Code invalide",
          description: response.data.message || "Le code OTP est incorrect",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Code OTP invalide",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5 text-destructive" />
            Désactiver la 2FA
          </DialogTitle>
          <DialogDescription>
            Entrez le code de votre application d'authentification pour confirmer la désactivation
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={(value) => setOtpCode(value)}
            autoFocus
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDisable}
            disabled={otpCode.length < 6 || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Désactiver"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
