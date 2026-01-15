import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getPolymarketPredictions } from "./services/polymarket";
import { getOpenSkyFlights } from "./services/opensky";
import { getAviationWeather } from "./services/weather";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/feeds", async (req, res) => {
    try {
      const feeds = await storage.getFeeds();
      res.json(feeds);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feeds" });
    }
  });

  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.get("/api/predictions", async (req, res) => {
    try {
      const predictions = await getPolymarketPredictions();
      if (predictions.length > 0) {
        res.json(predictions);
      } else {
        const fallbackPredictions = await storage.getPredictions();
        res.json(fallbackPredictions);
      }
    } catch (error) {
      console.error("Polymarket API error, using fallback:", error);
      const fallbackPredictions = await storage.getPredictions();
      res.json(fallbackPredictions);
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/status", async (req, res) => {
    try {
      const status = await storage.getConnectionStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch connection status" });
    }
  });

  app.get("/api/flights", async (req, res) => {
    try {
      const flights = await getOpenSkyFlights();
      if (flights.length > 0) {
        res.json(flights);
      } else {
        const fallbackFlights = await storage.getFlights();
        res.json(fallbackFlights);
      }
    } catch (error) {
      console.error("OpenSky API error, using fallback:", error);
      const fallbackFlights = await storage.getFlights();
      res.json(fallbackFlights);
    }
  });

  app.get("/api/vessels", async (req, res) => {
    try {
      const vessels = await storage.getVessels();
      res.json(vessels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vessels" });
    }
  });

  app.get("/api/weather", async (req, res) => {
    try {
      const weatherAlerts = await getAviationWeather();
      if (weatherAlerts.length > 0) {
        res.json(weatherAlerts);
      } else {
        const fallbackWeather = await storage.getWeatherAlerts();
        res.json(fallbackWeather);
      }
    } catch (error) {
      console.error("Aviation weather API error, using fallback:", error);
      const fallbackWeather = await storage.getWeatherAlerts();
      res.json(fallbackWeather);
    }
  });

  app.get("/api/cyber", async (req, res) => {
    try {
      const cyberIncidents = await storage.getCyberIncidents();
      res.json(cyberIncidents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cyber incidents" });
    }
  });

  app.post("/api/alerts/:id/acknowledge", async (req, res) => {
    try {
      const { id } = req.params;
      const alert = await storage.acknowledgeAlert(id);
      if (alert) {
        res.json(alert);
      } else {
        res.status(404).json({ error: "Alert not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to acknowledge alert" });
    }
  });

  app.post("/api/alerts/:id/dismiss", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.dismissAlert(id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Alert not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to dismiss alert" });
    }
  });

  return httpServer;
}
