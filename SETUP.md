# Israel Atlas — Local Setup

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- npm (included with Node.js)

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/nechamab/israel-atlas.git
cd israel-atlas

# 2. Install dependencies
npm install

# 3. Fetch map data
npm run fetch-data

# 4. Start the local dev server
npm run dev
```

The app will be available at **http://localhost:8080**.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server on port 8080 |
| `npm run fetch-data` | Download GTFS transit + biblical site data |
| `npm run fetch-gtfs` | Download GTFS transit data only |
| `npm run fetch-biblical` | Download biblical sites data only |
| `npm run fetch-osm` | Download OpenStreetMap data |
