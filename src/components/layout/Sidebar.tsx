import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Server,
  Cable,
  Router,
  Settings,
  Search,
  HardDrive,
  Wrench,
  Users,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "armoires", label: "Armoires", icon: Server },
  { id: "equipements", label: "Équipements", icon: HardDrive },
  { id: "liaisons", label: "Liaisons", icon: Cable },
  { id: "ports", label: "Ports", icon: Router },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "parametres", label: "Paramètres", icon: Settings },
];

const themeOptions = [
  { value: "light" as const, icon: Sun, label: "Clair" },
  { value: "dark" as const, icon: Moon, label: "Sombre" },
  { value: "system" as const, icon: Monitor, label: "Système" },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(36,90%,55%)] to-[hsl(28,85%,40%)] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(224,50%,5%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="2"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/><path d="m4.93 4.93 2.83 2.83m8.48 8.48 2.83 2.83m-2.83-14.14 2.83-2.83M4.93 19.07l2.83-2.83"/>
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-wide">
              ReseauApp
            </h1>
            <p className="text-[10px] text-sidebar-foreground uppercase tracking-widest">
              Eramet Comilog
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-9 h-9 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-accent-foreground placeholder:text-sidebar-foreground focus:border-sidebar-ring"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <p className="text-[10px] font-semibold text-sidebar-foreground uppercase tracking-[0.15em] px-3 pb-2">
          Navigation
        </p>
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sm h-9 px-3 font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary/10 text-sidebar-primary border-l-2 border-sidebar-primary rounded-l-none"
                    : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent border-l-2 border-transparent"
                )}
                onClick={() => onSectionChange(item.id)}
              >
                <item.icon className={cn(
                  "mr-3 h-4 w-4 flex-shrink-0",
                  isActive ? "text-sidebar-primary" : ""
                )} />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {/* Theme toggle */}
        <div className="flex items-center gap-1 bg-sidebar-accent rounded-lg p-1">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              title={opt.label}
              className={cn(
                "flex-1 flex items-center justify-center h-7 rounded-md transition-all duration-200",
                theme === opt.value
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
              )}
            >
              <opt.icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--status-up))] animate-pulse" />
          <span className="text-[10px] text-sidebar-foreground uppercase tracking-wider">
            Système opérationnel
          </span>
        </div>

        {/* User */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-sidebar-accent flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-sidebar-primary">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-accent-foreground truncate">
                {user?.name || 'Utilisateur'}
              </p>
              <p className="text-[10px] text-sidebar-foreground truncate capitalize">
                {user?.role || 'role'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-sidebar-foreground hover:text-[hsl(var(--destructive))] hover:bg-sidebar-accent"
            onClick={logout}
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
