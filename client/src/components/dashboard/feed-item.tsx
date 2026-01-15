import { Card } from "@/components/ui/card";
import { SourceIcon } from "./source-icon";
import { CredibilityBadge } from "./credibility-badge";
import { ThreatBadge } from "./threat-badge";
import { MapPin, ExternalLink, MessageCircle, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { DataFeed } from "@shared/schema";

interface FeedItemProps {
  feed: DataFeed;
  className?: string;
  onClick?: () => void;
}

const sourceColorClasses: Record<string, string> = {
  reddit: "border-l-orange-500",
  twitter: "border-l-blue-400",
  osint: "border-l-green-500",
  news: "border-l-indigo-400",
  government: "border-l-purple-400",
  prediction_market: "border-l-yellow-500",
  flight: "border-l-blue-500",
  marine: "border-l-cyan-500",
};

export function FeedItem({ feed, className, onClick }: FeedItemProps) {
  const timeAgo = formatDistanceToNow(new Date(feed.timestamp), { addSuffix: true });
  const borderClass = sourceColorClasses[feed.sourceType] || "border-l-muted";

  return (
    <Card
      className={cn(
        "p-3 border-l-4 hover-elevate active-elevate-2 cursor-pointer transition-colors duration-200",
        borderClass,
        className
      )}
      onClick={onClick}
      data-testid={`card-feed-${feed.id}`}
    >
      <div className="flex items-start gap-2">
        <SourceIcon source={feed.sourceType} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-foreground">
              {feed.sourceName}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {timeAgo}
            </span>
            {feed.verified && (
              <CredibilityBadge tier={feed.sourceCredibility} verified showStars={false} />
            )}
          </div>
          
          <p className="text-sm text-foreground/90 mt-1.5 line-clamp-3 leading-relaxed">
            {feed.excerpt}
          </p>
          
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {feed.location && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="text-[10px] font-medium">
                  {feed.location.region || feed.location.country}
                </span>
              </div>
            )}
            
            <CredibilityBadge tier={feed.sourceCredibility} showStars />
            
            {feed.engagementMetrics && (
              <div className="flex items-center gap-2 text-muted-foreground">
                {feed.engagementMetrics.upvotes !== undefined && (
                  <div className="flex items-center gap-0.5">
                    <ThumbsUp className="w-3 h-3" />
                    <span className="text-[10px]">{feed.engagementMetrics.upvotes}</span>
                  </div>
                )}
                {feed.engagementMetrics.comments !== undefined && (
                  <div className="flex items-center gap-0.5">
                    <MessageCircle className="w-3 h-3" />
                    <span className="text-[10px]">{feed.engagementMetrics.comments}</span>
                  </div>
                )}
              </div>
            )}
            
            {feed.url && (
              <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
