import {
  SiReddit,
  SiX,
} from "react-icons/si";
import {
  Newspaper,
  Building2,
  TrendingUp,
  Plane,
  Ship,
  Search,
} from "lucide-react";
import type { SourceType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SourceIconProps {
  source: SourceType;
  className?: string;
}

const sourceConfig: Record<SourceType, { icon: React.ElementType; color: string; label: string }> = {
  reddit: { icon: SiReddit, color: "text-orange-500", label: "Reddit" },
  twitter: { icon: SiX, color: "text-blue-400", label: "X/Twitter" },
  osint: { icon: Search, color: "text-green-500", label: "OSINT" },
  news: { icon: Newspaper, color: "text-indigo-400", label: "News" },
  government: { icon: Building2, color: "text-purple-400", label: "Government" },
  prediction_market: { icon: TrendingUp, color: "text-yellow-500", label: "Prediction" },
  flight: { icon: Plane, color: "text-blue-500", label: "Flight" },
  marine: { icon: Ship, color: "text-cyan-500", label: "Marine" },
};

export function SourceIcon({ source, className }: SourceIconProps) {
  const config = sourceConfig[source];
  const Icon = config.icon;

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      title={config.label}
    >
      <Icon className={cn("w-3.5 h-3.5", config.color)} />
    </div>
  );
}

export function SourceLabel({ source, className }: SourceIconProps) {
  const config = sourceConfig[source];
  const Icon = config.icon;

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      data-testid={`label-source-${source}`}
    >
      <Icon className={cn("w-3.5 h-3.5", config.color)} />
      <span className={cn("text-xs font-medium", config.color)}>
        {config.label}
      </span>
    </div>
  );
}
