import type { WeatherAlert } from "@shared/schema";

const AVIATION_WEATHER_API = "https://aviationweather.gov/api/data";

interface SigmetRaw {
  airSigmetId: number;
  icaoId: string;
  alphaChar: string;
  hazard: string;
  severity: string;
  validTimeFrom: string;
  validTimeTo: string;
  rawAirSigmet: string;
  altLow?: number;
  altHigh?: number;
  coords?: string;
}

interface PirepRaw {
  pirepId: number;
  obsTime: string;
  icaoId: string;
  lat: number;
  lon: number;
  altFt: number;
  wxString?: string;
  turbType?: string;
  turbInten?: string;
}

const HAZARD_MAP: Record<string, string> = {
  "TS": "Thunderstorm",
  "TURB": "Turbulence",
  "ICE": "Icing",
  "MTN OBSCN": "Mountain Obscuration",
  "IFR": "Instrument Flight Rules",
  "LLWS": "Low Level Wind Shear",
  "ASH": "Volcanic Ash",
  "SFC WND": "Surface Winds",
  "CONVECTIVE": "Convective Activity",
};

const SEVERITY_MAP: Record<string, "warning" | "watch" | "advisory" | "info"> = {
  "SEV": "warning",
  "MOD": "watch",
  "LGT": "advisory",
};

function getLaymansDescription(hazard: string, severity: string): string {
  const hazardLower = hazard.toLowerCase();
  
  if (hazardLower.includes("ts") || hazardLower.includes("convective")) {
    return "Severe thunderstorms in the area. Expect turbulence, lightning, and potential hail. Aircraft should avoid this region.";
  }
  if (hazardLower.includes("turb")) {
    if (severity === "SEV") {
      return "Extremely rough air. Flights may experience violent shaking. Secure all loose items and fasten seatbelts.";
    }
    return "Bumpy conditions expected. Minor discomfort for passengers but safe for operations.";
  }
  if (hazardLower.includes("ice")) {
    return "Freezing conditions that can cause ice buildup on aircraft. Anti-icing systems required for flight through this area.";
  }
  if (hazardLower.includes("ash")) {
    return "Volcanic ash detected in atmosphere. Extremely hazardous to aircraft engines. All flights should avoid this area.";
  }
  if (hazardLower.includes("sfc wnd") || hazardLower.includes("wind")) {
    return "Strong surface winds making takeoffs and landings challenging. Crosswind limits may apply.";
  }
  return "Aviation hazard reported in this area. Pilots should exercise caution and check current NOTAMs.";
}

function parseCoordinates(coords: string): { lat: number; lng: number } | null {
  if (!coords) return null;
  
  const matches = coords.match(/(\d+\.?\d*)[NS]\s*(\d+\.?\d*)[EW]/i);
  if (matches) {
    let lat = parseFloat(matches[1]);
    let lng = parseFloat(matches[2]);
    if (coords.includes("S")) lat = -lat;
    if (coords.includes("W")) lng = -lng;
    return { lat, lng };
  }
  
  return null;
}

export async function fetchAviationWeather(): Promise<WeatherAlert[]> {
  try {
    const response = await fetch(
      `${AVIATION_WEATHER_API}/sigmet?format=json&type=sigmet&hazard=convective,turb,ice,ash`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`Aviation weather API error: ${response.status}`);
      return getDefaultWeatherAlerts();
    }

    const data: SigmetRaw[] = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return getDefaultWeatherAlerts();
    }

    const alerts: WeatherAlert[] = data.slice(0, 10).map(sigmet => {
      const coords = parseCoordinates(sigmet.coords || "") || getRegionalCenter(sigmet.icaoId);
      const hazardName = HAZARD_MAP[sigmet.hazard] || sigmet.hazard || "Weather Hazard";
      const severity = SEVERITY_MAP[sigmet.severity] || "advisory";

      return {
        id: `sigmet-${sigmet.airSigmetId}`,
        type: "SIGMET" as const,
        title: `${hazardName} - ${sigmet.icaoId}`,
        description: sigmet.rawAirSigmet?.substring(0, 200) || "Aviation weather alert",
        laymansDescription: getLaymansDescription(sigmet.hazard || "", sigmet.severity || ""),
        severity,
        location: {
          lat: coords.lat,
          lng: coords.lng,
          region: getRegionFromIcao(sigmet.icaoId),
        },
        affectedAltitude: sigmet.altLow && sigmet.altHigh ? {
          min: sigmet.altLow * 100,
          max: sigmet.altHigh * 100,
        } : undefined,
        validFrom: sigmet.validTimeFrom,
        validTo: sigmet.validTimeTo,
      };
    });

    return alerts;
  } catch (error) {
    console.error("Failed to fetch aviation weather:", error);
    return getDefaultWeatherAlerts();
  }
}

function getRegionalCenter(icaoId: string): { lat: number; lng: number } {
  const regions: Record<string, { lat: number; lng: number }> = {
    "K": { lat: 40, lng: -100 },
    "E": { lat: 50, lng: 10 },
    "L": { lat: 45, lng: 10 },
    "U": { lat: 55, lng: 40 },
    "O": { lat: 30, lng: 45 },
    "Z": { lat: 35, lng: 120 },
  };
  
  const prefix = icaoId.charAt(0).toUpperCase();
  return regions[prefix] || { lat: 40, lng: 0 };
}

function getRegionFromIcao(icaoId: string): string {
  const prefix = icaoId.charAt(0).toUpperCase();
  const regions: Record<string, string> = {
    "K": "North America",
    "E": "Northern Europe",
    "L": "Southern Europe",
    "U": "Eastern Europe",
    "O": "Middle East",
    "Z": "Asia Pacific",
    "V": "South Asia",
  };
  return regions[prefix] || "Global";
}

let cachedWeather: WeatherAlert[] = [];
let lastWeatherFetch = 0;
const WEATHER_CACHE_DURATION = 300000;

export async function getAviationWeather(): Promise<WeatherAlert[]> {
  const now = Date.now();
  
  if (cachedWeather.length > 0 && now - lastWeatherFetch < WEATHER_CACHE_DURATION) {
    return cachedWeather;
  }

  const weather = await fetchAviationWeather();
  
  if (weather.length > 0) {
    cachedWeather = weather;
    lastWeatherFetch = now;
  }

  return cachedWeather.length > 0 ? cachedWeather : getDefaultWeatherAlerts();
}

function getDefaultWeatherAlerts(): WeatherAlert[] {
  const now = new Date();
  return [
    {
      id: "default-wx-1",
      type: "SIGMET",
      title: "Convective Activity - Eastern Mediterranean",
      description: "SIGMET CHARLIE 3 - Convective activity observed over eastern Mediterranean",
      laymansDescription: "Thunderstorm activity in the region. Expect turbulence and lightning. Commercial flights are routing around this area.",
      severity: "watch",
      location: { lat: 35, lng: 33, region: "Middle East" },
      affectedAltitude: { min: 25000, max: 45000 },
      validFrom: now.toISOString(),
      validTo: new Date(now.getTime() + 6 * 3600000).toISOString(),
    },
    {
      id: "default-wx-2",
      type: "AIRMET",
      title: "Moderate Turbulence - Black Sea Region",
      description: "AIRMET TANGO - Moderate turbulence between FL250 and FL350",
      laymansDescription: "Bumpy conditions for aircraft flying through this region. Seatbelts recommended for passengers.",
      severity: "advisory",
      location: { lat: 43, lng: 35, region: "Eastern Europe" },
      affectedAltitude: { min: 25000, max: 35000 },
      validFrom: now.toISOString(),
      validTo: new Date(now.getTime() + 4 * 3600000).toISOString(),
    },
  ];
}
