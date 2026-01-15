# Design Guidelines: Situation Monitor Intelligence Platform

## Design Approach: Tactical Dashboard System

**Selected Approach:** Custom design system inspired by professional intelligence platforms (Bloomberg Terminal, Palantir Gotham, military command centers) with Material Design principles for data-heavy components.

**Justification:** This is a mission-critical, information-dense intelligence platform requiring maximum clarity, rapid information processing, and 24/7 operational usability. Visual aesthetics serve function - every design decision prioritizes information hierarchy and user efficiency.

---

## Core Design Elements

### A. Typography

**Font Stack:**
- Primary: 'Inter' (Google Fonts) - exceptional legibility at small sizes, designed for screens
- Monospace: 'JetBrains Mono' - data tables, timestamps, coordinates, IDs

**Hierarchy:**
- H1: 2.5rem/font-bold - Main dashboard title
- H2: 1.75rem/font-semibold - Section headers, panel titles
- H3: 1.25rem/font-semibold - Subsection headers, alert titles
- Body: 0.875rem/font-normal - Primary content, data feeds
- Small: 0.75rem/font-normal - Metadata, timestamps, secondary info
- Tiny: 0.625rem/font-medium - Labels, tags, micro-data

**Critical Text Treatments:**
- Timestamps: Monospace, 0.75rem, uppercase for consistency
- Coordinates: Monospace, always include degree symbols
- Threat levels: UPPERCASE, font-bold, 0.875rem
- Sources: Italic, 0.75rem with credibility score badge

### B. Layout System

**Spacing Primitives:** Tailwind units of **2, 4, 8, 12, 16** (tight control for dense layouts)
- Component padding: p-4
- Section spacing: gap-8 or gap-12
- Panel gutters: gap-4
- Inline elements: space-x-2, space-y-2
- Major sections: mb-16 or py-16

**Grid System:**
```
Main Layout: 
- Left sidebar: 280px fixed (data feeds, filters)
- Center: flex-1 (map + overlay panels)
- Right sidebar: 320px fixed (analytics, predictions)

Responsive collapse:
- Desktop (lg+): Three-column
- Tablet (md): Map + collapsible sidebars
- Mobile: Stacked with tab navigation
```

### C. Component Library

#### Navigation & Structure
**Top Command Bar (h-14, fixed):**
- Logo + platform name (left)
- Global search with autocomplete
- Active alerts counter badge
- Time zone selector
- User profile/settings (right)

**Sidebar Panels:**
- Collapsible sections with expand/collapse icons
- Scrollable content area (max-h-screen with overflow-y-auto)
- Sticky section headers during scroll
- Filter controls at top of each section

#### Map Interface (Primary View)
**Google Maps Container:**
- Full viewport minus header/sidebars
- Custom map controls positioned top-right
- Legend overlay bottom-left (semi-transparent panel)
- Scale bar bottom-center

**Map Markers:**
- Conflict events: Pulsing circles, size by severity
- Military assets: Custom icons (planes, ships)
- Infrastructure: Status-coded pins
- Clusters: Numbered badges for dense areas

**Info Windows:**
- White cards with subtle shadow
- Title, timestamp, source credibility badge
- 2-3 key data points
- "View Details" link to side panel

#### Data Feed Components
**Real-Time Feed Items (Reddit/Twitter):**
```
Card structure:
- Border-left colored stripe (source indicator)
- Header: Source icon + username + timestamp
- Content: Excerpt (3 lines max) with "Read more"
- Footer: Location tag + credibility score + engagement metrics
- Hover: Subtle elevation change
```

**Prediction Market Cards:**
```
- Market question as header (font-semibold, 1rem)
- Large probability percentage (3rem, font-bold)
- Spark line showing 24h trend
- Volume indicator
- Price change badge (+5.2% ↑ in green)
```

**Alert Cards:**
```
- Status-coded left border (4px)
- Alert type icon + timestamp
- Title (font-semibold)
- Affected region with map pin icon
- Action buttons: "Dismiss" | "Investigate"
```

#### Data Visualization
**Metrics Dashboard:**
- 3-4 column grid of stat cards
- Each card: Label, large number, trend indicator (↑↓), sparkline
- Responsive: 4 cols → 2 cols → 1 col

**Charts:**
- Recharts library for all visualizations
- Line charts: Time-series threat levels
- Bar charts: Source distribution
- Heatmaps: Regional activity density
- Network graphs: Connection analysis (future phase)

**Tables:**
```
- Dense rows (h-10 to h-12)
- Alternating row backgrounds (subtle)
- Sticky header row
- Sortable columns with arrows
- Monospace for numeric data alignment
- Expandable rows for details
```

#### Forms & Inputs
**Search:**
- Prominent input with icon-left
- Autocomplete dropdown with categorized results
- Recent searches history
- Keyboard shortcuts visible (Cmd+K)

**Filters:**
- Checkbox groups (compact spacing)
- Date range picker with presets
- Multi-select dropdowns for regions/sources
- Clear all filters button

**Settings:**
- Toggle switches for real-time features
- Slider for map refresh rate
- Radio buttons for view preferences

#### Overlays & Modals
**Detail Panels (Slide-over):**
- Slide from right, 480px wide
- Close button top-right
- Scrollable content
- Footer with actions

**Critical Alerts (Modal):**
- Center overlay with backdrop blur
- Red/yellow border based on severity
- Requires acknowledgment
- Cannot dismiss by clicking outside

---

## Special Features

### Status Indicators
- Real-time pulse animation for active monitoring
- Connection status dot (top-right): Green=live, Yellow=delayed, Red=disconnected
- Last updated timestamp on all data cards

### Credibility System
**Visual treatment:**
- 5-star badge system
- Tier 1 sources: Gold star icon
- Tier 5 sources: Gray star, italic text
- Verified checkmark for official sources

### Geographic Elements
- Coordinate display: Always DMS format (40°26'46"N)
- Distance measurements in km/miles toggle
- Region tags as pills with flag emoji

### Animations
**Minimal, purposeful only:**
- Map marker pulse for recent events
- Smooth transitions when expanding/collapsing panels (300ms)
- Loading skeleton screens for data fetch
- Alert badge bounce on new critical alert

---

## Images

**Hero/Banner:** None - this is a operational dashboard, not a marketing site. Launch directly into the functional interface.

**Supporting Imagery:**
- Map satellite layer option
- Source logos in feed items (16x16px icons)
- Flag icons for countries (20x20px)
- Weapon system recognition thumbnails in military feeds (80x80px)

---

## Critical Dashboard Constraints

- Information density is paramount - every pixel serves intelligence value
- Dark mode optimized for 24/7 monitoring sessions
- No decorative elements that don't convey data
- Consistent spacing enables rapid visual scanning
- Color only used to encode meaning (threat levels, status, source credibility)
- All timestamps in UTC with local time toggle
- Accessibility: WCAG AA for text contrast, keyboard navigation for all functions