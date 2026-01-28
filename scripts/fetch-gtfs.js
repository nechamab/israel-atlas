import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const DATA_DIR = path.resolve('data/gtfs');
const ZIP_PATH = path.join(DATA_DIR, 'israel-public-transportation.zip');
const GTFS_URL = 'https://gtfs.mot.gov.il/gtfsfiles/israel-public-transportation.zip';

const KEEP_FILES = ['stops.txt', 'routes.txt', 'shapes.txt', 'trips.txt'];

async function download(url, dest) {
  console.log(`Downloading ${url}...`);
  return new Promise((resolve, reject) => {
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

  await download(GTFS_URL, ZIP_PATH);
  console.log('Download complete. Extracting...');

  // Use PowerShell to extract on Windows, unzip on Unix
  const isWin = process.platform === 'win32';
  if (isWin) {
    execSync(`powershell -Command "Expand-Archive -Force '${ZIP_PATH}' '${DATA_DIR}'"`, { stdio: 'inherit' });
  } else {
    execSync(`unzip -o "${ZIP_PATH}" -d "${DATA_DIR}"`, { stdio: 'inherit' });
  }

  // Remove unneeded files
  for (const f of fs.readdirSync(DATA_DIR)) {
    if (!KEEP_FILES.includes(f) && f !== path.basename(ZIP_PATH)) {
      fs.unlinkSync(path.join(DATA_DIR, f));
    }
  }
  // Remove zip
  if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);

  console.log('GTFS data ready in data/gtfs/');
  for (const f of KEEP_FILES) {
    const fp = path.join(DATA_DIR, f);
    if (fs.existsSync(fp)) {
      const size = (fs.statSync(fp).size / 1024 / 1024).toFixed(1);
      console.log(`  ${f}: ${size} MB`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
