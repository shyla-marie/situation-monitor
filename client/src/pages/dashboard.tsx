import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CommandBar } from "@/components/dashboard/command-bar";
import { MapView } from "@/components/dashboard/map-view";
import { LeftSidebar } from "@/components/dashboard/left-sidebar";
import { RightSidebar } from "@/components/dashboard/right-sidebar";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import type {
  ConflictEvent,
  DataFeed,
  Alert,
  PredictionMarket,
  StatCard,
  FilterState,
  ConnectionStatus,
  FlightData,
  VesselData,
  WeatherAlert,
  CyberIncident,
} from "@shared/schema";
import { REGION_PRESETS } from "@shared/schema";

const defaultFilters: FilterState = {
  threatLevels: ["critical", "high", "medium", "low", "minimal"],
  eventTypes: ["military", "political", "humanitarian", "infrastructure", "economic", "cyber"],
  sourceTypes: ["reddit", "twitter", "osint", "news", "government", "prediction_market", "flight", "marine"],
  timeRange: "24h",
  regions: [],
  credibilityMin: 5,
  searchQuery: "",
};

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selectedEvent, setSelectedEvent] = useState<ConflictEvent | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLastUpdate(now.toISOString().slice(11, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery<ConflictEvent[]>({
    queryKey: ["/api/events"],
    refetchInterval: 30000,
  });

  const { data: feeds = [], isLoading: feedsLoading, refetch: refetchFeeds } = useQuery<DataFeed[]>({
    queryKey: ["/api/feeds"],
    refetchInterval: 15000,
  });

  const { data: alerts = [], refetch: refetchAlerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 10000,
  });

  const { data: predictions = [] } = useQuery<PredictionMarket[]>({
    queryKey: ["/api/predictions"],
    refetchInterval: 60000,
  });

  const { data: stats = [] } = useQuery<StatCard[]>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000,
  });

  const { data: connectionStatus = { connected: true, lastUpdate: new Date().toISOString(), latency: 45 } } = useQuery<ConnectionStatus>({
    queryKey: ["/api/status"],
    refetchInterval: 5000,
  });

  const { data: flights = [] } = useQuery<FlightData[]>({
    queryKey: ["/api/flights"],
    refetchInterval: 10000,
  });

  const { data: vessels = [] } = useQuery<VesselData[]>({
    queryKey: ["/api/vessels"],
    refetchInterval: 15000,
  });

  const { data: weatherAlerts = [] } = useQuery<WeatherAlert[]>({
    queryKey: ["/api/weather"],
    refetchInterval: 60000,
  });

  const { data: cyberIncidents = [] } = useQuery<CyberIncident[]>({
    queryKey: ["/api/cyber"],
    refetchInterval: 30000,
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/alerts/${id}/acknowledge`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  const dismissAlertMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/alerts/${id}/dismiss`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleRefresh = () => {
    refetchEvents();
    refetchFeeds();
    refetchAlerts();
  };

  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const handleRegionSelect = (regionKey: string | null) => {
    setSelectedRegion(regionKey);
    if (regionKey && REGION_PRESETS[regionKey]) {
      setFilters((prev) => ({
        ...prev,
        searchQuery: REGION_PRESETS[regionKey].keywords[0],
      }));
    } else {
      setFilters((prev) => ({ ...prev, searchQuery: "" }));
    }
  };

  const matchesSearch = (text: string, query: string): boolean => {
    if (!query) return true;
    const searchTerms = query.toLowerCase().split(/\s+/);
    const textLower = text.toLowerCase();
    return searchTerms.every((term) => textLower.includes(term));
  };

  const matchesRegion = (location: { region?: string; country?: string } | undefined): boolean => {
    if (!selectedRegion || !location) return true;
    const preset = REGION_PRESETS[selectedRegion];
    if (!preset) return true;
    const text = `${location.region || ""} ${location.country || ""}`.toLowerCase();
    return preset.keywords.some((kw) => text.includes(kw.toLowerCase()));
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (!filters.threatLevels.includes(event.threatLevel)) return false;
      if (!filters.sourceTypes.includes(event.sourceType)) return false;
      if (!matchesRegion(event.location)) return false;
      const searchText = `${event.title} ${event.description} ${event.location.region || ""} ${event.location.country || ""} ${event.sourceName}`;
      if (!matchesSearch(searchText, filters.searchQuery)) return false;
      return true;
    });
  }, [events, filters, selectedRegion]);

  const filteredFeeds = useMemo(() => {
    return feeds.filter((feed) => {
      if (!filters.sourceTypes.includes(feed.sourceType)) return false;
      if (!matchesRegion(feed.location)) return false;
      const searchText = `${feed.content} ${feed.excerpt} ${feed.sourceName} ${feed.location?.region || ""} ${feed.location?.country || ""}`;
      if (!matchesSearch(searchText, filters.searchQuery)) return false;
      return true;
    });
  }, [feeds, filters, selectedRegion]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const searchText = `${alert.title} ${alert.description} ${alert.region}`;
      if (!matchesSearch(searchText, filters.searchQuery)) return false;
      return true;
    });
  }, [alerts, filters.searchQuery]);

  const filteredPredictions = useMemo(() => {
    return predictions.filter((pred) => {
      const searchText = `${pred.question} ${pred.category}`;
      if (!matchesSearch(searchText, filters.searchQuery)) return false;
      return true;
    });
  }, [predictions, filters.searchQuery]);

  const eventsByRegion = [
    { name: "Ukraine", value: filteredEvents.filter((e) => e.location.country === "Ukraine").length || 12, color: "#3b82f6" },
    { name: "Middle East", value: filteredEvents.filter((e) => e.location.region === "Middle East").length || 8, color: "#ef4444" },
    { name: "Asia Pacific", value: filteredEvents.filter((e) => e.location.region === "Asia Pacific").length || 5, color: "#22c55e" },
    { name: "Europe", value: filteredEvents.filter((e) => e.location.region === "Europe").length || 4, color: "#f59e0b" },
    { name: "Africa", value: filteredEvents.filter((e) => e.location.region === "Africa").length || 3, color: "#8b5cf6" },
  ];

  const threatTrend = [
    { time: "00:00", critical: 2, high: 4, medium: 8 },
    { time: "04:00", critical: 3, high: 5, medium: 7 },
    { time: "08:00", critical: 1, high: 6, medium: 9 },
    { time: "12:00", critical: 4, high: 8, medium: 6 },
    { time: "16:00", critical: 2, high: 7, medium: 8 },
    { time: "20:00", critical: 3, high: 5, medium: 10 },
    { time: "Now", critical: 2, high: 6, medium: 7 },
  ];

  const alertCount = filteredAlerts.filter((a) => !a.acknowledged).length;
  const criticalAlertCount = filteredAlerts.filter((a) => !a.acknowledged && (a.threatLevel === "critical" || a.threatLevel === "high")).length;

  const isRefreshing = eventsLoading || feedsLoading;

  const dataStats = {
    events: filteredEvents.length,
    flights: flights.length,
    vessels: vessels.length,
    weather: weatherAlerts.length,
    cyber: cyberIncidents.length,
  };

  if (eventsLoading && events.length === 0) {
    return (
      <div className="h-screen bg-background flex items-center justify-center" data-testid="loading-dashboard">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Initializing Situation Monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden" data-testid="page-dashboard">
      <CommandBar
        alertCount={alertCount}
        criticalAlertCount={criticalAlertCount}
        connectionStatus={connectionStatus}
        lastUpdate={lastUpdate}
        searchQuery={filters.searchQuery}
        onSearchChange={handleSearchChange}
        onRegionSelect={handleRegionSelect}
        selectedRegion={selectedRegion}
        dataStats={dataStats}
      />
      
      <div className="flex-1 flex min-h-0">
        <LeftSidebar
          feeds={filteredFeeds}
          alerts={filteredAlerts}
          filters={filters}
          onFilterChange={handleFilterChange}
          onAlertAcknowledge={(id) => acknowledgeAlertMutation.mutate(id)}
          onAlertDismiss={(id) => dismissAlertMutation.mutate(id)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        
        <main className="flex-1 min-w-0 p-4">
          <MapView
            events={filteredEvents}
            flights={flights}
            vessels={vessels}
            weatherAlerts={weatherAlerts}
            cyberIncidents={cyberIncidents}
            selectedEvent={selectedEvent}
            onEventSelect={setSelectedEvent}
            className="h-full"
          />
        </main>
        
        <RightSidebar
          stats={stats}
          predictions={filteredPredictions}
          eventsByRegion={eventsByRegion}
          threatTrend={threatTrend}
          cyberIncidents={cyberIncidents}
          weatherAlerts={weatherAlerts}
        />
      </div>
    </div>
  );
}
