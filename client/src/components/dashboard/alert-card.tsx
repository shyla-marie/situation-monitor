import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThreatBadge } from "./threat-badge";
import { AlertTriangle, MapPin, Eye, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Alert } from "@shared/schema";

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

const threatBorderColors: Record<string, string> = {
  critical: "border-l-threat-critical",
  high: "border-l-threat-high",
  medium: "border-l-threat-medium",
  low: "border-l-threat-low",
  minimal: "border-l-threat-minimal",
};

export function AlertCard({ alert, onAcknowledge, onDismiss, className }: AlertCardProps) {
  const timeAgo = formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true });
  const borderClass = threatBorderColors[alert.threatLevel] || "border-l-muted";
  const isCritical = alert.threatLevel === "critical" || alert.threatLevel === "high";

  return (
    <Card
      className={cn(
        "p-3 border-l-4 transition-all duration-200",
        borderClass,
        isCritical && !alert.acknowledged && "ring-1 ring-threat-critical/30",
        alert.acknowledged && "opacity-60",
        className
      )}
      data-testid={`card-alert-${alert.id}`}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-1.5 rounded-md",
          isCritical ? "bg-threat-critical/10" : "bg-muted"
        )}>
          <AlertTriangle className={cn(
            "w-4 h-4",
            isCritical ? "text-threat-critical" : "text-muted-foreground"
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <ThreatBadge level={alert.threatLevel} />
            <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
          </div>
          
          <h4 className="text-sm font-semibold text-foreground mt-1.5 line-clamp-2">
            {alert.title}
          </h4>
          
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {alert.description}
          </p>
          
          <div className="flex items-center gap-1 mt-2 text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="text-[10px] font-medium">{alert.region}</span>
          </div>
          
          {!alert.acknowledged && (
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                variant="default"
                onClick={() => onAcknowledge?.(alert.id)}
                data-testid={`button-investigate-${alert.id}`}
              >
                <Eye className="w-3 h-3 mr-1" />
                Investigate
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismiss?.(alert.id)}
                data-testid={`button-dismiss-${alert.id}`}
              >
                <X className="w-3 h-3 mr-1" />
                Dismiss
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
