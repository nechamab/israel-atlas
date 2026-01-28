import https from 'https';
import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';

const DATA_DIR = path.resolve('data/osm');
const PBF_URL = 'https://download.geofabrik.de/asia/israel-and-palestine-latest.osm.pbf';
const DEST = path.join(DATA_DIR, 'israel-and-palestine-latest.osm.pbf');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url}...`);
    const file = createWriteStream(dest);
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

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  await download(PBF_URL, DEST);
  const size = (fs.statSync(DEST).size / 1024 / 1024).toFixed(1);
  console.log(`OSM data ready: ${DEST} (${size} MB)`);
  console.log('Note: PBF to vector tile conversion is planned for Phase 2.');
}

main().catch(e => { console.error(e); process.exit(1); });
