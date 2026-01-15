import { type User, type InsertUser } from "@shared/schema";
import type {
  ConflictEvent,
  DataFeed,
  Alert,
  PredictionMarket,
  StatCard,
  ConnectionStatus,
  FlightData,
  VesselData,
  WeatherAlert,
  CyberIncident,
} from "@shared/schema";
import { OSINT_ACCOUNTS } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getEvents(): Promise<ConflictEvent[]>;
  getFeeds(): Promise<DataFeed[]>;
  getAlerts(): Promise<Alert[]>;
  getPredictions(): Promise<PredictionMarket[]>;
  getStats(): Promise<StatCard[]>;
  getConnectionStatus(): Promise<ConnectionStatus>;
  getFlights(): Promise<FlightData[]>;
  getVessels(): Promise<VesselData[]>;
  getWeatherAlerts(): Promise<WeatherAlert[]>;
  getCyberIncidents(): Promise<CyberIncident[]>;
  
  acknowledgeAlert(id: string): Promise<Alert | undefined>;
  dismissAlert(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: ConflictEvent[];
  private feeds: DataFeed[];
  private alerts: Alert[];
  private predictions: PredictionMarket[];
  private stats: StatCard[];
  private flights: FlightData[];
  private vessels: VesselData[];
  private weatherAlerts: WeatherAlert[];
  private cyberIncidents: CyberIncident[];

  constructor() {
    this.users = new Map();
    this.events = this.generateSampleEvents();
    this.feeds = this.generateSampleFeeds();
    this.alerts = this.generateSampleAlerts();
    this.predictions = this.generateSamplePredictions();
    this.stats = this.generateSampleStats();
    this.flights = this.generateSampleFlights();
    this.vessels = this.generateSampleVessels();
    this.weatherAlerts = this.generateSampleWeatherAlerts();
    this.cyberIncidents = this.generateSampleCyberIncidents();
  }

  private generateSparklineData(length: number = 12, min: number = 0, max: number = 100): number[] {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min) + min));
  }

  private generateSampleEvents(): ConflictEvent[] {
    const now = new Date();
    const events: ConflictEvent[] = [
      {
        id: randomUUID(),
        title: "Heavy shelling reported in Kharkiv Oblast",
        description: "Multiple explosions heard in northern Kharkiv region. Local authorities urge residents to seek shelter. Infrastructure damage reported in several districts.",
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
        location: { lat: 49.9935, lng: 36.2304, region: "Eastern Europe", country: "Ukraine" },
        threatLevel: "critical",
        eventType: "military",
        sourceType: "osint",
        sourceCredibility: 1,
        sourceName: "OSINT Defender",
        verified: true,
        engagementScore: 2450,
      },
      {
        id: randomUUID(),
        title: "IDF conducts targeted strikes in southern Lebanon",
        description: "Israeli Defense Forces reported precision strikes on Hezbollah infrastructure. Lebanese government condemns actions as escalation.",
        timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
        location: { lat: 33.2721, lng: 35.2033, region: "Middle East", country: "Lebanon" },
        threatLevel: "high",
        eventType: "military",
        sourceType: "government",
        sourceCredibility: 1,
        sourceName: "IDF Official",
        verified: true,
        engagementScore: 3200,
      },
      {
        id: randomUUID(),
        title: "Chinese naval vessels detected near Taiwan Strait",
        description: "Multiple PLA Navy warships conducting exercises in waters near median line. Taiwan's Ministry of Defense monitoring situation.",
        timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
        location: { lat: 24.4, lng: 119.5, region: "Asia Pacific", country: "Taiwan" },
        threatLevel: "high",
        eventType: "military",
        sourceType: "osint",
        sourceCredibility: 2,
        sourceName: "Naval Analysis",
        verified: true,
        engagementScore: 1890,
      },
      {
        id: randomUUID(),
        title: "Power infrastructure attack in Odesa region",
        description: "Drone strikes damage electrical substations. Rolling blackouts expected across western Ukraine. Emergency services responding.",
        timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(),
        location: { lat: 46.4825, lng: 30.7233, region: "Eastern Europe", country: "Ukraine" },
        threatLevel: "medium",
        eventType: "infrastructure",
        sourceType: "news",
        sourceCredibility: 1,
        sourceName: "Reuters",
        verified: true,
        engagementScore: 980,
      },
      {
        id: randomUUID(),
        title: "Humanitarian corridor established in Gaza",
        description: "Temporary ceasefire allows aid delivery to northern Gaza. UN agencies coordinating distribution of essential supplies.",
        timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(),
        location: { lat: 31.5, lng: 34.47, region: "Middle East", country: "Palestine" },
        threatLevel: "medium",
        eventType: "humanitarian",
        sourceType: "government",
        sourceCredibility: 1,
        sourceName: "UN OCHA",
        verified: true,
        engagementScore: 1560,
      },
      {
        id: randomUUID(),
        title: "Russian forces advance near Avdiivka",
        description: "Reports indicate Russian military gains in Donetsk Oblast. Ukrainian forces conducting tactical repositioning.",
        timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(),
        location: { lat: 48.1399, lng: 37.7487, region: "Eastern Europe", country: "Ukraine" },
        threatLevel: "high",
        eventType: "military",
        sourceType: "reddit",
        sourceCredibility: 2,
        sourceName: "r/UkraineWarVideoReport",
        verified: false,
        engagementScore: 2100,
      },
      {
        id: randomUUID(),
        title: "Houthi missile launch detected over Red Sea",
        description: "Anti-ship missile fired toward commercial shipping lane. US Navy destroyer successfully intercepted the threat.",
        timestamp: new Date(now.getTime() - 6 * 3600000).toISOString(),
        location: { lat: 15.5, lng: 42.5, region: "Middle East", country: "Yemen" },
        threatLevel: "critical",
        eventType: "military",
        sourceType: "government",
        sourceCredibility: 1,
        sourceName: "CENTCOM",
        verified: true,
        engagementScore: 4200,
      },
      {
        id: randomUUID(),
        title: "Internet disruption reported in Sudan",
        description: "Major connectivity issues across Khartoum and surrounding regions. NetBlocks confirms significant traffic drop.",
        timestamp: new Date(now.getTime() - 8 * 3600000).toISOString(),
        location: { lat: 15.5007, lng: 32.5599, region: "Africa", country: "Sudan" },
        threatLevel: "medium",
        eventType: "infrastructure",
        sourceType: "osint",
        sourceCredibility: 2,
        sourceName: "NetBlocks",
        verified: true,
        engagementScore: 650,
      },
      {
        id: randomUUID(),
        title: "NATO exercises begin in Baltic Sea",
        description: "Allied forces conducting planned military exercises. Finland and Sweden participating for first time as members.",
        timestamp: new Date(now.getTime() - 12 * 3600000).toISOString(),
        location: { lat: 58.5, lng: 20.0, region: "Europe", country: "Baltic Sea" },
        threatLevel: "low",
        eventType: "military",
        sourceType: "government",
        sourceCredibility: 1,
        sourceName: "NATO Press",
        verified: true,
        engagementScore: 890,
      },
      {
        id: randomUUID(),
        title: "Oil tanker transiting Strait of Hormuz reports harassment",
        description: "Commercial vessel reports close approach by Iranian naval vessels. No shots fired, situation resolved peacefully.",
        timestamp: new Date(now.getTime() - 18 * 3600000).toISOString(),
        location: { lat: 26.5, lng: 56.5, region: "Middle East", country: "Iran" },
        threatLevel: "medium",
        eventType: "economic",
        sourceType: "marine",
        sourceCredibility: 3,
        sourceName: "MarineTraffic",
        verified: false,
        engagementScore: 420,
      },
      {
        id: randomUUID(),
        title: "IRGC conducts ballistic missile test",
        description: "Iranian Revolutionary Guard Corps announces successful test of new medium-range ballistic missile. Western nations express concern.",
        timestamp: new Date(now.getTime() - 7 * 3600000).toISOString(),
        location: { lat: 35.6892, lng: 51.389, region: "Middle East", country: "Iran" },
        threatLevel: "high",
        eventType: "military",
        sourceType: "government",
        sourceCredibility: 2,
        sourceName: "IRGC Official",
        verified: true,
        engagementScore: 2800,
      },
      {
        id: randomUUID(),
        title: "North Korea launches ICBM toward Sea of Japan",
        description: "DPRK conducts ballistic missile test. Japanese government issues shelter warnings. UN Security Council emergency session called.",
        timestamp: new Date(now.getTime() - 4.5 * 3600000).toISOString(),
        location: { lat: 39.0392, lng: 125.7625, region: "Asia Pacific", country: "North Korea" },
        threatLevel: "critical",
        eventType: "military",
        sourceType: "government",
        sourceCredibility: 1,
        sourceName: "Japan MOD",
        verified: true,
        engagementScore: 5600,
      },
      {
        id: randomUUID(),
        title: "Wagner forces engage in Mali combat operations",
        description: "Russian mercenary group conducting operations alongside Malian military. Reports of significant clashes with rebel groups.",
        timestamp: new Date(now.getTime() - 9 * 3600000).toISOString(),
        location: { lat: 17.5707, lng: -3.9962, region: "Africa", country: "Mali" },
        threatLevel: "medium",
        eventType: "military",
        sourceType: "osint",
        sourceCredibility: 2,
        sourceName: "Aurora Intel",
        verified: false,
        engagementScore: 1200,
      },
      {
        id: randomUUID(),
        title: "Syrian air defense activated near Damascus",
        description: "Multiple interceptions reported over Damascus. Israeli strikes suspected but not confirmed.",
        timestamp: new Date(now.getTime() - 3.5 * 3600000).toISOString(),
        location: { lat: 33.5138, lng: 36.2765, region: "Middle East", country: "Syria" },
        threatLevel: "high",
        eventType: "military",
        sourceType: "osint",
        sourceCredibility: 2,
        sourceName: "OSINT Aggregator",
        verified: false,
        engagementScore: 1890,
      },
      {
        id: randomUUID(),
        title: "Cross-border shelling between India-Pakistan",
        description: "Artillery exchanges reported along Line of Control in Kashmir. Both nations claim defensive action.",
        timestamp: new Date(now.getTime() - 11 * 3600000).toISOString(),
        location: { lat: 34.0837, lng: 74.7973, region: "Asia Pacific", country: "India" },
        threatLevel: "high",
        eventType: "military",
        sourceType: "news",
        sourceCredibility: 1,
        sourceName: "Reuters",
        verified: true,
        engagementScore: 2300,
      },
    ];
    
    return events;
  }

  private generateSampleFeeds(): DataFeed[] {
    const now = new Date();
    const feeds: DataFeed[] = [];
    
    feeds.push(
      {
        id: randomUUID(),
        content: "New footage from Avdiivka sector shows intense urban combat. Analysis suggests defensive positions under significant pressure.",
        excerpt: "New footage from Avdiivka sector shows intense urban combat...",
        timestamp: new Date(now.getTime() - 25 * 60000).toISOString(),
        sourceType: "reddit",
        sourceName: "r/CombatFootage",
        sourceCredibility: 3,
        location: { lat: 48.14, lng: 37.75, region: "Eastern Europe", country: "Ukraine" },
        url: "https://reddit.com/r/CombatFootage",
        verified: false,
        engagementMetrics: { upvotes: 4560, comments: 312 },
      },
      {
        id: randomUUID(),
        content: "ISW latest assessment: Russian forces making incremental gains at significant cost. Ukrainian defenses holding in key sectors.",
        excerpt: "ISW latest assessment: Russian forces making incremental gains...",
        timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
        sourceType: "osint",
        sourceName: "Institute for Study of War",
        sourceCredibility: 1,
        verified: true,
        engagementMetrics: { shares: 1200 },
      },
      {
        id: randomUUID(),
        content: "Satellite imagery reveals new construction at military facility. Analysis indicates potential upgrade to air defense capabilities.",
        excerpt: "Satellite imagery reveals new construction at military facility...",
        timestamp: new Date(now.getTime() - 1.5 * 3600000).toISOString(),
        sourceType: "osint",
        sourceName: "Bellingcat",
        sourceCredibility: 1,
        location: { lat: 55.5, lng: 37.5, region: "Eastern Europe", country: "Russia" },
        verified: true,
        engagementMetrics: { upvotes: 1890, comments: 67 },
      },
      {
        id: randomUUID(),
        content: "Reuters: UN Security Council emergency session called to address escalating tensions. Multiple nations express concern.",
        excerpt: "Reuters: UN Security Council emergency session called...",
        timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
        sourceType: "news",
        sourceName: "Reuters",
        sourceCredibility: 1,
        verified: true,
        engagementMetrics: { shares: 890 },
      },
      {
        id: randomUUID(),
        content: "Flight tracking shows unusual military aircraft activity over eastern Mediterranean. Multiple tanker aircraft suggesting extended operations.",
        excerpt: "Flight tracking shows unusual military aircraft activity...",
        timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(),
        sourceType: "flight",
        sourceName: "ADS-B Exchange",
        sourceCredibility: 2,
        location: { lat: 35.0, lng: 33.0, region: "Middle East" },
        verified: true,
        engagementMetrics: { upvotes: 780 },
      },
      {
        id: randomUUID(),
        content: "Naval movements detected: Carrier strike group transiting through Suez Canal. Unusual timing suggests rapid deployment.",
        excerpt: "Naval movements detected: Carrier strike group transiting...",
        timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(),
        sourceType: "marine",
        sourceName: "VesselFinder",
        sourceCredibility: 2,
        location: { lat: 30.5, lng: 32.3, region: "Middle East", country: "Egypt" },
        verified: true,
        engagementMetrics: { upvotes: 560, comments: 45 },
      },
      {
        id: randomUUID(),
        content: "Liveuamap reports: Heavy fighting along entire Zaporizhzhia line. Multiple assault attempts repelled according to Ukrainian sources.",
        excerpt: "Liveuamap reports: Heavy fighting along entire Zaporizhzhia line...",
        timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(),
        sourceType: "osint",
        sourceName: "Liveuamap",
        sourceCredibility: 2,
        location: { lat: 47.8, lng: 35.5, region: "Eastern Europe", country: "Ukraine" },
        verified: false,
        engagementMetrics: { upvotes: 890, comments: 56 },
      },
      {
        id: randomUUID(),
        content: "CSIS analysis: Strategic implications of recent naval deployments in South China Sea. Multiple carrier groups now operating in region.",
        excerpt: "CSIS analysis: Strategic implications of recent naval deployments...",
        timestamp: new Date(now.getTime() - 6 * 3600000).toISOString(),
        sourceType: "osint",
        sourceName: "CSIS",
        sourceCredibility: 1,
        location: { lat: 15.0, lng: 115.0, region: "Asia Pacific" },
        verified: true,
        engagementMetrics: { shares: 450 },
      },
      {
        id: randomUUID(),
        content: "BBC: IAEA inspectors report unusual activity at Iranian nuclear facility. Tehran denies any violation of agreements.",
        excerpt: "BBC: IAEA inspectors report unusual activity at Iranian nuclear...",
        timestamp: new Date(now.getTime() - 7 * 3600000).toISOString(),
        sourceType: "news",
        sourceName: "BBC News",
        sourceCredibility: 1,
        location: { lat: 32.0, lng: 52.0, region: "Middle East", country: "Iran" },
        verified: true,
        engagementMetrics: { shares: 1200 },
      },
      {
        id: randomUUID(),
        content: "DeepState UA map update shows consolidation of defensive lines near Bakhmut. Frontline remains largely static.",
        excerpt: "DeepState UA map update shows consolidation of defensive lines...",
        timestamp: new Date(now.getTime() - 8 * 3600000).toISOString(),
        sourceType: "osint",
        sourceName: "DeepState UA",
        sourceCredibility: 2,
        location: { lat: 48.6, lng: 38.0, region: "Eastern Europe", country: "Ukraine" },
        verified: false,
        engagementMetrics: { upvotes: 670, comments: 89 },
      },
      {
        id: randomUUID(),
        content: "Janes Defense: New imagery shows expanded missile testing facilities in North Korea. Analysis suggests accelerated development program.",
        excerpt: "Janes Defense: New imagery shows expanded missile testing...",
        timestamp: new Date(now.getTime() - 9 * 3600000).toISOString(),
        sourceType: "osint",
        sourceName: "Janes Defense",
        sourceCredibility: 1,
        location: { lat: 40.0, lng: 127.0, region: "Asia Pacific", country: "North Korea" },
        verified: true,
        engagementMetrics: { shares: 340 },
      }
    );

    return feeds.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private generateSampleAlerts(): Alert[] {
    const now = new Date();
    return [
      {
        id: randomUUID(),
        title: "Critical: Mass casualty event reported",
        description: "Multiple sources confirming significant civilian casualties in urban area. Verification ongoing.",
        timestamp: new Date(now.getTime() - 10 * 60000).toISOString(),
        threatLevel: "critical",
        region: "Eastern Ukraine",
        eventType: "humanitarian",
        relatedEventIds: [],
        acknowledged: false,
      },
      {
        id: randomUUID(),
        title: "Escalation: Cross-border strikes detected",
        description: "Multiple missile launches detected crossing international borders. Regional escalation risk elevated.",
        timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
        threatLevel: "high",
        region: "Middle East",
        eventType: "military",
        relatedEventIds: [],
        acknowledged: false,
      },
      {
        id: randomUUID(),
        title: "Infrastructure: Major power grid failure",
        description: "Coordinated attacks on electrical infrastructure causing widespread outages across multiple regions.",
        timestamp: new Date(now.getTime() - 1 * 3600000).toISOString(),
        threatLevel: "high",
        region: "Western Ukraine",
        eventType: "infrastructure",
        relatedEventIds: [],
        acknowledged: false,
      },
      {
        id: randomUUID(),
        title: "Market Alert: Polymarket conflict odds spike",
        description: "Israel-Hezbollah war probability jumped 6% in 24h. Now at 34%. Volume $678K.",
        timestamp: new Date(now.getTime() - 1.5 * 3600000).toISOString(),
        threatLevel: "medium",
        region: "Middle East",
        eventType: "political",
        relatedEventIds: [],
        acknowledged: false,
      },
      {
        id: randomUUID(),
        title: "Prediction markets signal increased risk",
        description: "Significant probability movement detected in conflict-related prediction markets. 24h change exceeds threshold.",
        timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
        threatLevel: "medium",
        region: "Global",
        eventType: "political",
        relatedEventIds: [],
        acknowledged: true,
      },
      {
        id: randomUUID(),
        title: "Cyber: Government websites targeted",
        description: "Multiple government portals experiencing DDoS attacks. Attribution pending investigation.",
        timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(),
        threatLevel: "medium",
        region: "Baltic States",
        eventType: "cyber",
        relatedEventIds: [],
        acknowledged: true,
      },
      {
        id: randomUUID(),
        title: "Flight: Military aircraft surge detected",
        description: "Unusual concentration of reconnaissance and tanker aircraft over eastern Mediterranean.",
        timestamp: new Date(now.getTime() - 2.5 * 3600000).toISOString(),
        threatLevel: "medium",
        region: "Mediterranean",
        eventType: "military",
        relatedEventIds: [],
        acknowledged: false,
      },
    ];
  }

  private generateSamplePredictions(): PredictionMarket[] {
    return [
      {
        id: randomUUID(),
        question: "Will Russia control Kharkiv by end of 2025?",
        probability: 0.12,
        previousProbability: 0.08,
        change24h: 4.0,
        volume: 458000,
        category: "Ukraine",
        source: "polymarket",
        resolutionDate: "2025-12-31",
        sparklineData: this.generateSparklineData(24, 5, 15),
      },
      {
        id: randomUUID(),
        question: "NATO Article 5 invoked by June 2025?",
        probability: 0.05,
        previousProbability: 0.04,
        change24h: 1.0,
        volume: 892000,
        category: "NATO",
        source: "polymarket",
        resolutionDate: "2025-06-30",
        sparklineData: this.generateSparklineData(24, 2, 8),
      },
      {
        id: randomUUID(),
        question: "Major China-Taiwan military incident in 2025?",
        probability: 0.18,
        previousProbability: 0.21,
        change24h: -3.0,
        volume: 1240000,
        category: "Taiwan",
        source: "polymarket",
        resolutionDate: "2025-12-31",
        sparklineData: this.generateSparklineData(24, 15, 25),
      },
      {
        id: randomUUID(),
        question: "Israel-Hezbollah full-scale war by Q2 2025?",
        probability: 0.34,
        previousProbability: 0.28,
        change24h: 6.0,
        volume: 678000,
        category: "Middle East",
        source: "polymarket",
        resolutionDate: "2025-06-30",
        sparklineData: this.generateSparklineData(24, 25, 40),
      },
      {
        id: randomUUID(),
        question: "Iran nuclear weapon test by 2026?",
        probability: 0.15,
        previousProbability: 0.12,
        change24h: 3.0,
        volume: 890000,
        category: "Iran",
        source: "polymarket",
        resolutionDate: "2026-12-31",
        sparklineData: this.generateSparklineData(24, 10, 20),
      },
      {
        id: randomUUID(),
        question: "Oil price exceeds $100/barrel in 2025?",
        probability: 0.42,
        previousProbability: 0.45,
        change24h: -3.0,
        volume: 2100000,
        category: "Economic",
        source: "manifold",
        sparklineData: this.generateSparklineData(24, 35, 50),
      },
      {
        id: randomUUID(),
        question: "Ukraine retakes Crimea by 2026?",
        probability: 0.08,
        previousProbability: 0.09,
        change24h: -1.0,
        volume: 520000,
        category: "Ukraine",
        source: "manifold",
        resolutionDate: "2026-12-31",
        sparklineData: this.generateSparklineData(24, 5, 12),
      },
      {
        id: randomUUID(),
        question: "North Korea conducts nuclear test in 2025?",
        probability: 0.22,
        previousProbability: 0.19,
        change24h: 3.0,
        volume: 340000,
        category: "Korea",
        source: "polymarket",
        resolutionDate: "2025-12-31",
        sparklineData: this.generateSparklineData(24, 15, 28),
      },
      {
        id: randomUUID(),
        question: "Russia annexes additional Ukrainian territory in 2025?",
        probability: 0.31,
        previousProbability: 0.28,
        change24h: 3.0,
        volume: 780000,
        category: "Ukraine",
        source: "polymarket",
        resolutionDate: "2025-12-31",
        sparklineData: this.generateSparklineData(24, 25, 38),
      },
      {
        id: randomUUID(),
        question: "US military strikes Iran by June 2025?",
        probability: 0.08,
        previousProbability: 0.06,
        change24h: 2.0,
        volume: 1100000,
        category: "Iran",
        source: "polymarket",
        resolutionDate: "2025-06-30",
        sparklineData: this.generateSparklineData(24, 4, 12),
      },
    ];
  }

  private generateSampleStats(): StatCard[] {
    return [
      {
        id: "active-events",
        label: "Active Events",
        value: 127,
        previousValue: 118,
        change: 7.6,
        trend: "up",
        sparklineData: this.generateSparklineData(12, 100, 140),
      },
      {
        id: "critical-alerts",
        label: "Critical Alerts",
        value: 5,
        previousValue: 3,
        change: 66.7,
        trend: "up",
        sparklineData: this.generateSparklineData(12, 2, 7),
      },
      {
        id: "sources-active",
        label: "Active Sources",
        value: 342,
        previousValue: 328,
        change: 4.3,
        trend: "up",
        sparklineData: this.generateSparklineData(12, 300, 360),
      },
      {
        id: "flights-tracked",
        label: "Flights Tracked",
        value: 48,
        previousValue: 42,
        change: 14.3,
        trend: "up",
        sparklineData: this.generateSparklineData(12, 35, 55),
      },
      {
        id: "vessels-tracked",
        label: "Vessels Tracked",
        value: 23,
        previousValue: 19,
        change: 21.1,
        trend: "up",
        sparklineData: this.generateSparklineData(12, 15, 28),
      },
      {
        id: "regions-monitored",
        label: "Regions",
        value: 18,
        previousValue: 18,
        change: 0,
        trend: "stable",
        sparklineData: [18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18],
      },
    ];
  }

  private generateSampleFlights(): FlightData[] {
    const now = new Date();
    return [
      {
        id: randomUUID(),
        callsign: "RRR6601",
        aircraftType: "Boeing RC-135W Rivet Joint",
        category: "surveillance",
        location: { lat: 43.5, lng: 34.0, region: "Eastern Europe", country: "Black Sea" },
        altitude: 28000,
        speed: 420,
        heading: 90,
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
      },
      {
        id: randomUUID(),
        callsign: "FORTE11",
        aircraftType: "RQ-4B Global Hawk",
        category: "surveillance",
        location: { lat: 44.2, lng: 35.8, region: "Eastern Europe", country: "Black Sea" },
        altitude: 55000,
        speed: 340,
        heading: 180,
        timestamp: new Date(now.getTime() - 3 * 60000).toISOString(),
      },
      {
        id: randomUUID(),
        callsign: "LAGR223",
        aircraftType: "KC-135 Stratotanker",
        category: "tanker",
        location: { lat: 35.0, lng: 33.5, region: "Middle East", country: "Mediterranean" },
        altitude: 32000,
        speed: 450,
        heading: 270,
        timestamp: new Date(now.getTime() - 8 * 60000).toISOString(),
      },
      {
        id: randomUUID(),
        callsign: "DUKE01",
        aircraftType: "E-3A Sentry AWACS",
        category: "surveillance",
        location: { lat: 36.5, lng: 34.5, region: "Middle East", country: "Mediterranean" },
        altitude: 34000,
        speed: 380,
        heading: 45,
        timestamp: new Date(now.getTime() - 2 * 60000).toISOString(),
      },
      {
        id: randomUUID(),
        callsign: "VIPER21",
        aircraftType: "F-35A Lightning II",
        category: "military",
        location: { lat: 32.5, lng: 35.0, region: "Middle East", country: "Israel" },
        altitude: 25000,
        speed: 520,
        heading: 315,
        timestamp: new Date(now.getTime() - 1 * 60000).toISOString(),
      },
      {
        id: randomUUID(),
        callsign: "JAKE31",
        aircraftType: "P-8A Poseidon",
        category: "surveillance",
        location: { lat: 24.8, lng: 119.2, region: "Asia Pacific", country: "Taiwan Strait" },
        altitude: 28000,
        speed: 380,
        heading: 180,
        timestamp: new Date(now.getTime() - 6 * 60000).toISOString(),
      },
      {
        id: randomUUID(),
        callsign: "REDEYE6",
        aircraftType: "E-8C JSTARS",
        category: "surveillance",
        location: { lat: 49.5, lng: 35.0, region: "Eastern Europe", country: "Ukraine Border" },
        altitude: 42000,
        speed: 410,
        heading: 120,
        timestamp: new Date(now.getTime() - 4 * 60000).toISOString(),
      },
      {
        id: randomUUID(),
        callsign: "RCH401",
        aircraftType: "C-17 Globemaster III",
        category: "transport",
        location: { lat: 50.1, lng: 30.5, region: "Eastern Europe", country: "Poland" },
        altitude: 35000,
        speed: 480,
        heading: 90,
        timestamp: new Date(now.getTime() - 10 * 60000).toISOString(),
      },
    ];
  }

  private generateSampleVessels(): VesselData[] {
    const now = new Date();
    return [
      {
        id: randomUUID(),
        name: "USS Gerald R. Ford",
        vesselType: "Nimitz-class Aircraft Carrier",
        category: "carrier",
        location: { lat: 33.5, lng: 34.0, region: "Middle East", country: "Mediterranean" },
        speed: 18,
        heading: 90,
        flag: "USA",
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
      },
      {
        id: randomUUID(),
        name: "USS Carney",
        vesselType: "Arleigh Burke-class Destroyer",
        category: "warship",
        location: { lat: 14.5, lng: 42.0, region: "Middle East", country: "Red Sea" },
        speed: 22,
        heading: 180,
        flag: "USA",
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
      },
      {
        id: randomUUID(),
        name: "HMS Diamond",
        vesselType: "Type 45 Destroyer",
        category: "warship",
        location: { lat: 13.8, lng: 43.5, region: "Middle East", country: "Red Sea" },
        speed: 20,
        heading: 210,
        flag: "UK",
        timestamp: new Date(now.getTime() - 8 * 60000).toISOString(),
      },
      {
        id: randomUUID(),
        name: "Moskva Replacement",
        vesselType: "Slava-class Cruiser",
        category: "warship",
        location: { lat: 44.5, lng: 33.5, region: "Eastern Europe", country: "Black Sea" },
        speed: 15,
        heading: 270,
        flag: "Russia",
        timestamp: new Date(now.getTime() - 20 * 60000).toISOString(),
      },
      {
        id: randomUUID(),
        name: "Liaoning",
        vesselType: "Type 001 Aircraft Carrier",
        category: "carrier",
        location: { lat: 23.5, lng: 118.5, region: "Asia Pacific", country: "Taiwan Strait" },
        speed: 16,
        heading: 45,
        flag: "China",
        timestamp: new Date(now.getTime() - 12 * 60000).toISOString(),
      },
      {
        id: randomUUID(),
        name: "PACIFIC PIONEER",
        vesselType: "VLCC Tanker",
        category: "tanker",
        location: { lat: 26.2, lng: 56.8, region: "Middle East", country: "Strait of Hormuz" },
        speed: 12,
        heading: 315,
        flag: "Panama",
        timestamp: new Date(now.getTime() - 25 * 60000).toISOString(),
      },
      {
        id: randomUUID(),
        name: "INS Vikrant",
        vesselType: "Vikrant-class Aircraft Carrier",
        category: "carrier",
        location: { lat: 15.0, lng: 73.0, region: "Asia Pacific", country: "India" },
        speed: 14,
        heading: 180,
        flag: "India",
        timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
      },
    ];
  }

  private generateSampleWeatherAlerts(): WeatherAlert[] {
    const now = new Date();
    return [
      {
        id: randomUUID(),
        type: "SIGMET",
        severity: "warning",
        title: "Severe Turbulence - Eastern Mediterranean",
        description: "SIGMET ECHO 2 VALID 150600/151200 - SEVERE TURBULENCE FCST BTN FL250 AND FL400",
        laymansDescription: "Dangerous turbulence expected between 25,000 and 40,000 feet over the Eastern Mediterranean. Aircraft are advised to avoid this area or expect severe bumps.",
        location: { lat: 35.0, lng: 33.0, region: "Middle East", country: "Mediterranean" },
        validFrom: new Date(now.getTime() - 2 * 3600000).toISOString(),
        validTo: new Date(now.getTime() + 6 * 3600000).toISOString(),
        affectedAltitude: { min: 25000, max: 40000 },
        phenomena: "TURB",
      },
      {
        id: randomUUID(),
        type: "AIRMET",
        severity: "advisory",
        title: "Low Visibility - Black Sea Region",
        description: "AIRMET LIMA 1 - MOD IFR CONDS DUE TO FOG/MIST FCST",
        laymansDescription: "Fog and mist reducing visibility to below 3 miles over the Black Sea. Pilots should expect instrument flight conditions.",
        location: { lat: 43.5, lng: 34.0, region: "Eastern Europe", country: "Black Sea" },
        validFrom: new Date(now.getTime() - 1 * 3600000).toISOString(),
        validTo: new Date(now.getTime() + 4 * 3600000).toISOString(),
        phenomena: "IFR",
      },
      {
        id: randomUUID(),
        type: "SIGMET",
        severity: "warning",
        title: "Sandstorm - Persian Gulf",
        description: "SIGMET SAND 3 - DUSTSTORM OBS AND FCST MOV NE 20KT VIS BLW 1/2SM",
        laymansDescription: "Major sandstorm moving northeast at 20 knots over the Persian Gulf. Visibility near zero. All aviation operations severely impacted.",
        location: { lat: 27.0, lng: 51.0, region: "Middle East", country: "Persian Gulf" },
        validFrom: new Date(now.getTime() - 3 * 3600000).toISOString(),
        validTo: new Date(now.getTime() + 8 * 3600000).toISOString(),
        phenomena: "DS",
      },
      {
        id: randomUUID(),
        type: "METAR",
        severity: "info",
        title: "Kyiv Boryspil - Operational",
        description: "UKBB 150730Z 27008KT 9999 FEW040 08/02 Q1023",
        laymansDescription: "Kyiv airport reporting good flying conditions. Light winds from the west, excellent visibility, few clouds at 4,000 feet.",
        location: { lat: 50.345, lng: 30.894, region: "Eastern Europe", country: "Ukraine" },
        validFrom: new Date(now.getTime() - 30 * 60000).toISOString(),
        validTo: new Date(now.getTime() + 30 * 60000).toISOString(),
      },
      {
        id: randomUUID(),
        type: "PIREP",
        severity: "advisory",
        title: "Pilot Report - Icing Conditions",
        description: "UA /OV LLBG-LTFM /TM 0645 /FL280 /TP B738 /SK OVC /TA -42 /IC MOD RIME",
        laymansDescription: "Pilot flying from Tel Aviv to Istanbul reports moderate icing at 28,000 feet. Aircraft may need de-icing equipment active.",
        location: { lat: 36.0, lng: 34.5, region: "Middle East", country: "Mediterranean" },
        validFrom: new Date(now.getTime() - 1 * 3600000).toISOString(),
        validTo: new Date(now.getTime() + 2 * 3600000).toISOString(),
        affectedAltitude: { min: 26000, max: 32000 },
        phenomena: "ICE",
      },
    ];
  }

  private generateSampleCyberIncidents(): CyberIncident[] {
    const now = new Date();
    return [
      {
        id: randomUUID(),
        type: "internet_outage",
        severity: "high",
        title: "Major Internet Outage - Eastern Ukraine",
        description: "Widespread connectivity loss across Kharkiv and Donetsk regions. Multiple ISPs affected. Suspected infrastructure damage.",
        location: { lat: 49.0, lng: 37.0, region: "Eastern Europe", country: "Ukraine" },
        affectedServices: ["Kyivstar", "Vodafone UA", "Lifecell"],
        percentageAffected: 72,
        timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
        restorationEta: new Date(now.getTime() + 6 * 3600000).toISOString(),
        source: "NetBlocks",
      },
      {
        id: randomUUID(),
        type: "power_grid",
        severity: "critical",
        title: "Power Grid Attack - Odesa Oblast",
        description: "Coordinated strikes on electrical infrastructure. Multiple substations damaged. Rolling blackouts in effect.",
        location: { lat: 46.5, lng: 30.7, region: "Eastern Europe", country: "Ukraine" },
        affectedServices: ["Ukrenergo", "Regional Distribution"],
        percentageAffected: 45,
        timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(),
        restorationEta: new Date(now.getTime() + 12 * 3600000).toISOString(),
        source: "Ukrenergo Official",
      },
      {
        id: randomUUID(),
        type: "ddos",
        severity: "medium",
        title: "DDoS Attack - Baltic Government Sites",
        description: "Multiple government portals in Estonia, Latvia, and Lithuania experiencing service degradation.",
        location: { lat: 56.9, lng: 24.1, region: "Europe", country: "Baltic States" },
        affectedServices: ["Gov.ee", "Latvija.lv", "Lrv.lt"],
        percentageAffected: 35,
        timestamp: new Date(now.getTime() - 6 * 3600000).toISOString(),
        source: "CloudFlare",
      },
      {
        id: randomUUID(),
        type: "comms_disruption",
        severity: "medium",
        title: "GPS Jamming Detected - Baltic Sea",
        description: "Navigation disruption affecting aircraft and vessels in Baltic Sea region. Suspected electronic warfare activity.",
        location: { lat: 57.0, lng: 20.0, region: "Europe", country: "Baltic Sea" },
        affectedServices: ["GPS", "GLONASS"],
        percentageAffected: 25,
        timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(),
        source: "EASA",
      },
      {
        id: randomUUID(),
        type: "internet_outage",
        severity: "high",
        title: "Connectivity Drop - Sudan",
        description: "Nationwide internet throttling detected. Social media platforms specifically targeted.",
        location: { lat: 15.5, lng: 32.5, region: "Africa", country: "Sudan" },
        affectedServices: ["Sudatel", "MTN Sudan", "Zain Sudan"],
        percentageAffected: 85,
        timestamp: new Date(now.getTime() - 8 * 3600000).toISOString(),
        source: "NetBlocks",
      },
      {
        id: randomUUID(),
        type: "ransomware",
        severity: "medium",
        title: "Hospital Systems Targeted - EU",
        description: "Multiple healthcare facilities report ransomware infections. Patient data potentially compromised.",
        location: { lat: 48.8, lng: 2.3, region: "Europe", country: "France" },
        affectedServices: ["Hospital IT Systems", "Patient Records"],
        percentageAffected: 15,
        timestamp: new Date(now.getTime() - 12 * 3600000).toISOString(),
        source: "ANSSI",
      },
    ];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getEvents(): Promise<ConflictEvent[]> {
    return this.events;
  }

  async getFeeds(): Promise<DataFeed[]> {
    return this.feeds;
  }

  async getAlerts(): Promise<Alert[]> {
    return this.alerts;
  }

  async getPredictions(): Promise<PredictionMarket[]> {
    return this.predictions;
  }

  async getStats(): Promise<StatCard[]> {
    return this.stats;
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    return {
      connected: true,
      lastUpdate: new Date().toISOString(),
      latency: Math.floor(Math.random() * 100) + 20,
    };
  }

  async getFlights(): Promise<FlightData[]> {
    return this.flights;
  }

  async getVessels(): Promise<VesselData[]> {
    return this.vessels;
  }

  async getWeatherAlerts(): Promise<WeatherAlert[]> {
    return this.weatherAlerts;
  }

  async getCyberIncidents(): Promise<CyberIncident[]> {
    return this.cyberIncidents;
  }

  async acknowledgeAlert(id: string): Promise<Alert | undefined> {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.acknowledged = true;
    }
    return alert;
  }

  async dismissAlert(id: string): Promise<boolean> {
    const index = this.alerts.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.alerts.splice(index, 1);
      return true;
    }
    return false;
  }
}

export const storage = new MemStorage();
