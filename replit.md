# Situation Monitor - Global Conflict Intelligence Platform

## Overview

Situation Monitor is a real-time global conflict monitoring and intelligence platform that aggregates, analyzes, and visualizes multi-source data on an interactive map interface. The system is designed for mission-critical intelligence work, featuring data feeds from social media, OSINT sources, prediction markets, flight/marine tracking, and more. The platform displays events with threat levels, credibility scoring, and real-time alerts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state with automatic refetching
- **Styling**: Tailwind CSS with custom CSS variables for theming (dark/light mode support)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Map Visualization**: Leaflet with React-Leaflet bindings
- **Charts**: Recharts for data visualization (area charts, pie charts, sparklines)
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints under /api prefix
- **Development**: Vite middleware for HMR in development
- **Production**: Static file serving from dist/public

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: shared/schema.ts (shared between client and server)
- **Current State**: Uses in-memory storage (MemStorage class) with sample data generation
- **Database Ready**: Drizzle config exists for PostgreSQL migration when DATABASE_URL is provided

### Design System
- **Theme**: Dark mode default, professional intelligence platform aesthetic
- **Typography**: Inter for UI, JetBrains Mono for data/timestamps
- **Color System**: HSL-based CSS variables with threat level colors (critical/high/medium/low/minimal)
- **Layout**: Three-column dashboard (left sidebar 280px, center map, right sidebar 320px)

### Key Data Types
- **ConflictEvent**: Geographic events with threat levels, credibility, and source attribution
- **DataFeed**: Real-time feed items from various sources (Twitter, Reddit, OSINT, News, Flight, Marine)
- **Alert**: Actionable alerts with acknowledgment workflow
- **PredictionMarket**: Market data from Polymarket/Manifold
- **FlightData**: Military and surveillance aircraft tracking (callsign, altitude, speed, heading)
- **VesselData**: Naval vessel tracking (warships, carriers, tankers)
- **WeatherAlert**: Aviation weather alerts (METARs, SIGMETs, AIRMETs) with layman descriptions
- **CyberIncident**: Infrastructure and cyber attack monitoring

### API Endpoints
- `GET /api/events` - Conflict events with location and threat data
- `GET /api/feeds` - Real-time data feeds from multiple sources
- `GET /api/alerts` - Actionable alerts requiring attention
- `GET /api/predictions` - Prediction market data
- `GET /api/stats` - Dashboard statistics
- `GET /api/status` - System connection status
- `GET /api/flights` - Military/surveillance aircraft positions
- `GET /api/vessels` - Naval vessel tracking
- `GET /api/weather` - Aviation weather alerts
- `GET /api/cyber` - Cyber/infrastructure incidents
- `POST /api/alerts/:id/acknowledge` - Acknowledge an alert
- `POST /api/alerts/:id/dismiss` - Dismiss an alert

### Map Features
- Layer visibility toggles for: Events, Flights, Vessels, Weather, Cyber
- Dark/Satellite map style switcher
- Custom popups with detailed info for each data type
- Live counts display (events, flights, vessels)
- Region-based filtering via command bar

## External Dependencies

### Third-Party Services (Ready for Integration)
- **PostgreSQL**: Database via DATABASE_URL environment variable
- **Prediction Markets**: Polymarket, Manifold Markets APIs (data models exist)
- **Social Media**: Reddit, Twitter/X feed collection (source types defined)
- **OSINT Feeds**: Generic OSINT source integration
- **Tracking**: Flight and marine tracking data sources

### Key NPM Packages
- **UI**: @radix-ui/* (complete component primitive set), lucide-react (icons), react-icons
- **Data**: drizzle-orm, @tanstack/react-query, zod (validation)
- **Maps**: leaflet, react-leaflet
- **Charts**: recharts, embla-carousel-react
- **Forms**: react-hook-form, @hookform/resolvers
- **Utilities**: date-fns, class-variance-authority, clsx, tailwind-merge

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required for database mode)
- `NODE_ENV`: development/production mode switching