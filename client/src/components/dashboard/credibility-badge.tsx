import { Star, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SourceCredibility } from "@shared/schema";

interface CredibilityBadgeProps {
  tier: SourceCredibility;
  verified?: boolean;
  showStars?: boolean;
  className?: string;
}

const tierConfig: Record<SourceCredibility, { label: string; color: string }> = {
  1: { label: "Top Tier", color: "text-yellow-500" },
  2: { label: "Verified", color: "text-blue-400" },
  3: { label: "Reliable", color: "text-green-400" },
  4: { label: "Unverified", color: "text-muted-foreground" },
  5: { label: "Unconfirmed", color: "text-muted-foreground/60" },
};

export function CredibilityBadge({
  tier,
  verified = false,
  showStars = true,
  className,
}: CredibilityBadgeProps) {
  const config = tierConfig[tier];

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      data-testid={`badge-credibility-${tier}`}
    >
      {verified && (
        <CheckCircle className="w-3 h-3 text-primary fill-primary/20" />
      )}
      {showStars && (
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-2.5 h-2.5",
                i < 6 - tier
                  ? `${config.color} fill-current`
                  : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}
      <span className={cn("text-[10px] font-medium", config.color)}>
        {config.label}
      </span>
    </div>
  );
}
