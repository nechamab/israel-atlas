/**
 * Lightweight CSV parser. Handles quoted fields.
 */
export function parseCSV(text) {
  const lines = text.split('\n');
  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]);
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseLine(line);
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] || '';
    }
    records.push(obj);
  }
  return records;
}

function parseLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Load and parse a GTFS CSV file from data/gtfs/.
 */
export async function loadGTFS(filename) {
  const resp = await fetch(`data/gtfs/${filename}`);
  if (!resp.ok) throw new Error(`Failed to load ${filename}: ${resp.status}`);
  const text = await resp.text();
  return parseCSV(text);
}

/**
 * Load a GeoJSON file.
 */
export async function loadGeoJSON(path) {
  const resp = await fetch(path);
  if (!resp.ok) throw new Error(`Failed to load ${path}: ${resp.status}`);
  return resp.json();
}
