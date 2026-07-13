/**
 * Restore SNNC geocode to Sơn Tây shelter area (Nominatim often mis-resolves the alley address).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const path = join(dirname(fileURLToPath(import.meta.url)), "../src/features/pets/mocks/data.ts");
const LAT = 21.02665;
const LNG = 105.46188;

let src = readFileSync(path, "utf8");
src = src.replace(/lat:\s*[\d.]+/g, `lat: ${LAT}`);
src = src.replace(/lng:\s*[\d.]+/g, `lng: ${LNG}`);
writeFileSync(path, src);
console.log(`Patched coords → ${LAT}, ${LNG}`);
