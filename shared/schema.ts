import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type ThreatLevel = "critical" | "high" | "medium" | "low" | "minimal";
export type SourceCredibility = 1 | 2 | 3 | 4 | 5;
export type EventType = "military" | "political" | "humanitarian" | "infrastructure" | "economic" | "cyber";
export type SourceType = "reddit" | "twitter" | "osint" | "news" | "government" | "prediction_market" | "flight" | "marine";

export interface GeoLocation {
  lat: number;
  lng: number;
  region?: string;
  country?: string;
}

export interface ConflictEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  location: GeoLocation;
  threatLevel: ThreatLevel;
  eventType: EventType;
  sourceType: SourceType;
  sourceCredibility: SourceCredibility;
  sourceUrl?: string;
  sourceName: string;
  verified: boolean;
  engagementScore?: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  threatLevel: ThreatLevel;
  region: string;
  eventType: EventType;
  relatedEventIds: string[];
  acknowledged: boolean;
}

export interface PredictionMarket {
  id: string;
  question: string;
  probability: number;
  previousProbability: number;
  change24h: number;
  volume: number;
  category: string;
  source: "polymarket" | "manifold";
  resolutionDate?: string;
  sparklineData: number[];
}

export interface DataFeed {
  id: string;
  content: string;
  excerpt: string;
  timestamp: string;
  sourceType: SourceType;
  sourceName: string;
  sourceCredibility: SourceCredibility;
  location?: GeoLocation;
  url?: string;
  engagementMetrics?: {
    upvotes?: number;
    comments?: number;
    shares?: number;
  };
  verified: boolean;
}

export interface StatCard {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  change: number;
  unit?: string;
  trend: "up" | "down" | "stable";
  sparklineData: number[];
}

export interface FlightData {
  id: string;
  callsign: string;
  aircraftType: string;
  category: "military" | "government" | "surveillance" | "tanker" | "transport" | "civil" | "fighter" | "bomber" | "helicopter" | "drone";
  location: GeoLocation;
  altitude: number;
  speed: number;
  heading: number;
  timestamp: string;
}

export interface VesselData {
  id: string;
  name: string;
  vesselType: string;
  category: "warship" | "carrier" | "submarine" | "tanker" | "cargo" | "patrol";
  location: GeoLocation;
  speed: number;
  heading: number;
  flag: string;
  timestamp: string;
}

export interface ConnectionStatus {
  connected: boolean;
  lastUpdate: string;
  latency: number;
}

export interface FilterState {
  threatLevels: ThreatLevel[];
  eventTypes: EventType[];
  sourceTypes: SourceType[];
  timeRange: "1h" | "6h" | "24h" | "7d" | "30d";
  regions: string[];
  credibilityMin: SourceCredibility;
  searchQuery: string;
}

export type DataCategory = "events" | "feeds" | "alerts" | "predictions" | "flights" | "vessels" | "weather" | "cyber";

export interface WeatherAlert {
  id: string;
  type: "SIGMET" | "AIRMET" | "METAR" | "TAF" | "PIREP";
  severity: "warning" | "watch" | "advisory" | "info";
  title: string;
  description: string;
  laymansDescription: string;
  location: GeoLocation;
  validFrom: string;
  validTo: string;
  affectedAltitude?: { min: number; max: number };
  phenomena?: string;
}

export interface CyberIncident {
  id: string;
  type: "internet_outage" | "power_grid" | "comms_disruption" | "ddos" | "ransomware";
  severity: ThreatLevel;
  title: string;
  description: string;
  location: GeoLocation;
  affectedServices: string[];
  percentageAffected: number;
  timestamp: string;
  restorationEta?: string;
  source: string;
}

export interface RadioFrequency {
  id: string;
  frequency: string;
  type: "military" | "emergency" | "aviation" | "maritime" | "government";
  activity: "active" | "encrypted" | "jamming" | "normal";
  location?: GeoLocation;
  timestamp: string;
  notes?: string;
}

export const REGION_PRESETS: Record<string, { name: string; keywords: string[]; bbox: { lat: [number, number]; lng: [number, number] } }> = {
  ukraine: {
    name: "Ukraine",
    keywords: ["ukraine", "kyiv", "kharkiv", "odesa", "donbas", "crimea", "zaporizhzhia", "dnipro", "mariupol"],
    bbox: { lat: [44, 53], lng: [22, 40] }
  },
  israel: {
    name: "Israel/Palestine",
    keywords: ["israel", "gaza", "west bank", "tel aviv", "jerusalem", "hezbollah", "hamas", "idf", "palestinian"],
    bbox: { lat: [29, 34], lng: [34, 36] }
  },
  iran: {
    name: "Iran",
    keywords: ["iran", "tehran", "irgc", "persian gulf", "strait of hormuz", "iranian"],
    bbox: { lat: [25, 40], lng: [44, 64] }
  },
  taiwan: {
    name: "Taiwan Strait",
    keywords: ["taiwan", "china", "pla", "taipei", "strait", "south china sea"],
    bbox: { lat: [21, 26], lng: [117, 123] }
  },
  redSea: {
    name: "Red Sea/Yemen",
    keywords: ["yemen", "houthi", "red sea", "aden", "bab el-mandeb", "suez"],
    bbox: { lat: [12, 30], lng: [32, 50] }
  },
  russia: {
    name: "Russia",
    keywords: ["russia", "moscow", "russian", "kremlin", "putin"],
    bbox: { lat: [41, 82], lng: [19, 180] }
  },
  baltics: {
    name: "Baltic States",
    keywords: ["estonia", "latvia", "lithuania", "baltic", "nato", "kaliningrad"],
    bbox: { lat: [53, 60], lng: [19, 29] }
  },
  middleEast: {
    name: "Middle East",
    keywords: ["syria", "iraq", "lebanon", "jordan", "saudi", "qatar", "uae", "bahrain", "kuwait"],
    bbox: { lat: [12, 42], lng: [25, 65] }
  },
  africa: {
    name: "Africa (Sahel)",
    keywords: ["sudan", "ethiopia", "somalia", "sahel", "mali", "niger", "chad", "libya", "wagner"],
    bbox: { lat: [-5, 35], lng: [-20, 55] }
  },
  korea: {
    name: "Korean Peninsula",
    keywords: ["north korea", "south korea", "dprk", "pyongyang", "seoul", "kim jong"],
    bbox: { lat: [33, 43], lng: [124, 132] }
  }
};

export const OSINT_ACCOUNTS = [
  { handle: "@OSINTdefender", name: "OSINT Defender", credibility: 1 },
  { handle: "@Faytuks", name: "Faytuks", credibility: 2 },
  { handle: "@Currentreport1", name: "Current Report", credibility: 2 },
  { handle: "@SchizoIntel", name: "Schizo Intel", credibility: 3 },
  { handle: "@MarioNawfal", name: "Mario Nawfal", credibility: 2 },
  { handle: "@JohnnyNash77", name: "Johnny Nash", credibility: 2 },
  { handle: "@Osint613", name: "OSINT 613", credibility: 2 },
  { handle: "@GeoConfirmed", name: "GeoConfirmed", credibility: 1 },
  { handle: "@Nrg8000", name: "NRG 8000", credibility: 2 },
  { handle: "@AuroraIntel", name: "Aurora Intel", credibility: 1 },
  { handle: "@IntelCrab", name: "Intel Crab", credibility: 1 },
  { handle: "@War_Mapper", name: "War Mapper", credibility: 1 },
  { handle: "@Biz_Ukraine_Mag", name: "Business Ukraine", credibility: 2 },
  { handle: "@Ukraine_ONL", name: "Ukraine Online", credibility: 2 },
  { handle: "@Flash43191300", name: "Flash", credibility: 2 },
  { handle: "@NoahMNY", name: "Noah", credibility: 3 },
  { handle: "@sentdefender", name: "Sentinel Defender", credibility: 1 },
  { handle: "@wartranslated", name: "War Translated", credibility: 1 },
] as const;
