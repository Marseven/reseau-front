import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Lock, Mail } from "lucide-react";

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

    const copper = { r: 217, g: 149, b: 42 }; // hsl(36 90% 50%) approx

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
            const alpha = (1 - dist / maxDist) * 0.2;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${copper.r}, ${copper.g}, ${copper.b}, ${alpha})`;
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
        ctx.fillStyle = `rgba(${copper.r}, ${copper.g}, ${copper.b}, ${glow + 0.2})`;
        ctx.fill();

        // Outer glow
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${copper.r}, ${copper.g}, ${copper.b}, ${glow * 0.08})`;
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
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
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

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left panel: Network visualization ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(224,50%,4%)] via-[hsl(224,44%,8%)] to-[hsl(222,40%,6%)]" />

        {/* Radial accent */}
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, hsla(36, 90%, 50%, 0.06) 0%, transparent 60%)'
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
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(36,90%,55%)] to-[hsl(28,85%,40%)] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(224,50%,5%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="2"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/><path d="m4.93 4.93 2.83 2.83m8.48 8.48 2.83 2.83m-2.83-14.14 2.83-2.83M4.93 19.07l2.83-2.83"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wider uppercase text-[hsl(36,90%,55%)]">
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
              <span className="text-gradient-copper">Supervision</span><br />
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
                  <p className="text-2xl font-bold text-[hsl(36,90%,55%)] font-mono">
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
            &copy; {new Date().getFullYear()} JOBS-Conseil &middot; Eramet Comilog
          </p>
        </div>
      </div>

      {/* ── Right panel: Login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(36,90%,50%) 1px, transparent 1px), linear-gradient(90deg, hsl(36,90%,50%) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div
          className={`w-full max-w-sm relative z-10 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(36,90%,55%)] to-[hsl(28,85%,40%)] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(224,50%,5%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="2"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/><path d="m4.93 4.93 2.83 2.83m8.48 8.48 2.83 2.83m-2.83-14.14 2.83-2.83M4.93 19.07l2.83-2.83"/>
                </svg>
              </div>
              <span className="text-lg font-semibold text-foreground">ReseauApp</span>
            </div>
          </div>

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
                  className="pl-10 h-11 bg-card border-border focus:border-[hsl(36,90%,50%)] focus:ring-[hsl(36,90%,50%)]/20 transition-colors"
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
                  className="pl-10 h-11 bg-card border-border focus:border-[hsl(36,90%,50%)] focus:ring-[hsl(36,90%,50%)]/20 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-[hsl(36,90%,50%)] to-[hsl(28,85%,42%)] text-[hsl(224,50%,5%)] font-semibold hover:from-[hsl(36,90%,55%)] hover:to-[hsl(28,85%,47%)] transition-all duration-300 shadow-lg shadow-[hsl(36,90%,50%)]/10 hover:shadow-[hsl(36,90%,50%)]/20 group"
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
        </div>
      </div>
    </div>
  );
};

export default Login;
