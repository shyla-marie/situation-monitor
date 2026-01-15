import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Popup, useMap, CircleMarker, Circle, Marker } from "react-leaflet";
import L from "leaflet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThreatBadge } from "./threat-badge";
import { SourceLabel } from "./source-icon";
import { CredibilityBadge } from "./credibility-badge";
import { MapPin, Clock, Plane, Ship, Cloud, Zap, Radio, Eye, EyeOff, Layers, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { ConflictEvent, ThreatLevel, FlightData, VesselData, WeatherAlert, CyberIncident } from "@shared/schema";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  events: ConflictEvent[];
  flights?: FlightData[];
  vessels?: VesselData[];
  weatherAlerts?: WeatherAlert[];
  cyberIncidents?: CyberIncident[];
  selectedEvent?: ConflictEvent | null;
  onEventSelect?: (event: ConflictEvent) => void;
  className?: string;
}

const threatColors: Record<ThreatLevel, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#3b82f6",
  minimal: "#22c55e",
};

const threatSizes: Record<ThreatLevel, number> = {
  critical: 14,
  high: 12,
  medium: 10,
  low: 8,
  minimal: 6,
};

const flightCategoryColors: Record<string, string> = {
  fighter: "#ef4444",
  bomber: "#dc2626",
  military: "#ef4444",
  surveillance: "#f97316",
  drone: "#a855f7",
  government: "#fbbf24",
  tanker: "#3b82f6",
  transport: "#22c55e",
  helicopter: "#f97316",
  civil: "#6b7280",
};

const vesselCategoryColors: Record<string, string> = {
  carrier: "#dc2626",
  warship: "#ef4444",
  submarine: "#7c3aed",
  patrol: "#f97316",
  tanker: "#3b82f6",
  cargo: "#22c55e",
};

function createAircraftIcon(category: string, heading: number, color: string): L.DivIcon {
  const svgIcons: Record<string, string> = {
    fighter: `<path d="M12 2L8 8L4 10L8 12L12 22L16 12L20 10L16 8L12 2Z" fill="${color}" stroke="#000" stroke-width="0.5"/>`,
    bomber: `<path d="M12 2L6 8L2 10L6 14L10 22H14L18 14L22 10L18 8L12 2Z" fill="${color}" stroke="#000" stroke-width="0.5"/>`,
    surveillance: `<ellipse cx="12" cy="6" rx="8" ry="3" fill="${color}" stroke="#000" stroke-width="0.5"/><path d="M12 9L8 14L6 22H18L16 14L12 9Z" fill="${color}" stroke="#000" stroke-width="0.5"/>`,
    drone: `<path d="M12 4L8 10L4 12L8 14L12 20L16 14L20 12L16 10L12 4Z" fill="${color}" stroke="#000" stroke-width="0.5"/><circle cx="12" cy="12" r="2" fill="#fff"/>`,
    tanker: `<ellipse cx="12" cy="12" rx="10" ry="4" fill="${color}" stroke="#000" stroke-width="0.5"/><path d="M4 12L2 18M20 12L22 18" stroke="${color}" stroke-width="2"/>`,
    transport: `<ellipse cx="12" cy="12" rx="10" ry="5" fill="${color}" stroke="#000" stroke-width="0.5"/><path d="M2 12H22" stroke="#000" stroke-width="0.5"/>`,
    government: `<ellipse cx="12" cy="12" rx="9" ry="4" fill="${color}" stroke="#000" stroke-width="0.5"/><polygon points="12,6 10,8 14,8" fill="#fff"/>`,
    helicopter: `<ellipse cx="12" cy="8" rx="10" ry="2" fill="${color}" opacity="0.5"/><ellipse cx="12" cy="12" rx="5" ry="8" fill="${color}" stroke="#000" stroke-width="0.5"/>`,
    military: `<path d="M12 2L8 8L4 10L8 12L12 22L16 12L20 10L16 8L12 2Z" fill="${color}" stroke="#000" stroke-width="0.5"/>`,
    civil: `<ellipse cx="12" cy="12" rx="8" ry="3" fill="${color}" stroke="#000" stroke-width="0.5"/>`,
  };

  const iconSvg = svgIcons[category] || svgIcons.civil;
  
  const html = `
    <div style="transform: rotate(${heading}deg); width: 24px; height: 24px;">
      <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        ${iconSvg}
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: "aircraft-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function createVesselIcon(category: string, heading: number, color: string): L.DivIcon {
  const svgIcons: Record<string, string> = {
    carrier: `<path d="M4 8H20L22 12H20V18H4V12H2L4 8Z" fill="${color}" stroke="#000" stroke-width="0.5"/><rect x="6" y="10" width="12" height="2" fill="#333"/>`,
    warship: `<path d="M2 14L4 10H20L22 14L20 16H4L2 14Z" fill="${color}" stroke="#000" stroke-width="0.5"/><rect x="10" y="8" width="4" height="4" fill="${color}" stroke="#000" stroke-width="0.5"/>`,
    submarine: `<ellipse cx="12" cy="12" rx="10" ry="4" fill="${color}" stroke="#000" stroke-width="0.5"/><rect x="10" y="8" width="4" height="4" fill="${color}" stroke="#000" stroke-width="0.5"/>`,
    patrol: `<path d="M4 12L6 8H18L20 12L18 16H6L4 12Z" fill="${color}" stroke="#000" stroke-width="0.5"/>`,
    tanker: `<path d="M2 12L4 8H20L22 12L20 16H4L2 12Z" fill="${color}" stroke="#000" stroke-width="0.5"/><ellipse cx="8" cy="12" rx="2" ry="3" fill="#333"/><ellipse cx="16" cy="12" rx="2" ry="3" fill="#333"/>`,
    cargo: `<path d="M2 14L4 10H20L22 14L20 16H4L2 14Z" fill="${color}" stroke="#000" stroke-width="0.5"/><rect x="6" y="8" width="12" height="4" fill="${color}" stroke="#000" stroke-width="0.5"/>`,
  };

  const iconSvg = svgIcons[category] || svgIcons.cargo;
  
  const html = `
    <div style="transform: rotate(${heading}deg); width: 28px; height: 28px;">
      <svg viewBox="0 0 24 24" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
        ${iconSvg}
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: "vessel-icon",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function createCyberIcon(type: string, severity: ThreatLevel): L.DivIcon {
  const color = threatColors[severity] || "#a855f7";
  const icons: Record<string, string> = {
    ddos: `<circle cx="12" cy="12" r="10" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="2"><animate attributeName="r" values="8;12;8" dur="1s" repeatCount="indefinite"/></circle><circle cx="12" cy="12" r="4" fill="${color}"/>`,
    internet_outage: `<rect x="2" y="6" width="20" height="12" rx="2" fill="${color}" opacity="0.5" stroke="${color}" stroke-width="1.5"/><line x1="6" y1="12" x2="18" y2="12" stroke="#000" stroke-width="2"/><line x1="12" y1="6" x2="12" y2="18" stroke="#000" stroke-width="2"/>`,
    power_grid: `<path d="M12 2L8 12H11L9 22L16 10H13L15 2H12Z" fill="${color}" stroke="#000" stroke-width="0.5"/>`,
    comms_disruption: `<circle cx="12" cy="12" r="3" fill="${color}"/><path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke="${color}" stroke-width="2" stroke-dasharray="2,2"/>`,
    ransomware: `<rect x="4" y="8" width="16" height="12" rx="2" fill="${color}" stroke="#000" stroke-width="0.5"/><circle cx="12" cy="14" r="3" fill="#000"/>`,
  };

  const iconSvg = icons[type] || icons.ddos;
  
  const html = `
    <div style="width: 32px; height: 32px;">
      <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        ${iconSvg}
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: "cyber-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

interface LayerVisibility {
  events: boolean;
  flights: boolean;
  vessels: boolean;
  weather: boolean;
  cyber: boolean;
}

function MapLegend({ layers, onToggleLayer, counts }: { 
  layers: LayerVisibility; 
  onToggleLayer: (layer: keyof LayerVisibility) => void;
  counts: { events: number; flights: number; vessels: number; weather: number; cyber: number };
}) {
  const threatLevels: ThreatLevel[] = ["critical", "high", "medium", "low", "minimal"];
  
  return (
    <Card className="absolute bottom-4 left-4 z-[1000] p-3 bg-card/95 backdrop-blur-sm max-h-[400px] overflow-y-auto">
      <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        Threat Level
      </h4>
      <div className="flex flex-col gap-1 mb-3">
        {threatLevels.map((level) => (
          <div key={level} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: threatColors[level] }}
            />
            <span className="text-[10px] text-foreground capitalize">{level}</span>
          </div>
        ))}
      </div>
      
      <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 pt-2 border-t border-border">
        Layers
      </h4>
      <div className="flex flex-col gap-1">
        {[
          { key: "events" as const, icon: MapPin, label: "Events", count: counts.events, color: "text-primary" },
          { key: "flights" as const, icon: Plane, label: "Flights", count: counts.flights, color: "text-blue-500" },
          { key: "vessels" as const, icon: Ship, label: "Vessels", count: counts.vessels, color: "text-cyan-500" },
          { key: "weather" as const, icon: Cloud, label: "Weather", count: counts.weather, color: "text-yellow-500" },
          { key: "cyber" as const, icon: Zap, label: "Cyber", count: counts.cyber, color: "text-purple-500" },
        ].map(({ key, icon: Icon, label, count, color }) => (
          <button
            key={key}
            onClick={() => onToggleLayer(key)}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded text-left transition-colors",
              layers[key] ? "bg-primary/10" : "opacity-50 hover:opacity-75"
            )}
            data-testid={`toggle-layer-${key}`}
          >
            {layers[key] ? (
              <Eye className={cn("w-3 h-3", color)} />
            ) : (
              <EyeOff className="w-3 h-3 text-muted-foreground" />
            )}
            <Icon className={cn("w-3 h-3", layers[key] ? color : "text-muted-foreground")} />
            <span className="text-[10px] text-foreground">{label}</span>
            <span className={cn("text-[9px] font-mono ml-auto", layers[key] ? color : "text-muted-foreground")}>
              {count}
            </span>
          </button>
        ))}
      </div>

      <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 pt-2 border-t border-border mt-2">
        Aircraft Types
      </h4>
      <div className="grid grid-cols-2 gap-1 text-[9px]">
        {[
          { cat: "fighter", label: "Fighter", color: flightCategoryColors.fighter },
          { cat: "bomber", label: "Bomber", color: flightCategoryColors.bomber },
          { cat: "surveillance", label: "Recon", color: flightCategoryColors.surveillance },
          { cat: "drone", label: "UAV", color: flightCategoryColors.drone },
          { cat: "tanker", label: "Tanker", color: flightCategoryColors.tanker },
          { cat: "transport", label: "Transport", color: flightCategoryColors.transport },
        ].map(({ cat, label, color }) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function EventPopup({ event }: { event: ConflictEvent }) {
  const timeAgo = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true });
  
  return (
    <div className="min-w-[240px] max-w-[300px] p-1">
      <div className="flex items-center gap-2 mb-2">
        <ThreatBadge level={event.threatLevel} />
        <SourceLabel source={event.sourceType} />
        <CredibilityBadge tier={event.sourceCredibility} />
      </div>
      
      <h4 className="text-sm font-semibold text-foreground mb-1">
        {event.title}
      </h4>
      
      <p className="text-xs text-muted-foreground mb-2 line-clamp-3">
        {event.description}
      </p>
      
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground border-t border-border pt-2">
        <Clock className="w-3 h-3" />
        <span>{timeAgo}</span>
        <span>·</span>
        <MapPin className="w-3 h-3" />
        <span>{event.location.region || event.location.country}</span>
      </div>
    </div>
  );
}

function FlightPopup({ flight }: { flight: FlightData }) {
  const timeAgo = formatDistanceToNow(new Date(flight.timestamp), { addSuffix: true });
  const categoryColor = flightCategoryColors[flight.category] || "#3b82f6";

  return (
    <div className="min-w-[220px] max-w-[280px] p-1">
      <div className="flex items-center gap-2 mb-2">
        <Badge 
          variant="outline" 
          className="text-[10px] gap-1"
          style={{ backgroundColor: `${categoryColor}20`, borderColor: `${categoryColor}50`, color: categoryColor }}
        >
          <Plane className="w-3 h-3" />
          {flight.category.toUpperCase()}
        </Badge>
        <span className="text-[10px] text-muted-foreground font-mono">{timeAgo}</span>
      </div>
      
      <h4 className="text-sm font-semibold text-foreground mb-1 font-mono">
        {flight.callsign}
      </h4>
      
      <p className="text-xs text-muted-foreground mb-2">
        {flight.aircraftType}
      </p>
      
      <div className="grid grid-cols-3 gap-2 text-[10px] border-t border-border pt-2">
        <div>
          <span className="text-muted-foreground block">ALT</span>
          <span className="text-foreground font-mono">{flight.altitude.toLocaleString()} ft</span>
        </div>
        <div>
          <span className="text-muted-foreground block">SPD</span>
          <span className="text-foreground font-mono">{flight.speed} kts</span>
        </div>
        <div>
          <span className="text-muted-foreground block">HDG</span>
          <span className="text-foreground font-mono">{flight.heading}°</span>
        </div>
      </div>

      <div className="text-[9px] text-muted-foreground mt-2 pt-1 border-t border-border">
        <MapPin className="w-2.5 h-2.5 inline mr-1" />
        {flight.location.region} - {flight.location.country}
      </div>
    </div>
  );
}

function VesselPopup({ vessel }: { vessel: VesselData }) {
  const timeAgo = formatDistanceToNow(new Date(vessel.timestamp), { addSuffix: true });
  const categoryColor = vesselCategoryColors[vessel.category] || "#06b6d4";

  return (
    <div className="min-w-[220px] max-w-[280px] p-1">
      <div className="flex items-center gap-2 mb-2">
        <Badge 
          variant="outline" 
          className="text-[10px] gap-1"
          style={{ backgroundColor: `${categoryColor}20`, borderColor: `${categoryColor}50`, color: categoryColor }}
        >
          <Ship className="w-3 h-3" />
          {vessel.category.toUpperCase()}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {vessel.flag}
        </Badge>
      </div>
      
      <h4 className="text-sm font-semibold text-foreground mb-1">
        {vessel.name}
      </h4>
      
      <p className="text-xs text-muted-foreground mb-2">
        {vessel.vesselType}
      </p>
      
      <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-border pt-2">
        <div>
          <span className="text-muted-foreground block">SPEED</span>
          <span className="text-foreground font-mono">{vessel.speed} kts</span>
        </div>
        <div>
          <span className="text-muted-foreground block">HEADING</span>
          <span className="text-foreground font-mono">{vessel.heading}°</span>
        </div>
      </div>

      <div className="text-[9px] text-muted-foreground mt-2 pt-1 border-t border-border">
        <Clock className="w-2.5 h-2.5 inline mr-1" />
        {timeAgo}
      </div>
    </div>
  );
}

function WeatherPopup({ alert }: { alert: WeatherAlert }) {
  const severityColors: Record<string, string> = {
    warning: "bg-red-500/10 border-red-500/30 text-red-500",
    watch: "bg-orange-500/10 border-orange-500/30 text-orange-500",
    advisory: "bg-yellow-500/10 border-yellow-500/30 text-yellow-500",
    info: "bg-blue-500/10 border-blue-500/30 text-blue-500",
  };

  return (
    <div className="min-w-[240px] max-w-[300px] p-1">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className={cn("text-[10px] gap-1", severityColors[alert.severity])}>
          <Cloud className="w-3 h-3" />
          {alert.type}
        </Badge>
        <span className="text-[10px] text-muted-foreground uppercase">{alert.severity}</span>
      </div>
      
      <h4 className="text-sm font-semibold text-foreground mb-1">
        {alert.title}
      </h4>
      
      <p className="text-xs text-muted-foreground mb-2">
        {alert.laymansDescription}
      </p>
      
      {alert.affectedAltitude && (
        <div className="text-[10px] text-muted-foreground border-t border-border pt-2">
          <span className="text-foreground">Altitude:</span> FL{Math.floor(alert.affectedAltitude.min / 100)} - FL{Math.floor(alert.affectedAltitude.max / 100)}
        </div>
      )}
    </div>
  );
}

function CyberPopup({ incident }: { incident: CyberIncident }) {
  const timeAgo = formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true });

  return (
    <div className="min-w-[240px] max-w-[300px] p-1">
      <div className="flex items-center gap-2 mb-2">
        <ThreatBadge level={incident.severity} />
        <Badge variant="outline" className="text-[10px] gap-1 bg-purple-500/10 border-purple-500/30">
          <Zap className="w-3 h-3" />
          {incident.type.replace(/_/g, " ").toUpperCase()}
        </Badge>
      </div>
      
      <h4 className="text-sm font-semibold text-foreground mb-1">
        {incident.title}
      </h4>
      
      <p className="text-xs text-muted-foreground mb-2">
        {incident.description}
      </p>
      
      <div className="flex items-center gap-4 text-[10px] border-t border-border pt-2">
        <div>
          <span className="text-muted-foreground">Impact:</span>
          <span className="font-mono text-foreground ml-1">{incident.percentageAffected}%</span>
        </div>
        <div>
          <span className="text-muted-foreground">Source:</span>
          <span className="text-foreground ml-1">{incident.source}</span>
        </div>
      </div>

      <div className="text-[9px] text-muted-foreground mt-2 pt-1 border-t border-border">
        <Clock className="w-2.5 h-2.5 inline mr-1" />
        {timeAgo}
        {incident.restorationEta && (
          <span className="ml-2">ETA: {incident.restorationEta}</span>
        )}
      </div>
    </div>
  );
}

function MapController({ selectedEvent }: { selectedEvent?: ConflictEvent | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedEvent) {
      map.flyTo([selectedEvent.location.lat, selectedEvent.location.lng], 8, {
        duration: 1,
      });
    }
  }, [selectedEvent, map]);
  
  return null;
}

export function MapView({ 
  events, 
  flights = [], 
  vessels = [], 
  weatherAlerts = [], 
  cyberIncidents = [],
  selectedEvent, 
  onEventSelect, 
  className 
}: MapViewProps) {
  const [mapStyle, setMapStyle] = useState<"dark" | "satellite">("dark");
  const [layers, setLayers] = useState<LayerVisibility>({
    events: true,
    flights: true,
    vessels: true,
    weather: true,
    cyber: true,
  });

  const toggleLayer = (layer: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const tileUrls = {
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  const aircraftIcons = useMemo(() => {
    return flights.map(flight => ({
      id: flight.id,
      icon: createAircraftIcon(
        flight.category,
        flight.heading,
        flightCategoryColors[flight.category] || "#3b82f6"
      ),
    }));
  }, [flights]);

  const vesselIcons = useMemo(() => {
    return vessels.map(vessel => ({
      id: vessel.id,
      icon: createVesselIcon(
        vessel.category,
        vessel.heading,
        vesselCategoryColors[vessel.category] || "#06b6d4"
      ),
    }));
  }, [vessels]);

  const cyberIcons = useMemo(() => {
    return cyberIncidents.map(incident => ({
      id: incident.id,
      icon: createCyberIcon(incident.type, incident.severity),
    }));
  }, [cyberIncidents]);

  const counts = {
    events: events.length,
    flights: flights.length,
    vessels: vessels.length,
    weather: weatherAlerts.length,
    cyber: cyberIncidents.length,
  };

  return (
    <div className={cn("relative w-full h-full", className)} data-testid="map-container">
      <style>{`
        .aircraft-icon, .vessel-icon, .cyber-icon {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          background: hsl(var(--card));
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
        }
        .leaflet-popup-tip {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
        }
      `}</style>
      
      <MapContainer
        center={[30, 20]}
        zoom={3}
        className="w-full h-full rounded-md overflow-hidden"
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url={tileUrls[mapStyle]}
          maxZoom={18}
        />
        <MapController selectedEvent={selectedEvent} />
        
        {layers.events && events.map((event) => (
          <CircleMarker
            key={event.id}
            center={[event.location.lat, event.location.lng]}
            radius={threatSizes[event.threatLevel]}
            pathOptions={{
              color: threatColors[event.threatLevel],
              fillColor: threatColors[event.threatLevel],
              fillOpacity: 0.6,
              weight: 2,
            }}
            eventHandlers={{
              click: () => onEventSelect?.(event),
            }}
          >
            <Popup className="leaflet-popup-custom">
              <EventPopup event={event} />
            </Popup>
          </CircleMarker>
        ))}

        {layers.flights && flights.map((flight, index) => {
          const iconData = aircraftIcons.find(i => i.id === flight.id);
          if (!iconData) return null;
          
          return (
            <Marker
              key={flight.id}
              position={[flight.location.lat, flight.location.lng]}
              icon={iconData.icon}
            >
              <Popup className="leaflet-popup-custom">
                <FlightPopup flight={flight} />
              </Popup>
            </Marker>
          );
        })}

        {layers.vessels && vessels.map((vessel) => {
          const iconData = vesselIcons.find(i => i.id === vessel.id);
          if (!iconData) return null;
          
          return (
            <Marker
              key={vessel.id}
              position={[vessel.location.lat, vessel.location.lng]}
              icon={iconData.icon}
            >
              <Popup className="leaflet-popup-custom">
                <VesselPopup vessel={vessel} />
              </Popup>
            </Marker>
          );
        })}

        {layers.weather && weatherAlerts.map((alert) => {
          const color = alert.severity === "warning" ? "#ef4444" : 
                       alert.severity === "watch" ? "#f97316" : "#eab308";
          const radius = alert.severity === "warning" ? 150000 : 
                        alert.severity === "watch" ? 100000 : 75000;
          
          return (
            <Circle
              key={alert.id}
              center={[alert.location.lat, alert.location.lng]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.15,
                weight: 2,
                dashArray: "10,5",
              }}
            >
              <Popup className="leaflet-popup-custom">
                <WeatherPopup alert={alert} />
              </Popup>
            </Circle>
          );
        })}

        {layers.cyber && cyberIncidents.map((incident) => {
          const iconData = cyberIcons.find(i => i.id === incident.id);
          const impactRadius = (incident.percentageAffected / 100) * 200000 + 50000;
          
          return (
            <Circle
              key={`${incident.id}-area`}
              center={[incident.location.lat, incident.location.lng]}
              radius={impactRadius}
              pathOptions={{
                color: threatColors[incident.severity] || "#a855f7",
                fillColor: threatColors[incident.severity] || "#a855f7",
                fillOpacity: 0.2,
                weight: 2,
                dashArray: "5,5",
              }}
            >
              <Popup className="leaflet-popup-custom">
                <CyberPopup incident={incident} />
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
      
      <MapLegend layers={layers} onToggleLayer={toggleLayer} counts={counts} />
      
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="gap-1.5"
          onClick={() => setMapStyle(mapStyle === "dark" ? "satellite" : "dark")}
          data-testid="button-map-style"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="text-xs">{mapStyle === "dark" ? "Satellite" : "Dark"}</span>
        </Button>
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
        <Card className="px-3 py-1.5 bg-card/90 backdrop-blur-sm flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px]">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-foreground font-medium">{events.length}</span>
            <span className="text-muted-foreground">events</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5 text-[10px]">
            <Plane className="w-3 h-3 text-blue-500" />
            <span className="text-foreground font-medium">{flights.length}</span>
            <span className="text-muted-foreground">flights</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5 text-[10px]">
            <Ship className="w-3 h-3 text-cyan-500" />
            <span className="text-foreground font-medium">{vessels.length}</span>
            <span className="text-muted-foreground">vessels</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5 text-[10px]">
            <Cloud className="w-3 h-3 text-yellow-500" />
            <span className="text-foreground font-medium">{weatherAlerts.length}</span>
            <span className="text-muted-foreground">alerts</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
