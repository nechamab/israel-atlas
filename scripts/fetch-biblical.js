import https from 'https';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('data/biblical');
const CSV_URL = 'https://raw.githubusercontent.com/openbibleinfo/Bible-Geocoding-Data/master/output/ESV_places.csv';
const CSV_DEST = path.join(DATA_DIR, 'ESV_places.csv');
const GEOJSON_DEST = path.join(DATA_DIR, 'biblical-places.geojson');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url}...`);
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'israel-atlas/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

function csvToGeoJSON(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split('\t');

  const nameIdx = headers.indexOf('ESV_name');
  const latIdx = headers.indexOf('Latitude');
  const lonIdx = headers.indexOf('Longitude');

  const features = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    const lat = parseFloat(cols[latIdx]);
    const lon = parseFloat(cols[lonIdx]);
    const name = cols[nameIdx];
    if (!name || isNaN(lat) || isNaN(lon)) continue;

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: { name },
    });
  }

  return { type: 'FeatureCollection', features };
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  await download(CSV_URL, CSV_DEST);

  const csv = fs.readFileSync(CSV_DEST, 'utf-8');
  const geojson = csvToGeoJSON(csv);
  fs.writeFileSync(GEOJSON_DEST, JSON.stringify(geojson));

  console.log(`Biblical places: ${geojson.features.length} locations → ${GEOJSON_DEST}`);
}

main().catch(e => { console.error(e); process.exit(1); });
