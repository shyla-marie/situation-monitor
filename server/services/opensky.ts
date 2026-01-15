import type { FlightData } from "@shared/schema";

const OPENSKY_API_BASE = "https://opensky-network.org/api";

interface OpenSkyResponse {
  time: number;
  states: (string | number | boolean | null)[][] | null;
}

const MILITARY_CALLSIGN_PREFIXES = [
  "RRR", "FORTE", "LAGR", "DUKE", "VIPER", "JAKE", "REDEYE", "RCH",
  "REACH", "NCHO", "SPAR", "SAM", "NAVY", "USAF", "RAF", "GAF",
  "IAF", "PLN", "CHAOS", "OMNI", "EVAC", "JUDGE", "HOMER", "EVIL",
  "DOOM", "BATT", "BOXER", "CODY", "COBRA", "DARK", "DEMON", "EAGLE",
  "GIANT", "HAWK", "IRON", "LANCE", "MAGMA", "NIGHT", "ORCA", "PANTH",
  "QUID", "RAZOR", "SLAM", "SWORD", "TIGER", "VENOM", "WOLF", "ZERO",
  "MMF", "RFF", "IAM", "CNV", "CFC", "AIO"
];

const MILITARY_COUNTRIES = [
  "United States", "Russia", "China", "United Kingdom", "France",
  "Germany", "Israel", "Ukraine", "Poland", "Turkey", "Japan",
  "South Korea", "Australia", "Canada", "Italy", "Spain", "Netherlands",
  "Belgium", "Norway", "Sweden", "Finland", "Romania", "Greece"
];

const SURVEILLANCE_AIRCRAFT_TYPES: Record<string, string> = {
  "RRR": "Boeing RC-135 Rivet Joint",
  "FORTE": "RQ-4B Global Hawk",
  "LAGR": "KC-135 Stratotanker",
  "DUKE": "E-3 Sentry AWACS",
  "JAKE": "P-8A Poseidon",
  "REDEYE": "E-8C JSTARS",
  "RCH": "C-17 Globemaster III",
  "REACH": "C-17 Globemaster III",
  "HOMER": "KC-10 Extender",
  "NCHO": "E-6B Mercury",
};

function isMilitaryCallsign(callsign: string): boolean {
  if (!callsign) return false;
  return MILITARY_CALLSIGN_PREFIXES.some(p => callsign.toUpperCase().startsWith(p));
}

function isInterestingAircraft(callsign: string, country: string, altitude: number): boolean {
  if (!callsign) return false;
  
  if (isMilitaryCallsign(callsign)) return true;
  
  if (MILITARY_COUNTRIES.includes(country)) {
    if (callsign.match(/^[A-Z]{2,4}\d{2,4}$/)) return true;
    if (altitude > 35000) return true;
  }
  
  if (callsign.startsWith("N") && callsign.length <= 6) {
    if (altitude > 40000) return true;
  }
  
  return false;
}

function getAircraftCategory(callsign: string, country: string): "military" | "surveillance" | "tanker" | "transport" | "government" | "civil" | "fighter" | "bomber" | "helicopter" | "drone" {
  if (!callsign) return "civil";
  const upper = callsign.toUpperCase();
  
  if (upper.startsWith("FORTE") || upper.match(/^(RQ|MQ)/)) return "drone";
  if (upper.startsWith("RRR") || upper.startsWith("JAKE") || upper.startsWith("REDEYE") || upper.startsWith("DUKE") || upper.startsWith("NCHO")) {
    return "surveillance";
  }
  if (upper.startsWith("LAGR") || upper.startsWith("HOMER") || upper.startsWith("SHELL") || upper.startsWith("TEXAN")) {
    return "tanker";
  }
  if (upper.startsWith("RCH") || upper.startsWith("REACH") || upper.startsWith("GIANT")) {
    return "transport";
  }
  if (upper.startsWith("SAM") || upper.startsWith("EXEC") || upper.startsWith("AF1") || upper.startsWith("AF2")) {
    return "government";
  }
  if (upper.startsWith("VIPER") || upper.startsWith("EAGLE") || upper.startsWith("COBRA") || upper.startsWith("DEMON")) {
    return "fighter";
  }
  if (upper.startsWith("DOOM") || upper.startsWith("DARK") || upper.startsWith("NIGHT")) {
    return "bomber";
  }
  
  if (MILITARY_COUNTRIES.includes(country) && isMilitaryCallsign(upper)) {
    return "military";
  }
  
  return "civil";
}

function getAircraftType(callsign: string, category: string): string {
  if (!callsign) return "Unknown Aircraft";
  const upper = callsign.toUpperCase();
  
  for (const [prefix, type] of Object.entries(SURVEILLANCE_AIRCRAFT_TYPES)) {
    if (upper.startsWith(prefix)) {
      return type;
    }
  }
  
  const typeMap: Record<string, string> = {
    "surveillance": "Reconnaissance Aircraft",
    "tanker": "Aerial Refueling Tanker",
    "transport": "Military Transport",
    "government": "Government VIP Aircraft",
    "fighter": "Fighter Aircraft",
    "bomber": "Strategic Bomber",
    "helicopter": "Military Helicopter",
    "drone": "Unmanned Aerial Vehicle",
    "military": "Military Aircraft",
  };
  
  return typeMap[category] || "Aircraft";
}

function getRegion(lat: number, lng: number): { region: string; country: string } {
  if (lat >= 35 && lat <= 55 && lng >= 25 && lng <= 45) {
    return { region: "Eastern Europe", country: "Black Sea Region" };
  }
  if (lat >= 30 && lat <= 40 && lng >= 30 && lng <= 40) {
    return { region: "Middle East", country: "Eastern Mediterranean" };
  }
  if (lat >= 28 && lat <= 35 && lng >= 32 && lng <= 37) {
    return { region: "Middle East", country: "Israel/Lebanon" };
  }
  if (lat >= 20 && lat <= 30 && lng >= 115 && lng <= 130) {
    return { region: "Asia Pacific", country: "Taiwan Strait" };
  }
  if (lat >= 10 && lat <= 20 && lng >= 40 && lng <= 55) {
    return { region: "Middle East", country: "Red Sea/Yemen" };
  }
  if (lat >= 50 && lat <= 70 && lng >= 15 && lng <= 35) {
    return { region: "Europe", country: "Baltic/Nordic Region" };
  }
  if (lat >= 35 && lat <= 45 && lng >= -10 && lng <= 5) {
    return { region: "Europe", country: "Western Europe" };
  }
  if (lat >= 30 && lat <= 50 && lng >= -130 && lng <= -60) {
    return { region: "North America", country: "Continental US" };
  }
  if (lat >= 32 && lat <= 42 && lng >= 125 && lng <= 145) {
    return { region: "Asia Pacific", country: "Japan/Korea" };
  }
  return { region: "Global", country: "International Airspace" };
}

const HOTSPOT_REGIONS = [
  { name: "Ukraine/Black Sea", lamin: 40, lamax: 52, lomin: 25, lomax: 42 },
  { name: "Eastern Mediterranean", lamin: 30, lamax: 40, lomin: 28, lomax: 40 },
  { name: "Israel/Lebanon", lamin: 28, lamax: 36, lomin: 32, lomax: 38 },
  { name: "Taiwan Strait", lamin: 20, lamax: 30, lomin: 115, lomax: 128 },
  { name: "Red Sea", lamin: 10, lamax: 22, lomin: 38, lomax: 55 },
  { name: "Baltic Region", lamin: 52, lamax: 66, lomin: 10, lomax: 32 },
  { name: "Persian Gulf", lamin: 22, lamax: 32, lomin: 45, lomax: 60 },
  { name: "Korea Peninsula", lamin: 33, lamax: 43, lomin: 123, lomax: 132 },
  { name: "Central Europe", lamin: 45, lamax: 55, lomin: 5, lomax: 25 },
];

async function fetchFlightsFromRegion(box: { lamin: number; lamax: number; lomin: number; lomax: number }): Promise<OpenSkyResponse | null> {
  try {
    const url = `${OPENSKY_API_BASE}/states/all?lamin=${box.lamin}&lamax=${box.lamax}&lomin=${box.lomin}&lomax=${box.lomax}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 429) {
        console.log("OpenSky rate limited");
        return null;
      }
      return null;
    }
    
    return await response.json();
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log("OpenSky request timed out");
    }
    return null;
  }
}

export async function fetchOpenSkyFlights(): Promise<FlightData[]> {
  const allFlights: FlightData[] = [];
  const seenIcao = new Set<string>();
  const now = new Date();

  for (const box of HOTSPOT_REGIONS) {
    try {
      const data = await fetchFlightsFromRegion(box);
      
      if (!data?.states) continue;

      for (const state of data.states) {
        const icao24 = state[0] as string;
        if (seenIcao.has(icao24)) continue;
        
        const callsign = (state[1] as string)?.trim() || "";
        const originCountry = state[2] as string;
        const lat = state[6] as number | null;
        const lng = state[5] as number | null;
        const altitude = state[7] as number | null;
        const velocity = state[9] as number | null;
        const heading = state[10] as number | null;
        const onGround = state[8] as boolean;

        if (!lat || !lng || onGround) continue;
        
        const altitudeFt = Math.round((altitude || 0) * 3.28084);
        
        if (!isInterestingAircraft(callsign, originCountry, altitudeFt) && 
            !MILITARY_COUNTRIES.includes(originCountry)) {
          continue;
        }

        seenIcao.add(icao24);
        
        const category = getAircraftCategory(callsign, originCountry);
        if (category === "civil" && !isMilitaryCallsign(callsign)) continue;
        
        const { region, country } = getRegion(lat, lng);

        allFlights.push({
          id: `opensky-${icao24}`,
          callsign: callsign || icao24.toUpperCase(),
          aircraftType: getAircraftType(callsign, category),
          category: category as FlightData["category"],
          location: {
            lat,
            lng,
            region,
            country,
          },
          altitude: altitudeFt,
          speed: Math.round((velocity || 0) * 1.944),
          heading: Math.round(heading || 0),
          timestamp: now.toISOString(),
        });
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Error fetching flights from ${box.name}:`, error);
    }
  }

  return allFlights;
}

let cachedFlights: FlightData[] = [];
let lastFlightFetch = 0;
const FLIGHT_CACHE_DURATION = 30000;

export async function getOpenSkyFlights(): Promise<FlightData[]> {
  const now = Date.now();
  
  if (cachedFlights.length > 0 && now - lastFlightFetch < FLIGHT_CACHE_DURATION) {
    return cachedFlights;
  }

  const flights = await fetchOpenSkyFlights();
  
  if (flights.length > 0) {
    cachedFlights = flights;
    lastFlightFetch = now;
  }

  return cachedFlights.length > 0 ? cachedFlights : getDefaultFlights();
}

function getDefaultFlights(): FlightData[] {
  const now = new Date();
  return [
    {
      id: "sample-rj-1",
      callsign: "RRR6601",
      aircraftType: "Boeing RC-135W Rivet Joint",
      category: "surveillance",
      location: { lat: 43.5, lng: 34, region: "Eastern Europe", country: "Black Sea" },
      altitude: 28000,
      speed: 420,
      heading: 90,
      timestamp: now.toISOString(),
    },
    {
      id: "sample-gh-1",
      callsign: "FORTE11",
      aircraftType: "RQ-4B Global Hawk",
      category: "surveillance",
      location: { lat: 44.2, lng: 35.8, region: "Eastern Europe", country: "Black Sea" },
      altitude: 55000,
      speed: 340,
      heading: 180,
      timestamp: now.toISOString(),
    },
    {
      id: "sample-kc-1",
      callsign: "LAGR135",
      aircraftType: "KC-135 Stratotanker",
      category: "tanker",
      location: { lat: 50.5, lng: 25.3, region: "Eastern Europe", country: "Poland" },
      altitude: 28000,
      speed: 380,
      heading: 270,
      timestamp: now.toISOString(),
    },
    {
      id: "sample-awacs-1",
      callsign: "DUKE01",
      aircraftType: "E-3 Sentry AWACS",
      category: "surveillance",
      location: { lat: 54.2, lng: 18.5, region: "Europe", country: "Baltic Region" },
      altitude: 32000,
      speed: 360,
      heading: 45,
      timestamp: now.toISOString(),
    },
    {
      id: "sample-c17-1",
      callsign: "RCH421",
      aircraftType: "C-17 Globemaster III",
      category: "transport",
      location: { lat: 49.8, lng: 24.2, region: "Eastern Europe", country: "Western Ukraine" },
      altitude: 35000,
      speed: 450,
      heading: 120,
      timestamp: now.toISOString(),
    },
    {
      id: "sample-p8-1",
      callsign: "JAKE15",
      aircraftType: "P-8A Poseidon",
      category: "surveillance",
      location: { lat: 33.5, lng: 34.8, region: "Middle East", country: "Eastern Mediterranean" },
      altitude: 25000,
      speed: 380,
      heading: 220,
      timestamp: now.toISOString(),
    },
    {
      id: "sample-f16-1",
      callsign: "VIPER21",
      aircraftType: "F-16 Fighting Falcon",
      category: "military",
      location: { lat: 51.2, lng: 21.5, region: "Eastern Europe", country: "Poland" },
      altitude: 38000,
      speed: 520,
      heading: 85,
      timestamp: now.toISOString(),
    },
    {
      id: "sample-mq9-1",
      callsign: "REAPER01",
      aircraftType: "MQ-9 Reaper",
      category: "surveillance",
      location: { lat: 15.2, lng: 45.5, region: "Middle East", country: "Red Sea/Yemen" },
      altitude: 22000,
      speed: 180,
      heading: 140,
      timestamp: now.toISOString(),
    },
  ];
}
