import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
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
import { Loader2, Copy, Check, ShieldCheck, AlertTriangle } from "lucide-react";
import api from "@/axios";

interface TwoFactorSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

type Step = "qrcode" | "verify" | "recovery";

export default function TwoFactorSetupDialog({
  open,
  onOpenChange,
  onComplete,
}: TwoFactorSetupDialogProps) {
  const [step, setStep] = useState<Step>("qrcode");
  const [secret, setSecret] = useState("");
  const [provisioningUri, setProvisioningUri] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codesCopied, setCodesCopied] = useState(false);

  const handleOpen = async (isOpen: boolean) => {
    if (isOpen && step === "qrcode" && !secret) {
      setIsLoading(true);
      try {
        const response = await api.post("/auth/2fa/setup");
        if (response.data.status === 200) {
          setSecret(response.data.data.secret);
          setProvisioningUri(response.data.data.provisioning_uri);
        } else {
          toast({
            title: "Erreur",
            description: response.data.message || "Impossible de configurer la 2FA",
            variant: "destructive",
          });
          onOpenChange(false);
          return;
        }
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de configurer la 2FA",
          variant: "destructive",
        });
        onOpenChange(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    if (!isOpen) {
      // Reset state on close
      setStep("qrcode");
      setSecret("");
      setProvisioningUri("");
      setOtpCode("");
      setRecoveryCodes([]);
      setCopied(false);
      setCodesCopied(false);
    }

    onOpenChange(isOpen);
  };

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/2fa/verify", { code: otpCode });
      if (response.data.status === 200) {
        setRecoveryCodes(response.data.data.recovery_codes);
        setStep("recovery");
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

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyRecoveryCodes = async () => {
    await navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCodesCopied(true);
    toast({
      title: "Codes copiés",
      description: "Les codes de récupération ont été copiés dans le presse-papiers",
    });
    setTimeout(() => setCodesCopied(false), 2000);
  };

  const handleFinish = () => {
    handleOpen(false);
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        {step === "qrcode" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Configurer la 2FA
              </DialogTitle>
              <DialogDescription>
                Scannez le QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-4">
              {isLoading ? (
                <div className="w-48 h-48 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="p-4 bg-white rounded-lg">
                    <QRCodeSVG value={provisioningUri} size={192} />
                  </div>
                  <div className="w-full space-y-2">
                    <p className="text-xs text-muted-foreground text-center">
                      Ou entrez cette clé manuellement :
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono text-center break-all">
                        {secret}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copySecret}
                        className="shrink-0"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => setStep("verify")}
                disabled={!secret}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Suivant
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "verify" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Vérifier le code
              </DialogTitle>
              <DialogDescription>
                Entrez le code à 6 chiffres affiché dans votre application pour confirmer la configuration
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
              <Button variant="outline" onClick={() => setStep("qrcode")}>
                Retour
              </Button>
              <Button
                onClick={handleVerify}
                disabled={otpCode.length < 6 || isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Activer la 2FA"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "recovery" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                2FA activée
              </DialogTitle>
              <DialogDescription>
                Sauvegardez vos codes de récupération dans un endroit sûr. Chaque code ne peut être utilisé qu'une seule fois.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Ces codes ne seront plus affichés. Si vous perdez l'accès à votre application d'authentification, ces codes seront votre seul moyen de connexion.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                {recoveryCodes.map((code, index) => (
                  <code key={index} className="text-sm font-mono text-center py-1">
                    {code}
                  </code>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={copyRecoveryCodes}
                className="w-full"
              >
                {codesCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Codes copiés
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copier les codes
                  </>
                )}
              </Button>
            </div>

            <DialogFooter>
              <Button
                onClick={handleFinish}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                J'ai sauvegardé mes codes
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
