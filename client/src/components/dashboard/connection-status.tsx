import { Wifi, WifiOff, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConnectionStatus as ConnectionStatusType } from "@shared/schema";

interface ConnectionStatusProps {
  status: ConnectionStatusType;
  className?: string;
}

export function ConnectionStatus({ status, className }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    if (!status.connected) {
      return {
        icon: WifiOff,
        label: "Disconnected",
        color: "text-connection-disconnected",
        bgColor: "bg-connection-disconnected",
        pulse: false,
      };
    }
    if (status.latency > 1000) {
      return {
        icon: Clock,
        label: "Delayed",
        color: "text-connection-delayed",
        bgColor: "bg-connection-delayed",
        pulse: true,
      };
    }
    return {
      icon: Wifi,
      label: "Live",
      color: "text-connection-online",
      bgColor: "bg-connection-online",
      pulse: true,
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      data-testid="status-connection"
    >
      <div className="relative flex items-center">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            config.bgColor,
            config.pulse && "status-pulse"
          )}
        />
      </div>
      <Icon className={cn("w-3.5 h-3.5", config.color)} />
      <span className={cn("text-xs font-medium", config.color)}>
        {config.label}
      </span>
      {status.connected && (
        <span className="text-xs text-muted-foreground font-mono">
          {status.latency}ms
        </span>
      )}
    </div>
  );
}
