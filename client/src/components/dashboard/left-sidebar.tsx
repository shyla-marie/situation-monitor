import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FeedItem } from "./feed-item";
import { AlertCard } from "./alert-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Rss,
  AlertTriangle,
  Filter,
  ChevronDown,
  RefreshCw,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataFeed, Alert, FilterState, ThreatLevel, SourceType } from "@shared/schema";

interface LeftSidebarProps {
  feeds: DataFeed[];
  alerts: Alert[];
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onAlertAcknowledge: (id: string) => void;
  onAlertDismiss: (id: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  className?: string;
}

const threatLevelOptions: { value: ThreatLevel; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "minimal", label: "Minimal" },
];

const sourceTypeOptions: { value: SourceType; label: string }[] = [
  { value: "reddit", label: "Reddit" },
  { value: "twitter", label: "X/Twitter" },
  { value: "osint", label: "OSINT" },
  { value: "news", label: "News" },
  { value: "government", label: "Government" },
  { value: "prediction_market", label: "Markets" },
  { value: "flight", label: "Flight" },
  { value: "marine", label: "Marine" },
];

const timeRangeOptions = [
  { value: "1h", label: "1 Hour" },
  { value: "6h", label: "6 Hours" },
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
];

export function LeftSidebar({
  feeds,
  alerts,
  filters,
  onFilterChange,
  onAlertAcknowledge,
  onAlertDismiss,
  onRefresh,
  isRefreshing,
  className,
}: LeftSidebarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  const handleThreatLevelToggle = (level: ThreatLevel) => {
    const newLevels = filters.threatLevels.includes(level)
      ? filters.threatLevels.filter((l) => l !== level)
      : [...filters.threatLevels, level];
    onFilterChange({ threatLevels: newLevels });
  };

  const handleSourceTypeToggle = (source: SourceType) => {
    const newSources = filters.sourceTypes.includes(source)
      ? filters.sourceTypes.filter((s) => s !== source)
      : [...filters.sourceTypes, source];
    onFilterChange({ sourceTypes: newSources });
  };

  return (
    <aside
      className={cn(
        "w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col",
        className
      )}
      data-testid="sidebar-left"
    >
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-4 h-10 rounded-none border-b border-sidebar-border"
            data-testid="button-toggle-filters"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                filtersOpen && "rotate-180"
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="border-b border-sidebar-border">
          <div className="p-4 space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">
                Time Range
              </Label>
              <div className="flex flex-wrap gap-1">
                {timeRangeOptions.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={filters.timeRange === option.value ? "default" : "ghost"}
                    className="h-6 text-[10px] px-2"
                    onClick={() => onFilterChange({ timeRange: option.value as FilterState["timeRange"] })}
                    data-testid={`button-time-${option.value}`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">
                Threat Level
              </Label>
              <div className="grid grid-cols-2 gap-1.5">
                {threatLevelOptions.map((option) => (
                  <div key={option.value} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`threat-${option.value}`}
                      checked={filters.threatLevels.includes(option.value)}
                      onCheckedChange={() => handleThreatLevelToggle(option.value)}
                      data-testid={`checkbox-threat-${option.value}`}
                    />
                    <Label
                      htmlFor={`threat-${option.value}`}
                      className="text-xs cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 block">
                Sources
              </Label>
              <div className="grid grid-cols-2 gap-1.5">
                {sourceTypeOptions.map((option) => (
                  <div key={option.value} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`source-${option.value}`}
                      checked={filters.sourceTypes.includes(option.value)}
                      onCheckedChange={() => handleSourceTypeToggle(option.value)}
                      data-testid={`checkbox-source-${option.value}`}
                    />
                    <Label
                      htmlFor={`source-${option.value}`}
                      className="text-xs cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Tabs defaultValue="feeds" className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-2 border-b border-sidebar-border">
          <TabsList className="h-10 bg-transparent">
            <TabsTrigger
              value="feeds"
              className="data-[state=active]:bg-sidebar-accent text-xs gap-1.5"
              data-testid="tab-feeds"
            >
              <Rss className="w-3.5 h-3.5" />
              Feeds
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="data-[state=active]:bg-sidebar-accent text-xs gap-1.5"
              data-testid="tab-alerts"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Alerts
              {unacknowledgedAlerts.length > 0 && (
                <span className="ml-1 bg-threat-critical text-white text-[10px] font-bold px-1.5 rounded-full">
                  {unacknowledgedAlerts.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh-feeds"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          </Button>
        </div>

        <TabsContent value="feeds" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              {feeds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Rss className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs">No feeds available</p>
                </div>
              ) : (
                feeds.map((feed) => (
                  <FeedItem key={feed.id} feed={feed} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="alerts" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs">No active alerts</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={onAlertAcknowledge}
                    onDismiss={onAlertDismiss}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
