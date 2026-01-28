import { initLanguageControl } from './controls/language.js';
import { loadTransitData, getTransitLayers, handleTransitClick } from './layers/transit.js';

// Set RTL text plugin for Hebrew labels
maplibregl.setRTLTextPlugin(
  'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/mapbox-gl-rtl-text.min.js',
  true
);

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/liberty',
  center: [34.8, 31.5],
  zoom: 8,
  minZoom: 6,
  maxZoom: 18,
});

map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

// deck.gl overlay
const deckOverlay = new deck.MapboxOverlay({
  interleaved: false,
  layers: [],
  onClick: (info) => {
    const popup = document.getElementById('popup');
    const result = handleTransitClick(info);
    if (result) {
      popup.innerHTML = result.html;
      popup.style.left = result.x + 'px';
      popup.style.top = result.y + 'px';
      popup.classList.remove('hidden');
    } else {
      popup.classList.add('hidden');
    }
  },
});

map.addControl(deckOverlay);

function updateLayers() {
  deckOverlay.setProps({ layers: getTransitLayers(deckOverlay, map) });
}

// Hide popup on map move
map.on('movestart', () => {
  document.getElementById('popup').classList.add('hidden');
});

map.on('load', async () => {
  initLanguageControl(map);

  await loadTransitData();
  updateLayers();

  // Re-render layers on view change
  map.on('moveend', updateLayers);
  map.on('zoomend', updateLayers);

  // Layer toggle handlers
  document.getElementById('toggle-transit-stops').addEventListener('change', updateLayers);
  document.getElementById('toggle-transit-routes').addEventListener('change', updateLayers);
});
