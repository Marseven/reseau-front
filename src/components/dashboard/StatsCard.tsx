import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden p-5 bg-card border-border hover:border-primary/20 transition-all duration-300 group">
      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-[40px]" />

      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-bold text-foreground font-mono tracking-tight">
              {value}
            </h3>
            {trend && (
              <span className={`text-xs font-semibold font-mono ${
                trend.isPositive ? 'text-[hsl(var(--status-up))]' : 'text-[hsl(var(--status-down))]'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  );
}
