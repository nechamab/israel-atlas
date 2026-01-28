# Israel Atlas

Interactive atlas of Israel with transit, biblical, and geographic data layers.

## Setup

```bash
npm install
```

## Fetch Data

Download GTFS transit data and biblical places:

```bash
npm run fetch-data
```

Or individually:

```bash
npm run fetch-gtfs      # Israel MOT public transit data
npm run fetch-biblical  # OpenBible geocoding data
npm run fetch-osm       # OSM Israel extract (Phase 2)
```

## Run

```bash
npm run dev
```

Open http://localhost:8080 in your browser.

## Features

- MapLibre GL vector map with Hebrew/English label toggle
- GTFS transit layer with clustered stops and color-coded routes
- Bus (blue), Rail (red), Tram (green), Light Rail (purple)
- Click stops for name popup (Hebrew + English)
- Responsive layout with RTL support
