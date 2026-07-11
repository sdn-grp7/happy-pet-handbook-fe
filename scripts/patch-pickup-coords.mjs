/**
 * One-shot: attach lat/lng to SNNC shelter pickups that only have an address.
 * Coords ≈ Cổ Đông / Đồng Mô area (OSM near Làng VH các dân tộc Việt Nam).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "src/features/pets/mocks/data.ts");

const LAT = 21.02665;
const LNG = 105.46188;

let src = readFileSync(path, "utf8");

const re = /pickup:\s*\{\s*\n\s*address:\s*("[^"]*"|'[^']*')\s*,?\s*\n\s*\}/g;

let count = 0;
src = src.replace(re, (_m, addr) => {
  count += 1;
  return `pickup: {\n      address: ${addr},\n      lat: ${LAT},\n      lng: ${LNG},\n    }`;
});

writeFileSync(path, src);
console.log(`Patched ${count} pickups → ${LAT}, ${LNG}`);
