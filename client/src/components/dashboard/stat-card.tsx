import { Card } from "@/components/ui/card";
import { Sparkline } from "./sparkline";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatCard as StatCardType } from "@shared/schema";

interface StatCardProps {
  stat: StatCardType;
  className?: string;
}

export function StatCard({ stat, className }: StatCardProps) {
  const getTrendConfig = () => {
    switch (stat.trend) {
      case "up":
        return {
          icon: TrendingUp,
          color: stat.change > 0 ? "text-threat-high" : "text-threat-minimal",
          bgColor: stat.change > 0 ? "bg-threat-high/10" : "bg-threat-minimal/10",
        };
      case "down":
        return {
          icon: TrendingDown,
          color: stat.change < 0 ? "text-threat-minimal" : "text-threat-high",
          bgColor: stat.change < 0 ? "bg-threat-minimal/10" : "bg-threat-high/10",
        };
      default:
        return {
          icon: Minus,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
        };
    }
  };

  const config = getTrendConfig();
  const TrendIcon = config.icon;
  const changeValue = Math.abs(stat.change).toFixed(1);

  return (
    <Card
      className={cn("p-4", className)}
      data-testid={`card-stat-${stat.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">
            {stat.label}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {stat.value.toLocaleString()}
            </span>
            {stat.unit && (
              <span className="text-sm text-muted-foreground">{stat.unit}</span>
            )}
          </div>
          <div className={cn("flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-sm w-fit", config.bgColor)}>
            <TrendIcon className={cn("w-3 h-3", config.color)} />
            <span className={cn("text-xs font-medium", config.color)}>
              {stat.trend === "up" ? "+" : stat.trend === "down" ? "-" : ""}
              {changeValue}%
            </span>
          </div>
        </div>
        <Sparkline
          data={stat.sparklineData}
          width={64}
          height={32}
          color={config.color.includes("high") ? "hsl(var(--threat-high))" : "hsl(var(--threat-minimal))"}
        />
      </div>
    </Card>
  );
}
