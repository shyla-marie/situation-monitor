import { Badge } from "@/components/ui/badge";
import type { ThreatLevel } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ThreatBadgeProps {
  level: ThreatLevel;
  size?: "sm" | "md";
  className?: string;
}

const threatConfig: Record<ThreatLevel, { label: string; className: string }> = {
  critical: { label: "CRITICAL", className: "bg-threat-critical text-white" },
  high: { label: "HIGH", className: "bg-threat-high text-white" },
  medium: { label: "MEDIUM", className: "bg-threat-medium text-black" },
  low: { label: "LOW", className: "bg-threat-low text-white" },
  minimal: { label: "MINIMAL", className: "bg-threat-minimal text-white" },
};

export function ThreatBadge({ level, size = "sm", className }: ThreatBadgeProps) {
  const config = threatConfig[level];
  
  return (
    <Badge
      className={cn(
        "font-mono font-bold uppercase tracking-wider no-default-hover-elevate no-default-active-elevate",
        size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5",
        config.className,
        className
      )}
      data-testid={`badge-threat-${level}`}
    >
      {config.label}
    </Badge>
  );
}
