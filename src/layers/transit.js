import { loadGTFS } from '../utils/data-loader.js';

const ROUTE_COLORS = {
  0: [0, 168, 107],   // Tram - green
  1: [200, 30, 30],   // Metro/Subway - red
  2: [200, 30, 30],   // Rail - red
  3: [41, 98, 255],   // Bus - blue
  7: [128, 0, 200],   // Light rail - purple
};
const DEFAULT_COLOR = [41, 98, 255]; // blue

let stopsData = null;
let shapesData = null;
let routeTypeMap = {};
let cluster = null;

export async function loadTransitData() {
  try {
    const [stops, routes, shapes, trips] = await Promise.all([
      loadGTFS('stops.txt'),
      loadGTFS('routes.txt'),
      loadGTFS('shapes.txt'),
      loadGTFS('trips.txt'),
    ]);

    // Build route_id → route_type map
    for (const r of routes) {
      routeTypeMap[r.route_id] = parseInt(r.route_type, 10) || 3;
    }

    // Build trip → route_type for shape coloring
    const tripRouteType = {};
    const tripShape = {};
    for (const t of trips) {
      tripRouteType[t.trip_id] = routeTypeMap[t.route_id] || 3;
      if (t.shape_id) tripShape[t.shape_id] = routeTypeMap[t.route_id] || 3;
    }

    // Parse stops
    stopsData = stops
      .filter(s => s.stop_lat && s.stop_lon)
      .map(s => ({
        position: [parseFloat(s.stop_lon), parseFloat(s.stop_lat)],
        name: s.stop_name || '',
        desc: s.stop_desc || '',
        id: s.stop_id,
      }));

    // Init Supercluster
    cluster = new Supercluster({ radius: 60, maxZoom: 16 });
    cluster.load(
      stopsData.map(s => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: s.position },
        properties: { name: s.name, desc: s.desc, id: s.id },
      }))
    );

    // Parse shapes into paths grouped by shape_id
    const shapeGroups = {};
    for (const pt of shapes) {
      const id = pt.shape_id;
      if (!shapeGroups[id]) shapeGroups[id] = [];
      shapeGroups[id].push({
        seq: parseInt(pt.shape_pt_sequence, 10),
        lon: parseFloat(pt.shape_pt_lon),
        lat: parseFloat(pt.shape_pt_lat),
      });
    }

    shapesData = Object.entries(shapeGroups).map(([shapeId, pts]) => {
      pts.sort((a, b) => a.seq - b.seq);
      return {
        path: pts.map(p => [p.lon, p.lat]),
        routeType: tripShape[shapeId] || 3,
      };
    });

    console.log(`Loaded ${stopsData.length} stops, ${shapesData.length} shapes`);
  } catch (e) {
    console.warn('Transit data not available. Run "npm run fetch-gtfs" first.', e);
    stopsData = [];
    shapesData = [];
  }
}

export function getTransitLayers(deckgl, map) {
  const layers = [];
  const zoom = map.getZoom();

  // Stops (clustered)
  if (cluster && document.getElementById('toggle-transit-stops')?.checked) {
    const bounds = map.getBounds();
    const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
    const clusters = cluster.getClusters(bbox, Math.floor(zoom));

    layers.push(
      new deck.ScatterplotLayer({
        id: 'transit-stops',
        data: clusters,
        getPosition: d => d.geometry.coordinates,
        getRadius: d => d.properties.cluster ? Math.min(20, 8 + d.properties.point_count * 0.3) : 5,
        getFillColor: [41, 98, 255, 200],
        radiusMinPixels: 3,
        radiusMaxPixels: 25,
        pickable: true,
      })
    );
  }

  // Routes
  if (shapesData && document.getElementById('toggle-transit-routes')?.checked) {
    layers.push(
      new deck.PathLayer({
        id: 'transit-routes',
        data: shapesData,
        getPath: d => d.path,
        getColor: d => ROUTE_COLORS[d.routeType] || DEFAULT_COLOR,
        getWidth: 2,
        widthMinPixels: 1,
        widthMaxPixels: 4,
        opacity: 0.6,
        pickable: false,
      })
    );
  }

  return layers;
}

export function handleTransitClick(info) {
  if (!info.object) return null;
  const props = info.object.properties;
  if (!props) return null;

  if (props.cluster) {
    return {
      html: `<div class="stop-name-he">${props.point_count} stops</div>`,
      x: info.x,
      y: info.y,
    };
  }

  return {
    html: `
      <div class="stop-name-he">${props.name || ''}</div>
      <div class="stop-name-en">${props.desc || ''}</div>
    `,
    x: info.x,
    y: info.y,
  };
}
