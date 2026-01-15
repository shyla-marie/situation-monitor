import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConnectionStatus } from "./connection-status";
import { useTheme } from "@/components/theme-provider";
import {
  Search,
  Bell,
  Settings,
  Moon,
  Sun,
  Globe,
  Clock,
  Shield,
  X,
  MapPin,
  Plane,
  Ship,
  Radio,
  Cloud,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConnectionStatus as ConnectionStatusType } from "@shared/schema";
import { REGION_PRESETS } from "@shared/schema";

interface CommandBarProps {
  alertCount: number;
  criticalAlertCount: number;
  connectionStatus: ConnectionStatusType;
  lastUpdate: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRegionSelect: (regionKey: string | null) => void;
  selectedRegion: string | null;
  dataStats?: {
    events: number;
    flights: number;
    vessels: number;
    weather: number;
    cyber: number;
  };
  className?: string;
}

export function CommandBar({
  alertCount,
  criticalAlertCount,
  connectionStatus,
  lastUpdate,
  searchQuery,
  onSearchChange,
  onRegionSelect,
  selectedRegion,
  dataStats,
  className,
}: CommandBarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && isSearchFocused) {
        inputRef.current?.blur();
        setIsSearchFocused(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchFocused]);

  const regionKeys = Object.keys(REGION_PRESETS).slice(0, 6);

  return (
    <header
      className={cn(
        "bg-card border-b border-border sticky top-0 z-50",
        className
      )}
      data-testid="header-command-bar"
    >
      <div className="h-14 flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-foreground leading-none">
                SITUATION MONITOR
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Global Intelligence Platform
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              value={searchQuery}
              placeholder="Search events, regions, sources... (Cmd+K)"
              className="pl-9 pr-20 h-9 bg-muted/50 border-transparent focus:border-primary text-sm"
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              data-testid="input-global-search"
            />
            {searchQuery && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => onSearchChange("")}
                data-testid="button-clear-search"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded hidden sm:inline">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dataStats && (
            <div className="hidden xl:flex items-center gap-3 text-[10px] text-muted-foreground border-r border-border pr-3">
              <span className="flex items-center gap-1" title="Events">
                <MapPin className="w-3 h-3" />
                {dataStats.events}
              </span>
              <span className="flex items-center gap-1" title="Flights">
                <Plane className="w-3 h-3" />
                {dataStats.flights}
              </span>
              <span className="flex items-center gap-1" title="Vessels">
                <Ship className="w-3 h-3" />
                {dataStats.vessels}
              </span>
              <span className="flex items-center gap-1" title="Weather">
                <Cloud className="w-3 h-3" />
                {dataStats.weather}
              </span>
              <span className="flex items-center gap-1" title="Cyber">
                <Zap className="w-3 h-3" />
                {dataStats.cyber}
              </span>
            </div>
          )}
          
          <ConnectionStatus status={connectionStatus} className="hidden md:flex" />
          
          <div className="hidden lg:flex items-center gap-1 text-muted-foreground px-2 border-l border-border">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-mono uppercase">{lastUpdate}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-muted-foreground px-2">
            <Globe className="w-3 h-3" />
            <span className="text-[10px] font-mono">UTC</span>
          </div>

          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="relative"
              data-testid="button-alerts"
            >
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <span className={cn(
                  "absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-bold px-1",
                  criticalAlertCount > 0 
                    ? "bg-threat-critical text-white animate-bounce-subtle" 
                    : "bg-primary text-primary-foreground"
                )}>
                  {alertCount}
                </span>
              )}
            </Button>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          <Button size="icon" variant="ghost" data-testid="button-settings">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="h-8 flex items-center gap-2 px-4 bg-muted/30 border-t border-border overflow-x-auto scrollbar-hide">
        <span className="text-[10px] text-muted-foreground uppercase font-medium shrink-0">
          Quick Focus:
        </span>
        <Button
          variant={selectedRegion === null ? "default" : "ghost"}
          size="sm"
          className="h-6 text-[10px] px-2"
          onClick={() => onRegionSelect(null)}
          data-testid="button-region-all"
        >
          All Regions
        </Button>
        {regionKeys.map((key) => (
          <Button
            key={key}
            variant={selectedRegion === key ? "default" : "ghost"}
            size="sm"
            className="h-6 text-[10px] px-2 shrink-0"
            onClick={() => onRegionSelect(key)}
            data-testid={`button-region-${key}`}
          >
            {REGION_PRESETS[key].name}
          </Button>
        ))}
        <div className="flex-1" />
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="h-5 text-[9px] gap-1">
            <Radio className="w-2.5 h-2.5" />
            LIVE
          </Badge>
          <Badge variant="outline" className="h-5 text-[9px]">
            {new Date().toISOString().split("T")[0]}
          </Badge>
        </div>
      </div>
    </header>
  );
}
