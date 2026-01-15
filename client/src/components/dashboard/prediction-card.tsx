import { Card } from "@/components/ui/card";
import { Sparkline } from "./sparkline";
import { TrendingUp, TrendingDown, Activity, DollarSign, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PredictionMarket } from "@shared/schema";

interface PredictionCardProps {
  prediction: PredictionMarket;
  className?: string;
  onClick?: () => void;
}

export function PredictionCard({ prediction, className, onClick }: PredictionCardProps) {
  const isUp = prediction.change24h > 0;
  const changeAbs = Math.abs(prediction.change24h).toFixed(1);
  
  const probabilityPercent = prediction.probability > 1 
    ? Math.round(prediction.probability) 
    : Math.round(prediction.probability * 100);

  const getProbabilityColor = () => {
    if (probabilityPercent >= 60) return "text-threat-critical";
    if (probabilityPercent >= 40) return "text-threat-high";
    if (probabilityPercent >= 20) return "text-threat-medium";
    return "text-threat-minimal";
  };

  const getProgressColor = () => {
    if (probabilityPercent >= 60) return "bg-threat-critical";
    if (probabilityPercent >= 40) return "bg-threat-high";
    if (probabilityPercent >= 20) return "bg-threat-medium";
    return "bg-threat-minimal";
  };

  const getTrendIcon = () => {
    if (Math.abs(prediction.change24h) < 0.5) {
      return <div className="w-3 h-0.5 bg-muted-foreground rounded" />;
    }
    return isUp ? (
      <TrendingUp className="w-3.5 h-3.5 text-threat-critical" />
    ) : (
      <TrendingDown className="w-3.5 h-3.5 text-threat-minimal" />
    );
  };

  return (
    <Card
      className={cn(
        "p-3 hover-elevate active-elevate-2 cursor-pointer transition-colors duration-200",
        className
      )}
      onClick={onClick}
      data-testid={`card-prediction-${prediction.id}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-primary" />
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
            {prediction.source === "polymarket" ? "Polymarket" : "Manifold"}
          </span>
          <span className="text-[9px] text-muted-foreground bg-muted px-1 py-0.5 rounded">
            {prediction.category}
          </span>
        </div>
        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-50" />
      </div>
      
      <h4 className="text-xs font-medium text-foreground line-clamp-2 leading-snug mb-3">
        {prediction.question}
      </h4>

      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-2">
        <div 
          className={cn("absolute left-0 top-0 h-full rounded-full transition-all duration-500", getProgressColor())}
          style={{ width: `${Math.min(probabilityPercent, 100)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-between px-1">
          <div className="w-0.5 h-1 bg-background/30 rounded" />
          <div className="w-0.5 h-1 bg-background/30 rounded" style={{ marginLeft: '25%' }} />
          <div className="w-0.5 h-1 bg-background/30 rounded" style={{ marginLeft: '25%' }} />
          <div className="w-0.5 h-1 bg-background/30 rounded" style={{ marginLeft: '25%' }} />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("text-lg font-bold tabular-nums", getProbabilityColor())}>
            {probabilityPercent}%
          </span>
          <div className={cn(
            "flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px]",
            isUp ? "bg-threat-critical/10" : prediction.change24h < 0 ? "bg-threat-minimal/10" : "bg-muted"
          )}>
            {getTrendIcon()}
            <span className={cn(
              "font-medium tabular-nums",
              isUp ? "text-threat-critical" : prediction.change24h < 0 ? "text-threat-minimal" : "text-muted-foreground"
            )}>
              {isUp ? "+" : prediction.change24h < 0 ? "" : ""}{changeAbs}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Sparkline
            data={prediction.sparklineData}
            width={48}
            height={20}
            color={isUp ? "hsl(var(--threat-critical))" : "hsl(var(--threat-minimal))"}
          />
          <div className="flex items-center gap-0.5 text-muted-foreground">
            <DollarSign className="w-2.5 h-2.5" />
            <span className="text-[9px] font-mono">
              {prediction.volume >= 1000000 
                ? `${(prediction.volume / 1000000).toFixed(1)}M`
                : prediction.volume >= 1000
                  ? `${(prediction.volume / 1000).toFixed(0)}K`
                  : prediction.volume.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
