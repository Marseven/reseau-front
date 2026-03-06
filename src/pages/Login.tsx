import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, ArrowLeft, Lock, Mail, ShieldCheck, KeyRound } from "lucide-react";

/* ── Animated network topology background ── */
interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulse: number;
  pulseSpeed: number;
}

function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener("resize", resize);

    // Create nodes
    const count = 40;
    nodesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1.5,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02,
    }));

    const brand = { r: 48, g: 53, b: 93 }; // #30355d

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;

      // Update positions
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.pulseSpeed;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      // Draw connections
      const maxDist = 160;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.25;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${brand.r}, ${brand.g}, ${brand.b}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const glow = 0.3 + Math.sin(n.pulse) * 0.3;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + Math.sin(n.pulse) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${brand.r}, ${brand.g}, ${brand.b}, ${glow + 0.3})`;
        ctx.fill();

        // Outer glow
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${brand.r}, ${brand.g}, ${brand.b}, ${glow * 0.1})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
}

/* ── Login Page ── */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 2FA state
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");

  const { login, verifyTwoFactor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if ("requires2fa" in result && result.requires2fa) {
        setTwoFactorToken(result.twoFactorToken);
        setTwoFactorStep(true);
        setIsLoading(false);
        return;
      }

      if ("success" in result && result.success) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans le système de gestion réseau",
        });
        navigate("/");
      } else {
        toast({
          title: "Erreur de connexion",
          description: "Identifiant ou mot de passe incorrect",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const code = recoveryMode ? recoveryCode : otpCode;
      const success = await verifyTwoFactor(twoFactorToken, code, recoveryMode);

      if (success) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans le système de gestion réseau",
        });
        navigate("/");
      } else {
        toast({
          title: "Code invalide",
          description: recoveryMode
            ? "Le code de récupération est invalide"
            : "Le code OTP est invalide",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la vérification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setTwoFactorStep(false);
    setTwoFactorToken("");
    setOtpCode("");
    setRecoveryCode("");
    setRecoveryMode(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left panel: Network visualization ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(224,50%,4%)] via-[hsl(224,44%,8%)] to-[hsl(222,40%,6%)]" />

        {/* Radial accent */}
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, hsla(232, 33%, 28%, 0.08) 0%, transparent 60%)'
          }}
        />

        {/* Animated network canvas */}
        <NetworkCanvas />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top: Logo */}
          <div
            className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
          >
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Eramet Comilog" className="h-10 w-auto brightness-0 invert" />
              <div>
                <p className="text-sm font-semibold tracking-wider uppercase text-[hsl(229,40%,70%)]">
                  Eramet Comilog
                </p>
                <p className="text-xs text-[hsl(215,16%,45%)] tracking-wide">
                  Infrastructure Réseau
                </p>
              </div>
            </div>
          </div>

          {/* Center: Hero text */}
          <div className="max-w-md">
            <h1
              className={`text-4xl font-bold leading-tight text-[hsl(210,20%,92%)] transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              Gestion &<br />
              <span className="text-gradient-brand">Supervision</span><br />
              du Réseau
            </h1>
            <p
              className={`mt-5 text-[hsl(215,16%,50%)] leading-relaxed transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              Plateforme centralisée pour l'inventaire, le monitoring
              et la maintenance des infrastructures télécom.
            </p>

            {/* Stats row */}
            <div
              className={`mt-10 flex gap-8 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              {[
                { value: "36", label: "Armoires" },
                { value: "248", label: "Équipements" },
                { value: "99.7%", label: "Uptime" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-[hsl(229,40%,70%)] font-mono">
                    {stat.value}
                  </p>
                  <p className="text-xs text-[hsl(215,16%,45%)] mt-1 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Copyright */}
          <p
            className={`text-xs text-[hsl(215,16%,35%)] transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          >
            &copy; {new Date().getFullYear()} Eramet Comilog
          </p>
        </div>
      </div>

      {/* ── Right panel: Login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(232,33%,28%) 1px, transparent 1px), linear-gradient(90deg, hsl(232,33%,28%) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div
          className={`w-full max-w-sm relative z-10 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <div className="inline-flex items-center gap-3">
              <img src="/logo.png" alt="Eramet Comilog" className="h-10 w-auto dark:brightness-0 dark:invert" />
              <span className="text-lg font-semibold text-foreground">ReseauApp</span>
            </div>
          </div>

          {!twoFactorStep ? (
            <>
              {/* Form header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  Connexion
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Accédez au système de gestion réseau
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Adresse email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="administrateur@eramet-comilog.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-11 bg-card border-border focus:border-primary focus:ring-primary/20 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 h-11 bg-card border-border focus:border-primary focus:ring-primary/20 transition-colors"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary text-white font-semibold hover:bg-[hsl(232,33%,35%)] transition-all duration-300 shadow-lg shadow-primary/10 hover:shadow-primary/20 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Bottom link */}
              <p className="mt-8 text-center text-xs text-muted-foreground">
                Contactez l'administrateur pour obtenir vos identifiants
              </p>
            </>
          ) : (
            <>
              {/* 2FA verification step */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">
                    Vérification 2FA
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {recoveryMode
                    ? "Entrez l'un de vos codes de récupération"
                    : "Entrez le code à 6 chiffres de votre application d'authentification"}
                </p>
              </div>

              <form onSubmit={handleTwoFactorSubmit} className="space-y-6">
                {recoveryMode ? (
                  <div className="space-y-2">
                    <Label htmlFor="recovery-code" className="text-sm font-medium text-foreground">
                      Code de récupération
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="recovery-code"
                        type="text"
                        placeholder="XXXX-XXXX"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        required
                        autoFocus
                        className="pl-10 h-11 bg-card border-border focus:border-primary focus:ring-primary/20 transition-colors font-mono tracking-wider"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
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
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary text-white font-semibold hover:bg-[hsl(232,33%,35%)] transition-all duration-300 shadow-lg shadow-primary/10 hover:shadow-primary/20 group"
                  disabled={isLoading || (!recoveryMode && otpCode.length < 6) || (recoveryMode && !recoveryCode)}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Vérifier
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToLogin}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Retour
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRecoveryMode(!recoveryMode);
                      setOtpCode("");
                      setRecoveryCode("");
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {recoveryMode ? "Utiliser le code OTP" : "Utiliser un code de récupération"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
